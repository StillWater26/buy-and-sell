import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveUploadedFile(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate safe unique filename
  const ext = path.extname(file.name) || ".jpg";
  const uniqueId = crypto.randomUUID();
  const filename = `${uniqueId}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await writeFile(filepath, buffer);

  // Return the public web-accessible URL
  return `/uploads/${filename}`;
}
