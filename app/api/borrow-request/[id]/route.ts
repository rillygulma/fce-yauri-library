import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  const borrow = await BorrowRequest.findById(id)
    .populate("user");

  if (!borrow) {
    return NextResponse.json(
      { success: false },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    borrow,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  await BorrowRequest.findByIdAndDelete(id);

  return NextResponse.json({
    success: true,
    message: "Deleted",
  });
}