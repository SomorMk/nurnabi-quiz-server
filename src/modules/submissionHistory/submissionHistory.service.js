const { default: mongoose } = require("mongoose");
const SubmissionHistory = require("./submissionHistory.model");
const Schedule = require("./submissionHistory.model");
// const NodeCache = require("node-cache");

// const nodeCache = new NodeCache();

const addSubmissionHistory = async (payload) => {
  const result = await SubmissionHistory.create(payload);
  // nodeCache.flushAll();
  return result;
};

const getSubmissionHistoryByUserId = async (userId) => {
  const getSchedule = await SubmissionHistory.findOne({ userId });
  // nodeCache.flushAll();
  return getSchedule;
};

// const getSubmissionHistoryByScheduleId = async (scheduleId) => {
//   const getSchedule = await SubmissionHistory.find({ scheduleId })
//     .populate({
//       path: "userId",
//       select: "_id fullName phone email image",
//     })
//     .select("-answer")
//     .sort("-toatalSubmitPoint");

//   return getSchedule;
// };

const getSubmissionHistoryByScheduleId = async (scheduleId) => {
  const getSchedule = await SubmissionHistory.aggregate([
    {
      $match: { scheduleId }, // Match the scheduleId
    },
    {
      $lookup: {
        from: "users", // Collection name for the User model
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user", // Unwind the user array to make it a single object
    },
    {
      $project: {
        _id: 1,
        fullName: "$user.fullName",
        image: "$user.image",
        point: "$toatalSubmitPoint", // Rename `toatalSubmitPoint` to `point`
        strength: 1,
      },
    },
    {
      $sort: { point: -1 }, // Sort by totalSubmitPoint in descending order
    },
  ]);

  return getSchedule;
};
const getSubmissionHistoryByUserAndScheduleIdWithRank = async (
  id,
  scheduleId
) => {
  const getSchedule = await SubmissionHistory.aggregate([
    {
      $match: { scheduleId }, // Match the scheduleId
    },
    {
      $lookup: {
        from: "users", // Collection name for the User model
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user", // Unwind the user array to make it a single object
    },
    {
      $setWindowFields: {
        sortBy: { toatalSubmitPoint: -1 }, // Sort by 'point' in descending order
        output: {
          rank: {
            $rank: {}, // Assign rank based on sorted points
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        rank: 1,
        fullName: "$user.fullName",
        image: "$user.image",
        point: "$toatalSubmitPoint", // Rename `toatalSubmitPoint` to `point`
        strength: 1,
      },
    },
    {
      $sort: { point: -1 }, // Sort by totalSubmitPoint in descending order
    },
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
  ]);

  return getSchedule;
};

const getSubmissionHistoryByUserAndScheduleId = async (userId, scheduleId) => {
  const getSchedule = await SubmissionHistory.findOne({
    userId,
    scheduleId,
  })
    .populate("scheduleId")
    .populate("answer.questionId");
  // nodeCache.flushAll();
  return getSchedule;
};

const submissionHistoryService = {
  addSubmissionHistory,
  getSubmissionHistoryByUserId,
  getSubmissionHistoryByScheduleId,
  getSubmissionHistoryByUserAndScheduleIdWithRank,
  getSubmissionHistoryByUserAndScheduleId,
};

module.exports = submissionHistoryService;
