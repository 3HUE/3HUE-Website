import { questionnaireData } from "./questionnaire";

export type ScoreResult = {
  total: number;
  bySection: Record<string, number>;
  riskSignals: string[];
};

export function computeScores(values: Record<string, unknown>): ScoreResult {
  const bySection: Record<string, number> = {};
  const riskSignals: string[] = [];

  questionnaireData.sections.forEach((section) => {
    bySection[section.id] = 0;
  });

  questionnaireData.questions.forEach((question) => {
    const value = values[question.id];
    if (value === undefined || value === null || value === "") {
      return;
    }
    bySection[question.section] += 1;
  });

  if (values.central_logging === "no") {
    riskSignals.push("No centralized logging in place.");
  }
  if (values.vuln_mgmt === "none") {
    riskSignals.push("No vulnerability management program.");
  }
  if (values.ir_plan === "no") {
    riskSignals.push("No incident response plan.");
  }

  const total = Object.values(bySection).reduce((sum, value) => sum + value, 0);

  return { total, bySection, riskSignals };
}
