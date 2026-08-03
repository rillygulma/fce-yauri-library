export default function SearchFilters() {
  return (
    <div className="flex flex-wrap gap-3">

      <button className="rounded-full bg-green-700 px-5 py-2 text-white">
        All Resources
      </button>

      <button className="rounded-full border px-5 py-2">
        Books
      </button>

      <button className="rounded-full border px-5 py-2">
        Journals
      </button>

      <button className="rounded-full border px-5 py-2">
        Available Only
      </button>

    </div>
  );
}