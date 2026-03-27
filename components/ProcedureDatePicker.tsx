"use client"

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthGrid, isSunday, getBlockedInfo } from '../utils/useAvailability';

interface ProcedureDatePickerProps {
  value: string;
  onSelect: (date: string) => void;
  month?: Date;
  blockedDates: BlockedDate[];
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ProcedureDatePicker({ value, onSelect, month: propMonth, blockedDates }: ProcedureDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(propMonth || new Date());
  const isDateAvailable = (day: Date) => {
    const blockedInfo = getBlockedInfo(day, blockedDates as any);
    return !isSunday(day) && !blockedInfo;
  };

  const monthGrid = getMonthGrid(currentMonth.getFullYear(), currentMonth.getMonth());
  const selectedDate = value ? new Date(value) : null;

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDayClick = (day: Date) => {
    if (isDateAvailable(day)) {
      const dateStr = day.toISOString().split('T')[0];
      onSelect(dateStr);
    }
  };

  const today = new Date();
  today.setHours(0,0,0,0);

  const isSameMonth = (day: Date) => day.getMonth() === currentMonth.getMonth();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <div className="text-lg font-bold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => (
          <div key={day} className="text-xs font-bold text-gray-600 uppercase text-center py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-1 max-h-80 overflow-y-auto">
        {monthGrid.map((day) => {
          const available = isDateAvailable(day);
          const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
          const isToday = day.toDateString() === today.toDateString();
          const sameMonth = isSameMonth(day);

          let bgClass = '';
          let textClass = 'text-gray-900';
          if (!sameMonth) {
            textClass = 'text-gray-400';
          } else if (!available) {
            bgClass = isSunday(day) ? 'bg-red-100 border-red-200' : 'bg-orange-100 border-orange-200';
            textClass = isSunday(day) ? 'text-red-600' : 'text-orange-700';
          } else if (isSelected) {
            bgClass = 'bg-indigo-600 border-indigo-600 ring-4 ring-indigo-500/25';
            textClass = 'text-white font-bold';
          } else if (isToday) {
            bgClass = 'bg-emerald-100 border-emerald-200';
            textClass = 'text-emerald-800 font-bold';
          } else {
            bgClass = 'hover:bg-indigo-50 border-gray-200';
          }

          const blockedInfo = getBlockedInfo(day, blockedDates);
          const statusLabel = !available && sameMonth && blockedInfo?.reason ? blockedInfo.reason : null;

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              disabled={!available}
              className={`relative h-14 border-2 rounded-xl transition-all duration-200 flex items-center justify-center group ${bgClass} ${textClass} font-semibold shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="text-lg">{day.getDate()}</span>
              {statusLabel && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {statusLabel}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
