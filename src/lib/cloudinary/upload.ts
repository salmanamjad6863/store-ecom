import { configureCloudinary } from "@/lib/cloudinary/config";

export async function uploadImageToCloudinary(
  file: Buffer,
  filename: string,
): Promise<string> {
  const cloudinary = configureCloudinary();

  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "store-ecom/products";

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}-${filename.replace(/\.[^.]+$/, "")}`,
        resource_type: "image",
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve(uploadResult);
      },
    );

    stream.end(file);
  });

  return result.secure_url;
}
