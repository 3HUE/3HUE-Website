import fs from "fs/promises";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");

export async function ensureUploadDir() {
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

export async function saveLocalFile(filename: string, buffer: Buffer) {
  await ensureUploadDir();
  const storagePath = path.join(uploadDir, filename);
  await fs.writeFile(storagePath, buffer);
  return storagePath;
}
