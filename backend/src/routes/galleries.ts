import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { recordStatusChange } from '../utils/history.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const galleries = await prisma.gallery.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { images: true } } } });
  return res.json(galleries);
});

router.get('/:id', async (req: Request, res: Response) => {
  const gallery = await prisma.gallery.findUnique({
    where: { id: Number(req.params.id) },
    include: { _count: { select: { images: true } } },
  });
  if (!gallery) return res.status(404).json({ error: 'Galeria não encontrada' });
  return res.json(gallery);
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Título é obrigatório' });
  const gallery = await prisma.gallery.create({ data: { title, description } });
  return res.status(201).json(gallery);
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  const { title, description, coverImage } = req.body;
  try {
    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (coverImage !== undefined) data.coverImage = coverImage;
    const gallery = await prisma.gallery.update({ where: { id: Number(req.params.id) }, data: data as any });
    return res.json(gallery);
  } catch {
    return res.status(404).json({ error: 'Galeria não encontrada' });
  }
});

router.put('/:id/status', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body;
  if (isActive === undefined) return res.status(400).json({ error: 'Campo isActive é obrigatório' });
  try {
    const current = await prisma.gallery.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Galeria não encontrada' });
    const gallery = await prisma.gallery.update({ where: { id: Number(req.params.id) }, data: { isActive } });
    await recordStatusChange('gallery', current.id, current.isActive, isActive, req.adminId!);
    return res.json(gallery);
  } catch {
    return res.status(404).json({ error: 'Galeria não encontrada' });
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const current = await prisma.gallery.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Galeria não encontrada' });
    const gallery = await prisma.gallery.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    await recordStatusChange('gallery', current.id, current.isActive, false, req.adminId!);
    return res.json(gallery);
  } catch {
    return res.status(404).json({ error: 'Galeria não encontrada' });
  }
});

export default router;
