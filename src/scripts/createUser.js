const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUser(kullanici_adi, sifre) {
  try {
    const user = await prisma.user.create({
      data: {
        kullanici_adi,
        sifre
      }
    });
    console.log('Kullanıcı başarıyla oluşturuldu:', user);
  } catch (error) {
    console.error('Kullanıcı oluşturulurken hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Örnek kullanıcı oluştur
createUser('AbisenaHBYS', 'Siramatik2025'); 