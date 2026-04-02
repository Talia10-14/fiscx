import express from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, requireMerchant } from '../middleware/auth.js';
import { computeCreditScoreBreakdown } from '../services/creditScoreService.js';

const router = express.Router();
const prisma = new PrismaClient();
const merchantAuth = [authenticate, requireMerchant];

router.post('/', ...merchantAuth, async (req, res, next) => {
  try {
    const { loanAmount, bankName, purpose } = req.body;
    const amount = Number(loanAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new AppError('Montant du prêt invalide', 400);
    }

    const fresh = await computeCreditScoreBreakdown(req.user.merchantId);
    const scoreAtRequest = fresh?.score ?? null;

    const loan = await prisma.loan.create({
      data: {
        merchantID: req.user.merchantId,
        requesterID: req.user.id,
        loanAmount: amount,
        bankName: bankName || null,
        purpose: purpose || null,
        status: 'SUBMITTED',
        scoreAtRequest,
        appliedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      loan,
      message:
        'Demande enregistrée. Le traitement bancaire nécessite un consentement explicite (CDC §3.4.2) — à brancher en phase 3.',
    });
  } catch (e) {
    next(e);
  }
});

router.get('/', ...merchantAuth, async (req, res, next) => {
  try {
    const loans = await prisma.loan.findMany({
      where: { merchantID: req.user.merchantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, loans });
  } catch (e) {
    next(e);
  }
});

export default router;
