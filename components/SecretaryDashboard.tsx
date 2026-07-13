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
  Award
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
    PENDING: "bg-slate-100 text-slate-700 border-slate-200",
    VERIFIED: "bg-cyan-50 text-cyan-700 border-cyan-200",
    CHECKED_IN: "bg-blue-50 text-blue-700 border-blue-200",
    VITALS_RECORDED: "bg-amber-50 text-amber-700 border-amber-200",
    READY_FOR_DOCTOR: "bg-purple-50 text-purple-700 border-purple-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    SCHEDULED_FOR_PROCEDURE: "bg-indigo-50 text-indigo-700 border-indigo-200",
    NO_SHOW: "bg-rose-50 text-rose-700 border-rose-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    RESCHEDULED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };
  return classes[status] || "bg-slate-100 text-slate-700 border-slate-200";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-emerald-50/40 text-slate-900">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header Card */}
          <section className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 shadow-2xl shadow-emerald-900/5 backdrop-blur-xl transition-all hover:shadow-emerald-900/10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
            <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="relative p-8 sm:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 backdrop-blur-sm">
                      <Award className="mr-1.5 h-3.5 w-3.5" /> Secretary Workspace
                    </span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                    Appointment Queue
                  </h1>
                  <p className="mt-2 max-w-2xl text-base text-slate-600">
                    Verify, check-in, record vitals, and manage patient flow with ease.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Today
                    </p>
                    <p className="text-sm font-bold text-slate-800">{todayText}</p>
                  </div>
                  <button
                    onClick={loadAppointments}
                    className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-emerald-600/40"
                  >
                    <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
            <StatCard icon={<Clock className="h-5 w-5" />} label="Total" value={stats.total} color="emerald" />
            <StatCard icon={<User className="h-5 w-5" />} label="Pending" value={stats.pending} color="slate" />
            <StatCard icon={<CheckCircle className="h-5 w-5" />} label="Checked In" value={stats.checkedIn} color="blue" />
            <StatCard icon={<Activity className="h-5 w-5" />} label="Vitals" value={stats.vitals} color="amber" />
            <StatCard icon={<Stethoscope className="h-5 w-5" />} label="Ready" value={stats.ready} color="purple" />
            <StatCard icon={<Clipboard className="h-5 w-5" />} label="Completed" value={stats.completed} color="emerald" />
            <StatCard icon={<Calendar className="h-5 w-5" />} label="Procedure" value={stats.procedure} color="indigo" />
            <StatCard icon={<XCircle className="h-5 w-5" />} label="Cancelled" value={stats.cancelled} color="rose" />
          </section>

          {/* Appointment List */}
          <section className="rounded-[2.5rem] border border-white/60 bg-white/80 shadow-2xl shadow-slate-900/5 backdrop-blur-xl transition-all hover:shadow-slate-900/10">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200/60 px-6 py-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">Patients</h2>
                <p className="text-sm text-slate-500">Select an action to move each patient forward.</p>
              </div>
              <div className="rounded-2xl bg-slate-100/70 px-5 py-2 text-sm font-bold text-slate-600 backdrop-blur-sm">
                {appointments.length} appointment{appointments.length === 1 ? "" : "s"}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center p-12">
                <div className="relative h-12 w-12">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-200" />
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-emerald-600" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-500">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center p-12">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">
                  📋
                </div>
                <p className="text-lg font-bold text-slate-800">No appointments found.</p>
                <p className="mt-1 text-sm text-slate-500">New appointments will appear here once available.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100/80">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="group grid gap-4 px-6 py-5 transition hover:bg-slate-50/60 lg:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_1.8fr]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-black text-emerald-700 shadow-inner">
                        {appointment.fullName
                          ?.split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "PT"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-950">{appointment.fullName}</p>
                        <p className="truncate text-xs text-slate-500">{appointment.email}</p>
                        <p className="text-xs text-slate-400">{appointment.contactNumber || "No contact"}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Service</p>
                      <p className="mt-1 font-semibold text-slate-800">{appointment.serviceType}</p>
                      {appointment.chiefComplaint && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          Complaint: {appointment.chiefComplaint}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Date</p>
                      <p className="mt-1 font-semibold text-slate-800">{formatDate(appointment.appointmentDate)}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Time</p>
                      <p className="mt-1 font-semibold text-slate-800">{appointment.appointmentTime}</p>
                      <span
                        className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold transition-colors ${statusClass(
                          appointment.secretaryStatus
                        )}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${statusDotClass(appointment.secretaryStatus)} animate-pulse`}
                        />
                        {statusLabel(appointment.secretaryStatus)}
                      </span>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Actions</p>
                      <div className="flex flex-wrap gap-2">
                        <ActionButton onClick={() => openModal("verify", appointment)}>Verify</ActionButton>
                        <ActionButton onClick={() => submitCheckIn(appointment)}>Check‑In</ActionButton>
                        <ActionButton onClick={() => openModal("vitals", appointment)}>Vitals</ActionButton>
                        <ActionButton onClick={() => submitComplete(appointment)}>Complete</ActionButton>
                        <ActionButton onClick={() => openReschedule(appointment)}>Secretary</ActionButton>
                        <ActionButton onClick={() => openReschedule(appointment)}>Reschedule</ActionButton>
                        <DangerButton onClick={() => submitCancel(appointment)}>Cancel</DangerButton>
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
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up rounded-2xl bg-slate-900/95 px-6 py-4 text-sm font-bold text-white shadow-2xl backdrop-blur-sm">
            {toast}
          </div>
        )}

        {/* Modals */}
        {activeModal && selectedAppointment && (
          <Modal title={modalTitle(activeModal)} onClose={closeModal}>
            {activeModal === "verify" && (
              <div className="space-y-5">
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
              <div className="grid gap-5 md:grid-cols-2">
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

// --- Reusable UI Components (enhanced) ---

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
    <div className="group rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</span>
        <span className={`rounded-xl border p-1.5 ${colorClasses[color]}`}>{icon}</span>
      </div>
      <div className="mt-3 text-3xl font-black tracking-tight text-slate-950 transition-all group-hover:scale-105">
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-slate-200 bg-white/70 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-emerald-100"
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
      className="rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 py-2 text-xs font-bold text-rose-700 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-rose-200"
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
      className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5 hover:shadow-emerald-600/40 disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm animate-fade-in">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] border border-white/60 bg-white/90 shadow-2xl backdrop-blur-xl animate-scale-in">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 py-5 backdrop-blur-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-600">Secretary Action</p>
            <h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl bg-slate-100/70 px-4 py-2 text-sm font-bold text-slate-600 backdrop-blur-sm transition hover:bg-slate-200"
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
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        min={type === "date" ? getTodayDateInput() : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100/50"
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
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100/50"
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