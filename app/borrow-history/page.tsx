"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import Image from "next/image";

interface BorrowRequest {
  _id: string;

  status:
    | "pending"
    | "approved"
    | "rejected"
    | "returned";

  requestDate?: string;
  approvedDate?: string;
  dueDate?: string;
  returnDate?: string;

  isReturned?: boolean;
  fine?: number;

  resource?: {
    _id: string;
    title?: string;
    authors?: string[];
    isbn?: string;
    callNumber?: string;
    coverImage?: string;
  };

  user?: {
    _id: string;
    fullName?: string;
    email?: string;
    role?: string;
  };
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  requests?: BorrowRequest[];
}

export default function BorrowHistoryPage() {
  const [loading, setLoading] = useState(true);

  const [borrows, setBorrows] =
    useState<BorrowRequest[]>([]);

  const [error, setError] = useState("");

  /**
   * Get logged-in user ID
   *
   * Login stores:
   * localStorage.setItem("user", JSON.stringify(safeUser))
   */
  const getUserId = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);

      return user?._id?.toString() || null;
    } catch (error) {
      console.error(
        "GET USER ERROR:",
        error
      );

      return null;
    }
  }, []);

  /**
   * Fetch user's borrow requests
   */
  const fetchHistory = useCallback(async () => {
  const userId = getUserId();

  if (!userId) {
    setError(
      "Please login to view your borrow history."
    );
    setBorrows([]);
    setLoading(false);
    return;
  }

  try {
    const response = await fetch(
      `/api/borrow-request/user/${encodeURIComponent(
        userId
      )}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    let data: ApiResponse;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "The server returned an invalid response."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to fetch borrow history."
      );
    }

    setBorrows(
      Array.isArray(data.requests)
        ? data.requests
        : []
    );

    setError("");
  } catch (error) {
    console.error(
      "BORROW HISTORY ERROR:",
      error
    );

    setBorrows([]);

    setError(
      error instanceof Error
        ? error.message
        : "Failed to fetch borrow history."
    );
  } finally {
    setLoading(false);
  }
}, [getUserId]);

  /**
   * Load history when page opens
   */
  useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(true);
    fetchHistory();
  }, 0);

  return () => {
    clearTimeout(timer);
  };
}, [fetchHistory]);
  /**
   * Status UI
   */
  const getStatusUI = (
    status: BorrowRequest["status"]
  ) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700">
            <Clock size={16} />
            Pending
          </span>
        );

      case "approved":
        return (
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            <CheckCircle size={16} />
            Approved
          </span>
        );

      case "rejected":
        return (
          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            <XCircle size={16} />
            Rejected
          </span>
        );

      case "returned":
        return (
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <CheckCircle size={16} />
            Returned
          </span>
        );

      default:
        return null;
    }
  };

  /**
   * Loading
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-9 w-64 animate-pulse rounded bg-gray-200" />

          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-gray-200" />

          <div className="mt-8 space-y-5">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-3xl bg-gray-200"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-red-900">
              My Borrow History
            </h1>

            <p className="mt-2 text-gray-500">
              Track your book requests, borrowed
              books, returns, and fines.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-red-900 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* EMPTY STATE */}
        {!error &&
          borrows.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <BookOpen
                size={52}
                className="mx-auto text-gray-300"
              />

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                No Borrow Requests
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                You have not submitted any book
                borrowing requests yet.
              </p>
            </div>
          )}

        {/* BORROW REQUESTS */}
        <div className="grid gap-6">
          {borrows.map((item) => {
            const book = item.resource;

            return (
              <div
                key={item._id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="p-6">

                  {/* TOP */}
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

                    {/* BOOK */}
                    <div className="flex min-w-0 gap-4">

                      {/* COVER */}
                      <div className="flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-red-50">
                        {book?.coverImage ? (
                          <Image
                            src={
                              book.coverImage
                            }
                            alt={
                              book.title ||
                              "Book cover"
                            }
                            width={80}
                            height={112}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen
                            size={36}
                            className="text-red-900"
                          />
                        )}
                      </div>

                      {/* BOOK DETAILS */}
                      <div className="min-w-0">
                        <h2 className="text-xl font-bold text-gray-900">
                          {book?.title ||
                            "Unknown Book"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {book?.authors?.join(
                            ", "
                          ) ||
                            "Unknown author"}
                        </p>

                        {book?.isbn && (
                          <p className="mt-2 text-xs text-gray-400">
                            ISBN:{" "}
                            {book.isbn}
                          </p>
                        )}

                        {book?.callNumber && (
                          <p className="mt-1 text-xs text-gray-400">
                            Call Number:{" "}
                            {
                              book.callNumber
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="shrink-0">
                      {getStatusUI(
                        item.status
                      )}
                    </div>
                  </div>

                  {/* INFORMATION */}
                  <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">

                    {/* REQUEST DATE */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Request Date
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {item.requestDate
                          ? new Date(
                              item.requestDate
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                    {/* APPROVED DATE */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Approved Date
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {item.approvedDate
                          ? new Date(
                              item.approvedDate
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                    {/* DUE DATE */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Due Date
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {item.dueDate
                          ? new Date(
                              item.dueDate
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                    {/* RETURN DATE */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Return Date
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {item.returnDate
                          ? new Date(
                              item.returnDate
                            ).toLocaleDateString()
                          : "Not returned"}
                      </p>
                    </div>
                  </div>

                  {/* PENDING */}
                  {item.status ===
                    "pending" && (
                    <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                      <div className="flex items-center gap-2">
                        <Clock
                          size={18}
                        />

                        <span>
                          Your borrow request is
                          waiting for librarian
                          approval.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* APPROVED */}
                  {item.status ===
                    "approved" && (
                    <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          size={18}
                        />

                        <span>
                          Your borrow request has
                          been approved.

                          {item.dueDate &&
                            ` Please return the book by ${new Date(
                              item.dueDate
                            ).toLocaleDateString()}.`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* REJECTED */}
                  {item.status ===
                    "rejected" && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <div className="flex items-center gap-2">
                        <XCircle
                          size={18}
                        />

                        <span>
                          Your borrow request was
                          rejected by the librarian.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* RETURNED */}
                  {item.status ===
                    "returned" && (
                    <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          size={18}
                        />

                        <span>
                          This book has been
                          returned successfully.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* FINE */}
                  {(item.fine ?? 0) > 0 && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-semibold text-red-700">
                        Outstanding Fine
                      </p>

                      <p className="mt-1 text-xl font-bold text-red-900">
                        ₦
                        {(
                          item.fine ?? 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}