"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTypewriter } from "react-simple-typewriter";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";

import { FaBarsStaggered, FaXmark } from "react-icons/fa6";

import { motion, AnimatePresence } from "framer-motion";

import "swiper/css";
import "swiper/css/effect-cards";

import Footer from "@/components/Footer";

type Announcement = {
  title: string;
  message: string;
  createdBy?: string;
};

type NavItem = {
  link: string;
  path: string;
  submenu?: {
    sublink: string;
    subpath: string;
  }[];
};

const HomePage = () => {
  const [text] = useTypewriter({
    words: [
      "Welcome to 👋",
      "Federal College of Education (Technical), Yauri",
      "Library Complex",
    ],
    loop: true,
    typeSpeed: 20,
    deleteSpeed: 10,
    delaySpeed: 2000,
  });

  const [showPopup, setShowPopup] = useState(false);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // LOADING STATE
  const [isLoading, setIsLoading] = useState(true);

  // LOADING EFFECT
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch("/api/announcements");

        if (!res.ok) {
          const text = await res.text();
          console.error("API ERROR:", text);
          return;
        }

        const result = await res.json();

        const announcements = result?.data;

        if (Array.isArray(announcements) && announcements.length > 0) {
          setAnnouncement(announcements[0]);
          setShowPopup(true);
        }
      } catch (error) {
        console.error("Failed to fetch announcement:", error);
      }
    };

    fetchAnnouncement();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const closeMenus = () => {
    setOpenSubmenu(null);
    setIsMenuOpen(false);
  };

  const navItems: NavItem[] = [
    {
      link: "About the Library⬇️",
      path: "/about",
      submenu: [
        {
          sublink: "Welcome Note by College Librarian",
          subpath: "/welcomeNote",
        },
        {
          sublink: "History",
          subpath: "#",
        },
        {
          sublink: "Mission & Vision",
          subpath: "/mission-vision",
        },
        {
          sublink: "Facilities",
          subpath: "#",
        },
        {
          sublink: "Library Membership",
          subpath: "/library-Membership",
        },
      ],
    },
    {
      link: "E-Library⬇️",
      path: "",
      submenu: [
        {
          sublink: "FCE Yauri AI I Know Everything",
          subpath: "/research-ai",
        },
        {
          sublink: "E-Library Catalog",
          subpath: "/e-library/databases",
        },
      ],
    },
    {
      link: "STAFFS & SECTIONS",
      path: "/staff",
    },
    {
      link: "OPAC",
      path: "/opac",
    },
    {
      link: "Services & Operations",
      path: "/services",
    },
    {
      link: "Help⬇️",
      path: "",
      submenu: [
        {
          sublink: "Fubk AI Librarian",
          subpath: "/ai-chatbot",
        },
        {
          sublink: "Frequently Asked Questions",
          subpath: "/help",
        },
        {
          sublink: "Library Rules & Regulations",
          subpath: "/library-rules",
        },
      ],
    },
    
    {
      link: "News & Events",
      path: "/events",
    },
    {
      link: "Contact Us",
      path: "/contact-us",
    },
  ];

  // LOADING SCREEN
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex flex-col items-center"
        >
          <Image
            src="/images/fce-logo.jpeg"
            alt="FCE Logo"
            width={140}
            height={140}
            className="rounded-full shadow-2xl"
          />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-2xl font-bold uppercase text-blue-700"
          >
            FCE, Yauri Library Complex
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-2 text-gray-600"
          >
            Loading Homepage...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <>
          {/* NAVBAR */}
          <header className="fixed left-0 right-0 top-0 z-50 w-full transition-all duration-300">
            <nav className={`py-4 px-5 ${isSticky ? "bg-red-900" : ""}`}>
              <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between gap-4 rounded-xl bg-red-900">
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-4">
                    <Image
                      src="/images/fce-logo.jpeg"
                      alt="FCE Logo"
                      width={60}
                      height={60}
                      className="rounded ml-2"
                    />

                    <span className="hidden text-sm font-bold leading-6 text-white md:block lg:text-lg">
                      F.C.E, YAURI
                      <br />
                      LIBRARY COMPLEX
                    </span>
                  </Link>

                  {/* Desktop Nav */}
                  <ul className="hidden items-center space-x-6 md:flex">
                    {navItems.map(({ link, path, submenu }) => (
                      <li key={link} className="relative">
                        {submenu ? (
                          <>
                            <button
                              onClick={() => toggleSubmenu(link)}
                              className="text-sm uppercase text-white transition hover:text-black"
                            >
                              {link}
                            </button>

                            {openSubmenu === link && (
                              <ul className="absolute left-0 top-full mt-3 w-64 rounded-lg bg-red-700 p-3 shadow-xl">
                                {submenu.map(({ sublink, subpath }) => (
                                  <li key={sublink} className="mb-2">
                                    <Link
                                      href={subpath}
                                      onClick={closeMenus}
                                      className="block rounded-md px-3 py-2 text-sm uppercase text-white transition hover:bg-blue-400 hover:text-black"
                                    >
                                      {sublink}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        ) : (
                          <Link
                            href={path}
                            className="text-sm uppercase text-white transition hover:text-black"
                          >
                            {link}
                          </Link>
                        )}
                      </li>
                    ))}

                    <Link
                      href="/login"
                      className="rounded-lg bg-white mr-2 px-4 py-2 text-sm font-semibold uppercase text-blue-700 transition hover:bg-black hover:text-white"
                    >
                      Login
                    </Link>
                  </ul>

                  {/* Mobile Toggle */}
                  <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-white">
                      {isMenuOpen ? (
                        <FaXmark className="h-6 w-6" />
                      ) : (
                        <FaBarsStaggered className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu */}
              {isMenuOpen && (
                <div className="mt-4 rounded-xl bg-red-900 p-5 md:hidden">
                  <div className="space-y-4">
                    {navItems.map(({ link, path, submenu }) => (
                      <div key={link}>
                        {submenu ? (
                          <>
                            <button
                              onClick={() => toggleSubmenu(link)}
                              className="block text-left text-sm uppercase text-white"
                            >
                              {link}
                            </button>

                            {openSubmenu === link && (
                              <ul className="ml-4 mt-4 space-y-6 rounded-lg bg-red-700 p-4 shadow-xl">
                                {submenu.map(({ sublink, subpath }) => (
                                  <li key={sublink}>
                                    <Link
                                      href={subpath}
                                      onClick={closeMenus}
                                      className="block rounded-lg bg-white/10 px-3 py-2 text-sm uppercase text-white transition hover:bg-white hover:text-blue-900"
                                    >
                                      {sublink}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        ) : (
                          <Link
                            href={path}
                            onClick={closeMenus}
                            className="block text-sm uppercase text-white"
                          >
                            {link}
                          </Link>
                        )}
                      </div>
                    ))}

                    <Link
                      href="/login"
                      className="inline-block rounded-lg bg-white px-4 py-2 font-semibold text-blue-700"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          </header>

          {/* HERO SECTION */}
          <section className="relative flex min-h-screen items-center overflow-hidden bg-teal-100 px-4 sm:px-6 lg:px-24">
            {/* Popup */}
            {showPopup && announcement && (
              <div className="absolute left-1/2 top-28 z-50 w-full max-w-md -translate-x-1/2 rounded-xl border border-blue-300 bg-white p-5 shadow-2xl">
                <h3 className="mb-3 text-lg font-bold text-blue-600">
                  📢 {announcement.title}
                </h3>

                <p className="mb-3 text-gray-700">{announcement.message}</p>

                <p className="text-right text-sm italic text-gray-500">
                  - {announcement.createdBy || "College Librarian"}
                </p>

                <button
                  onClick={() => setShowPopup(false)}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            )}

            <div className="flex w-full flex-col items-center justify-between gap-16 py-32 md:flex-row">
              {/* LEFT SIDE */}
              <div className="space-y-8 md:w-1/2">
                <h1 className="text-4xl font-bold uppercase leading-tight text-red-900 md:text-5xl">
                  {text}
                </h1>

                <p className="text-lg leading-8 text-gray-700 md:w-4/5">
                  Federal College of Education (Technical), Yauri Library was established in
                  2025 to support the College in achieving its goals of
                  teaching, learning, and research.
                </p>

                {/* SEARCH BAR */}
                <div className="flex w-full max-w-lg items-center overflow-hidden rounded-lg bg-white shadow-md">
                  <input
                    type="text"
                    placeholder="Search books, authors, journals..."
                    className="w-full px-4 py-3 outline-none"
                  />
                  <button className="bg-red-900 px-5 py-3 text-white hover:bg-red-900">
                    Search
                  </button>
                </div>

                {/* MAIN BUTTON */}
                <Link href="/welcomeNote">
                  <button className="rounded-lg bg-red-900 px-5 py-3 text-white transition hover:bg-red-700">
                    Read the College Librarian Welcome Note
                  </button>
                </Link>

                {/* AI LIBRARIAN BUTTON */}
                <Link href="/ai-chatbot">
                  <button className="rounded-lg border border-blue-600 ml-5 mt-5 px-5 py-3 text-blue-600 transition hover:bg-blue-600 hover:text-white">
                    Ask AI Librarian 🤖
                  </button>
                </Link>

                {/* STATS */}
                <div className="mt-6 flex gap-6 text-sm text-gray-700">
                  <div>
                    <p className="text-xl font-bold text-blue-600">10K+</p>
                    Books
                  </div>

                  <div>
                    <p className="text-xl font-bold text-blue-600">2K+</p>
                    Students
                  </div>

                  <div>
                    <p className="text-xl font-bold text-blue-600">500+</p>
                    Journals
                  </div>
                </div>

                {/* QUICK ACTION CARDS */}
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {[
                    {
                      title: "OPAC",
                      link: "/opac",
                    },
                    {
                      title: "Membership",
                      link: "/library-Membership",
                    },
                    {
                      title: "Library Rules & Regulations",
                      link: "/library-rules",
                    },
                  ].map((item) => (
                    <Link
                      key={item.title}
                      href={item.link}
                      className="rounded-lg bg-white p-3 text-center shadow hover:bg-blue-50"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex flex-col items-center">
                <div className="w-[300px]">
                  <Swiper
                    effect={"cards"}
                    grabCursor={true}
                    modules={[EffectCards]}
                    className="mySwiper"
                  >
                    {[
                      "/images/banner-books/Book1.jpg",
                      "/images/banner-books/Book2.jpg",
                      "/images/banner-books/Book3.jpg",
                      "/images/banner-books/Book4.jpg",
                      "/images/banner-books/Book5.jpg",
                      "/images/banner-books/Book6.jpg",
                      "/images/banner-books/Book7.jpg",
                      "/images/banner-books/Book8.jpg",
                    ].map((img, index) => (
                      <SwiperSlide key={index}>
                        <div className="relative h-[400px] w-full overflow-hidden rounded-2xl">
                          <Image
                            src={img}
                            alt="Book"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                <h2 className="mt-6 text-center text-lg font-bold text-blue-700">
                  Swipe for More Books ➡️ ⬅️
                </h2>
              </div>
            </div>
          </section>

          <Footer />
        </>
      </motion.div>
    </AnimatePresence>
  );
};

export default HomePage;
