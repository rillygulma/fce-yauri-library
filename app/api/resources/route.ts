import {
  NextRequest,
  NextResponse,
} from "next/server";

import { connectDB } from "@/lib/mongodb";
import Resource from "@/models/Resource";

export async function GET(
  request: NextRequest
) {
  try {
    await connectDB();

    const searchParams =
      request.nextUrl.searchParams;

    const query =
      searchParams
        .get("query")
        ?.trim() || "";

    const type =
      searchParams
        .get("type")
        ?.trim() || "";

    const subject =
      searchParams
        .get("subject")
        ?.trim() || "";

    const available =
      searchParams
        .get("available")
        ?.trim() || "";

    const page = Math.max(
      Number(
        searchParams.get("page")
      ) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(
          searchParams.get("limit")
        ) || 10,
        1
      ),
      100
    );

    const skip =
      (page - 1) * limit;

    const filter: Record<
      string,
      unknown
    > = {};

    /*
    |--------------------------------------------------------------------------
    | GENERAL SEARCH
    |--------------------------------------------------------------------------
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
          authors: {
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
          callNumber: {
            $regex: query,
            $options: "i",
          },
        },
        {
          publisher: {
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
          volumeNumber: {
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
          semester: {
            $regex: query,
            $options: "i",
          },
        },
        {
          session: {
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
        {
          department: {
            $regex: query,
            $options: "i",
          },
        },
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | RESOURCE TYPE
    |--------------------------------------------------------------------------
    */

    if (
      type &&
      type !== "all"
    ) {
      filter.resourceType = type;
    }

    /*
    |--------------------------------------------------------------------------
    | SUBJECT
    |--------------------------------------------------------------------------
    */

    if (subject) {
      filter.subject = {
        $regex: subject,
        $options: "i",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | AVAILABLE RESOURCES
    |--------------------------------------------------------------------------
    */

    if (
      available === "true"
    ) {
      filter.availableCopies = {
        $gt: 0,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | FETCH DATA
    |--------------------------------------------------------------------------
    */

    const [
      resources,
      total,
    ] = await Promise.all([
      Resource.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Resource.countDocuments(
        filter
      ),
    ]);

    return NextResponse.json(
      {
        success: true,

        resources,

        total,

        page,

        limit,

        pages: Math.ceil(
          total / limit
        ),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET RESOURCES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch resources.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| CREATE RESOURCE
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest
) {
  try {
    await connectDB();

    const body =
      await request.json();

    const {
      resourceType,
      title,
      authors,
      subject,
      callNumber,
      edition,
      publicationYear,
      publisher,
      isbn,
      totalCopies,
      volumeNumber,
      issn,
      courseCode,
      courseTitle,
      semester,
      session,
      college,
      department,
      graduationYear,
      coverImage,
      digitalFile,
    } = body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE RESOURCE TYPE
    |--------------------------------------------------------------------------
    */

    const allowedTypes = [
      "book",
      "journal",
      "question-paper",
      "project",
    ];

    if (
      !allowedTypes.includes(
        resourceType
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid resource type.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BOOK VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      resourceType === "book"
    ) {
      if (
        !title ||
        !authors ||
        !subject ||
        !callNumber ||
        !edition ||
        !publicationYear ||
        !publisher ||
        !isbn ||
        !totalCopies
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Author, subject area, title, call number, edition, date of publication, publisher, ISBN, and number of copies are required for books.",
          },
          {
            status: 400,
          }
        );
      }

      if (!coverImage) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Book cover image is required.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | JOURNAL VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      resourceType === "journal"
    ) {
      if (
        !subject ||
        !title ||
        !volumeNumber ||
        !publicationYear ||
        !issn
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Subject area, title, volume number, date of publication, and ISSN are required for journals.",
          },
          {
            status: 400,
          }
        );
      }

      if (!coverImage) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Journal cover image is required.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | QUESTION PAPER VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      resourceType ===
      "question-paper"
    ) {
      if (
        !courseCode ||
        !courseTitle ||
        !semester ||
        !session ||
        !college ||
        !department
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Course code, course title, semester, session, college, and department are required for question papers.",
          },
          {
            status: 400,
          }
        );
      }

      if (!digitalFile) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Question paper file is required.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | PROJECT VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      resourceType ===
      "project"
    ) {
      if (
        !authors ||
        !title ||
        !graduationYear ||
        !college ||
        !department
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Author, title, graduation year, college, and department are required for projects.",
          },
          {
            status: 400,
          }
        );
      }

      if (!digitalFile) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Project file is required.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | NUMERIC VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      publicationYear !==
        undefined &&
      publicationYear !== null &&
      publicationYear !== ""
    ) {
      const year =
        Number(publicationYear);

      if (
        !Number.isInteger(year) ||
        year < 1000
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid publication year.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (
      graduationYear !==
        undefined &&
      graduationYear !== null &&
      graduationYear !== ""
    ) {
      const year =
        Number(graduationYear);

      if (
        !Number.isInteger(year) ||
        year < 1000
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid graduation year.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK DUPLICATE ISBN
    |--------------------------------------------------------------------------
    */

    if (isbn) {
      const existingISBN =
        await Resource.findOne({
          isbn: isbn.trim(),
        });

      if (existingISBN) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A resource with this ISBN already exists.",
          },
          {
            status: 409,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK DUPLICATE ISSN
    |--------------------------------------------------------------------------
    */

    if (issn) {
      const existingISSN =
        await Resource.findOne({
          issn: issn.trim(),
        });

      if (existingISSN) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A resource with this ISSN already exists.",
          },
          {
            status: 409,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE AUTHORS
    |--------------------------------------------------------------------------
    */

    const normalizedAuthors =
      Array.isArray(authors)
        ? authors
            .map(
              (author: unknown) =>
                typeof author ===
                "string"
                  ? author.trim()
                  : ""
            )
            .filter(Boolean)
        : [];

    /*
    |--------------------------------------------------------------------------
    | COPY VALUES
    |--------------------------------------------------------------------------
    */

    const parsedTotalCopies =
      resourceType === "book"
        ? Number(totalCopies)
        : 1;

    /*
    |--------------------------------------------------------------------------
    | CREATE RESOURCE
    |--------------------------------------------------------------------------
    */

    const resource =
      await Resource.create({
        resourceType,

        title:
          typeof title === "string"
            ? title.trim()
            : undefined,

        authors:
          normalizedAuthors,

        subject:
          typeof subject === "string"
            ? subject.trim()
            : undefined,

        callNumber:
          typeof callNumber ===
          "string"
            ? callNumber.trim()
            : undefined,

        edition:
          typeof edition === "string"
            ? edition.trim()
            : undefined,

        publicationYear:
          publicationYear
            ? Number(publicationYear)
            : undefined,

        publisher:
          typeof publisher ===
          "string"
            ? publisher.trim()
            : undefined,

        isbn:
          typeof isbn === "string"
            ? isbn.trim()
            : undefined,

        totalCopies:
          parsedTotalCopies,

        availableCopies:
          parsedTotalCopies,

        borrowedCopies: 0,

        volumeNumber:
          typeof volumeNumber ===
          "string"
            ? volumeNumber.trim()
            : undefined,

        issn:
          typeof issn === "string"
            ? issn.trim()
            : undefined,

        courseCode:
          typeof courseCode ===
          "string"
            ? courseCode.trim()
            : undefined,

        courseTitle:
          typeof courseTitle ===
          "string"
            ? courseTitle.trim()
            : undefined,

        semester:
          typeof semester === "string"
            ? semester.trim()
            : undefined,

        session:
          typeof session === "string"
            ? session.trim()
            : undefined,

        college:
          typeof college === "string"
            ? college.trim()
            : undefined,

        department:
          typeof department ===
          "string"
            ? department.trim()
            : undefined,

        graduationYear:
          graduationYear
            ? Number(graduationYear)
            : undefined,

        coverImage:
          typeof coverImage ===
          "string"
            ? coverImage.trim()
            : undefined,

        digitalFile:
          typeof digitalFile ===
          "string"
            ? digitalFile.trim()
            : undefined,

        status: "available",
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Resource added successfully.",
        resource,
      },
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    console.error(
      "CREATE RESOURCE ERROR:",
      error
    );

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A resource with this ISBN or ISSN already exists.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create resource.",
      },
      {
        status: 500,
      }
    );
  }
}