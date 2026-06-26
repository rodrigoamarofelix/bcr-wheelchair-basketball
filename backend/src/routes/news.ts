import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { recordStatusChange } from '../utils/history.js';

const newsSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  content: z.string().min(10, 'Conteúdo deve ter no mínimo 10 caracteres'),
  imageUrl: z.string().max(500).optional().nullable(),
  published: z.boolean().optional(),
});

const newsUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  imageUrl: z.string().max(500).optional().nullable(),
  published: z.boolean().optional(),
});

const statusSchema = z.object({
  isActive: z.boolean({ message: 'Campo isActive é obrigatório' }),
});

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

router.post('/', authenticate, validate(newsSchema), async (req: Request, res: Response) => {
  const { title, content, imageUrl, published } = req.body;
  const item = await prisma.news.create({
    data: { title, content, imageUrl, published: published ?? false },
  });
  return res.status(201).json(item);
});

router.put('/:id', authenticate, validate(newsUpdateSchema), async (req: Request, res: Response) => {
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

router.put('/:id/status', authenticate, requireRole('admin'), validate(statusSchema), async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body;
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
