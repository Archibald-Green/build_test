import { AppError } from "./errors.js";
import { t } from "./i18n.js?v=20260612-multiple-choice";

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SUPPORTED_SCHEMA_VERSION = 1;
const SUPPORTED_QUESTION_TYPES = new Set([
  "single-choice",
  "multiple-choice",
]);
const SUPPORTED_SOCIAL_STYLES = new Set([
  "telegram",
  "whatsapp",
  "primary",
  "secondary",
]);
const SUPPORTED_WATERMARK_SIZES = new Set(["small", "medium", "large"]);

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

function isSafeExternalUrl(value) {
  if (!hasText(value)) {
    return false;
  }

  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function validateSocialBlock(socialBlock, issues) {
  if (socialBlock === undefined) {
    return;
  }

  if (!isRecord(socialBlock)) {
    issues.push(t("validation.socialBlockObject"));
    return;
  }

  if (typeof socialBlock.enabled !== "boolean") {
    issues.push(t("validation.socialEnabled"));
  }

  if (socialBlock.enabled && !hasText(socialBlock.title)) {
    issues.push(t("validation.socialTitle"));
  } else if (
    socialBlock.title !== undefined &&
    typeof socialBlock.title !== "string"
  ) {
    issues.push(t("validation.socialTitle"));
  }

  if (!Array.isArray(socialBlock.links)) {
    if (socialBlock.enabled) {
      issues.push(t("validation.socialLinks"));
    }
    return;
  }

  if (socialBlock.enabled && socialBlock.links.length === 0) {
    issues.push(t("validation.socialLinks"));
  }

  socialBlock.links.forEach((link, index) => {
    const path = `socialBlock.links[${index}]`;

    if (!isRecord(link)) {
      issues.push(t("validation.object", { path }));
      return;
    }
    if (!hasText(link.label)) {
      issues.push(t("validation.required", { path: `${path}.label` }));
    }
    if (!isSafeExternalUrl(link.url)) {
      issues.push(t("validation.socialUrl", { path }));
    }
    if (!SUPPORTED_SOCIAL_STYLES.has(link.style)) {
      issues.push(t("validation.socialStyle", { path }));
    }
  });
}

function validateWatermark(watermark, issues) {
  if (watermark === undefined) {
    return;
  }

  if (!isRecord(watermark)) {
    issues.push(t("validation.watermarkObject"));
    return;
  }

  if (typeof watermark.enabled !== "boolean") {
    issues.push(t("validation.watermarkEnabled"));
  }
  if (
    watermark.text !== undefined &&
    typeof watermark.text !== "string"
  ) {
    issues.push(t("validation.watermarkText"));
  }
  if (
    watermark.opacity !== undefined &&
    (typeof watermark.opacity !== "number" ||
      !Number.isFinite(watermark.opacity) ||
      watermark.opacity < 0 ||
      watermark.opacity > 1)
  ) {
    issues.push(t("validation.watermarkOpacity"));
  }
  if (
    watermark.size !== undefined &&
    !SUPPORTED_WATERMARK_SIZES.has(watermark.size)
  ) {
    issues.push(t("validation.watermarkSize"));
  }
}

function validateId(value, path, issues) {
  if (!hasText(value) || !ID_PATTERN.test(value)) {
    issues.push(t("validation.idFormat", { path }));
  }
}

function validateMedia(media, path, issues) {
  if (media === undefined) {
    return;
  }

  if (!isRecord(media)) {
    issues.push(t("validation.mediaObject", { path }));
    return;
  }

  if (media.image !== undefined) {
    if (!isRecord(media.image)) {
      issues.push(t("validation.imageObject", { path }));
    } else {
      if (!isSafeRelativePath(media.image.src)) {
        issues.push(t("validation.imagePath", { path }));
      }
      if (!hasText(media.image.alt)) {
        issues.push(t("validation.imageAlt", { path }));
      }
    }
  }

  if (media.audio !== undefined) {
    if (!isRecord(media.audio)) {
      issues.push(t("validation.audioObject", { path }));
    } else {
      if (!isSafeRelativePath(media.audio.src)) {
        issues.push(t("validation.audioPath", { path }));
      }
      if (
        media.audio.caption !== undefined &&
        typeof media.audio.caption !== "string"
      ) {
        issues.push(t("validation.audioCaption", { path }));
      }
    }
  }
}

function validateQuestion(question, path, seenQuestionIds, issues) {
  if (!isRecord(question)) {
    issues.push(t("validation.object", { path }));
    return;
  }

  validateId(question.id, `${path}.id`, issues);

  if (seenQuestionIds.has(question.id)) {
    issues.push(
      t("validation.duplicateQuestion", { path, id: question.id }),
    );
  }
  seenQuestionIds.add(question.id);

  if (!SUPPORTED_QUESTION_TYPES.has(question.type)) {
    issues.push(t("validation.questionType", { path }));
  }

  if (!hasText(question.prompt)) {
    issues.push(t("validation.required", { path: `${path}.prompt` }));
  }

  if (
    question.points !== undefined &&
    (typeof question.points !== "number" ||
      !Number.isFinite(question.points) ||
      question.points <= 0)
  ) {
    issues.push(t("validation.points", { path }));
  }

  validateMedia(question.media, `${path}.media`, issues);

  if (!Array.isArray(question.options) || question.options.length < 2) {
    issues.push(t("validation.options", { path }));
    return;
  }

  const optionIds = new Set();

  question.options.forEach((option, optionIndex) => {
    const optionPath = `${path}.options[${optionIndex}]`;

    if (!isRecord(option)) {
      issues.push(t("validation.object", { path: optionPath }));
      return;
    }

    validateId(option.id, `${optionPath}.id`, issues);
    if (optionIds.has(option.id)) {
      issues.push(
        t("validation.duplicateOption", {
          path: optionPath,
          id: option.id,
        }),
      );
    }
    optionIds.add(option.id);

    if (!hasText(option.text)) {
      issues.push(
        t("validation.required", { path: `${optionPath}.text` }),
      );
    }
  });

  if (!Array.isArray(question.correctOptionIds)) {
    issues.push(t("validation.correctOptionsArray", { path }));
  } else {
    if (
      question.type === "single-choice" &&
      question.correctOptionIds.length !== 1
    ) {
      issues.push(t("validation.correctOptionCountSingle", { path }));
    }
    if (
      question.type === "multiple-choice" &&
      question.correctOptionIds.length < 1
    ) {
      issues.push(t("validation.correctOptionCountMultiple", { path }));
    }
    if (
      new Set(question.correctOptionIds).size !==
      question.correctOptionIds.length
    ) {
      issues.push(t("validation.duplicateCorrectOption", { path }));
    }
    if (
      question.correctOptionIds.some((optionId) => !optionIds.has(optionId))
    ) {
      issues.push(t("validation.missingCorrectOption", { path }));
    }
  }

  if (!hasText(question.explanation)) {
    issues.push(
      t("validation.required", { path: `${path}.explanation` }),
    );
  }
}

function throwValidationError(resourceName, issues) {
  if (issues.length > 0) {
    throw new AppError(t("validation.failed", { resource: resourceName }), {
      code:
        resourceName === t("validation.catalogName")
          ? "CATALOG_SCHEMA_INVALID"
          : "TEST_SCHEMA_INVALID",
      details: issues,
    });
  }
}

export function validateCatalog(catalog) {
  const issues = [];

  if (!isRecord(catalog)) {
    throwValidationError(t("validation.catalogName"), [
      t("validation.catalogRootObject"),
    ]);
  }

  if (catalog.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    issues.push(
      t("validation.schemaVersion", { version: SUPPORTED_SCHEMA_VERSION }),
    );
  }

  if (!Array.isArray(catalog.tests)) {
    issues.push(t("validation.testsArray"));
    throwValidationError(t("validation.catalogName"), issues);
  }

  const seenIds = new Set();

  catalog.tests.forEach((test, index) => {
    const path = `tests[${index}]`;

    if (!isRecord(test)) {
      issues.push(t("validation.object", { path }));
      return;
    }

    validateId(test.id, `${path}.id`, issues);
    if (seenIds.has(test.id)) {
      issues.push(t("validation.duplicateTest", { path, id: test.id }));
    }
    seenIds.add(test.id);

    if (!hasText(test.title)) {
      issues.push(t("validation.required", { path: `${path}.title` }));
    }
    if (!hasText(test.description)) {
      issues.push(
        t("validation.required", { path: `${path}.description` }),
      );
    }
    if (!isSafeRelativePath(test.file)) {
      issues.push(t("validation.catalogFilePath", { path }));
    }
    if (
      test.published !== undefined &&
      typeof test.published !== "boolean"
    ) {
      issues.push(t("validation.publishedBoolean", { path }));
    }
  });

  throwValidationError(t("validation.catalogName"), issues);
  return catalog;
}

export function validateTest(test) {
  const issues = [];

  if (!isRecord(test)) {
    throwValidationError(t("validation.testName"), [
      t("validation.rootObject"),
    ]);
  }

  if (test.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    issues.push(
      t("validation.schemaVersion", { version: SUPPORTED_SCHEMA_VERSION }),
    );
  }

  validateId(test.id, "id", issues);

  if (
    typeof test.version !== "number" ||
    !Number.isInteger(test.version) ||
    test.version < 1
  ) {
    issues.push(t("validation.version"));
  }

  for (const field of ["title", "description", "language", "instructions"]) {
    if (!hasText(test[field])) {
      issues.push(t("validation.required", { path: field }));
    }
  }

  if (!Array.isArray(test.headerLinks)) {
    issues.push(t("validation.headerLinksArray"));
  } else {
    test.headerLinks.forEach((link, index) => {
      const path = `headerLinks[${index}]`;

      if (!isRecord(link)) {
        issues.push(t("validation.object", { path }));
        return;
      }
      if (!hasText(link.label)) {
        issues.push(t("validation.required", { path: `${path}.label` }));
      }
      if (!hasText(link.url)) {
        issues.push(t("validation.required", { path: `${path}.url` }));
      } else {
        try {
          const url = new URL(link.url, "https://example.invalid/");
          if (!["http:", "https:", "mailto:"].includes(url.protocol)) {
            issues.push(t("validation.unsupportedProtocol", { path }));
          }
        } catch {
          issues.push(t("validation.invalidUrl", { path }));
        }
      }
    });
  }

  validateSocialBlock(test.socialBlock, issues);
  validateWatermark(test.watermark, issues);

  if (!Array.isArray(test.sections) || test.sections.length === 0) {
    issues.push(t("validation.sections"));
    throwValidationError(t("validation.testName"), issues);
  }

  const seenSectionIds = new Set();
  const seenQuestionIds = new Set();

  test.sections.forEach((section, sectionIndex) => {
    const path = `sections[${sectionIndex}]`;

    if (!isRecord(section)) {
      issues.push(t("validation.object", { path }));
      return;
    }

    validateId(section.id, `${path}.id`, issues);
    if (seenSectionIds.has(section.id)) {
      issues.push(
        t("validation.duplicateSection", { path, id: section.id }),
      );
    }
    seenSectionIds.add(section.id);

    if (!hasText(section.title)) {
      issues.push(t("validation.required", { path: `${path}.title` }));
    }
    if (
      section.description !== undefined &&
      typeof section.description !== "string"
    ) {
      issues.push(t("validation.descriptionText", { path }));
    }

    if (!Array.isArray(section.questions) || section.questions.length === 0) {
      issues.push(t("validation.questions", { path }));
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

  throwValidationError(t("validation.testName"), issues);
  return test;
}
