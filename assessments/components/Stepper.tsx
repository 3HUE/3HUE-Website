import clsx from "clsx";

export function Stepper({
  steps,
  currentStep
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          return (
            <div
              key={step}
              className={clsx(
                "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                isActive && "border-tide bg-tide/10 text-tide",
                isComplete && "border-emerald-500 bg-emerald-50 text-emerald-700",
                !isActive && !isComplete && "border-slate-200 text-slate-500"
              )}
            >
              <span className="text-[10px]">{index + 1}</span>
              <span>{step}</span>
            </div>
          );
        })}
      </div>
      <div className="h-2 w-full rounded-full bg-mist">
        <div
          className="h-2 rounded-full bg-tide transition-all"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
