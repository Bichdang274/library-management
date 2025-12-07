import express, { Request, Response } from "express";
import cors from "cors";
import statsRoutes from "./routes/statsRoutes"; // chỉ giữ route thống kê
import path from "path";

const app = express();

// Middleware cơ bản
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Routes chính
app.use("/api/stats", statsRoutes);

// Nếu bạn có export routes riêng thì import thêm
// Ví dụ: import exportRoutes from "./routes/exportRoutes";
// app.use("/api/export", exportRoutes);

// Serve font cho PDF nếu cần
app.use("/fonts", express.static(path.join(__dirname, "fonts")));

// Khởi động server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
