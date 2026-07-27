"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Carousel } from "flowbite-react";

type BlogPost = {
  _id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
  date?: string;
  createdAt?: string;
};

const BlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState("");

  // =========================
  // FETCH POSTS (SAFE)
  // =========================
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/blog");

        // ❌ handle backend failure safely
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || "Failed to fetch blog posts");
        }

        const data = await res.json().catch(() => []);

        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";

        setError(message);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTitle.toLowerCase()),
  );

  const togglePost = (id: string) => {
    setActivePostId((prev) => (prev === id ? null : id));
  };

  // =========================
  // LOADING UI
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading posts...
      </div>
    );
  }

  // =========================
  // ERROR UI
  // =========================
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      {/* SEARCH */}
      <div className="flex mb-6 justify-center">
        <input
          type="text"
          placeholder="Search by title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="bg-white px-4 py-2 border border-gray-300 rounded-md w-full sm:w-1/2 lg:w-1/3"
        />
      </div>

      <h2 className="text-3xl font-bold mb-8 text-blue-600 text-center">
        Event & Gallery Posts
      </h2>

      {/* POSTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post._id}
              className="rounded-md shadow-lg p-4 hover:shadow-xl transition"
            >
              {/* CAROUSEL */}
              {post.images?.length > 0 && (
                <div className="h-[300px] sm:h-[320px] md:h-[350px] lg:h-[380px] mb-4 rounded-xl overflow-hidden">
                  <Carousel className="h-full">
                    {post.images.map((img, index) => (
                      <div key={index} className="relative w-full h-full">
                        <Image
                          src={img}
                          alt={post.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
              )}

              {/* CONTENT */}
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>

              <p className="text-gray-700 mb-2">{post.description}</p>

              {/* DATE (matches your route field) */}
              <p className="text-gray-500 text-sm mb-3">
                {post.date
                  ? new Date(post.date).toLocaleDateString()
                  : post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString()
                    : ""}
              </p>

              <button
                onClick={() => togglePost(post._id)}
                className="text-blue-600 hover:underline"
              >
                {activePostId === post._id ? "Read Less" : "Read More"}
              </button>

              {activePostId === post._id && (
                <div className="mt-3 text-gray-800">{post.content}</div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">
            No posts found.
          </p>
        )}
      </div>
    </div>
  );
};

export default BlogPosts;
