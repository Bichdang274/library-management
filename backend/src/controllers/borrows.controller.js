import pool from "../db.js";

export const getBorrows = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM borrowings");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
