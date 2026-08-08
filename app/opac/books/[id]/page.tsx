"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Library,
  MapPin,
  User,
} from "lucide-react";

interface Resource {
  _id: string;
  resourceType: "book";

  title?: string;
  authors?: string[];
  subject?: string;
  callNumber?: string;
  edition?: string;
  publicationYear?: number;
  publisher?: string;
  isbn?: string;

  totalCopies?: number;
  availableCopies?: number;
  borrowedCopies?: number;

  coverImage?: string;
  status?: "available" | "unavailable";
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  resource?: Resource;
  borrowRequest?: {
    _id: string;
    status: string;
  };
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function BookDetailsPage({
  params,
}: Props) {
  const [resource, setResource] =
    useState<Resource | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [borrowing, setBorrowing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error" | "">("");

  /*
   * ================================================================
   * LOAD BOOK
   * ================================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadBook() {
      try {
        setLoading(true);
        setError("");

        const { id } = await params;

        if (!id) {
          throw new Error(
            "Book ID is missing."
          );
        }

        const response = await fetch(
          `/api/resources/${id}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data: ApiResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load book."
          );
        }

        if (
          !data.resource ||
          data.resource.resourceType !==
            "book"
        ) {
          throw new Error(
            "This resource is not a book."
          );
        }

        if (mounted) {
          setResource(data.resource);
        }
      } catch (error) {
        console.error(
          "LOAD BOOK ERROR:",
          error
        );

        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load book."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      mounted = false;
    };
  }, [params]);

  /*
   * ================================================================
   * BORROW BOOK
   * ================================================================
   */

  async function handleBorrow() {
    if (!resource) {
      return;
    }

    /*
     * Check availability before sending request.
     */
    if (
      (resource.availableCopies ?? 0) <= 0
    ) {
      setMessage(
        "This book is currently unavailable."
      );

      setMessageType("error");

      return;
    }

    try {
      setBorrowing(true);

      setMessage("");
      setMessageType("");

      /*
       * Get logged-in user.
       *
       * Login should save:
       *
       * localStorage.setItem(
       *   "userId",
       *   user._id
       * );
       */
      const userId =
        localStorage.getItem("userId");

      /*
       * User is not logged in.
       */
      if (!userId) {
        setMessage(
          "Please login before requesting a book."
        );

        setMessageType("error");

        return;
      }

      console.log(
        "Submitting borrow request:",
        {
          userId,
          resourceId: resource._id,
        }
      );

      /*
       * IMPORTANT:
       *
       * This must match:
       *
       * src/app/api/borrow/route.ts
       */
      const response = await fetch(
        "/api/borrow-request",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            userId,
            resourceId: resource._id,
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      console.log(
        "BORROW API RESPONSE:",
        data
      );

      /*
       * API returned an error.
       */
      if (!response.ok) {
        throw new Error(
          data.message ||
            "Borrow request failed."
        );
      }

      /*
       * SUCCESS
       */
      setMessage(
        data.message ||
          "Borrow request submitted successfully. Please wait for librarian approval."
      );

      setMessageType("success");

      /*
       * Don't decrease available copies here.
       *
       * The book has only been REQUESTED.
       *
       * The librarian should approve it first.
       */
    } catch (error) {
      console.error(
        "BORROW BOOK ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Borrow request failed."
      );

      setMessageType("error");
    } finally {
      setBorrowing(false);
    }
  }

  /*
   * ================================================================
   * LOADING
   * ================================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-red-900 text-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="h-5 w-28 animate-pulse rounded bg-white/20" />

            <div className="mt-6 h-7 w-56 animate-pulse rounded bg-white/20" />

            <div className="mt-3 h-10 w-72 animate-pulse rounded bg-white/20" />
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border bg-white p-6 shadow-sm sm:p-10">
            <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
              <div className="mx-auto h-[380px] w-[270px] animate-pulse rounded-2xl bg-gray-200" />

              <div>
                <div className="h-8 w-28 animate-pulse rounded-full bg-gray-200" />

                <div className="mt-5 h-10 w-3/4 animate-pulse rounded bg-gray-200" />

                <div className="mt-4 h-6 w-1/2 animate-pulse rounded bg-gray-200" />

                <div className="mt-10 grid gap-5 sm:grid-cols-2">
                  {Array.from({
                    length: 6,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-xl bg-gray-100"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ================================================================
   * ERROR
   * ================================================================
   */

  if (error || !resource) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-red-900 text-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <Link
              href="/opac"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-100 hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to OPAC
            </Link>

            <h1 className="mt-5 text-3xl font-bold">
              Book Details
            </h1>
          </div>
        </header>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <BookOpen
                size={30}
                className="text-red-900"
              />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              Book Not Found
            </h2>

            <p className="mt-2 text-gray-600">
              {error ||
                "The requested book could not be found."}
            </p>

            <Link
              href="/opac"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-900 px-6 py-3 font-semibold text-white transition hover:bg-red-800"
            >
              <ArrowLeft size={18} />
              Back to OPAC
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const available =
    (resource.availableCopies ?? 0) > 0;

  /*
   * ================================================================
   * PAGE
   * ================================================================
   */

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <header className="bg-red-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/opac"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-100 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to OPAC
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <Library size={28} />

            <span className="text-sm font-semibold uppercase tracking-wider">
              Library Catalogue
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Book Details
          </h1>
        </div>
      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[280px_1fr]">

            {/* COVER */}

            <div className="flex justify-center">
              <div className="flex h-[380px] w-[270px] items-center justify-center overflow-hidden rounded-2xl bg-red-50 shadow-sm">
                {resource.coverImage ? (
                  <Image
                    src={resource.coverImage}
                    alt={
                      resource.title ||
                      "Book cover"
                    }
                    width={270}
                    height={380}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen
                    size={90}
                    className="text-red-900"
                  />
                )}
              </div>
            </div>

            {/* INFORMATION */}

            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-900">
                  Book
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    available
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {available
                    ? "Available"
                    : "Unavailable"}
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-bold text-gray-900">
                {resource.title}
              </h2>

              {resource.authors &&
                resource.authors.length > 0 && (
                  <div className="mt-5 flex items-center gap-2 text-gray-600">
                    <User size={18} />

                    {resource.authors.join(
                      ", "
                    )}
                  </div>
                )}

              {/* DETAILS */}

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Detail
                  label="Subject Area"
                  value={resource.subject}
                />

                <Detail
                  label="Call Number"
                  value={resource.callNumber}
                  icon={<MapPin size={17} />}
                />

                <Detail
                  label="Edition"
                  value={resource.edition}
                />

                <Detail
                  label="Publication"
                  value={
                    resource.publicationYear?.toString()
                  }
                  icon={
                    <Calendar size={17} />
                  }
                />

                <Detail
                  label="Publisher"
                  value={resource.publisher}
                />

                <Detail
                  label="ISBN"
                  value={resource.isbn}
                />
              </div>

              {/* COPY STATS */}

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <Stat
                  label="Total Copies"
                  value={
                    resource.totalCopies ?? 0
                  }
                />

                <Stat
                  label="Available"
                  value={
                    resource.availableCopies ?? 0
                  }
                />

                <Stat
                  label="Borrowed"
                  value={
                    resource.borrowedCopies ?? 0
                  }
                />
              </div>

              {/* MESSAGE */}

              {message && (
                <div
                  className={`mt-6 rounded-xl border p-4 text-sm font-medium ${
                    messageType === "success"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {messageType ===
                      "success" && (
                      <CheckCircle
                        size={20}
                        className="mt-0.5 shrink-0"
                      />
                    )}

                    <span>
                      {message}
                    </span>
                  </div>
                </div>
              )}

              {/* BORROW */}

              <div className="mt-8">
                {available ? (
                  <button
                    type="button"
                    onClick={handleBorrow}
                    disabled={borrowing}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-900 px-7 py-4 font-semibold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle size={20} />

                    {borrowing
                      ? "Submitting Request..."
                      : "Borrow Me"}
                  </button>
                ) : (
                  <div className="rounded-xl bg-gray-100 px-6 py-4 font-semibold text-gray-600">
                    This book is currently unavailable.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/*
 * ================================================================
 * DETAIL COMPONENT
 * ================================================================
 */

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 flex items-center gap-2 font-medium text-gray-800">
        {icon && (
          <span className="text-red-900">
            {icon}
          </span>
        )}

        {value}
      </p>
    </div>
  );
}

/*
 * ================================================================
 * STAT COMPONENT
 * ================================================================
 */

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}