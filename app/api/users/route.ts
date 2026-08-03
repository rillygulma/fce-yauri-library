import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

// ================= TYPES =================

type UserRole =
  | "student"
  | "staff"
  | "admin";

type Gender = "male" | "female";

interface RegisterRequestBody {
  fullName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  gender?: Gender;
  admissionNo?: string;
  staffNo?: string;
  department?: string;
  college?: string;
  phoneNo?: string;
  profilePicture?: string;
}

interface CloudinaryError {
  message?: string;
  http_code?: number;
  name?: string;
}

interface MongoDuplicateError {
  code?: number;
  keyPattern?: Record<string, number>;
}

interface MongooseValidationError {
  name?: string;
  errors?: Record<string, unknown>;
}

// ================= ERROR TYPE GUARD =================

function isCloudinaryError(
  error: unknown
): error is CloudinaryError {
  return (
    typeof error === "object" &&
    error !== null
  );
}

function isMongoDuplicateError(
  error: unknown
): error is MongoDuplicateError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  );
}

function isMongooseValidationError(
  error: unknown
): error is MongooseValidationError {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error
  );
}

function getErrorMessage(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "An unexpected error occurred";
}

// ================= GET ALL USERS =================

export async function GET() {
  try {
    await connectDB();

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: users.length,
        users,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "GET USERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

// ================= CREATE USER =================

export async function POST(
  req: NextRequest
) {
  try {
    // ================= CONNECT DATABASE =================

    await connectDB();

    // ================= GET REQUEST BODY =================

    const body =
      (await req.json()) as RegisterRequestBody;

    const {
      fullName,
      email,
      password,
      role,
      gender,
      admissionNo,
      staffNo,
      department,
      college,
      phoneNo,
      profilePicture,
    } = body;

    // ================= NORMALIZE INPUTS =================

    const normalizedFullName =
      fullName?.trim();

    const normalizedEmail =
      email?.trim().toLowerCase();

    const normalizedAdmissionNo =
      admissionNo?.trim();

    const normalizedStaffNo =
      staffNo?.trim();

    const normalizedDepartment =
      department?.trim();

    const normalizedCollege =
      college?.trim();

    const normalizedPhoneNo =
      phoneNo?.trim();

    // ================= VALIDATE REQUIRED FIELDS =================

    if (
      !normalizedFullName ||
      !normalizedEmail ||
      !password ||
      !role ||
      !gender
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Full name, email, password, role, and gender are required",
        },
        { status: 400 }
      );
    }

    // ================= VALIDATE GENDER =================

    const validGenders: Gender[] = [
      "male",
      "female",
    ];

    if (
      !validGenders.includes(gender)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid gender. Gender must be male or female",
        },
        { status: 400 }
      );
    }

    // ================= VALIDATE ROLE =================

    const validRoles: UserRole[] = [
      "student",
      "staff",
      "admin",
    ];

    if (
      !validRoles.includes(role)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role",
        },
        { status: 400 }
      );
    }

    // ================= STUDENT VALIDATION =================

    if (
      role === "student" &&
      !normalizedAdmissionNo
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admission number is required for students",
        },
        { status: 400 }
      );
    }

    // ================= STAFF/LIBRARIAN/ADMIN VALIDATION =================

    const staffRoles: UserRole[] = [
      "staff",
      "admin",
    ];

    if (
      staffRoles.includes(role) &&
      !normalizedStaffNo
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Staff number is required for staff, librarian, and admin users",
        },
        { status: 400 }
      );
    }

    // ================= CHECK EXISTING EMAIL =================

    const existingEmail =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A user with this email already exists",
        },
        { status: 409 }
      );
    }

    // ================= CHECK EXISTING ADMISSION NUMBER =================

    if (role === "student") {
      const existingAdmissionNo =
        await User.findOne({
          admissionNo:
            normalizedAdmissionNo,
        });

      if (existingAdmissionNo) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A user with this admission number already exists",
          },
          { status: 409 }
        );
      }
    }

    // ================= CHECK EXISTING STAFF NUMBER =================

    if (
      staffRoles.includes(role)
    ) {
      const existingStaffNo =
        await User.findOne({
          staffNo:
            normalizedStaffNo,
        });

      if (existingStaffNo) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A user with this staff number already exists",
          },
          { status: 409 }
        );
      }
    }

    // ================= HASH PASSWORD =================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // ================= CLOUDINARY UPLOAD =================

    let imageUrl = "";

    if (
      profilePicture &&
      typeof profilePicture === "string"
    ) {
      try {
        console.log(
          "Starting Cloudinary upload..."
        );

        const uploadRes =
          await cloudinary.uploader.upload(
            profilePicture,
            {
              folder:
                "fce-library-users",
              resource_type: "image",
            }
          );

        imageUrl =
          uploadRes.secure_url;

        console.log(
          "Cloudinary upload successful:",
          imageUrl
        );
      } catch (error: unknown) {
        console.error(
          "CLOUDINARY UPLOAD ERROR:",
          error
        );

        const cloudinaryError =
          isCloudinaryError(error)
            ? error
            : {};

        return NextResponse.json(
          {
            success: false,
            message:
              cloudinaryError.message ||
              "Failed to upload profile picture",
            cloudinaryError: {
              http_code:
                cloudinaryError.http_code ||
                null,
              name:
                cloudinaryError.name ||
                null,
            },
          },
          {
            status:
              cloudinaryError.http_code ||
              500,
          }
        );
      }
    }

    // ================= CREATE USER =================

    const user =
      await User.create({
        fullName:
          normalizedFullName,

        email:
          normalizedEmail,

        password:
          hashedPassword,

        role,

        gender,

        // Required only for students
        admissionNo:
          role === "student"
            ? normalizedAdmissionNo
            : undefined,

        // Required for staff, librarian, and admin
        staffNo:
          staffRoles.includes(role)
            ? normalizedStaffNo
            : undefined,

        department:
          normalizedDepartment ||
          "",

        college:
          normalizedCollege ||
          "",

        phoneNo:
          normalizedPhoneNo ||
          "",

        profilePicture:
          imageUrl,
      });

    // ================= REMOVE PASSWORD =================

    const userResponse =
      user.toObject();

    delete userResponse.password;

    // ================= SUCCESS =================

    return NextResponse.json(
      {
        success: true,
        message:
          "User created successfully",
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      "CREATE USER ERROR:",
      error
    );

    // ================= DUPLICATE KEY ERROR =================

    if (
      isMongoDuplicateError(error) &&
      error.code === 11000
    ) {
      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      return NextResponse.json(
        {
          success: false,
          message: `A user with this ${duplicateField} already exists`,
        },
        { status: 409 }
      );
    }

    // ================= VALIDATION ERROR =================

    if (
      isMongooseValidationError(
        error
      ) &&
      error.name ===
        "ValidationError"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user data",
          errors:
            error.errors,
        },
        { status: 400 }
      );
    }

    // ================= GENERAL ERROR =================

    return NextResponse.json(
      {
        success: false,
        message:
          getErrorMessage(error) ||
          "Failed to create user",
      },
      { status: 500 }
    );
  }
}