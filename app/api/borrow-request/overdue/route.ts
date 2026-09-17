import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";
import User from "@/models/User";
import Resource from "@/models/Resource";

export const runtime = "nodejs";

function getFinePerDay(role?: string) {
  switch (role?.toLowerCase()) {
    case "staff":
      return 100;

    case "student":
      return 50;

    default:
      return 0;
  }
}

function getDaysLate(dueDate: Date) {
  const dueDay = Date.UTC(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  const today = new Date();

  const todayDay = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return Math.max(
    0,
    Math.floor(
      (todayDay - dueDay) /
        (1000 * 60 * 60 * 24)
    )
  );
}

export async function GET() {
  try {
    await connectDB();

    // Keeps the referenced models registered for populate().
    void User;
    void Resource;

    const requests = await BorrowRequest.find({
      status: "approved",
      isReturned: false,
      dueDate: { $exists: true },
    })
      .populate(
        "user",
        "fullName email role admissionNo staffNo phoneNo"
      )
      .populate(
        "resource",
        "title authors isbn callNumber"
      )
      .sort({ dueDate: 1 })
      .lean();

    const overdueBooks = requests
      .filter((request) => {
        if (!request.dueDate) {
          return false;
        }

        return getDaysLate(
          new Date(request.dueDate)
        ) > 0;
      })
      .map((request) => {
        const user = request.user as {
          fullName?: string;
          email?: string;
          role?: string;
          admissionNo?: string;
          staffNo?: string;
          phoneNo?: string;
        };

        const resource = request.resource as {
          title?: string;
          authors?: string[];
          isbn?: string;
        };

        const daysLate = getDaysLate(
          new Date(request.dueDate!)
        );

        const finePerDay = getFinePerDay(user?.role);

        return {
          _id: request._id,
          title: resource?.title || "Unknown Book",
          author:
            resource?.authors?.join(", ") ||
            "Unknown author",
          isbn: resource?.isbn || "-",
          dueDate: request.dueDate,
          daysLate,
          finePerDay,
          estimatedFine: daysLate * finePerDay,

          user: {
            fullName: user?.fullName || "Unknown Borrower",
            email: user?.email || "-",
            role: user?.role || "-",
            admissionNo: user?.admissionNo,
            staffNo: user?.staffNo,
            phoneNo: user?.phoneNo,
          },
        };
      });

    return NextResponse.json(
      {
        success: true,
        overdueBooks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET OVERDUE BOOKS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch overdue books.",
      },
      { status: 500 }
    );
  }
}