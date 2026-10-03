const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// MongoDB Connection
require("./config/mongodb");

// Routes
const authRouter = require("./routes/authRoute");
const interviewRouter = require("./routes/interviewroute");
const paymentRouter = require("./routes/paymentRoute");

// Create App
const app = express();

// ================= MIDDLEWARE =================

// Parse JSON
app.use(express.json());

// Parse Cookies
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: "https://interviewiq-client-8sqy.onrender.com",
    credentials: true,
  }),
);

// ================= ROUTES =================

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Server is running successfully",
  });
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error(err);

  return res.status(500).json({
    message: "Internal Server Error",
  });
});

// ================= PORT =================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server connected on port ${PORT}`);
});
