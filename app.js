require("dotenv").config();
const express = require("express");
const app = express();

const connectDB = require("./db/connect");

const passport = require("passport");
//const passportInit = require("./passport/passportInit");

const notFoundMiddleware = require("./middleware/not-found");

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

//routes

//error handler
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

//middleware
app.use(notFoundMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
