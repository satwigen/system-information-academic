'use client';

import React from 'react';
import { Users, BookOpen, CheckCircle, Calendar } from 'lucide-react';
import Header from '@/components/layout/Header';
import StatsCard from '@/components/dashboard/StatsCard';
import DepartmentCard from '@/components/dashboard/DepartmentCard';
import { useAttendance } from '@/context/AttendanceContext';
import { getAttendanceStats } from '@/lib/utils';

export default function DashboardPage() {
  const { departments, students, classes, records } = useAttendance();

  const stats = getAttendanceStats(records);

  return (
    <div>
      <Header
        title="Dashboard"
        description="Welcome back! Here's your academic overview."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Students"
          value={students.length}
          subtitle="Across all departments"
          icon={<Users className="w-6 h-6" />}
        />
        <StatsCard
          title="Total Classes"
          value={classes.length}
          subtitle="Active this semester"
          icon={<BookOpen className="w-6 h-6" />}
        />
        <StatsCard
          title="Attendance Rate"
          value={`${stats.rate}%`}
          subtitle="Overall average"
          icon={<CheckCircle className="w-6 h-6" />}
          trend="+2.3% from last week"
        />
        <StatsCard
          title="Today's Sessions"
          value="6"
          subtitle="Scheduled classes"
          icon={<Calendar className="w-6 h-6" />}
        />
      </div>

      {/* Departments */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Departments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
          {[
            { action: 'Attendance recorded', detail: 'IT-1A - Web Development', time: '2 hours ago' },
            { action: 'Attendance recorded', detail: 'INF-1A - Algorithms & Data Structures', time: '3 hours ago' },
            { action: 'Report generated', detail: 'DB-1A - Monthly Summary', time: '5 hours ago' },
            { action: 'Attendance recorded', detail: 'IT-3A - Computer Networking', time: '1 day ago' },
            { action: 'Attendance recorded', detail: 'INF-3A - Artificial Intelligence', time: '1 day ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.detail}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
