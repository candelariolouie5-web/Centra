"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiOutlineMenu, HiOutlineX, HiChevronDown } from "react-icons/hi";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isPublicUserLoggedIn = session?.user?.role === "USER";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/service" },
    { name: "FAQS", href: "/FAQS" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      setIsOpen(false);
      setDropdownOpen(false);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (!target.closest(".dropdown-container")) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setIsOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#f7f6f2]/90 backdrop-blur-xl border-b border-[#d9e7e5] shadow-[0_10px_30px_rgba(16,37,37,0.06)]"
          : "bg-[#f7f6f2]/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[82px] items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-3 sm:gap-4"
            onClick={() => {
              setIsOpen(false);
              setDropdownOpen(false);
            }}
          >
            <div className="relative overflow-hidden rounded-full ring-1 ring-[#d9e7e5] bg-white/80 shadow-sm">
              <Image
                src="/centraLogo.jpg"
                alt="Centra Clinic PH"
                width={46}
                height={46}
                priority
                className="rounded-full object-cover"
              />
            </div>

            <div className="leading-tight">
              <span className="block text-lg sm:text-xl font-extrabold tracking-tight text-[#102525]">
                Centra
              </span>
              <span className="block text-xs sm:text-sm text-[#6c8684] tracking-wide">
                Clinic PH
              </span>
            </div>
          </Link>

          <ul className="hidden lg:flex items-center gap-2 rounded-full border border-[#dbe9e7] bg-white/70 px-3 py-2 shadow-sm backdrop-blur">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="relative inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-[#264543] transition-all duration-200 hover:bg-[#eaf6f5] hover:text-[#1d8d8a]"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            {!isPublicUserLoggedIn && (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-[#cfe0de] bg-white/80 px-5 py-2.5 text-sm font-semibold text-[#264543] transition-all duration-200 hover:border-[#b8d4d1] hover:bg-[#eef7f6]"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full bg-[#1d8d8a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(29,141,138,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#187876]"
                >
                  Sign Up
                </Link>
              </>
            )}

            {isPublicUserLoggedIn && (
              <>
                <Link
                  href="/appointment"
                  className="inline-flex items-center justify-center rounded-full bg-[#1d8d8a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(29,141,138,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#187876]"
                >
                  Book Appointment
                </Link>

                <div className="relative dropdown-container">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-[#cfe0de] bg-white/85 px-3 py-2 text-[#264543] shadow-sm transition-all duration-200 hover:bg-[#eef7f6]"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="User Avatar"
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1d8d8a] text-xs font-semibold text-white">
                        {session.user?.name?.charAt(0) || "U"}
                      </div>
                    )}

                    <span className="max-w-[120px] truncate text-sm font-semibold">
                      {session.user?.name || "User"}
                    </span>

                    <HiChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-[#dbe9e7] bg-white/95 shadow-[0_18px_50px_rgba(16,37,37,0.10)] backdrop-blur-xl z-50">
                      <div className="border-b border-[#eef3f2] px-4 py-3">
                        <p className="truncate text-sm font-semibold text-[#102525]">
                          {session.user?.name || "User"}
                        </p>
                        <p className="truncate text-xs text-[#6c8684]">
                          {session.user?.email || ""}
                        </p>
                      </div>

                      <div className="p-2">
                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#264543] transition hover:bg-[#eef7f6]"
                        >
                          Profile
                        </Link>

                        <Link
                          href="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#264543] transition hover:bg-[#eef7f6]"
                        >
                          Settings
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#264543] transition hover:bg-[#eef7f6]"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d6e5e3] bg-white/85 text-[#102525] shadow-sm transition hover:bg-[#eef7f6]"
          >
            {isOpen ? <HiOutlineX className="text-2xl" /> : <HiOutlineMenu className="text-2xl" />}
          </button>
        </div>

        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
            isOpen ? "max-h-[700px] pb-4 opacity-100" : "max-h-0 pb-0 opacity-0"
          }`}
        >
          <div className="mt-1 rounded-[28px] border border-[#dbe9e7] bg-white/90 p-4 shadow-[0_16px_40px_rgba(16,37,37,0.08)] backdrop-blur-xl sm:p-5">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-base font-semibold text-[#264543] transition hover:bg-[#eef7f6] hover:text-[#1d8d8a]"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-4 border-t border-[#eef3f2] pt-4 space-y-3">
              {!isPublicUserLoggedIn && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-full border border-[#cfe0de] bg-white px-5 py-3 text-center text-sm font-semibold text-[#264543] transition hover:bg-[#eef7f6]"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-full bg-[#1d8d8a] px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_12px_30px_rgba(29,141,138,0.22)] transition hover:bg-[#187876]"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {isPublicUserLoggedIn && (
                <>
                  <div className="flex items-center gap-3 rounded-2xl border border-[#e4efee] bg-[#f8fbfb] px-4 py-3">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d8d8a] text-sm font-semibold text-white">
                        {session.user?.name?.charAt(0) || "U"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#102525]">
                        {session.user?.name || "User"}
                      </p>
                      <p className="truncate text-xs text-[#6c8684]">
                        {session.user?.email || ""}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/appointment"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-full bg-[#1d8d8a] px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_12px_30px_rgba(29,141,138,0.22)] transition hover:bg-[#187876]"
                  >
                    Book Appointment
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-full border border-[#cfe0de] bg-white px-5 py-3 text-center text-sm font-semibold text-[#264543] transition hover:bg-[#eef7f6]"
                  >
                    Profile
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-full border border-[#cfe0de] bg-white px-5 py-3 text-center text-sm font-semibold text-[#264543] transition hover:bg-[#eef7f6]"
                  >
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-full border border-[#cfe0de] bg-white px-5 py-3 text-center text-sm font-semibold text-[#264543] transition hover:bg-[#eef7f6]"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;