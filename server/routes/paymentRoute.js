const express = require("express");

const {
  getPlans,
  createOrder,
  verifyPayment,
} = require("../controller/paymentcontroller");
const isAuth = require("../middlewares/isAuth");

const paymentRouter = express.Router();

paymentRouter.get("/plans", getPlans);
paymentRouter.post("/order", isAuth, createOrder);
paymentRouter.post("/verify", isAuth, verifyPayment);

module.exports = paymentRouter;
