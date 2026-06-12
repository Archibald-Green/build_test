function getAnswersObject(answers) {
  return answers instanceof Map ? Object.fromEntries(answers) : answers ?? {};
}

function getQuestionPoints(question) {
  return typeof question.points === "number" && question.points > 0
    ? question.points
    : 1;
}

export function calculateResult(test, answers) {
  const answerMap = getAnswersObject(answers);
  const counts = {
    correct: 0,
    incorrect: 0,
    unanswered: 0,
  };
  const sections = [];
  const questions = [];
  let earnedPoints = 0;
  let totalPoints = 0;

  test.sections.forEach((section) => {
    const sectionResult = {
      sectionId: section.id,
      sectionTitle: section.title,
      earnedPoints: 0,
      totalPoints: 0,
      correct: 0,
      incorrect: 0,
      unanswered: 0,
    };

    section.questions.forEach((question) => {
      const questionPoints = getQuestionPoints(question);
      const selectedOptionId = answerMap[question.id] ?? null;
      const correctOptionId = question.correctOptionIds[0];
      const status =
        selectedOptionId === null
          ? "unanswered"
          : selectedOptionId === correctOptionId
            ? "correct"
            : "incorrect";
      const questionEarnedPoints =
        status === "correct" ? questionPoints : 0;

      counts[status] += 1;
      sectionResult[status] += 1;
      earnedPoints += questionEarnedPoints;
      totalPoints += questionPoints;
      sectionResult.earnedPoints += questionEarnedPoints;
      sectionResult.totalPoints += questionPoints;

      questions.push({
        questionId: question.id,
        sectionId: section.id,
        status,
        selectedOptionId,
        correctOptionId,
        earnedPoints: questionEarnedPoints,
        totalPoints: questionPoints,
      });
    });

    sections.push(sectionResult);
  });

  return {
    earnedPoints,
    totalPoints,
    percentage:
      totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100),
    counts,
    sections,
    questions,
  };
}
