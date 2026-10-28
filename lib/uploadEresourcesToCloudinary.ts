import type { UploadApiResponse } from "cloudinary";
import cloudinary from "./cloudinary";

export async function uploadToCloudinary(
  file: Buffer,
  folder: string,
  resourceType: "image" | "raw" = "image",
): Promise<UploadApiResponse> {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary returned no upload result."));
            return;
          }

          resolve(result);
        },
      )
      .end(file);
  });
}