const express = require('express');
const { body } = require('express-validator');
const { addPatient, callPatient } = require('../controllers/patient.controller');
const { validateRequest } = require('../middleware/validate.middleware');
const { validateUser } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/patients/add:
 *   post:
 *     summary: Yeni hasta ekler veya mevcut hastayı günceller
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['hastaEkle']
 *             properties:
 *               hastaEkle:
 *                 type: object
 *                 required: [
 *                   'adiSoyadi',
 *                   'siraNo',
 *                   'protokolNo',
 *                   'servisID',
 *                   'servisAdi',
 *                   'ipAdres',
 *                   'randevuTarihi',
 *                   'randevuSaati',
 *                   'randevuTuru'
 *                 ]
 *                 properties:
 *                   adiSoyadi:
 *                     type: string
 *                     example: "SEHEL CANDAN"
 *                   siraNo:
 *                     type: string
 *                     example: "52"
 *                   protokolNo:
 *                     type: string
 *                     example: "595518"
 *                   servisID:
 *                     type: string
 *                     example: "3474"
 *                   servisAdi:
 *                     type: string
 *                     example: "SEÇKİN AYDIN BEYİN CERRAHİ POLK."
 *                   ipAdres:
 *                     type: string
 *                     example: "10.212.74.194"
 *                   oncelikNedeni:
 *                     type: string
 *                     example: "65 Yaş Üstü"
 *                   randevuTarihi:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-03-10T14:30:00Z"
 *                     description: "Randevu tarihi ve saati (ISO 8601 formatında)"
 *                   randevuSaati:
 *                     type: string
 *                     example: "14:30"
 *                     description: "Randevu saati (HH:mm formatında)"
 *                   randevuTuru:
 *                     type: string
 *                     example: "Normal"
 *                     description: "Randevu türü"
 *               kullaniciBilgisi:
 *                 type: object
 *                 required: ['kullanici_adi', 'sifre']
 *                 properties:
 *                   kullanici_adi:
 *                     type: string
 *                     example: "AbisenaHBYS"
 *                   sifre:
 *                     type: string
 *                     example: "Siramatik2025"
 *           example:
 *             hastaEkle:
 *               adiSoyadi: "SEHEL CANDAN"
 *               siraNo: "52"
 *               protokolNo: "595518"
 *               servisID: "3474"
 *               servisAdi: "SEÇKİN AYDIN BEYİN CERRAHİ POLK."
 *               ipAdres: "10.212.74.194"
 *               oncelikNedeni: "65 Yaş Üstü"
 *               randevuTarihi: "2024-03-10T14:30:00Z"
 *               randevuSaati: "14:30"
 *               randevuTuru: "Normal"
 *             kullaniciBilgisi:
 *               kullanici_adi: "AbisenaHBYS"
 *               sifre: "Siramatik2025"
 *     responses:
 *       200:
 *         description: Hasta başarıyla eklendi veya güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       success:
 *                         type: boolean
 *                         example: true
 *                       data:
 *                         $ref: '#/components/schemas/Patient'
 *                       isUpdate:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: Geçersiz istek veya eksik bilgi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Yetkisiz erişim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Sunucu hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/patients/call:
 *   post:
 *     summary: Call a patient from the queue
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hastaBilgisi:
 *                 type: object
 *                 properties:
 *                   adiSoyadi: { type: string }
 *                   siraNo: { type: integer }
 *                   protokolNo: { type: string }
 *                   cagriTipi: { type: string, enum: ['YeniCagri', 'TekrarCagri', 'Test'] }
 *                   servisID: { type: integer }
 *                   servisAdi: { type: string }
 *                   drID: { type: integer }
 *                   drAdi: { type: string }
 *                   kullaniciAdi: { type: string }
 *                   ipAdres: { type: string }
 *                   oncelikNedeni: { type: string }
 *                   siradakiHastaSayisi: { type: integer }
 *                   siradakiHastalar: { type: array, items: { $ref: '#/components/schemas/QueuePatient' } }
 *                   kullanici_adi: { type: string }
 *                   sifre: { type: string }
 *     responses:
 *       200:
 *         description: Patient called successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: 'success' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     call: { type: object }
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Validation middleware for addPatient
const addPatientValidation = [
  // Check if request body is array or object
  body().custom((value, { req }) => {
    if (!Array.isArray(value) && typeof value !== 'object') {
      throw new Error('Request body must be an array or object');
    }
    return true;
  }).withMessage('Request body must be an array or object'),

  // Array validation
  body('*.hastaEkle.adiSoyadi').if(body().isArray()).notEmpty().trim().withMessage('Patient name is required'),
  body('*.hastaEkle.siraNo').if(body().isArray()).notEmpty().withMessage('Queue number is required'),
  body('*.hastaEkle.protokolNo').if(body().isArray()).notEmpty().withMessage('Protocol number is required'),
  body('*.hastaEkle.servisID').if(body().isArray()).notEmpty().withMessage('Service ID is required'),
  body('*.hastaEkle.servisAdi').if(body().isArray()).notEmpty().withMessage('Service name is required'),
  body('*.hastaEkle.ipAdres').if(body().isArray()).notEmpty().isIP().withMessage('Valid IP address is required'),
  body('*.hastaEkle.oncelikNedeni').if(body().isArray()).optional(),
  body('*.kullaniciBilgisi.kullanici_adi').if(body().isArray()).notEmpty().withMessage('Username is required'),
  body('*.kullaniciBilgisi.sifre').if(body().isArray()).notEmpty().withMessage('Password is required'),

  // Object validation
  body('hastaEkle.adiSoyadi').if(body().isObject()).notEmpty().trim().withMessage('Patient name is required'),
  body('hastaEkle.siraNo').if(body().isObject()).notEmpty().withMessage('Queue number is required'),
  body('hastaEkle.protokolNo').if(body().isObject()).notEmpty().withMessage('Protocol number is required'),
  body('hastaEkle.servisID').if(body().isObject()).notEmpty().withMessage('Service ID is required'),
  body('hastaEkle.servisAdi').if(body().isObject()).notEmpty().withMessage('Service name is required'),
  body('hastaEkle.ipAdres').if(body().isObject()).notEmpty().isIP().withMessage('Valid IP address is required'),
  body('hastaEkle.oncelikNedeni').if(body().isObject()).optional(),
  body('kullaniciBilgisi.kullanici_adi').if(body().isObject()).notEmpty().withMessage('Username is required'),
  body('kullaniciBilgisi.sifre').if(body().isObject()).notEmpty().withMessage('Password is required')
];

