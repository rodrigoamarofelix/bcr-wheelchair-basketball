import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

const storage = multer.memoryStorage();

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

router.post('/', authenticate, upload.array('files', 20), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  const results = await Promise.all(files.map(async (f) => {
    const ext = path.extname(f.originalname).toLowerCase();
    const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);
    const baseName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    if (isVideo) {
      const filename = `${baseName}${ext}`;
      await fs.writeFile(path.join(uploadsDir, filename), f.buffer);
      return { url: `/uploads/${filename}`, type: 'video', filename };
    }

    const filename = `${baseName}.webp`;
    await sharp(f.buffer)
      .webp({ quality: 80 })
      .toFile(path.join(uploadsDir, filename));
    return { url: `/uploads/${filename}`, type: 'image', filename };
  }));
  return res.json(results);
});

export { upload };
export default router;
