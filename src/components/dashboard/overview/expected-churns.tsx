'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Warning as WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';

export interface ExpectedChurnsProps {
  value: number;
  sx?: SxProps;
}

export function ExpectedChurns({ value, sx }: ExpectedChurnsProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                이탈 예상 고객 수
              </Typography>
              <Typography variant="h4">{value.toLocaleString()}명</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-error-main)', height: 56, width: 56 }}>
              <WarningIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
