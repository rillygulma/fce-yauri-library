import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Announcement from "@/models/Announcement";

// ================= CREATE announcement =================
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { title, message, createdBy } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 },
      );
    }

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: createdBy || "Admin",
    });

    return NextResponse.json(
      {
        success: true,
        data: announcement,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 },
    );
  }
}

// ================= GET all announcements =================
export async function GET() {
  try {
    await connectDB();

    const announcements = await Announcement.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: announcements,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 },
    );
  }
}

// ================= DELETE announcement =================
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 },
      );
    }

    const deleted = await Announcement.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 },
    );
  }
}
