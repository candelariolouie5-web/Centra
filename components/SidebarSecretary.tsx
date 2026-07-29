"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, LogOut, Stethoscope } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/secretary", icon: LayoutDashboard },
  { name: "Settings", href: "/secretary/settings", icon: Settings },
];

export default function SidebarSecretary() {
  const pathname = usePathname();

  return (
    <aside className="flex w-72 flex-col bg-slate-900 text-white border-r border-slate-700 shadow-xl flex-shrink-0">
      {/* Brand Section */}
      <div className="border-b border-slate-700/60 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 shadow-lg shadow-emerald-900/30">
            <Stethoscope className="text-slate-900" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">ClinicFlow</h1>
            <p className="text-[11px] font-medium text-emerald-300">Secretary Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-600/20 text-emerald-300 shadow-sm shadow-emerald-900/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon
                  size={18}
                  className={isActive ? "text-emerald-400" : "text-slate-400"}
                />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout – at the bottom, before user profile */}
      <div className="border-t border-slate-700/60 px-3 py-3">
        <Link
          href="/api/auth/logout"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={18} className="text-slate-400" />
          <span>Logout</span>
        </Link>
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-slate-700/60 bg-slate-800/50 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-800/80 p-3 shadow-sm ring-1 ring-slate-700">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white shadow-inner">
            SW
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Signed in as
            </p>
            <p className="truncate text-sm font-semibold text-white">Sarah Wilson</p>
            <p className="truncate text-xs text-emerald-300">Secretary · Front Desk</p>
          </div>
        </div>
      </div>
    </aside>
  );
}