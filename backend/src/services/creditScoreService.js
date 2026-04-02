import { PrismaClient } from '@prisma/client';
import { computeNetTotals } from './transactionRollups.js';

const prisma = new PrismaClient();

const W_CA = 0.3;
const W_REG = 0.25;
const W_REV = 0.2;
const W_TEN = 0.15;
const W_DIV = 0.1;

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

/**
 * Score 0–1000 — grille CDC §3.4.1 (poids explicables)
 */
export async function computeCreditScoreBreakdown(merchantId) {
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: { registrationDate: true, creditScore: true },
  });
  if (!merchant) return null;

  const since90 = new Date();
  since90.setDate(since90.getDate() - 90);

  const tx = await prisma.transaction.findMany({
    where: { merchantID: merchantId, createdAt: { gte: since90 } },
    select: {
      id: true,
      type: true,
      amount: true,
      category: true,
      status: true,
      reversalOfId: true,
      createdAt: true,
    },
  });

  const { sales, annulationCount, totalCount } = computeNetTotals(tx);
  const avgMonthlyCA = sales / 3 || 0;
  const caPoints = clamp01(avgMonthlyCA / 2_000_000) * (W_CA * 1000);

  const daysWithActivity = new Set(
    tx.filter((t) => t.status !== 'CANCELLED' && t.type !== 'ANNULATION').map((t) => t.createdAt.toISOString().slice(0, 10))
  ).size;
  const regPoints = clamp01(daysWithActivity / 60) * (W_REG * 1000);

  const nonAnnul = tx.filter((t) => t.type !== 'ANNULATION' && t.status !== 'CANCELLED').length;
  const revRatio = nonAnnul > 0 ? annulationCount / nonAnnul : 0;
  const revPoints = (1 - clamp01(revRatio * 5)) * (W_REV * 1000);

  const daysActive = Math.max(
    0,
    (Date.now() - new Date(merchant.registrationDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const tenPoints = clamp01(daysActive / 365) * (W_TEN * 1000);

  const categories = new Set(
    tx.filter((t) => t.category && t.status !== 'CANCELLED').map((t) => t.category)
  );
  const divPoints = clamp01(categories.size / 8) * (W_DIV * 1000);

  const breakdown = [
    {
      criterion: 'CA_MOYEN_TRIM',
      label: 'Chiffre d’affaires moyen (90 j)',
      weightPercent: 30,
      points: Math.round(caPoints),
      maxPoints: 300,
      hint:
        avgMonthlyCA < 500_000
          ? 'Augmentez vos ventes enregistrées pour renforcer votre score.'
          : 'Bon niveau de CA enregistré.',
    },
    {
      criterion: 'REGULARITE',
      label: 'Régularité des saisies',
      weightPercent: 25,
      points: Math.round(regPoints),
      maxPoints: 250,
      hint:
        daysWithActivity < 20
          ? 'Saisissez vos opérations plus souvent (idéalement chaque jour ouvré).'
          : 'Rythme de saisie satisfaisant.',
    },
    {
      criterion: 'ANNULATIONS',
      label: 'Taux d’annulations (risque fraude)',
      weightPercent: 20,
      points: Math.round(revPoints),
      maxPoints: 200,
      hint:
        revRatio > 0.15
          ? 'Un taux d’annulations élevé pénalise le score — vérifiez avant de valider.'
          : 'Peu d’annulations : positif pour la crédibilité.',
    },
    {
      criterion: 'ANCIENNETE',
      label: 'Ancienneté sur la plateforme',
      weightPercent: 15,
      points: Math.round(tenPoints),
      maxPoints: 150,
      hint: daysActive < 90 ? 'Continuez à utiliser FiscX pour gagner en fiabilité.' : 'Historique établi.',
    },
    {
      criterion: 'DIVERSITE',
      label: 'Diversité des catégories',
      weightPercent: 10,
      points: Math.round(divPoints),
      maxPoints: 100,
      hint: categories.size < 3 ? 'Diversifiez vos catégories (loyer, stock, transport…).' : 'Bonnes catégories renseignées.',
    },
  ];

  const score = Math.min(1000, breakdown.reduce((s, b) => s + b.points, 0));

  return {
    score,
    breakdown,
    transparencyNote:
      'Le score est calculé à partir de vos données enregistrées — aucune donnée démographique n’est utilisée (CDC §3.4.1).',
  };
}

export async function persistScoreSnapshot(merchantId, result) {
  await prisma.merchant.update({
    where: { id: merchantId },
    data: { creditScore: result.score, scoreLastUpdated: new Date() },
  });

  const scoring = await prisma.creditScore.create({
    data: {
      merchantID: merchantId,
      score: result.score,
      breakdown: {
        create: result.breakdown.map((b) => ({
          criterion: b.criterion,
          weight: b.weightPercent,
          points: b.points,
          maxPoints: b.maxPoints,
        })),
      },
    },
    include: { breakdown: true },
  });
  return scoring;
}
