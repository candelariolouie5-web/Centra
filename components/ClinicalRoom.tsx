"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Monitor,
  Sparkles,
  X,
  Check,
  Calendar,
  Clock,
} from "lucide-react";
import AppointmentDateTimePicker, {
  ServiceType as PickerServiceType,
} from "./AppointmentDateTimePicker";
import { useSession } from "next-auth/react";

type RoomType = "ENT" | "Aesthetics" | "Consultation";

interface ProcedureRoom {
  id: number;
  name: string;
  description: string;
  image: string;
  available: boolean;
  type: RoomType;
}

interface ClinicalRoomBookingData {
  patientId?: string;
  patientName: string;
  room: string;
  serviceType: string;
  serviceTypeMapped?: string;
  appointmentDate: string;
  appointmentTime: string;
  contactNumber?: string;
  age?: number;
  email?: string;
  notes?: string;
  source?: string;
}

interface ClinicalRoomProps {
  open: boolean;
  onClose: () => void;
  onSelectRoom?: (type: RoomType) => void;
  onConfirmSchedule?: (data: ClinicalRoomBookingData) => Promise<void> | void;
  onSelectSchedule?: (data: ClinicalRoomBookingData) => Promise<void> | void;
  patientName?: string;
  patientService?: string;
  patientId?: string;
  patientContactNumber?: string;
  patientAge?: number;
  patientEmail?: string;
  selectedRoom?: RoomType;
}

type ProcedureOption = {
  label: string;
  pickerServiceType: PickerServiceType;
  allowedRoomTypes: RoomType[];
};

const procedureRooms: ProcedureRoom[] = [
  {
    id: 1,
    name: "ENT Procedure Room",
    description: "For ENT procedures and examinations",
    image: "/ro.jpg",
    available: true,
    type: "ENT",
  },
  {
    id: 2,
    name: "Aesthetics Room",
    description: "For aesthetic procedures and related care",
    image: "/roo.jpg",
    available: true,
    type: "Aesthetics",
  },
  {
    id: 3,
    name: "Consultation Room",
    description: "For consultation and specialized follow-up procedures",
    image: "/room.jpg",
    available: true,
    type: "Consultation",
  },
];

const PROCEDURE_OPTIONS: ProcedureOption[] = [
  {
    label: "Ear Cleaning",
    pickerServiceType: "ear",
    allowedRoomTypes: ["ENT"],
  },
  {
    label: "Audiometry",
    pickerServiceType: "ear",
    allowedRoomTypes: ["ENT"],
  },
  {
    label: "Nasal Endoscopy",
    pickerServiceType: "nose",
    allowedRoomTypes: ["ENT", "Aesthetics"],
  },
  {
    label: "Tonsillectomy",
    pickerServiceType: "throat",
    allowedRoomTypes: ["ENT", "Consultation"],
  },
  {
    label: "Biopsy",
    pickerServiceType: "throat",
    allowedRoomTypes: ["Consultation", "ENT"],
  },
  {
    label: "Laryngoscopy",
    pickerServiceType: "throat",
    allowedRoomTypes: ["Consultation", "ENT"],
  },
  {
    label: "Aesthetic Procedure",
    pickerServiceType: "aesthetics",
    allowedRoomTypes: ["Aesthetics"],
  },
  {
    label: "Other Procedure",
    pickerServiceType: "ear",
    allowedRoomTypes: ["Consultation", "ENT"],
  },
];

function getInitialProcedure(patientService?: string) {
  const normalized = (patientService || "").trim().toLowerCase();

  if (normalized.includes("ear")) return "Ear Cleaning";
  if (normalized.includes("nose") || normalized.includes("nasal")) {
    return "Nasal Endoscopy";
  }
  if (normalized.includes("throat") || normalized.includes("laryn")) {
    return "Laryngoscopy";
  }
  if (normalized.includes("aesthetic")) {
    return "Aesthetic Procedure";
  }

  return "";
}

