"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type ServiceType = "ear" | "nose" | "throat" | "aesthetics";

type SlotInfo = {
  capacity: number;
  occupied: number;
  remaining: number;
  isFull: boolean;
  reason?: string;
};

type AvailabilityKey = string;

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

type AppointmentDateTimePickerProps = {
  serviceType?: ServiceType;
  onSelect: (selection: PickerSelection) => void;
  onClose?: () => void;
  weekStart?: Date;
  className?: string;
  source?: "user" | "staff";
  allowSameDay?: boolean;
};

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

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return target < today;
}

function isToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return target.getTime() === today.getTime();
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

function formatDisplayTime(hour: number): string {
  return `${hour % 12 === 0 ? "12" : hour % 12}:00 ${hour >= 12 ? "PM" : "AM"}`;
}

function getAvailabilityKey(dateStr: string, time: string): AvailabilityKey {
  return `${dateStr}-${time}`;
}

export default function AppointmentDateTimePicker({
  serviceType: propServiceType,
  onSelect,
  onClose,
  weekStart: propWeekStart,
  className = "",
  source = "user",
  allowSameDay = false,
}: AppointmentDateTimePickerProps) {
  const [serviceType, setServiceType] = useState<ServiceType>(propServiceType || "ear");
  const [weekStart, setWeekStart] = useState<Date>(propWeekStart || startOfWeek(new Date()));
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<AvailabilityKey, SlotInfo>>({});
  const [loading, setLoading] = useState(true);
  const [gridLoading, setGridLoading] = useState(false);

  useEffect(() => {
    if (propServiceType) {
      setServiceType(propServiceType);
    }
  }, [propServiceType]);

  useEffect(() => {
    if (propWeekStart) {
      setWeekStart(propWeekStart);
    }
  }, [propWeekStart]);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const fetchBlockedDates = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/availability", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch availability");
      }

      const data = await res.json();
      setBlockedDates(Array.isArray(data?.blockedDates) ? data.blockedDates : []);
    } catch (error) {
      console.error("Availability fetch error:", error);
      setBlockedDates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeekAvailability = useCallback(async () => {
    try {
      setGridLoading(true);

      const entries = await Promise.all(
        weekDays.flatMap((day) =>
          clinicHours.map(async (hour) => {
            const dateStr = formatDate(day);
            const time = formatTime(hour);
            const key = getAvailabilityKey(dateStr, time);

            const sunday = isSunday(day);
            const past = isPast(day);
            const sameDayBlocked = !allowSameDay && isToday(day);

            if (sunday) {
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

            if (past) {
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

            if (sameDayBlocked) {
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
              const res = await fetch(
                `/api/availability?date=${dateStr}&time=${time}&source=${source}`,
                {
                  cache: "no-store",
                }
              );

              if (!res.ok) {
                return [
                  key,
                  {
                    capacity: 1,
                    occupied: 1,
                    remaining: 0,
                    isFull: true,
                    reason: "Unavailable",
                  } satisfies SlotInfo,
                ] as const;
              }

              const data = await res.json();
              const slotInfo = data?.slotInfo ?? {};

              return [
                key,
                {
                  capacity: Number(slotInfo.capacity ?? 1),
                  occupied: Number(slotInfo.occupied ?? slotInfo.booked ?? 0),
                  remaining: Number(slotInfo.remaining ?? 0),
                  isFull: Boolean(slotInfo.isFull ?? Number(slotInfo.remaining ?? 0) <= 0),
                  reason:
                    typeof slotInfo.reason === "string" && slotInfo.reason.trim()
                      ? slotInfo.reason
                      : undefined,
                } satisfies SlotInfo,
              ] as const;
            } catch {
              return [
                key,
                {
                  capacity: 1,
                  occupied: 1,
                  remaining: 0,
                  isFull: true,
                  reason: "Unavailable",
                } satisfies SlotInfo,
              ] as const;
            }
          })
        )
      );

      setAvailabilityMap(Object.fromEntries(entries));
    } catch (error) {
      console.error("Week availability fetch error:", error);
    } finally {
      setGridLoading(false);
    }
  }, [weekDays, source, allowSameDay]);

  useEffect(() => {
    fetchBlockedDates();
  }, [fetchBlockedDates]);

  useEffect(() => {
    fetchWeekAvailability();
  }, [fetchWeekAvailability]);

  const getSlotInfo = (date: Date, hour: number): SlotInfo => {
    const dateStr = formatDate(date);
    const time = formatTime(hour);
    const key = getAvailabilityKey(dateStr, time);

    return (
      availabilityMap[key] ?? {
        capacity: 1,
        occupied: 1,
        remaining: 0,
        isFull: true,
        reason: "Unavailable",
      }
    );
  };

  const getUnavailableReason = (date: Date, hour: number): string => {
    const slot = getSlotInfo(date, hour);
    const blocked = isDateBlocked(date, blockedDates);
    const past = isPast(date);
    const sunday = isSunday(date);
    const sameDayBlocked = !allowSameDay && isToday(date);

    if (blocked) return "Blocked";
    if (past) return "Past date";
    if (sunday) return "Closed";
    if (sameDayBlocked) return "Same-day booking is not allowed";
    if (slot.reason) return slot.reason;
    if (slot.remaining <= 0 || slot.isFull) return "Fully booked";

    return "Unavailable";
  };

  const isSlotAvailable = (date: Date, hour: number): boolean => {
    const slot = getSlotInfo(date, hour);
    const blocked = isDateBlocked(date, blockedDates);
    const past = isPast(date);
    const sunday = isSunday(date);
    const sameDayBlocked = !allowSameDay && isToday(date);

    return !blocked && !past && !sunday && !sameDayBlocked && slot.remaining > 0 && !slot.isFull;
  };

  const handleSlotClick = (date: Date, hour: number) => {
    if (!isSlotAvailable(date, hour)) return;

    onSelect({
      date: formatDate(date),
      time: formatTime(hour),
      serviceType,
    });
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
            aria-label="Previous"
            type="button"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={nextWeek}
            className="rounded-lg p-2 hover:bg-gray-200"
            aria-label="Next"
            type="button"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {propServiceType ? (
          <span className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            {propServiceType.charAt(0).toUpperCase() + propServiceType.slice(1)}
          </span>
        ) : (
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
            className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
          >
            <option value="ear">Ear</option>
            <option value="nose">Nose</option>
            <option value="throat">Throat</option>
            <option value="aesthetics">Aesthetics</option>
          </select>
        )}
      </div>

      <div className="grid min-w-full grid-cols-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-r border-gray-200 bg-gray-50">
          <div className="flex h-12 items-center justify-center border-b border-gray-200 text-xs font-semibold text-gray-500">
            Time
          </div>

          {clinicHours.map((hour) => (
            <div
              key={hour}
              className="flex h-16 items-center justify-end border-b border-gray-100 pr-2 font-mono text-xs text-gray-500"
            >
              {formatDisplayTime(hour)}
            </div>
          ))}
        </div>

        {weekDays.map((day) => {
          const blocked = isDateBlocked(day, blockedDates);
          const sunday = isSunday(day);
          const past = isPast(day);
          const sameDayBlocked = !allowSameDay && isToday(day);

          const fullyBooked =
            !blocked &&
            !sunday &&
            !past &&
            !sameDayBlocked &&
            clinicHours.every((hour) => !isSlotAvailable(day, hour));

          const unavailable = sunday || past || blocked || sameDayBlocked || fullyBooked;

          return (
            <div
              key={day.toISOString()}
              className={`border-r border-gray-200 last:border-r-0 ${
                unavailable
                  ? sameDayBlocked
                    ? "bg-amber-50/50"
                    : "bg-red-50/50"
                  : ""
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

                {sunday && (
                  <span className="rounded bg-orange-100 px-1 py-px text-[10px] text-orange-600">
                    Closed
                  </span>
                )}

                {sameDayBlocked && !blocked && !sunday && !past && (
                  <span className="rounded bg-amber-100 px-1 py-px text-[10px] text-amber-700">
                    No Same-Day
                  </span>
                )}

                {past && !blocked && !sunday && (
                  <span className="rounded bg-gray-200 px-1 py-px text-[10px] text-gray-600">
                    Past
                  </span>
                )}

                {fullyBooked && !blocked && !sunday && !sameDayBlocked && !past && (
                  <span className="rounded bg-orange-100 px-1 py-px text-[10px] text-orange-600">
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
                    className={`group relative flex h-16 w-full items-center justify-center border-b border-gray-100 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      available
                        ? "border-l-4 border-emerald-400 bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : sameDayBlocked
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-400"
                    }`}
                    title={
                      available
                        ? `Available (${slot.remaining} slots)`
                        : getUnavailableReason(day, hour)
                    }
                    type="button"
                  >
                    {formatDisplayTime(hour)}

                    {capacityText && (
                      <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-all group-hover:opacity-100">
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
          className="mt-4 w-full rounded-xl bg-gray-200 px-6 py-3 font-medium text-gray-800 transition-all hover:bg-gray-300"
          type="button"
        >
          Close
        </button>
      )}
    </div>
  );
}
