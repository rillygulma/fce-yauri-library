import cloudinary from "./cloudinary";

export async function uploadToCloudinary(
  file: Buffer,
  folder: string,
  resourceType: "image" | "raw" = "image"
) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) return reject(error);

          resolve(result);
        }
      )
      .end(file);
  });
}