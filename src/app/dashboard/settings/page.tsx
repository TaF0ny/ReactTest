'use client';

import React, { useEffect, useState } from 'react';
import { Slider, Button, Typography, Box, LinearProgress } from '@mui/material';
import { useRouter } from 'next/navigation';

const ThresholdInput: React.FC = () => {
  const router = useRouter();
  const [threshold, setThreshold] = useState<number | null>(0.5); // null 허용
  const [status, setStatus] = useState<string>('');
  const [expectedChurns, setExpectedChurns] = useState<number>(0);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [churnRatio, setChurnRatio] = useState<number>(0);

  // ✅ 초기 threshold 가져오기
  useEffect(() => {
    const fetchThreshold = async () => {
      try {
        const res = await fetch("http://localhost:8000/get_threshold");
        const data = await res.json();
        setThreshold(data.threshold ?? 0.5);
      } catch (err) {
        console.error("초기 임계값 불러오기 실패:", err);
      }
    };
    fetchThreshold();
  }, []);

  // ✅ 슬라이더 변경 시 debounce 예측 (versioned=false)
  useEffect(() => {
    if (threshold === null) return;
    const debounceTimeout = setTimeout(() => {
      const fetchPrediction = async () => {
        try {
          const res = await fetch(`http://localhost:8000/predict?threshold=${threshold}&versioned=false`);
          const data = await res.json();
          const stats = data.stats || {};
          setExpectedChurns(stats.expected_churns || 0);
          setTotalCustomers(stats.total_customers || 0);
          setChurnRatio(stats.total_customers ? (stats.expected_churns / stats.total_customers) * 100 : 0);
        } catch (err) {
          console.error("실시간 예측 실패:", err);
          setExpectedChurns(0);
          setTotalCustomers(0);
          setChurnRatio(0);
        }
      };
      fetchPrediction();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [threshold]);

  // ✅ 슬라이더 핸들러
  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setThreshold(newValue as number);
    setStatus('');
  };

  // ✅ 저장 및 최종 예측 실행 (versioned=true)
  const submitThresholdAndPredict = async () => {
    if (threshold === null) return;
    setStatus('예측 실행 중...');
    try {
      const formData = new FormData();
      formData.append('threshold', threshold.toString());

      await fetch('http://localhost:8000/set_threshold', {
        method: 'POST',
        body: formData,
      });

      const predictResponse = await fetch(`http://localhost:8000/predict?versioned=true`);
      if (!predictResponse.ok) throw new Error(`예측 실패: HTTP ${predictResponse.status}`);

      setStatus("예측 완료! 결과 페이지로 이동합니다...");
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      setStatus('예측 실패');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>임계확률 설정</Typography>

      <Slider
        value={threshold ?? 0}
        onChange={handleSliderChange}
        min={0}
        max={1}
        step={0.01}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => (val as number).toFixed(2)}
      />

      <Typography sx={{ mt: 1 }}>
        현재 임계치: {(threshold ?? 0).toFixed(2)}
      </Typography>

      <Box sx={{ mt: 4, p: 2, backgroundColor: '#f8f8f8', borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom>실시간 예측 결과</Typography>
        <Typography>이탈 위험 고객 수: <strong>{expectedChurns}명</strong></Typography>
        <Typography>전체 고객 수: <strong>{totalCustomers}명</strong></Typography>
        <Typography>이탈 비율: <strong>{churnRatio.toFixed(1)}%</strong></Typography>

        <LinearProgress
          variant="determinate"
          value={churnRatio}
          sx={{ mt: 2, height: 10, borderRadius: 5 }}
        />
      </Box>

      <Button variant="contained" sx={{ mt: 4 }} onClick={submitThresholdAndPredict}>
        임계치 저장 및 예측 실행
      </Button>

      {status && <Typography sx={{ mt: 2 }}>{status}</Typography>}
    </Box>
  );
};

export default ThresholdInput;

/*'use client';
import React, { useEffect,useState } from 'react';
import { Slider, Button, Typography, Box } from '@mui/material';
import { useRouter } from 'next/navigation';


const ThresholdInput: React.FC = () => {
  const router = useRouter();
  const [threshold, setThreshold] = useState<number>(0.5);
  const [status, setStatus] = useState<string>('');
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const fetchThreshold = async () => {
      try {
        const res = await fetch("http://localhost:8000/get_threshold");
        const data = await res.json();
        if (data.threshold !== undefined) {
          setThreshold(data.threshold);
        }
      } catch (err) {
        console.error("초기 임계값 불러오기 실패:", err);
      }
    };
    fetchThreshold();
  }, []);



  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setThreshold(newValue as number);
    setStatus('');
    setResults(null);
  };

  const submitThresholdAndPredict = async () => {
    setStatus('임계값 저장 중...');
    try {
      // 1단계: threshold 저장
      const formData = new FormData();
      formData.append('threshold', threshold.toString());

      const thresholdResponse = await fetch('http://localhost:8000/set_threshold', {
        method: 'POST',
        body: formData,
      });

      if (!thresholdResponse.ok) {
        throw new Error(`임계값 저장 실패: HTTP ${thresholdResponse.status}`);
      }

      setStatus('임계값 저장됨. 예측 실행 중...');

      // 2단계: 예측 실행
      const predictResponse = await fetch('http://localhost:8000/predict');
      if (!predictResponse.ok) {
        throw new Error(`예측 실패: HTTP ${predictResponse.status}`);
      }
      setStatus("예측 완료! 결과 페이지로 이동합니다...");
      router.push('/dashboard'); // ✅ 자동 이동

    } catch (error) {
      console.error(error);
      setStatus('예측 실패');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>임계확률 설정</Typography>
      <Slider
        value={threshold}
        onChange={handleSliderChange}
        min={0}
        max={1}
        step={0.01}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => val.toFixed(2)}
      />
      <Typography sx={{ mt: 1 }}>현재 임계치: {threshold.toFixed(2)}</Typography>

      <Button variant="contained" sx={{ mt: 2 }} onClick={submitThresholdAndPredict}>
        임계치 저장 및 예측 실행
      </Button>

      {status && <Typography sx={{ mt: 2 }}>{status}</Typography>}

      {results && (
        <Box sx={{ mt: 3, maxHeight: 300, overflow: 'auto', backgroundColor: '#f5f5f5', p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>결과 요약</Typography>
          <pre style={{ fontSize: '0.85rem' }}>{JSON.stringify(results, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
};

export default ThresholdInput;*/
