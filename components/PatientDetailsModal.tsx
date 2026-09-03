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
    print: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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
  return (
    <div className="rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md print:shadow-none print:ring-0 print:border print:border-slate-200">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 print:text-slate-600">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-900 break-words print:text-sm">
        {displayValue(value)}
      </p>
    </div>
  );
};

/* ---------------- PLACEHOLDER ---------------- */

const Placeholder = ({ text }: { text: string }) => (
  <div className="rounded-xl bg-slate-50/80 px-6 py-10 text-center text-sm font-medium text-slate-600 ring-1 ring-slate-200/60 print:border print:border-slate-200 print:bg-white">
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
  <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md print:shadow-none print:ring-0 print:border print:border-slate-200 print:break-inside-avoid">
    {(title || right) && (
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <h3 className="text-lg font-bold text-slate-900 print:text-base">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-sm text-slate-500 print:text-xs">{subtitle}</p>}
        </div>
        {right && <div className="print:hidden">{right}</div>}
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
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 hover:shadow-md print:hidden"
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
                <div className="mb-4 rounded-xl bg-teal-50/80 px-4 py-3 text-sm font-medium text-teal-700 ring-1 ring-teal-200/70 print:bg-transparent print:border print:border-slate-200">
                  From {latestVitals.appointment.serviceType} on{" "}
                  {new Date(latestVitals.appointment.appointmentDate).toLocaleDateString()} at{" "}
                  {latestVitals.appointment.appointmentTime}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {vitals.map((vital) => (
                  <div
                    key={vital.key}
                    className="rounded-xl bg-slate-50/80 px-5 py-4 ring-1 ring-slate-200/60 transition hover:bg-slate-50 print:border print:border-slate-200 print:bg-white"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 print:text-slate-600">
                      {vital.label}
                    </p>
                    <div className="mt-1 flex items-end gap-2">
                      <p className="text-2xl font-bold tracking-tight text-slate-900 print:text-lg">
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
                <div className="mt-4 rounded-xl bg-slate-50/80 px-5 py-4 ring-1 ring-slate-200/60 print:border print:border-slate-200 print:bg-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 print:text-slate-600">
                    Notes
                  </p>
                  <p className="mt-1 text-sm font-medium leading-6 text-slate-800 print:text-xs">
                    {latestVitals.notes}
                  </p>
                </div>
              )}
            </>
          )}

          {showVitalsForm && (
            <div className="space-y-5 print:hidden">
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
  patient: propPatient,
  tab,
  setTab,
  onCreateMedicalHistory,
  onRefreshMedicalHistory,
  onPatientUpdated,
}: any) => {
  const pathname = usePathname();

  // ---- LOCAL PATIENT STATE ----
  const [localPatient, setLocalPatient] = useState(propPatient);

  // ---- MEDICAL HISTORY STATE ----
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([]);
  const [loadingMedicalHistory, setLoadingMedicalHistory] = useState(false);
  const [medicalHistoryError, setMedicalHistoryError] = useState("");

  // ---- APPOINTMENT INFO ----
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

  // ---- EDIT STATE ----
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    email: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // ---- DERIVED ----
  const resolvedPatientId = getResolvedPatientId(localPatient);
  const displayPhone = localPatient?.phone || appointmentInfo.phone || null;

  // ---- SYNC LOCAL PATIENT WITH PROP ----
  useEffect(() => {
    if (propPatient) {
      console.log("📥 Prop patient received:", propPatient);
      setLocalPatient(propPatient);
      // Also update editForm when propPatient changes
      if (!isEditing) {
        setEditForm({
          name: propPatient.name || "",
          age: propPatient.age ? String(propPatient.age) : "",
          gender: propPatient.gender || "",
          phone: propPatient.phone || "",
          address: propPatient.address || "",
          email: propPatient.email || "",
        });
      }
    }
  }, [propPatient, isEditing]);

  // ---- SYNC EDIT FORM WITH LOCAL PATIENT ----
  useEffect(() => {
    if (localPatient && !isEditing) {
      setEditForm({
        name: localPatient.name || "",
        age: localPatient.age ? String(localPatient.age) : "",
        gender: localPatient.gender || "",
        phone: localPatient.phone || "",
        address: localPatient.address || "",
        email: localPatient.email || "",
      });
    }
  }, [localPatient, isEditing]);

  // ---- FETCH APPOINTMENT INFO ----
  useEffect(() => {
    if (open && resolvedPatientId) {
      fetchLatestAppointmentInfo();
    }
  }, [open, resolvedPatientId, pathname]);

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

  // ---- FETCH MEDICAL HISTORY ----
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

  // ---- PRINT HANDLER ----
  const handlePrint = () => {
    window.print();
  };

  // ---- EDIT HANDLERS ----
  const startEditing = () => {
    setIsEditing(true);
    setEditError("");
    // Ensure editForm has the latest values
    if (localPatient) {
      setEditForm({
        name: localPatient.name || "",
        age: localPatient.age ? String(localPatient.age) : "",
        gender: localPatient.gender || "",
        phone: localPatient.phone || "",
        address: localPatient.address || "",
        email: localPatient.email || "",
      });
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditError("");
    if (localPatient) {
      setEditForm({
        name: localPatient.name || "",
        age: localPatient.age ? String(localPatient.age) : "",
        gender: localPatient.gender || "",
        phone: localPatient.phone || "",
        address: localPatient.address || "",
        email: localPatient.email || "",
      });
    }
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // ---- SAVE EDIT ----
  const savePatientEdit = async () => {
    if (!resolvedPatientId) {
      setEditError("Patient ID is missing.");
      return;
    }

    if (!editForm.name.trim()) {
      setEditError("Name is required.");
      return;
    }

    setEditLoading(true);
    setEditError("");

    const isDoctorPortal = pathname.startsWith("/doctor");
    const baseApiPath = isDoctorPortal ? "/api/doctor" : "/api/admin";

    try {
      const payload = {
        name: editForm.name.trim(),
        age: editForm.age ? parseInt(editForm.age, 10) : null,
        gender: editForm.gender.trim() || null,
        phone: editForm.phone.trim() || null,
        address: editForm.address.trim() || null,
        email: editForm.email.trim() || null,
      };

      console.log("📤 Sending payload:", payload);

      const response = await fetch(`${baseApiPath}/patients/${resolvedPatientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setEditError(data?.error || "Failed to update patient");
        return;
      }

      // ---- SUCCESS ----
      const updatedPatient = data.patient || data;
      console.log("📥 Updated patient from API:", updatedPatient);
      
      // Make sure address is in the updated patient
      if (updatedPatient && !updatedPatient.address) {
        updatedPatient.address = editForm.address.trim() || null;
      }
      
      setLocalPatient(updatedPatient);
      setIsEditing(false);

      if (onPatientUpdated) {
        onPatientUpdated(updatedPatient);
      }
    } catch (error: any) {
      console.error("Failed to update patient:", error);
      setEditError(error?.message || "Failed to update patient");
    } finally {
      setEditLoading(false);
    }
  };

  if (!open || !localPatient) return null;

  const tabs = [
    { id: "info", label: "Patient Information" },
    { id: "notes", label: "Notes" },
    { id: "treatment", label: "Next Treatment" },
    { id: "medical", label: "Medical History" },
  ];

  return (
    <>
      {/* Modal overlay – hidden when printing */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:hidden print:bg-transparent print:p-0">
        <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-slate-50/90 shadow-2xl ring-1 ring-slate-200/80 print:max-h-none print:rounded-none print:shadow-none print:ring-0 print:bg-white print:overflow-visible">
          {/* Header */}
          <div className="border-b border-slate-200/80 bg-white/80 px-7 py-5 backdrop-blur-sm print:border-b print:bg-white print:px-0 print:py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-xl font-bold text-white shadow-md print:h-10 print:w-10 print:text-base print:shadow-none">
                  {localPatient.name?.charAt(0) || "P"}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900 print:text-lg">
                    {localPatient.name || "Patient Details"}
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-slate-500 print:text-xs">
                    {displayValue(localPatient.email)}
                  </p>
                  {loadingAppointmentInfo && (
                    <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
                      Loading appointment data...
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                {/* Print button */}
                <button
                  onClick={handlePrint}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <Icon name="print" className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <Icon name="close" className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tabs – hidden in print */}
            <div className="mt-5 flex flex-wrap gap-1.5 print:hidden">
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

          {/* Body – scrollable, but print shows all content */}
          <div className="flex-1 overflow-y-auto px-7 py-6 print:overflow-visible print:p-0">
            {/* Patient info tab */}
            {tab === "info" && (
              <div className="space-y-6 print:space-y-4">
                <VitalSigns patientId={resolvedPatientId} />

                <SectionCard
                  title="Patient Information"
                  subtitle="Basic profile and contact details."
                  right={
                    !isEditing ? (
                      <button
                        onClick={startEditing}
                        className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 hover:shadow-md print:hidden"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2 print:hidden">
                        <button
                          onClick={cancelEditing}
                          disabled={editLoading}
                          className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={savePatientEdit}
                          disabled={editLoading}
                          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {editLoading ? "Saving..." : "Save"}
                        </button>
                      </div>
                    )
                  }
                >
                  {editError && (
                    <div className="mb-4 rounded-xl bg-red-50 px-5 py-4 text-sm font-medium text-red-600 ring-1 ring-red-200/70 print:hidden">
                      {editError}
                    </div>
                  )}

                  {!isEditing ? (
                    <>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Full Name" value={localPatient.name} />
                        <Field label="Age" value={localPatient.age} />
                        <Field label="Gender" value={localPatient.gender} />
                        <Field label="Mobile Number" value={displayPhone} />
                        <Field label="Address" value={localPatient.address} />
                        <Field label="Email Address" value={localPatient.email} />
                      </div>

                      {!displayPhone && !loadingAppointmentInfo && (
                        <div className="mt-4 rounded-xl bg-blue-50/80 px-4 py-3 text-sm font-medium text-blue-700 ring-1 ring-blue-200/70 print:hidden">
                          ℹ️ No phone number found. Patient needs to update their contact information.
                        </div>
                      )}
                      {loadingAppointmentInfo && (
                        <div className="mt-4 rounded-xl bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-500 ring-1 ring-slate-200/60 print:hidden">
                          🔄 Checking for appointment data...
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 print:hidden">
                      <EditField
                        label="Full Name"
                        value={editForm.name}
                        onChange={(val) => handleEditChange("name", val)}
                      />
                      <EditField
                        label="Age"
                        value={editForm.age}
                        onChange={(val) => handleEditChange("age", val)}
                        type="number"
                      />
                      <EditField
                        label="Gender"
                        value={editForm.gender}
                        onChange={(val) => handleEditChange("gender", val)}
                      />
                      <EditField
                        label="Mobile Number"
                        value={editForm.phone}
                        onChange={(val) => handleEditChange("phone", val)}
                      />
                      <EditField
                        label="Address"
                        value={editForm.address}
                        onChange={(val) => handleEditChange("address", val)}
                      />
                      <EditField
                        label="Email Address"
                        value={editForm.email}
                        onChange={(val) => handleEditChange("email", val)}
                        type="email"
                      />
                    </div>
                  )}
                </SectionCard>
              </div>
            )}

            {/* Notes tab */}
            {tab === "notes" && (
              <SectionCard
                title="Patient Notes"
                subtitle="Clinical notes, observations, and attached records."
              >
                <PatientNotes patient={localPatient} />
              </SectionCard>
            )}

            {/* Treatment tab */}
            {tab === "treatment" && (
              <SectionCard
                title="Next Treatment"
                subtitle="Planned treatment and follow-up details."
              >
                {!localPatient?.soapNote?.plan && !localPatient?.soapNote?.followUp ? (
                  <Placeholder text="No next treatment details available" />
                ) : (
                  <div className="divide-y divide-slate-200/70 rounded-xl bg-slate-50/80 ring-1 ring-slate-200/60 print:bg-white print:ring-0 print:border print:border-slate-200">
                    {localPatient?.soapNote?.plan && (
                      <div className="grid grid-cols-3 gap-4 px-5 py-4">
                        <dt className="text-sm font-semibold text-slate-500 print:text-xs">Plan</dt>
                        <dd className="col-span-2 text-sm font-medium text-slate-800 print:text-xs">
                          {localPatient.soapNote.plan || "—"}
                        </dd>
                      </div>
                    )}
                    {localPatient?.soapNote?.followUp && (
                      <div className="grid grid-cols-3 gap-4 px-5 py-4">
                        <dt className="text-sm font-semibold text-slate-500 print:text-xs">Follow-up</dt>
                        <dd className="col-span-2 text-sm font-medium text-slate-800 print:text-xs">
                          {localPatient.soapNote.followUp || "—"}
                        </dd>
                      </div>
                    )}
                  </div>
                )}
              </SectionCard>
            )}

            {/* Medical History tab */}
            {tab === "medical" && (
              <SectionCard
                title="Medical History"
                subtitle="Past records, results, remarks, and uploaded photos."
                right={
                  <button
                    onClick={onCreateMedicalHistory}
                    className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 hover:shadow-md print:hidden"
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
                        className="overflow-hidden rounded-xl bg-slate-50/80 p-5 ring-1 ring-slate-200/60 transition hover:shadow-sm print:bg-white print:ring-0 print:border print:border-slate-200"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <h4 className="text-base font-bold text-slate-900 print:text-sm">
                              {displayValue(record.type)}
                            </h4>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-500 print:text-xs">
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

                          <div className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200/70 print:bg-transparent print:ring-0">
                            Added {new Date(record.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-white px-4 py-4 ring-1 ring-slate-200/60 print:ring-0 print:border print:border-slate-200">
                          <p className="text-sm leading-6 text-slate-800 print:text-xs">
                            {displayValue(record.remarks)}
                          </p>
                        </div>

                        {record.photos && record.photos.length > 0 && (
                          <div className="mt-4">
                            <p className="mb-3 text-sm font-semibold text-slate-700 print:text-xs">
                              Attached Photos
                            </p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-3">
                              {record.photos.map((photo, index) => (
                                <div
                                  key={index}
                                  className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/60 transition hover:ring-slate-300 print:ring-0 print:border print:border-slate-200"
                                >
                                  <img
                                    src={photo}
                                    alt={`Medical record ${index + 1}`}
                                    className="h-32 w-full object-cover print:h-24"
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

      {/* ---- PRINT STYLES (injected via style tag) ---- */}
      <style jsx global>{`
        @media print {
          /* Hide everything except the modal content */
          body * {
            visibility: hidden;
          }
          .fixed.inset-0,
          .fixed.inset-0 * {
            visibility: visible;
          }
          .fixed.inset-0 {
            position: relative !important;
            background: white !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          .fixed.inset-0 > div {
            max-height: none !important;
            overflow: visible !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }
          /* Break pages nicely */
          .section-card,
          .report-content {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          /* Print button and edit buttons are hidden by .print:hidden */
        }
      `}</style>
    </>
  );
};

// ---- EditField component ----
const EditField = ({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100/50"
    />
  </label>
);

export default PatientDetailsModal;