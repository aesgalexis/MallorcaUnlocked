import { test, expect } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';

const timestamp = '2026-11-05T12:00:00.000Z';
let png;
test.beforeEach(async ({ page }) => {
  png = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 8; canvas.height = 8;
    const context = canvas.getContext('2d'); context.fillStyle = '#254f43'; context.fillRect(0, 0, 8, 8);
    return canvas.toDataURL('image/png').split(',')[1];
  });
});
const backup = (discovered = true) => ({ format: 'mallorca-unlocked-collection', version: 1, exportedAt: timestamp, captures: [{ id: 'test-fixture-photo', capturedAt: timestamp, origin: 'camera', photo: { type: 'image/png', base64: png } }], discoveries: discovered ? [{ placeId: 'mallorca-0001', captureId: 'test-fixture-photo', capturedAt: timestamp, discoveredAt: timestamp }] : [] });

async function ready(page) {
  await page.goto('./?demo=0');
  await expect(page.locator('.coin-card')).toHaveCount(100);
  await expect(page.locator('#hero-recognition')).toContainText('Identificación pendiente');
}

async function importBackup(page, data) {
  await page.getByRole('button', { name: 'Ajustes y copia de seguridad' }).click();
  await page.locator('#import-backup').setInputFiles({ name: 'test-collection.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
  await expect(page.locator('#confirm-import')).toBeVisible();
  await page.locator('#confirm-import').click();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
}

test('100 locked coins, source-only requests and desktop screenshot', async ({ page }) => {
  const errors = [], requests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', (request) => requests.push(request.url()));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await ready(page);
  await expect(page.locator('.is-unlocked')).toHaveCount(0);
  await expect(page.locator('#progress-discovered')).toHaveText('0');
  await expect(page.locator('#results-count')).toHaveText('100 de 100 lugares');
  expect(requests.every((url) => url.startsWith('http://127.0.0.1:4173/'))).toBeTruthy();
  expect(requests.some((url) => url.includes('/vendor/'))).toBeFalsy();
  expect(requests.some((url) => url.includes('/recognition/reference-manifest.json'))).toBeTruthy();
  expect(errors).toEqual([]);
  await mkdir('.local/qa', { recursive: true });
  await page.screenshot({ path: '.local/qa/desktop.png' });
});

test('search, category, municipality, rarity and empty-state reset combine correctly', async ({ page }) => {
  await ready(page);
  await page.getByRole('searchbox').fill('soller');
  await expect(page.locator('.coin-card')).toHaveCount(7);
  await page.getByLabel('Categoría', { exact: true }).selectOption('religious');
  await expect(page.locator('.coin-card')).toHaveCount(1);
  await page.getByLabel('Municipio', { exact: true }).selectOption('Palma');
  await expect(page.getByText('No hay lugares con estos filtros.')).toBeVisible();
  await page.getByRole('button', { name: 'Quitar filtros' }).click();
  await expect(page.locator('.coin-card')).toHaveCount(100);
  await page.getByLabel('Rareza', { exact: true }).selectOption('rare');
  await expect(page.locator('.coin-card')).toHaveCount(2);
});

test('locked place exposes source and access notes without unlocking; keyboard focus returns', async ({ page }) => {
  await ready(page);
  const coin = page.getByRole('button', { name: 'La Seu. Por descubrir. Ver detalles', exact: true });
  await coin.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByText('Sobre este lugar', { exact: true }).click();
  await expect(page.getByRole('link', { name: 'Illes Balears Travel · Catedral de Mallorca' })).toHaveAttribute('href', /illesbalears\.travel/);
  await expect(page.getByText('Criterio de rareza', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(coin).toBeFocused();
  await expect(page.locator('#progress-discovered')).toHaveText('0');
});

test('empty memories and recognition status are explicit', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Mis recuerdos 0', exact: true }).click();
  await expect(page.getByText('Aquí vivirán tus recuerdos.')).toBeVisible();
  await page.locator('#hero-recognition').click();
  await expect(page.getByText('En preparación', { exact: true })).toBeVisible();
  await expect(page.getByText('No iluminan monedas ni aumentan tu progreso.')).toBeVisible();
});

test('virtual camera captures a new frame, saves it pending and persists after reload', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Fotografiar un lugar', exact: true }).click();
  await expect(page.locator('input[accept*="image"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Permitir cámara', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tomar fotografía', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Tomar fotografía', exact: true }).click();
  await expect(page.getByRole('img', { name: 'La fotografía que acabas de tomar' })).toBeVisible();
  await page.getByRole('button', { name: 'Guardar captura', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('Pendiente de identificar', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.reload();
  await expect(page.locator('#progress-discovered')).toHaveText('0');
  await page.getByRole('button', { name: 'Mis recuerdos 0', exact: true }).click();
  await expect(page.locator('.pending-card')).toHaveCount(1);
  expect(await page.locator('.pending-card img').evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  const persisted = await page.evaluate(async () => {
    const { CollectionStore } = await import('./src/lib/storage.js');
    const store = new CollectionStore(); const snapshot = await store.snapshot(); store.close();
    return { date: snapshot.captures[0].capturedAt, bytes: snapshot.captures[0].photo.size, origin: snapshot.captures[0].origin, discoveries: snapshot.discoveries.length };
  });
  expect(Date.parse(persisted.date)).toBeGreaterThan(Date.now() - 120000);
  expect(persisted.bytes).toBeGreaterThan(1000);
  expect(persisted.origin).toBe('camera'); expect(persisted.discoveries).toBe(0);
});

test('camera tracks are stopped on dialog close', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Fotografiar un lugar', exact: true }).click();
  await page.getByRole('button', { name: 'Permitir cámara', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Tomar fotografía', exact: true })).toBeVisible();
  await page.evaluate(() => { window.testCameraTrack = document.querySelector('video').srcObject.getVideoTracks()[0]; });
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.testCameraTrack.readyState)).toBe('ended');
});

test('denied camera access explains recovery and exposes no gallery fallback', async ({ page }) => {
  await page.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Test denial', 'NotAllowedError'); }; });
  await ready(page);
  await page.getByRole('button', { name: 'Fotografiar un lugar', exact: true }).click();
  await page.getByRole('button', { name: 'Permitir cámara', exact: true }).click();
  await expect(page.locator('#camera-message')).toContainText('bloqueado');
  await expect(page.getByRole('button', { name: 'Volver a intentar', exact: true })).toBeEnabled();
  await expect(page.locator('input[type=file]')).toHaveCount(0);
});

test('personal backup restores an illuminated coin, 3D flip, date and bytes; repeated import is idempotent', async ({ page }) => {
  await ready(page);
  await importBackup(page, backup());
  await expect(page.locator('#progress-discovered')).toHaveText('1');
  const coin = page.locator('[data-coin="mallorca-0001"]');
  await expect(coin).toHaveClass(/is-unlocked/);
  await coin.click();
  await expect(coin).toHaveAttribute('aria-pressed', 'true');
  await expect(coin).toHaveClass(/is-flipped/);
  await expect(coin.locator('.coin-back img')).toHaveJSProperty('naturalWidth', 8);
  await coin.click();
  await expect(coin).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Detalles de La Seu', exact: true }).click();
  await expect(page.getByText('Tu recuerdo del 5 de noviembre de 2026')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await importBackup(page, backup());
  await expect(page.locator('#progress-discovered')).toHaveText('1');
  await page.getByRole('button', { name: 'Ajustes y copia de seguridad' }).click();
  await expect(page.getByText('1 lugares descubiertos · 1 fotografías')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Exportar colección/ }).click();
  const downloaded = await downloadPromise;
  const exported = JSON.parse(await readFile(await downloaded.path(), 'utf8'));
  expect(exported.captures[0].photo.base64).toBe(png);
  expect(exported.captures[0].capturedAt).toBe(timestamp);
  await page.reload();
  await expect(page.locator('[data-coin="mallorca-0001"]')).toHaveClass(/is-unlocked/);
});

test('corrupt or undecodable backup never changes existing progress', async ({ page }) => {
  await ready(page);
  await importBackup(page, backup());
  await page.getByRole('button', { name: 'Ajustes y copia de seguridad' }).click();
  const corrupted = backup(); corrupted.captures[0].photo.base64 = 'YWJjZA==';
  await page.locator('#import-backup').setInputFiles({ name: 'corrupt.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(corrupted)) });
  await expect(page.locator('#backup-message')).toContainText('No se ha importado ningún dato.');
  await expect(page.locator('#confirm-import')).toHaveCount(0);
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(page.locator('#progress-discovered')).toHaveText('1');
});

test('pending capture can be retained or deleted only after the local confirmation', async ({ page }) => {
  await ready(page);
  await importBackup(page, backup(false));
  await page.getByRole('button', { name: 'Mis recuerdos 0', exact: true }).click();
  await page.locator('.pending-card').click();
  await page.getByRole('button', { name: 'Eliminar esta captura', exact: true }).click();
  await page.getByRole('button', { name: 'Conservar', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('Pendiente de identificar', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Eliminar esta captura', exact: true }).click();
  await page.getByRole('button', { name: 'Eliminar captura', exact: true }).click();
  await expect(page.locator('.pending-card')).toHaveCount(0);
  await expect(page.locator('#progress-discovered')).toHaveText('0');
});

for (const width of [320, 390, 768, 1024]) test(`responsive layout at ${width}px keeps content and dialogs within viewport`, async ({ page }) => {
  await page.setViewportSize({ width, height: 844 });
  await ready(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  const firstCoin = await page.locator('.coin-button').first().boundingBox();
  expect(firstCoin.width).toBeGreaterThan(60);
  await page.locator('.coin-button').first().click();
  const dialog = await page.getByRole('dialog').boundingBox();
  expect(dialog.x).toBeGreaterThanOrEqual(0);
  expect(dialog.x + dialog.width).toBeLessThanOrEqual(width);
  await page.keyboard.press('Escape');
  if (width === 390) { await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: '.local/qa/mobile.png' }); }
});

test('reduced motion removes the long 3D transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  expect(parseFloat(await page.locator('.coin-body').first().evaluate((element) => getComputedStyle(element).transitionDuration))).toBeLessThan(0.001);
});
