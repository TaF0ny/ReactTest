// ✅ src/components/dashboard/overview/login-days-bar-chart.tsx
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SxProps } from '@mui/material/styles';

export interface LoginDaysBarChartProps {
  churned: number;
  retained: number;
  sx?: SxProps;
}

export function LoginDaysBarChart({ churned, retained, sx }: LoginDaysBarChartProps): React.JSX.Element {
  const theme = useTheme();
  const data = [
    { group: '이탈 고객', days: churned },
    { group: '유지 고객', days: retained },
  ];

  return (
    <Card sx={sx}>
      <CardHeader title="고객 평균 로그인 경과일" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="group" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="days" fill={theme.palette.primary.main} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
