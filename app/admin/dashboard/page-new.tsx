"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";

import dynamic from "next/dynamic"; 

// Dynamically import Recharts components so they render only on client
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [appointmentData, setAppointmentData] = useState([
    { month: "Jan 2024", count: 10 },
    { month: "Feb 2024", count: 15 },
    { month: "Mar 2024", count: 8 },
    { month: "Apr 2024", count: 20 },
    { month: "May 2024", count: 12 },
    { month: "Jun 2024", count: 18 },
    { month: "Jul 2024", count: 25 },
    { month: "Aug 2024", count: 22 },
    { month: "Sep 2024", count: 16 },
    { month: "Oct 2024", count: 30 },
    { month: "Nov 2024", count: 28 },
    { month: "Dec 2024", count: 35 },
  ]);

  const [consultationData, setConsultationData] = useState([
    { name: "Ear", value: 38.6 },
    { name: "Nose", value: 22.5 },
    { name: "Throat", value: 30.8 },
    { name: "Aesthetics", value: 8.1 },
  ]);
  const [highestService, setHighestService] = useState<{ name: string; percentage: number } | null>(null);
  const [lowestService, setLowestService] = useState<{ name: string; percentage: number } | null>(null);

  // Ensure charts only render after client mounts
  useEffect(() => setMounted(true), []);

  const fetchAppointmentData = async () => {
    try {
      const response = await fetch(`/api/admin/dashboard/appointments?year=${year}&months=${selectedMonths.join(',')}`);
      const result = await response.json();
      if (response.ok) {
        setAppointmentData(result.data);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Error fetching appointment data:', error);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/today-appointments');
      const result = await response.json();
      if (response.ok) {
        setTodayAppointments(result.appointments);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Error fetching today appointments:', error);
    }
  };

  const fetchConsultationData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/consultations');
      const result = await response.json();
      if (response.ok) {
        setConsultationData(result.data);
        setHighestService(result.highestService);
        setLowestService(result.lowestService);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Error fetching consultation data:', error);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchAppointmentData();
      fetchTodayAppointments();
      fetchConsultationData();
    }
  }, [mounted, selectedMonths, year]);

  // Auto-refresh today's appointments every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTodayAppointments();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const totalUsersData = [
    { month: "Jan", users: 400 },
    { month: "Feb", users: 600 },
    { month: "Mar", users: 800 },
    { month: "Apr", users: 1200 },
    { month: "May", users: 1500 },
    { month: "Jun", users: 1800 },
    { month: "Jul", users: 2000 },
    { month: "Aug", users: 2200 },
    { month: "Sep", users: 2400 },
    { month: "Oct", users: 2600 },
    { month: "Nov", users: 2800 },
    { month: "Dec", users: 3000 },
  ];

  const prescriptionsData = [
    { month: "Jan", count: 120 },
    { month: "Feb", count: 180 },
    { month: "Mar", count: 150 },
    { month: "Apr", count: 210 },
    { month: "May", count: 260 },
    { month: "Jun", count: 300 },
  ];

  const consultationsBreakdown = [
    { name: "Online", value: 65 },
    { name: "In-Clinic", value: 25 },
    { name: "Follow-up", value: 10 },
  ];

  const COLORS = ["#6c63ff", "#4fd1c5", "#a78bfa", "#f6ad55"];

  return (
    <section className="flex flex-col bg-gray-50  text-black min-h-screen">
      <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            className="bg-white px-5 py-3 rounded-lg  border border-gray-200 text-sm outline-none w-full sm:w-64"
          />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard title="Customers" value="721K" change="+11.01%" positive />
          <StatCard title="Visits" value="367K" change="-0.03%" />
          <StatCard title="New Appointment" value="1,156" change="+3.55%" positive />
          <StatCard title="Active Users" value="239K" change="+6.08%" positive />
        </div>

        {/* Charts Row */}
        {mounted && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Appointments Bar Chart */}
            <div className="xl:col-span-2 bg-white rounded-xl p-6 xl:p-8 h-80 sm:h-96">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="font-medium">Booked Appointments</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Year:</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                      className="bg-white px-3 py-1 rounded text-sm outline-none w-20"
                      min="2020"
                      max="2030"
                      aria-label="Year"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => (
                      <label key={index} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedMonths.includes(index + 1)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMonths([...selectedMonths, index + 1]);
                            } else {
                              setSelectedMonths(selectedMonths.filter(m => m !== index + 1));
                            }
                          }}
                          className="accent-[#6c63ff]"
                        />
                        {month}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={appointmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c2f36" />
                  <XAxis dataKey="month" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6c63ff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-xl p-6 xl:p-8 h-80 sm:h-96">
              <h2 className="font-medium mb-4">Consultations In Progress</h2>
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={consultationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {consultationData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Display Highest and Lowest Service */}
              <div className="mt-4 space-y-2">
                {highestService && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Highest:</span>
                    <span className="font-medium text-green-600">{highestService.name} ({highestService.percentage}%)</span>
                  </div>
                )}
                {lowestService && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Lowest:</span>
                    <span className="font-medium text-red-600">{lowestService.name} ({lowestService.percentage}%)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Charts */}
        {mounted && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Appointments Scheduled Today */}
            <div className="bg-white rounded-xl p-6 xl:p-8 h-80 sm:h-96 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">Appointments Scheduled Today</h2>
                <button
                  onClick={fetchTodayAppointments}
                  className="text-sm text-[#6c63ff] hover:text-[#5a52e0] flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              {todayAppointments.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400 text-lg">No appointments scheduled today</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white ">
                      <tr className="text-left text-sm text-gray-400 border-b border-[#2c2f36]">
                        <th className="pb-3 font-medium">Patient Name</th>
                        <th className="pb-3 font-medium">Time</th>
                        <th className="pb-3 font-medium">Service</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAppointments.map((appointment: any) => (
                        <tr key={appointment.id} className="border-b border-[#2c2f36] hover:bg-[#2c2f36] transition-colors">
                          <td className="py-3 text-sm">{appointment.fullName}</td>
                          <td className="py-3 text-sm text-gray-300">{appointment.appointmentTime}</td>
                          <td className="py-3 text-sm text-gray-300">{appointment.serviceType}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'CONFIRMED' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Donut Chart */}
            <div className="bg-white rounded-xl p-6 xl:p-8 h-80 sm:h-96">
              <h2 className="font-medium mb-4">Consultations</h2>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={consultationsBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {consultationsBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}  

      </div>
    </section>
  );
}
