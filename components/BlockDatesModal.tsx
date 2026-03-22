"use client";

import { useMemo, useState } from "react";
import { CalendarOff, Trash2, X } from "lucide-react";

type BlockedDate = {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  reason: string | null;
};

interface BlockDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedDates: BlockedDate[];
  onBlockDates: (
    startDate: string,
    endDate: string,
    reason: string
  ) => Promise<void> | void;
  onUnblockDate: (id: string) => Promise<void> | void;
}

function formatDate(date: string | Date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return String(date);

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlockDatesModal({
  isOpen,
  onClose,
  blockedDates,
  onBlockDates,
  onUnblockDate,
}: BlockDatesModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const sortedBlockedDates = useMemo(() => {
    return [...blockedDates].sort((a, b) => {
      const aTime = new Date(a.startDate).getTime();
      const bTime = new Date(b.startDate).getTime();
      return aTime - bTime;
    });
  }, [blockedDates]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      alert("Please select both start date and end date.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("End date cannot be earlier than start date.");
      return;
    }

    try {
      setSubmitting(true);
      await onBlockDates(startDate, endDate, reason.trim());
      setStartDate("");
      setEndDate("");
      setReason("");
      onClose();
    } catch (error) {
      console.error("Failed to block dates:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      setUnblockingId(id);
      await onUnblockDate(id);
    } catch (error) {
      console.error("Failed to unblock date:", error);
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-md">
      <div className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_35px_90px_-30px_rgba(15,23,42,0.45)]">
        <div className="bg-gradient-to-r from-rose-500 to-red-500 px-6 py-5 text-white md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-100">
                Clinic Availability
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Block Dates
              </h2>
              <p className="mt-1 text-sm text-rose-50/90">
                Mark dates as unavailable for vacations, emergencies, or clinic closure.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-2xl bg-white/15 p-2.5 transition hover:bg-white/25"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Add blocked date range
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                These dates will no longer accept appointments.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    End date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Optional reason..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:from-rose-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CalendarOff className="h-4 w-4" />
                  {submitting ? "Blocking..." : "Block Dates"}
                </button>
              </div>
            </form>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Current blocked dates
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Remove any blocked period below.
              </p>
            </div>

            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {sortedBlockedDates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    No blocked dates yet.
                  </p>
                </div>
              ) : (
                sortedBlockedDates.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700">
                          Blocked
                        </span>

                        <p className="mt-3 text-sm font-semibold text-slate-900">
                          {formatDate(item.startDate)} — {formatDate(item.endDate)}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.reason?.trim() || "No reason provided"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnblock(item.id)}
                        disabled={unblockingId === item.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        {unblockingId === item.id ? "Removing..." : "Unblock"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}