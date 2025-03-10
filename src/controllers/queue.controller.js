const { AppError } = require('../middleware/error.middleware');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const prisma = new PrismaClient();

const updateQueue = async (req, res, next) => {
  try {
    let listeGuncelleListesi;

    // Check if request body is array or object
    if (Array.isArray(req.body)) {
      // If array, process all items
      if (req.body.length === 0) {
        return next(new AppError('Request body array cannot be empty', 400));
      }
      listeGuncelleListesi = req.body.map(item => item.listeGuncelle);
    } else {
      // If object, process single item
      listeGuncelleListesi = [req.body.listeGuncelle];
    }

    logger.info('Received queue update requests', listeGuncelleListesi);

    const results = [];

    // Process each queue update
    for (const listeGuncelle of listeGuncelleListesi) {
      // Validate required fields
      if (!listeGuncelle || !listeGuncelle.servisID || !listeGuncelle.servisAdi) {
        logger.warn('Skipping invalid queue update', listeGuncelle);
        continue;
      }

      // Update service information
      const service = await prisma.service.upsert({
        where: { id: parseInt(listeGuncelle.servisID) },
        update: {
          servisAdi: listeGuncelle.servisAdi
        },
        create: {
          id: parseInt(listeGuncelle.servisID),
          servisAdi: listeGuncelle.servisAdi
        }
      });

      // Update queue entries for each patient
      if (listeGuncelle.siradakiHastalar && listeGuncelle.siradakiHastalar.length > 0) {
        for (const hasta of listeGuncelle.siradakiHastalar) {
          // Find or create patient
          const patient = await prisma.patient.upsert({
            where: {
              protokolNo_servisID: {
                protokolNo: String(hasta.protokolNo),
                servisID: parseInt(listeGuncelle.servisID)
              }
            },
            update: {
              adiSoyadi: hasta.adiSoyadi,
              siraNo: parseInt(hasta.siraNo),
              oncelikNedeni: hasta.oncelikNedeni || null
            },
            create: {
              adiSoyadi: hasta.adiSoyadi,
              siraNo: parseInt(hasta.siraNo),
              protokolNo: String(hasta.protokolNo),
              servisID: parseInt(listeGuncelle.servisID),
              servisAdi: listeGuncelle.servisAdi,
              ipAdres: '0.0.0.0', // Default IP for system updates
              oncelikNedeni: hasta.oncelikNedeni || null
            }
          });

          // Update queue entry
          await prisma.queue.upsert({
            where: {
              patientId_serviceId: {
                patientId: patient.id,
                serviceId: parseInt(listeGuncelle.servisID)
              }
            },
            update: {
              triajID: listeGuncelle.triajID || null,
              triajAdi: listeGuncelle.triajAdi || null,
              siradakiHastaSayisi: parseInt(listeGuncelle.siradakiHastaSayisi),
              ortalamaMuayeneSuresi: listeGuncelle.ortalamaMuayeneSuresi ? parseInt(listeGuncelle.ortalamaMuayeneSuresi) : null,
              randevuVar: hasta.randevuVar === '1',
              randevuSaati: hasta.randevuSaati || null,
              randevuTuru: hasta.randevuTuru || null,
              maskeleme: hasta.maskeleme === '1',
              status: 'waiting'
            },
            create: {
              patientId: patient.id,
              serviceId: parseInt(listeGuncelle.servisID),
              triajID: listeGuncelle.triajID || null,
              triajAdi: listeGuncelle.triajAdi || null,
              siradakiHastaSayisi: parseInt(listeGuncelle.siradakiHastaSayisi),
              ortalamaMuayeneSuresi: listeGuncelle.ortalamaMuayeneSuresi ? parseInt(listeGuncelle.ortalamaMuayeneSuresi) : null,
              randevuVar: hasta.randevuVar === '1',
              randevuSaati: hasta.randevuSaati || null,
              randevuTuru: hasta.randevuTuru || null,
              maskeleme: hasta.maskeleme === '1',
              status: 'waiting'
            }
          });
        }
      }

      logger.info('Queue updated successfully for service', { serviceId: listeGuncelle.servisID });
      results.push({
        servisID: listeGuncelle.servisID,
        servisAdi: listeGuncelle.servisAdi,
        siradakiHastaSayisi: listeGuncelle.siradakiHastaSayisi,
        siradakiHastalar: listeGuncelle.siradakiHastalar,
        kayitsizHastalar: listeGuncelle.kayitsizHastalar || []
      });
    }

    if (results.length === 0) {
      return next(new AppError('No valid queue updates to process', 400));
    }

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Kuyruk başarıyla güncellendi',
        queues: results
      }
    });
  } catch (error) {
    logger.error('Error updating queue', error);
    next(new AppError('Kuyruk güncellenirken bir hata oluştu: ' + error.message, 500));
  }
};

const getWaitingPatients = async (req, res, next) => {
  try {
    const { servisID } = req.params;

    if (!servisID || isNaN(parseInt(servisID))) {
      logger.warn('Queue Controller - Invalid service ID', { servisID }, 'app');
      return next(new AppError('Geçersiz servis ID', 400));
    }

    const integerServisID = parseInt(servisID);

    // Servisi kontrol et
    const service = await prisma.service.findUnique({
      where: { id: integerServisID }
    });

    if (!service) {
      logger.warn('Queue Controller - Service not found', { servisID }, 'app');
      return next(new AppError('Servis bulunamadı', 404));
    }

    // Tüm hastaları getir (status filtresi olmadan)
    const waitingPatients = await prisma.queue.findMany({
      where: {
        serviceId: integerServisID,
        // status filtresi kaldırıldı
      },
      include: {
        patient: true
      },
      orderBy: [
        {
          randevuTarihi: 'asc', // Önce randevulu hastaları sırala
        },
        {
          createdAt: 'asc' // Sonra geliş sırasına göre sırala
        }
      ]
    });

    // Yanıt formatını düzenle
    const formattedResponse = {
      servisID: service.id,
      servisAdi: service.servisAdi,
      siradakiHastaSayisi: waitingPatients.length,
      siradakiHastalar: waitingPatients.map(queue => ({
        id: queue.patient.id,
        adiSoyadi: queue.patient.adiSoyadi,
        siraNo: queue.patient.siraNo,
        protokolNo: queue.patient.protokolNo,
        oncelikNedeni: queue.patient.oncelikNedeni,
        randevuVar: queue.randevuVar ? '1' : '0',
        randevuTarihi: queue.randevuTarihi ? queue.randevuTarihi.toISOString() : null,
        randevuSaati: queue.randevuSaati,
        randevuTuru: queue.randevuTuru,
        maskeleme: queue.maskeleme ? '1' : '0',
        beklemeBaslangic: queue.createdAt.toISOString(),
        status: queue.status // Status bilgisini de ekleyelim
      }))
    };

    res.status(200).json({
      status: 'success',
      data: formattedResponse
    });
  } catch (error) {
    logger.error('Queue Controller - Error getting waiting patients', { error }, 'app');
    next(new AppError('Sırada bekleyen hastalar alınamadı: ' + error.message, 500));
  }
};

module.exports = {
  updateQueue,
  getWaitingPatients
};