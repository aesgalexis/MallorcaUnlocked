import { test, expect } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';

test('three sample visits flip to licensed photographs without entering personal storage or exports', async ({ page }) => {
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./');
  await expect(page.locator('.coin-card')).toHaveCount(100);
  await expect(page.locator('.is-demo')).toHaveCount(3);
  await expect(page.locator('#demo-label')).toHaveText('3 visitas de muestra');
  await expect(page.locator('#progress-discovered')).toHaveText('3');
  await page.locator('[data-coin="mallorca-0001"]').click();
  await expect(page.locator('[data-coin="mallorca-0001"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-coin="mallorca-0001"] img')).toHaveJSProperty('complete', true);
  expect(await page.locator('[data-coin="mallorca-0001"] img').evaluate((image) => image.naturalWidth)).toBeGreaterThan(300);
  await page.locator('[data-coin="mallorca-0001"]').click();
  await page.getByRole('button', { name: 'Detalles de La Seu', exact: true }).click();
  await expect(page.getByText('Visita de muestra · no es una captura tuya')).toBeVisible();
  await page.getByRole('button', { name: 'Ver fotografía de muestra', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Diotime · Wikimedia Commons' })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.getByRole('button', { name: 'Ajustes y copia de seguridad' }).click();
  await expect(page.getByText('0 lugares descubiertos · 0 fotografías')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Exportar colección/ }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
  expect(exported.captures).toEqual([]); expect(exported.discoveries).toEqual([]);
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await page.mouse.move(1, 1);
  await mkdir('.local/qa', { recursive: true });
  await page.screenshot({ path: '.local/qa/redesign-desktop.png' });
  await page.getByRole('button', { name: 'Ocultar visitas de muestra' }).click();
  await expect(page.locator('.is-demo')).toHaveCount(0);
  await expect(page.locator('#progress-discovered')).toHaveText('0');
  await page.reload();
  await expect(page.locator('#progress-discovered')).toHaveText('0');
  expect(errors).toEqual([]);
});

test('rarity frames stay neutral until hover or keyboard focus, while visited frames retain color', async ({ page }) => {
  await page.goto('./');
  const rare = page.locator('.coin-card.rarity-rare').first();
  const epic = page.locator('.coin-card.rarity-epic').first();
  const visited = page.locator('.coin-card.rarity-common.is-discovered');
  const border = (locator) => locator.evaluate((element) => getComputedStyle(element).borderTopColor);
  const neutral = await border(epic);
  expect(await border(rare)).toBe(neutral);
  expect(await border(visited)).not.toBe(neutral);
  await rare.hover();
  await expect.poll(() => border(rare)).not.toBe(neutral);
  expect(await border(epic)).toBe(neutral);
  await page.mouse.move(1, 1);
  await expect.poll(() => border(rare)).toBe(neutral);
  expect(await border(visited)).not.toBe(neutral);
  await rare.locator('.coin-button').focus();
  await expect.poll(() => border(rare)).not.toBe(neutral);
});

test('rarity explains published annual visits and exposes the source in the place details', async ({ page }) => {
  await page.goto('./?demo=0');
  await page.getByRole('button', { name: 'Rareza según afluencia', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Menos visitado, más raro.' })).toBeVisible();
  await expect(page.getByText('250.000 visitas anuales o más.')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('[data-coin="mallorca-0092"]').click();
  await page.getByText('Sobre este lugar', { exact: true }).click();
  await expect(page.getByRole('link', { name: 'Fuente de visitas (2024) ↗' })).toBeVisible();
  await expect(page.getByText('6561 visitas registradas en 2024.', { exact: false })).toBeVisible();
});

test('sample edition remains compact and usable on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await expect(page.locator('.is-demo')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const first = await page.locator('.coin-card').first().boundingBox();
  expect(first.y).toBeLessThan(600);
  await page.screenshot({ path: '.local/qa/redesign-mobile.png' });
});
