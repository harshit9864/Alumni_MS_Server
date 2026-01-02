import mongoose from "mongoose";

const mentorshipSchema = new mongoose.Schema(
  {
    studentName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    alumniMail: {
      type: String,
      required: true,
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
      enum: ["accepted", "pending", "declined","ended"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Mentorship = mongoose.model("Mentorship", mentorshipSchema);
