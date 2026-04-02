import express from 'express';
import { authenticate, requireMerchant } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import {
  computeCreditScoreBreakdown,
  persistScoreSnapshot,
} from '../services/creditScoreService.js';

const router = express.Router();
const prisma = new PrismaClient();
const merchantAuth = [authenticate, requireMerchant];

const scoreHandler = async (req, res, next) => {
  try {
    const m = await prisma.merchant.findUnique({
      where: { id: req.user.merchantId },
      select: { creditScore: true, scoreLastUpdated: true },
    });
    res.json({
      success: true,
      score: m?.creditScore ?? 0,
      scoreLastUpdated: m?.scoreLastUpdated,
    });
  } catch (e) {
    next(e);
  }
};

router.get('/', ...merchantAuth, scoreHandler);
router.get('/my-score', ...merchantAuth, scoreHandler);

/** Détail explicable des composantes */
router.get('/breakdown', ...merchantAuth, async (req, res, next) => {
  try {
    const result = await computeCreditScoreBreakdown(req.user.merchantId);
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
});

/** Recalcul + persistance (historique CreditScore) */
router.post('/recalculate', ...merchantAuth, async (req, res, next) => {
  try {
    const result = await computeCreditScoreBreakdown(req.user.merchantId);
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    await persistScoreSnapshot(req.user.merchantId, result);
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
});

export default router;
