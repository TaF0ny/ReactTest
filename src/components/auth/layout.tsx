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


// import * as React from 'react';
// import RouterLink from 'next/link';
// import Box from '@mui/material/Box';
// import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';

// import { paths } from '@/paths';
// import { DynamicLogo } from '@/components/core/logo';

// export interface LayoutProps {
//   children: React.ReactNode;
// }

// export function Layout({ children }: LayoutProps): React.JSX.Element {
//   return (
//     <Box
//       sx={{
//         display: { xs: 'flex', lg: 'grid' },
//         flexDirection: 'column',
//         gridTemplateColumns: '1fr 1fr',
//         minHeight: '100%',
//       }}
//     >
//       <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
//         <Box sx={{ p: 3 }}>
//           <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-block', fontSize: 0 }}>
//             <DynamicLogo colorDark="light" colorLight="dark" height={32} width={122} />
//           </Box>
//         </Box>
//         <Box sx={{ alignItems: 'center', display: 'flex', flex: '1 1 auto', justifyContent: 'center', p: 3 }}>
//           <Box sx={{ maxWidth: '450px', width: '100%' }}>{children}</Box>
//         </Box>
//       </Box>
//       <Box
//         sx={{
//           alignItems: 'center',
//           background: 'radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)',
//           color: 'var(--mui-palette-common-white)',
//           display: { xs: 'none', lg: 'flex' },
//           justifyContent: 'center',
//           p: 3,
//         }}
//       >
//         <Stack spacing={3}>
//           <Stack spacing={1}>
//             <Typography color="inherit" sx={{ fontSize: '24px', lineHeight: '32px', textAlign: 'center' }} variant="h1">
//               Welcome to{' '}
//               <Box component="span" sx={{ color: '#15b79e' }}>
//                 Devias Kit
//               </Box>
//             </Typography>
//             <Typography align="center" variant="subtitle1">
//               A professional template that comes with ready-to-use MUI components.
//             </Typography>
//           </Stack>
//           <Box sx={{ display: 'flex', justifyContent: 'center' }}>
//             <Box
//               component="img"
//               alt="Widgets"
//               src="/assets/auth-widgets.png"
//               sx={{ height: 'auto', width: '100%', maxWidth: '600px' }}
//             />
//           </Box>
//         </Stack>
//       </Box>
//     </Box>
//   );
// }
