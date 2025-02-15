export function errorHandler(error, req, res, next) {
  // Set default status code
  const statusCode = error.statusCode || 500;

  // Create base response object
  const response = {
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
  };

  // Add additional error info if available
  if (error.solution) {
    response.solution = error.solution;
  }
  if (error.refreshLink) {
    response.refreshLink = error.refreshLink;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  // Log error for server-side debugging
  console.error(`[${response.timestamp}] ${statusCode} - ${error.message}`);
  if (error.stack) console.error(error.stack);

  // Ensure headers haven't been sent and send JSON response
  if (!res.headersSent) {
    res.status(statusCode).json(response);
  }
}
