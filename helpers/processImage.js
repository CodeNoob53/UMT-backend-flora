import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { IMAGE_BREAKPOINTS, AVIF_QUALITY, DPR_SCALES } from '../config/imageBreakpoints.js';

const PHOTOS_DIR = path.resolve('public/photos');

export async function processImage(tempPath, slug) {
  const buffer = await fs.readFile(tempPath);

  const avifFiles = [];

  for (const bp of IMAGE_BREAKPOINTS) {
    const dir = path.join(PHOTOS_DIR, bp.name);
    await fs.mkdir(dir, { recursive: true });

    for (const dpr of DPR_SCALES) {
      const filename = `${slug}_@${dpr}x.avif`;
      const outPath = path.join(dir, filename);

      await sharp(buffer)
        .resize(bp.width * dpr)
        .avif({ quality: AVIF_QUALITY[dpr] })
        .toFile(outPath);

      avifFiles.push(`${bp.name}/${filename}`);
    }
  }

  // mozjpeg fallback — quality 100 стискає через кращий алгоритм квантування
  const fallbackName = `${slug}.jpg`;
  await sharp(buffer)
    .jpeg({ mozjpeg: true, quality: 100 })
    .toFile(path.join(PHOTOS_DIR, fallbackName));

  await fs.unlink(tempPath);

  return {
    breakpoints: IMAGE_BREAKPOINTS.map(bp => bp.name),
    fallback: fallbackName,
    photoURL: `/photos/${fallbackName}`,
  };
}
