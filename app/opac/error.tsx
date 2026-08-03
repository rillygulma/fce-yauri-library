"use client";

interface ErrorPageProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <span className="text-xl font-bold text-red-700">
            !
          </span>
        </div>

        <h1 className="mt-5 text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>

        <p className="mt-3 text-gray-600">
          We could not load the library catalogue.
          Please try again.
        </p>

        {process.env.NODE_ENV === "development" && (
          <p className="mt-4 rounded-xl bg-gray-100 p-3 text-left text-xs text-gray-600">
            {error.message}
          </p>
        )}

        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-red-900 px-6 py-3 font-semibold text-white transition hover:bg-red-800"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}