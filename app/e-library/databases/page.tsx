"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, ExternalLink, Database, GraduationCap } from "lucide-react";

interface DatabaseItem {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  link: string;
}

const databases: DatabaseItem[] = [
  // ================= RESEARCH =================

  // ================= TERAS =================
  {
    id: 1,
    name: "TERAS",
    description:
      "Tertiary Education, Research, Applications & Services - integrated academic digital platform supporting education, research, and institutional services.",
    category: "Education",
    image:
      "/images/e-library/teras.png",
    link: "https://teras.ng/",
  },
    // ================= LAW DATABASES =================
  {
    id: 2,
    name: "LexisNexis Gateway",
    description:
      "Global legal research platform providing case law, statutes, legal news, and analytics for legal professionals and students.",
    category: "Law",
    image:
      "/images/e-library/lexisnexis.png",
    link: "https://www.lexisnexis.com/en-us/gateway.page",
  },
  // ================= LAW DATABASES =================
  {
    id: 3,
    name: "LawPavilion",
    description:
      "Nigeria’s leading legal research platform offering case law, statutes, e-library, and AI-powered legal tools for practitioners and students.",
    category: "Law",
    image: "/images/e-library/lawpavilion.png",
    link: "https://lawpavilion.com/",
  },
  {
    id: 4,
    name: "JSTOR",
    description:
      "Academic journals, books, and primary sources across multiple disciplines.",
    category: "Research",
    image:
      "/images/e-library/jstor.png",
    link: "https://www.jstor.org/",
  },
  {
    id: 5,
    name: "ProQuest",
    description:
      "Dissertations, theses, newspapers, ebooks and scholarly content.",
    category: "Research",
    image:
      "/images/e-library/proQuest.png",
    link: "https://www.proquest.com/",
  },
  {
    id: 6,
    name: "EBSCOhost",
    description:
      "Research databases covering business, education, science, and humanities.",
    category: "Research",
    image:
      "/images/e-library/ebscohost.png",
    link: "https://www.ebsco.com/",
  },
  {
    id: 7,
    name: "Taylor & Francis",
    description:
      "Peer-reviewed journals across science, engineering, and social sciences.",
    category: "Research",
    image:
      "/images/e-library/taylor-francis.png",
    link: "https://www.tandfonline.com/",
  },
  {
    id: 8,
    name: "SpringerLink",
    description:
      "Books, journals, and academic publications for higher education.",
    category: "Research",
    image:
      "/images/e-library/springerlink.png",
    link: "https://link.springer.com/",
  },
  {
    id: 9,
    name: "Wiley Online Library",
    description:
      "Research articles and journals in science, technology, and medicine.",
    category: "Research",
    image:
      "/images/e-library/wiley.png",
    link: "https://onlinelibrary.wiley.com/",
  },

  // ================= SCIENCE & MEDICINE =================
  {
    id: 10,
    name: "ScienceDirect",
    description:
      "Scientific, technical and medical research articles from Elsevier.",
    category: "Science",
    image:
      "/images/e-library/science-direct.png",
    link: "https://www.sciencedirect.com/",
  },
  {
    id: 11,
    name: "PubMed",
    description: "Free biomedical and life sciences research database.",
    category: "Medicine",
    image:
      "/images/e-library/pubmed.png",
    link: "https://pubmed.ncbi.nlm.nih.gov/",
  },
  {
    id: 12,
    name: "MedlinePlus",
    description:
      "Health information from the U.S. National Library of Medicine.",
    category: "Medicine",
    image:
      "/images/e-library/medlinePlus.png",
    link: "https://medlineplus.gov/",
  },

  // ================= OPEN ACCESS =================
  {
    id: 13,
    name: "Google Scholar",
    description: "Search scholarly literature across disciplines worldwide.",
    category: "Open Access",
    image:
      "/images/e-library/google-scholar.png",   
    link: "https://scholar.google.com/",
  },
  {
    id: 14,
    name: "DOAJ",
    description: "Directory of Open Access Journals.",
    category: "Open Access",
    image:
      "/images/e-library/doaj.png",
    link: "https://doaj.org/",
  },

  // ================= BUSINESS =================
  {
    id: 15,
    name: "Emerald Insight",
    description: "Business, management, economics and social science journals.",
    category: "Business",
    image:
      "/images/e-library/emerald-insight.png",
    link: "https://www.emerald.com/insight/",
  },

  // ================= EXTRA ACADEMIC =================
  {
    id: 16,
    name: "Web of Science",
    description: "High-quality research citation indexing platform.",
    category: "Research",
    image:
      "/images/e-library/web-of-science.png",
    link: "https://www.webofscience.com/",
  },
];
const categories = [
  "All",
  "Research",
  "Law",
  "Science",
  "Medicine",
  "Education",
  "Open Access",
];

export default function DatabasesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredDatabases = useMemo(() => {
    return databases.filter((db) => {
      const matchesSearch = db.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || db.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <section className="relative overflow-hidden bg-blue-600 px-6 py-24 text-white">
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-sm">
              <GraduationCap size={18} />
              <span className="text-sm font-medium">
                E-Library Academic Databases
              </span>
            </div>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Access World-Class Research Databases
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-200 md:text-xl">
              Explore journals, scholarly articles, ebooks, dissertations,
              research papers, and digital academic resources from trusted
              international databases.
            </p>
          </div>

          <div className="mt-10 flex max-w-2xl flex-col gap-4 rounded-3xl bg-white p-4 shadow-2xl md:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
              <Search className="text-gray-500" size={20} />

              <input
                type="text"
                placeholder="Search databases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-black outline-none"
              />
            </div>

            <button className="rounded-2xl bg-[#003566] px-6 py-3 font-semibold text-white transition hover:bg-[#00264d]">
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 shadow-md hover:bg-[#003566] hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
          {filteredDatabases.map((database) => (
            <div
              key={database.id}
              className="group overflow-hidden rounded-[30px] bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-56 overflow-hidden">
                <div className="relative h-56 overflow-hidden bg-white">
                  <Image
                    src={database.image}
                    alt={database.name}
                    fill
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-[#003566] backdrop-blur-sm">
                    {database.category}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f1ff] text-[#003566]">
                    <Database size={24} />
                  </div>

                  <h2 className="text-xl font-bold text-gray-900">
                    {database.name}
                  </h2>
                </div>

                <p className="line-clamp-4 text-sm leading-7 text-gray-600">
                  {database.description}
                </p>

                <Link
                  href={database.link}
                  target="_blank"
                  className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#003566] px-5 py-3 font-semibold text-white transition hover:bg-[#00264d]"
                >
                  Visit Database
                  <ExternalLink size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredDatabases.length === 0 && (
          <div className="mt-20 rounded-3xl bg-white p-16 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800">
              No Database Found
            </h2>

            <p className="mt-4 text-gray-600">
              Try another search keyword or category.
            </p>
          </div>
        )}
      </section>

      <section className="bg-blue-600 px-6 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h3 className="text-4xl font-black">100+</h3>
            <p className="mt-3 text-gray-300">Academic Databases Available</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h3 className="text-4xl font-black">50K+</h3>
            <p className="mt-3 text-gray-300">Journals & Research Papers</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h3 className="text-4xl font-black">24/7</h3>
            <p className="mt-3 text-gray-300">Unlimited Online Access</p>
          </div>
        </div>
      </section>
    </main>
  );
}
