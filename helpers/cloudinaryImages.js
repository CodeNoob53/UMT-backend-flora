import { getCloudinary } from '../config/cloudinary.js';

function getPublicIdFromUrl(imageUrl) {
  if (!imageUrl?.includes('res.cloudinary.com')) return null;
  const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match?.[1] ?? null;
}

export async function deleteBouquetImage(bouquet) {
  if (!bouquet?.photoURL) return;
  const publicId = getPublicIdFromUrl(bouquet.photoURL);
  if (!publicId) return;
  await getCloudinary().uploader.destroy(publicId, { resource_type: 'image' });
}
