import { z } from "zod";
import { Question } from "./questionnaire";

const base = {
  text: z.string(),
  email: z.string().email("Enter a valid email"),
  number: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number()
  ),
  select: z.string(),
  multiselect: z.array(z.string()),
  checkbox: z.boolean(),
  textarea: z.string(),
  file: z.array(z.string())
} as const;

export function buildSchema(questions: Question[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  questions.forEach((question) => {
    const fieldSchema = base[question.type] ?? z.any();
    if (question.required) {
      shape[question.id] = fieldSchema.refine(
        (value) => {
          if (question.type === "checkbox") {
            return value === true;
          }
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          if (typeof value === "string") {
            return value.trim().length > 0;
          }
          if (typeof value === "number") {
            return !Number.isNaN(value);
          }
          if (typeof value === "boolean") {
            return value === true || value === false;
          }
          return value !== undefined && value !== null;
        },
        { message: "This field is required" }
      );
    } else {
      shape[question.id] = fieldSchema.optional();
    }
  });

  return z.object(shape);
}
