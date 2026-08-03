"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PaginationProps {
  page: number;
  pages: number;

  onPageChange: (
    page: number
  ) => void;
}

export default function Pagination({
  page,
  pages,
  onPageChange,
}: PaginationProps) {
  if (pages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() =>
          onPageChange(page - 1)
        }
        className="flex items-center gap-2 rounded-xl border px-4 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={18} />
        Previous
      </button>

      <span className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white">
        {page} / {pages}
      </span>

      <button
        type="button"
        disabled={page >= pages}
        onClick={() =>
          onPageChange(page + 1)
        }
        className="flex items-center gap-2 rounded-xl border px-4 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight size={18} />
      </button>
    </div>
  );
}