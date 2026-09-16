"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Calendar,
  CheckCircle,
  FileText,
  User,
} from "lucide-react";

import type { Resource } from "@/types/resource";

interface ResourceCardProps {
  resource: Resource;
}

/* ================================================================
   RESOURCE DETAILS URL
================================================================ */

function getResourceUrl(resource: Resource) {
  return `/opac/${resource.resourceType}/${resource._id}`;
}

/* ================================================================
   RESOURCE LABEL
================================================================ */

function getResourceLabel(type: Resource["resourceType"]) {
  switch (type) {
    case "question-paper":
      return "Question Paper";

    case "journal":
      return "Journal";

    case "project":
      return "Project";

    case "book":
      return "Book";

    default:
      return (
        String(type).charAt(0).toUpperCase() +
        String(type).slice(1)
      );
  }
}

/* ================================================================
   RESOURCE CARD
================================================================ */

export default function ResourceCard({
  resource,
}: ResourceCardProps) {
  const router = useRouter();

  const [borrowing, setBorrowing] = useState(false);
  const [borrowMessage, setBorrowMessage] = useState("");
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [showLoginButton, setShowLoginButton] =
    useState(false);

  const isAvailable =
    resource.resourceType === "book" &&
    (resource.availableCopies ?? 0) > 0;

  const resourceLabel = getResourceLabel(
    resource.resourceType
  );

  /* ================================================================
     BORROW BOOK
  ================================================================= */

  const handleBorrow = async () => {
    if (borrowing) return;

    /*
     * Only books can be borrowed
     */
    if (resource.resourceType !== "book") {
      setBorrowSuccess(false);
      setBorrowMessage(
        "Only books can be borrowed."
      );
      setShowLoginButton(false);
      return;
    }

    /*
     * Check availability
     */
    if (!isAvailable) {
      setBorrowSuccess(false);
      setBorrowMessage(
        "This book is currently unavailable."
      );
      setShowLoginButton(false);
      return;
    }

    /*
     * Reset previous message
     */
    setBorrowMessage("");
    setBorrowSuccess(false);
    setShowLoginButton(false);

    /*
     * ================================================================
     * CHECK LOGIN
     * ================================================================
     */

    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      setBorrowSuccess(false);
      setBorrowMessage(
        "Please login to your account before requesting a book."
      );
      setShowLoginButton(true);
      return;
    }

    /*
     * ================================================================
     * PARSE USER
     * ================================================================
     */

    let parsedUser: {
      _id?: string;
    };

    try {
      parsedUser = JSON.parse(storedUser) as {
        _id?: string;
      };
    } catch {
      localStorage.removeItem("user");

      setBorrowSuccess(false);
      setBorrowMessage(
        "Your login session is invalid. Please login again."
      );
      setShowLoginButton(true);
      return;
    }

    /*
     * ================================================================
     * CHECK USER ID
     * ================================================================
     */

    const userId =
      typeof parsedUser._id === "string"
        ? parsedUser._id.trim()
        : "";

    if (!userId) {
      localStorage.removeItem("user");

      setBorrowSuccess(false);
      setBorrowMessage(
        "Your login session has expired. Please login again."
      );
      setShowLoginButton(true);
      return;
    }

    /*
     * ================================================================
     * SUBMIT BORROW REQUEST
     * ================================================================
     */

    try {
      setBorrowing(true);

      const response = await fetch(
        "/api/borrow-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            resourceId: resource._id,
          }),
        }
      );

      const data: {
        success?: boolean;
        message?: string;
      } = await response.json();

      if (!response.ok) {
        setBorrowSuccess(false);
        setBorrowMessage(
          data.message ||
            "Failed to submit borrow request."
        );
        return;
      }

      setBorrowSuccess(true);
      setBorrowMessage(
        data.message ||
          "Borrow request submitted successfully. Please wait for librarian approval."
      );
    } catch (error) {
      console.error(
        "BORROW REQUEST ERROR:",
        error
      );

      setBorrowSuccess(false);
      setBorrowMessage(
        "Unable to submit your borrow request. Please try again."
      );
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <article className="group flex flex-col gap-6 overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row">
      {/* ============================================================
          RESOURCE COVER
      ============================================================= */}

      <div
        className="
          relative
          h-64
          w-full
          shrink-0
          overflow-hidden
          rounded-2xl
          bg-red-50
          sm:h-56
          sm:w-40
        "
      >
        {resource.coverImage ? (
          <Image
            src={resource.coverImage}
            alt={
              resource.title ||
              "Library resource"
            }
            fill
            sizes="(max-width: 640px) 100vw, 160px"
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-red-50
            "
          >
            <BookOpen
              size={60}
              strokeWidth={1.5}
              className="text-red-900"
            />
          </div>
        )}
      </div>

      {/* ============================================================
          RESOURCE INFORMATION
      ============================================================= */}

      <div className="min-w-0 flex-1">
        {/* TYPE + AVAILABILITY */}

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-red-50
              px-3
              py-1.5
              text-xs
              font-bold
              text-red-900
            "
          >
            <BookMarked size={14} />
            {resourceLabel}
          </span>

          {resource.resourceType === "book" && (
            <span
              className={`
                rounded-full
                px-3
                py-1.5
                text-xs
                font-bold
                ${
                  isAvailable
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }
              `}
            >
              {isAvailable
                ? "Available"
                : "Unavailable"}
            </span>
          )}
        </div>

        {/* TITLE */}

        <h2
          className="
            mt-4
            line-clamp-2
            text-xl
            font-bold
            leading-tight
            text-gray-900
            transition
            group-hover:text-red-900
            sm:text-2xl
          "
        >
          {resource.title ||
            resource.courseTitle ||
            "Untitled Resource"}
        </h2>

        {/* RESOURCE DETAILS */}

        <div
          className="
            mt-5
            grid
            gap-x-8
            gap-y-3
            text-sm
            text-gray-600
            sm:grid-cols-2
          "
        >
          {resource.authors &&
            resource.authors.length > 0 && (
              <p className="flex items-start gap-2">
                <User
                  size={17}
                  className="mt-0.5 shrink-0 text-red-900"
                />

                <span>
                  {resource.authors.join(", ")}
                </span>
              </p>
            )}

          {resource.publicationYear && (
            <p className="flex items-center gap-2">
              <Calendar
                size={17}
                className="shrink-0 text-red-900"
              />

              {resource.publicationYear}
            </p>
          )}

          {resource.isbn && (
            <p>
              <span className="font-semibold text-gray-700">
                ISBN:
              </span>{" "}
              {resource.isbn}
            </p>
          )}

          {resource.issn && (
            <p>
              <span className="font-semibold text-gray-700">
                ISSN:
              </span>{" "}
              {resource.issn}
            </p>
          )}

          {resource.courseCode && (
            <p className="flex items-center gap-2">
              <FileText
                size={17}
                className="shrink-0 text-red-900"
              />

              {resource.courseCode}
            </p>
          )}

          {resource.courseTitle && (
            <p>
              <span className="font-semibold text-gray-700">
                Course:
              </span>{" "}
              {resource.courseTitle}
            </p>
          )}

          {resource.volumeNumber && (
            <p>
              <span className="font-semibold text-gray-700">
                Volume:
              </span>{" "}
              {resource.volumeNumber}
            </p>
          )}

          {resource.semester && (
            <p>
              <span className="font-semibold text-gray-700">
                Semester:
              </span>{" "}
              {resource.semester}
            </p>
          )}

          {resource.session && (
            <p>
              <span className="font-semibold text-gray-700">
                Session:
              </span>{" "}
              {resource.session}
            </p>
          )}

          {resource.college && (
            <p>
              <span className="font-semibold text-gray-700">
                College:
              </span>{" "}
              {resource.college}
            </p>
          )}

          {resource.department && (
            <p>
              <span className="font-semibold text-gray-700">
                Department:
              </span>{" "}
              {resource.department}
            </p>
          )}

          {resource.graduationYear && (
            <p>
              <span className="font-semibold text-gray-700">
                Graduation Year:
              </span>{" "}
              {resource.graduationYear}
            </p>
          )}
        </div>

        {/* BOOK AVAILABILITY */}

        {resource.resourceType === "book" && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500">
              Available copies:
            </span>

            <span
              className="
                rounded-lg
                bg-gray-100
                px-3
                py-1
                text-sm
                font-bold
                text-gray-700
              "
            >
              {resource.availableCopies ?? 0}
            </span>
          </div>
        )}

        {/* BORROW MESSAGE */}

        {borrowMessage && (
          <div
            className={`
              mt-5
              rounded-xl
              border
              p-4
              text-sm
              font-medium
              ${
                borrowSuccess
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }
            `}
          >
            <div className="flex items-start gap-3">
              {borrowSuccess ? (
                <CheckCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />
              ) : (
                <User
                  size={20}
                  className="mt-0.5 shrink-0"
                />
              )}

              <div className="flex-1">
                <p>{borrowMessage}</p>

                {showLoginButton && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/login")
                    }
                    className="
                      mt-3
                      inline-flex
                      items-center
                      justify-center
                      rounded-lg
                      bg-red-900
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-red-800
                    "
                  >
                    Login to Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}

        <div
          className="
            mt-6
            flex
            flex-wrap
            items-center
            gap-3
          "
        >
          {/* VIEW DETAILS */}

          <Link
            href={getResourceUrl(resource)}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-gray-200
              bg-white
              px-5
              py-3
              text-sm
              font-bold
              text-gray-700
              transition
              hover:border-red-900
              hover:bg-red-50
              hover:text-red-900
            "
          >
            View Details
            <ArrowRight size={17} />
          </Link>

          {/* BORROW BOOK */}

          {resource.resourceType === "book" && (
            <button
              type="button"
              onClick={handleBorrow}
              disabled={borrowing || !isAvailable}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-red-900
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-red-800
                hover:shadow-md
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <CheckCircle size={18} />

              {borrowing
                ? "Submitting..."
                : isAvailable
                ? "Borrow Me"
                : "Unavailable"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
