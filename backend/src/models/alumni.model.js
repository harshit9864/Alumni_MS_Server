import mongoose, { mongo } from "mongoose";

const alumniSchema = new mongoose.Schema(
  {
    // Alumni.js
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    clerkId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    eventsJoined: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    mentorship: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentorship",
      },
    ],
    blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
  },
  { timestamps: true }
);

export const Alumni = mongoose.model("Alumni", alumniSchema);
