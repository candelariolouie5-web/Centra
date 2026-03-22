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
    <div className="report-content bg-white w-full rounded-lg shadow-lg p-8 print:shadow-none print:max-w-full print:p-6">
      <PatientHeader />
      <hr className="border-gray-300 mb-6" />
      <section>
        <h2 className="font-semibold text-xl mb-3 border-b border-gray-300 pb-1">
          Prescription
        </h2>
        {prescription.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">Medicine</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Dosage</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Frequency</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              {prescription.map((med, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2">{med.name}</td>
                  <td className="border border-gray-300 px-3 py-2">{med.dosage}</td>
                  <td className="border border-gray-300 px-3 py-2">{med.frequency}</td>
                  <td className="border border-gray-300 px-3 py-2">{med.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm">No prescriptions for this visit.</p>
        )}
      </section>
      <footer className="mt-8 text-sm text-gray-600 print:mt-12">
        <p>Doctor's Signature: _______________________________</p>
        <p>Contact: (123) 456-7890 | centra@clinic.com</p>
      </footer>
    </div>
  );
}

// SOAP Notes Template
function SoapNotesTemplate() {
  return (
    <div className="report-content bg-white w-full rounded-lg shadow-lg p-8 print:shadow-none print:max-w-full print:p-6">
      <PatientHeader />
      <hr className="border-gray-300 mb-6" />
      <section>
        <h2 className="font-semibold text-xl mb-3 border-b border-gray-300 pb-1">
          SOAP Notes
        </h2>
        {soapNotes.length > 0 ? (
          <div className="space-y-4">
            {soapNotes.map((note, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-200 rounded p-3 shadow-sm text-sm"
              >
                <p>
                  <strong>Chief Complaints:</strong> {note.chiefComplaints}
                </p>
                <p>
                  <strong>Remarks:</strong> {note.remarks}
                </p>
                <p>
                  <strong>Notes:</strong> {note.notes}
                </p>
                {note.attachment && (
                  <img
                    src={note.attachment}
                    alt="Attachment"
                    className="mt-2 w-full h-auto rounded"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm">No SOAP notes recorded.</p>
        )}
      </section>
      <footer className="mt-8 text-sm text-gray-600 print:mt-12">
        <p>Doctor's Signature: _______________________________</p>
        <p>Contact: (123) 456-7890 | centra@clinic.com</p>
      </footer>
    </div>
  );
}

/* ================= Main Report Page ================= */
export default function ReportPage() {
  const [template, setTemplate] = React.useState<"medical" | "prescription" | "soap">("medical");

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
          onClick={() => setTemplate("soap")}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          SOAP Notes
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
        {template === "soap" && <SoapNotesTemplate />}
      </div>
    </div>
  );
}