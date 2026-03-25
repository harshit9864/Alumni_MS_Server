import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true, // Amount in Rupees
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    // Razorpay Specific Details
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    // Optional: A note from the donor
    message: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

export const Donation = mongoose.model("Donation", donationSchema);