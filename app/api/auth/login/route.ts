import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password required",
        },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          _id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}