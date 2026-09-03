import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "USER" | "ADMIN" | "DOCTOR" | "SECRETARY"; 
    };
    provider?: string;
    accessToken?: string;
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "USER" | "ADMIN" | "DOCTOR" | "SECRETARY"; 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
    role?: "USER" | "ADMIN" | "DOCTOR" | "SECRETARY"; 
    provider?: string;
    accessToken?: string;
  }
}