"use client";

import { useEffect, useState } from "react";
import { BookOpen, CheckCircle, XCircle, Clock } from "lucide-react";

interface Borrow {
  _id: string;
  title: string;
  author: string;
  isbn: string;

  status: "borrowed" | "returned" | "overdue";

  borrowDate: string;
  dueDate: string;
  returnDate?: string;

  fine: number;

  user: {
    fullName: string;
    email: string;
  };
}

export default function BorrowHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [borrows, setBorrows] = useState<Borrow[]>([]);

  // You should store user in localStorage or session
  const userId =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "{}")._id
    : null;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        if (!userId) return;

        const res = await fetch(
          `/api/borrow-request/user/${userId}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch history");
        }

        setBorrows(data.borrows);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const getStatusUI = (status: string) => {
    switch (status) {
      case "returned":
        return (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle size={16} /> Returned
          </span>
        );

      case "overdue":
        return (
          <span className="flex items-center gap-1 text-red-600">
            <XCircle size={16} /> Overdue
          </span>
        );

      default:
        return (
          <span className="flex items-center gap-1 text-blue-600">
            <Clock size={16} /> Borrowed
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading borrow history...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600">
            My Borrow History
          </h1>
          <p className="text-slate-500">
            Track all your borrowed books and returns
          </p>
        </div>

        {/* EMPTY STATE */}
        {borrows.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-500">
            No borrow history found
          </div>
        )}

        {/* LIST */}
        <div className="grid gap-6">
          {borrows.map((item) => (
            <div
              key={item._id}
              className="rounded-3xl bg-white p-6 shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                {/* BOOK INFO */}
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                    <BookOpen />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold">
                      {item.title}
                    </h2>

                    <p className="text-gray-500">
                      {item.author}
                    </p>

                    <p className="text-sm text-gray-400">
                      ISBN: {item.isbn}
                    </p>
                  </div>
                </div>

                {/* STATUS */}
                <div>{getStatusUI(item.status)}</div>
              </div>

              {/* DATES */}
              <div className="mt-5 grid gap-3 text-sm text-gray-600 md:grid-cols-3">
                <div>
                  <p className="font-semibold">Borrow Date</p>
                  <p>
                    {new Date(item.borrowDate).toDateString()}
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Due Date</p>
                  <p>
                    {new Date(item.dueDate).toDateString()}
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Return Date</p>
                  <p>
                    {item.returnDate
                      ? new Date(item.returnDate).toDateString()
                      : "Not returned"}
                  </p>
                </div>
              </div>

              {/* FINE */}
              {item.fine > 0 && (
                <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  Fine: ₦{item.fine}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}