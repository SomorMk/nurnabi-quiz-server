const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rootRouter = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const sendResponse = require("./shared/sendResponse");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// Enable CORS

app.use(express.static("src"));

app.use(
  cors({
    origin: "*",
    // origin: "https://admin.quiz.zettaversetechnologies.com",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    optionsSuccessStatus: 200,
  })
);

app.use("/api/v1", rootRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Quiz server is working! YaY!😀",
    status: 200,
    success: true,
  });
});

app.all("*", (req, res) => {
  sendResponse(res, 404, false, "No Route Found.", {});
});

app.use(errorHandler);

module.exports = app;
