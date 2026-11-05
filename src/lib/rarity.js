/** Product thresholds, not official heritage classifications. */
export const rarityBands = Object.freeze([
  { id: 'common', minimum: 250000, label: 'Común' },
  { id: 'uncommon', minimum: 50000, label: 'Poco común' },
  { id: 'rare', minimum: 10000, label: 'Rara' },
  { id: 'epic', minimum: 0, label: 'Épica' },
]);

export function isValidVisitation(evidence) {
  if (!evidence || !Number.isSafeInteger(evidence.annualVisitors) || evidence.annualVisitors < 0 ||
      !Number.isInteger(evidence.year) || evidence.year < 2024 || evidence.year > 2025 ||
      evidence.period !== 'calendar-year' || evidence.scope !== 'admissions' ||
      typeof evidence.sourceUrl !== 'string' || typeof evidence.title !== 'string' || !evidence.title.trim()) return false;
  try { return new URL(evidence.sourceUrl).protocol === 'https:'; } catch { return false; }
}

export function classifyRarity(evidence) {
  if (!isValidVisitation(evidence)) return 'unranked';
  return rarityBands.find((band) => evidence.annualVisitors >= band.minimum).id;
}

export function rarityReason(evidence) {
  if (!isValidVisitation(evidence)) return 'Sin una cifra anual de visitas verificada y comparable. No se infiere rareza por acceso, reseñas ni ausencia de datos.';
  return `${new Intl.NumberFormat('es-ES').format(evidence.annualVisitors)} visitas registradas en ${evidence.year}. Menos visitas anuales implican mayor rareza. La cifra corresponde al recinto, no a todas las personas que pasan por su exterior.`;
}
