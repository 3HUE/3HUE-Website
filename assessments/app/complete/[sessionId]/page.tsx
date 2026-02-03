import Link from "next/link";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompletePage({
  params
}: {
  params: { sessionId: string };
}) {
  const session = await prisma.session.findUnique({
    where: { id: params.sessionId },
    include: { deliveries: true }
  });

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen items-center justify-center px-6 py-20">
        <div className="card rounded-3xl p-10 text-center">
          <h1 className="text-2xl font-semibold text-ink">Session not found</h1>
          <Link className="btn-primary mt-6" href="/start">
            Start a new session
          </Link>
        </div>
      </main>
    );
  }

  const delivery = session.deliveries[0];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="card rounded-3xl p-10">
        <p className="badge">Submission complete</p>
        <h1 className="mt-4 text-3xl font-semibold text-ink">Thanks for completing the onboarding</h1>
        <p className="mt-3 text-slate-600">
          We are preparing your assessment intake. You will receive follow-up within 1-2 business days.
        </p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm text-slate-600">
          <p className="font-semibold text-ink">Delivery status</p>
          <p>Status: {delivery?.status ?? "pending"}</p>
          {delivery?.externalId && <p>External reference: {delivery.externalId}</p>}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link className="btn-secondary" href="/start">
            Start new session
          </Link>
          <Link className="btn-primary" href="/admin/sessions">
            View session status
          </Link>
        </div>
      </div>
    </main>
  );
}
