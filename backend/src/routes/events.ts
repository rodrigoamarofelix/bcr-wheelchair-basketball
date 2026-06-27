import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { recordStatusChange } from '../utils/history.js';

const eventSchema = z.object({
  title: z.string().min(2, 'Título deve ter no mínimo 2 caracteres'),
  schedule: z.string().min(1, 'Data/horário é obrigatório').max(200),
  location: z.string().min(1, 'Local é obrigatório').max(200),
  imageUrl: z.string().min(1, 'Imagem é obrigatória').max(500),
  sortOrder: z.number().int().min(0).optional(),
});

const eventUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  schedule: z.string().min(1).max(200).optional(),
  location: z.string().min(1).max(200).optional(),
  imageUrl: z.string().min(1).max(500).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const events = await prisma.event.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  return res.json(events);
});

router.get('/:id', async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({ where: { id: Number(req.params.id) } });
  if (!event) return res.status(404).json({ error: 'Evento não encontrado' });
  return res.json(event);
});

router.post('/', authenticate, validate(eventSchema), async (req: Request, res: Response) => {
  const { title, schedule, location, imageUrl, sortOrder } = req.body;
  const event = await prisma.event.create({
    data: { title, schedule, location, imageUrl, sortOrder: sortOrder ?? 0 },
  });
  return res.status(201).json(event);
});

router.put('/:id', authenticate, validate(eventUpdateSchema), async (req: Request, res: Response) => {
  const { title, schedule, location, imageUrl, sortOrder, isActive } = req.body;
  try {
    const event = await prisma.event.update({
      where: { id: Number(req.params.id) },
      data: { title, schedule, location, imageUrl, sortOrder, isActive },
    });
    return res.json(event);
  } catch {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }
});

router.put('/:id/status', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body;
  if (isActive === undefined) {
    return res.status(400).json({ error: 'Campo isActive é obrigatório' });
  }
  try {
    const current = await prisma.event.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Evento não encontrado' });

    const event = await prisma.event.update({
      where: { id: Number(req.params.id) },
      data: { isActive },
    });

    await recordStatusChange('event', current.id, current.isActive, isActive, req.adminId!);
    return res.json(event);
  } catch {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const current = await prisma.event.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Evento não encontrado' });

    const event = await prisma.event.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });

    await recordStatusChange('event', current.id, current.isActive, false, req.adminId!);
    return res.json(event);
  } catch {
    return res.status(404).json({ error: 'Evento não encontrado' });
  }
});

export default router;
