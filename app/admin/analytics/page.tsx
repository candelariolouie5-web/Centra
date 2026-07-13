"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  BarChart3,
  CalendarDays,
  RefreshCcw,
  TrendingUp,
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  UserCheck,
  Stethoscope,
  Shield,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Filter,
  Search,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Cell } from "recharts";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
  ssr: false,
});

const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});

const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});

const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});

const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);

const Line = dynamic(() => import("recharts").then((mod) => mod.Line), {
  ssr: false,
});

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

const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), {
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

type BusinessServiceStat = {
  name: string;
  count: number;
  percentage: number;
};

type BusinessDayStat = {
  day: string;
  count: number;
  percentage: number;
};

type BusinessTimeStat = {
  timeBlock: string;
  count: number;
  percentage: number;
};

type StatusBreakdownItem = {
  status: string;
  count: number;
  percentage: number;
};

type DoctorWorkloadItem = {
  doctorId: string;
  doctorName: string;
  count: number;
  percentage: number;
};

type BusinessInsights = {
  generatedAt: string;
  currentMonthLabel: string;
  previousMonthLabel: string;
  currentMonthBookings: number;
  previousMonthBookings: number;
  bookingGrowthPercentage: number;
  growthDirection: "up" | "down" | "flat";
  topService: BusinessServiceStat | null;
  lowestService: BusinessServiceStat | null;
  busiestDay: BusinessDayStat | null;
  peakTime: BusinessTimeStat | null;
  cancellationRate: number;
  cancelledOrRejectedCount: number;
  statusBreakdown: StatusBreakdownItem[];
  serviceStats: BusinessServiceStat[];
  dayStats: BusinessDayStat[];
  timeBlockStats: BusinessTimeStat[];
  doctorWorkload: DoctorWorkloadItem[];
  recommendations: string[];
};

const COLORS = [
  "#06b6d4",
  "#2563eb",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];

const CLINIC_TIME_BLOCKS = [
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
];

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getHourFromAppointmentTime(time?: string | null) {
  if (!time) return null;

  const cleaned = time.trim().toUpperCase();

  const amPmMatch = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);

  if (amPmMatch) {
    let hour = Number(amPmMatch[1]);
    const period = amPmMatch[3];

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return hour;
  }

  const twentyFourHourMatch = cleaned.match(/^(\d{1,2})(?::(\d{2}))?/);

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    if (hour >= 0 && hour <= 23) return hour;
  }

  return null;
}

function getTimeBlock(time?: string | null) {
  const hour = getHourFromAppointmentTime(time);

  if (hour === null) return "Unspecified";

  if (hour >= 8 && hour < 9) return "8:00 AM - 9:00 AM";
  if (hour >= 9 && hour < 10) return "9:00 AM - 10:00 AM";
  if (hour >= 10 && hour < 11) return "10:00 AM - 11:00 AM";
  if (hour >= 11 && hour < 12) return "11:00 AM - 12:00 PM";
  if (hour >= 12 && hour < 13) return "12:00 PM - 1:00 PM";
  if (hour >= 13 && hour < 14) return "1:00 PM - 2:00 PM";
  if (hour >= 14 && hour < 15) return "2:00 PM - 3:00 PM";
  if (hour >= 15 && hour < 16) return "3:00 PM - 4:00 PM";
  if (hour >= 16 && hour < 17) return "4:00 PM - 5:00 PM";

  return "Outside Clinic Hours";
}

