"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  Download,
  FileText,
  GraduationCap,
  Loader2,
} from "lucide-react";

interface QuestionPaper {
  _id: string;
  resourceType: "question-paper";

  title?: string;
  courseCode?: string;
  courseTitle?: string;
  semester?: string;
  session?: string;
  college?: string;
  department?: string;

  digitalFile?: string;
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function QuestionPaperPage({
  params,
}: Props) {
  const [resource, setResource] =
    useState<QuestionPaper | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [downloading, setDownloading] =
    useState(false);

  const [resourceId, setResourceId] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadResource() {
      try {
        setLoading(true);
        setError("");

        const { id } = await params;

        if (!id) {
          throw new Error(
            "Question paper ID is missing."
          );
        }

        if (mounted) {
          setResourceId(id);
        }

        console.log(
          "Loading question paper:",
          id
        );

        const response = await fetch(
          `/api/resources/${id}?t=${Date.now()}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        const data =
          await response.json();

        console.log(
          "Question paper API response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Question paper not found."
          );
        }

        if (
          !data.resource ||
          data.resource.resourceType !==
            "question-paper"
        ) {
          throw new Error(
            "This resource is not a question paper."
          );
        }

        if (mounted) {
          setResource(data.resource);
        }
      } catch (error) {
        console.error(
          "QUESTION PAPER ERROR:",
          error
        );

        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load question paper."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadResource();

    return () => {
      mounted = false;
    };
  }, [params]);

  /**
   * Download the exact file belonging
   * to this question paper.
   */
  async function handleDownload() {
    if (
      !resource?.digitalFile ||
      !resourceId
    ) {
      return;
    }

    try {
      setDownloading(true);

      const fileUrl =
        resource.digitalFile;

      console.log(
        "Downloading question paper:",
        {
          resourceId,
          fileUrl,
        }
      );

      /*
       * Add a cache-busting parameter.
       * This prevents the browser from
       * reusing an older cached file.
       */
      const separator =
        fileUrl.includes("?")
          ? "&"
          : "?";

      const downloadUrl =
        `${fileUrl}${separator}resource=${resourceId}&t=${Date.now()}`;

      const response = await fetch(
        downloadUrl,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to download the question paper."
        );
      }

      const blob =
        await response.blob();

      /*
       * Create a temporary browser URL
       * for this exact downloaded file.
       */
      const blobUrl =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = blobUrl;

      /*
       * Generate a useful filename.
       */
      const courseCode =
        resource.courseCode
          ?.replace(
            /[^a-zA-Z0-9-_]/g,
            "_"
          ) || "question-paper";

      const session =
        resource.session
          ?.replace(
            /[^a-zA-Z0-9-_]/g,
            "_"
          ) || "";

      link.download = session
        ? `${courseCode}-${session}.pdf`
        : `${courseCode}-question-paper.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        blobUrl
      );
    } catch (error) {
      console.error(
        "DOWNLOAD ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to download question paper."
      );
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        {/* HERO */}
        <section className="bg-red-900 px-4 py-10 text-white">
          <div className="mx-auto max-w-5xl">
            <div className="h-6 w-32 animate-pulse rounded bg-white/20" />

            <div className="mt-5 h-10 w-72 animate-pulse rounded bg-white/20" />
          </div>
        </section>

        {/* CONTENT */}
        <section className="mx-auto max-w-5xl px-4 py-10">
          <div className="animate-pulse rounded-3xl border bg-white p-8 shadow-sm">
            <div className="h-7 w-40 rounded bg-gray-200" />

            <div className="mt-6 h-10 w-72 rounded bg-gray-200" />

            <div className="mt-3 h-6 w-96 max-w-full rounded bg-gray-200" />

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!resource || error) {
    return (
      <main className="min-h-screen bg-gray-50">
        {/* HERO */}
        <section className="bg-red-900 px-4 py-10 text-white">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3">
              <BookOpen size={28} />

              <span className="font-semibold">
                Library OPAC
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-bold">
              Question Paper
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <FileText
                size={30}
                className="text-red-900"
              />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              Question Paper Not Found
            </h2>

            <p className="mt-2 text-gray-600">
              {error ||
                "The requested question paper could not be found."}
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <header className="bg-red-900 px-4 py-8 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/opac"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-100 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to OPAC
          </Link>

          <div className="mt-7 flex items-center gap-3">
            <FileText size={28} />

            <span className="font-semibold">
              Library Question Papers
            </span>
          </div>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Question Paper
          </h1>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 sm:p-10">
            <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-900">
              Question Paper
            </span>

            <h2 className="mt-5 text-3xl font-bold text-gray-900">
              {resource.courseCode ||
                "Question Paper"}
            </h2>

            {resource.courseTitle && (
              <p className="mt-2 text-xl text-gray-600">
                {resource.courseTitle}
              </p>
            )}

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <Info
                label="Semester"
                value={resource.semester}
                icon={
                  <Calendar size={18} />
                }
              />

              <Info
                label="Session"
                value={resource.session}
                icon={
                  <Calendar size={18} />
                }
              />

              <Info
                label="College"
                value={resource.college}
                icon={
                  <Building2 size={18} />
                }
              />

              <Info
                label="Department"
                value={
                  resource.department
                }
                icon={
                  <GraduationCap
                    size={18}
                  />
                }
              />
            </div>

            {/* FILE */}
            <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <BookOpen
                    size={25}
                    className="text-red-900"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900">
                    Question Paper File
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Download the question paper
                    document.
                  </p>

                  {/* Debug information */}
                  <p className="mt-2 break-all text-xs text-gray-400">
                    Resource ID:{" "}
                    {resource._id}
                  </p>
                </div>
              </div>

              {resource.digitalFile ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">                  
                  {/* DOWNLOAD */}
                  <button
                    type="button"
                    onClick={
                      handleDownload
                    }
                    disabled={downloading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-900 px-5 py-3.5 font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloading ? (
                      <>
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download
                          size={19}
                        />
                        Download Question Paper
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-medium text-yellow-800">
                  No question paper file has
                  been uploaded for this
                  resource.
                </div>
              )}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
}) {
  if (!value) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 flex items-center gap-2 font-semibold text-gray-800">
        {icon}
        {value}
      </p>
    </div>
  );
}