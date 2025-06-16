//src/app/dashboard/history/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from '@mui/material';

// ✅ 1) 정확한 타입 선언
interface ResultLog {
  csv_file: string;
  timestamp: string;
  threshold: number;
  total_customers: number;
  expected_churns: number;
  churn_rate: number;
  result_file: string;
}

export default function HistoryPage() {
  // ✅ 2) 타입 지정!
  const [results, setResults] = useState<ResultLog[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('http://localhost:8000/list_results');
        const data = await res.json();
        console.log('[✅ Debug] fetched data:', data); // 👈 꼭 확인!
        setResults(data);
      } catch (err) {
        console.error('Error fetching results:', err);
      }
    };
    fetchResults();
  }, []);

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" mb={3} display="flex" alignItems="center">
        📊 과거 예측 기록
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>CSV 파일</TableCell>
            <TableCell>날짜</TableCell>
            <TableCell>임계치</TableCell>
            <TableCell>전체 고객 수</TableCell>
            <TableCell>이탈 고객 수</TableCell>
            <TableCell>이탈 비율</TableCell>
            <TableCell>결과 다운로드</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.length > 0 ? (
            results.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.csv_file}</TableCell>
                <TableCell>{row.timestamp}</TableCell>
                <TableCell>{row.threshold}</TableCell>
                <TableCell>{row.total_customers}</TableCell>
                <TableCell>{row.expected_churns}</TableCell>
                <TableCell>{row.churn_rate}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    href={`http://localhost:8000/download_result?filename=${row.result_file}`}
                    target="_blank"
                  >
                    다운로드
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                아직 기록이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
