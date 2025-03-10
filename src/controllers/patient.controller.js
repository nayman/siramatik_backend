const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const prisma = new PrismaClient();

// Validation helper functions
const validatePatientData = (patient) => {
  const missingFields = [];
  if (!patient.adiSoyadi) missingFields.push('adiSoyadi');
  if (!patient.siraNo) missingFields.push('siraNo');
  if (!patient.protokolNo) missingFields.push('protokolNo');
  if (!patient.servisID) missingFields.push('servisID');
  if (!patient.servisAdi) missingFields.push('servisAdi');
  return missingFields;
};

const validateCallPatientData = (data) => {
  const missingFields = [];
  if (!data.protokolNo) missingFields.push('protokolNo');
  if (!data.servisID) missingFields.push('servisID');
  if (!data.cagriTipi) missingFields.push('cagriTipi');
  if (!data.kullaniciAdi) missingFields.push('kullaniciAdi');
  return missingFields;
};

const addPatient = async (req, res, next) => {
  try {
    // Handle both array and single object requests
    const requests = Array.isArray(req.body) ? req.body : [req.body];
    
    if (requests.length === 0) {
      logger.warn('Patient Controller - Empty request body', null, 'app');
      return next(new AppError('Request body cannot be empty', 400));
    }

    const results = [];

    for (const request of requests) {
      try {
        // Extract patient data from hastaEkle
        const patient = request.hastaEkle;
        if (!patient) {
          logger.warn('Patient Controller - No hastaEkle data found', { request }, 'app');
          results.push({
            success: false,
            error: 'No hastaEkle data found',
            data: request
          });
          continue;
        }

        // Validate required fields
        const missingFields = validatePatientData(patient);
        if (missingFields.length > 0) {
          logger.warn('Patient Controller - Missing required fields', { patient, missingFields }, 'app');
          results.push({
            success: false,
            error: `Missing required fields: ${missingFields.join(', ')}`,
            data: patient
          });
          continue;
        }

        // Convert data types
        const protokolNo = String(patient.protokolNo);
        const servisID = parseInt(patient.servisID);
        const siraNo = parseInt(patient.siraNo);

        // Validate converted data
        if (isNaN(servisID)) {
          logger.warn('Patient Controller - Invalid servisID', { servisID: patient.servisID }, 'app');
          results.push({
            success: false,
            error: 'Invalid servisID: must be a number',
            data: patient
          });
          continue;
        }

        if (isNaN(siraNo)) {
          logger.warn('Patient Controller - Invalid siraNo', { siraNo: patient.siraNo }, 'app');
          results.push({
            success: false,
            error: 'Invalid siraNo: must be a number',
            data: patient
          });
          continue;
        }

        // Create or update service
        const service = await prisma.service.upsert({
          where: { id: servisID },
          update: { servisAdi: patient.servisAdi },
          create: {
            id: servisID,
            servisAdi: patient.servisAdi
          }
        });

        // Check if patient exists
        const existingPatient = await prisma.patient.findFirst({
          where: {
            OR: [
              { protokolNo },
              { siraNo }
            ]
          }
        });

        // Prepare patient data
        const patientData = {
          adiSoyadi: patient.adiSoyadi,
          siraNo,
          protokolNo,
          servisID: service.id,
          servisAdi: service.servisAdi,
          ipAdres: patient.ipAdres || null,
          oncelikNedeni: patient.oncelikNedeni || null
        };

        // Update or create patient
        const currentPatient = existingPatient
          ? await prisma.patient.update({
              where: { id: existingPatient.id },
              data: patientData
            })
          : await prisma.patient.create({
              data: patientData
            });

        // Create or update queue entry
        await prisma.queue.upsert({
          where: {
            patientId_serviceId: {
              patientId: currentPatient.id,
              serviceId: service.id
            }
          },
          update: {
            status: 'WAITING',
            updatedAt: new Date(),
            randevuTarihi: patient.randevuTarihi ? new Date(patient.randevuTarihi) : null,
            randevuSaati: patient.randevuSaati || null,
            randevuTuru: patient.randevuTuru || null,
            randevuVar: !!patient.randevuTarihi
          },
          create: {
            patientId: currentPatient.id,
            serviceId: service.id,
            status: 'WAITING',
            siradakiHastaSayisi: 0,
            randevuTarihi: patient.randevuTarihi ? new Date(patient.randevuTarihi) : null,
            randevuSaati: patient.randevuSaati || null,
            randevuTuru: patient.randevuTuru || null,
            randevuVar: !!patient.randevuTarihi,
            maskeleme: false
          }
        });

        results.push({
          success: true,
          data: currentPatient,
          isUpdate: !!existingPatient
        });
      } catch (error) {
        logger.error('Patient Controller - Error processing patient', { error, request }, 'app');
        results.push({
          success: false,
          error: error.message,
          data: request.hastaEkle
        });
      }
    }

    // Check if any patients were successfully added
    const hasSuccess = results.some(result => result.success);
    if (!hasSuccess) {
      const failedPatients = results.map(result => ({
        data: result.data,
        error: result.error
      }));
      
      return res.status(400).json({
        status: 'fail',
        message: 'No patients were added successfully',
        errors: failedPatients
      });
    }

    res.status(200).json({
      status: 'success',
      results
    });
  } catch (error) {
    logger.error('Patient Controller - Error', error, 'app');
    next(new AppError('Hasta ekleme hatası: ' + error.message, 500));
  }
};

