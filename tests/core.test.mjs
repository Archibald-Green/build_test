import assert from "node:assert/strict";
import test from "node:test";

import { getLocale, setLocale, t, tn } from "../docs/assets/js/core/i18n.js";
import { calculateAttemptProgress } from "../docs/assets/js/core/attempt-progress.js";
import {
  normalizeQuestionAnswer,
  optionSetsMatch,
  toOptionIdArray,
} from "../docs/assets/js/core/answers.js";
import { createQuestionFlow } from "../docs/assets/js/core/question-flow.js";
import { calculateResult } from "../docs/assets/js/core/scoring.js";
import {
  validateCatalog,
  validateTest,
} from "../docs/assets/js/core/test-validator.js";
import {
  DEFAULT_WATERMARK,
  resolveWatermark,
} from "../docs/assets/js/core/watermark.js";

function createTest() {
  return {
    schemaVersion: 1,
    id: "dynamic-test",
    version: 1,
    title: "Dynamic test",
    description: "A validation fixture.",
    language: "en",
    instructions: "Choose one answer.",
    headerLinks: [],
    sections: [
      {
        id: "first",
        title: "First section",
        questions: [
          {
            id: "first-1",
            type: "single-choice",
            prompt: "First question",
            options: [
              { id: "a", text: "A" },
              { id: "b", text: "B" },
            ],
            correctOptionIds: ["a"],
            explanation: "A is correct.",
          },
        ],
      },
      {
        id: "second",
        title: "Second section",
        questions: [
          {
            id: "second-1",
            type: "single-choice",
            prompt: "Second question",
            points: 2,
            options: [
              { id: "a", text: "A" },
              { id: "b", text: "B" },
            ],
            correctOptionIds: ["b"],
            explanation: "B is correct.",
          },
          {
            id: "second-2",
            type: "multiple-choice",
            prompt: "Third question",
            options: [
              { id: "a", text: "A" },
              { id: "b", text: "B" },
              { id: "c", text: "C" },
            ],
            correctOptionIds: ["a", "c"],
            explanation: "A and C are correct.",
          },
        ],
      },
    ],
  };
}

test("validates safe catalog and test fixtures", () => {
  const catalog = {
    schemaVersion: 1,
    tests: [
      {
        id: "dynamic-test",
        title: "Dynamic test",
        description: "Fixture",
        file: "dynamic-test/test.json",
        published: true,
      },
    ],
  };

  assert.equal(validateCatalog(catalog), catalog);
  assert.equal(validateTest(createTest()).id, "dynamic-test");
});

test("validates optional catalog social blocks and link styles", () => {
  const catalog = {
    schemaVersion: 1,
    socialBlock: {
      enabled: true,
      title: "More tests",
      links: [
        {
          label: "Telegram",
          url: "https://example.com/channel",
          style: "telegram",
        },
        {
          label: "Default style",
          url: "https://example.com/more",
        },
      ],
    },
    tests: [],
  };

  assert.equal(validateCatalog(catalog), catalog);

  const olderCatalog = {
    schemaVersion: 1,
    tests: [],
  };
  assert.equal(validateCatalog(olderCatalog), olderCatalog);

  catalog.socialBlock.links[0].url = "javascript:alert(1)";
  assert.throws(() => validateCatalog(catalog), {
    code: "CATALOG_SCHEMA_INVALID",
  });
});

test("rejects unsafe media paths", () => {
  const fixture = createTest();
  fixture.sections[0].questions[0].media = {
    image: {
      src: "/content/private.png",
      alt: "Unsafe fixture",
    },
  };

  assert.throws(() => validateTest(fixture), {
    code: "TEST_SCHEMA_INVALID",
  });
});

test("supports Russian, Kazakh, and English interface dictionaries", () => {
  setLocale("ru");

  assert.equal(getLocale(), "ru");
  assert.equal(t("runner.next"), "Далее");
  assert.equal(tn("catalog.question", 1), "1 вопрос");
  assert.equal(tn("catalog.question", 2), "2 вопроса");
  assert.equal(tn("catalog.question", 5), "5 вопросов");

  setLocale("kk");
  assert.equal(t("runner.next"), "Келесі");
  assert.equal(tn("catalog.question", 5), "5 сұрақ");

  setLocale("en");
  assert.equal(t("runner.next"), "Next");
  assert.equal(tn("catalog.question", 1), "1 question");
  assert.equal(tn("catalog.question", 5), "5 questions");

  setLocale("ru");
});

test("validates optional social blocks without breaking older tests", () => {
  const olderFixture = createTest();
  assert.equal(validateTest(olderFixture), olderFixture);

  const socialFixture = createTest();
  socialFixture.socialBlock = {
    enabled: true,
    title: "More tests",
    links: [
      {
        label: "Telegram",
        url: "https://example.com/channel",
        style: "telegram",
      },
      {
        label: "WhatsApp",
        url: "https://example.com/chat",
        style: "whatsapp",
      },
    ],
  };
  assert.equal(validateTest(socialFixture), socialFixture);

  socialFixture.socialBlock.links[0].url = "javascript:alert(1)";
  assert.throws(() => validateTest(socialFixture), {
    code: "TEST_SCHEMA_INVALID",
  });
});

