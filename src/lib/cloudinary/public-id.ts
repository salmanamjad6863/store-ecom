const TRANSFORM_SEGMENT = /^([a-z0-9_]+,[a-z0-9_]+|[a-z]{1,2}_[a-z0-9,_-]+)$/i;

export function isCloudinaryImageUrl(url: string): boolean {
  return url.includes("res.cloudinary.com") && url.includes("/upload/");
}

export function cloudinaryPublicIdFromUrl(url: string): string | null {
  if (!isCloudinaryImageUrl(url)) {
    return null;
  }

  let path = url.split("/upload/")[1]?.split("?")[0];
  if (!path) {
    return null;
  }

  path = path.replace(/\.[a-z0-9]+$/i, "");
  const segments = path.split("/");

  while (segments.length > 0) {
    const head = segments[0];

    if (/^v\d+$/.test(head)) {
      segments.shift();
      break;
    }

    if (head.includes(",") || TRANSFORM_SEGMENT.test(head)) {
      segments.shift();
      continue;
    }

    break;
  }

  return segments.length > 0 ? segments.join("/") : null;
}
