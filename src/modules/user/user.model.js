const mongoose = require("mongoose");
const { Schema } = mongoose;

const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: [true, "Phone Number is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Minimum password length is 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "editor", "admin", "super_admin"],
      default: "user",
    },
    image: {
      type: String,
      default: "/uploads/profile/default-user.jpg",
    },
    address: {
      type: String,
      default: "",
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    isBlock: {
      type: Boolean,
      default: false,
    },
    point: {
      type: Number,
      default: 0,
    },
    liveQuizCompleted: {
      type: Number,
      default: 0,
    },
    strength: {
      type: Number,
      default: 0,
    },
    completeQuiz: {
      type: Number,
      default: 0,
    },
    questionAnswer: {
      type: Number,
      default: 0,
    },
    correctAnswer: {
      type: Number,
      default: 0,
    },
    incorrectAnswer: {
      type: Number,
      default: 0,
    },
    submitQuizLevelIds: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  console.log("save pre");
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre("find", function () {
  this.where({ isDelete: { $ne: "yes" } });
});

userSchema.pre("findOne", function () {
  this.where({ isDelete: { $ne: "yes" } });
});

userSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { isDelete: { $ne: "yes" } } });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
