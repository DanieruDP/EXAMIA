import { fileTypeFromBuffer } from "file-type";
import { createCanvas, DOMMatrix, ImageData, Path2D } from "@napi-rs/canvas";
import { createWorker, type Worker } from "tesseract.js";
import sharp from "sharp";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 15 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 30 * 1024 * 1024;
export const MAX_PDF_PAGES = 40;
export const MAX_EXTRACTED_CHARS = 80_000;

export type MaterialProgress = { fileName: string; status: string; progress?: number };

function cleanFileName(name: string) {
  const base = name.replace(/[\\/]/g, "_").replace(/[\u0000-\u001f]/g, "").trim();
  return base.slice(0, 120) || "material";
}

function extensionMatches(name: string, mime: string) {
  const ext = name.toLowerCase().split(".").pop();
  return mime === "application/pdf" ? ext === "pdf"
    : mime === "image/jpeg" ? ext === "jpg" || ext === "jpeg"
    : mime === "image/png" ? ext === "png" : false;
}

async function readPdf(buffer: Buffer, worker: () => Promise<Worker>, progress: (s: string, p?: number) => void) {
  Object.assign(globalThis, { DOMMatrix, ImageData, Path2D });
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true, isEvalSupported: false });
  const pdf = await task.promise as unknown as PDFDocumentProxy;
  if (pdf.numPages < 1 || pdf.numPages > MAX_PDF_PAGES) throw new Error(`El PDF contiene ${pdf.numPages} páginas; el máximo es ${MAX_PDF_PAGES}.`);
  const pages: string[] = [];
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    progress(`Leyendo página ${pageNo} de ${pdf.numPages}`, pageNo / pdf.numPages);
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    const extracted = content.items.map((item: any) => typeof item.str === "string" ? item.str : "").join(" ").replace(/\s+/g, " ").trim();
    if (extracted.length >= 35) { pages.push(`Página ${pageNo}: ${extracted}`); continue; }
    progress(`Aplicando OCR a página ${pageNo} de ${pdf.numPages}`, pageNo / pdf.numPages);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(1.5, 2400 / Math.max(baseViewport.width, baseViewport.height), Math.sqrt(16_000_000 / (baseViewport.width * baseViewport.height)));
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext("2d");
    await page.render({ canvas: canvas as any, canvasContext: context as any, viewport } as any).promise;
    const ocr = await (await worker()).recognize(await canvas.encode("png"));
    const scannedText = ocr.data.text.replace(/\s+/g, " ").trim();
    if (scannedText.length >= 20) pages.push(`Página ${pageNo} (OCR): ${scannedText}`);
  }
  await pdf.destroy();
  return pages.join("\n");
}

export async function extractMaterials(files: File[], onProgress: (event: MaterialProgress) => void) {
  if (!files.length) throw new Error("Adjunta al menos un PDF o una imagen.");
  if (files.length > MAX_FILES) throw new Error(`Puedes adjuntar hasta ${MAX_FILES} archivos por examen.`);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_TOTAL_BYTES) throw new Error("El conjunto de archivos supera el límite total de 30 MB.");

  let ocrWorker: Worker | undefined;
  const getWorker = async () => {
    if (!ocrWorker) {
      ocrWorker = await createWorker("spa+eng", 1, {
        langPath: process.env.TESSDATA_PATH || undefined,
        logger: (info) => {
          if (typeof info.progress === "number") onProgress({ fileName: "OCR", status: "Preparando reconocimiento de texto", progress: info.progress });
        },
      });
    }
    return ocrWorker;
  };
  const extractedFiles: { name: string; text: string }[] = [];
  const uploads: { name: string; mimeType: string; size: number; bytes: Buffer }[] = [];
  let processingName = "";
  try {
    for (const file of files) {
      const name = cleanFileName(file.name);
      processingName = name;
      if (file.size < 8) throw new Error(`«${name}» está vacío o no contiene un archivo legible.`);
      if (file.size > MAX_FILE_BYTES) throw new Error(`«${name}» supera el límite de 15 MB.`);
      onProgress({ fileName: name, status: "Validando el tipo real del archivo" });
      const buffer = Buffer.from(await file.arrayBuffer());
      const detected = await fileTypeFromBuffer(buffer);
      if (!detected || !["application/pdf", "image/jpeg", "image/png"].includes(detected.mime) || !extensionMatches(name, detected.mime)) {
        throw new Error(`«${name}» no es un PDF, JPG, JPEG o PNG válido, o su extensión no coincide con su contenido.`);
      }
      if (detected.mime.startsWith("image/")) {
        const metadata = await sharp(buffer, { limitInputPixels: 40_000_000 }).metadata();
        if (!metadata.width || !metadata.height || metadata.width * metadata.height > 40_000_000) throw new Error(`«${name}» supera el límite de resolución permitido.`);
      }
      onProgress({ fileName: name, status: detected.mime === "application/pdf" ? "Extrayendo texto del PDF" : "Aplicando OCR a la imagen" });
      const text = detected.mime === "application/pdf"
        ? await readPdf(buffer, getWorker, (status, progress) => onProgress({ fileName: name, status, progress }))
        : (await (await getWorker()).recognize(buffer)).data.text;
      const cleanText = text.replace(/\u0000/g, " ").replace(/\s+/g, " ").trim();
      if (cleanText.length < 40) throw new Error(`No se pudo extraer suficiente texto de «${name}». Comprueba que sea legible.`);
      extractedFiles.push({ name, text: cleanText });
      uploads.push({ name, mimeType: detected.mime, size: buffer.byteLength, bytes: buffer });
      onProgress({ fileName: name, status: "Texto extraído correctamente", progress: 1 });
    }
  } catch (error) {
    if (processingName) onProgress({ fileName: processingName, status: "No se pudo procesar este archivo" });
    throw error;
  } finally {
    if (ocrWorker) await ocrWorker.terminate();
  }
  const text = extractedFiles.map(file => `Material: ${file.name}\n${file.text}`).join("\n\n");
  if (text.length > MAX_EXTRACTED_CHARS) throw new Error("El texto extraído supera el límite de 80 000 caracteres. Adjunta menos páginas o divide el material.");
  return { text, files: extractedFiles.map(({ name }) => ({ name })), uploads };
}