function groupCount<T>(
  items: T[],
  getKey: (item: T) => string
): { name: string; count: number }[] {
  const map = new Map<string, number>();

  for (const item of items) {
    const key = getKey(item) || "N/A";
    map.set(key, (map.get(key) || 0) + 1);
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

async function safeJsonFetch(url: string) {
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const text = await res.text();

  try {
    const json = JSON.parse(text);
    return { ok: res.ok, json };
  } catch {
    console.error(`[INVALID_JSON_RESPONSE] ${url}`, text.slice(0, 300));

    return {
      ok: false,
      json: {
        error:
          "This API returned HTML instead of JSON. Please check that the route.ts file is inside app/api.",
      },
    };
  }
}

function ChartCard({
  title,
  description,
  children,
  height = 330,
  icon,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  height?: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            {icon && <span className="text-cyan-600">{icon}</span>}
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        <div className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition-colors group-hover:bg-cyan-50 group-hover:text-cyan-600">
          <BarChart3 className="h-4 w-4" />
        </div>
      </div>

      <div style={{ width: "100%", height }}>{children}</div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {trend !== undefined && (
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span
                className={`flex items-center gap-0.5 font-medium ${
                  isPositive
                    ? "text-emerald-600"
                    : isNegative
                    ? "text-rose-600"
                    : "text-slate-400"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : isNegative ? (
                  <ArrowDownRight className="h-3 w-3" />
                ) : null}
                {trend}%
              </span>
              {trendLabel && (
                <span className="text-slate-400">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 p-3 text-cyan-700 transition-transform group-hover:scale-110">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: session } = useSession();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedMonths, setSelectedMonths] = useState([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  ]);

  const [year, setYear] = useState(new Date().getFullYear());

  const [appointmentData, setAppointmentData] = useState<AppointmentBarItem[]>(
    []
  );

  const [consultationData, setConsultationData] = useState<ConsultationItem[]>(
    []
  );

  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>(
    []
  );

  const [highestService, setHighestService] = useState<ServiceStat | null>(null);
  const [lowestService, setLowestService] = useState<ServiceStat | null>(null);
  const [totalConsultations, setTotalConsultations] = useState(0);

  const [businessInsights, setBusinessInsights] =
    useState<BusinessInsights | null>(null);

  const [apiError, setApiError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAppointmentData = useCallback(async () => {
    const { ok, json } = await safeJsonFetch(
      `/api/admin/dashboard/appointments?year=${year}&months=${selectedMonths.join(
        ","
      )}`
    );

    if (ok) {
      setAppointmentData(Array.isArray(json.data) ? json.data : []);
    } else {
      setApiError(json.error || "Failed to load appointment data.");
    }
  }, [selectedMonths, year]);

  const fetchTodayAppointments = useCallback(async () => {
    const { ok, json } = await safeJsonFetch(
      "/api/admin/dashboard/today-appointments"
    );

    if (ok) {
      setTodayAppointments(
        Array.isArray(json.appointments) ? json.appointments : []
      );
    } else {
      setApiError(json.error || "Failed to load today's appointments.");
    }
  }, []);

  const fetchConsultationData = useCallback(async () => {
    const { ok, json } = await safeJsonFetch(
      "/api/admin/dashboard/consultations"
    );

    if (ok) {
      setConsultationData(Array.isArray(json.data) ? json.data : []);
      setHighestService(json.highestService || null);
      setLowestService(json.lowestService || null);
      setTotalConsultations(toNumber(json.totalBookings));
    } else {
      setApiError(json.error || "Failed to load consultation data.");
    }
  }, []);

  const fetchBusinessInsights = useCallback(async () => {
    const { ok, json } = await safeJsonFetch(
      "/api/admin/dashboard/business-insights"
    );

    if (ok) {
      setBusinessInsights(json);
    } else {
      setApiError(json.error || "Failed to load business insights.");
    }
  }, []);

  const refreshAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");

      await Promise.all([
        fetchAppointmentData(),
        fetchTodayAppointments(),
        fetchConsultationData(),
        fetchBusinessInsights(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [
    fetchAppointmentData,
    fetchTodayAppointments,
    fetchConsultationData,
    fetchBusinessInsights,
  ]);

  useEffect(() => {
    if (mounted) {
      void refreshAnalytics();
    }
  }, [mounted, refreshAnalytics]);

  const totalBookedAppointments = useMemo(() => {
    return appointmentData.reduce((sum, item) => sum + toNumber(item.count), 0);
  }, [appointmentData]);

  const uniquePatientsToday = useMemo(() => {
    return new Set(todayAppointments.map((item) => item.fullName)).size;
  }, [todayAppointments]);

  const todayStatusData = useMemo(() => {
    return groupCount(todayAppointments, (item) => normalizeStatus(item.status));
  }, [todayAppointments]);

  const todayServiceData = useMemo(() => {
    return groupCount(todayAppointments, (item) => item.serviceType || "N/A");
  }, [todayAppointments]);

  const todayTimeData = useMemo(() => {
    const map = new Map<string, number>();

    for (const block of CLINIC_TIME_BLOCKS) {
      map.set(block, 0);
    }

    for (const appointment of todayAppointments) {
      const block = getTimeBlock(appointment.appointmentTime);

      if (map.has(block)) {
        map.set(block, (map.get(block) || 0) + 1);
      }
    }

    return CLINIC_TIME_BLOCKS.map((name) => ({
      name,
      count: map.get(name) || 0,
    }));
  }, [todayAppointments]);

  const bookingComparisonData = useMemo(() => {
    if (!businessInsights) return [];

    return [
      {
        name: businessInsights.previousMonthLabel,
        bookings: businessInsights.previousMonthBookings,
      },
      {
        name: businessInsights.currentMonthLabel,
        bookings: businessInsights.currentMonthBookings,
      },
    ];
  }, [businessInsights]);

  const serviceDemandData = useMemo(() => {
    return businessInsights?.serviceStats || [];
  }, [businessInsights]);

  const dayDemandData = useMemo(() => {
    return businessInsights?.dayStats || [];
  }, [businessInsights]);

  const timeDemandData = useMemo(() => {
    return businessInsights?.timeBlockStats || [];
  }, [businessInsights]);

  const statusData = useMemo(() => {
    return businessInsights?.statusBreakdown || [];
  }, [businessInsights]);

  const doctorWorkloadData = useMemo(() => {
    return businessInsights?.doctorWorkload || [];
  }, [businessInsights]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
              <Activity className="h-6 w-6 text-cyan-600" />
              Analytics
            </h1>
            <p className="text-sm text-slate-500">
              Graph-based business analysis for bookings, services, schedules,
              cancellations, and doctor workload.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
              <CalendarDays className="h-4 w-4 text-cyan-600" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <button
              onClick={refreshAnalytics}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:from-cyan-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              {loading ? "Refreshing..." : "Refresh Analytics"}
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-6 p-6">
        {apiError && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {apiError}
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-xl shadow-cyan-600/5">
          <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 px-6 py-8 text-white md:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.05),_transparent_40%)]" />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
                  <BarChart3 className="h-4 w-4" />
                  Business Analytics
                </div>

                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Clinic Performance Through Data
                </h2>

                <p className="mt-2 max-w-3xl text-sm text-cyan-50/90 md:text-base">
                  Use these visual reports to identify high-demand services, peak
                  one-hour clinic sessions, booking growth, cancellation behavior,
                  and workload patterns.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-center backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">
                    Bookings
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {totalBookedAppointments}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-center backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">
                    Today
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {uniquePatientsToday}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-center backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">
                    Growth
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {businessInsights
                      ? `${businessInsights.bookingGrowthPercentage}%`
                      : "0%"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Selected Bookings"
            value={totalBookedAppointments}
            icon={<CalendarDays className="h-5 w-5" />}
            trend={businessInsights?.bookingGrowthPercentage}
            trendLabel="vs last month"
          />

          <MetricCard
            label="Patients Today"
            value={uniquePatientsToday}
            icon={<Users className="h-5 w-5" />}
          />

          <MetricCard
            label="Consultations"
            value={totalConsultations}
            icon={<Activity className="h-5 w-5" />}
          />

          <MetricCard
            label="Cancellation Rate"
            value={businessInsights ? `${businessInsights.cancellationRate}%` : "0%"}
            icon={<XCircle className="h-5 w-5" />}
            trend={
              businessInsights
                ? Math.round((businessInsights.cancellationRate || 0) * 10) / 10
                : 0
            }
            trendLabel="rate"
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Filter className="h-5 w-5 text-cyan-600" />
                Monthly Booking Filter
              </h3>

              <p className="text-sm text-slate-500">
                Select months and year to update the booking trend graphs.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
              <span className="text-sm font-medium text-slate-500">Year</span>

              <input
                type="number"
                value={year}
                onChange={(e) =>
                  setYear(parseInt(e.target.value) || new Date().getFullYear())
                }
                className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
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
                key={month}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedMonths.includes(index + 1)
                    ? "border-cyan-400 bg-cyan-50 text-cyan-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedMonths.includes(index + 1)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMonths((prev) =>
                        prev.includes(index + 1) ? prev : [...prev, index + 1]
                      );
                    } else {
                      setSelectedMonths((prev) =>
                        prev.filter((item) => item !== index + 1)
                      );
                    }
                  }}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-cyan-600 focus:ring-2 focus:ring-cyan-200"
                />

                {month}
              </label>
            ))}
          </div>
        </section>

        {mounted && (
          <>
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartCard
                title="Monthly Appointment Trend"
                description="Line graph showing booked appointments by month."
                icon={<TrendingUp className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appointmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Bookings"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Monthly Appointment Volume"
                description="Bar graph showing appointment volume by month."
                icon={<BarChart3 className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Bookings"
                      fill="#06b6d4"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartCard
                title="This Month vs Last Month"
                description="Booking comparison between the current and previous month."
                icon={<Calendar className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="bookings"
                      name="Bookings"
                      fill="#2563eb"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Consultation Service Distribution"
                description="Pie graph showing service share across consultations."
                icon={<Stethoscope className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={consultationData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      label
                    >
                      {consultationData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartCard
                title="Service Demand Ranking"
                description={`Top: ${
                  highestService?.name ||
                  businessInsights?.topService?.name ||
                  "N/A"
                } | Bottom: ${
                  lowestService?.name ||
                  businessInsights?.lowestService?.name ||
                  "N/A"
                }`}
                icon={<Award className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceDemandData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#64748b"
                      width={130}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Bookings"
                      fill="#22c55e"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Appointment Status Breakdown"
                description="Distribution of pending, confirmed, accepted, rejected, and cancelled bookings."
                icon={<CheckCircle2 className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={105}
                      label
                    >
                      {statusData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartCard
                title="Busiest Booking Days"
                description="Graph showing which weekdays receive the most bookings."
                icon={<CalendarDays className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayDemandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Bookings"
                      fill="#f59e0b"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Peak Booking Sessions"
                description="One-hour clinic sessions from 8:00 AM to 5:00 PM."
                icon={<Clock className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeDemandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="timeBlock"
                      stroke="#64748b"
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={90}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke="#64748b" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Bookings"
                      fill="#ec4899"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ChartCard
                title="Doctor Workload"
                description="Assigned appointment volume per doctor."
                icon={<Shield className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={doctorWorkloadData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="doctorName"
                      stroke="#64748b"
                      width={150}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Appointments"
                      fill="#8b5cf6"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Cancellation / Rejection Rate"
                description="Visual indicator of cancelled and rejected bookings."
                icon={<XCircle className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Cancelled / Rejected",
                          value: businessInsights?.cancelledOrRejectedCount || 0,
                        },
                        {
                          name: "Other Bookings",
                          value: Math.max(
                            (businessInsights?.currentMonthBookings || 0) -
                              (businessInsights?.cancelledOrRejectedCount || 0),
                            0
                          ),
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={105}
                      label
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#06b6d4" />
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <ChartCard
                title="Today's Status Graph"
                description="Status distribution for today's appointments."
                height={280}
                icon={<CheckCircle2 className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={todayStatusData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {todayStatusData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Today's Service Graph"
                description="Service demand for today."
                height={280}
                icon={<Stethoscope className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={todayServiceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Appointments"
                      fill="#14b8a6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard
                title="Today's One-Hour Sessions"
                description="Today’s appointments grouped by 8 AM to 5 PM sessions."
                height={280}
                icon={<Clock className="h-5 w-5" />}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={todayTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis stroke="#64748b" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Appointments"
                      fill="#2563eb"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>
          </>
        )}
      </main>
    </div>
  );
}