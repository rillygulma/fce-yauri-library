"use client";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  Bell,
  Menu,
  X,
  Activity,
  Megaphone,
  LogOut,
  MessageCircle,
  ClipboardList,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const stats = [
  {
    title: "Total Users",
    value: "12,540",
    icon: Users,
    growth: "+12% this month",
  },
  {
    title: "Books Borrowed",
    value: "3,420",
    icon: BookOpen,
    growth: "+8% this week",
  },
  {
    title: "Active Sessions",
    value: "1,240",
    icon: Activity,
    growth: "+18% today",
  },
];

type User = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profilePicture?: string;
};

type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export default function LibrarianDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // ================= FETCH USERS =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUsers();
  }, []);

  // ================= CONTACT MESSAGES =================
  useEffect(() => {
    const fetchContactMessages = async () => {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();
        setContactMessages(data.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchContactMessages();
  }, []);

  // ================= CURRENT USER =================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const t = setTimeout(() => setCurrentUser(parsed), 0);
        return () => clearTimeout(t);
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  const filteredRecentUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // ================= LOGOUT =================
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/fce-logo.jpeg"
              alt="FCE Logo"
              width={48}
              height={48}
              className="rounded-full object-cover"
            />

            <div>
              <h1 className="text-2xl font-bold text-blue-700">
                FCE Yauri Librarian
              </h1>
              <p className="text-sm text-gray-500">Management Dashboard</p>
            </div>
          </div>

          <button
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-2 p-4">
          {[
            {
              icon: LayoutDashboard,
              label: "Dashboard",
              path: "/librarian-dashboard",
            },
            {
              icon: Users,
              label: "Register Users",
              path: "/register",
            },
            {
              icon: BookOpen,
              label: "Create Borrow Books",
              path: "/admin/borrow-request",
            },
            {
              icon: ClipboardList,
              label: "Return Borrowed Books",
              path: "/admin/return-borrowedBook",
            },
            {
              icon: Megaphone,
              label: "Create Announcements",
              path: "/admin/announcements",
            },
            {
              icon: MessageCircle,
              label: "Contact us Messages",
              path: "/admin/contact-messages",
            },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 ${
                index === 0
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>

              {item.label.includes("Contact") && contactMessages.length > 0 && (
                <span className="ml-auto rounded-full bg-red-600 px-2 text-xs text-white">
                  {contactMessages.length}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-gray-700 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

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
        {/* HEADER */}
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
              <p className="text-sm text-gray-500">Welcome back, Librarian</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5" />

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                {currentUser?.fullName?.charAt(0) || "L"}
              </div>
              <span>{currentUser?.fullName || "Librarian"}</span>
            </div>
          </div>
        </header>

        {/* STATS */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow">
              <s.icon />
              <h3 className="text-2xl font-bold">{s.value}</h3>
              <p className="text-gray-500">{s.title}</p>
            </div>
          ))}
        </div>

        {/* RECENT USERS (ADDED) */}
        <div className="p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/2 rounded-xl border p-2"
            />

            {/* FILTER */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-1/4 rounded-xl border p-2"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="librarian">Librarian</option>
              <option value="undergraduate">Students</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Recent Users</h2>
              <p className="text-sm text-gray-500">Latest registered users</p>
            </div>

            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-4">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecentUsers.slice(0, 10).map((u) => (
                  <tr key={u._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRecentUsers.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No users found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
