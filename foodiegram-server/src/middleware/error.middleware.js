// Centralized error handling. asyncHandler forwards thrown errors here
// via next(err), so every controller can just `throw new Error(...)`.

const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // If status was already set (e.g. res.status(401)) use it, else 500
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server Error";

  // Prisma unique constraint violation (e.g. duplicate email/username)
  if (err.code === "P2002") {
    statusCode = 409;
    const field = err.meta?.target?.[0] || "field";
    message = `A record with that ${field} already exists`;
  }

  // Prisma "record not found" on update/delete
  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
