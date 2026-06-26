import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { authenticate, requireRole, generateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = generateToken(admin.id, admin.role);
  return res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
});

router.get('/users', authenticate, requireRole('admin'), async (_req: Request, res: Response) => {
  const users = await prisma.admin.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  return res.json(users);
});

router.post('/register', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }
  if (role && !['admin', 'editor'].includes(role)) {
    return res.status(400).json({ error: 'Perfil inválido. Use admin ou editor' });
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Email já cadastrado' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: { name, email, password: hashed, role: role || 'editor' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return res.status(201).json(admin);
});

router.put('/users/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { name, email, role, password } = req.body;
  try {
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) {
      if (!['admin', 'editor'].includes(role)) {
        return res.status(400).json({ error: 'Perfil inválido. Use admin ou editor' });
      }
      data.role = role;
    }
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.admin.update({
      where: { id: Number(req.params.id) },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return res.json(user);
  } catch {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
});

router.delete('/users/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.admin.delete({ where: { id: Number(req.params.id) } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
});

export default router;
