
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    genre: {
      type: String,
      enum: ['Văn học', 'Khoa học', 'Lịch sử', 'Kinh tế', 'Y học', 'Công nghệ', 'Khác'],
      required: true,
    },
    publishedYear: { type: Number },
    copies: { type: Number, default: 1 },
    available: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model('Book', bookSchema);
