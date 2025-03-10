const { PrismaClient } = require('@prisma/client');
const { AppError } = require('./error.middleware');
const logger = require('../utils/logger');
const prisma = new PrismaClient();

const validateUser = async (req, res, next) => {
  try {
    let userCredentials;

    // Check if request body is array or object
    if (Array.isArray(req.body)) {
      // If array, get last item
      if (req.body.length === 0) {
        logger.warn('Auth Middleware - Empty array', null, 'middleware');
        return next(new AppError('Request body array cannot be empty', 400));
      }
      // Get the last item from array
      const lastItem = req.body[req.body.length - 1];
      // Try both structures
      userCredentials = lastItem.kullaniciBilgisi || lastItem.hastaBilgisi;
    } else {
      // Try both structures
      userCredentials = req.body.kullaniciBilgisi || req.body.hastaBilgisi;
    }

    // Validate user credentials
    if (!userCredentials) {
      logger.warn('Auth Middleware - No user credentials found', null, 'middleware');
      return next(new AppError('Kullanıcı bilgileri gerekli', 400));
    }

    if (!userCredentials.kullanici_adi || !userCredentials.sifre) {
      logger.warn('Auth Middleware - Missing username or password', null, 'middleware');
      return next(new AppError('Kullanıcı adı ve şifre gerekli', 400));
    }

    // Check user credentials
    const user = await prisma.user.findUnique({
      where: {
        kullanici_adi: userCredentials.kullanici_adi
      }
    });

    if (!user || user.sifre !== userCredentials.sifre) {
      logger.warn('Auth Middleware - Invalid credentials', null, 'middleware');
      return next(new AppError('Geçersiz kullanıcı adı veya şifre', 401));
    }

    // Add user to request object for later use
    req.user = user;
    logger.info('Auth Middleware - User validated successfully', null, 'middleware');
    next();
  } catch (error) {
    logger.error('Auth Middleware - Error', error, 'middleware');
    next(new AppError('Kullanıcı doğrulama hatası: ' + error.message, 500));
  }
};

module.exports = {
  validateUser
}; 