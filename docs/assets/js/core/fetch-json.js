import { AppError } from "./errors.js";

export async function fetchJson(url, options = {}) {
  const settings =
    typeof options === "string" ? { resourceName: options } : options;
  const {
    resourceName = "JSON resource",
    notFoundCode = "RESOURCE_NOT_FOUND",
    invalidJsonCode = "INVALID_JSON",
  } = settings;
  let response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    throw new AppError(
      `${resourceName} could not be reached. Check your connection and try again.`,
      {
        code: "NETWORK_ERROR",
        cause: error,
        details: [`Requested URL: ${url}`],
      },
    );
  }

  if (!response.ok) {
    const message =
      response.status === 404
        ? `${resourceName} was not found.`
        : `${resourceName} could not be loaded (HTTP ${response.status}).`;

    throw new AppError(message, {
      code: response.status === 404 ? notFoundCode : "HTTP_ERROR",
      details: [
        `HTTP status: ${response.status}`,
        `Requested URL: ${response.url || url}`,
      ],
    });
  }

  try {
    return await response.json();
  } catch (error) {
    throw new AppError(`${resourceName} contains malformed JSON.`, {
      code: invalidJsonCode,
      cause: error,
      details: [`Requested URL: ${response.url || url}`],
    });
  }
}
