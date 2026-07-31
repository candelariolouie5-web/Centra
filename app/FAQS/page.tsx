"use client";

import React, { useState, useEffect } from "react";
import {
  HiPlus,
  HiMinus,
  HiOutlineDocumentReport,
  HiOutlineCog,
  HiOutlineSupport,
} from "react-icons/hi";
import Footer from "../../components/Footer";

// ---------- TYPES ----------
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Fetch FAQs from API
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch("/api/faqs");
        if (res.ok) {
          const data = await res.json();
          // Only show active FAQs
          const activeFaqs = data.filter((f: FAQItem) => f.isActive === true);
          setFaqs(activeFaqs);
        } else {
          console.error("Failed to fetch FAQs");
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // If loading, show a spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  // If no FAQs found
  if (faqs.length === 0) {
    return (
      <main className="bg-[#f7f6f2] text-[#0d2323] min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold">No FAQs Available</h1>
          <p className="text-gray-500 mt-2">Please check back later.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f7f6f2] text-[#0d2323]">
      {/* ===== HERO / HEADER ===== */}
      <section className="relative isolate overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,rgba(29,141,138,0.12),rgba(247,246,242,1))]" />
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center rounded-full border border-[#dbe9e7] bg-white/80 px-4 py-1.5 shadow-sm">
            <span className="text-sm font-semibold tracking-wide text-[#1d8d8a]">
              FAQ
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-[#0d2323] sm:text-5xl lg:text-6xl">
            Frequently asked questions
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#5f7b79]">
            Trusted by patients nationwide — find quick answers about
            appointments, services, and support.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white/80 px-5 py-2 shadow-sm ring-1 ring-[#dbe9e7]">
            <span className="text-sm font-medium text-[#1d8d8a]">
              ★ Trusted in more than 100 countries
            </span>
          </div>
        </div>
      </section>

      {/* ===== FAQ ACCORDION – Dynamic ===== */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          {/* Optional: Keep the category cards as static decoration, or remove them.
              We'll keep them but they're just decorative now. */}
          <div className="mb-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-6 text-center shadow-sm ring-1 ring-[#dbe9e7]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f7f6] text-[#1d8d8a]">
                <HiOutlineDocumentReport className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[#0d2323]">General</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#5f7b79]">
                Common questions about our services
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-6 text-center shadow-sm ring-1 ring-[#dbe9e7]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f7f6] text-[#1d8d8a]">
                <HiOutlineCog className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[#0d2323]">Services</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#5f7b79]">
                Questions about procedures and treatments
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-6 text-center shadow-sm ring-1 ring-[#dbe9e7]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f7f6] text-[#1d8d8a]">
                <HiOutlineSupport className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[#0d2323]">Support</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#5f7b79]">
                Booking, hours, and contact info
              </p>
            </div>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-[20px] border border-[#dbe9e7] bg-white/90 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center gap-4 px-6 py-4 text-left sm:px-7 sm:py-5"
                  >
                    <span className="flex-1 text-sm font-semibold text-[#0d2323] sm:text-base">
                      {faq.question}
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                        isOpen
                          ? "bg-[#1d8d8a] text-white"
                          : "bg-[#e9f7f6] text-[#1d8d8a]"
                      }`}
                    >
                      {isOpen ? (
                        <HiMinus className="h-4 w-4" />
                      ) : (
                        <HiPlus className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-[#eef3f2] px-6 py-4 sm:px-7 sm:py-5">
                        <p className="text-sm leading-7 text-[#5f7b79] sm:text-base sm:leading-8">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== CTA ===== */}
          <div className="mt-12 rounded-[32px] bg-gradient-to-r from-[#1c716f] to-[#2c9e99] p-8 text-white shadow-[0_18px_50px_rgba(29,141,138,0.25)] sm:p-10">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold sm:text-3xl">
                  Still have questions?
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                  Our team is here to help. Reach out or book a consultation
                  today.
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <a
                  href="/appointment"
                  className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1d8d8a] transition hover:bg-[#f3fbfa] hover:shadow-lg"
                >
                  Book Appointment
                  <span className="ml-2 text-lg">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <Footer />
    </main>
  );
}