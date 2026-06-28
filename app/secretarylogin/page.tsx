import React from "react";
import SecretaryLogin from "../../components/SecretaryLogin";
import DoctorProviders from "../../components/DoctorProviders";

export default function SecretaryLoginPage() {
  return (
    <DoctorProviders>
      <SecretaryLogin />
    </DoctorProviders>
  );
}