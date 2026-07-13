"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Inbox,
  CalendarOff,
  Clock,
  User,
  Scissors,
  X,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { useSession } from "next-auth/react";
import AppointmentRequestsModal from "@/components/AppointmentRequestModal";
import BlockDatesModal from "@/components/BlockDatesModal";

/* ================= TYPES ================= */

export type ServiceType = "ear" | "nose" | "throat" | "aesthetics";

export type CalendarEvent = {
  id: string;
  patient: string;
  service: ServiceType;
  title: string;
  date: Date;
  time: string;
  status?: string;
};

export type AppointmentRequest = {
  id: string;
  name: string;
  type: ServiceType;
  label: string;
  status?: string;
};

type Appointment = {
  id: string;
  fullName: string;
  email?: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime?: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "ACCEPTED" | "COMPLETED";
  assignedToRole: "ADMIN" | "DOCTOR";
  user?: {
    name?: string;
    email?: string;
  };
};

type BlockedDate = {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  reason: string | null;
};

/* ================= STYLES ================= */

const SERVICE_STYLES: Record<ServiceType, string> = {
  ear: "border-l-cyan-500 bg-gradient-to-r from-cyan-50 to-white text-cyan-800",
  nose: "border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white text-emerald-800",
  throat: "border-l-violet-500 bg-gradient-to-r from-violet-50 to-white text-violet-800",
  aesthetics: "border-l-rose-500 bg-gradient-to-r from-rose-50 to-white text-rose-800",
};

const SERVICE_DOT_COLORS: Record<ServiceType, string> = {
  ear: "bg-cyan-500",
  nose: "bg-emerald-500",
  throat: "bg-violet-500",
  aesthetics: "bg-rose-500",
};

/* ================= CONSTANTS ================= */

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const clinicHours = [
  { hour: 8, label: "8:00 AM" },
  { hour: 9, label: "9:00 AM" },
  { hour: 10, label: "10:00 AM" },
  { hour: 11, label: "11:00 AM" },
  { hour: 12, label: "12:00 PM" },
  { hour: 13, label: "1:00 PM" },
  { hour: 14, label: "2:00 PM" },
  { hour: 15, label: "3:00 PM" },
  { hour: 16, label: "4:00 PM" },
  { hour: 17, label: "5:00 PM" },
];

/* ================= HELPERS ================= */

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isSunday(date: Date) {
  return date.getDay() === 0;
}

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const grid: Date[] = [];
  const startDay = firstDay.getDay();
  for (let i = startDay - 1; i >= 0; i--) {
    grid.push(new Date(year, month, -i));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    grid.push(new Date(year, month, d));
  }
  while (grid.length % 7 !== 0) {
    const last = grid[grid.length - 1];
    grid.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }
  return grid;
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
}

function getWeekDays(start: Date) {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function normalizeServiceType(service: string): ServiceType {
  const value = service?.toLowerCase() as ServiceType;
  if (["ear", "nose", "throat", "aesthetics"].includes(value)) return value;
  return "ear";
}

function parseTimeTo24Hour(time?: string) {
  if (!time) return null;
  const normalized = time.trim().toUpperCase();
  const ampmMatch = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const meridiem = ampmMatch[3];
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  }
  const militaryMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (militaryMatch) {
    return {
      hours: parseInt(militaryMatch[1], 10),
      minutes: parseInt(militaryMatch[2], 10),
    };
  }
  return null;
}

