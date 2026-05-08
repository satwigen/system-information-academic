'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, Profile } from '@/lib/types';
import { users, DEMO_USER_BY_ROLE } from '@/lib/data/users';

interface AuthContextType {
  user: User;
  role: Role;
  allUsers: User[];
  switchRole: (role: Role) => void;
  updateProfile: (patch: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_ROLE = 'ais-role';

// Default to STUDENT for initial SSR render (consistent on server & client).
const DEFAULT_ROLE: Role = 'STUDENT';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);
  const [userMap, setUserMap] = useState<Record<Role, User>>(() => ({
    ADMIN: DEMO_USER_BY_ROLE.ADMIN,
    HEAD: DEMO_USER_BY_ROLE.HEAD,
    DOSEN: DEMO_USER_BY_ROLE.DOSEN,
    STUDENT: DEMO_USER_BY_ROLE.STUDENT,
  }));

  // Restore saved role after mount (SSR-safe).
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_ROLE) as Role | null;
    if (stored && ['ADMIN', 'HEAD', 'DOSEN', 'STUDENT'].includes(stored)) {
      setRole(stored);
    }
  }, []);

  const switchRole = useCallback((next: Role) => {
    setRole(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_ROLE, next);
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setUserMap((prev) => {
      const current = prev[role];
      const updated: User = {
        ...current,
        profile: { ...current.profile, ...patch },
      };
      return { ...prev, [role]: updated };
    });
  }, [role]);

  return (
    <AuthContext.Provider
      value={{
        user: userMap[role],
        role,
        allUsers: users,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
