
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import { requireLibrarian } from "@/lib/requireLibrarian";
import EResource from "@/models/EResource";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const editableFields = [
  "title",
  "type",
  "author",
  "subject",
  "department",
  "description",
  "publisher",
  "publicationYear",
  "isbn",
  "volume",
  "issue",
  "status",
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const user = await requireLibrarian();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid resource ID." },
        { status: 400 },
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;
    const update: Record<string, unknown> = {};

    for (const field of editableFields) {
      if (input[field] !== undefined) {
        update[field] = input[field];
      }
    }

    if (
      typeof update.title === "string" &&
      update.title.trim().length > 0 &&
      update.title.trim().length <= 200
    ) {
      update.title = update.title.trim();
    } else if (update.title !== undefined) {
      return NextResponse.json(
        { success: false, message: "Invalid title." },
        { status: 400 },
      );
    }

    if (
      update.type !== undefined &&
      !["ebook", "journal"].includes(String(update.type))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid E-Resource type." },
        { status: 400 },
      );
    }

    if (
      update.status !== undefined &&
      !["draft", "published"].includes(String(update.status))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid status." },
        { status: 400 },
      );
    }

    if (update.publicationYear !== undefined) {
      const year = Number(update.publicationYear);

      if (
        update.publicationYear === null ||
        update.publicationYear === ""
      ) {
        update.publicationYear = undefined;
      } else if (
        !Number.isInteger(year) ||
        year < 1000 ||
        year > 2100
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid publication year." },
          { status: 400 },
        );
      } else {
        update.publicationYear = year;
      }
    }

    for (const [field, max] of [
      ["author", 200],
      ["subject", 120],
      ["department", 120],
      ["description", 3000],
      ["publisher", 200],
      ["isbn", 40],
      ["volume", 40],
      ["issue", 40],
    ] as const) {
      if (update[field] !== undefined) {
        if (
          typeof update[field] !== "string" ||
          update[field].length > max
        ) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid ${field}.`,
            },
            { status: 400 },
          );
        }

        update[field] = (update[field] as string).trim();
      }
    }

    await connectDB();

    const resource = await EResource.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!resource) {
      return NextResponse.json(
        { success: false, message: "E-Resource not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "E-Resource updated successfully.",
      resource,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    console.error("UPDATE E-RESOURCE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update E-Resource." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const user = await requireLibrarian();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid resource ID." },
        { status: 400 },
      );
    }

    await connectDB();

    const resource = await EResource.findById(id);

    if (!resource) {
      return NextResponse.json(
        { success: false, message: "E-Resource not found." },
        { status: 404 },
      );
    }

    await cloudinary.uploader.destroy(
      resource.cloudinaryPublicId,
      { resource_type: "raw" },
    );

    await resource.deleteOne();

    return NextResponse.json({
      success: true,
      message: "E-Resource deleted successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    console.error("DELETE E-RESOURCE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete E-Resource." },
      { status: 500 },
    );
  }
}
