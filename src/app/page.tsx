'use client';

import React from 'react';
import {
  Users,
  BookOpen,
  CheckCircle,
  Calendar,
  Building2,
  DoorOpen,
  Megaphone,
  CheckSquare,
  Activity,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import StatsCard from '@/components/domain/StatsCard';
import DepartmentCard from '@/components/domain/DepartmentCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressRing from '@/components/ui/ProgressRing';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { getAttendanceStats, getRoleBadgeColor, getRoleLabel, formatRelative } from '@/lib/utils';
import ClientOnly from '@/components/ui/ClientOnly';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const {
    departments,
    classes,
    students,
    records,
    rooms,
    roomMappings,
    tasks,
    completions,
    announcements,
    materials,
  } = useData();

  const stats = getAttendanceStats(records);
  const greeting = `Welcome, ${user.profile.fullName.split(' ')[0]}`;

  return (
    <div>
      <Header title={greeting} description={`You're viewing the platform as ${getRoleLabel(role)}.`}>
        <Badge className={getRoleBadgeColor(role)}>{getRoleLabel(role)}</Badge>
      </Header>

      {/* Role-adaptive stats */}
      {role === 'ADMIN' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard title="Users"        value={students.length + 7} icon={<Users className="w-5 h-5" />} accent="indigo" />
          <StatsCard title="Departments"  value={departments.length}  icon={<Building2 className="w-5 h-5" />} accent="violet" />
          <StatsCard title="Rooms"        value={rooms.length}        icon={<DoorOpen className="w-5 h-5" />} accent="emerald" />
          <StatsCard title="Mappings"     value={roomMappings.length} icon={<Calendar className="w-5 h-5" />} accent="sky" />
        </div>
      )}

      {role === 'HEAD' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard title="Department Students" value={students.filter(s=>s.departmentId===user.deptId).length} icon={<Users className="w-5 h-5" />} accent="indigo" />
          <StatsCard title="Classes"             value={classes.filter(c=>c.departmentId===user.deptId).length}   icon={<BookOpen className="w-5 h-5" />} accent="violet" />
          <StatsCard title="Attendance Rate"     value={`${stats.rate}%`} icon={<CheckCircle className="w-5 h-5" />} accent="emerald" trend="+2.3% this week" />
          <StatsCard title="Announcements"       value={announcements.length} icon={<Megaphone className="w-5 h-5" />} accent="amber" />
        </div>
      )}

      {role === 'DOSEN' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard title="Classes"       value={3}                          icon={<BookOpen className="w-5 h-5" />} accent="indigo" />
          <StatsCard title="Students"      value={30}                          icon={<Users className="w-5 h-5" />} accent="sky" />
          <StatsCard title="Materials"     value={materials.length}            icon={<Activity className="w-5 h-5" />} accent="violet" />
          <StatsCard title="Tasks Created" value={tasks.length}                icon={<CheckSquare className="w-5 h-5" />} accent="emerald" />
        </div>
      )}

      {role === 'STUDENT' && (
        <>
          <StudentProgressSummary userId={user.id} />
        </>
      )}

      {/* Departments (Admin, Head) */}
      {(role === 'ADMIN' || role === 'HEAD') && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {departments
              .filter((d) => role === 'ADMIN' || d.id === user.deptId)
              .map((dept) => (
                <DepartmentCard key={dept.id} department={dept} />
              ))}
          </div>
        </div>
      )}

      {/* Dosen: today's classes */}
      {role === 'DOSEN' && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Upcoming Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roomMappings.slice(0, 3).map((m) => {
              const room = rooms.find((r) => r.id === m.roomId);
              const cls = classes.find((c) => c.id === m.classId);
              return (
                <Card key={m.id} hover>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{cls?.name}</span>
                    <Badge>{m.startTime}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {room?.name} · {room?.building} · Floor {room?.floor}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Announcements */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Announcements</h2>
        <div className="space-y-3">
          {announcements.slice(0, 3).map((a) => (
            <Card key={a.id}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{a.title}</h3>
                    {a.pinned && <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">Pinned</Badge>}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{a.body}</p>
                  <ClientOnly fallback={<p className="text-xs text-slate-400 mt-2">&nbsp;</p>}>
                    <p className="text-xs text-slate-400 mt-2">{formatRelative(a.createdAt)}</p>
                  </ClientOnly>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentProgressSummary({ userId }: { userId: string }) {
  const { tasks, completions, materials, records } = useData();
  const myTasks = tasks;
  const myCompletions = completions.filter((c) => c.userId === userId && c.done);
  const rate = myTasks.length === 0 ? 0 : Math.round((myCompletions.length / myTasks.length) * 100);
  const myAttendance = records.filter((r) => r.studentId === 'std-001'); // demo mapping
  const att = getAttendanceStats(myAttendance);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
      <Card glass className="md:col-span-1">
        <div className="flex items-center gap-4">
          <ProgressRing value={rate} size={80} stroke={8} colorClass="text-emerald-500">
            <span className="text-sm font-bold text-slate-900 dark:text-white">{rate}%</span>
          </ProgressRing>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Task Progress</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {myCompletions.length}<span className="text-slate-400 font-medium">/{myTasks.length}</span>
            </p>
            <p className="text-xs text-slate-400">Completed</p>
          </div>
        </div>
      </Card>
      <StatsCard title="Attendance"  value={`${att.rate}%`}           icon={<CheckCircle className="w-5 h-5" />} accent="emerald" />
      <StatsCard title="Materials"   value={materials.length}        icon={<Activity className="w-5 h-5" />}    accent="violet" />
    </div>
  );
}
