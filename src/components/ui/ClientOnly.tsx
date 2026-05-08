'use client';

import React, { useEffect, useState } from 'react';

/**
 * Renders children only after the component has mounted on the client.
 * Use this for UI whose output inherently depends on browser state
 * (timestamps, random ids, window size) that cannot be computed on the server.
 */
export default function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? children : fallback}</>;
}
