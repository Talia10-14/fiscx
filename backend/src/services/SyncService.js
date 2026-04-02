import { PrismaClient } from '@prisma/client';
import HashChainService from './HashChainService.js';
import { createTxSchema, createTransactionFromPayload } from './transactionWrite.js';

const prisma = new PrismaClient();

export default class SyncService {
  /**
   * @param {string} userId
   * @param {string|null} merchantId
   * @param {object[]} transactions
   */
  static async processBatch(userId, merchantId, transactions, { ip_address = null, device_uuid = null } = {}) {
    const synced = [];
    const skipped = [];
    const errors = [];
    const warnings = [];

    if (!transactions.length) {
      return { synced, skipped, errors, warnings };
    }
    if (!merchantId) {
      return {
        synced,
        skipped,
        errors: [{ message: 'merchant requis pour la synchronisation' }],
        warnings,
      };
    }

    const toProcess = [];
    for (let i = 0; i < transactions.length; i++) {
      const raw = transactions[i];
      const { error, value } = createTxSchema.validate(raw, { abortEarly: false, stripUnknown: true });
      if (error) {
        errors.push({
          index: i,
          client_uuid: raw?.client_uuid ?? null,
          message: error.details.map((d) => d.message).join('; '),
        });
        continue;
      }

      if (value.created_offline_at) {
        const hours = Math.abs(Date.now() - new Date(value.created_offline_at).getTime()) / 36e5;
        if (hours > 48) {
          console.warn(`Sync batch: offline timestamp drift > 48h for user ${userId}, client_uuid=${value.client_uuid}`);
          warnings.push({ client_uuid: value.client_uuid, reason: 'OFFLINE_DRIFT_GT_48H' });
        }
      }

      const existing = await prisma.transaction.findUnique({
        where: { clientUUID: value.client_uuid },
        select: { id: true },
      });
      if (existing) {
        skipped.push(value.client_uuid);
        continue;
      }

      toProcess.push({ index: i, value });
    }

    if (!toProcess.length) {
      return { synced, skipped, errors, warnings };
    }

    try {
      await prisma.$transaction(async (tx) => {
        let previousHash = await HashChainService.getLastHash(userId);
        for (const { value } of toProcess) {
          const created = await createTransactionFromPayload(tx, {
            userId,
            merchantId,
            value,
            auditAction: 'SYNC_TX_CREATE',
            previousHash,
            ip_address,
            device_uuid,
          });
          previousHash = created.hashChain;
          synced.push(created.id);
        }
      });
    } catch (e) {
      errors.push({ message: e.message || 'Erreur transaction batch' });
    }

    return { synced, skipped, errors, warnings };
  }
}
