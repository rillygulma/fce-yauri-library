import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ================= GET AUTH TOKEN =================

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authenticated",
        },
        { status: 401 }
      );
    }

    // ================= VERIFY JWT =================

    let decoded: {
      id?: string;
      role?: string;
      email?: string;
    };

    try {
      const payload = verifyToken(token);

      if (typeof payload === "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid authentication token",
          },
          { status: 401 }
        );
      }

      decoded = payload as {
        id?: string;
        role?: string;
        email?: string;
      };
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Your session has expired. Please log in again.",
        },
        { status: 401 }
      );
    }

    if (!decoded.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication token",
        },
        { status: 401 }
      );
    }

    // ================= GET REQUEST BODY =================

    const body = await req.json();

    const currentPassword =
      typeof body.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    // ================= VALIDATION =================

    if (!currentPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is required",
        },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password is required",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New passwords do not match",
        },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must be different from your current password",
        },
        { status: 400 }
      );
    }

    // ================= FIND USER =================

    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User account not found",
        },
        { status: 404 }
      );
    }

    // ================= VERIFY CURRENT PASSWORD =================

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect",
        },
        { status: 400 }
      );
    }

    // ================= HASH NEW PASSWORD =================

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    // ================= SAVE PASSWORD =================

    user.password = hashedPassword;

    // If the user had an outstanding password-reset token,
    // invalidate it after successfully changing the password.
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to change your password. Please try again later.",
      },
      { status: 500 }
    );
  }
}
