import React from "react";
import Link from "next/link";
import Footer from "../../components/Footer";

const services = [
  {
    title: "Face-to-Face Consultation",
    description:
      "Meet with our doctor in person for a proper clinical evaluation, clear diagnosis, and personalized treatment plan in a professional and comfortable setting.",
    image: "Medical Team Discussion (1).png",
    featured: true,
    badge: "Recommended First Step",
  },
  {
    title: "Ear Care",
    description:
      "Comprehensive assessment and treatment for ear pain, infections, hearing concerns, wax buildup, and other ear-related conditions with expert ENT care.",
    image: "Close-Up Of Human Ear.png",
  },
  {
    title: "Nose & Sinus Care",
    description:
      "Evaluation and treatment for nasal congestion, sinus discomfort, allergies, breathing difficulties, and other nose-related concerns using a patient-focused approach.",
    image: "Medical Discussion Scene.png",
  },
  {
    title: "Throat Care",
    description:
      "Professional care for sore throat, swallowing concerns, voice changes, throat irritation, and related ENT conditions with careful medical assessment.",
    image: "Healthcare Professional in Action.png",
  },
  {
    title: "Facial Aesthetic Treatments",
    description:
      "Enhance and refresh your appearance through safe, medically guided facial treatments designed to support healthy skin and natural-looking results.",
    image: "Serenity Spa_ Facial Treatment Bliss.png",
    badge: "Aesthetic Care",
  },
  {
    title: "Advanced Aesthetic Procedures",
    description:
      "From skin-focused treatments to tattoo removal, our aesthetic services are performed with quality materials, modern techniques, and attention to patient safety.",
    image: "Cosmetic Procedure Close-Up.png",
  },
];

export default function ServicesPage() {
  return (
    <>
      <main className="bg-[#f7f6f2] text-[#0d2323]">
        {/* Page Hero */}
        <section className="relative isolate overflow-hidden px-6 py-24 sm:py-28 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,rgba(29,141,138,0.12),rgba(247,246,242,1))]" />
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center rounded-full border border-[#dbe9e7] bg-white/80 px-4 py-1.5 shadow-sm">
              <span className="text-sm font-semibold tracking-wide text-[#1d8d8a]">
                Centra Clinic Services
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.03em] text-[#0d2323] sm:text-5xl lg:text-6xl">
              ENT and Aesthetic Care
              <br />
              Designed Around You
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#5f7b79]">
              Centra Clinic offers face-to-face consultations, focused ear, nose,
              and throat care, and aesthetic services delivered with a
              medically guided approach, quality materials, and patient-centered
              attention.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/appointment"
                className="inline-flex items-center rounded-full bg-[#1d8d8a] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(29,141,138,0.22)] transition hover:-translate-y-0.5 hover:bg-[#177876]"
              >
                Book an Appointment
              </Link>

              <a
                href="#services-list"
                className="inline-flex items-center rounded-full border border-[#cfe0de] bg-white px-7 py-3.5 text-sm font-semibold text-[#264543] transition hover:bg-[#eef7f6]"
              >
                Explore Services
              </a>
            </div>
          </div>
        </section>

        {/* Services Sections */}
        <div
          id="services-list"
          className="mx-auto max-w-7xl px-6 py-20 space-y-24 lg:space-y-28"
        >
          {services.map((service, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <section
                key={idx}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  !isEven ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""
                }`}
              >
                {/* Image */}
                <div>
                  <div className="overflow-hidden rounded-[32px] border border-[#dbe9e7] bg-white p-2 shadow-[0_20px_60px_rgba(16,37,37,0.08)]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-80 w-full rounded-[26px] object-cover md:h-96"
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-6">
                  {service.badge && (
                    <span
                      className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${
                        service.featured
                          ? "bg-[#1d8d8a] text-white"
                          : "border border-[#cfe0de] bg-white text-[#1d8d8a]"
                      }`}
                    >
                      {service.badge}
                    </span>
                  )}

                  <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#0d2323] sm:text-4xl">
                    {service.title}
                  </h2>

                  <p className="max-w-2xl text-lg leading-8 text-[#5f7b79]">
                    {service.description}
                  </p>

                  <Link
                    href="/appointment"
                    className={`inline-flex items-center rounded-full px-8 py-3.5 text-sm font-semibold transition ${
                      service.featured
                        ? "bg-[#1d8d8a] text-white shadow-[0_14px_35px_rgba(29,141,138,0.22)] hover:bg-[#177876]"
                        : "border border-[#cfe0de] bg-white text-[#264543] hover:bg-[#eef7f6]"
                    }`}
                  >
                    Book this Service
                  </Link>
                </div>
              </section>
            );
          })}
        </div>

        {/* CTA */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-gradient-to-r from-[#1c716f] to-[#2c9e99] p-8 text-white shadow-[0_18px_50px_rgba(29,141,138,0.25)] sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
                  Ready to visit Centra?
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Book your face-to-face consultation today.
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/85">
                  Whether you need ENT care or aesthetic treatment, our team is
                  ready to provide personalized attention in a professional,
                  comfortable clinic setting.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:items-end">
                <Link
                  href="/appointment"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#1d8d8a] transition hover:bg-[#f3fbfa]"
                >
                  Book Appointment
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Learn More About Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}