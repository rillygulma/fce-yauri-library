import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";

export const runtime = "nodejs";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get("query")?.trim() ?? "";
    const type = searchParams.get("type")?.trim() ?? "";
    const subject = searchParams.get("subject")?.trim() ?? "";
    const available = searchParams.get("available")?.trim() ?? "";

    const requestedPage = Number(
      searchParams.get("page") ?? "1"
    );

    const requestedLimit = Number(
      searchParams.get("limit") ?? "10"
    );

    const page =
      Number.isFinite(requestedPage) && requestedPage > 0
        ? Math.floor(requestedPage)
        : 1;

    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(Math.floor(requestedLimit), 100)
        : 10;

    const skip = (page - 1) * limit;

    /**
     * ---------------------------------------------------------
     * BUILD FILTER
     * ---------------------------------------------------------
     */

    const filter: Record<string, unknown> = {};

    /**
     * ---------------------------------------------------------
     * SEARCH
     * ---------------------------------------------------------
     *
     * Example:
     *
     * HEAT TREATMENT PROCESS AND WELDING TECHNOLOGY
     *
     * We split the search into individual words and require
     * every important word to appear somewhere in the resource.
     *
     * This makes searches more flexible:
     *
     * "PROCESS" can match "PROCESSES"
     * "WELDING TECHNOLOGY" can match a longer title
     * ---------------------------------------------------------
     */

    if (query) {
      const searchWords = query
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean)
        .filter(
          (word) =>
            !["and", "or", "the", "a", "an", "of", "in", "for"].includes(
              word
            )
        );

      if (searchWords.length > 0) {
        filter.$and = searchWords.map((word) => {
          const escapedWord = escapeRegex(word);

          const searchRegex = {
            $regex: escapedWord,
            $options: "i",
          };

          return {
            $or: [
              { title: searchRegex },
              { authors: searchRegex },
              { subject: searchRegex },
              { callNumber: searchRegex },
              { edition: searchRegex },
              { publisher: searchRegex },
              { isbn: searchRegex },
              { volumeNumber: searchRegex },
              { issn: searchRegex },
              { courseCode: searchRegex },
              { courseTitle: searchRegex },
              { semester: searchRegex },
              { session: searchRegex },
              { college: searchRegex },
              { department: searchRegex },
            ],
          };
        });
      }
    }

    /**
     * ---------------------------------------------------------
     * RESOURCE TYPE
     * ---------------------------------------------------------
     */

    if (type && type !== "all") {
      filter.resourceType = type;
    }

    /**
     * ---------------------------------------------------------
     * SUBJECT
     * ---------------------------------------------------------
     */

    if (subject) {
      const escapedSubject = escapeRegex(subject);

      filter.subject = {
        $regex: escapedSubject,
        $options: "i",
      };
    }

    /**
     * ---------------------------------------------------------
     * AVAILABILITY
     * ---------------------------------------------------------
     */

    if (available === "true") {
      filter.availableCopies = {
        $gt: 0,
      };
    }

    /**
     * ---------------------------------------------------------
     * DEBUG LOG
     * ---------------------------------------------------------
     */

    console.log("OPAC QUERY:", query);
    console.log("OPAC FILTER:", JSON.stringify(filter, null, 2));

    /**
     * ---------------------------------------------------------
     * COUNT
     * ---------------------------------------------------------
     */

    const total = await Resource.countDocuments(filter);

    /**
     * ---------------------------------------------------------
     * FETCH
     * ---------------------------------------------------------
     */

    const resources = await Resource.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    /**
     * ---------------------------------------------------------
     * PAGINATION
     * ---------------------------------------------------------
     */

    const pages = total > 0 ? Math.ceil(total / limit) : 0;

    return NextResponse.json(
      {
        success: true,
        resources,
        total,
        pages,
        page,
        limit,
        pagination: {
          total,
          page,
          limit,
          totalPages: pages,
          hasNextPage: page < pages,
          hasPreviousPage: page > 1 && pages > 0,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("OPAC SEARCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        resources: [],
        total: 0,
        pages: 0,
        page: 1,
        limit: 10,
        message: "Failed to search library catalogue.",
      },
      {
        status: 500,
      }
    );
  }
}