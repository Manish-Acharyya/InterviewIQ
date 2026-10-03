const User = require("../model/usermodel");
const transporter = require("../config/email");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const generateToken = require("../utils/generateToken");

//===========register============
const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Check required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }
    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    if (password.length < 6) {
      return re.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }
    //check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists.",
      });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Hash confirm password too
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);

    //create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      confirmPassword: hashedConfirmPassword,
    });

    return res.status(201).json({
      message: "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.log("Register error:", error);

    return res.status(500).json({
      message: "Registration failed.",
    });
  }
};

//===========login=========
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    //find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }
    //compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }
    //token
    const token = generateToken(user);

    //store jwt in cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: false,
      secure: true,
      // samesite: "lax",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.log("Login error:", error);

    return res.status(500).json({
      message: "Login failed.",
    });
  }
};

//========logout=======
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      // secure: false,
      secure: true,
      // samesite: "lax",
      sameSite: "none",
    });

    return res.status(200).json({
      message: "Logout successful.",
    });
  } catch (error) {
    console.log("Logout error:", error);
    return res.status(500).json({
      message: "Logout failed.",
    });
  }
};

//=========get current user========
const getcurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user).select(
      "-password -confirmPassword",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        profilePicture: user.profilePicture || "",
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.log("Get current user error:", error);

    return res.status(500).json({
      message: "Failed to get current user.",
    });
  }
};

//==========google login========
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required.",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token",
      });
    }
    const { name, email, picture, sub: googleId, email_verified } = payload;

    // Validation
    if (!name || !email || !googleId) {
      return res.status(400).json({
        message: "Required Google account information is missing.",
      });
    }

    // Check email verification
    if (!email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google email is not verified.",
      });
    }

    // Find existing user
    let user = await User.findOne({ email: email.toLowerCase() });

    // Create new user if not exists
    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        profilePicture: picture || "",
        googleId,
        authProvider: "google",
      });
    } else {
      // Existing local account
      if (user.authProvider === "local" && !user.googleId) {
        return res.status(400).json({
          success: false,
          message:
            "An account with this email already exists. Please login using email and password.",
        });
      }

      // Update Google information if needed
      let changed = false;

      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (picture && !user.profilePicture !== picture) {
        user.profilePicture = picture;
        changed = true;
      }
      if (user.authProvider !== "google") {
        user.authProvider = "google";
        changed = true;
      }

      if (changed) {
        await user.save();
      }
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: false, // true in production with HTTPS
      secure: true,
      // secure: process.env.NODE_ENV === "production" //secure=true
      // sameSite: "lax",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

//==========forgot pass==========
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    // Token valid for 15 minutes
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "InterviewIQ.AI - Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          
          <h2>Reset Your InterviewIQ.AI Password</h2>

          <p>Hello ${user.name},</p>

          <p>
            We received a request to reset your InterviewIQ.AI password.
          </p>

          <p>
            Click the button below to create a new password.
          </p>

          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #10b981;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Reset Password
          </a>

          <p style="margin-top: 20px;">
            This link will expire in 15 minutes.
          </p>

          <p>
            If you did not request this password reset, you can safely ignore
            this email.
          </p>

          <p>
            Regards,<br />
            InterviewIQ.AI Team
          </p>

        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    res.status(200).json({
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      message: "Failed to send password reset email",
    });
  }
};

//=======RESET PASS========
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Reset token is required",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "Password and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Hash the token received from the URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset token is invalid or has expired",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;

    // Clear reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    // Send password changed confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "InterviewIQ.AI - Password Changed Successfully",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            background-color: #ffffff;
          "
        >

          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="margin: 0; color: #111827;">
              InterviewIQ.AI
            </h2>

            <p style="color: #10b981; font-size: 14px;">
              AI-Powered Interview Preparation
            </p>
          </div>

          <div
            style="
              text-align: center;
              padding: 15px;
              background-color: #ecfdf5;
              border-radius: 50%;
              width: 55px;
              margin: 0 auto 20px auto;
            "
          >
            <span style="font-size: 28px;">
              ✓
            </span>
          </div>

          <h2
            style="
              text-align: center;
              color: #111827;
              margin-bottom: 20px;
            "
          >
            Password Changed Successfully
          </h2>

          <p style="color: #374151;">
            Hello ${user.name},
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            Your InterviewIQ.AI account password was successfully changed.
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            You can now use your new password to sign in to your account.
          </p>

          <div
            style="
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              margin: 25px 0;
            "
          >
            <p
              style="
                margin: 0;
                color: #374151;
                font-size: 14px;
              "
            >
              <strong>Security notice:</strong>
              If you did not make this change, please secure your account
              immediately by contacting our support team.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">

            <a
              href="${process.env.FRONTEND_URL}/login"
              style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #10b981;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
              "
            >
              Sign In to InterviewIQ.AI
            </a>

          </div>

          <p
            style="
              color: #6b7280;
              font-size: 13px;
              line-height: 1.5;
            "
          >
            For your security, we recommend keeping your password private
            and using a strong, unique password.
          </p>

          <p
            style="
              color: #6b7280;
              font-size: 13px;
              margin-top: 25px;
            "
          >
            Regards,<br />
            <strong>InterviewIQ.AI Team</strong>
          </p>

        </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);

      console.log("Password changed email sent:", info.messageId);
    } catch (emailError) {
      // Password has already been changed,
      // so don't return a reset failure just because email failed.
      console.error("Password changed email failed:", emailError);
    }

    return res.status(200).json({
      message:
        "Password reset successfully. A confirmation email has been sent.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Failed to reset password",
    });
  }
};
module.exports = {
  register,
  login,
  getcurrentUser,
  googleLogin,
  logout,
  forgotPassword,
  resetPassword,
};
