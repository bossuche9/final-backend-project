const csrf = require("host-csrf");

const storeLocals = (req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  } else {
    res.locals.user = null;
  }
  res.locals.info = req.flash("info");
  res.locals.errors = req.flash("error");
  res.locals.csrfToken = csrf.getToken(req, res);
  next();
};

module.exports = storeLocals;
