"use client";

import {
  BookOpen,
  Settings,
  Bell,
  Menu,
  X,
  Activity,
  ClipboardList,
  LogOut,
  Bot,
  UserRound,
  Search,
  Clock,
  Loader2,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserRole = "student" | "staff";

type User = {
  _id?: string;
  fullName?: string;
  role?: UserRole | string;
  email?: string;
  gender?: string;
  admissionNo?: string;
  staffNo?: string;
  department?: string;
  college?: string;
  phoneNo?: string;
  profilePicture?: string;
};

type BorrowRequest = {
  _id?: string;
  status?: string;
  bookId?: string;
  resourceId?: string;
  resource?: {
    _id?: string;
    title?: string;
  };
  book?: {
    _id?: string;
    title?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  returnedAt?: string;
};

type DashboardStats = {
  booksBorrowed: number;
  activeLoans: number;
  pendingRequests: number;
  libraryActivity: number;
};

const initialStats: DashboardStats = {
  booksBorrowed: 0,
  activeLoans: 0,
  pendingRequests: 0,
  libraryActivity: 0,
};

export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] =
    useState<User | null>(null);

  const [stats, setStats] =
    useState<DashboardStats>(initialStats);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const router = useRouter();

  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const parsedUser =
        JSON.parse(storedUser) as User;

      if (!parsedUser || !parsedUser._id) {
        localStorage.removeItem("user");
        localStorage.removeItem("userId");

        router.push("/login");
        return;
      }

      // Only student and staff use this dashboard
      if (
        parsedUser.role !== "student" &&
        parsedUser.role !== "staff"
      ) {
        if (parsedUser.role === "admin") {
          router.push("/admin-dashboard");
          return;
        }

        if (parsedUser.role === "librarian") {
          router.push("/librarian-dashboard");
          return;
        }

        router.push("/login");
        return;
      }

      // Defer the state update so it does not run synchronously in the effect.
      queueMicrotask(() => setCurrentUser(parsedUser));
    } catch (error) {
      console.error(
        "DASHBOARD USER ERROR:",
        error
      );

      localStorage.removeItem("user");
      localStorage.removeItem("userId");

      router.push("/login");
    } finally {
      setLoadingUser(false);
    }
  }, [router]);

  // =====================================================
  // FETCH DYNAMIC DASHBOARD STATISTICS
  // =====================================================

  useEffect(() => {
    if (!currentUser?._id) {
      return;
    }

    const fetchDashboardStats = async () => {
      try {
        setLoadingStats(true);

        const userId = currentUser._id;

        const res = await fetch(
          `/api/borrow-request/user/${userId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error(
            "Failed to load borrowing statistics"
          );
        }

        const data = await res.json();

        // Support different possible API response shapes
        const requests: BorrowRequest[] =
          Array.isArray(data)
            ? data
            : Array.isArray(data.requests)
            ? data.requests
            : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.borrowRequests)
            ? data.borrowRequests
            : [];

        // Normalize statuses
        const normalizedRequests =
          requests.map((request) => ({
            ...request,
            status:
              request.status
                ?.toLowerCase()
                .replace(/[_-]/g, " ")
                .trim() || "",
          }));

        // =================================================
        // BOOKS BORROWED
        // =================================================

        const borrowedStatuses = [
          "approved",
          "borrowed",
          "returned",
          "completed",
          "closed",
        ];

        const booksBorrowed =
          normalizedRequests.filter((request) =>
            borrowedStatuses.includes(
              request.status || ""
            )
          ).length;

        // =================================================
        // ACTIVE LOANS
        // =================================================

        const activeStatuses = [
          "approved",
          "borrowed",
          "active",
        ];

        const activeLoans =
          normalizedRequests.filter((request) =>
            activeStatuses.includes(
              request.status || ""
            )
          ).length;

        // =================================================
        // PENDING REQUESTS
        // =================================================

        const pendingRequests =
          normalizedRequests.filter(
            (request) =>
              request.status === "pending"
          ).length;

        // =================================================
        // LIBRARY ACTIVITY
        // =================================================

        const libraryActivity =
          normalizedRequests.length;

        setStats({
          booksBorrowed,
          activeLoans,
          pendingRequests,
          libraryActivity,
        });
      } catch (error) {
        console.error(
          "DASHBOARD STATS ERROR:",
          error
        );

        // Keep dashboard working even if statistics
        // cannot be retrieved.
        setStats(initialStats);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [currentUser?._id]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");

    router.push("/login");
  };

  // =====================================================
  // ROLE
  // =====================================================

  const userRole =
    currentUser?.role === "staff"
      ? "staff"
      : "student";

  const roleLabel =
    userRole === "staff"
      ? "Staff"
      : "Student";

  // =====================================================
  // STAT CARDS
  // =====================================================

  const statCards = [
    {
      title: "Books Borrowed",
      value: stats.booksBorrowed,
      icon: BookOpen,
      description: "Total borrowing records",
    },
    {
      title: "Active Loans",
      value: stats.activeLoans,
      icon: ClipboardList,
      description: "Currently borrowed",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: Clock,
      description: "Awaiting approval",
    },
    {
      title: "Library Activity",
      value: stats.libraryActivity,
      icon: Activity,
      description: "Total library requests",
    },
  ];

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* LOGO */}

        <div className="flex items-center justify-between border-b p-6">

          <div className="flex items-center gap-3">

            <Image
              src="/images/fce-logo.jpeg"
              alt="FCE Yauri Library"
              width={48}
              height={48}
              className="rounded-full object-cover"
            />

            <div>
              <h1 className="text-xl font-bold text-red-900">
                FCE Yauri Library
              </h1>

              <p className="text-xs text-gray-500">
                {roleLabel} Dashboard
              </p>
            </div>

          </div>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="lg:hidden"
            aria-label="Close sidebar"
          >
            <X />
          </button>

        </div>

        {/* USER PROFILE */}

        <div className="border-b bg-blue-50 p-4">

          <div className="flex items-center gap-3">

            {currentUser.profilePicture ? (
              <Image
                src={currentUser.profilePicture}
                alt={
                  currentUser.fullName ||
                  "User"
                }
                width={45}
                height={45}
                unoptimized
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-900 font-bold text-white">
                {currentUser.fullName
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </div>
            )}

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-gray-800">
                {currentUser.fullName ||
                  "User"}
              </p>

              <p className="truncate text-xs text-gray-500">
                {currentUser.email ||
                  "No email"}
              </p>

              <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-700">
                {roleLabel}
              </span>

            </div>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">

          <Link
            href="/dashboard"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex items-center gap-4 rounded-2xl bg-blue-50 px-4 py-4 font-medium text-blue-700"
          >
            <Activity className="h-5 w-5" />
            Dashboard
          </Link>

          <Link
            href="/opac"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex items-center gap-4 rounded-2xl px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <Search className="h-5 w-5" />
            Search OPAC
          </Link>

          <Link
            href="/research-ai"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex items-center gap-4 rounded-2xl px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <Bot className="h-5 w-5" />
            FCE Yauri AI
          </Link>

          <Link
            href="/generate-pdf"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex items-center gap-4 rounded-2xl px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <Bot className="h-5 w-5" />
            AI Generate PDF
          </Link>

          <Link
            href="/e-library/databases"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex items-center gap-4 rounded-2xl px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <BookOpen className="h-5 w-5" />
            E-Library
          </Link>

          <Link
            href="/borrow-history"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex items-center gap-4 rounded-2xl px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <ClipboardList className="h-5 w-5" />
            Borrowed Books History
          </Link>

          <Link
            href="/announcements"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex items-center gap-4 rounded-2xl px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <Bell className="h-5 w-5" />
            Announcements
          </Link>

          <Link
            href="/library-rules"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex items-center gap-4 rounded-2xl px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <Settings className="h-5 w-5" />
            Library Rules
          </Link>

          <Link
            href="/profile"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex items-center gap-4 rounded-2xl px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <UserRound className="h-5 w-5" />
            My Profile
          </Link>

          {/* STAFF ONLY */}

          {/* {userRole === "staff" && (
            <Link
              href="/librarian/borrow-requests"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="flex items-center gap-4 rounded-2xl px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <ClipboardList className="h-5 w-5" />
              Borrow Requests
            </Link>
          )} */}

          {/* LOGOUT */}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-gray-700 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>

        </nav>

        {/* HELP CARD */}

        <div className="p-4">

          <div className="rounded-2xl bg-red-900 p-5 text-white shadow-xl">

            <h2 className="text-lg font-semibold">
              Need Help?
            </h2>

            <p className="mt-2 text-sm text-blue-100">
              Contact the ICT department for
              technical assistance.
            </p>

            <Link
              href="/contact"
              className="mt-4 block w-full rounded-xl bg-white py-3 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Contact Support
            </Link>

          </div>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="lg:ml-72">

        {/* HEADER */}

        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <button
              className="rounded-xl p-2 hover:bg-gray-100 lg:hidden"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div>

              <h2 className="text-xl font-bold text-red-900">
                Dashboard Overview
              </h2>

              <p className="text-sm text-gray-500">
                Welcome back,{" "}
                <span className="font-medium text-gray-700">
                  {currentUser.fullName ||
                    "User"}
                </span>
              </p>

            </div>

          </div>

          {/* PROFILE */}

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 text-gray-500 sm:flex">
              <Clock className="h-4 w-4" />

              <span className="text-xs">
                Library Portal
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-gray-100 px-3 py-2">

              {currentUser.profilePicture ? (
                <Image
                  src={
                    currentUser.profilePicture
                  }
                  alt={
                    currentUser.fullName ||
                    "User"
                  }
                  width={40}
                  height={40}
                  unoptimized
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {currentUser.fullName
                    ?.charAt(0)
                    .toUpperCase() ||
                    "U"}
                </div>
              )}

              <div className="hidden sm:block">

                <p className="text-sm font-semibold text-gray-800">
                  {currentUser.fullName ||
                    "User"}
                </p>

                <p className="text-xs uppercase text-gray-500">
                  {roleLabel}
                </p>

              </div>

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <div className="p-4 sm:p-6 lg:p-8">

          {/* WELCOME */}

          <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-red-900 to-red-700 p-6 text-white shadow-lg sm:p-8">

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

              <div>

                <p className="mb-2 text-sm font-medium text-blue-100">
                  {roleLabel} Portal
                </p>

                <h1 className="text-2xl font-bold sm:text-3xl">
                  Welcome,{" "}
                  {currentUser.fullName ||
                    "User"}!
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">
                  Manage your library activities,
                  search academic resources, check
                  borrowed books, and access FCE
                  Yauri Library services.
                </p>

              </div>

              <Link
                href="/opac"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                <Search className="h-5 w-5" />
                Search Books
              </Link>

            </div>

          </section>

          {/* =================================================
              DYNAMIC STATS
          ================================================= */}

          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

            {statCards.map((stat) => {

              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-3xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        {stat.title}
                      </p>

                      {loadingStats ? (
                        <div className="mt-2">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                      ) : (
                        <h3 className="mt-1 text-3xl font-bold text-gray-900">
                          {stat.value}
                        </h3>
                      )}

                    </div>

                    <div className="rounded-2xl bg-blue-50 p-3">

                      <Icon className="h-6 w-6 text-blue-600" />

                    </div>

                  </div>

                  <p className="mt-4 text-sm text-gray-500">
                    {stat.description}
                  </p>

                </div>
              );

            })}

          </section>

          {/* QUICK ACTIONS */}

          <section className="mt-8">

            <div className="mb-4">

              <h2 className="text-xl font-bold text-gray-900">
                Quick Actions
              </h2>

              <p className="text-sm text-gray-500">
                Access frequently used library
                services.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

              <Link
                href="/opac"
                className="rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <Search className="mb-4 h-8 w-8 text-blue-600" />

                <h3 className="text-lg font-bold">
                  Search Library
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Find books, journals, projects
                  and other resources.
                </p>
              </Link>

              <Link
                href="/e-library/databases"
                className="rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <BookOpen className="mb-4 h-8 w-8 text-blue-600" />

                <h3 className="text-lg font-bold">
                  Browse E-Library
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Access academic electronic
                  resources.
                </p>
              </Link>

              <Link
                href="/borrow-history"
                className="rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <ClipboardList className="mb-4 h-8 w-8 text-blue-600" />

                <h3 className="text-lg font-bold">
                  Borrowed Books
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  View your borrowing history
                  and active loans.
                </p>
              </Link>

              <Link
                href="/library-rules"
                className="rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <Settings className="mb-4 h-8 w-8 text-blue-600" />

                <h3 className="text-lg font-bold">
                  Library Rules
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Read library guidelines and
                  regulations.
                </p>
              </Link>

            </div>

          </section>

          {/* USER INFORMATION */}

          <section className="mt-8 rounded-3xl bg-white p-6 shadow-md">

            <div className="mb-5">

              <h2 className="text-xl font-bold text-gray-900">
                My Information
              </h2>

              <p className="text-sm text-gray-500">
                Your registered library account
                information.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Full Name
                </p>

                <p className="mt-1 font-medium text-gray-800">
                  {currentUser.fullName ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Email
                </p>

                <p className="mt-1 font-medium text-gray-800">
                  {currentUser.email ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Account Type
                </p>

                <p className="mt-1 font-medium capitalize text-gray-800">
                  {roleLabel}
                </p>
              </div>

              {userRole === "student" && (
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Admission Number
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {currentUser.admissionNo ||
                      "Not provided"}
                  </p>
                </div>
              )}

              {userRole === "staff" && (
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Staff Number
                  </p>

                  <p className="mt-1 font-medium text-gray-800">
                    {currentUser.staffNo ||
                      "Not provided"}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Department
                </p>

                <p className="mt-1 font-medium text-gray-800">
                  {currentUser.department ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  College
                </p>

                <p className="mt-1 font-medium text-gray-800">
                  {currentUser.college ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Phone Number
                </p>

                <p className="mt-1 font-medium text-gray-800">
                  {currentUser.phoneNo ||
                    "Not provided"}
                </p>
              </div>

            </div>

          </section>

        </div>
      </main>
    </div>
  );
}
