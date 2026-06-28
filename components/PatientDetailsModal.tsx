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

const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
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
    { key: "oxygenSaturation", label: "SpO2", value: latestVitals?.oxygenSaturation, unit: "%" },
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
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          {showVitalsForm ? "Cancel" : latestVitals ? "Edit Vitals" : "Record Vitals"}
        </button>
      }
    >
      {loadingVitals ? (
        <Placeholder text="Loading latest vital signs..." />
      ) : (
        <>
          {vitalsError ? (
            <div className="mb-4 rounded-2xl bg-red-50 px-6 py-5 text-center text-sm font-medium text-red-600 ring-1 ring-red-200">
              {vitalsError}
            </div>
          ) : null}

          {!latestVitals && !showVitalsForm ? (
            <Placeholder text="No vitals recorded yet. Click Record Vitals to add measurements." />
          ) : null}

          {latestVitals && !showVitalsForm ? (
            <>
              {latestVitals.appointment ? (
                <div className="mb-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700 ring-1 ring-teal-100">
                  From {latestVitals.appointment.serviceType} on{" "}
                  {new Date(latestVitals.appointment.appointmentDate).toLocaleDateString()} at{" "}
                  {latestVitals.appointment.appointmentTime}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {vitals.map((vital) => (
                  <div
                    key={vital.key}
                    className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200/70"
                  >
                    <p className="text-xs font-semibold text-slate-700">{vital.label}</p>
                    <div className="mt-2 flex items-end gap-2">
                      <p className="text-2xl font-bold tracking-tight text-slate-950">
                        {vital.value || "--"}
                      </p>
                      <span className="pb-1 text-xs font-semibold text-slate-700">
                        {vital.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {latestVitals.notes ? (
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Notes
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-800">
                    {latestVitals.notes}
                  </p>
                </div>
              ) : null}
            </>
          ) : null}

          {showVitalsForm ? (
            <div className="space-y-4">
              {latestAppointment ? (
                <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
                  Saving vitals under: {latestAppointment.serviceType} on{" "}
                  {new Date(latestAppointment.appointmentDate).toLocaleDateString()} at{" "}
                  {latestAppointment.appointmentTime}
                </div>
              ) : (
                <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
                  No linked appointment found. A vitals record appointment will be created automatically.
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                  label="SpO2"
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
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                  placeholder="Optional notes"
                />
              </label>

              <button
                onClick={saveVitals}
                disabled={savingVitals}
                className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingVitals ? "Saving..." : "Save Vitals"}
              </button>
            </div>
          ) : null}
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
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
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
  
  // State for latest appointment phone number
  const [latestAppointmentPhone, setLatestAppointmentPhone] = useState<string | null>(null);
  const [loadingPhone, setLoadingPhone] = useState(false);

  const resolvedPatientId = getResolvedPatientId(patient);

  // Fetch the latest appointment phone number directly
  const fetchLatestAppointmentPhone = async () => {
    if (!resolvedPatientId || !open) {
      setLatestAppointmentPhone(null);
      return;
    }

    setLoadingPhone(true);
    try {
      const isAdminPortal = pathname.startsWith("/admin");
      const isDoctorPortal = pathname.startsWith("/doctor");
      
      if (!isAdminPortal && !isDoctorPortal) {
        setLatestAppointmentPhone(null);
        return;
      }

      const basePath = isAdminPortal ? "/api/admin" : "/api/doctor";
      
      // Use the dedicated endpoint to get the patient's latest appointment
      const response = await fetch(`${basePath}/patients/${resolvedPatientId}/latest-appointment`, {
        cache: "no-store",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.appointment?.contactNumber) {
          setLatestAppointmentPhone(data.appointment.contactNumber);
          console.log("📱 Found phone from appointment:", data.appointment.contactNumber);
          return;
        }
      }
      
      // If the endpoint doesn't exist, try to find any appointment with a phone number
      // by checking if the patient has any appointments
      const patientResponse = await fetch(`${basePath}/patients/${resolvedPatientId}`, {
        cache: "no-store",
      });
      
      if (patientResponse.ok) {
        const patientData = await patientResponse.json();
        // Check if the patient has a latestAppointment field
        const latestAppt = patientData.patient?.latestAppointment || patientData.latestAppointment;
        if (latestAppt?.contactNumber) {
          setLatestAppointmentPhone(latestAppt.contactNumber);
          return;
        }
      }
      
      setLatestAppointmentPhone(null);
      
    } catch (error) {
      console.error("Failed to fetch latest appointment phone:", error);
      setLatestAppointmentPhone(null);
    } finally {
      setLoadingPhone(false);
    }
  };

  // Fetch phone when modal opens or patient changes
  useEffect(() => {
    if (open && resolvedPatientId) {
      fetchLatestAppointmentPhone();
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

  // Determine the phone number to display
  const displayPhone = patient?.phone || latestAppointmentPhone || null;
  const hasPhoneFromAppointment = !patient?.phone && latestAppointmentPhone;

  const tabs = [
    { id: "info", label: "Patient Information" },
    { id: "notes", label: "Notes" },
    { id: "treatment", label: "Next Treatment" },
    { id: "medical", label: "Medical History" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-slate-50 shadow-2xl ring-1 ring-slate-200">
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
                {hasPhoneFromAppointment && !loadingPhone && (
                  <p className="mt-1 truncate text-xs font-medium text-amber-600">
                    📱 Phone from latest appointment: {latestAppointmentPhone}
                  </p>
                )}
                {loadingPhone && (
                  <p className="mt-1 truncate text-xs font-medium text-slate-400">
                    Loading phone number...
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>

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

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-7">
          {tab === "info" && (
            <div className="space-y-6">
              <VitalSigns patientId={resolvedPatientId} />

              <SectionCard
                title="Patient Information"
                subtitle="Basic profile and contact details."
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Age" value={patient.age} />
                  <Field label="Gender" value={patient.gender} />
                  <Field label="Mobile Number" value={displayPhone} />
                  <Field label="Address" value={patient.address} />
                  <Field label="Email Address" value={patient.email} />
                </div>
                {hasPhoneFromAppointment && !loadingPhone && (
                  <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 ring-1 ring-amber-200">
                    💡 This phone number is from the patient's latest appointment. 
                    Update the patient's profile to save it permanently.
                  </div>
                )}
                {!displayPhone && !loadingPhone && (
                  <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 ring-1 ring-blue-200">
                    ℹ️ No phone number found. Patient needs to update their contact information.
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
              ) : medicalHistoryError ? (
                <div className="rounded-2xl bg-red-50 px-6 py-10 text-center text-sm font-medium text-red-600 ring-1 ring-red-200">
                  {medicalHistoryError}
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