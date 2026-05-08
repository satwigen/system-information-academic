import React from 'react';
import { Monitor, Code, TrendingUp, Users, BookOpen } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Department } from '@/lib/types';

interface DepartmentCardProps {
  department: Department;
  onClick?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="w-6 h-6" />,
  Code: <Code className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
};

const colorMap: Record<string, string> = {
  'dept-it': 'bg-blue-50 text-blue-600',
  'dept-inf': 'bg-purple-50 text-purple-600',
  'dept-db': 'bg-emerald-50 text-emerald-600',
};

export default function DepartmentCard({ department, onClick }: DepartmentCardProps) {
  return (
    <Card hover onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[department.id] || 'bg-slate-50 text-slate-600'}`}>
          {iconMap[department.icon] || <BookOpen className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{department.name}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{department.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span>{department.studentCount} students</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{department.classCount} classes</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
