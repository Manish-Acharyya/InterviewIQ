const plans = {
  free: {
    name: "Free",
    amount: 0,
    credits: 100,
    description: "Perfect for beginners starting interview preparation.",
    features: [
      "100 AI Interview Credits",
      "Basic Performance Report",
      "Voice Interview Access",
      "Limited History Tracking",
    ],
    default: true,
  },

  basic: {
    name: "Starter Pack",
    amount: 100,
    credits: 250,
    description: "Great for focused practice and skill improvement.",
    features: [
      "250 AI Interview Credits",
      "Detailed AI Feedback",
      "Advanced Performance Reports",
      "Full Interview History",
    ],
  },

  pro: {
    name: "Pro Pack",
    amount: 500,
    credits: 650,
    description: "Best value for more optimized dedicated job preparation.",
    features: [
      "650 AI Interview Credits",
      "Advanced AI Feedback",
      "Skill Trend Analysis",
      "Priority AI Processing",
    ],
    badge: "Best Value",
  },
};

module.exports = plans;