// Small helpers to keep API responses consistent across all controllers.

const success = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const failure = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// Strips the password field before sending a user object to the client.
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

module.exports = { success, failure, sanitizeUser };