const callPatient = async (req, res, next) => {
  try {
    const patientInfo = req.body.hastaBilgisi;

    if (!patientInfo) {
      logger.warn('Patient Controller - Missing patient info', null, 'app');
      return next(new AppError('Hasta bilgileri gerekli', 400));
    }

    // Validate required fields
    const missingFields = validateCallPatientData(patientInfo);
    if (missingFields.length > 0) {
      logger.warn('Patient Controller - Missing required fields', { patientInfo, missingFields }, 'app');
      return next(new AppError(`Gerekli alanlar eksik: ${missingFields.join(', ')}`, 400));
    }

    // Convert and validate data types
    const stringProtokolNo = String(patientInfo.protokolNo);
    const integerServisID = parseInt(patientInfo.servisID);

    if (isNaN(integerServisID)) {
      logger.warn('Patient Controller - Invalid servisID', { servisID: patientInfo.servisID }, 'app');
      return next(new AppError('Geçersiz servis ID', 400));
    }

    // Find patient
    const patient = await prisma.patient.findFirst({
      where: { protokolNo: stringProtokolNo }
    });

    if (!patient) {
      logger.warn('Patient Controller - Patient not found', { protokolNo: stringProtokolNo }, 'app');
      return next(new AppError('Hasta bulunamadı', 404));
    }

    // Find queue entry
    const queue = await prisma.queue.findFirst({
      where: { 
        patientId: patient.id,
        serviceId: integerServisID
      }
    });

    if (!queue) {
      logger.warn('Patient Controller - Queue not found', { 
        patientId: patient.id, 
        servisID: integerServisID 
      }, 'app');
      return next(new AppError('Kuyruk kaydı bulunamadı', 404));
    }

    // Validate cagriTipi
    if (!['YeniCagri', 'IptalCagri'].includes(patientInfo.cagriTipi)) {
      logger.warn('Patient Controller - Invalid cagriTipi', { cagriTipi: patientInfo.cagriTipi }, 'app');
      return next(new AppError('Geçersiz çağrı tipi', 400));
    }

    const status = patientInfo.cagriTipi === 'YeniCagri' ? 'CALLED' : 'WAITING';
    
    // Update queue
    const updatedQueue = await prisma.queue.update({
      where: { id: queue.id },
      data: {
        status,
        updatedAt: new Date(),
        calledAt: status === 'CALLED' ? new Date() : null,
        calledBy: status === 'CALLED' ? patientInfo.kullaniciAdi : null
      }
    });

    logger.info('Patient Controller - Patient status updated', { 
      patientId: patient.id,
      status,
      calledBy: status === 'CALLED' ? patientInfo.kullaniciAdi : null
    }, 'app');

    res.status(200).json({
      status: 'success',
      data: updatedQueue
    });
  } catch (error) {
    logger.error('Patient Controller - Error', { 
      error: error.message,
      stack: error.stack,
      body: req.body 
    }, 'app');
    next(new AppError('Hasta çağırma hatası: ' + error.message, 500));
  }
};

const getPatients = async (req, res, next) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        queue: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!patients || patients.length === 0) {
      logger.info('Patient Controller - No patients found', null, 'app');
      return res.status(200).json({
        status: 'success',
        data: []
      });
    }

    res.status(200).json({
      status: 'success',
      data: patients
    });
  } catch (error) {
    logger.error('Patient Controller - Error getting patients', error, 'app');
    next(new AppError('Hasta listesi alınamadı: ' + error.message, 500));
  }
};

const getPatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      logger.warn('Patient Controller - Invalid patient ID', { id }, 'app');
      return next(new AppError('Geçersiz hasta ID', 400));
    }

    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
      include: {
        queue: true
      }
    });

    if (!patient) {
      logger.warn('Patient Controller - Patient not found', { id }, 'app');
      return next(new AppError('Hasta bulunamadı', 404));
    }

    res.status(200).json({
      status: 'success',
      data: patient
    });
  } catch (error) {
    logger.error('Patient Controller - Error getting patient', error, 'app');
    next(new AppError('Hasta bilgisi alınamadı: ' + error.message, 500));
  }
};

module.exports = {
  addPatient,
  callPatient,
  getPatients,
  getPatient
};