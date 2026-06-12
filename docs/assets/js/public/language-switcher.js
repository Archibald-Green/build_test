import {
  getLocale,
  saveLocale,
  t,
  translateDocument,
} from "../core/i18n.js?v=20260612-catalog-social";

const LANGUAGE_LABELS = {
  ru: "Русский",
  kk: "Қазақша",
  en: "English",
};

export function initializeLanguageSwitcher(onChange) {
  const switcher = document.querySelector("#language-switcher");

  if (!switcher) {
    return;
  }

  switcher.setAttribute("aria-label", t("shell.languageSwitcher"));
  switcher.querySelectorAll("[data-locale]").forEach((button) => {
    const locale = button.dataset.locale;
    button.textContent = LANGUAGE_LABELS[locale];
    button.classList.toggle("is-active", locale === getLocale());
    button.setAttribute(
      "aria-pressed",
      locale === getLocale() ? "true" : "false",
    );

    button.addEventListener("click", () => {
      if (locale === getLocale()) {
        return;
      }

      saveLocale(locale);
      translateDocument();
      switcher.setAttribute("aria-label", t("shell.languageSwitcher"));
      switcher.querySelectorAll("[data-locale]").forEach((item) => {
        const active = item.dataset.locale === locale;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
      onChange?.(locale);
    });
  });
}
