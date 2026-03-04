require("dotenv").config();
const express = require("express");

const passport = require("passport");
const passportInit = require("./passport/passportInit");

const app = express();

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));
