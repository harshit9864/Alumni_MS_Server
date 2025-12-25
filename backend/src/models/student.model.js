import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // Student.js
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    clerkId: {
      type: String,
    },
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
    organisationName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Student = mongoose.model("Student", studentSchema);
