import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";

export const runtime = "nodejs";

export async function GET() {
  await connectDB();

  const totalBorrowed =
    await BorrowRequest.countDocuments();

  const returnedBooks =
    await BorrowRequest.countDocuments({
      isReturned: true,
    });

  const activeBorrows =
    await BorrowRequest.countDocuments({
      isReturned: false,
    });

  const overdueBooks =
    await BorrowRequest.countDocuments({
      isReturned: false,
      dueDate: { $lt: new Date() },
    });

  const fineResult =
    await BorrowRequest.aggregate([
      {
        $group: {
          _id: null,
          totalFine: {
            $sum: "$fine",
          },
        },
      },
    ]);

  return NextResponse.json({
    success: true,
    totalBorrowed,
    activeBorrows,
    returnedBooks,
    overdueBooks,
    totalFine:
      fineResult[0]?.totalFine || 0,
  });
}