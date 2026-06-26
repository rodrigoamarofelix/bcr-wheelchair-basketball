import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const [players, matches, news, galleries, unreadMessages] = await Promise.all([
      prisma.player.count({ where: { isActive: true } }),
      prisma.match.count({ where: { isActive: true } }),
      prisma.news.count({ where: { isActive: true } }),
      prisma.gallery.count({ where: { isActive: true } }),
      prisma.contactMessage.count({ where: { read: false } }),
    ]);
    res.json({ players, matches, news, galleries, unreadMessages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar estatísticas' });
  }
});

export default router;
