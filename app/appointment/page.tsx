"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import UserAppointmentCalendar from "@/components/UserAppointmentCalendar";

export default function AppointmentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/login"); // redirect if not logged in
    }
  }, [session, status, router]);

  if (status === "loading") return <div className="p-10 text-center text-white">Loading appointment...</div>;
  if (!session) return null; // render nothing if not logged in

  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-900">Loading appointment...</div>}>
      <div className="min-h-screen bg-white p-6">
        <UserAppointmentCalendar />
      </div>
    </Suspense>
  );
}
