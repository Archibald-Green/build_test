import { toAppError, AppError } from "../core/errors.js";
import { fetchJson } from "../core/fetch-json.js";
import { validateCatalog, validateTest } from "../core/test-validator.js";
import { renderCatalog } from "./catalog-view.js";
import { renderTestRunner } from "./test-runner-view.js";

const app = document.querySelector("#app");
const catalogUrl = new URL("../../../content/tests/index.json", import.meta.url);

const ERROR_PRESENTATION = {
  CATALOG_NOT_FOUND: {
    label: "Catalog missing",
    title: "The test catalog could not be found",
    action: "Try loading the catalog again",
  },
  CATALOG_INVALID_JSON: {
    label: "Catalog error",
    title: "The test catalog contains invalid JSON",
    action: "Try loading the catalog again",
  },
  MISSING_TEST_ID: {
    label: "Test ID missing",
    title: "No test ID was provided",
    action: "Choose a test from the catalog",
  },
  TEST_NOT_FOUND: {
    label: "Not found",
    title: "That test is not available",
    action: "Return to test catalog",
  },
  TEST_FILE_NOT_FOUND: {
    label: "Test file missing",
    title: "The selected test file could not be found",
    action: "Return to test catalog",
  },
  TEST_INVALID_JSON: {
    label: "Test file error",
    title: "The selected test contains invalid JSON",
    action: "Return to test catalog",
  },
  CATALOG_SCHEMA_INVALID: {
    label: "Catalog validation error",
    title: "The test catalog has an invalid structure",
    action: "Try loading the catalog again",
  },
  TEST_SCHEMA_INVALID: {
    label: "Test validation error",
    title: "The selected test has an invalid structure",
    action: "Return to test catalog",
  },
};

function renderError(error) {
  const appError = toAppError(error);
  const presentation = ERROR_PRESENTATION[appError.code] ?? {
    label: "Unable to load",
    title: "This page could not be prepared",
    action: "Return to test catalog",
  };

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
  label.textContent = presentation.label;

  const title = document.createElement("h1");
  title.id = "error-title";
  title.tabIndex = -1;
  title.textContent = presentation.title;

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
  action.textContent = presentation.action;

  content.append(label, title, message);

  if (appError.details.length > 0) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "Technical details";

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
}

function getRequestedTestId() {
  const params = new URLSearchParams(window.location.search);

  if (!params.has("test")) {
    return null;
  }

  const testId = params.get("test")?.trim();

  if (!testId) {
    throw new AppError(
      "Add a test ID after ?test= or choose a published test from the catalog.",
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
      `No published test with the ID "${testId}" exists in this catalog.`,
      { code: "TEST_NOT_FOUND" },
    );
  }

  const testUrl = new URL(catalogEntry.file, catalogUrl);
  const test = validateTest(
    await fetchJson(testUrl, {
      resourceName: `Test "${catalogEntry.title}"`,
      notFoundCode: "TEST_FILE_NOT_FOUND",
      invalidJsonCode: "TEST_INVALID_JSON",
    }),
  );

  if (test.id !== catalogEntry.id) {
    throw new AppError("The selected test does not match its catalog entry.", {
      code: "TEST_SCHEMA_INVALID",
      details: [
        `Catalog ID: ${catalogEntry.id}`,
        `Test file ID: ${test.id}`,
      ],
    });
  }

  document.title = `${test.title} | OpenTest`;
  renderTestRunner(app, test, testUrl);
}

async function initialize() {
  try {
    const catalog = validateCatalog(
      await fetchJson(catalogUrl, {
        resourceName: "The test catalog",
        notFoundCode: "CATALOG_NOT_FOUND",
        invalidJsonCode: "CATALOG_INVALID_JSON",
      }),
    );
    const requestedTestId = getRequestedTestId();

    if (requestedTestId) {
      await loadSelectedTest(catalog, requestedTestId);
      return;
    }

    document.title = "Available Tests | OpenTest";
    renderCatalog(app, catalog);
  } catch (error) {
    renderError(error);
  }
}

initialize();
