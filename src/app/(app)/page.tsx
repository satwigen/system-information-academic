import { Users, BookOpen, CheckCircle, Building2, DoorOpen, FileText, CheckSquare, Megaphone } from 'lucide-react';
import { requireSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StatsCard from '@/components/domain/StatsCard';
import ProgressRing from '@/components/ui/ProgressRing';
import ClientOnly from '@/components/ui/ClientOnly';
import { roleLabel, roleBadgeColor } from '@/lib/rbac';
import { formatRelative, getJakartaNow, isRoomSlotExpired, dayName, formatTime } from '@/lib/time';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { profile } = await requireSession();
  const supabase = createClient();

  // Counts (RLS filters for each role automatically)
  const [
    { count: userCount },
    { count: deptCount },
    { count: classCount },
    { count: roomCount },
    { count: materialCount },
    { count: taskCount },
    { data: announcements },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('departments').select('id', { count: 'exact', head: true }),
    supabase.from('classes').select('id', { count: 'exact', head: true }),
    supabase.from('rooms').select('id', { count: 'exact', head: true }),
    supabase.from('materials').select('id', { count: 'exact', head: true }),
    supabase.from('tasks').select('id', { count: 'exact', head: true }),
    supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
  ]);

  // Attendance stats — visible records per RLS
  const { data: myAtt } = await supabase.from('attendance_records').select('status');
  const present = myAtt?.filter((r) => r.status === 'PRESENT').length ?? 0;
  const late = myAtt?.filter((r) => r.status === 'LATE').length ?? 0;
  const total = myAtt?.length ?? 0;
  const attRate = total === 0 ? 0 : Math.round(((present + late) / total) * 100);

  // Today's schedule for DOSEN (Jakarta time)
  const { day: today } = getJakartaNow();
  const { data: todaySchedule } = await supabase
    .from('room_mappings_expanded')
    .select('*')
    .eq('day_of_week', today)
    .order('start_time');

  const visibleToday = (todaySchedule ?? []).filter(
    (m) => profile.role === 'ADMIN' || !isRoomSlotExpired(m.day_of_week, m.end_time),
  );

  // Student progress: tasks + completions
  let studentDoneCount = 0;
  let studentTaskCount = 0;
  if (profile.role === 'STUDENT') {
    const { count: tc } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('class_id', profile.class_id ?? '00000000-0000-0000-0000-000000000000');
    studentTaskCount = tc ?? 0;
    const { count: dc } = await supabase
      .from('student_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('is_done', true);
    studentDoneCount = dc ?? 0;
  }
  const studentProgress = studentTaskCount === 0 ? 0 : Math.round((studentDoneCount / studentTaskCount) * 100);

  return (
    <div>
      <Header
        title={`Welcome, ${profile.full_name.split(' ')[0]}`}
        description={`You are signed in as ${roleLabel(profile.role)}.`}
      >
        <Badge className={roleBadgeColor(profile.role)}>{roleLabel(profile.role)}</Badge>
      </Header>

      {/* Role-adaptive KPIs */}
      {profile.role === 'ADMIN' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard title="Users" value={userCount ?? 0} icon={<Users className="w-5 h-5" />} accent="indigo" />
          <StatsCard title="Departments" value={deptCount ?? 0} icon={<Building2 className="w-5 h-5" />} accent="violet" />
          <StatsCard title="Classes" value={classCount ?? 0} icon={<BookOpen className="w-5 h-5" />} accent="sky" />
          <StatsCard title="Rooms" value={roomCount ?? 0} icon={<DoorOpen className="w-5 h-5" />} accent="emerald" />
        </div>
      )}

      {profile.role === 'HEAD' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard title="Department Members" value={userCount ?? 0} icon={<Users className="w-5 h-5" />} accent="indigo" />
          <StatsCard title="Classes" value={classCount ?? 0} icon={<BookOpen className="w-5 h-5" />} accent="violet" />
          <StatsCard title="Attendance Rate" value={`${attRate}%`} icon={<CheckCircle className="w-5 h-5" />} accent="emerald" />
          <StatsCard title="Announcements" value={announcements?.length ?? 0} icon={<Megaphone className="w-5 h-5" />} accent="amber" />
        </div>
      )}

      {profile.role === 'DOSEN' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard title="Classes" value={classCount ?? 0} icon={<BookOpen className="w-5 h-5" />} accent="indigo" />
          <StatsCard title="Attendance Rate" value={`${attRate}%`} icon={<CheckCircle className="w-5 h-5" />} accent="emerald" />
          <StatsCard title="Materials" value={materialCount ?? 0} icon={<FileText className="w-5 h-5" />} accent="violet" />
          <StatsCard title="Tasks Created" value={taskCount ?? 0} icon={<CheckSquare className="w-5 h-5" />} accent="sky" />
        </div>
      )}

      {profile.role === 'STUDENT' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card glass>
            <div className="flex items-center gap-4">
              <ProgressRing value={studentProgress} size={80} stroke={8} colorClass="text-emerald-500">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{studentProgress}%</span>
              </ProgressRing>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Task Progress</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {studentDoneCount}
                  <span className="text-slate-400 font-medium">/{studentTaskCount}</span>
                </p>
                <p className="text-xs text-slate-400">Completed</p>
              </div>
            </div>
          </Card>
          <StatsCard title="Attendance" value={`${attRate}%`} icon={<CheckCircle className="w-5 h-5" />} accent="emerald" />
          <StatsCard title="Materials" value={materialCount ?? 0} icon={<FileText className="w-5 h-5" />} accent="violet" />
        </div>
      )}

      {/* Today's Schedule */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Today&apos;s Schedule — {dayName(today)}
          {profile.role !== 'ADMIN' && (
            <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
              (expired sessions auto-hidden)
            </span>
          )}
        </h2>
        {visibleToday.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {(todaySchedule?.length ?? 0) === 0
                ? 'No sessions scheduled for today.'
                : 'All of today\u2019s sessions have ended.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleToday.slice(0, 6).map((m) => (
              <Card key={m.id} hover>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.subject_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.class_name}</p>
                  </div>
                  <Badge>
                    {formatTime(m.start_time)}–{formatTime(m.end_time)}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {m.room_name} · {m.building} · Floor {m.floor}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Announcements */}
      {announcements && announcements.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Announcements</h2>
          <div className="space-y-3">
            {announcements.map((a) => (
              <Card key={a.id}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{a.title}</h3>
                      {a.pinned && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{a.body}</p>
                    <ClientOnly fallback={<p className="text-xs text-slate-400 mt-2">&nbsp;</p>}>
                      <p className="text-xs text-slate-400 mt-2">{formatRelative(a.created_at)}</p>
                    </ClientOnly>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
