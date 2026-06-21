const Question = require("./question.model");
const NodeCache = require("node-cache");

const nodeCache = new NodeCache();

const addQuestion = async (payload) => {
  const savedQuestion = await Question.create(payload);
  nodeCache.flushAll();
  return savedQuestion;
};

const getAllQuestion = async () => {
  const allquestion = await Question.find({});
  return allquestion;
};

const getLiveQuestion = async () => {
  const levelQuestion = await Question.find({ model_type: "Schedule" });
  return levelQuestion;
};

const getLevelQuestion = async () => {
  const levelQuestion = await Question.find({ model_type: "Level" });
  return levelQuestion;
};

const getAllQuestionByLevelId = async (id) => {
  const getQuestion = await Question.find({
    model_id: id,
    model_type: { $ne: "Schedule" },
  });
  // nodeCache.flushAll();
  return getQuestion;
};
const getAllQuestionByLivelId = async (id) => {
  const questions = await Question.find({
    model_id: id,
    model_type: { $ne: "Level" },
  }).select("-correctAnswer");
  // nodeCache.flushAll();

  // console.log({ questions });
  return questions;
};

const getAllQuestionByLivelIdWithAnswer = async (id) => {
  const questions = await Question.find({
    model_id: id,
    model_type: { $ne: "Level" },
  });
  // nodeCache.flushAll();

  // console.log({ questions });
  return questions;
};

const totalQuestionCount = async () => {
  const scheduleCount = await Question.countDocuments({
    model_type: "Schedule",
  });
  const levelCount = await Question.countDocuments({ model_type: "Level" });
  // nodeCache.flushAll();
  return { scheduleCount, levelCount };
};

const getQuestionById = async (questionId) => {
  const question = await Question.findById(questionId);
  return question;
};

const updateQuestionById = async (questionId, data) => {
  console.log({ questionId, data });
  const res = await Question.findByIdAndUpdate(questionId, data);

  return res;
};

const deleteQuestionById = async (questionId) => {
  // First get the question data before deletion
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error("Question not found");
  }

  // Then delete the question
  const res = await Question.findByIdAndDelete(questionId);
  nodeCache.flushAll();

  return res;
};

const questionService = {
  addQuestion,
  getAllQuestion,
  getLevelQuestion,
  getLiveQuestion,
  getAllQuestionByLevelId,
  getAllQuestionByLivelId,
  getAllQuestionByLivelIdWithAnswer,
  totalQuestionCount,
  getQuestionById,
  updateQuestionById,
  deleteQuestionById,
};

module.exports = questionService;
