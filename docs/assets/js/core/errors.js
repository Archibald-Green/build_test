import { t } from "./i18n.js";

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
    t("errors.unexpected"),
    {
      code: "UNEXPECTED_ERROR",
      cause: error,
    },
  );
}
