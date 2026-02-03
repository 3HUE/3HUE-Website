import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSessionsPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    include: { deliveries: true }
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16">
      <div className="card rounded-3xl p-10">
        <h1 className="text-3xl font-semibold text-ink">Assessment sessions</h1>
        <p className="mt-2 text-slate-600">Track draft, submitted, and delivered onboarding sessions.</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Session</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Created</th>
                <th className="pb-3">Last saved</th>
                <th className="pb-3">Submitted</th>
                <th className="pb-3">Delivery</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const delivery = session.deliveries[0];
                return (
                  <tr key={session.id} className="border-b border-slate-100">
                    <td className="py-3 text-ink">{session.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-3 capitalize text-slate-600">{session.status}</td>
                    <td className="py-3 text-slate-600">{session.createdAt.toDateString()}</td>
                    <td className="py-3 text-slate-600">{session.updatedAt.toDateString()}</td>
                    <td className="py-3 text-slate-600">
                      {session.submittedAt ? session.submittedAt.toDateString() : "-"}
                    </td>
                    <td className="py-3 text-slate-600">
                      {delivery ? `${delivery.status}${delivery.externalId ? ` (${delivery.externalId})` : ""}` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
