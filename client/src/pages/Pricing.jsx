import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  getPlans,
  createPaymentOrder,
  verifyPayment,
} from "../services/paymentservice";
import { useAuth } from "../context/AuthContext";

function Pricing() {
  const navigate = useNavigate();

  const {setUser}=useAuth()

  const [plans, setPlans] = useState({});
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  //fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlans();
        console.log(data);

        setPlans(data.plans);
      } catch (error) {
        console.log("Failed to fetch plans:", error);
      }
    };
    fetchPlans();
  }, []);

  //payment func
  const handlePayment = async (planId) => {
    try {
      setLoadingPlan(planId);

      const plan = plans[planId];

      const result = await createPaymentOrder(planId);

      console.log("Order created:", result);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.order.amount,
        currency: result.order.currency,
        name: "INTERVIEWIQ.AI",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.order.id,

        handler: async function (response) {
          try {
            console.log("Razorpay response:", response);

            const paymentData = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };

            const verifyResult = await verifyPayment(paymentData);

            console.log("Payment verification:", verifyResult);

            if (verifyResult.success) {
              setUser(verifyResult.user)
              setSuccessData({
                credits: plan.credits,
                planName: plan.name,
                amount: plan.amount,
              });

              setPaymentSuccess(true);
            }
          } catch (error) {
            console.log("Payment verification error:", error);

            alert(
              error.response?.data?.message || "Payment verification failed",
            );
          } finally {
            setLoadingPlan(null);
          }
        },

        theme: {
          color: "#10b981",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.open();
    } catch (error) {
      console.log("Payment error:", error);

      alert(error.response?.data?.message || "Failed to create payment order");

      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-16 px-6">
      <div className="max-w-6xl mx-auto mb-14 flex items-start gap-4">
        <button
          onClick={() => navigate("/")}
          className="mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>

        <div className="text-center w-full">
          <h1 className="text-4xl font-bold text-gray-800">Choose Your Plan</h1>

          <p className="text-gray-500 mt-3 text-lg">
            Flexible pricing to match your interview preparation goals.
          </p>
        </div>
      </div>
      {/******* plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.entries(plans).map(([planId, plan]) => {
          const isSelected = selectedPlan === planId;
          const isFree = plan.amount === 0;
          return (
            <motion.div
              key={planId}
              whileHover={!isFree ? { scale: 1.03 } : {}}
              onClick={() => !isFree && setSelectedPlan(planId)}
              className={`relative rounded-3xl p-8 shadow-lg cursor-pointer duration-300 border transition-all
          ${
            isSelected
              ? "border border-emerald-600 shadow-2xl bg-white"
              : "bg-white border border-gray-200 shadow-md"
          }
          ${isFree ? "opacity-90 cursor-default" : "cursor-pointer"}
        `}
            >
              {/*=====Card Content========*/}
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-6 right-6 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow">
                  {plan.badge}
                </div>
              )}

              {/* Default Tag */}
              {isFree && (
                <div className="absolute top-6 right-6 bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                  Default
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-xl font-semibold text-gray-800">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mt-4">
                <span className="text-3xl font-bold text-emerald-600">
                  ₹{plan.amount}
                </span>

                <p className="text-gray-500 mt-1">{plan.credits} Credits</p>
              </div>

              {/* Description */}
              <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                {plan.description}
              </p>

              {/* Features */}
              <div className="mt-6 space-y-3 text-left">
                {(plan.features || []).map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-500 text-sm" />

                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {!isFree && (
                <button
                  disabled={loadingPlan === planId}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      setSelectedPlan(planId);
                    } else {
                      handlePayment(planId);
                    }
                  }}
                  className={`w-full mt-8 py-3 rounded-xl font-semibold transition ${
                    isSelected
                      ? "bg-emerald-600 text-white hover:opacity-90"
                      : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
                  }`}
                >
                  {loadingPlan === planId
                    ? "Processing..."
                    : isSelected
                      ? "Proceed to Pay"
                      : "Select Plan"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Payment Success Popup */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setPaymentSuccess(false)}
          />

          {/* Popup */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              y: 30,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 22,
            }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Top Section */}
            <div className="px-8 pt-8 text-center">
              {/* Animated Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.15,
                  type: "spring",
                  stiffness: 250,
                }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500"
                >
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      delay: 0.4,
                      duration: 0.5,
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-8 w-8 text-white"
                  >
                    <motion.path
                      d="M5 12.5L9.5 17L19 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                </motion.div>
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-6 text-2xl font-bold text-gray-800"
              >
                Payment Successful!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mt-2 text-sm text-gray-500"
              >
                Your payment has been verified successfully.
              </motion.p>
            </div>

            {/* Payment Details */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mx-8 mt-6 rounded-2xl bg-emerald-50 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Plan</span>

                <span className="font-semibold text-gray-800">
                  {successData?.planName}
                </span>
              </div>

              <div className="my-3 border-t border-emerald-100" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Amount Paid</span>

                <span className="font-semibold text-gray-800">
                  ₹{successData?.amount}
                </span>
              </div>

              <div className="my-3 border-t border-emerald-100" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Credits Added</span>

                <span className="font-bold text-emerald-600">
                  +{successData?.credits} Credits
                </span>
              </div>
            </motion.div>

            {/* Bottom */}
            <div className="px-8 pb-8 pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setPaymentSuccess(false);
                  navigate("/");
                }}
                className="w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
              >
                Continue
              </motion.button>

              <p className="mt-3 text-center text-xs text-gray-400">
                Your credits are now available in your account.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Pricing;
