import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import cloudinary from "@/lib/cloudinary";

// ================= CLOUDINARY UPLOAD =================
const uploadToCloudinary = async (file: File): Promise<string> => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "fubk-library/blogs",
      },
      (error: unknown, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      }
    );

    stream.end(buffer);
  });
};

// ================= GET ALL POSTS =================
export async function GET() {
  try {
    await connectDB();

    const posts = await Blog.find().sort({ createdAt: -1 });

    return NextResponse.json(posts);
  } catch  {
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

// ================= CREATE POST =================
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const content = formData.get("content")?.toString() || "";

    const files = formData.getAll("images") as File[];

    const validFiles = files.filter(
      (file): file is File => file instanceof File && file.size > 0
    );

    const images =
      validFiles.length > 0
        ? await Promise.all(validFiles.map(uploadToCloudinary))
        : [];

    const newPost = await Blog.create({
      title,
      description,
      content,
      images,
      date: new Date().toISOString(),
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch  {
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}

// ================= UPDATE POST =================
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const content = formData.get("content")?.toString() || "";

    const files = formData.getAll("images") as File[];

    const validFiles = files.filter(
      (file): file is File => file instanceof File && file.size > 0
    );

    const images =
      validFiles.length > 0
        ? await Promise.all(validFiles.map(uploadToCloudinary))
        : [];

    const updateData: {
      title: string;
      description: string;
      content: string;
      images?: string[];
    } = {
      title,
      description,
      content,
    };

    if (images.length > 0) {
      updateData.images = images;
    }

    const updated = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(updated);
  } catch  {
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

// ================= DELETE POST =================
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }

    await Blog.findByIdAndDelete(id);

    return NextResponse.json({ error: "Deleted successfully" });
  } catch  {
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}