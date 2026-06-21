const express = require("express");

const settingsController = require("./setting.controller.js");
const auth = require("../../middlewares/auth.js");
const USER_ROLE = require("../../helpers/userRole.js");

const settingsRouter = express.Router();

settingsRouter
  .post(
    "",
    auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    settingsController.addSetting
  )
  .get("", settingsController.getAllSettings)
  .patch(
    "",
    auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    settingsController.updateSetting
  );

module.exports = settingsRouter;
