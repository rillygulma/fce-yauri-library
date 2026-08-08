"use client";

import { useEffect, useState } from "react";

import {
  BookOpen,
  CheckCircle,
  Clock,
  RefreshCw,
  User,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface BorrowRequest {
  _id: string;

  status: "pending" | "approved" | "rejected" | "returned";

  requestDate?: string;
  approvedDate?: string;
  dueDate?: string;

  user?: {
    _id: string;
    fullName?: string;
    email?: string;
    role?: string;
    staffNo?: string;
    admissionNo?: string;
    department?: string;
  };

  resource?: {
    _id: string;
    title?: string;
    authors?: string[];
    isbn?: string;
    callNumber?: string;
    coverImage?: string;
  };
}

export default function BorrowRequestsPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);

  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const [error, setError] = useState("");

  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "returned"
  >("all");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/borrow-request", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load borrow requests.");
      }

      setRequests(data.requests || []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load borrow requests.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await loadRequests();
    })();
  }, []);

  async function processRequest(id: string, action: "approve" | "reject") {
    const confirmed = window.confirm(
      action === "approve"
        ? "Approve this borrow request?"
        : "Reject this borrow request?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(id);

      const response = await fetch(`/api/borrow-request/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process request.");
      }

      await loadRequests();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Failed to process request.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  const filteredRequests = requests.filter((request) => {
    if (filter === "all") {
      return true;
    }

    return request.status === filter;
  });

  const pendingCount = requests.filter(
    (item) => item.status === "pending",
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}

      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-red-900">
                Library Management
              </p>

              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                Borrow Requests
              </h1>

              <p className="mt-2 text-gray-600">
                Review and manage book borrowing requests.
              </p>
            </div>

            <button
              type="button"
              onClick={loadRequests}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-red-900 hover:text-red-900 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Requests"
            value={requests.length}
            icon={<BookOpen size={22} />}
          />

          <StatCard
            label="Pending"
            value={pendingCount}
            icon={<Clock size={22} />}
          />

          <StatCard
            label="Approved"
            value={requests.filter((item) => item.status === "approved").length}
            icon={<CheckCircle size={22} />}
          />

          <StatCard
            label="Rejected"
            value={requests.filter((item) => item.status === "rejected").length}
            icon={<XCircle size={22} />}
          />
        </div>

        {/* FILTER */}

        <div className="mt-8 flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected", "returned"].map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item as typeof filter)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                  filter === item
                    ? "bg-red-900 text-white"
                    : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-900"
                }`}
              >
                {item}
              </button>
            ),
          )}
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* REQUESTS */}

        <div className="mt-6 space-y-4">
          {loading ? (
            Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl bg-gray-200"
              />
            ))
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-300" />

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No borrow requests
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                There are no requests in this category.
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <BorrowRequestCard
                key={request._id}
                request={request}
                processing={processingId === request._id}
                onApprove={() => processRequest(request._id, "approve")}
                onReject={() => processRequest(request._id, "reject")}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   REQUEST CARD
============================================================ */

function BorrowRequestCard({
  request,
  processing,
  onApprove,
  onReject,
}: {
  request: BorrowRequest;
  processing: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* BOOK */}

          <div className="flex min-w-0 gap-4">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-red-50">
              {request.resource?.coverImage ? (
                <Image
                  src={request.resource.coverImage}
                  alt={request.resource.title || "Book"}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <BookOpen size={36} className="text-red-900" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-gray-900">
                {request.resource?.title || "Unknown Book"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {request.resource?.authors?.join(", ") || "Unknown author"}
              </p>

              {request.resource?.isbn && (
                <p className="mt-1 text-xs text-gray-400">
                  ISBN: {request.resource.isbn}
                </p>
              )}
            </div>
          </div>

          {/* USER */}

          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-gray-100 p-2">
              <User size={20} className="text-gray-600" />
            </div>

            <div>
              <p className="font-semibold text-gray-900">
                {request.user?.fullName || "Unknown User"}
              </p>

              <p className="text-sm text-gray-500">
                {request.user?.email || "No email"}
              </p>

              <p className="mt-1 text-xs capitalize text-gray-400">
                {request.user?.role || "student"}
              </p>
            </div>
          </div>

          {/* STATUS */}

          <div>
            <StatusBadge status={request.status} />

            <p className="mt-2 text-xs text-gray-400">
              Requested:{" "}
              {request.requestDate
                ? new Date(request.requestDate).toLocaleDateString()
                : "-"}
            </p>
          </div>

          {/* ACTIONS */}

          {request.status === "pending" && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onApprove}
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle size={17} />

                {processing ? "Processing..." : "Approve"}
              </button>

              <button
                type="button"
                onClick={onReject}
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-xl bg-red-100 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-200 disabled:opacity-50"
              >
                <XCircle size={17} />
                Reject
              </button>
            </div>
          )}
        </div>

        {/* DUE DATE */}

        {request.dueDate && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              Due date:{" "}
              <span className="font-bold text-gray-900">
                {new Date(request.dueDate).toLocaleDateString()}
              </span>
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>

        <div className="rounded-xl bg-red-50 p-3 text-red-900">{icon}</div>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }: { status: BorrowRequest["status"] }) {
  const styles = {
    pending: "bg-yellow-50 text-yellow-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
    returned: "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
        styles[status]
      }`}
    >
      {status}
    </span>
  );
}
