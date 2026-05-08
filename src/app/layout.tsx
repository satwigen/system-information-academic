import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'SIAKAD — Sistem Informasi Akademik',
  description: 'Role-based academic information system powered by Supabase.',
};

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('siakad-theme');
    var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = t === 'dark' || ((t === 'system' || !t) && m);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
