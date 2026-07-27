"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  BookOpen,
  User,
  CreditCard,
} from "lucide-react";

interface OverdueBook {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  dueDate: string;
  daysLate: number;
  finePerDay: number;
  estimatedFine: number;

  user: {
    fullName: string;
    email: string;
    role: string;
    admissionNo?: string;
    staffNo?: string;
    phoneNo?: string;
  };
}

export default function OverdueBooksPage() {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<OverdueBook[]>([]);

  useEffect(() => {
    const fetchOverdueBooks = async () => {
      try {
        const res = await fetch("/api/borrow-request/overdue");

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Failed to fetch overdue books"
          );
        }

        setBooks(data.overdueBooks || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverdueBooks();
  }, []);

  const totalFine = books.reduce(
    (sum, item) => sum + item.estimatedFine,
    0
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg font-semibold">
        Loading overdue books...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-blue-600">
            <AlertTriangle className="text-red-600" />
            Overdue Books
          </h1>

          <p className="mt-2 text-slate-500">
            Books that have exceeded their borrowing period.
          </p>
        </div>

        {/* STATS */}
        <div className="mb-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow">
            <h3 className="text-sm text-gray-500">
              Total Overdue Books
            </h3>

            <p className="mt-2 text-4xl font-bold text-red-600">
              {books.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <h3 className="text-sm text-gray-500">
              Total Outstanding Fine
            </h3>

            <p className="mt-2 text-4xl font-bold text-green-600">
              ₦{totalFine.toLocaleString()}
            </p>
          </div>
        </div>

        {/* EMPTY STATE */}
        {books.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center shadow">
            <AlertTriangle
              size={60}
              className="mx-auto text-green-500"
            />

            <h2 className="mt-4 text-2xl  font-bold">
              No Overdue Books
            </h2>

            <p className="mt-2 text-gray-500">
              All borrowed books are within their due dates.
            </p>
          </div>
        )}

        {/* LIST */}
        <div className="grid gap-6">
          {books.map((book, index) => (
            <div
              key={book._id}
              className="rounded-3xl bg-white p-6 shadow-lg"
            >
              {/* NUMBER */}
              <div className="mb-4 text-sm font-semibold text-red-600">
                #{index + 1} Overdue Record
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* BOOK */}
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
                    <BookOpen size={22} />
                    {book.title}
                  </h2>

                  <p className="mt-2 text-gray-600">
                    Author: {book.author}
                  </p>

                  <p className="text-gray-600">
                    ISBN: {book.isbn}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-red-600">
                    <Calendar size={18} />

                    <span>
                      Due Date:{" "}
                      {new Date(
                        book.dueDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* USER */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg text-blue-600 font-semibold">
                    <User size={20} />
                    Borrower Information
                  </h3>

                  <p>
                    <strong>Name:</strong>{" "}
                    {book.user.fullName}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {book.user.email}
                  </p>

                  <p>
                    <strong>Role:</strong>{" "}
                    {book.user.role}
                  </p>

                  {book.user.admissionNo && (
                    <p>
                      <strong>Admission No:</strong>{" "}
                      {book.user.admissionNo}
                    </p>
                  )}

                  {book.user.staffNo && (
                    <p>
                      <strong>Staff No:</strong>{" "}
                      {book.user.staffNo}
                    </p>
                  )}

                  {book.user.phoneNo && (
                    <p>
                      <strong>Phone:</strong>{" "}
                      {book.user.phoneNo}
                    </p>
                  )}
                </div>
              </div>

              {/* FINE */}
              <div className="mt-6 rounded-2xl bg-red-50 p-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Days Late
                    </p>

                    <p className="text-2xl font-bold text-red-600">
                      {book.daysLate}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Fine Per Day
                    </p>

                    <p className="text-2xl font-bold text-orange-600">
                      ₦{book.finePerDay}
                    </p>
                  </div>

                  <div>
                    <p className="flex items-center gap-2 text-sm text-gray-500">
                      <CreditCard size={16} />
                      Total Fine
                    </p>

                    <p className="text-3xl font-bold text-green-700">
                      ₦
                      {book.estimatedFine.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}