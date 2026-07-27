import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const borrow = await BorrowRequest.findById(id).populate("user");

    if (!borrow) {
      return NextResponse.json(
        { success: false, message: "Borrow record not found" },
        { status: 404 }
      );
    }

    // ================= ALREADY RETURNED CHECK =================
    if (borrow.isReturned) {
      return NextResponse.json(
        {
          success: false,
          message: "This book has already been returned",
        },
        { status: 400 }
      );
    }

    const today = new Date();

    // ================= ROLE-BASED FINE SYSTEM =================
    const role = (borrow.user?.role || "").toLowerCase();

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

    // ================= FINE CALCULATION =================
    let fine = 0;

    if (borrow.dueDate && today > borrow.dueDate) {
      const daysLate = Math.ceil(
        (today.getTime() - borrow.dueDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      fine = daysLate * finePerDay;
    }

    // ================= STATUS LOGIC =================
    let status: "borrowed" | "returned" | "overdue" = "returned";

    if (today > borrow.dueDate && !borrow.isReturned) {
      status = "overdue";
    }

    // ================= UPDATE BORROW =================
    borrow.isReturned = true;
    borrow.returnDate = today;
    borrow.fine = fine;
    borrow.status = status;

    await borrow.save();

    return NextResponse.json({
      success: true,
      message: "Book returned successfully",
      data: {
        id: borrow._id,
        title: borrow.title,
        user: borrow.user,
        status: borrow.status,
        fine,
        returnDate: borrow.returnDate,
      },
    });
  } catch (error) {
    console.error("RETURN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}