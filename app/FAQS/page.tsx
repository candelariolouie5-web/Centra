"use client";
 
import React, { useState } from "react";
import {
  HiPlus,
  HiMinus,
  HiOutlineDocumentReport,
  HiOutlineCog,
  HiOutlineSupport,
} from "react-icons/hi";
import Footer from "../../components/Footer"; // ← Footer import
 
export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
 
  const faqCategories = [
    {
      id: "general",
      icon: HiOutlineDocumentReport,
      title: "General Report",
      description:
        "A general report provides a concise overview of key findings and conclusions on a specific subject.",
      questions: [
        {
          q: "What services does Centra Clinic PH offer?",
          a: "Centra Clinic PH provides comprehensive outpatient services including general consultation, diagnostics, preventive care, and electronic medical record (EMR) management.",
        },
        {
          q: "How do I book an appointment?",
          a: "You can book an appointment online through our booking system by selecting your preferred date, time, and doctor.",
        },
        {
          q: "Can I book the same date and time as another patient?",
          a: "No. Once a date and time slot is booked, it will automatically become unavailable to avoid double bookings.",
        },
        {
          q: "Do you accept walk-in patients?",
          a: "No. We do not accept walk-in patients. Please book an appointment online. Appointment confirmations are sent only to registered Globe, TM, or DITO mobile numbers.",
        },
      ],
    },
    {
      id: "service",
      icon: HiOutlineCog,
      title: "Our Service",
      description:
        "Our service delivers tailored solutions to meet your unique needs efficiently and effectively.",
      questions: [
        {
          q: "Is my medical information secure?",
          a: "Yes. Centra Clinic PH uses a secure EMR system to ensure confidentiality and protection of patient data.",
        },
        {
          q: "What are the clinic's operating hours?",
          a: "The clinic is open from Monday to Saturday, 8:00 AM to 6:00 PM.",
        },
        {
          q: "Are there any additional fees for your services?",
          a: "All fees are transparently communicated during booking. There are no hidden charges unless explicitly discussed during consultation.",
        },
        {
          q: "How can I request a service appointment?",
          a: "You can request a service appointment through our online booking system or by calling our clinic directly.",
        },
      ],
    },
    {
      id: "support",
      icon: HiOutlineSupport,
      title: "Support",
      description:
        "Our support team is here to assist you with any questions or issues you may have.",
      questions: [
        {
          q: "How can I contact customer support?",
          a: "You can reach our support team via email at centraclinicph@gmail.com or by calling 0998 956 2468.",
        },
        {
          q: "What are your support hours?",
          a: "Our support team is available Monday through Saturday, 9:00 AM to 6:00 PM.",
        },
        {
          q: "How can I track the progress of my support request?",
          a: "You will receive updates via email or SMS. You can also follow up by contacting our support team directly.",
        },
        {
          q: "How do I cancel or modify a support appointment?",
          a: "To cancel or modify an appointment, please contact our clinic at least 24 hours in advance.",
        },
      ],
    },
  ];
 
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
 
  // Build a flat list with category info for rendering
  const flatFaqs = faqCategories.flatMap((cat) =>
    cat.questions.map((q) => ({
      ...q,
      category: cat,
    }))
  );
 
  return (
    <main className="bg-[#f7f6f2] text-[#0d2323]">
      {/* ===== HERO / HEADER – no animation ===== */}
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
 
          {/* Trust badge */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white/80 px-5 py-2 shadow-sm ring-1 ring-[#dbe9e7]">
            <span className="text-sm font-medium text-[#1d8d8a]">
              ★ Trusted in more than 100 countries
            </span>
          </div>
        </div>
      </section>
 
      {/* ===== FAQ ACCORDION – Categorized ===== */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          {/* Category tabs / headers – no stagger */}
          <div className="mb-12 grid gap-6 sm:grid-cols-3">
            {faqCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="rounded-2xl bg-white/80 p-6 text-center shadow-sm ring-1 ring-[#dbe9e7] transition hover:shadow-md"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f7f6] text-[#1d8d8a]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-[#0d2323]">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#5f7b79]">
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>
 
          {/* Accordion – no stagger */}
          <div className="space-y-3">
            {flatFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const Icon = faq.category.icon;
 
              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-[20px] border border-[#dbe9e7] bg-white/90 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center gap-4 px-6 py-4 text-left sm:px-7 sm:py-5"
                  >
                    {/* Category icon */}
                    <div className="hidden shrink-0 items-center justify-center sm:flex">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9f7f6] text-[#1d8d8a]">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
 
                    <span className="flex-1 text-sm font-semibold text-[#0d2323] sm:text-base">
                      {faq.q}
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
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
 
          {/* ===== CTA – no animation ===== */}
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
 