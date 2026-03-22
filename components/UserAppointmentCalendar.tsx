"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useSession } from "next-auth/react";

/* ================= TYPES ================= */

export type ServiceType = "ear" | "nose" | "throat" | "aesthetics";

export type AvailabilitySlot = {
  date: Date;
  time: string;
  available: boolean;
};

/* ================= STYLES ================= */

const SERVICE_STYLES: Record<ServiceType, string> = {
  ear: "bg-blue-500/90 text-white",
  nose: "bg-green-500/90 text-white",
  throat: "bg-purple-500/90 text-white",
  aesthetics: "bg-pink-500/90 text-white",
};

/* ================= CONSTANTS ================= */

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const clinicHours = Array.from({ length: 10 }, (_, i) => 8 + i);

/* ================= HELPERS ================= */

function parseDateOnly(value: string | Date) {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const raw = String(value).slice(0, 10);
  const [year, month, day] = raw.split("-").map(Number);

  if (year && month && day) {
    return new Date(year, month - 1, day);
  }

  const fallback = new Date(value);
  return new Date(
    fallback.getFullYear(),
    fallback.getMonth(),
    fallback.getDate()
  );
}

function isDateBlocked(
  date: Date,
  blockedDates: { startDate: string | Date; endDate: string | Date; reason?: string | null }[]
) {
  const target = parseDateOnly(date).getTime();

  return blockedDates.some((item) => {
    const start = parseDateOnly(item.startDate).getTime();
    const end = parseDateOnly(item.endDate).getTime();
    return target >= start && target <= end;
  });
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

function isSunday(date: Date) {
  return date.getDay() === 0;
}

function isPastOrToday(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return date < tomorrow;
}

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const grid: Date[] = [];
  const startDay = firstDay.getDay();

  for (let i = startDay - 1; i >= 0; i--) grid.push(new Date(year, month, -i));
  for (let d = 1; d <= lastDay.getDate(); d++) grid.push(new Date(year, month, d));
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

type Appointment = {
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
};

type BlockedDate = {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  reason: string | null;
};

export default function UserAppointmentCalendar() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [view, setView] = useState<"month" | "week" | "day">("week");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<ServiceType>("ear");
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [formErrors, setFormErrors] = useState<{fullName?: string; age?: string; contactNumber?: string}>({});

  // Check if form is complete
  const isFormComplete = fullName.trim() && age.trim() && contactNumber.trim();

  // Fetch confirmed appointments and blocked dates for availability
  const [activeDoctorCount, setActiveDoctorCount] = useState(1);
  const fetchAvailability = async () => {
    try {
      const availabilityRes = await fetch("/api/availability", { cache: 'no-store' });
      
      if (!availabilityRes.ok) throw new Error("Failed to fetch availability");
      const availabilityData = await availabilityRes.json();
      setAppointments(availabilityData.appointments);
      setBlockedDates(availabilityData.blockedDates || []);
      setActiveDoctorCount(availabilityData.activeDoctorCount || 1);
    } catch (err) {
      console.error("Failed to fetch availability", err);
      setError("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  // Check if a date is blocked  
  const isDayBlockedLocal = (date: Date) => {
    return isDateBlocked(date, blockedDates);
  };

  const getSlotBookedCount = (date: Date, hour: number) => {
    const slotTime = `${hour.toString().padStart(2, '0')}:00`;
    return appointments.filter(appt => {
      const apptDate = new Date(appt.appointmentDate);
      return isSameDay(apptDate, date) && appt.appointmentTime === slotTime;
    }).length;
  };

  const isSlotBooked = (date: Date, hour: number) => {
    const count = getSlotBookedCount(date, hour);
    return count >= activeDoctorCount;
  };

  const isDayFullyBooked = (date: Date) => {
    return clinicHours.every(hour => getSlotBookedCount(date, hour) >= activeDoctorCount);
  };

  // Check if day is blocked
  const isDayBlocked = (date: Date) => {
    return isDayBlockedLocal(date);
  };

  const handleSlotClick = (date: Date, hour: number) => {
    if (isPastOrToday(date) || isSunday(date) || isSlotBooked(date, hour) || isDayBlocked(date)) return;
    setSelectedDate(date);
    setSelectedTime(`${hour.toString().padStart(2, '0')}:00`);
  };

  const validateForm = () => {
    const errors: {fullName?: string; age?: string; contactNumber?: string} = {};
    if (!fullName.trim()) errors.fullName = "Full Name is required";
    if (!age.trim()) errors.age = "Age is required";
    else if (isNaN(Number(age)) || Number(age) <= 0) errors.age = "Age must be a positive number";
    if (!contactNumber.trim()) errors.contactNumber = "Contact Number is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !session?.user || !validateForm()) return;

    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toLocaleDateString('en-CA'),
          time: selectedTime,
          name: fullName,
          age,
          contactNumber,
          email: session.user.email || "",
          serviceType,
        }),
      });

      if (res.ok) {
        alert("Appointment booked successfully!");
        setSelectedDate(null);
        setSelectedTime(null);
        fetchAvailability(); // Refresh availability
      } else {
        // Try to get error message from response
        try {
          const errorData = await res.json();
          alert(errorData.error || "Failed to book appointment");
        } catch {
          alert("Failed to book appointment");
        }
        fetchAvailability(); // Refresh availability even on failure
      }
    } catch (err) {
      alert("Error booking appointment: " + (err instanceof Error ? err.message : "Unknown error"));
      fetchAvailability(); // Refresh availability on error
    }
  };

  function prevMonth() { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)); }
  function nextMonth() { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)); }
  function prevWeek() { setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7)); }
  function nextWeek() { setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7)); }

  function goToToday() {
    const today = new Date();
    setWeekStart(today);
    setView("day");
  }

  if (loading) return <p className="text-white p-6">Loading…</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;

  return (
    <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-xl space-y-6 border border-gray-200">
      {/* FORM */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder="Enter full name"
            />
            {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder="Enter age"
            />
            {formErrors.age && <p className="text-red-500 text-xs mt-1">{formErrors.age}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Contact Number</label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              placeholder="Enter contact number"
            />
            {formErrors.contactNumber && <p className="text-red-500 text-xs mt-1">{formErrors.contactNumber}</p>}
          </div>
        </div>
      </div>

      {/* SELECT APPOINTMENT BUTTON */}
      <div className="space-y-4">
        <button
          onClick={() => setShowCalendarModal(true)}
          disabled={!isFormComplete}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition ${
            isFormComplete
              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Select Appointment Date & Time
        </button>
        {selectedDate && selectedTime && (
          <div className="text-center text-gray-700">
            <p className="font-medium">Selected: {selectedDate.toDateString()} at {selectedTime}</p>
          </div>
        )}
      </div>

      {/* CALENDAR MODAL */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2 text-gray-900">
                <CalendarDays className="w-6 h-6 text-indigo-600" />
                Select Appointment Date & Time
              </h2>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* CONTROLS */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {/* NAVIGATION */}
                <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <button
                    onClick={goToToday}
                    className="px-4 py-2 text-sm hover:bg-gray-200 transition text-gray-700"
                  >
                    Today
                  </button>
                  <button
                    onClick={prevWeek}
                    className="px-3 py-2 hover:bg-gray-200 transition"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextWeek}
                    className="px-3 py-2 hover:bg-gray-200 transition"
                    aria-label="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* SERVICE SELECTOR */}
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as ServiceType)}
                  className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700"
                  aria-label="Select service type"
                >
                  <option value="ear">Ear</option>
                  <option value="nose">Nose</option>
                  <option value="throat">Throat</option>
                  <option value="aesthetics">Aesthetics</option>
                </select>
              </div>

              {/* WEEK VIEW */}
              <div className="grid grid-cols-8 border-t border-gray-200">
                <div className="border-r border-gray-200"></div>
                {getWeekDays(weekStart).map(day => {
                  const blocked = isDayBlocked(day);
                  const closed = isSunday(day) || isPastOrToday(day) || isDayFullyBooked(day) || blocked;
                  return (
                    <div key={day.toISOString()} className={`border-r border-gray-200 ${closed ? "bg-red-50" : ""}`}>
                      <div className="h-8 text-center border-b border-gray-200 text-xs font-semibold text-gray-700">
                        {days[day.getDay()]} {day.getDate()}
                        {blocked && <div className="text-[10px] text-red-600">Blocked</div>}
                        {closed && !blocked && <div className="text-[10px] text-red-600">Unavailable</div>}
                      </div>
                      {clinicHours.map(hour => {
                        const count = getSlotBookedCount(day, hour);
                        const booked = count >= activeDoctorCount;
                        const capacityText = count > 0 ? `${count}/${activeDoctorCount}` : '';
                        return (
                          <div
                            key={hour}
                            onClick={() => {
                              if (!closed && !booked) {
                                handleSlotClick(day, hour);
                                setShowCalendarModal(false);
                              }
                            }}
                            className={`h-16 border-b border-gray-200 relative flex items-center justify-center text-xs cursor-pointer transition group hover:bg-green-50 ${
                              booked || closed
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-green-100 hover:bg-green-200 text-green-800"
                            }`}
                            title={`Capacity: ${count}/${activeDoctorCount}`}
                          >
                            {hour}:00
                            {capacityText && (
                              <span className="absolute -top-8 bg-gray-900 text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                {capacityText}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL - Only show when form is complete and date/time selected */}
      {isFormComplete && selectedDate && selectedTime && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full mx-4 shadow-2xl animate-slideUp">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Confirm Booking</h3>
            <p className="text-gray-700">Date: {selectedDate.toDateString()}</p>
            <p className="text-gray-700">Time: {selectedTime}</p>
            <p className="text-gray-700">Service: {serviceType}</p>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleBookAppointment}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white transition"
              >
                Book
              </button>
              <button
                onClick={() => { setSelectedDate(null); setSelectedTime(null); }}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
