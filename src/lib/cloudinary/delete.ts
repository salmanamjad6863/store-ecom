import { configureCloudinary } from "@/lib/cloudinary/config";
import { cloudinaryPublicIdFromUrl, isCloudinaryImageUrl } from "@/lib/cloudinary/public-id";

export async function deleteImagesFromCloudinary(urls: string[]) {
  const cloudinary = configureCloudinary();

  const publicIds = [
    ...new Set(
      urls
        .filter(isCloudinaryImageUrl)
        .map(cloudinaryPublicIdFromUrl)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const results = await Promise.allSettled(
    publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true }),
    ),
  );

  return { publicIds, results };
}
