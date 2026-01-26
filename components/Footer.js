import Link from "next/link";
import Image from "next/image";
import { CalendarDaysIcon, HandRaisedIcon } from "@heroicons/react/24/outline";
 
export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-white">
      {/* Newsletter Section */}
      <div className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            <div className="max-w-xl lg:max-w-lg">
              <h2 className="text-4xl font-semibold tracking-tight text-gray-900">
                Stay Informed with Centra Clinic
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Subscribe to our newsletter for the latest health tips, clinic updates, and wellness advice from our team of experts.
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
                  className="min-w-0 flex-auto rounded-md bg-white px-3.5 py-2 text-base text-gray-900 placeholder:text-gray-500 outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                />
                <button
                  type="submit"
                  className="flex-none rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  Subscribe
                </button>
              </div>
            </div>
 
            <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
              <div className="flex flex-col items-start">
                <div className="rounded-md bg-white/50 p-2 ring-1 ring-gray-200">
                  <CalendarDaysIcon className="h-6 w-6 text-gray-600" />
                </div>
                <dt className="mt-4 text-base font-semibold text-gray-900">
                  Weekly Health Insights
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Receive expert tips, articles, and advice to help you live a healthier life.
                </dd>
              </div>
 
              <div className="flex flex-col items-start">
                <div className="rounded-md bg-white/50 p-2 ring-1 ring-gray-200">
                  <HandRaisedIcon className="h-6 w-6 text-gray-600" />
                </div>
                <dt className="mt-4 text-base font-semibold text-gray-900">
                  No Spam, Only Care
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  We respect your inbox. Only relevant updates and clinic news.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
 
      {/* Main Footer */}
      <div className="bg-[#0b0720] text-gray-300 px-6 py-16">
        <div className="max-w-7xl mx-auto grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/centraLogo.jpg"
                alt="Centra Clinic Ph"
                width={40}
                height={40}
              />
              <h3 className="text-white font-semibold">Centra Clinic Ph</h3>
            </div>
            <p className="text-sm mb-4">
              Providing modern healthcare with a human touch.
            </p>
            <div className="flex gap-3">
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer">📘</span>
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer">📸</span>
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer">🐦</span>
            </div>
          </div>
 
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#">Services</Link></li>
              <li><Link href="#">Meet our Team</Link></li>
              <li><Link href="#">FAQ</Link></li>
            </ul>
          </div>
 
          {/* Clinic Hours */}
          <div>
            <h4 className="text-white font-semibold mb-4">Clinic Hours</h4>
            <p className="text-sm mb-2">Mon - Sat: 9:00am - 6:00pm</p>
            <p className="text-sm mb-4">Sunday - Closed</p>
            <p className="text-sm">
              1488 A. Apolinario St. corner Calhoun, Makati City
            </p>
          </div>
 
          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
            <p className="text-sm mb-4">
              Health tips, clinic updates, and announcements.
            </p>
            <div className="flex bg-white/10 rounded-full overflow-hidden">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder-gray-400"
              />
              <button className="bg-white text-black px-5 py-2 text-sm font-medium rounded-full m-1">
                Subscribe
              </button>
            </div>
          </div>
        </div>
 
        {/* Copyright */}
        <div className="border-t border-white/10 mt-12 pt-6 text-center text-sm text-gray-400">
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} Centra Clinic Ph. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}