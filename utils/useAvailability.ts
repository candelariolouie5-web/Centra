"use client"

import { useState, useEffect, useCallback } from 'react';

export interface BlockedDate {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  reason: string | null;
}

export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

function normalizeDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isDateWithinRange(target: Date, start: Date, end: Date): boolean {
  const t = normalizeDateOnly(target).getTime();
  const s = normalizeDateOnly(start).getTime();
  const e = normalizeDateOnly(end).getTime();
  return t >= s && t <= e;
}

export function getBlockedInfo(date: Date, blockedDates: BlockedDate[]) {
  return blockedDates.find((blocked) =>
    isDateWithinRange(
      date,
      new Date(blocked.startDate),
      new Date(blocked.endDate)
    )
  );
}

export function getMonthGrid(year: number, month: number): Date[] {
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

export function useBlockedDates() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlockedDates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/availability", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBlockedDates(data.blockedDates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockedDates();
  }, [fetchBlockedDates]);

  const isDateAvailable = useCallback((date: Date) => {
    const blockedInfo = getBlockedInfo(date, blockedDates);
    return !isSunday(date) && !blockedInfo;
  }, [blockedDates]);

  return { blockedDates, isDateAvailable, loading, refetch: fetchBlockedDates };
}

export function useSlotAvailable(dateStr: string, time: string | null) {
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [capacity, setCapacity] = useState({capacity: 0, remaining: 0});

  useEffect(() => {
    if (!dateStr || !time) {
      setAvailable(true);
      return;
    }

    const checkSlot = async () => {
      setLoading(true);
      try {
        const url = `/api/availability?date=${dateStr}&time=${time}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setAvailable(data.slotInfo.remaining > 0);
        setCapacity(data.slotInfo);
      } catch (err) {
        console.error('Slot availability error:', err);
        setAvailable(true); // Optimistic
      } finally {
        setLoading(false);
      }
    };

    checkSlot();
  }, [dateStr, time]);

  return { available, loading, capacity };
}

