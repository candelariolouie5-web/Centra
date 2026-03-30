"use client";

import React, { useState } from "react";
import Footer from "../../components/Footer";
import { HiPlus, HiMinus } from "react-icons/hi";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What services does Centra Clinic PH offer?",
      answer:
        "Centra Clinic PH provides comprehensive outpatient services including general consultation, diagnostics, preventive care, and electronic medical record (EMR) management.",
    },
    {
      question: "How do I book an appointment?",
      answer:
        "You can book an appointment online through our booking system by selecting your preferred date, time, and doctor.",
    },
    {
      question: "Can I book the same date and time as another patient?",
      answer:
        "No. Once a date and time slot is booked, it will automatically become unavailable to avoid double bookings.",
    },
    {
      question: "Do you accept walk-in patients?",
      answer:
        "Yes, we accept walk-in patients depending on availability. However, booking online is highly recommended.",
    },
    {
      question: "Is my medical information secure?",
      answer:
        "Yes. Centra Clinic PH uses a secure EMR system to ensure confidentiality and protection of patient data.",
    },
    {
      question: "What are the clinic’s operating hours?",
      answer:
        "The clinic is open from Monday to Saturday, 8:00 AM to 6:00 PM.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <main className="bg-[#f7f6f2] text-[#0d2323]">
        {/* HERO / HEADER */}
        <section className="relative isolate overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,rgba(29,141,138,0.12),rgba(247,246,242,1))]" />
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full border border-[#dbe9e7] bg-white/80 px-4 py-1.5 shadow-sm">
              <span className="text-sm font-semibold tracking-wide text-[#1d8d8a]">
                Frequently Asked Questions
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-[#0d2323] sm:text-5xl lg:text-6xl">
              Everything you need
              <br />
              to know before your visit
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#5f7b79]">
              Find quick answers about appointments, clinic hours, patient
              records, and how Centra Clinic PH works.
            </p>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[24px] border border-[#dbe9e7] bg-white/90 shadow-sm transition-all duration-300"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFAQ(index)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-7"
                    >
                      <span className="text-base font-semibold text-[#0d2323] sm:text-lg">
                        {faq.question}
                      </span>

                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                          isOpen
                            ? "bg-[#1d8d8a] text-white"
                            : "bg-[#e9f7f6] text-[#1d8d8a]"
                        }`}
                      >
                        {isOpen ? (
                          <HiMinus className="h-5 w-5" />
                        ) : (
                          <HiPlus className="h-5 w-5" />
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
                        <div className="border-t border-[#eef3f2] px-6 py-5 sm:px-7">
                          <p className="leading-8 text-[#5f7b79]">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-12 rounded-[32px] bg-gradient-to-r from-[#1c716f] to-[#2c9e99] p-8 text-white shadow-[0_18px_50px_rgba(29,141,138,0.25)] sm:p-10">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Still have questions?
              </h2>
              <p className="mt-3 max-w-2xl text-white/85 leading-7">
                If you need more help, feel free to contact Centra Clinic PH or
                book an appointment for a face-to-face consultation.
              </p>
              <div className="mt-6">
                <a
                  href="/appointment"
                  className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1d8d8a] transition hover:bg-[#f3fbfa]"
                >
                  Book Appointment
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}