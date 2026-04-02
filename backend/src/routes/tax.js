import express from 'express';
import { authenticate, requireMerchant } from '../middleware/auth.js';
import { buildTaxSummaryForMerchant } from '../services/taxEngine.js';

const router = express.Router();
const merchantAuth = [authenticate, requireMerchant];

router.get('/summary', ...merchantAuth, async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const summary = await buildTaxSummaryForMerchant(req.user.merchantId, year);
    if (!summary) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }
    res.json({ success: true, ...summary });
  } catch (e) {
    next(e);
  }
});

router.post('/declare', ...merchantAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    message: 'Déclaration fiscale électronique — phase régulateur (CDC §3.3.2)',
  });
});

export default router;
