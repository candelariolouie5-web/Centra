"use client";

import React, { useEffect, useMemo, useState } from "react";
import ClinicalRoom from "@/components/ClinicalRoom";
import { 
  CheckCircle, 
  Clock, 
  User, 
  Activity, 
  Stethoscope, 
  Clipboard, 
  Calendar, 
  XCircle,
  RefreshCw,
  ChevronRight,
  Award,
  LogOut,
  Settings,
  Home,
  MoreVertical
} from "lucide-react";

// --- Type definitions (unchanged) ---
type SecretaryStatus =
  | "PENDING"
  | "VERIFIED"
  | "CHECKED_IN"
  | "VITALS_RECORDED"
  | "READY_FOR_DOCTOR"
  | "COMPLETED"
  | "SCHEDULED_FOR_PROCEDURE"
  | "NO_SHOW"
  | "CANCELLED"
  | "RESCHEDULED";

type Appointment = {
  id: string;
  fullName: string;
  email: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  secretaryStatus: SecretaryStatus;
  age?: number | null;
  contactNumber?: string | null;
  room?: string | null;
  chiefComplaint?: string | null;
  complaintNotes?: string | null;
  lateArrival?: boolean;
  procedureRequired?: boolean;
  patientId?: string;
  secretaryVitals?: {
    height?: string | null;
    weight?: string | null;
    bloodPressure?: string | null;
    temperature?: string | null;
    pulse?: string | null;
    respiratoryRate?: string | null;
    oxygenSaturation?: string | null;
    notes?: string | null;
  } | null;
  secretaryProcedures?: Array<{
    id: string;
    procedureType: string;
    room?: string | null;
    scheduledDate: string;
    scheduledTime?: string | null;
    status: string;
  }>;
};

type ModalType = null | "verify" | "vitals";

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

function getTodayDateInput() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusLabel(status: SecretaryStatus) {
  const labels: Record<SecretaryStatus, string> = {
    PENDING: "Pending",
    VERIFIED: "Verified",
    CHECKED_IN: "Checked In",
    VITALS_RECORDED: "Vitals Recorded",
    READY_FOR_DOCTOR: "Ready for Doctor",
    COMPLETED: "Completed",
    SCHEDULED_FOR_PROCEDURE: "Procedure Scheduled",
    NO_SHOW: "No Show",
    CANCELLED: "Cancelled",
    RESCHEDULED: "Rescheduled",
  };
  return labels[status] || status;
}

function statusClass(status: SecretaryStatus) {
  const classes: Record<SecretaryStatus, string> = {
    PENDING: "bg-slate-50 text-slate-600 border-slate-200",
    VERIFIED: "bg-cyan-50 text-cyan-600 border-cyan-200",
    CHECKED_IN: "bg-blue-50 text-blue-600 border-blue-200",
    VITALS_RECORDED: "bg-amber-50 text-amber-600 border-amber-200",
    READY_FOR_DOCTOR: "bg-purple-50 text-purple-600 border-purple-200",
    COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-200",
    SCHEDULED_FOR_PROCEDURE: "bg-indigo-50 text-indigo-600 border-indigo-200",
    NO_SHOW: "bg-rose-50 text-rose-600 border-rose-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-200",
    RESCHEDULED: "bg-yellow-50 text-yellow-600 border-yellow-200",
  };
  return classes[status] || "bg-slate-50 text-slate-600 border-slate-200";
}

function statusDotClass(status: SecretaryStatus) {
  const classes: Record<SecretaryStatus, string> = {
    PENDING: "bg-slate-400",
    VERIFIED: "bg-cyan-500",
    CHECKED_IN: "bg-blue-500",
    VITALS_RECORDED: "bg-amber-500",
    READY_FOR_DOCTOR: "bg-purple-500",
    COMPLETED: "bg-emerald-500",
    SCHEDULED_FOR_PROCEDURE: "bg-indigo-500",
    NO_SHOW: "bg-rose-500",
    CANCELLED: "bg-red-500",
    RESCHEDULED: "bg-yellow-500",
  };
  return classes[status] || "bg-slate-400";
}

