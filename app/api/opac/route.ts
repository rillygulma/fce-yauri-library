import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get("query")?.trim() || "";
    const type = searchParams.get("type")?.trim() || "";
    const subject = searchParams.get("subject")?.trim() || "";
    const available = searchParams.get("available")?.trim() || "";

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit")) || 10,
        1
      ),
      100
    );

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    /*
     * Search across multiple resource fields.
     *
     * Examples:
     * /api/opac?query=computer
     * /api/opac?query=John Smith
     * /api/opac?query=CSC101
     * /api/opac?query=978123456789
     */
    if (query) {
      filter.$or = [
        {
          title: {
            $regex: query,
            $options: "i",
          },
        },
        {
          subtitle: {
            $regex: query,
            $options: "i",
          },
        },
        {
          authors: {
            $regex: query,
            $options: "i",
          },
        },
        {
          isbn: {
            $regex: query,
            $options: "i",
          },
        },
        {
          issn: {
            $regex: query,
            $options: "i",
          },
        },
        {
          subject: {
            $regex: query,
            $options: "i",
          },
        },
        {
          keywords: {
            $regex: query,
            $options: "i",
          },
        },
        {
          classificationNumber: {
            $regex: query,
            $options: "i",
          },
        },
        {
          callNumber: {
            $regex: query,
            $options: "i",
          },
        },
        {
          accessionNumber: {
            $regex: query,
            $options: "i",
          },
        },
        {
          courseCode: {
            $regex: query,
            $options: "i",
          },
        },
        {
          courseTitle: {
            $regex: query,
            $options: "i",
          },
        },
        {
          department: {
            $regex: query,
            $options: "i",
          },
        },
        {
          college: {
            $regex: query,
            $options: "i",
          },
        },
      ];
    }

    /*
     * Filter by resource type.
     *
     * Examples:
     * /api/opac?type=book
     * /api/opac?type=journal
     * /api/opac?type=question-paper
     */
    if (type && type !== "all") {
      filter.resourceType = type;
    }

    /*
     * Filter by subject.
     */
    if (subject) {
      filter.subject = {
        $regex: subject,
        $options: "i",
      };
    }

    /*
     * Show only resources that have available copies.
     */
    if (available === "true") {
      filter.availableCopies = {
        $gt: 0,
      };
    }

    /*
     * Get total number of matching resources.
     */
    const total = await Resource.countDocuments(filter);

    /*
     * Get paginated resources.
     */
    const resources = await Resource.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    /*
     * Return OPAC response.
     */
    return NextResponse.json(
      {
        success: true,
        resources,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage:
            page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "OPAC SEARCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to search library catalogue.",
      },
      {
        status: 500,
      }
    );
  }
}