import React from 'react';
import Card from '@/components/ui/Card';

type Accent = 'indigo' | 'emerald' | 'violet' | 'sky' | 'amber' | 'red';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  accent?: Accent;
}

const ACCENT: Record<Accent, { bg: string; text: string }> = {
  indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-900/30',  text: 'text-indigo-600 dark:text-indigo-300' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-300' },
  violet:  { bg: 'bg-violet-50 dark:bg-violet-900/30',  text: 'text-violet-600 dark:text-violet-300' },
  sky:     { bg: 'bg-sky-50 dark:bg-sky-900/30',        text: 'text-sky-600 dark:text-sky-300' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-900/30',    text: 'text-amber-600 dark:text-amber-300' },
  red:     { bg: 'bg-red-50 dark:bg-red-900/30',        text: 'text-red-600 dark:text-red-300' },
};

export default function StatsCard({ title, value, subtitle, icon, trend, accent = 'indigo' }: StatsCardProps) {
  const a = ACCENT[accent];
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
          {trend && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.bg} ${a.text} flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
