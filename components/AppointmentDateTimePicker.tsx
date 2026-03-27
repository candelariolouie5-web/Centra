"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";

export type ServiceType = "ear" | "nose" | "throat" | "aesthetics";

type SlotInfo = {
  capacity: number;
  occupied: number;
  remaining: number;
  isFull: boolean;
};

type AvailabilityKey = string; // `${dateStr}-${time}`

export type PickerSelection = {
  date: string;
  time: string;
  serviceType: ServiceType;
};

type BlockedDate = {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  reason: string | null;
};

interface AppointmentDateTimePickerProps {
  serviceType?: ServiceType;
  onSelect: (selection: PickerSelection) => void;
  onClose?: () => void;
  weekStart?: Date;
  className?: string;
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const clinicHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

function startOfWeek(date: Date): Date {
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

function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function parseDateOnly(value: Date | string): Date {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isDateBlocked(date: Date, blockedDates: BlockedDate[]): boolean {
  const target = parseDateOnly(date).getTime();
  return blockedDates.some((bd) => {
    const start = parseDateOnly(bd.startDate).getTime();
    const end = parseDateOnly(bd.endDate).getTime();
    return target >= start && target <= end;
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

function getAvailabilityKey(dateStr: string, time: string): AvailabilityKey {
  return `${dateStr}-${time}`;
}

const AppointmentDateTimePicker: React.FC<AppointmentDateTimePickerProps> = ({
  serviceType: propServiceType,
  onSelect,
  onClose,
  weekStart: propWeekStart,
  className = "",
}) => {
  const { status } = useSession();

  const [serviceType, setServiceType] = useState<ServiceType>(propServiceType || "ear");
  const [weekStart, setWeekStart] = useState<Date>(propWeekStart || startOfWeek(new Date()));
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [staffCount, setStaffCount] = useState(1);
  const [availabilityMap, setAvailabilityMap] = useState<Record<AvailabilityKey, SlotInfo>>({});
  const [loading, setLoading] = useState(true);
  const [gridLoading, setGridLoading] = useState(false);

  const weekDays = getWeekDays(weekStart);

  const fetchBlockedDates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/availability", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch availability");
      const data = await res.json();
      setBlockedDates(Array.isArray(data.blockedDates) ? data.blockedDates : []);
    } catch (err) {
      console.error("Availability fetch error:", err);
      setBlockedDates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStaffCount = useCallback(async () => {
    try {
      const todayStr = formatDate(new Date());
      const res = await fetch(`/api/availability?date=${todayStr}&time=08:00`, {
        cache: "no-store",
      });

      if (!res.ok) {
        setStaffCount(1);
        return;
      }

      const data = await res.json();
      setStaffCount(Number(data?.slotInfo?.capacity ?? 1));
    } catch {
      setStaffCount(1);
    }
  }, []);

  const fetchWeekAvailability = useCallback(async () => {
    if (status === "loading") return;

    try {
      setGridLoading(true);

      const entries = await Promise.all(
        weekDays.flatMap((day) =>
          clinicHours.map(async (hour) => {
            const dateStr = formatDate(day);
            const time = formatTime(hour);
            const key = getAvailabilityKey(dateStr, time);

            try {
              const res = await fetch(`/api/availability?date=${dateStr}&time=${time}`, {
                cache: "no-store",
              });

              if (!res.ok) {
                const fallbackCapacity = staffCount || 1;
                return [
                  key,
                  {
                    capacity: fallbackCapacity,
                    occupied: fallbackCapacity,
                    remaining: 0,
                    isFull: true,
                  } satisfies SlotInfo,
                ] as const;
              }

              const data = await res.json();
              const slotInfo = data?.slotInfo ?? {};

              const capacity = Number(slotInfo.capacity ?? staffCount ?? 1);
              const remaining = Number(slotInfo.remaining ?? 0);
              const occupied = Number(
                slotInfo.occupied ?? Math.max(0, capacity - remaining)
              );

              return [
                key,
                {
                  capacity,
                  occupied,
                  remaining,
                  isFull: remaining <= 0,
                } satisfies SlotInfo,
              ] as const;
            } catch {
              const fallbackCapacity = staffCount || 1;
              return [
                key,
                {
                  capacity: fallbackCapacity,
                  occupied: fallbackCapacity,
                  remaining: 0,
                  isFull: true,
                } satisfies SlotInfo,
              ] as const;
            }
          })
        )
      );

      setAvailabilityMap(Object.fromEntries(entries));
    } finally {
      setGridLoading(false);
    }
  }, [weekDays, staffCount, status]);

  useEffect(() => {
    fetchBlockedDates();
    fetchStaffCount();
  }, [fetchBlockedDates, fetchStaffCount]);

  useEffect(() => {
    fetchWeekAvailability();
  }, [fetchWeekAvailability]);

  const getSlotInfo = (date: Date, hour: number): SlotInfo => {
    const dateStr = formatDate(date);
    const time = formatTime(hour);
    const key = getAvailabilityKey(dateStr, time);

    return (
      availabilityMap[key] ?? {
        capacity: staffCount || 1,
        occupied: 0,
        remaining: staffCount || 1,
        isFull: false,
      }
    );
  };

  const isSlotAvailable = (date: Date, hour: number): boolean => {
    const slot = getSlotInfo(date, hour);
    const blocked = isDateBlocked(date, blockedDates);
    const past = isPast(date);
    const sunday = isSunday(date);

    return !blocked && !past && !sunday && slot.remaining > 0;
  };

  const handleSlotClick = (date: Date, hour: number) => {
    if (!isSlotAvailable(date, hour)) return;

    const dateStr = formatDate(date);
    const timeStr = formatTime(hour);

    console.log("Picker clicked:", {
      date,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      dateStr,
    });

    onSelect({ date: dateStr, time: timeStr, serviceType });
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

  if (loading) {
    return <div className={`p-8 text-center ${className}`}>Loading slots...</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1 border border-gray-200">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:shadow-md"
          >
            Today
          </button>
          <button
            onClick={prevWeek}
            className="p-2 hover:bg-gray-200 rounded-lg"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-200 rounded-lg"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {propServiceType ? (
          <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-xl">
            {propServiceType.charAt(0).toUpperCase() + propServiceType.slice(1)}
          </span>
        ) : (
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
            className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700"
          >
            <option value="ear">Ear</option>
            <option value="nose">Nose</option>
            <option value="throat">Throat</option>
            <option value="aesthetics">Aesthetics</option>
          </select>
        )}
      </div>

      <div className="grid grid-cols-8 border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="border-r border-gray-200 bg-gray-50">
          {clinicHours.map((hour) => (
            <div
              key={hour}
              className="h-16 border-b border-gray-100 flex items-center justify-end pr-2 text-xs text-gray-500 font-mono"
            >
              {hour % 12 === 0 ? "12" : hour % 12}:00 {hour >= 12 ? "PM" : "AM"}
            </div>
          ))}
        </div>

        {weekDays.map((day) => {
          const blocked = isDateBlocked(day, blockedDates);
          const fullyBooked = clinicHours.every((hour) => !isSlotAvailable(day, hour));
          const unavailable = isSunday(day) || isPast(day) || blocked || fullyBooked;

          return (
            <div
              key={day.toISOString()}
              className={`border-r border-gray-200 ${unavailable ? "bg-red-50/50" : ""}`}
            >
              <div className="h-12 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center text-xs font-semibold text-gray-700 p-1">
                <span>
                  {days[day.getDay()]} {day.getDate()}
                </span>
                {blocked && (
                  <span className="text-red-600 text-[10px] px-1 py-px bg-red-100 rounded">
                    Blocked
                  </span>
                )}
                {isSunday(day) && (
                  <span className="text-orange-600 text-[10px] px-1 py-px bg-orange-100 rounded">
                    Closed
                  </span>
                )}
                {fullyBooked && !blocked && !isSunday(day) && (
                  <span className="text-orange-600 text-[10px] px-1 py-px bg-orange-100 rounded">
                    Full
                  </span>
                )}
              </div>

              {clinicHours.map((hour) => {
                const slot = getSlotInfo(day, hour);
                const available = isSlotAvailable(day, hour);
                const capacityText =
                  slot.capacity > 0 ? `${slot.occupied}/${slot.capacity}` : "";

                return (
                  <button
                    key={hour}
                    onClick={() => handleSlotClick(day, hour)}
                    disabled={!available || gridLoading}
                    className={`h-16 w-full border-b border-gray-100 flex items-center justify-center text-xs font-semibold relative group transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50 ${
                      available
                        ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-l-4 border-emerald-400"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    title={
                      !available
                        ? "Unavailable"
                        : `Available (${slot.remaining} slots)`
                    }
                  >
                    {hour}:00
                    {capacityText && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 shadow-lg">
                        {capacityText}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-all mt-4"
        >
          Close
        </button>
      )}
    </div>
  );
};

export default AppointmentDateTimePicker;