
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  FileText,
  LoaderCircle,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";

type EResource = {
  _id: string;
  title: string;
  type: "ebook" | "journal";
  author: string;
  subject: string;
  status: "draft" | "published";
  downloads: number;
  fileSize: number;
  createdAt: string;
};

const initialForm = {
  title: "",
  type: "ebook",
  author: "",
  subject: "",
  department: "",
  description: "",
  publisher: "",
  publicationYear: "",
  isbn: "",
  volume: "",
  issue: "",
  keywords: "",
  status: "published",
};

export default function EResourcesAdminPage() {
  const [resources, setResources] = useState<EResource[]>([]);
  const [form, setForm] = useState(initialForm);
  const [pdf, setPdf] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/e-resources?query=${encodeURIComponent(search)}&limit=50`,
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load resources.");
      }

      setResources(data.resources);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load resources.",
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchResources();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchResources]);

  function updateField(
    field: keyof typeof initialForm,
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pdf) {
      toast.error("Please select a PDF file.");
      return;
    }

    const body = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      body.append(key, value);
    });

    body.append("pdf", pdf);

    setUploading(true);

    try {
      const response = await fetch("/api/e-resources", {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Upload failed.");
      }

      toast.success("E-Resource uploaded successfully.");
      setForm(initialForm);
      setPdf(null);

      const fileInput = document.getElementById(
        "resource-pdf",
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = "";

      await fetchResources();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function changeStatus(
    resource: EResource,
    status: "draft" | "published",
  ) {
    try {
      const response = await fetch(
        `/api/e-resources/${resource._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Update failed.");
      }

      toast.success("Publication status updated.");
      await fetchResources();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Update failed.",
      );
    }
  }

  async function deleteResource(resource: EResource) {
    if (!window.confirm(`Delete "${resource.title}" permanently?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/e-resources/${resource._id}`,
        { method: "DELETE" },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Delete failed.");
      }

      toast.success("E-Resource deleted.");
      await fetchResources();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Delete failed.",
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100";

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-red-800">
          FCE (T), Yauri Library
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          E-Resources Management
        </h1>
        <p className="mt-2 text-gray-600">
          Upload, organize and manage electronic books and journals.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-3 text-red-800">
            <Upload size={22} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Upload a new resource
            </h2>
            <p className="text-sm text-gray-500">
              PDF only, maximum 20 MB.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">Title *</span>
              <input
                required
                maxLength={200}
                className={inputClass}
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Enter resource title"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Resource type *</span>
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
              >
                <option value="ebook">E-book</option>
                <option value="journal">Journal</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Author</span>
              <input
                maxLength={200}
                className={inputClass}
                value={form.author}
                onChange={(e) => updateField("author", e.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Subject</span>
              <input
                maxLength={120}
                className={inputClass}
                value={form.subject}
                onChange={(e) => updateField("subject", e.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Department</span>
              <input
                maxLength={120}
                className={inputClass}
                value={form.department}
                onChange={(e) => updateField("department", e.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Publisher</span>
              <input
                maxLength={200}
                className={inputClass}
                value={form.publisher}
                onChange={(e) => updateField("publisher", e.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Publication year</span>
              <input
                type="number"
                min={1000}
                max={2100}
                className={inputClass}
                value={form.publicationYear}
                onChange={(e) =>
                  updateField("publicationYear", e.target.value)
                }
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">ISBN</span>
              <input
                maxLength={40}
                className={inputClass}
                value={form.isbn}
                onChange={(e) => updateField("isbn", e.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Volume</span>
              <input
                maxLength={40}
                className={inputClass}
                value={form.volume}
                onChange={(e) => updateField("volume", e.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Issue</span>
              <input
                maxLength={40}
                className={inputClass}
                value={form.issue}
                onChange={(e) => updateField("issue", e.target.value)}
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Description</span>
            <textarea
              rows={4}
              maxLength={3000}
              className={inputClass}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Keywords</span>
            <input
              className={inputClass}
              value={form.keywords}
              onChange={(e) => updateField("keywords", e.target.value)}
              placeholder="Computer science, networking, programming"
            />
            <span className="text-xs text-gray-500">
              Separate keywords with commas.
            </span>
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Publication status</span>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">PDF file *</span>
              <input
                id="resource-pdf"
                type="file"
                accept=".pdf,application/pdf"
                required
                className={inputClass}
                onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
              />
              {pdf && (
                <span className="block text-xs text-gray-500">
                  {pdf.name} · {(pdf.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-900 px-5 py-3 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <Upload size={18} />
            )}
            {uploading ? "Uploading PDF..." : "Upload E-Resource"}
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Resource library
            </h2>
            <p className="text-sm text-gray-500">
              Published resources appear in the public catalogue.
            </p>
          </div>

          <div className="relative sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoaderCircle className="animate-spin text-red-900" size={28} />
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-gray-500">
            No published resources found.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <article
                key={resource._id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-lg bg-red-50 p-3 text-red-800">
                    {resource.type === "ebook" ? (
                      <BookOpen size={22} />
                    ) : (
                      <FileText size={22} />
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      resource.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {resource.status}
                  </span>
                </div>

                <h3 className="mt-4 font-semibold text-gray-900">
                  {resource.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {resource.author || "Unknown author"}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {resource.subject || "Uncategorized"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void changeStatus(
                        resource,
                        resource.status === "published"
                          ? "draft"
                          : "published",
                      )
                    }
                    className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    {resource.status === "published"
                      ? "Unpublish"
                      : "Publish"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void deleteResource(resource)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
