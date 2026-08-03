"use client";

import { Search } from "lucide-react";

export default function AdvancedSearchPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Advanced Search
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Search the library catalogue using specific
              resource information.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <input
              type="text"
              placeholder="Title"
              className="rounded-xl border border-gray-300 p-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <input
              type="text"
              placeholder="Author"
              className="rounded-xl border border-gray-300 p-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <input
              type="text"
              placeholder="ISBN / ISSN"
              className="rounded-xl border border-gray-300 p-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <input
              type="text"
              placeholder="Publisher"
              className="rounded-xl border border-gray-300 p-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <input
              type="text"
              placeholder="Subject"
              className="rounded-xl border border-gray-300 p-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <input
              type="number"
              placeholder="Publication Year"
              className="rounded-xl border border-gray-300 p-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
            >
              <Search size={18} />
              Search Catalogue
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}