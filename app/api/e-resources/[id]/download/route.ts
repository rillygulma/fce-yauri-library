
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import EResource from "@/models/EResource";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid resource ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const resource = await EResource.findOneAndUpdate(
      { _id: id, status: "published" },
      { $inc: { downloads: 1 } },
      { new: true },
    ).select("pdfUrl");

    if (!resource) {
      return NextResponse.json(
        { success: false, message: "Resource not found." },
        { status: 404 },
      );
    }

    const pdfUrl = new URL(resource.pdfUrl);

    if (
      pdfUrl.protocol !== "https:" ||
      pdfUrl.hostname !== "res.cloudinary.com"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid PDF destination." },
        { status: 500 },
      );
    }

    return NextResponse.redirect(pdfUrl, 302);
  } catch (error) {
    console.error("E-RESOURCE DOWNLOAD ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to open this PDF." },
      { status: 500 },
    );
  }
}
