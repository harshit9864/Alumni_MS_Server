import Razorpay from "razorpay";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import { Apiresponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Donation } from "../models/donation.model.js";

const createOrder = asyncHandler(async (req, res) => {
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  const { amount } = req.body; // Amount in Rupee

  const options = {
    amount: amount * 100, // Razorpay accepts amount in PAISE (1 Rs = 100 Paise)
    currency: "INR",
    receipt: "receipt_" + Math.random().toString(36).substring(7),
  };

  const order = await instance.orders.create(options);

  if (!order) return res.status(500).send("Some error occured");

  res.status(200).json(new Apiresponse(200, order, "successful"));
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { userId, sessionClaims } = req.auth();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  console.log("hit endpoint");

  // Use the SDK's built-in validator
  const isValid = validatePaymentVerification(
    {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    },
    razorpay_signature,
    secret
  );

  if (isValid) {
    const newDonation = await Donation.create({
      clerkId:userId, // Assuming you have middleware adding user info
      amount: req.body.amount, // You need to pass this from frontend or fetch from order
      status: "success",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });
    console.log;
    return res.status(200).json({ message: "Payment verified successfully" });
  } else {
    return res.status(400).json({ message: "Invalid signature sent!" });
  }
});

export { createOrder, verifyPayment };
