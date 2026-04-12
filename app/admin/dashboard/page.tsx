"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  CalendarDays,
  Users,
  ClipboardList,
  Activity,
  RefreshCcw,
  TrendingUp,
  Stethoscope,
} from "lucide-react";
import { useSession } from "next-auth/react";

/* -------------------- RECHARTS -------------------- */
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), {
  ssr: false,
});
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});

import { Cell } from "recharts";

type AppointmentBarItem = {
  month: string;
  count: number;
};

type ConsultationItem = {
  name: string;
  value: number;
};

type ServiceStat = {
  name: string;
  percentage: number;
};

type TodayAppointment = {
  id: string;
  fullName: string;
  appointmentTime: string;
  serviceType: string;
  status: string;
};

export default function DashboardPage() {
  const { data: session } = useSession();

  const [mounted, setMounted] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  ]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>(
    []
  );

  const [appointmentData, setAppointmentData] = useState<AppointmentBarItem[]>(
    []
  );
  const [consultationData, setConsultationData] = useState<ConsultationItem[]>(
    []
  );

  const [highestService, setHighestService] = useState<ServiceStat | null>(null);
  const [lowestService, setLowestService] = useState<ServiceStat | null>(null);

  useEffect(() => setMounted(true), []);

  /* ---------------- FETCH DATA ---------------- */

  const fetchAppointmentData = async () => {
    const res = await fetch(
      `/api/admin/dashboard/appointments?year=${year}&months=${selectedMonths.join(
        ","
      )}`
    );
    const result = await res.json();
    if (res.ok) setAppointmentData(result.data || []);
  };

  const fetchTodayAppointments = useCallback(async () => {
    const res = await fetch("/api/admin/dashboard/today-appointments");
    const result = await res.json();
    if (res.ok) setTodayAppointments(result.appointments || []);
  }, []);

  const fetchConsultationData = async () => {
    const res = await fetch("/api/admin/dashboard/consultations");
    const result = await res.json();

    if (res.ok) {
      setConsultationData(result.data || []);
      setHighestService(result.highestService || null);
      setLowestService(result.lowestService || null);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchAppointmentData();
      fetchTodayAppointments();
      fetchConsultationData();
    }
  }, [mounted, selectedMonths, year, fetchTodayAppointments]);

  useEffect(() => {
    const interval = setInterval(fetchTodayAppointments, 30000);
    return () => clearInterval(interval);
  }, [fetchTodayAppointments]);

  const COLORS = ["#06b6d4", "#22c55e", "#f59e0b", "#ec4899"];

  const totalBookedAppointments = useMemo(() => {
    return appointmentData.reduce((sum, item) => sum + (item.count || 0), 0);
  }, [appointmentData]);

  const totalConsultations = useMemo(() => {
    return Math.round(
      consultationData.reduce((sum, item) => sum + (item.value || 0), 0)
    );
  }, [consultationData]);

  const uniquePatientsToday = useMemo(() => {
    const patients = new Set(todayAppointments.map((item) => item.fullName));
    return patients.size;
  }, [todayAppointments]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_22%),linear-gradient(to_bottom,_#f8fafc,_#eef6ff)]">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Clinic Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Monitor appointments, consultations, and daily patient flow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 shadow-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <button
              onClick={fetchTodayAppointments}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:-translate-y-0.5 hover:from-cyan-700 hover:to-blue-700"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* HERO */}
        <div className="mb-6 overflow-hidden rounded-[28px] border border-cyan-100 bg-white shadow-[0_24px_60px_-28px_rgba(14,165,233,0.28)]">
          <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 px-6 py-8 text-white md:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_28%)]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                  <Stethoscope className="h-4 w-4" />
                  Centra Clinic Overview
                </div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Welcome back, {session?.user?.name || "Doctor"} 👋
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-cyan-50/90 md:text-base">
                  Here is a complete overview of clinic performance, patient
                  appointments, and consultation services.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">
                    Year
                  </p>
                  <p className="mt-1 text-lg font-bold">{year}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">
                    Today
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {todayAppointments.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">
                    Services
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {consultationData.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 STAT CARDS */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-cyan-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
                  Total Appointments
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {totalBookedAppointments}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Total booked appointments for selected months
                </p>
              </div>
              <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Total Patients Today
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {uniquePatientsToday}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Unique patients scheduled for today
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                  Consultation Records
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {totalConsultations}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Total consultation services recorded
                </p>
              </div>
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* CHART ROW */}
        {mounted && (
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* APPOINTMENT CHART */}
            <div className="xl:col-span-2 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Booked Appointments Report
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Monthly appointment counts based on selected filters
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-sm font-medium text-slate-500">Year</span>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-cyan-400"
                    aria-label="Year"
                  />
                </div>
              </div>

              <div className="p-6">
                <div className="mb-5 flex flex-wrap gap-2">
                  {[
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ].map((month, index) => (
                    <label
                      key={index}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMonths.includes(index + 1)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMonths([...selectedMonths, index + 1]);
                          } else {
                            setSelectedMonths(
                              selectedMonths.filter((m) => m !== index + 1)
                            );
                          }
                        }}
                      />
                      {month}
                    </label>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={appointmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CONSULTATION PIE */}
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  Consultation Breakdown
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Service distribution across consultations
                </p>
              </div>

              <div className="p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={consultationData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                    >
                      {consultationData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Legend verticalAlign="bottom" />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
                  {highestService && (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                            Highest
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {highestService.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">
                        {highestService.percentage}%
                      </span>
                    </div>
                  )}

                  {lowestService && (
                    <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-white px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                            Lowest
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {lowestService.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-rose-600">
                        {lowestService.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TODAY APPOINTMENTS */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Appointments Scheduled Today
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Live list of today&apos;s confirmed and pending appointments
              </p>
            </div>

            <button
              onClick={fetchTodayAppointments}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CalendarDays className="h-6 w-6" />
              </div>
              <p className="text-base font-medium text-slate-600">
                No appointments scheduled today
              </p>
              <p className="mt-1 text-sm text-slate-400">
                New appointments will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {todayAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {appointment.fullName}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {appointment.appointmentTime}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {appointment.serviceType}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            appointment.status === "CONFIRMED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}