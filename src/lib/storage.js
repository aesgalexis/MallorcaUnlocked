const DB_NAME = 'mallorca-unlocked';
const DB_VERSION = 1;
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

function complete(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onabort = () => reject(transaction.error || new Error('La operación de almacenamiento se ha cancelado.'));
    transaction.onerror = () => reject(transaction.error);
  });
}

function requested(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class CollectionStore {
  constructor(factory = globalThis.indexedDB, name = DB_NAME) {
    this.factory = factory;
    this.name = name;
    this.db = null;
    this.opening = null;
  }

  async open() {
    if (this.db) return this;
    if (this.opening) return this.opening;
    if (!this.factory) throw new Error('Este navegador no permite guardar la colección con IndexedDB. Prueba en otro navegador.');
    this.opening = (async () => {
      const request = this.factory.open(this.name, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore('discoveries', { keyPath: 'placeId' });
        db.createObjectStore('captures', { keyPath: 'id' });
      };
      this.db = await requested(request);
      this.db.onversionchange = () => this.close();
      return this;
    })();
    try { return await this.opening; } finally { this.opening = null; }
  }

  async list(storeName) {
    await this.open();
    const tx = this.db.transaction(storeName, 'readonly');
    const done = complete(tx);
    const records = await requested(tx.objectStore(storeName).getAll());
    await done;
    return records;
  }

  async snapshot() {
    await this.open();
    const tx = this.db.transaction(['discoveries', 'captures'], 'readonly');
    const done = complete(tx);
    const [discoveries, captures] = await Promise.all([
      requested(tx.objectStore('discoveries').getAll()),
      requested(tx.objectStore('captures').getAll()),
    ]);
    await done;
    return { discoveries, captures };
  }

  async saveCapture(capture) {
    validateCapture(capture);
    await this.open();
    const tx = this.db.transaction('captures', 'readwrite');
    const done = complete(tx);
    tx.objectStore('captures').add(capture);
    await done;
    return capture;
  }

  async confirmDiscovery(captureId, placeId, recognition) {
    if (!placeId || !recognition || recognition.status !== 'candidate' || recognition.placeId !== placeId) {
      throw new Error('La identificación necesita una propuesta visual válida.');
    }
    await this.open();
    const tx = this.db.transaction(['captures', 'discoveries'], 'readwrite');
    const done = complete(tx);
    // Attach rejection handling immediately; request failures abort the whole transaction.
    const capture = await requested(tx.objectStore('captures').get(captureId));
    if (!capture) { tx.abort(); await done.catch(() => {}); throw new Error('No se encuentra la captura original.'); }
    const existing = await requested(tx.objectStore('discoveries').get(placeId));
    if (!existing) {
      const discoveredAt = new Date().toISOString();
      tx.objectStore('discoveries').add({ placeId, captureId, capturedAt: capture.capturedAt, discoveredAt, recognition: { ...recognition, confirmedAt: discoveredAt } });
    }
    await done;
    return !existing;
  }

  async merge(snapshot) {
    for (const capture of snapshot.captures) validateCapture(capture);
    const importedCaptureIds = new Set(snapshot.captures.map((capture) => capture.id));
    if (importedCaptureIds.size !== snapshot.captures.length || new Set(snapshot.discoveries.map((discovery) => discovery.placeId)).size !== snapshot.discoveries.length || snapshot.discoveries.some((discovery) => !importedCaptureIds.has(discovery.captureId))) throw new Error('La copia contiene referencias incompletas o repetidas.');
    // Compare bytes before the write transaction: asynchronous hashing inside an IDB transaction would close it.
    const current = new Map((await this.list('captures')).map((capture) => [capture.id, capture]));
    const unchanged = new Set();
    for (const capture of snapshot.captures) {
      const existing = current.get(capture.id);
      if (!existing || existing.capturedAt !== capture.capturedAt || existing.photo.size !== capture.photo.size || existing.photo.type !== capture.photo.type) continue;
      const a = new Uint8Array(await existing.photo.arrayBuffer()), b = new Uint8Array(await capture.photo.arrayBuffer());
      if (a.length === b.length && a.every((value, index) => value === b[index])) unchanged.add(capture.id);
    }
    await this.open();
    const tx = this.db.transaction(['captures', 'discoveries'], 'readwrite');
    const done = complete(tx);
    const existingCaptures = await requested(tx.objectStore('captures').getAllKeys());
    const existingDiscoveries = await requested(tx.objectStore('discoveries').getAllKeys());
    const knownCaptures = new Set(existingCaptures);
    const knownDiscoveries = new Set(existingDiscoveries);
    // Never overwrite an existing capture ID: a conflicting backup cannot replace a personal photo.
    const captureIds = new Map();
    let addedCaptures = 0;
    for (const capture of snapshot.captures) {
      if (knownCaptures.has(capture.id) && unchanged.has(capture.id)) { captureIds.set(capture.id, capture.id); continue; }
      const id = knownCaptures.has(capture.id) ? crypto.randomUUID() : capture.id;
      captureIds.set(capture.id, id);
      tx.objectStore('captures').add({ ...capture, id });
      knownCaptures.add(id);
      addedCaptures++;
    }
    let added = 0;
    for (const discovery of snapshot.discoveries) {
      if (knownDiscoveries.has(discovery.placeId)) continue;
      tx.objectStore('discoveries').add({ ...discovery, captureId: captureIds.get(discovery.captureId) });
      knownDiscoveries.add(discovery.placeId);
      added++;
    }
    await done;
    return { discoveries: added, captures: addedCaptures };
  }

  async deletePendingCapture(id) {
    await this.open();
    const tx = this.db.transaction(['captures', 'discoveries'], 'readwrite');
    const done = complete(tx);
    const discoveries = await requested(tx.objectStore('discoveries').getAll());
    if (discoveries.some((discovery) => discovery.captureId === id)) {
      tx.abort(); await done.catch(() => {}); throw new Error('Esta fotografía forma parte de una moneda desbloqueada.');
    }
    tx.objectStore('captures').delete(id);
    await done;
  }

  close() { this.db?.close(); this.db = null; }
}

export function validateCapture(capture) {
  if (!capture || typeof capture.id !== 'string' || !capture.id || !(capture.photo instanceof Blob) ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(capture.photo.type) || capture.photo.size === 0 ||
      capture.photo.size > MAX_PHOTO_BYTES || !isDate(capture.capturedAt)) {
    throw new Error('La captura no contiene una fotografía o una fecha válidas.');
  }
}

export function isDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
}

export function storageError(error) {
  if (error?.name === 'QuotaExceededError') return 'No queda espacio para guardar esta foto. Exporta tu colección y libera espacio en este navegador.';
  return error?.message || 'No se ha podido guardar. Conserva esta página abierta e inténtalo de nuevo.';
}
