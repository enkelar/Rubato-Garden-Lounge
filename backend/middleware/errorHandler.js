export const errorHandler = (err, req, res, next) => {
  console.error(err);
  let status = err.status || 500;
  if (err.name === 'ValidationError' || err.name === 'CastError') status = 400;
  if (err.code === 11000) status = 409; // duplicate key
  res.status(status).json({ message: err.message || "Internal server error" });
};

export default errorHandler;