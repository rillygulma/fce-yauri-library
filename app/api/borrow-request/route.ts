import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";
import User from "@/models/User";
import Resource from "@/models/Resource";

export const runtime = "nodejs";

function getDailyFineForRole(role?: string) {
  switch (role?.toLowerCase()) {
    case "staff":
      return 100;

    case "student":
      return 50;

    default:
      return 0;
  }
}

function getOverdueDays(
  dueDate: Date,
  returnDate: Date
) {
  const dueDay = Date.UTC(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  const returnDay = Date.UTC(
    returnDate.getFullYear(),
    returnDate.getMonth(),
    returnDate.getDate()
  );

  return Math.max(
    0,
    Math.floor(
      (returnDay - dueDay) /
        (1000 * 60 * 60 * 24)
    )
  );
}

/* ================================================================
   GET ALL BORROW REQUESTS
   Used by the librarian dashboard
================================================================ */

export async function GET() {
  try {
    await connectDB();

    const requests = await BorrowRequest.find({})
      .populate(
        "user",
        "fullName email role phoneNo staffNo admissionNo department"
      )
      .populate(
        "resource",
        "title authors isbn callNumber coverImage availableCopies borrowedCopies resourceType"
      )
      .sort({ requestDate: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("GET BORROW REQUESTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load borrow requests.",
      },
      { status: 500 }
    );
  }
}

/* ================================================================
   CREATE BORROW REQUEST
================================================================ */

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const userId =
      typeof body.userId === "string"
        ? body.userId.trim()
        : "";

    const resourceId =
      typeof body.resourceId === "string"
        ? body.resourceId.trim()
        : "";

    if (!userId || !resourceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in before requesting a book.",
        },
        { status: 401 }
      );
    }

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(resourceId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user or book information.",
        },
        { status: 400 }
      );
    }

    const resource = await Resource.findOne({
      _id: resourceId,
      resourceType: "book",
    });

    if (!resource) {
      return NextResponse.json(
        {
          success: false,
          message: "Book not found.",
        },
        { status: 404 }
      );
    }

    if ((resource.availableCopies ?? 0) <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This book is currently unavailable.",
        },
        { status: 400 }
      );
    }

    const existingRequest = await BorrowRequest.findOne({
      user: userId,
      resource: resourceId,
      status: {
        $in: ["pending", "approved"],
      },
      isReturned: false,
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have already borrowed or reserved this book.",
        },
        { status: 409 }
      );
    }

    const borrowRequest = await BorrowRequest.create({
      user: userId,
      resource: resourceId,
      status: "pending",
      requestDate: new Date(),
      isReturned: false,
      fine: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Borrow request submitted successfully. Please wait for librarian approval.",
        borrowRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE BORROW REQUEST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit borrow request.",
      },
      { status: 500 }
    );
  }
}

/* ================================================================
   APPROVE, REJECT, OR RETURN A BOOK
================================================================ */

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const requestId =
      typeof body.requestId === "string"
        ? body.requestId.trim()
        : "";

    const action =
      typeof body.action === "string"
        ? body.action.trim()
        : "";

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          message: "Borrow request ID is required.",
        },
        { status: 400 }
      );
    }

    if (!mongoose.isValidObjectId(requestId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid borrow request ID.",
        },
        { status: 400 }
      );
    }

    if (
      !["approved", "rejected", "returned"].includes(
        action
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid action. Use approved, rejected, or returned.",
        },
        { status: 400 }
      );
    }

    const borrowRequest =
      await BorrowRequest.findById(requestId);

    if (!borrowRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Borrow request not found.",
        },
        { status: 404 }
      );
    }

    /* ============================================================
       RETURN BOOK
    ============================================================ */

    if (action === "returned") {
      if (
        borrowRequest.status !== "approved" ||
        borrowRequest.isReturned
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Only an approved, unreturned book can be marked as returned.",
          },
          { status: 409 }
        );
      }

      const resource = await Resource.findById(
        borrowRequest.resource
      );

      if (!resource) {
        return NextResponse.json(
          {
            success: false,
            message: "Book/resource not found.",
          },
          { status: 404 }
        );
      }

      const user = await User.findById(
        borrowRequest.user
      );

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "Borrower not found.",
          },
          { status: 404 }
        );
      }

      const returnDate = new Date();

      const overdueDays = borrowRequest.dueDate
        ? getOverdueDays(
            new Date(borrowRequest.dueDate),
            returnDate
          )
        : 0;

      const dailyFine = getDailyFineForRole(
        user.role
      );

      const fine = overdueDays * dailyFine;

      borrowRequest.status = "returned";
      borrowRequest.isReturned = true;
      borrowRequest.returnDate = returnDate;
      borrowRequest.fine = fine;

      resource.availableCopies =
        (resource.availableCopies ?? 0) + 1;

      if (
        typeof resource.borrowedCopies === "number"
      ) {
        resource.borrowedCopies = Math.max(
          0,
          resource.borrowedCopies - 1
        );
      }

      await resource.save();
      await borrowRequest.save();

      return NextResponse.json(
        {
          success: true,
          message:
            overdueDays > 0
              ? `Book returned successfully. It was ${overdueDays} day(s) overdue. Fine: ₦${fine.toLocaleString()}.`
              : "Book returned successfully. No fine was charged.",
          request: borrowRequest,
          overdueDays,
          fine,
        },
        { status: 200 }
      );
    }

    /* ============================================================
       APPROVE OR REJECT: only pending requests qualify
    ============================================================ */

    if (borrowRequest.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: `This request has already been ${borrowRequest.status}.`,
        },
        { status: 409 }
      );
    }

    /* ============================================================
       REJECT
    ============================================================ */

    if (action === "rejected") {
      borrowRequest.status = "rejected";

      await borrowRequest.save();

      return NextResponse.json({
        success: true,
        message: "Borrow request rejected successfully.",
        request: borrowRequest,
      });
    }

    /* ============================================================
       APPROVE
    ============================================================ */

    const resource = await Resource.findById(
      borrowRequest.resource
    );

    if (!resource) {
      return NextResponse.json(
        {
          success: false,
          message: "Book/resource not found.",
        },
        { status: 404 }
      );
    }

    if (resource.resourceType !== "book") {
      return NextResponse.json(
        {
          success: false,
          message: "Only books can be borrowed.",
        },
        { status: 400 }
      );
    }

    if ((resource.availableCopies ?? 0) <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This book is no longer available.",
        },
        { status: 409 }
      );
    }

    const user = await User.findById(
      borrowRequest.user
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Borrower not found.",
        },
        { status: 404 }
      );
    }

    let dueDays = 14;

    if (user.role === "staff") {
      dueDays = 30;
    }

    const approvedDate = new Date();
    const dueDate = new Date(approvedDate);

    dueDate.setDate(
      dueDate.getDate() + dueDays
    );

    borrowRequest.status = "approved";
    borrowRequest.approvedDate = approvedDate;
    borrowRequest.dueDate = dueDate;
    borrowRequest.isReturned = false;
    borrowRequest.fine = 0;

    resource.availableCopies = Math.max(
      0,
      (resource.availableCopies ?? 0) - 1
    );

    resource.borrowedCopies =
      (resource.borrowedCopies ?? 0) + 1;

    await resource.save();
    await borrowRequest.save();

    return NextResponse.json({
      success: true,
      message: "Borrow request approved successfully.",
      request: borrowRequest,
    });
  } catch (error) {
    console.error("UPDATE BORROW REQUEST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to process borrow request.",
      },
      { status: 500 }
    );
  }
}