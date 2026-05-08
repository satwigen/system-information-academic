'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Refreshes the current Server Component tree every 60 seconds so that
 * time-sensitive data (like room-mapping auto-expiry) stays fresh on
 * long-open tabs. Rendered inside the (app) layout.
 *
 * Only a no-op when the tab is hidden to avoid wasted requests.
 */
export default function MinuteTick() {
  const router = useRouter();
  useEffect(() => {
    let id: number | undefined;
    const tick = () => { if (!document.hidden) router.refresh(); };
    id = window.setInterval(tick, 60_000);
    return () => {
      if (id) window.clearInterval(id);
    };
  }, [router]);
  return null;
}
