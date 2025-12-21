import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    fullName: String,
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["student", "alumni"], required: true },
    avatar: String,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
