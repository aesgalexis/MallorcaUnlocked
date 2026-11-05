import test from 'node:test';
import assert from 'node:assert/strict';
import { Camera, cameraError } from '../../src/lib/camera.js';

test('camera requests video only and releases a permission result arriving after closing', async () => {
  globalThis.isSecureContext = true;
  let release, stopped = false, constraints;
  const stream = { getTracks: () => [{ stop: () => { stopped = true; } }] };
  const media = { getUserMedia: (requested) => { constraints = requested; return new Promise((resolve) => { release = resolve; }); } };
  const camera = new Camera({ srcObject: null, play: async () => {} }, media);
  const starting = camera.start();
  camera.stop();
  release(stream);
  assert.equal(await starting, false);
  assert.equal(stopped, true);
  assert.equal(constraints.audio, false);
  assert.equal(constraints.video.facingMode.ideal, 'environment');
  assert.equal(camera.stream, null);
});

test('camera requires a secure context and does not offer a gallery fallback', async () => {
  globalThis.isSecureContext = false;
  await assert.rejects(new Camera({}).start(), /HTTPS/);
  globalThis.isSecureContext = true;
  await assert.rejects(new Camera({}, {}).start(), /galería/);
  assert.match(cameraError({ name: 'NotAllowedError' }), /bloqueado/);
  assert.match(cameraError({ name: 'NotFoundError' }), /cámara/);
});
