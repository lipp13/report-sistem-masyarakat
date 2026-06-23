const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'image/bmp': '.bmp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let ext = path.extname(file.originalname || '').toLowerCase();
    if (!ext && file.mimetype && MIME_TO_EXT[file.mimetype.toLowerCase()]) {
      ext = MIME_TO_EXT[file.mimetype.toLowerCase()];
    }
    if (!ext || ext === '.') {
      ext = '.jpg';
    }
    cb(null, `report-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|gif|webp|heic|heif|bmp$/i;
  const rawName = file.originalname || '';
  const ext = path.extname(rawName).toLowerCase().replace(/^\./, '');
  const extOk = !ext || allowedExt.test(ext);

  const mime = (file.mimetype || '').toLowerCase();
  const mimeOk = /^image\//.test(mime);

  if (extOk && mimeOk) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, heic, heif, bmp)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;
