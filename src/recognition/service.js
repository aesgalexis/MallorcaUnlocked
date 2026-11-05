import { ENGINE_ID, evaluateMatches, manifestProblem } from './policy.js';

const manifestUrl = new URL('../../recognition/reference-manifest.json', import.meta.url);

export class RecognitionService {
  constructor(places, { fetcher = (...args) => globalThis.fetch(...args), engineFactory = (manifest) => new OrbReferenceEngine(manifest), configUrl = manifestUrl } = {}) {
    this.placeIds = new Set(places.map((place) => place.id));
    this.fetcher = fetcher;
    this.engineFactory = engineFactory;
    this.configUrl = configUrl;
    this.manifest = null;
    this.engine = null;
    this.initialization = null;
    this.reason = 'Comprobando el reconocimiento…';
    this.ready = false;
  }

  async initialize() {
    if (this.initialization) return this.initialization;
    this.initialization = (async () => {
      try {
        const response = await this.fetcher(this.configUrl);
        if (!response.ok) throw new Error('No se ha podido cargar la configuración del reconocimiento.');
        this.manifest = await response.json();
        this.reason = manifestProblem(this.manifest, this.placeIds);
        this.ready = !this.reason;
      } catch (error) { this.reason = error.message || 'El reconocimiento no está disponible.'; }
      return { ready: this.ready, reason: this.reason, engine: ENGINE_ID };
    })();
    return this.initialization;
  }

  async recognize(capture, { signal } = {}) {
    await this.initialize();
    if (signal?.aborted) throw new DOMException('Operación cancelada', 'AbortError');
    if (!this.ready) return { status: 'unavailable', reason: this.reason };
    try {
      this.engine ||= this.engineFactory(this.manifest);
      const results = await this.engine.match(capture.photo, { signal });
      if (signal?.aborted) throw new DOMException('Operación cancelada', 'AbortError');
      const outcome = evaluateMatches(results.filter((result) => this.placeIds.has(result.placeId)), this.manifest.thresholds);
      return { ...outcome, evaluatedAt: new Date().toISOString() };
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      return { status: 'unavailable', reason: 'No se ha podido analizar esta captura. Puedes guardarla pendiente y volver a intentarlo.' };
    }
  }
}

export class OrbReferenceEngine {
  constructor(manifest) { this.manifest = manifest; }

  match(photo, { signal } = {}) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./worker.js', import.meta.url));
      const finish = (error, result) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
        worker.terminate();
        error ? reject(error) : resolve(result);
      };
      const abort = () => finish(new DOMException('Operación cancelada', 'AbortError'));
      const timer = setTimeout(() => finish(new Error('El análisis ha tardado demasiado.')), 45000);
      worker.onmessage = ({ data }) => data.error ? finish(new Error(data.error)) : finish(null, data.results);
      worker.onerror = () => finish(new Error('No se ha podido cargar el motor local.'));
      signal?.addEventListener('abort', abort, { once: true });
      if (signal?.aborted) { abort(); return; }
      worker.postMessage({ photo, manifest: this.manifest, baseUrl: new URL('../../', import.meta.url).href });
    });
  }
}
