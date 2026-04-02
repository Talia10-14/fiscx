import express from 'express';
import { PrismaClient } from '@prisma/client';
import { extractToken, verifyToken } from '../utils/jwt.js';
import {
  getLastHashChainReport,
  verifyAllMerchantChains,
} from '../services/hashChainMonitor.js';

const router = express.Router();
const prisma = new PrismaClient();

const requireAdmin = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const decoded = verifyToken(token, 'access');
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.get('/stats', requireAdmin, async (_req, res) => {
  try {
    const [users, merchants, transactions, taxRules] = await Promise.all([
      prisma.user.count(),
      prisma.merchant.count(),
      prisma.transaction.count(),
      prisma.taxRule.count(),
    ]);
    res.json({
      success: true,
      stats: { users, merchants, transactions, taxRules },
    });
  } catch (err) {
    console.error('GET /admin/stats', err);
    res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
});

/** CDC §3.3.1 — barèmes fiscaux en base */
router.get('/tax-rules', requireAdmin, async (req, res, next) => {
  try {
    const { countryCode = 'BJ', year } = req.query;
    const where = { countryCode: String(countryCode) };
    if (year) where.year = parseInt(year, 10);
    const rules = await prisma.taxRule.findMany({
      where,
      orderBy: [{ year: 'desc' }, { regime: 'asc' }, { minAnnualCA: 'asc' }],
    });
    res.json({ success: true, rules });
  } catch (e) {
    next(e);
  }
});

router.post('/tax-rules', requireAdmin, async (req, res, next) => {
  try {
    const {
      countryCode = 'BJ',
      year,
      regime,
      label,
      minAnnualCA,
      maxAnnualCA,
      syntheticRatePercent,
      rrsRatePercent,
      notes,
      active = true,
    } = req.body;
    if (!year || !regime || !label) {
      return res.status(400).json({ success: false, message: 'year, regime, label requis' });
    }
    const rule = await prisma.taxRule.create({
      data: {
        countryCode,
        year: parseInt(year, 10),
        regime,
        label,
        minAnnualCA: minAnnualCA != null ? Number(minAnnualCA) : null,
        maxAnnualCA: maxAnnualCA != null ? Number(maxAnnualCA) : null,
        syntheticRatePercent:
          syntheticRatePercent != null ? Number(syntheticRatePercent) : null,
        rrsRatePercent: rrsRatePercent != null ? Number(rrsRatePercent) : null,
        notes: notes || null,
        active: Boolean(active),
      },
    });
    res.status(201).json({ success: true, rule });
  } catch (e) {
    next(e);
  }
});

router.patch('/tax-rules/:id', requireAdmin, async (req, res, next) => {
  try {
    const data = {};
    const b = req.body;
    if (b.label != null) data.label = b.label;
    if (b.minAnnualCA !== undefined) data.minAnnualCA = b.minAnnualCA == null ? null : Number(b.minAnnualCA);
    if (b.maxAnnualCA !== undefined) data.maxAnnualCA = b.maxAnnualCA == null ? null : Number(b.maxAnnualCA);
    if (b.syntheticRatePercent !== undefined) {
      data.syntheticRatePercent =
        b.syntheticRatePercent == null ? null : Number(b.syntheticRatePercent);
    }
    if (b.rrsRatePercent !== undefined) {
      data.rrsRatePercent = b.rrsRatePercent == null ? null : Number(b.rrsRatePercent);
    }
    if (b.notes !== undefined) data.notes = b.notes;
    if (b.active !== undefined) data.active = Boolean(b.active);

    const rule = await prisma.taxRule.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, rule });
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }
    next(e);
  }
});

// CDC §6.5 — chain integrity monitoring
router.get('/hash-chain/health', requireAdmin, async (_req, res) => {
  const report = getLastHashChainReport();
  res.json({ success: true, ...report });
});

router.post('/hash-chain/verify', requireAdmin, async (_req, res, next) => {
  try {
    const result = await verifyAllMerchantChains();
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
