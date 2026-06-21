const { Schema, model } = require("mongoose");

const levelQuizSubmissionHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    levelId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Level",
    },
    totalCorrectAnswer: {
      type: Number,
      required: true,
    },
    toatalSubmitPoint: {
      type: Number,
      required: true,
    },
    strength: {
      type: Number,
      required: true,
    },
    answer: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Question",
        },
        userAnswer: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const LevelQuizSubmissionHistory = model(
  "LevelQuizSubmissionHistory",
  levelQuizSubmissionHistorySchema
);
module.exports = LevelQuizSubmissionHistory;
