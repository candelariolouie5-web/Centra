"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, User, CalendarX } from "lucide-react";

type UserAppointment = {
  id: string;
  fullName: string;
  email?: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  age?: number;
  contactNumber?: string;
  createdAt: string;
};

interface UserAppointmentsListProps {
  onRefresh?: () => void;
}

export default function UserAppointmentsList({ onRefresh }: UserAppointmentsListProps) {
  const [userAppointments, setUserAppointments] = useState<UserAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/appointment", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setUserAppointments(data.appointments || []);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to fetch user appointments:", err);
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [onRefresh]);

  useEffect(() => {
    fetchUserAppointments();
  }, [fetchUserAppointments]);

  const confirmedAppointments = userAppointments
    .filter((appt) => ["CONFIRMED", "ACCEPTED"].includes(appt.status))
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime()
    );

  if (loading) {
    return (
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-8 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.16)] backdrop-blur-xl min-h-[280px] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
          <p className="text-base font-medium text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50/80 p-6 shadow-sm">
        <p className="text-base font-semibold text-red-800">Unable to load appointments</p>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button
          onClick={fetchUserAppointments}
          className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (confirmedAppointments.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-8 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.16)] backdrop-blur-xl min-h-[320px] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-50 to-blue-100">
            <CalendarX className="h-10 w-10 text-sky-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No appointments yet</h3>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            You have no confirmed appointments yet. Use the booking form on the right to schedule your visit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {confirmedAppointments.length} Confirmed
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {confirmedAppointments.map((appt) => (
          <div
            key={appt.id}
            className="group rounded-[24px] border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_20px_45px_-28px_rgba(14,165,233,0.35)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {appt.status}
              </span>

              <div className="rounded-full bg-slate-100 p-2 text-slate-500 transition group-hover:bg-sky-50 group-hover:text-sky-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-lg font-semibold capitalize text-slate-900 line-clamp-1">
                {appt.serviceType}
              </p>

              <p className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900">
                {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              <div className="inline-flex rounded-2xl bg-slate-100 px-4 py-2 text-base font-semibold text-slate-700">
                {appt.appointmentTime}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200/70 pt-4">
              <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate font-medium text-slate-700">{appt.fullName}</span>
              </div>

              {appt.age ? (
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  {appt.age} yrs
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}