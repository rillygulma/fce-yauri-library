import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Query is required", borrows: [] },
        { status: 400 }
      );
    }

    const cleaned = query.trim().toLowerCase();

    // ✅ FIX 1: case-insensitive search
    const user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${cleaned}$`, "i") } },
        { phoneNo: query.trim() },
      ],
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        borrows: [],
        message: "User not found",
      });
    }

    // ✅ FIX 2: ensure valid user ID exists in borrows
    const borrows = await BorrowRequest.find({
      user: user._id,
    })
      .sort({ createdAt: -1 })
      .populate("user", "fullName email phoneNo role profilePicture");

    return NextResponse.json({
      success: true,
      borrows,
      user, // optional but helpful for debugging
    });
  } catch (error) {
    console.error("SEARCH BORROW ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        borrows: [],
      },
      { status: 500 }
    );
  }
}