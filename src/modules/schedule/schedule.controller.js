const catchAsync = require("../../shared/catchAsync");
const sendResponse = require("../../shared/sendResponse");
const levelService = require("../level/level.service");
const questionService = require("../question/question.service");
const submissionHistoryService = require("../submissionHistory/submissionHistory.service");
const userService = require("../user/user.service");
const scheduleService = require("./schedule.service");
const moment = require("moment");
const { formatDurationToObject } = require("./schedule.utils");

const addSchedule = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if (req.files) {
    if (req.files.image) {
      const image = req.files.image[0].filename;
      payload.image = `/uploads/schedule/${image}`;
    }
  }

  console.log(payload);

  const schedule = await scheduleService.addSchedule(payload);

  if (schedule) {
    sendResponse(res, 201, true, "Schedule added successfully", schedule);
  } else {
    sendResponse(res, 400, false, "Failed to add schedule", {});
  }
});

const submitQuiz = catchAsync(async (req, res) => {
  const user = req.user;
  const userAnswers = req.body;

  console.log("object");
  console.log(userAnswers);

  const liveQuiz = await scheduleService.getRunningLiveQuizSubmit();

  if (!liveQuiz) {
    return sendResponse(res, 400, false, "Live Quiz not found", {});
  }

  const submissionHistoryByUser =
    await submissionHistoryService.getSubmissionHistoryByUserId(user.id);

  if (submissionHistoryByUser) {
    return sendResponse(res, 400, false, "Can not submit multiple time.", {});
  }

  const questions = await questionService.getAllQuestionByLivelIdWithAnswer(
    liveQuiz._id
  );
  const userData = await userService.getSingleUser(user.id);

  if (!liveQuiz) {
    return sendResponse(res, 400, false, "Live Quiz not found", {});
  }

  if (Number(liveQuiz.requirePoint) > Number(userData.point)) {
    return sendResponse(
      res,
      400,
      false,
      `you have no enough point. Minimum required ${liveQuiz.requirePoint}`,
      {}
    );
  }

  let correctCount = 0;

  console.log({ correctAnswer: "aaaaaaaaaaaaaaaaaa" });
  console.log(questions);
  console.log(userAnswers);
  console.log({ correctAnswer: "bbbbbbbbbbbbbbbb" });

  questions.forEach((question) => {
    const userAnswer = userAnswers[question._id];
    console.log(userAnswer);
    if (userAnswer === question.correctAnswer) {
      correctCount += 1;
    }
  });

  const totalQuestions = questions.length;
  const newStrength = (correctCount / totalQuestions) * 100 || 0;

  // Update average correct percentage
  const oldAverageStrength = liveQuiz.averageStrength || 0;
  const totalCompleteQuiz = liveQuiz.totalCompleteQuiz || 0;

  const newAverageStrength =
    (oldAverageStrength * totalCompleteQuiz + newStrength) /
    (totalCompleteQuiz + 1);

  const payload = {
    averageStrength: newAverageStrength.toFixed(2),
    totalCompleteQuiz: totalCompleteQuiz + 1,
  };

  process.nextTick(async () => {
    await scheduleService.updateLiveQuizById(liveQuiz._id, payload);
  });

  const liveQuizCompleted = userData.liveQuizCompleted || 0;

  const userPayload = {
    point: Number(
      (Number(userData.point) - Number(liveQuiz.requirePoint)).toFixed(2)
    ),
    liveQuizCompleted: liveQuizCompleted + 1,
  };

  console.log({ liveQuiz });
  console.log(liveQuiz.perQuestionMark);
  console.log({ correctCount });

  const toatalSubmitPoint = correctCount * Number(liveQuiz.perQuestionMark);

  const processedAnswers = Object.entries(userAnswers).map(
    ([questionId, value]) => {
      return {
        questionId,
        userAnswer: value,
      };
    }
  );

  console.log({ toatalSubmitPoint });

  const submissionHistoryData = {
    userId: user.id,
    scheduleId: liveQuiz._id,
    totalCorrectAnswer: correctCount,
    toatalSubmitPoint,
    strength: newStrength,
    answer: processedAnswers,
  };

  console.log({ submissionHistoryData });

  const submissionHistoryDataAdd =
    await submissionHistoryService.addSubmissionHistory(submissionHistoryData);

  // update user profile data asynchronously
  process.nextTick(async () => {
    await userService.updateUser(user.id, userPayload, liveQuiz._id);
  });

  const responseData = {
    // point: Number(toatalSubmitPoint.toFixed(2)),
    // correctAnswer: correctCount,
    // toatalSubmitPoint,
    // totalQuestions: questions.length,
    // yourStrength: Number(newStrength.toFixed(2)),
  };

  if (submissionHistoryDataAdd) {
    sendResponse(res, 200, true, "quiz submit successfully", responseData);
  } else {
    sendResponse(res, 400, false, "Failed to add level", {});
  }
});

