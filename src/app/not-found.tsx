import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0F172A] p-6">
      <div className="text-center">
        <p className="text-6xl font-bold text-slate-900 dark:text-white">404</p>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Page not found.</p>
        <Link
          href="/"
          className="inline-block mt-6 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
