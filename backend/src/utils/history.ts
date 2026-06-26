import { prisma } from '../index.js';

export async function recordStatusChange(
  entityType: string,
  entityId: number,
  oldStatus: boolean,
  newStatus: boolean,
  changedBy: number
) {
  await prisma.statusHistory.create({
    data: { entityType, entityId, oldStatus, newStatus, changedBy },
  });
}

export async function getStatusHistory(entityType: string, entityId: number) {
  return prisma.statusHistory.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
  });
}
