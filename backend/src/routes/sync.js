import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import SyncService from '../services/SyncService.js';

const router = express.Router();
const prisma = new PrismaClient();
const protectedRoles = roleMiddleware(['MERCHANT', 'ACCOUNTANT', 'COMPTABLE']);

const batchSchema = Joi.object({
  transactions: Joi.array().items(Joi.object().unknown(true)).max(100).required(),
});

router.post('/', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    const { error, value } = batchSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });
    }
    const result = await SyncService.processBatch(req.user.id, req.user.merchantId, value.transactions, {
      ip_address: req.ip,
      device_uuid: req.headers['x-device-uuid'] || null,
    });

    const status = result.errors.some((e) => e.message === 'merchant requis pour la synchronisation')
      ? 403
      : 200;
    res.status(status).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/status', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    const last = await prisma.transaction.findFirst({
      where: { userID: req.user.id },
      orderBy: [{ syncedAt: 'desc' }, { id: 'desc' }],
      select: { syncedAt: true },
    });
    res.json({
      pending: 0,
      last_sync: last?.syncedAt?.toISOString() ?? null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
