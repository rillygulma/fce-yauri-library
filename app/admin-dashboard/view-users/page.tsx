"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  GraduationCap,
  LoaderCircle,
  RefreshCw,
  Search,
  Users,
  UserRound,
  XCircle,
} from "lucide-react";
import Image from "next/image";

type User = {
  _id?: string;
 fullName?: string;
  name?: string;
  email?: string;
  role?: string;
  profilePicture?: string;
};

const roleOptions = [
  { value: "all", label: "All Users" },
  { value: "student", label: "Students" },
  { value: "staff", label: "Staff" },
  { value: "librarian", label: "Librarians" },
  { value: "admin", label: "Administrators" },
];

export default function ViewUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users", {
        cache: "no-store",
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error("Unable to load registered users.");
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("users" in data) ||
        !Array.isArray(data.users)
      ) {
        throw new Error("The users API returned an invalid response.");
      }

      setUsers(data.users as User[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading users.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void fetchUsers();
    }, 0);

    return () => window.clearTimeout(task);
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const name = user.fullName || user.name || "";
      const email = user.email || "";
      const role = user.role?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        role.includes(query);

      const matchesRole = roleFilter === "all" || role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const totalStudents = users.filter(
    (user) => user.role?.toLowerCase() === "student",
  ).length;

  const totalStaff = users.filter((user) => {
    const role = user.role?.toLowerCase();
    return role === "staff" || role === "librarian";
  }).length;

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-red-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-red-900 sm:text-3xl">
              Registered Users
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              View and search registered students, staff, librarians, and
              administrators.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                void fetchUsers();
              }}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              <Users className="h-4 w-4" />
              Register User
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {loading ? "—" : users.length.toLocaleString()}
                </h2>
              </div>
              <div className="rounded-xl bg-red-50 p-3 text-red-900">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {loading ? "—" : totalStudents.toLocaleString()}
                </h2>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Staff</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {loading ? "—" : totalStaff.toLocaleString()}
                </h2>
              </div>
              <div className="rounded-xl bg-green-50 p-3 text-green-700">
                <UserRound className="h-6 w-6" />
              </div>
            </div>
          </div>
        </section>

        {/* Users table */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                All Registered Users
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {loading
                  ? "Loading users..."
                  : `Showing ${filteredUsers.length.toLocaleString()} of ${users.length.toLocaleString()} users`}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, email, or role..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-100"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                )}
              </div>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                aria-label="Filter users by role"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-semibold">{error}</p>
              <button
                type="button"
                onClick={() => void fetchUsers()}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center">
                      <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-red-900" />
                      <p className="mt-3 text-sm text-gray-500">
                        Loading registered users...
                      </p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-sm text-gray-500"
                    >
                      Unable to display users.
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center">
                      <Users className="mx-auto h-10 w-10 text-gray-300" />
                      <p className="mt-3 font-semibold text-gray-700">
                        No users found
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Try another search term or role.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const name = user.fullName || user.name || "Unnamed User";
                    const role = user.role?.toLowerCase() || "unknown";

                    return (
                      <tr
                        key={user._id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {user.profilePicture ? (
                              <Image
                                src={user.profilePicture}
                                alt={name}
                                width={44}
                                height={44}
                                className="h-11 w-11 rounded-full border border-gray-200 object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-900">
                                {getInitials(name)}
                              </div>
                            )}

                            <span className="font-semibold text-gray-800">
                              {name}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {user.email || "No email provided"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : role === "student"
                                  ? "bg-blue-100 text-blue-700"
                                  : role === "staff"
                                    ? "bg-green-100 text-green-700"
                                    : role === "librarian"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {role}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-5 py-4">
            <p className="text-xs text-gray-500">
              User records are retrieved from your registered users API.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
