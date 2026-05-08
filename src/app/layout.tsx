import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'AIS — Academic Information System',
  description: 'Modern role-based academic platform for attendance, materials, tasks, and more.',
};

// Inline script that runs BEFORE React hydration.
// Reads the stored theme (or system preference) and adds `dark` class to <html>
// so SSR HTML and first client render are visually consistent.
// This is the standard pattern used by next-themes.
const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('ais-theme');
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
          <AuthProvider>
            <DataProvider>
              <AppShell>{children}</AppShell>
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
