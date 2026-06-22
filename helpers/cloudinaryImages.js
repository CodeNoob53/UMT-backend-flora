import { getCloudinary } from '../config/cloudinary.js';

function getPublicIdFromUrl(photoURL) {
  if (!photoURL?.includes('/upload/')) return null;

  const withoutQuery = photoURL.split('?')[0];
  const match = withoutQuery.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match?.[1] ?? null;
}

function getBouquetPublicId(bouquet) {
  return getPublicIdFromUrl(bouquet?.photoURL)
    ?? (bouquet?.slug ? `flora/bouquets/${bouquet.slug}` : null)
    ?? (bouquet?.id ? `flora/bouquets/bouquet-${bouquet.id}` : null);
}

export async function deleteBouquetImage(bouquet) {
  if (!bouquet?.photoURL) return;

  const publicId = getBouquetPublicId(bouquet);
  if (!publicId) return;

  await getCloudinary().uploader.destroy(publicId, { resource_type: 'image' });
}
