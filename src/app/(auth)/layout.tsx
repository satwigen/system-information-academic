import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.18), transparent 40%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.14), transparent 40%)',
        }}
      />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
