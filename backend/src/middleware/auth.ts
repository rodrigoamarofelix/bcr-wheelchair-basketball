import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export interface AuthRequest extends Request {
  adminId?: number;
  adminRole?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    req.adminId = decoded.id;
    req.adminRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.adminRole || !roles.includes(req.adminRole)) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }
    next();
  };
}

export function generateToken(id: number, role: string): string {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
}
