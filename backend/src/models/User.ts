import mongoose, { Document, Schema } from "mongoose";

// Interface cho User document
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "member";
  createdAt?: Date;
  updatedAt?: Date;
}

// Schema định nghĩa cấu trúc dữ liệu
const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
  },
  { timestamps: true }
);

// Xuất model với type an toàn
const User = mongoose.model<IUser>("User", userSchema);
export default User;
