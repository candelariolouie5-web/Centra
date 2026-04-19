"use client";

import React from "react";

/* ================= Sample Patient Data ================= */
const patient = {
  name: "Juan Dela Cruz",
  age: 30,
  gender: "Male",
  id: "C12345",
  doctor: "Dr. John Ong",
};

/* ================= Sample Data ================= */
const medicalHistory = [
  { text: "Allergy to Penicillin", image: "/images/penicillin-allergy.png" },
  { text: "Appendectomy 2018" },
  { text: "Hypertension (2020)" },
];

const prescription = [
  {
    name: "Paracetamol",
    dosage: "500mg",
    frequency: "3x/day",
    duration: "5 days",
  },
  {
    name: "Amoxicillin",
    dosage: "250mg",
    frequency: "2x/day",
    duration: "7 days",
  },
];

const soapNotes = [
  {
    chiefComplaints: "Tonsil",
    remarks: "Patient reports mild dizziness in the mornings",
    notes: "Recommended rest and hydration, monitor blood pressure",
    attachment: "/3d-diagnostics/head_scan.png",
  },
  {
    chiefComplaints: "Lower back pain",
    remarks: "Pain after long hours of sitting",
    notes: "Prescribed stretching exercises and mild analgesics",
    attachment: "/3d-diagnostics/back_scan.png",
  },
];

/* ================= Shared Header ================= */
function PatientHeader() {
  return (
    <header className="mb-8 flex items-start justify-between gap-6 border-b border-slate-200 pb-6 print:mb-6 print:pb-4">
      <div>
        <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-700">
          Centra Clinic PH
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Patient Report
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          1488 A. Apolinario St. corner Calhoun, Makati City
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-600">
        <p className="font-semibold text-slate-900">{patient.name}</p>
        <p>
          Age: {patient.age} | Gender: {patient.gender}
        </p>
        <p>Patient ID: {patient.id}</p>
        <p>Attending Doctor: {patient.doctor}</p>
        <p>Date: {new Date().toLocaleDateString()}</p>
      </div>
    </header>
  );
}

/* ================= Templates ================= */

