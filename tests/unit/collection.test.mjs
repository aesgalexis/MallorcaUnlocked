import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPlaces, getProgress, normalize } from '../../src/lib/catalog.js';
import { places, categories } from '../../src/data/catalog.js';

test('search ignores diacritics and combines all filters', () => {
  assert.equal(normalize('SÓLLER'), 'soller');
  const target = places.find((place) => place.id === 'mallorca-0014');
  const filters = { query: 'soller', category: target.category, municipality: target.municipality, rarity: target.rarity };
  const result = filterPlaces(places, filters);
  assert.ok(result.some((place) => place.id === target.id));
  assert.ok(result.every((place) => place.municipality === target.municipality && place.category === target.category && place.rarity === target.rarity));
  assert.equal(filterPlaces(places, { ...filters, municipality: 'Palma' }).length, 0);
});

test('status and progress count only known discoveries, never pending photos or removed catalogue IDs', () => {
  const discoveries = new Map([['mallorca-0001', {}], ['not-in-catalogue', {}]]);
  assert.deepEqual(getProgress(places, discoveries), { discovered: 1, total: places.length, percent: 1 });
  assert.equal(filterPlaces(places, { status: 'discovered' }, discoveries).length, 1);
  assert.equal(filterPlaces(places, { status: 'locked' }, discoveries).length, places.length - 1);
  assert.deepEqual(getProgress([], discoveries), { discovered: 0, total: 0, percent: 0 });
});

test('all nine catalogue categories have actual records', () => {
  assert.equal(places.length, 100);
  assert.equal(new Set(places.map((place) => place.id)).size, 100);
  for (const category of categories) assert.ok(places.some((place) => place.category === category.id), category.id);
});
