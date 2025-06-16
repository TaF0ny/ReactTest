'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ClockCounterClockwise as ClockIcon } from '@phosphor-icons/react/dist/ssr/ClockCounterClockwise';
import type { SxProps } from '@mui/material/styles';

export interface LoginDaysProps {
  title: string;
  value: number;
  color: 'warning' | 'info';
  sx?: SxProps;
}

export function LoginDays({ title, value, color, sx }: LoginDaysProps): React.JSX.Element {
  const colorMap = {
    warning: 'var(--mui-palette-warning-main)',
    info: 'var(--mui-palette-info-main)',
  };

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2} direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography color="text.secondary" variant="overline">
              {title}
            </Typography>
            <Typography variant="h4">{value}일</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: colorMap[color], height: 56, width: 56 }}>
            <ClockIcon fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
