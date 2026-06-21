const express = require("express");
const scheduleController = require("./schedule.controller.js");
const USER_ROLE = require("../../helpers/userRole.js");
const auth = require("../../middlewares/auth.js");
const fileUpload = require("../../middlewares/fileUpload.js");

const upload = fileUpload("./src/uploads/schedule/");
const scheduleRouter = express.Router();

scheduleRouter
  .post(
    "",
    auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    upload.fields([{ name: "image", maxCount: 1 }]),
    scheduleController.addSchedule
  )
  .post(
    "/submit",
    auth.verifyRole(USER_ROLE.USER),
    scheduleController.submitQuiz
  )
  .get(
    "",
    auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    scheduleController.getAllSchedule
  )
  .get(
    "/total-schedule-quiz",
    // auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    scheduleController.getTotalScheduleQuiz
  )
  .get("/running", scheduleController.getRunningLiveQuiz)
  .get(
    "/running/questions",
    auth.verifyRole(USER_ROLE.USER),
    scheduleController.getRunningQuestion
  )
  .get(
    "/running/my-result",
    auth.verifyRole(USER_ROLE.USER),
    scheduleController.getMyResultView
  )
  .get(
    "/running/leaderboard",
    auth.verifyRole(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    scheduleController.getLeaderboardOfLastLiveQuiz
  )
  .get(
    "/running/leaderboard/:userId",
    auth.verifyRole(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    scheduleController.getSingleUserLeaderboardOfLastLiveQuiz
  )
  .patch(
    "/:scheduleId",
    upload.fields([{ name: "image", maxCount: 1 }]),
    auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    scheduleController.updateLiveQuiz
  )
  .delete(
    "/:scheduleId",
    auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    scheduleController.deleteiveQuizById
  );

module.exports = scheduleRouter;
