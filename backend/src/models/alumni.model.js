import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
    },
    email: {
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
  },
  { timestamps: true }
);

export const Alumni = mongoose.model("Alumni", alumniSchema);
