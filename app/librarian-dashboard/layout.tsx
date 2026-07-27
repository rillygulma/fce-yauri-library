import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export default async function LibrarianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      role: string;
    };
  } catch {
    redirect("/login");
  }

  if (decoded.role !== "librarian") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}