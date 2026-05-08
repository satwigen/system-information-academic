import { requireRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Server-side safety net. Middleware already blocks non-admins from /admin/*.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('ADMIN');
  return <>{children}</>;
}