// Medical History Template
function MedicalHistoryTemplate() {
  return (
    <div className="report-content w-full rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] print:rounded-none print:border-none print:p-0 print:shadow-none">
      <PatientHeader />

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Medical History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Documented health background and relevant findings.
            </p>
          </div>
          <div className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            Record Summary
          </div>
        </div>

        {medicalHistory.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {medicalHistory.map((item, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-800">{item.text}</p>
                {item.image && (
                  <img
                    src={item.image}
                    alt="Medical History"
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-white"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No significant medical history.
          </p>
        )}
      </section>

      <footer className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600 print:mt-8">
        <p>Doctor&apos;s Signature: _______________________________</p>
        <p>Contact: (123) 456-7890 | centra@clinic.com</p>
      </footer>
    </div>
  );
}

// Prescription Template
function PrescriptionTemplate() {
  return (
    <div className="report-content mx-auto w-full max-w-[860px] rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] print:max-w-full print:rounded-none print:border-none print:p-0 print:shadow-none">
      {/* DOCTOR HEADER */}
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-700">
          Prescription Form
        </div>
        <h1 className="text-base font-bold uppercase tracking-wide text-slate-900">
          JOHN EMMANUEL L. ONG, M.D.
        </h1>
        <p className="text-xs text-slate-600">Ears, Nose, Throat</p>
        <p className="text-xs text-slate-600">
          Facial Plastic and Cosmetic Surgery
        </p>
        <p className="text-xs text-slate-600">Centra Clinic - Makati City</p>
        <p className="text-xs text-slate-600">
          Mon-Sat 9am-6pm (By Appointment)
        </p>
      </div>

      <div className="mb-5 h-px bg-slate-200" />

      {/* PATIENT INFO */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
        <div className="flex flex-wrap justify-between gap-3">
          <p>Name: {patient.name}</p>
          <p>Age: {patient.age}</p>
          <p>Sex: {patient.gender}</p>
        </div>
        <div className="mt-2 flex flex-wrap justify-between gap-3">
          <p>Address: __________________________</p>
          <p>Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* RX SECTION */}
      <div className="flex gap-4">
        <div className="text-6xl font-serif leading-none text-cyan-700">℞</div>

        <div className="flex-1 space-y-4 text-sm">
          {prescription.length > 0 ? (
            prescription.map((med, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <p className="font-semibold text-slate-900">
                  {med.name} {med.dosage}
                </p>
                <p className="mt-1 text-slate-600">
                  {med.frequency} for {med.duration}
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-500">No prescriptions</p>
          )}
        </div>
      </div>

      {/* SIGNATURE */}
      <div className="mt-16 text-sm text-slate-700">
        <div className="flex justify-end">
          <div className="text-center">
            <p className="mx-auto w-48 border-t border-slate-800" />
            <p className="mt-1 font-medium">M.D.</p>
          </div>
        </div>

        <div className="mt-4">
          <p>Lic No: ____________________</p>
          <p>PTR No: ____________________</p>
        </div>
      </div>
    </div>
  );
}

// Medical Certificate Template
function MedicalCertificate() {
  return (
    <div className="report-content mx-auto w-full max-w-[860px] rounded-[28px] border border-slate-200 bg-white p-8 text-[13px] leading-relaxed shadow-[0_20px_60px_rgba(15,23,42,0.08)] print:mx-0 print:max-w-full print:rounded-none print:border-none print:p-0 print:shadow-none">
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-500">
            LOGO
          </div>
          <div>
            <p className="font-bold tracking-wide text-slate-900">CENTRA</p>
            <p className="text-[11px] text-slate-600">ENT & Aesthetic Clinic</p>
          </div>
        </div>

        <div className="text-right text-[11px] leading-tight text-slate-600">
          <p className="font-bold text-slate-900">
            JOHN EMMANUEL ONG, MD, FPAAS, FICS, FPFCS
          </p>
          <p>ENT, Facial Plastic & Cosmetic Surgery</p>
          <p>1488 A. Apolinario St., Makati City</p>
          <p>Mon–Sat 9AM–5PM</p>
        </div>
      </div>

      <div className="mb-4 h-px bg-slate-200" />

      {/* DATE */}
      <div className="mb-5">
        <p className="inline-block rounded-lg border border-slate-300 bg-slate-50 px-4 py-1 text-slate-700">
          {new Date().toLocaleDateString()}
        </p>
        <p className="mt-1 text-[10px] text-slate-500">Date</p>
      </div>

      {/* TITLE */}
      <h2 className="mb-6 text-center text-lg font-bold tracking-[0.25em] text-slate-900">
        MEDICAL CERTIFICATE
      </h2>

      {/* BODY */}
      <div className="space-y-4 text-slate-700">
        <p>To whom it may concern:</p>

        <p>
          This is to certify that{" "}
          <span className="border-b border-slate-800 px-8 font-semibold text-slate-900">
            {patient.name}
          </span>
        </p>

        <p>
          Age/Sex{" "}
          <span className="border-b border-slate-800 px-4">
            {patient.age}/{patient.gender}
          </span>{" "}
          of <span className="border-b border-slate-800 px-8">Quezon City</span>{" "}
          was seen and examined on{" "}
          <span className="border-b border-slate-800 px-6">
            {new Date().toLocaleDateString()}
          </span>
        </p>

        <p>
          and was diagnosed to have{" "}
          <span className="border-b border-slate-800 px-20 font-semibold text-slate-900">
            Acute Suppurative Otitis Media (Left Ear)
          </span>
        </p>

        {/* EAR EXAM SECTION */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-xs font-semibold text-slate-800">
            EAR EXAMINATION
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="text-center text-[11px] text-slate-600">
              <p className="mb-1 font-semibold text-slate-900">RIGHT EAR</p>
              <img
                src="/ear-right.jpg"
                alt="Right Ear"
                className="mx-auto h-32 w-32 rounded-lg border border-slate-300 object-cover"
              />
              <p className="mt-2">Intact tympanic membrane</p>
            </div>

            <div className="text-center text-[11px] text-slate-600">
              <p className="mb-1 font-semibold text-slate-900">LEFT EAR</p>
              <img
                src="/ear-left.jpg"
                alt="Left Ear"
                className="mx-auto h-32 w-32 rounded-lg border border-slate-300 object-cover"
              />
              <p className="mt-2">With discharge, possible infection</p>
            </div>
          </div>
        </div>

        <p className="mt-6">
          I therefore recommend{" "}
          <span className="border-b border-slate-800 px-16 font-semibold text-slate-900">
            Antibiotic therapy for 7 days
          </span>
        </p>

        <p className="text-[11px] text-slate-600">
          Patient is advised adequate rest and follow-up if symptoms persist.
        </p>

        <p>
          This certificate is issued upon the request of{" "}
          <span className="border-b border-slate-800 px-10">THE PATIENT</span>
        </p>

        <p>
          for whatever purpose it may serve (excluding legal matters). Thank
          you.
        </p>
      </div>

      {/* SIGNATURE */}
      <div className="mt-12 text-right">
        <p className="inline-block border-b border-slate-800 px-10 font-semibold text-slate-900">
          Dr. John Emmanuel Ong
        </p>
        <p className="text-[11px] text-slate-600">ENT-HNS</p>
        <p className="text-[11px] text-slate-600">PRC 123210</p>
      </div>
    </div>
  );
}

/* ================= Main Report Page ================= */
export default function ReportPage() {
  const [template, setTemplate] = React.useState<
    "medical" | "prescription" | "medcert"
  >("medical");

  const tabs = [
    { key: "medical" as const, label: "Medical History" },
    { key: "prescription" as const, label: "Prescription" },
    { key: "medcert" as const, label: "Medical Certificate" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_22%),linear-gradient(to_bottom,_#f8fafc,_#eef6ff)] print:bg-white">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl print:hidden">
        <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Doctor Report
            </h1>
            <p className="text-sm text-slate-500">
              Generate, review, and print patient medical documents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => {
              const active = template === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setTemplate(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-200"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            <button
              onClick={() => window.print()}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Print
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">
        <div className="rounded-[32px] border border-white/70 bg-white/60 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6 lg:p-8 print:border-none print:bg-white print:p-0 print:shadow-none print:backdrop-blur-none">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <div>
              <p className="text-sm font-medium text-cyan-700">
                Report Preview
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                {template === "medical" && "Medical History Report"}
                {template === "prescription" && "Prescription Report"}
                {template === "medcert" && "Medical Certificate"}
              </h2>
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
              Ready to print
            </div>
          </div>

          <div className="space-y-6">
            {template === "medical" && <MedicalHistoryTemplate />}
            {template === "prescription" && <PrescriptionTemplate />}
            {template === "medcert" && <MedicalCertificate />}
          </div>
        </div>
      </main>
    </div>
  );
}