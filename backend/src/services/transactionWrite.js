import crypto from 'node:crypto';
import Joi from 'joi';
import HashChainService from './HashChainService.js';
import AuditService from './AuditService.js';

export const createTxSchema = Joi.object({
  type: Joi.string().valid('SALE', 'EXPENSE', 'PURCHASE').required(),
  amount: Joi.number().greater(0).required(),
  client_uuid: Joi.string().guid({ version: 'uuidv4' }).required(),
  product_id: Joi.string().optional().allow(null, ''),
  quantity: Joi.number().integer().optional(),
  created_offline_at: Joi.date().iso().optional(),
  description: Joi.string().optional().allow('', null),
  receipt_url: Joi.string().uri().optional(),
});

export const txSelect = {
  id: true,
  clientUUID: true,
  userID: true,
  type: true,
  amount: true,
  description: true,
  receiptURL: true,
  productId: true,
  quantity: true,
  syncedAt: true,
  hashChain: true,
  originalTransactionID: true,
  createdOfflineAt: true,
  createdAt: true,
};

export function apiTypeToDbType(type) {
  if (type === 'SALE') return 'VENTE';
  if (type === 'EXPENSE') return 'DEPENSE';
  if (type === 'PURCHASE') return 'PURCHASE';
  return null;
}

/**
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {object} opts
 * @param {string|null|undefined} opts.previousHash — si défini (y compris null), n’appelle pas getLastHash (chaînage batch)
 */
export async function insertChainedTransaction(tx, opts) {
  const {
    userId,
    merchantId,
    dbType,
    amount,
    quantity,
    productId,
    clientUUID,
    description,
    receiptURL,
    createdOfflineAt,
    auditAction,
    previousHash: explicitPreviousHash,
    ip_address = null,
    device_uuid = null,
  } = opts;

  const previousHash =
    explicitPreviousHash !== undefined
      ? explicitPreviousHash
      : await HashChainService.getLastHash(userId);

  const syncedAt = new Date();
  const transactionId = crypto.randomUUID();

  const hashChain = HashChainService.compute(
    {
      id: transactionId,
      user_id: userId,
      amount,
      type: dbType,
      synced_at: syncedAt.toISOString(),
    },
    previousHash
  );

  const created = await tx.transaction.create({
    data: {
      id: transactionId,
      clientUUID,
      merchantID: merchantId,
      userID: userId,
      type: dbType,
      amount,
      description: description ?? null,
      receiptURL: receiptURL ?? null,
      productId: productId ?? null,
      quantity: quantity ?? null,
      createdOfflineAt: createdOfflineAt ? new Date(createdOfflineAt) : null,
      syncedAt,
      prevHash: previousHash,
      hashChain,
    },
    select: txSelect,
  });

  await AuditService.log(
    {
      user_id: userId,
      action: auditAction,
      entity_id: created.id,
      ip_address,
      device_uuid,
      old_value: null,
      new_value: created,
    },
    tx
  );

  return created;
}

export async function createTransactionFromPayload(tx, opts) {
  const { userId, merchantId, value, auditAction = 'SALE_CREATE', previousHash, ip_address, device_uuid } =
    opts;
  const dbType = apiTypeToDbType(value.type);
  if (!dbType) {
    const err = new Error('Invalid transaction type');
    err.statusCode = 400;
    throw err;
  }
  return insertChainedTransaction(tx, {
    userId,
    merchantId,
    dbType,
    amount: value.amount,
    quantity: value.quantity ?? null,
    productId: value.product_id || null,
    clientUUID: value.client_uuid,
    description: value.description || null,
    receiptURL: value.receipt_url || null,
    createdOfflineAt: value.created_offline_at || null,
    auditAction,
    previousHash,
    ip_address,
    device_uuid,
  });
}

export async function createStockAdjustmentTransaction(tx, opts) {
  const {
    userId,
    merchantId,
    productId,
    quantitySigned,
    client_uuid,
    description,
    previousHash,
    ip_address = null,
    device_uuid = null,
  } = opts;

  const product = await tx.product.findFirst({
    where: { id: productId, merchantID: merchantId },
  });
  if (!product) {
    const err = new Error('Produit introuvable');
    err.statusCode = 404;
    throw err;
  }
  if (!quantitySigned || quantitySigned === 0) {
    const err = new Error('quantity doit être un entier non nul');
    err.statusCode = 400;
    throw err;
  }

  const unit = product.salePrice ?? product.unitPrice ?? product.costPrice ?? 1;
  const amount = Math.max(0.01, Math.abs(quantitySigned) * Number(unit));

  return insertChainedTransaction(tx, {
    userId,
    merchantId,
    dbType: 'STOCK_ADJUSTMENT',
    amount,
    quantity: quantitySigned,
    productId,
    clientUUID: client_uuid,
    description: description ?? `Ajustement stock (${quantitySigned > 0 ? '+' : ''}${quantitySigned})`,
    receiptURL: null,
    createdOfflineAt: null,
    auditAction: 'STOCK_ADJUSTMENT_CREATE',
    previousHash,
    ip_address,
    device_uuid,
  });
}
