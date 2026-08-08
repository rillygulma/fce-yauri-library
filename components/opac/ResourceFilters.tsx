"use client";

import {
  BookOpen,
  CheckCircle2,
  Filter,
  Search,
} from "lucide-react";

interface ResourceFiltersProps {
  type: string;
  subject: string;
  available: boolean;

  onTypeChange: (
    value: string
  ) => void;

  onSubjectChange: (
    value: string
  ) => void;

  onAvailableChange: (
    value: boolean
  ) => void;
}

export default function ResourceFilters({
  type,
  subject,
  available,
  onTypeChange,
  onSubjectChange,
  onAvailableChange,
}: ResourceFiltersProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* HEADER */}

      <div className="flex items-center gap-3 border-b border-gray-100 bg-red-900 px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Filter
            size={20}
            className="text-white"
          />
        </div>

        <div>
          <h2 className="font-bold text-white">
            Catalogue Filters
          </h2>

          <p className="text-sm text-red-100">
            Refine your library search
          </p>
        </div>
      </div>

      {/* FILTERS */}

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-3">
        {/* RESOURCE TYPE */}

        <div>
          <label
            htmlFor="resource-type"
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
          >
            <BookOpen
              size={16}
              className="text-red-900"
            />

            Resource Type
          </label>

          <div className="relative">
            <select
              id="resource-type"
              value={type}
              onChange={(e) =>
                onTypeChange(
                  e.target.value
                )
              }
              className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3.5 pr-10 text-sm font-medium text-gray-700 outline-none transition focus:border-red-900 focus:ring-4 focus:ring-red-100"
            >
              <option value="all">
                All Resources
              </option>

              <option value="book">
                Books
              </option>

              <option value="journal">
                Journals
              </option>

              <option value="question-paper">
                Question Papers
              </option>

              <option value="project">
                Projects
              </option>

              <option value="ebook">
                eBooks
              </option>
            </select>

            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* SUBJECT */}

        <div>
          <label
            htmlFor="resource-subject"
            className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
          >
            <Search
              size={16}
              className="text-red-900"
            />

            Subject
          </label>

          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="resource-subject"
              type="text"
              value={subject}
              onChange={(e) =>
                onSubjectChange(
                  e.target.value
                )
              }
              placeholder="Filter by subject"
              className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-900 focus:ring-4 focus:ring-red-100"
            />
          </div>
        </div>

        {/* AVAILABILITY */}

        <div className="flex flex-col justify-end">
          <label
            className={`flex min-h-[54px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition ${
              available
                ? "border-red-900 bg-red-50"
                : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={available}
              onChange={(e) =>
                onAvailableChange(
                  e.target.checked
                )
              }
              className="peer sr-only"
            />

            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                available
                  ? "border-red-900 bg-red-900 text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {available && (
                <CheckCircle2
                  size={16}
                  strokeWidth={3}
                />
              )}
            </span>

            <span>
              <span
                className={`block text-sm font-semibold ${
                  available
                    ? "text-red-900"
                    : "text-gray-700"
                }`}
              >
                Available resources only
              </span>

              <span className="mt-0.5 block text-xs text-gray-500">
                Show resources currently available
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* ACTIVE FILTER INDICATOR */}

      {(type !== "all" ||
        subject.trim() ||
        available) && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-gray-500">
              Active filters:
            </span>

            {type !== "all" && (
              <span className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-900">
                {type ===
                "question-paper"
                  ? "Question Papers"
                  : type === "ebook"
                    ? "eBooks"
                    : type.charAt(0).toUpperCase() +
                      type.slice(1) +
                      (type === "book" ||
                      type === "journal"
                        ? "s"
                        : "")}
              </span>
            )}

            {subject.trim() && (
              <span className="rounded-full bg-gray-200 px-3 py-1 font-semibold text-gray-700">
                Subject: {subject}
              </span>
            )}

            {available && (
              <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
                Available only
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}