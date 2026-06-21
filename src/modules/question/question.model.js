const { Schema, model } = require("mongoose");

const questionSchema = new Schema(
  {
    model_type: {
      type: String,
      required: true,
      enum: ["Schedule", "Level"],
    },
    model_id: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "model_type",
    },
    title: {
      type: String,
      required: [true, "title is required"],
    },
    option1: {
      type: String,
      required: true,
    },
    option2: {
      type: String,
      required: true,
    },
    option3: {
      type: String,
      required: true,
    },
    option4: {
      type: String,
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    priority: {
      type: Number,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "deactive", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Question = model("Question", questionSchema);

module.exports = Question;
