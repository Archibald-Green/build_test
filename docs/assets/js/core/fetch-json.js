import { AppError } from "./errors.js";
import { t } from "./i18n.js";

export async function fetchJson(url, options = {}) {
  const settings =
    typeof options === "string" ? { resourceName: options } : options;
  const {
    resourceName = t("resources.json"),
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
      t("errors.network", { resource: resourceName }),
      {
        code: "NETWORK_ERROR",
        cause: error,
        details: [t("errors.requestedUrl", { url })],
      },
    );
  }

  if (!response.ok) {
    const message =
      response.status === 404
        ? t("errors.notFound", { resource: resourceName })
        : t("errors.http", {
            resource: resourceName,
            status: response.status,
          });

    throw new AppError(message, {
      code: response.status === 404 ? notFoundCode : "HTTP_ERROR",
      details: [
        t("errors.httpStatus", { status: response.status }),
        t("errors.requestedUrl", { url: response.url || url }),
      ],
    });
  }

  try {
    return await response.json();
  } catch (error) {
    throw new AppError(t("errors.malformedJson", { resource: resourceName }), {
      code: invalidJsonCode,
      cause: error,
      details: [t("errors.requestedUrl", { url: response.url || url })],
    });
  }
}
