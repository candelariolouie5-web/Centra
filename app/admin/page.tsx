'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MegaphoneIcon, DocumentTextIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    announcements: 0,
    patients: 0,
    appointments: 0,
    doctors: 0,
  });

  // Check if user is admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [session, status, router]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [announcementsRes, patientsRes, appointmentsRes, doctorsRes] = await Promise.all([
          fetch('/api/announcements'),
          fetch('/api/patients?count=true'),
          fetch('/api/appointments?count=true'),
          fetch('/api/doctors?count=true'),
        ]);

        const announcements = await announcementsRes.json();
        const patients = await patientsRes.json();
        const appointments = await appointmentsRes.json();
        const doctors = await doctorsRes.json();

        setStats({
          announcements: announcements.length || 0,
          patients: patients.count || 0,
          appointments: appointments.count || 0,
          doctors: doctors.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Manage Announcements',
      description: 'Create, edit, and manage announcements for the homepage.',
      icon: MegaphoneIcon,
      href: '/admin/announcements',
      color: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'Manage Patients',
      description: 'View and manage patient records.',
      icon: UserGroupIcon,
      href: '/admin/patients',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Manage Appointments',
      description: 'View and manage all appointments.',
      icon: CalendarIcon,
      href: '/admin/appointments',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Manage Doctors',
      description: 'View and manage doctor profiles.',
      icon: DocumentTextIcon,
      href: '/admin/doctors',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0c2222]">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {session?.user?.name || 'Admin'}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Announcements</p>
              <p className="text-2xl font-bold text-[#0c2222]">{stats.announcements}</p>
            </div>
            <div className="bg-teal-50 p-3 rounded-lg">
              <MegaphoneIcon className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Patients</p>
              <p className="text-2xl font-bold text-[#0c2222]">{stats.patients}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Appointments</p>
              <p className="text-2xl font-bold text-[#0c2222]">{stats.appointments}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Doctors</p>
              <p className="text-2xl font-bold text-[#0c2222]">{stats.doctors}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-[#0c2222] mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition group"
            >
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-[#0c2222] group-hover:text-teal-600 transition">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}