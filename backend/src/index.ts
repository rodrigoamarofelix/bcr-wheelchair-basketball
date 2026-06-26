import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import playersRoutes from './routes/players.js';
import matchesRoutes from './routes/matches.js';
import newsRoutes from './routes/news.js';
import galleryRoutes from './routes/gallery.js';
import galleriesRoutes from './routes/galleries.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import contactRoutes from './routes/contact.js';
import historyRoutes from './routes/history.js';
import statsRoutes from './routes/stats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/galleries', galleriesRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
