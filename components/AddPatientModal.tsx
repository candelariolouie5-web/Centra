"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  UserRound,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  X,
} from "lucide-react";

type ServiceType = "ear" | "nose" | "throat" | "aesthetics";

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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function formatTime(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}
function formatDisplayTime(hour: number) {
  return `${hour % 12 === 0 ? "12" : hour % 12}:00 ${hour >= 12 ? "PM" : "AM"}`;
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
function isToday(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return target.getTime() === today.getTime();
}
function getSlotKey(date: string, time: string) {
  return `${date}-${time}`;
}

export default function AddPatientModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { data: session } = useSession();
  const providerId = session?.user?.id;
  const providerRole = session?.user?.role;

  const [step, setStep] = useState<"patient" | "calendar" | "confirm">("patient");

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    contactNumber: "",
    birthdate: "",
  });
  const [serviceType, setServiceType] = useState<ServiceType>("ear");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, any>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("patient");
      setForm({ name: "", age: "", gender: "", contactNumber: "", birthdate: "" });
      setSelectedDate(null);
      setSelectedTime(null);
      setWeekStart(startOfWeek(new Date()));
      setFormErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (step !== "calendar" || !open || !providerId) return;
    fetchWeekAvailability();
  }, [step, weekStart, open, providerId]);

  const fetchWeekAvailability = async () => {
    setLoadingSlots(true);
    const entries: [string, any][] = [];

    for (const day of weekDays) {
      for (const hour of clinicHours) {
        const key = getSlotKey(formatDate(day), formatTime(hour));

        if (isSunday(day) || isPastDay(day)) {
          entries.push([
            key,
            { capacity: 0, occupied: 0, remaining: 0, isFull: true, reason: "Unavailable" },
          ]);
          continue;
        }

        if (isToday(day)) {
          const currentHour = new Date().getHours();
          if (hour <= currentHour) {
            entries.push([
              key,
              { capacity: 0, occupied: 0, remaining: 0, isFull: true, reason: "Time passed" },
            ]);
            continue;
          }
        }

        const res = await fetch(
          `/api/availability?date=${formatDate(day)}&time=${formatTime(hour)}&providerId=${providerId}&allowSameDay=true`,
          { cache: "no-store" }
        );
        const data = await res.json();
        const slot = data?.slotInfo ?? {};
        entries.push([
          key,
          {
            capacity: Number(slot.capacity ?? 0),
            occupied: Number(slot.occupied ?? 0),
            remaining: Number(slot.remaining ?? 0),
            isFull: Boolean(slot.isFull ?? Number(slot.remaining ?? 0) <= 0),
            reason: slot.reason,
          },
        ]);
      }
    }

    setAvailabilityMap(Object.fromEntries(entries));
    setLoadingSlots(false);
  };

  const getSlotInfo = (date: Date, hour: number) => {
    const key = getSlotKey(formatDate(date), formatTime(hour));
    return (
      availabilityMap[key] ?? {
        capacity: 0,
        occupied: 0,
        remaining: 0,
        isFull: true,
        reason: "Unavailable",
      }
    );
  };

  const isSlotAvailable = (date: Date, hour: number) => {
    const slot = getSlotInfo(date, hour);
    return slot.capacity > 0 && slot.remaining > 0 && !slot.isFull;
  };

  const handleSelectSlot = (date: Date, hour: number) => {
    if (!isSlotAvailable(date, hour)) return;
    setSelectedDate(date);
    setSelectedTime(formatTime(hour));
    setStep("confirm");
  };

  const validatePatientForm = () => {
    const errors: any = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.age || Number(form.age) <= 0 || Number(form.age) > 999)
      errors.age = "Invalid age";
    if (!form.gender) errors.gender = "Gender is required";
    if (!/^09\d{9}$/.test(form.contactNumber))
      errors.contactNumber = "Use 09XXXXXXXXX";
    if (!form.birthdate) errors.birthdate = "Birthdate is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validatePatientForm()) setStep("calendar");
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !providerId) return;
    setIsBooking(true);
    try {
      const payload = {
        name: form.name.trim(),
        age: parseInt(form.age),
        gender: form.gender,
        contactNumber: form.contactNumber,
        birthdate: form.birthdate,
        serviceType,
        appointmentDate: formatDate(selectedDate),
        appointmentTime: selectedTime,
      };

      const endpoint =
        providerRole === "ADMIN"
          ? "/api/admin/appointments"
          : "/api/doctor/appointments";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Booking failed");
      }
    } catch (err) {
      alert("Error booking appointment");
    } finally {
      setIsBooking(false);
    }
  };

  const goToToday = () => setWeekStart(startOfWeek(new Date()));
  const prevWeek = () =>
    setWeekStart(
      new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7)
    );
  const nextWeek = () =>
    setWeekStart(
      new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7)
    );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_-25px_rgba(15,23,42,0.35)]">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-start justify-between gap-4 px-6 py-5 md:px-8">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                Walk-in Patient Booking
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {step === "patient"
                  ? "Patient Details"
                  : step === "calendar"
                  ? "Select Schedule"
                  : "Confirm Booking"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {providerRole === "ADMIN" ? "Booking as Admin" : "Booking as Doctor"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(92vh-140px)] overflow-y-auto bg-slate-50">
          <div className="px-6 py-6 md:px-8">
            {step === "patient" && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">
                      Personal Information
                    </h4>
                    <p className="text-sm text-slate-500">
                      Fill in the patient's basic details for walk-in booking.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      placeholder="e.g. Juan Dela Cruz"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Age
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      placeholder="Age"
                    />
                    {formErrors.age && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.age}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.gender && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.gender}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={11}
                      value={form.contactNumber}
                      onChange={(e) =>
                        setForm({ ...form, contactNumber: e.target.value.replace(/\D/g, "") })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      placeholder="09XXXXXXXXX"
                    />
                    {formErrors.contactNumber && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.contactNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Birthdate
                    </label>
                    <input
                      type="date"
                      value={form.birthdate}
                      onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />
                    {formErrors.birthdate && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.birthdate}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Service
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value as ServiceType)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="ear">Ear</option>
                      <option value="nose">Nose</option>
                      <option value="throat">Throat</option>
                      <option value="aesthetics">Aesthetics</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === "calendar" && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToToday}
                      className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Today
                    </button>
                    <button
                      onClick={prevWeek}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextWeek}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-slate-500">Same-day booking allowed</span>
                </div>
                {loadingSlots ? (
                  <div className="py-16 text-center text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> Loading slots...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="grid min-w-[900px] grid-cols-8">
                      <div className="border-r border-slate-200 bg-slate-50">
                        <div className="h-12 flex items-center justify-center border-b border-slate-200 text-xs font-semibold">
                          Time
                        </div>
                        {clinicHours.map((hour) => (
                          <div
                            key={hour}
                            className="h-14 flex items-center justify-end border-b border-slate-100 pr-2 text-xs text-slate-500"
                          >
                            {formatDisplayTime(hour)}
                          </div>
                        ))}
                      </div>
                      {weekDays.map((day) => (
                        <div
                          key={day.toISOString()}
                          className="border-r border-slate-200 last:border-r-0"
                        >
                          <div className="h-12 flex flex-col items-center justify-center border-b border-slate-200 bg-slate-50 text-xs font-semibold">
                            <span>
                              {days[day.getDay()]} {day.getDate()}
                            </span>
                            {isToday(day) && (
                              <span className="text-[10px] text-amber-600">Today</span>
                            )}
                          </div>
                          {clinicHours.map((hour) => {
                            const available = isSlotAvailable(day, hour);
                            return (
                              <button
                                key={hour}
                                onClick={() => handleSelectSlot(day, hour)}
                                disabled={!available}
                                className={`h-14 w-full text-sm font-medium border-b border-slate-100 transition ${
                                  available
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : "bg-slate-50 text-slate-300 cursor-not-allowed"
                                }`}
                              >
                                {formatDisplayTime(hour)}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === "confirm" && selectedDate && selectedTime && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">
                      Confirm Walk-in Booking
                    </h4>
                    <p className="text-sm text-slate-500">
                      Review the patient and schedule details before booking.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Patient</p>
                      <p className="font-semibold">{form.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Age</p>
                      <p className="font-semibold">{form.age}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Contact</p>
                      <p className="font-semibold">{form.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Service</p>
                      <p className="font-semibold capitalize">{serviceType}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Date</p>
                      <p className="font-semibold">{selectedDate.toDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Time</p>
                      <p className="font-semibold">{selectedTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {step === "patient" && "Step 1 of 3: Patient Details"}
              {step === "calendar" && "Step 2 of 3: Select Schedule"}
              {step === "confirm" && "Step 3 of 3: Confirm Booking"}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              {step === "patient" && (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700"
                >
                  Continue to Calendar
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {step === "calendar" && (
                <button
                  onClick={() => setStep("patient")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              {step === "confirm" && (
                <>
                  <button
                    onClick={() => setStep("calendar")}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isBooking}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg ${
                      isBooking
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Booking...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Confirm Booking
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}