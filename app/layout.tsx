import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import ConditionalNavBar from "@/components/ConditionalNavBar";

export const metadata: Metadata = {
  title: "Centra Clinic",
  description: "Centra Clinic Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ConditionalNavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}