"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ReportTemplate = "medical" | "prescription" | "medcert";

type Patient = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  age: number | null;
  gender: string | null;
  address: string | null;
  createdAt: string;
};

type PatientListItem = {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
  createdAt: string;
};

type Prescription = {
  id?: string;
  generic?: string | null;
  brandName?: string | null;
  name?: string | null;
  quantity?: string | null;
  dosage?: string | null;
  dose?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instructions?: string | null;
};

type SoapNote = {
  id: string;
  chiefComplaint: string | null;
  historyOfIllness: string | null;
  remarks: string | null;
  diagnosis: string | null;
  plan: string | null;
  followUp: string | null;
  imageData: string | null;
  diagnosticImages: string[];
  createdAt: string;
  updatedAt: string;
};

type MedicalHistory = {
  id: string;
  type: string;
  resultDate: string;
  lab: string | null;
  remarks: string;
  photos: string[];
  createdAt: string;
};

type ReportData = {
  patient: Patient;
  latestSoapNote: SoapNote | null;
  prescriptions: Prescription[];
  medicalHistories: MedicalHistory[];
};

function formatDate(value?: string | Date | null) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function cleanText(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "N/A";
  return String(value);
}

function getPrescriptionName(rx: Prescription) {
  const generic = rx.generic || rx.name || "";
  const brandName = rx.brandName || "";

  if (generic && brandName) return `${generic} (${brandName})`;
  return generic || brandName || "Medication";
}

function getPrescriptionMeta(rx: Prescription) {
  return [rx.quantity, rx.dosage || rx.dose, rx.frequency, rx.duration]
    .filter(Boolean)
    .join(" · ");
}

function getDiagnosticImages(note: SoapNote | null) {
  if (!note) return [];

  if (Array.isArray(note.diagnosticImages) && note.diagnosticImages.length > 0) {
    return note.diagnosticImages.filter(Boolean);
  }

  return note.imageData ? [note.imageData] : [];
}

function PatientHeader({
  patient,
  title,
}: {
  patient: Patient;
  title: string;
}) {
  return (
    <header className="mb-8 flex items-start justify-between gap-6 border-b border-slate-200 pb-6 print:mb-6 print:pb-4">
      <div>
        <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-700">
          Centra Clinic PH
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 print:text-2xl">
          {title}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          1488 A. Apolinario St. corner Calhoun, Makati City
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-600">
        <p className="font-semibold text-slate-900">{patient.name}</p>
        <p>
          Age: {cleanText(patient.age)} | Gender: {cleanText(patient.gender)}
        </p>
        <p>Patient ID: {patient.id.slice(0, 8)}</p>
        <p>Date: {formatDate(new Date())}</p>
      </div>
    </header>
  );
}

