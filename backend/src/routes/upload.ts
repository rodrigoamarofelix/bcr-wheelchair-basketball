import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedImages = ['.png', '.jpg', '.jpeg'];
    const allowedVideos = ['.mp4', '.webm', '.mov'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedImages.includes(ext) || allowedVideos.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas PNG, JPG, JPEG, MP4, WebM e MOV são permitidos'));
    }
  },
});

const router = Router();

router.post('/', authenticate, upload.array('files', 20), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  const results = files.map((f) => {
    const ext = path.extname(f.originalname).toLowerCase();
    const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);
    return {
      url: `/uploads/${f.filename}`,
      type: isVideo ? 'video' : 'image',
      filename: f.filename,
    };
  });
  return res.json(results);
});

export { upload };
export default router;
