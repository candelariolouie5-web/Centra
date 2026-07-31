"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Announcement {
  id: string;
  title: string;
  description: string;
  bannerImage: string | null;
  status: string;
  createdAt: string;
}

interface Props {
  announcements: Announcement[];
}

export default function AnnouncementBanner({ announcements }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const closed = localStorage.getItem("announcementBannerClosed");
    if (closed === "true") setIsVisible(false);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("announcementBannerClosed", "true");
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  return (
    <div className="relative w-full bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 text-white shadow-lg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {current.bannerImage && (
            <img
              src={current.bannerImage}
              alt=""
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          )}
          <div className="truncate">
            <p className="font-semibold text-sm sm:text-base truncate">{current.title}</p>
            <p className="text-xs sm:text-sm text-teal-50 truncate">{current.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {announcements.length > 1 && (
            <>
              <button onClick={goToPrevious} className="p-1 rounded-full hover:bg-white/20 transition" aria-label="Previous">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button onClick={goToNext} className="p-1 rounded-full hover:bg-white/20 transition" aria-label="Next">
                <ChevronRightIcon className="w-5 h-5" />
              </button>
              <div className="flex gap-1 mx-1">
                {announcements.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-white w-4" : "bg-white/50"}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/20 transition" aria-label="Close">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}