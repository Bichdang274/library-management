import { useDashboard } from '../hooks/useStats';

export default function Stats() {
  const { overdueReaders } = useDashboard();

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Độc giả quá hạn</h2>
      <div className="border rounded bg-white shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Reader</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Số lần quá hạn</th>
              <th className="p-2 border">Lần quá hạn sớm nhất</th>
            </tr>
          </thead>
          <tbody>
            {overdueReaders && overdueReaders.length > 0 ? (
              overdueReaders.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{r.name}</td>
                  <td className="p-2 border">{r.email}</td>
                  <td className="p-2 border">{r.overdue_count}</td>
                  <td className="p-2 border">{r.earliest_due}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Không có độc giả quá hạn
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
