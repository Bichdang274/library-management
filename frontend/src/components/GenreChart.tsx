import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useEffect, useState } from 'react';
import axios from 'axios';


ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

export default function GenreChart() {
  const [rawData, setRawData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/stats/borrows-by-genre')
      .then(res => {
        console.log("API trả về:", res.data);
        const data = res.data.data || [];

        
        setRawData(data.map((item: any) => item.total));
        setLabels(data.map((item: any) => item.genre));
      })
      .catch(err => {
        console.error("Lỗi lấy dữ liệu biểu đồ:", err);
      });
  }, []);

  const cappedData = rawData.map(val => (val > 200 ? 200 : val));
  const total = cappedData.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Thể loại',
        data: cappedData,
        backgroundColor: [
          '#93c5fd', '#fcd34d', '#f87171',
          '#34d399', '#a78bfa', '#fb923c', '#9ca3af'
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12,
            weight: 600, 
          },
        },
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Phân bổ thể loại sách',
        font: {
          family: "'Poppins', sans-serif",
          size: 16,
          weight: 700, 
        },
      },
      datalabels: {
        color: '#000',
        font: {
          family: "'Poppins', sans-serif",
          size: 11,
          weight: 500, 
        },
        formatter: (value: number) => {
          const percentage = (value / total) * 100;
          return percentage < 5 ? '' : percentage.toFixed(1) + '%';
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const originalValue = rawData[context.dataIndex];
            const percentage = ((cappedData[context.dataIndex] / total) * 100).toFixed(1);
            const valueText = originalValue > 200 ? '200+ sách' : `${originalValue} sách`;
            return `${context.label}: ${valueText} (${percentage}%)`;
          },
        },
      },
    },
  };
  return (
    <div style={{ width: '350px', height: '250px' }}>
      <Pie data={data} options={options} />
    </div>
  );
}
