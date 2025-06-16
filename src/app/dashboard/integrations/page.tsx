'use client';

import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';

const CsvUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setStatus('');
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload_csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);

      const result = await response.json();
      console.log('✅ 서버 응답:', result);

      // ✅ 서버가 보내준 메시지 그대로 반영!
      setStatus(`✅ ${result.message}`);
    } catch (err) {
      console.error('❌ 업로드 실패:', err);
      setStatus('❌ CSV 업로드 실패. 다시 시도해주세요.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        border: '2px dashed #1976d2',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5',
        width: '300px',
        margin: 'auto',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        CSV 파일 선택 및 업로드
      </Typography>

      {/* 숨겨진 input */}
      <input
        type="file"
        id="csv-upload"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* 꾸민 버튼 */}
      <label htmlFor="csv-upload">
        <Button
          variant="outlined"
          component="span"
          sx={{
            mb: 2,
            color: '#1976d2',
            borderColor: '#1976d2',
            '&:hover': {
              borderColor: '#1565c0',
              backgroundColor: '#f1f8ff',
            },
          }}
        >
          {/* CloudUpload 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            fill="#1976d2"
            style={{ marginRight: '8px' }}
          >
            <path d="M5 16l5-5H7V4h10v7h-3L19 16l-7 7-7-7z" />
          </svg>
          {file ? file.name : '파일 선택'}
        </Button>
      </label>

      {/* 업로드 실행 버튼 */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleFileUpload}
        disabled={!file}
        sx={{
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        }}
      >
        파일 업로드
      </Button>

      {/* 서버 응답 메시지 출력 */}
      {status && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          {status}
        </Typography>
      )}
    </Box>
  );
};

export default CsvUpload;
