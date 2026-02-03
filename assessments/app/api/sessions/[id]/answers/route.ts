import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const answers = body?.answers ?? {};

  const entries = Object.entries(answers) as [string, unknown][];

  if (entries.length > 0) {
    await prisma.$transaction(
      entries.map(([questionId, valueJson]) =>
        prisma.answer.upsert({
          where: {
            sessionId_questionId: {
              sessionId: params.id,
              questionId
            }
          },
          update: {
            valueJson
          },
          create: {
            sessionId: params.id,
            questionId,
            valueJson
          }
        })
      )
    );
  }

  const session = await prisma.session.update({
    where: { id: params.id },
    data: { updatedAt: new Date() }
  });

  return NextResponse.json({
    id: session.id,
    updatedAt: session.updatedAt
  });
}
