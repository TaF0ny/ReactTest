'use client';
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

export default ThresholdInput;