function formatDisplayDate(value: string) {
  if (!value) return "No date selected";

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDisplayTime(value: string) {
  if (!value) return "No time selected";

  if (/^\d{1,2}:\d{2}$/.test(value)) {
    const [hours, minutes] = value.split(":").map(Number);
    const parsed = new Date();
    parsed.setHours(hours, minutes, 0, 0);

    return parsed.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return value;
}

const ClinicalRoom: React.FC<ClinicalRoomProps> = ({
  open,
  onClose,
  onSelectRoom,
  onConfirmSchedule,
  onSelectSchedule,
  patientName,
  patientService,
  patientId,
  patientContactNumber,
  patientAge,
  patientEmail,
}) => {
  const { data: session } = useSession();
  const displayPatientName = patientName || "Patient";

  const [procedureType, setProcedureType] = useState<string>(
    getInitialProcedure(patientService)
  );

  const [selectedSchedule, setSelectedSchedule] = useState<{
    date: string;
    time: string;
    serviceType: PickerServiceType;
  } | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<ProcedureRoom | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedProcedure = useMemo(
    () => PROCEDURE_OPTIONS.find((item) => item.label === procedureType) || null,
    [procedureType]
  );

  const availableRooms = useMemo(() => {
    if (!selectedProcedure) return [];

    return procedureRooms.filter(
      (room) =>
        room.available && selectedProcedure.allowedRoomTypes.includes(room.type)
    );
  }, [selectedProcedure]);

  const autoAssignedRoom =
    availableRooms.length === 1 ? availableRooms[0] : null;

  const finalRoom = autoAssignedRoom || selectedRoom;

  useEffect(() => {
    if (!open) {
      setProcedureType(getInitialProcedure(patientService));
      setSelectedSchedule(null);
      setSelectedRoom(null);
      setLoading(false);
    }
  }, [open, patientService]);

  useEffect(() => {
    if (!selectedProcedure) {
      setSelectedSchedule(null);
      setSelectedRoom(null);
      return;
    }

    if (autoAssignedRoom) {
      setSelectedRoom(autoAssignedRoom);
      return;
    }

    if (
      selectedRoom &&
      !availableRooms.some((room) => room.id === selectedRoom.id)
    ) {
      setSelectedRoom(null);
    }
  }, [selectedProcedure, autoAssignedRoom, availableRooms, selectedRoom]);

  if (!open) return null;

  const handleProcedureChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setProcedureType(event.target.value);
    setSelectedSchedule(null);
    setSelectedRoom(null);
  };

  const handleScheduleSelect = (selection: {
    date: string;
    time: string;
    serviceType: PickerServiceType;
  }) => {
    setSelectedSchedule(selection);

    if (!autoAssignedRoom) {
      setSelectedRoom(null);
    }
  };

  const handleConfirmSchedule = async () => {
    if (
      !patientId ||
      patientId === "temp" ||
      !patientId.match(/^[a-zA-Z0-9_-]+$/)
    ) {
      alert(
        "Invalid patient ID. Please select a valid patient from the patient list."
      );
      return;
    }

    if (!selectedProcedure || !selectedSchedule || !finalRoom || !session) {
      alert("Complete all fields and login required.");
      return;
    }

    const role = String(session?.user?.role || "").toUpperCase();

    if (role !== "DOCTOR" && role !== "ADMIN") {
      alert("Unauthorized role.");
      return;
    }

    setLoading(true);

    try {
      const apiPayload = {
        patientId,
        fullName: displayPatientName,
        appointmentDate: selectedSchedule.date,
        appointmentTime: selectedSchedule.time,
        serviceType: selectedProcedure.label,
        room: finalRoom.name,
        contactNumber: patientContactNumber || "",
        age: patientAge,
        email: patientEmail || "",
        source: "staff",
      };

      const bookingApiPath =
        role === "DOCTOR" ? "/api/doctor/appointment" : "/api/admin/appointment";

      const apiRes = await fetch(bookingApiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (!apiRes.ok) {
        const err = await apiRes.json().catch(() => ({}));
        throw new Error(err.error || "Booking failed");
      }

      await apiRes.json();

      const payload: ClinicalRoomBookingData = {
        patientId,
        patientName: displayPatientName,
        room: finalRoom.name,
        serviceType: selectedProcedure.label,
        serviceTypeMapped: selectedProcedure.pickerServiceType,
        appointmentDate: selectedSchedule.date,
        appointmentTime: selectedSchedule.time,
        contactNumber: patientContactNumber || "",
        age: patientAge,
        email: patientEmail || "",
        notes: `${selectedProcedure.label} (${selectedProcedure.pickerServiceType}) in ${finalRoom.name}`,
        source: "staff",
      };

      const submitHandler = onSelectSchedule ?? onConfirmSchedule;

      if (submitHandler) {
        await submitHandler(payload);
      }

      onSelectRoom?.(finalRoom.type);
      onClose();
    } catch (error) {
      console.error("Schedule confirm error:", error);
      const msg =
        error instanceof Error ? error.message : "Failed to confirm schedule";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const canConfirm = !!selectedProcedure && !!selectedSchedule && !!finalRoom;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clinical-room-modal-title"
      >
        <div
          className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-100 p-3">
                <Monitor className="h-5 w-5 text-indigo-700" />
              </div>
              <div>
                <h3
                  id="clinical-room-modal-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  Clinical Room - {displayPatientName}
                </h3>
                <p className="text-sm text-gray-500">
                  Procedure → Date → Time → Room
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              aria-label="Close Clinical Room modal"
              type="button"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid gap-3 md:grid-cols-4">
              {[
                { step: "1", title: "Procedure", done: !!selectedProcedure },
                { step: "2", title: "Date", done: !!selectedSchedule?.date },
                { step: "3", title: "Time", done: !!selectedSchedule?.time },
                { step: "4", title: "Room", done: !!finalRoom },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`rounded-2xl border px-4 py-3 ${
                    item.done
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Step {item.step}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm text-emerald-800">
                <strong>Patient:</strong>{" "}
                <span className="font-bold text-emerald-900">
                  {displayPatientName}
                </span>
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h4 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    Select Procedure
                  </h4>

                  <label
                    htmlFor="procedure-type"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Procedure Type *
                  </label>

                  <select
                    id="procedure-type"
                    value={procedureType}
                    onChange={handleProcedureChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Select procedure</option>
                    {PROCEDURE_OPTIONS.map((option) => (
                      <option key={option.label} value={option.label}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h4 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Booking Summary
                  </h4>

                  <div className="space-y-3 text-sm">
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Procedure
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {selectedProcedure?.label || "No procedure selected"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Date
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {selectedSchedule
                          ? formatDisplayDate(selectedSchedule.date)
                          : "No date selected"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Time
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {selectedSchedule
                          ? formatDisplayTime(selectedSchedule.time)
                          : "No time selected"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Room
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {finalRoom
                          ? finalRoom.name
                          : selectedSchedule
                          ? "Choose room"
                          : "Room will show after date and time"}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedSchedule && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                    <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-blue-900">
                      <Clock className="h-5 w-5" />
                      Selected Slot
                    </h4>

                    <div className="space-y-1 text-sm text-blue-900">
                      <p>
                        <strong>Date:</strong>{" "}
                        {formatDisplayDate(selectedSchedule.date)}
                      </p>
                      <p>
                        <strong>Time:</strong>{" "}
                        {formatDisplayTime(selectedSchedule.time)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h4 className="mb-4 text-base font-bold text-slate-900">
                    Select Date and Time
                  </h4>

                  {selectedProcedure ? (
                    <div className="appointment-picker-clean">
                      <AppointmentDateTimePicker
                        serviceType={selectedProcedure.pickerServiceType}
                        onSelect={handleScheduleSelect}
                        source="staff"
                        allowSameDay={true}
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
                      Select the procedure first before choosing date and time.
                    </div>
                  )}
                </div>

                {selectedProcedure && selectedSchedule && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h4 className="mb-3 text-base font-bold text-slate-900">
                      Select Room
                    </h4>

                    {availableRooms.length === 1 && autoAssignedRoom && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                          Auto-assigned room
                        </p>
                        <p className="mt-2 text-base font-bold text-emerald-900">
                          {autoAssignedRoom.name}
                        </p>
                        <p className="mt-1 text-sm text-emerald-800">
                          {autoAssignedRoom.description}
                        </p>
                      </div>
                    )}

                    {availableRooms.length > 1 && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {availableRooms.map((room) => {
                          const isSelected = selectedRoom?.id === room.id;

                          return (
                            <button
                              key={room.id}
                              type="button"
                              onClick={() => setSelectedRoom(room)}
                              className={`overflow-hidden rounded-2xl border-2 text-left transition ${
                                isSelected
                                  ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100"
                                  : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md"
                              }`}
                            >
                              <div className="relative h-44 w-full">
                                <Image
                                  src={room.image}
                                  alt={room.name}
                                  fill
                                  quality={90}
                                  className="object-cover"
                                />
                              </div>

                              <div className="p-4">
                                <p className="text-base font-bold text-slate-900">
                                  {room.name}
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                  {room.description}
                                </p>

                                <span
                                  className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                    isSelected
                                      ? "bg-indigo-600 text-white"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {isSelected ? "Selected" : "Choose room"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
            <div className="text-sm text-slate-500">
              {!selectedProcedure && "Select procedure first"}
              {selectedProcedure && !selectedSchedule && "Select date and time next"}
              {selectedProcedure &&
                selectedSchedule &&
                !finalRoom &&
                "Select room to finish booking"}
              {canConfirm && "Ready to confirm booking"}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="rounded-xl bg-gray-200 px-6 py-2.5 font-medium text-gray-800 transition hover:bg-gray-300"
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmSchedule}
                disabled={!canConfirm || loading}
                className={`flex items-center gap-2 rounded-xl px-8 py-2.5 font-bold transition ${
                  canConfirm && !loading
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700"
                    : "cursor-not-allowed bg-gray-300 text-gray-500"
                }`}
                type="button"
              >
                <Check className="h-5 w-5" />
                {loading ? "Scheduling..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClinicalRoom;