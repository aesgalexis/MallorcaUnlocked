import { isDate, validateCapture } from './storage.js';

export const BACKUP_FORMAT = 'mallorca-unlocked-collection';
export const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 200 * 1024 * 1024;
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

function encode(bytes) {
  const parts = [];
  for (let offset = 0; offset < bytes.length; offset += 32768) parts.push(String.fromCharCode(...bytes.subarray(offset, offset + 32768)));
  return btoa(parts.join(''));
}

function decode(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length % 4 !== 0 || value.length > Math.ceil(MAX_PHOTO_BYTES / 3) * 4) {
    throw new Error('El archivo contiene una fotografía no válida o demasiado grande.');
  }
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

export async function createBackup(snapshot) {
  const captures = [];
  for (const capture of snapshot.captures) {
    validateCapture(capture);
    captures.push({ id: capture.id, capturedAt: capture.capturedAt, origin: capture.origin || 'camera', photo: { type: capture.photo.type, base64: encode(new Uint8Array(await capture.photo.arrayBuffer())) } });
  }
  const content = JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), captures, discoveries: snapshot.discoveries }, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  if (blob.size > MAX_BACKUP_BYTES) throw new Error('La copia supera los 200 MB admitidos en esta versión. Conserva tus datos y solicita una migración por bloques.');
  return blob;
}

export async function parseBackup(file, places) {
  if (file.size > MAX_BACKUP_BYTES) throw new Error('Esta copia supera el límite de 200 MB.');
  let data;
  try { data = JSON.parse(await file.text()); } catch { throw new Error('No es un archivo de copia de seguridad válido.'); }
  if (data?.format !== BACKUP_FORMAT || data.version !== BACKUP_VERSION || !Array.isArray(data.captures) || !Array.isArray(data.discoveries)) {
    throw new Error('El formato o la versión de esta copia no es compatible.');
  }
  if (data.captures.length > 2000 || data.discoveries.length > 1000) throw new Error('La copia contiene demasiados registros.');
  const captureIds = new Set();
  const captures = data.captures.map((capture) => {
    if (!capture || typeof capture.id !== 'string' || capture.id.length > 128 || captureIds.has(capture.id) || !capture.photo) throw new Error('La copia contiene capturas repetidas o incompletas.');
    const record = { id: capture.id, capturedAt: capture.capturedAt, origin: 'imported', photo: new Blob([decode(capture.photo.base64)], { type: capture.photo.type }) };
    validateCapture(record);
    captureIds.add(record.id);
    return record;
  });
  const knownPlaces = new Set(places.map((place) => place.id));
  const placeIds = new Set();
  const discoveries = [];
  let skipped = 0;
  for (const discovery of data.discoveries) {
    if (!discovery || !captureIds.has(discovery.captureId) || !isDate(discovery.capturedAt) || !isDate(discovery.discoveredAt) || placeIds.has(discovery.placeId)) {
      throw new Error('La copia contiene descubrimientos sin fotografía, repetidos o con fechas incorrectas.');
    }
    if (discovery.capturedAt !== captures.find((capture) => capture.id === discovery.captureId).capturedAt) throw new Error('La fecha de captura no coincide con la fotografía.');
    placeIds.add(discovery.placeId);
    if (!knownPlaces.has(discovery.placeId)) { skipped++; continue; }
    // Restore personal backups, not engine assertions from untrusted JSON.
    discoveries.push({ placeId: discovery.placeId, captureId: discovery.captureId, capturedAt: discovery.capturedAt, discoveredAt: discovery.discoveredAt, recognition: { status: 'restored', engine: 'personal-backup' } });
  }
  return { captures, discoveries, skipped };
}
