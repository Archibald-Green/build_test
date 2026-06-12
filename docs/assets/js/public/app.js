import { toAppError, AppError } from "../core/errors.js";
import { fetchJson } from "../core/fetch-json.js";
import {
  loadSavedLocale,
  setLocale,
  t,
  translateDocument,
} from "../core/i18n.js?v=20260612-multiple-choice";
import {
  validateCatalog,
  validateTest,
} from "../core/test-validator.js?v=20260612-multiple-choice";
import { renderCatalog } from "./catalog-view.js";
import { initializeLanguageSwitcher } from "./language-switcher.js";
import { renderTestRunner } from "./test-runner-view.js?v=20260612-multiple-choice";

const app = document.querySelector("#app");
const catalogUrl = new URL("../../../content/tests/index.json", import.meta.url);

let rerenderCurrentView = () => {};

setLocale(loadSavedLocale());
translateDocument();
initializeLanguageSwitcher(() => rerenderCurrentView());

function renderError(error) {
  const appError = toAppError(error);
  const errorKey = [
    "CATALOG_NOT_FOUND",
    "CATALOG_INVALID_JSON",
    "MISSING_TEST_ID",
    "TEST_NOT_FOUND",
    "TEST_FILE_NOT_FOUND",
    "TEST_INVALID_JSON",
    "CATALOG_SCHEMA_INVALID",
    "TEST_SCHEMA_INVALID",
  ].includes(appError.code)
    ? appError.code
    : "fallback";

  app.replaceChildren();
  app.classList.remove("app--runner");
  app.setAttribute("aria-busy", "false");

  const panel = document.createElement("section");
  panel.className = "error-panel";
  panel.setAttribute("role", "alert");
  panel.setAttribute("aria-labelledby", "error-title");
  panel.setAttribute("aria-describedby", "error-message");

  const icon = document.createElement("span");
  icon.className = "error-panel__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "!";

  const content = document.createElement("div");

  const label = document.createElement("p");
  label.className = "error-panel__label";
  label.textContent = t(`errors.${errorKey}.label`);

  const title = document.createElement("h1");
  title.id = "error-title";
  title.tabIndex = -1;
  title.textContent = t(`errors.${errorKey}.title`);

  const message = document.createElement("p");
  message.id = "error-message";
  message.className = "error-panel__message";
  message.textContent = appError.message;

  const action = document.createElement("a");
  action.className = "error-panel__action";
  action.href =
    appError.code === "CATALOG_NOT_FOUND" ||
    appError.code === "CATALOG_INVALID_JSON"
      ? window.location.href
      : "./";
  action.textContent = t(`errors.${errorKey}.action`);

  content.append(label, title, message);

  if (appError.details.length > 0) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = t("errors.technicalDetails");

    const list = document.createElement("ul");
    appError.details.forEach((detail) => {
      const item = document.createElement("li");
      item.textContent = detail;
      list.append(item);
    });

    details.append(summary, list);
    content.append(details);
  }

  content.append(action);
  panel.append(icon, content);
  app.append(panel);
  title.focus();

  console.error(appError);
  rerenderCurrentView = () => initialize();
}

function getRequestedTestId() {
  const params = new URLSearchParams(window.location.search);

  if (!params.has("test")) {
    return null;
  }

  const testId = params.get("test")?.trim();

  if (!testId) {
    throw new AppError(
      t("errors.missingTestId"),
      { code: "MISSING_TEST_ID" },
    );
  }

  return testId;
}

async function loadSelectedTest(catalog, testId) {
  const catalogEntry = catalog.tests.find(
    (test) => test.id === testId && test.published !== false,
  );

  if (!catalogEntry) {
    throw new AppError(
      t("errors.testNotFound", { testId }),
      { code: "TEST_NOT_FOUND" },
    );
  }

  const testUrl = new URL(catalogEntry.file, catalogUrl);
  const test = validateTest(
    await fetchJson(testUrl, {
      resourceName: t("resources.test", { title: catalogEntry.title }),
      notFoundCode: "TEST_FILE_NOT_FOUND",
      invalidJsonCode: "TEST_INVALID_JSON",
    }),
  );

  if (test.id !== catalogEntry.id) {
    throw new AppError(t("errors.testMismatch"), {
      code: "TEST_SCHEMA_INVALID",
      details: [
        t("errors.catalogId", { id: catalogEntry.id }),
        t("errors.testFileId", { id: test.id }),
      ],
    });
  }

  document.title = `${test.title} | OpenTest`;
  const controller = renderTestRunner(app, test, testUrl);
  rerenderCurrentView = () => {
    document.title = `${test.title} | OpenTest`;
    controller.rerender();
  };
}

async function initialize() {
  try {
    const catalog = validateCatalog(
      await fetchJson(catalogUrl, {
        resourceName: t("resources.catalog"),
        notFoundCode: "CATALOG_NOT_FOUND",
        invalidJsonCode: "CATALOG_INVALID_JSON",
      }),
    );
    const requestedTestId = getRequestedTestId();

    if (requestedTestId) {
      await loadSelectedTest(catalog, requestedTestId);
      return;
    }

    document.title = t("meta.catalogTitle");
    renderCatalog(app, catalog);
    rerenderCurrentView = () => {
      document.title = t("meta.catalogTitle");
      renderCatalog(app, catalog);
    };
  } catch (error) {
    renderError(error);
  }
}

initialize();
