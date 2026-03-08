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
const errorHandlerMiddleware = require("./middleware/error-handler");
const storeLocals = require("./middleware/storeLocals");
const auth = require("./middleware/auths");

//security packages
const helmet = require("helmet");
const xssMiddleware = require("./middleware/xss");
const csrf = require("host-csrf");
const rateLimiter = require("express-rate-limit");

const cookieParser = require("cookie-parser");
app.use(cookieParser(process.env.SESSION_SECRET));
const csrfMiddleware = csrf.csrf();

//routes
const sessionRoutes = require("./routes/sessionRoutes");
const exerciseRouter = require("./routes/exercises");

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

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
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

app.use(session(sessionParms));
app.use(connectFlash());

app.use(csrfMiddleware);

passportInit();
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());
app.use(xssMiddleware);

app.use(storeLocals);

//home page route to index
app.get("/", (req, res) => {
  res.render("index");
});

app.use("/sessions", sessionRoutes);
app.use("/exercises", auth, exerciseRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

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
