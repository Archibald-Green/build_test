import { createQuestionFlow } from "../core/question-flow.js";
import { createAttemptStorage } from "../core/attempt-storage.js";
import { calculateAttemptProgress } from "../core/attempt-progress.js?v=20260612-multiple-choice";
import {
  isAnsweredValue,
  normalizeQuestionAnswer,
} from "../core/answers.js";
import { t, tn } from "../core/i18n.js?v=20260612-multiple-choice";
import { calculateResult } from "../core/scoring.js?v=20260612-multiple-choice";
import { resolveWatermark } from "../core/watermark.js";
import { renderResults } from "./results-view.js?v=20260612-multiple-choice";
import { renderSocialBlock } from "./social-block.js";

let mediaCaptionId = 0;

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function createProgressBar(value, label, modifier = "", progressType = "") {
  const track = createElement("div", `progress-track ${modifier}`.trim());
  track.setAttribute("role", "progressbar");
  track.setAttribute("aria-valuemin", "0");
  track.setAttribute("aria-valuemax", "100");
  track.setAttribute("aria-valuenow", String(value));
  track.setAttribute("aria-label", label);
  if (progressType) {
    track.dataset.progressType = progressType;
  }

  const fill = createElement("span", "progress-track__fill");
  fill.style.width = `${value}%`;
  track.append(fill);

  return track;
}

function getNavigationLabel(flowItem, questionIndex, total, answered) {
  return t("runner.navigationLabel", {
    current: questionIndex + 1,
    total,
    section: flowItem.section.title,
    sectionCurrent: flowItem.sectionQuestionIndex + 1,
    answered: answered
      ? t("runner.answeredSuffix")
      : t("runner.unansweredSuffix"),
  });
}

function createMediaMessage(message, retryHandler) {
  const notice = createElement("div", "media-notice");
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");

  const icon = createElement("span", "media-notice__icon", "i");
  icon.setAttribute("aria-hidden", "true");

  const copy = createElement("span", "", message);
  notice.append(icon, copy);

  if (retryHandler) {
    const retry = createElement("button", "media-notice__retry", t("runner.retry"));
    retry.type = "button";
    retry.addEventListener("click", retryHandler);
    notice.append(retry);
  }

  return notice;
}

function createImageMedia(image, testUrl) {
  const figure = createElement("figure", "question-media question-media--image");
  const imageElement = createElement("img", "question-media__image");
  const imageUrl = new URL(image.src, testUrl);

  imageElement.src = imageUrl.href;
  imageElement.alt = image.alt;
  figure.append(imageElement);

  let notice = null;

  const showFailure = () => {
    imageElement.hidden = true;
    notice?.remove();
    notice = createMediaMessage(t("runner.imageLoadFailed"), () => {
      notice.remove();
      notice = null;
      imageElement.hidden = false;
      imageElement.src = imageUrl.href;
    });
    figure.append(notice);
  };

  imageElement.addEventListener("error", showFailure);
  return figure;
}

function createAudioMedia(audio, testUrl) {
  const wrapper = createElement("div", "question-media question-media--audio");
  const caption = createElement(
    "p",
    "question-media__caption",
    audio.caption || t("runner.questionAudio"),
  );
  const audioElement = createElement("audio", "question-media__audio");
  const audioUrl = new URL(audio.src, testUrl);
  mediaCaptionId += 1;
  const captionId = `audio-caption-${mediaCaptionId}`;

  caption.id = captionId;
  audioElement.controls = true;
  audioElement.preload = "metadata";
  audioElement.src = audioUrl.href;
  audioElement.setAttribute("aria-describedby", captionId);
  wrapper.append(caption, audioElement);

  let notice = null;

  const showFailure = () => {
    notice?.remove();
    notice = createMediaMessage(t("runner.audioLoadFailed"), () => {
      notice.remove();
      notice = null;
      audioElement.load();
    });
    wrapper.append(notice);
  };

  audioElement.addEventListener("error", showFailure);
  return wrapper;
}

function createQuestionMedia(question, testUrl) {
  const media = createElement("div", "question-media-list");

  if (question.media?.image) {
    media.append(createImageMedia(question.media.image, testUrl));
  }
  if (question.media?.audio) {
    media.append(createAudioMedia(question.media.audio, testUrl));
  }

  return media;
}

