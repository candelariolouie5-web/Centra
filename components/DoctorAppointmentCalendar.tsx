"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Inbox,
} from "lucide-react";
import { useSession } from "next-auth/react";
// import AppointmentRequestsModal from "@/components/AppointmentRequestModal";

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

/* ================= DOCTOR APPOINTMENT CALENDAR ================= */

export default function DoctorAppointmentCalendar() {
  const { data: session, status } = useSession();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<"week" | "month" | "day">("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
const res = await fetch("/api/doctor/appointment", {
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch doctor appointments");
      }

      const data = await res.json();

      const rawAppointments = data.appointments || data.data || [];
      
      if (Array.isArray(rawAppointments) && rawAppointments.length > 0 && rawAppointments[0]?._count) {
        // Dashboard stats format - show empty calendar gracefully
        setAppointments([]);
      } else {
        const mappedAppointments = rawAppointments.map((appt: any) => ({
          id: appt.id,
          fullName: appt.fullName || 'Unknown Patient',
          email: appt.email || '',
          serviceType: appt.serviceType || 'Consultation',
          appointmentDate: appt.appointmentDate,
          appointmentTime: appt.appointmentTime,
          status: appt.status,
          assignedToRole: appt.assignedToRole || 'DOCTOR',
        }));
        setAppointments(mappedAppointments);
      }
    } catch (err) {
      console.error("Failed to fetch doctor appointments", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch doctor appointments"
      );
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user || session.user.role !== "DOCTOR") {
      setError("Access denied: Doctor only");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      await fetchAppointments();
      setLoading(false);
    };

    loadData();
  }, [session, status, fetchAppointments]);

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
    setWeekStart(startOfWeek(today));
    setView("day");
  }

  const monthGrid = getMonthGrid(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  const weekDays = getWeekDays(weekStart);

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

  if (loading || status === "loading") {
    return (
      <div className="bg-white text-gray-900 rounded-2xl p-8 space-y-8 border border-gray-200 shadow-lg">
        <p className="text-gray-600">Loading doctor appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white text-gray-900 rounded-2xl p-8 space-y-4 border border-gray-200 shadow-lg">
        <h2 className="text-xl font-semibold text-red-600">
          Unable to load calendar
        </h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 rounded-2xl p-8 space-y-8 border border-gray-200 shadow-lg">
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-gray-900 font-semibold text-xl">
            Good day, {session?.user?.name || "Doctor"}!
          </h3>
          <p className="text-gray-600 text-base mt-1">
            {confirmedCount} confirmed appointments scheduled for you
          </p>
        </div>
        <button
          onClick={goToToday}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
        >
          Today
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-emerald-600" />
            Your Schedule
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

          <div className="flex bg-gray-50 rounded-xl p-0.5 border border-gray-100 shadow-sm">
            {(["month", "week"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex-1 ${
                  view === v
                    ? "bg-emerald-600 text-white shadow-md hover:shadow-lg"
                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {requests.length > 0 && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
            >
              <Inbox size={16} />
              {requests.length} Pending
            </button>
          )}
        </div>
      </div>

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
            const dayEvents = events.filter((e) => isSameDay(e.date, day));

            return (
              <div
                key={day.toISOString()}
                className={`relative h-40 border border-gray-200 bg-white hover:shadow-md transition-all duration-200 group ${
                  sundayClosed
                    ? "bg-gradient-to-br from-red-50 to-rose-50 border-red-200 opacity-75"
                    : ""
                }`}
              >
                <div className="absolute top-2 left-3 z-10 flex flex-wrap items-center gap-2">
                  <span
                    className={`text-lg font-bold px-2 py-1 rounded-full ${
                      sundayClosed
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {day.getDate()}
                  </span>

                  {sundayClosed && (
                    <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                      Closed
                    </span>
                  )}
                </div>

                <div className="pt-10 pb-3 px-3 space-y-2 overflow-y-auto max-h-full">
                  {!sundayClosed &&
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

                  {!sundayClosed && dayEvents.length === 0 && (
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

      {view === "week" && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-[90px_repeat(7,160px)] border-b border-gray-200 bg-gray-50">
            <div className="h-12 border-r border-gray-200" />

            {weekDays.map((day) => {
              const sundayClosed = isSunday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`h-12 flex flex-col items-center justify-center border-r border-gray-200 text-sm font-semibold ${
                    sundayClosed ? "bg-red-50 text-red-600" : "text-gray-700"
                  }`}
                >
                  <span>
                    {days[day.getDay()]} {day.getDate()}
                  </span>
                  {sundayClosed && <span className="text-[10px]">Closed</span>}
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

              return (
                <div
                  key={day.toISOString()}
                  className={`border-r border-gray-200 ${sundayClosed ? "bg-red-50" : ""}`}
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
                        {sundayClosed && hour === clinicHours[0].hour && (
                          <div className="text-xs text-red-700 bg-red-100 border border-red-200 rounded-lg p-2">
                            Clinic is closed on Sundays.
                          </div>
                        )}

                        {!sundayClosed &&
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

      {view === "day" && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-[100px_1fr] border-b border-gray-200">
            <div className="h-10 border-r border-gray-200 bg-gray-50" />
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
                const hourEvents = events.filter(
                  (e) => isSameDay(e.date, weekStart) && e.date.getHours() === hour
                );

                return (
                  <div
                    key={hour}
                    className={`h-28 border-b border-gray-100 flex flex-col gap-2 p-3 ${
                      sundayClosed ? "bg-red-50" : ""
                    }`}
                  >
                    {sundayClosed && hour === clinicHours[0].hour && (
                      <div className="text-xs text-red-700 bg-red-100 border border-red-200 rounded-lg p-2">
                        Clinic is closed on Sundays.
                      </div>
                    )}

                    {!sundayClosed &&
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

      {/* Pending requests modal removed - not needed for doctor view */}


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
                  {new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at{" "}
                  {selectedAppointment.appointmentTime ||
                    formatTime(buildAppointmentDateTime(selectedAppointment))}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-medium">{selectedAppointment.status}</p>
              </div>

              <div className="pt-4">
                <p className="text-xs text-gray-500 italic">
                  Doctor view - no edit permissions
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}