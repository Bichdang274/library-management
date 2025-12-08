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
    axios.get('http://localhost:5000/api/stats/borrows-by-month')
      .then(res => {
        console.log("API trả về:", res.data);
        const data = res.data.data || [];
        setLabels(data.map((item: any) => item.ym));   
        setValues(data.map((item: any) => item.total)); 
      })
      .catch(err => {
        console.error("Lỗi lấy dữ liệu biểu đồ:", err);
      });
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: 'Lượt mượn theo tháng',
        data: values,
        borderColor: '#3b82f6',
        backgroundColor: '#93c5fd',
        tension: 0.3,
        fill: true, 
      },
    ],
  };

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Thống kê lượt mượn sách theo tháng',
        font: {
          family: 'Poppins, sans-serif',
          size: 16,
          
          weight: 700, 
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tháng',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Số lượt mượn',
        },
        beginAtZero: true,
      },
    },
  };
  return (
    <div style={{ width: '600px', height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  );
}
