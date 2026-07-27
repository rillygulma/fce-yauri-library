"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimatel from "@/components/cards/AnimatedCardl";

interface FAQItem {
  question: string;
  answer?: string;
  isOpen: boolean;
}

const faqs: Omit<FAQItem, "isOpen">[] = [
  {
    question: "How can I gain access to use the Library?",
    answer:
      "Students and staff of the Federal College of Education Yauri can gain access with their university identification cards.",
  },
  {
    question: "How can I find materials in the Library?",
    answer:
      "Use the Traditional Card Catalogue or the Online Public Access Catalogue (OPAC). They contain all materials held by the Library.",
  },
  {
    question: "How can I obtain my Library Card?",
    answer:
      "Visit the Circulation Desk at the Main Library",
  },
  {
    question:
      "Can I ask someone else to check out a book with my Library Card?",
    answer:
      "No. Library cards are non-transferable. Misuse will result in confiscation.",
  },
  {
    question: "How many items can I borrow?",
    answer:
      "Studenta – 6 items\nStaff – 10 items",
  },
  {
    question: "What is the loan duration for items checked out?",
    answer:
      "Student: 2 weeks (renewable twice). Staff: 1 month (renewable twice).",
  },
  {
    question: "How do I locate a book using the catalogue?",
    answer: `1. Identify the author, title or subject.\n2. Check the Catalogue alphabetically.\n3. Note the class mark on the card.\n4. Use the class mark to find the book on the shelves.\n5. Ask library staff if you need help.`,
  },
  {
    question: "What are the procedures for borrowing books?",
    answer: `• Borrow from the Loan Counter using Library tickets.\n• Present your Library ID and ticket.\n• Sign the book card.\n• Book will be stamped with return date.\n• Ensure return and ticket recovery.\n• Late returns attract fines.`,
  },
  {
    question: "Can I borrow books during vacation?",
    answer:
      "Yes. With HOD’s request and Librarian approval. Must return within the first week of resumption.",
  },
  {
    question: "What are the library fines and penalties?",
    answer: `Overdue: ₦50/day (Students), ₦200/day (Staff)\nDamage: Repair cost\nLoss: Cost + ₦5,000 surcharge\nLoss of ID/Ticket: Only replaced on special grounds\nBook Recall: Return within 3 days`,
  },
  {
    question: "What are the Library rules and regulations?",
    answer: `• No noise, eating or sleeping\n• Return books before sessions end\n• Mobile phones must be off\n• Bags kept at owner's risk\n• Theft attracts EXPULSION\n• Comply with all library staff\n• Do not tamper with electronics`,
  },
  {
    question: "What is the Inter-library loan & referral service?",
    answer:
      "You can request materials from other Nigerian libraries via inter-library cooperation. Referral to those libraries is also possible.",
  },
  {
    question: "What if I lose my Library ID Card or Borrowing Tickets?",
    answer: `Once issued, there is no replacement of any borrowing tickets lost by users, except in special cases like fire, flood, accident, or other natural disasters.\nHowever, the University Librarian may approve a replacement of the Library ID Card upon submission of:\n• A valid police report\n• A sworn court affidavit\n• Payment of ₦500.00`,
  },
  {
    question: "What if I damage or lose other Library materials?",
    answer:
      "Loss or damage of any other library items or materials will attract an appropriate fine or penalty as determined by the College Librarian.",
  },
];

export default function ViralLinkFAQ() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>(
    faqs.map((faq) => ({ ...faq, isOpen: false })),
  );

  const toggleFAQ = (index: number) => {
    setFaqItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, isOpen: !item.isOpen }
          : { ...item, isOpen: false },
      ),
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <ScrollAnimatel delay={250} direction="up">
        <div className="w-full max-w-[640px]">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-semibold text-blue-700 leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-3xl md:text-[34px] hidden font-semibold text-blue-700 leading-tight">
              We’ve got answers
            </p>
          </div>

          {/* FAQ List */}
          <div className="space-y-5">
            {faqItems.map((item, index) => {
              const isOpen = item.isOpen;

              return (
                <motion.div
                  key={index}
                  layout
                  initial={false}
                  animate={{
                    rotate: isOpen ? 4 : 0,
                    y: isOpen ? -6 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 18,
                  }}
                  className="relative"
                >
                  {/* Glow Shadow */}
                  {isOpen && (
                    <div className="absolute inset-x-6 -bottom-3 h-8 bg-primary-500/30 blur-2xl rounded-full" />
                  )}

                  {/* Card */}
                  <div
                    className={`relative bg-white rounded-2xl px-6 py-5 transition-all duration-300
                  ${isOpen
                        ? "shadow-[0_20px_60px_rgba(124,58,237,0.18)]"
                        : "shadow-[0_8px_25px_rgba(0,0,0,0.06)]"
                      }`}
                  >
                    {/* Question */}
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-[15.5px] md:text-[16px] font-medium text-gray-900 pr-6 leading-snug">
                        {item.question}
                      </span>

                      {/* Icon */}
                      <span className="text-3xl text-primary-700 font-light">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {/* Answer */}
                    <AnimatePresence initial={false}>
                      {isOpen && item.answer && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25 }}
                          className="mt-3 text-[14.5px] text-primary-800 leading-relaxed"
                        >
                          {item.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </ScrollAnimatel>    </div>
  );
}

