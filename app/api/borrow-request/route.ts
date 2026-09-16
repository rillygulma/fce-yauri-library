import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import {connectDB} from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";
import User from "@/models/User";
import Resource from "@/models/Resource";

export const runtime = "nodejs";

/* ================================================================
   GET ALL BORROW REQUESTS
   Used by the librarian dashboard
================================================================ */

export async function GET() {
  try {
    await connectDB();

    // Ensure the referenced models are registered
    void User;
    void Resource;

    const requests = await BorrowRequest.find({})
      .populate(
        "user",
        "fullName email role phoneNo staffNo admissionNo department"
      )
      .populate(
        "resource",
        "title authors isbn callNumber coverImage availableCopies resourceType"
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
      typeof body.userId === "string" ? body.userId.trim() : "";

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

    const Resource = mongoose.models.Resource;

    if (!Resource) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource model is not registered.",
        },
        { status: 500 }
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
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already borrowed or reserved this book.",
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