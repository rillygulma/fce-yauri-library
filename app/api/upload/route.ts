import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isImage = file.type.startsWith("image/");

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "library-resources",
            resource_type: isImage ? "image" : "raw",
          },
          (error, uploaded) => {
            if (error) return reject(error);
            resolve(uploaded as UploadApiResponse);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Upload failed" },
      { status: 500 }
    );
  }
}