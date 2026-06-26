import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { recordStatusChange } from '../utils/history.js';

const playerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  number: z.number().int().positive('Número deve ser positivo'),
  position: z.enum(['armador', 'ala', 'pivo', 'ala_pivo'], { message: 'Posição inválida' }),
  functionalClassification: z.number().min(1).max(4.5).nullable().optional(),
  photoUrl: z.string().max(500).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
});

const playerUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  number: z.number().int().positive().optional(),
  position: z.enum(['armador', 'ala', 'pivo', 'ala_pivo']).optional(),
  functionalClassification: z.number().min(1).max(4.5).nullable().optional(),
  photoUrl: z.string().max(500).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
});

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const players = await prisma.player.findMany({ orderBy: { number: 'asc' } });
  return res.json(players);
});

router.get('/:id', async (req: Request, res: Response) => {
  const player = await prisma.player.findUnique({ where: { id: Number(req.params.id) } });
  if (!player) return res.status(404).json({ error: 'Jogador não encontrado' });
  return res.json(player);
});

router.post('/', authenticate, validate(playerSchema), async (req: Request, res: Response) => {
  const { name, number, position, functionalClassification, photoUrl, bio } = req.body;
  const player = await prisma.player.create({
    data: { name, number, position, functionalClassification, photoUrl, bio },
  });
  return res.status(201).json(player);
});

router.put('/:id', authenticate, validate(playerUpdateSchema), async (req: Request, res: Response) => {
  const { name, number, position, functionalClassification, photoUrl, bio, isActive } = req.body;
  try {
    const player = await prisma.player.update({
      where: { id: Number(req.params.id) },
      data: { name, number, position, functionalClassification, photoUrl, bio, isActive },
    });
    return res.json(player);
  } catch {
    return res.status(404).json({ error: 'Jogador não encontrado' });
  }
});

router.put('/:id/status', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body;
  if (isActive === undefined) {
    return res.status(400).json({ error: 'Campo isActive é obrigatório' });
  }
  try {
    const current = await prisma.player.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Jogador não encontrado' });

    const player = await prisma.player.update({
      where: { id: Number(req.params.id) },
      data: { isActive },
    });

    await recordStatusChange('player', current.id, current.isActive, isActive, req.adminId!);
    return res.json(player);
  } catch {
    return res.status(404).json({ error: 'Jogador não encontrado' });
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const current = await prisma.player.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Jogador não encontrado' });

    const player = await prisma.player.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });

    await recordStatusChange('player', current.id, current.isActive, false, req.adminId!);
    return res.json(player);
  } catch {
    return res.status(404).json({ error: 'Jogador não encontrado' });
  }
});

export default router;
