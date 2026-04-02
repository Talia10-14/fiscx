import { createClient } from 'redis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let redisClient;
let redisConnectAttempted;

async function getPublisher() {
  if (redisConnectAttempted && !redisClient?.isOpen) return null;
  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    redisClient.on('error', () => {});
  }
  if (!redisClient.isOpen) {
    redisConnectAttempted = true;
    try {
      await redisClient.connect();
    } catch {
      return null;
    }
  }
  return redisClient;
}

export default class StockService {
  /**
   * Stock dérivé des transactions uniquement (pas la colonne Product.quantity).
   * PURCHASE +quantity, VENTE −quantity, STOCK_ADJUSTMENT ±quantity (signe conservé).
   */
  static async calculateStock(userId, productId) {
    const rows = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userID: userId,
        productId,
        quantity: { not: null },
      },
      _sum: { quantity: true },
    });

    let purchaseSum = 0;
    let saleSum = 0;
    let adjustmentSum = 0;
    for (const r of rows) {
      const q = r._sum.quantity ?? 0;
      if (r.type === 'PURCHASE') purchaseSum += q;
      else if (r.type === 'VENTE') saleSum += q;
      else if (r.type === 'STOCK_ADJUSTMENT') adjustmentSum += q;
    }

    const currentStock = purchaseSum - saleSum + adjustmentSum;
    return {
      productId,
      currentStock,
      lastUpdated: new Date().toISOString(),
    };
  }

  static async checkAlerts(userId, productId, currentStock) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        merchant: { userID: userId },
      },
      select: { alertThreshold: true, minAlertLevel: true },
    });
    if (!product) return;

    const threshold =
      product.alertThreshold != null ? product.alertThreshold : product.minAlertLevel;
    if (threshold == null) return;

    if (currentStock < threshold) {
      const channel = `stock:alert:${userId}:${productId}`;
      const payload = JSON.stringify({
        userId,
        productId,
        currentStock,
        threshold,
        at: new Date().toISOString(),
      });
      const r = await getPublisher();
      if (r?.isOpen) {
        await r.publish(channel, payload).catch(() => {});
      }
    }
  }
}
