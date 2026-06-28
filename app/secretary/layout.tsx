import { ReactNode } from "react";
import SidebarSecretary from "@/components/SidebarSecretary";

export const metadata = {
  title: "Secretary Panel - Centra Clinic",
  description: "Secretary dashboard for appointment management",
};

export default function SecretaryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarSecretary />
      <main className="flex-1 min-h-screen overflow-x-auto">
        {children}
      </main>
    </div>
  );
}