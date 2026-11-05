/* Classic worker: OpenCV's UMD runtime is loaded only for a validated reference set. */
self.onmessage = async ({ data: { photo, manifest, baseUrl } }) => {
  const resources = [];
  const keep = (value) => { resources.push(value); return value; };
  try {
    const runtimeUrl = new URL(manifest.runtime, baseUrl);
    if (runtimeUrl.origin !== self.location.origin) throw new Error('El motor debe estar alojado en el mismo origen.');
    importScripts(runtimeUrl.href);
    let runtime = self.cv;
    if (runtime instanceof Promise) runtime = await runtime;
    else if (!runtime?.Mat) await new Promise((resolve) => { runtime.onRuntimeInitialized = resolve; });
    const cv = runtime;
    if (!cv?.ORB || !cv?.findHomography) throw new Error('Esta distribución de OpenCV no incluye ORB y homografía.');
    const detector = keep(new cv.ORB());
    const matcher = keep(new cv.BFMatcher(cv.NORM_HAMMING, false));

    async function extract(blob) {
      const bitmap = await createImageBitmap(blob);
      try {
        const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
        const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const rgba = cv.matFromImageData(context.getImageData(0, 0, canvas.width, canvas.height));
        const gray = new cv.Mat();
        const mask = new cv.Mat();
        const keypoints = new cv.KeyPointVector();
        const descriptors = new cv.Mat();
        try {
          cv.cvtColor(rgba, gray, cv.COLOR_RGBA2GRAY);
          detector.detectAndCompute(gray, mask, keypoints, descriptors);
          return { keypoints, descriptors, width: canvas.width, height: canvas.height };
        } catch (error) { keypoints.delete(); descriptors.delete(); throw error; }
        finally { rgba.delete(); gray.delete(); mask.delete(); }
      } finally { bitmap.close(); }
    }

    const query = await extract(photo);
    keep(query.keypoints); keep(query.descriptors);
    const results = [];
    if (!query.descriptors.empty()) for (const reference of manifest.references) {
      const url = new URL(reference.path, baseUrl);
      if (url.origin !== self.location.origin) throw new Error('Las referencias deben ser locales.');
      const response = await fetch(url);
      if (!response.ok) throw new Error('No se encuentra una referencia visual.');
      const target = await extract(await response.blob());
      const matches = new cv.DMatchVectorVector();
      const matrices = [];
      try {
        if (target.descriptors.rows < 2) continue;
        matcher.knnMatch(query.descriptors, target.descriptors, matches, 2);
        const from = [], to = [], used = new Set();
        for (let i = 0; i < matches.size(); i++) {
          const pair = matches.get(i);
          try {
            if (pair.size() < 2) continue;
            const first = pair.get(0), second = pair.get(1);
            if (first.distance >= manifest.thresholds.ratioTest * second.distance || used.has(first.trainIdx)) continue;
            used.add(first.trainIdx);
            const q = query.keypoints.get(first.queryIdx).pt;
            const t = target.keypoints.get(first.trainIdx).pt;
            from.push(q.x, q.y); to.push(t.x, t.y);
          } finally { pair.delete(); }
        }
        const count = from.length / 2;
        if (count < manifest.thresholds.minMatches) continue;
        const source = cv.matFromArray(count, 1, cv.CV_32FC2, from);
        const destination = cv.matFromArray(count, 1, cv.CV_32FC2, to);
        const inlierMask = new cv.Mat();
        matrices.push(source, destination, inlierMask);
        const homography = cv.findHomography(source, destination, cv.RANSAC, 3, inlierMask);
        matrices.push(homography);
        if (homography.empty()) continue;
        let inliers = 0;
        const xs = [], ys = [];
        for (let i = 0; i < count; i++) if (inlierMask.data[i]) { inliers++; xs.push(from[i * 2]); ys.push(from[i * 2 + 1]); }
        const coverage = inliers ? ((Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys))) / (query.width * query.height) : 0;
        results.push({ placeId: reference.placeId, matches: count, inliers, inlierRatio: inliers / count, coverage });
      } finally {
        matrices.forEach((matrix) => matrix.delete());
        matches.delete(); target.keypoints.delete(); target.descriptors.delete();
      }
    }
    self.postMessage({ results });
  } catch (error) { self.postMessage({ error: String(error?.message || error) }); }
  finally { resources.reverse().forEach((resource) => resource.delete()); }
};
