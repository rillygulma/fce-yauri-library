"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  User,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

type BorrowStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "returned";

interface BorrowUser {
  _id: string;
  fullName?: string;
  email?: string;
  role?: string;
  department?: string;
  admissionNo?: string;
  staffNo?: string;
}

interface BorrowResource {
  _id: string;
  title?: string;
  authors?: string[];
  isbn?: string;
  callNumber?: string;
  coverImage?: string;
}

interface BorrowRequest {
  _id: string;
  status: BorrowStatus;
  requestDate: string;
  approvedDate?: string;
  dueDate?: string;
  user?: BorrowUser;
  resource?: BorrowResource;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  requests?: BorrowRequest[];
}

export default function LibrarianBorrowRequestsPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(
    null
  );
  const [filter, setFilter] = useState<BorrowStatus | "all">(
    "pending"
  );

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/borrow-request", {
        method: "GET",
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load borrow requests."
        );
      }

      setRequests(data.requests ?? []);
    } catch (error) {
      console.error("LOAD BORROW REQUESTS ERROR:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load borrow requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const updateRequest = async (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    try {
      setProcessingId(requestId);

      const response = await fetch(
        `/api/borrow-request/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update borrow request."
        );
      }

      toast.success(
        data.message ||
          `Borrow request ${action}d successfully.`
      );

      await loadRequests();
    } catch (error) {
      console.error("UPDATE BORROW REQUEST ERROR:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update borrow request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter((request) =>
    filter === "all" ? true : request.status === filter
  );

  const pendingCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status: BorrowStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "approved":
        return "bg-green-100 text-green-800";

      case "rejected":
        return "bg-red-100 text-red-800";

      case "returned":
        return "bg-blue-100 text-blue-800";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-red-900">
              Librarian Panel
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              Borrow Book Requests
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Review and manage student book borrowing requests.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadRequests()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* SUMMARY */}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Pending Requests
              </p>

              <Clock className="text-yellow-600" size={22} />
            </div>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Approved Requests
              </p>

              <CheckCircle className="text-green-600" size={22} />
            </div>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {
                requests.filter(
                  (request) => request.status === "approved"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Total Requests
              </p>

              <BookOpen className="text-red-900" size={22} />
            </div>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {requests.length}
            </p>
          </div>
        </div>

        {/* FILTERS */}

        <div className="mb-6 flex flex-wrap gap-2">
          {(
            ["pending", "approved", "rejected", "returned", "all"] as const
          ).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                filter === status
                  ? "bg-red-900 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* REQUESTS */}

        {loading ? (
          <div className="flex min-h-60 items-center justify-center rounded-2xl bg-white">
            <Loader2
              size={30}
              className="animate-spin text-red-900"
            />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <BookOpen
              size={42}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-4 text-lg font-bold text-gray-800">
              No borrow requests found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              There are no requests in this category.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const isProcessing = processingId === request._id;

              return (
                <article
                  key={request._id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* BOOK INFORMATION */}

                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-lg bg-red-50">
                        <BookOpen
                          size={30}
                          className="text-red-900"
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-gray-900">
                          {request.resource?.title ||
                            "Untitled book"}
                        </h2>

                        {request.resource?.authors &&
                          request.resource.authors.length > 0 && (
                            <p className="mt-1 text-sm text-gray-500">
                              {request.resource.authors.join(", ")}
                            </p>
                          )}

                        <p className="mt-2 text-xs text-gray-400">
                          Requested:{" "}
                          {formatDate(request.requestDate)}
                        </p>
                      </div>
                    </div>

                    {/* STATUS */}

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getStatusStyle(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  {/* USER INFORMATION */}

                  <div className="mt-5 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                    <p className="flex items-start gap-2">
                      <User size={17} className="mt-0.5 shrink-0" />

                      <span>
                        <strong className="text-gray-800">
                          Borrower:
                        </strong>{" "}
                        {request.user?.fullName || "Unknown user"}
                      </span>
                    </p>

                    <p>
                      <strong className="text-gray-800">
                        Email:
                      </strong>{" "}
                      {request.user?.email || "—"}
                    </p>

                    <p>
                      <strong className="text-gray-800">
                        Department:
                      </strong>{" "}
                      {request.user?.department || "—"}
                    </p>

                    <p>
                      <strong className="text-gray-800">
                        Role:
                      </strong>{" "}
                      {request.user?.role || "—"}
                    </p>

                    <p>
                      <strong className="text-gray-800">
                        Admission/Staff No:
                      </strong>{" "}
                      {request.user?.admissionNo ||
                        request.user?.staffNo ||
                        "—"}
                    </p>

                    {request.dueDate && (
                      <p>
                        <strong className="text-gray-800">
                          Due date:
                        </strong>{" "}
                        {formatDate(request.dueDate)}
                      </p>
                    )}
                  </div>

                  {/* ACTIONS */}

                  {request.status === "pending" && (
                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          void updateRequest(request._id, "reject")
                        }
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void updateRequest(request._id, "approve")
                        }
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle size={18} />
                        )}

                        Approve
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}