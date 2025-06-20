import { BarChart } from '@mui/x-charts/BarChart';
import { useEffect, useState } from 'react';

export default function BiaxialBarChart() {
  const [webSales, setWebSales] = useState<number[]>([]);
  const [posSales, setPosSales] = useState<number[]>([]);
  const [xLabels, setXLabels] = useState<string[]>([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/reports/bar-chart`);
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }
        const data = await response.json();
        setWebSales(data.webSales);
        setPosSales(data.posSales);
        setXLabels(data.xLabels);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchSalesData();
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 620 }}>
      <BarChart
        width={window.innerWidth < 600 ? 300 : 620}
        height={300}
        series={[
          {
            data: posSales,
            label: 'POS',
            id: 'pvId',
            yAxisId: 'leftAxisId',
            color: '#53B175',
          },
          {
            data: webSales,
            label: 'Web & App',
            id: 'uvId',
            yAxisId: 'rightAxisId',
            color: '#1565C0',
          },
        ]}
        xAxis={[{ data: xLabels, scaleType: 'band' }]}
        yAxis={[{ id: 'leftAxisId' }, { id: 'rightAxisId' }]}
        rightAxis="rightAxisId"
      />
    </div>
  );
}