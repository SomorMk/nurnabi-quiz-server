const Settings = require("./setting.model");

// Function to add settings if none exist or return the existing settings
const addSettings = async (data) => {
  const existingSettings = await Settings.findOne({});
  if (existingSettings) {
    return existingSettings;
  } else {
    const result = await Settings.create(data);
    return result;
  }
};

const getSettings = async (title) => {
  //  console.log(title);
  const settings = await Settings.findOne().select(title);

  if (title) {
    return settings;
  } else {
    return settings;
  }
};

// Function to update settings without needing an ID
const updateSettings = async (settingsBody) => {
  // Find the existing settings document
  // const settings = await Settings.findByIdAndUpdate(
  //   "66c2b5884fb4d10694e1e0dd",
  //   settingsBody,
  //   {
  //     new: true,
  //   }
  // );
  //  console.log({ settingsBody });

  const settings = await Settings.findOneAndUpdate({}, settingsBody, {
    new: true,
  });
  return settings;
};

const settingsService = {
  addSettings,
  updateSettings,
  getSettings,
};

module.exports = settingsService;
