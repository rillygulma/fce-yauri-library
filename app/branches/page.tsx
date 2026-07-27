"use client";

import Image from "next/image";
import Link from "next/link";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

// ShadCN UI
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

type Branch = {
  id: string;
  title: string;
  image: string;
  description: string;
};

type Librarian = {
  name: string;
  rank: string;
  phone: string;
  image: string;
};

const branches: Branch[] = [
  {
    id: "main-library",
    title: "MAIN LIBRARY",
    image: "/images/University-Library.JPG",
    description:
      "The Main Library is located at the Main Campus and serves as the central academic resource hub of the University.",
  },
  {
    id: "education-library",
    title: "FACULTY OF EDUCATION LIBRARY",
    image: "/images/University-Library.JPG",
    description:
      "This Library is situated within the Faculty of Education and provides learning and research resources for education students and staff.",
  },
  {
    id: "medical-sciences-library",
    title: "BASIC MEDICAL SCIENCES LIBRARY",
    image: "/images/College-Library.JPG",
    description:
      "This Library is located within the Faculty of Basic Medical Sciences and supports medical education and research.",
  },
  {
    id: "law-library",
    title: "LAW LIBRARY",
    image: "/images/Take-Off-Library.JPG",
    description:
      "This ultra-modern Library is situated within the Faculty of Law and provides legal resources for students and researchers.",
  },
  {
    id: "annex-library",
    title: "ANNEX LIBRARY (TAKE-OFF SITE LIBRARY)",
    image: "/images/Take-Off-Library.JPG",
    description:
      "The Annex Library is located at the Take-Off Site Campus and supports academic activities across departments.",
  },
  {
    id: "nursing-library",
    title: "PRE-CLINICAL & NURSING LIBRARY (AMANAWA CAMPUS)",
    image: "/images/College-Library.JPG",
    description:
      "This special Library is located at the Amanawa Campus and serves Nursing and Pre-Clinical students.",
  },
  {
    id: "clinical-library",
    title: "CLINICAL LIBRARY (FEDERAL UNIVERSITY TEACHING HOSPITAL)",
    image: "/images/College-Library.JPG",
    description:
      "The Clinical Library is located at the Federal University Teaching Hospital and supports clinical learning and healthcare research.",
  },
];

const branchLibrarians: Record<string, Librarian> = {
  "main-library": {
    name: "Prof. Ahmad Abdu Balarabe CLN, FNLA",
    rank: "University Librarian",
    phone: "+2348012345678",
    image: "/images/UL.jpg",
  },

  "education-library": {
    name: "Dr. Salisu Adamu Aliero",
    rank: "Faculty Education Librarian",
    phone: "+2348023456789",
    image: "/images/Take-Off-Library.JPG",
  },

  "medical-sciences-library": {
    name: "Umar Zabairu Zauro",
    rank: "Medical Sciences Librarian",
    phone: "+2348034567890",
    image: "/images/College-Library.JPG",
  },

  "law-library": {
    name: "Hajiya Hadiza Bande",
    rank: "Law Librarian",
    phone: "+2348045678901",
    image: "/images/Take-Off-Library.JPG",
  },

  "annex-library": {
    name: "Abdullahi A",
    rank: "Branch Librarian",
    phone: "+2348056789012",
    image: "/images/University-Library.JPG",
  },

  "nursing-library": {
    name: "Mrs. Grace Okon",
    rank: "Nursing Librarian",
    phone: "+2348067890123",
    image: "/images/Take-Off-Library.JPG",
  },

  "clinical-library": {
    name: "Malam Usman ",
    rank: "Clinical Librarian",
    phone: "+2348078901234",
    image: "/images/University-Library.JPG",
  },
};

const BranchesPage = () => {
  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-24">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold text-blue-800 sm:text-4xl md:text-5xl">
          THE MAIN LIBRARY AND ITS BRANCHES
        </h1>

        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
          Explore the University Main Library and its branches providing
          academic and research support services across faculties and campuses.
        </p>
      </div>

      {/* Swiper */}
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="mb-16"
      >
        {branches.map((branch) => (
          <SwiperSlide key={branch.id}>
            <div
              id={branch.id}
              className="rounded-3xl bg-white p-4 shadow-lg sm:p-6"
            >
              {/* Title */}
              <h2 className="mb-4 text-2xl font-bold text-blue-700 sm:text-3xl">
                {branch.title}
              </h2>

              {/* Description */}
              <p className="mb-6 text-sm leading-7 text-gray-700 sm:text-base">
                {branch.description}
              </p>

              {/* Image */}
              <div className="relative mb-8 h-[250px] w-full overflow-hidden rounded-2xl sm:h-[400px]">
                <Image
                  src={branch.image}
                  alt={branch.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Librarian Card */}
              <Card className="mx-auto w-full max-w-2xl border border-blue-200 shadow-md">
                <CardHeader className="flex flex-col items-center gap-4 sm:flex-row">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={branchLibrarians[branch.id]?.image}
                    />

                    <AvatarFallback>
                      {branchLibrarians[branch.id]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center sm:text-left">
                    <CardTitle className="text-lg font-bold text-blue-800">
                      {branchLibrarians[branch.id]?.name}
                    </CardTitle>

                    <p className="mt-1 text-sm text-gray-600">
                      {branchLibrarians[branch.id]?.rank}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {branchLibrarians[branch.id]?.phone}
                    </p>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm leading-6 text-gray-600">
                    Contact the librarian for guidance, research support,
                    library enquiries, and access to information resources.
                  </p>
                </CardContent>
              </Card>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Branch List */}
      <section className="grid gap-6 md:grid-cols-2">
        {branches.map((branch) => (
          <Link
            key={branch.id}
            href={`#${branch.id}`}
            className="rounded-2xl border-l-4 border-blue-600 bg-white p-5 shadow-md transition duration-300 hover:bg-blue-50 hover:shadow-xl"
          >
            <h2 className="mb-3 text-xl font-bold text-blue-700 underline">
              {branch.title}
            </h2>

            <p className="text-sm leading-7 text-gray-700">
              {branch.description}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default BranchesPage;