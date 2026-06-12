import {
  isAnsweredValue,
  normalizeQuestionAnswer,
  optionSetsMatch,
} from "./answers.js";

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
      const selectedOptionIds = normalizeQuestionAnswer(
        question,
        answerMap[question.id],
      );
      const correctOptionIds = [...question.correctOptionIds];
      const status = !isAnsweredValue(selectedOptionIds)
        ? "unanswered"
        : optionSetsMatch(selectedOptionIds, correctOptionIds)
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
        questionType: question.type,
        status,
        selectedOptionIds,
        correctOptionIds,
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
