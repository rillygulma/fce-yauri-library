import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const today = new Date();

    const overdueBooks = await BorrowRequest.find({
      isReturned: false,
      status: "borrowed",
      dueDate: { $lt: today },
    })
      .populate(
        "user",
        "fullName email phoneNo role profilePicture staffNo admissionNo",
      )
      .sort({ dueDate: 1 });

    const booksWithFine = overdueBooks.map((book) => {
      const daysLate = Math.ceil(
        (today.getTime() - new Date(book.dueDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const role = (book.user?.role || "").toLowerCase();

      let finePerDay = 50; // Undergraduate default

      if (role.includes("postgraduate")) {
        finePerDay = 100;
      } else if (
        role.includes("staff") ||
        role.includes("librarian") ||
        role.includes("admin")
      ) {
        finePerDay = 200;
      }

      return {
        ...book.toObject(),
        daysLate,
        finePerDay,
        estimatedFine: daysLate * finePerDay,
      };
    });

    return NextResponse.json({
      success: true,
      count: booksWithFine.length,
      overdueBooks: booksWithFine,
    });
  } catch (error) {
    console.error("OVERDUE BOOKS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch overdue books",
      },
      { status: 500 },
    );
  }
}
