// app/layout.tsx
import * as React from 'react';
import type { Viewport } from 'next';

import '@/styles/global.css';

import { AuthProvider } from '@/components/auth/auth-context';
import { UserProvider } from '@/contexts/user-context';

import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <LocalizationProvider>
          <UserProvider>
            <ThemeProvider>
              {/* AuthProvider → 로그인/로그아웃 상태를 전역에서 관리 */}
              <AuthProvider>
                {children}
              </AuthProvider>
            </ThemeProvider>
          </UserProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}


