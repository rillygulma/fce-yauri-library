"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

type BlogPost = {
  _id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
  date?: string;
  createdAt?: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<FileList | null>(null);

  const [editId, setEditId] = useState<string | null>(null);

  // ================= FETCH POSTS =================
  const fetchPosts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const res = await fetch("/api/blog");

      if (!res.ok) {
        throw new Error("Failed to load posts");
      }

      const data = await res.json().catch(() => []);

      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPosts(false);
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("content", content);

      if (images) {
        Array.from(images).forEach((img) => {
          formData.append("images", img);
        });
      }

      const url = editId
        ? `/api/blog?id=${editId}`
        : "/api/blog";

      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Upload failed");
      }

      // RESET FORM
      setTitle("");
      setDescription("");
      setContent("");
      setImages(null);
      setEditId(null);

      if (fileRef.current) fileRef.current.value = "";

      await fetchPosts(false);

      toast.success(
        editId ? "Post updated successfully" : "Post created successfully"
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed";

      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;

    try {
      const res = await fetch(`/api/blog?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setPosts((prev) => prev.filter((p) => p._id !== id));

      toast.success("Post deleted successfully");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  // ================= EDIT =================
  const handleEdit = (post: BlogPost) => {
    setEditId(post._id);
    setTitle(post.title);
    setDescription(post.description);
    setContent(post.content);

    toast("Editing mode enabled", {
      icon: "✏️",
    });
  };

  return (
    <div className="p-6 space-y-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700">
        📝 Blog Admin Panel
      </h1>

      {/* FORM */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <input
          className="w-full border p-3 rounded-lg"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded-lg"
          placeholder="Short Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <textarea
          className="w-full border p-3 rounded-lg min-h-[150px]"
          placeholder="Blog Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          className="w-full border p-3 rounded-lg"
          onChange={(e) => setImages(e.target.files)}
        />

        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-lg"
        >
          {uploading
            ? "Uploading..."
            : editId
            ? "Update Post"
            : "Create Post"}
        </button>
      </div>

      {/* POSTS */}
      {loading ? (
        <p className="text-center text-gray-500">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-400">
          No blog posts found
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {post.images?.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  {post.images.slice(0, 4).map((img, i) => (
                    <div key={i} className="relative h-32">
                      <Image
                        src={img}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 space-y-2">
                <h2 className="font-bold line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-sm text-gray-600 line-clamp-3">
                  {post.description}
                </p>

                <p className="text-xs text-gray-400">
                  {post.date
                    ? new Date(post.date).toLocaleString()
                    : "No date"}
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="bg-yellow-500 text-white px-3 py-2 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(post._id)}
                    className="bg-red-500 text-white px-3 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}