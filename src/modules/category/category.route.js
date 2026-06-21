const express = require("express");
const categoryController = require("./category.controller.js");
const USER_ROLE = require("../../helpers/userRole");
const auth = require("../../middlewares/auth");
const fileUpload = require("../../middlewares/fileUpload");

const upload = fileUpload("./src/uploads/category/");
const categoryRouter = express.Router();

categoryRouter
  .post(
    "",
    // auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    upload.fields([{ name: "image", maxCount: 1 }]),
    categoryController.addCategory
  )
  .get("", categoryController.getAllCategory)
  .get("/total-category-quiz", categoryController.getTotalCategoryQuiz)
  .patch(
    "/:categoryId",
    upload.fields([{ name: "image", maxCount: 1 }]),
    categoryController.updateCategory
  )
  .delete(
    "/:categoryId",
    auth.verifyRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    categoryController.deleteCategoryById
  );

module.exports = categoryRouter;
