import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";
import BorrowRequest from "@/models/BorrowRequest";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const userId = body.userId;
    const resourceId = body.resourceId;

    if (!userId || !resourceId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID and resource ID are required.",
        },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(resourceId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user or resource ID.",
        },
        { status: 400 }
      );
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource not found.",
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

    if (
      !resource.availableCopies ||
      resource.availableCopies <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This book is currently unavailable.",
        },
        { status: 400 }
      );
    }

    const existingRequest =
      await BorrowRequest.findOne({
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
            "You already have an active request for this book.",
        },
        { status: 409 }
      );
    }

    const borrowRequest =
      await BorrowRequest.create({
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
    console.error(
      "BORROW REQUEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit borrow request.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| GET BORROW REQUESTS
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    await connectDB();

    const requests =
      await BorrowRequest.find()
        .populate(
          "user",
          "fullName email role staffNo admissionNo department"
        )
        .populate(
          "resource",
          "title authors isbn callNumber coverImage availableCopies totalCopies"
        )
        .sort({
          requestDate: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error(
      "GET BORROW REQUESTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch borrow requests.",
      },
      { status: 500 }
    );
  }
}