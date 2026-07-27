import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";

// ==============================
// CREATE CONTACT MESSAGE
// ==============================
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const message = body.message?.trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    const newContact = await Contact.create({
      name,
      email,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        data: newContact,
      },
      { status: 201 }
    );
  } catch  {
    return NextResponse.json(
      {
        success: false,
        error: "Server Error",
      },
      { status: 500 }
    );
  }
}

// ==============================
// GET ALL CONTACT MESSAGES
// ==============================
export async function GET() {
  try {
    await connectDB();

    const contacts = await Contact.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: contacts.length,
        data: contacts,
      },
      { status: 200 }
    );
  } catch  {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}

// ==============================
// DELETE CONTACT MESSAGE
// ==============================
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Message ID is required",
        },
        { status: 400 }
      );
    }

    const deletedMessage = await Contact.findByIdAndDelete(id);

    if (!deletedMessage) {
      return NextResponse.json(
        {
          success: false,
          error: "Message not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message deleted successfully",
      },
      { status: 200 }
    );
  } catch  {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete message",
      },
      { status: 500 }
    );
  }
}