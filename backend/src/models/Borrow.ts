import mongoose, { Document, Schema } from "mongoose";

// Interface cho Borrow document
export interface IBorrow extends Document {
  book: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  borrowedAt: Date;
  returnedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Schema định nghĩa cấu trúc dữ liệu
const borrowSchema: Schema<IBorrow> = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    borrowedAt: { type: Date, default: Date.now },
    returnedAt: { type: Date },
  },
  { timestamps: true }
);

// Xuất model với type an toàn
const Borrow = mongoose.model<IBorrow>("Borrow", borrowSchema);
export default Borrow;
