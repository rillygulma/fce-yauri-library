"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  RefreshCw,
  RotateCcw,
  Search,
  User,
} from "lucide-react";

interface BorrowRequest {
  _id: string;

  status: "pending" | "approved" | "rejected" | "returned";

  approvedDate?: string;
  dueDate?: string;
  isReturned?: boolean;
  fine?: number;

  resource?: {
    _id: string;
    title?: string;
    authors?: string[];
    isbn?: string;
    callNumber?: string;
    availableCopies?: number;
    borrowedCopies?: number;
  };

  user?: {
    _id: string;
    fullName?: string;
    email?: string;
    role?: string;
    staffNo?: string;
    admissionNo?: string;
    department?: string;
  };
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  requests?: BorrowRequest[];
  fine?: number;
  overdueDays?: number;
}

function formatDate(date?: string) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString();
}

export default function ReturnBookPage() {
  const [requests, setRequests] = useState<
    BorrowRequest[]
  >([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<
    string | null
  >(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = useCallback(async () => {
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
            "Failed to load borrowed books."
        );
      }

      setRequests(
        Array.isArray(data.requests)
          ? data.requests
          : []
      );
    } catch (error) {
      console.error(
        "LOAD RETURNABLE BOOKS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load borrowed books."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRequests();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadRequests]);

  const returnableRequests = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return requests.filter((request) => {
      if (
        request.status !== "approved" ||
        request.isReturned
      ) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchableValues = [
        request.resource?.title,
        request.resource?.isbn,
        request.resource?.callNumber,
        request.resource?.authors?.join(" "),
        request.user?.fullName,
        request.user?.email,
        request.user?.staffNo,
        request.user?.admissionNo,
        request.user?.department,
      ];

      return searchableValues.some((value) =>
        value
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [requests, search]);

  async function handleReturn(
    borrowRequest: BorrowRequest
  ) {
    const bookTitle =
      borrowRequest.resource?.title || "this book";

    const confirmed = window.confirm(
      `Confirm that "${bookTitle}" has been physically returned.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setReturningId(borrowRequest._id);
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
            requestId: borrowRequest._id,
            action: "returned",
          }),
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to return the book."
        );
      }

      setMessage(
        data.message || "Book returned successfully."
      );

      await loadRequests();
    } catch (error) {
      console.error("RETURN BOOK ERROR:", error);

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
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-900 p-3 text-white">
              <RotateCcw size={26} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-red-900">
                Return Book
              </h1>

              <p className="mt-1 text-gray-500">
                Find an active loan and confirm that the
                book has been returned.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by title, ISBN, staff number, or admission number"
                className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-red-900 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <button
              type="button"
              onClick={loadRequests}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-red-900 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={
                  loading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Search matches book title, ISBN, call number,
            borrower name, staff number, admission number,
            department, or email.
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            <CheckCircle
              size={20}
              className="mt-0.5 shrink-0"
            />
            <span>{message}</span>
          </div>
        )}

        <div className="mt-8">
          <p className="mb-4 text-sm font-medium text-gray-500">
            {loading
              ? "Loading active loans..."
              : `${returnableRequests.length} active loan(s) found`}
          </p>

          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-44 animate-pulse rounded-3xl bg-gray-200"
                  />
                )
              )}
            </div>
          )}

          {!loading &&
            returnableRequests.length === 0 && (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <BookOpen
                  size={52}
                  className="mx-auto text-gray-300"
                />

                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  No Active Borrowed Books Found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Try another title, ISBN, staff number, or
                  admission number.
                </p>
              </div>
            )}

          <div className="grid gap-5">
            {returnableRequests.map((request) => {
              const isReturning =
                returningId === request._id;

              return (
                <article
                  key={request._id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-red-900">
                        <BookOpen size={20} />

                        <span className="text-sm font-bold uppercase tracking-wide">
                          Borrowed Book
                        </span>
                      </div>

                      <h2 className="mt-3 text-xl font-bold text-gray-900">
                        {request.resource?.title ||
                          "Unknown Book"}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {request.resource?.authors?.join(
                          ", "
                        ) || "Unknown author"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                        <span>
                          <strong>ISBN:</strong>{" "}
                          {request.resource?.isbn || "-"}
                        </span>

                        <span>
                          <strong>Call No.:</strong>{" "}
                          {request.resource?.callNumber ||
                            "-"}
                        </span>

                        <span>
                          <strong>Due date:</strong>{" "}
                          {formatDate(request.dueDate)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleReturn(request)
                      }
                      disabled={isReturning}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RotateCcw size={18} />
                      {isReturning
                        ? "Processing..."
                        : "Mark Returned"}
                    </button>
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <div className="flex items-start gap-3">
                      <User
                        size={20}
                        className="mt-0.5 text-gray-400"
                      />

                      <div className="text-sm text-gray-600">
                        <p className="font-bold text-gray-900">
                          {request.user?.fullName ||
                            "Unknown Borrower"}
                        </p>

                        <p className="mt-1">
                          {request.user?.role || "User"}{" "}
                          ·{" "}
                          {request.user?.staffNo
                            ? `Staff No: ${request.user.staffNo}`
                            : request.user?.admissionNo
                              ? `Admission No: ${request.user.admissionNo}`
                              : "No borrower number"}
                        </p>

                        {request.user?.department && (
                          <p className="mt-1">
                            {request.user.department}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}