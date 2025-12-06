import { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Định nghĩa kiểu dữ liệu cho Độc giả quá hạn
export interface OverdueReader {
  id: number;
  name: string;
  email: string;
  overdue_count: number;
  earliest_due: string;
}

// 2. Export đúng tên hook là useDashboard để khớp với import bên Stats.tsx
export const useDashboard = () => {
  const [overdueReaders, setOverdueReaders] = useState<OverdueReader[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi API lấy danh sách độc giả quá hạn (cần đảm bảo Backend có API này)
        const res = await axios.get('http://localhost:5000/api/stats/overdue-readers');
        // Giả sử API trả về { data: [...] } hoặc mảng trực tiếp, bạn chỉnh lại cho khớp
        setOverdueReaders(res.data.data || res.data);
      } catch (err: any) {
        setError(err.message);
        console.error("Lỗi tải data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Trả về dữ liệu để component Stats sử dụng
  return { overdueReaders, loading, error };
};