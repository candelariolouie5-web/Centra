"use client";

import { useState, useEffect } from "react";
import PatientNotes from "./PatientNotes";

/* ---------------- ICON ---------------- */

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    close: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    medical: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547" />
      </svg>
    ),
  };

  return icons[name] || null;
};

/* ---------------- UTILS ---------------- */

const displayValue = (value?: string | null) => {
  if (!value || String(value).trim() === "") return "Not provided";
  return value;
};

/* ---------------- FIELD ---------------- */

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200">
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
      {label}
    </p>
    <p className="mt-2 text-[15px] font-semibold leading-6 text-slate-950 break-words">
      {displayValue(value)}
    </p>
  </div>
);

/* ---------------- PLACEHOLDER ---------------- */

const Placeholder = ({ text }: { text: string }) => (
  <div className="rounded-2xl bg-white px-6 py-12 text-center text-sm font-medium text-slate-700 ring-1 ring-slate-200">
    {text}
  </div>
);

/* ---------------- SECTION ---------------- */

const SectionCard = ({
  title,
  subtitle,
  right,
  children,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
    {(title || right) && (
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {title && <h3 className="text-lg font-bold text-slate-950">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm font-medium text-slate-700">{subtitle}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

/* ---------------- VITAL SIGNS ---------------- */

const VitalSigns = () => {
  const vitals = [
    { label: "Blood Pressure", value: "120/80", unit: "mmHg" },
    { label: "Heart Rate", value: "72", unit: "bpm" },
    { label: "Temperature", value: "36.8", unit: "°C" },
    { label: "SpO2", value: "98", unit: "%" },
    { label: "Respiratory", value: "16", unit: "/min" },
    { label: "Weight", value: "68", unit: "kg" },
  ];

  return (
    <SectionCard
      title="Vital Signs"
      subtitle="Latest captured measurements for this patient."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {vitals.map((vital) => (
          <div
            key={vital.label}
            className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200/70"
          >
            <p className="text-xs font-semibold text-slate-700">{vital.label}</p>
            <div className="mt-2 flex items-end gap-2">
              <p className="text-2xl font-bold tracking-tight text-slate-950">{vital.value}</p>
              <span className="pb-1 text-xs font-semibold text-slate-700">{vital.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

/* ---------------- TYPES ---------------- */

interface MedicalHistory {
  id: string;
  type: string;
  resultDate: string;
  lab: string | null;
  remarks: string;
  photos: string[];
  createdAt: string;
}

/* ---------------- MODAL ---------------- */

const PatientDetailsModal = ({
  open,
  onClose,
  patient,
  tab,
  setTab,
  onCreateMedicalHistory,
  onRefreshMedicalHistory,
}: any) => {
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([]);
  const [loadingMedicalHistory, setLoadingMedicalHistory] = useState(false);

  useEffect(() => {
    if (tab === "medical" && patient?.id) {
      fetchMedicalHistories();
    }
  }, [tab, patient?.id]);

  useEffect(() => {
    if (tab === "medical" && patient?.id && onRefreshMedicalHistory) {
      fetchMedicalHistories();
    }
  }, [onRefreshMedicalHistory]);

  const fetchMedicalHistories = async () => {
    if (!patient?.id) return;

    setLoadingMedicalHistory(true);

    try {
      const userRole = typeof window !== 'undefined' ? (window as any).session?.user?.role : 'ADMIN';
      const apiPath = userRole === 'ADMIN' ? `/api/admin/patients/${patient.id}/medical-history` : `/api/doctor/patients/${patient.id}/medical-history`;
      const response = await fetch(apiPath);
      const data = await response.json();

      if (response.ok) {
        setMedicalHistories(data.medicalHistories || []);
      }
    } catch (err) {
      console.error("Failed to fetch medical histories:", err);
    } finally {
      setLoadingMedicalHistory(false);
    }
  };

  if (!open || !patient) return null;

  const tabs = [
    { id: "info", label: "Patient Information" },
    { id: "notes", label: "Notes" },
    { id: "treatment", label: "Next Treatment" },
    { id: "medical", label: "Medical History" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-slate-50 shadow-2xl ring-1 ring-slate-200">
        {/* HEADER */}

        <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-lg font-bold text-white shadow-sm">
                {patient.name?.charAt(0) || "P"}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold tracking-tight text-slate-950">
                  {patient.name || "Patient Details"}
                </h2>
                <p className="mt-1 truncate text-sm font-medium text-slate-700">
                  {displayValue(patient.email)}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>

          {/* TABS */}

          <div className="mt-5 flex flex-wrap gap-2">
            {tabs.map((t) => {
              const active = tab === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-7">
          {tab === "info" && (
            <div className="space-y-6">
              <VitalSigns />

              <SectionCard
                title="Patient Information"
                subtitle="Basic profile and contact details."
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Age" value={patient.age} />
                  <Field label="Gender" value={patient.gender} />
                  <Field label="Mobile Number" value={patient.phone} />
                  <Field label="Address" value={patient.address} />
                  <Field label="Email Address" value={patient.email} />
                </div>
              </SectionCard>
            </div>
          )}

          {tab === "notes" && (
            <SectionCard
              title="Patient Notes"
              subtitle="Clinical notes, observations, and attached records."
            >
              <PatientNotes patient={patient} />
            </SectionCard>
          )}

          {tab === "treatment" && (
            <SectionCard
              title="Next Treatment"
              subtitle="Planned treatment and follow-up details."
            >
              {(!patient?.soapNote?.plan && !patient?.soapNote?.followUp) ? (
                <Placeholder text="No next treatment details available" />
              ) : (
                <div className="px-4 sm:px-0">
                  <dl className="divide-y divide-white/10">
                    {patient?.soapNote?.plan && (
                      <div className="grid grid-cols-3 gap-4 py-6 px-4">
                        <dt className="text-sm font-medium text-gray-500">Plan</dt>
                        <dd className="col-span-2 text-sm text-gray-400">
                          {patient.soapNote.plan || "—"}
                        </dd>
                      </div>
                    )}
                    {patient?.soapNote?.followUp && (
                      <div className="grid grid-cols-3 gap-4 py-6 px-4">
                        <dt className="text-sm font-medium text-gray-500">Follow-up</dt>
                        <dd className="col-span-2 text-sm text-gray-400">
                          {patient.soapNote.followUp || "—"}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </SectionCard>
          )}

          {tab === "medical" && (
            <SectionCard
              title="Medical History"
              subtitle="Past records, results, remarks, and uploaded photos."
              right={
                <button
                  onClick={onCreateMedicalHistory}
                  className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  + Create Medical History
                </button>
              }
            >
              {loadingMedicalHistory ? (
                <div className="rounded-2xl bg-slate-50 px-6 py-10 text-center text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                  Loading medical histories...
                </div>
              ) : medicalHistories.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-6 py-10 text-center text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                  No medical history records found
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalHistories.map((record) => (
                    <div
                      key={record.id}
                      className="overflow-hidden rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200/80"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-slate-950">
                            {displayValue(record.type)}
                          </h4>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-800">
                            <span>
                              Result Date:{" "}
                              <span className="font-semibold text-slate-950">
                                {new Date(record.resultDate + "T12:00:00").toLocaleDateString()}
                              </span>
                            </span>

                            {record.lab && (
                              <span>
                                Lab:{" "}
                                <span className="font-semibold text-slate-950">{record.lab}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                          Added {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200/80">
                        <p className="text-sm font-medium leading-6 text-slate-900">
                          {displayValue(record.remarks)}
                        </p>
                      </div>

                      {record.photos && record.photos.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-3 text-sm font-semibold text-slate-900">
                            Attached Photos
                          </p>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {record.photos.map((photo, index) => (
                              <div
                                key={index}
                                className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
                              >
                                <img
                                  src={photo}
                                  alt={`Medical record ${index + 1}`}
                                  className="h-32 w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;
