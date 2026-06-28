"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

export default function ConditionalNavBar() {
  const pathname = usePathname();

  const hideNavBar =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/doctor") ||
    pathname.startsWith("/secretary") || // hide on secretary pages
    pathname === "/doctorlogin" ||
    pathname === "/adminlogin";

  if (hideNavBar) {
    return null;
  }

  return <NavBar />;
}