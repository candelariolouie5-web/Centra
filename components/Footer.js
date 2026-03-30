import Link from "next/link";
import Image from "next/image";
import { CalendarDaysIcon, HandRaisedIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[#f7f6f2]">
      {/* Newsletter Section */}
      <div className="relative py-16 sm:py-24 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,rgba(29,141,138,0.10),rgba(247,246,242,1))]" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 hidden w-[200%] origin-bottom-left skew-x-[-30deg] bg-white/70 shadow-xl ring-1 ring-[#dbe9e7] sm:block lg:mr-0 xl:mr-16 xl:origin-center" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            <div className="max-w-xl lg:max-w-lg">
              <h2 className="text-4xl font-semibold tracking-tight text-[#0d2323]">
                Stay Informed with Centra Clinic
              </h2>
              <p className="mt-4 text-lg text-[#5f7b79]">
                Subscribe to our newsletter for the latest health tips, clinic
                updates, and wellness advice from our team of experts.
              </p>

              <div className="mt-6 flex max-w-md gap-x-4">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="min-w-0 flex-auto rounded-full border border-[#dbe9e7] bg-white px-4 py-3 text-base text-[#0d2323] placeholder:text-[#7a908e] outline-none ring-0 transition focus:border-[#1d8d8a] sm:text-sm"
                />
                <button
                  type="submit"
                  className="flex-none rounded-full bg-[#1d8d8a] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(29,141,138,0.22)] transition hover:bg-[#177876]"
                >
                  Subscribe
                </button>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
              <div className="flex flex-col items-start rounded-[24px] border border-[#dbe9e7] bg-white/80 p-6 shadow-sm">
                <div className="rounded-2xl bg-[#e9f7f6] p-3 ring-1 ring-[#dbe9e7]">
                  <CalendarDaysIcon className="h-6 w-6 text-[#1d8d8a]" />
                </div>
                <dt className="mt-4 text-base font-semibold text-[#0d2323]">
                  Weekly Health Insights
                </dt>
                <dd className="mt-2 text-base leading-7 text-[#5f7b79]">
                  Receive expert tips, articles, and advice to help you live a
                  healthier life.
                </dd>
              </div>

              <div className="flex flex-col items-start rounded-[24px] border border-[#dbe9e7] bg-white/80 p-6 shadow-sm">
                <div className="rounded-2xl bg-[#e9f7f6] p-3 ring-1 ring-[#dbe9e7]">
                  <HandRaisedIcon className="h-6 w-6 text-[#1d8d8a]" />
                </div>
                <dt className="mt-4 text-base font-semibold text-[#0d2323]">
                  No Spam, Only Care
                </dt>
                <dd className="mt-2 text-base leading-7 text-[#5f7b79]">
                  We respect your inbox. Only relevant updates and clinic news.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-[#dbe9e7] bg-[#eef7f6] px-6 py-16 text-[#264543]">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/centraLogo.jpg"
                alt="Centra Clinic Ph"
                width={40}
                height={40}
                className="rounded-full ring-1 ring-[#dbe9e7]"
              />
              <h3 className="font-semibold text-[#0d2323]">Centra Clinic Ph</h3>
            </div>
            <p className="mb-4 text-sm text-[#5f7b79]">
              Providing modern healthcare with a human touch.
            </p>
            <div className="flex gap-3">
              <span className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-[#1d8d8a] shadow-sm ring-1 ring-[#dbe9e7] transition hover:bg-[#e9f7f6]">
                📘
              </span>
              <span className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-[#1d8d8a] shadow-sm ring-1 ring-[#dbe9e7] transition hover:bg-[#e9f7f6]">
                📸
              </span>
              <span className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-[#1d8d8a] shadow-sm ring-1 ring-[#dbe9e7] transition hover:bg-[#e9f7f6]">
                🐦
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold text-[#0d2323]">Quick Links</h4>
            <ul className="space-y-3 text-sm text-[#5f7b79]">
              <li>
                <Link href="#" className="transition hover:text-[#1d8d8a]">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-[#1d8d8a]">
                  Meet our Team
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-[#1d8d8a]">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic Hours */}
          <div>
            <h4 className="mb-4 font-semibold text-[#0d2323]">Clinic Hours</h4>
            <p className="mb-2 text-sm text-[#5f7b79]">
              Mon - Sat: 9:00am - 6:00pm
            </p>
            <p className="mb-4 text-sm text-[#5f7b79]">Sunday - Closed</p>
            <p className="text-sm text-[#5f7b79]">
              1488 A. Apolinario St. corner Calhoun, Makati City
            </p>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 font-semibold text-[#0d2323]">Stay Updated</h4>
            <p className="mb-4 text-sm text-[#5f7b79]">
              Health tips, clinic updates, and announcements.
            </p>
            <div className="flex overflow-hidden rounded-full border border-[#dbe9e7] bg-white shadow-sm">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent px-4 py-3 text-sm text-[#0d2323] outline-none placeholder:text-[#7a908e]"
              />
              <button className="m-1 rounded-full bg-[#1d8d8a] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#177876]">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-[#dbe9e7] pt-6 text-center text-sm text-[#6f8583]">
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} Centra Clinic Ph. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}