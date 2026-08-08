export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="h-48 animate-pulse bg-red-900" />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 rounded-3xl bg-white p-8 lg:grid-cols-[280px_1fr]">
          <div className="mx-auto h-[380px] w-[270px] animate-pulse rounded-2xl bg-gray-200" />

          <div className="space-y-5">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-32 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    </main>
  );
}