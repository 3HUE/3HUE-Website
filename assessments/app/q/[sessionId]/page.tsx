import { prisma } from "../../../lib/prisma";
import { Wizard } from "../../../components/Wizard";

export const dynamic = "force-dynamic";

export default async function QuestionnairePage({
  params
}: {
  params: { sessionId: string };
}) {
  const session = await prisma.session.findUnique({
    where: { id: params.sessionId },
    include: { answers: true }
  });

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-20">
        <div className="card rounded-3xl p-10 text-center">
          <h1 className="text-2xl font-semibold text-ink">Session not found</h1>
          <p className="mt-2 text-slate-600">Return to /start to create a new session.</p>
        </div>
      </main>
    );
  }

  const initialValues: Record<string, unknown> = {};
  session.answers.forEach((answer) => {
    initialValues[answer.questionId] = answer.valueJson;
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16">
      <Wizard sessionId={session.id} token={session.token} initialValues={initialValues} />
    </main>
  );
}
