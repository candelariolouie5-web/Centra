"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Stethoscope,
  HeartPulse,
  ScanLine,
  ShieldCheck,
  Clock3,
  Globe2,
  Star,
} from "lucide-react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const specialties = [
  {
    title: "Ear",
    desc: "Expert assessment and care for hearing concerns, infections, pain, and other ear-related conditions.",
    icon: Stethoscope,
  },
  {
    title: "Nose",
    desc: "Diagnosis and treatment for congestion, sinus issues, allergies, and breathing-related concerns.",
    icon: ScanLine,
  },
  {
    title: "Throat",
    desc: "Focused care for voice problems, swallowing difficulties, infections, and throat discomfort.",
    icon: HeartPulse,
  },
  {
    title: "Aesthetics",
    desc: "High-quality aesthetic procedures performed with a medically guided approach and trusted materials.",
    icon: Star,
  },
];

const features = [
  {
    number: "01",
    title: "By Appointment Only",
    desc: "All consultations and procedures are handled strictly by scheduled appointment.",
  },
  {
    number: "02",
    title: "Holistic ENT Care",
    desc: "We approach ear, nose, and throat concerns as connected parts of your overall wellness.",
  },
  {
    number: "03",
    title: "Medically Sound Advice",
    desc: "Every recommendation is guided by professional medical judgment and patient safety.",
    active: true,
  },
  {
    number: "04",
    title: "Top-Notch Facilities",
    desc: "Quality procedures, reliable materials, and a comfortable clinical environment you can trust.",
  },
];

