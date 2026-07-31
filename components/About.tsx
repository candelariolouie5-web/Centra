"use client";

import React, { useState, useEffect } from "react";

// ---------- TYPES ----------
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  status: "Published" | "Draft";
  embedUrl?: string;
}

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
    { name: 'Patients Served Weekly', value: '100+' },
    { name: 'Years of Trusted Care', value: '3+' },
  ];

  return (
    <>
      {/* Features Section */}
      <section className="bg-[#f7f6f2]">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#0d2323] sm:text-4xl">
                Discover Centra Clinic Product Features
              </h2>
              <p className="mt-4 text-[#5f7b79]">
                Centra Clinic PH offers advanced healthcare solutions designed for your convenience, comfort, and safety.
              </p>

              <dl className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
                {features.map((feature) => (
                  <div key={feature.name} className="border-t border-[#dbe9e7] pt-4">
                    <dt className="font-medium text-[#0d2323]">{feature.name}</dt>
                    <dd className="mt-2 text-sm text-[#5f7b79]">{feature.description}</dd>
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
                  className="rounded-lg bg-[#edf6f5] object-cover w-full h-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Work With Us */}
        <div className="relative isolate overflow-hidden bg-[#eef7f6] py-24 sm:py-32">
          <img
            alt=""
            src="/DESK.jpg"
            className="absolute inset-0 -z-10 w-full h-full object-cover object-right opacity-10 md:object-center"
          />

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h2 className="text-5xl font-semibold tracking-tight text-[#0d2323] sm:text-7xl">
                Work with us
              </h2>
              <p className="mt-8 text-lg leading-8 text-[#5f7b79] sm:text-xl">
                We're seeking passionate individuals who are eager to make an impact at Centra Clinic.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base font-semibold text-[#0d2323] sm:grid-cols-2 md:flex lg:gap-x-10">
                {links.map((link) => (
                  <a key={link.name} href={link.href} className="hover:text-[#1d8d8a] transition-colors">
                    {link.name} <span aria-hidden="true">&rarr;</span>
                  </a>
                ))}
              </div>

              <dl className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.name} className="flex flex-col-reverse gap-1">
                    <dt className="text-base text-[#5f7b79]">{stat.name}</dt>
                    <dd className="text-4xl font-semibold tracking-tight text-[#0d2323]">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Blog Section */}
      <BlogSection />
    </>
  );
}

// ============================================================
// BLOG SECTION - DYNAMIC (kumukuha mula sa /api/blog)
// ============================================================
function BlogSection() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch blog posts from API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const res = await fetch("/api/blog");
        if (res.ok) {
          const data = await res.json();
          // Only show published posts
          const published = data.filter((p: BlogPost) => p.status === "Published");
          setBlogPosts(published);
        } else {
          console.error("Failed to fetch blog posts");
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Helper to generate a consistent color based on title
  const getColorFromTitle = (title: string) => {
    const colors = [
      "from-teal-400 to-teal-700",
      "from-blue-400 to-blue-700",
      "from-purple-400 to-purple-700",
      "from-pink-400 to-pink-700",
      "from-amber-400 to-amber-700",
      "from-emerald-400 to-emerald-700",
      "from-rose-400 to-rose-700",
      "from-indigo-400 to-indigo-700",
    ];
    const index = title.length % colors.length;
    return colors[index];
  };

  // Loading state
  if (loading) {
    return (
      <section className="bg-[#f7f6f2] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#0d2323] sm:text-5xl">
              From the Blog
            </h2>
            <p className="mt-2 text-lg text-[#5f7b79]">
              Learn how Centra Clinic PH enhances patient care.
            </p>
          </div>
          <div className="mt-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading blog posts...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f7f6f2] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-[#0d2323] sm:text-5xl">
            From the Blog
          </h2>
          <p className="mt-2 text-lg text-[#5f7b79]">
            Learn how Centra Clinic PH enhances patient care.
          </p>
        </div>

        {blogPosts.length === 0 ? (
          <div className="mt-10 text-center text-gray-500">
            <p>No blog posts available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.slice(0, 3).map((post) => {
              const hasImage = post.image && post.image !== "";
              const gradientColor = getColorFromTitle(post.title || "Blog");
              const displayDate = post.date || "Date not set";
              const displayAuthor = post.author || "CENTRA Clinic";
              const displayExcerpt = post.excerpt || post.content?.substring(0, 80) + "..." || "Read more about this topic";

              return (
                <a
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="relative block rounded-lg overflow-hidden shadow-lg group"
                >
                  {hasImage ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${post.image})` }}
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d2323]/75 via-[#0d2323]/30 to-transparent" />

                  <div className="relative p-6 flex flex-col justify-end h-72">
                    <p className="text-xs text-[#e8f3f2]">
                      {displayDate} • {displayAuthor}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {post.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/80 line-clamp-2">
                      {displayExcerpt}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}