// 이매일코드(예약 기능을 넣으면 오류나서 제외함)
'use client';

import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress } from '@mui/material';

const ReservationForm: React.FC = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    setStatus('메일 전송 중...');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/send-email', {
        method: 'post',
      });
      const result = await response.json();
      setStatus(result.message || '메일이 성공적으로 발송되었습니다!');
    } catch (err) {
      console.error(err);
      setStatus('메일 전송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      padding: '30px',
      width: 380,
      margin: 'auto',
      border: '1px solid #ccc',
      borderRadius: '16px',
      backgroundColor: '#f5f5f5',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      textAlign: 'center',
      marginTop: '50px',
      fontFamily: `'Poppins', sans-serif`,
    }}>
      <Typography variant="h4" sx={{
        color: '#1976d2',
        marginBottom: '20px',
        fontWeight: '600',
        letterSpacing: '1px',
      }}>
        ✉️ 메일 보내기
      </Typography>

      {/* 바로 보내기 버튼 */}
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        onClick={handleSendEmail}
        disabled={loading}
        sx={{
          backgroundColor: '#42a5f5',
          padding: '12px',
          fontWeight: 'bold',
          borderRadius: '30px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            backgroundColor: '#1e88e5',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : '바로 메일 보내기'}
      </Button>

      {/* 상태 메시지 */}
      <Typography variant="body1" sx={{
        color: '#888',
        marginTop: '20px',
        fontSize: '16px',
        fontFamily: `'Poppins', sans-serif`,
      }}>
        {status}
      </Typography>
    </Box>
  );
};

export default ReservationForm;


/*'use client';

import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress } from '@mui/material';

const ReservationForm: React.FC = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    setStatus('메일 전송 중...');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/send-email', {
        method: 'post',
      });
      const result = await response.json();
      setStatus(result.message || '메일이 성공적으로 발송되었습니다!');
    } catch (err) {
      console.error(err);
      setStatus('메일 전송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      padding: '30px',
      width: 380,
      margin: 'auto',
      border: '1px solid #ccc',
      borderRadius: '16px',
      backgroundColor: '#f5f5f5',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      textAlign: 'center',
      marginTop: '50px',
      fontFamily: `'Poppins', sans-serif`,
    }}>
      <Typography variant="h4" sx={{
        color: '#1976d2',
        marginBottom: '20px',
        fontWeight: '600',
        letterSpacing: '1px',
      }}>
        ✉️ 메일 보내기
      </Typography>*/

      {/* 바로 보내기 버튼 */}
      /*<Button
        variant="contained"
        color="secondary"
        fullWidth
        onClick={handleSendEmail}
        disabled={loading}
        sx={{
          backgroundColor: '#42a5f5',
          padding: '12px',
          fontWeight: 'bold',
          borderRadius: '30px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            backgroundColor: '#1e88e5',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : '바로 메일 보내기'}
      </Button>*/

      {/* 상태 메시지 */}
      /*<Typography variant="body1" sx={{
        color: '#888',
        marginTop: '20px',
        fontSize: '16px',
        fontFamily: `'Poppins', sans-serif`,
      }}>
        {status}
      </Typography>
    </Box>
  );
};

export default ReservationForm;*/
