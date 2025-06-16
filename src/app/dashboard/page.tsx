'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { ExpectedChurns } from '@/components/dashboard/overview/expected-churns';
import { ChurnStatus } from '@/components/dashboard/overview/churn-status';
import { AverageWatchTime } from '@/components/dashboard/overview/average-watch-time';
import { AverageAge } from '@/components/dashboard/overview/average-age';
import { LoginDays } from '@/components/dashboard/overview/login-days';
import { GenreDistribution } from '@/components/dashboard/overview/genre-bar-chart';
import { LoginDaysBarChart } from '@/components/dashboard/overview/login-days-bar-chart'; 

export default function Page(): React.JSX.Element {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/stats.json');
        setStats(res.data);
      } catch (err) {
        console.error('❌ 통계 불러오기 실패:', err);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return <div>📊 로딩 중...</div>;
  }

  return (
    <Grid container spacing={3}>
      {/* 1. 총 고객 수 */}
      <Grid xs={12} sm={6} md={3}>
        <TotalCustomers value={stats.total_customers} />
      </Grid>

      {/* 2. 이탈 고객 수 */}
      <Grid xs={12} sm={6} md={3}>
        <ExpectedChurns value={stats.expected_churns} />
      </Grid>

      {/* 3. 이탈 고객 평균 로그인 경과일 */}
      <Grid xs={12} sm={6} md={3}>
        <LoginDays
          title="이탈 고객 평균 로그인 경과일"
          value={stats.average_days_since_login.churn}
          color="warning"
        />
      </Grid>

      {/* 4. 유지 고객 평균 로그인 경과일 */}
      <Grid xs={12} sm={6} md={3}>
        <LoginDays
          title="유지 고객 평균 로그인 경과일"
          value={stats.average_days_since_login.non_churn}
          color="info"
        />
      </Grid>

      {/* 5. 이탈 현황 */}
      <Grid xs={12} lg={6}>
        <ChurnStatus
          total={stats.total_customers}
          churned={stats.expected_churns}
        />
      </Grid>

      {/* 6. 평균 시청 시간 */}
      <Grid xs={12} sm={6}>
        <AverageWatchTime
          churned={stats.average_watch_time.churn}
          retained={stats.average_watch_time.non_churn}
        />
      </Grid>

      {/* 7. 평균 나이 */}
      <Grid xs={12} sm={6}>
        <AverageAge
          churned={stats.average_age.churn}
          retained={stats.average_age.non_churn}
        />
      </Grid>

      {/* 8. 고객 평균 로그인 경과일 (그래프) */}
      <Grid xs={12} sm={6}>
        <LoginDaysBarChart
          churned={stats.average_days_since_login.churn}
          retained={stats.average_days_since_login.non_churn}
        />
      </Grid>

      {/* 9. 선호 장르 분포 */}
      <Grid xs={12}>
        <GenreDistribution
          data={Object.entries(stats.genre_distribution).map(([genre, count]) => ({
            genre,
            count: Number(count),
          }))}
        />
      </Grid>
    </Grid> 

  );
}
