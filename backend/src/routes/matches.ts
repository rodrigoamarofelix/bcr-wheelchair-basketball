import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { recordStatusChange } from '../utils/history.js';

const matchSchema = z.object({
  opponent: z.string().min(2, 'Oponente deve ter no mínimo 2 caracteres'),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), { message: 'Data inválida' }),
  location: z.string().min(2, 'Local deve ter no mínimo 2 caracteres'),
});

const matchUpdateSchema = z.object({
  opponent: z.string().min(2).optional(),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), { message: 'Data inválida' }).optional(),
  location: z.string().min(2).optional(),
  homeScore: z.number().int().min(0).nullable().optional(),
  opponentScore: z.number().int().min(0).nullable().optional(),
  isFinished: z.boolean().optional(),
});

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const matches = await prisma.match.findMany({ orderBy: { date: 'desc' } });
  return res.json(matches);
});

router.post('/', authenticate, validate(matchSchema), async (req: Request, res: Response) => {
  const { opponent, date, location } = req.body;
  const match = await prisma.match.create({
    data: { opponent, date: new Date(date), location },
  });
  return res.status(201).json(match);
});

router.put('/:id', authenticate, validate(matchUpdateSchema), async (req: Request, res: Response) => {
  const { opponent, date, location, homeScore, opponentScore, isFinished } = req.body;
  try {
    const match = await prisma.match.update({
      where: { id: Number(req.params.id) },
      data: {
        opponent, date: date ? new Date(date) : undefined,
        location, homeScore, opponentScore, isFinished,
      },
    });
    return res.json(match);
  } catch {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }
});

router.put('/:id/status', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body;
  if (isActive === undefined) {
    return res.status(400).json({ error: 'Campo isActive é obrigatório' });
  }
  try {
    const current = await prisma.match.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Jogo não encontrado' });

    const match = await prisma.match.update({
      where: { id: Number(req.params.id) },
      data: { isActive },
    });

    await recordStatusChange('match', current.id, current.isActive, isActive, req.adminId!);
    return res.json(match);
  } catch {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const current = await prisma.match.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Jogo não encontrado' });

    const match = await prisma.match.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });

    await recordStatusChange('match', current.id, current.isActive, false, req.adminId!);
    return res.json(match);
  } catch {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }
});

export default router;
