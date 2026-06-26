import { Router, Request, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const settings = await prisma.siteSettings.findMany();
  const obj: Record<string, string> = {};
  settings.forEach((s) => { obj[s.key] = s.value; });
  return res.json(obj);
});

router.put('/', authenticate, async (req: Request, res: Response) => {
  const entries = req.body as Record<string, string>;
  for (const [key, value] of Object.entries(entries)) {
    await prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  return res.json({ message: 'Configurações atualizadas' });
});

export default router;
