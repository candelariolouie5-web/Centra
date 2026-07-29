"use client";
 
import Image from "next/image";
import Footer from "../../components/Footer";
import { useState, useEffect } from "react";
import {
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckBadgeIcon,
  HeartIcon,
  ShieldCheckIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
 
export default function AboutPage() {
  // 4 images in the carousel
  const images = ["/e.jpg", "/a.jpg", "/s.jpg", "/y.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);
 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);
 
  return (
    <main className="bg-[#f7f6f2] text-[#0d2323]">
      {/* ===== HERO SECTION – with 4‑image carousel ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,rgba(29,141,138,0.10),rgba(247,246,242,1))]" />
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center">
          {/* Left text */}
          <div>
            <div className="inline-flex items-center rounded-full border border-[#dbe9e7] bg-white/80 px-4 py-1.5 shadow-sm">
              <span className="text-sm font-semibold tracking-wide text-[#1d8d8a]">
                About CENTRA Clinic PH
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#0d2323] md:text-5xl lg:text-6xl">
              Your journey to
              <br />
              <span className="italic text-[#1d8d8a]">confidence</span> starts here
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5f7b79]">
              At CENTRA Clinic PH, we don’t just treat conditions — we restore
              confidence. Led by{" "}
              <span className="font-medium text-[#0d2323]">Dr. John Ong</span>
              , a board‑certified ENT and facial plastic surgeon, we blend
              medical excellence with aesthetic artistry to help you feel
              like the best version of yourself.
            </p>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#5f7b79]">
              Every procedure, from a routine ear check‑up to a delicate
              rhinoplasty, is performed with the same level of precision,
              compassion, and personalised attention — because your health and
              beauty are inseparable.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <CheckBadgeIcon className="h-5 w-5 text-[#1d8d8a]" />
                <span>Board‑certified surgeon</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <HeartIcon className="h-5 w-5 text-[#1d8d8a]" />
                <span>Holistic ENT & aesthetic care</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <ShieldCheckIcon className="h-5 w-5 text-[#1d8d8a]" />
                <span>Medically sound, results‑driven</span>
              </div>
            </div>
            <div className="mt-10">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-[#1d8d8a] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 transition hover:-translate-y-1 hover:bg-[#177a77]"
              >
                Book your consultation
                <span className="text-lg">→</span>
              </a>
            </div>
          </div>
 
          {/* Right: 4‑image carousel */}
          <div className="relative h-[420px] sm:h-[500px] w-full max-w-md mx-auto lg:mx-0 overflow-hidden rounded-[28px] border border-[#dbe9e7] bg-white p-2 shadow-[0_20px_50px_rgba(16,37,37,0.08)]">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {images.map((src, idx) => (
                <div key={idx} className="min-w-full relative aspect-[3/4]">
                  <Image
                    src={src}
                    alt={`Slide ${idx + 1}`}
                    fill
                    className="rounded-[22px] object-cover"
                  />
                </div>
              ))}
            </div>
            {/* Pagination dots */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? "w-6 bg-[#1d8d8a]" : "w-2 bg-[#dbe9e7]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
 
      {/* ===== DID YOU KNOW? ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="relative overflow-hidden rounded-[36px] border border-[#dbe9e7] shadow-[0_20px_60px_rgba(16,37,37,0.08)]">
          <div className="relative h-[320px] sm:h-[400px] w-full">
            <Image
              src="/y.jpg"
              alt="Environmental factors and allergic rhinitis"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d2323]/70 via-[#0d2323]/20 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white sm:p-12">
            <p className="text-sm uppercase tracking-[0.2em] text-teal-200">
              Did you know?
            </p>
            <h3 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              Environmental factors like dust and pollen play a major role in the development of allergic rhinitis.
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-teal-100/80">
              At CENTRA, we address both environmental triggers and underlying conditions for comprehensive relief.
            </p>
          </div>
        </div>
      </section>
 
      {/* ===== WHY CHOOSE CENTRA ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-[#7b9290]">Why CENTRA</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#0c2222] sm:text-4xl">
            More than a clinic – a partner in your well‑being
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[#596f6d]">
            We combine medical expertise with genuine compassion, ensuring you
            feel heard, safe, and confident at every step.
          </p>
        </div>
 
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-teal-50/30 backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#0d2323]">Expert, personalised care</h3>
            <p className="mt-2 text-sm text-[#5f7b79]">
              Every treatment is tailored to your unique anatomy, goals, and
              lifestyle – because one size doesn’t fit all.
            </p>
          </div>
 
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-teal-50/30 backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#0d2323]">Safety & transparency</h3>
            <p className="mt-2 text-sm text-[#5f7b79]">
              We explain every option, risk, and benefit clearly, so you can
              make informed decisions with complete peace of mind.
            </p>
          </div>
 
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-teal-50/30 backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
              <StarIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#0d2323]">Aesthetic artistry</h3>
            <p className="mt-2 text-sm text-[#5f7b79]">
              As a facial plastic surgeon, Dr. Ong brings an artist’s eye to
              every procedure – achieving natural, beautiful results.
            </p>
          </div>
 
          <div className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-teal-50/30 backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
              <HeartIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#0d2323]">Holistic approach</h3>
            <p className="mt-2 text-sm text-[#5f7b79]">
              We treat ENT and aesthetic concerns as interconnected – because
              true well‑being starts from the inside out.
            </p>
          </div>
        </div>
 
        {/* Testimonial */}
        <div className="mt-12 rounded-3xl bg-white/90 p-8 shadow-md ring-1 ring-teal-50/30 backdrop-blur sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 max-w-2xl text-lg font-medium leading-8 text-[#0d2323]">
              “Dr. Ong and the CENTRA team made me feel completely at ease.
              The results exceeded my expectations – I finally feel like myself again.”
            </blockquote>
            <p className="mt-2 text-sm text-[#5f7b79]">– A satisfied patient</p>
          </div>
        </div>
      </section>
 
      {/* ===== STATS ===== */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[32px] border border-[#dbe9e7] bg-white/80 px-8 py-12 shadow-sm backdrop-blur md:px-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Stat icon={UserGroupIcon} number="44,000+" label="Patients served nationwide" />
            <div className="hidden sm:block w-px bg-[#dbe9e7] self-stretch" />
            <Stat icon={AcademicCapIcon} number="120+" label="Medical professionals partnered" />
            <div className="hidden sm:block w-px bg-[#dbe9e7] self-stretch" />
            <Stat icon={ClockIcon} number="3+ years" label="Of trusted medical service" />
          </div>
        </div>
      </section>
 
      {/* ===== VALUES IMAGE ===== */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[36px] border border-[#dbe9e7] shadow-[0_20px_60px_rgba(16,37,37,0.08)]">
          <div className="relative h-[500px] sm:h-[600px] w-full bg-[#f7f6f2]">
            <Image
              src="/new.jpg"
              alt="Centra Clinic PH – modern and comfortable consultation rooms"
              fill
              className="object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d2323]/70 via-[#0d2323]/20 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white sm:p-12">
            <p className="text-sm uppercase tracking-[0.2em] text-teal-200">
              Our Space
            </p>
            <h3 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              Comfortable, modern clinic rooms designed for your peace of mind
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-teal-100/80">
              Every detail – from lighting to layout – is crafted to make you feel at ease from the moment you walk in.
            </p>
          </div>
        </div>
      </section>
 
      {/* ===== VALUES CONTENT ===== */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-[#dbe9e7] bg-white/80 px-4 py-1.5 shadow-sm">
            <span className="text-sm font-semibold tracking-wide text-[#1d8d8a]">Our Values</span>
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-[-0.03em] text-[#0d2323] sm:text-4xl">
            The principles that guide us
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5f7b79]">
            These values are not just words on a wall – they are the heartbeat
            of every interaction at CENTRA Clinic PH.
          </p>
        </div>
 
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Value title="Be world‑class">
            We continuously refine our skills, invest in the latest technology,
            and uphold the highest standards of care – because you deserve nothing
            less than the best.
          </Value>
          <Value title="Share everything you know">
            We empower you with knowledge. From diagnosis to recovery, we explain
            every step clearly, so you never feel lost or unsure.
          </Value>
          <Value title="Always learning">
            Medicine evolves, and so do we. Our team stays ahead of the curve
            with ongoing education and training to offer you the safest, most
            effective treatments.
          </Value>
          <Value title="Be supportive">
            We create a warm, non‑judgmental space where you can be open about
            your concerns – because your comfort matters as much as your outcome.
          </Value>
          <Value title="Take responsibility">
            We take ownership of every decision, every procedure, and every
            result. Your trust is our greatest responsibility.
          </Value>
          <Value title="Enjoy downtime">
            We believe a balanced team provides better care. By nurturing our
            own well‑being, we bring energy and compassion to every patient.
          </Value>
        </div>
 
        {/* Final CTA */}
        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full bg-[#1d8d8a] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-teal-600/30 transition hover:-translate-y-1 hover:bg-[#177a77]"
          >
            Schedule your consultation today
            <span className="text-lg">→</span>
          </a>
        </div>
      </section>
 
      {/* ===== FOOTER ===== */}
      <Footer />
    </main>
  );
}
 
// ===== Helper components =====
function Stat({ icon: Icon, number, label }: { icon: React.ComponentType<{ className?: string }>; number: string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-2 rounded-full bg-[#e5f3f2] p-2">
        <Icon className="h-6 w-6 text-[#1d8d8a]" />
      </div>
      <h3 className="text-4xl font-semibold tracking-tight text-[#0d2323]">{number}</h3>
      <p className="mt-1 text-[#5f7b79]">{label}</p>
    </div>
  );
}
 
function Value({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[#dbe9e7] bg-white/85 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,37,37,0.08)]">
      <h4 className="mb-3 text-lg font-semibold text-[#0d2323]">{title}</h4>
      <p className="leading-7 text-[#5f7b79]">{children}</p>
    </div>
  );
}