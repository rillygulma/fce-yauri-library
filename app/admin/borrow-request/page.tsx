"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, BookOpen, User } from "lucide-react";

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phoneNo?: string;
  profilePicture?: string;
}

interface Book {
  title: string;
  author: string;
  isbn: string;
}

export default function BorrowBookPage() {
  const [query, setQuery] = useState("");
  const [loadingUser, setLoadingUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [user, setUser] = useState<UserData | null>(null);

  // ✅ MULTIPLE BOOKS STATE
  const [books, setBooks] = useState<Book[]>([
    { title: "", author: "", isbn: "" },
  ]);

  // ================= SEARCH USER =================
  const searchUser = async () => {
    const cleanedQuery = query.trim();

    if (!cleanedQuery) {
      alert("Enter email or phone number");
      return;
    }

    try {
      setLoadingUser(true);
      setUser(null);

      const res = await fetch(
        `/api/users/search?query=${encodeURIComponent(cleanedQuery)}`,
      );

      const data = await res.json();

      if (!res.ok || !data?.user) {
        alert(data.message || "User not found");
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error(error);
      alert("Failed to search user");
    } finally {
      setLoadingUser(false);
    }
  };

  // ================= BOOK HANDLERS =================
  const handleBookChange = (
    index: number,
    field: keyof Book,
    value: string,
  ) => {
    const updated = [...books];
    updated[index][field] = value;
    setBooks(updated);
  };

  const addMoreBook = () => {
    setBooks([...books, { title: "", author: "", isbn: "" }]);
  };

  // ================= BORROW =================
  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?._id) {
      alert("Search a user first");
      return;
    }

    const invalid = books.some((b) => !b.title || !b.author || !b.isbn);

    if (invalid) {
      alert("Fill all book details");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/borrow-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          books, // ✅ multiple books
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Borrow failed");
      }

      alert("Borrow record created successfully");

      setBooks([{ title: "", author: "", isbn: "" }]);
      setQuery("");
      setUser(null);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen  p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Borrow Book</h1>
          <p className="mt-2 text-slate-500">
            Search user by email or phone number and create borrow record.
          </p>
        </div>

        {/* SEARCH CARD */}
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <h2 className="mb-5 flex items-center gap-2 text-blue-600 text-xl font-semibold">
            <Search size={20} />
            Search User
          </h2>

          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              placeholder="Enter email or phone number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              onClick={searchUser}
              disabled={loadingUser}
              className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loadingUser ? "Searching..." : "Search User"}
            </button>
          </div>
        </div>

        {/* USER INFO */}
        {user && (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="mb-5 flex items-center gap-2 text-blue-600 text-xl font-semibold">
              <User size={20} />
              User Information
            </h2>

            <div className="flex flex-col items-center gap-5 md:flex-row">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200">
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.fullName}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <User />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold">{user.fullName}</h3>
                <p className="text-gray-500">{user.email}</p>

                {user.phoneNo && (
                  <p className="text-gray-500">{user.phoneNo}</p>
                )}

                <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* BORROW FORM */}
        {user && (
          <form
            onSubmit={handleBorrow}
            className="mt-8 rounded-3xl bg-white p-6 shadow-lg"
          >
            <h2 className="mb-6 flex items-center text-blue-600 gap-2 text-xl font-semibold">
              <BookOpen size={20} />
              Book Details
            </h2>

            {/* BOOK INPUTS */}
            {books.map((book, index) => (
              <div
                key={index}
                className="mb-6 rounded-2xl border border-gray-200 p-4"
              >
                {/* NUMBER LABEL */}
                <h3 className="mb-4 text-lg font-semibold text-slate-700">
                  {index + 1}. Book Details
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Book Title"
                    value={book.title}
                    onChange={(e) =>
                      handleBookChange(index, "title", e.target.value)
                    }
                    className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <input
                    type="text"
                    placeholder="Author"
                    value={book.author}
                    onChange={(e) =>
                      handleBookChange(index, "author", e.target.value)
                    }
                    className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <input
                    type="text"
                    placeholder="ISBN"
                    value={book.isbn}
                    onChange={(e) =>
                      handleBookChange(index, "isbn", e.target.value)
                    }
                    className="rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ))}

            {/* ADD MORE BUTTON */}
            <button
              type="button"
              onClick={addMoreBook}
              className="mb-4 rounded-2xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              + Add More Book
            </button>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-2xl bg-green-600 py-4 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              {submitting
                ? "Creating Borrow Record..."
                : "Create Borrow Record"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
