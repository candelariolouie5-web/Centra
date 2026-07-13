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
import { Cell } from "recharts";

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
  const [totalConsultations, setTotalConsultations] = useState(0);

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
      setTotalConsultations(result.totalBookings || 0);
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

  const uniquePatientsToday = useMemo(() => {
    const patients = new Set(todayAppointments.map((item) => item.fullName));
    return patients.size;
  }, [todayAppointments]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/20">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/80">
        <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {/* Logo Icon */}
            <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Centra Clinic PH
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Dashboard Overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
              <CalendarDays className="h-4 w-4 text-cyan-500" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <button
              onClick={fetchTodayAppointments}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh Data
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {/* HERO BANNER */}
        <div className="mb-8 overflow-hidden rounded-[32px] border border-cyan-200/60 bg-white shadow-xl shadow-cyan-500/10">
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 px-6 py-8 md:px-10 md:py-10 text-white">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
            </div>
            
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Centra Clinic PH Overview
                </div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Welcome back, {session?.user?.name?.split(" ")[0] || "Doctor"}
                  <span className="inline-block ml-2 animate-bounce">👋</span>
                </h2>
                <p className="mt-3 max-w-2xl text-base text-cyan-100/80 md:text-lg leading-relaxed">
                  Monitor your clinic&apos;s performance, track patient appointments, 
                  and analyze consultation trends in real-time.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-4 text-center hover:bg-white/20 transition-colors">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200 mb-1">
                    Year
                  </p>
                  <p className="text-2xl font-bold">{year}</p>
                </div>
                <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-4 text-center hover:bg-white/20 transition-colors">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200 mb-1">
                    Today
                  </p>
                  <p className="text-2xl font-bold">
                    {todayAppointments.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-4 text-center hover:bg-white/20 transition-colors">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200 mb-1">
                    Services
                  </p>
                  <p className="text-2xl font-bold">
                    {consultationData.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Card 1 - Total Appointments */}
          <div className="group relative overflow-hidden rounded-[24px] border border-cyan-100/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-100/40 to-transparent rounded-bl-3xl transition-opacity group-hover:opacity-100 opacity-70" />
            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 text-cyan-600 shadow-sm">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 border border-emerald-100">
                  <TrendingUp className="h-3 w-3" />
                  12%
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">
                Total Appointments
              </p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">
                {totalBookedAppointments.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Booked for selected months
              </p>
            </div>
          </div>

          {/* Card 2 - Total Patients Today */}
          <div className="group relative overflow-hidden rounded-[24px] border border-emerald-100/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-bl-3xl transition-opacity group-hover:opacity-100 opacity-70" />
            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 shadow-sm">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 border border-emerald-100">
                  <TrendingUp className="h-3 w-3" />
                  8%
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">
                Patients Today
              </p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">
                {uniquePatientsToday}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Unique patients scheduled
              </p>
            </div>
          </div>

          {/* Card 3 - Consultation Records */}
          <div className="group relative overflow-hidden rounded-[24px] border border-violet-100/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-100/40 to-transparent rounded-bl-3xl transition-opacity group-hover:opacity-100 opacity-70" />
            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 text-violet-600 shadow-sm">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 border border-emerald-100">
                  <TrendingUp className="h-3 w-3" />
                  15%
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">
                Consultation Records
              </p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">
                {totalConsultations.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Accepted & confirmed bookings
              </p>
            </div>
          </div>
        </div>

        {/* CHARTS ROW */}
        {mounted && (
          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* APPOINTMENT BAR CHART */}
            <div className="xl:col-span-2 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Appointment Analytics
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Monthly booking trends for Centra Clinic PH
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 shadow-sm">
                  <span className="text-sm font-semibold text-slate-500">Year</span>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) =>
                      setYear(parseInt(e.target.value) || new Date().getFullYear())
                    }
                    className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
                    aria-label="Year"
                  />
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6 flex flex-wrap gap-2">
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
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 ${
                        selectedMonths.includes(index + 1)
                          ? "border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMonths.includes(index + 1)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMonths((prev) =>
                              prev.includes(index + 1)
                                ? prev
                                : [...prev, index + 1]
                            );
                          } else {
                            setSelectedMonths((prev) =>
                              prev.filter((m) => m !== index + 1)
                            );
                          }
                        }}
                        className="sr-only"
                      />
                      {month}
                    </label>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={appointmentData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#94a3b8" 
                      tick={{ fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      tick={{ fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        padding: '12px 16px',
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="url(#barGradient)" 
                      radius={[10, 10, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CONSULTATION PIE CHART */}
            <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  Consultation Breakdown
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Service type distribution
                </p>
              </div>

              <div className="p-6">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={consultationData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      strokeWidth={3}
                    >
                      {consultationData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                          stroke="white"
                        />
                      ))}
                    </Pie>

                    <Legend 
                      verticalAlign="bottom" 
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-sm font-medium text-slate-700">{value}</span>
                      )}
                    />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-6 space-y-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white p-5 border border-slate-100">
                  {highestService && (
                    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 p-2.5 text-emerald-600">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Most Popular
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {highestService.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-base font-bold text-emerald-600">
                        {highestService.percentage}%
                      </span>
                    </div>
                  )}

                  {lowestService && (
                    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm border border-rose-100">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-rose-100 to-rose-50 p-2.5 text-rose-500">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                            Least Popular
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {lowestService.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-base font-bold text-rose-500">
                        {lowestService.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TODAY'S APPOINTMENTS TABLE */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Today&apos;s Appointments — Centra Clinic PH
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Scheduled patient visits for today
              </p>
            </div>

            <button
              onClick={fetchTodayAppointments}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh List
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-400">
                <CalendarDays className="h-8 w-8" />
              </div>
              <p className="text-lg font-semibold text-slate-600">
                No appointments for today
              </p>
              <p className="mt-2 text-sm text-slate-400">
                New appointments will appear here automatically
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-white text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Patient Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Appointment Time
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Service Type
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {todayAppointments.map((appointment, index) => (
                    <tr
                      key={appointment.id}
                      className="transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-transparent"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-700 font-bold text-sm shadow-sm">
                            {appointment.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900">
                            {appointment.fullName}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          {appointment.appointmentTime}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {appointment.serviceType}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                            appointment.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : appointment.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            appointment.status === "CONFIRMED"
                              ? "bg-emerald-500"
                              : appointment.status === "PENDING"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`} />
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