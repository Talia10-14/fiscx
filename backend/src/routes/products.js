import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import StockService from '../services/StockService.js';
import { createStockAdjustmentTransaction, txSelect } from '../services/transactionWrite.js';
import AuditService from '../services/AuditService.js';

const router = express.Router();
const prisma = new PrismaClient();
const protectedRoles = roleMiddleware(['MERCHANT', 'ACCOUNTANT', 'COMPTABLE']);

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  unit: Joi.string().optional().allow('', null),
  cost_price: Joi.number().optional(),
  sale_price: Joi.number().required(),
  alert_threshold: Joi.number().optional(),
});

const adjustmentSchema = Joi.object({
  quantity: Joi.number().integer().min(-1e6).max(1e6).required().invalid(0),
  client_uuid: Joi.string().guid({ version: 'uuidv4' }).required(),
  description: Joi.string().optional().allow('', null),
});

function requireMerchant(req, res) {
  if (!req.user.merchantId) {
    res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Un compte marchand est requis',
    });
    return false;
  }
  return true;
}

const movementSelect = {
  id: true,
  type: true,
  amount: true,
  quantity: true,
  description: true,
  syncedAt: true,
  clientUUID: true,
};

router.get('/low-stock', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    if (!requireMerchant(req, res)) return;
    const products = await prisma.product.findMany({
      where: { merchantID: req.user.merchantId },
      orderBy: { name: 'asc' },
    });
    const out = [];
    for (const p of products) {
      const { currentStock } = await StockService.calculateStock(req.user.id, p.id);
      const threshold = p.alertThreshold != null ? p.alertThreshold : p.minAlertLevel;
      if (threshold != null && currentStock < threshold) {
        out.push({
          ...p,
          calculatedStock: currentStock,
          threshold,
        });
      }
    }
    res.json({ data: out });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/stock', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    if (!requireMerchant(req, res)) return;
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, merchantID: req.user.merchantId },
    });
    if (!product) return res.status(404).json({ error: 'NOT_FOUND' });

    const stock = await StockService.calculateStock(req.user.id, product.id);
    const movements = await prisma.transaction.findMany({
      where: { userID: req.user.id, productId: product.id },
      orderBy: [{ syncedAt: 'desc' }, { id: 'desc' }],
      take: 20,
      select: movementSelect,
    });

    await StockService.checkAlerts(req.user.id, product.id, stock.currentStock);

    res.json({ data: { product, stock, movements } });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/adjustment', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    if (!requireMerchant(req, res)) return;
    const { error, value } = adjustmentSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });
    }

    const product = await prisma.product.findFirst({
      where: { id: req.params.id, merchantID: req.user.merchantId },
    });
    if (!product) return res.status(404).json({ error: 'NOT_FOUND' });

    const existing = await prisma.transaction.findUnique({
      where: { clientUUID: value.client_uuid },
      select: txSelect,
    });
    if (existing) {
      return res.status(200).json({ data: existing, meta: { already_exists: true } });
    }

    const created = await prisma.$transaction(async (tx) => {
      const row = await createStockAdjustmentTransaction(tx, {
        userId: req.user.id,
        merchantId: req.user.merchantId,
        productId: product.id,
        quantitySigned: value.quantity,
        client_uuid: value.client_uuid,
        description: value.description || null,
        ip_address: req.ip,
        device_uuid: req.headers['x-device-uuid'] || null,
      });
      return row;
    });

    const { currentStock } = await StockService.calculateStock(req.user.id, product.id);
    await StockService.checkAlerts(req.user.id, product.id, currentStock);

    res.status(201).json({ data: created });
  } catch (err) {
    if (err.statusCode === 400 || err.statusCode === 404) {
      return res.status(err.statusCode).json({ error: 'VALIDATION_ERROR', message: err.message });
    }
    next(err);
  }
});

router.get('/', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    if (!requireMerchant(req, res)) return;
    const products = await prisma.product.findMany({
      where: { merchantID: req.user.merchantId },
      orderBy: { name: 'asc' },
    });
    const data = [];
    for (const p of products) {
      const stock = await StockService.calculateStock(req.user.id, p.id);
      await StockService.checkAlerts(req.user.id, p.id, stock.currentStock);
      data.push({ ...p, stock });
    }
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, protectedRoles, async (req, res, next) => {
  try {
    if (!requireMerchant(req, res)) return;
    const { error, value } = createProductSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details });
    }

    const salePrice = Number(value.sale_price);
    const costPrice = value.cost_price != null ? Number(value.cost_price) : null;
    const product = await prisma.product.create({
      data: {
        merchantID: req.user.merchantId,
        name: value.name,
        unit: value.unit || null,
        costPrice,
        salePrice,
        unitPrice: salePrice,
        quantity: 0,
        alertThreshold: value.alert_threshold != null ? Number(value.alert_threshold) : null,
        minAlertLevel:
          value.alert_threshold != null ? Math.max(0, Math.floor(Number(value.alert_threshold))) : 5,
      },
    });

    await AuditService.log({
      user_id: req.user.id,
      action: 'PRODUCT_CREATE',
      entity_id: product.id,
      ip_address: req.ip,
      device_uuid: req.headers['x-device-uuid'] || null,
      old_value: null,
      new_value: { id: product.id, name: product.name },
    });

    const stock = await StockService.calculateStock(req.user.id, product.id);
    res.status(201).json({ data: { ...product, stock } });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'CONFLICT', message: 'SKU ou contrainte unique' });
    }
    next(e);
  }
});

export default router;
