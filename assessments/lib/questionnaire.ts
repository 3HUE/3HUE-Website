import questionnaire from "../data/questionnaire.v1.json";

export type Condition = {
  questionId: string;
  operator: "equals" | "includes" | "notEquals";
  value: string | number | boolean;
};

export type QuestionOption = {
  label: string;
  value: string;
};

export type Question = {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "select" | "multiselect" | "checkbox" | "textarea" | "file";
  options?: QuestionOption[];
  helper?: string;
  required?: boolean;
  showIf?: Condition[];
  section: string;
};

export type Section = {
  id: string;
  title: string;
  description: string;
};

export type Questionnaire = {
  version: string;
  sections: Section[];
  questions: Question[];
  evidenceChecklist: {
    id: string;
    label: string;
    description?: string;
    showIf?: Condition[];
  }[];
};

export const questionnaireData = questionnaire as Questionnaire;

export function evaluateCondition(condition: Condition, value: unknown) {
  if (condition.operator === "equals") {
    return value === condition.value;
  }
  if (condition.operator === "notEquals") {
    return value !== condition.value;
  }
  if (condition.operator === "includes") {
    if (Array.isArray(value)) {
      return value.includes(condition.value);
    }
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim()).includes(String(condition.value));
    }
  }
  return false;
}

export function isQuestionVisible(question: Question, values: Record<string, unknown>) {
  if (!question.showIf || question.showIf.length === 0) {
    return true;
  }
  return question.showIf.every((condition) =>
    evaluateCondition(condition, values[condition.questionId])
  );
}

export function getVisibleQuestions(values: Record<string, unknown>) {
  return questionnaireData.questions.filter((question) => isQuestionVisible(question, values));
}

export function getSectionQuestions(sectionId: string, values: Record<string, unknown>) {
  return getVisibleQuestions(values).filter((question) => question.section === sectionId);
}

export function getEvidenceChecklist(values: Record<string, unknown>) {
  return questionnaireData.evidenceChecklist.filter((item) => {
    if (!item.showIf || item.showIf.length === 0) {
      return true;
    }
    return item.showIf.every((condition) =>
      evaluateCondition(condition, values[condition.questionId])
    );
  });
}
