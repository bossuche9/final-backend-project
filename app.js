require("dotenv").config();
const express = require("express");
const app = express();

const connectDB = require("./db/connect");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const connectFlash = require("connect-flash");
const passportInit = require("./passport/passportinit");

const notFoundMiddleware = require("./middleware/not-found");
const storeLocals = require("./middleware/storeLocals");

//security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

//routes
const sessionRoutes = require("./routes/sessionRoutes");

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

//error handler
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

//middleware
app.use(notFoundMiddleware);

const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "stricit" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));
app.use(connectFlash);

passportInit();
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());
app.use(cors());
app.use(xss());

app.use(storeLocals);

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/sessions", sessionRoutes);
app.use("/exercises", auth, exerciseRouter);

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
