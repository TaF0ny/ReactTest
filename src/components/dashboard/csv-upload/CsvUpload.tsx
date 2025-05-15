import React, { useState } from 'react';
import { Button } from '@mui/material';
import axios from 'axios';

const CsvUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        setFile(selectedFile);
    };

    const handleFileUpload = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post('http://localhost:8000/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                console.log('파일 업로드 성공:', response.data);
            } catch (error) {
                console.error('파일 업로드 실패:', error);
            }
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleFileUpload} 
                disabled={!file}  // 파일이 선택되지 않으면 버튼 비활성화
            >
                파일 업로드
            </Button>
        </div>
    );
};

export default CsvUpload;
