import mongoose, { mongo } from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
    },
    organisationName: {
      type: String,
      required: true,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.model("Admin", adminSchema);
