import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";

export const runtime = "nodejs";

/* ================= GET USER BORROW HISTORY ================= */
export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const borrows = await BorrowRequest.find({
      user: userId,
    })
      .populate("user", "fullName email role phoneNo")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      borrows,
    });
  } catch (error) {
    console.error("BORROW HISTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch borrow history",
      },
      { status: 500 }
    );
  }
}