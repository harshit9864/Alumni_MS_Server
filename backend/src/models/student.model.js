import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    passoutYear: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    interests: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const Student = mongoose.model("Student", studentSchema);
