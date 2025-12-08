import { useState, useEffect } from 'react';
import axios from 'axios';


export interface OverdueReader {
  id: number;
  name: string;
  email: string;
  overdue_count: number;
  earliest_due: string;
}


export const useDashboard = () => {
  const [overdueReaders, setOverdueReaders] = useState<OverdueReader[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const res = await axios.get('http://localhost:5000/api/stats/overdue-readers');
        
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

  
  return { overdueReaders, loading, error };
};