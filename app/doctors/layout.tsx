import React from "react";
import type { Metadata } from "next";
import { Geist, Montserrat } from "next/font/google";
import "@/app/globals.css";
import DoctorRoleCheck from "@/components/DoctorRoleCheck";
import SidebarDoctors from "@/components/SidebarDoctors";
import DoctorProviders from "@/components/DoctorProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Montserrat({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doctor Panel - Centra Clinic",
  description: "Doctor dashboard for Centra Clinic",
};

type DoctorLayoutProps = React.PropsWithChildren<{}>;

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  return (
<DoctorProviders>
      <DoctorRoleCheck>
        <div className="flex min-h-screen bg-slate-50">
          <SidebarDoctors />
          <main className="flex-1 min-h-screen overflow-x-hidden">
            {children}
          </main>
        </div>
      </DoctorRoleCheck>
</DoctorProviders>
  );
}
