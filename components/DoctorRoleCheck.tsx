"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DoctorRoleCheck({ children }: { children: React.ReactNode }) {
const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user || session.user.role !== "DOCTOR") {
      router.push("/doctorlogin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || !session.user || session.user.role !== "DOCTOR") {
    return null;
  }

  return <>{children}</>;
}
