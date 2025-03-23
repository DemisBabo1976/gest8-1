const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Assicura che la directory di upload esista
const createUploadDir = (dir) => {
  const uploadDir = path.join(__dirname, '../public/uploads', dir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Configura lo storage per le immagini del menu
const menuStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = createUploadDir('menu');
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'menu-' + uniqueSuffix + extension);
  }
});

// Filtro per accettare solo immagini
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo i file immagine sono supportati!'), false);
  }
};

// Esporta il middleware per il caricamento di immagini del menu
exports.uploadMenuImage = multer({
  storage: menuStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});