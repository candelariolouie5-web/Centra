"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

interface Props {
  redirectUrl?: string;
}

const LoginForm = ({ redirectUrl = "/" }: Props) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.role) return;

    if (session.user.role === "USER") {
      router.push(redirectUrl);
    }
  }, [status, session, router, redirectUrl]);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signIn("google", { callbackUrl: redirectUrl });
    } catch (err) {
      console.error(err);
      setError("Google sign in failed. Please try again.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f7f6f2] px-4">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center">
          <div className="rounded-full border border-[#dbe9e7] bg-white px-5 py-3 text-sm font-medium text-[#5f7b79] shadow-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  const isStaff = !!(session?.user?.role && session.user.role !== "USER");

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f7f6f2] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,rgba(29,141,138,0.10),rgba(247,246,242,1))]" />
      <div className="absolute left-[-120px] top-16 -z-10 h-[320px] w-[320px] rounded-full bg-[#1d8d8a]/8 blur-3xl" />
      <div className="absolute bottom-0 right-[-120px] -z-10 h-[320px] w-[320px] rounded-full bg-sky-200/25 blur-3xl" />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-[#dbe9e7] bg-white/70 shadow-[0_24px_80px_rgba(16,37,37,0.08)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT VISUAL PANEL */}
          <div className="relative order-1 overflow-hidden bg-[#eef7f6] p-5 sm:p-7 lg:min-h-[760px] lg:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(29,141,138,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(186,220,255,0.35),transparent_35%)]" />
            <div className="relative z-10 flex h-full flex-col">
              <div className="inline-flex w-fit items-center rounded-full border border-[#dbe9e7] bg-white/85 px-4 py-1.5 shadow-sm">
                <span className="text-sm font-semibold tracking-wide text-[#1d8d8a]">
                  Centra Clinic PH
                </span>
              </div>

              <div className="mt-6 max-w-xl">
                <h2 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#0d2323] sm:text-4xl lg:text-5xl">
                  Trusted patient care,
                  <br />
                  made simple and
                  <br />
                  secure.
                </h2>

                <p className="mt-5 max-w-lg text-base leading-8 text-[#5f7b79] sm:text-lg">
                  Sign in to your Centra Clinic patient portal to continue your
                  appointments, records, and clinic experience with ease.
                </p>
              </div>

              <div className="relative mt-8 flex-1 lg:mt-10">
                <div className="relative mx-auto h-[300px] w-full max-w-[640px] sm:h-[380px] lg:h-full lg:min-h-[460px]">
                  <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#cce4ff] to-[#a8d0ff] p-3 shadow-[0_20px_60px_rgba(47,92,125,0.12)]">
                    <div className="relative h-full overflow-hidden rounded-[28px] bg-white/20">
                      <img
                        src="/centraLogo.jpg"
                        alt="Centra Clinic patient care"
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d2323]/30 via-transparent to-transparent" />

                      <div className="absolute left-4 top-4 rounded-2xl bg-white/90 px-4 py-3 shadow-lg ring-1 ring-black/5 backdrop-blur sm:left-6 sm:top-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1d8d8a]">
                          Patient Portal
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#0d2323] sm:text-base">
                          Safe, simple, and convenient access
                        </p>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 rounded-[22px] bg-white/92 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur sm:bottom-6 sm:left-6 sm:right-auto sm:w-[320px]">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f7f6] text-[#1d8d8a]">
                            <svg
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                              className="h-5 w-5"
                            >
                              <path d="M19 5h-1V4a1 1 0 1 0-2 0v1H8V4a1 1 0 1 0-2 0v1H5a2 2 0 0 0-2 2v2h18V7a2 2 0 0 0-2-2Zm2 6H3v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8Z" />
                            </svg>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#0d2323]">
                              Continue with Google
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#5f7b79]">
                              Your first sign-in automatically creates your
                              patient account.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -right-2 hidden rounded-[22px] bg-white px-5 py-4 shadow-xl ring-1 ring-black/5 lg:block">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1d8d8a]">
                      Secure Access
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#0d2323]">
                      Protected patient login
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT LOGIN PANEL */}
          <div className="order-2 flex items-center justify-center bg-white/70 p-5 sm:p-7 lg:p-10">
            <div className="w-full max-w-xl rounded-[32px] border border-[#dbe9e7] bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,37,37,0.07)] backdrop-blur sm:p-8 lg:p-10">
              <div className="mb-8 text-center">
                <div className="mb-5 inline-flex items-center rounded-full border border-[#dbe9e7] bg-[#eef7f6] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#1d8d8a] shadow-sm">
                  Patient Portal
                </div>

                <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#0d2323] sm:text-5xl">
                  Welcome Back
                </h1>

                <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#5f7b79] sm:text-base">
                  Continue with Google to sign in or create your Centra Clinic
                  patient account.
                </p>
              </div>

              {isStaff && (
                <div className="mb-5 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-semibold">
                    Staff account detected ({session?.user?.role})
                  </p>
                  <p className="mt-1 text-xs leading-5">
                    This page is for patient accounts only.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                    <Link
                      href="/adminlogin"
                      className="rounded-full border border-amber-300 px-3 py-1.5 font-medium transition hover:bg-amber-100"
                    >
                      Admin Login
                    </Link>
                    <Link
                      href="/doctorlogin"
                      className="rounded-full border border-amber-300 px-3 py-1.5 font-medium transition hover:bg-amber-100"
                    >
                      Doctor Login
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="rounded-full bg-red-500 px-3 py-1.5 font-medium text-white transition hover:bg-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-5 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={loading || isStaff}
                title={isStaff ? "Google sign in is for USER accounts only" : ""}
                className="group flex w-full items-center justify-center gap-3 rounded-[24px] bg-[#1d8d8a] px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(29,141,138,0.22)] transition hover:-translate-y-0.5 hover:bg-[#177876] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1d8d8a] shadow-sm">
                  <FontAwesomeIcon icon={faGoogle} />
                </span>
                <span>{loading ? "Connecting..." : "Continue with Google"}</span>
              </button>

              <div className="mt-5 rounded-[22px] border border-[#eef3f2] bg-[#f8fbfb] px-4 py-4 text-center text-xs leading-6 text-[#5f7b79] sm:text-sm">
                First-time Google users will be registered automatically.
              </div>

              <div className="mt-7 flex items-center justify-center gap-3 text-sm">
                <Link
                  href="/"
                  className="font-medium text-[#5f7b79] transition hover:text-[#1d8d8a]"
                >
                  Back to Home
                </Link>
                <span className="text-[#c9d8d6]">•</span>
                <Link
                  href="/register"
                  className="font-medium text-[#1d8d8a] transition hover:text-[#177876]"
                >
                  New here?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;