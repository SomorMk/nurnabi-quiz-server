let mongoose = require("mongoose");
const app = require("./src/app");
const config = require("./src/config/index");

mongoose.connect(config.DB_URL).then(() => {
  console.log(`Database connection is successful 🛢`);
});

app.listen(config.port, () => {
  console.log(`App is running on port ${config.port}`);
  console.log(`App is running on http://${process.env.IP}:${process.env.PORT}`);
});
