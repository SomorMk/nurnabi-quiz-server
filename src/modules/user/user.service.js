const mongoose = require("mongoose");
const User = require("./user.model.js");
const moment = require("moment");
const NodeCache = require("node-cache");

const nodeCache = new NodeCache();

const addUser = async (userBody) => {
  const { role, ...restData } = userBody;

  // console.log("Service............");
  console.log(restData);
  const user = new User(restData);
  const saveUser = await user.save();

  // nodeCache.flushAll();
  return saveUser;
};

const getAllUsers = async (page, limit) => {
  let users = await User.find({
    role: { $ne: "admin" },
    isDelete: "no",
  })
    .select("-password")
    .sort("-point");
  return users;
};

const getSingleUser = async (userId) => {
  const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);
  if (!isValidObjectId) {
    return null;
  }
  let user;
  if (nodeCache.has(`users${userId}`)) {
    user = JSON.parse(nodeCache.get(`users${userId}`));
  } else {
    user = await User.findById(userId).select("-password");
    // nodeCache.set(`users${userId}`, JSON.stringify(user));
  }

  return user;
};

const getSubmittedQuizsId = async (id) => {
  let user = await User.findById(
    id, // Filter condition (optional, if you want to filter by some conditions)
    {
      submitQuizLevelIds: 1,
    } // Projection to only include specified fields
  );

  return user;
};

const getUserLeaderboard = async () => {
  let user = await User.find(
    { isDelete: false }, // Filter condition (optional, if you want to filter by some conditions)
    {
      point: 1,
      strength: 1,
      image: 1,
      fullName: 1,
    } // Projection to only include specified fields
  ).sort({ point: -1 });

  return user;
};

const getSingleUserLeaderboard = async (id) => {
  let user = await User.aggregate([
    // Match all users to calculate ranks
    {
      $setWindowFields: {
        sortBy: { point: -1 }, // Sort by 'point' in descending order
        output: {
          rank: {
            $rank: {}, // Assign rank based on sorted points
          },
        },
      },
    },
    // Project the necessary fields
    {
      $project: {
        point: { $ifNull: ["$point", 0] },
        rank: 1, // Include rank in the result
        strength: { $ifNull: ["$strength", 0] },
        completeQuiz: { $ifNull: ["$completeQuiz", 0] },
        questionAnswer: { $ifNull: ["$questionAnswer", 0] },
        correctAnswer: { $ifNull: ["$correctAnswer", 0] },
        incorrectAnswer: { $ifNull: ["$incorrectAnswer", 0] },
        image: { $ifNull: ["$image", "/uploads/profile/default-user.jpg"] },
        fullName: { $ifNull: ["$fullName", ""] },
        phone: { $ifNull: ["$phone", ""] },
        email: { $ifNull: ["$email", ""] },
        role: { $ifNull: ["$role", ""] },
        address: { $ifNull: ["$address", ""] },
      },
    },
    // Match only the user with the specific id
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
  ]);

  return user?.[0];
};

const getSingleUserByEmailAndPhone = async (email) => {
  let user = await User.findOne({
    email,
  });

  return user;
};

const getUsersStatistics = async (query) => {
  const { year } = query;
  // console.log("query", query);

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  try {
    // Aggregate to get users within the specified date range
    const result = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          userAdd: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          userAdd: 1,
        },
      },
    ]);

    // Initialize an array with all 12 months set to 0 users added
    const months = moment.months();
    const statistics = months.map((month, index) => ({
      month: moment().month(index).format("MMM"),
      user: 0,
    }));

    // Update the statistics array based on the aggregation results
    result.forEach((item) => {
      const monthIndex = item.month - 1; // Convert month number to zero-based index
      statistics[monthIndex].user = item.userAdd;
    });

    return statistics;
  } catch (error) {
    console.error("Error retrieving users:", error);
    throw error;
  }
};

const getTotalUser = async (email, phone) => {
  const totalUserCount = await User.countDocuments({});
  return totalUserCount;
};

const updateUser = async (userId, userBody, levelId) => {
  const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);
  if (!isValidObjectId) {
    return null;
  }

  let payload = {
    ...userBody,
  };

  if (levelId) {
    payload = {
      ...userBody,
      $push: {
        submitQuizLevelIds: levelId,
      },
    };
  }

  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
  }).select("-password");
  nodeCache.flushAll();
  return user;
};

const changePassword = async (userId, password) => {
  const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);
  if (!isValidObjectId) {
    return null;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { password },
    {
      new: true,
    }
  );
  nodeCache.flushAll();
  return user;
};

const deleteUser = async (userId) => {
  const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);
  if (!isValidObjectId) {
    return null;
  }

  const user = await User.findOneAndUpdate(
    { _id: userId },
    { isDelete: "yes" },
    { new: true }
  );
  nodeCache.flushAll();
  // const user = await User.findByIdAndDelete(userId);
  return user;
};

const userService = {
  addUser,
  getAllUsers,
  getSingleUser,
  getSubmittedQuizsId,
  getUserLeaderboard,
  getSingleUserLeaderboard,
  getSingleUserByEmailAndPhone,
  getTotalUser,
  changePassword,
  updateUser,
  deleteUser,
  getUsersStatistics,
};

module.exports = userService;