// Validation middleware for callPatient
const callPatientValidation = [
  body('hastaBilgisi.adiSoyadi').notEmpty().trim().withMessage('Patient name is required'),
  body('hastaBilgisi.siraNo').notEmpty().withMessage('Queue number is required'),
  body('hastaBilgisi.protokolNo').notEmpty().withMessage('Protocol number is required'),
  body('hastaBilgisi.cagriTipi').isIn(['YeniCagri', 'TekrarCagri', 'Test']).withMessage('Invalid call type'),
  body('hastaBilgisi.servisID').notEmpty().withMessage('Service ID is required'),
  body('hastaBilgisi.servisAdi').notEmpty().withMessage('Service name is required'),
  body('hastaBilgisi.drID').notEmpty().withMessage('Doctor ID is required'),
  body('hastaBilgisi.drAdi').notEmpty().withMessage('Doctor name is required'),
  body('hastaBilgisi.kullaniciAdi').notEmpty().withMessage('Username is required'),
  body('hastaBilgisi.ipAdres').notEmpty().isIP().withMessage('Valid IP address is required'),
  body('hastaBilgisi.oncelikNedeni').optional(),
  body('hastaBilgisi.siradakiHastaSayisi').notEmpty().withMessage('Queue count is required'),
  body('hastaBilgisi.siradakiHastalar').isArray().withMessage('Queue patients must be an array'),
  body('hastaBilgisi.siradakiHastalar.*.adiSoyadi').notEmpty().withMessage('Patient name is required'),
  body('hastaBilgisi.siradakiHastalar.*.siraNo').notEmpty().withMessage('Queue number is required'),
  body('hastaBilgisi.siradakiHastalar.*.protokolNo').notEmpty().withMessage('Protocol number is required'),
  body('hastaBilgisi.siradakiHastalar.*.randevuVar').isIn(['0', '1']).withMessage('Invalid appointment status'),
  body('hastaBilgisi.siradakiHastalar.*.maskeleme').isIn(['0', '1']).withMessage('Invalid masking status'),
  body('kullaniciBilgisi.kullanici_adi').notEmpty().withMessage('Username is required'),
  body('kullaniciBilgisi.sifre').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/add', validateUser, addPatientValidation, validateRequest, addPatient);
router.post('/call', validateUser, callPatientValidation, validateRequest, callPatient);

module.exports = { patientRoutes: router };