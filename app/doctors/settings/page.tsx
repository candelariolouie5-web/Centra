"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DoctorSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/settings");
  }, [router]);

  return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg text-gray-600">Redirecting to settings...</p>
      </div>
    </div>
  );
}
