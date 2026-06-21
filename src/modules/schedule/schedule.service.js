const Schedule = require("./schedule.model");
// const NodeCache = require("node-cache");

// const nodeCache = new NodeCache();

const addSchedule = async (payload) => {
  const savedSchedule = await Schedule.create(payload);
  // nodeCache.flushAll();
  return savedSchedule;
};

const getAllSchedule = async () => {
  const getSchedule = await Schedule.find({}).sort("-createdAt");
  // nodeCache.flushAll();
  return getSchedule;
};

const getLiveQuizById = async (id) => {
  const getSchedule = await Schedule.findById(id);
  // nodeCache.flushAll();
  return getSchedule;
};

const getLiveQuiz = async () => {
  const schedule = await Schedule.findOne({
    status: "active",
    // startTime: { $gte: new Date() },
    // endTime: { $gte: new Date() },
  });
  return schedule;
};

const getRunningLiveQuiz = async () => {
  const schedule = await Schedule.findOne({
    status: "active",
    startTime: { $lte: new Date() },
    endTime: { $gte: new Date() },
  });
  return schedule;
};

const getRunningLiveQuizSubmit = async () => {
  const oneMinuteFromNow = new Date(Date.now() + 1 * 60 * 1000); // Add 1 minute
  const schedule = await Schedule.findOne({
    status: "active",
    startTime: { $lte: new Date() },
    endTime: { $gte: oneMinuteFromNow },
  });
  return schedule;
};

const getLastCompleteLiveQuiz = async () => {
  const schedule = await Schedule.findOne({
    status: "active",
    startTime: { $lte: new Date() },
    endTime: { $lte: new Date() },
  });
  return schedule;
};

const getTotalScheduleQuiz = async (email, phone) => {
  const totalUserCount = await Schedule.countDocuments({});
  return totalUserCount;
};

const updateLiveQuizById = async (livelId, payload) => {
  // console.log({ livelId });
  // console.log(payload.s);

  if (payload.status === "active") {
    await Schedule.updateMany(
      { status: "active" }, // filter
      { $set: { status: "deactive" } } // update
    );
  }

  const res = await Schedule.findByIdAndUpdate(
    livelId,
    payload,
    { new: true } // Return the updated document
  );

  return res;
};

const updateNumberOfQuestionsOfSchedule = async (scheduleId) => {
  console.log({ scheduleId });
  const res = await Schedule.findByIdAndUpdate(
    scheduleId,
    { $inc: { numberOfQuestion: 1 } }, // Increment by 1
    { new: true } // Return the updated document
  );

  return res;
};

const decreaseNumberOfQuestionsOfSchedule = async (scheduleId) => {
  console.log({ scheduleId });

  // Get current schedule data
  const currentSchedule = await Schedule.findById(scheduleId).select(
    "numberOfQuestion"
  );
  if (!currentSchedule) {
    throw new Error("Schedule not found");
  }

  const currentCount = currentSchedule.numberOfQuestion || 0;
  const newCount = Math.max(0, currentCount - 1); // Ensure it doesn't go below 0

  const res = await Schedule.findByIdAndUpdate(
    scheduleId,
    { numberOfQuestion: newCount },
    { new: true } // Return the updated document
  );

  return res;
};

const deleteiveQuizById = async (scheduleId) => {
  // console.log({ scheduleId });
  const res = await Schedule.findByIdAndDelete(scheduleId);

  return res;
};

const scheduleService = {
  addSchedule,
  getAllSchedule,
  getLiveQuiz,
  getRunningLiveQuiz,
  getRunningLiveQuizSubmit,
  getLastCompleteLiveQuiz,
  getLiveQuizById,
  getTotalScheduleQuiz,
  updateLiveQuizById,
  updateNumberOfQuestionsOfSchedule,
  decreaseNumberOfQuestionsOfSchedule,
  deleteiveQuizById,
};

module.exports = scheduleService;
