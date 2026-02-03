import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { saveLocalFile } from "../../../lib/storage";
import path from "path";

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg"
];

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const sessionId = formData.get("sessionId") as string | null;
  const questionId = formData.get("questionId") as string | null;

  if (!file || !sessionId || !questionId) {
    return NextResponse.json({ error: "Missing file or metadata" }, { status: 400 });
  }

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = `${sessionId}-${Date.now()}-${file.name}`.replace(/\s+/g, "-");
  const storagePath = await saveLocalFile(safeName, buffer);

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
