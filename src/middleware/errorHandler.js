export const errorHandler = (err, req, res, _next) => {
  req.log?.error({ err }, 'Unhandled error');
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message });
};
