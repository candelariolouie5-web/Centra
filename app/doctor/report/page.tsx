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
  { name: "Paracetamol", dosage: "500mg", frequency: "3x/day", duration: "5 days" },
  { name: "Amoxicillin", dosage: "250mg", frequency: "2x/day", duration: "7 days" },
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
    <header className="flex justify-between items-center mb-6 print:flex">
      <div>
        <h1 className="text-3xl font-bold tracking-wide">Centra Clinic Ph</h1>
        <p className="text-sm">1488 A. Apolinario St. corner Calhoun, Makati City</p>
      </div>
      <div className="text-right text-sm">
        <p className="font-semibold">{patient.name}</p>
        <p>Age: {patient.age} | Gender: {patient.gender}</p>
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
    <div className="report-content bg-white w-full rounded-lg shadow-lg p-8 print:shadow-none print:max-w-full print:p-6">
      <PatientHeader />
      <hr className="border-gray-300 mb-6" />
      <section>
        <h2 className="font-semibold text-xl mb-3 border-b border-gray-300 pb-1">
          Medical History
        </h2>
        {medicalHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {medicalHistory.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-200 rounded p-3 shadow-sm text-sm"
              >
                <p>{item.text}</p>
                {item.image && (
                  <img
                    src={item.image}
                    alt="Medical History"
                    className="mt-2 w-full h-auto rounded"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm">No significant medical history.</p>
        )}
      </section>
      <footer className="mt-8 text-sm text-gray-600 print:mt-12">
        <p>Doctor's Signature: _______________________________</p>
        <p>Contact: (123) 456-7890 | centra@clinic.com</p>
      </footer>
    </div>
  );
}
 
