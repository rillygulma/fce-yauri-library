"use client";

interface ResourceFiltersProps {
  type: string;
  subject: string;
  available: boolean;

  onTypeChange: (
    value: string
  ) => void;

  onSubjectChange: (
    value: string
  ) => void;

  onAvailableChange: (
    value: boolean
  ) => void;
}

export default function ResourceFilters({
  type,
  subject,
  available,
  onTypeChange,
  onSubjectChange,
  onAvailableChange,
}: ResourceFiltersProps) {
  return (
    <div className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-3">
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Resource Type
        </label>

        <select
          value={type}
          onChange={(e) =>
            onTypeChange(e.target.value)
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
        >
          <option value="all">
            All Resources
          </option>

          <option value="book">
            Books
          </option>

          <option value="journal">
            Journals
          </option>

          <option value="question-paper">
            Question Papers
          </option>

          <option value="project">
            Projects
          </option>

          <option value="ebook">
            eBooks
          </option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Subject
        </label>

        <input
          type="text"
          value={subject}
          onChange={(e) =>
            onSubjectChange(
              e.target.value
            )
          }
          placeholder="Filter by subject"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-gray-200 px-4 py-3">
        <input
          type="checkbox"
          checked={available}
          onChange={(e) =>
            onAvailableChange(
              e.target.checked
            )
          }
          className="h-5 w-5"
        />

        <span className="font-medium text-gray-700">
          Available resources only
        </span>
      </label>
    </div>
  );
}