export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-10 w-64 rounded-lg bg-gray-200" />

          <div className="mt-4 h-5 w-96 max-w-full rounded bg-gray-200" />

          <div className="mt-10 h-40 rounded-3xl bg-gray-200" />

          <div className="mt-6 h-32 rounded-3xl bg-gray-200" />

          <div className="mt-6 h-64 rounded-3xl bg-gray-200" />
        </div>
      </section>
    </main>
  );
}