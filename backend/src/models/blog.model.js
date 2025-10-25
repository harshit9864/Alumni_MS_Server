import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    image: {
      type: String, //cloudinary
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    conntent: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Blog = mongoose.model("Blog", blogSchema);
