function createTestCard(test) {
  const article = document.createElement("article");
  article.className = "test-card";

  const content = document.createElement("div");
  content.className = "test-card__content";

  const title = document.createElement("h2");
  title.textContent = test.title;

  const description = document.createElement("p");
  description.className = "test-card__description";
  description.textContent = test.description;

  const metadata = document.createElement("p");
  metadata.className = "test-card__meta";

  const metadataParts = [];
  if (Number.isInteger(test.sectionCount)) {
    metadataParts.push(
      `${test.sectionCount} ${test.sectionCount === 1 ? "section" : "sections"}`,
    );
  }
  if (Number.isInteger(test.questionCount)) {
    metadataParts.push(
      `${test.questionCount} ${test.questionCount === 1 ? "question" : "questions"}`,
    );
  }
  metadata.textContent =
    metadataParts.length > 0 ? metadataParts.join(" \u00b7 ") : "Practice test";

  content.append(title, description, metadata);

  const action = document.createElement("a");
  action.className = "test-card__action";
  action.href = `./?test=${encodeURIComponent(test.id)}`;
  action.textContent = "View test details";
  action.setAttribute("aria-label", `View details for ${test.title}`);

  article.append(content, action);
  return article;
}

export function renderCatalog(container, catalog) {
  container.replaceChildren();
  container.setAttribute("aria-busy", "false");

  const intro = document.createElement("section");
  intro.className = "page-intro";

  const title = document.createElement("h1");
  title.textContent = "Choose a practice test";

  const copy = document.createElement("p");
  copy.className = "page-intro__copy";
  copy.textContent =
    "Open a test, review its sections, and begin when the runner is available.";

  intro.append(title, copy);
  container.append(intro);

  const publishedTests = catalog.tests.filter(
    (test) => test.published !== false,
  );

  if (publishedTests.length === 0) {
    const emptyState = document.createElement("section");
    emptyState.className = "empty-state";

    const emptyTitle = document.createElement("h2");
    emptyTitle.textContent = "No tests are available yet";

    const emptyCopy = document.createElement("p");
    emptyCopy.textContent = "Published tests will appear here.";

    emptyState.append(emptyTitle, emptyCopy);
    container.append(emptyState);
    return;
  }

  const list = document.createElement("section");
  list.className = "catalog-list";
  list.setAttribute("aria-label", "Available tests");

  publishedTests.forEach((test) => {
    list.append(createTestCard(test));
  });

  container.append(list);
}
