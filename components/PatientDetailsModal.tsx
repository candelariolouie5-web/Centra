// components/PatientDetailsModal.tsx

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PatientNotes from "./PatientNotes";

/* ---------------- ICON ---------------- */

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    close: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  return icons[name] || null;
};

/* ---------------- UTILS ---------------- */

const displayValue = (value?: string | number | null) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "Not provided";
  }
  return String(value);
};

const getResolvedPatientId = (patient: any) => {
  const candidates = [
    patient?.patient?.id,
    patient?.patientId,
    patient?.id,
    patient?.user?.id,
    patient?.profile?.id,
    patient?.account?.id,
    patient?.patientUserId,
    patient?.userId,
  ];

  const valid = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0
  );

  return valid || "";
};

/* ---------------- FIELD ---------------- */

const Field = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (label === "Age") {
    console.log("📝 Age Field received value:", value, "type:", typeof value);
  }

  return (
    <div className="rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-900 break-words">
        {displayValue(value)}
      </p>
    </div>
  );
};

/* ---------------- PLACEHOLDER ---------------- */

const Placeholder = ({ text }: { text: string }) => (
  <div className="rounded-xl bg-slate-50/80 px-6 py-10 text-center text-sm font-medium text-slate-600 ring-1 ring-slate-200/60">
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
  <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md">
    {(title || right) && (
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

/* ---------------- VITAL SIGNS ---------------- */

interface VitalRecord {
  id: string;
  height?: string | null;
  weight?: string | null;
  bloodPressure?: string | null;
  temperature?: string | null;
  pulse?: string | null;
  respiratoryRate?: string | null;
  oxygenSaturation?: string | null;
  notes?: string | null;
  updatedAt: string;
  appointment?: {
    id: string;
    fullName: string;
    serviceType: string;
    appointmentDate: string;
    appointmentTime: string;
    secretaryStatus: string;
  };
}

type LatestAppointment = {
  id: string;
  fullName: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  secretaryStatus: string;
  contactNumber?: string;
  age?: number;
} | null;

const VitalSigns = ({ patientId }: { patientId: string }) => {
  const pathname = usePathname();

  const [latestVitals, setLatestVitals] = useState<VitalRecord | null>(null);
  const [latestAppointment, setLatestAppointment] = useState<LatestAppointment>(null);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [savingVitals, setSavingVitals] = useState(false);
  const [vitalsError, setVitalsError] = useState("");
  const [showVitalsForm, setShowVitalsForm] = useState(false);

  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: "",
    pulse: "",
    temperature: "",
    oxygenSaturation: "",
    respiratoryRate: "",
    weight: "",
    height: "",
    notes: "",
  });

  const isDoctorPortal = pathname.startsWith("/doctor");
  const baseApiPath = isDoctorPortal ? "/api/doctor" : "/api/admin";

  const fetchVitals = async () => {
    if (!patientId) {
      setLatestVitals(null);
      setLatestAppointment(null);
      return;
    }

    setLoadingVitals(true);
    setVitalsError("");

    try {
      const response = await fetch(`${baseApiPath}/patients/${patientId}/vitals`, {
        cache: "no-store",
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setLatestVitals(null);
        setLatestAppointment(null);
        setVitalsError(data?.error || "Failed to fetch vitals");
        return;
      }

      const vitals = Array.isArray(data?.vitals) ? data.vitals : [];
      const latest = vitals.length > 0 ? vitals[0] : null;

      setLatestVitals(latest);
      setLatestAppointment(data?.latestAppointment || latest?.appointment || null);

      if (latest) {
        setVitalsForm({
          bloodPressure: latest.bloodPressure || "",
          pulse: latest.pulse || "",
          temperature: latest.temperature || "",
          oxygenSaturation: latest.oxygenSaturation || "",
          respiratoryRate: latest.respiratoryRate || "",
          weight: latest.weight || "",
          height: latest.height || "",
          notes: latest.notes || "",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch patient vitals:", error);
      setLatestVitals(null);
      setLatestAppointment(null);
      setVitalsError(error?.message || "Failed to fetch vitals");
    } finally {
      setLoadingVitals(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, [patientId, pathname]);

  const saveVitals = async () => {
    if (!patientId) {
      setVitalsError("Patient ID is missing.");
      return;
    }

    const appointmentId = latestVitals?.appointment?.id || latestAppointment?.id || "";

    setSavingVitals(true);
    setVitalsError("");

    try {
      const response = await fetch(`${baseApiPath}/patients/${patientId}/vitals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          ...vitalsForm,
        }),
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setVitalsError(data?.error || "Failed to save vitals");
        return;
      }

      setShowVitalsForm(false);
      await fetchVitals();
    } catch (error: any) {
      console.error("Failed to save patient vitals:", error);
      setVitalsError(error?.message || "Failed to save vitals");
    } finally {
      setSavingVitals(false);
    }
  };

  const vitals = [
    { key: "bloodPressure", label: "Blood Pressure", value: latestVitals?.bloodPressure, unit: "mmHg" },
    { key: "pulse", label: "Heart Rate", value: latestVitals?.pulse, unit: "bpm" },
    { key: "temperature", label: "Temperature", value: latestVitals?.temperature, unit: "°C" },
    { key: "oxygenSaturation", label: "SpO₂", value: latestVitals?.oxygenSaturation, unit: "%" },
    { key: "respiratoryRate", label: "Respiratory", value: latestVitals?.respiratoryRate, unit: "/min" },
    { key: "weight", label: "Weight", value: latestVitals?.weight, unit: "kg" },
    { key: "height", label: "Height", value: latestVitals?.height, unit: "cm" },
  ];

  return (
    <SectionCard
      title="Vital Signs"
      subtitle="Latest captured measurements for this patient."
      right={
        <button
          onClick={() => setShowVitalsForm((prev) => !prev)}
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 hover:shadow-md"
        >
          {showVitalsForm ? "Cancel" : latestVitals ? "Edit Vitals" : "Record Vitals"}
        </button>
      }
    >
      {loadingVitals ? (
        <Placeholder text="Loading latest vital signs..." />
      ) : (
        <>
          {vitalsError && (
            <div className="mb-4 rounded-xl bg-red-50 px-5 py-4 text-sm font-medium text-red-600 ring-1 ring-red-200/70">
              {vitalsError}
            </div>
          )}

          {!latestVitals && !showVitalsForm && (
            <Placeholder text="No vitals recorded yet. Click Record Vitals to add measurements." />
          )}

          {latestVitals && !showVitalsForm && (
            <>
              {latestVitals.appointment && (
                <div className="mb-4 rounded-xl bg-teal-50/80 px-4 py-3 text-sm font-medium text-teal-700 ring-1 ring-teal-200/70">
                  From {latestVitals.appointment.serviceType} on{" "}
                  {new Date(latestVitals.appointment.appointmentDate).toLocaleDateString()} at{" "}
                  {latestVitals.appointment.appointmentTime}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {vitals.map((vital) => (
                  <div
                    key={vital.key}
                    className="rounded-xl bg-slate-50/80 px-5 py-4 ring-1 ring-slate-200/60 transition hover:bg-slate-50"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {vital.label}
                    </p>
                    <div className="mt-1 flex items-end gap-2">
                      <p className="text-2xl font-bold tracking-tight text-slate-900">
                        {vital.value || "—"}
                      </p>
                      <span className="pb-0.5 text-xs font-medium text-slate-500">
                        {vital.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {latestVitals.notes && (
                <div className="mt-4 rounded-xl bg-slate-50/80 px-5 py-4 ring-1 ring-slate-200/60">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Notes
                  </p>
                  <p className="mt-1 text-sm font-medium leading-6 text-slate-800">
                    {latestVitals.notes}
                  </p>
                </div>
              )}
            </>
          )}

          {showVitalsForm && (
            <div className="space-y-5">
              {latestAppointment ? (
                <div className="rounded-xl bg-blue-50/80 px-4 py-3 text-sm font-medium text-blue-700 ring-1 ring-blue-200/70">
                  Saving vitals under: {latestAppointment.serviceType} on{" "}
                  {new Date(latestAppointment.appointmentDate).toLocaleDateString()} at{" "}
                  {latestAppointment.appointmentTime}
                </div>
              ) : (
                <div className="rounded-xl bg-blue-50/80 px-4 py-3 text-sm font-medium text-blue-700 ring-1 ring-blue-200/70">
                  No linked appointment found. A vitals record appointment will be created automatically.
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <VitalsInput
                  label="Blood Pressure"
                  value={vitalsForm.bloodPressure}
                  placeholder="120/80"
                  onChange={(value) =>
                    setVitalsForm((prev) => ({ ...prev, bloodPressure: value }))
                  }
                />
                <VitalsInput
                  label="Heart Rate"
                  value={vitalsForm.pulse}
                  placeholder="72"
                  onChange={(value) =>
                    setVitalsForm((prev) => ({ ...prev, pulse: value }))
                  }
                />
                <VitalsInput
                  label="Temperature"
                  value={vitalsForm.temperature}
                  placeholder="36.8"
                  onChange={(value) =>
                    setVitalsForm((prev) => ({ ...prev, temperature: value }))
                  }
                />
                <VitalsInput
                  label="SpO₂"
                  value={vitalsForm.oxygenSaturation}
                  placeholder="98"
                  onChange={(value) =>
                    setVitalsForm((prev) => ({ ...prev, oxygenSaturation: value }))
                  }
                />
                <VitalsInput
                  label="Respiratory"
                  value={vitalsForm.respiratoryRate}
                  placeholder="16"
                  onChange={(value) =>
                    setVitalsForm((prev) => ({ ...prev, respiratoryRate: value }))
                  }
                />
                <VitalsInput
                  label="Weight"
                  value={vitalsForm.weight}
                  placeholder="68"
                  onChange={(value) =>
                    setVitalsForm((prev) => ({ ...prev, weight: value }))
                  }
                />
                <VitalsInput
                  label="Height"
                  value={vitalsForm.height}
                  placeholder="170"
                  onChange={(value) =>
                    setVitalsForm((prev) => ({ ...prev, height: value }))
                  }
                />
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">
                  Notes
                </span>
                <textarea
                  value={vitalsForm.notes}
                  onChange={(event) =>
                    setVitalsForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100/50"
                  placeholder="Optional notes"
                />
              </label>

              <button
                onClick={saveVitals}
                disabled={savingVitals}
                className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingVitals ? "Saving..." : "Save Vitals"}
              </button>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
};

const VitalsInput = ({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100/50"
    />
  </label>
);

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
  const pathname = usePathname();
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([]);
  const [loadingMedicalHistory, setLoadingMedicalHistory] = useState(false);
  const [medicalHistoryError, setMedicalHistoryError] = useState("");
  
  const [appointmentInfo, setAppointmentInfo] = useState<{
    phone: string | null;
    age: number | null;
    name: string | null;
  }>({
    phone: null,
    age: null,
    name: null,
  });
  const [loadingAppointmentInfo, setLoadingAppointmentInfo] = useState(false);

  const resolvedPatientId = getResolvedPatientId(patient);

  useEffect(() => {
    if (patient && open) {
      console.log("🔍 === PATIENT DATA IN MODAL ===");
      console.log("Full patient object:", patient);
      console.log("Patient age:", patient.age);
      console.log("Patient phone:", patient.phone);
      console.log("Patient name:", patient.name);
      console.log("All keys in patient:", Object.keys(patient));
      
      if (patient.age === undefined || patient.age === null) {
        console.warn("⚠️ Patient age is missing or null!");
      } else {
        console.log("✅ Patient age is:", patient.age);
      }
    }
  }, [patient, open]);

  const fetchLatestAppointmentInfo = async () => {
    if (!resolvedPatientId || !open) {
      setAppointmentInfo({ phone: null, age: null, name: null });
      return;
    }

    setLoadingAppointmentInfo(true);
    try {
      const isAdminPortal = pathname.startsWith("/admin");
      const isDoctorPortal = pathname.startsWith("/doctor");
      
      if (!isAdminPortal && !isDoctorPortal) {
        setAppointmentInfo({ phone: null, age: null, name: null });
        return;
      }

      const basePath = isAdminPortal ? "/api/admin" : "/api/doctor";
      
      const response = await fetch(`${basePath}/patients/${resolvedPatientId}/latest-appointment`, {
        cache: "no-store",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.appointment) {
          const appointmentData: any = {
            phone: data.appointment.contactNumber || null,
            age: data.appointment.age || null,
            name: data.appointment.fullName || null,
          };
          setAppointmentInfo(appointmentData);
          console.log("📋 Found appointment data:", appointmentData);
          return;
        }
      }
      
      setAppointmentInfo({ phone: null, age: null, name: null });
      
    } catch (error) {
      console.error("Failed to fetch latest appointment info:", error);
      setAppointmentInfo({ phone: null, age: null, name: null });
    } finally {
      setLoadingAppointmentInfo(false);
    }
  };

  useEffect(() => {
    if (open && resolvedPatientId) {
      fetchLatestAppointmentInfo();
    }
  }, [open, resolvedPatientId, pathname]);

  useEffect(() => {
    if (tab === "medical" && resolvedPatientId) {
      fetchMedicalHistories();
    }
  }, [tab, resolvedPatientId, pathname, onRefreshMedicalHistory]);

  const fetchMedicalHistories = async () => {
    if (!resolvedPatientId) {
      setMedicalHistories([]);
      setMedicalHistoryError("Missing patient user ID");
      return;
    }

    setLoadingMedicalHistory(true);
    setMedicalHistoryError("");

    try {
      const isAdminPortal = pathname.startsWith("/admin");
      const isDoctorPortal = pathname.startsWith("/doctor");

      if (!isAdminPortal && !isDoctorPortal) {
        setMedicalHistories([]);
        setMedicalHistoryError("Unknown portal path");
        return;
      }

      const apiPath = isAdminPortal
        ? `/api/admin/patients/${resolvedPatientId}/medical-history`
        : `/api/doctor/patients/${resolvedPatientId}/medical-history`;

      const response = await fetch(apiPath, { cache: "no-store" });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        console.error("Failed to fetch medical histories:", {
          status: response.status,
          patient,
          resolvedPatientId,
          apiPath,
          data,
        });

        setMedicalHistories([]);
        setMedicalHistoryError(
          data?.error || `Failed to fetch medical histories (HTTP ${response.status})`
        );
        return;
      }

      setMedicalHistories(Array.isArray(data?.medicalHistories) ? data.medicalHistories : []);
    } catch (err: any) {
      console.error("Failed to fetch medical histories:", err);
      setMedicalHistories([]);
      setMedicalHistoryError(err?.message || "Failed to fetch medical histories");
    } finally {
      setLoadingMedicalHistory(false);
    }
  };

  if (!open || !patient) return null;

  const displayPhone = patient?.phone || appointmentInfo.phone || null;

  const tabs = [
    { id: "info", label: "Patient Information" },
    { id: "notes", label: "Notes" },
    { id: "treatment", label: "Next Treatment" },
    { id: "medical", label: "Medical History" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-slate-50/90 shadow-2xl ring-1 ring-slate-200/80">
        {/* Header */}
        <div className="border-b border-slate-200/80 bg-white/80 px-7 py-5 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-xl font-bold text-white shadow-md">
                {patient.name?.charAt(0) || "P"}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900">
                  {patient.name || "Patient Details"}
                </h2>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {displayValue(patient.email)}
                </p>
                {loadingAppointmentInfo && (
                  <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                    Loading appointment data...
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {tabs.map((t) => {
              const active = tab === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {tab === "info" && (
            <div className="space-y-6">
              <VitalSigns patientId={resolvedPatientId} />

              <SectionCard
                title="Patient Information"
                subtitle="Basic profile and contact details."
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Full Name" value={patient.name} />
                  <Field label="Age" value={patient.age} />
                  <Field label="Gender" value={patient.gender} />
                  <Field label="Mobile Number" value={displayPhone} />
                  <Field label="Address" value={patient.address} />
                  <Field label="Email Address" value={patient.email} />
                </div>
                
                {!displayPhone && !loadingAppointmentInfo && (
                  <div className="mt-4 rounded-xl bg-blue-50/80 px-4 py-3 text-sm font-medium text-blue-700 ring-1 ring-blue-200/70">
                    ℹ️ No phone number found. Patient needs to update their contact information.
                  </div>
                )}
                {loadingAppointmentInfo && (
                  <div className="mt-4 rounded-xl bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-500 ring-1 ring-slate-200/60">
                    🔄 Checking for appointment data...
                  </div>
                )}
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
              {!patient?.soapNote?.plan && !patient?.soapNote?.followUp ? (
                <Placeholder text="No next treatment details available" />
              ) : (
                <div className="divide-y divide-slate-200/70 rounded-xl bg-slate-50/80 ring-1 ring-slate-200/60">
                  {patient?.soapNote?.plan && (
                    <div className="grid grid-cols-3 gap-4 px-5 py-4">
                      <dt className="text-sm font-semibold text-slate-500">Plan</dt>
                      <dd className="col-span-2 text-sm font-medium text-slate-800">
                        {patient.soapNote.plan || "—"}
                      </dd>
                    </div>
                  )}
                  {patient?.soapNote?.followUp && (
                    <div className="grid grid-cols-3 gap-4 px-5 py-4">
                      <dt className="text-sm font-semibold text-slate-500">Follow-up</dt>
                      <dd className="col-span-2 text-sm font-medium text-slate-800">
                        {patient.soapNote.followUp || "—"}
                      </dd>
                    </div>
                  )}
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
                  className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 hover:shadow-md"
                >
                  + Create Medical History
                </button>
              }
            >
              {loadingMedicalHistory ? (
                <Placeholder text="Loading medical histories..." />
              ) : medicalHistoryError ? (
                <div className="rounded-xl bg-red-50 px-5 py-10 text-center text-sm font-medium text-red-600 ring-1 ring-red-200/70">
                  {medicalHistoryError}
                </div>
              ) : medicalHistories.length === 0 ? (
                <Placeholder text="No medical history records found" />
              ) : (
                <div className="space-y-5">
                  {medicalHistories.map((record) => (
                    <div
                      key={record.id}
                      className="overflow-hidden rounded-xl bg-slate-50/80 p-5 ring-1 ring-slate-200/60 transition hover:shadow-sm"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-slate-900">
                            {displayValue(record.type)}
                          </h4>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-500">
                            <span>
                              Result Date:{" "}
                              <span className="font-semibold text-slate-700">
                                {new Date(record.resultDate + "T12:00:00").toLocaleDateString()}
                              </span>
                            </span>

                            {record.lab && (
                              <span>
                                Lab:{" "}
                                <span className="font-semibold text-slate-700">{record.lab}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200/70">
                          Added {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-white px-4 py-4 ring-1 ring-slate-200/60">
                        <p className="text-sm leading-6 text-slate-800">
                          {displayValue(record.remarks)}
                        </p>
                      </div>

                      {record.photos && record.photos.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-3 text-sm font-semibold text-slate-700">
                            Attached Photos
                          </p>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {record.photos.map((photo, index) => (
                              <div
                                key={index}
                                className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/60 transition hover:ring-slate-300"
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