import express from 'express';
import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import HashChainService from '../services/HashChainService.js';
import AuditService from '../services/AuditService.js';
import {
  createTxSchema,
  createTransactionFromPayload,
  txSelect as baseSelect,
  apiTypeToDbType,
} from '../services/transactionWrite.js';

const router = express.Router();
const prisma = new PrismaClient();

const protectedRoles = roleMiddleware(['MERCHANT', 'ACCOUNTANT', 'COMPTABLE']);

const PRISMA_TX_TYPES = new Set([
  'VENTE',
  'DEPENSE',
  'RETRAIT',
  'DEPOT',
  'REMBOURSEMENT',
  'ANNULATION',
  'PURCHASE',
  'STOCK_ADJUSTMENT',
]);

const queryTypeToDb = (raw) => {
  const u = String(raw).toUpperCase();
  if (u === 'SALE' || u === 'EXPENSE' || u === 'PURCHASE') return apiTypeToDbType(u);
  return PRISMA_TX_TYPES.has(u) ? u : null;
};

router.get('/hash-chain/verify', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    const result = await HashChainService.verifyChain(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/stats', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    const period = Math.min(365, Math.max(1, parseInt(req.query.period, 10) || 30));
    const since = new Date();
    since.setDate(since.getDate() - period);
    const rows = await prisma.transaction.findMany({
      where: { userID: req.user.id, syncedAt: { gte: since } },
      select: { type: true, amount: true },
    });
    const stats = rows.reduce(
      (acc, r) => {
        if (r.type === 'VENTE') acc.sales += r.amount;
        if (r.type === 'DEPENSE' || r.type === 'ANNULATION') acc.expenses += Math.abs(r.amount);
        return acc;
      },
      { sales: 0, expenses: 0 }
    );
    res.json({
      period_days: period,
      total_sales: stats.sales,
      total_expenses: stats.expenses,
      net_balance: stats.sales - stats.expenses,
      transaction_count: rows.length,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    const { error, value } = createTxSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });
    }

    const existing = await prisma.transaction.findUnique({
      where: { clientUUID: value.client_uuid },
      select: baseSelect,
    });
    if (existing) {
      return res.status(200).json({ data: existing, meta: { already_exists: true } });
    }

    if (!apiTypeToDbType(value.type)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid type' });
    }

    if (value.created_offline_at) {
      const hours = Math.abs(Date.now() - new Date(value.created_offline_at).getTime()) / 36e5;
      if (hours > 48) {
        console.warn(`Offline timestamp drift > 48h for user ${req.user.id}`);
      }
    }

    if (!req.user.merchantId) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Un compte marchand est requis pour enregistrer une transaction',
      });
    }

    let result;
    try {
      result = await prisma.$transaction(async (tx) =>
        createTransactionFromPayload(tx, {
          userId: req.user.id,
          merchantId: req.user.merchantId,
          value,
          auditAction: 'SALE_CREATE',
          ip_address: req.ip,
          device_uuid: req.headers['x-device-uuid'] || null,
        })
      );
    } catch (err) {
      if (err.statusCode === 400) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: err.message });
      }
      throw err;
    }

    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/reversal', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    const originalId = req.body.original_transaction_id;
    if (!originalId) {
      return res
        .status(400)
        .json({ error: 'VALIDATION_ERROR', message: 'original_transaction_id requis' });
    }

    const original = await prisma.transaction.findFirst({
      where: { id: originalId, userID: req.user.id },
      select: baseSelect,
    });
    if (!original) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Transaction originale introuvable' });
    }

    if (!req.user.merchantId) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Un compte marchand est requis pour une annulation',
      });
    }

    const syncedAt = new Date();
    const reversalId = crypto.randomUUID();
    const previousHash = await HashChainService.getLastHash(req.user.id);
    const hashChain = HashChainService.compute(
      {
        id: reversalId,
        user_id: req.user.id,
        amount: -Math.abs(original.amount),
        type: 'ANNULATION',
        synced_at: syncedAt.toISOString(),
      },
      previousHash
    );

    const reversal = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          id: reversalId,
          merchantID: req.user.merchantId,
          userID: req.user.id,
          type: 'ANNULATION',
          amount: -Math.abs(original.amount),
          description: `Reversal of ${original.id}`,
          originalTransactionID: original.id,
          reversalOfId: original.id,
          syncedAt,
          prevHash: previousHash,
          hashChain,
        },
        select: baseSelect,
      });
      await AuditService.log(
        {
          user_id: req.user.id,
          action: 'REVERSAL_CREATE',
          entity_id: created.id,
          ip_address: req.ip,
          device_uuid: req.headers['x-device-uuid'] || null,
          old_value: original,
          new_value: created,
        },
        tx
      );
      return created;
    });

    res.status(201).json({ data: reversal });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    const keys = Object.keys(req.body || {});
    const allowed = new Set(['description', 'receipt_url']);
    const forbidden = ['amount', 'type', 'product_id'].filter((k) => keys.includes(k));
    if (forbidden.length) {
      return res.status(400).json({
        error: 'IMMUTABLE_FIELDS',
        message: 'amount, type, product_id ne peuvent pas être modifiés',
      });
    }
    if (keys.some((k) => !allowed.has(k))) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Champs non autorisés' });
    }

    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userID: req.user.id },
      select: baseSelect,
    });
    if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });

    const updated = await prisma.transaction.update({
      where: { id: existing.id },
      data: {
        description: req.body.description ?? existing.description,
        receiptURL: req.body.receipt_url ?? existing.receiptURL,
      },
      select: baseSelect,
    });

    await AuditService.log(
      {
        user_id: req.user.id,
        action: 'UPDATE_TRANSACTION_METADATA',
        entity_id: updated.id,
        ip_address: req.ip,
        device_uuid: req.headers['x-device-uuid'] || null,
        old_value: existing,
        new_value: updated,
      },
      prisma
    );

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, protectedRoles, (_req, res) => {
  return res.status(405).json({
    error: 'METHOD_NOT_ALLOWED',
    message: 'Les transactions ne peuvent pas être supprimées. Créez une écriture d annulation.',
  });
});

