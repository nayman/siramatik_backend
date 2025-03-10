const express = require('express');
const { body } = require('express-validator');
const { updateQueue, getWaitingPatients } = require('../controllers/queue.controller');
const { validateRequest } = require('../middleware/validate.middleware');
const { validateUser } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/queue/update:
 *   post:
 *     summary: Kuyruk listesini günceller
 *     tags: [Queue]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['listeGuncelle']
 *             properties:
 *               listeGuncelle:
 *                 type: object
 *                 required: [
 *                   'servisID',
 *                   'servisAdi',
 *                   'siradakiHastaSayisi',
 *                   'siradakiHastalar'
 *                 ]
 *                 properties:
 *                   servisID:
 *                     type: string
 *                     example: "3474"
 *                   servisAdi:
 *                     type: string
 *                     example: "SEÇKİN AYDIN BEYİN CERRAHİ POLK."
 *                   triajID:
 *                     type: string
 *                     example: "1"
 *                   triajAdi:
 *                     type: string
 *                     example: "Normal"
 *                   siradakiHastaSayisi:
 *                     type: string
 *                     example: "22"
 *                   ortalamaMuayeneSuresi:
 *                     type: string
 *                     example: "15"
 *                   siradakiHastalar:
 *                     type: array
 *                     items:
 *                       type: object
 *                       required: [
 *                         'adiSoyadi',
 *                         'siraNo',
 *                         'protokolNo',
 *                         'randevuTarihi',
 *                         'randevuSaati',
 *                         'randevuTuru'
 *                       ]
 *                       properties:
 *                         adiSoyadi:
 *                           type: string
 *                           example: "FATMA ERKAN"
 *                         siraNo:
 *                           type: string
 *                           example: "54"
 *                         protokolNo:
 *                           type: string
 *                           example: "595858"
 *                         oncelikNedeni:
 *                           type: string
 *                           example: "Gebelik Hali"
 *                         randevuVar:
 *                           type: string
 *                           enum: ['0', '1']
 *                           example: "1"
 *                         randevuTarihi:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-03-10T15:00:00Z"
 *                           description: "Randevu tarihi ve saati (ISO 8601 formatında)"
 *                         randevuSaati:
 *                           type: string
 *                           example: "15:00"
 *                           description: "Randevu saati (HH:mm formatında)"
 *                         randevuTuru:
 *                           type: string
 *                           example: "Normal"
 *                           description: "Randevu türü"
 *                         maskeleme:
 *                           type: string
 *                           enum: ['0', '1']
 *                           example: "0"
 *                   kayitsizHastalar:
 *                     type: array
 *                     items:
 *                       type: object
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
 *             listeGuncelle:
 *               servisID: "3474"
 *               servisAdi: "SEÇKİN AYDIN BEYİN CERRAHİ POLK."
 *               triajID: "1"
 *               triajAdi: "Normal"
 *               siradakiHastaSayisi: "22"
 *               ortalamaMuayeneSuresi: "15"
 *               siradakiHastalar:
 *                 - adiSoyadi: "FATMA ERKAN"
 *                   siraNo: "54"
 *                   protokolNo: "595858"
 *                   oncelikNedeni: "Gebelik Hali"
 *                   randevuVar: "1"
 *                   randevuTarihi: "2024-03-10T15:00:00Z"
 *                   randevuSaati: "15:00"
 *                   randevuTuru: "Normal"
 *                   maskeleme: "0"
 *               kayitsizHastalar: []
 *             kullaniciBilgisi:
 *               kullanici_adi: "AbisenaHBYS"
 *               sifre: "Siramatik2025"
 *     responses:
 *       200:
 *         description: Kuyruk listesi başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Queue'
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

