const catchAsync = require("../../shared/catchAsync");
const sendResponse = require("../../shared/sendResponse");
const categoryService = require("./category.service");

const addCategory = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if (req.files) {
    if (req.files.image) {
      const image = req.files.image[0].filename;
      payload.image = `/uploads/category/${image}`;
    }
  }
  const category = await categoryService.addCategory(payload);

  if (category) {
    sendResponse(res, 201, true, "Category added successfully", category);
  } else {
    sendResponse(res, 400, false, "Failed to add category", {});
  }
});

const getAllCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getAllCategory();

  if (category) {
    sendResponse(res, 200, true, "Category get successfully", category);
  } else {
    sendResponse(res, 400, false, "Failed to get category", {});
  }
});

const getTotalCategoryQuiz = catchAsync(async (req, res) => {
  const schedule = await categoryService.getTotalCategoryQuiz();

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

const updateCategory = catchAsync(async (req, res) => {
  const payload = { ...req.body };

  const { categoryId } = req.params;
  if (req.files) {
    if (req.files.image) {
      const image = req.files.image[0].filename;
      payload.image = `/uploads/category/${image}`;
    }
  }

  // console.log({ categoryId });
  // console.log({ payload });

  const category = await categoryService.updateCategory(categoryId, payload);

  if (category) {
    sendResponse(res, 201, true, "Category update successfully", category);
  } else {
    sendResponse(res, 400, false, "Failed to add category", {});
  }
});

const deleteCategoryById = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  const category = await categoryService.deleteCategoryById(categoryId);

  if (category) {
    sendResponse(res, 201, true, "category delete successfully", category);
  } else {
    sendResponse(res, 400, false, "Failed to delete category", {});
  }
});

const categoryController = {
  addCategory,
  getAllCategory,
  getTotalCategoryQuiz,
  updateCategory,
  deleteCategoryById,
};

module.exports = categoryController;
