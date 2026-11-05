export const ENGINE_ID = 'orb-homography-v1';
export const DEFAULT_THRESHOLDS = Object.freeze({ minMatches: 28, minInliers: 22, minInlierRatio: 0.65, minCoverage: 0.12, minMargin: 0.15, ratioTest: 0.7 });

export function evaluateMatches(results, thresholds = DEFAULT_THRESHOLDS) {
  const eligible = results.filter((result) => result && typeof result.placeId === 'string' &&
    [result.matches, result.inliers, result.inlierRatio, result.coverage].every(Number.isFinite) &&
    result.inliers <= result.matches && result.inlierRatio >= 0 && result.inlierRatio <= 1 && result.coverage >= 0 && result.coverage <= 1);
  // Different photographs of the same landmark do not compete with each other.
  const byPlace = new Map();
  for (const result of eligible) {
    const score = result.inlierRatio * Math.min(1, result.inliers / 80) * Math.min(1, result.coverage / 0.35);
    if (!byPlace.has(result.placeId) || byPlace.get(result.placeId).score < score) byPlace.set(result.placeId, { ...result, score });
  }
  const ranked = [...byPlace.values()].sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (!best || best.matches < thresholds.minMatches || best.inliers < thresholds.minInliers || best.inlierRatio < thresholds.minInlierRatio || best.coverage < thresholds.minCoverage) {
    return { status: 'unknown', reason: 'No hay suficientes coincidencias visuales verificables.' };
  }
  const runnerUp = ranked[1];
  if (runnerUp && best.score - runnerUp.score < thresholds.minMargin) return { status: 'ambiguous', reason: 'La imagen coincide con varios lugares. Prueba con otro encuadre.' };
  return { status: 'candidate', engine: ENGINE_ID, placeId: best.placeId, evidence: { matches: best.matches, inliers: best.inliers, inlierRatio: best.inlierRatio, coverage: best.coverage, margin: runnerUp ? best.score - runnerUp.score : null } };
}

export function manifestProblem(manifest, placeIds) {
  if (!manifest || manifest.version !== 1 || manifest.engine !== ENGINE_ID) return 'El motor de reconocimiento no está configurado.';
  if (!manifest.enabled || !manifest.validated) return manifest.reason || 'El reconocimiento está pendiente de validación.';
  if (!manifest.calibration?.report || !manifest.calibration?.datasetVersion) return 'Falta el informe de evaluación del reconocimiento.';
  if (!Array.isArray(manifest.references) || !manifest.references.length) return 'No hay referencias visuales disponibles.';
  if (manifest.references.some((reference) => !placeIds.has(reference.placeId) || !reference.path || !reference.license || !reference.credit || !reference.sourceUrl)) return 'Las referencias visuales están incompletas.';
  for (const [key, value] of Object.entries(DEFAULT_THRESHOLDS)) {
    if (!Number.isFinite(manifest.thresholds?.[key]) || (key === 'ratioTest' ? manifest.thresholds[key] <= 0 : manifest.thresholds[key] < value) || (key.startsWith('min') && key !== 'minMatches' && key !== 'minInliers' && manifest.thresholds[key] > 1)) return 'Los umbrales del reconocimiento no son válidos.';
  }
  if (manifest.thresholds.ratioTest > 0.7) return 'El filtro de coincidencias es demasiado permisivo.';
  return null;
}
