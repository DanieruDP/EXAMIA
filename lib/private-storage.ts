import { randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export type UploadToStore = { name: string; mimeType: string; size: number; bytes: Buffer };
const EXTENSIONS: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" };

function storageRoot() {
  return path.resolve(process.env.MATERIAL_STORAGE_DIR || path.join(process.cwd(), ".private-materials"));
}

function safePath(key: string) {
  if (!/^[A-Za-z0-9_-]{8,64}\/[a-f0-9]{32}\.(pdf|jpg|png)$/.test(key)) throw new Error("Referencia de material no válida.");
  const root = storageRoot();
  const fullPath = path.resolve(root, key);
  if (!fullPath.startsWith(root + path.sep)) throw new Error("Ruta de material no válida.");
  return fullPath;
}

export async function savePrivateMaterials(examId: string, uploads: UploadToStore[]) {
  const saved: Array<{ name: string; mimeType: string; size: number; storageKey: string }> = [];
  try {
    for (const upload of uploads) {
      const ext = EXTENSIONS[upload.mimeType];
      if (!ext) throw new Error("Tipo de material no permitido.");
      const storageKey = `${examId}/${randomBytes(16).toString("hex")}.${ext}`;
      const fullPath = safePath(storageKey);
      await mkdir(path.dirname(fullPath), { recursive: true, mode: 0o700 });
      await writeFile(fullPath, upload.bytes, { flag: "wx", mode: 0o600 });
      saved.push({ name: upload.name, mimeType: upload.mimeType, size: upload.size, storageKey });
    }
    return saved;
  } catch (error) {
    await removePrivateMaterials(saved.map(file => file.storageKey));
    throw error;
  }
}

export async function readPrivateMaterial(storageKey: string) {
  return readFile(safePath(storageKey));
}

export async function removePrivateMaterials(storageKeys: string[]) {
  await Promise.all(storageKeys.map(async key => {
    try { await rm(safePath(key), { force: true }); } catch { /* best-effort cleanup */ }
  }));
}
