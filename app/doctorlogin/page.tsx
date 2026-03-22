import React from "react";
import DoctorLogin from "@/components/DoctorLogin";
import DoctorProviders from "@/components/DoctorProviders";

export default function DoctorLoginPage() {
  return (
    <DoctorProviders>
      <DoctorLogin />
    </DoctorProviders>
  );
}
