import { t, tn } from "../core/i18n.js?v=20260612-catalog-social";
import { renderSocialBlock } from "./social-block.js?v=20260612-catalog-social";

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
    metadataParts.push(tn("catalog.section", test.sectionCount));
  }
  if (Number.isInteger(test.questionCount)) {
    metadataParts.push(tn("catalog.question", test.questionCount));
  }
  metadata.textContent =
    metadataParts.length > 0
      ? metadataParts.join(" \u00b7 ")
      : t("catalog.practiceTest");

  content.append(title, description, metadata);

  const action = document.createElement("a");
  action.className = "test-card__action";
  action.href = `./?test=${encodeURIComponent(test.id)}`;
  action.textContent = t("catalog.open");
  action.setAttribute("aria-label", t("catalog.openLabel", { title: test.title }));

  article.append(content, action);
  return article;
}

export function renderCatalog(container, catalog) {
  container.replaceChildren();
  container.setAttribute("aria-busy", "false");

  const intro = document.createElement("section");
  intro.className = "page-intro";

  const title = document.createElement("h1");
  title.textContent = t("catalog.title");

  const copy = document.createElement("p");
  copy.className = "page-intro__copy";
  copy.textContent = t("catalog.description");

  intro.append(title, copy);
  container.append(intro);

  const socialBlock = renderSocialBlock(catalog, "catalog");
  if (socialBlock) {
    socialBlock.classList.add("social-block--catalog");
    container.append(socialBlock);
  }

  const publishedTests = catalog.tests.filter(
    (test) => test.published !== false,
  );

  if (publishedTests.length === 0) {
    const emptyState = document.createElement("section");
    emptyState.className = "empty-state";

    const emptyTitle = document.createElement("h2");
    emptyTitle.textContent = t("catalog.emptyTitle");

    const emptyCopy = document.createElement("p");
    emptyCopy.textContent = t("catalog.emptyMessage");

    emptyState.append(emptyTitle, emptyCopy);
    container.append(emptyState);
    return;
  }

  const list = document.createElement("section");
  list.className = "catalog-list";
  list.setAttribute("aria-label", t("catalog.listLabel"));

  publishedTests.forEach((test) => {
    list.append(createTestCard(test));
  });

  container.append(list);
}
