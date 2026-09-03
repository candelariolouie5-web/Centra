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
  Sparkles,
  HeartPulse,
  Hospital,
  Brain,
  Ear,
  Eye,
  Bone,
  Printer,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Cell } from "recharts";

// ─── Dynamic imports ───
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

// ─── TYPES ───
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

type ClinicalFindingItem = {
  anatomy: string;
  diagnosis: string;
  count: number;
};

type PrescriptionStats = {
  totalPrescriptions: number;
  topMeds: { name: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
};

type AgeDistribution = {
  ageGroups: { group: string; count: number }[];
  avgAge: number;
};

type GenderDistribution = {
  genderData: { name: string; count: number }[];
};

// ─── COLOR SCHEMES ───
const COLOR_SCHEMES = [
  { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", dot: "bg-indigo-500", fill: "#6366f1" },
  { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-500", fill: "#10b981" },
  { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", dot: "bg-amber-500", fill: "#f59e0b" },
  { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", dot: "bg-rose-500", fill: "#f43f5e" },
  { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", dot: "bg-violet-500", fill: "#8b5cf6" },
  { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200", dot: "bg-teal-500", fill: "#14b8a6" },
  { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200", dot: "bg-cyan-500", fill: "#06b6d4" },
  { bg: "bg-fuchsia-50", text: "text-fuchsia-600", border: "border-fuchsia-200", dot: "bg-fuchsia-500", fill: "#d946ef" },
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

// ─── UTILITIES ───
function toNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeStatus(status: string): string {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getHourFromAppointmentTime(time?: string | null): number | null {
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

function getTimeBlock(time?: string | null): string {
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

async function safeJsonFetch(url: string): Promise<{ ok: boolean; json: any }> {
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

// ─── COMPONENTS ───

function SimpleChartCard({
  title,
  subtitle,
  children,
  height = 300,
  colorIndex = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
  colorIndex?: number;
}) {
  const scheme = COLOR_SCHEMES[colorIndex % COLOR_SCHEMES.length];
  return (
    <div className={`rounded-xl border ${scheme.border} bg-white p-5 shadow-sm transition-shadow hover:shadow-md`}>
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`h-2 w-2 rounded-full ${scheme.dot}`} />
      </div>
      <div style={{ width: "100%", height }}>{children}</div>
    </div>
  );
}

function SimpleMetricCard({
  label,
  value,
  subLabel,
  icon,
  colorIndex = 0,
}: {
  label: string;
  value: string | number;
  subLabel?: string;
  icon?: React.ReactNode;
  colorIndex?: number;
}) {
  const scheme = COLOR_SCHEMES[colorIndex % COLOR_SCHEMES.length];
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subLabel && <p className="text-xs text-gray-400">{subLabel}</p>}
        </div>
        {icon && (
          <div className={`rounded-lg ${scheme.bg} p-2.5`}>
            <div className={`h-5 w-5 ${scheme.text}`}>{icon}</div>
          </div>
        )}
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full ${scheme.bg}`} />
    </div>
  );
}

// ─── MAIN COMPONENT ───
export default function AnalyticsPage() {
  const { data: session } = useSession();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedMonths, setSelectedMonths] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  ]);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const [appointmentData, setAppointmentData] = useState<AppointmentBarItem[]>([]);
  const [consultationData, setConsultationData] = useState<ConsultationItem[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [highestService, setHighestService] = useState<ServiceStat | null>(null);
  const [lowestService, setLowestService] = useState<ServiceStat | null>(null);
  const [totalConsultations, setTotalConsultations] = useState<number>(0);
  const [businessInsights, setBusinessInsights] = useState<BusinessInsights | null>(null);
  const [findingsData, setFindingsData] = useState<ClinicalFindingItem[]>([]);
  const [apiError, setApiError] = useState<string>("");
  const [prescriptionStats, setPrescriptionStats] = useState<PrescriptionStats | null>(null);
  const [ageDistribution, setAgeDistribution] = useState<AgeDistribution | null>(null);
  const [genderDistribution, setGenderDistribution] = useState<GenderDistribution | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAppointmentData = useCallback(async () => {
    const { ok, json } = await safeJsonFetch(
      `/api/admin/dashboard/appointments?year=${year}&months=${selectedMonths.join(",")}`
    );
    if (ok) {
      setAppointmentData(Array.isArray(json.data) ? json.data : []);
    } else {
      setApiError(json.error || "Failed to load appointment data.");
    }
  }, [selectedMonths, year]);

  const fetchTodayAppointments = useCallback(async () => {
    const { ok, json } = await safeJsonFetch("/api/admin/dashboard/today-appointments");
    if (ok) {
      setTodayAppointments(Array.isArray(json.appointments) ? json.appointments : []);
    } else {
      setApiError(json.error || "Failed to load today's appointments.");
    }
  }, []);

  const fetchConsultationData = useCallback(async () => {
    const { ok, json } = await safeJsonFetch("/api/admin/dashboard/consultations");
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
    const { ok, json } = await safeJsonFetch("/api/admin/dashboard/business-insights");
    if (ok) {
      setBusinessInsights(json);
    } else {
      setApiError(json.error || "Failed to load business insights.");
    }
  }, []);

  const fetchFindingsData = useCallback(async () => {
    const { ok, json } = await safeJsonFetch("/api/admin/dashboard/findings");
    if (ok) {
      setFindingsData(Array.isArray(json.data) ? json.data : []);
    } else {
      console.warn("Failed to load findings data:", json.error);
    }
  }, []);

  const fetchPrescriptionStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard/prescription-stats", {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setPrescriptionStats(data);
      } else {
        console.warn("Failed to fetch prescription stats:", data.error);
      }
    } catch (error) {
      console.error("Error fetching prescription stats:", error);
    }
  }, []);

  const fetchAgeDistribution = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard/age-distribution", {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setAgeDistribution(data);
      } else {
        console.warn("Failed to fetch age distribution:", data.error);
      }
    } catch (error) {
      console.error("Error fetching age distribution:", error);
    }
  }, []);

  const fetchGenderDistribution = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard/gender-distribution", {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setGenderDistribution(data);
      } else {
        console.warn("Failed to fetch gender distribution:", data.error);
      }
    } catch (error) {
      console.error("Error fetching gender distribution:", error);
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
        fetchFindingsData(),
        fetchPrescriptionStats(),
        fetchAgeDistribution(),
        fetchGenderDistribution(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [
    fetchAppointmentData,
    fetchTodayAppointments,
    fetchConsultationData,
    fetchBusinessInsights,
    fetchFindingsData,
    fetchPrescriptionStats,
    fetchAgeDistribution,
    fetchGenderDistribution,
  ]);

  useEffect(() => {
    if (mounted) {
      void refreshAnalytics();
    }
  }, [mounted, refreshAnalytics]);

  // ─── PRINT FUNCTION ───
  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) {
      alert('Please allow popups for this site to print.');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString();

    // ─── GROUP CONSULTATION DATA ───
    const consultMap = new Map<string, number>();
    consultationData.forEach((item) => {
      const name = item.name.trim();
      consultMap.set(name, (consultMap.get(name) || 0) + item.value);
    });
    const uniqueConsultation = Array.from(consultMap.entries()).map(([name, value]) => ({ name, value }));

    // ─── GROUP STATUS DATA ───
    const statusMap = new Map<string, { count: number; status: string }>();
    if (businessInsights?.statusBreakdown) {
      businessInsights.statusBreakdown.forEach((item) => {
        let key = item.status.toLowerCase().trim();
        if (['cancelled', 'rejected', 'cancelled/rejected', 'rejected/cancelled'].includes(key)) {
          key = 'cancelled/rejected';
        } else if (['confirmed', 'completed', 'done', 'finished'].includes(key)) {
          key = 'confirmed/completed';
        } else if (['pending', 'scheduled', 'waiting', 'booked'].includes(key)) {
          key = 'pending/scheduled';
        }
        const display = key.split('/').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ');
        if (statusMap.has(key)) {
          statusMap.get(key)!.count += item.count;
        } else {
          statusMap.set(key, { count: item.count, status: display });
        }
      });
    }
    const groupedStatus = Array.from(statusMap.values());

    // ─── TODAY DATA ───
    const todayStatusMap = new Map<string, number>();
    todayAppointments.forEach((item) => {
      const s = normalizeStatus(item.status);
      todayStatusMap.set(s, (todayStatusMap.get(s) || 0) + 1);
    });
    const todayStatus = Array.from(todayStatusMap.entries()).map(([name, count]) => ({ name, count }));

    const todayServiceMap = new Map<string, number>();
    todayAppointments.forEach((item) => {
      const s = item.serviceType || "N/A";
      todayServiceMap.set(s, (todayServiceMap.get(s) || 0) + 1);
    });
    const todayService = Array.from(todayServiceMap.entries()).map(([name, count]) => ({ name, count }));

    const todayTimeMap = new Map<string, number>();
    todayAppointments.forEach((item) => {
      const b = getTimeBlock(item.appointmentTime);
      todayTimeMap.set(b, (todayTimeMap.get(b) || 0) + 1);
    });
    const todayTime = Array.from(todayTimeMap.entries()).map(([name, count]) => ({ name, count }));

    // ─── METRICS ───
    const totalBookings = appointmentData.reduce((sum, item) => sum + toNumber(item.count), 0);
    const uniquePatients = new Set(todayAppointments.map((item) => item.fullName)).size;
    const cancellationRate = businessInsights?.cancellationRate || 0;

    // ─── BUILD HTML ───
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Centra Clinic - Analytics Report</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; padding:30px; background:#f1f5f9; color:#0f172a; }
    .container { max-width:1100px; margin:0 auto; background:white; border-radius:16px; padding:35px; box-shadow:0 4px 24px rgba(0,0,0,0.06); }
    .header { text-align:center; border-bottom:2px solid #e2e8f0; padding-bottom:20px; margin-bottom:28px; }
    .header .clinic { color:#6366f1; font-weight:700; font-size:14px; letter-spacing:1px; }
    .header h1 { font-size:24px; font-weight:700; margin:4px 0; }
    .header p { color:#64748b; font-size:13px; }
    .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }
    .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; }
    .grid-4-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
    .card { border:1px solid #e2e8f0; border-radius:12px; padding:14px 18px; background:#f8fafc; }
    .card .lbl { font-size:10px; text-transform:uppercase; font-weight:600; color:#64748b; letter-spacing:0.5px; }
    .card .val { font-size:26px; font-weight:700; color:#0f172a; margin-top:3px; }
    .card .sub { font-size:11px; color:#94a3b8; margin-top:2px; }
    .section { margin-bottom:26px; }
    .section-title { display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:6px; margin-bottom:10px; }
    .section-title h2 { font-size:17px; font-weight:600; }
    .section-title .badge { font-size:11px; background:#e2e8f0; padding:2px 12px; border-radius:20px; color:#475569; }
    .subtitle { font-size:12px; color:#64748b; margin-bottom:10px; }
    .chart-box { border:1px solid #e2e8f0; border-radius:12px; padding:14px 18px; background:white; }
    .chart-box h3 { font-size:13px; font-weight:600; margin-bottom:2px; }
    .chart-box .sub { font-size:11px; color:#94a3b8; margin-bottom:8px; }
    .bar-container { display:flex; flex-direction:column; gap:5px; }
    .bar-row { display:flex; align-items:center; gap:8px; }
    .bar-label { width:100px; font-size:12px; font-weight:500; flex-shrink:0; text-align:right; }
    .bar-track { flex:1; height:20px; background:#f1f5f9; border-radius:4px; overflow:hidden; }
    .bar-fill { height:100%; border-radius:4px; }
    .bar-val { font-size:12px; font-weight:600; width:32px; flex-shrink:0; }
    .tag-wrap { display:flex; flex-wrap:wrap; gap:6px; padding:4px 0; }
    .tag { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:16px; font-size:12px; font-weight:500; border:1px solid #e2e8f0; background:#f8fafc; }
    .tag-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .tag-pct { color:#64748b; font-weight:400; font-size:11px; }
    .findings-list { font-size:12px; margin-top:4px; }
    .findings-row { display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px solid #f1f5f9; }
    .findings-row:last-child { border-bottom:none; }
    .findings-row .cnt { font-weight:600; }
    .footer { margin-top:28px; padding-top:14px; border-top:1px solid #e2e8f0; text-align:center; font-size:11px; color:#94a3b8; }
    @media print { body { padding:10px; background:white; } .container { box-shadow:none; padding:15px; } }
    @media (max-width:768px) { .grid-4{grid-template-columns:1fr 1fr;} .grid-2{grid-template-columns:1fr;} .grid-3{grid-template-columns:1fr;} .grid-4-cards{grid-template-columns:1fr 1fr;} .bar-label{width:70px;font-size:11px;} }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="clinic">🏥 CENTRA CLINIC</div>
    <h1>Analytics Report</h1>
    <p>Generated: ${dateStr} at ${timeStr}</p>
  </div>

  <div class="grid-4-cards">
    <div class="card"><div class="lbl">Total Bookings</div><div class="val">${totalBookings}</div><div class="sub">${businessInsights?.bookingGrowthPercentage||0}% vs last month</div></div>
    <div class="card"><div class="lbl">Patients Today</div><div class="val">${uniquePatients}</div></div>
    <div class="card"><div class="lbl">Consultations</div><div class="val">${totalConsultations}</div></div>
    <div class="card"><div class="lbl">Cancellation Rate</div><div class="val">${cancellationRate}%</div></div>
  </div>`;

    // ─── CONSULTATION ───
    if (uniqueConsultation.length > 0) {
      const total = uniqueConsultation.reduce((s, i) => s + i.value, 0);
      html += `
  <div class="section">
    <div class="section-title"><h2>Consultation Service Distribution</h2><span class="badge">${uniqueConsultation.length} services</span></div>
    <div class="subtitle">Service mix breakdown</div>
    <div class="chart-box">
      <div class="tag-wrap">`;
      uniqueConsultation.forEach((item, i) => {
        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
        const color = COLOR_SCHEMES[(i + 3) % COLOR_SCHEMES.length].fill;
        html += `<span class="tag"><span class="tag-dot" style="background:${color}"></span>${item.name} <span class="tag-pct">(${pct}%)</span></span>`;
      });
      html += `</div></div></div>`;
    }

    // ─── STATUS ───
    if (groupedStatus.length > 0) {
      const total = groupedStatus.reduce((s, i) => s + i.count, 0);
      html += `
  <div class="section">
    <div class="section-title"><h2>Appointment Status Breakdown</h2><span class="badge">${groupedStatus.length} statuses</span></div>
    <div class="subtitle">Current status distribution</div>
    <div class="chart-box">
      <div class="tag-wrap">`;
      groupedStatus.forEach((item, i) => {
        const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
        const color = COLOR_SCHEMES[(i + 5) % COLOR_SCHEMES.length].fill;
        html += `<span class="tag"><span class="tag-dot" style="background:${color}"></span>${item.status} <span class="tag-pct">(${pct}%)</span></span>`;
      });
      html += `</div></div></div>`;
    }

    // ─── SERVICE DEMAND ───
    if (businessInsights?.serviceStats && businessInsights.serviceStats.length > 0) {
      const maxVal = Math.max(...businessInsights.serviceStats.map(s => s.count));
      html += `
  <div class="section">
    <div class="section-title"><h2>Service Demand Ranking</h2><span class="badge">Most booked</span></div>
    <div class="subtitle">Popularity of services</div>
    <div class="chart-box">
      <div class="bar-container">`;
      businessInsights.serviceStats.forEach((item) => {
        const pct = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
        html += `
        <div class="bar-row">
          <span class="bar-label">${item.name}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:#8b5cf6"></div></div>
          <span class="bar-val">${item.count}</span>
        </div>`;
      });
      html += `</div></div></div>`;
    }

    // ─── BUSIEST DAYS ───
    if (businessInsights?.dayStats && businessInsights.dayStats.length > 0) {
      const maxVal = Math.max(...businessInsights.dayStats.map(d => d.count));
      html += `
  <div class="section">
    <div class="section-title"><h2>Busiest Booking Days</h2><span class="badge">Weekly</span></div>
    <div class="subtitle">Day-of-week popularity</div>
    <div class="chart-box">
      <div class="bar-container">`;
      businessInsights.dayStats.forEach((item) => {
        const pct = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
        html += `
        <div class="bar-row">
          <span class="bar-label">${item.day}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:#14b8a6"></div></div>
          <span class="bar-val">${item.count}</span>
        </div>`;
      });
      html += `</div></div></div>`;
    }

    // ─── PEAK HOURS ───
    if (businessInsights?.timeBlockStats && businessInsights.timeBlockStats.length > 0) {
      const maxVal = Math.max(...businessInsights.timeBlockStats.map(t => t.count));
      html += `
  <div class="section">
    <div class="section-title"><h2>Peak Booking Sessions</h2><span class="badge">Time slots</span></div>
    <div class="subtitle">Time-of-day distribution</div>
    <div class="chart-box">
      <div class="bar-container">`;
      businessInsights.timeBlockStats.forEach((item) => {
        const pct = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
        html += `
        <div class="bar-row">
          <span class="bar-label" style="width:130px;font-size:11px;">${item.timeBlock}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:#06b6d4"></div></div>
          <span class="bar-val">${item.count}</span>
        </div>`;
      });
      html += `</div></div></div>`;
    }

    // ─── DOCTOR WORKLOAD ───
    if (businessInsights?.doctorWorkload && businessInsights.doctorWorkload.length > 0) {
      const maxVal = Math.max(...businessInsights.doctorWorkload.map(d => d.count));
      html += `
  <div class="section">
    <div class="section-title"><h2>Doctor Workload</h2><span class="badge">Appointments</span></div>
    <div class="subtitle">Appointments per doctor</div>
    <div class="chart-box">
      <div class="bar-container">`;
      businessInsights.doctorWorkload.forEach((item) => {
        const pct = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
        html += `
        <div class="bar-row">
          <span class="bar-label">${item.doctorName}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:#6366f1"></div></div>
          <span class="bar-val">${item.count}</span>
        </div>`;
      });
      html += `</div></div></div>`;
    }

    // ─── CLINICAL FINDINGS ───
    if (findingsData.length > 0) {
      const parts = ['ear','nose','throat','head'];
      const labels = ['Ear','Nose','Throat','Head'];
      const emojis = ['👂','👃','🗣️','🧠'];
      html += `
  <div class="section">
    <div class="section-title"><h2>Clinical Findings per Body Part</h2><span class="badge">${findingsData.length} findings</span></div>
    <div class="subtitle">Distribution of diagnoses</div>
    <div class="grid-4-cards">`;
      parts.forEach((part, idx) => {
        const data = findingsData.filter(f => f.anatomy.toLowerCase() === part);
        const total = data.reduce((s, d) => s + d.count, 0);
        html += `
      <div class="chart-box">
        <h3>${emojis[idx]} ${labels[idx]}</h3>
        <div class="sub">${total} findings</div>
        <div class="findings-list">`;
        if (data.length > 0) {
          data.forEach((item) => {
            const pct = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
            html += `<div class="findings-row"><span>${item.diagnosis}</span><span class="cnt">${item.count} (${pct}%)</span></div>`;
          });
        } else {
          html += `<span style="color:#94a3b8;font-size:12px;">No findings</span>`;
        }
        html += `</div></div>`;
      });
      html += `</div></div>`;
    }

    // ─── PRESCRIPTION ───
    if (prescriptionStats) {
      html += `
  <div class="section">
    <div class="section-title"><h2>Prescription Analytics</h2><span class="badge">${prescriptionStats.totalPrescriptions} total</span></div>
    <div class="grid-2">`;
      const maxMed = prescriptionStats.topMeds.length > 0 ? Math.max(...prescriptionStats.topMeds.map(m => m.count)) : 1;
      html += `
      <div class="chart-box">
        <h3>Top Prescribed Medications</h3>
        <div class="sub">Most common prescriptions</div>
        <div class="bar-container" style="margin-top:6px;">`;
      prescriptionStats.topMeds.forEach((item) => {
        const pct = (item.count / maxMed) * 100;
        html += `
        <div class="bar-row">
          <span class="bar-label" style="width:110px;font-size:11px;">${item.name}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:#d946ef"></div></div>
          <span class="bar-val">${item.count}</span>
        </div>`;
      });
      html += `</div></div>`;
      const maxTrend = Math.max(...prescriptionStats.monthlyTrend.map(m => m.count));
      html += `
      <div class="chart-box">
        <h3>Prescription Trend</h3>
        <div class="sub">Last 6 months</div>
        <div class="bar-container" style="margin-top:6px;">`;
      prescriptionStats.monthlyTrend.forEach((item) => {
        const pct = maxTrend > 0 ? (item.count / maxTrend) * 100 : 0;
        html += `
        <div class="bar-row">
          <span class="bar-label" style="width:60px;font-size:11px;">${item.month}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:#06b6d4"></div></div>
          <span class="bar-val">${item.count}</span>
        </div>`;
      });
      html += `</div></div></div></div>`;
    }

    // ─── TODAY'S APPOINTMENTS ───
    if (todayAppointments.length > 0) {
      html += `
  <div class="section">
    <div class="section-title"><h2>Today's Appointments</h2><span class="badge">${todayAppointments.length} today</span></div>
    <div class="grid-3">`;
      html += `
      <div class="chart-box"><h3>Status</h3>`;
      todayStatus.forEach((item) => {
        const pct = todayAppointments.length > 0 ? ((item.count / todayAppointments.length) * 100).toFixed(0) : 0;
        html += `<div class="findings-row"><span>${item.name}</span><span class="cnt">${item.count} (${pct}%)</span></div>`;
      });
      html += `</div>`;
      html += `
      <div class="chart-box"><h3>Services</h3>`;
      todayService.forEach((item) => {
        const pct = todayAppointments.length > 0 ? ((item.count / todayAppointments.length) * 100).toFixed(0) : 0;
        html += `<div class="findings-row"><span>${item.name}</span><span class="cnt">${item.count} (${pct}%)</span></div>`;
      });
      html += `</div>`;
      html += `
      <div class="chart-box"><h3>Time Sessions</h3>`;
      todayTime.forEach((item) => {
        const pct = todayAppointments.length > 0 ? ((item.count / todayAppointments.length) * 100).toFixed(0) : 0;
        html += `<div class="findings-row"><span style="font-size:11px;">${item.name}</span><span class="cnt">${item.count} (${pct}%)</span></div>`;
      });
      html += `</div></div></div>`;
    }

    html += `
  <div class="footer">
    <p>Generated from Centra Clinic Analytics Dashboard • ${dateStr} at ${timeStr}</p>
    <p style="margin-top:3px;">This report is for internal use only.</p>
  </div>
</div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  }, [
    appointmentData,
    consultationData,
    todayAppointments,
    totalConsultations,
    businessInsights,
    findingsData,
    prescriptionStats,
  ]);

  // ─── MEMOIZED ───
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

  const earData = useMemo(() => {
    return findingsData
      .filter((f) => f.anatomy.toLowerCase() === "ear")
      .map((f) => ({ name: f.diagnosis, value: f.count }));
  }, [findingsData]);

  const noseData = useMemo(() => {
    return findingsData
      .filter((f) => f.anatomy.toLowerCase() === "nose")
      .map((f) => ({ name: f.diagnosis, value: f.count }));
  }, [findingsData]);

  const throatData = useMemo(() => {
    return findingsData
      .filter((f) => f.anatomy.toLowerCase() === "throat")
      .map((f) => ({ name: f.diagnosis, value: f.count }));
  }, [findingsData]);

  const headData = useMemo(() => {
    return findingsData
      .filter((f) => f.anatomy.toLowerCase() === "head")
      .map((f) => ({ name: f.diagnosis, value: f.count }));
  }, [findingsData]);

  const ageSummary = useMemo(() => {
    if (!ageDistribution) return null;
    const total = ageDistribution.ageGroups.reduce((s, g) => s + g.count, 0);
    const pediatric = ageDistribution.ageGroups.find(g => g.group === "0-12")?.count || 0;
    const adult = (ageDistribution.ageGroups.find(g => g.group === "13-19")?.count || 0) +
      (ageDistribution.ageGroups.find(g => g.group === "20-59")?.count || 0);
    const geriatric = ageDistribution.ageGroups.find(g => g.group === "60+")?.count || 0;
    return { total, pediatric, adult, geriatric };
  }, [ageDistribution]);

  const formatPercent = (percent: number | undefined): string => {
    if (percent === undefined || percent === null) return "0%";
    return `${(percent * 100).toFixed(0)}%`;
  };

  // ─── RENDER ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* HEADER */}
      <header className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Comprehensive business analysis for bookings, services, schedules, and clinical insights
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <button
            onClick={handlePrint}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
          <button
            onClick={refreshAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </header>

      <main className="space-y-6">
        {apiError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {apiError}
          </div>
        )}

        {/* METRIC CARDS */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SimpleMetricCard
            label="Total Bookings"
            value={totalBookedAppointments}
            subLabel={businessInsights ? `${businessInsights.bookingGrowthPercentage}% vs last month` : undefined}
            icon={<TrendingUp className="h-5 w-5" />}
            colorIndex={0}
          />
          <SimpleMetricCard
            label="Patients Today"
            value={uniquePatientsToday}
            icon={<Users className="h-5 w-5" />}
            colorIndex={1}
          />
          <SimpleMetricCard
            label="Consultations"
            value={totalConsultations}
            icon={<Stethoscope className="h-5 w-5" />}
            colorIndex={2}
          />
          <SimpleMetricCard
            label="Cancellation Rate"
            value={businessInsights ? `${businessInsights.cancellationRate}%` : "0%"}
            icon={<XCircle className="h-5 w-5" />}
            colorIndex={3}
          />
        </section>

        {/* PATIENT DEMOGRAPHICS */}
        {ageDistribution && genderDistribution && (
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Users className="h-4 w-4 text-amber-500" />
                  Patient Demographics
                  <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    Avg age: {ageDistribution.avgAge}
                  </span>
                </h3>
                <p className="text-xs text-gray-500">Age groups and gender distribution of patients.</p>
              </div>
            </div>

            {ageSummary && (
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-amber-700">Total Patients</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{ageSummary.total}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">Pediatric (0‑12)</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{ageSummary.pediatric}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-700">Adult (13‑59)</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{ageSummary.adult}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-rose-50 to-rose-100/50 p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-rose-700">Geriatric (60+)</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{ageSummary.geriatric}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SimpleChartCard title="" height={260} colorIndex={2}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageDistribution.ageGroups} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <YAxis type="category" dataKey="group" stroke="#9ca3af" fontSize={12} width={60} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }} />
                    <Bar dataKey="count" name="Patients" fill={COLOR_SCHEMES[2].fill} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SimpleChartCard>

              <SimpleChartCard title="" height={260} colorIndex={3}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderDistribution.genderData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${formatPercent(percent)})`}
                      labelLine={false}
                    >
                      {genderDistribution.genderData.map((_, index) => (
                        <Cell key={index} fill={COLOR_SCHEMES[(index + 3) % COLOR_SCHEMES.length].fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </SimpleChartCard>
            </div>
          </section>
        )}

        {/* MONTHLY FILTER */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Filter className="h-4 w-4 text-gray-400" />
                Monthly Filter
              </h3>
              <p className="text-xs text-gray-500">Select months to update the booking trend graphs.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Year</span>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => (
              <label
                key={month}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedMonths.includes(index + 1)
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedMonths.includes(index + 1)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMonths((prev) => (prev.includes(index + 1) ? prev : [...prev, index + 1]));
                    } else {
                      setSelectedMonths((prev) => prev.filter((item) => item !== index + 1));
                    }
                  }}
                  className="h-3 w-3 rounded border-gray-300 text-indigo-600"
                />
                {month}
              </label>
            ))}
          </div>
        </section>

        {mounted && (
          <>
            {/* CONSULTATION SERVICE DISTRIBUTION */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-1">
              <SimpleChartCard title="Consultation Service Distribution" subtitle="Service mix" colorIndex={3}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={consultationData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, percent }) => `${name} (${formatPercent(percent)})`}
                      labelLine={false}
                    >
                      {consultationData.map((_, index) => (
                        <Cell key={index} fill={COLOR_SCHEMES[(index + 3) % COLOR_SCHEMES.length].fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </SimpleChartCard>
            </section>

            {/* SERVICE DEMAND & STATUS */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <SimpleChartCard title="Service Demand Ranking" subtitle="Most booked services" colorIndex={4}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceDemandData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={100} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }} />
                    <Bar dataKey="count" name="Bookings" fill={COLOR_SCHEMES[4].fill} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SimpleChartCard>

              <SimpleChartCard title="Appointment Status Breakdown" subtitle="Current status distribution" colorIndex={5}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={90}
                      label={({ name, percent }) => `${name} (${formatPercent(percent)})`}
                      labelLine={false}
                    >
                      {statusData.map((_, index) => (
                        <Cell key={index} fill={COLOR_SCHEMES[(index + 5) % COLOR_SCHEMES.length].fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </SimpleChartCard>
            </section>

            {/* DAYS & TIME */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <SimpleChartCard title="Busiest Booking Days" subtitle="Day-of-week popularity" colorIndex={6}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayDemandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }} />
                    <Bar dataKey="count" name="Bookings" fill={COLOR_SCHEMES[6].fill} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SimpleChartCard>

              <SimpleChartCard title="Peak Booking Sessions" subtitle="Time-of-day distribution" colorIndex={7}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeDemandData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="timeBlock" stroke="#9ca3af" fontSize={10} interval={0} angle={-25} textAnchor="end" height={80} />
                    <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }} />
                    <Bar dataKey="count" name="Bookings" fill={COLOR_SCHEMES[7].fill} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SimpleChartCard>
            </section>

            {/* DOCTOR WORKLOAD & CANCELLATION */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <SimpleChartCard title="Doctor Workload" subtitle="Appointments per doctor" colorIndex={0}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={doctorWorkloadData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <YAxis type="category" dataKey="doctorName" stroke="#9ca3af" fontSize={11} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }} />
                    <Bar dataKey="count" name="Appointments" fill={COLOR_SCHEMES[0].fill} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SimpleChartCard>

              <SimpleChartCard title="Cancellation / Rejection Rate" subtitle="Lost bookings" colorIndex={1}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Cancelled / Rejected", value: businessInsights?.cancelledOrRejectedCount || 0 },
                        { name: "Other Bookings", value: Math.max((businessInsights?.currentMonthBookings || 0) - (businessInsights?.cancelledOrRejectedCount || 0), 0) },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={90}
                      label={({ name, percent }) => `${name} (${formatPercent(percent)})`}
                      labelLine={false}
                    >
                      <Cell fill={COLOR_SCHEMES[1].fill} />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </SimpleChartCard>
            </section>

            {/* CLINICAL FINDINGS */}
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Stethoscope className="h-4 w-4 text-gray-400" />
                    Clinical Findings per Body Part
                  </h3>
                  <p className="text-xs text-gray-500">Distribution of diagnoses for Ear, Nose, Throat, and Head.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Ear", data: earData, emoji: "👂", colorIndex: 2 },
                  { title: "Nose", data: noseData, emoji: "👃", colorIndex: 3 },
                  { title: "Throat", data: throatData, emoji: "🗣", colorIndex: 4 },
                  { title: "Head", data: headData, emoji: "🧠", colorIndex: 5 },
                ].map((item) => {
                  const scheme = COLOR_SCHEMES[item.colorIndex % COLOR_SCHEMES.length];
                  return (
                    <div
                      key={item.title}
                      className={`rounded-xl border ${scheme.border} bg-white p-4 shadow-sm transition-shadow hover:shadow-md`}
                    >
                      <h4 className="mb-3 text-center text-sm font-semibold text-gray-700">
                        {item.emoji} {item.title}
                        <span className="ml-1 text-xs font-normal text-gray-400">
                          ({item.data.reduce((sum, d) => sum + d.value, 0)})
                        </span>
                      </h4>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          {item.data.length > 0 ? (
                            <>
                              <Pie
                                data={item.data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={60}
                                label={({ name, percent }) => `${name} (${formatPercent(percent)})`}
                                labelLine={false}
                                fontSize={9}
                              >
                                {item.data.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLOR_SCHEMES[(index + item.colorIndex) % COLOR_SCHEMES.length].fill} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px 10px", fontSize: "11px" }} />
                              <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "9px", paddingTop: "4px" }} />
                            </>
                          ) : (
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="text-xs text-gray-400" fill="#9ca3af" fontSize="12">
                              No findings
                            </text>
                          )}
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* PRESCRIPTION ANALYTICS */}
            {prescriptionStats && (
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Stethoscope className="h-4 w-4 text-violet-500" />
                      Prescription Analytics
                      <span className="ml-2 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                        This month
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      Total prescriptions: <span className="font-bold text-gray-800">{prescriptionStats.totalPrescriptions}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-600">Top Prescribed Medications</h4>
                    <SimpleChartCard title="" height={240} colorIndex={6}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={prescriptionStats.topMeds} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis type="number" stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                          <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={120} />
                          <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }} />
                          <Bar dataKey="count" name="Prescriptions" fill={COLOR_SCHEMES[6].fill} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </SimpleChartCard>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-600">Prescription Trend (Last 6 Months)</h4>
                    <SimpleChartCard title="" height={240} colorIndex={7}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={prescriptionStats.monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                          <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                          <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }} />
                          <Line type="monotone" dataKey="count" name="Prescriptions" stroke={COLOR_SCHEMES[7].fill} strokeWidth={2.5} dot={{ r: 4, fill: COLOR_SCHEMES[7].fill }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </SimpleChartCard>
                  </div>
                </div>
              </section>
            )}

            {/* TODAY'S APPOINTMENTS */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <SimpleChartCard title="Today's Status" subtitle="Current status breakdown" colorIndex={0}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={todayStatusData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label={({ name, percent }) => `${name} (${formatPercent(percent)})`}
                      labelLine={false}
                    >
                      {todayStatusData.map((_, index) => (
                        <Cell key={index} fill={COLOR_SCHEMES[(index + 0) % COLOR_SCHEMES.length].fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px 10px", fontSize: "11px" }} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </SimpleChartCard>

              <SimpleChartCard title="Today's Services" subtitle="Service distribution" colorIndex={1}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={todayServiceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px 10px", fontSize: "11px" }} />
                    <Bar dataKey="count" name="Appointments" fill={COLOR_SCHEMES[1].fill} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SimpleChartCard>

              <SimpleChartCard title="Today's Time Sessions" subtitle="Time-of-day view" colorIndex={2}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={todayTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={8} interval={0} angle={-30} textAnchor="end" height={80} />
                    <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px 10px", fontSize: "11px" }} />
                    <Bar dataKey="count" name="Appointments" fill={COLOR_SCHEMES[2].fill} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SimpleChartCard>
            </section>
          </>
        )}
      </main>
    </div>
  );
}