"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  FileText,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { Resource } from "@/types/resource";

interface JournalDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function JournalDetailsPage({
  params,
}: JournalDetailsPageProps) {
  const [journal, setJournal] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchJournal() {
      try {
        setLoading(true);
        setError("");

        const { id } = await params;

        if (!id) {
          throw new Error("Journal ID is missing.");
        }

        const response = await fetch(`/api/resources/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to fetch journal details."
          );
        }

        const resource = data?.resource || data?.journal || data;

        if (!resource?._id) {
          throw new Error("Invalid journal data received.");
        }

        if (isMounted) {
          setJournal(resource);
        }
      } catch (error) {
        console.error("JOURNAL DETAILS ERROR:", error);

        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load journal details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchJournal();

    return () => {
      isMounted = false;
    };
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-40 rounded bg-gray-200" />

            <div className="mt-8 grid gap-8 rounded-3xl border border-gray-200 bg-white p-6 md:grid-cols-[240px_1fr] md:p-8">
              <div className="h-80 rounded-2xl bg-gray-200" />

              <div>
                <div className="h-8 w-3/4 rounded bg-gray-200" />

                <div className="mt-5 h-5 w-1/2 rounded bg-gray-200" />

                <div className="mt-8 space-y-3">
                  <div className="h-5 rounded bg-gray-200" />
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

  if (error || !journal) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <BookOpen size={30} className="text-red-900" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Journal Not Found
          </h1>

          <p className="mt-3 text-gray-600">
            {error ||
              "The requested journal could not be found in the library catalogue."}
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

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/opac"
          className="inline-flex items-center gap-2 text-sm font-semibold text-red-900 transition hover:text-red-700"
        >
          <ArrowLeft size={18} />
          Back to OPAC
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="grid gap-8 p-6 md:grid-cols-[240px_1fr] md:p-8">
            <div className="relative h-80 overflow-hidden rounded-2xl bg-red-50">
              {journal.coverImage ? (
                <Image
                  src={journal.coverImage}
                  alt={journal.title || "Journal cover"}
                  fill
                  sizes="240px"
                  className="object-cover"
                  priority
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

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-900">
                  Journal
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                {journal.title}
              </h1>

              {journal.subtitle && (
                <p className="mt-3 text-lg text-gray-500">
                  {journal.subtitle}
                </p>
              )}

              {journal.authors?.length > 0 && (
                <div className="mt-5 flex items-start gap-2 text-gray-600">
                  <User
                    size={20}
                    className="mt-0.5 shrink-0 text-red-900"
                  />
                  <span>{journal.authors.join(", ")}</span>
                </div>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Detail
                  icon={<User size={18} />}
                  label="Authors"
                  value={journal.authors?.join(", ")}
                />

                <Detail
                  icon={<FileText size={18} />}
                  label="Publisher"
                  value={journal.publisher}
                />

                <Detail
                  icon={<Calendar size={18} />}
                  label="Publication Year"
                  value={String(journal.publicationYear)}
                />

                <Detail
                  label="ISSN"
                  value={journal.issn}
                />

                <Detail
                  label="Subject"
                  value={journal.subject}
                />

                <Detail
                  label="Language"
                  value={journal.language}
                />

                <Detail
                  label="Classification Number"
                  value={journal.classificationNumber}
                />

                <Detail
                  label="Call Number"
                  value={journal.callNumber}
                />

                <Detail
                  label="Shelf Location"
                  value={journal.shelfLocation}
                />

                <Detail
                  label="Accession Number"
                  value={journal.accessionNumber}
                />

                <Detail
                  label="College"
                  value={journal.college}
                />

                <Detail
                  label="Department"
                  value={journal.department}
                />
              </div>

              {journal.description && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900">
                    Description
                  </h2>
                  <p className="mt-3 leading-7 text-gray-600">
                    {journal.description}
                  </p>
                </div>
              )}

              {journal.keywords?.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900">
                    Keywords
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {journal.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {journal.digitalFile && (
                <div className="mt-8">
                  <a
                    href={journal.digitalFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-red-900 px-6 py-3 font-semibold text-white transition hover:bg-red-800"
                  >
                    <FileText size={18} />
                    View Digital Journal
                  </a>
                </div>
              )}

              <div className="mt-8">
                <Link
                  href="/opac"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-red-900 hover:bg-red-50 hover:text-red-900"
                >
                  Browse More Resources
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {icon && <span className="text-red-900">{icon}</span>}
        <span>{label}</span>
      </div>

      <p className="mt-2 font-medium text-gray-900">{value}</p>
    </div>
  );
}