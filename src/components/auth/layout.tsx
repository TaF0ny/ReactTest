'use client';

import * as React from 'react';
import Box from '@mui/material/Box';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',               // 전체 화면을 Flex 컨테이너로 사용
        alignItems: 'center',          // 수직 중앙 정렬
        justifyContent: 'center',      // 수평 중앙 정렬
        bgcolor: 'background.default', // 배경색 (테마에 따라 변경 가능)
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,               // 로그인 폼 컨테이너 최대 너비
          p: 4,                        // 내부 여백
          bgcolor: 'background.paper', // 흰색 배경 (MUI 테마의 Paper 색상)
          boxShadow: 3,                // 그림자 효과
          borderRadius: 2,             // 모서리 둥글게
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