function createQuestionWatermark(watermark) {
  if (!watermark) {
    return null;
  }

  const layer = createElement(
    "div",
    `question-watermark question-watermark--${watermark.size}`,
  );
  layer.setAttribute("aria-hidden", "true");
  layer.style.setProperty(
    "--watermark-opacity",
    String(watermark.opacity),
  );

  for (let index = 0; index < 36; index += 1) {
    layer.append(createElement("span", "", watermark.text));
  }

  return layer;
}

function createQuestionNavigator({
  test,
  flow,
  currentIndex,
  answers,
  onNavigate,
}) {
  const navigator = createElement("nav", "question-navigator");
  navigator.setAttribute("aria-label", t("runner.navigator"));

  const title = createElement(
    "h2",
    "runner-sidebar__title",
    t("runner.navigator"),
  );
  navigator.append(title);

  let globalIndex = 0;

  test.sections.forEach((section) => {
    const group = createElement("div", "question-navigator__group");
    const sectionLabelId = `navigator-section-${section.id}`;
    group.setAttribute("role", "group");
    group.setAttribute("aria-labelledby", sectionLabelId);

    const sectionLabel = createElement(
      "p",
      "question-navigator__section",
      section.title,
    );
    sectionLabel.id = sectionLabelId;
    const buttons = createElement("div", "question-navigator__buttons");

    section.questions.forEach(() => {
      const questionIndex = globalIndex;
      const flowItem = flow[questionIndex];
      const button = createElement(
        "button",
        "question-nav-button",
        String(questionIndex + 1),
      );

      button.type = "button";
      button.dataset.questionId = flowItem.question.id;
      button.setAttribute(
        "aria-label",
        getNavigationLabel(
          flowItem,
          questionIndex,
          flow.length,
          answers.has(flowItem.question.id),
        ),
      );

      if (questionIndex === currentIndex) {
        button.classList.add("is-current");
        button.setAttribute("aria-current", "step");
      }
      if (answers.has(flowItem.question.id)) {
        button.classList.add("is-answered");
      }

      button.addEventListener("click", () => onNavigate(questionIndex));
      buttons.append(button);
      globalIndex += 1;
    });

    group.append(sectionLabel, buttons);
    navigator.append(group);
  });

  return navigator;
}

function createRunnerSidebar({
  test,
  flow,
  currentIndex,
  answers,
  onNavigate,
  onSubmit,
  onResetSection,
  onResetTest,
}) {
  const current = flow[currentIndex];
  const progress = calculateAttemptProgress(
    flow,
    answers,
    current.section.id,
  );
  const sidebar = createElement("aside", "runner-sidebar");
  sidebar.setAttribute("aria-label", t("runner.testProgress"));

  const progressTitle = createElement(
    "h2",
    "runner-sidebar__title",
    t("runner.yourProgress"),
  );
  const totalText = createElement(
    "p",
    "runner-progress__label",
    t("runner.answeredProgress", {
      answered: progress.total.answered,
      total: progress.total.questions,
    }),
  );
  totalText.dataset.progressLabel = "total";
  const totalProgressRow = createElement("div", "runner-progress__row");
  const totalBar = createProgressBar(
    progress.total.percentage,
    t("runner.totalProgress", {
      answered: progress.total.answered,
      total: progress.total.questions,
      percentage: progress.total.percentage,
    }),
    "",
    "total",
  );
  const totalPercent = createElement(
    "span",
    "runner-progress__percent",
    `${progress.total.percentage}%`,
  );
  totalPercent.dataset.progressPercent = "total";
  totalProgressRow.append(totalBar, totalPercent);

  const sectionBlock = createElement("section", "runner-section-progress");
  const sectionEyebrow = createElement(
    "p",
    "runner-sidebar__label",
    t("runner.currentSection"),
  );
  const sectionTitle = createElement(
    "h3",
    "runner-section-progress__title",
    current.section.title,
  );
  const sectionText = createElement(
    "p",
    "runner-progress__label",
    t("runner.sectionAnsweredProgress", {
      answered: progress.section.answered,
      total: progress.section.questions,
    }),
  );
  sectionText.dataset.progressLabel = "section";
  const sectionProgressRow = createElement("div", "runner-progress__row");
  const sectionBar = createProgressBar(
    progress.section.percentage,
    t("runner.sectionProgress", {
      section: current.section.title,
      answered: progress.section.answered,
      total: progress.section.questions,
      percentage: progress.section.percentage,
    }),
    "progress-track--section",
    "section",
  );
  const sectionPercent = createElement(
    "span",
    "runner-progress__percent",
    `${progress.section.percentage}%`,
  );
  sectionPercent.dataset.progressPercent = "section";
  sectionProgressRow.append(sectionBar, sectionPercent);
  sectionBlock.append(
    sectionEyebrow,
    sectionTitle,
    sectionText,
    sectionProgressRow,
  );

  const navigator = createQuestionNavigator({
    test,
    flow,
    currentIndex,
    answers,
    onNavigate,
  });

  const note = createElement(
    "p",
    "runner-sidebar__note",
    t("runner.navigationNote"),
  );

  const resetControls = createElement("div", "runner-reset-controls");
  const finishTest = createElement(
    "button",
    "runner-button runner-button--primary runner-finish-button",
    t("runner.finish"),
  );
  const resetSection = createElement(
    "button",
    "runner-reset-button",
    t("runner.resetSection"),
  );
  const resetTest = createElement(
    "button",
    "runner-reset-button runner-reset-button--danger",
    t("runner.resetTest"),
  );

  finishTest.type = "button";
  finishTest.addEventListener("click", onSubmit);
  resetSection.type = "button";
  resetSection.addEventListener("click", onResetSection);
  resetTest.type = "button";
  resetTest.addEventListener("click", onResetTest);
  resetControls.append(resetSection, resetTest);

  sidebar.append(
    progressTitle,
    totalText,
    totalProgressRow,
    sectionBlock,
    navigator,
    note,
    finishTest,
    resetControls,
  );
  return sidebar;
}

