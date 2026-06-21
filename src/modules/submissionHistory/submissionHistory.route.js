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
    // auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    upload.fields([{ name: "image", maxCount: 1 }]),
    scheduleController.addSchedule
  )
  .get("", scheduleController.getAllSchedule);

module.exports = scheduleRouter;
