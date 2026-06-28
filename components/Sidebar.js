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
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Auto-open dropdown if any subpage is active
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
    <aside className="w-64 min-h-screen bg-white text-gray-600 flex flex-col justify-between border-r border-gray-200 shadow-sm">
      {/* TOP */}
      <div>
        {/* LOGO AREA */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <img
            src="/centraLogo.jpg"
            alt="Centra Clinic"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-sm font-semibold text-gray-800">
              Centra Clinic
            </h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>

        {/* MENU */}
        <div className="p-6">
          <nav className="space-y-2 text-sm">
            {/* Dashboard */}
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                pathname === "/admin/dashboard"
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            {/* User Management Dropdown */}
            <div>
              <button
                onClick={toggleUserMenu}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition ${
                  isUserMenuOpen
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users size={18} />
                  <span>User Management</span>
                </div>
                {isUserMenuOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {isUserMenuOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  <Link
                    href="/admin/patients"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      pathname === "/admin/patients"
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "hover:bg-gray-100 hover:text-gray-800"
                    }`}
                  >
                    <User size={16} />
                    <span>Patient</span>
                  </Link>
                  <Link
                    href="/admin/doctors"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      pathname === "/admin/doctors"
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "hover:bg-gray-100 hover:text-gray-800"
                    }`}
                  >
                    <Stethoscope size={16} />
                    <span>Doctors</span>
                  </Link>
                  <Link
                    href="/admin/secretaries"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      pathname === "/admin/secretaries"
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "hover:bg-gray-100 hover:text-gray-800"
                    }`}
                  >
                    <ClipboardList size={16} />
                    <span>Secretary</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Appointment */}
            <Link
              href="/admin/appointments"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                pathname === "/admin/appointments"
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <Calendar size={18} />
              <span>Appointment</span>
            </Link>

            {/* Report */}
            <Link
              href="/admin/report"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                pathname === "/admin/report"
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <Download size={18} />
              <span>Report</span>
            </Link>

            {/* Analytics */}
            <Link
              href="/admin/analytics"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                pathname === "/admin/analytics"
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="p-6 border-t border-gray-200 space-y-4">
        {/* PROFILE */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-medium">GX</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Gustavo Xavier</p>
            <span className="text-xs text-indigo-600">Admin</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="space-y-2 text-sm">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 hover:text-gray-800"
          >
            <Settings size={16} />
            Settings
          </Link>

          <button
            className="flex items-center gap-3 text-red-600 hover:text-red-700"
            suppressHydrationWarning
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}