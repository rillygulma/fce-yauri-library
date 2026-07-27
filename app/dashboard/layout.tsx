import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let decoded: { role: string };

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { role: string };
  } catch {
    redirect("/login");
  }

  // ✅ UPDATED ROLE CHECK
  const allowedRoles = ["undergraduate", "postgraduate", "staff"];

  if (!allowedRoles.includes(decoded.role)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}