"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

export default function AppointmentClient() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    patientType: "",
    date: "",
    time: "",
    name: "",
    email: "",
    serviceType: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    if (!session) {
      setError("You must be logged in to book an appointment.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          patientType: "",
          date: "",
          time: "",
          name: "",
          email: "",
          serviceType: "",
        });
      } else {
        setError(data.error || "Failed to book appointment");
      }
    } catch {
      setError("An error occurred while booking the appointment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      {/* Background blur */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          className="relative left-1/2 -z-10 aspect-[1155/678] w-[72rem] -translate-x-1/2 rotate-30 bg-gradient-to-tr from-pink-300 to-indigo-400 opacity-30 background-blur"
        />
      </div>

      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Schedule an Appointment
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Fill out the form below to book your visit at Centra Clinic.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-16 max-w-xl sm:mt-20"
      >
        {error && (
          <p className="mb-4 text-center text-sm text-red-500">{error}</p>
        )}
        {success && (
          <p className="mb-4 text-center text-sm text-green-600">
            Appointment booked successfully!
          </p>
        )}

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-900">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              title="Full Name"
              placeholder="Enter your full name"
              className="mt-2.5 block w-full rounded-md px-3.5 py-2 outline outline-gray-300 focus:outline-2 focus:outline-indigo-600"
            />
          </div>

          {/* Email */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-900">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              title="Email"
              placeholder="Enter your email address"
              className="mt-2.5 block w-full rounded-md px-3.5 py-2 outline outline-gray-300 focus:outline-2 focus:outline-indigo-600"
            />
          </div>

          {/* Patient Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Patient Type
            </label>
            <div className="relative mt-2.5">
              <select
                name="patientType"
                value={formData.patientType}
                onChange={handleChange}
                required
                title="Select Patient Type"
                className="block w-full appearance-none rounded-md px-3.5 py-2 pr-10 outline outline-gray-300 focus:outline-2 focus:outline-indigo-600"
              >
                <option value="">Select</option>
                <option value="new">New Patient</option>
                <option value="existing">Existing Patient</option>
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Service Type
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              title="Select Service Type"
              className="mt-2.5 block w-full rounded-md px-3.5 py-2 outline outline-gray-300 focus:outline-2 focus:outline-indigo-600"
            >
              <option value="">Select</option>
              <option value="consultation">Consultation</option>
              <option value="checkup">Checkup</option>
              <option value="treatment">Treatment</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              title="Appointment Date"
              placeholder="Select a date"
              className="mt-2.5 block w-full rounded-md px-3.5 py-2 outline outline-gray-300 focus:outline-2 focus:outline-indigo-600"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              title="Appointment Time"
              placeholder="Select a time"
              className="mt-2.5 block w-full rounded-md px-3.5 py-2 outline outline-gray-300 focus:outline-2 focus:outline-indigo-600"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="mt-10">
          <button
            type="submit"
            disabled={isLoading}
            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}
