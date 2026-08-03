"use client";

import { Search } from "lucide-react";

export default function AdvancedSearch() {
  return (
    <section className="bg-white rounded-2xl border p-8 shadow-sm">

      <h2 className="text-2xl font-bold mb-6">
        Advanced Search
      </h2>

      <div className="grid md:grid-cols-3 gap-5">

        <input
          placeholder="Title"
          className="border rounded-xl p-3"
        />

        <input
          placeholder="Author"
          className="border rounded-xl p-3"
        />

        <input
          placeholder="ISBN / ISSN"
          className="border rounded-xl p-3"
        />

        <input
          placeholder="Publisher"
          className="border rounded-xl p-3"
        />

        <input
          placeholder="Subject"
          className="border rounded-xl p-3"
        />

        <input
          placeholder="Publication Year"
          className="border rounded-xl p-3"
        />

      </div>

      <div className="flex justify-end mt-6">

        <button className="bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2">

          <Search size={18} />

          Search Catalogue

        </button>

      </div>

    </section>
  );
}