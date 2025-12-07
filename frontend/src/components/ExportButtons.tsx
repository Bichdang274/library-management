import React from "react";

const ExportButtons: React.FC = () => {
  // Export CSV (theo thể loại)
  const handleExportCSV = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/export/borrows-by-genre");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "borrows-by-genre.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("❌ Lỗi export CSV:", error);
    }
  };

  // Export Excel (theo tháng)
  const handleExportExcel = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/export/borrows-by-month");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "borrows-by-month.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("❌ Lỗi export Excel:", error);
    }
  };

  // Export toàn trang (Stats + Month + Genre)
  const handleExportAll = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/export/all");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "library-report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("❌ Lỗi export All:", error);
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
      <button onClick={handleExportCSV}>📄 Export CSV (Thể loại)</button>
      <button onClick={handleExportExcel}>📊 Export Excel (Theo tháng)</button>
      <button onClick={handleExportAll}>📑 Export toàn bộ dữ liệu</button>
    </div>
  );
};

export default ExportButtons;
