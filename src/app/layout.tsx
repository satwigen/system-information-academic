import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import { AttendanceProvider } from '@/context/AttendanceContext';

export const metadata: Metadata = {
  title: 'Academic Presence System',
  description: 'Modern student attendance management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AttendanceProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
              {children}
            </main>
          </div>
        </AttendanceProvider>
      </body>
    </html>
  );
}
