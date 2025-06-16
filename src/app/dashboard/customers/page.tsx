// src/app/dashboard/customers/page.tsx
'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

import { CustomersFilters } from '@/components/dashboard/customer/customers-filters';
import { CustomersTable } from '@/components/dashboard/customer/customers-table';

export interface Customer {
  name: string;
  age: number;
  last_login: string;
  watch_time: string;
  preferred_category: string;
  email: string;
  churn_probability: number;
}

export default function Page(): React.JSX.Element {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('http://localhost:8000/high-risk-customers');
        setCustomers(res.data);
      } catch (err) {
        console.error('❌ 고객 데이터 불러오기 실패:', err);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
        <Typography variant="h4">이탈 위험 고객</Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
          href="http://localhost:8000/download"
          target="_blank"
          rel="noopener noreferrer"
        >
          엑셀 다운로드
        </Button>
      </Stack>
      <CustomersFilters />
      <CustomersTable customers={customers} />
    </Stack>
  );
}

