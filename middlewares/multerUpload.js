import multer from 'multer';
import path from 'path';
import { HttpError } from '../helpers/HttpError.js';

const storage = multer.diskStorage({
  destination: 'temp/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new HttpError(400, 'Only JPEG, PNG and WebP images are allowed'));
  }
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
