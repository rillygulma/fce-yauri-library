"use client";

import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function SearchBar({
  onSearch,
  initialQuery = "",
}: SearchBarProps) {
  const [query, setQuery] =
    useState(initialQuery);

  function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    onSearch(query.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search
          size={22}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="search"
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="Search by title, author, ISBN, subject..."
          className="h-14 w-full rounded-2xl border border-gray-300 bg-white pl-12 pr-5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>

      <button
        type="submit"
        className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-green-700 px-8 font-semibold text-white transition hover:bg-green-800"
      >
        <Search size={20} />
        Search
      </button>
    </form>
  );
}