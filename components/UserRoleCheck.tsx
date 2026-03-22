"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function UserRoleCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user || session.user.role !== "USER") {
      const role = session?.user?.role;
      if (role === "DOCTOR") {
        router.push("/doctor/dashboard");
      } else if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || !session.user || session.user.role !== "USER") {
    return null;
  }

  return <>{children}</>;
}

