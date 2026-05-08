'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { navForRole } from '@/lib/rbac';
import Avatar from '@/components/ui/Avatar';
import RoleSwitcher from './RoleSwitcher';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const items = navForRole(role);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 z-40 hidden md:flex flex-col"
    >
      {/* Brand */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <motion.div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="min-w-0"
              >
                <h1 className="font-bold text-slate-900 dark:text-white leading-tight">AIS</h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">Academic System</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="block relative">
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-item"
                    className="absolute inset-0 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 relative flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="relative whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
        {!collapsed && <RoleSwitcher />}
        <div className={cn('flex items-center gap-2', collapsed && 'flex-col')}>
          <ThemeToggle />
          {!collapsed && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar name={user.profile.fullName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                  {user.profile.fullName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
