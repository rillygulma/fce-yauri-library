import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const query =
      req.nextUrl.searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email or phone number required",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      $or: [
        { email: query },
        { phoneNo: query },
      ],
    }).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch  {
    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}