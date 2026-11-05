import { test, expect } from '@playwright/test';

function makeTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
  const context = canvas.getContext('2d');
  context.fillStyle = '#d8d0b2'; context.fillRect(0, 0, 640, 480);
  let seed = 817;
  function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  for (let i = 0; i < 220; i++) {
    context.fillStyle = `rgb(${Math.floor(random() * 200)},${Math.floor(random() * 200)},${Math.floor(random() * 200)})`;
    context.fillRect(30 + random() * 550, 30 + random() * 370, 3 + random() * 35, 3 + random() * 35);
  }
  context.fillStyle = '#122c27'; context.font = 'bold 40px sans-serif'; context.fillText('SYNTHETIC TEST', 90, 230);
  return canvas.toDataURL('image/png').split(',')[1];
}

// These synthetic textures test the real OpenCV worker, not landmark recognition accuracy.
// They never ship as references, affect the real manifest, or appear as discoveries in the product.
test('real ORB worker matches a transformed textured fixture and rejects an unrelated image', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.coin-card')).toHaveCount(50);
  const reference = await page.evaluate(makeTexture);
  await page.route('**/recognition/test-reference.png', (route) => route.fulfill({ contentType: 'image/png', body: Buffer.from(reference, 'base64') }));
  const output = await page.evaluate(async (base64) => {
    const { OrbReferenceEngine } = await import('./src/recognition/service.js');
    const { DEFAULT_THRESHOLDS, evaluateMatches } = await import('./src/recognition/policy.js');
    const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
    const context = canvas.getContext('2d'); context.fillStyle = '#ffffff'; context.fillRect(0, 0, 640, 480);
    context.translate(320, 240); context.rotate(0.03); context.scale(0.96, 0.96); context.drawImage(bitmap, -310, -235); bitmap.close();
    const query = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const engine = new OrbReferenceEngine({ runtime: './vendor/opencv.js', thresholds: DEFAULT_THRESHOLDS, references: [{ placeId: 'synthetic-fixture', path: './recognition/test-reference.png' }] });
    const matches = await engine.match(query);
    context.resetTransform(); context.fillStyle = '#ffffff'; context.fillRect(0, 0, 640, 480);
    const unrelated = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const unknown = await engine.match(unrelated);
    return { matches, outcome: evaluateMatches(matches), unrelated: evaluateMatches(unknown) };
  }, reference);
  expect(output.matches.length).toBeGreaterThan(0);
  expect(output.outcome.status).toBe('candidate');
  expect(output.outcome.placeId).toBe('synthetic-fixture');
  expect(output.unrelated.status).toBe('unknown');
});

test('visual proposal needs confirmation; rejection keeps the capture pending; confirmation unlocks once', async ({ page }) => {
  const reference = await page.evaluate(makeTexture);
  await page.route('**/recognition/reference-manifest.json', (route) => route.fulfill({ json: {
    version: 1, engine: 'orb-homography-v1', enabled: true, validated: true,
    runtime: './vendor/opencv.js', calibration: { report: 'test-only-synthetic-fixture', datasetVersion: 'test-only' },
    thresholds: { minMatches: 28, minInliers: 22, minInlierRatio: 0.65, minCoverage: 0.12, minMargin: 0.15, ratioTest: 0.7 },
    references: [{ placeId: 'mallorca-0001', path: './recognition/test-reference.png', sourceUrl: 'https://example.org/test-fixture', license: 'CC0-1.0', credit: 'Synthetic test fixture; not a landmark photograph' }],
  } }));
  await page.route('**/recognition/test-reference.png', (route) => route.fulfill({ contentType: 'image/png', body: Buffer.from(reference, 'base64') }));
  await page.addInitScript((base64) => {
    navigator.mediaDevices.getUserMedia = async () => {
      const bitmap = await createImageBitmap(new Blob([Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))], { type: 'image/png' }));
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
      canvas.getContext('2d').drawImage(bitmap, 0, 0); bitmap.close();
      return canvas.captureStream(10);
    };
  }, reference);
  await page.goto('./');
  await expect(page.locator('#hero-recognition')).toContainText('Reconocimiento visual en este dispositivo');
  await page.getByRole('button', { name: 'Fotografiar un lugar', exact: true }).click();
  await page.getByRole('button', { name: 'Permitir cámara', exact: true }).click();
  await page.getByRole('button', { name: 'Tomar fotografía', exact: true }).click();
  await page.getByRole('button', { name: 'Guardar e identificar', exact: true }).click();
  await expect(page.getByRole('heading', { name: '¿Es este lugar?', exact: true })).toBeVisible();
  await expect(page.locator('#progress-discovered')).toHaveText('0');
  await page.getByRole('button', { name: 'No es este lugar', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('La propuesta se ha descartado.', { exact: false })).toBeVisible();
  await expect(page.locator('#progress-discovered')).toHaveText('0');
  await page.getByRole('button', { name: 'Comprobar identificación', exact: true }).click();
  await expect(page.getByRole('heading', { name: '¿Es este lugar?', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sí, es este lugar', exact: true }).click();
  await expect(page.locator('#progress-discovered')).toHaveText('1');
  await expect(page.locator('[data-coin="mallorca-0001"]')).toHaveClass(/is-unlocked/);
  await page.reload();
  await expect(page.locator('#progress-discovered')).toHaveText('1');
});
