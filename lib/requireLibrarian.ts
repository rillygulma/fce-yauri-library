
import { cookies, headers } from "next/headers";
import { verify as verifyJwt, type JwtPayload } from "jsonwebtoken";

type LibrarianToken = JwtPayload & {
  id?: string;
  userId?: string;
  _id?: string;
  role?: string;
  staffRole?: string;
};

export type AuthenticatedLibrarian = {
  id: string;
  role: string;
};

export async function requireLibrarian(): Promise<AuthenticatedLibrarian> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const authorization = headerStore.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  const token =
    cookieStore.get("token")?.value ||
    cookieStore.get("authToken")?.value ||
    cookieStore.get("accessToken")?.value ||
    bearerToken;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  let decoded: string | JwtPayload;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }
    decoded = verifyJwt(token, secret);
  } catch {
    throw new Error("UNAUTHORIZED");
  }

  if (typeof decoded === "string") {
    throw new Error("UNAUTHORIZED");
  }

  const payload = decoded as LibrarianToken;

  const role = (
    payload.staffRole ||
    payload.role ||
    ""
  ).toLowerCase();

  const id = payload.id || payload.userId || payload._id;

  if (
    !id ||
    !/^[a-f\d]{24}$/i.test(id) ||
    !["admin", "librarian"].includes(role)
  ) {
    throw new Error("UNAUTHORIZED");
  }

  return { id, role };
}
