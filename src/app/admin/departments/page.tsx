'use client';

import React from 'react';
import { Building2, Users, BookOpen, Shield } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { getRoleBadgeColor } from '@/lib/utils';

export default function AdminDepartmentsPage() {
  const { role } = useAuth();
  const { departments, classes, students, subjects } = useData();

  if (role !== 'ADMIN') {
    return (
      <div>
        <Header title="Departments" description="Admin access required." />
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">Admin Access Required</h3>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Header title="Departments" description="Manage academic departments.">
        <Badge className={getRoleBadgeColor('ADMIN')}>Admin Only</Badge>
      </Header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {departments.map((dept) => {
          const deptClasses = classes.filter((c) => c.departmentId === dept.id);
          const deptStudents = students.filter((s) => s.departmentId === dept.id);
          const deptSubjects = subjects.filter((s) => s.departmentId === dept.id);
          return (
            <Card key={dept.id}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{dept.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Code: {dept.code}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{dept.description}</p>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <Stat icon={<Users className="w-3.5 h-3.5" />} label="Students" value={deptStudents.length} />
                <Stat icon={<BookOpen className="w-3.5 h-3.5" />} label="Classes" value={deptClasses.length} />
                <Stat icon={<BookOpen className="w-3.5 h-3.5" />} label="Subjects" value={deptSubjects.length} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">{icon}</div>
      <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">{label}</p>
    </div>
  );
}
