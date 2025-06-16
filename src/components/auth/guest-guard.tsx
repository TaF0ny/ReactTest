'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from './auth-context';

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // isAuthenticated가 true일 때에만 /dashboard로 리다이렉트
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  // 로그인되지 않은 상황(isAuthenticated === false)이면 children(로그인 폼)을 보여준다.
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  // 로그인이 되어 있으면 리다이렉트가 발생하므로 이 시점에 null을 반환해도 무방
  return null;
}
