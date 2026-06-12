export function toOptionIdArray(value) {
  if (typeof value === "string") {
    return value ? [value] : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item) => typeof item === "string" && item))];
}

export function normalizeQuestionAnswer(question, value) {
  const validOptionIds = new Set(
    question.options.map((option) => option.id),
  );
  const selected = toOptionIdArray(value).filter((optionId) =>
    validOptionIds.has(optionId),
  );

  return question.type === "single-choice" ? selected.slice(0, 1) : selected;
}

export function isAnsweredValue(value) {
  return toOptionIdArray(value).length > 0;
}

export function optionSetsMatch(selected, correct) {
  const selectedIds = toOptionIdArray(selected);
  const correctIds = toOptionIdArray(correct);

  return (
    selectedIds.length === correctIds.length &&
    selectedIds.every((optionId) => correctIds.includes(optionId))
  );
}
