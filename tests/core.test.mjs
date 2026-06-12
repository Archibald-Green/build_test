import assert from "node:assert/strict";
import test from "node:test";

import { getLocale, setLocale, t, tn } from "../docs/assets/js/core/i18n.js";
import { calculateAttemptProgress } from "../docs/assets/js/core/attempt-progress.js";
import { createQuestionFlow } from "../docs/assets/js/core/question-flow.js";
import { calculateResult } from "../docs/assets/js/core/scoring.js";
import {
  validateCatalog,
  validateTest,
} from "../docs/assets/js/core/test-validator.js";

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
            type: "single-choice",
            prompt: "Third question",
            options: [
              { id: "a", text: "A" },
              { id: "b", text: "B" },
            ],
            correctOptionIds: ["a"],
            explanation: "A is correct.",
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
    ["first-1", "a"],
    ["second-2", "a"],
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
      ["first-1", "a"],
      ["second-1", "a"],
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
