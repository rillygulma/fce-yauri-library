"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import SearchBar from "@/components/opac/SearchBar";
import ResourceFilters from "@/components/opac/ResourceFilters";
import SearchResults from "@/components/opac/SearchResults";
import Pagination from "@/components/opac/Pagination";

import type {
  OPACResponse,
  Resource,
} from "@/types/resource";

export default function OPACPage() {
  const [resources, setResources] =
    useState<Resource[]>([]);

  const [query, setQuery] =
    useState("");

  const [type, setType] =
    useState("all");

  const [subject, setSubject] =
    useState("");

  const [available, setAvailable] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [pages, setPages] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH OPAC RESOURCES
  |--------------------------------------------------------------------------
  */

  const fetchResources =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams();

        if (query) {
          params.set(
            "query",
            query
          );
        }

        if (
          type &&
          type !== "all"
        ) {
          params.set(
            "type",
            type
          );
        }

        if (subject) {
          params.set(
            "subject",
            subject
          );
        }

        if (available) {
          params.set(
            "available",
            "true"
          );
        }

        params.set(
          "page",
          String(page)
        );

        params.set(
          "limit",
          "10"
        );

        const response =
          await fetch(
            `/api/opac?${params.toString()}`,
            {
              cache: "no-store",
            }
          );

        const data: OPACResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            "Failed to fetch resources."
          );
        }

        setResources(
          data.resources || []
        );

        setTotal(
          data.total || 0
        );

        setPages(
          data.pages || 0
        );
      } catch (error) {
        console.error(
          "OPAC ERROR:",
          error
        );

        setError(
          "Failed to load library resources. Please try again."
        );

        setResources([]);
      } finally {
        setLoading(false);
      }
    }, [
      query,
      type,
      subject,
      available,
      page,
    ]);

  /*
  |--------------------------------------------------------------------------
  | LOAD RESOURCES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    Promise.resolve().then(
      fetchResources
    );
  }, [fetchResources]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  function handleSearch(
    value: string
  ) {
    setPage(1);
    setQuery(value);
  }

  /*
  |--------------------------------------------------------------------------
  | TYPE FILTER
  |--------------------------------------------------------------------------
  */

  function handleTypeChange(
    value: string
  ) {
    setPage(1);
    setType(value);
  }

  /*
  |--------------------------------------------------------------------------
  | SUBJECT FILTER
  |--------------------------------------------------------------------------
  */

  function handleSubjectChange(
    value: string
  ) {
    setPage(1);
    setSubject(value);
  }

  /*
  |--------------------------------------------------------------------------
  | AVAILABILITY FILTER
  |--------------------------------------------------------------------------
  */

  function handleAvailableChange(
    value: boolean
  ) {
    setPage(1);
    setAvailable(value);
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ================================================================
          OPAC HERO
      ================================================================= */}

      <section className="relative overflow-hidden bg-red-900 text-white">

        {/* Decorative Background */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />

        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="max-w-3xl">

            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              Online Public Access Catalogue
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Library OPAC
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-red-100 sm:text-lg">
              Search and discover books, journals,
              question papers, projects, and other
              digital library resources available
              in the library catalogue.
            </p>

          </div>

        </div>
      </section>


      {/* ================================================================
          MAIN OPAC CONTENT
      ================================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ==============================================================
            SEARCH CARD
        ============================================================== */}

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-gray-900">
              Search Library Catalogue
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Search by title, author, ISBN,
              subject, course code, or other
              catalogue information.
            </p>

          </div>

          <SearchBar
            onSearch={handleSearch}
            initialQuery={query}
          />

        </div>


        {/* ==============================================================
            FILTERS
        ============================================================== */}

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">

          <div className="mb-5">

            <h2 className="text-xl font-bold text-gray-900">
              Filter Resources
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Narrow your search by resource type,
              subject area, or availability.
            </p>

          </div>

          <ResourceFilters
            type={type}
            subject={subject}
            available={available}
            onTypeChange={
              handleTypeChange
            }
            onSubjectChange={
              handleSubjectChange
            }
            onAvailableChange={
              handleAvailableChange
            }
          />

        </div>


        {/* ==============================================================
            RESULTS HEADER
        ============================================================== */}

        <div className="mt-10 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">

          <div>

            <h2 className="text-2xl font-bold text-gray-900">
              Search Results
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Browse resources available in
              the library catalogue.
            </p>

          </div>

          <div className="inline-flex w-fit items-center rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-900">

            {total.toLocaleString()}{" "}
            {total === 1
              ? "Resource"
              : "Resources"}{" "}
            Found

          </div>

        </div>


        {/* ==============================================================
            RESULTS
        ============================================================== */}

        <div className="mt-6">

          {error ? (

            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">

                <span className="text-xl font-bold text-red-700">
                  !
                </span>

              </div>

              <h3 className="mt-4 text-lg font-bold text-red-900">
                Unable to Load Resources
              </h3>

              <p className="mt-2 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  fetchResources()
                }
                className="mt-5 rounded-xl bg-red-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                Try Again
              </button>

            </div>

          ) : (

            <div className="rounded-3xl">

              <SearchResults
                resources={
                  resources
                }
                loading={
                  loading
                }
              />

            </div>

          )}

        </div>


        {/* ==============================================================
            PAGINATION
        ============================================================== */}

        {!loading &&
          pages > 1 && (

            <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">

              <Pagination
                page={page}
                pages={pages}
                onPageChange={
                  setPage
                }
              />

            </div>

          )}

      </section>

    </main>
  );
}