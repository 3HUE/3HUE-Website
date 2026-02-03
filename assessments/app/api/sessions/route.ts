import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { token }
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ id: session.id, token: session.token });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = body?.email ?? null;
  const token = crypto.randomBytes(16).toString("hex");

  const session = await prisma.session.create({
    data: {
      token,
      email
    }
  });

  return NextResponse.json({
    id: session.id,
    token: session.token
  });
}
