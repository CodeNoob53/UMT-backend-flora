import { getCloudinary } from '../config/cloudinary.js';
import { IMAGE_BREAKPOINTS, DPR_SCALES } from '../config/imageBreakpoints.js';

export function getBouquetImageSlug(bouquet) {
  if (bouquet?.fallback) {
    return bouquet.fallback.replace(/\.[^.]+$/, '');
  }

  if (bouquet?.slug) return bouquet.slug;
  if (bouquet?.id) return `bouquet-${bouquet.id}`;
  return null;
}

function getBouquetImagePublicIds(bouquet) {
  if (!bouquet?.photoURL) return [];

  const slug = getBouquetImageSlug(bouquet);
  if (!slug) return [];

  const breakpointNames = bouquet.breakpoints?.length
    ? bouquet.breakpoints
    : IMAGE_BREAKPOINTS.map(bp => bp.name);

  const responsiveIds = breakpointNames.flatMap(bp =>
    DPR_SCALES.map(dpr => `flora/bouquets/${bp}/${slug}_@${dpr}x`)
  );

  return [...responsiveIds, `flora/bouquets/fallback/${slug}`];
}

export async function deleteBouquetImages(bouquet) {
  const publicIds = getBouquetImagePublicIds(bouquet);
  if (publicIds.length === 0) return;

  await Promise.allSettled(
    publicIds.map(publicId =>
      getCloudinary().uploader.destroy(publicId, { resource_type: 'image' })
    )
  );
}
