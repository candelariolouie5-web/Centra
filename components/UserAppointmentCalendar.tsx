"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Phone,
  User2,
  Stethoscope,
  Check,
  Users,
  UserPlus,
  Shield,
  Calendar,
  Loader2,
} from "lucide-react";

type ServiceType = "ear" | "nose" | "throat" | "aesthetics";

type SlotInfo = {
  capacity: number;
  occupied: number;
  remaining: number;
  isFull: boolean;
  reason?: string;
};

type Patient = {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  birthdate: string | null;
  address: string | null;
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

function formatDisplayTime(hour: number) {
  return `${hour % 12 === 0 ? "12" : hour % 12}:00 ${hour >= 12 ? "PM" : "AM"}`;
}

function getSlotKey(date: string, time: string) {
  return `${date}-${time}`;
}

function isSunday(date: Date) {
  return date.getDay() === 0;
}

function isToday(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return target.getTime() === today.getTime();
}

function isPastDay(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return target < today;
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function isValidPHMobile(value: string) {
  return /^09\d{9}$/.test(value);
}

export default function UserAppointmentCalendar() {
  const { data: session } = useSession();

  // ===== PATIENT TYPE STATE =====
  const [patientType, setPatientType] = useState<"new" | "existing">("new");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // ===== FORM STATE (LAHAT NG FIELDS) =====
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("ear");

  // ===== AUTO-SEARCH STATE =====
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formErrors, setFormErrors] = useState<{
    fullName?: string;
    age?: string;
    gender?: string;
    contactNumber?: string;
    birthdate?: string;
  }>({});

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, SlotInfo>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    date: Date;
    time: string;
    patient: string;
    contact: string;
    service: ServiceType;
  } | null>(null);

  const mountedRef = useRef(true);
  const fetchedWeekRef = useRef<Set<string>>(new Set());
  const inFlightWeekRef = useRef<Set<string>>(new Set());

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekKey = useMemo(() => weekDays.map((d) => formatDate(d)).join(","), [weekDays]);

  // ===== AUTO-SEARCH FOR RETURNING PATIENT (NAME + BIRTHDATE LANG) =====
  useEffect(() => {
    // Only run when patientType is "existing"
    if (patientType !== "existing") {
      setSelectedPatient(null);
      setIsVerified(false);
      setSearchError(null);
      return;
    }

    // Need at least name (2 chars) and birthdate
    if (!fullName.trim() || fullName.trim().length < 2 || !birthdate.trim()) {
      setSearchError(null);
      setSelectedPatient(null);
      setIsVerified(false);
      return;
    }

    // Validate birthdate
    const dateObj = new Date(birthdate);
    if (isNaN(dateObj.getTime())) {
      setSearchError("Invalid birthdate format");
      setSelectedPatient(null);
      setIsVerified(false);
      return;
    }

    // Debounce search
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      try {
        // ✅ TINANGGAL ANG EMAIL SA API CALL — NAME + BIRTHDATE LANG
        const res = await fetch(
          `/api/patients/find-by-email-name-birthdate?name=${encodeURIComponent(
            fullName.trim()
          )}&birthdate=${birthdate}`
        );
        const data = await res.json();

        if (data.found && data.patient) {
          // ✅ Found existing patient
          setSelectedPatient(data.patient);
          setIsVerified(true);
          setAge(data.patient.age?.toString() || "");
          setGender(data.patient.gender || "");
          setContactNumber(data.patient.phone || "");
          setSearchError(null);
        } else {
          // ❌ No match — this will be treated as new patient
          setSelectedPatient(null);
          setIsVerified(false);
          setSearchError(data.error || null);
        }
      } catch (error) {
        console.error("Auto-search error:", error);
        setSearchError("An error occurred. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [fullName, birthdate, patientType]);

  // ===== CHECK IF FORM IS COMPLETE =====
  const isFormComplete = useMemo(() => {
    // For returning patient: dapat may selectedPatient at verified
    if (patientType === "existing" && selectedPatient) {
      return true;
    }
    // For new patient: validate all fields including birthdate
    return (
      fullName.trim() !== "" &&
      age.trim() !== "" &&
      Number(age) > 0 &&
      Number(age) <= 999 &&
      gender.trim() !== "" &&
      contactNumber.length === 11 &&
      isValidPHMobile(contactNumber) &&
      birthdate.trim() !== ""
    );
  }, [patientType, selectedPatient, fullName, age, gender, contactNumber, birthdate]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // ===== VALIDATE FORM =====
  const validateForm = () => {
    const errors: {
      fullName?: string;
      age?: string;
      gender?: string;
      contactNumber?: string;
      birthdate?: string;
    } = {};

    if (patientType === "existing" && selectedPatient) {
      return true;
    }

    if (!fullName.trim()) errors.fullName = "Full Name is required";
    if (!age.trim()) {
      errors.age = "Age is required";
    } else if (isNaN(Number(age)) || Number(age) <= 0) {
      errors.age = "Age must be a positive number";
    } else if (Number(age) > 999) {
      errors.age = "Age must be 1 to 999 (max 3 digits)";
    }
    if (!gender.trim()) errors.gender = "Gender is required";
    if (!contactNumber.trim()) {
      errors.contactNumber = "Contact Number is required";
    } else if (contactNumber.length !== 11) {
      errors.contactNumber = "Contact Number must be exactly 11 digits";
    } else if (!isValidPHMobile(contactNumber)) {
      errors.contactNumber = "Use a valid PH mobile number format (09XXXXXXXXX)";
    }
    if (!birthdate.trim()) {
      errors.birthdate = "Birthdate is required";
    } else {
      const dateObj = new Date(birthdate);
      if (isNaN(dateObj.getTime())) {
        errors.birthdate = "Invalid birthdate format";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===== FETCH AVAILABILITY =====
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

            if (isSunday(day)) {
              return [
                key,
                {
                  capacity: 0,
                  occupied: 0,
                  remaining: 0,
                  isFull: true,
                  reason: "Clinic is closed on Sundays",
                } satisfies SlotInfo,
              ] as const;
            }

            if (isPastDay(day)) {
              return [
                key,
                {
                  capacity: 0,
                  occupied: 0,
                  remaining: 0,
                  isFull: true,
                  reason: "Past dates are unavailable",
                } satisfies SlotInfo,
              ] as const;
            }

            if (isToday(day)) {
              return [
                key,
                {
                  capacity: 0,
                  occupied: 0,
                  remaining: 0,
                  isFull: true,
                  reason: "Same-day booking is not allowed",
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
                    reason: "Unavailable",
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
                  reason:
                    typeof slot.reason === "string" && slot.reason.trim()
                      ? slot.reason
                      : undefined,
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
                  reason: "Unavailable",
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
        reason: "Unavailable",
      }
    );
  };

  const isDayFullyBlocked = (date: Date) => {
    if (isSunday(date) || isPastDay(date) || isToday(date)) return false;
    return clinicHours.every((hour) => {
      const slot = getSlotInfo(date, hour);
      return slot.capacity <= 0;
    });
  };

  const isDayFullyBooked = (date: Date) => {
    if (isSunday(date) || isPastDay(date) || isToday(date)) return false;
    if (isDayFullyBlocked(date)) return false;
    return clinicHours.every((hour) => {
      const slot = getSlotInfo(date, hour);
      return slot.capacity > 0 && slot.remaining <= 0;
    });
  };

  const getUnavailableReason = (date: Date, hour: number) => {
    const sunday = isSunday(date);
    const past = isPastDay(date);
    const today = isToday(date);
    const slot = getSlotInfo(date, hour);

    if (sunday) return "Clinic is closed on Sundays";
    if (past) return "Past dates are unavailable";
    if (today) return "Same-day booking is not allowed";
    if (slot.capacity <= 0) return slot.reason || "Blocked date";
    if (slot.reason) return slot.reason;
    if (slot.isFull || slot.remaining <= 0) return "Fully booked";
    return "Unavailable";
  };

  const isSlotAvailable = (date: Date, hour: number) => {
    const sunday = isSunday(date);
    const past = isPastDay(date);
    const today = isToday(date);
    const slot = getSlotInfo(date, hour);
    return !sunday && !past && !today && slot.capacity > 0 && slot.remaining > 0 && !slot.isFull;
  };

  const handleSelectSlot = (date: Date, hour: number) => {
    if (!isSlotAvailable(date, hour)) return;
    setSelectedDate(new Date(`${formatDate(date)}T00:00:00`));
    setSelectedTime(formatTime(hour));
    setShowCalendarModal(false);
    setShowConfirmModal(true);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !session?.user) {
      return;
    }
    if (!validateForm()) {
      return;
    }

    setIsBooking(true);

    try {
      const payload: any = {
        date: formatDate(selectedDate),
        time: selectedTime,
        serviceType,
      };

      // If we have a verified existing patient, use patientId
      if (patientType === "existing" && selectedPatient && isVerified) {
        payload.patientId = selectedPatient.id;
        // Auto-sync updates (optional)
        if (fullName.trim() !== selectedPatient.name) payload.name = fullName.trim();
        if (age !== selectedPatient.age?.toString()) payload.age = parseInt(age) || undefined;
        if (gender !== selectedPatient.gender) payload.gender = gender || undefined;
        if (contactNumber !== selectedPatient.phone) payload.contactNumber = contactNumber;
        if (birthdate !== selectedPatient.birthdate) payload.birthdate = birthdate;
      } else {
        // New patient: include birthdate
        payload.name = fullName.trim();
        payload.age = parseInt(age) || undefined;
        payload.gender = gender || undefined;
        payload.contactNumber = contactNumber;
        payload.email = session.user.email || "";
        payload.birthdate = birthdate;
      }

      console.log("📝 Booking payload:", payload);

      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (res.ok) {
        setSuccessData({
          date: selectedDate,
          time: selectedTime,
          patient: fullName.trim() || selectedPatient?.name || "",
          contact: contactNumber,
          service: serviceType,
        });
        setShowSuccess(true);
        setShowConfirmModal(false);
        setSelectedDate(null);
        setSelectedTime(null);
      } else {
        alert(`❌ ${responseData.error || "Failed to book appointment"}`);
      }
    } catch (err) {
      console.error("❌ Booking error:", err);
      alert("Error booking appointment: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsBooking(false);
    }
  };

  const goToToday = () => setWeekStart(startOfWeek(new Date()));
  const prevWeek = () =>
    setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7));
  const nextWeek = () =>
    setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7));

  const handleBookAnother = () => {
    setShowSuccess(false);
    setSuccessData(null);
    setFullName("");
    setAge("");
    setGender("");
    setContactNumber("");
    setBirthdate("");
    setSelectedPatient(null);
    setPatientType("new");
    setIsVerified(false);
    setSearchError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_26%),linear-gradient(to_right,_#ffffff,_#f8faff)] px-6 py-6 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
                  Patient Booking
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Book your appointment
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {patientType === "existing" && selectedPatient && isVerified
                    ? "✅ You're verified as a returning patient. Your existing record will be used."
                    : "Fill in your details first, then choose an available schedule."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Service</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 capitalize">
                    {serviceType}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Same-day</p>
                  <p className="mt-1 text-sm font-semibold text-amber-700">Not allowed</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Contact format</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">09XXXXXXXXX</p>
                </div>
              </div>
            </div>
          </div>

          {!showSuccess ? (
            <div className="space-y-8 p-6 md:p-8">
              {/* ===== PATIENT TYPE TOGGLE ===== */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 md:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Are you a new or returning patient?
                    </h3>
                    <p className="text-sm text-slate-500">
                      {patientType === "existing" && selectedPatient && isVerified
                        ? "✅ You're verified as a returning patient. Your existing record will be used."
                        : "Select your patient type to continue."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setPatientType("new");
                      setSelectedPatient(null);
                      setIsVerified(false);
                      setSearchError(null);
                      setFullName("");
                      setAge("");
                      setGender("");
                      setContactNumber("");
                      setBirthdate("");
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all ${
                      patientType === "new"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    ✨ New Patient
                  </button>
                  <button
                    onClick={() => {
                      setPatientType("existing");
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all ${
                      patientType === "existing"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    🔄 Returning Patient
                  </button>
                </div>
              </div>

              {/* ===== PATIENT INFORMATION FORM (WITH BIRTHDATE) ===== */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                    <User2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Patient Information</h3>
                    <p className="text-sm text-slate-500">
                      {patientType === "existing" && selectedPatient && isVerified
                        ? "✅ Using existing patient record. Changes will auto-sync."
                        : "Please provide accurate booking details."}
                    </p>
                    {patientType === "existing" && isSearching && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Searching for existing record...
                      </p>
                    )}
                    {patientType === "existing" && searchError && !selectedPatient && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ No existing record found. You will be registered as a new patient.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      placeholder="Enter full name"
                    />
                    {formErrors.fullName && (
                      <p className="mt-2 text-xs font-medium text-red-500">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Age</label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      step="1"
                      value={age}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length <= 3) {
                          setAge(val);
                        }
                      }}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      placeholder="Enter age"
                    />
                    {formErrors.age && (
                      <p className="mt-2 text-xs font-medium text-red-500">{formErrors.age}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.gender && (
                      <p className="mt-2 text-xs font-medium text-red-500">{formErrors.gender}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Phone className="h-4 w-4" />
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={11}
                      value={contactNumber}
                      onChange={(e) => setContactNumber(normalizePhone(e.target.value))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      placeholder="09XXXXXXXXX"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">11 digits only</span>
                      <span
                        className={`font-medium ${
                          contactNumber.length === 11
                            ? "text-emerald-600"
                            : contactNumber.length > 0
                            ? "text-amber-600"
                            : "text-slate-400"
                        }`}
                      >
                        {contactNumber.length}/11
                      </span>
                    </div>
                    {formErrors.contactNumber && (
                      <p className="mt-2 text-xs font-medium text-red-500">
                        {formErrors.contactNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Calendar className="h-4 w-4" />
                      Birthdate
                    </label>
                    <input
                      type="date"
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                    {formErrors.birthdate && (
                      <p className="mt-2 text-xs font-medium text-red-500">{formErrors.birthdate}</p>
                    )}
                    {patientType === "existing" && selectedPatient && isVerified && (
                      <p className="mt-1 text-xs text-emerald-600">
                        ✅ Birthdate matches existing record
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Stethoscope className="h-4 w-4" />
                      Service
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value as ServiceType)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="ear">Ear</option>
                      <option value="nose">Nose</option>
                      <option value="throat">Throat</option>
                      <option value="aesthetics">Aesthetics</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Schedule Selection</h4>
                    <p className="text-sm text-slate-500">
                      Pick a future date and available time slot.
                    </p>
                  </div>

                  {selectedDate && selectedTime && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
                      <p className="font-semibold text-emerald-800">Selected schedule</p>
                      <p className="mt-1 text-emerald-700">
                        {selectedDate.toDateString()} at {selectedTime}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowCalendarModal(true)}
                  disabled={!isFormComplete}
                  className={`mt-5 inline-flex w-full items-center justify-center rounded-2xl px-6 py-4 text-sm font-semibold shadow-lg transition-all ${
                    isFormComplete
                      ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white hover:-translate-y-0.5 hover:shadow-xl"
                      : "cursor-not-allowed bg-slate-200 text-slate-500 shadow-none"
                  }`}
                  type="button"
                >
                  {isFormComplete
                    ? "Select Appointment Date & Time"
                    : patientType === "existing" && !selectedPatient
                    ? "Enter your name and birthdate to verify"
                    : "Complete all patient details"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 p-6 md:p-8">
              <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-8 w-8" />
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-slate-900">
                    Appointment Confirmed!
                  </h2>
                  <p className="text-sm text-slate-500">
                    Your appointment has been scheduled.
                  </p>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <span className="font-medium text-slate-500">Date</span>
                    <span className="font-semibold text-slate-900">
                      {successData?.date.toDateString()}
                    </span>
                    <span className="font-medium text-slate-500">Time</span>
                    <span className="font-semibold text-slate-900">{successData?.time}</span>
                    <span className="font-medium text-slate-500">Duration</span>
                    <span className="font-semibold text-slate-900">1 hour</span>
                    <span className="font-medium text-slate-500">Service</span>
                    <span className="font-semibold text-slate-900 capitalize">
                      {successData?.service}
                    </span>
                    <span className="font-medium text-slate-500">Patient</span>
                    <span className="font-semibold text-slate-900">{successData?.patient}</span>
                    <span className="font-medium text-slate-500">Contact</span>
                    <span className="font-semibold text-slate-900">{successData?.contact}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-lg font-bold">
                    👨‍⚕️
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Dr. Wade Warren</p>
                    <p className="text-xs text-slate-500">ENT Specialist</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
                    onClick={() => alert("🔍 Find similar appointments (demo)")}
                  >
                    Find similar
                  </button>
                  <button
                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700"
                    onClick={() => alert("👤 Redirect to Patient Portal (demo)")}
                  >
                    Patient Portal
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={handleBookAnother}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    ← Book another appointment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── CALENDAR MODAL ─── */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
          <div className="max-h-[92vh] w-full max-w-7xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 md:px-8">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
                  <CalendarDays className="h-6 w-6 text-indigo-600" />
                  Select Appointment Date & Time
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Sundays are closed and same-day booking is disabled.
                </p>
              </div>

              <button
                onClick={() => setShowCalendarModal(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[calc(92vh-100px)] overflow-y-auto p-6 md:p-8">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-1.5">
                  <button
                    onClick={goToToday}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:shadow"
                    type="button"
                  >
                    Today
                  </button>
                  <button
                    onClick={prevWeek}
                    className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-200"
                    type="button"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextWeek}
                    className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-200"
                    type="button"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    Service: {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Green = available
                  </span>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Today = not allowed
                  </span>
                </div>
              </div>

              {loadingSlots ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 py-16 text-center text-slate-500">
                  Loading slots...
                </div>
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="grid min-w-[980px] grid-cols-8">
                    <div className="border-r border-slate-200 bg-slate-50">
                      <div className="flex h-14 items-center justify-center border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Time
                      </div>
                      {clinicHours.map((hour) => (
                        <div
                          key={hour}
                          className="flex h-16 items-center justify-end border-b border-slate-100 pr-3 font-mono text-xs text-slate-500"
                        >
                          {formatDisplayTime(hour)}
                        </div>
                      ))}
                    </div>

                    {weekDays.map((day) => {
                      const sunday = isSunday(day);
                      const past = isPastDay(day);
                      const sameDayBlocked = isToday(day);
                      const fullyBlocked = isDayFullyBlocked(day);
                      const fullyBooked = isDayFullyBooked(day);

                      const unavailable =
                        sunday || past || sameDayBlocked || fullyBlocked || fullyBooked;

                      return (
                        <div
                          key={day.toISOString()}
                          className={`border-r border-slate-200 last:border-r-0 ${
                            unavailable
                              ? sameDayBlocked
                                ? "bg-amber-50/60"
                                : "bg-slate-50"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex h-14 flex-col items-center justify-center gap-1 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white p-2 text-xs font-semibold text-slate-700">
                            <span>
                              {days[day.getDay()]} {day.getDate()}
                            </span>

                            {fullyBlocked && !sunday && !past && !sameDayBlocked && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] text-red-600">
                                Blocked
                              </span>
                            )}

                            {sunday && (
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] text-orange-600">
                                Closed
                              </span>
                            )}

                            {sameDayBlocked && !sunday && !past && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                                No Same-Day
                              </span>
                            )}

                            {fullyBooked && !fullyBlocked && !sunday && !sameDayBlocked && (
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] text-orange-600">
                                Full
                              </span>
                            )}

                            {past && !sunday && (
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">
                                Past
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
                                className={`group relative flex h-16 w-full items-center justify-center border-b border-slate-100 text-sm font-semibold transition ${
                                  available
                                    ? "border-l-4 border-emerald-400 bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : sameDayBlocked
                                      ? "bg-amber-50 text-amber-700"
                                      : slot.capacity <= 0
                                        ? "bg-slate-50 text-slate-400"
                                        : "bg-transparent text-slate-400"
                                } disabled:cursor-not-allowed`}
                                title={
                                  available
                                    ? `Available (${slot.remaining} slots left)`
                                    : getUnavailableReason(day, hour)
                                }
                              >
                                {hour}:00

                                {slot.capacity > 0 && (
                                  <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-all group-hover:opacity-100">
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── CONFIRM MODAL ─── */}
      {showConfirmModal && isFormComplete && selectedDate && selectedTime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
          <div className="mx-4 w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.25)]">
            <h3 className="text-2xl font-semibold text-slate-900">Confirm Booking</h3>
            <p className="mt-1 text-sm text-slate-500">
              Please review your appointment details before submitting.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Patient</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{fullName}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Gender</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{gender || "—"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Contact</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{contactNumber}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Age</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{age}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Birthdate</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {birthdate ? new Date(birthdate).toLocaleDateString() : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedDate.toDateString()}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Time</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedTime}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-medium text-slate-500">Service</p>
                <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                  {serviceType}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleBookAppointment}
                disabled={isBooking}
                className={`flex-1 rounded-2xl px-4 py-3 font-semibold text-white shadow-lg transition ${
                  isBooking
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95"
                }`}
                type="button"
              >
                {isBooking ? "Booking..." : "Confirm Booking"}
              </button>

              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedDate(null);
                  setSelectedTime(null);
                }}
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
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