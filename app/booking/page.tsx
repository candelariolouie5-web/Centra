"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import UserAppointmentCalendar from "@/components/UserAppointmentCalendar";

export default function BookPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/login"); // redirect if not logged in
    }
  }, [session, status, router]);

  if (status === "loading") return <p className="text-white p-4">Checking login...</p>;
  if (!session) return null; // render nothing if not logged in

  return (
    <div className="min-h-screen bg-[#0a0b0f] p-6">
      <UserAppointmentCalendar />
    </div>
  );
}
