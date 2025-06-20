import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';

export default function BiaxialLineChart() {
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const [cashIn, setCashIn] = useState<number[]>([]);
  const [cashOut, setCashOut] = useState<number[]>([]);
  const [xLabels, setXLabels] = useState<string[]>([]);

  useEffect(() => {
    const fetchLineChartData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/reports/line-chart`);
        if (!response.ok) {
          throw new Error('Failed to fetch line chart data');
        }
        const data = await response.json();
        setCashIn(data.cashIn);
        setCashOut(data.cashOut);
        setXLabels(data.xLabels);
      } catch (error) {
        console.error('Error fetching line chart data:', error);
      }
    };

    fetchLineChartData();
  }, []);

  return (
    <div className='md:w-[950px] w-[300px]'>
       <LineChart
     
     height={300}
     series={[
       { data: cashIn, label: 'Cash In', yAxisId: 'leftAxisId', color: '#53B175' },
       { data: cashOut, label: 'Cash Out', yAxisId: 'rightAxisId', color: '#1565C0' },
     ]}
     xAxis={[{ scaleType: 'point', data: xLabels }]}
     yAxis={[{ id: 'leftAxisId' }, { id: 'rightAxisId' }]}
     rightAxis="rightAxisId"
   />
    </div>
   
  );
}