// Validation middleware for updateQueue
const updateQueueValidation = [
  // Check if request body is array or object
  body().custom((value, { req }) => {
    if (!Array.isArray(value) && typeof value !== 'object') {
      throw new Error('Request body must be an array or object');
    }
    return true;
  }).withMessage('Request body must be an array or object'),

  // Array validation
  body('*.listeGuncelle.servisID').if(body().isArray()).notEmpty().withMessage('Service ID is required'),
  body('*.listeGuncelle.servisAdi').if(body().isArray()).notEmpty().withMessage('Service name is required'),
  body('*.listeGuncelle.siradakiHastaSayisi').if(body().isArray()).optional(),
  body('*.listeGuncelle.siradakiHastalar').if(body().isArray()).optional().isArray(),
  body('*.listeGuncelle.siradakiHastalar.*.adiSoyadi').if(body().isArray()).optional(),
  body('*.listeGuncelle.siradakiHastalar.*.siraNo').if(body().isArray()).optional(),
  body('*.listeGuncelle.siradakiHastalar.*.protokolNo').if(body().isArray()).optional(),
  body('*.listeGuncelle.siradakiHastalar.*.randevuVar').if(body().isArray()).optional().isIn(['0', '1']),
  body('*.listeGuncelle.siradakiHastalar.*.maskeleme').if(body().isArray()).optional().isIn(['0', '1']),
  body('*.kullaniciBilgisi.kullanici_adi').if(body().isArray()).notEmpty().withMessage('Username is required'),
  body('*.kullaniciBilgisi.sifre').if(body().isArray()).notEmpty().withMessage('Password is required'),

  // Object validation
  body('listeGuncelle.servisID').if(body().isObject()).notEmpty().withMessage('Service ID is required'),
  body('listeGuncelle.servisAdi').if(body().isObject()).notEmpty().withMessage('Service name is required'),
  body('listeGuncelle.siradakiHastaSayisi').if(body().isObject()).optional(),
  body('listeGuncelle.siradakiHastalar').if(body().isObject()).optional().isArray(),
  body('listeGuncelle.siradakiHastalar.*.adiSoyadi').if(body().isObject()).optional(),
  body('listeGuncelle.siradakiHastalar.*.siraNo').if(body().isObject()).optional(),
  body('listeGuncelle.siradakiHastalar.*.protokolNo').if(body().isObject()).optional(),
  body('listeGuncelle.siradakiHastalar.*.randevuVar').if(body().isObject()).optional().isIn(['0', '1']),
  body('listeGuncelle.siradakiHastalar.*.maskeleme').if(body().isObject()).optional().isIn(['0', '1']),
  body('kullaniciBilgisi.kullanici_adi').if(body().isObject()).notEmpty().withMessage('Username is required'),
  body('kullaniciBilgisi.sifre').if(body().isObject()).notEmpty().withMessage('Password is required')
];

// Routes
router.post('/update', validateUser, updateQueueValidation, validateRequest, updateQueue);

/**
 * @swagger
 * /api/queue/waiting/{servisID}:
 *   get:
 *     summary: Servisteki sırada bekleyen hastaları listeler
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: servisID
 *         required: true
 *         schema:
 *           type: integer
 *         description: Servis ID
 *     responses:
 *       200:
 *         description: Sırada bekleyen hastalar başarıyla listelendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     servisID:
 *                       type: integer
 *                       example: 3474
 *                     servisAdi:
 *                       type: string
 *                       example: "SEÇKİN AYDIN BEYİN CERRAHİ POLK."
 *                     siradakiHastaSayisi:
 *                       type: integer
 *                       example: 2
 *                     siradakiHastalar:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           adiSoyadi:
 *                             type: string
 *                             example: "FATMA ERKAN"
 *                           siraNo:
 *                             type: integer
 *                             example: 54
 *                           protokolNo:
 *                             type: string
 *                             example: "595858"
 *                           oncelikNedeni:
 *                             type: string
 *                             example: "Gebelik Hali"
 *                           randevuVar:
 *                             type: string
 *                             enum: ['0', '1']
 *                             example: "1"
 *                           randevuTarihi:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-10T15:00:00Z"
 *                           randevuSaati:
 *                             type: string
 *                             example: "15:00"
 *                           randevuTuru:
 *                             type: string
 *                             example: "Normal"
 *                           maskeleme:
 *                             type: string
 *                             enum: ['0', '1']
 *                             example: "0"
 *                           beklemeBaslangic:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-10T14:45:00Z"
 *       400:
 *         description: Geçersiz servis ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Servis bulunamadı
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

// Yeni route
router.get('/waiting/:servisID', getWaitingPatients);

module.exports = { queueRoutes: router };