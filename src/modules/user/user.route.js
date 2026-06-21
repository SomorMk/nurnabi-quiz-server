const express = require("express");
const userController = require("./user.controller.js");
const auth = require("../../middlewares/auth.js");
const USER_ROLE = require("../../helpers/userRole.js");
const fileUpload = require("../../middlewares/fileUpload.js");

const upload = fileUpload("./src/uploads/profile/");

const userRouter = express.Router();

userRouter
  .post(
    "/signup",
    upload.fields([
      { name: "photo", maxCount: 5 },
      { name: "markshit", maxCount: 5 },
    ]),
    // upload.single("image"),
    userController.addUser
  )
  .post("/login", userController.login)
  .post("/forget-password", userController.forgetPassword)

  .get(
    "",
    auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    userController.getAllUsers
  )
  .get(
    "/submitted-quizs-id",
    auth.verifyRole(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    userController.getSubmittedQuizsId
  )
  .get("/leaderboard", userController.getUserLeaderboard)
  .get("/statistics", userController.usersStatistics)
  .get("/total-user", userController.getTotalUser)
  .get(
    "/my-profile",
    auth.verifyRole(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    userController.getMyData
  )
  .get("/:id", userController.getSingleUser)
  .get(
    "/leaderboard/login-user",
    auth.verifyRole(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    userController.getLoginUserLeaderboard
  )
  .get("/leaderboard/:id", userController.getSingleUserLeaderboard)

  .get("/user/logout/true", userController.logout)

  .patch("/reset-password", userController.resetPassword)
  .patch(
    "/change-password",
    auth.verifyRole(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    userController.changePassword
  )
  .patch("/otp-verfy/forget-password", userController.verifyForgetOtp)
  .put(
    "",
    upload.fields([{ name: "image", maxCount: 1 }]),
    auth.verifyRole(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    userController.updateUser
  )
  .delete(
    "",
    auth.verifyRole(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    userController.deleteUser
  );

module.exports = userRouter;
