import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { places, categories, rarities, sources } from '../src/data/catalog.js';
import { landmarkNames } from '../src/ui/icons.js';
import { manifestProblem } from '../src/recognition/policy.js';

const root = fileURLToPath(new URL('../', import.meta.url));
async function javascriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map((entry) => entry.isDirectory() ? javascriptFiles(path.join(directory, entry.name)) : /\.(mjs|js)$/.test(entry.name) ? [path.join(directory, entry.name)] : []));
  return groups.flat();
}
for (const directory of ['src', 'scripts', 'tests']) for (const filename of await javascriptFiles(path.join(root, directory))) {
  const result = spawnSync(process.execPath, ['--check', filename], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}
assert.equal(places.length, 50);
assert.equal(new Set(places.map((place) => place.id)).size, places.length);
assert.equal(new Set(places.map((place) => place.number)).size, places.length);
for (const place of places) {
  assert.equal(place.id, `mallorca-${String(place.number).padStart(4, '0')}`);
  for (const field of ['name', 'municipality', 'description', 'accessNotes', 'rarityReason']) assert.ok(typeof place[field] === 'string' && place[field].length > 0, `${place.id}: ${field}`);
  assert.ok(categories.some((category) => category.id === place.category));
  assert.ok(rarities.some((rarity) => rarity.id === place.rarity));
  assert.ok(landmarkNames.includes(place.icon), `${place.id}: ${place.icon}`);
  assert.ok(place.sourceIds.length);
  for (const sourceId of place.sourceIds) {
    assert.ok(sources[sourceId], sourceId);
    assert.equal(new URL(sources[sourceId].url).protocol, 'https:');
  }
  assert.equal(place.recognition.status, 'untrained');
  assert.deepEqual(place.recognition.referenceImages, []);
}
const manifest = JSON.parse(await readFile(path.join(root, 'recognition/reference-manifest.json'), 'utf8'));
assert.ok(manifestProblem(manifest, new Set(places.map((place) => place.id))));
console.log(`Syntax and catalogue checked: ${places.length} places, ${new Set(places.map((place) => place.municipality)).size} municipalities, ${Object.keys(sources).length} primary sources. Recognition correctly inactive.`);
