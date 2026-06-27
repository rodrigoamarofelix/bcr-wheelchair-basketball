import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { recordStatusChange } from '../utils/history.js';

const partnerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  imageUrl: z.string().min(1, 'Imagem é obrigatória').max(500),
  sortOrder: z.number().int().min(0).optional(),
});

const partnerUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  imageUrl: z.string().min(1).max(500).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const partners = await prisma.partner.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  return res.json(partners);
});

router.get('/:id', async (req: Request, res: Response) => {
  const partner = await prisma.partner.findUnique({ where: { id: Number(req.params.id) } });
  if (!partner) return res.status(404).json({ error: 'Parceiro não encontrado' });
  return res.json(partner);
});

router.post('/', authenticate, validate(partnerSchema), async (req: Request, res: Response) => {
  const { name, imageUrl, sortOrder } = req.body;
  const partner = await prisma.partner.create({
    data: { name, imageUrl, sortOrder: sortOrder ?? 0 },
  });
  return res.status(201).json(partner);
});

router.put('/:id', authenticate, validate(partnerUpdateSchema), async (req: Request, res: Response) => {
  const { name, imageUrl, sortOrder, isActive } = req.body;
  try {
    const partner = await prisma.partner.update({
      where: { id: Number(req.params.id) },
      data: { name, imageUrl, sortOrder, isActive },
    });
    return res.json(partner);
  } catch {
    return res.status(404).json({ error: 'Parceiro não encontrado' });
  }
});

router.put('/:id/status', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body;
  if (isActive === undefined) {
    return res.status(400).json({ error: 'Campo isActive é obrigatório' });
  }
  try {
    const current = await prisma.partner.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Parceiro não encontrado' });

    const partner = await prisma.partner.update({
      where: { id: Number(req.params.id) },
      data: { isActive },
    });

    await recordStatusChange('partner', current.id, current.isActive, isActive, req.adminId!);
    return res.json(partner);
  } catch {
    return res.status(404).json({ error: 'Parceiro não encontrado' });
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const current = await prisma.partner.findUnique({ where: { id: Number(req.params.id) } });
    if (!current) return res.status(404).json({ error: 'Parceiro não encontrado' });

    const partner = await prisma.partner.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });

    await recordStatusChange('partner', current.id, current.isActive, false, req.adminId!);
    return res.json(partner);
  } catch {
    return res.status(404).json({ error: 'Parceiro não encontrado' });
  }
});

export default router;
