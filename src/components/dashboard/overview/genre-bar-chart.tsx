'use client';

import * as React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, useTheme } from '@mui/material';
import type { SxProps } from '@mui/material/styles';

export interface GenreDistributionProps {
  data: { genre: string; count: number }[];
  sx?: SxProps;
}

export function GenreDistribution({ data, sx }: GenreDistributionProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Card sx={sx}>
      <CardHeader title="선호 장르 분포" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ top: 20, right: 20, left: 40, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="genre" />
            <Tooltip />
            <Bar dataKey="count" fill={theme.palette.primary.main} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