test("validates optional watermark settings without breaking older tests", () => {
  const olderFixture = createTest();
  assert.equal(validateTest(olderFixture), olderFixture);

  const watermarkFixture = createTest();
  watermarkFixture.watermark = {
    enabled: true,
    text: "eSepte ONLINE",
    opacity: 0.08,
    size: "medium",
  };
  assert.equal(validateTest(watermarkFixture), watermarkFixture);

  watermarkFixture.watermark.opacity = 1.2;
  assert.throws(() => validateTest(watermarkFixture), {
    code: "TEST_SCHEMA_INVALID",
  });

  watermarkFixture.watermark.opacity = 0.08;
  watermarkFixture.watermark.size = "huge";
  assert.throws(() => validateTest(watermarkFixture), {
    code: "TEST_SCHEMA_INVALID",
  });
});

test("validates single-choice and multiple-choice correct option rules", () => {
  const fixture = createTest();
  assert.equal(validateTest(fixture), fixture);

  fixture.sections[0].questions[0].correctOptionIds = ["a", "b"];
  assert.throws(() => validateTest(fixture), {
    code: "TEST_SCHEMA_INVALID",
  });

  const emptyMultiple = createTest();
  emptyMultiple.sections[1].questions[1].correctOptionIds = [];
  assert.throws(() => validateTest(emptyMultiple), {
    code: "TEST_SCHEMA_INVALID",
  });

  const missingOption = createTest();
  missingOption.sections[1].questions[1].correctOptionIds = ["a", "missing"];
  assert.throws(() => validateTest(missingOption), {
    code: "TEST_SCHEMA_INVALID",
  });
});

test("normalizes legacy strings and compares option sets exactly", () => {
  const multipleQuestion = createTest().sections[1].questions[1];

  assert.deepEqual(toOptionIdArray("a"), ["a"]);
  assert.deepEqual(
    normalizeQuestionAnswer(multipleQuestion, ["c", "a", "missing"]),
    ["c", "a"],
  );
  assert.equal(optionSetsMatch(["a", "c"], ["c", "a"]), true);
  assert.equal(optionSetsMatch(["a"], ["a", "c"]), false);
  assert.equal(optionSetsMatch(["a", "b", "c"], ["a", "c"]), false);
});

test("resolves global, test-specific, and disabled watermark settings", () => {
  const defaultFixture = createTest();
  assert.deepEqual(resolveWatermark(defaultFixture), DEFAULT_WATERMARK);

  const configuredFixture = createTest();
  configuredFixture.watermark = {
    enabled: true,
    text: "Configured watermark",
    opacity: 0.18,
    size: "large",
  };
  assert.deepEqual(resolveWatermark(configuredFixture), {
    enabled: true,
    text: "Configured watermark",
    opacity: 0.18,
    size: "large",
  });

  const titleFallbackFixture = createTest();
  titleFallbackFixture.watermark = { enabled: true };
  assert.equal(
    resolveWatermark(titleFallbackFixture).text,
    titleFallbackFixture.title,
  );

  const disabledFixture = createTest();
  disabledFixture.watermark = { enabled: false };
  assert.equal(resolveWatermark(disabledFixture), null);
});

test("creates a dynamic ordered flow for every section and question", () => {
  const flow = createQuestionFlow(createTest());

  assert.deepEqual(
    flow.map(({ section, question }) => [section.id, question.id]),
    [
      ["first", "first-1"],
      ["second", "second-1"],
      ["second", "second-2"],
    ],
  );
  assert.equal(flow[2].sectionQuestionIndex, 1);
  assert.equal(flow[2].sectionQuestionCount, 2);
});

test("calculates completion progress from answers instead of navigation", () => {
  const flow = createQuestionFlow(createTest());
  const answers = new Map([
    ["first-1", ["a"]],
    ["second-2", ["a", "c"]],
  ]);
  const progress = calculateAttemptProgress(flow, answers, "second");

  assert.deepEqual(progress, {
    total: {
      answered: 2,
      questions: 3,
      percentage: 67,
    },
    section: {
      answered: 1,
      questions: 2,
      percentage: 50,
    },
  });
});

test("scores correct, incorrect, and unanswered answers by section", () => {
  const result = calculateResult(
    createTest(),
    new Map([
      ["first-1", ["a"]],
      ["second-1", ["a"]],
    ]),
  );

  assert.equal(result.earnedPoints, 1);
  assert.equal(result.totalPoints, 4);
  assert.equal(result.percentage, 25);
  assert.deepEqual(result.counts, {
    correct: 1,
    incorrect: 1,
    unanswered: 1,
  });
  assert.deepEqual(
    result.sections.map(({ earnedPoints, totalPoints }) => [
      earnedPoints,
      totalPoints,
    ]),
    [
      [1, 1],
      [0, 3],
    ],
  );
});

test("awards multiple-choice points only for an exact selected set", () => {
  const fixture = createTest();

  const exact = calculateResult(
    fixture,
    new Map([["second-2", ["c", "a"]]]),
  );
  const missing = calculateResult(
    fixture,
    new Map([["second-2", ["a"]]]),
  );
  const extra = calculateResult(
    fixture,
    new Map([["second-2", ["a", "b", "c"]]]),
  );

  assert.equal(exact.questions[2].status, "correct");
  assert.equal(exact.questions[2].earnedPoints, 1);
  assert.deepEqual(exact.questions[2].selectedOptionIds, ["c", "a"]);
  assert.deepEqual(exact.questions[2].correctOptionIds, ["a", "c"]);
  assert.equal(missing.questions[2].status, "incorrect");
  assert.equal(missing.questions[2].earnedPoints, 0);
  assert.equal(extra.questions[2].status, "incorrect");
  assert.equal(extra.questions[2].earnedPoints, 0);
});
