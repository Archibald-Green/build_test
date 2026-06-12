import { AppError } from "./errors.js";

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SUPPORTED_SCHEMA_VERSION = 1;
const SUPPORTED_QUESTION_TYPES = new Set(["single-choice"]);

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isSafeRelativePath(value) {
  if (!hasText(value)) {
    return false;
  }

  const normalized = value.replaceAll("\\", "/");
  const hasProtocol = /^[a-z][a-z\d+.-]*:/i.test(normalized);

  return (
    !hasProtocol &&
    !normalized.startsWith("/") &&
    !normalized.startsWith("//") &&
    !normalized.split("/").includes("..")
  );
}

function validateId(value, path, issues) {
  if (!hasText(value) || !ID_PATTERN.test(value)) {
    issues.push(
      `${path} must use lowercase letters, numbers, and single hyphens.`,
    );
  }
}

function validateMedia(media, path, issues) {
  if (media === undefined) {
    return;
  }

  if (!isRecord(media)) {
    issues.push(`${path} must be an object when provided.`);
    return;
  }

  if (media.image !== undefined) {
    if (!isRecord(media.image)) {
      issues.push(`${path}.image must be an object.`);
    } else {
      if (!isSafeRelativePath(media.image.src)) {
        issues.push(`${path}.image.src must be a safe relative path.`);
      }
      if (!hasText(media.image.alt)) {
        issues.push(`${path}.image.alt is required for accessibility.`);
      }
    }
  }

  if (media.audio !== undefined) {
    if (!isRecord(media.audio)) {
      issues.push(`${path}.audio must be an object.`);
    } else {
      if (!isSafeRelativePath(media.audio.src)) {
        issues.push(`${path}.audio.src must be a safe relative path.`);
      }
      if (
        media.audio.caption !== undefined &&
        typeof media.audio.caption !== "string"
      ) {
        issues.push(`${path}.audio.caption must be text when provided.`);
      }
    }
  }
}

function validateQuestion(question, path, seenQuestionIds, issues) {
  if (!isRecord(question)) {
    issues.push(`${path} must be an object.`);
    return;
  }

  validateId(question.id, `${path}.id`, issues);

  if (seenQuestionIds.has(question.id)) {
    issues.push(`${path}.id duplicates the question ID "${question.id}".`);
  }
  seenQuestionIds.add(question.id);

  if (!SUPPORTED_QUESTION_TYPES.has(question.type)) {
    issues.push(`${path}.type must be "single-choice" in schema version 1.`);
  }

  if (!hasText(question.prompt)) {
    issues.push(`${path}.prompt is required.`);
  }

  if (
    question.points !== undefined &&
    (typeof question.points !== "number" ||
      !Number.isFinite(question.points) ||
      question.points <= 0)
  ) {
    issues.push(`${path}.points must be a number greater than zero.`);
  }

  validateMedia(question.media, `${path}.media`, issues);

  if (!Array.isArray(question.options) || question.options.length < 2) {
    issues.push(`${path}.options must contain at least two options.`);
    return;
  }

  const optionIds = new Set();

  question.options.forEach((option, optionIndex) => {
    const optionPath = `${path}.options[${optionIndex}]`;

    if (!isRecord(option)) {
      issues.push(`${optionPath} must be an object.`);
      return;
    }

    validateId(option.id, `${optionPath}.id`, issues);
    if (optionIds.has(option.id)) {
      issues.push(`${optionPath}.id duplicates the option ID "${option.id}".`);
    }
    optionIds.add(option.id);

    if (!hasText(option.text)) {
      issues.push(`${optionPath}.text is required.`);
    }
  });

  if (
    !Array.isArray(question.correctOptionIds) ||
    question.correctOptionIds.length !== 1
  ) {
    issues.push(
      `${path}.correctOptionIds must contain exactly one option ID for a single-choice question.`,
    );
  } else if (!optionIds.has(question.correctOptionIds[0])) {
    issues.push(
      `${path}.correctOptionIds references an option that does not exist.`,
    );
  }

  if (!hasText(question.explanation)) {
    issues.push(`${path}.explanation is required.`);
  }
}

function throwValidationError(resourceName, issues) {
  if (issues.length > 0) {
    throw new AppError(`${resourceName} did not pass validation.`, {
      code:
        resourceName === "The test catalog"
          ? "CATALOG_SCHEMA_INVALID"
          : "TEST_SCHEMA_INVALID",
      details: issues,
    });
  }
}

