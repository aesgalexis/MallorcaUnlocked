import { cp, copyFile, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.resolve(root, 'dist');
// The only recursive removal is a literal build directory, checked to remain inside this checkout.
if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== 'dist') throw new Error('Unsafe build output path.');
await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'vendor'), { recursive: true });
for (const entry of ['index.html', 'assets', 'src', 'recognition']) await cp(path.join(root, entry), path.join(output, entry), { recursive: true });
const library = path.join(root, 'node_modules/@techstark/opencv-js');
const installed = JSON.parse(await readFile(path.join(library, 'package.json'), 'utf8'));
if (installed.version !== '4.12.0-release.1') throw new Error('Unexpected OpenCV runtime version. Use npm ci.');
await copyFile(path.join(library, 'dist/opencv.js'), path.join(output, 'vendor/opencv.js'));
await copyFile(path.join(library, 'LICENSE'), path.join(output, 'vendor/OPENCV-LICENSE.txt'));
await copyFile(path.join(root, 'THIRD_PARTY_NOTICES.md'), path.join(output, 'THIRD_PARTY_NOTICES.md'));
await copyFile(path.join(root, 'assets/favicon.svg'), path.join(output, 'favicon.svg'));
await cp(path.join(root, 'docs'), path.join(output, 'docs'), { recursive: true });
await import('node:fs/promises').then(({ writeFile }) => writeFile(path.join(output, '.nojekyll'), ''));
console.log(`Static application built in dist/ (OpenCV ${(await stat(path.join(output, 'vendor/opencv.js'))).size} bytes; lazy-loaded, recognition disabled).`);
