"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Inbox,
  CalendarOff,
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
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "ACCEPTED";
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
  ear: "border-blue-500 bg-blue-50 text-blue-800",
  nose: "border-green-500 bg-green-50 text-green-800",
  throat: "border-purple-500 bg-purple-50 text-purple-800",
  aesthetics: "border-pink-500 bg-pink-50 text-pink-800",
};

/* ================= CONSTANTS ================= */

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
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
  if (
    value === "ear" ||
    value === "nose" ||
    value === "throat" ||
    value === "aesthetics"
  ) {
    return value;
  }
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
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
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
    isDateWithinRange(
      date,
      new Date(blocked.startDate),
      new Date(blocked.endDate)
    )
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
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const userRole = session?.user?.role;
      const appointmentPath = userRole === 'ADMIN' ? '/api/admin/appointment' : '/api/doctor/appointment';
      const res = await fetch(appointmentPath, {
        credentials: "include",
      });

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
      const res = await fetch(blockedDatesPath, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch blocked dates");
      }

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
    newStatus: "CONFIRMED" | "REJECTED" | "CANCELLED"
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

      // Optimistic update only on success
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === id ? { ...appointment, status: newStatus } : appointment
        )
      );
    } catch (err) {
      console.error("Failed to update appointment", err);
      alert(err instanceof Error ? err.message : "Failed to update appointment");
      // Revert optimistic update on error by refetching
      fetchAppointments();
    } finally {
      setUpdatingId(null);
    }
  }, [session, fetchAppointments]);

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
      alert(
        `Successfully blocked dates. ${
          data.cancelledAppointmentsCount || 0
        } appointments were cancelled.`
      );

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
      const res = await fetch(unblockPath, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to unblock dates");
      }

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
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  }

  function prevWeek() {
    setWeekStart(
      new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate() - 7
      )
    );
  }

  function nextWeek() {
    setWeekStart(
      new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate() + 7
      )
    );
  }

  function goToToday() {
    const today = new Date();
    setCurrentMonth(today);
    setWeekStart(today);
    setView("day");
  }

  const monthGrid = getMonthGrid(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  const weekDays = getWeekDays(startOfWeek(weekStart));

  const events: CalendarEvent[] = appointments
    .filter((a) => a.status === "CONFIRMED")
    .map((a) => {
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

  const requests: AppointmentRequest[] = appointments
    .filter((a) => a.status === "PENDING")
    .map((a) => ({
      id: a.id,
      name: a.fullName,
      type: normalizeServiceType(a.serviceType),
      label: a.serviceType,
      status: a.status,
    }));

  const confirmedCount = appointments.filter(
    (a) => a.status === "CONFIRMED"
  ).length;

  const normalizedBlockedDates = blockedDates.map((date) => ({
    ...date,
    startDate:
      date.startDate instanceof Date
        ? date.startDate.toISOString()
        : String(date.startDate),
    endDate:
      date.endDate instanceof Date
        ? date.endDate.toISOString()
        : String(date.endDate),
    reason: date.reason ?? "",
  }));

  if (loading || status === "loading") {
    return (
      <div className="bg-white text-gray-900 rounded-2xl p-8 space-y-8 border border-gray-200 shadow-lg">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white text-gray-900 rounded-2xl p-8 space-y-4 border border-gray-200 shadow-lg">
        <h2 className="text-xl font-semibold text-red-600">Unable to load calendar</h2>
        <p className="text-gray-600">{error}</p>
    </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 rounded-2xl p-8 space-y-8 border border-gray-200 shadow-lg">
      {/* WELCOME */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-gray-900 font-semibold text-xl">
            Good day, {session?.user?.name || "Admin"}!
          </h3>
          <p className="text-gray-600 text-base mt-1">
            {confirmedCount} confirmed appointments scheduled
          </p>
        </div>
        <button
          onClick={goToToday}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
        >
          Today
        </button>
      </div>

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-emerald-600" />
            Schedule
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {view === "month"
              ? `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`

              : view === "week"
              ? `Week of ${weekStart.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`
              : `Today • ${weekStart.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* NAV */}
          <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              Today
            </button>

            {(view === "month" || view === "week") && (
              <>
                <button
                  onClick={view === "month" ? prevMonth : prevWeek}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Previous"
                >
                  <ChevronLeft size={16} className="text-gray-500" />
                </button>
                <button
                  onClick={view === "month" ? nextMonth : nextWeek}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Next"
                >
                  <ChevronRight size={16} className="text-gray-500" />
                </button>
              </>
            )}
          </div>

          {/* VIEW SWITCH */}
          <div className="flex bg-gray-50 rounded-xl p-0.5 border border-gray-100 shadow-sm">
            {(["month", "week"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex-1
                  ${
                    view === v
                      ? "bg-emerald-600 text-white shadow-md hover:shadow-lg"
                      : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
          >
            <Inbox size={16} />
            Requests
          </button>

          <button
            onClick={() => setBlockDatesModalOpen(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
          >
            <CalendarOff size={16} />
            Block Dates
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {view === "month" && (
        <div className="grid grid-cols-7 gap-px bg-gray-100 p-4 rounded-2xl border border-gray-200 shadow-sm">
          {days.map((d) => (
            <div
              key={d}
              className="h-12 flex items-center justify-center text-xs font-bold text-gray-600 uppercase tracking-wide bg-white border border-gray-200"
            >
              {d}
            </div>
          ))}

          {monthGrid.map((day) => {
            const sundayClosed = isSunday(day);
            const blockedInfo = getBlockedInfo(day, blockedDates);
            const blocked = !!blockedInfo;
            const closed = sundayClosed || blocked;
            const dayEvents = events.filter((e) => isSameDay(e.date, day));

            return (
              <div
                key={day.toISOString()}
                className={`relative h-40 border border-gray-200 bg-white hover:shadow-md transition-all duration-200 group
                  ${
                    blocked
                      ? "bg-linear-to-br from-orange-50 to-red-50 border-orange-200"
                      : sundayClosed
                      ? "bg-linear-to-br from-red-50 to-rose-50 border-red-200 opacity-75"
                      : ""
                  }`}
              >
                <div className="absolute top-2 left-3 z-10 flex flex-wrap items-center gap-2">
                  <span
                    className={`text-lg font-bold px-2 py-1 rounded-full ${
                      blocked
                        ? "bg-orange-100 text-orange-700"
                        : sundayClosed
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {day.getDate()}
                  </span>

                  {sundayClosed && !blocked && (
                    <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                      Closed
                    </span>
                  )}

                  {blocked && (
                    <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                      Blocked
                    </span>
                  )}
                </div>

                <div className="pt-10 pb-3 px-3 space-y-2 overflow-y-auto max-h-full">
                  {blocked && (
                    <div className="text-xs text-orange-700 bg-orange-100 border border-orange-200 rounded-lg p-2">
                      {blockedInfo?.reason || "Unavailable"}
                    </div>
                  )}

                  {!closed &&
                    dayEvents.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => {
                          const appt = appointments.find((a) => a.id === e.id);
                          if (appt) setSelectedAppointment(appt);
                        }}
                        className={`group-hover:scale-[1.02] transition-transform duration-200 p-2 rounded-xl border-l-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md bg-white ${SERVICE_STYLES[e.service]}`}
                      >
                        <div className="font-semibold text-xs text-gray-900 line-clamp-1 mb-1">
                          {e.title}
                        </div>
                        <div className="text-xs font-semibold text-gray-800 leading-tight mb-1">
                          {e.patient}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono text-gray-600">
                            {e.time}
                          </span>
                          {e.status && (
                            <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                              {e.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                  {!closed && dayEvents.length === 0 && (
                    <div className="text-xs text-gray-400 text-center py-4">
                      No appointments
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WEEK VIEW */}
      {view === "week" && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-[90px_repeat(7,160px)] border-b border-gray-200 bg-gray-50">
            <div className="h-12 border-r border-gray-200"></div>

            {weekDays.map((day) => {
              const sundayClosed = isSunday(day);
              const blockedInfo = getBlockedInfo(day, blockedDates);
              const blocked = !!blockedInfo;

              return (
                <div
                  key={day.toISOString()}
                  className={`h-12 flex flex-col items-center justify-center border-r border-gray-200 text-sm font-semibold
                    ${
                      blocked
                        ? "bg-orange-50 text-orange-700"
                        : sundayClosed
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700"
                    }`}
                >
                  <span>
                    {days[day.getDay()]} {day.getDate()}
                  </span>
                  {blocked && <span className="text-[10px]">Blocked</span>}
                  {!blocked && sundayClosed && (
                    <span className="text-[10px]">Closed</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[90px_repeat(7,160px)]">
            <div className="border-r border-gray-200 bg-gray-50">
              {clinicHours.map(({ hour, label }) => (
                <div
                  key={hour}
                  className="h-28 border-b border-gray-100 text-xs flex items-start justify-end pr-3 pt-1 text-gray-400"
                >
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
                <div
                  key={day.toISOString()}
                  className={`border-r border-gray-200 ${
                    blocked
                      ? "bg-orange-50"
                      : sundayClosed
                      ? "bg-red-50"
                      : ""
                  }`}
                >
                  {clinicHours.map(({ hour }) => {
                    const hourEvents = events.filter(
                      (e) => isSameDay(e.date, day) && e.date.getHours() === hour
                    );

                    return (
                      <div
                        key={hour}
                        className="h-28 border-b border-gray-100 flex flex-col items-start justify-start gap-1 p-2 min-h-[112px]"
                      >
                        {blocked && hour === clinicHours[0].hour && (
                          <div className="text-xs text-orange-700 bg-orange-100 border border-orange-200 rounded-lg p-2 w-full">
                            {blockedInfo?.reason || "Unavailable"}
                          </div>
                        )}

                        {!closed &&
                          hourEvents.map((e) => (
                            <div
                              key={e.id}
                              onClick={() => {
                                const appt = appointments.find((a) => a.id === e.id);
                                if (appt) setSelectedAppointment(appt);
                              }}
                              className={`flex flex-col justify-between p-3 rounded-lg shadow-sm border border-gray-100 border-l-4 hover:shadow-md transition-all duration-200 w-full max-w-[160px] cursor-pointer bg-white ${SERVICE_STYLES[e.service]}`}
                            >
                              <span className="font-semibold text-sm mb-1 text-gray-900">
                                {e.title}
                              </span>
                              <span className="text-sm font-medium text-gray-800 mb-1 leading-snug">
                                {e.patient}
                              </span>
                              <div className="flex items-center justify-between text-xs mt-auto">
                                <span className="font-mono text-gray-600 whitespace-nowrap">
                                  {e.time}
                                </span>
                                {e.status && (
                                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
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
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-[100px_1fr] border-b border-gray-200">
            <div className="h-10 border-r border-gray-200 bg-gray-50"></div>
            <div className="h-10 text-center text-xs font-semibold text-gray-700 flex items-center justify-center">
              {days[weekStart.getDay()]} {weekStart.getDate()}
            </div>
          </div>

          <div className="grid grid-cols-[100px_1fr]">
            <div className="border-r border-gray-200 bg-gray-50">
              {clinicHours.map(({ hour, label }) => (
                <div
                  key={hour}
                  className="h-28 border-b border-gray-100 text-xs flex items-start justify-end pr-3 pt-1 text-gray-400"
                >
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
                  (e) =>
                    isSameDay(e.date, weekStart) && e.date.getHours() === hour
                );

                return (
                  <div
                    key={hour}
                    className={`h-28 border-b border-gray-100 flex flex-col gap-2 p-3 ${
                      blocked ? "bg-orange-50" : sundayClosed ? "bg-red-50" : ""
                    }`}
                  >
                    {blocked && hour === clinicHours[0].hour && (
                      <div className="text-xs text-orange-700 bg-orange-100 border border-orange-200 rounded-lg p-2">
                        {blockedInfo?.reason || "Unavailable"}
                      </div>
                    )}

                    {!blocked && sundayClosed && hour === clinicHours[0].hour && (
                      <div className="text-xs text-red-700 bg-red-100 border border-red-200 rounded-lg p-2">
                        Clinic is closed on Sundays.
                      </div>
                    )}

                    {!closed &&
                      hourEvents.map((e) => (
                        <div
                          key={e.id}
                          onClick={() => {
                            const appt = appointments.find((a) => a.id === e.id);
                            if (appt) setSelectedAppointment(appt);
                          }}
                          className={`p-3 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white ${SERVICE_STYLES[e.service]}`}
                        >
                          <span className="font-semibold text-sm text-gray-900">
                            {e.title}
                          </span>
                          <div className="text-xs font-medium text-gray-800 line-clamp-1 mb-1 leading-tight">
                            {e.patient}
                          </div>
                          <div className="flex items-center gap-1 text-[10px]">
                            <span className="font-mono text-gray-600">
                              {e.time}
                            </span>
                            {e.status && (
                              <span className="bg-green-100 text-green-800 px-1.5 py-px rounded-full font-medium">
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
          <div className="bg-white rounded-2xl shadow-2xl text-gray-900 p-6 w-full max-w-md border border-gray-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">Appointment Details</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Patient</p>
                <p className="font-medium">{selectedAppointment.fullName}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Service</p>
                <p className="font-medium">{selectedAppointment.serviceType}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="font-medium">
                  {new Date(
                    selectedAppointment.appointmentDate
                  ).toLocaleDateString()}{" "}
                  at{" "}
                  {selectedAppointment.appointmentTime ||
                    formatTime(buildAppointmentDateTime(selectedAppointment))}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-medium">{selectedAppointment.status}</p>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  onClick={() => handleCancel(selectedAppointment.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Cancel Appointment
                </button>
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
