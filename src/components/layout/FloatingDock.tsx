'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { navForRole } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/database';

interface FloatingDockProps {
  role: UserRole;
}

export default function FloatingDock({ role }: FloatingDockProps) {
  const pathname = usePathname();
  const all = navForRole(role);
  const primaries = all.filter((n) => n.primary).slice(0, 4);
  const profile = all.find((n) => n.href === '/profile');
  const items = profile ? [...primaries, profile] : primaries;

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.05 }}
      className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 floating-dock"
    >
      <div className="flex items-center gap-1 px-2 py-2 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/60 shadow-2xl shadow-indigo-500/10">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-14 h-12 rounded-xl group"
            >
              {isActive && (
                <motion.div
                  layoutId="active-dock-item"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 relative transition-colors',
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300',
                )}
              />
              <span
                className={cn(
                  'text-[9px] font-medium mt-0.5 relative transition-colors',
                  isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400',
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
