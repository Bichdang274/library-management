import pool from "../db.js";

export const getStats = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total_books FROM books"
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
