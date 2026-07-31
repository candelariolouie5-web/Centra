"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Download,
  Settings,
  LogOut,
  BarChart3,
  ChevronDown,
  ChevronRight,
  User,
  Stethoscope,
  ClipboardList,
  Megaphone,
  LayoutGrid, // <-- ADD THIS
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    if (
      pathname === "/admin/patients" ||
      pathname === "/admin/doctors" ||
      pathname === "/admin/secretaries"
    ) {
      setIsUserMenuOpen(true);
    }
  }, [pathname]);

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-gray-300 flex flex-col justify-between border-r border-gray-800 shadow-lg">
      {/* TOP */}
      <div>
        <div className="flex items-center gap-3 p-6 border-b border-gray-800">
          <img src="/centraLogo.jpg" alt="Centra Clinic" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-sm font-semibold text-white">Centra Clinic</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        <div className="p-6">
          <nav className="space-y-2 text-sm">
            <Link href="/admin/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname === "/admin/dashboard" ? "bg-indigo-900 text-indigo-200 font-medium" : "hover:bg-gray-800 hover:text-white"}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            <div>
              <button onClick={toggleUserMenu} className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition ${isUserMenuOpen ? "bg-indigo-900 text-indigo-200 font-medium" : "hover:bg-gray-800 hover:text-white"}`}>
                <div className="flex items-center gap-3">
                  <Users size={18} />
                  <span>User Management</span>
                </div>
                {isUserMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isUserMenuOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  <Link href="/admin/patients" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname === "/admin/patients" ? "bg-indigo-900 text-indigo-200 font-medium" : "hover:bg-gray-800 hover:text-white"}`}>
                    <User size={16} />
                    <span>Patient</span>
                  </Link>
                  <Link href="/admin/doctors" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname === "/admin/doctors" ? "bg-indigo-900 text-indigo-200 font-medium" : "hover:bg-gray-800 hover:text-white"}`}>
                    <Stethoscope size={16} />
                    <span>Doctors</span>
                  </Link>
                  <Link href="/admin/secretaries" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname === "/admin/secretaries" ? "bg-indigo-900 text-indigo-200 font-medium" : "hover:bg-gray-800 hover:text-white"}`}>
                    <ClipboardList size={16} />
                    <span>Secretary</span>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/admin/appointments" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname === "/admin/appointments" ? "bg-indigo-900 text-indigo-200 font-medium" : "hover:bg-gray-800 hover:text-white"}`}>
              <Calendar size={18} />
              <span>Appointment</span>
            </Link>

            {/* CONTENT MANAGEMENT - NEW */}
            <Link href="/admin/content" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname === "/admin/content" || pathname.startsWith("/admin/content") ? "bg-indigo-900 text-indigo-200 font-medium" : "hover:bg-gray-800 hover:text-white"}`}>
              <LayoutGrid size={18} />
              <span>Content Management</span>
            </Link>

            <Link href="/admin/report" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname === "/admin/report" ? "bg-indigo-900 text-indigo-200 font-medium" : "hover:bg-gray-800 hover:text-white"}`}>
              <Download size={18} />
              <span>Report</span>
            </Link>

            <Link href="/admin/analytics" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname === "/admin/analytics" ? "bg-indigo-900 text-indigo-200 font-medium" : "hover:bg-gray-800 hover:text-white"}`}>
              <BarChart3 size={18} />
              <span>Analytics</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="p-6 border-t border-gray-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-800 flex items-center justify-center">
            <span className="text-indigo-200 font-medium">GX</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Gustavo Xavier</p>
            <span className="text-xs text-indigo-400">Admin</span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <Link href="/admin/settings" className="flex items-center gap-3 hover:text-white transition">
            <Settings size={16} />
            Settings
          </Link>
          <button className="flex items-center gap-3 text-red-400 hover:text-red-300 transition" suppressHydrationWarning>
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}