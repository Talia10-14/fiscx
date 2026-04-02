import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class HashChainService {
  static compute(txData, previousHash) {
    const payload = JSON.stringify({
      id: txData.id,
      user_id: txData.user_id,
      amount: txData.amount,
      type: txData.type,
      synced_at: txData.synced_at,
    });
    return crypto
      .createHash('sha256')
      .update(payload + (previousHash || ''))
      .digest('hex');
  }

  static async getLastHash(userId) {
    const transaction = await prisma.transaction.findFirst({
      where: { userID: userId },
      orderBy: [{ syncedAt: 'desc' }, { id: 'desc' }],
      select: { hashChain: true },
    });
    return transaction?.hashChain || null;
  }

  static async verifyChain(userId) {
    const transactions = await prisma.transaction.findMany({
      where: { userID: userId },
      orderBy: [{ syncedAt: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        userID: true,
        amount: true,
        type: true,
        syncedAt: true,
        hashChain: true,
      },
    });

    let prev = null;
    for (const tx of transactions) {
      const calculated = HashChainService.compute(
        {
          id: tx.id,
          user_id: tx.userID,
          amount: tx.amount,
          type: tx.type,
          synced_at: tx.syncedAt?.toISOString?.() || null,
        },
        prev
      );
      if (tx.hashChain !== calculated) {
        return { valid: false, brokenAt: tx.id, totalChecked: transactions.length };
      }
      prev = tx.hashChain;
    }
    return { valid: true, brokenAt: null, totalChecked: transactions.length };
  }
}
