"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

export default function ConditionalNavBar() {
  const pathname = usePathname();

  const isAdminOrDoctor =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/doctor") ||
    pathname === "/doctorlogin" ||
    pathname === "/adminlogin";

  if (isAdminOrDoctor) {
    return null;
  }

  return <NavBar />;
}