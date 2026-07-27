"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  User,
  MessageSquare,
  RefreshCw,
  Trash2,
} from "lucide-react";

type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

const ViewContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);

  // ================= FETCH MESSAGES =================
const fetchMessages = async (): Promise<void> => {
  try {
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch messages");
    }

    const result = await res.json();

    // ✅ safe extraction (matches your backend)
    const data = result?.data;

    if (Array.isArray(data)) {
      setMessages(data);
    } else {
      setMessages([]);
    }
  } catch (error) {
    console.error("fetchMessages error:", error);
    setMessages([]);
  } finally {
    setLoading(false);
  }
};

  // ================= DELETE MESSAGE =================
  const deleteMessage = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this message?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/contact?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      // update UI instantly
      setMessages((prev) => prev.filter((msg) => msg._id !== id));

      // clear selected if deleted
      if (selectedMessage?._id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete message");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 lg:p-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 lg:text-4xl">
            Contact Messages
          </h1>
          <p className="mt-2 text-gray-500">
            View and manage all contact enquiries.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex h-[400px] items-center justify-center rounded-2xl bg-white">
          Loading messages...
        </div>
      ) : messages.length === 0 ? (
        /* EMPTY STATE */
        <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl bg-white">
          <Mail size={60} className="text-gray-300" />
          <h2 className="text-xl font-bold text-gray-600">
            No Messages Found
          </h2>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LIST */}
          <div className="space-y-4 lg:col-span-1">
            {messages.map((msg) => (
              <div
                key={msg._id}
                onClick={() => setSelectedMessage(msg)}
                className={`cursor-pointer rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md ${
                  selectedMessage?._id === msg._id
                    ? "border border-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="text-blue-600" />
                    <div>
                      <p className="font-bold">{msg.name}</p>
                      <p className="text-sm text-gray-500">
                        {msg.email}
                      </p>
                    </div>
                  </div>

                  {/* DELETE */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(msg._id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {msg.message}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* DETAILS */}
          <div className="rounded-2xl bg-white p-6 lg:col-span-2">
            {selectedMessage ? (
              <>
                <div className="mb-6 flex items-start justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <User size={32} className="text-blue-600" />
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedMessage.name}
                      </h2>
                      <p className="text-gray-500">
                        {selectedMessage.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(
                          selectedMessage.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() =>
                      deleteMessage(selectedMessage._id)
                    }
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2 font-semibold">
                    <MessageSquare size={18} />
                    Message
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4 leading-7 text-gray-700">
                    {selectedMessage.message}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Select a message to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewContactMessages;