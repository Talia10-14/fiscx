import crypto from 'crypto';

const GENESIS = 'GENESIS';

function canonicalize(tx) {
  return [
    tx.id,
    tx.merchantID,
    tx.userID,
    tx.type,
    String(tx.amount),
    tx.currency || 'XOF',
    tx.category || '',
    tx.description || '',
    tx.status || '',
    tx.reversalOfId || '',
    tx.productId || '',
    tx.quantity == null ? '' : String(tx.quantity),
    tx.unitPrice == null ? '' : String(tx.unitPrice),
    tx.createdAt instanceof Date ? tx.createdAt.toISOString() : String(tx.createdAt),
  ].join('|');
}

export function computeHash(prevHash, tx) {
  const payload = `${prevHash || GENESIS}|${canonicalize(tx)}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export async function appendHashForTransaction(prismaTx, merchantId, txId) {
  const current = await prismaTx.transaction.findUnique({ where: { id: txId } });
  if (!current) return null;

  const previous = await prismaTx.transaction.findFirst({
    where: {
      merchantID: merchantId,
      id: { not: txId },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { hashChain: true, id: true, createdAt: true },
  });

  const prevHash = previous?.hashChain || GENESIS;
  const hash = computeHash(prevHash, current);

  return prismaTx.transaction.update({
    where: { id: txId },
    data: { prevHash, hashChain: hash },
  });
}

export function verifyChainRows(rows) {
  let expectedPrev = GENESIS;
  for (const row of rows) {
    const calculated = computeHash(expectedPrev, row);
    if (row.prevHash !== expectedPrev || row.hashChain !== calculated) {
      return {
        valid: false,
        brokenAtId: row.id,
        expectedPrevHash: expectedPrev,
        actualPrevHash: row.prevHash,
        expectedHash: calculated,
        actualHash: row.hashChain,
      };
    }
    expectedPrev = row.hashChain;
  }
  return { valid: true, checked: rows.length, lastHash: expectedPrev };
}
