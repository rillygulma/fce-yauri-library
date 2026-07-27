"use client";

import { useState } from "react";
import { Search, BookCheck, AlertCircle } from "lucide-react";

interface Borrow {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  status: string;
  dueDate: string;
  isReturned: boolean;
  user: {
    fullName: string;
    email: string;
  };
}

export default function ReturnBookPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [selected, setSelected] = useState<Borrow | null>(null);

  const [returning, setReturning] = useState(false);

  // ================= SEARCH BORROW =================
  const searchBorrow = async () => {
    if (!query.trim()) return alert("Enter book ISBN or user email");

    try {
      setLoading(true);
      setBorrows([]);
      setSelected(null);

      const res = await fetch(
        `/api/borrow-request/search?query=${encodeURIComponent(query)}`,
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Not found");
        return;
      }

      // ✅ FIX: API returns borrows array
      setBorrows(data.borrows || []);
    } catch (error) {
      console.error(error);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= RETURN BOOK =================
  const handleReturn = async (id: string) => {
    try {
      setReturning(true);

      const res = await fetch(`/api/borrow-request/return/${id}`, {
        method: "PUT",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Return failed");
      }

      alert(`Returned successfully. Fine: ₦${data.fine || 0}`);

      // refresh UI locally
      setBorrows((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, isReturned: true, status: "returned" } : b,
        ),
      );

      setSelected(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to return book");
    } finally {
      setReturning(false);
    }
  };

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Return Book</h1>
          <p className="text-gray-500">
            Search all borrowed books by user or ISBN
          </p>
        </div>

        {/* SEARCH */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex gap-3">
            <input
              className="w-full rounded-xl border px-4 py-3"
              placeholder="Search by ISBN or user email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button
              onClick={searchBorrow}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 text-white"
            >
              {loading ? "Searching..." : <Search />}
            </button>
          </div>
        </div>

        {/* RESULT LIST */}
        {borrows.length > 0 && (
          <div className="mt-6 space-y-4">
            {borrows.map((borrow, index) => (
              <div key={borrow._id} className="rounded-2xl bg-white p-6 shadow">
                {/* ✅ NUMBERING ADDED HERE */}
                <div className="mb-2 text-sm font-semibold text-blue-600">
                  {index + 1}. Book Details
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{borrow.title}</h2>
                    <p className="text-gray-500">{borrow.author}</p>
                    <p className="text-sm text-gray-400">ISBN: {borrow.isbn}</p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm ${
                      borrow.isReturned
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {borrow.isReturned ? "Returned" : "Borrowed"}
                  </span>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    Borrowed by: <b>{borrow.user.fullName}</b>
                  </p>
                  <p>Email: {borrow.user.email}</p>
                  <p>Due Date: {new Date(borrow.dueDate).toDateString()}</p>
                </div>

                {!borrow.isReturned && (
                  <button
                    onClick={() => handleReturn(borrow._id)}
                    disabled={returning}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-white"
                  >
                    <BookCheck size={18} />
                    {returning ? "Processing..." : "Mark as Returned"}
                  </button>
                )}

                {borrow.isReturned && (
                  <div className="mt-3 flex items-center gap-2 text-green-600">
                    <AlertCircle size={18} />
                    Already returned
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && borrows.length === 0 && query && (
          <div className="mt-6 rounded-2xl bg-white p-6 text-gray-500 shadow">
            No borrow records found
          </div>
        )}
      </div>
    </main>
  );
}
