import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";
import BorrowRequest from "@/models/BorrowRequest";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();

    const { id } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid borrow request ID.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const action = body.action;

    if (
      action !== "approve" &&
      action !== "reject"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Action must be approve or reject.",
        },
        { status: 400 }
      );
    }

    const borrowRequest =
      await BorrowRequest.findById(id);

    if (!borrowRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Borrow request not found.",
        },
        { status: 404 }
      );
    }

    if (
      borrowRequest.status !== "pending"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This borrow request has already been processed.",
        },
        { status: 409 }
      );
    }

    /*
     * REJECT
     */

    if (action === "reject") {
      borrowRequest.status = "rejected";

      await borrowRequest.save();

      return NextResponse.json({
        success: true,
        message:
          "Borrow request rejected successfully.",
        borrowRequest,
      });
    }

    /*
     * APPROVE
     */

    const resource =
      await Resource.findById(
        borrowRequest.resource
      );

    if (!resource) {
      return NextResponse.json(
        {
          success: false,
          message: "Book not found.",
        },
        { status: 404 }
      );
    }

    if (
      resource.resourceType !== "book"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only books can be borrowed.",
        },
        { status: 400 }
      );
    }

    /*
     * Check availability again.
     *
     * This is important because another
     * request may have been approved first.
     */

    if (
      !resource.availableCopies ||
      resource.availableCopies <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This book is no longer available.",
        },
        { status: 409 }
      );
    }

    /*
     * Determine borrowing period.
     *
     * Undergraduate: 14 days
     * Postgraduate: 30 days
     * Staff: 30 days
     */

    let borrowingDays = 14;

    const userRole =
      String(borrowRequest.userRole || "");

    if (
      userRole === "postgraduate" ||
      userRole === "staff"
    ) {
      borrowingDays = 30;
    }

    const approvedDate =
      new Date();

    const dueDate =
      new Date(approvedDate);

    dueDate.setDate(
      dueDate.getDate() +
        borrowingDays
    );

    /*
     * Update borrow request
     */

    borrowRequest.status =
      "approved";

    borrowRequest.approvedDate =
      approvedDate;

    borrowRequest.dueDate =
      dueDate;

    borrowRequest.isReturned =
      false;

    /*
     * Update book copies
     */

    resource.availableCopies =
      Math.max(
        0,
        (resource.availableCopies || 0) -
          1
      );

    resource.borrowedCopies =
      (resource.borrowedCopies || 0) +
      1;

    await resource.save();
    await borrowRequest.save();

    return NextResponse.json({
      success: true,
      message:
        "Borrow request approved successfully.",
      borrowRequest,
      dueDate,
    });
  } catch (error) {
    console.error(
      "BORROW APPROVAL ERROR:",
      error
    );

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