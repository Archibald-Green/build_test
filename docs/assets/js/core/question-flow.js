export function createQuestionFlow(test) {
  return test.sections.flatMap((section, sectionIndex) =>
    section.questions.map((question, sectionQuestionIndex) => ({
      section,
      sectionIndex,
      sectionQuestionIndex,
      sectionQuestionCount: section.questions.length,
      question,
    })),
  );
}
