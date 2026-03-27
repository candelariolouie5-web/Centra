"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type ServiceType = "ear" | "nose" | "throat" | "aesthetics";

type SlotInfo = {
  capacity: number;
  occupied: number;
  remaining: number;
  isFull: boolean;
};

type BlockedDate = {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  reason: string | null;
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const clinicHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

function startOfWeek(date: Date) {
  const day = date.getDay();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
}

function getWeekDays(start: Date): Date[] {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function getSlotKey(date: string, time: string) {
  return `${date}-${time}`;
}

function isSunday(date: Date) {
  return date.getDay() === 0;
}

function isPastDay(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return target < today;
}

function normalizeDateOnly(value: string | Date) {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function isDateBlocked(date: Date, blockedDates: BlockedDate[]) {
  const target = normalizeDateOnly(date);

  return blockedDates.some((blocked) => {
    const start = normalizeDateOnly(blocked.startDate);
    const end = normalizeDateOnly(blocked.endDate);
    return target >= start && target <= end;
  });
}

export default function UserAppointmentCalendar() {
  const { data: session } = useSession();

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("ear");

  const [formErrors, setFormErrors] = useState<{
    fullName?: string;
    age?: string;
    contactNumber?: string;
  }>({});

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, SlotInfo>>({});
  const [loadingBlockedDates, setLoadingBlockedDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const mountedRef = useRef(true);
  const fetchedWeekRef = useRef<Set<string>>(new Set());
  const inFlightWeekRef = useRef<Set<string>>(new Set());

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekKey = useMemo(() => weekDays.map((d) => formatDate(d)).join(","), [weekDays]);

  const isFormComplete =
    fullName.trim() !== "" && age.trim() !== "" && contactNumber.trim() !== "";

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const validateForm = () => {
    const errors: {
      fullName?: string;
      age?: string;
      contactNumber?: string;
    } = {};

    if (!fullName.trim()) {
      errors.fullName = "Full Name is required";
    }

    if (!age.trim()) {
      errors.age = "Age is required";
    } else if (isNaN(Number(age)) || Number(age) <= 0) {
      errors.age = "Age must be a positive number";
    }

    if (!contactNumber.trim()) {
      errors.contactNumber = "Contact Number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchBlockedDates = useCallback(async () => {
    try {
      setLoadingBlockedDates(true);

      const res = await fetch("/api/availability", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch blocked dates");
      }

      const data = await res.json();

      if (!mountedRef.current) return;

      setBlockedDates(Array.isArray(data?.blockedDates) ? data.blockedDates : []);
    } catch (error) {
      console.error("Failed to load blocked dates:", error);
      if (mountedRef.current) {
        setBlockedDates([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoadingBlockedDates(false);
      }
    }
  }, []);

  const fetchWeekAvailability = useCallback(async () => {
    if (!showCalendarModal) return;
    if (!weekDays.length || !weekKey) return;
    if (fetchedWeekRef.current.has(weekKey)) return;
    if (inFlightWeekRef.current.has(weekKey)) return;

    inFlightWeekRef.current.add(weekKey);

    try {
      setLoadingSlots(true);

      const entries = await Promise.all(
        weekDays.flatMap((day) =>
          clinicHours.map(async (hour) => {
            const dateStr = formatDate(day);
            const time = formatTime(hour);
            const key = getSlotKey(dateStr, time);

            if (isSunday(day) || isPastDay(day)) {
              return [
                key,
                {
                  capacity: 0,
                  occupied: 0,
                  remaining: 0,
                  isFull: true,
                } satisfies SlotInfo,
              ] as const;
            }

            try {
              const res = await fetch(`/api/availability?date=${dateStr}&time=${time}`, {
                cache: "no-store",
              });

              if (!res.ok) {
                return [
                  key,
                  {
                    capacity: 0,
                    occupied: 0,
                    remaining: 0,
                    isFull: true,
                  } satisfies SlotInfo,
                ] as const;
              }

              const data = await res.json();
              const slot = data?.slotInfo ?? {};

              return [
                key,
                {
                  capacity: Number(slot.capacity ?? 0),
                  occupied: Number(slot.occupied ?? slot.booked ?? 0),
                  remaining: Number(slot.remaining ?? 0),
                  isFull: Boolean(slot.isFull ?? Number(slot.remaining ?? 0) <= 0),
                } satisfies SlotInfo,
              ] as const;
            } catch {
              return [
                key,
                {
                  capacity: 0,
                  occupied: 0,
                  remaining: 0,
                  isFull: true,
                } satisfies SlotInfo,
              ] as const;
            }
          })
        )
      );

      if (!mountedRef.current) return;

      setAvailabilityMap((prev) => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));

      fetchedWeekRef.current.add(weekKey);
    } catch (error) {
      console.error("Failed to load week availability:", error);
    } finally {
      inFlightWeekRef.current.delete(weekKey);
      if (mountedRef.current) {
        setLoadingSlots(false);
      }
    }
  }, [showCalendarModal, weekDays, weekKey]);

  useEffect(() => {
    if (showCalendarModal) {
      fetchBlockedDates();
    }
  }, [showCalendarModal, fetchBlockedDates]);

  useEffect(() => {
    fetchWeekAvailability();
  }, [fetchWeekAvailability]);

  const getSlotInfo = (date: Date, hour: number): SlotInfo => {
    const key = getSlotKey(formatDate(date), formatTime(hour));
    return (
      availabilityMap[key] ?? {
        capacity: 0,
        occupied: 0,
        remaining: 0,
        isFull: true,
      }
    );
  };

  const isSlotAvailable = (date: Date, hour: number) => {
    const blocked = isDateBlocked(date, blockedDates);
    const sunday = isSunday(date);
    const past = isPastDay(date);
    const slot = getSlotInfo(date, hour);

    return !blocked && !sunday && !past && slot.remaining > 0 && !slot.isFull;
  };

  const handleSelectSlot = (date: Date, hour: number) => {
    if (!isSlotAvailable(date, hour)) return;

    setSelectedDate(new Date(`${formatDate(date)}T00:00:00`));
    setSelectedTime(formatTime(hour));
    setShowCalendarModal(false);
    setShowConfirmModal(true);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !session?.user || !validateForm()) {
      return;
    }

    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formatDate(selectedDate),
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
        setShowConfirmModal(false);
      } else {
        try {
          const errorData = await res.json();
          alert(errorData.error || "Failed to book appointment");
        } catch {
          alert("Failed to book appointment");
        }
      }
    } catch (err) {
      alert(
        "Error booking appointment: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const goToToday = () => {
    setWeekStart(startOfWeek(new Date()));
  };

  const prevWeek = () => {
    setWeekStart(
      new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7)
    );
  };

  const nextWeek = () => {
    setWeekStart(
      new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7)
    );
  };

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Patient Information</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter full name"
            />
            {formErrors.fullName && (
              <p className="mt-1 text-xs text-red-500">{formErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter age"
            />
            {formErrors.age && (
              <p className="mt-1 text-xs text-red-500">{formErrors.age}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter contact number"
            />
            {formErrors.contactNumber && (
              <p className="mt-1 text-xs text-red-500">{formErrors.contactNumber}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Service</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ear">Ear</option>
            <option value="nose">Nose</option>
            <option value="throat">Throat</option>
            <option value="aesthetics">Aesthetics</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setShowCalendarModal(true)}
          disabled={!isFormComplete}
          className={`w-full rounded-xl px-6 py-3 font-semibold transition ${
            isFormComplete
              ? "bg-indigo-600 text-white hover:bg-indigo-500"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
          type="button"
        >
          Select Appointment Date & Time
        </button>

        {selectedDate && selectedTime && (
          <div className="text-center text-gray-700">
            <p className="font-medium">
              Selected: {selectedDate.toDateString()} at {selectedTime}
            </p>
          </div>
        )}
      </div>

      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-gray-900">
                <CalendarDays className="h-6 w-6 text-indigo-600" />
                Select Appointment Date & Time
              </h2>

              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-400 transition hover:text-gray-600"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-100 p-1">
                  <button
                    onClick={goToToday}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md"
                    type="button"
                  >
                    Today
                  </button>
                  <button
                    onClick={prevWeek}
                    className="rounded-lg p-2 hover:bg-gray-200"
                    type="button"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextWeek}
                    className="rounded-lg p-2 hover:bg-gray-200"
                    type="button"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <span className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                  {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
                </span>
              </div>

              {loadingBlockedDates || loadingSlots ? (
                <div className="py-10 text-center text-gray-500">Loading slots...</div>
              ) : (
                <div className="grid grid-cols-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-r border-gray-200 bg-gray-50">
                    {clinicHours.map((hour) => (
                      <div
                        key={hour}
                        className="flex h-16 items-center justify-end border-b border-gray-100 pr-2 font-mono text-xs text-gray-500"
                      >
                        {hour % 12 === 0 ? "12" : hour % 12}:00 {hour >= 12 ? "PM" : "AM"}
                      </div>
                    ))}
                  </div>

                  {weekDays.map((day) => {
                    const blocked = isDateBlocked(day, blockedDates);
                    const fullyBooked = clinicHours.every(
                      (hour) => !isSlotAvailable(day, hour)
                    );
                    const unavailable =
                      isSunday(day) || isPastDay(day) || blocked || fullyBooked;

                    return (
                      <div
                        key={day.toISOString()}
                        className={`border-r border-gray-200 ${
                          unavailable ? "bg-red-50/50" : ""
                        }`}
                      >
                        <div className="flex h-12 flex-col items-center justify-center border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white p-1 text-xs font-semibold text-gray-700">
                          <span>
                            {days[day.getDay()]} {day.getDate()}
                          </span>

                          {blocked && (
                            <span className="rounded bg-red-100 px-1 py-px text-[10px] text-red-600">
                              Blocked
                            </span>
                          )}

                          {isSunday(day) && (
                            <span className="rounded bg-orange-100 px-1 py-px text-[10px] text-orange-600">
                              Closed
                            </span>
                          )}

                          {fullyBooked && !blocked && !isSunday(day) && (
                            <span className="rounded bg-orange-100 px-1 py-px text-[10px] text-orange-600">
                              Full
                            </span>
                          )}
                        </div>

                        {clinicHours.map((hour) => {
                          const slot = getSlotInfo(day, hour);
                          const available = isSlotAvailable(day, hour);

                          return (
                            <button
                              key={hour}
                              onClick={() => handleSelectSlot(day, hour)}
                              disabled={!available}
                              type="button"
                              className={`group relative flex h-16 w-full items-center justify-center border-b border-gray-100 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                                available
                                  ? "border-l-4 border-emerald-400 bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                              title={
                                available
                                  ? `Available (${slot.remaining} slots left)`
                                  : "Unavailable"
                              }
                            >
                              {hour}:00
                              {slot.capacity > 0 && (
                                <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-all group-hover:opacity-100">
                                  {slot.occupied}/{slot.capacity}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && isFormComplete && selectedDate && selectedTime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-slideUp">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Confirm Booking
            </h3>
            <p className="text-gray-700">Date: {selectedDate.toDateString()}</p>
            <p className="text-gray-700">Time: {selectedTime}</p>
            <p className="text-gray-700">Service: {serviceType}</p>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleBookAppointment}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500"
                type="button"
              >
                Book
              </button>

              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedDate(null);
                  setSelectedTime(null);
                }}
                className="rounded-lg bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-500"
                type="button"
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