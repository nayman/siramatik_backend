const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hospital Queue Management System API',
      version: '1.0.0',
      description: 'API documentation for the Hospital Queue Management System',
      contact: {
        name: 'API Support',
        email: 'mail@cumatekin.com.tr'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Patient: {
          type: 'object',
          required: ['adiSoyadi', 'siraNo', 'protokolNo', 'servisID', 'servisAdi', 'ipAdres'],
          properties: {
            adiSoyadi: { type: 'string' },
            siraNo: { type: 'string' },
            protokolNo: { type: 'string' },
            servisID: { type: 'string' },
            servisAdi: { type: 'string' },
            ipAdres: { type: 'string' },
            oncelikNedeni: { type: 'string' }
          }
        },
        Queue: {
          type: 'object',
          required: ['servisID', 'servisAdi', 'siradakiHastaSayisi'],
          properties: {
            servisID: { type: 'string' },
            servisAdi: { type: 'string' },
            triajID: { type: 'string' },
            triajAdi: { type: 'string' },
            siradakiHastaSayisi: { type: 'string' },
            ortalamaMuayeneSuresi: { type: 'string' },
            siradakiHastalar: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/QueuePatient'
              }
            },
            kayitsizHastalar: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            status: {
              type: 'string',
              enum: ['WAITING', 'CALLED', 'COMPLETED', 'CANCELLED']
            },
            calledAt: {
              type: 'string',
              format: 'date-time'
            },
            calledBy: {
              type: 'string'
            }
          }
        },
        QueuePatient: {
          type: 'object',
          required: ['adiSoyadi', 'siraNo', 'protokolNo', 'randevuTarihi', 'randevuSaati', 'randevuTuru'],
          properties: {
            adiSoyadi: { type: 'string' },
            siraNo: { type: 'string' },
            protokolNo: { type: 'string' },
            oncelikNedeni: { type: 'string' },
            randevuVar: { type: 'string', enum: ['0', '1'] },
            randevuSaati: { 
              type: 'string',
              description: 'Randevu saati (HH:mm formatında)'
            },
            randevuTuru: { 
              type: 'string',
              description: 'Randevu türü'
            },
            randevuTarihi: { 
              type: 'string',
              format: 'date-time',
              description: 'Randevu tarihi ve saati (ISO 8601 formatında)'
            },
            maskeleme: { type: 'string', enum: ['0', '1'] }
          }
        },
        Error: {
          type: 'object',
          required: ['status', 'message'],
          properties: {
            status: { type: 'string' },
            message: { type: 'string' }
          }
        }
      },
      examples: {
        AddPatientSuccess: {
          value: {
            hastaEkle: {
              adiSoyadi: 'SEHEL CANDAN',
              siraNo: '52',
              protokolNo: '595518',
              servisID: '3474',
              servisAdi: 'SEÇKİN AYDIN BEYİN CERRAHİ POLK.',
              ipAdres: '10.212.74.194',
              oncelikNedeni: '65 Yaş Üstü',
              randevuTarihi: '2024-03-10T14:30:00Z',
              randevuSaati: '14:30',
              randevuTuru: 'Normal'
            },
            kullaniciBilgisi: {
              kullanici_adi: 'AbisenaHBYS',
              sifre: 'Siramatik2025'
            }
          }
        },
        CallPatientSuccess: {
          value: {
            hastaBilgisi: {
              adiSoyadi: 'SEHEL CANDAN',
              siraNo: 52,
              protokolNo: '595518',
              cagriTipi: 'YeniCagri',
              servisID: 3474,
              servisAdi: 'SEÇKİN AYDIN BEYİN CERRAHİ POLK.',
              drID: 6126,
              drAdi: 'DOÇ.DR. SEÇKİN AYDIN',
              kullaniciAdi: 'CUMA TEKİN',
              ipAdres: '10.212.74.194',
              oncelikNedeni: '65 Yaş Üstü',
              siradakiHastaSayisi: 22,
              siradakiHastalar: [
                {
                  adiSoyadi: 'FATMA ERKAN',
                  siraNo: 54,
                  protokolNo: 595858,
                  oncelikNedeni: 'Gebelik Hali',
                  randevuVar: '1',
                  randevuTarihi: '2024-03-10T15:00:00Z',
                  randevuSaati: '15:00',
                  randevuTuru: 'Normal',
                  maskeleme: '0'
                }
              ],
              kullanici_adi: 'AbisenaHBYS',
              sifre: 'Siramatik2025'
            }
          }
        },
        UpdateQueueSuccess: {
          value: {
            listeGuncelle: {
              servisID: '3474',
              servisAdi: 'SEÇKİN AYDIN BEYİN CERRAHİ POLK.',
              triajID: '1',
              triajAdi: 'Normal',
              siradakiHastaSayisi: 22,
              ortalamaMuayeneSuresi: '15',
              siradakiHastalar: [
                {
                  adiSoyadi: 'FATMA ERKAN',
                  siraNo: '54',
                  protokolNo: '595858',
                  oncelikNedeni: 'Gebelik Hali',
                  randevuVar: '1',
                  randevuTarihi: '2024-03-10T15:00:00Z',
                  randevuSaati: '15:00',
                  randevuTuru: 'Normal',
                  maskeleme: '0'
                }
              ],
              kayitsizHastalar: []
            },
            kullaniciBilgisi: {
              kullanici_adi: 'AbisenaHBYS',
              sifre: 'Siramatik2025'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

// Swagger UI özelleştirme seçenekleri
const swaggerOptions = {
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
    syntaxHighlight: {
      theme: 'monokai'
    },
    defaultModelsExpandDepth: 3,
    tryItOutEnabled: true
  },
  customCss: `
    .swagger-ui .topbar { 
      background-color: #2c3e50;
      padding: 10px 0;
    }
    .swagger-ui .topbar .download-url-wrapper { display: none }
    .swagger-ui .info .title { 
      color: #2c3e50;
      font-size: 36px;
    }
    .swagger-ui .opblock.opblock-post { 
      background: rgba(73, 204, 144, .1);
      border-color: #49cc90;
    }
    .swagger-ui .opblock.opblock-get { 
      background: rgba(97, 175, 254, .1);
      border-color: #61affe;
    }
    .swagger-ui .opblock.opblock-put { 
      background: rgba(252, 161, 48, .1);
      border-color: #fca130;
    }
    .swagger-ui .opblock.opblock-delete { 
      background: rgba(249, 62, 62, .1);
      border-color: #f93e3e;
    }
    .swagger-ui .opblock .opblock-summary-operation-id, 
    .swagger-ui .opblock .opblock-summary-path, 
    .swagger-ui .opblock .opblock-summary-path__deprecated { 
      font-size: 16px;
      font-family: Source Code Pro,monospace;
      font-weight: 600;
    }
    .swagger-ui .opblock-tag { 
      font-size: 24px;
      font-weight: 600;
      margin: 20px 0 10px;
    }
    .swagger-ui .opblock .opblock-summary { 
      padding: 10px;
    }
    .swagger-ui .btn.execute { 
      background-color: #4990e2;
      border-color: #4990e2;
      color: #fff;
      font-size: 14px;
    }
    .swagger-ui .btn.execute:hover { 
      background-color: #357abd;
    }
    .swagger-ui .response-col_status { 
      font-size: 14px;
      font-family: Source Code Pro,monospace;
    }
    .swagger-ui table tbody tr td { 
      font-size: 13px;
      font-family: Source Code Pro,monospace;
      padding: 10px;
    }
    .swagger-ui .responses-inner h4, 
    .swagger-ui .responses-inner h5 { 
      font-size: 16px;
      margin: 10px 0;
    }
    .swagger-ui .scheme-container {
      background-color: #f8f9fa;
      box-shadow: none;
      padding: 20px 0;
      margin: 0 0 20px;
    }
  `,
  customSiteTitle: "Sıramatik API Dokümantasyonu",
  customfavIcon: "/favicon.ico"
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec, swaggerOptions };