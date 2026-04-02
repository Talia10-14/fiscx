/**
 * Agrégats CDC §3.1.2 : pas de suppression — ANNULATION compense l’écriture référencée.
 */
export function computeNetTotals(transactions) {
  const active = transactions.filter((t) => t.status !== 'CANCELLED');
  const byId = new Map(active.map((t) => [t.id, t]));

  let sales = 0;
  let expenses = 0;
  for (const t of active) {
    if (t.type === 'ANNULATION') continue;
    if (t.type === 'VENTE') sales += t.amount;
    else if (t.type === 'DEPENSE') expenses += t.amount;
    else if (t.type === 'RETRAIT') expenses += t.amount;
  }

  let annulationCount = 0;
  for (const t of active) {
    if (t.type !== 'ANNULATION' || !t.reversalOfId) continue;
    annulationCount += 1;
    const orig = byId.get(t.reversalOfId);
    if (!orig || orig.status === 'CANCELLED') continue;
    if (orig.type === 'VENTE') sales -= orig.amount;
    else if (orig.type === 'DEPENSE') expenses -= orig.amount;
    else if (orig.type === 'RETRAIT') expenses -= orig.amount;
  }

  return {
    sales,
    expenses,
    net: sales - expenses,
    annulationCount,
    totalCount: active.length,
  };
}
