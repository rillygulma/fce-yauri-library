"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Role = "student" | "staff" | "librarian" | "admin";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);

  // VALIDATION ERRORS
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // CLEAR ERROR WHILE TYPING
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    let valid = true;

    const newErrors = {
      email: "",
      password: "",
    };

    // EMAIL VALIDATION
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      newErrors.email = "Invalid email address";
      valid = false;
    }

    // PASSWORD VALIDATION
    if (!form.password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  // ================= LOGIN =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please use valid credentials");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      const user = data?.user;

      if (!user) {
        throw new Error("Invalid response from server");
      }

      // ✅ safe user normalization
      // ================= SAFE USER NORMALIZATION =================

      const safeUser = {
        _id: user._id?.toString?.() || user._id,
        fullName: user.fullName || "",
        role: user.role || "student",
        email: user.email || "",
        gender: user.gender || "",
        admissionNo: user.admissionNo || "",
        staffNo: user.staffNo || "",
        department: user.department || "",
        college: user.college || "",
        phoneNo: user.phoneNo || "",
        profilePicture: user.profilePicture || "",
      };

      if (!safeUser._id) {
        throw new Error("User ID missing from server response");
      }

      // Store complete user
      localStorage.setItem(
        "user",
        JSON.stringify(safeUser)
      );

      // Store user ID separately for borrowing
      localStorage.setItem(
        "userId",
        safeUser._id
      );

      toast.success("Login successful");

      // ================= ROLE ROUTING =================

      setTimeout(() => {
        switch (safeUser.role) {
          case "admin":
            router.push("/admin-dashboard");
            break;

          case "librarian":
            router.push("/librarian-dashboard");
            break;

          case "staff":
          case "student":
          default:
            router.push("/dashboard");
            break;
        }
      }, 800);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-red-900 flex items-center justify-center px-4 relative">
      {/* REGISTER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fadeIn">
            <h2 className="text-2xl font-bold text-[#003566]">
              Registration Notice
            </h2>

            <p className="mt-4 text-gray-700 leading-7">
              To register for the FCE Yauri E-Library system, kindly contact the
              ICT Department for account creation and registration assistance.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full rounded-2xl bg-[#003566] py-3 text-white font-semibold hover:bg-[#00264d] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>

          <p className="text-gray-200 text-sm mt-2">
            Login to access the E-Library system
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl p-8"
        >
          <div className="space-y-5">
            {/* EMAIL */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className={`input ${errors.email ? "border-red-500 focus:ring-red-200" : ""
                  }`}
              />

              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className={`input ${errors.password ? "border-red-500 focus:ring-red-200" : ""
                  }`}
              />

              {errors.password && (
                <p className="mt-2 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="mt-6 w-full bg-red-700 hover:bg-red-800 transition text-white font-semibold py-3 rounded-2xl shadow-lg disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* FOOTER */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-[#003566] font-semibold hover:underline"
            >
              Register
            </button>
          </p>
        </form>
      </div>

      {/* INPUT STYLE */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          outline: none;
          transition: 0.2s ease-in-out;
        }

        .input:focus {
          border-color: #003566;
          box-shadow: 0 0 0 3px rgba(0, 53, 102, 0.15);
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </main>
  );
}