const submitQuizA = catchAsync(async (req, res) => {
  const user = req.user;
  const userAnswers = req.body;
  const { id } = req.params;

  const level = await levelService.getSingleLeveById(id);

  if (level) {
    sendResponse(res, 400, false, "Failed to get question", {});
  }

  // console.log("aaaaaaaaaaa");

  const submissionHistoryByUser =
    await submissionHistoryService.getSubmissionHistoryByUserId(user.id);

  if (submissionHistoryByUser) {
    return sendResponse(res, 400, false, "Can not submit multiple time.", {});
  }

  // console.log(user);

  const questions = await questionService.getAllQuestionByLivelId(id);
  const liveQuiz = await scheduleService.getLiveQuizById(id);
  const userData = await userService.getSingleUser(user.id);

  if (!liveQuiz) {
    return sendResponse(res, 400, false, "Live Quiz not found", {});
  }

  if (Number(liveQuiz.requirePoint) > Number(userData.point)) {
    return sendResponse(
      res,
      400,
      false,
      `you have no enough point. Minimum required ${liveQuiz.requirePoint}`,
      {}
    );
  }

  const currentTime = moment(); // Get the current time
  const startTime = moment(liveQuiz.startTime);
  const endTime = moment(liveQuiz.endTime);

  if (currentTime.isBefore(startTime)) {
    const daysLeft = startTime.diff(currentTime, "days");
    const hoursLeft = startTime.diff(currentTime, "hours");
    const minutesLeft = startTime.diff(currentTime, "minutes") % 60; // Remainder for minutes
    return sendResponse(
      res,
      400,
      false,
      `${daysLeft} days ${hoursLeft} hours ${minutesLeft} minutes left until the quiz starts.`,
      {}
    );
  }

  if (currentTime.isAfter(endTime)) {
    return sendResponse(res, 400, false, "The quiz time has ended.", {});
  }

  let correctCount = 0;
  let answerWithQuestion = [];

  questions.forEach((question) => {
    const userAnswer = userAnswers[question._id];
    if (userAnswer === question.correctAnswer) {
      correctCount += 1;
    }
  });

  const totalQuestions = questions.length;
  const newStrength = (correctCount / totalQuestions) * 100 || 0;

  // Update average correct percentage
  const oldAverageStrength = liveQuiz.averageStrength || 0;
  const totalCompleteQuiz = liveQuiz.totalCompleteQuiz || 0;

  const newAverageStrength =
    (oldAverageStrength * totalCompleteQuiz + newStrength) /
    (totalCompleteQuiz + 1);

  const payload = {
    averageStrength: newAverageStrength.toFixed(2),
    totalCompleteQuiz: totalCompleteQuiz + 1,
  };

  process.nextTick(async () => {
    await scheduleService.updateLiveQuizById(id, payload);
  });

  const liveQuizCompleted = userData.liveQuizCompleted || 0;

  const userPayload = {
    point: Number(
      (Number(userData.point) - Number(liveQuiz.requirePoint)).toFixed(2)
    ),
    liveQuizCompleted: liveQuizCompleted + 1,
  };

  const toatalSubmitPoint = correctCount * Number(liveQuiz.perQuestionMark);

  const processedAnswers = Object.entries(userAnswers).map(
    ([questionId, value]) => {
      return {
        questionId,
        userAnswer: value,
      };
    }
  );

  console.log({ toatalSubmitPoint });

  const submissionHistoryData = {
    userId: user.id,
    scheduleId: id,
    totalCorrectAnswer: 4,
    toatalSubmitPoint,
    strength: newStrength,
    answer: processedAnswers,
  };

  console.log({ submissionHistoryData });

  const submissionHistoryDataAdd =
    await submissionHistoryService.addSubmissionHistory(submissionHistoryData);

  // update user profile data asynchronously
  process.nextTick(async () => {
    await userService.updateUser(user.id, userPayload, id);
  });

  const responseData = {
    point: Number(toatalSubmitPoint.toFixed(2)),
    correctAnswer: correctCount,
    toatalSubmitPoint,
    totalQuestions: questions.length,
    yourStrength: Number(newStrength.toFixed(2)),
  };

  if (submissionHistoryDataAdd) {
    sendResponse(res, 200, true, "quiz submit successfully", responseData);
  } else {
    sendResponse(res, 400, false, "Failed to add level", {});
  }
});

