import React, { useState } from 'react';
import { Slider, Button, Typography } from '@mui/material'; // MUI 사용
import axios from 'axios';

const ThresholdInput: React.FC = () => {
    const [threshold, setThreshold] = useState<number>(0.5);  // 임계치 상태

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        setThreshold(newValue as number);  // 슬라이더 값 변경 시 상태 업데이트
    };

    const submitThreshold = async () => {
        try {
            const response = await axios.post('http://localhost:8000/predict', null, {
                params: { threshold },
            });
            console.log('서버 응답:', response.data);
        } catch (error) {
            console.error('Error submitting threshold:', error);
        }
    };

    return (
        <div>
            <Typography variant="h6">임계치 설정</Typography>
            <Slider
                value={threshold}
                onChange={handleSliderChange}
                min={0}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value.toFixed(2)}`}  // 소수점 두 자리로 표시
            />
            <Typography>현재 임계치: {threshold}</Typography>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={submitThreshold}  // 버튼 클릭 시 임계치 제출
            >
                임계치 제출
            </Button>
        </div>
    );
};

export default ThresholdInput;
