'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { signInAction } from '@/actions/auth';

interface Props {
  next: string;
  errorFromQuery?: string;
}

const DEMO_ACCOUNTS = [
  { role: 'Admin',   email: 'admin@siakad.test',   password: 'Admin#123' },
  { role: 'Head',    email: 'head@siakad.test',    password: 'Head#123' },
  { role: 'Dosen',   email: 'dosen@siakad.test',   password: 'Dosen#123' },
  { role: 'Student', email: 'student@siakad.test', password: 'Student#123' },
];

export default function LoginForm({ next, errorFromQuery }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    errorFromQuery === 'profile_missing'
      ? 'Your profile is missing — contact admin.'
      : null,
  );
  const [pending, startTransition] = useTransition();

  const applyDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set('email', email);
      fd.set('password', password);
      fd.set('next', next);
      const result = await signInAction(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace(result.data.redirectTo);
      router.refresh();
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card glass className="p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            SIAKAD
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to continue
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            icon={<Mail className="w-3.5 h-3.5" />}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@siakad.test"
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            icon={<Lock className="w-3.5 h-3.5" />}
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-700/60">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 text-center">
            Demo accounts — click to fill
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => applyDemo(a.email, a.password)}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <div className="font-semibold">{a.role}</div>
                <div className="text-slate-500 dark:text-slate-400 truncate">{a.email}</div>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
