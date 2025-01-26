'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import instance from '@/utils/axiosInstance';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
};

// Labels for the chart (Months)
const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function StatisticsChart() {
  const [chartData, setChartData] = useState({
    labels,
    datasets: [
      {
        label: 'Monthly Revenue',
        data: Array(12).fill(0), // Placeholder until data is fetched
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await instance.get('/report/sales-report?limit=1000'); // Get all records
        const result = response.data;
        
        if (result.success) {
          const monthlyRevenue = Array(12).fill(0);
          result.data.bookings.forEach((booking: any) => {
            const month = new Date(booking.checkIn).getMonth();
            monthlyRevenue[month] += Number(booking.revenue);
          });
          
          setChartData({
            labels,
            datasets: [{
              label: 'Monthly Revenue',
              data: monthlyRevenue,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }],
          });
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };
    fetchData();
  }, []);

  return <Line options={options} data={chartData} />;
}
