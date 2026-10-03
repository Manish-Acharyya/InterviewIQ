const mongo = require("mongoose");

const paymentSchema = new mongo.Schema(
  {
    userId: {
      type: mongo.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: String,
      required: true,
    },

    // Amount paid
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Credits received
    credits: {
      type: Number,
      required: true,
      min: 0,
    },

    // Razorpay Order ID
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    // Razorpay Payment ID
    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // Razorpay signature
    razorpaySignature: {
      type: String,
      default: null,
    },

    // Payment status
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true },
);
const paymentModel = mongo.model("Payment", paymentSchema);
module.exports = paymentModel;
