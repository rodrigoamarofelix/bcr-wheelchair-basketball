import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { recordStatusChange } from '../utils/history.js';

const router = Router();

router.get('/:galleryId/images', async (req: Request, res: Response) => {
  const images = await prisma.galleryImage.findMany({
    where: { galleryId: Number(req.params.galleryId) },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(images);
});

router.post('/:galleryId/images', authenticate, async (req: Request, res: Response) => {
  const { url, caption, type, items } = req.body;
  const galleryId = Number(req.params.galleryId);
  const gallery = await prisma.gallery.findUnique({ where: { id: galleryId } });
  if (!gallery) return res.status(404).json({ error: 'Galeria não encontrada' });

  if (items && Array.isArray(items)) {
    const created = await Promise.all(
      items.map((item: { url: string; caption?: string; type?: string }) =>
        prisma.galleryImage.create({
          data: { url: item.url, caption: item.caption || null, type: item.type || 'image', galleryId },
        })
      )
    );
    return res.status(201).json(created);
  }
  if (!url) return res.status(400).json({ error: 'URL da imagem/vídeo é obrigatória' });
  const image = await prisma.galleryImage.create({ data: { url, caption, type: type || 'image', galleryId } });
  return res.status(201).json(image);
});

router.put('/:galleryId/images/:id', authenticate, async (req: Request, res: Response) => {
  const { caption } = req.body;
  try {
    const item = await prisma.galleryImage.findFirst({
      where: { id: Number(req.params.id), galleryId: Number(req.params.galleryId) },
    });
    if (!item) return res.status(404).json({ error: 'Imagem não encontrada' });
    const data: Record<string, unknown> = {};
    if (caption !== undefined) data.caption = caption;
    const updated = await prisma.galleryImage.update({ where: { id: Number(req.params.id) }, data: data as any });
    return res.json(updated);
  } catch {
    return res.status(404).json({ error: 'Imagem não encontrada' });
  }
});

router.put('/:galleryId/images/:id/status', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body;
  if (isActive === undefined) return res.status(400).json({ error: 'Campo isActive é obrigatório' });
  try {
    const current = await prisma.galleryImage.findFirst({
      where: { id: Number(req.params.id), galleryId: Number(req.params.galleryId) },
    });
    if (!current) return res.status(404).json({ error: 'Imagem não encontrada' });
    const image = await prisma.galleryImage.update({
      where: { id: Number(req.params.id) },
      data: { isActive },
    });
    await recordStatusChange('gallery_images', current.id, current.isActive, isActive, req.adminId!);
    return res.json(image);
  } catch {
    return res.status(404).json({ error: 'Imagem não encontrada' });
  }
});

router.delete('/:galleryId/images/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const current = await prisma.galleryImage.findFirst({
      where: { id: Number(req.params.id), galleryId: Number(req.params.galleryId) },
    });
    if (!current) return res.status(404).json({ error: 'Imagem não encontrada' });
    const image = await prisma.galleryImage.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });
    await recordStatusChange('gallery_images', current.id, current.isActive, false, req.adminId!);
    return res.json(image);
  } catch {
    return res.status(404).json({ error: 'Imagem não encontrada' });
  }
});

export default router;
