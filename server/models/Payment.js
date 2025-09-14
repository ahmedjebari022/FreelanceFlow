// server/models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "eur",
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
    },
    stripeChargeId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "transferred"],
      default: "pending",
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    payoutId: {
      type: String,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    freelancerAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
