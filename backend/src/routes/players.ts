import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { recordStatusChange } from '../utils/history.js';

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

router.post('/', authenticate, async (req: Request, res: Response) => {
  const { name, number, position, functionalClassification, photoUrl, bio } = req.body;
  if (!name || number === undefined || !position) {
    return res.status(400).json({ error: 'Nome, número e posição são obrigatórios' });
  }
  const player = await prisma.player.create({
    data: { name, number, position, functionalClassification, photoUrl, bio },
  });
  return res.status(201).json(player);
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
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