router.get('/export', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    const { format = 'csv', from, to } = req.query;
    if (format !== 'csv') {
      return res.status(400).json({ error: 'INVALID_FORMAT', message: 'format=csv uniquement' });
    }
    const where = { userID: req.user.id };
    if (from || to) {
      where.syncedAt = {};
      if (from) where.syncedAt.gte = new Date(from);
      if (to) where.syncedAt.lte = new Date(to);
    }
    const rows = await prisma.transaction.findMany({
      where,
      orderBy: [{ syncedAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        syncedAt: true,
        hashChain: true,
      },
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.write('id,type,amount,description,synced_at,hash_chain\n');
    for (const r of rows) {
      const desc = JSON.stringify(r.description || '');
      res.write(
        `${r.id},${r.type},${r.amount},${desc},${r.syncedAt?.toISOString() || ''},${r.hashChain || ''}\n`
      );
    }
    res.end();
  } catch (err) {
    next(err);
  }
});

router.get('/', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.per_page, 10) || 20));
    const where = { userID: req.user.id };

    if (req.query.date_from || req.query.date_to) {
      where.syncedAt = {};
      if (req.query.date_from) where.syncedAt.gte = new Date(req.query.date_from);
      if (req.query.date_to) where.syncedAt.lte = new Date(req.query.date_to);
    }
    if (req.query.type) {
      const t = queryTypeToDb(req.query.type);
      if (t) where.type = t;
    }
    if (req.query.product_id) where.productId = String(req.query.product_id);
    if (req.query.amount_min || req.query.amount_max) {
      where.amount = {};
      if (req.query.amount_min) where.amount.gte = Number(req.query.amount_min);
      if (req.query.amount_max) where.amount.lte = Number(req.query.amount_max);
    }

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: [{ syncedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * perPage,
        take: perPage,
        select: baseSelect,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      data: items,
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    const tx = await prisma.transaction.findFirst({
      where: { id: req.params.id, userID: req.user.id },
      select: baseSelect,
    });
    if (!tx) return res.status(404).json({ error: 'NOT_FOUND' });
    res.json({ data: tx });
  } catch (err) {
    next(err);
  }
});

export default router;
