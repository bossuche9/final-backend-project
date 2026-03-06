const parseValidationErrors = (e, req) => {
  const keys = Object.keys(e.errors);
  keys.forEach((key) => {
    req.flas("error", key + ":" + e.errors[key].properties.message);
  });
};

module.exports = parseValidationErrors;
