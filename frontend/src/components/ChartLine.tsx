import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartLineProps {
  labels: string[];
  data: number[];
}

export default function ChartLine({ labels, data }: ChartLineProps) {
  const cfg = {
    labels,
    datasets: [{ label: 'Lượt mượn theo tháng', data, borderColor: '#3b82f6', tension: 0.2 }],
  };
  return <Line data={cfg} />;
}
