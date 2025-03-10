const request = require('supertest');
const app = require('../../src/index');

describe('Patient Controller Tests', () => {
  describe('POST /api/patients/add', () => {
    const validAddPatientData = {
      hastaEkle: {
        adiSoyadi: 'SEHEL CANDAN',
        siraNo: '52',
        protokolNo: '595518',
        servisID: '3474',
        servisAdi: 'SEÇKİN AYDIN BEYİN CERRAHİ POLK.',
        ipAdres: '10.212.74.194',
        oncelikNedeni: '65 Yaş Üstü'
      },
      kullaniciBilgisi: {
        kullanici_adi: 'exampleUser',
        sifre: 'examplePassword123'
      }
    };

    it('should add a patient successfully', async () => {
      const response = await request(app)
        .post('/api/patients/add')
        .send(validAddPatientData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.patient).toEqual(validAddPatientData.hastaEkle);
    });

    it('should fail when required fields are missing', async () => {
      const invalidData = {
        hastaEkle: {
          adiSoyadi: '',
          siraNo: '',
          protokolNo: '595518'
        },
        kullaniciBilgisi: {
          kullanici_adi: 'AbisenaHBYS',
          sifre: 'Siramatik2025'
        }
      };

      const response = await request(app)
        .post('/api/patients/add')
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('should fail when IP address is invalid', async () => {
      const invalidIpData = {
        ...validAddPatientData,
        hastaEkle: {
          ...validAddPatientData.hastaEkle,
          ipAdres: 'invalid-ip'
        }
      };

      const response = await request(app)
        .post('/api/patients/add')
        .send(invalidIpData);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/patients/call', () => {
    const validCallPatientData = {
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
            randevuVar: '0',
            randevuSaati: '',
            randevuTuru: '',
            maskeleme: '0'
          }
        ],
        kullanici_adi: 'AbisenaHBYS',
        sifre: 'Siramatik2025'
      }
    };

    it('should call a patient successfully', async () => {
      const response = await request(app)
        .post('/api/patients/call')
        .send(validCallPatientData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.call.adiSoyadi).toBe(validCallPatientData.hastaBilgisi.adiSoyadi);
    });

    it('should fail when call type is invalid', async () => {
      const invalidCallTypeData = {
        hastaBilgisi: {
          ...validCallPatientData.hastaBilgisi,
          cagriTipi: 'InvalidType'
        }
      };

      const response = await request(app)
        .post('/api/patients/call')
        .send(invalidCallTypeData);

      expect(response.status).toBe(400);
    });

    it('should fail when siradakiHastalar array is invalid', async () => {
      const invalidQueueData = {
        hastaBilgisi: {
          ...validCallPatientData.hastaBilgisi,
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
        }
      };

      const response = await request(app)
        .post('/api/patients/call')
        .send(invalidQueueData);

      expect(response.status).toBe(400);
    });
  });
});