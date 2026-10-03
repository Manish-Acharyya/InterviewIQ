const mongo = require("mongoose");
const userSchema = new mongo.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      minlength: 6,
    },
    confirmPassword: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },

      validate: {
        validator: function (value) {
          // Skip confirmation validation for Google users.
          if (this.authProvider === "google") return true;

          return value === this.password;
        },
        message: "Passwords do not match.",
      },
    },
    googleId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    credits: {
      type: Number,
      default: 1000,
    },
    profilePicture: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true },
);

const usermodel = mongo.model("User", userSchema);
module.exports = usermodel;
