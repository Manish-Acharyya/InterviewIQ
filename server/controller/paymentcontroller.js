const paymentModel = require("../model/paymentmodel");
const User = require("../model/usermodel");
const razorpay = require("../services/razorpayService");
const crypto = require("crypto");
const plans = require("../config/plans");

//=========get plans======
const getPlans = async (req, res) => {
  try {
    return res.status(200).json({ plans });
  } catch (error) {
    console.log("Get plans error:", error);

    return res.status(500).json({
      message: "Failed to get plans",
    });
  }
};

//========create order=======
const createOrder = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Authenticated user:", req.user);
    const { planId } = req.body;

    // Get plan from backend
    const plan = plans[planId];

    // Check if plan exists
    if (!plan) {
      return res.status(400).json({
        message: "Invalid plan",
      });
    }

    const { amount, credits } = plan;
    const options = {
      amount: amount * 100, //convert to paise
      currency: "INR",
      receipt: `receipt${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const payment = await paymentModel.create({
      userId: req.user,
      planId,
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });
    return res.status(200).json({
      message: "order created successfully",

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      payment: {
        id: payment._id,
        amount: payment.amount,
        credits: payment.credits,
        status: payment.status,
      },
    });
  } catch (error) {
    console.log("Razorpay order error:", error);
    return res.status(500).json({
      message: "failed to create Razorpay order",
    });
  }
};

//============verify payment=======
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }
    //find payment id
    const payment = await paymentModel.findOne({
      razorpayOrderId,
    });
    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }
    if (payment.status === "paid") {
      return res.status(200).json({
        message: "Already processed",
      });
    }
    //update payment record
    payment.status = "paid";
    payment.razorpayPaymentId = razorpayPaymentId;
    await payment.save();
    // Add credits to user
    const updatedUser = await User.findByIdAndUpdate(
      payment.userId,
      {
        $inc: { credits: payment.credits },
      },
      { new: true },
    );
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and credits added",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Razorpay order verification error:", error);
    return res.status(500).json({
      message: "failed to verify Razorpay payment",
    });
  }
};

module.exports = { getPlans, createOrder, verifyPayment };
