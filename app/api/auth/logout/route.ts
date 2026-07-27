import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    message: "Logged out",
    success: true,
  });

  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}