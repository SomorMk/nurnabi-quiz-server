const express = require("express");
const levelController = require("./level.controller.js");
const fileUpload = require("../../middlewares/fileUpload.js");
const auth = require("../../middlewares/auth.js");
const USER_ROLE = require("../../helpers/userRole.js");

const upload = fileUpload("./src/uploads/level/");

const levelRouter = express.Router();

levelRouter
  .post(
    "",
    // auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    upload.fields([{ name: "image", maxCount: 1 }]),
    levelController.addLevel
  )
  .post(
    "/:levelId",
    upload.fields([{ name: "image", maxCount: 3 }]),
    levelController.updateLevel
  )
  .post(
    "/submit/:id",
    auth.verifyRole(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    levelController.submitQuiz
  )
  .get("", levelController.getAllLevel)
  .get(
    "/:categoryId",
    auth.verifyRole(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    levelController.getAllLevelByCategoryId
  )
  .get(
    "/result/:levelId",
    auth.verifyRole(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    levelController.getResultViewByLevelId
  )
  .get("/app/:categoryId", levelController.getAllLevelByCategoryId)
  .patch(
    "/update-question-counts",
    // auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    levelController.updateAllLevelsQuestionCount
  )
  .delete(
    "/:levelId",
    auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    levelController.deleteLevelById
  );
module.exports = levelRouter;
