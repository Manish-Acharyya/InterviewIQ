const express = require("express");
const {
  register,
  login,
  getcurrentUser,
  logout,
  googleLogin,
  forgotPassword,
  resetPassword,
} = require("../controller/authcontroller");

const isAuth = require("../middlewares/isAuth");

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);

authRouter.get("/current-user", isAuth, getcurrentUser);
authRouter.post("/google", googleLogin);
module.exports = authRouter;
