"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Send, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      toast.error("Please enter your email address");
      return;
    }

    const emailPattern =
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (!emailPattern.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: trimmedEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to process request"
        );
      }

      toast.success(
        "If the email exists, a password reset link has been sent."
      );

      setEmail("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-red-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-white hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
            <Mail className="h-7 w-7 text-[#003566]" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            Forgot Password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-200">
            Enter the email address associated with your
            E-Library account and we&apos;ll send you a
            password reset link.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-lg"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#003566] focus:ring-4 focus:ring-[#003566]/10"
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-700 py-3 font-semibold text-white shadow-lg transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send Reset Link
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 w-full text-center text-sm font-medium text-[#003566] hover:underline"
          >
            Back to Login
          </button>
        </form>
      </div>
    </main>
  );
}
