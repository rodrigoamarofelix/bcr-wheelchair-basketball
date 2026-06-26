import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';

const contactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  message: z.string().min(10, 'Mensagem deve ter no mínimo 10 caracteres').max(5000, 'Mensagem muito longa'),
});

const router = Router();

router.post('/', rateLimiter, validate(contactSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    const msg = await prisma.contactMessage.create({
      data: { name, email, message },
    });
    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar mensagens' });
  }
});

router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const msg = await prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar mensagem' });
  }
});

export default router;
