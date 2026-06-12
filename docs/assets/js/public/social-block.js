const SAFE_STYLES = new Set([
  "telegram",
  "whatsapp",
  "primary",
  "secondary",
]);

function isSafeExternalUrl(value) {
  try {
    return (
      typeof value === "string" &&
      ["http:", "https:"].includes(new URL(value).protocol)
    );
  } catch {
    return false;
  }
}

export function renderSocialBlock(test) {
  const config = test?.socialBlock;

  if (
    !config?.enabled ||
    typeof config.title !== "string" ||
    !Array.isArray(config.links)
  ) {
    return null;
  }

  const links = config.links.filter(
    (link) =>
      link &&
      typeof link.label === "string" &&
      isSafeExternalUrl(link.url) &&
      SAFE_STYLES.has(link.style),
  );

  if (links.length === 0) {
    return null;
  }

  const section = document.createElement("aside");
  section.className = "social-block";
  section.setAttribute("aria-labelledby", `social-block-${test.id}`);

  const title = document.createElement("h2");
  title.id = `social-block-${test.id}`;
  title.textContent = config.title;

  const list = document.createElement("ul");
  list.className = "social-block__links";

  links.forEach((link) => {
    const item = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.className = `social-block__link social-block__link--${link.style}`;
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.label;
    item.append(anchor);
    list.append(item);
  });

  section.append(title, list);
  return section;
}
