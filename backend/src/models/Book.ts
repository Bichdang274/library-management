import mongoose, { Document, Schema } from "mongoose";

// Interface cho Book document
export interface IBook extends Document {
  title: string;
  author: string;
  genre: "Văn học" | "Khoa học" | "Lịch sử" | "Kinh tế" | "Y học" | "Công nghệ" | "Khác";
  publishedYear?: number;
  copies: number;
  available: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Schema định nghĩa cấu trúc dữ liệu
const bookSchema: Schema<IBook> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    genre: {
      type: String,
      enum: ["Văn học", "Khoa học", "Lịch sử", "Kinh tế", "Y học", "Công nghệ", "Khác"],
      required: true,
    },
    publishedYear: { type: Number },
    copies: { type: Number, default: 1 },
    available: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Xuất model với type an toàn
const Book = mongoose.model<IBook>("Book", bookSchema);
export default Book;
