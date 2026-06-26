import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getStatusHistory } from '../utils/history.js';

const router = Router();

router.get('/', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  const { entityType, entityId } = req.query;
  if (!entityType || !entityId) {
    return res.status(400).json({ error: 'entityType e entityId são obrigatórios' });
  }
  const history = await getStatusHistory(entityType as string, Number(entityId));
  return res.json(history);
});

export default router;
