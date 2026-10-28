"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import SearchBar from "@/components/opac/SearchBar";
import ResourceFilters from "@/components/opac/ResourceFilters";
import SearchResults from "@/components/opac/SearchResults";
import Pagination from "@/components/opac/Pagination";

import type {
  OPACResponse,
  Resource,
} from "@/types/resource";

export default function OPACPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resultsRef = useRef<HTMLDivElement>(null);
  const previousSearchRef = useRef<string | null>(null);
  const shouldScrollRef = useRef(false);
  const completedSearchRef = useRef<string | null>(null);

  /**
   * READ VALUES DIRECTLY FROM URL
   *
   * The URL remains the single source of truth.
   */

  const query = useMemo(
    () => searchParams.get("query")?.trim() ?? "",
    [searchParams]
  );

  const type = useMemo(
    () => searchParams.get("type")?.trim() || "all",
    [searchParams]
  );

  const subject = useMemo(
    () => searchParams.get("subject")?.trim() ?? "",
    [searchParams]
  );

  const available = searchParams.get("available") === "true";

  const page = useMemo(() => {
    const urlPage = Number(searchParams.get("page") ?? "1");

    if (!Number.isFinite(urlPage) || urlPage < 1) {
      return 1;
    }

    return Math.floor(urlPage);
  }, [searchParams]);

  /**
   * IDENTIFY THE CURRENT SEARCH AND FILTERS
   *
   * Pagination is excluded so changing pages does not
   * trigger automatic scrolling to the results heading.
   */

  const searchKey = JSON.stringify([
    query,
    type,
    subject,
    available,
  ]);

  /**
   * FETCH OPAC RESOURCES
   */

  const fetchResources = useCallback(
    async (signal?: AbortSignal) => {
      try {
        // Yield once before updating loading state.
        await Promise.resolve();

        if (signal?.aborted) {
          return;
        }

        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        // Search query
        if (query) {
          params.set("query", query);
        }

        // Resource type
        if (type && type !== "all") {
          params.set("type", type);
        }

        // Subject
        if (subject) {
          params.set("subject", subject);
        }

        // Availability
        if (available) {
          params.set("available", "true");
        }

        // Pagination
        params.set("page", String(page));
        params.set("limit", "10");

        const url = `/api/resources?${params.toString()}`;

        console.log("OPAC REQUEST:", url);

        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch resources. Status: ${response.status}`
          );
        }

        const data: OPACResponse = await response.json();

        if (!data.success) {
          throw new Error(
            "The resources API returned an unsuccessful response."
          );
        }

        if (signal?.aborted) {
          return;
        }

        setResources(
          Array.isArray(data.resources)
            ? data.resources
            : []
        );

        setTotal(
          typeof data.total === "number"
            ? data.total
            : 0
        );

        setPages(
          typeof data.pages === "number"
            ? data.pages
            : 0
        );

        // Record which search successfully completed.
        completedSearchRef.current = searchKey;
      } catch (error) {
        // Ignore intentional request cancellation.
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        if (signal?.aborted) {
          return;
        }

        console.error("OPAC ERROR:", error);

        setError(
          "Failed to load library resources. Please try again."
        );

        setResources([]);
        setTotal(0);
        setPages(0);

        // Allow the user to see the error after searching.
        completedSearchRef.current = searchKey;
      } finally {
        // Do not update loading state for cancelled requests.
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [
      query,
      type,
      subject,
      available,
      page,
      searchKey,
    ]
  );

  /**
   * LOAD RESOURCES
   *
   * Cancel previous requests when the URL changes.
   */

  useEffect(() => {
    const controller = new AbortController();

    void fetchResources(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchResources]);

  /**
   * DETECT SEARCH AND FILTER CHANGES
   *
   * The initial page load does not trigger scrolling.
   */

  useEffect(() => {
    if (previousSearchRef.current === null) {
      previousSearchRef.current = searchKey;
      return;
    }

    if (previousSearchRef.current !== searchKey) {
      previousSearchRef.current = searchKey;

      shouldScrollRef.current = Boolean(
        query ||
        type !== "all" ||
        subject ||
        available
      );
    }
  }, [
    searchKey,
    query,
    type,
    subject,
    available,
  ]);

  /**
   * AUTOMATICALLY SCROLL TO SEARCH RESULTS
   *
   * Wait until the request for the current search has
   * completed before scrolling.
   */

  useEffect(() => {
    if (loading || !shouldScrollRef.current) {
      return;
    }

    if (completedSearchRef.current !== searchKey) {
      return;
    }

    shouldScrollRef.current = false;

    const frameId = window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [
    loading,
    searchKey,
    resources,
    error,
  ]);

  /**
   * UPDATE URL
   */

  const updateURL = useCallback(
    ({
      newQuery = query,
      newType = type,
      newSubject = subject,
      newAvailable = available,
      newPage = page,
    }: {
      newQuery?: string;
      newType?: string;
      newSubject?: string;
      newAvailable?: boolean;
      newPage?: number;
    }) => {
      const params = new URLSearchParams();

      const cleanQuery = newQuery.trim();
      const cleanSubject = newSubject.trim();

      if (cleanQuery) {
        params.set("query", cleanQuery);
      }

      if (newType && newType !== "all") {
        params.set("type", newType);
      }

      if (cleanSubject) {
        params.set("subject", cleanSubject);
      }

      if (newAvailable) {
        params.set("available", "true");
      }

      // Only include page when greater than 1.
      if (newPage > 1) {
        params.set("page", String(newPage));
      }

      const queryString = params.toString();

      router.push(
        queryString
          ? `${pathname}?${queryString}`
          : pathname
      );
    },
    [
      query,
      type,
      subject,
      available,
      page,
      router,
      pathname,
    ]
  );

  /**
   * SEARCH HANDLER
   */

  function handleSearch(value: string) {
    const cleanValue = value.trim();

    if (cleanValue !== query) {
      shouldScrollRef.current = Boolean(
        cleanValue ||
        type !== "all" ||
        subject ||
        available
      );
    }

    updateURL({
      newQuery: cleanValue,
      newPage: 1,
    });
  }

  /**
   * RESOURCE TYPE FILTER
   */

  function handleTypeChange(value: string) {
    if (value !== type) {
      shouldScrollRef.current = Boolean(
        query ||
        value !== "all" ||
        subject ||
        available
      );
    }

    updateURL({
      newType: value,
      newPage: 1,
    });
  }

  /**
   * SUBJECT FILTER
   */

  function handleSubjectChange(value: string) {
    if (value !== subject) {
      shouldScrollRef.current = Boolean(
        query ||
        type !== "all" ||
        value ||
        available
      );
    }

    updateURL({
      newSubject: value,
      newPage: 1,
    });
  }

  /**
   * AVAILABILITY FILTER
   */

  function handleAvailableChange(value: boolean) {
    if (value !== available) {
      shouldScrollRef.current = Boolean(
        query ||
        type !== "all" ||
        subject ||
        value
      );
    }

    updateURL({
      newAvailable: value,
      newPage: 1,
    });
  }

  /**
   * PAGINATION
   */

  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > pages) {
      return;
    }

    // Pagination scrolls to the top, not the results heading.
    shouldScrollRef.current = false;

    updateURL({
      newPage,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* OPAC HERO */}

      <section className="relative overflow-hidden bg-red-900 text-white">
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

      {/* MAIN OPAC CONTENT */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* SEARCH */}

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Search Library Catalogue
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Search by title, author, ISBN, subject,
              course code, or other catalogue information.
            </p>
          </div>

          <SearchBar
            onSearch={handleSearch}
            initialQuery={query}
          />
        </div>

        {/* FILTERS */}

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
            onTypeChange={handleTypeChange}
            onSubjectChange={handleSubjectChange}
            onAvailableChange={handleAvailableChange}
          />
        </div>

        {/* RESULTS HEADER */}

        <div
          ref={resultsRef}
          className="mt-10 scroll-mt-6 flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Search Results
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {query
                ? `Showing results for "${query}"`
                : "Browse resources available in the library catalogue."}
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-900">
            {total.toLocaleString()}{" "}
            {total === 1 ? "Resource" : "Resources"} Found
          </div>
        </div>

        {/* RESULTS */}

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
                onClick={() => {
                  void fetchResources();
                }}
                className="mt-5 rounded-xl bg-red-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="rounded-3xl">
              <SearchResults
                resources={resources}
                loading={loading}
              />
            </div>
          )}
        </div>

        {/* PAGINATION */}

        {!loading && pages > 1 && (
          <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <Pagination
              page={page}
              pages={pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </main>
  );
}