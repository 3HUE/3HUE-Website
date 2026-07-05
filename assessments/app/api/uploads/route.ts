import { NextResponse } from "next/server";
import { randomUUID, timingSafeEqual } from "crypto";
import { prisma } from "../../../lib/prisma";
import { saveLocalFile } from "../../../lib/storage";
import path from "path";

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg"
];

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

function timingSafeEqualStrings(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const sessionId = formData.get("sessionId") as string | null;
  const questionId = formData.get("questionId") as string | null;
  const token = formData.get("token") as string | null;

  if (!file || !sessionId || !questionId || !token) {
    return NextResponse.json({ error: "Missing file or metadata" }, { status: 400 });
  }

  // The upload's session token is the caller's proof they own this session —
  // same capability the app already hands out at session creation and uses
  // to resume a session, so every write against a sessionId must present it.
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session || !timingSafeEqualStrings(token, session.token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // Store under a random name, independent of any client-supplied filename,
  // so nothing derived from user input ever reaches the filesystem path.
  // The original filename is preserved separately for display (`filename`
  // column below) but never used to build a path.
  const ext = path.extname(file.name).slice(0, 16).replace(/[^a-zA-Z0-9.]/g, "");
  const storageName = `${sessionId}-${randomUUID()}${ext}`;
  const storagePath = await saveLocalFile(storageName, buffer);

  const upload = await prisma.upload.create({
    data: {
      sessionId,
      questionId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      storagePath: path.relative(process.cwd(), storagePath)
    }
  });

  return NextResponse.json({
    id: upload.id,
    filename: upload.filename,
    storagePath: upload.storagePath
  });
}
