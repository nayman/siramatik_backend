# Sıramatik Backend API

Hastane sıra yönetim sistemi için RESTful API servisi.

## Özellikler

- Hasta sıra yönetimi
- Servis bazlı hasta listeleme
- Hasta çağırma sistemi
- Randevulu/Randevusuz hasta takibi
- Swagger API dokümantasyonu

## Teknolojiler

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Swagger UI

## Kurulum

1. Repository'yi klonlayın:
```bash
git clone https://github.com/your-username/siramatik-backend.git
cd siramatik-backend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/siramatik"
PORT=3000
```

4. Veritabanı migration'larını çalıştırın:
```bash
npx prisma migrate dev
```

5. Uygulamayı başlatın:
```bash
npm start
```

## API Dokümantasyonu

API dokümantasyonuna `/api-docs` endpoint'inden erişebilirsiniz.

## Lisans

MIT 