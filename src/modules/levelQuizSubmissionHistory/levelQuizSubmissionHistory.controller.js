const catchAsync = require("../../shared/catchAsync");
const sendResponse = require("../../shared/sendResponse");
const scheduleService = require("./submissionHistory.service");

const addSchedule = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if (req.files) {
    if (req.files.image) {
      const image = req.files.image[0].filename;
      payload.image = `/uploads/schedule/${image}`;
    }
  }

  console.log(payload);

  const schedule = await scheduleService.addSchedule(payload);

  if (schedule) {
    sendResponse(res, 201, true, "Schedule added successfully", schedule);
  } else {
    sendResponse(res, 400, false, "Failed to add schedule", {});
  }
});

const getAllSchedule = catchAsync(async (req, res) => {
  const schedule = await scheduleService.getAllSchedule();

  if (schedule) {
    sendResponse(res, 200, true, "Schedule get successfully", schedule);
  } else {
    sendResponse(res, 400, false, "Failed to get schedule", {});
  }
});

const scheduleController = {
  addSchedule,
  getAllSchedule,
};

module.exports = scheduleController;
