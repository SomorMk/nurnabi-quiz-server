const { Schema, model } = require("mongoose");

const levelSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    numberOfQuestion: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      default: "",
    },
    perQuestionMark: {
      type: Number,
      required: [true, "Per Question Mark   is required"],
      default: 1,
    },
    negativeAnswerMark: {
      type: Number,
      default: 0,
    },
    priority: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["active", "deactive", "deleted"],
      default: "active",
    },

    averageStrength: {
      type: Number,
      default: 0,
    },
    totalCompleteQuiz: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Level = model("Level", levelSchema);

module.exports = Level;
