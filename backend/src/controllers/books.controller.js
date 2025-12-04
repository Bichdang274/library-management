import pool from "../db.js";

export const getBooks = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM books");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addBook = async (req, res) => {
  const { title, author, year } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO books (title, author, year) VALUES (?, ?, ?)",
      [title, author, year]
    );
    res.json({ id: result.insertId, title, author, year });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
