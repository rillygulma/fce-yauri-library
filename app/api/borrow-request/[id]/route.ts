import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";
import Resource from "@/models/Resource";

export const runtime = "nodejs";

type Action = "approve" | "reject";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/* ================================================================
   APPROVE OR REJECT BORROW REQUEST
================================================================ */

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid borrow request ID.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const action = body.action as Action;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        {
          success: false,
          message: "Action must be approve or reject.",
        },
        { status: 400 }
      );
    }

    const borrowRequest = await BorrowRequest.findById(id);

    if (!borrowRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Borrow request not found.",
        },
        { status: 404 }
      );
    }

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
       REJECT REQUEST
    ============================================================ */

    if (action === "reject") {
      borrowRequest.status = "rejected";

      await borrowRequest.save();

      return NextResponse.json({
        success: true,
        message: "Borrow request rejected successfully.",
        request: borrowRequest,
      });
    }

    /* ============================================================
       APPROVE REQUEST
    ============================================================ */

    const resource = await Resource.findById(borrowRequest.resource);

    if (!resource) {
      return NextResponse.json(
        {
          success: false,
          message: "Book associated with this request was not found.",
        },
        { status: 404 }
      );
    }

    if ((resource.availableCopies ?? 0) <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No available copies remain for this book.",
        },
        { status: 409 }
      );
    }

    const now = new Date();

    // Default borrowing period: 14 days
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 14);

    resource.availableCopies = Math.max(
      0,
      (resource.availableCopies ?? 0) - 1
    );

    resource.borrowedCopies =
      (resource.borrowedCopies ?? 0) + 1;

    await resource.save();

    borrowRequest.status = "approved";
    borrowRequest.approvedDate = now;
    borrowRequest.dueDate = dueDate;

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
        message: "Failed to update borrow request.",
      },
      { status: 500 }
    );
  }
}