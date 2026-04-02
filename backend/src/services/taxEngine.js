import { PrismaClient } from '@prisma/client';
import { computeNetTotals } from './transactionRollups.js';

const prisma = new PrismaClient();

const BJ = 'BJ';

/**
 * CA roulant sur `days` jours (net annulations) à partir des ventes.
 */
export async function rollingAnnualCAFromVentas(merchantId, days = 365) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await prisma.transaction.findMany({
    where: { merchantID: merchantId, createdAt: { gte: since } },
    select: {
      id: true,
      type: true,
      amount: true,
      status: true,
      reversalOfId: true,
      createdAt: true,
    },
  });
  const { sales } = computeNetTotals(rows);
  // Extrapolation grossière sur 365 jours si fenêtre < 365
  const factor = 365 / days;
  return sales * factor;
}

function pickRule(rules, annualCA) {
  for (const r of rules) {
    const min = r.minAnnualCA ?? 0;
    const max = r.maxAnnualCA;
    if (annualCA < min) continue;
    if (max != null && annualCA >= max) continue;
    return r;
  }
  return rules[0] ?? null;
}

/**
 * Résumé fiscal pour le commerçant (CDC §3.3)
 */
export async function buildTaxSummaryForMerchant(merchantId, year = new Date().getFullYear()) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: { taxRegime: true, annualCAEstimate: true, monthlyCAAvg: true },
  });
  if (!merchant) return null;

  const rules = await prisma.taxRule.findMany({
    where: { countryCode: BJ, year, regime: merchant.taxRegime, active: true },
  });

  const rolling = await rollingAnnualCAFromVentas(merchantId, 365);
  const referenceCA =
    rolling > 0
      ? rolling
      : (merchant.annualCAEstimate ?? (merchant.monthlyCAAvg ?? 0) * 12);

  const rule = rules.length ? pickRule(rules, referenceCA) : null;

  const tsRate = rule?.syntheticRatePercent ?? 3;
  const estimatedTaxTS = merchant.taxRegime === 'TS' ? (referenceCA * tsRate) / 100 : null;

  const nextThreshold = rules
    .filter((r) => r.maxAnnualCA != null && referenceCA < r.maxAnnualCA)
    .sort((a, b) => (a.maxAnnualCA ?? 0) - (b.maxAnnualCA ?? 0))[0];

  const approachingRegimeChange =
    nextThreshold?.maxAnnualCA != null &&
    referenceCA >= (nextThreshold.maxAnnualCA - 0.1 * (nextThreshold.maxAnnualCA - (nextThreshold.minAnnualCA ?? 0)));

  return {
    countryCode: BJ,
    year,
    regime: merchant.taxRegime,
    referenceAnnualCA: Math.round(referenceCA),
    appliedRule: rule
      ? {
          id: rule.id,
          label: rule.label,
          syntheticRatePercent: rule.syntheticRatePercent,
          rrsRatePercent: rule.rrsRatePercent,
          notes: rule.notes,
        }
      : null,
    estimatedTaxSynthetic: estimatedTaxTS != null ? Math.round(estimatedTaxTS) : null,
    regimeChangeWarning: approachingRegimeChange
      ? {
          message:
            'Vous approchez du seuil de changement de régime fiscal — vérifiez votre CA annuel.',
          nextMaxCA: nextThreshold?.maxAnnualCA,
        }
      : null,
  };
}
