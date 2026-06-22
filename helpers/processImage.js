import fs from 'fs/promises';
import sharp from 'sharp';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';
import { IMAGE_BREAKPOINTS, AVIF_QUALITY, DPR_SCALES } from '../config/imageBreakpoints.js';

async function uploadBuffer(buffer, publicId, format, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: 'image', format, overwrite: true, ...options },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    Readable.from(buffer).pipe(stream);
  });
}

export async function processImage(tempPath, slug) {
  const original = await fs.readFile(tempPath);
  await fs.unlink(tempPath);

  const uploads = [];

  for (const bp of IMAGE_BREAKPOINTS) {
    for (const dpr of DPR_SCALES) {
      const buffer = await sharp(original)
        .resize(bp.width * dpr)
        .avif({ quality: AVIF_QUALITY[dpr] })
        .toBuffer();

      const publicId = `flora/bouquets/${bp.name}/${slug}_@${dpr}x`;
      await uploadBuffer(buffer, publicId, 'avif');
      uploads.push(publicId);
    }
  }

  // mozjpeg fallback
  const fallbackBuffer = await sharp(original)
    .jpeg({ mozjpeg: true, quality: 100 })
    .toBuffer();

  const fallbackPublicId = `flora/bouquets/fallback/${slug}`;
  const fallbackResult = await uploadBuffer(fallbackBuffer, fallbackPublicId, 'jpg');

  return {
    breakpoints: IMAGE_BREAKPOINTS.map(bp => bp.name),
    fallback: `${slug}.jpg`,
    photoURL: fallbackResult.secure_url,
  };
}
