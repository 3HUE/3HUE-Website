import { Question } from "../lib/questionnaire";
import { Controller, UseFormReturn } from "react-hook-form";
import { FileUpload } from "./FileUpload";

export function QuestionField({
  question,
  form,
  sessionId
}: {
  question: Question;
  form: UseFormReturn<Record<string, unknown>>;
  sessionId: string;
}) {
  const {
    register,
    control,
    formState: { errors },
    setValue,
    watch
  } = form;

  const error = errors[question.id]?.message as string | undefined;
  const value = watch(question.id);

  if (question.type === "textarea") {
    return (
      <div className="space-y-2">
        <label className="label" htmlFor={question.id}>
          {question.label}
        </label>
        <textarea id={question.id} className="input min-h-[120px]" {...register(question.id)} />
        {question.helper && <p className="helper">{question.helper}</p>}
        {error && <p className="helper text-red-600">{error}</p>}
      </div>
    );
  }

  if (question.type === "select") {
    return (
      <div className="space-y-2">
        <label className="label" htmlFor={question.id}>
          {question.label}
        </label>
        <select id={question.id} className="input" {...register(question.id)}>
          <option value="">Select</option>
          {question.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {question.helper && <p className="helper">{question.helper}</p>}
        {error && <p className="helper text-red-600">{error}</p>}
      </div>
    );
  }

  if (question.type === "multiselect") {
    return (
      <div className="space-y-2">
        <label className="label">{question.label}</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options?.map((option) => (
            <label key={option.value} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <input
                type="checkbox"
                value={option.value}
                {...register(question.id)}
                className="h-4 w-4"
              />
              <span className="text-sm text-ink">{option.label}</span>
            </label>
          ))}
        </div>
        {question.helper && <p className="helper">{question.helper}</p>}
        {error && <p className="helper text-red-600">{error}</p>}
      </div>
    );
  }

  if (question.type === "checkbox") {
    return (
      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3">
        <input type="checkbox" className="mt-1 h-4 w-4" {...register(question.id)} />
        <span className="text-sm text-ink">{question.label}</span>
        {error && <p className="helper text-red-600">{error}</p>}
      </label>
    );
  }

  if (question.type === "file") {
    return (
      <div className="space-y-2">
        <label className="label">{question.label}</label>
        <Controller
          control={control}
          name={question.id}
          render={() => (
            <FileUpload
              sessionId={sessionId}
              questionId={question.id}
              onUploaded={(fileInfo) => {
                const current = (value as string[]) || [];
                setValue(question.id, [...current, fileInfo.filename], { shouldDirty: true });
              }}
            />
          )}
        />
        {Array.isArray(value) && value.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {value.map((file: string) => (
              <li key={file}>{file}</li>
            ))}
          </ul>
        )}
        {question.helper && <p className="helper">{question.helper}</p>}
        {error && <p className="helper text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="label" htmlFor={question.id}>
        {question.label}
      </label>
      <input
        id={question.id}
        type={question.type === "number" ? "number" : question.type === "email" ? "email" : "text"}
        className="input"
        {...register(question.id)}
      />
      {question.helper && <p className="helper">{question.helper}</p>}
      {error && <p className="helper text-red-600">{error}</p>}
    </div>
  );
}
