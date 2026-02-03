import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const externalId = `EXT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  return NextResponse.json({
    externalId,
    received: body
  });
}
