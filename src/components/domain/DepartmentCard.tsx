import React from 'react';
import { Monitor, Code, TrendingUp, Users, BookOpen } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Department } from '@/lib/types';

interface DepartmentCardProps {
  department: Department;
  onClick?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
};

const gradient: Record<string, string> = {
  'dept-it': 'from-indigo-500 to-blue-500',
  'dept-inf': 'from-violet-500 to-fuchsia-500',
  'dept-db': 'from-emerald-500 to-teal-500',
};

export default function DepartmentCard({ department, onClick }: DepartmentCardProps) {
  return (
    <Card hover onClick={onClick}>
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
            gradient[department.id] ?? 'from-slate-400 to-slate-600'
          } flex items-center justify-center text-white shadow-lg`}
        >
          {iconMap[department.icon] ?? <BookOpen className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white">{department.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{department.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Users className="w-3.5 h-3.5" />
              <span>{department.studentCount} students</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{department.classCount} classes</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
