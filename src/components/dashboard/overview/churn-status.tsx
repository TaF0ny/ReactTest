'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

export interface ChurnStatusProps {
  total: number;
  churned: number;
  sx?: SxProps;
}

export function ChurnStatus({ total, churned, sx }: ChurnStatusProps): React.JSX.Element {
  const theme = useTheme();
  const retained = total - churned;

  const data = [
    { name: '유지', value: retained },
    { name: '이탈', value: churned },
  ];

  const COLORS = [theme.palette.success.main, theme.palette.error.main];

  return (
    <Card sx={sx}>
      <CardHeader title="이탈 현황" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
