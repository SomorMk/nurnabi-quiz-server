const Category = require("./category.model");
// const NodeCache = require("node-cache");

// const nodeCache = new NodeCache();

const addCategory = async (payload) => {
  const savedCategory = await Category.create(payload);
  // nodeCache.flushAll();
  return savedCategory;
};

const getAllCategory = async (payload) => {
  const getCategory = await Category.find({}).sort({ priority: -1 });
  // nodeCache.flushAll();
  return getCategory;
};

const getTotalCategoryQuiz = async (email, phone) => {
  const totalUserCount = await Category.countDocuments({});
  return totalUserCount;
};

const updateCategory = async (categoryId, payload) => {
  // console.log(categoryId, payload);
  const result = await Category.findByIdAndUpdate(categoryId, payload, {
    new: true,
  });

  // console.log({ result });
  // nodeCache.flushAll();
  return result;
};

const deleteCategoryById = async (categoryId) => {
  // console.log({ questionId });
  const res = await Category.findByIdAndDelete(categoryId);

  return res;
};

const categoryService = {
  addCategory,
  getAllCategory,
  getTotalCategoryQuiz,
  updateCategory,
  deleteCategoryById,
};

module.exports = categoryService;
