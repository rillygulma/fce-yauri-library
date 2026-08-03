export default function NewArrivals() {
  return (
    <section>

      <h2 className="text-2xl font-bold mb-6">
        New Arrivals
      </h2>

      <div className="grid md:grid-cols-5 gap-5">

        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl bg-white border p-4 shadow-sm"
          >
            <div className="h-44 bg-slate-100 rounded-lg flex items-center justify-center">
              📗
            </div>

            <h4 className="font-medium mt-3">
              Artificial Intelligence
            </h4>

            <p className="text-sm text-gray-500">
              2026 Edition
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}