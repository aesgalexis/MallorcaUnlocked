import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { CollectionStore, storageError } from '../../src/lib/storage.js';
import { createBackup, parseBackup, BACKUP_FORMAT, MAX_BACKUP_BYTES } from '../../src/lib/backup.js';

const capturedAt = '2026-11-05T14:30:00.000Z';
const photo = new Blob([Uint8Array.from([255, 216, 255, 224, 1, 2, 3, 4])], { type: 'image/jpeg' });
const capture = (id = 'capture-1') => ({ id, capturedAt, origin: 'camera', photo });
const candidate = (placeId = 'mallorca-0001') => ({ status: 'candidate', engine: 'test-only', placeId });
const places = [{ id: 'mallorca-0001' }];
const newStore = (factory = new IDBFactory()) => new CollectionStore(factory);

test('camera capture and timestamp persist after reopening without unlocking a coin', async () => {
  const factory = new IDBFactory();
  const store = newStore(factory);
  await store.saveCapture(capture());
  store.close();
  const reopened = newStore(factory);
  const snapshot = await reopened.snapshot();
  assert.equal(snapshot.captures.length, 1);
  assert.equal(snapshot.captures[0].capturedAt, capturedAt);
  assert.deepEqual(new Uint8Array(await snapshot.captures[0].photo.arrayBuffer()), new Uint8Array(await photo.arrayBuffer()));
  assert.equal(snapshot.discoveries.length, 0);
  reopened.close();
});

test('discovery requires an existing capture and a matching visual proposal', async () => {
  const store = newStore();
  await assert.rejects(store.confirmDiscovery('missing', places[0].id, candidate()), /original/);
  await store.saveCapture(capture());
  await assert.rejects(store.confirmDiscovery('capture-1', places[0].id, { status: 'unknown' }), /propuesta/);
  await assert.rejects(store.confirmDiscovery('capture-1', places[0].id, candidate('another-place')), /propuesta/);
  assert.equal(await store.confirmDiscovery('capture-1', places[0].id, candidate()), true);
  const snapshot = await store.snapshot();
  assert.equal(snapshot.discoveries[0].capturedAt, capturedAt);
  assert.equal(snapshot.discoveries[0].captureId, 'capture-1');
  store.close();
});

test('a duplicate discovery never replaces the first photograph', async () => {
  const store = newStore();
  await store.saveCapture(capture());
  await store.saveCapture(capture('capture-2'));
  await store.confirmDiscovery('capture-1', places[0].id, candidate());
  assert.equal(await store.confirmDiscovery('capture-2', places[0].id, candidate()), false);
  assert.equal((await store.snapshot()).discoveries[0].captureId, 'capture-1');
  await assert.rejects(store.deletePendingCapture('capture-1'), /desbloqueada/);
  await store.deletePendingCapture('capture-2');
  assert.equal((await store.list('captures')).length, 1);
  store.close();
});

test('backup round trip preserves photo bytes and dates without trusting imported engine claims', async () => {
  const store = newStore();
  await store.saveCapture(capture());
  await store.confirmDiscovery('capture-1', places[0].id, candidate());
  const parsed = await parseBackup(await createBackup(await store.snapshot()), places);
  assert.equal(parsed.captures[0].origin, 'imported');
  assert.equal(parsed.captures[0].capturedAt, capturedAt);
  assert.equal(parsed.discoveries[0].recognition.status, 'restored');
  assert.deepEqual(new Uint8Array(await parsed.captures[0].photo.arrayBuffer()), new Uint8Array(await photo.arrayBuffer()));
  const restored = newStore();
  assert.deepEqual(await restored.merge(parsed), { discoveries: 1, captures: 1 });
  assert.deepEqual(await restored.merge(parsed), { discoveries: 0, captures: 0 });
  assert.equal((await restored.snapshot()).captures.length, 1);
  store.close(); restored.close();
});

test('capture ID conflicts remap incoming photos and preserve the local original', async () => {
  const store = newStore();
  await store.saveCapture(capture());
  const changed = { ...capture(), photo: new Blob(['a different image'], { type: 'image/jpeg' }) };
  await store.merge({ captures: [changed], discoveries: [{ placeId: places[0].id, captureId: changed.id, capturedAt, discoveredAt: capturedAt }] });
  const snapshot = await store.snapshot();
  assert.equal(snapshot.captures.length, 2);
  assert.notEqual(snapshot.discoveries[0].captureId, 'capture-1');
  assert.equal(snapshot.captures.find((item) => item.id === 'capture-1').photo.size, photo.size);
  store.close();
});

test('invalid backup formats, duplicates, missing photos and oversized files are rejected before mutation', async () => {
  const valid = JSON.parse(await (await createBackup({ captures: [capture()], discoveries: [] })).text());
  const input = (value) => new Blob([JSON.stringify(value)]);
  await assert.rejects(parseBackup(new Blob(['{invalid']), places), /válido/);
  await assert.rejects(parseBackup(input({ format: 'other' }), places), /compatible/);
  await assert.rejects(parseBackup(input({ ...valid, version: 999 }), places), /compatible/);
  await assert.rejects(parseBackup(input({ ...valid, captures: [valid.captures[0], valid.captures[0]] }), places), /repetidas/);
  await assert.rejects(parseBackup(input({ ...valid, discoveries: [{ placeId: places[0].id, captureId: 'missing', capturedAt, discoveredAt: capturedAt }] }), places), /fotografía/);
  await assert.rejects(parseBackup(input({ ...valid, captures: [{ ...valid.captures[0], photo: { type: 'image/svg+xml', base64: 'YWJjZA==' } }] }), places), /válidas/);
  await assert.rejects(parseBackup({ size: MAX_BACKUP_BYTES + 1 }, places), /200 MB/);
  assert.equal(BACKUP_FORMAT, valid.format);
});

test('unknown catalogue places retain their photos and are reported as skipped', async () => {
  const file = await createBackup({ captures: [capture()], discoveries: [{ placeId: 'future-catalogue-place', captureId: 'capture-1', capturedAt, discoveredAt: capturedAt }] });
  const parsed = await parseBackup(file, places);
  assert.equal(parsed.skipped, 1);
  assert.equal(parsed.discoveries.length, 0);
  assert.equal(parsed.captures.length, 1);
});

test('invalid merge is atomic and quota errors have an actionable message', async () => {
  const store = newStore();
  await store.saveCapture(capture());
  await assert.rejects(store.merge({ captures: [capture('new')], discoveries: [{ placeId: places[0].id, captureId: 'missing' }] }), /incompletas/);
  assert.equal((await store.snapshot()).captures.length, 1);
  assert.match(storageError({ name: 'QuotaExceededError' }), /Exporta/);
  store.close();
});