function createQuestionWorkspace({
  flow,
  currentIndex,
  answers,
  testUrl,
  watermark,
  onAnswer,
  onNavigate,
}) {
  const current = flow[currentIndex];
  const { question, section } = current;
  const workspace = createElement("article", "question-workspace");

  const header = createElement("header", "question-workspace__header");
  const sectionTitle = createElement(
    "p",
    "question-workspace__section",
    section.title,
  );
  const counter = createElement(
    "p",
    "question-workspace__counter",
    t("runner.questionProgress", {
      current: currentIndex + 1,
      total: flow.length,
    }),
  );
  const sectionCounter = createElement(
    "p",
    "question-workspace__section-counter",
    t("runner.sectionQuestionProgress", {
      current: current.sectionQuestionIndex + 1,
      total: current.sectionQuestionCount,
    }),
  );
  header.append(sectionTitle, counter, sectionCounter);

  const questionForm = createElement("div", "question-form");
  const prompt = createElement("h1", "question-form__prompt", question.prompt);
  prompt.id = `question-title-${question.id}`;
  prompt.tabIndex = -1;
  questionForm.append(prompt);

  if (question.media) {
    questionForm.append(createQuestionMedia(question, testUrl));
  }

  const options = createElement("fieldset", "question-options");
  options.setAttribute("aria-labelledby", prompt.id);

  const legend = createElement(
    "legend",
    "visually-hidden",
    question.type === "multiple-choice"
      ? t("runner.chooseMany")
      : t("runner.chooseOne"),
  );
  options.append(legend);

  question.options.forEach((option) => {
    const isMultiple = question.type === "multiple-choice";
    const label = createElement(
      "label",
      `answer-option ${isMultiple ? "answer-option--multiple" : ""}`.trim(),
    );
    const input = document.createElement("input");
    const control = createElement("span", "answer-option__control");
    const text = createElement("span", "answer-option__text", option.text);
    const selectedOptionIds = answers.get(question.id) ?? [];

    input.type = isMultiple ? "checkbox" : "radio";
    input.name = `answer-${question.id}`;
    input.value = option.id;
    input.checked = selectedOptionIds.includes(option.id);
    input.addEventListener("change", () =>
      onAnswer(question, option.id, input.checked),
    );

    label.append(input, control, text);
    options.append(label);
  });

  questionForm.append(options);

  const watermarkLayer = createQuestionWatermark(watermark);
  if (watermarkLayer) {
    questionForm.classList.add("question-form--watermarked");
    questionForm.append(watermarkLayer);
  }

  const actions = createElement("div", "runner-actions");
  const previous = createElement(
    "button",
    "runner-button runner-button--secondary",
    t("runner.previous"),
  );
  const next = createElement(
    "button",
    "runner-button runner-button--primary",
    t("runner.next"),
  );

  previous.type = "button";
  previous.disabled = currentIndex === 0;
  previous.addEventListener("click", () => onNavigate(currentIndex - 1));

  next.type = "button";
  next.disabled = currentIndex === flow.length - 1;
  next.addEventListener("click", () => onNavigate(currentIndex + 1));

  actions.append(previous, next);
  workspace.append(header, questionForm, actions);

  return { workspace, prompt };
}

