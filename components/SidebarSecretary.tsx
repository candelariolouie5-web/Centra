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
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 shadow-sm">
      <div className="px-6 pt-7 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
            <Stethoscope className="text-white text-lg" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">ClinicFlow</h1>
            <p className="text-xs text-emerald-600 font-medium">Secretary Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 overflow-y-auto">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border-l-3 border-emerald-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-emerald-600" : "text-gray-500"} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="pt-8 mt-6 border-t border-gray-100">
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50/40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-emerald-700 font-medium">SW</span>
          </div>
          <div>
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-sm font-semibold text-gray-800">Sarah Wilson</p>
            <p className="text-xs text-emerald-600">Secretary · Front Desk</p>
          </div>
        </div>
      </div>
    </aside>
  );
}