export function AutosaveIndicator({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  const label =
    state === "saving"
      ? "Saving…"
      : state === "saved"
        ? "Saved"
        : state === "error"
          ? "Save failed"
          : "Autosave idle";

  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </span>
  );
}
