"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  questionnaireData,
  getSectionQuestions,
  getEvidenceChecklist,
  getVisibleQuestions
} from "../lib/questionnaire";
import { buildSchema } from "../lib/validation";
import { Stepper } from "./Stepper";
import { QuestionField } from "./QuestionField";
import { AutosaveIndicator } from "./AutosaveIndicator";

const AUTO_SAVE_MS = 4000;

export type WizardProps = {
  sessionId: string;
  token: string;
  initialValues: Record<string, unknown>;
};

export function Wizard({ sessionId, token, initialValues }: WizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const allQuestions = questionnaireData.questions;
  const schema = useMemo(() => buildSchema(allQuestions), [allQuestions]);

  const form = useForm<Record<string, unknown>>({
    defaultValues: initialValues,
    resolver: zodResolver(schema),
    mode: "onBlur"
  });

  const values = form.watch();

  const steps = questionnaireData.sections.map((section) => section.title);
  const currentSection = questionnaireData.sections[currentStep];

  const sectionQuestions = useMemo(
    () => getSectionQuestions(currentSection.id, values),
    [currentSection.id, values]
  );

  const evidenceChecklist = useMemo(() => getEvidenceChecklist(values), [values]);

  async function saveAnswers() {
    setAutosaveState("saving");
    try {
      const response = await fetch(`/api/sessions/${sessionId}/answers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: form.getValues() })
      });
      if (!response.ok) {
        throw new Error("Autosave failed");
      }
      setAutosaveState("saved");
    } catch (error) {
      setAutosaveState("error");
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveAnswers();
    }, AUTO_SAVE_MS);
    return () => clearTimeout(timeout);
  }, [values]);

  async function handleNext() {
    const fields = sectionQuestions.map((question) => question.id);
    const isValid = await form.trigger(fields as any, { shouldFocus: true });
    if (!isValid) {
      return;
    }
    await saveAnswers();
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  async function handleBack() {
    await saveAnswers();
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function handleSubmit() {
    setSubmitError(null);
    const requiredFields = getVisibleQuestions(values)
      .filter((question) => question.required)
      .map((question) => question.id);
    const isValid = await form.trigger(requiredFields as any, { shouldFocus: true });
    if (!isValid) {
      return;
    }
    await saveAnswers();
    const response = await fetch(`/api/sessions/${sessionId}/submit`, {
      method: "POST"
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setSubmitError(body?.error ?? "Submission failed");
      return;
    }
    router.push(`/complete/${sessionId}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="badge">Session {sessionId.slice(0, 8).toUpperCase()}</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">{currentSection.title}</h1>
          <p className="mt-2 text-slate-600">{currentSection.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <AutosaveIndicator state={autosaveState} />
          {currentStep >= 1 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
              <p className="font-semibold text-ink">Save & resume</p>
              <p>Token: {token}</p>
              <p className="mt-1">Resume at /start</p>
            </div>
          )}
        </div>
      </div>

      <Stepper steps={steps} currentStep={currentStep} />

      <div className="card rounded-3xl p-8">
        <div className="space-y-6">
          {sectionQuestions.map((question) => (
            <QuestionField key={question.id} question={question} form={form} sessionId={sessionId} />
          ))}

          {currentSection.id === "evidence" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-ink">Recommended evidence checklist</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {evidenceChecklist.map((item) => (
                  <li key={item.id} className="rounded-xl border border-slate-100 bg-mist px-3 py-2">
                    <p className="font-semibold text-ink">{item.label}</p>
                    {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentSection.id === "review" && submitError && (
            <p className="text-sm text-red-600">{submitError}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button className="btn-secondary" onClick={handleBack} disabled={currentStep === 0}>
          Back
        </button>
        {currentStep < steps.length - 1 ? (
          <button className="btn-primary" onClick={handleNext}>
            Next
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSubmit}>
            Submit assessment
          </button>
        )}
      </div>
    </div>
  );
}
