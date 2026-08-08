"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  FileText,
  Hash,
  Library,
  Tag,
  X,
} from "lucide-react";

import Image from "next/image";

interface Journal {
  _id: string;
  resourceType: "journal";

  title?: string;
  subject?: string;
  volumeNumber?: string;
  publicationYear?: number;
  issn?: string;
  coverImage?: string;
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function JournalPage({
  params,
}: Props) {
  const [resource, setResource] =
    useState<Journal | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showSerialMessage, setShowSerialMessage] =
    useState(false);

  useEffect(() => {
    async function loadResource() {
      try {
        const { id } = await params;

        const response = await fetch(
          `/api/resources/${id}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load journal."
          );
        }

        if (
          data.resource.resourceType !==
          "journal"
        ) {
          throw new Error(
            "This resource is not a journal."
          );
        }

        setResource(data.resource);
      } catch (error) {
        console.error(
          "LOAD JOURNAL ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load journal."
        );
      } finally {
        setLoading(false);
      }
    }

    loadResource();
  }, [params]);

  /*
   * LOADING
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-red-900 text-white">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="h-5 w-32 animate-pulse rounded bg-red-800" />

            <div className="mt-5 h-10 w-72 animate-pulse rounded bg-red-800" />
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="animate-pulse p-6 sm:p-10">
              <div className="grid gap-10 md:grid-cols-[220px_1fr]">
                <div className="h-72 rounded-2xl bg-gray-200" />

                <div>
                  <div className="h-6 w-32 rounded bg-gray-200" />

                  <div className="mt-5 h-10 w-3/4 rounded bg-gray-200" />

                  <div className="mt-3 h-5 w-1/2 rounded bg-gray-200" />

                  <div className="mt-10 grid gap-5 sm:grid-cols-2">
                    <div className="h-20 rounded-xl bg-gray-200" />
                    <div className="h-20 rounded-xl bg-gray-200" />
                    <div className="h-20 rounded-xl bg-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ERROR / NOT FOUND
   */
  if (!resource || error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-red-900 text-white">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <Link
              href="/opac"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-100 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to OPAC
            </Link>

            <div className="mt-6 flex items-center gap-3">
              <Library size={28} />

              <span className="font-semibold">
                Library Journals
              </span>
            </div>

            <h1 className="mt-3 text-4xl font-bold">
              Journal
            </h1>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <FileText
                size={30}
                className="text-red-900"
              />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Journal Not Found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-600">
              {error ||
                "The requested journal could not be found."}
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

  /*
   * JOURNAL PAGE
   */
  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <header className="bg-red-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/opac"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-100 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to OPAC
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <Library size={28} />

            <span className="font-semibold">
              Library Journals
            </span>
          </div>

          <h1 className="mt-3 text-4xl font-bold">
            Journal Details
          </h1>

          <p className="mt-2 max-w-2xl text-red-100">
            View information about this journal
            in the library catalogue.
          </p>
        </div>
      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <article className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="p-6 sm:p-10">
            <div className="grid gap-10 md:grid-cols-[220px_1fr]">
              {/* COVER */}

              <div className="overflow-hidden rounded-2xl bg-red-50">
                {resource.coverImage ? (
                  <Image
                    src={resource.coverImage}
                    alt={
                      resource.title ||
                      "Journal cover"
                    }
                    width={220}
                    height={300}
                    className="h-[300px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    <BookOpen
                      size={72}
                      className="text-red-900"
                    />
                  </div>
                )}
              </div>

              {/* INFORMATION */}

              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-900">
                  <FileText size={16} />
                  Journal
                </span>

                <h2 className="mt-5 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                  {resource.title ||
                    "Untitled Journal"}
                </h2>

                {resource.subject && (
                  <div className="mt-4 flex items-center gap-2 text-gray-600">
                    <Tag size={18} />

                    <span>
                      {resource.subject}
                    </span>
                  </div>
                )}

                {/* DETAILS */}

                <div className="mt-10 grid gap-5 sm:grid-cols-2">
                  <Info
                    label="Volume Number"
                    value={
                      resource.volumeNumber
                    }
                    icon={
                      <BookOpen size={18} />
                    }
                  />

                  <Info
                    label="Date of Publication"
                    value={
                      resource.publicationYear
                        ? String(
                            resource.publicationYear
                          )
                        : undefined
                    }
                    icon={
                      <Calendar size={18} />
                    }
                  />

                  <Info
                    label="ISSN"
                    value={resource.issn}
                    icon={
                      <Hash size={18} />
                    }
                  />

                  <Info
                    label="Subject Area"
                    value={
                      resource.subject
                    }
                    icon={
                      <Tag size={18} />
                    }
                  />
                </div>
              </div>
            </div>

            {/* JOURNAL SUMMARY */}

            <div className="mt-10 rounded-2xl bg-gray-50 p-6">
              <div className="flex items-start gap-4">
                <BookOpen
                  size={28}
                  className="mt-1 shrink-0 text-red-900"
                />

                <div>
                  <h3 className="font-bold text-gray-900">
                    Journal Information
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    This journal is available
                    through the library
                    catalogue. Use the
                    information above to
                    identify and locate the
                    journal.
                  </p>
                </div>
              </div>
            </div>

            {/* VIEW DETAILS / SERIAL SECTION */}

            <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">
                    Need to access this journal?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Journals are available at
                    the Serial Section of the
                    library.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowSerialMessage(true)
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-900 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-red-950"
                >
                  <Library size={18} />
                  View Details
                </button>
              </div>
            </div>

            {/* BACK BUTTON */}

            <div className="mt-8 border-t pt-8">
              <Link
                href="/opac"
                className="inline-flex items-center gap-2 rounded-xl bg-red-900 px-6 py-3 font-semibold text-white transition hover:bg-red-800"
              >
                <ArrowLeft size={18} />
                Back to OPAC
              </Link>
            </div>
          </div>
        </article>
      </section>

      {/* SERIAL SECTION MODAL */}

      {showSerialMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={() =>
            setShowSerialMessage(false)
          }
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* ICON + CLOSE */}

            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                <Library
                  size={28}
                  className="text-red-900"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowSerialMessage(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* MESSAGE */}

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Visit the Serial Section
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              This journal is available in the
              library&apos;s{" "}
              <strong className="text-gray-900">
                Serial Section
              </strong>
              .
            </p>

            <p className="mt-3 leading-7 text-gray-600">
              Please go to the Serial Section
              of the library to access or
              consult this journal.
            </p>

            {/* JOURNAL NAME */}

            <div className="mt-5 rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Journal
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {resource.title ||
                  "Untitled Journal"}
              </p>

              {resource.volumeNumber && (
                <p className="mt-1 text-sm text-gray-600">
                  Volume{" "}
                  {resource.volumeNumber}
                </p>
              )}
            </div>

            {/* BUTTON */}

            <button
              type="button"
              onClick={() =>
                setShowSerialMessage(false)
              }
              className="mt-6 w-full rounded-xl bg-red-900 px-5 py-3.5 font-bold text-white transition hover:bg-red-950"
            >
              Okay, I Understand
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/*
 * INFO COMPONENT
 */

function Info({
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
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 flex items-center gap-2 font-semibold text-gray-800">
        <span className="text-red-900">
          {icon}
        </span>

        {value}
      </p>
    </div>
  );
}