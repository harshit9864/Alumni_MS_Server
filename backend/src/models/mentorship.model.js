import mongoose from "mongoose";

const mentorshipSchema = new mongoose.Schema(
  {
    studentName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    alumniName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alumni",
    },
    purpose: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "pending", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Mentorship = mongoose.model("Mentorship", mentorshipSchema);
