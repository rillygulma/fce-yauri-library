"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

type Announcement = {
  _id: string;
  title: string;
  message: string;
  createdBy?: string;
  createdAt?: string;
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [createdBy, setCreatedBy] = useState("University Librarian");

  // FETCH ALL
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/announcements");
      setAnnouncements(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/announcements");
        setAnnouncements(res.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void loadAnnouncements();
  }, []);

  // CREATE
  const handleCreate = async () => {
    if (!title || !message) return toast.error("Fill all fields");

    try {
      await axios.post("/api/announcements", {
        title,
        message,
        createdBy,
      });

      setTitle("");
      setMessage("");
      fetchAnnouncements();
    } catch (error) {
      console.error(error);
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;

    try {
      await axios.delete(`/api/announcements?id=${id}`);
      fetchAnnouncements();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <h1 className="text-2xl font-bold text-blue-700">
        📢 Add Announcements
      </h1>

      {/* CREATE FORM */}
      <div className="bg-white shadow p-4 rounded-lg space-y-3">
        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Message"
          className="w-full border p-2 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <input
          type="text"
          placeholder="Created By"
          className="w-full border p-2 rounded"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
        />

        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          ➕ Create Announcement
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : announcements.length === 0 ? (
          <p>No announcements found</p>
        ) : (
          announcements.map((a) => (
            <div
              key={a._id}
              className="border p-4 rounded-lg bg-gray-50 flex justify-between items-start"
            >
              <div>
                <h2 className="font-bold text-lg text-blue-700">
                  {a.title}
                </h2>
                <p className="text-gray-700">{a.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  By: {a.createdBy || "Admin"}
                </p>
              </div>

              <button
                onClick={() => handleDelete(a._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}