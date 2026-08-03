"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

import type { Resource } from "@/types/resource";

interface BookDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookDetailsPage({
  params,
}: BookDetailsPageProps) {
  const [book, setBook] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        setError("");

        const { id } = await params;

        const response = await fetch(`/api/resources/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch book details.");
        }

        const data = await response.json();

        setBook(data.resource || data.book || data);
      } catch (error) {
        console.error("BOOK DETAILS ERROR:", error);
        setError("Unable to load book details.");
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-40 rounded bg-gray-200" />

            <div className="mt-8 grid gap-8 rounded-3xl border bg-white p-6 md:grid-cols-[240px_1fr]">
              <div className="h-80 rounded-2xl bg-gray-200" />

              <div>
                <div className="h-8 w-3/4 rounded bg-gray-200" />

                <div className="mt-5 h-5 w-1/2 rounded bg-gray-200" />

                <div className="mt-8 space-y-3">
                  <div className="h-5 rounded bg-gray-200" />
                  <div className="h-5 rounded bg-gray-200" />
                  <div className="h-5 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Book Not Found</h1>

          <p className="mt-3 text-gray-600">
            {error || "The requested book could not be found."}
          </p>

          <Link
            href="/opac"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-900 px-6 py-3 font-semibold text-white transition hover:bg-red-800"
          >
            <ArrowLeft size={18} />
            Back to OPAC
          </Link>
        </div>
      </main>
    );
  }

  const isAvailable = book.availableCopies > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/opac"
          className="inline-flex items-center gap-2 text-sm font-semibold text-red-900 hover:text-red-700"
        >
          <ArrowLeft size={18} />
          Back to OPAC
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="grid gap-8 p-6 md:grid-cols-[240px_1fr] md:p-8">
            <div className="relative h-80 overflow-hidden rounded-2xl bg-red-50">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen
                    size={70}
                    strokeWidth={1.5}
                    className="text-red-900"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-900">
                  Book
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-xs font-bold ${
                    isAvailable
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold text-gray-900">
                {book.title}
              </h1>

              {book.subtitle && (
                <p className="mt-3 text-lg text-gray-500">
                  {book.subtitle}
                </p>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Detail
                  label="Author"
                  value={book.authors?.join(", ")}
                />

                <Detail
                  label="Publisher"
                  value={book.publisher}
                />

                <Detail
                  label="Publication Year"
                  value={String(book.publicationYear)}
                />

                <Detail
                  label="Edition"
                  value={book.edition}
                />

                <Detail
                  label="ISBN"
                  value={book.isbn}
                />

                <Detail
                  label="Subject"
                  value={book.subject}
                />

                <Detail
                  label="Classification"
                  value={book.classificationNumber}
                />

                <Detail
                  label="Shelf Location"
                  value={book.shelfLocation}
                />

                <Detail
                  label="Accession Number"
                  value={book.accessionNumber}
                />

                <Detail
                  label="Available Copies"
                  value={String(book.availableCopies)}
                />
              </div>

              {book.description && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900">
                    Description
                  </h2>

                  <p className="mt-3 leading-7 text-gray-600">
                    {book.description}
                  </p>
                </div>
              )}

              <div className="mt-8">
                <button
                  type="button"
                  disabled={!isAvailable}
                  className="rounded-xl bg-red-900 px-6 py-3 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isAvailable ? "Borrow Me" : "Currently Unavailable"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-medium text-gray-900">{value}</p>
    </div>
  );
}