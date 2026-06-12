import { en } from "./locales/en.js?v=20260612-catalog-social";
import { kk } from "./locales/kk.js?v=20260612-catalog-social";

export const DEFAULT_LOCALE = "ru";
export const UI_LANGUAGE_KEY = "test-platform:ui-language";
export const SUPPORTED_LOCALES = ["ru", "kk", "en"];

const dictionaries = {
  ru: {
    meta: {
      catalogTitle: "Доступные тесты | OpenTest",
    },
    shell: {
      description: "Статическая платформа для прохождения тренировочных тестов.",
      skipToContent: "Перейти к содержимому",
      homeLabel: "Главная страница OpenTest",
      primaryNavigation: "Основная навигация",
      availableTests: "Доступные тесты",
      about: "О платформе",
      loadingLabel: "Загрузка",
      loadingTitle: "Подготавливаем каталог тестов",
      loadingMessage: "Загружаем актуальный каталог с этого сайта.",
      footerPlatform: "Статическая тестовая платформа",
      footerAccount: "Регистрация не требуется",
      noscript: "Для загрузки каталога тестов OpenTest требуется JavaScript.",
      languageSwitcher: "Язык интерфейса",
      languageChanged: "Язык интерфейса изменён",
    },
    catalog: {
      title: "Выберите тренировочный тест",
      description:
        "Откройте тест, ознакомьтесь с его разделами и начните прохождение.",
      emptyTitle: "Доступных тестов пока нет",
      emptyMessage: "Опубликованные тесты появятся здесь.",
      listLabel: "Доступные тесты",
      open: "Открыть тест",
      openLabel: "Открыть тест «{title}»",
      practiceTest: "Тренировочный тест",
      section: {
        one: "{count} раздел",
        few: "{count} раздела",
        many: "{count} разделов",
      },
      question: {
        one: "{count} вопрос",
        few: "{count} вопроса",
        many: "{count} вопросов",
      },
    },
    resources: {
      json: "JSON-ресурс",
      catalog: "Каталог тестов",
      test: "Тест «{title}»",
    },
    errors: {
      CATALOG_NOT_FOUND: {
        label: "Каталог не найден",
        title: "Не удалось найти каталог тестов",
        action: "Попробовать загрузить каталог снова",
      },
      CATALOG_INVALID_JSON: {
        label: "Ошибка каталога",
        title: "Каталог тестов содержит некорректный JSON",
        action: "Попробовать загрузить каталог снова",
      },
      MISSING_TEST_ID: {
        label: "Не указан ID теста",
        title: "Не удалось определить нужный тест",
        action: "Выбрать тест из каталога",
      },
      TEST_NOT_FOUND: {
        label: "Тест не найден",
        title: "Этот тест недоступен",
        action: "Вернуться к каталогу тестов",
      },
      TEST_FILE_NOT_FOUND: {
        label: "Файл теста не найден",
        title: "Не удалось найти файл выбранного теста",
        action: "Вернуться к каталогу тестов",
      },
      TEST_INVALID_JSON: {
        label: "Ошибка файла теста",
        title: "Выбранный тест содержит некорректный JSON",
        action: "Вернуться к каталогу тестов",
      },
      CATALOG_SCHEMA_INVALID: {
        label: "Ошибка структуры каталога",
        title: "Каталог тестов имеет некорректную структуру",
        action: "Попробовать загрузить каталог снова",
      },
      TEST_SCHEMA_INVALID: {
        label: "Ошибка структуры теста",
        title: "Выбранный тест имеет некорректную структуру",
        action: "Вернуться к каталогу тестов",
      },
      fallback: {
        label: "Ошибка загрузки",
        title: "Не удалось подготовить страницу",
        action: "Вернуться к каталогу тестов",
      },
      technicalDetails: "Технические сведения",
      unexpected:
        "Во время подготовки страницы произошла непредвиденная ошибка. Попробуйте ещё раз.",
      missingTestId:
        "Добавьте ID после ?test= или выберите опубликованный тест из каталога.",
      testNotFound: "В каталоге нет опубликованного теста с ID «{testId}».",
      testMismatch: "Выбранный тест не соответствует записи в каталоге.",
      catalogId: "ID в каталоге: {id}",
      testFileId: "ID в файле теста: {id}",
      network:
        "Не удалось получить ресурс «{resource}». Проверьте подключение и попробуйте ещё раз.",
      notFound: "Ресурс «{resource}» не найден.",
      http: "Не удалось загрузить ресурс «{resource}» (HTTP {status}).",
      malformedJson: "Ресурс «{resource}» содержит некорректный JSON.",
      httpStatus: "Статус HTTP: {status}",
      requestedUrl: "Запрошенный URL: {url}",
    },
    runner: {
      retry: "Повторить",
      imageLoadFailed: "Не удалось загрузить изображение к вопросу.",
      audioLoadFailed: "Не удалось загрузить аудио к вопросу.",
      questionAudio: "Аудио к вопросу",
      navigator: "Навигация по вопросам",
        navigationLabel:
          "Вопрос {current} из {total}: {section}, вопрос {sectionCurrent} в разделе{answered}",
        answeredSuffix: ", дан ответ",
        unansweredSuffix: ", без ответа",
        testProgress: "Прогресс теста",
        yourProgress: "Ваш прогресс",
        questionProgress: "Вопрос {current} из {total}",
        answeredProgress: "Отвечено: {answered} из {total}",
        totalProgress:
          "Отвечено на {answered} из {total} вопросов, {percentage}%",
        currentSection: "Текущий раздел",
        sectionQuestionProgress: "Вопрос в разделе: {current} из {total}",
        sectionAnsweredProgress:
          "В разделе отвечено: {answered} из {total}",
        sectionProgress:
          "В разделе «{section}» отвечено на {answered} из {total} вопросов, {percentage}%",
      navigationNote: "Можно переходить между вопросами, не выбирая ответ.",
      finish: "Завершить тест",
      resetSection: "Сбросить текущий раздел",
      resetTest: "Пройти тест заново",
      chooseOne: "Выберите один ответ",
      chooseMany: "Выберите один или несколько ответов",
      previous: "Назад",
      next: "Далее",
      storageTitle: "Не удалось сохранить прогресс",
      storageMessage:
        "Хранилище браузера недоступно. Вы можете продолжить, но после обновления страницы ответы и текущий вопрос будут потеряны.",
      incompatibleLabel: "Сохранённый прогресс требует внимания",
      incompatibleTitle: "Тест был обновлён",
      incompatibleMessage:
        "Сохранённый прогресс для старой версии теста «{title}» нельзя использовать с версией {version}. Удалите старую попытку, чтобы начать заново.",
      discardOldAttempt: "Удалить старую попытку и начать заново",
      resetTestConfirm:
        "Начать тест заново? Все сохранённые ответы, прогресс и результаты этого теста будут удалены.",
      backToTests: "Вернуться ко всем тестам",
      resetSectionConfirm:
        "Сбросить раздел «{section}»? Ответы в этом разделе будут удалены, а ответы в остальных разделах сохранятся.",
      unansweredSubmit: {
        one: "{count} вопрос остался без ответа. Всё равно завершить тест?",
        few: "{count} вопроса остались без ответа. Всё равно завершить тест?",
        many: "{count} вопросов остались без ответа. Всё равно завершить тест?",
      },
    },
    results: {
      status: {
        correct: "Верно",
        incorrect: "Неверно",
        unanswered: "Без ответа",
      },
      sectionUnavailable: "Раздел недоступен",
      questionUnavailable: "Вопрос недоступен",
      yourAnswer: "Ваш ответ",
      yourAnswers: "Ваши ответы",
      correctAnswer: "Правильный ответ",
      correctAnswers: "Правильные ответы",
      multipleChoiceNote: "В этом вопросе может быть несколько правильных ответов.",
      explanation: "Объяснение",
      points: "Баллы",
      noAnswer: "Ответ не выбран",
      answerUnavailable: "Ответ недоступен",
      noExplanation: "Объяснение не добавлено.",
      sectionScore: "Результат раздела «{section}»",
      complete: "Тест завершён",
      submitted: "Завершён: {date}",
      pointsScore: "{earned} из {total} баллов",
      totalScore: "Общий результат",
      answerCounts: "Количество ответов",
      scoreBySection: "Результаты по разделам",
      reviewAnswers: "Посмотреть ответы",
      resetTest: "Пройти тест заново",
      reviewTitle: "Разбор ответов",
      reviewDescription:
        "Сравните свои ответы с правильными ответами и объяснениями.",
      reviewShown: "Разбор ответов открыт",
      saved:
        "Результат сохранён в этом браузере. Чтобы пройти тест ещё раз, сбросьте всю попытку.",
      notSaved:
        "Хранилище браузера недоступно. После обновления страницы результат будет потерян.",
    },
    validation: {
      catalogName: "Каталог тестов",
      testName: "Выбранный тест",
      failed: "Ресурс «{resource}» не прошёл проверку.",
      rootObject: "Корневое значение должно быть объектом.",
      catalogRootObject: "Корневое значение каталога должно быть объектом.",
      schemaVersion: "schemaVersion должен быть равен {version}.",
      idFormat:
        "{path} должен содержать строчные латинские буквы, цифры и одиночные дефисы.",
      mediaObject: "{path} должен быть объектом, если он указан.",
      imageObject: "{path}.image должен быть объектом.",
      imagePath: "{path}.image.src должен быть безопасным относительным путём.",
      imageAlt: "{path}.image.alt обязателен для доступности.",
      audioObject: "{path}.audio должен быть объектом.",
      audioPath: "{path}.audio.src должен быть безопасным относительным путём.",
      audioCaption: "{path}.audio.caption должен быть строкой, если он указан.",
      object: "{path} должен быть объектом.",
      duplicateQuestion: "{path}.id повторяет ID вопроса «{id}».",
      questionType:
        "{path}.type должен быть равен «single-choice» или «multiple-choice».",
      required: "Поле {path} обязательно.",
      points: "{path}.points должен быть числом больше нуля.",
      options: "{path}.options должен содержать не менее двух вариантов.",
      duplicateOption: "{path}.id повторяет ID варианта «{id}».",
      correctOptionsArray:
        "{path}.correctOptionIds должен быть массивом.",
      correctOptionCountSingle:
        "{path}.correctOptionIds должен содержать ровно один ID варианта для вопроса с одним ответом.",
      correctOptionCountMultiple:
        "{path}.correctOptionIds должен содержать хотя бы один ID варианта для вопроса с несколькими ответами.",
      duplicateCorrectOption:
        "{path}.correctOptionIds не должен содержать повторяющиеся ID.",
      missingCorrectOption:
        "{path}.correctOptionIds ссылается на несуществующий вариант.",
      testsArray: "Поле tests должно быть массивом.",
      duplicateTest: "{path}.id повторяет ID теста «{id}».",
      catalogFilePath:
        "{path}.file должен быть безопасным путём относительно index.json.",
      publishedBoolean:
        "{path}.published должен быть true или false, если он указан.",
      version: "version должен быть положительным целым числом.",
      headerLinksArray: "Поле headerLinks должно быть массивом.",
      unsupportedProtocol: "{path}.url использует неподдерживаемый протокол.",
      invalidUrl: "{path}.url не является корректным URL.",
      sections: "Поле sections должно содержать хотя бы один раздел.",
      duplicateSection: "{path}.id повторяет ID раздела «{id}».",
      descriptionText:
        "{path}.description должен быть строкой, если он указан.",
      questions: "{path}.questions должен содержать хотя бы один вопрос.",
      socialBlockObject: "Поле socialBlock должно быть объектом, если оно указано.",
      socialEnabled:
        "Поле socialBlock.enabled должно быть true или false.",
      socialTitle:
        "Поле socialBlock.title обязательно, когда социальный блок включён.",
      socialLinks:
        "Поле socialBlock.links должно быть непустым массивом, когда социальный блок включён.",
      socialStyle:
        "{path}.style должен быть равен telegram, whatsapp, primary или secondary.",
      socialUrl:
        "{path}.url должен быть корректным внешним HTTP(S)-адресом.",
      watermarkObject:
        "Поле watermark должно быть объектом, если оно указано.",
      watermarkEnabled:
        "Поле watermark.enabled должно быть true или false.",
      watermarkText:
        "Поле watermark.text должно быть строкой, если оно указано.",
      watermarkOpacity:
        "Поле watermark.opacity должно быть числом от 0 до 1.",
      watermarkSize:
        "Поле watermark.size должно быть равно small, medium или large.",
    },
  },
  kk,
  en,
};

