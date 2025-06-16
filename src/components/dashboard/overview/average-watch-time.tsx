'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import type { SxProps } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export interface AverageWatchTimeProps {
  churned: number;
  retained: number;
  sx?: SxProps;
}

export function AverageWatchTime({ churned, retained, sx }: AverageWatchTimeProps): React.JSX.Element {
  const theme = useTheme();

  const data = [
    { group: '이탈 고객', value: churned },
    { group: '유지 고객', value: retained },
  ];

  return (
    <Card sx={sx}>
      <CardHeader title="평균 시청 시간 (분)" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="group" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill={theme.palette.primary.main} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
