import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { recordStatusChange } from '../utils/history.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const onlyPublished = req.query.published === 'true';
  const where: Record<string, unknown> = {};
  if (onlyPublished) {
    where.published = true;
    where.isActive = true;
  }
  const news = await prisma.news.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return res.json(news);
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.news.findUnique({ where: { id: Number(req.params.id) } });
    if (!item || !item.isActive) return res.status(404).json({ error: 'Notícia não encontrada' });
    return res.json(item);
  } catch {
    return res.status(404).json({ error: 'Notícia não encontrada' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  const { title, content, imageUrl, published } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
  }
  const item = await prisma.news.create({
    data: { title, content, imageUrl, published: published ?? false },
  });
  return res.status(201).json(item);
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  const { title, content, imageUrl, published } = req.body;
  try {
    const item = await prisma.news.update({
      where: { id: Number(req.params.id) },
      data: { title, content, imageUrl, published },
    });
    return res.json(item);
  } catch {
    return res.status(404).json({ error: 'Notícia não encontrada' });
  }
});

router.put('/:id/status', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body;
  if (isActive === undefined) {
    return res.status(400).json({ error: 'Campo isActive é obrigatório' });
  }
  try {
    const current = await prisma.news.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Notícia não encontrada' });

    const item = await prisma.news.update({
      where: { id: Number(req.params.id) },
      data: { isActive },
    });

    await recordStatusChange('news', current.id, current.isActive, isActive, req.adminId!);
    return res.json(item);
  } catch {
    return res.status(404).json({ error: 'Notícia não encontrada' });
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const current = await prisma.news.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Notícia não encontrada' });

    const item = await prisma.news.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });

    await recordStatusChange('news', current.id, current.isActive, false, req.adminId!);
    return res.json(item);
  } catch {
    return res.status(404).json({ error: 'Notícia não encontrada' });
  }
});

export default router;
