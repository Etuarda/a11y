export function errorHandler(error, request, response, next) {
  const statusCode = error.statusCode ?? 500;
  const message = statusCode >= 500 ? 'Internal server error.' : error.message;

  if (statusCode >= 500) {
    console.error(error);
  }

  return response.status(statusCode).json({
    error: {
      message,
      statusCode
    }
  });
}
