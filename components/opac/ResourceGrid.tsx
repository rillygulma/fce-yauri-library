import ResourceCard from "./ResourceCard";
import { Resource } from "@/types/resource";

async function getResources(): Promise<Resource[]> {
  const res = await fetch("http://localhost:3000/api/opac", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch resources");
  }

  return res.json();
}

export default async function ResourceGrid() {
  const resources = await getResources();

  if (resources.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-12 text-center">
        <h2 className="text-2xl font-semibold">No resources found</h2>
        <p className="mt-2 text-gray-500">
          There are no books or journals in the catalogue.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource._id}
          resource={resource}
        />
      ))}
    </section>
  );
}