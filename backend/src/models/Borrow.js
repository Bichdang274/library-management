
import mongoose from 'mongoose';

const borrowSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrowedAt: { type: Date, default: Date.now },
    returnedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Borrow', borrowSchema);
