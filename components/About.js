'use client'
import React from "react";

export default function CentraClinicFeatures() {
  const features = [
    { name: "Modern Equipment", description: "State-of-the-art medical devices for accurate diagnosis and treatment." },
    { name: "Experienced Doctors", description: "Board-certified physicians with years of experience in their specialties." },
    { name: "Personalized Care", description: "Tailored treatment plans to meet your unique health needs." },
    { name: "Convenient Appointments", description: "Flexible scheduling and online booking for your convenience." },
    { name: "Hygienic Environment", description: "Clean, safe, and sanitized facilities for your peace of mind." },
    { name: "Comprehensive Services", description: "From general consultations to specialized treatments, we cover it all." },
  ];

  const images = [
    { src: "/image.png", alt: "Doctor attending a patient in consultation room" },
    { src: "/Clean.jpg", alt: "Modern diagnostic equipment in Centra Clinic" },
    { src: "/Pain.jpg", alt: "Nurse assisting patient with care" },
    { src: "/ear.jpg", alt: "Reception and waiting area at Centra Clinic" },
  ];

  const links = [
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/service' },
    { name: 'Our FAQs', href: '/FAQs' },
    { name: 'Meet our doctor', href: '#' },
  ];

  const stats = [
    { name: 'Clinics Nationwide', value: '1' },
    { name: 'Dedicated Healthcare Professionals', value: '50+' },
    { name: 'Patients Served Weekly', value: '500+' },
    { name: 'Years of Trusted Care', value: '10+' },
  ];

  return (
    <>
      {/* Features Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Discover Centra Clinic Product Features
              </h2>
              <p className="mt-4 text-gray-500">
                Centra Clinic PH offers advanced healthcare solutions designed for your convenience, comfort, and safety.
              </p>

              <dl className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
                {features.map((feature) => (
                  <div key={feature.name} className="border-t border-gray-200 pt-4">
                    <dt className="font-medium text-gray-900">{feature.name}</dt>
                    <dd className="mt-2 text-sm text-gray-500">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="grid grid-cols-2 grid-rows-2 gap-4 sm:gap-6 lg:gap-8">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img.src}
                  alt={img.alt}
                  className="rounded-lg bg-gray-100 object-cover w-full h-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Work With Us */}
        <div className="relative isolate overflow-hidden bg-white py-24 sm:py-32">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&h=1500&q=80"
            className="absolute inset-0 -z-10 w-full h-full object-cover object-right opacity-10 md:object-center"
          />

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h2 className="text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
                Work with us
              </h2>
              <p className="mt-8 text-lg leading-8 text-gray-700 sm:text-xl">
                We’re seeking passionate individuals who are eager to make an impact at Centra Clinic.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base font-semibold text-gray-900 sm:grid-cols-2 md:flex lg:gap-x-10">
                {links.map((link) => (
                  <a key={link.name} href={link.href}>
                    {link.name} <span aria-hidden="true">&rarr;</span>
                  </a>
                ))}
              </div>

              <dl className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.name} className="flex flex-col-reverse gap-1">
                    <dt className="text-base text-gray-700">{stat.name}</dt>
                    <dd className="text-4xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <BlogSection />
    </>
  );
}

function BlogSection() {
  const posts = [
    {
      id: 1,
      title: 'White Medicine Luhilo',
      href: '#',
      date: 'June 2, 2024',
      author: { name: 'Dr. John Ong' },
      imageUrl: '/white.jpg',
    },
    {
      id: 2,
      title: 'Hyaluronic Acid Fillers and Skinboosters',
      href: '#',
      date: 'May 8, 2024',
      author: { name: 'Dr. John Ong' },
      imageUrl: '/galderma.jpg',
    },
    {
      id: 3,
      title: 'Polynucleotide (PN) and PDRN',
      href: '#',
      date: 'October 11, 2024',
      author: { name: 'Dr. John Ong' },
      imageUrl: '/rejuran.jpg',
    },
  ];

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            From the Blog
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Learn how Centra Clinic PH enhances patient care.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.href}
              className="relative block rounded-lg overflow-hidden shadow-lg group"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${post.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              <div className="relative p-6 flex flex-col justify-end h-72">
                <p className="text-xs text-gray-200">
                  {post.date} • {post.author.name}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {post.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
