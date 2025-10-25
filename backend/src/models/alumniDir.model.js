import mongoose from "mongoose";

const alumniDirSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    batchYear: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    currentProfession: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const AlumniDir = mongoose.model("AlumniDir", alumniDirSchema);
