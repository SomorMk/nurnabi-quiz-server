const { Schema, model } = require("mongoose");

const settingsSchema = new Schema(
  {
    privacyPolicy: {
      type: String,
      default: "",
    },
    aboutUs: {
      type: String,
      default: "",
    },
    support: {
      type: String,
      default: "",
    },
    termsOfService: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Settings = model("Settings", settingsSchema);
module.exports = Settings;
