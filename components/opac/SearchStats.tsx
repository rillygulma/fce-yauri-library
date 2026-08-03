export default function SearchStats() {
  return (
    <div className="flex justify-between items-center py-6">

      <h2 className="text-2xl font-bold">

        1,250 Resources Found

      </h2>

      <select className="border rounded-xl px-4 py-3">

        <option>Sort by Relevance</option>

        <option>Newest</option>

        <option>Oldest</option>

        <option>Title (A-Z)</option>

      </select>

    </div>
  );
}