// --- Main Component ---
export default function SecretaryDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showClinicalRoom, setShowClinicalRoom] = useState(false);
  const [toast, setToast] = useState("");

  const [verifyForm, setVerifyForm] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    age: "",
  });

  const [vitalsForm, setVitalsForm] = useState({
    height: "",
    weight: "",
    bloodPressure: "",
    temperature: "",
    pulse: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    notes: "",
  });

  // --- Data fetching (unchanged) ---
  async function loadAppointments() {
    try {
      setLoading(true);
      const res = await fetch("/api/secretary/appointments", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load appointments");
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 3500);
  }

  function openModal(type: ModalType, appointment: Appointment) {
    setSelectedAppointment(appointment);
    setActiveModal(type);
    if (type === "verify") {
      setVerifyForm({
        fullName: appointment.fullName || "",
        email: appointment.email || "",
        contactNumber: appointment.contactNumber || "",
        age: appointment.age ? String(appointment.age) : "",
      });
    }
    if (type === "vitals") {
      setVitalsForm({
        height: appointment.secretaryVitals?.height || "",
        weight: appointment.secretaryVitals?.weight || "",
        bloodPressure: appointment.secretaryVitals?.bloodPressure || "",
        temperature: appointment.secretaryVitals?.temperature || "",
        pulse: appointment.secretaryVitals?.pulse || "",
        respiratoryRate: appointment.secretaryVitals?.respiratoryRate || "",
        oxygenSaturation: appointment.secretaryVitals?.oxygenSaturation || "",
        notes: appointment.secretaryVitals?.notes || "",
      });
    }
  }

  function closeModal() {
    setSelectedAppointment(null);
    setActiveModal(null);
  }

  // --- API actions (unchanged) ---
  async function updateAppointmentStatus(
    appointmentId: string,
    payload: Record<string, unknown>,
    successMessage: string
  ) {
    try {
      setSaving(true);
      const res = await fetch(`/api/secretary/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update appointment");
      setAppointments((prev) =>
        prev.map((item) => (item.id === appointmentId ? data.appointment : item))
      );
      showToast(successMessage);
      closeModal();
    } catch (error) {
      console.error(error);
      showToast("Action failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function submitVerify() {
    if (!selectedAppointment) return;
    await updateAppointmentStatus(
      selectedAppointment.id,
      {
        secretaryStatus: "VERIFIED",
        fullName: verifyForm.fullName,
        email: verifyForm.email,
        contactNumber: verifyForm.contactNumber,
        age: verifyForm.age,
      },
      "Appointment verified."
    );
  }

  async function submitCheckIn(appointment: Appointment) {
    await updateAppointmentStatus(
      appointment.id,
      { secretaryStatus: "CHECKED_IN" },
      "Patient checked in."
    );
  }

  async function submitVitals() {
    if (!selectedAppointment) return;
    try {
      setSaving(true);
      const res = await fetch("/api/secretary/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          ...vitalsForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save vitals");
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === selectedAppointment.id ? data.appointment : item
        )
      );
      showToast("Vitals recorded.");
      closeModal();
    } catch (error) {
      console.error(error);
      showToast("Failed to record vitals.");
    } finally {
      setSaving(false);
    }
  }

  async function submitComplete(appointment: Appointment) {
    await updateAppointmentStatus(
      appointment.id,
      { secretaryStatus: "COMPLETED" },
      "Appointment completed."
    );
  }

  async function submitCancel(appointment: Appointment) {
    const confirmed = window.confirm(
      `Cancel appointment for ${appointment.fullName}? This will also show as cancelled in Admin/Doctor.`
    );
    if (!confirmed) return;
    await updateAppointmentStatus(
      appointment.id,
      { secretaryStatus: "CANCELLED" },
      "Appointment cancelled."
    );
  }

  function openReschedule(appointment: Appointment) {
    setSelectedAppointment(appointment);
    setShowClinicalRoom(true);
  }

  function handleScheduleComplete() {
    setShowClinicalRoom(false);
    loadAppointments();
    showToast("Appointment scheduled successfully!");
  }

  // --- Stats with icons ---
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.secretaryStatus === "PENDING").length;
    const checkedIn = appointments.filter((a) => a.secretaryStatus === "CHECKED_IN").length;
    const vitals = appointments.filter((a) => a.secretaryStatus === "VITALS_RECORDED").length;
    const ready = appointments.filter((a) => a.secretaryStatus === "READY_FOR_DOCTOR").length;
    const completed = appointments.filter((a) => a.secretaryStatus === "COMPLETED").length;
    const procedure = appointments.filter((a) => a.secretaryStatus === "SCHEDULED_FOR_PROCEDURE").length;
    const cancelled = appointments.filter((a) => a.secretaryStatus === "CANCELLED").length;
    return { total, pending, checkedIn, vitals, ready, completed, procedure, cancelled };
  }, [appointments]);

  const todayText = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // --- Render ---
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 text-slate-800">
        {/* Top Navigation Bar – simplified, no duplicate nav */}
        <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <span className="text-base font-bold">CF</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold tracking-tight text-slate-900">ClinicFlow</span>
                <span className="hidden text-sm font-medium text-emerald-600 sm:inline">|</span>
                <span className="hidden text-sm font-medium text-slate-500 sm:inline">Secretary Portal</span>
              </div>
            </div>
            {/* Utility actions only – no Dashboard/Settings links */}
            <div className="flex items-center gap-3">
              <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                <MoreVertical className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Appointment Queue</h1>
              <p className="text-sm text-slate-500">Verify, check‑in, record vitals, and manage patient flow with ease.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm shadow-sm">
                <span className="font-medium text-slate-500">Today</span>
                <span className="ml-2 font-semibold text-slate-800">{todayText}</span>
              </div>
              <button
                onClick={loadAppointments}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            <StatCard icon={<Clock className="h-4 w-4" />} label="Total" value={stats.total} color="emerald" />
            <StatCard icon={<User className="h-4 w-4" />} label="Pending" value={stats.pending} color="slate" />
            <StatCard icon={<CheckCircle className="h-4 w-4" />} label="Checked In" value={stats.checkedIn} color="blue" />
            <StatCard icon={<Activity className="h-4 w-4" />} label="Vitals" value={stats.vitals} color="amber" />
            <StatCard icon={<Stethoscope className="h-4 w-4" />} label="Ready" value={stats.ready} color="purple" />
            <StatCard icon={<Clipboard className="h-4 w-4" />} label="Completed" value={stats.completed} color="emerald" />
            <StatCard icon={<Calendar className="h-4 w-4" />} label="Procedure" value={stats.procedure} color="indigo" />
            <StatCard icon={<XCircle className="h-4 w-4" />} label="Cancelled" value={stats.cancelled} color="rose" />
          </section>

          {/* Appointment List */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200/60 px-4 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Patients</h2>
                <p className="text-sm text-slate-500">Select an action to move each patient forward.</p>
              </div>
              <div className="rounded-xl bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600">
                {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center p-12">
                <div className="relative h-10 w-10">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-emerald-600" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-500">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center p-12">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  📋
                </div>
                <p className="text-base font-semibold text-slate-800">No appointments found.</p>
                <p className="text-sm text-slate-500">New appointments will appear here once available.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="grid gap-3 px-4 py-4 transition hover:bg-slate-50/60 lg:grid-cols-[1.2fr_1fr_0.7fr_0.7fr_1.6fr]"
                  >
                    {/* Patient */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-semibold text-emerald-700">
                        {appointment.fullName
                          ?.split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "PT"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{appointment.fullName}</p>
                        <p className="truncate text-xs text-slate-500">{appointment.email}</p>
                        <p className="text-xs text-slate-400">{appointment.contactNumber || "No contact"}</p>
                      </div>
                    </div>

                    {/* Service */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Service</p>
                      <p className="mt-0.5 font-medium text-slate-800">{appointment.serviceType}</p>
                      {appointment.chiefComplaint && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {appointment.chiefComplaint}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Date</p>
                      <p className="mt-0.5 font-medium text-slate-800">{formatDate(appointment.appointmentDate)}</p>
                    </div>

                    {/* Time & Status */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Time</p>
                      <p className="mt-0.5 font-medium text-slate-800">{appointment.appointmentTime}</p>
                      <span
                        className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${statusClass(
                          appointment.secretaryStatus
                        )}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusDotClass(appointment.secretaryStatus)}`}
                        />
                        {statusLabel(appointment.secretaryStatus)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">Actions</p>
                      <div className="flex flex-wrap gap-1.5">
                        <ActionButton variant="amber" onClick={() => openModal("vitals", appointment)}>
                          Vitals
                        </ActionButton>
                        <ActionButton variant="emerald" onClick={() => submitComplete(appointment)}>
                          Complete
                        </ActionButton>
                        <ActionButton variant="blue" onClick={() => openReschedule(appointment)}>
                          Reschedule
                        </ActionButton>
                        <DangerButton onClick={() => submitCancel(appointment)}>
                          Cancel
                        </DangerButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up rounded-2xl bg-slate-900/95 px-5 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
            {toast}
          </div>
        )}

        {/* Modals */}
        {activeModal && selectedAppointment && (
          <Modal title={modalTitle(activeModal)} onClose={closeModal}>
            {activeModal === "verify" && (
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={verifyForm.fullName}
                  onChange={(v) => setVerifyForm((p) => ({ ...p, fullName: v }))}
                />
                <Input
                  label="Email"
                  value={verifyForm.email}
                  onChange={(v) => setVerifyForm((p) => ({ ...p, email: v }))}
                />
                <Input
                  label="Contact Number"
                  value={verifyForm.contactNumber}
                  onChange={(v) => setVerifyForm((p) => ({ ...p, contactNumber: v }))}
                />
                <Input
                  label="Age"
                  value={verifyForm.age}
                  onChange={(v) => setVerifyForm((p) => ({ ...p, age: v }))}
                />
                <SubmitButton disabled={saving} onClick={submitVerify}>
                  Save Verification
                </SubmitButton>
              </div>
            )}

            {activeModal === "vitals" && (
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Height" value={vitalsForm.height} onChange={(v) => setVitalsForm((p) => ({ ...p, height: v }))} />
                <Input label="Weight" value={vitalsForm.weight} onChange={(v) => setVitalsForm((p) => ({ ...p, weight: v }))} />
                <Input
                  label="Blood Pressure"
                  value={vitalsForm.bloodPressure}
                  onChange={(v) => setVitalsForm((p) => ({ ...p, bloodPressure: v }))}
                />
                <Input
                  label="Temperature"
                  value={vitalsForm.temperature}
                  onChange={(v) => setVitalsForm((p) => ({ ...p, temperature: v }))}
                />
                <Input label="Pulse" value={vitalsForm.pulse} onChange={(v) => setVitalsForm((p) => ({ ...p, pulse: v }))} />
                <Input
                  label="Respiratory Rate"
                  value={vitalsForm.respiratoryRate}
                  onChange={(v) => setVitalsForm((p) => ({ ...p, respiratoryRate: v }))}
                />
                <Input
                  label="Oxygen Saturation"
                  value={vitalsForm.oxygenSaturation}
                  onChange={(v) => setVitalsForm((p) => ({ ...p, oxygenSaturation: v }))}
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="Notes"
                    value={vitalsForm.notes}
                    onChange={(v) => setVitalsForm((p) => ({ ...p, notes: v }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <SubmitButton disabled={saving} onClick={submitVitals}>
                    Save Vitals
                  </SubmitButton>
                </div>
              </div>
            )}
          </Modal>
        )}
      </div>

      {/* Clinical Room Modal */}
      {showClinicalRoom && selectedAppointment && (
        <ClinicalRoom
          open={showClinicalRoom}
          onClose={() => {
            setShowClinicalRoom(false);
            setSelectedAppointment(null);
          }}
          patientName={selectedAppointment.fullName}
          patientId={selectedAppointment.patientId || selectedAppointment.id}
          patientContactNumber={selectedAppointment.contactNumber || undefined}
          patientAge={selectedAppointment.age || undefined}
          patientEmail={selectedAppointment.email}
          onSelectSchedule={handleScheduleComplete}
        />
      )}
    </>
  );
}

// --- Reusable UI Components (refined) ---

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "emerald" | "slate" | "blue" | "amber" | "purple" | "indigo" | "rose";
}) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    rose: "bg-rose-50 text-rose-600 border-rose-200",
  };
  return (
    <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-3 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</span>
        <span className={`rounded-lg border p-1.5 ${colorClasses[color]}`}>{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "amber" | "emerald" | "blue";
}) {
  const variantClasses = {
    default: "border-slate-200 bg-white/70 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
    amber: "border-amber-200 bg-amber-50/70 text-amber-700 hover:bg-amber-100",
    emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100",
    blue: "border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
}

function DangerButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs font-medium text-rose-700 shadow-sm transition hover:bg-rose-100"
    >
      {children}
    </button>
  );
}

function SubmitButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {disabled ? "Saving..." : children}
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm animate-fade-in">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/60 bg-white/95 shadow-xl backdrop-blur-sm animate-scale-in">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 py-4 backdrop-blur-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">Secretary Action</p>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
          >
            Close
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        min={type === "date" ? getTodayDateInput() : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

function modalTitle(type: ModalType) {
  switch (type) {
    case "verify":
      return "Verify Appointment";
    case "vitals":
      return "Record Vitals";
    default:
      return "Secretary Action";
  }
}