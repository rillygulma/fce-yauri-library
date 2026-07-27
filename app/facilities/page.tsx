"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const FacilitiesPage = () => {
  const facilities = [
    {
      image: "/images/UL-Office.jpg",
      title: "University Librarian Office",
      description: "This is the University Librarian Office.",
    },
    {
      image: "/images/Reader-Services.jpg",
      title: "Reader Services",
      description: "This is the University Reader Services Section.",
    },
    {
      image: "/images/Processing-section.jpg",
      title: "Processing Section",
      description: "This is the University Library Processing Section.",
    },
    {
      image: "/images/Outside-Reading-Room-Psite.jpg",
      title: "Permanent Site Outside Reading Area",
      description: "First Reading Hall in the University Library.",
    },
    {
      image: "/images/Psite-Books.jpg",
      title: "Books Showcase",
      description: "This is the library book collection shelf.",
    },
    {
      image: "/images/Psite-Reading-Area.jpg",
      title: "Reading Area",
      description: "Main reading environment for students.",
    },
    {
      image: "/images/Psite-E-Library.jpg",
      title: "E-Library",
      description: "Digital access to academic resources.",
    },
    {
      image: "/images/TakeOff-Reading-Area.jpg",
      title: "Take-Off Reading Area",
      description: "Another comfortable reading space.",
    },
    {
      image: "/images/TakeOff-E-Library.jpg",
      title: "Take-Off E-Library",
      description: "Digital learning section at Take-Off site.",
    },
    {
      image: "/images/College-Reading-Area.jpg",
      title: "College Reading Area",
      description: "Reading area for College of Health Sciences.",
    },
  ];

  return (
    <div className="px-4 py-16 lg:px-24">
      <h2 className="mb-10 text-center text-3xl font-bold text-blue-600">
        OUR LIBRARY FACILITIES
      </h2>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop
        className="rounded-xl"
      >
        {facilities.map((facility, index) => (
          <SwiperSlide key={index}>
            <div className="flex flex-col items-center justify-center p-6">
              <div className="relative h-[350px] w-full max-w-4xl overflow-hidden rounded-xl shadow-lg">
                <Image
                  src={facility.image}
                  alt={facility.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="mt-6 max-w-xl rounded-lg bg-blue-500 p-5 text-center text-white shadow-md">
                <h3 className="text-xl font-semibold">
                  {facility.title}
                </h3>
                <p className="mt-2 text-sm">
                  {facility.description}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FacilitiesPage;