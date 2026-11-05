import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_THRESHOLDS, evaluateMatches, manifestProblem } from '../../src/recognition/policy.js';
import { RecognitionService } from '../../src/recognition/service.js';

const strong = { placeId: 'mallorca-0001', matches: 90, inliers: 80, inlierRatio: 0.89, coverage: 0.5 };
const reference = { placeId: 'mallorca-0001', path: 'reference.jpg', sourceUrl: 'https://example.org/own', credit: 'Test fixture author', license: 'CC0-1.0' };
const manifest = { version: 1, engine: 'orb-homography-v1', enabled: true, validated: true, calibration: { report: 'test-report', datasetVersion: 'test-only' }, thresholds: { ...DEFAULT_THRESHOLDS }, references: [reference] };

test('empty, weak, non-finite and spatially concentrated matches are rejected', () => {
  assert.equal(evaluateMatches([]).status, 'unknown');
  assert.equal(evaluateMatches([{ ...strong, inliers: 10 }]).status, 'unknown');
  assert.equal(evaluateMatches([{ ...strong, coverage: 0.02 }]).status, 'unknown');
  assert.equal(evaluateMatches([{ ...strong, inlierRatio: NaN }]).status, 'unknown');
  assert.equal(evaluateMatches([{ ...strong, inliers: 1000 }]).status, 'unknown');
});

test('two plausible distinct places are ambiguous; repeated views of one place are not', () => {
  assert.equal(evaluateMatches([strong, { ...strong, placeId: 'mallorca-0002' }]).status, 'ambiguous');
  const result = evaluateMatches([strong, { ...strong, inliers: 70 }]);
  assert.equal(result.status, 'candidate');
  assert.equal(result.placeId, 'mallorca-0001');
  assert.equal(result.evidence.inliers, 80);
  assert.equal('confidence' in result, false, 'geometric score must not pretend to be calibrated probability');
});

test('default configuration and incomplete validation fail closed', () => {
  const ids = new Set(['mallorca-0001']);
  assert.ok(manifestProblem({ ...manifest, enabled: false }, ids));
  assert.ok(manifestProblem({ ...manifest, validated: false }, ids));
  assert.ok(manifestProblem({ ...manifest, calibration: null }, ids));
  assert.ok(manifestProblem({ ...manifest, references: [] }, ids));
  assert.ok(manifestProblem(manifest, new Set()));
  assert.ok(manifestProblem({ ...manifest, thresholds: { ...DEFAULT_THRESHOLDS, minInliers: 1 } }, ids));
  assert.ok(manifestProblem({ ...manifest, thresholds: { ...DEFAULT_THRESHOLDS, ratioTest: 0.9 } }, ids));
  assert.equal(manifestProblem(manifest, ids), null);
  assert.equal(manifestProblem({ ...manifest, thresholds: { ...DEFAULT_THRESHOLDS, ratioTest: 0.6 } }, ids), null);
});

function service(config, engine) {
  return new RecognitionService([{ id: 'mallorca-0001' }], { fetcher: async () => ({ ok: true, json: async () => config }), engineFactory: () => engine });
}

test('inactive engine never runs inference or claims a match', async () => {
  let ran = false;
  const recognizer = service({ ...manifest, enabled: false }, { match: async () => { ran = true; return [strong]; } });
  assert.equal((await recognizer.recognize({ photo: new Blob(['image']) })).status, 'unavailable');
  assert.equal(ran, false);
});

test('service excludes unknown catalogue IDs and handles inference failure without a successful identification', async () => {
  assert.equal((await service(manifest, { match: async () => [{ ...strong, placeId: 'unknown' }] }).recognize({ photo: new Blob() })).status, 'unknown');
  assert.equal((await service(manifest, { match: async () => { throw new Error('runtime unavailable'); } }).recognize({ photo: new Blob() })).status, 'unavailable');
  assert.equal((await service(manifest, { match: async () => [strong] }).recognize({ photo: new Blob() })).status, 'candidate');
});

test('aborted inference cannot unlock a place', async () => {
  const abort = new AbortController(); abort.abort();
  await assert.rejects(service(manifest, {}).recognize({ photo: new Blob() }, { signal: abort.signal }), { name: 'AbortError' });
});
