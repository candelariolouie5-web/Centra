"use client";

import { MoreHorizontal, X } from "lucide-react";

interface Booking {
  id: string;
  name: string;
  type: string;
  label: string;
  status?: string;
}

interface Props {
  newBookings: Booking[];
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  handleEdit: (id: string) => void;
  handleCancel: (id: string) => void;
  setOpenModal: (open: boolean) => void;
}

function getTypeStyles(type: string) {
  const normalized = type?.toLowerCase();

  if (normalized === "ear") {
    return {
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      avatar: "bg-gradient-to-br from-blue-500 to-cyan-500 text-white",
      dot: "bg-blue-500",
    };
  }

  if (normalized === "nose") {
    return {
      badge: "bg-green-50 text-green-700 border-green-200",
      avatar: "bg-gradient-to-br from-green-500 to-emerald-500 text-white",
      dot: "bg-green-500",
    };
  }

  if (normalized === "throat") {
    return {
      badge: "bg-red-50 text-red-700 border-red-200",
      avatar: "bg-gradient-to-br from-red-500 to-rose-500 text-white",
      dot: "bg-red-500",
    };
  }

  return {
    badge: "bg-pink-50 text-pink-700 border-pink-200",
    avatar: "bg-gradient-to-br from-pink-500 to-fuchsia-500 text-white",
    dot: "bg-pink-500",
  };
}

function getStatusStyles(status?: string) {
  if (status === "CONFIRMED" || status === "ACCEPTED") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function AppointmentRequestsModal({
  newBookings,
  menuOpenId,
  setMenuOpenId,
  handleEdit,
  handleCancel,
  setOpenModal,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-md">
      <div className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_35px_90px_-30px_rgba(15,23,42,0.45)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 px-6 py-5 text-white md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Clinic Management
              </p>
<h2 className="mt-2 text-2xl font-bold tracking-tight">
                Manage Appointments
              </h2>
              <p className="mt-1 text-sm text-cyan-50/90">
                Review and manage incoming patient appointment requests.
              </p>
            </div>

            <button
              onClick={() => setOpenModal(false)}
              className="rounded-2xl bg-white/15 p-2.5 text-white transition hover:bg-white/25"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50/60 px-6 py-4 md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              Total Requests:{" "}
              <span className="ml-1 font-bold text-slate-900">{newBookings.length}</span>
            </div>
            <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            Active:{" "}
              <span className="ml-1 font-bold">
                {
                  newBookings.filter(
                    (booking) => booking.status === "CONFIRMED" || booking.status === "ACCEPTED"
                  ).length
                }
              </span>
            </div>
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              Confirmed:{" "}
              <span className="ml-1 font-bold">
                {
                  newBookings.filter(
                    (booking) =>
                      booking.status === "CONFIRMED" || booking.status === "ACCEPTED"
                  ).length
                }
              </span>
            </div>
          </div>
        </div>

        {/* Table header */}
        <div className="hidden grid-cols-12 border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 md:grid md:px-8">
          <p className="col-span-5">Patient</p>
          <p className="col-span-3">Status</p>
          <p className="col-span-3">Location</p>
          <span className="col-span-1 text-right">Actions</span>
        </div>

        {/* Rows */}
        <div className="max-h-[520px] overflow-y-auto px-6 py-2 md:px-8">
          {newBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <MoreHorizontal size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                No appointment requests
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                New booking requests will appear here.
              </p>
            </div>
          ) : (
            newBookings.map((r) => {
              const typeStyles = getTypeStyles(r.type);
              const isConfirmed =
                r.status === "CONFIRMED" || r.status === "ACCEPTED";

              return (
                <div
                  key={r.id}
                  className="grid grid-cols-1 gap-4 border-b border-slate-100 py-4 last:border-0 md:grid-cols-12 md:items-center"
                >
                  {/* Patient */}
                  <div className="col-span-5 flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-sm ${typeStyles.avatar}`}
                    >
                      {r.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-slate-900">
                        {r.name}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${typeStyles.badge}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${typeStyles.dot}`} />
                          {r.type}
                        </span>

                        <span className="text-xs font-medium text-slate-500">
                          {r.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-3">
                    <div className="md:hidden mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Status
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyles(
                        r.status
                      )}`}
                    >
                      {isConfirmed ? "Confirmed" : "Pending"}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="col-span-3">
                    <div className="md:hidden mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Location
                    </div>
                    <p className="text-sm font-medium text-slate-700">Clinic</p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-2">
{false && (
                      <button
                        onClick={() => handleEdit(r.id)}
                        className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-700"
                      >
                        Confirm
                      </button>
                    )}

                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuOpenId(menuOpenId === r.id ? null : r.id)
                        }
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                        aria-label="More options"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {menuOpenId === r.id && (
                        <div className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-25px_rgba(15,23,42,0.35)]">
                          {r.status === "PENDING" && (
                            <button
                              onClick={() => handleEdit(r.id)}
                              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                            >
                              ✏️ Edit Date & Time
                            </button>
                          )}

                          <button
                            onClick={() => handleCancel(r.id)}
                            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            aria-label="Cancel appointment"
                          >
                            <X size={14} /> Cancel Appointment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}