import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { recordStatusChange } from '../utils/history.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const matches = await prisma.match.findMany({ orderBy: { date: 'desc' } });
  return res.json(matches);
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  const { opponent, date, location } = req.body;
  if (!opponent || !date || !location) {
    return res.status(400).json({ error: 'Oponente, data e local são obrigatórios' });
  }
  const match = await prisma.match.create({
    data: { opponent, date: new Date(date), location },
  });
  return res.status(201).json(match);
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
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