const getAllSchedule = catchAsync(async (req, res) => {
  const schedule = await scheduleService.getAllSchedule();

  if (schedule) {
    sendResponse(res, 200, true, "Schedule get successfully", schedule);
  } else {
    sendResponse(res, 400, false, "Failed to get schedule", {});
  }
});

const getRunningLiveQuiz = catchAsync(async (req, res) => {
  const runningQuiz = await scheduleService.getLiveQuiz();

  console.log(runningQuiz);

  const currentTime = new Date();

  if (runningQuiz) {
    if (currentTime > new Date(runningQuiz.endTime)) {
      quizStatus = { finished: true, message: "Quiz has already finished" };
    } else if (currentTime < new Date(runningQuiz.startTime)) {
      const waitingTimeMs = new Date(runningQuiz.startTime) - currentTime;
      const formattedWaitingTime = formatDurationToObject(waitingTimeMs);

      quizStatus = {
        waitingTime: formattedWaitingTime,
        message: "Quiz hasn't started yet",
      };
    } else {
      quizStatus = { running: true, message: "Quiz is currently running" };
    }

    return sendResponse(res, 200, true, quizStatus.message, {
      ...runningQuiz.toObject(), // Convert Mongoose document to plain object
      ...quizStatus,
    });
  } else {
    sendResponse(res, 200, false, "No live quiz found", {});
  }
});

const getRunningQuestion = catchAsync(async (req, res) => {
  const user = req.user;

  if (!user?.id) {
    return sendResponse(res, 400, true, "You are not authorized", {});
  }

  const liveQuiz = await scheduleService.getRunningLiveQuiz();

  if (!liveQuiz) {
    return sendResponse(res, 400, true, "Live quiz not available", {});
  }

  const userData = await userService.getSingleUser(user?.id);

  const submissionHistory =
    await submissionHistoryService.getSubmissionHistoryByUserAndScheduleId(
      user?.id,
      liveQuiz._id
    );

  // console.log("object.............");
  // console.log(submissionHistory);

  // console.log("object.......end......");

  if (submissionHistory) {
    return sendResponse(res, 400, false, `Already you attend this quiz`, {});
  }

  console.log("object.............");
  console.log(liveQuiz.requirePoint, userData.point);

  console.log("object.......end......");

  if (liveQuiz.requirePoint > userData.point) {
    return sendResponse(
      res,
      400,
      false,
      `you have no enough point. Minimum required ${liveQuiz.requirePoint}`,
      {}
    );
  }

  const questions = await questionService.getAllQuestionByLivelId(liveQuiz.id);

  sendResponse(res, 200, true, "Live quiz qurstions", questions);
});

const getAllQuestionByLiveId = catchAsync(async (req, res) => {
  const user = req.user;

  const liveQuiz = await scheduleService.getRunningLiveQuiz();
  const userData = await userService.getSingleUser(user?.id);

  const currentTime = moment(); // Get the current time
  const startTime = moment(liveQuiz.startTime);
  const endTime = moment(liveQuiz.endTime);

  if (currentTime.isBefore(startTime)) {
    const daysLeft = startTime.diff(currentTime, "days");
    const hoursLeft = startTime.diff(currentTime, "hours");
    const minutesLeft = startTime.diff(currentTime, "minutes") % 60; // Remainder for minutes
    return sendResponse(
      res,
      400,
      false,
      `${daysLeft} days ${hoursLeft} hours ${minutesLeft} minutes left until the quiz starts.`,
      {}
    );
  }

  if (currentTime.isAfter(endTime)) {
    return sendResponse(res, 400, false, "The quiz time has ended.", {});
  }

  const submissionHistory =
    await submissionHistoryService.getSubmissionHistoryByScheduleId(
      user?.id,
      id
    );

  if (!submissionHistory && liveQuiz.requirePoint > userData.point) {
    return sendResponse(
      res,
      400,
      false,
      `you have no enough point. Minimum required ${liveQuiz.requirePoint}`,
      {}
    );
  }

  console.log(id);
  const questions = await questionService.getAllQuestionByLivelId(id);

  console.log(questions);

  if (questions) {
    sendResponse(res, 200, true, "Question get successfully", questions);
  } else {
    sendResponse(res, 400, false, "Failed to get question", {});
  }
});

