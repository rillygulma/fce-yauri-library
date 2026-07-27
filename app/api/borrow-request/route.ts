import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BorrowRequest from "@/models/BorrowRequest";
import User from "@/models/User";

export const runtime = "nodejs";

/* ================= GET ALL BORROWS ================= */
export async function GET() {
  try {
    await connectDB();

    const borrows = await BorrowRequest.find()
      .populate("user", "fullName email role phoneNo")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      borrows,
    });
  } catch (error) {
    console.error("GET BORROWS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch borrows" },
      { status: 500 }
    );
  }
}

/* ================= CREATE BORROW REQUEST ================= */
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, books, title, author, isbn } = body;

    // ================= USER LOOKUP =================
    const user = await User.findOne({
      email: email?.trim().toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ================= ROLE-BASED DUE DATE =================
    const role = (user.role || "").toLowerCase();

    let daysAllowed = 14;

    if (role.includes("postgraduate")) {
      daysAllowed = 30;
    } else if (
      role.includes("staff") ||
      role.includes("librarian") ||
      role.includes("admin")
    ) {
      daysAllowed = 30;
    }

    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(borrowDate.getDate() + daysAllowed);

    // ================= MULTI BOOK SUPPORT =================
    let borrowData = [];

    if (Array.isArray(books) && books.length > 0) {
      // MULTIPLE BOOKS
      borrowData = books.map(
        (book: { title?: string; author?: string; isbn?: string }) => ({
          user: user._id,
          title: book.title?.trim(),
          author: book.author?.trim(),
          isbn: book.isbn?.trim(),
          status: "borrowed",
          borrowDate,
          dueDate,
          isReturned: false,
          fine: 0,
        })
      );
    } else {
      // SINGLE BOOK FALLBACK (BACKWARD COMPATIBILITY)
      if (!title || !author || !isbn) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Provide either books array OR title, author, isbn",
          },
          { status: 400 }
        );
      }

      borrowData = [
        {
          user: user._id,
          title: title.trim(),
          author: author.trim(),
          isbn: isbn.trim(),
          status: "borrowed",
          borrowDate,
          dueDate,
          isReturned: false,
          fine: 0,
        },
      ];
    }

    // ================= INSERT INTO DB =================
    const borrows = await BorrowRequest.insertMany(borrowData);

    return NextResponse.json(
      {
        success: true,
        message: "Borrow request(s) created successfully",
        borrows,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("BORROW ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error while creating borrow request",
      },
      { status: 500 }
    );
  }
}