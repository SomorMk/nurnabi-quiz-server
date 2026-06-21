const NodeCache = require("node-cache");
const Level = require("./level.model.js");
const User = require("../user/user.model.js");
const { default: mongoose } = require("mongoose");

const nodeCache = new NodeCache();

const addLevel = async (payload) => {
  const savedLevel = await Level.create(payload);
  nodeCache.flushAll();
  return savedLevel;
};

const getAllLevelByCategoryId = async (userId, categoryId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  console.log("user");
  console.log({ categoryId });

  const levels = await Level.aggregate([
    {
      $match: {
        category: new mongoose.Types.ObjectId(categoryId),
      },
    },
    {
      $addFields: {
        isParticipate: {
          $in: [
            "$_id",
            user.submitQuizLevelIds.map(
              (id) => new mongoose.Types.ObjectId(id)
            ),
          ],
        },
      },
    },
    {
      $sort: {
        priority: -1,
      },
    },
  ]);

  console.log(levels);

  // console.log({ levels });

  //   // Perform aggregation on the `Level` collection
  // const levels = await Level.aggregate([
  //   {
  //     $match: {
  //       category: categoryId,
  //     },
  //   },
  // {
  //   $addFields: {
  //     isParticipate: {
  //       $in: ["$_id", user.submitQuizLevelIds], // Check if the level ID exists in the user's `submitQuizLevelIds`
  //     },
  //   },
  // },
  // {
  //   $addFields: {
  //     isParticipate: {
  //       $in: [ "$_id", user.submitQuizLevelIds.map(id => ObjectId(id)) ], // Convert to ObjectId if needed
  //     },
  //   },
  // },
  // ]);
  // nodeCache.flushAll();
  return levels;
};

const getSingleLeveById = async (levelId) => {
  const res = await Level.findById(levelId);

  return res;
};

const getAllLevel = async () => {
  // console.log({ object: categoryId });
  const getLevel = await Level.find({});
  // console.log({ getLevel });
  // nodeCache.flushAll();
  return getLevel;
};

const updateLevelById = async (levelId, payload) => {
  console.log({ levelId });
  const res = await Level.findByIdAndUpdate(
    levelId,
    payload, // Increment by 1
    { new: true } // Return the updated document
  );

  return res;
};

const updateNumberOfQuestions = async (levelId) => {
  console.log({ levelId });
  const res = await Level.findByIdAndUpdate(
    levelId,
    { $inc: { numberOfQuestion: 1 } }, // Increment by 1
    { new: true } // Return the updated document
  );

  return res;
};

const decreaseNumberOfQuestions = async (levelId) => {
  console.log({ levelId });

  // Get current level data
  const currentLevel = await Level.findById(levelId).select("numberOfQuestion");
  if (!currentLevel) {
    throw new Error("Level not found");
  }

  const currentCount = currentLevel.numberOfQuestion || 0;
  const newCount = Math.max(0, currentCount - 1); // Ensure it doesn't go below 0

  const res = await Level.findByIdAndUpdate(
    levelId,
    { numberOfQuestion: newCount },
    { new: true } // Return the updated document
  );

  return res;
};

const updateLevel = async (levelId, payload) => {
  const result = await Level.findByIdAndUpdate(levelId, payload, {
    new: true,
  });
  // nodeCache.flushAll();
  return result;
};

const updateAllLevelsQuestionCount = async () => {
  const Question = require("../question/question.model");

  try {
    // Get all active levels
    const levels = await Level.find({ status: "active" });

    const updatePromises = levels.map(async (level) => {
      // Count active questions for this level
      const questionCount = await Question.countDocuments({
        model_id: level._id,
        model_type: "Level",
        status: "active",
      });

      // Update the level's numberOfQuestion field
      return Level.findByIdAndUpdate(
        level._id,
        { numberOfQuestion: questionCount },
        { new: true }
      );
    });

    // Execute all updates in parallel
    const updatedLevels = await Promise.all(updatePromises);

    // Clear cache after updates
    nodeCache.flushAll();

    return {
      success: true,
      message: `Updated ${updatedLevels.length} levels`,
      updatedCount: updatedLevels.length,
    };
  } catch (error) {
    throw new Error(`Failed to update levels: ${error.message}`);
  }
};

const deleteLevelById = async (levelId) => {
  // console.log({ questionId });
  const res = await Level.findByIdAndDelete(levelId);

  return res;
};

const levelService = {
  addLevel,
  getAllLevelByCategoryId,
  getSingleLeveById,
  getAllLevel,
  updateLevelById,
  updateNumberOfQuestions,
  decreaseNumberOfQuestions,
  updateLevel,
  updateAllLevelsQuestionCount,
  deleteLevelById,
};

module.exports = levelService;
