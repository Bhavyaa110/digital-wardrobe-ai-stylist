'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !isLoading && !user) router.push('/login');
  }, [hasHydrated, isLoading, user, router]);

  if (!hasHydrated) return null;
  if (!isLoading && !user) return null;
  return <>{children}</>;
}
