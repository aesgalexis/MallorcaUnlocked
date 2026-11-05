import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPlaces, getProgress, normalize } from '../../src/lib/catalog.js';
import { places, categories } from '../../src/data/catalog.js';

test('search ignores diacritics and combines all filters', () => {
  assert.equal(normalize('SÓLLER'), 'soller');
  const result = filterPlaces(places, { query: 'soller', category: 'religious', municipality: 'Sóller', rarity: 'common' });
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Sant Bartomeu de Sóller');
  assert.equal(filterPlaces(places, { query: 'soller', rarity: 'rare' }).length, 0);
});

test('status and progress count only known discoveries, never pending photos or removed catalogue IDs', () => {
  const discoveries = new Map([['mallorca-0001', {}], ['not-in-catalogue', {}]]);
  assert.deepEqual(getProgress(places, discoveries), { discovered: 1, total: 50, percent: 2 });
  assert.equal(filterPlaces(places, { status: 'discovered' }, discoveries).length, 1);
  assert.equal(filterPlaces(places, { status: 'locked' }, discoveries).length, 49);
  assert.deepEqual(getProgress([], discoveries), { discovered: 0, total: 0, percent: 0 });
});

test('all nine catalogue categories have actual records', () => {
  for (const category of categories) assert.ok(places.some((place) => place.category === category.id), category.id);
});
