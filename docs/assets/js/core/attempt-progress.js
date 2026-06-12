function hasAnswer(answers, questionId) {
  if (answers instanceof Map || answers instanceof Set) {
    return answers.has(questionId);
  }

  return Object.hasOwn(answers ?? {}, questionId);
}

function getPercentage(answered, total) {
  return total === 0 ? 0 : Math.round((answered / total) * 100);
}

export function calculateAttemptProgress(flow, answers, currentSectionId) {
  const sectionItems = flow.filter(
    ({ section }) => section.id === currentSectionId,
  );
  const answeredTotal = flow.filter(({ question }) =>
    hasAnswer(answers, question.id),
  ).length;
  const answeredInSection = sectionItems.filter(({ question }) =>
    hasAnswer(answers, question.id),
  ).length;

  return {
    total: {
      answered: answeredTotal,
      questions: flow.length,
      percentage: getPercentage(answeredTotal, flow.length),
    },
    section: {
      answered: answeredInSection,
      questions: sectionItems.length,
      percentage: getPercentage(answeredInSection, sectionItems.length),
    },
  };
}
