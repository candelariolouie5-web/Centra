import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // ✅ Fixed: "DOCTOR" instead of "doctor"
  if (session.user.role === "DOCTOR") {
    redirect("/doctor/dashboard");
  }
  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-[#f7f6f2] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#0d2323] sm:text-3xl">
              Profile
            </h1>
            <p className="mt-1 text-sm text-[#5f7b79]">
              View and manage your personal information
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

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-[#dbe9e7] bg-white/80 shadow-[0_20px_60px_rgba(16,37,37,0.06)] backdrop-blur-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
              {/* Avatar */}
              <div className="relative mb-4 sm:mb-0">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "Profile"}
                    width={120}
                    height={120}
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-[#dbe9e7] shadow-md sm:h-32 sm:w-32"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#eef7f6] text-4xl font-semibold text-[#1d8d8a] ring-4 ring-[#dbe9e7] shadow-md sm:h-32 sm:w-32">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 rounded-full bg-[#1d8d8a] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white shadow-sm">
                  {user.role || "user"}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-semibold text-[#0d2323]">
                  {user.name || "No name"}
                </h2>
                <p className="mt-1 flex items-center justify-center gap-2 text-[#5f7b79] sm:justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-[#a0b8b6]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  {user.email}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center rounded-full bg-[#eef7f6] px-3 py-1 text-xs font-medium text-[#1d8d8a] ring-1 ring-[#dbe9e7]">
                    {user.role || "Patient"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-[#5f7b79] ring-1 ring-[#dbe9e7]">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Optional extra details – decorative */}
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#eef3f2] pt-6 sm:grid-cols-3">
              <div className="rounded-xl bg-[#f8fbfb] p-4 text-center ring-1 ring-[#eef3f2]">
                <p className="text-xs font-medium uppercase tracking-wider text-[#a0b8b6]">
                  Member since
                </p>
                <p className="mt-1 text-sm font-medium text-[#0d2323]">
                  {new Date().getFullYear()}
                </p>
              </div>
              <div className="rounded-xl bg-[#f8fbfb] p-4 text-center ring-1 ring-[#eef3f2]">
                <p className="text-xs font-medium uppercase tracking-wider text-[#a0b8b6]">
                  Account type
                </p>
                <p className="mt-1 text-sm font-medium text-[#0d2323] capitalize">
                  {user.role || "Patient"}
                </p>
              </div>
              <div className="rounded-xl bg-[#f8fbfb] p-4 text-center ring-1 ring-[#eef3f2]">
                <p className="text-xs font-medium uppercase tracking-wider text-[#a0b8b6]">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium text-[#1d8d8a]">Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}