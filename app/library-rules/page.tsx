"use client";

import { ShieldAlert, BookOpen, AlertTriangle } from "lucide-react";

export default function LibraryRulesPage() {
  const rules = [
    "Noise making, sleeping, and acts of disturbance are prohibited in the Library.",
    "Orderly manner and neatness must be maintained in the Library and its premises.",
    "Eating, drinking, and smoking are strictly prohibited in the Library.",
    "The College Librarian is empowered to suspend/bar any person from using the Library for violating the Library rules and regulations.",
    "Library materials borrowed or taken out on loan must be returned to the Library at the end of every session. Failure to do so forfeits the user's right to use or borrow Library materials.",
    "Entrance into rooms marked 'Staff Only' or 'Out of Bounds' is restricted.",
    "Users must show their Library ID Cards on entering the Library, when borrowing books, or whenever requested by Library staff.",
    "Library borrowers' tickets are not transferable. Readers should keep their tickets safely as lost tickets will not be replaced.",
    "Books must be returned immediately on demand by the Library.",
    "Before leaving the University finally, each user must return all books borrowed from the Library and surrender Library ID Cards and borrowing tickets.",
    "Mutilation, marking, or tracing of any kind on Library materials attracts appropriate penalties.",
    "Briefcases, handbags, umbrellas, etc., should be kept at the pigeon holes provided at the Library entrance. Valuable items remain at owners' risk.",
    "Readers must show all materials in their possession to the Porter at the exit/check counter before leaving the Library.",
    "Matches, naked fire, inflammable materials, knives, razor blades, scissors, rechargeable lanterns, flash cameras, and harmful substances are prohibited.",
    "Users are strongly advised to switch off mobile phones before entering the Library. Violations may result in confiscation for up to two weeks.",
    "Books consulted should be left on reading tables except reserved books.",
    "Reservation of seats is not allowed. The Library reserves the right to remove materials from unattended seats.",
    "Readers are advised to take good care of all Library materials.",
    "Books should be kept away from liquids. Water, biscuits, peanuts, sweets, snacks, and similar items should not be brought into the Library.",
    "Users must not tamper with electrical or electronic appliances such as fans, air conditioners, cables, and televisions.",
    "Violation of Library rules and regulations may attract disciplinary action, including rustication or expulsion from the College.",
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-500 via-blue-800 to-sky-700 py-24 px-6">
        <div className="max-w-6xl mx-auto text-center text-white">
          <ShieldAlert className="mx-auto h-16 w-16 mb-6" />

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            FCE Yauri Library Rules & Regulations
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-blue-100 leading-8">
            Every Library user is expected to observe and comply with
            these rules to ensure a peaceful, safe, and productive
            learning environment.
          </p>
        </div>
      </section>

      {/* INTRO */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-lg p-8 border-l-8 border-blue-700">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="text-blue-700" />
            <h2 className="text-2xl font-bold text-slate-800">
              Library Usage Guidelines
            </h2>
          </div>

          <p className="text-slate-600 leading-8">
            The Federal College Of Education Yauri Library exists to
            support teaching, learning, and research. All users are
            expected to maintain discipline and respect Library
            resources and facilities at all times.
          </p>
        </div>
      </section>

      {/* RULES */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {rules.map((rule, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center min-w-[50px] h-[50px] rounded-full bg-blue-700 text-white font-bold">
                  {index + 1}
                </div>

                <p className="text-slate-700 leading-7">
                  {rule}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WARNING SECTION */}
      <section className="bg-red-50 border-t border-red-200 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-10 border-l-8 border-red-600">
            <div className="flex items-center gap-4 mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />

              <h2 className="text-3xl font-bold text-red-700">
                Important Warning
              </h2>
            </div>

            <p className="text-lg leading-9 text-slate-700">
              Readers are strongly reminded that violation of any
              Library rule attracts disciplinary action which may
              include suspension, rustication, or expulsion from the
              College.
            </p>

            <div className="mt-8 rounded-2xl bg-red-600 text-white p-8">
              <h3 className="text-2xl font-bold mb-4">
                ⚠ Theft of Library Materials
              </h3>

              <p className="text-lg leading-8">
                Theft of any Library material attracts
                <span className="font-extrabold text-yellow-300">
                  {" "}
                  EXPULSION
                </span>{" "}
                from the College.
              </p>

              <p className="mt-4 text-xl font-bold">
                THINK OF YOUR FUTURE!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER MESSAGE */}
      <section className="bg-blue-500 text-white py-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-lg">
            Federal College Of Education Yauri Library Complex
          </p>

          <p className="text-white mt-2">
            Supporting Teaching, Learning and Research Excellence
          </p>
        </div>
      </section>
    </main>
  );
}