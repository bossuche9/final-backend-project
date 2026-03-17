const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "Something went wrong. Please try again later."
      : err.message;
  return res.status(statusCode).send(message);
};

module.exports = errorHandlerMiddleware;
