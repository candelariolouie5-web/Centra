"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Download,
  Settings,
  LogOut,
  Stethoscope,
  Activity,
  Bell,
  UserCircle,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/doctor/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Patients",
    href: "/doctor/patients",
    icon: Users,
  },
  {
    label: "Appointments",
    href: "/doctor/appointments",
    icon: Calendar,
  },
  {
    label: "Report",
    href: "/doctor/report",
    icon: Download,
  },
];

export default function SidebarDoctors() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/doctorlogin" });
  };

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-white via-teal-50/20 to-cyan-50/30 text-slate-700 flex flex-col justify-between border-r border-slate-200/60 shadow-[4px_0_25px_-5px_rgba(0,0,0,0.05)]">
      {/* TOP */}
      <div>
        {/* LOGO AREA */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5"></div>
          <div className="flex items-center gap-3 p-6 border-b border-slate-200/60 relative">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-200">
                <img
                  src="/centraLogo.jpg"
                  alt="Centra Clinic"
                  className="w-8 h-8 object-contain rounded"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>

            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
                Centra Clinic
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-teal-500" />
                Doctor Panel
              </p>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div className="p-6">
          <div className="mb-4 px-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Main Navigation
            </p>
          </div>
          <nav className="space-y-1 text-sm">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? "bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 font-medium shadow-[0_4px_15px_rgba(6,182,212,0.15)]"
                      : "hover:bg-white/60 hover:text-slate-800 hover:shadow-sm"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-r-full"></div>
                  )}
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-600" 
                      : "group-hover:bg-white/70 text-slate-500"
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Stats */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-teal-50/60 to-cyan-50/60 border border-teal-100/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-semibold text-slate-600">Today's Overview</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2 text-center border border-white/50">
                <p className="text-lg font-bold text-teal-600">12</p>
                <p className="text-[10px] text-slate-500">Patients</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2 text-center border border-white/50">
                <p className="text-lg font-bold text-cyan-600">8</p>
                <p className="text-[10px] text-slate-500">Appointments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="p-6 border-t border-slate-200/60 space-y-4 bg-gradient-to-t from-white/80 via-teal-50/10 to-transparent">
        {/* PROFILE */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-sm">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center border-2 border-teal-200 shadow-md">
              <span className="text-teal-700 font-semibold text-sm">DR</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Dr. Name</p>
            <span className="text-xs text-teal-600 flex items-center gap-1">
              <Stethoscope className="w-3 h-3" />
              Physician
            </span>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-slate-100/60 transition-colors">
            <Bell className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* ACTIONS */}
        <div className="space-y-1 text-sm">
          <Link
            href="/doctor/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-white/60 hover:text-slate-800 transition-all group"
          >
            <div className="p-1 rounded-lg group-hover:bg-slate-100/60 transition-colors">
              <Settings size={16} />
            </div>
            Settings
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50/60 hover:text-red-600 w-full transition-all group"
          >
            <div className="p-1 rounded-lg group-hover:bg-red-100/50 transition-colors">
              <LogOut size={16} />
            </div>
            <span className="font-medium">Log out</span>
          </button>
        </div>

        {/* Version */}
        <div className="pt-2 text-center">
          <p className="text-[10px] text-slate-400">v2.0.1 • HIPAA Compliant</p>
        </div>
      </div>
    </aside>
  );
}