function MedicalHistoryTemplate({
  patient,
  medicalHistories,
}: {
  patient: Patient;
  medicalHistories: MedicalHistory[];
}) {
  return (
    <div className="report-content w-full rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] print:rounded-none print:border-none print:p-0 print:shadow-none">
      <PatientHeader patient={patient} title="Medical History Report" />

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Medical History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Saved laboratory results, findings, remarks, and attachments.
            </p>
          </div>

          <div className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
            {medicalHistories.length} record
            {medicalHistories.length === 1 ? "" : "s"}
          </div>
        </div>

        {medicalHistories.length > 0 ? (
          <div className="space-y-4">
            {medicalHistories.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
              >
                <div className="mb-3 grid gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Type
                    </p>
                    <p className="font-semibold text-slate-800">{item.type}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Result Date
                    </p>
                    <p className="font-semibold text-slate-800">
                      {formatDate(item.resultDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Laboratory
                    </p>
                    <p className="font-semibold text-slate-800">
                      {cleanText(item.lab)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Remarks
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                    {item.remarks}
                  </p>
                </div>

                {Array.isArray(item.photos) && item.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {item.photos.map((photo, index) => (
                      <img
                        key={`${item.id}-${index}`}
                        src={photo}
                        alt={`Medical history attachment ${index + 1}`}
                        className="max-h-[420px] w-full rounded-xl border border-slate-200 bg-white object-contain"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            No medical history records saved yet.
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

function PrescriptionTemplate({
  patient,
  prescriptions,
  soapNote,
}: {
  patient: Patient;
  prescriptions: Prescription[];
  soapNote: SoapNote | null;
}) {
  return (
    <div className="report-content mx-auto w-full max-w-[860px] rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] print:max-w-full print:rounded-none print:border-none print:p-0 print:shadow-none">
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
          Mon-Sat 9am-6pm By Appointment
        </p>
      </div>

      <div className="mb-5 h-px bg-slate-200" />

      <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
        <div className="flex flex-wrap justify-between gap-3">
          <p>Name: {patient.name}</p>
          <p>Age: {cleanText(patient.age)}</p>
          <p>Sex: {cleanText(patient.gender)}</p>
        </div>

        <div className="mt-2 flex flex-wrap justify-between gap-3">
          <p>Address: {cleanText(patient.address)}</p>
          <p>Date: {formatDate(new Date())}</p>
        </div>

        {soapNote?.diagnosis && (
          <p className="mt-2">Diagnosis: {soapNote.diagnosis}</p>
        )}
      </div>

      <div className="flex gap-4">
        <div className="text-6xl font-serif leading-none text-cyan-700">℞</div>

        <div className="flex-1 space-y-4 text-sm">
          {prescriptions.length > 0 ? (
            prescriptions.map((rx, idx) => (
              <div
                key={rx.id || idx}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <p className="font-semibold text-slate-900">
                  {getPrescriptionName(rx)}
                </p>

                {getPrescriptionMeta(rx) && (
                  <p className="mt-1 text-slate-600">
                    {getPrescriptionMeta(rx)}
                  </p>
                )}

                {rx.instructions && (
                  <p className="mt-1 whitespace-pre-wrap text-slate-600">
                    {rx.instructions}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-slate-500">No prescriptions saved yet.</p>
          )}
        </div>
      </div>

      <div className="mt-16 text-sm text-slate-700">
        <div className="flex justify-end">
          <div className="text-center">
            <p className="mx-auto w-56 border-t border-slate-800" />
            <p className="mt-1 font-medium">John Emmanuel L. Ong, M.D.</p>
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

function MedicalCertificate({
  patient,
  soapNote,
}: {
  patient: Patient;
  soapNote: SoapNote | null;
}) {
  const diagnosticImages = getDiagnosticImages(soapNote);

  return (
    <div className="report-content mx-auto w-full max-w-[860px] rounded-[28px] border border-slate-200 bg-white p-8 text-[13px] leading-relaxed shadow-[0_20px_60px_rgba(15,23,42,0.08)] print:mx-0 print:max-w-full print:rounded-none print:border-none print:p-0 print:shadow-none">
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
          <p>Mon-Sat 9AM-5PM</p>
        </div>
      </div>

      <div className="mb-4 h-px bg-slate-200" />

      <div className="mb-5">
        <p className="inline-block rounded-lg border border-slate-300 bg-slate-50 px-4 py-1 text-slate-700">
          {formatDate(new Date())}
        </p>
        <p className="mt-1 text-[10px] text-slate-500">Date</p>
      </div>

      <h2 className="mb-6 text-center text-lg font-bold tracking-[0.24em] text-slate-900">
        MEDICAL CERTIFICATE
      </h2>

      <div className="space-y-4 text-slate-700">
        <p>To whom it may concern:</p>

        <p>
          This is to certify that{" "}
          <span className="border-b border-slate-800 px-4 font-semibold text-slate-900">
            {patient.name}
          </span>
          , {cleanText(patient.age)} years old, {cleanText(patient.gender)}, was
          seen and evaluated at Centra Clinic PH.
        </p>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-900">Clinical Information</p>

          <div className="mt-3 space-y-2">
            <p>
              <span className="font-semibold">Chief Complaint:</span>{" "}
              {cleanText(soapNote?.chiefComplaint)}
            </p>

            <p>
              <span className="font-semibold">History of Illness:</span>{" "}
              {cleanText(soapNote?.historyOfIllness)}
            </p>

            <p>
              <span className="font-semibold">Diagnosis / Impression:</span>{" "}
              {cleanText(soapNote?.diagnosis)}
            </p>

            <p>
              <span className="font-semibold">Remarks:</span>{" "}
              {cleanText(soapNote?.remarks)}
            </p>
          </div>
        </div>

        {diagnosticImages.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 font-semibold text-slate-900">
              Diagnostic Attachment
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {diagnosticImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Diagnostic ${index + 1}`}
                  className="max-h-[320px] w-full rounded-xl border border-slate-200 bg-white object-contain"
                />
              ))}
            </div>
          </div>
        )}

        <p>
          Recommendation:{" "}
          <span className="border-b border-slate-800 px-4 font-semibold text-slate-900">
            {soapNote?.plan || soapNote?.followUp || "As clinically advised"}
          </span>
        </p>

        <p>
          This certificate is issued upon the request of the patient for whatever
          purpose it may serve, excluding legal matters.
        </p>
      </div>

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

export default function DoctorReportPage() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);

  const [template, setTemplate] = useState<ReportTemplate>("medical");
  const [patientId, setPatientId] = useState("");
  const [data, setData] = useState<ReportData | null>(null);

  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [patientSearch, setPatientSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const tabs = [
    { key: "medical" as const, label: "Medical History" },
    { key: "prescription" as const, label: "Prescription" },
    { key: "medcert" as const, label: "Medical Certificate" },
  ];

  const reportTitle = useMemo(() => {
    if (template === "medical") return "Medical History Report";
    if (template === "prescription") return "Prescription Report";
    return "Medical Certificate";
  }, [template]);

  const filteredPatients = useMemo(() => {
    const q = patientSearch.toLowerCase().trim();

    if (!q) return patients;

    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [patients, patientSearch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("patientId") || "";
    setPatientId(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      try {
        setLoadingPatients(true);

        const res = await fetch("/api/doctor/patients", {
          method: "GET",
          cache: "no-store",
        });

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load patients.");
        }

        if (!cancelled) {
          setPatients(Array.isArray(json?.patients) ? json.patients : []);
        }
      } catch (err) {
        console.error("[DOCTOR_REPORT_PATIENTS_LOAD]", err);
      } finally {
        if (!cancelled) {
          setLoadingPatients(false);
        }
      }
    }

    void loadPatients();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      setData(null);
      setError("");
      return;
    }

    let cancelled = false;

    async function loadReport() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/reports/${patientId}`, {
          method: "GET",
          cache: "no-store",
        });

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load report.");
        }

        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : "Failed to load report.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const selectPatient = (id: string) => {
    setPatientId(id);
    setError("");
    setData(null);
    router.push(`/doctor/report?patientId=${id}`);
  };

  const downloadPDF = async () => {
    if (!reportRef.current || !data?.patient) return;

    try {
      setDownloading(true);

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeName = data.patient.name
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase();

      const fileName =
        template === "prescription"
          ? `${safeName}-prescription.pdf`
          : template === "medical"
            ? `${safeName}-medical-history.pdf`
            : `${safeName}-medical-certificate.pdf`;

      pdf.save(fileName);
    } catch (err) {
      console.error("[PDF_DOWNLOAD]", err);
      alert("Failed to generate PDF. Please try Print > Save as PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_22%),linear-gradient(to_bottom,_#f8fafc,_#eef6ff)] print:bg-white">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl print:hidden">
        <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Doctor Report
            </h1>
            <p className="text-sm text-slate-500">
              Generate, review, print, and download patient medical documents.
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
              disabled={!data}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Print
            </button>

<button
  onClick={downloadPDF}
  disabled={!data}
  className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
>
  Save as PDF
</button>

            <button
              onClick={() => router.push("/doctor/patients")}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">
        {!patientId && (
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur-sm print:hidden">
            <div className="mb-5">
              <p className="text-sm font-medium text-cyan-700">
                Select Patient
              </p>
              <h2 className="text-xl font-bold text-slate-900">
                Choose a patient to generate reports
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search by patient name, email, or ID.
              </p>
            </div>

            <input
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search patient..."
              className="mb-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />

            {loadingPatients ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                Loading patients...
              </p>
            ) : filteredPatients.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPatient(p.id)}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-cyan-200 hover:bg-cyan-50"
                  >
                    <p className="font-semibold text-slate-900">
                      {p.name || "N/A"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {p.email || "No email"}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Patient ID: {p.id.slice(0, 8)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                No patients found.
              </p>
            )}
          </div>
        )}

        {patientId && loading && (
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur-sm print:hidden">
            <p className="text-sm font-semibold text-slate-700">
              Loading report...
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Please wait while we fetch patient records.
            </p>
          </div>
        )}

        {patientId && error && !loading && (
          <div className="rounded-[32px] border border-red-100 bg-white p-8 text-center shadow-sm print:hidden">
            <h2 className="text-lg font-bold text-slate-900">
              Report unavailable
            </h2>
            <p className="mt-2 text-sm text-red-500">{error}</p>

            <button
              onClick={() => {
                setPatientId("");
                setError("");
                router.push("/doctor/report");
              }}
              className="mt-5 rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Select Another Patient
            </button>
          </div>
        )}

        {patientId && data && !loading && !error && (
          <div className="rounded-[32px] border border-white/70 bg-white/60 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6 lg:p-8 print:border-none print:bg-white print:p-0 print:shadow-none print:backdrop-blur-none">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
              <div>
                <p className="text-sm font-medium text-cyan-700">
                  Report Preview
                </p>

                <h2 className="text-lg font-semibold text-slate-900">
                  {reportTitle}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Patient: {data.patient.name}
                </p>
              </div>

              <button
                onClick={() => {
                  setPatientId("");
                  setData(null);
                  router.push("/doctor/report");
                }}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                Change Patient
              </button>
            </div>

            <div ref={reportRef} className="space-y-6 bg-white">
              {template === "medical" && (
                <MedicalHistoryTemplate
                  patient={data.patient}
                  medicalHistories={data.medicalHistories}
                />
              )}

              {template === "prescription" && (
                <PrescriptionTemplate
                  patient={data.patient}
                  prescriptions={data.prescriptions}
                  soapNote={data.latestSoapNote}
                />
              )}

              {template === "medcert" && (
                <MedicalCertificate
                  patient={data.patient}
                  soapNote={data.latestSoapNote}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}x  