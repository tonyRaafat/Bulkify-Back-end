export function throwError(errorInfo, statusCode = 400) {
  let error;

  if (typeof errorInfo === "string") {
    error = new Error(errorInfo);
    error.statusCode = statusCode;
  } else if (errorInfo instanceof Error) {
    error = errorInfo;
    error.statusCode = statusCode;
  } else {
    error = new Error(errorInfo.message);
    error.statusCode = errorInfo.status || statusCode;

    // Add additional error properties if they exist
    if (errorInfo.solution) error.solution = errorInfo.solution;
    if (errorInfo.refreshLink) error.refreshLink = errorInfo.refreshLink;
    if (errorInfo.code) error.code = errorInfo.code;
    if (errorInfo.data) error.data = errorInfo.data;
  }

  return error;
}