function createStorageWarning() {
  const warning = createElement("div", "runner-notice runner-notice--warning");
  warning.dataset.storageWarning = "true";
  warning.setAttribute("role", "status");

  const icon = createElement("span", "runner-notice__icon", "!");
  icon.setAttribute("aria-hidden", "true");

  const content = createElement("div");
  const title = createElement(
    "strong",
    "runner-notice__title",
    t("runner.storageTitle"),
  );
  const message = createElement(
    "p",
    "runner-notice__message",
    t("runner.storageMessage"),
  );

  content.append(title, message);
  warning.append(icon, content);
  return warning;
}

function renderIncompatibleAttempt(container, test, storage, onContinue) {
  container.replaceChildren();
  container.classList.add("app--runner");
  container.setAttribute("aria-busy", "false");

  const panel = createElement("section", "attempt-version-panel");
  panel.setAttribute("role", "alert");

  const label = createElement(
    "p",
    "attempt-version-panel__label",
    t("runner.incompatibleLabel"),
  );
  const title = createElement(
    "h1",
    "attempt-version-panel__title",
    t("runner.incompatibleTitle"),
  );
  const message = createElement(
    "p",
    "attempt-version-panel__message",
    t("runner.incompatibleMessage", {
      title: test.title,
      version: test.version,
    }),
  );
  const action = createElement(
    "button",
    "runner-button runner-button--primary",
    t("runner.discardOldAttempt"),
  );

  action.type = "button";
  action.addEventListener("click", () => {
    storage.discardIncompatible();
    onContinue();
  });

  panel.append(label, title, message, action);
  container.append(panel);
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function restoreAttempt(savedAttempt, test, flow) {
  const first = flow[0];
  const fallback = {
    answers: new Map(),
    currentIndex: 0,
    startedAt: new Date().toISOString(),
  };

  if (
    !isRecord(savedAttempt) ||
    savedAttempt.testId !== test.id ||
    savedAttempt.testVersion !== test.version
  ) {
    return fallback;
  }

  const questions = new Map(
    flow.map(({ question }) => [question.id, question]),
  );
  const answers = new Map();

  if (isRecord(savedAttempt.answers)) {
    Object.entries(savedAttempt.answers).forEach(([questionId, value]) => {
      const question = questions.get(questionId);

      if (question) {
        const selectedOptionIds = normalizeQuestionAnswer(question, value);

        if (isAnsweredValue(selectedOptionIds)) {
          answers.set(questionId, selectedOptionIds);
        }
      }
    });
  }

  const currentIndex = flow.findIndex(
    ({ question }) => question.id === savedAttempt.currentQuestionId,
  );

  return {
    answers,
    currentIndex: currentIndex >= 0 ? currentIndex : 0,
    startedAt:
      typeof savedAttempt.startedAt === "string"
        ? savedAttempt.startedAt
        : fallback.startedAt,
    currentSectionId:
      currentIndex >= 0
        ? flow[currentIndex].section.id
        : first.section.id,
  };
}

export function renderTestRunner(container, test, testUrl) {
  const flow = createQuestionFlow(test);
  const watermark = resolveWatermark(test);
  const storage = createAttemptStorage(test.id, test.version);
  const savedAttempt = storage.load();
  const hasCompatibleActiveAttempt =
    isRecord(savedAttempt) &&
    savedAttempt.testId === test.id &&
    savedAttempt.testVersion === test.version &&
    savedAttempt.submitted === false;
  const hasCompatibleSubmittedAttempt =
    isRecord(savedAttempt) &&
    savedAttempt.testId === test.id &&
    savedAttempt.testVersion === test.version &&
    savedAttempt.submitted === true &&
    isRecord(savedAttempt.result) &&
    typeof savedAttempt.submittedAt === "string";
  const hasCompatibleSavedAttempt =
    hasCompatibleActiveAttempt || hasCompatibleSubmittedAttempt;
  const restored = restoreAttempt(savedAttempt, test, flow);
  const answers = restored.answers;
  let currentIndex = restored.currentIndex;
  let startedAt = restored.startedAt;
  let submitted = hasCompatibleSubmittedAttempt;
  let submittedAt = submitted ? savedAttempt.submittedAt : null;
  let result = submitted ? savedAttempt.result : null;
  let reviewOpen = false;
  const restoredCurrent = flow[currentIndex];
  const savedAnswerCount = isRecord(savedAttempt?.answers)
    ? Object.keys(savedAttempt.answers).length
    : 0;
  const shouldRepairSavedAttempt =
    hasCompatibleActiveAttempt &&
    (savedAttempt.currentQuestionId !== restoredCurrent.question.id ||
      savedAttempt.currentSectionId !== restoredCurrent.section.id ||
      savedAnswerCount !== answers.size);

  container.classList.add("app--runner");
  container.setAttribute("aria-busy", "false");

  function createAttempt() {
    const current = flow[currentIndex];

    return {
      testId: test.id,
      testVersion: test.version,
      answers: Object.fromEntries(answers),
      currentQuestionId: current.question.id,
      currentSectionId: current.section.id,
      startedAt,
      updatedAt: new Date().toISOString(),
      submitted,
      ...(submitted
        ? {
            submittedAt,
            result,
          }
        : {}),
    };
  }

  function persistAttempt() {
    const saved = storage.save(createAttempt());

    if (!saved) {
      showStorageWarning();
    }

    return saved;
  }

  function showStorageWarning() {
    if (container.querySelector("[data-storage-warning]")) {
      return;
    }

    const warning = createStorageWarning();
    const layout = container.querySelector(".runner-layout");

    if (layout) {
      container.insertBefore(warning, layout);
    }
  }

  function updateActiveProgress() {
    const current = flow[currentIndex];
    const progress = calculateAttemptProgress(
      flow,
      answers,
      current.section.id,
    );

    const updates = [
      {
        type: "total",
        value: progress.total,
        label: t("runner.answeredProgress", {
          answered: progress.total.answered,
          total: progress.total.questions,
        }),
        ariaLabel: t("runner.totalProgress", {
          answered: progress.total.answered,
          total: progress.total.questions,
          percentage: progress.total.percentage,
        }),
      },
      {
        type: "section",
        value: progress.section,
        label: t("runner.sectionAnsweredProgress", {
          answered: progress.section.answered,
          total: progress.section.questions,
        }),
        ariaLabel: t("runner.sectionProgress", {
          section: current.section.title,
          answered: progress.section.answered,
          total: progress.section.questions,
          percentage: progress.section.percentage,
        }),
      },
    ];

    updates.forEach(({ type, value, label, ariaLabel }) => {
      const text = container.querySelector(
        `[data-progress-label="${type}"]`,
      );
      const track = container.querySelector(
        `[data-progress-type="${type}"]`,
      );
      const percent = container.querySelector(
        `[data-progress-percent="${type}"]`,
      );

      if (text) {
        text.textContent = label;
      }
      if (track) {
        track.setAttribute("aria-valuenow", String(value.percentage));
        track.setAttribute("aria-label", ariaLabel);
        track.querySelector(".progress-track__fill").style.width =
          `${value.percentage}%`;
      }
      if (percent) {
        percent.textContent = `${value.percentage}%`;
      }
    });
  }

  function beginFreshAttempt({ persist = true } = {}) {
    answers.clear();
    currentIndex = 0;
    startedAt = new Date().toISOString();
    submitted = false;
    submittedAt = null;
    result = null;
    reviewOpen = false;

    if (persist) {
      persistAttempt();
    }
    render({ focusPrompt: true });
  }

  function showRunner() {
    if (
      storage.available &&
      !hasCompatibleSavedAttempt &&
      storage.findIncompatible().length > 0
    ) {
      renderIncompatibleAttempt(container, test, storage, () => {
        beginFreshAttempt();
      });
      return;
    }

    if (hasCompatibleSubmittedAttempt) {
      renderSubmittedResults();
      return;
    }

    if (
      storage.available &&
      (!hasCompatibleSavedAttempt || shouldRepairSavedAttempt)
    ) {
      persistAttempt();
    }
    render();
  }

  function resetEntireTest() {
    const confirmed = window.confirm(
      t("runner.resetTestConfirm"),
    );

    if (!confirmed) {
      return;
    }

    storage.remove();
    beginFreshAttempt({ persist: false });
  }

  function renderSubmittedResults() {
    renderResults(container, {
      test,
      result,
      submittedAt,
      storageAvailable: storage.available,
      onReset: resetEntireTest,
      reviewOpen,
      onReviewOpen: () => {
        reviewOpen = true;
      },
    });
  }

  function render({ focusPrompt = false } = {}) {
    const backLink = createElement("a", "back-link", t("runner.backToTests"));
    backLink.href = "./";

    const runnerHeading = createElement("header", "runner-heading");
    const testTitle = createElement("p", "runner-heading__title", test.title);
    const headingMeta = createElement("div", "runner-heading__meta");
    const description = createElement(
      "p",
      "runner-heading__description",
      test.description,
    );
    headingMeta.append(description);

    if (test.headerLinks.length > 0) {
      const links = createElement("ul", "test-links runner-heading__links");

      test.headerLinks.forEach((link) => {
        const item = document.createElement("li");
        const anchor = document.createElement("a");
        anchor.href = link.url;
        anchor.textContent = link.label;

        if (/^https?:/i.test(link.url)) {
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";
        }

        item.append(anchor);
        links.append(item);
      });

      headingMeta.append(links);
    }

    runnerHeading.append(testTitle, headingMeta);

    const layout = createElement("div", "runner-layout");
    const navigate = (index) => {
      if (index < 0 || index >= flow.length || index === currentIndex) {
        return;
      }

      currentIndex = index;
      persistAttempt();
      render({ focusPrompt: true });
    };

    const answer = (question, optionId, checked) => {
      const currentAnswer = answers.get(question.id) ?? [];
      const selectedOptionIds =
        question.type === "multiple-choice"
          ? checked
            ? [...new Set([...currentAnswer, optionId])]
            : currentAnswer.filter((selectedId) => selectedId !== optionId)
          : [optionId];

      if (selectedOptionIds.length > 0) {
        answers.set(question.id, selectedOptionIds);
      } else {
        answers.delete(question.id);
      }

      persistAttempt();
      updateActiveProgress();
      const navigationButton = container.querySelector(
        `.question-nav-button[data-question-id="${CSS.escape(question.id)}"]`,
      );

      if (navigationButton) {
        navigationButton.classList.toggle(
          "is-answered",
          selectedOptionIds.length > 0,
        );
        const questionIndex = flow.findIndex(
          ({ question: flowQuestion }) => flowQuestion.id === question.id,
        );
        navigationButton.setAttribute(
          "aria-label",
          getNavigationLabel(
            flow[questionIndex],
            questionIndex,
            flow.length,
            selectedOptionIds.length > 0,
          ),
        );
      }
    };

    const resetSection = () => {
      const currentSection = flow[currentIndex].section;
      const confirmed = window.confirm(
        t("runner.resetSectionConfirm", { section: currentSection.title }),
      );

      if (!confirmed) {
        return;
      }

      currentSection.questions.forEach((question) => answers.delete(question.id));
      currentIndex = flow.findIndex(
        ({ section }) => section.id === currentSection.id,
      );
      persistAttempt();
      render({ focusPrompt: true });
    };

    const resetTest = () => {
      resetEntireTest();
    };

    const submitTest = () => {
      const unansweredCount = flow.length - answers.size;

      if (unansweredCount > 0) {
        const confirmed = window.confirm(
          tn("runner.unansweredSubmit", unansweredCount),
        );

        if (!confirmed) {
          return;
        }
      }

      result = calculateResult(test, answers);
      submitted = true;
      submittedAt = new Date().toISOString();
      persistAttempt();
      renderSubmittedResults();
    };

    const sidebar = createRunnerSidebar({
      test,
      flow,
      currentIndex,
      answers,
      onNavigate: navigate,
      onSubmit: submitTest,
      onResetSection: resetSection,
      onResetTest: resetTest,
    });
    const { workspace, prompt } = createQuestionWorkspace({
      flow,
      currentIndex,
      answers,
      testUrl,
      watermark,
      onAnswer: answer,
      onNavigate: navigate,
    });

    layout.append(sidebar, workspace);
    const content = [backLink, runnerHeading];
    const socialBlock = renderSocialBlock(test);

    if (socialBlock) {
      content.push(socialBlock);
    }

    if (!storage.available) {
      content.push(createStorageWarning());
    }

    content.push(layout);
    container.replaceChildren(...content);

    if (focusPrompt) {
      prompt.focus({ preventScroll: true });
      workspace.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  showRunner();

  return {
    rerender() {
      if (submitted) {
        renderSubmittedResults();
        return;
      }

      showRunner();
    },
  };
}
