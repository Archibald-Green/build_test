const STATUS_META = {
  correct: {
    label: "Correct",
    icon: "\u2713",
  },
  incorrect: {
    label: "Incorrect",
    icon: "\u00d7",
  },
  unanswered: {
    label: "Unanswered",
    icon: "\u2212",
  },
};

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

function formatPoints(value) {
  return Number.isInteger(value)
    ? String(value)
    : String(Number(value.toFixed(2)));
}

function getQuestionLookup(test) {
  return new Map(
    test.sections.flatMap((section) =>
      section.questions.map((question) => [
        question.id,
        {
          question,
          section,
        },
      ]),
    ),
  );
}

function getOptionText(question, optionId, fallback) {
  if (!optionId) {
    return fallback;
  }

  return (
    question.options.find((option) => option.id === optionId)?.text ?? fallback
  );
}

function createCountCard(status, value) {
  const meta = STATUS_META[status];
  const card = createElement(
    "div",
    `result-count result-count--${status}`,
  );
  const icon = createElement("span", "result-count__icon", meta.icon);
  icon.setAttribute("aria-hidden", "true");
  const count = createElement("strong", "result-count__value", String(value));
  const label = createElement("span", "result-count__label", meta.label);

  card.append(icon, count, label);
  return card;
}

function createSectionScore(section) {
  const item = createElement("li", "section-score");
  const heading = createElement("div", "section-score__heading");
  const title = createElement(
    "span",
    "section-score__title",
    section.sectionTitle,
  );
  const points = createElement(
    "strong",
    "section-score__points",
    `${formatPoints(section.earnedPoints)} / ${formatPoints(
      section.totalPoints,
    )}`,
  );
  const percentage =
    section.totalPoints === 0
      ? 0
      : Math.round((section.earnedPoints / section.totalPoints) * 100);
  const progress = createElement("div", "section-score__track");
  progress.setAttribute("role", "progressbar");
  progress.setAttribute("aria-label", `${section.sectionTitle} score`);
  progress.setAttribute("aria-valuemin", "0");
  progress.setAttribute("aria-valuemax", "100");
  progress.setAttribute("aria-valuenow", String(percentage));

  const fill = createElement("span", "section-score__fill");
  fill.style.width = `${percentage}%`;

  heading.append(title, points);
  progress.append(fill);
  item.append(heading, progress);
  return item;
}

function createReviewCard(questionResult, lookup, index) {
  const meta = STATUS_META[questionResult.status];
  const matched = lookup.get(questionResult.questionId);
  const question = matched?.question;
  const section = matched?.section;
  const card = createElement(
    "article",
    `review-card review-card--${questionResult.status}`,
  );

  const header = createElement("header", "review-card__header");
  const status = createElement(
    "div",
    `review-status review-status--${questionResult.status}`,
  );
  const icon = createElement("span", "review-status__icon", meta.icon);
  icon.setAttribute("aria-hidden", "true");
  const statusText = createElement("span", "", meta.label);
  status.append(icon, statusText);

  const sectionTitle = createElement(
    "p",
    "review-card__section",
    section?.title ?? "Section unavailable",
  );
  const prompt = createElement(
    "h3",
    "review-card__prompt",
    `${index + 1}. ${question?.prompt ?? "Question unavailable"}`,
  );
  header.append(status, sectionTitle, prompt);

  const details = createElement("dl", "review-details");

  const rows = [
    [
      "Your answer",
      question
        ? getOptionText(
            question,
            questionResult.selectedOptionId,
            questionResult.status === "unanswered"
              ? "No answer selected"
              : "Answer unavailable",
          )
        : "Answer unavailable",
    ],
    [
      "Correct answer",
      question
        ? getOptionText(
            question,
            questionResult.correctOptionId,
            "Answer unavailable",
          )
        : "Answer unavailable",
    ],
    [
      "Explanation",
      question?.explanation || "No explanation provided.",
    ],
    [
      "Points",
      `${formatPoints(questionResult.earnedPoints)} / ${formatPoints(
        questionResult.totalPoints,
      )}`,
    ],
  ];

  rows.forEach(([termText, detailText]) => {
    const row = createElement("div", "review-details__row");
    const term = createElement("dt", "review-details__term", termText);
    const detail = createElement("dd", "review-details__value", detailText);
    row.append(term, detail);
    details.append(row);
  });

  card.append(header, details);
  return card;
}

