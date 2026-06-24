import fs from 'fs/promises';
import { getCloudinary } from '../config/cloudinary.js';

export async function processImage(tempPath, slug) {
  try {
    const publicId = `flora/bouquets/${slug}`;

    const result = await getCloudinary().uploader.upload(tempPath, {
      public_id: publicId,
      resource_type: 'image',
      overwrite: true,
      // Pre-generate AVIF retina variants so Cloudinary CDN can serve them on first request.
      eager: [
        { width: 335, crop: 'fill', format: 'avif', quality: 'auto' },
        { width: 670, crop: 'fill', format: 'avif', quality: 'auto' },
        { width: 340, crop: 'fill', format: 'avif', quality: 'auto' },
        { width: 680, crop: 'fill', format: 'avif', quality: 'auto' },
        { width: 405, crop: 'fill', format: 'avif', quality: 'auto' },
        { width: 810, crop: 'fill', format: 'avif', quality: 'auto' },
      ],
      eager_async: true,
    });

    return { photoURL: result.secure_url };
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}
