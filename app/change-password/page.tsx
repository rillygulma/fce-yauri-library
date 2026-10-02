"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { toast } from "react-hot-toast";

type PasswordField = "current" | "new" | "confirm";

type PasswordVisibility = {
  current: boolean;
  new: boolean;
  confirm: boolean;
};

type PasswordInputProps = {
  name:
    | "currentPassword"
    | "newPassword"
    | "confirmPassword";
  value: string;
  placeholder: string;
  field: PasswordField;
  visible: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onToggle: (field: PasswordField) => void;
};

// =====================================================
// PASSWORD INPUT
// IMPORTANT: This component is outside ChangePasswordPage
// =====================================================

function PasswordInput({
  name,
  value,
  placeholder,
  field,
  visible,
  onChange,
  onToggle,
}: PasswordInputProps) {
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={
          name === "currentPassword"
            ? "current-password"
            : "new-password"
        }
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-12 text-gray-800 outline-none transition focus:border-[#003566] focus:ring-4 focus:ring-[#003566]/10"
      />

      <button
        type="button"
        onClick={() => onToggle(field)}
        aria-label={
          visible ? "Hide password" : "Show password"
        }
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#003566]"
      >
        {visible ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

// =====================================================
// CHANGE PASSWORD PAGE
// =====================================================

export default function ChangePasswordPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState<PasswordVisibility>({
      current: false,
      new: false,
      confirm: false,
    });

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // TOGGLE PASSWORD VISIBILITY
  // =====================================================

  const togglePassword = (field: PasswordField) => {
    setShowPassword((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.currentPassword) {
      toast.error("Enter your current password");
      return;
    }

    if (!form.newPassword) {
      toast.error("Enter your new password");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error(
        "New password must be at least 6 characters"
      );
      return;
    }

    if (!form.confirmPassword) {
      toast.error("Confirm your new password");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      toast.error(
        "New password must be different from your current password"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to change password"
        );
      }

      toast.success("Password changed successfully");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPassword({
        current: false,
        new: false,
        confirm: false,
      });

      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to change password";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-red-900 px-4 py-8">
      <div className="mx-auto w-full max-w-lg">

        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white transition hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
            <KeyRound className="h-7 w-7 text-[#003566]" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            Change Password
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-200">
            Update your password to keep your
            E-Library account secure.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white/95 p-7 shadow-2xl backdrop-blur-lg sm:p-8"
        >
          <div className="space-y-5">

            {/* CURRENT PASSWORD */}
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Current Password
              </label>

              <PasswordInput
                name="currentPassword"
                value={form.currentPassword}
                placeholder="Enter current password"
                field="current"
                visible={showPassword.current}
                onChange={handleChange}
                onToggle={togglePassword}
              />
            </div>

            {/* NEW PASSWORD */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                New Password
              </label>

              <PasswordInput
                name="newPassword"
                value={form.newPassword}
                placeholder="Enter new password"
                field="new"
                visible={showPassword.new}
                onChange={handleChange}
                onToggle={togglePassword}
              />

              <p className="mt-2 text-xs text-gray-500">
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Confirm New Password
              </label>

              <PasswordInput
                name="confirmPassword"
                value={form.confirmPassword}
                placeholder="Confirm new password"
                field="confirm"
                visible={showPassword.confirm}
                onChange={handleChange}
                onToggle={togglePassword}
              />
            </div>
          </div>

          {/* CHANGE PASSWORD BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-700 py-3.5 font-semibold text-white shadow-lg transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Changing Password...
              </>
            ) : (
              <>
                <LockKeyhole className="h-5 w-5" />
                Change Password
              </>
            )}
          </button>

          <p className="mt-5 text-center text-xs leading-5 text-gray-500">
            Your password is securely encrypted before
            it is stored.
          </p>
        </form>
      </div>
    </main>
  );
}
