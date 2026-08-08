import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid resource ID.",
        },
        { status: 400 }
      );
    }

    const resource = await Resource.findById(id).lean();

    if (!resource) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        resource,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET RESOURCE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load resource.",
      },
      { status: 500 }
    );
  }
}