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
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200"
          : "bg-linear-to-br from-indigo-50 via-white to-white shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/centraLogo.jpg"
            alt="Centra Clinic PH"
            width={42}
            height={42}
            priority
            className="rounded-full"
          />
          <div className="leading-tight">
            <span className="block text-xl font-extrabold text-gray-900">
              Centra
            </span>
            <span className="block text-xs text-gray-500 tracking-wide">
              Clinic PH
            </span>
          </div>
        </Link>

        <ul className="hidden md:flex items-center gap-10 text-gray-700 font-medium">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className="relative hover:text-indigo-600 transition-colors
                after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0
                after:bg-indigo-600 after:transition-all after:duration-300
                hover:after:w-full"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          {!isPublicUserLoggedIn && (
            <>
              <Link
                href="/login"
                className="px-5 py-2 rounded-full border border-gray-300
                text-gray-700 hover:bg-gray-100 transition font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 rounded-full bg-indigo-600 text-white
                hover:bg-indigo-700 transition font-medium"
              >
                Sign Up
              </Link>
            </>
          )}

          {isPublicUserLoggedIn && (
            <>
              <Link
                href="/appointment"
                className="px-6 py-2 rounded-full bg-black
                text-white font-semibold shadow-md hover:bg-gray-900 hover:shadow-lg transition"
              >
                Book Appointment
              </Link>

              <div className="relative dropdown-container">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300
                  text-gray-700 hover:bg-gray-100 transition font-medium"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="User Avatar"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white">
                      {session.user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="text-sm">{session.user?.name || "User"}</span>
                  <HiChevronDown
                    className={`w-4 h-4 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
          className="md:hidden text-gray-900 text-3xl"
        >
          {isOpen ? <HiOutlineX /> : <HiOutlineMenu />}
        </button>
      </div>

      <div
        className={`md:hidden origin-top transition-transform duration-300 ${
          isOpen ? "scale-y-100" : "scale-y-0"
        }`}
      >
        <div className="px-6 pb-6 pt-2 space-y-5 bg-white shadow-lg rounded-b-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-lg font-medium text-gray-800 hover:text-indigo-600"
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t space-y-3">
            {!isPublicUserLoggedIn && (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-6 py-2 rounded-full
                  border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-6 py-2 rounded-full
                  bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </>
            )}

            {isPublicUserLoggedIn && (
              <>
                <Link
                  href="/appointment"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-6 py-2 rounded-full
                  bg-black text-white font-semibold hover:bg-gray-900"
                >
                  Book Appointment
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-6 py-2 rounded-full
                  border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
                >
                  Profile
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-6 py-2 rounded-full
                  border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
                >
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-6 py-2 rounded-full
                  border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;