"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    setName(session.user?.name || "");
    setImage(session.user?.image || "");
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });
      if (res.ok) {
        alert("Profile updated successfully!");
        // Optionally refresh session or redirect
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
    setLoading(false);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f6f2]">
        <div className="flex items-center gap-3 rounded-full border border-[#dbe9e7] bg-white px-6 py-3 shadow-sm">
          <svg
            className="h-5 w-5 animate-spin text-[#1d8d8a]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
            />
          </svg>
          <span className="text-sm font-medium text-[#5f7b79]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#0d2323] sm:text-3xl">
              Settings
            </h1>
            <p className="mt-1 text-sm text-[#5f7b79]">
              Manage your profile information
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef7f6] text-[#1d8d8a] shadow-sm ring-1 ring-[#dbe9e7]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
        </div>

        {/* Form Card */}
        <div className="overflow-hidden rounded-2xl border border-[#dbe9e7] bg-white/80 shadow-[0_20px_60px_rgba(16,37,37,0.06)] backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Profile Picture Preview */}
              {image && (
                <div className="flex items-center gap-4 rounded-xl bg-[#f8fbfb] p-4 ring-1 ring-[#eef3f2]">
                  <img
                    src={image}
                    alt="Profile"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-[#dbe9e7]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://ui-avatars.com/api/?name=" + encodeURIComponent(name || "User");
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#0d2323]">Current profile picture</p>
                    <p className="text-xs text-[#5f7b79]">Update the URL below to change it</p>
                  </div>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#0d2323]"
                >
                  Full Name
                </label>
                <div className="mt-1.5">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-xl border-0 bg-[#f8fbfb] px-4 py-3 text-[#0d2323] shadow-sm ring-1 ring-inset ring-[#dbe9e7] placeholder:text-[#a0b8b6] focus:ring-2 focus:ring-inset focus:ring-[#1d8d8a] sm:text-sm"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Profile Picture URL Field */}
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-[#0d2323]"
                >
                  Profile Picture URL
                </label>
                <div className="mt-1.5">
                  <input
                    id="image"
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="block w-full rounded-xl border-0 bg-[#f8fbfb] px-4 py-3 text-[#0d2323] shadow-sm ring-1 ring-inset ring-[#dbe9e7] placeholder:text-[#a0b8b6] focus:ring-2 focus:ring-inset focus:ring-[#1d8d8a] sm:text-sm"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <p className="mt-1.5 text-xs text-[#5f7b79]">
                  Provide a direct image URL (optional)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex items-center justify-end border-t border-[#eef3f2] pt-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d8d8a] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(29,141,138,0.20)] transition hover:-translate-y-0.5 hover:bg-[#177876] focus:outline-none focus:ring-2 focus:ring-[#1d8d8a] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      />
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}