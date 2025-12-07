import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function BorrowChart() {
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/borrows-by-month')
      .then(res => {
        const data = res.data.data || [];
        setLabels(data.map((item: any) => item.month));
        setValues(data.map((item: any) => item.total));
      })
      .catch(err => {
        console.error("❌ Lỗi lấy dữ liệu biểu đồ:", err);
      });
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: 'Lượt mượn theo tháng',
        data: values,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#2563eb',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { family: 'Source Sans 3', size: 12 }, color: '#281912' },
      },
      title: {
        display: true,
        text: 'Thống kê lượt mượn sách theo tháng',
        font: { family: 'Playfair Display', size: 16, weight: '700' },
        color: '#4e342e',
      },
      tooltip: {
        backgroundColor: '#4e342e',
        titleFont: { family: 'Playfair Display', size: 14 },
        bodyFont: { family: 'Source Sans 3', size: 12 },
        callbacks: { label: (ctx: any) => ` ${ctx.parsed.y} lượt mượn` },
      },
    },
    layout: { padding: 10 },
    scales: {
      x: {
        title: { display: true, text: 'Tháng', color: '#4e342e' },
        ticks: { autoSkip: true, maxTicksLimit: 6, maxRotation: 0, minRotation: 0, color: '#281912' },
        grid: { color: '#efebe9' },
      },
      y: {
        title: { display: true, text: 'Số lượt mượn', color: '#4e342e' },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          color: '#281912',
          callback: (value: any) => (Number.isInteger(value) ? value : null),
        },
        grid: { color: '#efebe9' },
        suggestedMax: Math.ceil(Math.max(...values, 5)),
      },
    },
  };

  // Important: no outer wrapper here. Parent provides the .chart-box container.
  return <Line data={data} options={options} />;
}
