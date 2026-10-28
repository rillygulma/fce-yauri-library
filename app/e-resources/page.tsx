
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Download,
  FileText,
  LoaderCircle,
  Search,
} from "lucide-react";

type EResource = {
  _id: string;
  title: string;
  type: "ebook" | "journal";
  author: string;
  subject: string;
  department: string;
  description: string;
  publisher: string;
  publicationYear?: number;
  downloads: number;
  fileSize: number;
};

type ApiResponse = {
  success: boolean;
  resources: EResource[];
  total: number;
  page: number;
  pages: number;
  message?: string;
};

export default function EResourcesPage() {
  const [resources, setResources] = useState<EResource[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [subject, setSubject] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        query,
        type,
        subject,
        page: String(page),
        limit: "12",
      });

      const response = await fetch(
        `/api/e-resources?${params.toString()}`,
        { cache: "no-store" },
      );

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load E-Resources.");
      }

      setResources(data.resources);
      setTotal(data.total);
      setPages(Math.max(1, data.pages));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }, [query, type, subject, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchResources();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchResources]);

  function changeFilter(
    setter: (value: string) => void,
    value: string,
  ) {
    setter(value);
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-red-950 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-200">
            F.C.E (T), Yauri Library Complex
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Digital E-Library
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-red-100">
            Discover electronic books and academic journals to support
            teaching, learning and research.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3">
          <label className="relative md:col-span-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={query}
              onChange={(e) => changeFilter(setQuery, e.target.value)}
              placeholder="Search title, author or keyword..."
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-red-800"
            />
          </label>

          <select
            value={type}
            onChange={(e) => changeFilter(setType, e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-red-800"
          >
            <option value="all">All resource types</option>
            <option value="ebook">E-books</option>
            <option value="journal">Journals</option>
          </select>

          <input
            value={subject}
            onChange={(e) => changeFilter(setSubject, e.target.value)}
            placeholder="Filter by subject..."
            className="rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-red-800"
          />
        </div>

        <div className="my-6 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Available resources
          </h2>
          <p className="text-sm text-gray-500">
            {total} {total === 1 ? "resource" : "resources"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoaderCircle className="animate-spin text-red-900" size={32} />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
            {error}
            <button
              onClick={() => void fetchResources()}
              className="ml-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto text-gray-400" size={40} />
            <h3 className="mt-4 font-semibold text-gray-900">
              No resources found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try a different search term or filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <article
                key={resource._id}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-red-50 p-3 text-red-900">
                    {resource.type === "ebook" ? (
                      <BookOpen size={24} />
                    ) : (
                      <FileText size={24} />
                    )}
                  </span>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                    {resource.type === "ebook" ? "E-book" : "Journal"}
                  </span>
                </div>

                <h3 className="mt-5 line-clamp-2 text-lg font-semibold text-gray-900">
                  {resource.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {resource.author || "Author not specified"}
                  {resource.publicationYear
                    ? ` · ${resource.publicationYear}`
                    : ""}
                </p>

                <p className="mt-3 text-sm font-medium text-red-900">
                  {resource.subject || "General"}
                </p>

                {resource.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                    {resource.description}
                  </p>
                )}

                <div className="mt-auto pt-6">
                  <p className="mb-3 text-xs text-gray-500">
                    {resource.downloads} downloads
                    {" · "}
                    {(resource.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`/api/e-resources/${resource._id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-900 px-3 py-2.5 text-sm font-semibold text-red-900 hover:bg-red-50"
                    >
                      <BookOpen size={16} />
                      Read PDF
                    </a>

                    <a
                      href={`/api/e-resources/${resource._id}/download`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && pages > 1 && (
          <nav
            aria-label="Resource pagination"
            className="mt-8 flex items-center justify-center gap-4"
          >
            <button
              disabled={page <= 1}
              onClick={() => {
                setPage((current) => Math.max(1, current - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {pages}
            </span>

            <button
              disabled={page >= pages}
              onClick={() => {
                setPage((current) => Math.min(pages, current + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}