export function validateCatalog(catalog) {
  const issues = [];

  if (!isRecord(catalog)) {
    throwValidationError("The test catalog", [
      "The catalog root must be an object.",
    ]);
  }

  if (catalog.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    issues.push(
      `schemaVersion must be ${SUPPORTED_SCHEMA_VERSION}.`,
    );
  }

  if (!Array.isArray(catalog.tests)) {
    issues.push("tests must be an array.");
    throwValidationError("The test catalog", issues);
  }

  const seenIds = new Set();

  catalog.tests.forEach((test, index) => {
    const path = `tests[${index}]`;

    if (!isRecord(test)) {
      issues.push(`${path} must be an object.`);
      return;
    }

    validateId(test.id, `${path}.id`, issues);
    if (seenIds.has(test.id)) {
      issues.push(`${path}.id duplicates the test ID "${test.id}".`);
    }
    seenIds.add(test.id);

    if (!hasText(test.title)) {
      issues.push(`${path}.title is required.`);
    }
    if (!hasText(test.description)) {
      issues.push(`${path}.description is required.`);
    }
    if (!isSafeRelativePath(test.file)) {
      issues.push(`${path}.file must be a safe path relative to index.json.`);
    }
    if (
      test.published !== undefined &&
      typeof test.published !== "boolean"
    ) {
      issues.push(`${path}.published must be true or false when provided.`);
    }
  });

  throwValidationError("The test catalog", issues);
  return catalog;
}

export function validateTest(test) {
  const issues = [];

  if (!isRecord(test)) {
    throwValidationError("The selected test", [
      "The test root must be an object.",
    ]);
  }

  if (test.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    issues.push(`schemaVersion must be ${SUPPORTED_SCHEMA_VERSION}.`);
  }

  validateId(test.id, "id", issues);

  if (
    typeof test.version !== "number" ||
    !Number.isInteger(test.version) ||
    test.version < 1
  ) {
    issues.push("version must be a positive integer.");
  }

  for (const field of ["title", "description", "language", "instructions"]) {
    if (!hasText(test[field])) {
      issues.push(`${field} is required.`);
    }
  }

  if (!Array.isArray(test.headerLinks)) {
    issues.push("headerLinks must be an array.");
  } else {
    test.headerLinks.forEach((link, index) => {
      const path = `headerLinks[${index}]`;

      if (!isRecord(link)) {
        issues.push(`${path} must be an object.`);
        return;
      }
      if (!hasText(link.label)) {
        issues.push(`${path}.label is required.`);
      }
      if (!hasText(link.url)) {
        issues.push(`${path}.url is required.`);
      } else {
        try {
          const url = new URL(link.url, "https://example.invalid/");
          if (!["http:", "https:", "mailto:"].includes(url.protocol)) {
            issues.push(`${path}.url uses an unsupported URL protocol.`);
          }
        } catch {
          issues.push(`${path}.url is not a valid URL.`);
        }
      }
    });
  }

  if (!Array.isArray(test.sections) || test.sections.length === 0) {
    issues.push("sections must contain at least one section.");
    throwValidationError("The selected test", issues);
  }

  const seenSectionIds = new Set();
  const seenQuestionIds = new Set();

  test.sections.forEach((section, sectionIndex) => {
    const path = `sections[${sectionIndex}]`;

    if (!isRecord(section)) {
      issues.push(`${path} must be an object.`);
      return;
    }

    validateId(section.id, `${path}.id`, issues);
    if (seenSectionIds.has(section.id)) {
      issues.push(`${path}.id duplicates the section ID "${section.id}".`);
    }
    seenSectionIds.add(section.id);

    if (!hasText(section.title)) {
      issues.push(`${path}.title is required.`);
    }
    if (
      section.description !== undefined &&
      typeof section.description !== "string"
    ) {
      issues.push(`${path}.description must be text when provided.`);
    }

    if (!Array.isArray(section.questions) || section.questions.length === 0) {
      issues.push(`${path}.questions must contain at least one question.`);
      return;
    }

    section.questions.forEach((question, questionIndex) => {
      validateQuestion(
        question,
        `${path}.questions[${questionIndex}]`,
        seenQuestionIds,
        issues,
      );
    });
  });

  throwValidationError("The selected test", issues);
  return test;
}
