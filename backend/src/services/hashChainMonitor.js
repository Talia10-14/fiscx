import { PrismaClient } from '@prisma/client';
import HashChainService from './HashChainService.js';

const prisma = new PrismaClient();

let lastReport = null;
let running = false;

export async function verifyAllMerchantChains() {
  if (running) {
    return {
      success: false,
      message: 'Verifier already running',
      running: true,
      lastReport,
    };
  }
  running = true;
  const startedAt = new Date().toISOString();
  try {
    const merchants = await prisma.merchant.findMany({
      select: { id: true, userID: true },
      orderBy: { id: 'asc' },
    });

    const broken = [];
    let checkedChains = 0;
    let checkedRows = 0;

    for (const m of merchants) {
      const rowCount = await prisma.transaction.count({ where: { merchantID: m.id } });
      if (!rowCount) continue;
      checkedChains += 1;
      checkedRows += rowCount;
      const result = await HashChainService.verifyChain(m.userID);
      if (!result.valid) {
        broken.push({
          merchantID: m.id,
          userID: m.userID,
          brokenAt: result.brokenAt,
          totalChecked: result.totalChecked,
        });
      }
    }

    lastReport = {
      success: true,
      startedAt,
      finishedAt: new Date().toISOString(),
      checkedChains,
      checkedRows,
      brokenCount: broken.length,
      broken,
    };
    return lastReport;
  } catch (error) {
    lastReport = {
      success: false,
      startedAt,
      finishedAt: new Date().toISOString(),
      error: error.message,
    };
    return lastReport;
  } finally {
    running = false;
  }
}

export function getLastHashChainReport() {
  return {
    running,
    lastReport,
  };
}
