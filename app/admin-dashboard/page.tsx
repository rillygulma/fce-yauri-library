"use client";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Bell,
  Search,
  Menu,
  X,
  Activity,
  Eye,
  Pencil,
  Trash2,
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
    title: "Blog Posts",
    value: "124",
    icon: FileText,
    growth: "+4 new posts",
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

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    profilePicture: "",
  });

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture || "",
    });
  };

  const updateUser = async () => {
    if (!editingUser) return;

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role.toLowerCase(),
        profilePicture: formData.profilePicture,
      };

      const res = await fetch(`/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();

      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser._id ? data.user : u)),
      );

      setEditingUser(null);
    } catch (error) {
      console.log(error);
      alert("Failed to update user");
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteUser) return;

    try {
      const res = await fetch(`/api/users/${deleteUser._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setUsers((prev) => prev.filter((u) => u._id !== deleteUser._id));

      setDeleteUser(null);
    } catch (error) {
      console.log(error);
      alert("Failed to delete user");
    }
  };

  // ================= FETCH USERS ================= //
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

  // ================= CONTACT API =================
  useEffect(() => {
    const fetchContactMessages = async () => {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();

        // ✅ FIXED HERE
        setContactMessages(data.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchContactMessages();
  }, []);

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

  const editUser = async (user: User) => {
    const newName = prompt("Enter full name", user.fullName);
    const newEmail = prompt("Enter email", user.email);
    const newRole = prompt("Enter role", user.role);

    if (!newName || !newEmail || !newRole) return;

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: newName,
          email: newEmail,
          role: newRole,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();

      // update UI instantly
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? updated.user : u)),
      );
    } catch (error) {
      console.log(error);
      alert("Failed to update user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      user.role.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  // ================= LOGOUT =================
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

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
              alt="FCE Yauri Logo"
              width={48}
              height={48}
              className="rounded-full object-cover"
            />

            <div>
              <h1 className="text-2xl font-bold text-blue-700">FCE Yauri Admin</h1>
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
              label: "Home",
              path: "/",
            },
            {
              icon: Users,
              label: "Users",
              path: "/register",
            },
            {
              icon: BookOpen,
              label: "Add Resources",
              path: "/admin/resources/add",
            },
            {
              icon: BookOpen,
              label: "Borrow Books",
              path: "/admin/borrow-request",
            },
            {
              icon: ClipboardList,
              label: "Return Borrowed Books",
              path: "/admin/return-borrowedBook",
            },
            {
              icon: ClipboardList,
              label: "All Borrowed Due Books",
              path: "/admin/overdue-books",
            },
            {
              icon: Megaphone,
              label: "Announcements",
              path: "/admin/announcements",
            },
            {
              icon: FileText,
              label: "Blog Posts",
              path: "/admin/blog",
            },
            {
              icon: MessageCircle,
              label: "Contact Us Message",
              path: "/admin/contact-messages",
            },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all duration-300 ${
                index === 0
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />

                {item.label === "Contact Us Message" &&
                  contactMessages.length > 0 && (
                    <>
                      <span className="absolute -right-2 -top-2 flex h-5 w-5 animate-ping rounded-full bg-red-500"></span>

                      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                        {contactMessages.length}
                      </span>
                    </>
                  )}
              </div>

              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-gray-700 transition-all duration-300 hover:bg-red-50 hover:text-red-700"
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

      {/* Main Content */}
      <main className="lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-blue-700 sm:text-2xl">
                Dashboard Overview
              </h2>
              <p className="text-sm text-gray-500">
                Welcome back, Administrator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center rounded-2xl border bg-gray-50 px-4 py-2 md:flex">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="ml-2 bg-transparent text-sm outline-none"
              />
            </div>

            <button className="relative rounded-xl bg-gray-100 p-3 hover:bg-gray-200">
              <Bell className="h-5 w-5 text-gray-700" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            <div className="flex items-center gap-3 rounded-2xl bg-gray-100 px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                {currentUser?.fullName?.charAt(0) || "A"}
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">
                  {currentUser?.fullName || "Admin"}
                </p>
                <p className="text-xs text-gray-500 uppercase">
                  {currentUser?.role || "System User"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-3xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-800">
                      {stat.value}
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-blue-100 p-4 text-blue-700">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>

                <p className="mt-5 text-sm font-medium text-green-600">
                  {stat.growth}
                </p>
              </div>
            ))}
          </section>

          {/* USERS TABLE */}
          <section className="mt-8 rounded-3xl bg-white p-6 shadow-md">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Recent Users
                </h2>
                <p className="text-sm text-gray-500">
                  Manage recently registered users
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center rounded-2xl border bg-gray-50 px-4 py-3">
                  <Search className="h-4 w-4 text-gray-500" />

                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ml-2 bg-transparent text-sm outline-none"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-2xl border bg-gray-50 px-4 py-3 text-sm outline-none"
                >
                  <option value="all">Category</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="student">Student</option>
                </select>

                <Link
                  href="/register"
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Add New User
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-4 text-sm font-semibold text-gray-500">
                      User
                    </th>
                    <th className="pb-4 text-sm font-semibold text-gray-500">
                      Role
                    </th>
                    <th className="pb-4 text-sm font-semibold text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b last:border-none hover:bg-gray-50"
                    >
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white">
                            {user.profilePicture ? (
                              <Image
                                src={user.profilePicture}
                                alt={user.fullName}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="font-semibold">
                                {user.fullName?.charAt(0)}
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {user.fullName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-5 text-gray-700">{user.role}</td>

                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <button className="rounded-xl bg-blue-100 p-3 text-blue-700">
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(user)}
                            className="rounded-xl bg-green-100 p-3 text-green-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setDeleteUser(user)}
                            className="rounded-xl bg-red-100 p-3 text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-10 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      {/* ================= EDIT USER MODAL ================= */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>

                <p className="text-sm text-gray-500">Update user information</p>
              </div>

              <button
                onClick={() => setEditingUser(null)}
                className="rounded-xl p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Role
                </label>

                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="librarian">Librarian</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Profile Picture URL
                </label>

                <input
                  type="text"
                  value={formData.profilePicture}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profilePicture: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-4">
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-2xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={updateUser}
                className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {deleteUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-4 text-red-600">
                <Trash2 className="h-8 w-8" />
              </div>
            </div>

            <div className="mt-5 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Delete User</h2>

              <p className="mt-3 text-gray-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">
                  {deleteUser.fullName}
                </span>
                ?
              </p>

              <p className="mt-1 text-sm text-red-500">
                This action cannot be undone.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={() => setDeleteUser(null)}
                className="flex-1 rounded-2xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteUser}
                className="flex-1 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
