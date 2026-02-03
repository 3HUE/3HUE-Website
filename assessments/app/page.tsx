import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-8 px-6 py-20 text-center">
      <div className="card w-full max-w-3xl rounded-3xl p-10">
        <p className="badge">Cyber Risk Assessment</p>
        <h1 className="mt-4 text-4xl font-semibold text-ink">Risk Assessment Onboarding Questionnaire</h1>
        <p className="mt-4 text-lg text-slate-600">
          Capture scope, environment, compliance drivers, and evidence in one guided flow. Autosave keeps
          progress safe while you gather inputs.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link className="btn-primary" href="/start">Start a new session</Link>
          <Link className="btn-secondary" href="/admin/sessions">Admin sessions</Link>
        </div>
      </div>
      <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        {["Schema-driven wizard", "Autosave + resume", "Delivery tracking"].map((item) => (
          <div key={item} className="card rounded-2xl px-6 py-5 text-left">
            <p className="text-sm font-semibold text-slate-500">Capability</p>
            <p className="mt-2 text-lg font-semibold text-ink">{item}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
