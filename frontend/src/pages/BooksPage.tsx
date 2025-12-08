import { useEffect, useState } from 'react';
import { getBooks, type Book } from '../api';
import '../styles/BooksPage.css'; 

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBooks()
      .then((res) => {
        setBooks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy sách:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      <h2 className="page-title">Quản lý sách</h2>
      {loading ? (
        <p>Đang tải dữ liệu sách...</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Mã sách</th>
              <th>Tiêu đề</th>
              <th>Tác giả</th>
              <th>Năm xuất bản</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
