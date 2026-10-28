import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import type { UploadApiResponse } from "cloudinary";

import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import { uploadToCloudinary } from "@/lib/uploadEresourcesToCloudinary";
import EResource from "@/models/EResource";
import { requireLibrarian } from "@/lib/requireLibrarian";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const allowedTypes = ["ebook", "journal"] as const;

function cleanString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const params = request.nextUrl.searchParams;
    const adminView = params.get("admin") === "true";

    if (adminView) {
      try {
        await requireLibrarian();
      } catch {
        return jsonError("Unauthorized.", 401);
      }
    }

    const query = (params.get("query") ?? "").trim();
    const type = (params.get("type") ?? "").trim();
    const subject = (params.get("subject") ?? "").trim();
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 12));

    if (
      type &&
      type !== "all" &&
      !allowedTypes.includes(type as (typeof allowedTypes)[number])
    ) {
      return jsonError("Invalid E-Resource type.", 400);
    }

    const filter: {
      status: "published";
      type?: "ebook" | "journal";
      subject?: { $regex: string; $options: string };
      $or?: Array<Record<string, unknown>>;
    } = {
      status: "published",
    };

    if (type && type !== "all") {
      if (type !== "ebook" && type !== "journal") {
        return jsonError("Invalid E-Resource type.", 400);
      }

      filter.type = type;
    }

    if (subject) {
      filter.subject = {
        $regex: subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    if (query) {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { author: { $regex: escaped, $options: "i" } },
        { subject: { $regex: escaped, $options: "i" } },
        { department: { $regex: escaped, $options: "i" } },
        { publisher: { $regex: escaped, $options: "i" } },
        { keywords: { $regex: escaped, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      EResource.find(filter)
        .select("-cloudinaryPublicId -createdBy")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EResource.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      resources,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET E-RESOURCES ERROR:", error);
    return jsonError("Failed to fetch E-Resources.", 500);
  }
}

export async function POST(request: NextRequest) {
  let uploadedPublicId: string | undefined;

  try {
    const user = await requireLibrarian();

    if (!user) {
      return jsonError("Unauthorized.", 401);
    }

    if (!Types.ObjectId.isValid(user.id)) {
      return jsonError("Invalid authenticated user.", 401);
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get("pdf");

    const title = cleanString(formData.get("title"));
    const type = cleanString(formData.get("type"));
    const author = cleanString(formData.get("author"));
    const subject = cleanString(formData.get("subject"));
    const department = cleanString(formData.get("department"));
    const description = cleanString(formData.get("description"));
    const publisher = cleanString(formData.get("publisher"));
    const isbn = cleanString(formData.get("isbn"));
    const volume = cleanString(formData.get("volume"));
    const issue = cleanString(formData.get("issue"));
    const status = cleanString(formData.get("status")) || "published";

    if (!title || title.length > 200) {
      return jsonError(
        "Title is required and must not exceed 200 characters.",
        400,
      );
    }

    if (!allowedTypes.includes(type as (typeof allowedTypes)[number])) {
      return jsonError("Choose ebook or journal.", 400);
    }

    if (!["draft", "published"].includes(status)) {
      return jsonError("Invalid publication status.", 400);
    }

    if (
      author.length > 200 ||
      subject.length > 120 ||
      department.length > 120 ||
      description.length > 3000 ||
      publisher.length > 200 ||
      isbn.length > 40 ||
      volume.length > 40 ||
      issue.length > 40
    ) {
      return jsonError("One or more fields exceed their allowed length.", 400);
    }

    const yearText = cleanString(formData.get("publicationYear"));
    let publicationYear: number | undefined;

    if (yearText) {
      publicationYear = Number(yearText);

      if (
        !Number.isInteger(publicationYear) ||
        publicationYear < 1000 ||
        publicationYear > 2100
      ) {
        return jsonError("Enter a valid publication year.", 400);
      }
    }

    const keywords = cleanString(formData.get("keywords"))
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean)
      .slice(0, 30);

    if (keywords.some((keyword) => keyword.length > 100)) {
      return jsonError("Each keyword must be at most 100 characters.", 400);
    }

    if (!(file instanceof File) || file.size === 0) {
      return jsonError("Please select a PDF file.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError("PDF must not exceed 20 MB.", 400);
    }

    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return jsonError("Only PDF files are accepted.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const signature = buffer.subarray(0, 5).toString("ascii");

    if (signature !== "%PDF-") {
      return jsonError("The uploaded file is not a valid PDF.", 400);
    }

    const upload: UploadApiResponse = await uploadToCloudinary(
      buffer,
      "fce-yauri-library/e-resources",
      "raw",
    );

    uploadedPublicId = upload.public_id;

    const resource = await EResource.create({
      title,
      type: type as (typeof allowedTypes)[number],
      author,
      subject,
      department,
      description,
      publisher,
      publicationYear,
      isbn,
      volume,
      issue,
      keywords,
      pdfUrl: upload.secure_url,
      cloudinaryPublicId: upload.public_id,
      originalFileName: file.name.slice(0, 255),
      fileSize: upload.bytes,
      status: status as "draft" | "published",
      createdBy: new Types.ObjectId(user.id),
    });

    return NextResponse.json(
      {
        success: true,
        message: "E-Resource uploaded successfully.",
        resource,
      },
      { status: 201 },
    );
  } catch (error) {
    if (uploadedPublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedPublicId, {
          resource_type: "raw",
        });
      } catch (cleanupError) {
        console.error("CLOUDINARY CLEANUP ERROR:", cleanupError);
      }
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonError("You are not authorized to upload E-Resources.", 401);
    }

    console.error("CREATE E-RESOURCE ERROR:", error);
    return jsonError("Failed to upload E-Resource.", 500);
  }
}
