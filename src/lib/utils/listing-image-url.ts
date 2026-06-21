const LISTING_WIDTH = 600;
export const CART_THUMBNAIL_WIDTH = 200;

export type ListingImageDelivery = {
  src: string;
  unoptimized: boolean;
  usePreloadGate: boolean;
};

function hasCloudinaryTransforms(afterUpload: string): boolean {
  return /^(f_|c_|w_|h_|q_|e_)/.test(afterUpload);
}

/** Listing-card delivery: Cloudinary transforms + direct CDN; others via Next optimizer. */
export function getListingImageDelivery(
  src: string,
  width = LISTING_WIDTH,
): ListingImageDelivery {
  if (!src) {
    return { src: "", unoptimized: false, usePreloadGate: false };
  }

  if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) {
    return { src, unoptimized: false, usePreloadGate: false };
  }

  const uploadIndex = src.indexOf("/upload/");
  const afterUpload = src.slice(uploadIndex + "/upload/".length);

  if (hasCloudinaryTransforms(afterUpload)) {
    return { src, unoptimized: true, usePreloadGate: true };
  }

  return {
    src: src.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`),
    unoptimized: true,
    usePreloadGate: true,
  };
}

/** URL for cache warming — matches listing-card delivery. */
export function getListingImagePreloadUrl(src: string, width = LISTING_WIDTH): string {
  return getListingImageDelivery(src, width).src;
}

/** Cart drawer / checkout thumbnails (~84px display). */
export function getCartImageDelivery(src: string): ListingImageDelivery {
  return getListingImageDelivery(src, CART_THUMBNAIL_WIDTH);
}

export function getCartImagePreloadUrl(src: string): string {
  return getListingImagePreloadUrl(src, CART_THUMBNAIL_WIDTH);
}
