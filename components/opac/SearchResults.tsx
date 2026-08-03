import ResourceCard from "./ResourceCard";

import type {
  Resource,
} from "@/types/resource";

interface SearchResultsProps {
  resources: Resource[];
  loading: boolean;
}

export default function SearchResults({
  resources,
  loading,
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-3xl bg-gray-200"
            />
          )
        )}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="rounded-3xl border bg-white px-6 py-16 text-center">
        <h3 className="text-xl font-bold text-gray-900">
          No resources found
        </h3>

        <p className="mt-2 text-gray-600">
          Try changing your search or
          filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {resources.map(
        (resource) => (
          <ResourceCard
            key={resource._id}
            resource={resource}
          />
        )
      )}
    </div>
  );
}