import { Star } from "lucide-react";

export default function FeaturedResources() {
  return (
    <section>

      <div className="flex items-center gap-2 mb-6">

        <Star className="text-yellow-500" />

        <h2 className="text-2xl font-bold">
          Featured Resources
        </h2>

      </div>

      <div className="grid md:grid-cols-4 gap-6">

        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border shadow-sm p-5"
          >
            <div className="h-52 rounded-xl bg-green-100 flex items-center justify-center">
              📘
            </div>

            <h3 className="mt-4 font-semibold">
              Introduction to Computer Science
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              John Smith
            </p>
          </div>
        ))}

      </div>

    </section>
  );
}