export default function Hero({ announcements = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // Banner handlers
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const handleCloseBanner = () => {
    setIsBannerVisible(false);
  };

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#0d2323]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ANNOUNCEMENT BANNER */}
        {isBannerVisible && announcements.length > 0 && currentAnnouncement && (
          <div className="relative w-full bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 text-white shadow-lg overflow-hidden rounded-lg mt-4">
            <div className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0 flex items-center gap-3">
                {currentAnnouncement.bannerImage && (
                  <img
                    src={currentAnnouncement.bannerImage}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="truncate">
                  <p className="font-semibold text-sm sm:text-base truncate">
                    {currentAnnouncement.title}
                  </p>
                  <p className="text-xs sm:text-sm text-teal-50 truncate">
                    {currentAnnouncement.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {announcements.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="p-1 rounded-full hover:bg-white/20 transition"
                      aria-label="Previous"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="p-1 rounded-full hover:bg-white/20 transition"
                      aria-label="Next"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                    <div className="flex gap-1 mx-1">
                      {announcements.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentIndex ? "bg-white w-4" : "bg-white/50"
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                <button
                  onClick={handleCloseBanner}
                  className="p-1 rounded-full hover:bg-white/20 transition"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-10 sm:py-14 lg:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(16,37,37,0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(16,37,37,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "56px 56px",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute left-[-120px] top-20 h-[520px] w-[520px] rounded-full bg-[#1d8d8a]/5 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute right-[-120px] top-10 h-[460px] w-[460px] rounded-full bg-sky-200/30 blur-3xl"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            {/* LEFT COPY */}
            <div className="pt-6 lg:pt-0">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-[#5f7b79] shadow-sm ring-1 ring-black/5">
                <Star className="h-3.5 w-3.5 fill-current text-[#e6b422]" />
                Trusted ENT & Aesthetic Care
              </div>

              <h1 className="max-w-xl text-4xl font-semibold leading-[0.96] tracking-[-0.04em] text-[#0c2222] sm:text-6xl lg:text-[76px]">
                Holistic
                <br />
                ENT &
                <br />
                <span className="italic font-medium text-[#143636]">
                  Aesthetic
                </span>{" "}
                Care
                <br />
                at CENTRA
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#596f6d] sm:text-lg">
                At CENTRA, we believe in a holistic approach to your Ears,
                Nose, Throat (ENT), and Aesthetic needs. We're not just about
                treatments; we're about providing medically sound advice and
                high-quality procedures with top-notch facilities and materials.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 rounded-full bg-[#1d8d8a] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(29,141,138,0.22)] transition hover:-translate-y-0.5 hover:bg-[#177a77]"
                >
                  Book Appointment
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1d8d8a]">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </a>

                <a
                  href="#specialties"
                  className="text-sm font-semibold text-[#102525] underline underline-offset-4"
                >
                  View Specialties
                </a>
              </div>
            </div>

            {/* CENTER VISUAL */}
            <div className="relative mx-auto w-full max-w-[620px]">
              <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#cce4ff] to-[#a8d0ff] p-4 shadow-[0_20px_60px_rgba(47,92,125,0.12)]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-30"
                  style={{
                    background:
                      "radial-gradient(circle at 20% 20%, white 0%, transparent 20%), radial-gradient(circle at 80% 25%, rgba(255,255,255,0.7) 0%, transparent 18%), radial-gradient(circle at 60% 80%, rgba(255,255,255,0.65) 0%, transparent 20%)",
                  }}
                />
                <img
                  src="/Centra-Doctor.jpg"
                  alt="Doctor"
                  className="relative z-10 h-[420px] w-full rounded-[28px] object-cover object-top sm:h-[540px]"
                />

                <div className="absolute right-6 top-1/2 z-20 -translate-y-1/2 rounded-2xl bg-white px-5 py-4 shadow-xl ring-1 ring-black/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9f7f6] text-[#1d8d8a]">
                      <Clock3 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#102525]">
                        By Appointment
                      </p>
                      <p className="text-xs text-[#68817f]">
                        Scheduled consultations only
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 left-[-10px] z-20 rounded-[22px] bg-white px-4 py-4 shadow-xl ring-1 ring-black/5 sm:left-[-22px] sm:px-5">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
                        alt="Patient"
                        className="h-11 w-11 rounded-full border-2 border-white object-cover"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
                        alt="Patient"
                        className="h-11 w-11 rounded-full border-2 border-white object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-3xl font-semibold tracking-tight text-[#102525]">
                        1,500+
                      </p>
                      <p className="text-sm text-[#68817f]">Happy Patients</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="pb-8 sm:pb-12 lg:pb-16">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-[#7b9290]">
              Why Choose Us
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0c2222] sm:text-4xl">
              Why patients choose CENTRA
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#68817f] sm:text-base">
              Patient-centered ENT and aesthetic care delivered with quality,
              safety, and professional medical guidance.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((item) => (
              <div
                key={item.number}
                className={`rounded-[24px] border px-6 py-6 shadow-sm transition ${
                  item.active
                    ? "border-[#1d8d8a] bg-[#1d8d8a] text-white shadow-[0_16px_40px_rgba(29,141,138,0.18)]"
                    : "border-black/5 bg-white text-[#102525]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      item.active
                        ? "bg-white text-[#1d8d8a]"
                        : "bg-[#ebf7f6] text-[#1d8d8a]"
                    }`}
                  >
                    {item.number}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p
                      className={`mt-2 text-sm leading-7 ${
                        item.active ? "text-white/85" : "text-[#68817f]"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SPECIALTIES */}
        <section id="specialties" className="py-8 sm:py-12 lg:py-16">
          <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#7b9290]">
                Specialties
              </p>
              <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#0c2222] sm:text-5xl">
                Ear, Nose,
                <br />
                Throat & <span className="italic font-medium">Aesthetics</span>
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#596f6d]">
                Focused care designed for ENT concerns and aesthetic needs, all
                delivered with quality, safety, and medical expertise.
              </p>
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-3 self-start rounded-full bg-[#1d8d8a] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(29,141,138,0.22)] transition hover:-translate-y-0.5 hover:bg-[#177a77]"
            >
              View All Specialties
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1d8d8a]">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {specialties.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-[28px] border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,37,37,0.08)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f7f6] text-[#1d8d8a]">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-8 text-2xl font-semibold tracking-tight text-[#102525]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#68817f]">
                    {item.desc}
                  </p>

                  <a
                    href="#"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#102525] transition group-hover:text-[#1d8d8a]"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* EXTRA BOTTOM STRIP */}
        <section className="pb-16 pt-6">
          <div className="grid gap-6 rounded-[34px] bg-gradient-to-r from-[#1c716f] to-[#2c9e99] p-6 text-white shadow-[0_18px_50px_rgba(29,141,138,0.25)] lg:grid-cols-[1.3fr_0.7fr] lg:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/70">
                CENTRA Care
              </p>
              <h3 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl">
                ENT and aesthetic care with medically sound treatment and
                quality materials.
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                We focus on expert guidance, high-quality procedures, and a
                patient-centered experience supported by top-notch facilities
                and reliable materials.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full bg-white/12 px-4 py-2 text-sm">
                  By appointment only
                </div>
                <div className="rounded-full bg-white/12 px-4 py-2 text-sm">
                  ENT consultations
                </div>
                <div className="rounded-full bg-white/12 px-4 py-2 text-sm">
                  Aesthetic procedures
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white/10 p-5 backdrop-blur">
                <ShieldCheck className="h-8 w-8" />
                <h4 className="mt-6 text-lg font-semibold">Safe & Trusted</h4>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Professional care, trusted standards, and patient-first
                  procedures.
                </p>
              </div>

              <div className="rounded-[24px] bg-white/10 p-5 backdrop-blur">
                <Globe2 className="h-8 w-8" />
                <h4 className="mt-6 text-lg font-semibold">Quality Experience</h4>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Comfortable consultations and carefully delivered treatments in
                  a modern clinic setting.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}