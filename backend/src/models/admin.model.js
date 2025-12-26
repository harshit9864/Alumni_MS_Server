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
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.model("Admin", adminSchema);
