const request = require('supertest');
const app = require('../../src/index');

describe('Queue Controller Tests', () => {
  describe('POST /api/queue/update', () => {
    const validUpdateQueueData = {
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
            randevuVar: '0',
            randevuSaati: '',
            randevuTuru: '',
            maskeleme: '0'
          },
          {
            adiSoyadi: 'Cuma ERKAN',
            siraNo: '55',
            protokolNo: '59858',
            oncelikNedeni: 'Şehit ve Gazi Yakını',
            randevuVar: '1',
            randevuSaati: '13:00',
            randevuTuru: 'Doktor Randevusu',
            maskeleme: '1'
          }
        ],
        kayitsizHastalar: []
      },
      kullaniciBilgisi: {
        kullanici_adi: 'AbisenaHBYS',
        sifre: 'Siramatik2025'
      }
    };

    it('should update queue successfully', async () => {
      const response = await request(app)
        .post('/api/queue/update')
        .send(validUpdateQueueData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.message).toBe('Sıra başarıyla güncellendi');
    });

    it('should fail when required fields are missing', async () => {
      const invalidData = {
        listeGuncelle: {
          servisID: '',
          servisAdi: '',
          siradakiHastaSayisi: '',
          siradakiHastalar: []
        },
        kullaniciBilgisi: {
          kullanici_adi: 'AbisenaHBYS',
          sifre: 'Siramatik2025'
        }
      };

      const response = await request(app)
        .post('/api/queue/update')
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('should fail when siradakiHastalar array contains invalid data', async () => {
      const invalidQueueData = {
        listeGuncelle: {
          ...validUpdateQueueData.listeGuncelle,
          siradakiHastalar: [
            {
              adiSoyadi: '',
              siraNo: '',
              protokolNo: '',
              oncelikNedeni: '',
              randevuVar: '2', // Invalid value
              randevuSaati: '',
              randevuTuru: '',
              maskeleme: '2' // Invalid value
            }
          ]
        },
        kullaniciBilgisi: validUpdateQueueData.kullaniciBilgisi
      };

      const response = await request(app)
        .post('/api/queue/update')
        .send(invalidQueueData);

      expect(response.status).toBe(400);
    });

    it('should validate randevuVar and maskeleme values', async () => {
      const invalidFlagData = {
        listeGuncelle: {
          ...validUpdateQueueData.listeGuncelle,
          siradakiHastalar: [
            {
              ...validUpdateQueueData.listeGuncelle.siradakiHastalar[0],
              randevuVar: '3', // Invalid value (must be '0' or '1')
              maskeleme: '5' // Invalid value (must be '0' or '1')
            }
          ]
        },
        kullaniciBilgisi: validUpdateQueueData.kullaniciBilgisi
      };

      const response = await request(app)
        .post('/api/queue/update')
        .send(invalidFlagData);

      expect(response.status).toBe(400);
    });
  });
});