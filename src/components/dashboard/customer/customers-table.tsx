// src/components/dashboard/customer/customers-table.tsx
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import Button from '@mui/material/Button';


export interface Customer {
  name: string;
  email: string;
  age: number;
  last_login: string;
  watch_time: string;
  preferred_category: string;
  churn_probability: number;
}

export interface CustomersTableProps {
  customers: Customer[];
}

export function CustomersTable({ customers }: CustomersTableProps): React.JSX.Element {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          이탈 위험 고객 Top 10
        </Typography>
        <Table>
        <TableHead>
          <TableRow>
            <TableCell>순번</TableCell>
            <TableCell>이름</TableCell>
            <TableCell>나이</TableCell>
            <TableCell>마지막 로그인</TableCell>
            <TableCell>시청 시간</TableCell>
            <TableCell>선호 장르</TableCell>
            <TableCell>이메일</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell> {/* 순번 */}
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.age}</TableCell>
              <TableCell>{customer.last_login}</TableCell>
              <TableCell>{customer.watch_time}</TableCell>
              <TableCell>{customer.preferred_category}</TableCell>
              <TableCell>{customer.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

<Button
  variant="contained"
  color="primary"
  onClick={() => window.open('http://localhost:8000/download', '_blank')}
>
  Download
</Button>
