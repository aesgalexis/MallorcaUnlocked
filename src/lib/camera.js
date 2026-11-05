export class Camera {
  constructor(video, mediaDevices = globalThis.navigator?.mediaDevices) {
    this.video = video;
    this.mediaDevices = mediaDevices;
    this.stream = null;
    this.generation = 0;
  }

  async start() {
    this.stop();
    const generation = this.generation;
    if (!globalThis.isSecureContext) throw new Error('La cámara necesita una conexión HTTPS o localhost.');
    if (!this.mediaDevices?.getUserMedia) throw new Error('Este navegador no admite cámara en directo. Abre la web en Safari, Chrome, Firefox o Edge actualizados. No se admite subir fotos de la galería.');
    const stream = await this.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1440 } } });
    if (generation !== this.generation) { stream.getTracks().forEach((track) => track.stop()); return false; }
    this.stream = stream;
    stream.getVideoTracks().forEach((track) => track.addEventListener('ended', () => {
      if (this.stream !== stream) return;
      this.stop();
      this.onInterrupted?.();
    }, { once: true }));
    this.video.srcObject = stream;
    try {
      await this.video.play();
      if (this.video.readyState < 2 || !this.video.videoWidth) await new Promise((resolve, reject) => {
        const finish = (error) => {
          clearTimeout(timer);
          this.video.removeEventListener('loadeddata', ready);
          this.video.removeEventListener('canplay', ready);
          this.pendingReady = null;
          error ? reject(error) : resolve();
        };
        const ready = () => { if (this.video.readyState >= 2 && this.video.videoWidth) finish(); };
        const timer = setTimeout(() => finish(new Error('La cámara no ha enviado ninguna imagen. Vuelve a abrirla.')), 15000);
        this.pendingReady = () => finish(new DOMException('Cámara cerrada', 'AbortError'));
        this.video.addEventListener('loadeddata', ready);
        this.video.addEventListener('canplay', ready);
        ready();
      });
    } catch (error) { this.stop(); throw error; }
    if (generation !== this.generation) { this.stop(); return false; }
    if (!stream.getVideoTracks().some((track) => track.readyState === 'live')) {
      this.stop();
      throw new DOMException('La cámara ha dejado de emitir imágenes.', 'NotReadableError');
    }
    return true;
  }

  async capture() {
    if (!this.stream?.getVideoTracks().some((track) => track.readyState === 'live') || this.video.readyState < 2 || !this.video.videoWidth) throw new Error('Espera a que la cámara esté preparada.');
    const canvas = document.createElement('canvas');
    // Store the whole camera frame, preserving its proportions. JPEG strips EXIF/location metadata.
    const scale = Math.min(1, 1920 / Math.max(this.video.videoWidth, this.video.videoHeight));
    canvas.width = Math.round(this.video.videoWidth * scale);
    canvas.height = Math.round(this.video.videoHeight * scale);
    canvas.getContext('2d').drawImage(this.video, 0, 0, canvas.width, canvas.height);
    const capturedAt = new Date().toISOString();
    const photo = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!photo) throw new Error('No se ha podido crear la fotografía. Vuelve a intentarlo.');
    return { id: crypto.randomUUID(), capturedAt, photo, origin: 'camera' };
  }

  stop() {
    this.generation++;
    this.pendingReady?.();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    if (this.video) this.video.srcObject = null;
  }
}

export function cameraError(error) {
  const messages = {
    NotAllowedError: 'El acceso a la cámara está bloqueado. Permítelo en los ajustes de este sitio en tu navegador y vuelve a intentarlo.',
    NotFoundError: 'No se ha encontrado una cámara en este dispositivo.',
    NotReadableError: 'La cámara no está disponible. Cierra otras aplicaciones que la estén utilizando e inténtalo de nuevo.',
    OverconstrainedError: 'Esta cámara no admite la configuración solicitada. Prueba con otra cámara o navegador.',
    AbortError: 'La cámara se ha interrumpido. Puedes abrirla de nuevo.',
  };
  return messages[error?.name] || error?.message || 'No se ha podido abrir la cámara.';
}
