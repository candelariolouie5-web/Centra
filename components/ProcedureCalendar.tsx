"use client";

import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useBlockedDates,
  getMonthGrid,
  isSunday,
  getBlockedInfo,
} from "../utils/useAvailability";

interface ProcedureCalendarProps {
  value?: string;
  onSelect: (date: string) => void;
  className?: string;
}

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

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value?: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function stripTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function ProcedureCalendar({
  value,
  onSelect,
  className = "w-full",
}: ProcedureCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const parsed = parseLocalDate(value);
    return parsed ?? new Date();
  });

  const { blockedDates } = useBlockedDates();

  const monthGrid = getMonthGrid(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  const selectedDate = parseLocalDate(value);
  const today = stripTime(new Date());

  const isSameMonth = useCallback(
    (day: Date) => day.getMonth() === currentMonth.getMonth(),
    [currentMonth]
  );

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const isDateAvailable = useCallback(
    (day: Date) => {
      const normalizedDay = stripTime(day);
      const blockedInfo = getBlockedInfo(normalizedDay, blockedDates);

      return (
        isSameMonth(normalizedDay) &&
        normalizedDay >= today &&
        !isSunday(normalizedDay) &&
        !blockedInfo
      );
    },
    [blockedDates, isSameMonth, today]
  );

  const handleDayClick = (day: Date) => {
    if (!isDateAvailable(day)) return;
    onSelect(formatLocalDate(day));
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm ${className}`}
    >
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={goToToday}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700"
          aria-label="Go to today"
          type="button"
        >
          Today
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="rounded-xl p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
            aria-label="Previous month"
            type="button"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-xl font-bold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>

          <button
            onClick={nextMonth}
            className="rounded-xl p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
            aria-label="Next month"
            type="button"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-7 gap-1">
        {days.map((day) => (
          <div
            key={day}
            className="rounded-lg bg-gray-50 py-3 text-center text-xs font-bold uppercase text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid max-h-[450px] grid-cols-7 gap-1 overflow-y-auto pb-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
        {monthGrid.map((day) => {
          const sameMonth = isSameMonth(day);
          const available = isDateAvailable(day);
          const blockedInfo = getBlockedInfo(day, blockedDates);
          const isSelected =
            selectedDate &&
            stripTime(day).getTime() === stripTime(selectedDate).getTime();
          const isTodayDate = stripTime(day).getTime() === today.getTime();

          let bgClass = "";
          let textClass = "text-gray-900 font-semibold";
          let ringClass = "";

          if (!sameMonth) {
            bgClass = "bg-gray-50";
            textClass = "text-gray-400";
          } else if (!available) {
            if (stripTime(day) < today) {
              bgClass = "bg-gray-100 border-gray-200";
              textClass = "text-gray-400";
            } else if (isSunday(day)) {
              bgClass = "bg-gradient-to-br from-red-50 to-rose-50 border-red-200";
              textClass = "text-red-700";
            } else {
              bgClass =
                "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200";
              textClass = "text-orange-800";
            }
          } else if (isSelected) {
            bgClass = "border-emerald-600 bg-emerald-600";
            textClass = "text-white font-bold";
            ringClass = "ring-4 ring-emerald-400/30 shadow-emerald-500/25";
          } else if (isTodayDate) {
            bgClass = "border-emerald-300 bg-emerald-100";
            textClass = "text-emerald-800 font-bold";
            ringClass = "ring-2 ring-emerald-300";
          } else {
            bgClass = "border-emerald-200 hover:bg-emerald-50 active:bg-emerald-100";
          }

          const badgeLabel = !sameMonth
            ? ""
            : stripTime(day) < today
            ? "Past"
            : isSunday(day)
            ? "Closed"
            : blockedInfo?.reason || "Blocked";

          return (
            <button
              key={formatLocalDate(day)}
              onClick={() => handleDayClick(day)}
              disabled={!available}
              type="button"
              title={!available && sameMonth ? badgeLabel : ""}
              className={`group relative flex h-20 items-center justify-center rounded-xl border-2 shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60 ${bgClass} ${textClass} ${ringClass}`}
            >
              <span className="relative z-10 text-lg">{day.getDate()}</span>

              {sameMonth && !available && (
                <div className="absolute -right-2 -top-2 rounded-full border bg-white px-2 py-1 text-xs font-bold shadow-lg">
                  {badgeLabel}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-6 text-xs md:grid-cols-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-lg border border-emerald-300 bg-emerald-100" />
          <span className="font-medium text-gray-700">Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-lg border border-red-200 bg-red-100" />
          <span className="font-medium text-gray-700">Closed</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-lg border border-orange-200 bg-orange-100" />
          <span className="font-medium text-gray-700">Blocked</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-lg border border-gray-200 bg-gray-100" />
          <span className="font-medium text-gray-700">Past</span>
        </div>
      </div>
    </div>
  );
}