import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.issues.map((e: { message: string }) => e.message).join(', ');
        return res.status(400).json({ error: messages });
      }
      return res.status(400).json({ error: 'Dados inválidos' });
    }
  };
}