// Prescription Template
function PrescriptionTemplate() {
  return (
    <div className="report-content bg-white w-full max-w-[800px] mx-auto p-10 print:shadow-none print:max-w-full print:p-6 border border-gray-300">
     
      {/* DOCTOR HEADER */}
      <div className="text-center mb-3">
        <h1 className="text-base font-bold uppercase tracking-wide">
          JOHN EMMANUEL L. ONG, M.D.
        </h1>
        <p className="text-xs">Ears, Nose, Throat</p>
        <p className="text-xs">Facial Plastic and Cosmetic Surgery</p>
        <p className="text-xs">Centra Clinic - Makati City</p>
        <p className="text-xs">Mon-Sat 9am-6pm (By Appointment)</p>
      </div>
 
      <hr className="border-black mb-4" />
 
      {/* PATIENT INFO */}
      <div className="text-sm mb-6 space-y-2">
        <div className="flex justify-between">
          <p>Name: {patient.name}</p>
          <p>Age: {patient.age}</p>
          <p>Sex: {patient.gender}</p>
        </div>
        <div className="flex justify-between">
          <p>Address: __________________________</p>
          <p>Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
 
      {/* RX SECTION */}
      <div className="flex gap-4">
       
        {/* RX SYMBOL (IMPORTANT) */}
        <div className="text-6xl font-serif leading-none">℞</div>
 
        {/* MEDICATION LIST */}
        <div className="flex-1 space-y-4 text-sm">
          {prescription.length > 0 ? (
            prescription.map((med, idx) => (
              <div key={idx}>
                <p className="font-semibold">
                  {med.name} {med.dosage}
                </p>
                <p>
                  {med.frequency} for {med.duration}
                </p>
              </div>
            ))
          ) : (
            <p>No prescriptions</p>
          )}
        </div>
      </div>
 
      {/* SIGNATURE */}
      <div className="mt-16 text-sm">
        <div className="flex justify-end">
          <div className="text-center">
            <p className="border-t border-black w-48 mx-auto"></p>
            <p className="mt-1">M.D.</p>
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
 
// SOAP Notes Template
function MedicalCertificate() {
  return (
    <div className="report-content bg-white w-full max-w-[800px] mx-auto p-10 text-[13px] leading-relaxed shadow-lg print:shadow-none print:max-w-full print:mx-0 font-serif">
     
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
       
        {/* LOGO + CLINIC */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 border rounded-full flex items-center justify-center text-xs">
            LOGO
          </div>
          <div>
            <p className="font-bold text-sm tracking-wide">CENTRA</p>
            <p className="text-[11px]">ENT & Aesthetic Clinic</p>
          </div>
        </div>
 
        {/* DOCTOR INFO */}
        <div className="text-right text-[11px] leading-tight">
          <p className="font-bold">
            JOHN EMMANUEL ONG, MD, FPAAS, FICS, FPFCS
          </p>
          <p>ENT, Facial Plastic & Cosmetic Surgery</p>
          <p>1488 A. Apolinario St., Makati City</p>
          <p>Mon–Sat 9AM–5PM</p>
        </div>
      </div>
 
      <hr className="border-black mb-4" />
 
      {/* DATE */}
      <div className="mb-4">
        <p className="border-b border-black inline-block px-4">
          {new Date().toLocaleDateString()}
        </p>
        <p className="text-[10px]">Date</p>
      </div>
 
      {/* TITLE */}
      <h2 className="text-center font-bold text-lg tracking-widest mb-6">
        MEDICAL CERTIFICATE
      </h2>
 
      {/* BODY */}
      <div className="space-y-4">
        <p>To whom it may concern:</p>
 
        <p>
          This is to certify that{" "}
          <span className="border-b border-black px-8 font-semibold">
            {patient.name}
          </span>
        </p>
 
        <p>
          Age/Sex{" "}
          <span className="border-b border-black px-4">
            {patient.age}/{patient.gender}
          </span>{" "}
          of{" "}
          <span className="border-b border-black px-8">
            Quezon City
          </span>{" "}
          was seen and examined on{" "}
          <span className="border-b border-black px-6">
            {new Date().toLocaleDateString()}
          </span>
        </p>
 
        <p>
          and was diagnosed to have{" "}
          <span className="border-b border-black px-20 font-semibold">
            Acute Suppurative Otitis Media (Left Ear)
          </span>
        </p>
 
        {/* EAR EXAM SECTION (WITH IMAGES) */}
        <div className="mt-6">
          <p className="font-semibold text-xs mb-2 border-t pt-3">
            EAR EXAMINATION
          </p>
 
          <div className="grid grid-cols-2 gap-6">
           
            {/* RIGHT EAR */}
            <div className="text-center text-[11px]">
              <p className="font-semibold mb-1">RIGHT EAR</p>
              <img
                src="/ear-right.jpg"
                alt="Right Ear"
                className="w-32 h-32 object-cover mx-auto border"
              />
              <p className="mt-2">Intact tympanic membrane</p>
            </div>
 
            {/* LEFT EAR */}
            <div className="text-center text-[11px]">
              <p className="font-semibold mb-1">LEFT EAR</p>
              <img
                src="/ear-left.jpg"
                alt="Left Ear"
                className="w-32 h-32 object-cover mx-auto border"
              />
              <p className="mt-2">
                With discharge, possible infection
              </p>
            </div>
          </div>
        </div>
 
        {/* RECOMMENDATION */}
        <p className="mt-6">
          I therefore recommend{" "}
          <span className="border-b border-black px-16 font-semibold">
            Antibiotic therapy for 7 days
          </span>
        </p>
 
        <p className="text-[11px]">
          Patient is advised adequate rest and follow-up if symptoms persist.
        </p>
 
        <p>
          This certificate is issued upon the request of{" "}
          <span className="border-b border-black px-10">
            THE PATIENT
          </span>
        </p>
 
        <p>
          for whatever purpose it may serve (excluding legal matters). Thank you.
        </p>
      </div>
 
      {/* SIGNATURE */}
      <div className="mt-12 text-right">
        <p className="border-b border-black inline-block px-10 font-semibold">
          Dr. John Emmanuel Ong
        </p>
        <p className="text-[11px]">ENT-HNS</p>
        <p className="text-[11px]">PRC 123210</p>
      </div>
    </div>
  );
}
 
/* ================= Main Report Page ================= */
export default function ReportPage() {
  const [template, setTemplate] = React.useState<"medical" | "prescription" | "medcert">("medical");
 
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Buttons to switch template */}
      <div className="mb-4 space-x-2">
        <button
          onClick={() => setTemplate("medical")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Medical History
        </button>
        <button
          onClick={() => setTemplate("prescription")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Prescription
        </button>
        <button
          onClick={() => setTemplate("medcert")}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Medical Certificate
        </button>
        <button
          onClick={() => window.print()}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Print
        </button>
      </div>
 
      {/* Render the selected template */}
      <div className="space-y-6">
        {template === "medical" && <MedicalHistoryTemplate />}
        {template === "prescription" && <PrescriptionTemplate />}
        {template === "medcert" && <MedicalCertificate />}
      </div>
    </div>
  );
}