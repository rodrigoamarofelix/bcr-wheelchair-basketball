import 'dotenv/config';
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
import rssRoutes from './routes/rss.js';
import partnersRoutes from './routes/partners.js';
import eventsRoutes from './routes/events.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 3001;

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin.split(',').map((s) => s.trim()), credentials: true }));
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
app.use('/api/partners', partnersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/rss', rssRoutes);

async function bootstrapPartners() {
  const count = await prisma.partner.count();
  if (count > 0) return;
  await prisma.partner.createMany({
    data: [
      { name: 'Nashville', imageUrl: '/partners/partner-1.jpeg', sortOrder: 1 },
      { name: 'Lego House', imageUrl: '/partners/partner-2.jpeg', sortOrder: 2 },
      { name: 'Harley-Davidson', imageUrl: '/partners/partner-3.jpeg', sortOrder: 3 },
      { name: 'Dior', imageUrl: '/partners/partner-4.jpeg', sortOrder: 4 },
      { name: 'Surf Coffee', imageUrl: '/partners/partner-5.jpeg', sortOrder: 5 },
      { name: 'Tesla', imageUrl: '/partners/partner-6.jpeg', sortOrder: 6 },
    ],
  });
  console.log('Parceiros iniciais criados');
}

async function bootstrapEvents() {
  const defaultEvents = [
    { title: 'Treino da Semana', schedule: 'Toda terça e quinta', location: 'Ginásio Municipal', imageUrl: '/events/event-1.jpeg', sortOrder: 1 },
    { title: 'Amistoso Preparatório', schedule: '5 de julho', location: 'Arena do Parque', imageUrl: '/events/event-2.jpeg', sortOrder: 2 },
    { title: 'Campeonato Estadual', schedule: '15 a 22 de julho', location: 'São Paulo - SP', imageUrl: '/events/event-3.jpeg', sortOrder: 3 },
    { title: 'Torneio Regional', schedule: '5 de agosto', location: 'Brasília - DF', imageUrl: '/events/event-4.jpeg', sortOrder: 4 },
  ];

  const count = await prisma.event.count();
  if (count === 0) {
    await prisma.event.createMany({ data: defaultEvents });
    console.log('Eventos iniciais criados');
    return;
  }

  for (const ev of defaultEvents) {
    await prisma.event.updateMany({
      where: {
        sortOrder: ev.sortOrder,
        imageUrl: { in: ['/events/event-cover.jpg', '/events/event-cover.jpeg'] },
      },
      data: { imageUrl: ev.imageUrl },
    });
  }
}

bootstrapPartners().catch(console.error);
bootstrapEvents().catch(console.error);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
