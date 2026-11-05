import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRarity, isValidVisitation, rarityReason } from '../../src/lib/rarity.js';
import { visitationEvidence, visitationReferenceYear } from '../../src/data/visitation.js';
import { demoVisits, withDemoVisits } from '../../src/data/demo.js';

const evidence = (annualVisitors, overrides = {}) => ({
  annualVisitors,
  year: 2024,
  period: 'calendar-year',
  scope: 'admissions',
  sourceUrl: 'https://example.org/annual-admissions-report',
  title: 'Annual admissions test fixture',
  ...overrides,
});

test('rarity decreases as annual visits rise, including every threshold boundary', () => {
  const boundaries = [
    [0, 'epic'], [9999, 'epic'],
    [10000, 'rare'], [49999, 'rare'],
    [50000, 'uncommon'], [249999, 'uncommon'],
    [250000, 'common'], [1000000, 'common'],
  ];
  for (const [annualVisitors, expected] of boundaries) {
    assert.equal(classifyRarity(evidence(annualVisitors)), expected, `${annualVisitors} annual visits`);
  }
});

test('missing data and invalid or incomparable evidence remain unranked', () => {
  const invalid = [
    undefined, null, {},
    ...[-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1000'].map((value) => evidence(value)),
    evidence(1000, { year: 2023 }),
    evidence(1000, { year: 2026 }),
    evidence(1000, { period: 'partial-year' }),
    evidence(1000, { scope: 'reviews' }),
    evidence(1000, { scope: 'passers-by' }),
    evidence(1000, { sourceUrl: 'http://example.org/report' }),
    evidence(1000, { sourceUrl: 'not a URL' }),
    evidence(1000, { title: '' }),
    evidence(1000, { title: '  ' }),
  ];
  for (const item of invalid) {
    assert.equal(isValidVisitation(item), false);
    assert.equal(classifyRarity(item), 'unranked');
  }
});

test('the published evidence set includes five documented, comparable venue totals', () => {
  const entries = Object.entries(visitationEvidence);
  assert.ok(entries.length >= 5);
  for (const [placeId, item] of entries) {
    assert.match(placeId, /^mallorca-\d{4}$/);
    assert.equal(isValidVisitation(item), true, placeId);
    assert.equal(item.year, visitationReferenceYear, placeId);
    assert.equal(item.period, 'calendar-year');
    assert.equal(item.scope, 'admissions');
    assert.ok(item.locator && item.note && item.checkedAt, placeId);
    assert.notEqual(classifyRarity(item), 'unranked', placeId);
  }
  assert.match(rarityReason(undefined), /Sin una cifra anual/);
  assert.match(rarityReason(evidence(10000)), /2024/);
  assert.match(rarityReason(evidence(10000)), /recinto/);
});

test('three explicit sample visits are presentation-only and do not mutate the personal collection', () => {
  const personal = new Map();
  const rendered = withDemoVisits(personal, true);
  assert.notEqual(rendered, personal);
  assert.equal(personal.size, 0);
  assert.equal(rendered.size, 3);
  assert.equal(demoVisits.length, 3);
  assert.equal(new Set(demoVisits.map((visit) => visit.placeId)).size, 3);
  for (const visit of demoVisits) {
    assert.equal(visit.demo, true);
    assert.equal(rendered.get(visit.placeId), visit);
    assert.ok(visit.photoUrl && visit.credit && visit.license);
    assert.equal(new URL(visit.sourceUrl).protocol, 'https:');
    assert.equal(new URL(visit.licenseUrl).protocol, 'https:');
    assert.equal('captureId' in visit, false, 'a sample must not pretend to be a persisted camera capture');
  }
  assert.equal(withDemoVisits(personal, false), personal);
  assert.equal(personal.size, 0);
});

test('real discoveries take precedence over samples and survive toggling the sample display', () => {
  const real = { placeId: demoVisits[0].placeId, captureId: 'personal-camera-photo', capturedAt: '2026-11-05T12:00:00.000Z' };
  const personal = new Map([[real.placeId, real]]);
  const rendered = withDemoVisits(personal, true);
  assert.equal(rendered.size, 3);
  assert.equal(rendered.get(real.placeId), real);
  assert.equal([...rendered.values()].filter((visit) => visit.demo).length, 2);
  assert.deepEqual([...personal], [[real.placeId, real]]);
  const withoutSamples = withDemoVisits(personal, false);
  assert.equal(withoutSamples.size, 1);
  assert.equal(withoutSamples.get(real.placeId), real);
});