function buildAppointmentDateTime(appointment: Appointment) {
  const date = new Date(appointment.appointmentDate);
  if (appointment.appointmentTime) {
    const parsedTime = parseTimeTo24Hour(appointment.appointmentTime);
    if (parsedTime) {
      date.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
    }
  }
  return date;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function normalizeDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isDateWithinRange(target: Date, start: Date, end: Date) {
  const t = normalizeDateOnly(target).getTime();
  const s = normalizeDateOnly(start).getTime();
  const e = normalizeDateOnly(end).getTime();
  return t >= s && t <= e;
}

function getBlockedInfo(date: Date, blockedDates: BlockedDate[]) {
  return blockedDates.find((blocked) =>
    isDateWithinRange(date, new Date(blocked.startDate), new Date(blocked.endDate))
  );
}

/* ================= COMPONENT ================= */

export default function AppointmentCalendar() {
  const { data: session, status } = useSession();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [blockDatesModalOpen, setBlockDatesModalOpen] = useState(false);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [view, setView] = useState<"week" | "month" | "day">("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const userRole = session?.user?.role;
      const appointmentPath = userRole === 'ADMIN' ? '/api/admin/appointment' : '/api/doctor/appointment';
      const res = await fetch(appointmentPath, { credentials: "include" });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch appointments");
      }
      const data = await res.json();
      const mappedAppointments = (data.appointments || []).map((appt: any) => ({
        ...appt,
        fullName: appt.fullName || appt.user?.name || "Unknown",
        email: appt.email || appt.user?.email || "",
      }));
      setAppointments(mappedAppointments);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
      setError(err instanceof Error ? err.message : "Failed to fetch appointments");
    }
  }, [session]);

  const fetchBlockedDates = useCallback(async () => {
    try {
      const userRole = session?.user?.role;
      const blockedDatesPath = userRole === 'ADMIN' ? '/api/admin/blocked-dates' : '/api/doctor/blocked-dates';
      const res = await fetch(blockedDatesPath, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch blocked dates");
      const data = await res.json();
      setBlockedDates(data.blockedDates || []);
    } catch (err) {
      console.error("Failed to fetch blocked dates:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch blocked dates");
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || !['ADMIN', 'DOCTOR'].includes(session.user.role)) {
      setError("Access denied: Staff only");
      setLoading(false);
      return;
    }
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchAppointments(), fetchBlockedDates()]);
      setLoading(false);
    };
    loadData();
  }, [session, status, fetchAppointments, fetchBlockedDates]);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateAppointmentStatus = useCallback(async (
    id: string,
    newStatus: "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED"
  ) => {
    if (!session?.user || !['ADMIN', 'DOCTOR'].includes(session.user.role)) {
      setError("Access denied: Staff only");
      return;
    }
    setUpdatingId(id);
    try {
      const userRole = session?.user?.role;
      const updateAppointmentPath = userRole === 'ADMIN' ? '/api/admin/appointment' : '/api/doctor/appointment';
      const res = await fetch(updateAppointmentPath, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status: newStatus }),
      });
      const responseText = await res.text();
      let errorMessage = "Failed to update appointment";
      if (!res.ok) {
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = typeof errorData.error === 'string' ? errorData.error : responseText;
        } catch {
          errorMessage = responseText;
        }
        throw new Error(errorMessage);
      }
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === id ? { ...appointment, status: newStatus } : appointment
        )
      );
    } catch (err) {
      console.error("Failed to update appointment", err);
      alert(err instanceof Error ? err.message : "Failed to update appointment");
      fetchAppointments();
    } finally {
      setUpdatingId(null);
    }
  }, [session, fetchAppointments]);

  const markAsCompleted = useCallback(async (id: string) => {
    const appointment = appointments.find(a => a.id === id);
    if (appointment?.status === "COMPLETED") {
      alert("This appointment is already completed.");
      return;
    }
    await updateAppointmentStatus(id, "COMPLETED");
  }, [appointments, updateAppointmentStatus]);

  const handleBlockDates = useCallback(async (
    startDate: string,
    endDate: string,
    reason: string
  ) => {
    try {
      const userRole = session?.user?.role;
      const blockDatesPath = userRole === 'ADMIN' ? '/api/admin/blocked-dates' : '/api/doctor/blocked-dates';
      const res = await fetch(blockDatesPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, reason }),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to block dates");
      }
      const data = await res.json();
      alert(`Successfully blocked dates. ${data.cancelledAppointmentsCount || 0} appointments were cancelled.`);
      await fetchBlockedDates();
      await fetchAppointments();
    } catch (err) {
      console.error("Error blocking dates:", err);
      alert(err instanceof Error ? err.message : "Failed to block dates");
    }
  }, [session, fetchBlockedDates, fetchAppointments]);

  const handleUnblockDate = useCallback(async (id: string) => {
    try {
      const userRole = session?.user?.role;
      const unblockPath = userRole === 'ADMIN' ? `/api/admin/blocked-dates?id=${id}` : `/api/doctor/blocked-dates?id=${id}`;
      const res = await fetch(unblockPath, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to unblock dates");
      await fetchBlockedDates();
      alert("Successfully unblocked dates.");
    } catch (err) {
      console.error("Error unblocking dates:", err);
      alert("Failed to unblock dates");
    }
  }, [session, fetchBlockedDates]);

  function handleEdit(id: string) {
    updateAppointmentStatus(id, "CONFIRMED");
  }

  function handleCancel(id: string) {
    updateAppointmentStatus(id, "CANCELLED");
    setSelectedAppointment(null);
  }

  function prevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }
  function prevWeek() {
    setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7));
  }
  function nextWeek() {
    setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7));
  }
  function goToToday() {
    const today = new Date();
    setCurrentMonth(today);
    setWeekStart(today);
    setView("day");
  }

  const monthGrid = getMonthGrid(currentMonth.getFullYear(), currentMonth.getMonth());
  const weekDays = getWeekDays(startOfWeek(weekStart));

  // Always show only active appointments (not cancelled, not completed)
  const events = useMemo(() => {
    const activeAppointments = appointments.filter(
      a => a.status !== "CANCELLED" && a.status !== "COMPLETED"
    );
    return activeAppointments.map((a) => {
      const eventDate = buildAppointmentDateTime(a);
      const service = normalizeServiceType(a.serviceType);
      return {
        id: a.id,
        patient: a.fullName,
        service,
        title: a.serviceType,
        date: eventDate,
        time: formatTime(eventDate),
        status: a.status,
      };
    });
  }, [appointments]);

  const requests: AppointmentRequest[] = appointments
    .filter((a) => a.status === "PENDING")
    .map((a) => ({
      id: a.id,
      name: a.fullName,
      type: normalizeServiceType(a.serviceType),
      label: a.serviceType,
      status: a.status,
    }));

  const confirmedCount = appointments.filter(a => a.status === "CONFIRMED").length;

  const normalizedBlockedDates = blockedDates.map((date) => ({
    ...date,
    startDate: date.startDate instanceof Date ? date.startDate.toISOString() : String(date.startDate),
    endDate: date.endDate instanceof Date ? date.endDate.toISOString() : String(date.endDate),
    reason: date.reason ?? "",
  }));

  const pendingCount = appointments.filter(a => a.status === "PENDING").length;

  if (loading || status === "loading") {
    return (
      <div className="bg-white rounded-3xl p-8 space-y-8 border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-2xl border-4 border-cyan-200 border-t-cyan-600 animate-spin" />
            <p className="text-slate-500 font-medium">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-8 space-y-4 border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Unable to load calendar</h2>
          <p className="text-slate-500 text-center max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 space-y-8 border border-slate-200/80 shadow-xl shadow-slate-200/50">
      {/* WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 p-6 lg:p-8 text-white shadow-lg shadow-cyan-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_40%)]" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm mb-3">
              <Stethoscope className="h-3.5 w-3.5" />
              Centra Clinic PH
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Good day, {session?.user?.name?.split(" ")[0] || "Admin"}!
              <span className="ml-2">👋</span>
            </h3>
            <p className="mt-2 text-cyan-100/80 text-base">
              {confirmedCount} confirmed appointment{confirmedCount !== 1 ? 's' : ''} scheduled
              {pendingCount > 0 && ` • ${pendingCount} pending request${pendingCount !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button 
            onClick={goToToday} 
            className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition-all duration-200 shadow-sm"
          >
            <Clock className="h-4 w-4" />
            Today
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-50 to-white p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 shadow-sm">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Schedule
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {view === "month"
                ? `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`
                : view === "week"
                ? `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : `Today • ${weekStart.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* NAV */}
          <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
            <button 
              onClick={goToToday} 
              className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
            >
              Today
            </button>
            {(view === "month" || view === "week") && (
              <div className="flex items-center gap-0.5">
                <button 
                  onClick={view === "month" ? prevMonth : prevWeek} 
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" 
                  title="Previous"
                >
                  <ChevronLeft size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={view === "month" ? nextMonth : nextWeek} 
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" 
                  title="Next"
                >
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
              </div>
            )}
          </div>

          {/* VIEW SWITCH */}
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
            {(["month", "week"] as const).map((v) => (
              <button 
                key={v} 
                onClick={() => setView(v)} 
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  view === v 
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setModalOpen(true)} 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Inbox size={16} /> 
              Requests
              {pendingCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/30 text-xs font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setBlockDatesModalOpen(true)} 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <CalendarOff size={16} /> Block Dates
            </button>
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {view === "month" && (
        <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 bg-gradient-to-r from-slate-50 to-white">
            {days.map((d) => (
              <div 
                key={d} 
                className="h-12 flex items-center justify-center text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthGrid.map((day) => {
              const sundayClosed = isSunday(day);
              const blockedInfo = getBlockedInfo(day, blockedDates);
              const blocked = !!blockedInfo;
              const closed = sundayClosed || blocked;
              const dayEvents = events.filter((e) => isSameDay(e.date, day));
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`relative h-40 border border-slate-100 transition-all duration-200 group ${
                    blocked 
                      ? "bg-gradient-to-br from-orange-50 to-rose-50" 
                      : sundayClosed 
                      ? "bg-gradient-to-br from-slate-50 to-slate-100" 
                      : isToday
                      ? "bg-gradient-to-br from-cyan-50 to-blue-50"
                      : "bg-white hover:bg-slate-50/50"
                  }`}
                >
                  <div className="absolute top-2 left-3 right-3 z-10 flex items-center justify-between">
                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday 
                        ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25" 
                        : blocked 
                        ? "bg-orange-100 text-orange-700" 
                        : sundayClosed 
                        ? "bg-slate-200 text-slate-500"
                        : "text-slate-700"
                    }`}>
                      {day.getDate()}
                    </span>
                    <div className="flex items-center gap-1">
                      {sundayClosed && !blocked && (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                          Closed
                        </span>
                      )}
                      {blocked && (
                        <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="pt-12 pb-2 px-2 space-y-1.5 overflow-y-auto max-h-[calc(100%-3rem)]">
                    {blocked && (
                      <div className="text-[10px] text-orange-700 bg-orange-100/80 border border-orange-200 rounded-lg px-2 py-1.5 leading-tight">
                        {blockedInfo?.reason || "Unavailable"}
                      </div>
                    )}
                    {!closed && dayEvents.map((e) => (
                      <div 
                        key={e.id} 
                        onClick={() => { 
                          const appt = appointments.find((a) => a.id === e.id); 
                          if (appt) setSelectedAppointment(appt); 
                        }} 
                        className={`cursor-pointer rounded-xl border-l-[3px] px-2.5 py-1.5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-100 bg-white ${SERVICE_STYLES[e.service]}`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${SERVICE_DOT_COLORS[e.service]}`} />
                          <span className="font-semibold text-[11px] text-slate-900 line-clamp-1">
                            {e.title}
                          </span>
                        </div>
                        <div className="text-[10px] font-medium text-slate-600 leading-tight mb-0.5 pl-4">
                          {e.patient}
                        </div>
                        <div className="flex items-center gap-1.5 pl-4">
                          <Clock className="h-2.5 w-2.5 text-slate-400" />
                          <span className="text-[10px] font-mono text-slate-500">
                            {e.time}
                          </span>
                          {e.status && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded-full font-semibold">
                              {e.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {!closed && dayEvents.length === 0 && (
                      <div className="text-[10px] text-slate-300 text-center py-2 font-medium">
                        Available
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {view === "week" && (
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="grid grid-cols-[90px_repeat(7,1fr)] border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="h-12 border-r border-slate-200"></div>
            {weekDays.map((day) => {
              const sundayClosed = isSunday(day);
              const blockedInfo = getBlockedInfo(day, blockedDates);
              const blocked = !!blockedInfo;
              const isToday = isSameDay(day, new Date());
              return (
                <div 
                  key={day.toISOString()} 
                  className={`h-12 flex flex-col items-center justify-center border-r border-slate-200 text-xs font-semibold ${
                    isToday 
                      ? "bg-gradient-to-b from-cyan-50 to-blue-50 text-cyan-700" 
                      : blocked 
                      ? "bg-orange-50 text-orange-700" 
                      : sundayClosed 
                      ? "bg-slate-50 text-slate-500" 
                      : "text-slate-700"
                  }`}
                >
                  <span>{days[day.getDay()]}</span>
                  <span className={`text-base font-bold ${
                    isToday ? "text-cyan-600" : ""
                  }`}>{day.getDate()}</span>
                  {blocked && <span className="text-[9px] text-orange-600 font-medium">Blocked</span>}
                  {!blocked && sundayClosed && <span className="text-[9px] text-slate-400">Closed</span>}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-[90px_repeat(7,1fr)]">
            <div className="border-r border-slate-200 bg-slate-50/50">
              {clinicHours.map(({ hour, label }) => (
                <div key={hour} className="h-28 border-b border-slate-100 text-[10px] flex items-start justify-end pr-3 pt-1.5 text-slate-400 font-medium">
                  {label}
                </div>
              ))}
            </div>
            {weekDays.map((day) => {
              const sundayClosed = isSunday(day);
              const blockedInfo = getBlockedInfo(day, blockedDates);
              const blocked = !!blockedInfo;
              const closed = sundayClosed || blocked;
              return (
                <div key={day.toISOString()} className={`border-r border-slate-200 ${
                  blocked ? "bg-gradient-to-b from-orange-50/50 to-transparent" : 
                  sundayClosed ? "bg-gradient-to-b from-slate-50/50 to-transparent" : ""
                }`}>
                  {clinicHours.map(({ hour }) => {
                    const hourEvents = events.filter(
                      (e) => isSameDay(e.date, day) && e.date.getHours() === hour
                    );
                    return (
                      <div 
                        key={hour} 
                        className="h-28 border-b border-slate-100 flex flex-col items-start justify-start gap-1 p-1.5"
                      >
                        {blocked && hour === clinicHours[0].hour && (
                          <div className="text-[10px] text-orange-700 bg-orange-100/80 border border-orange-200 rounded-lg px-2 py-1.5 w-full">
                            {blockedInfo?.reason || "Unavailable"}
                          </div>
                        )}
                        {!closed && hourEvents.map((e) => (
                          <div 
                            key={e.id} 
                            onClick={() => { 
                              const appt = appointments.find((a) => a.id === e.id); 
                              if (appt) setSelectedAppointment(appt); 
                            }} 
                            className={`cursor-pointer rounded-xl border-l-[3px] p-2 shadow-sm hover:shadow-md transition-all duration-200 w-full hover:scale-[1.02] active:scale-100 bg-white ${SERVICE_STYLES[e.service]}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${SERVICE_DOT_COLORS[e.service]}`} />
                              <span className="font-semibold text-xs text-slate-900">{e.title}</span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-700 mb-1 block pl-4">{e.patient}</span>
                            <div className="flex items-center justify-between pl-4">
                              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {e.time}
                              </span>
                              {e.status && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                                  {e.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {view === "day" && (
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-lg font-bold">
                  {days[weekStart.getDay()]}, {monthNames[weekStart.getMonth()]} {weekStart.getDate()}
                </h3>
                <p className="text-xs text-cyan-100/80 mt-0.5">
                  {weekStart.getFullYear()}
                </p>
              </div>
              <button 
                onClick={goToToday} 
                className="px-3 py-1.5 text-xs font-semibold bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                Today
              </button>
            </div>
          </div>
          <div className="grid grid-cols-[100px_1fr]">
            <div className="border-r border-slate-200 bg-slate-50/50">
              {clinicHours.map(({ hour, label }) => (
                <div key={hour} className="h-28 border-b border-slate-100 text-[10px] flex items-start justify-end pr-3 pt-1.5 text-slate-400 font-medium">
                  {label}
                </div>
              ))}
            </div>
            <div>
              {clinicHours.map(({ hour }) => {
                const sundayClosed = isSunday(weekStart);
                const blockedInfo = getBlockedInfo(weekStart, blockedDates);
                const blocked = !!blockedInfo;
                const closed = sundayClosed || blocked;
                const hourEvents = events.filter(
                  (e) => isSameDay(e.date, weekStart) && e.date.getHours() === hour
                );
                return (
                  <div 
                    key={hour} 
                    className={`h-28 border-b border-slate-100 flex flex-col gap-2 p-3 ${
                      blocked ? "bg-gradient-to-r from-orange-50/50 to-transparent" : 
                      sundayClosed ? "bg-gradient-to-r from-slate-50/50 to-transparent" : ""
                    }`}
                  >
                    {blocked && hour === clinicHours[0].hour && (
                      <div className="text-xs text-orange-700 bg-orange-100/80 border border-orange-200 rounded-xl p-3 flex items-center gap-2">
                        <CalendarOff className="h-4 w-4 flex-shrink-0" />
                        <span>{blockedInfo?.reason || "Unavailable"}</span>
                      </div>
                    )}
                    {!blocked && sundayClosed && hour === clinicHours[0].hour && (
                      <div className="text-xs text-slate-600 bg-slate-100/80 border border-slate-200 rounded-xl p-3">
                        Clinic is closed on Sundays.
                      </div>
                    )}
                    {!closed && hourEvents.map((e) => (
                      <div 
                        key={e.id} 
                        onClick={() => { 
                          const appt = appointments.find((a) => a.id === e.id); 
                          if (appt) setSelectedAppointment(appt); 
                        }} 
                        className={`cursor-pointer rounded-xl border-l-[3px] p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-100 bg-white ${SERVICE_STYLES[e.service]}`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`w-2 h-2 rounded-full ${SERVICE_DOT_COLORS[e.service]}`} />
                          <span className="font-semibold text-sm text-slate-900">{e.title}</span>
                        </div>
                        <div className="text-xs font-medium text-slate-700 mb-1.5 pl-4">{e.patient}</div>
                        <div className="flex items-center gap-2 pl-4">
                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {e.time}
                          </span>
                          {e.status && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                              {e.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* REQUESTS MODAL */}
      {modalOpen && (
        <AppointmentRequestsModal
          newBookings={requests}
          setOpenModal={setModalOpen}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          handleEdit={handleEdit}
          handleCancel={handleCancel}
        />
      )}

      {/* APPOINTMENT DETAILS MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl text-gray-900 p-6 lg:p-8 w-full max-w-md border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-600">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Appointment Details</h3>
              </div>
              <button 
                onClick={() => setSelectedAppointment(null)} 
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Patient</p>
                <p className="font-semibold text-slate-900">{selectedAppointment.fullName}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Service</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${SERVICE_DOT_COLORS[normalizeServiceType(selectedAppointment.serviceType)]}`} />
                  <p className="font-semibold text-slate-900">{selectedAppointment.serviceType}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Date & Time</p>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at{" "}
                  {selectedAppointment.appointmentTime || formatTime(buildAppointmentDateTime(selectedAppointment))}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  selectedAppointment.status === "CONFIRMED"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : selectedAppointment.status === "PENDING"
                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                    : selectedAppointment.status === "COMPLETED"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-rose-100 text-rose-700 border border-rose-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedAppointment.status === "CONFIRMED" ? "bg-emerald-500" :
                    selectedAppointment.status === "PENDING" ? "bg-amber-500" :
                    selectedAppointment.status === "COMPLETED" ? "bg-blue-500" : "bg-rose-500"
                  }`} />
                  {selectedAppointment.status}
                </span>
              </div>
              <div className="pt-4 flex gap-3">
                {selectedAppointment.status !== "COMPLETED" && selectedAppointment.status !== "CANCELLED" && (
                  <>
                    <button 
                      onClick={() => markAsCompleted(selectedAppointment.id)} 
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold text-sm shadow-lg shadow-blue-500/25"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Complete
                    </button>
                    <button 
                      onClick={() => handleCancel(selectedAppointment.id)} 
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all font-semibold text-sm shadow-lg shadow-rose-500/25"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </>
                )}
                {selectedAppointment.status === "COMPLETED" && (
                  <div className="w-full text-center text-sm text-slate-500 py-3 bg-slate-50 rounded-xl font-medium">
                    <CheckCircle2 className="h-4 w-4 inline mr-2 text-emerald-500" />
                    This appointment is already completed.
                  </div>
                )}
                {selectedAppointment.status === "CANCELLED" && (
                  <div className="w-full text-center text-sm text-slate-500 py-3 bg-slate-50 rounded-xl font-medium">
                    <X className="h-4 w-4 inline mr-2 text-rose-500" />
                    This appointment is already cancelled.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK DATES MODAL */}
      {blockDatesModalOpen && (
        <BlockDatesModal
          isOpen={blockDatesModalOpen}
          onClose={() => setBlockDatesModalOpen(false)}
          blockedDates={normalizedBlockedDates}
          onBlockDates={handleBlockDates}
          onUnblockDate={handleUnblockDate}
        />
      )}
    </div>
  );
}