const getTotalScheduleQuiz = catchAsync(async (req, res) => {
  const schedule = await scheduleService.getTotalScheduleQuiz();

  if (schedule) {
    sendResponse(
      res,
      200,
      true,
      "Total Schedule Quiz  get successfully",
      schedule
    );
  } else {
    sendResponse(res, 400, false, "Failed to get Total Schedule Quiz", {});
  }
});

const getMyResultView = catchAsync(async (req, res) => {
  const liveQuiz = await scheduleService.getLastCompleteLiveQuiz();

  if (!liveQuiz) {
    return sendResponse(res, 400, true, "Wait for live quiz end", {});
  }

  const { id: userId } = req.user;

  const submissionHistory =
    await submissionHistoryService.getSubmissionHistoryByUserAndScheduleId(
      userId,
      liveQuiz._id
    );

  if (!(userId === submissionHistory?.userId?.toString())) {
    return sendResponse(
      res,
      400,
      false,
      "You are not participate this quiz yet",
      {}
    );
  }

  if (submissionHistory) {
    sendResponse(
      res,
      200,
      true,
      "Your submission history get successfully",
      submissionHistory
    );
  } else {
    sendResponse(res, 400, false, "Failed to get Live quiz history", {});
  }
});

const getLeaderboardOfLastLiveQuiz = catchAsync(async (req, res) => {
  const liveQuiz = await scheduleService.getLastCompleteLiveQuiz();

  if (!liveQuiz) {
    return sendResponse(res, 400, true, "Wait for live quiz end", {});
  }

  // console.log({ categoryId });
  const submissionHistory =
    await submissionHistoryService.getSubmissionHistoryByScheduleId(
      liveQuiz._id
    );

  console.log(submissionHistory);

  if (submissionHistory) {
    sendResponse(
      res,
      200,
      true,
      "Get Live quiz submission history successfully",
      submissionHistory
    );
  } else {
    sendResponse(res, 400, false, "Failed to get Live quiz history", {});
  }
});

const getSingleUserLeaderboardOfLastLiveQuiz = catchAsync(async (req, res) => {
  const { userId } = req.params;
  console.log({ userId });

  const liveQuiz = await scheduleService.getLastCompleteLiveQuiz();

  if (!liveQuiz) {
    return sendResponse(res, 400, true, "Wait for live quiz end", {});
  }

  // console.log({ categoryId });
  const submissionHistory =
    await submissionHistoryService.getSubmissionHistoryByUserAndScheduleIdWithRank(
      userId,
      liveQuiz._id
    );

  console.log(submissionHistory);

  if (submissionHistory) {
    sendResponse(
      res,
      200,
      true,
      "Get Live quiz submission history successfully",
      submissionHistory[0]
    );
  } else {
    sendResponse(res, 400, false, "Failed to get Live quiz history", {});
  }
});

const updateLiveQuiz = catchAsync(async (req, res) => {
  const payload = { ...req.body };

  // console.log("objectobject");
  // console.log("aaaaaaaaaaaaaaaaaaaaaaas");

  const { scheduleId } = req.params;
  if (req.files) {
    if (req.files.image) {
      const image = req.files.image[0].filename;
      payload.image = `/uploads/schedule/${image}`;
    }
  }

  // console.log("payload");
  // console.log(payload);

  const schedule = await scheduleService.updateLiveQuizById(
    scheduleId,
    payload
  );

  if (schedule) {
    sendResponse(res, 201, true, "schedule update successfully", schedule);
  } else {
    sendResponse(res, 400, false, "Failed to update schedule", {});
  }
});

const deleteiveQuizById = catchAsync(async (req, res) => {
  const { scheduleId } = req.params;

  const schedule = await scheduleService.deleteiveQuizById(scheduleId);

  if (schedule) {
    sendResponse(res, 201, true, "schedule delete successfully", schedule);
  } else {
    sendResponse(res, 400, false, "Failed to delete schedule", {});
  }
});

const scheduleController = {
  addSchedule,
  submitQuiz,
  getAllSchedule,
  getRunningLiveQuiz,
  getRunningQuestion,
  getAllQuestionByLiveId,
  getTotalScheduleQuiz,
  getMyResultView,
  getLeaderboardOfLastLiveQuiz,
  getSingleUserLeaderboardOfLastLiveQuiz,
  updateLiveQuiz,
  deleteiveQuizById,
};

module.exports = scheduleController;
