import React, { useEffect, useState } from "react";
import axios from "axios";

interface Book {
  id: number;
  title: string;
  borrow_count: number;
}

interface Reader {
  id: number;
  name: string;
  borrow_count: number;
}

const TopStats: React.FC = () => {
  const [topBooks, setTopBooks] = useState<Book[]>([]);
  const [topReaders, setTopReaders] = useState<Reader[]>([]);

  useEffect(() => {
    axios.get<Book[]>("http://localhost:5000/api/stats/top-books")
      .then(res => setTopBooks(res.data))
      .catch(err => console.error("Error fetching top books:", err));

    axios.get<Reader[]>("http://localhost:5000/api/stats/top-readers")
      .then(res => setTopReaders(res.data))
      .catch(err => console.error("Error fetching top readers:", err));
  }, []);

  return (
    <div>
      <h2> Top 5 Sách Hot</h2>
      <ul>
        {topBooks.map(book => (
          <li key={book.id}>
            {book.title} - {book.borrow_count} lượt mượn
          </li>
        ))}
      </ul>

      <h2> Top 5 Mọt Sách</h2>
      <ul>
        {topReaders.map(reader => (
          <li key={reader.id}>
            {reader.name} - {reader.borrow_count} lượt mượn
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopStats;
