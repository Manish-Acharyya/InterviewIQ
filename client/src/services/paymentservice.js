import api from "./api";

export const getPlans = async () => {
  const response = await api.get("/payment/plans");
  return response.data;
};

export const createPaymentOrder = async (planId) => {
  const response = await api.post("/payment/order", {planId});
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await api.post("/payment/verify", paymentData);
  return response.data;
};
