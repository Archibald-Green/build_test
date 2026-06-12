export class AppError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = "AppError";
    this.code = options.code ?? "APP_ERROR";
    this.details = options.details ?? [];
  }
}

export function toAppError(error) {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError(
    "Something unexpected happened while preparing this page. Please try again.",
    {
      code: "UNEXPECTED_ERROR",
      cause: error,
    },
  );
}
