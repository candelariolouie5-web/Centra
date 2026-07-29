import Link from "next/link";
import Image from "next/image";
import {
  CalendarDaysIcon,
  HandRaisedIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
 
export default function Footer() {
  return (
    <footer className="relative isolate bg-white">
      {/* ========== NEWSLETTER SECTION – No form ========== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#f0f7f6] via-white to-[#f5faf9] py-16 sm:py-20 lg:py-28">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
 
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-12 lg:max-w-none lg:grid-cols-2 lg:gap-16">
            {/* Left – only text */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
                📬 Newsletter
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Stay Informed with <span className="text-teal-600">Centra Clinic</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-xl">
                Subscribe for health tips, clinic updates, and expert wellness
                advice — delivered straight to your inbox.
              </p>
              <p className="mt-3 text-xs text-gray-400">
                ✦ No spam. Unsubscribe anytime.
              </p>
            </div>
 
            {/* Right – Features */}
            <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-gray-200/50 backdrop-blur-sm transition hover:shadow-md">
                <div className="inline-flex rounded-xl bg-teal-100 p-2.5 text-teal-600">
                  <CalendarDaysIcon className="h-6 w-6" />
                </div>
                <dt className="mt-3 text-base font-semibold text-gray-900">
                  Weekly Health Insights
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-500">
                  Expert tips, articles, and advice for a healthier you.
                </dd>
              </div>
 
              <div className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-gray-200/50 backdrop-blur-sm transition hover:shadow-md">
                <div className="inline-flex rounded-xl bg-indigo-100 p-2.5 text-indigo-600">
                  <HandRaisedIcon className="h-6 w-6" />
                </div>
                <dt className="mt-3 text-base font-semibold text-gray-900">
                  No Spam, Only Care
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-500">
                  We respect your inbox — only relevant updates.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
 
      {/* ========== MAIN FOOTER ========== */}
      <div className="bg-[#0d1b1a] text-gray-400 px-6 pt-16 pb-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-4">
            {/* ===== Column 1: Brand ===== */}
            <div>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-teal-500/20 p-1.5">
                  <Image
                    src="/centraLogo.jpg"
                    alt="Centra Clinic"
                    width={40}
                    height={40}
                    className="rounded-lg object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Centra<span className="text-teal-400">Clinic</span>
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed max-w-xs">
                Providing modern healthcare with a human touch. Your wellness,
                our priority.
              </p>
 
              {/* Contact */}
              <div className="mt-5 space-y-2.5 text-sm">
                <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/5">
                  <PhoneIcon className="h-4 w-4 text-teal-400" />
                  <span>0998 956 2468</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/5">
                  <EnvelopeIcon className="h-4 w-4 text-teal-400" />
                  <span>centraclinicph@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/5">
                  <MapPinIcon className="h-4 w-4 text-teal-400" />
                  <span className="text-xs">
                    1488 A. Apolinario St. corner Calhoun, Barangay Pio Del Pilar, Makati City
                  </span>
                </div>
              </div>
 
              {/* Social */}
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
                  Follow us
                </p>
                <div className="mt-2.5 flex gap-2">
                  {[
                    { label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                    { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
                    { label: "Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                    { label: "YouTube", path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href="#"
                      aria-label={social.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition hover:border-teal-400/40 hover:bg-teal-500/20 hover:text-teal-300"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d={social.path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
 
              {/* CTA */}
              <div className="mt-6">
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:shadow-xl hover:shadow-teal-600/30 hover:scale-[1.02] active:scale-95"
                >
                  Book Consultation
                  <span className="text-lg leading-none">→</span>
                </Link>
              </div>
            </div>
 
            {/* ===== Column 2: Quick Links ===== */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                Quick Links
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {["Services", "Meet our Team", "FAQ", "Contact", "Patient Portal"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="inline-block text-gray-400 transition hover:text-white hover:translate-x-1"
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
 
            {/* ===== Column 3: Clinic Hours ===== */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                Clinic Hours
              </h4>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Monday – Friday</span>
                  <span className="text-white">9:00am – 6:00pm</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Saturday</span>
                  <span className="text-white">9:00am – 4:00pm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sunday</span>
                  <span className="text-teal-400 font-medium">Closed</span>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-white/5 p-4">
                <p className="text-xs leading-relaxed text-gray-400">
                  <span className="font-medium text-white">Emergency?</span>{" "}
                  Call us anytime at{" "}
                  <a href="tel:+63281234567" className="text-teal-400 hover:underline">
                    +63 2 8123 4567
                  </a>
                </p>
              </div>
            </div>
 
            {/* ===== Column 4: Stay Updated – No form ===== */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                Stay Updated
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Get the latest health tips, clinic news, and wellness advice.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                ✦ Free. No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
 
          {/* ===== Copyright ===== */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-sm text-gray-500 sm:flex-row">
            <span>
              © {new Date().getFullYear()}{" "}
              <span className="font-medium text-gray-300">Centra Clinic PH</span>.
              All rights reserved.
            </span>
            <div className="flex gap-5 text-xs">
              <Link href="#" className="transition hover:text-white">
                Privacy Policy
              </Link>
              <Link href="#" className="transition hover:text-white">
                Terms of Service
              </Link>
              <Link href="#" className="transition hover:text-white">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
 