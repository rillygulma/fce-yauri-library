"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Download,
  FileText,
  GraduationCap,
  User,
} from "lucide-react";

interface Project {
  _id: string;

  resourceType: "project";

  title?: string;

  authors?: string[];

  graduationYear?: number;

  college?: string;

  department?: string;

  digitalFile?: string;
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({
  params,
}: Props) {
  const [resource, setResource] =
    useState<Project | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadProject() {
      try {
        const { id } = await params;

        const response = await fetch(
          `/api/resources/${id}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load project."
          );
        }

        if (
          data.resource.resourceType !==
          "project"
        ) {
          throw new Error(
            "This resource is not a project."
          );
        }

        setResource(data.resource);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load project."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-96 rounded-3xl bg-gray-200" />
        </div>
      </main>
    );
  }

  if (!resource || error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Project Not Found
          </h1>

          <p className="mt-2 text-gray-600">
            {error}
          </p>

          <Link
            href="/opac"
            className="mt-5 inline-block rounded-xl bg-red-900 px-6 py-3 font-semibold text-white"
          >
            Back to OPAC
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-red-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/opac"
            className="inline-flex items-center gap-2 text-red-100 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to OPAC
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <GraduationCap size={28} />

            <span className="font-semibold">
              Library Projects
            </span>
          </div>

          <h1 className="mt-3 text-4xl font-bold">
            Project Details
          </h1>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <article className="rounded-3xl border bg-white shadow-sm">
          <div className="p-6 sm:p-10">
            <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-900">
              Project
            </span>

            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {resource.title}
            </h2>

            {resource.authors &&
              resource.authors.length >
                0 && (
                <div className="mt-4 flex items-center gap-2 text-gray-600">
                  <User size={18} />

                  {resource.authors.join(
                    ", "
                  )}
                </div>
              )}

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <Info
                label="Graduation Year"
                value={
                  resource.graduationYear?.toString()
                }
                icon={
                  <Calendar size={18} />
                }
              />

              <Info
                label="College"
                value={resource.college}
                icon={
                  <Building2 size={18} />
                }
              />

              <Info
                label="Department"
                value={
                  resource.department
                }
                icon={
                  <GraduationCap
                    size={18}
                  />
                }
              />
            </div>

            <div className="mt-10 rounded-2xl bg-gray-50 p-6">
              <div className="flex items-start gap-4">
                <FileText
                  size={28}
                  className="text-red-900"
                />

                <div>
                  <h3 className="font-bold text-gray-900">
                    Project File
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    Open the uploaded project
                    document.
                  </p>
                </div>
              </div>

              {resource.digitalFile && (
                <a
                  href={
                    resource.digitalFile
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-900 px-6 py-3 font-semibold text-white hover:bg-red-800"
                >
                  <Download size={18} />
                  View Project
                </a>
              )}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
}) {
  if (!value) return null;

  return (
    <div className="rounded-2xl border bg-gray-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 flex items-center gap-2 font-semibold text-gray-800">
        {icon}
        {value}
      </p>
    </div>
  );
}