export function renderResults(
  container,
  {
    test,
    result,
    submittedAt,
    storageAvailable,
    onReset,
  },
) {
  const lookup = getQuestionLookup(test);
  container.replaceChildren();
  container.classList.add("app--runner");
  container.setAttribute("aria-busy", "false");

  const backLink = createElement("a", "back-link", "Back to all tests");
  backLink.href = "./";

  const hero = createElement("section", "results-hero");
  const intro = createElement("div", "results-hero__intro");
  const testTitle = createElement(
    "p",
    "results-hero__test-title",
    test.title,
  );
  const title = createElement("h1", "results-hero__title", "Test complete");
  const submitted = createElement(
    "p",
    "results-hero__submitted",
    `Submitted ${new Date(submittedAt).toLocaleString()}`,
  );
  intro.append(testTitle, title, submitted);

  const total = createElement("div", "results-total");
  const score = createElement(
    "strong",
    "results-total__score",
    `${formatPoints(result.earnedPoints)} / ${formatPoints(
      result.totalPoints,
    )} points`,
  );
  const percentage = createElement(
    "span",
    "results-total__percentage",
    `${result.percentage}%`,
  );
  const scoreLabel = createElement(
    "span",
    "results-total__label",
    "Total score",
  );
  total.append(score, percentage, scoreLabel);
  hero.append(intro, total);

  const dashboard = createElement("div", "results-dashboard");
  const countGrid = createElement("section", "result-counts");
  countGrid.setAttribute("aria-label", "Answer counts");
  countGrid.append(
    createCountCard("correct", result.counts.correct),
    createCountCard("incorrect", result.counts.incorrect),
    createCountCard("unanswered", result.counts.unanswered),
  );

  const sectionPanel = createElement("section", "section-scores");
  const sectionHeading = createElement("h2", "", "Score by section");
  const sectionList = createElement("ul", "section-scores__list");
  result.sections.forEach((section) =>
    sectionList.append(createSectionScore(section)),
  );
  sectionPanel.append(sectionHeading, sectionList);
  dashboard.append(countGrid, sectionPanel);

  const actions = createElement("div", "results-actions");
  const reviewButton = createElement(
    "button",
    "runner-button runner-button--primary",
    "Review answers",
  );
  const resetButton = createElement(
    "button",
    "runner-button runner-button--secondary",
    "Reset entire test",
  );
  reviewButton.type = "button";
  reviewButton.setAttribute("aria-controls", "answer-review");
  reviewButton.setAttribute("aria-expanded", "false");
  resetButton.type = "button";
  actions.append(reviewButton, resetButton);

  const review = createElement("section", "answer-review");
  review.id = "answer-review";
  review.hidden = true;
  const reviewHeader = createElement("div", "answer-review__header");
  const reviewHeading = createElement("h2", "", "Answer review");
  const reviewCopy = createElement(
    "p",
    "",
    "Compare your answers with the correct answers and explanations.",
  );
  reviewHeader.append(reviewHeading, reviewCopy);
  const reviewList = createElement("div", "answer-review__list");
  result.questions.forEach((questionResult, index) => {
    reviewList.append(createReviewCard(questionResult, lookup, index));
  });
  review.append(reviewHeader, reviewList);

  reviewButton.addEventListener("click", () => {
    review.hidden = false;
    reviewButton.setAttribute("aria-expanded", "true");
    reviewButton.textContent = "Answer review shown";
    reviewButton.disabled = true;
    reviewHeading.tabIndex = -1;
    reviewHeading.focus({ preventScroll: true });
    review.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  resetButton.addEventListener("click", onReset);

  const savedNotice = createElement("p", "results-saved-notice");
  savedNotice.textContent = storageAvailable
    ? "Your submitted result is saved in this browser. Reset the entire test to start a new attempt."
    : "Browser storage is unavailable. This result will be lost after refresh.";

  container.append(
    backLink,
    hero,
    dashboard,
    actions,
    review,
    savedNotice,
  );
}
