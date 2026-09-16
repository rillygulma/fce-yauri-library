import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";
import User from "@/models/User";
import Resource from "@/models/Resource";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ userId: string }>;
  }
) {
  try {
    await connectDB();

    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        { status: 400 }
      );
    }

    // Validate the user ID before querying MongoDB
    if (!mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        { status: 400 }
      );
    }

    // Ensure referenced models are registered before populate()
    void User;
    void Resource;

    // Fetch only this user's borrowing history
    const requests = await BorrowRequest.find({
      user: new mongoose.Types.ObjectId(userId),
    })
      .populate(
        "user",
        "fullName email role phoneNo staffNo admissionNo department"
      )
      .populate(
        "resource",
        "title authors isbn callNumber coverImage subject edition publicationYear publisher"
      )
      .sort({ requestDate: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("BORROW HISTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch borrow history.",
      },
      { status: 500 }
    );
  }
}