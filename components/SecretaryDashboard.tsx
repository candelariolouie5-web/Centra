"use client";

import React, { useEffect, useMemo, useState } from "react";

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

type ModalType =
  | null
  | "verify"
  | "vitals"
  | "reschedule";

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

function getDefaultNextWeekDateInput() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0];
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

export default function SecretaryDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: getDefaultNextWeekDateInput(),
    appointmentTime: "9:00 AM",
  });

  async function loadAppointments() {
    try {
      setLoading(true);

      const res = await fetch("/api/secretary/appointments", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load appointments");
      }

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

    if (type === "reschedule") {
      setRescheduleForm({
        appointmentDate: getDefaultNextWeekDateInput(),
        appointmentTime: appointment.appointmentTime || "9:00 AM",
      });
    }
  }

  function closeModal() {
    setSelectedAppointment(null);
    setActiveModal(null);
  }

  async function updateAppointmentStatus(
    appointmentId: string,
    payload: Record<string, unknown>,
    successMessage: string
  ) {
    try {
      setSaving(true);

      const res = await fetch(
        `/api/secretary/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update appointment");
      }

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
      {
        secretaryStatus: "CHECKED_IN",
      },
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

      if (!res.ok) {
        throw new Error(data.error || "Failed to save vitals");
      }

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
      {
        secretaryStatus: "COMPLETED",
      },
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
      {
        secretaryStatus: "CANCELLED",
      },
      "Appointment cancelled."
    );
  }

  async function submitReschedule() {
    if (!selectedAppointment) return;

    try {
      setSaving(true);

      const res = await fetch(
        `/api/secretary/appointments/${selectedAppointment.id}/reschedule`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rescheduleForm),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reschedule appointment");
      }

      setAppointments((prev) =>
        prev.map((item) =>
          item.id === selectedAppointment.id ? data.appointment : item
        )
      );

      showToast("Appointment rescheduled.");
      closeModal();
    } catch (error) {
      console.error(error);
      showToast("Failed to reschedule appointment.");
    } finally {
      setSaving(false);
    }
  }

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter((a) => a.secretaryStatus === "PENDING")
        .length,
      checkedIn: appointments.filter(
        (a) => a.secretaryStatus === "CHECKED_IN"
      ).length,
      vitals: appointments.filter(
        (a) => a.secretaryStatus === "VITALS_RECORDED"
      ).length,
      ready: appointments.filter(
        (a) => a.secretaryStatus === "READY_FOR_DOCTOR"
      ).length,
      completed: appointments.filter(
        (a) => a.secretaryStatus === "COMPLETED"
      ).length,
      procedure: appointments.filter(
        (a) => a.secretaryStatus === "SCHEDULED_FOR_PROCEDURE"
      ).length,
      cancelled: appointments.filter(
        (a) => a.secretaryStatus === "CANCELLED"
      ).length,
    };
  }, [appointments]);

  const todayText = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-cyan-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-xl shadow-emerald-900/5 backdrop-blur">
          <div className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-32 w-32 rounded-full bg-cyan-200/40 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Secretary Workspace
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Appointment Queue
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Manage patient verification, check-in, vitals, rescheduling, and cancellations.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Today
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {todayText}
                  </p>
                </div>

                <button
                  onClick={loadAppointments}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  Refresh Queue
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Checked In" value={stats.checkedIn} />
          <StatCard label="Vitals" value={stats.vitals} />
          <StatCard label="Ready" value={stats.ready} />
          <StatCard label="Completed" value={stats.completed} />
          <StatCard label="Procedure" value={stats.procedure} />
          <StatCard label="Cancelled" value={stats.cancelled} />
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                Patients
              </h2>
              <p className="text-sm text-slate-500">
                Select an action to move each patient through the clinic
                workflow.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {appointments.length} appointment
              {appointments.length === 1 ? "" : "s"}
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
              <p className="text-sm font-medium text-slate-500">
                Loading appointments...
              </p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📋
              </div>
              <p className="font-bold text-slate-800">No appointments found.</p>
              <p className="mt-1 text-sm text-slate-500">
                New appointments will appear here once available.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="grid gap-4 px-5 py-5 transition hover:bg-slate-50/80 lg:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_1.8fr]"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-black text-emerald-700">
                        {appointment.fullName
                          ?.split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "PT"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-950">
                          {appointment.fullName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {appointment.email}
                        </p>
                        <p className="text-xs text-slate-500">
                          {appointment.contactNumber || "No contact number"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Service
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {appointment.serviceType}
                    </p>
                    {appointment.chiefComplaint ? (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        Complaint: {appointment.chiefComplaint}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Date
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {formatDate(appointment.appointmentDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Time
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {appointment.appointmentTime}
                    </p>
                    <span
                      className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                        appointment.secretaryStatus
                      )}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${statusDotClass(
                          appointment.secretaryStatus
                        )}`}
                      />
                      {statusLabel(appointment.secretaryStatus)}
                    </span>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Actions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        onClick={() => openModal("verify", appointment)}
                      >
                        Verify
                      </ActionButton>

                      <ActionButton onClick={() => submitCheckIn(appointment)}>
                        Check-In
                      </ActionButton>

                      <ActionButton
                        onClick={() => openModal("vitals", appointment)}
                      >
                        Vitals
                      </ActionButton>

                      {/* Removed: Send to Doctor, Follow-Up, Procedure */}

                      <ActionButton onClick={() => submitComplete(appointment)}>
                        Complete
                      </ActionButton>

                      <ActionButton
                        onClick={() => openModal("reschedule", appointment)}
                      >
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

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      ) : null}

      {activeModal && selectedAppointment ? (
        <Modal title={modalTitle(activeModal)} onClose={closeModal}>
          {activeModal === "verify" ? (
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={verifyForm.fullName}
                onChange={(value) =>
                  setVerifyForm((prev) => ({ ...prev, fullName: value }))
                }
              />
              <Input
                label="Email"
                value={verifyForm.email}
                onChange={(value) =>
                  setVerifyForm((prev) => ({ ...prev, email: value }))
                }
              />
              <Input
                label="Contact Number"
                value={verifyForm.contactNumber}
                onChange={(value) =>
                  setVerifyForm((prev) => ({ ...prev, contactNumber: value }))
                }
              />
              <Input
                label="Age"
                value={verifyForm.age}
                onChange={(value) =>
                  setVerifyForm((prev) => ({ ...prev, age: value }))
                }
              />
              <SubmitButton disabled={saving} onClick={submitVerify}>
                Save Verification
              </SubmitButton>
            </div>
          ) : null}

          {activeModal === "vitals" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Height"
                value={vitalsForm.height}
                onChange={(value) =>
                  setVitalsForm((prev) => ({ ...prev, height: value }))
                }
              />
              <Input
                label="Weight"
                value={vitalsForm.weight}
                onChange={(value) =>
                  setVitalsForm((prev) => ({ ...prev, weight: value }))
                }
              />
              <Input
                label="Blood Pressure"
                value={vitalsForm.bloodPressure}
                onChange={(value) =>
                  setVitalsForm((prev) => ({
                    ...prev,
                    bloodPressure: value,
                  }))
                }
              />
              <Input
                label="Temperature"
                value={vitalsForm.temperature}
                onChange={(value) =>
                  setVitalsForm((prev) => ({ ...prev, temperature: value }))
                }
              />
              <Input
                label="Pulse"
                value={vitalsForm.pulse}
                onChange={(value) =>
                  setVitalsForm((prev) => ({ ...prev, pulse: value }))
                }
              />
              <Input
                label="Respiratory Rate"
                value={vitalsForm.respiratoryRate}
                onChange={(value) =>
                  setVitalsForm((prev) => ({
                    ...prev,
                    respiratoryRate: value,
                  }))
                }
              />
              <Input
                label="Oxygen Saturation"
                value={vitalsForm.oxygenSaturation}
                onChange={(value) =>
                  setVitalsForm((prev) => ({
                    ...prev,
                    oxygenSaturation: value,
                  }))
                }
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Notes"
                  value={vitalsForm.notes}
                  onChange={(value) =>
                    setVitalsForm((prev) => ({ ...prev, notes: value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <SubmitButton disabled={saving} onClick={submitVitals}>
                  Save Vitals
                </SubmitButton>
              </div>
            </div>
          ) : null}

          {activeModal === "reschedule" ? (
            <div className="space-y-4">
              <Input
                type="date"
                label="New Date"
                value={rescheduleForm.appointmentDate}
                onChange={(value) =>
                  setRescheduleForm((prev) => ({
                    ...prev,
                    appointmentDate: value,
                  }))
                }
              />
              <Select
                label="New Time"
                value={rescheduleForm.appointmentTime}
                options={timeSlots}
                onChange={(value) =>
                  setRescheduleForm((prev) => ({
                    ...prev,
                    appointmentTime: value,
                  }))
                }
              />
              <SubmitButton disabled={saving} onClick={submitReschedule}>
                Save Reschedule
              </SubmitButton>
            </div>
          ) : null}
        </Modal>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="group rounded-3xl border border-white/70 bg-white/85 p-4 shadow-lg shadow-slate-900/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl">
      <div className="text-[11px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">
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
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
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
      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-100"
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
      className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/70 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-emerald-600">
              Secretary Action
            </p>
            <h2 className="text-xl font-black tracking-tight text-slate-950">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
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
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        min={type === "date" ? getTodayDateInput() : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
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
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function modalTitle(type: ModalType) {
  switch (type) {
    case "verify":
      return "Verify Appointment";
    case "vitals":
      return "Record Vitals";
    case "reschedule":
      return "Reschedule Appointment";
    default:
      return "Secretary Action";
  }
}