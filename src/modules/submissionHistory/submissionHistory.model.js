const { Schema, model } = require("mongoose");

const submissionHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Schedule",
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

const SubmissionHistory = model("SubmissionHistory", submissionHistorySchema);
module.exports = SubmissionHistory;