let currentLocale = DEFAULT_LOCALE;

function getValue(dictionary, key) {
  return key.split(".").reduce((value, part) => value?.[part], dictionary);
}

function interpolate(template, variables) {
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.hasOwn(variables, name) ? String(variables[name]) : match,
  );
}

function getPluralForm(count, locale = currentLocale) {
  if (locale === "en") {
    return Math.abs(count) === 1 ? "one" : "many";
  }
  if (locale === "kk") {
    return "many";
  }

  const absolute = Math.abs(count);
  const mod10 = absolute % 10;
  const mod100 = absolute % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "one";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "few";
  }
  return "many";
}

export function setLocale(locale) {
  currentLocale = dictionaries[locale] ? locale : DEFAULT_LOCALE;

  if (typeof document !== "undefined") {
    document.documentElement.lang = currentLocale;
  }
}

export function loadSavedLocale() {
  try {
    const saved = window.localStorage.getItem(UI_LANGUAGE_KEY);
    return SUPPORTED_LOCALES.includes(saved) ? saved : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function saveLocale(locale) {
  const normalized = SUPPORTED_LOCALES.includes(locale)
    ? locale
    : DEFAULT_LOCALE;
  setLocale(normalized);

  try {
    window.localStorage.setItem(UI_LANGUAGE_KEY, normalized);
  } catch {
    // Language switching still works for the current page session.
  }

  return normalized;
}

export function getLocale() {
  return currentLocale;
}

export function t(key, variables = {}, locale = currentLocale) {
  const value =
    getValue(dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE], key) ??
    getValue(dictionaries[DEFAULT_LOCALE], key);

  if (typeof value !== "string") {
    return key;
  }

  return interpolate(value, variables);
}

export function tn(key, count, variables = {}, locale = currentLocale) {
  return t(
    `${key}.${getPluralForm(count, locale)}`,
    { count, ...variables },
    locale,
  );
}

export function formatDateTime(value, locale = currentLocale) {
  const localeTag = {
    ru: "ru-RU",
    kk: "kk-KZ",
    en: "en-US",
  }[locale] ?? locale;

  return new Intl.DateTimeFormat(localeTag, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function translateDocument(
  root = typeof document !== "undefined" ? document : null,
) {
  if (!root) {
    return;
  }

  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });

  root.querySelectorAll("[data-i18n-content]").forEach((element) => {
    element.setAttribute("content", t(element.dataset.i18nContent));
  });
}
