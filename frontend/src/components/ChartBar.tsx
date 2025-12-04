import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartBarProps {
  labels: string[];
  data: number[];
}

export default function ChartBar({ labels, data }: ChartBarProps) {
  const cfg = {
    labels,
    datasets: [{ label: 'Top sách mượn', data, backgroundColor: '#22c55e' }],
  };
  return <Bar data={cfg} />;
}
