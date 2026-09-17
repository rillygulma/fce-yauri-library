"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  CreditCard,
  RefreshCw,
  RotateCcw,
  User,
} from "lucide-react";

interface BorrowRequest {
  _id: string;
  status: "pending" | "approved" | "rejected" | "returned";
  dueDate?: string;
  isReturned?: boolean;

  resource?: {
    _id: string;
    title?: string;
    authors?: string[];
    isbn?: string;
    callNumber?: string;
  };

  user?: {
    _id: string;
    fullName?: string;
    email?: string;
    role?: string;
    admissionNo?: string;
    staffNo?: string;
    phoneNo?: string;
  };
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  requests?: BorrowRequest[];
}

interface OverdueBook extends BorrowRequest {
  daysLate: number;
  finePerDay: number;
  estimatedFine: number;
}

function getFinePerDay(role?: string) {
  switch (role?.toLowerCase()) {
    case "staff":
      return 100;

    case "student":
      return 50;

    default:
      return 0;
  }
}

function getDaysLate(dueDate: string) {
  const due = new Date(dueDate);
  const today = new Date();

  const dueDay = Date.UTC(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
  );

  const todayDay = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return Math.max(
    0,
    Math.floor(
      (todayDay - dueDay) / (1000 * 60 * 60 * 24)
    )
  );
}

export default function OverdueBooksPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<
    BorrowRequest[]
  >([]);

  const [returningId, setReturningId] = useState<
    string | null
  >(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOverdueBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/borrow-request",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch overdue books."
        );
      }

      setRequests(
        Array.isArray(data.requests)
          ? data.requests
          : []
      );
    } catch (error) {
      console.error("LOAD OVERDUE BOOKS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch overdue books."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOverdueBooks();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOverdueBooks]);

  const overdueBooks = useMemo<OverdueBook[]>(() => {
    return requests
      .filter((request) => {
        return (
          request.status === "approved" &&
          !request.isReturned &&
          Boolean(request.dueDate) &&
          getDaysLate(request.dueDate!) > 0
        );
      })
      .map((request) => {
        const daysLate = getDaysLate(
          request.dueDate!
        );

        const finePerDay = getFinePerDay(
          request.user?.role
        );

        return {
          ...request,
          daysLate,
          finePerDay,
          estimatedFine: daysLate * finePerDay,
        };
      })
      .sort((first, second) => {
        return second.daysLate - first.daysLate;
      });
  }, [requests]);

  const totalEstimatedFine = overdueBooks.reduce(
    (sum, book) => sum + book.estimatedFine,
    0
  );

  async function handleReturn(book: OverdueBook) {
    const title =
      book.resource?.title || "this book";

    const confirmed = window.confirm(
      `Confirm that "${title}" has been physically returned.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setReturningId(book._id);
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/borrow-request",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId: book._id,
            action: "returned",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark the book as returned."
        );
      }

      setMessage(
        data.message || "Book returned successfully."
      );

      await loadOverdueBooks();
    } catch (error) {
      console.error("RETURN OVERDUE BOOK ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to return the book."
      );
    } finally {
      setReturningId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-red-900">
              <AlertTriangle className="text-red-600" />
              Overdue Books
            </h1>

            <p className="mt-2 text-gray-500">
              Active loans that have passed their due date.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadOverdueBooks}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-red-900 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={
                  loading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

            <Link
              href="/librarian/return-book"
              className="inline-flex items-center gap-2 rounded-xl bg-red-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              <RotateCcw size={18} />
              Return Book
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            <CheckCircle
              size={20}
              className="mt-0.5 shrink-0"
            />
            <span>{message}</span>
          </div>
        )}

        <div className="mb-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">
              Total Overdue Books
            </h2>

            <p className="mt-2 text-4xl font-bold text-red-600">
              {overdueBooks.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500">
              Estimated Fine if Returned Today
            </h2>

            <p className="mt-2 text-4xl font-bold text-green-600">
              ₦{totalEstimatedFine.toLocaleString()}
            </p>
          </div>
        </div>

        {loading && (
          <div className="space-y-5">
            {Array.from({ length: 3 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-3xl bg-gray-200"
                />
              )
            )}
          </div>
        )}

        {!loading && overdueBooks.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <CheckCircle
              size={60}
              className="mx-auto text-green-500"
            />

            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              No Overdue Books
            </h2>

            <p className="mt-2 text-gray-500">
              All active borrowed books are within their due
              dates.
            </p>
          </div>
        )}

        <div className="grid gap-6">
          {overdueBooks.map((book, index) => {
            const isReturning =
              returningId === book._id;

            return (
              <article
                key={book._id}
                className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm"
              >
                <p className="mb-4 text-sm font-bold text-red-600">
                  #{index + 1} Overdue Record
                </p>

                <div className="grid gap-6 lg:grid-cols-2">
                  <section>
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                      <BookOpen size={22} />
                      {book.resource?.title ||
                        "Unknown Book"}
                    </h2>

                    <p className="mt-2 text-gray-600">
                      Author:{" "}
                      {book.resource?.authors?.join(", ") ||
                        "Unknown author"}
                    </p>

                    <p className="text-gray-600">
                      ISBN: {book.resource?.isbn || "-"}
                    </p>

                    <p className="text-gray-600">
                      Call Number:{" "}
                      {book.resource?.callNumber || "-"}
                    </p>

                    <div className="mt-4 flex items-center gap-2 font-medium text-red-600">
                      <Calendar size={18} />

                      <span>
                        Due Date:{" "}
                        {book.dueDate
                          ? new Date(
                              book.dueDate
                            ).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-red-900">
                      <User size={20} />
                      Borrower Information
                    </h3>

                    <p>
                      <strong>Name:</strong>{" "}
                      {book.user?.fullName ||
                        "Unknown borrower"}
                    </p>

                    <p>
                      <strong>Email:</strong>{" "}
                      {book.user?.email || "-"}
                    </p>

                    <p>
                      <strong>Role:</strong>{" "}
                      {book.user?.role || "-"}
                    </p>

                    {book.user?.admissionNo && (
                      <p>
                        <strong>Admission No:</strong>{" "}
                        {book.user.admissionNo}
                      </p>
                    )}

                    {book.user?.staffNo && (
                      <p>
                        <strong>Staff No:</strong>{" "}
                        {book.user.staffNo}
                      </p>
                    )}

                    {book.user?.phoneNo && (
                      <p>
                        <strong>Phone:</strong>{" "}
                        {book.user.phoneNo}
                      </p>
                    )}
                  </section>
                </div>

                <div className="mt-6 rounded-2xl bg-red-50 p-5">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Days Late
                      </p>

                      <p className="text-2xl font-bold text-red-600">
                        {book.daysLate}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Fine Per Day
                      </p>

                      <p className="text-2xl font-bold text-orange-600">
                        ₦{book.finePerDay.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-sm text-gray-500">
                        <CreditCard size={16} />
                        Estimated Fine
                      </p>

                      <p className="text-3xl font-bold text-green-700">
                        ₦
                        {book.estimatedFine.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleReturn(book)
                        }
                        disabled={isReturning}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RotateCcw size={18} />
                        {isReturning
                          ? "Processing..."
                          : "Mark Returned"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}