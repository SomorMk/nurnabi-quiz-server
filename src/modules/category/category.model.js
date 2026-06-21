const { Schema, model } = require("mongoose");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category Name is required"],
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    priority: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["active", "deactive", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Category = model("Category", categorySchema);
module.exports = Category;
