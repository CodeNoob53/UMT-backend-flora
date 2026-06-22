import fs from 'fs/promises';
import { getCloudinary } from '../config/cloudinary.js';

export async function processImage(tempPath, slug) {
  try {
    const result = await getCloudinary().uploader.upload(tempPath, {
      public_id: `flora/bouquets/${slug}`,
      resource_type: 'image',
      overwrite: true,
    });

    return {
      photoURL: result.secure_url,
    };
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
}
