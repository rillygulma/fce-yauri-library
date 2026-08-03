"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

type Role = "student" | "staff" | "admin";

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  gender: string;
  admissionNo: string;
  staffNo: string;
  department: string;
  college: string;
  phoneNo: string;
  profilePicture: string;
}

const initialForm: RegisterForm = {
  fullName: "",
  email: "",
  password: "",
  role: "student",
  gender: "",
  admissionNo: "",
  staffNo: "",
  department: "",
  college: "",
  phoneNo: "",
  profilePicture: "",
};

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<RegisterForm>(initialForm);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ================= HANDLE INPUT CHANGE =================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= HANDLE ROLE CHANGE =================
  const handleRoleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const role = e.target.value as Role;

    setForm((prev) => ({
      ...prev,
      role,
      admissionNo: role === "student" ? prev.admissionNo : "",
      staffNo:
        ["staff","admin"].includes(role)
          ? prev.staffNo
          : "",
    }));
  };

  // ================= HANDLE IMAGE =================
  const handleImage = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // ================= VALIDATE IMAGE TYPE =================
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    // ================= VALIDATE IMAGE SIZE =================
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      toast.error("Profile picture must be less than 5MB.");
      e.target.value = "";
      return;
    }

    // ================= CONVERT IMAGE TO BASE64 =================
    const reader = new FileReader();

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        profilePicture: reader.result as string,
      }));

      toast.success("Profile picture selected");
    };

    reader.onerror = () => {
      toast.error("Failed to read profile picture.");
    };

    reader.readAsDataURL(file);
  };

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    // ================= FRONTEND VALIDATION =================
    if (!form.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!form.password) {
      toast.error("Please enter your password.");
      return;
    }

    if (!form.gender) {
      toast.error("Please select your gender.");
      return;
    }

    if (
      form.role === "student" &&
      !form.admissionNo.trim()
    ) {
      toast.error("Please enter your admission number.");
      return;
    }

    if (
      ["staff", "admin"].includes(form.role) &&
      !form.staffNo.trim()
    ) {
      toast.error("Please enter your staff number.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    fullName: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
    role: form.role,
    gender: form.gender,
    admissionNo:
      form.role === "student"
        ? form.admissionNo.trim()
        : "",
    staffNo:
      ["staff", "admin"].includes(form.role)
        ? form.staffNo.trim()
        : "",
    department: form.department.trim(),
    college: form.college.trim(),
    phoneNo: form.phoneNo.trim(),
    profilePicture: form.profilePicture || "",
  }),
});
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to create account."
        );
      }

      toast.success(
        data.message || "Account created successfully!"
      );

      // ================= RESET FORM =================
      setForm(initialForm);

      // ================= CLEAR FILE INPUT =================
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("REGISTRATION ERROR:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your account.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-red-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            User Registration
          </h1>

          <p className="text-gray-200 mt-2 text-sm md:text-base">
            Create an account for the Library Management System
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl p-6 md:p-10"
        >
          {/* PROFILE PICTURE */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-[#003566] flex items-center justify-center">
              {form.profilePicture ? (
                <Image
                  src={form.profilePicture}
                  alt="Profile"
                  width={96}
                  height={96}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-500">
                  Upload
                </span>
              )}
            </div>

            <label className="mt-4 block cursor-pointer text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImage}
                className="hidden"
              />

              <div className="px-4 py-3 border-2 border-dashed rounded-xl hover:border-[#003566] transition">
                Choose Profile Picture
              </div>
            </label>

            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG, or WebP. Maximum 5MB.
            </p>
          </div>

          {/* FORM GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* FULL NAME */}
            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              className="input"
              required
            />

            {/* EMAIL */}
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="input"
              required
            />

            {/* PASSWORD */}
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="input"
              minLength={6}
              required
            />

            {/* ROLE */}
            <select
              name="role"
              value={form.role}
              onChange={handleRoleChange}
              className="input"
              required
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>

            {/* ADMISSION NUMBER */}
            {form.role === "student" && (
              <input
                name="admissionNo"
                placeholder="Admission Number"
                value={form.admissionNo}
                onChange={handleChange}
                className="input"
                required
              />
            )}

            {/* STAFF NUMBER */}
            {["staff", "admin"].includes(
              form.role
            ) && (
              <input
                name="staffNo"
                placeholder="Staff Number"
                value={form.staffNo}
                onChange={handleChange}
                className="input"
                required
              />
            )}

            {/* GENDER */}
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            {/* DEPARTMENT */}
            <input
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
              className="input"
            />

            {/* COLLEGE */}
            <input
              name="college"
              placeholder="College"
              value={form.college}
              onChange={handleChange}
              className="input"
            />

            {/* PHONE NUMBER */}
            <input
              name="phoneNo"
              type="tel"
              placeholder="Phone Number"
              value={form.phoneNo}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full bg-red-700 hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-2xl transition"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>
      </div>

      {/* CUSTOM INPUT STYLES */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          outline: none;
          background-color: white;
          color: #111827;
        }

        .input:focus {
          border-color: #003566;
          box-shadow: 0 0 0 3px rgba(0, 53, 102, 0.15);
        }

        .input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </main>
  );
}