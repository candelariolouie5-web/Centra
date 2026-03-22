"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/StatCard";
import dynamic from "next/dynamic";

/* -------------------- RECHARTS -------------------- */
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });

import {Cell} from "recharts"

export default function DoctorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([1,2,3,4,5,6,7,8,9,10,11,12]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);

  const [appointmentData, setAppointmentData] = useState<any[]>([]);
  const [consultationData, setConsultationData] = useState<any[]>([]);

  const [highestService, setHighestService] = useState<{name: string; percentage: number} | null>(null);
  const [lowestService, setLowestService] = useState<{name: string; percentage: number} | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "DOCTOR") {
      router.push("/doctorlogin");
      return;
    }
    setMounted(true);
  }, [session, status, router]);

  /* ---------------- FETCH DATA ---------------- */

  const fetchAppointmentData = async () => {
    const res = await fetch(`/api/doctor/dashboard/appointments?year=${year}&months=${selectedMonths.join(",")}`);
    const result = await res.json();
    if(res.ok) setAppointmentData(result.data);
  };

  const fetchTodayAppointments = useCallback(async () => {
    const res = await fetch("/api/doctor/dashboard/today-appointments");
    const result = await res.json();
    if(res.ok) setTodayAppointments(result.appointments);
  }, []);

  const fetchConsultationData = async () => {
    const res = await fetch("/api/doctor/dashboard/consultations");
    const result = await res.json();

    if(res.ok){
      setConsultationData(result.data);
      setHighestService(result.highestService);
      setLowestService(result.lowestService);
    }
  };

  useEffect(()=>{
    if(mounted){
      fetchAppointmentData();
      fetchTodayAppointments();
      fetchConsultationData();
    }
  },[mounted,selectedMonths,year, fetchTodayAppointments]);

  useEffect(()=>{
    const interval=setInterval(fetchTodayAppointments,30000);
    return()=>clearInterval(interval);
  },[fetchTodayAppointments]);

  const COLORS = ["#6366f1","#22c55e","#f59e0b","#a855f7"];

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (

  <div className="min-h-screen bg-slate-50">

  {/* HEADER */}
  <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
  <div className="px-6 py-4 flex justify-between items-center">
  
  <div>
  <h1 className="text-xl font-semibold text-gray-900">Doctor Dashboard</h1>
  <p className="text-sm text-gray-500">Monitor your appointments and services.</p>
  </div>

  <input
  type="search"
  placeholder="Search..."
  className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm w-64"
  aria-label="Search"
  />

  </div>
  </header>


  <main className="p-6">

  {/* WELCOME */}
  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow mb-6">
  <h2 className="text-lg font-semibold">Welcome Back Doctor 👋</h2>
  <p className="text-sm opacity-90">Here's what's happening with your clinic today.</p>
  </div>


  {/* STAT CARDS */}
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

  <StatCard title="Customers" value="721K" change="+11.01%" positive />
  <StatCard title="Visits" value="367K" change="-0.03%" />
  <StatCard title="New Appointment" value="1,156" change="+3.55%" positive />
  <StatCard title="Active Users" value="239K" change="+6.08%" positive />

  </div>


  {/* CHART ROW */}
  {mounted && (

  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

  {/* APPOINTMENT CHART */}

  <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm">

  <div className="px-6 py-4 border-b flex justify-between items-center">

  <h3 className="font-semibold text-gray-900">Booked Appointments</h3>

  <label className="flex items-center gap-1">
  <input
  type="number"
  value={year}
  onChange={(e)=>setYear(parseInt(e.target.value))}
  className="border rounded-lg px-3 py-1 text-sm w-20"
  aria-label="Year"
  />
  </label>

  </div>

  <div className="p-6">

  <div className="flex flex-wrap gap-2 mb-4">

  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((month,index)=>(
  <label key={index} className="text-xs flex items-center gap-1">
  <input
  type="checkbox"
  checked={selectedMonths.includes(index+1)}
  onChange={(e)=>{
  if(e.target.checked){
  setSelectedMonths([...selectedMonths,index+1]);
  }else{
  setSelectedMonths(selectedMonths.filter(m=>m!==index+1));
  }
  }}
  />
  {month}
  </label>
  ))}

  </div>

  <ResponsiveContainer width="100%" height={300}>
  <BarChart data={appointmentData}>
  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
  <XAxis dataKey="month" stroke="#94a3b8"/>
  <YAxis stroke="#94a3b8"/>
  <Tooltip/>
  <Bar dataKey="count" fill="#6366f1" radius={[6,6,0,0]}/>
  </BarChart>
  </ResponsiveContainer>

  </div>

  </div>


  {/* CONSULTATION PIE */}

  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

  <div className="px-6 py-4 border-b">
  <h3 className="font-semibold text-gray-900">Consultations In Progress</h3>
  </div>

  <div className="p-6">

  <ResponsiveContainer width="100%" height={250}>
  <PieChart>

  <Pie
  data={consultationData}
  dataKey="value"
  cx="50%"
  cy="50%"
  innerRadius={60}
  outerRadius={90}
  >

  {consultationData.map((entry,index)=>(
  <Cell key={index} fill={COLORS[index%COLORS.length]}/>
  ))}

  </Pie>

  <Legend verticalAlign="bottom"/>
  <Tooltip/>

  </PieChart>
  </ResponsiveContainer>


  <div className="mt-4 space-y-2 text-sm">

  {highestService && (
  <div className="flex justify-between">
  <span className="text-gray-500">Highest</span>
  <span className="text-green-600 font-medium">
  {highestService.name} ({highestService.percentage}%)
  </span>
  </div>
  )}

  {lowestService && (
  <div className="flex justify-between">
  <span className="text-gray-500">Lowest</span>
  <span className="text-red-600 font-medium">
  {lowestService.name} ({lowestService.percentage}%)
  </span>
  </div>
  )}

  </div>

  </div>

  </div>

  </div>
  )}



  {/* TODAY APPOINTMENTS */}

  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

  <div className="px-6 py-4 border-b flex justify-between">

  <h3 className="font-semibold text-gray-900">
  Appointments Scheduled Today
  </h3>

  <button
  onClick={fetchTodayAppointments}
  className="text-indigo-600 text-sm"
  >
  Refresh
  </button>

  </div>


  {todayAppointments.length===0?(
  <div className="p-10 text-center text-gray-400">
  No appointments scheduled today
  </div>
  ):(
  
  <div className="overflow-x-auto">

  <table className="w-full">

  <thead>
  <tr className="bg-gray-50 text-left text-sm text-gray-500">
  <th className="px-6 py-3">Patient</th>
  <th className="px-6 py-3">Time</th>
  <th className="px-6 py-3">Service</th>
  <th className="px-6 py-3">Status</th>
  </tr>
  </thead>

  <tbody>

  {todayAppointments.map((appointment:any)=>(
  <tr key={appointment.id} className="border-t">

  <td className="px-6 py-3">{appointment.fullName}</td>
  <td className="px-6 py-3">{appointment.appointmentTime}</td>
  <td className="px-6 py-3">{appointment.serviceType}</td>

  <td className="px-6 py-3">

  <span className={`px-2 py-1 text-xs rounded-full ${
  appointment.status==="CONFIRMED"
  ? "bg-green-100 text-green-700"
  : "bg-blue-100 text-blue-700"
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


  </main>

  </div>
  );
}
