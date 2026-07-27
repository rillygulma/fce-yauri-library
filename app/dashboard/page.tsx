"use client";

import {
  LayoutDashboard,
  BookOpen,
  Settings,
  Bell,
  Menu,
  X,
  Activity,
  Bookmark,
  ClipboardList,
  LogOut,
  Bot,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  _id?: string;
  fullName?: string;
  role?: string;
  email?: string;
};

export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // avoid synchronous setState inside effect to prevent cascading renders
        const t = setTimeout(() => setCurrentUser(parsed), 0);
        return () => clearTimeout(t);
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const stats = [
    {
      title: "Books Borrowed",
      value: "8",
      icon: BookOpen,
      growth: "+2 this month",
    },
    {
      title: "Active Loans",
      value: "3",
      icon: ClipboardList,
      growth: "Due soon",
    },
    {
      title: "Saved Books",
      value: "12",
      icon: Bookmark,
      growth: "+5 this week",
    },
    {
      title: "Library Activity",
      value: "24",
      icon: Activity,
      growth: "+10% increase",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/fce-logo.jpeg"
              alt="Library"
              width={48}
              height={48}
              className="rounded-full"
            />

            <div>
              <h1 className="text-2xl font-bold text-blue-700">FCE Yauri Library</h1>
              <p className="text-sm text-gray-500">Library Dashboard</p>
            </div>
          </div>

          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          {[
            {
              icon: Bot,
              label: "FCE Yauri AI",
              path: "/research-ai",
            },
            {
              icon: Bot,
              label: "AI Generate PDF",
              path: "/generate-pdf",
            },
            {
              icon: BookOpen,
              label: "E-Library",
              path: "/e-library/databases",
            },
            {
              icon: ClipboardList,
              label: "Borrowed Books History",
              path: "/borrow-history",
            },
            {
              icon: Bell,
              label: "Announcements",
              path: "#",
            },
            {
              icon: Settings,
              label: "Library Rules & Regulations",
              path: "/library-rules",
            },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.path}
              className="flex items-center gap-4 rounded-2xl px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-gray-700 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>

        {/* Bottom Card */}
        <div className="p-4">
          <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-xl">
            <h2 className="text-lg font-semibold">Need Help?</h2>
            <p className="mt-2 text-sm text-blue-100">
              Contact the ICT department for technical assistance.
            </p>

            <button className="mt-4 w-full rounded-xl bg-white py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100">
              Contact Support
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="lg:ml-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-blue-700">
                Dashboard Overview
              </h2>
              <p className="text-sm text-gray-500">
                Welcome back, {currentUser?.fullName || "User"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-3 rounded-2xl bg-gray-100 px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                {currentUser?.fullName?.charAt(0) || "U"}
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">
                  {currentUser?.fullName || "User"}
                </p>
                <p className="text-xs text-gray-500 uppercase">
                  {currentUser?.role || "Student/Staff"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* STATS */}
        <div className="p-4 sm:p-6 lg:p-8">
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="rounded-3xl bg-white p-6 shadow-md">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  </div>

                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>

                <p className="mt-4 text-sm text-green-600">{stat.growth}</p>
              </div>
            ))}
          </section>

          {/* QUICK ACTIONS */}
          <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Browse E-Library */}
            <Link
              href="/e-library/databases"
              className="rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            >
              <h3 className="text-lg font-bold">Browse E-Library</h3>
              <p className="text-sm text-gray-500">Access academic resources</p>
            </Link>

            {/* Borrow Books */}
            <div className="rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
              <h3 className="text-lg font-bold">Borrow Books</h3>
              <p className="text-sm text-gray-500">Request or return books</p>
            </div>

            {/* Library Rules */}
            <Link
              href="/library-rules"
              className="rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            >
              <h3 className="text-lg font-bold">Library Rules & Regulations</h3>
              <p className="text-sm text-gray-500">
                Read guidelines & policies
              </p>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
