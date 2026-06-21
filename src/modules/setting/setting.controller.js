const catchAsync = require("../../shared/catchAsync");
const sendResponse = require("../../shared/sendResponse");
const settingsService = require("./setting.service");

const addSetting = catchAsync(async (req, res) => {
  const settingData = {
    privacyPolicy: "<p>Quiz Website. Privacy Policy</p>",
    aboutUs: "<p>Quiz Website. About Us</p>",
    support: "<p>Quiz Website. support</p>",
    termsOfService: "<p>Quiz Website. Terms Of Service</p>",
  };

  const setting = await settingsService.addSettings(settingData);
  if (setting) {
    sendResponse(res, 200, true, "Setting added successfully", setting);
  } else {
    sendResponse(res, 400, false, "Failed to add setting", {});
  }
});

const getAllSettings = catchAsync(async (req, res) => {
  const { title } = req.query;
  const settings = await settingsService.getSettings(title);
  if (settings) {
    sendResponse(res, 200, true, "Settings Found", settings);
  } else {
    sendResponse(res, 404, false, "No settings found", {});
  }
});

const updateSetting = catchAsync(async (req, res) => {
  //   const { id } = req.params;
  const settingData = { ...req.body };
  const setting = await settingsService.updateSettings(settingData);
  if (setting) {
    sendResponse(res, 200, true, "Setting Update successfully", setting);
  } else {
    sendResponse(res, 404, false, "Something went wrong", {});
  }
});

const settingsController = {
  addSetting,
  getAllSettings,
  updateSetting,
};

module.exports = settingsController;
