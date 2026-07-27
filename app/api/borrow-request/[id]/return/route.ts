import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const borrow = await BorrowRequest.findById(id);

    if (!borrow) {
      return NextResponse.json(
        { success: false },
        { status: 404 }
      );
    }

    const today = new Date();

    let fine = 0;

    if (today > borrow.dueDate) {
      const daysLate = Math.ceil(
        (today.getTime() -
          borrow.dueDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      fine = daysLate * 100;
    }

    borrow.isReturned = true;
    borrow.returnDate = today;
    borrow.fine = fine;
    borrow.status = "returned";

    await borrow.save();

    return NextResponse.json({
      success: true,
      fine,
      borrow,
    });
  } catch {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}