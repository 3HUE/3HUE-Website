import fs from "fs/promises";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");

export async function ensureUploadDir() {
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

export async function saveLocalFile(filename: string, buffer: Buffer) {
  await ensureUploadDir();
  // Defense in depth: even though callers are expected to pass an
  // already-safe (e.g. UUID-based) name, refuse to write anywhere outside
  // uploadDir in case a future caller ever passes something path-like
  // (e.g. containing "../").
  const uploadDirResolved = path.resolve(uploadDir);
  const resolved = path.resolve(uploadDir, filename);
  const isInsideUploadDir =
    resolved === uploadDirResolved || resolved.startsWith(uploadDirResolved + path.sep);
  if (!isInsideUploadDir) {
    throw new Error("Refusing to write outside the upload directory");
  }
  await fs.writeFile(resolved, buffer);
  return resolved;
}
