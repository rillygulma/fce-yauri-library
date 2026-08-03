"use client";

import Image from "next/image";
import Link from "next/link";

import {
  BookOpen,
  Calendar,
  FileText,
  MapPin,
  User,
  ArrowRight,
  BookMarked,
} from "lucide-react";

import type {
  Resource,
} from "@/types/resource";

interface ResourceCardProps {
  resource: Resource;
}

/*
|--------------------------------------------------------------------------
| RESOURCE DETAILS URL
|--------------------------------------------------------------------------
*/

function getResourceUrl(
  resource: Resource
) {
  return `/opac/${resource.resourceType}/${resource._id}`;
}

/*
|--------------------------------------------------------------------------
| RESOURCE LABEL
|--------------------------------------------------------------------------
*/

function getResourceLabel(
  type: Resource["resourceType"]
) {
  switch (type) {
    case "question-paper":
      return "Question Paper";

    case "ebook":
      return "eBook";

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

/*
|--------------------------------------------------------------------------
| RESOURCE CARD
|--------------------------------------------------------------------------
*/

export default function ResourceCard({
  resource,
}: ResourceCardProps) {

  /*
  |--------------------------------------------------------------------------
  | AVAILABILITY
  |--------------------------------------------------------------------------
  */

  const isAvailable =
    resource.availableCopies > 0;

  /*
  |--------------------------------------------------------------------------
  | RESOURCE TYPE
  |--------------------------------------------------------------------------
  */

  const resourceLabel =
    getResourceLabel(
      resource.resourceType
    );

  /*
  |--------------------------------------------------------------------------
  | RETURN UI
  |--------------------------------------------------------------------------
  */

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-3xl
        border
        border-gray-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-red-200
        hover:shadow-xl
      "
    >

      <div className="
        flex
        flex-col
        gap-6
        p-5
        sm:p-6
        lg:flex-row
      ">

        {/* ================================================================
            RESOURCE COVER
        ================================================================= */}

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
              src={
                resource.coverImage
              }
              alt={
                resource.title ||
                "Library resource"
              }
              fill
              sizes="
                (max-width: 640px) 100vw,
                160px
              "
              className="
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
            />

          ) : (

            <div className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-red-50
            ">

              <BookOpen
                size={60}
                strokeWidth={1.5}
                className="
                  text-red-900
                "
              />

            </div>

          )}

        </div>


        {/* ================================================================
            RESOURCE INFORMATION
        ================================================================= */}

        <div
          className="
            min-w-0
            flex-1
          "
        >

          {/* ==============================================================
              RESOURCE TYPE + AVAILABILITY
          =============================================================== */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >

            {/* RESOURCE TYPE */}

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
              <BookMarked
                size={14}
              />

              {resourceLabel}
            </span>


            {/* AVAILABILITY */}

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

          </div>


          {/* ==============================================================
              TITLE
          =============================================================== */}

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
            {resource.title}
          </h2>


          {/* ==============================================================
              SUBTITLE
          =============================================================== */}

          {resource.subtitle && (

            <p
              className="
                mt-2
                line-clamp-2
                text-sm
                text-gray-500
              "
            >
              {resource.subtitle}
            </p>

          )}


          {/* ==============================================================
              RESOURCE DETAILS
          =============================================================== */}

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

            {/* AUTHOR */}

            {resource.authors?.length >
              0 && (

              <p
                className="
                  flex
                  items-start
                  gap-2
                "
              >
                <User
                  size={17}
                  className="
                    mt-0.5
                    shrink-0
                    text-red-900
                  "
                />

                <span>
                  {resource.authors.join(
                    ", "
                  )}
                </span>
              </p>

            )}


            {/* PUBLICATION YEAR */}

            {resource.publicationYear && (

              <p
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Calendar
                  size={17}
                  className="
                    shrink-0
                    text-red-900
                  "
                />

                {resource.publicationYear}
              </p>

            )}


            {/* SHELF LOCATION */}

            {resource.shelfLocation && (

              <p
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <MapPin
                  size={17}
                  className="
                    shrink-0
                    text-red-900
                  "
                />

                {resource.shelfLocation}
              </p>

            )}


            {/* ISBN */}

            {resource.isbn && (

              <p>
                <span className="font-semibold text-gray-700">
                  ISBN:
                </span>{" "}

                {resource.isbn}
              </p>

            )}


            {/* ISSN */}

            {resource.issn && (

              <p>
                <span className="font-semibold text-gray-700">
                  ISSN:
                </span>{" "}

                {resource.issn}
              </p>

            )}


            {/* COURSE CODE */}

            {resource.courseCode && (

              <p
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <FileText
                  size={17}
                  className="
                    shrink-0
                    text-red-900
                  "
                />

                {resource.courseCode}
              </p>

            )}


            {/* CLASSIFICATION */}

            {resource.classificationNumber && (

              <p>
                <span className="font-semibold text-gray-700">
                  Class:
                </span>{" "}

                {
                  resource.classificationNumber
                }
              </p>

            )}

          </div>


          {/* ==============================================================
              AVAILABILITY INFORMATION
          =============================================================== */}

          {resource.resourceType ===
            "book" && (

            <div
              className="
                mt-5
                flex
                flex-wrap
                items-center
                gap-3
              "
            >

              <span
                className="
                  text-sm
                  text-gray-500
                "
              >
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
                {
                  resource.availableCopies
                }
              </span>

            </div>

          )}


          {/* ==============================================================
              ACTION BUTTONS
          =============================================================== */}

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
              href={
                getResourceUrl(
                  resource
                )
              }
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

              <ArrowRight
                size={17}
              />
            </Link>


            {/* BORROW BUTTON */}

            {isAvailable &&
              resource.resourceType ===
                "book" && (

              <button
                type="button"
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
                "
              >
                Borrow Me
              </button>

            )}

          </div>

        </div>

      </div>

    </article>
  );
}