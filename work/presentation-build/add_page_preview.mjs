import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { FileBlob, PresentationFile } from "file:///C:/Program%20Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const ROOT = "C:/Users/admin/Documents/Codex/2026-11-08/desarrolla-una-aplicaci-n-web-en";
const SKILL = "C:/Users/admin/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/Presentations";
const SOURCE = path.join(ROOT, "outputs/ARQ-EXAM-Guia-de-exposicion-final.pptx");
const BUILD = path.join(ROOT, "work/presentation-preview-edit");
const PREVIEWS = path.join(BUILD, "slides");
const FINAL = path.join(ROOT, "outputs/ARQ-EXAM-Guia-de-exposicion-vista-previa.pptx");
const FONT = "Arial";
const C = { paper: "#F5F3EC", ink: "#18323A", white: "#FFFFFF", muted: "#53666B", green: "#B9E575", greenDark: "#59822F", tealPale: "#DCEBE8", line: "#D4DCD6", pale: "#E9F0E8", coral: "#E97B61" };

function addRect(slide, name, x, y, width, height, fill, stroke = undefined) {
  return slide.shapes.add({ geometry: "rect", name, position: { left: x, top: y, width, height }, fill, line: { style: "solid", fill: stroke ?? "none", width: stroke ? 1 : 0 } });
}
function addText(slide, name, value, x, y, width, height, style = {}) {
  const shape = slide.shapes.add({ geometry: "textbox", name, position: { left: x, top: y, width, height }, fill: "none", line: { style: "solid", fill: "none", width: 0 } });
  shape.text = value;
  shape.text.style = { typeface: FONT, fontSize: 18, color: C.ink, alignment: "left", verticalAlignment: "top", wrap: "square", autoFit: "shrinkText", insets: 0, ...style };
  return shape;
}
function addCircle(slide, name, x, y, diameter, fill, number) {
  const shape = slide.shapes.add({ geometry: "ellipse", name, position: { left: x, top: y, width: diameter, height: diameter }, fill, line: { style: "solid", fill: "none", width: 0 } });
  shape.text = String(number);
  shape.text.style = { typeface: FONT, fontSize: 13, bold: true, color: C.ink, alignment: "center", verticalAlignment: "middle", insets: 0 };
  return shape;
}

const deck = await PresentationFile.importPptx(await FileBlob.load(SOURCE));
if (deck.slides.items.length !== 10) throw new Error(`Se esperaba la versión de 10 diapositivas, hay ${deck.slides.items.length}.`);

// The new visual is inserted after the cover. Shift existing page labels and update the total.
const snapshot = await deck.inspect({ select: "$.slides[*].elements[*]", include: ["id", "name", "text"] });
for (const item of snapshot.records) {
  if (typeof item.name !== "string" || !item.name.startsWith("footer-count-") || typeof item.text !== "string") continue;
  const oldNumber = Number(item.text.slice(0, 2));
  const shifted = `${String(oldNumber + 1).padStart(2, "0")}  /  11`;
  deck.resolve(item.id).text.replace(item.text, shifted);
}

const { slide } = deck.slides.insert({ after: 0, layout: "Blank" });
slide.background.fill = C.paper;
addText(slide, "preview-eyebrow", "VISTA PREVIA", 76, 38, 500, 22, { fontSize: 12, bold: true, color: C.greenDark });
addText(slide, "preview-title", "Una mirada a la página", 76, 72, 1120, 58, { fontSize: 40, bold: true, color: C.ink });
addText(slide, "preview-subtitle", "Pantalla de inicio del estudiante", 78, 139, 750, 30, { fontSize: 19, color: C.muted });

// Editable schematic based on the actual homepage fields and wording, not a fabricated screenshot.
addRect(slide, "preview-browser-frame", 68, 188, 840, 438, C.white, C.line);
addRect(slide, "preview-browser-header", 68, 188, 840, 45, C.ink);
addText(slide, "preview-brand", "ARQ·EXAM", 91, 202, 230, 20, { fontSize: 14, bold: true, color: C.green });
addText(slide, "preview-admin-link", "Administración  ↗", 716, 203, 171, 17, { fontSize: 10, color: "#D6E1DD", alignment: "right" });
addText(slide, "preview-hero-kicker", "EVALUACIÓN ADAPTATIVA · UNIVERSIDAD", 93, 263, 340, 18, { fontSize: 9, bold: true, color: C.greenDark });
addText(slide, "preview-hero-heading", "Arquitectura de\nSoftware", 93, 292, 354, 97, { fontSize: 36, bold: true, color: C.ink });
addText(slide, "preview-hero-copy", "Un examen que se ajusta a tu nivel. Cada respuesta abre un nuevo reto.", 95, 405, 344, 52, { fontSize: 13, color: C.muted });
addText(slide, "preview-hero-stats", "05 niveles     04 opciones     ∞ aprendizaje", 95, 488, 355, 22, { fontSize: 10, bold: true, color: C.ink });

addRect(slide, "preview-form", 477, 251, 397, 347, C.white, C.line);
addText(slide, "preview-form-kicker", "01 — CONFIGURA TU EXAMEN", 498, 271, 232, 17, { fontSize: 9, bold: true, color: C.muted });
addText(slide, "preview-form-title", "Comenzar", 498, 296, 215, 31, { fontSize: 24, bold: true, color: C.ink });
addRect(slide, "preview-level-badge", 766, 288, 85, 27, C.pale);
addText(slide, "preview-level-text", "NIVEL 03", 774, 296, 69, 13, { fontSize: 9, bold: true, color: C.greenDark, alignment: "center" });
addText(slide, "preview-name-label", "Nombre del estudiante", 499, 343, 300, 16, { fontSize: 11, bold: true });
addRect(slide, "preview-name-input", 499, 362, 351, 31, C.paper, C.line);
addText(slide, "preview-name-placeholder", "Tu nombre", 510, 370, 320, 15, { fontSize: 10, color: C.muted });
addText(slide, "preview-topic-label", "Tema", 499, 403, 300, 16, { fontSize: 11, bold: true });
addRect(slide, "preview-topic-select", 499, 422, 351, 31, C.paper, C.line);
addText(slide, "preview-topic-value", "General  ▾", 510, 430, 320, 15, { fontSize: 10, color: C.muted });
addText(slide, "preview-count-label", "Preguntas", 499, 463, 145, 16, { fontSize: 11, bold: true });
addText(slide, "preview-duration-label", "Duración · min", 679, 463, 170, 16, { fontSize: 11, bold: true });
addRect(slide, "preview-count-input", 499, 482, 164, 31, C.paper, C.line);
addRect(slide, "preview-duration-input", 679, 482, 171, 31, C.paper, C.line);
addText(slide, "preview-count-value", "10", 510, 490, 143, 15, { fontSize: 10, color: C.muted });
addText(slide, "preview-duration-value", "30", 690, 490, 150, 15, { fontSize: 10, color: C.muted });
addRect(slide, "preview-start-button", 499, 531, 351, 42, C.green);
addText(slide, "preview-start-label", "Iniciar examen     →", 517, 543, 310, 20, { fontSize: 13, bold: true, color: C.ink });

addText(slide, "preview-side-title", "¿QUÉ PUEDE\nCONFIGURAR?", 950, 209, 256, 57, { fontSize: 20, bold: true, color: C.ink });
addCircle(slide, "preview-step-one", 951, 298, 32, C.tealPale, 1);
addText(slide, "preview-step-one-text", "Su nombre", 998, 304, 205, 22, { fontSize: 16, bold: true });
addCircle(slide, "preview-step-two", 951, 360, 32, C.green, 2);
addText(slide, "preview-step-two-text", "El tema del examen", 998, 366, 205, 22, { fontSize: 16, bold: true });
addCircle(slide, "preview-step-three", 951, 422, 32, C.coral, 3);
addText(slide, "preview-step-three-text", "Cantidad y duración", 998, 428, 205, 43, { fontSize: 16, bold: true });
addText(slide, "preview-side-note", "El examen comienza en nivel intermedio.", 950, 514, 250, 54, { fontSize: 15, color: C.muted });
addText(slide, "preview-schematic-note", "Esquema editable de la interfaz; no es una captura literal.", 950, 590, 255, 33, { fontSize: 10, color: C.greenDark });

slide.speakerNotes.text = "Esta diapositiva da una vista general de la pantalla de inicio. El estudiante escribe su nombre, elige un tema y define cuántas preguntas y cuánto tiempo tendrá. La aplicación empieza en nivel intermedio. La vista es un esquema editable, no una captura literal, y reproduce los campos que aparecen en la página real. Para que el examen pueda iniciar, el administrador debe haber publicado preguntas.";
slide.speakerNotes.setVisible(true);
addText(slide, "preview-footer-project", "ARQ·EXAM  /  ARQUITECTURA DE SOFTWARE", 76, 683, 620, 18, { fontSize: 10, color: C.muted });
addText(slide, "preview-footer-count", "02  /  11", 1110, 682, 94, 18, { fontSize: 10, color: C.muted, alignment: "right" });

await fs.mkdir(PREVIEWS, { recursive: true });
for (let i = 0; i < deck.slides.items.length; i++) {
  const current = deck.slides.getItem(i);
  const png = await deck.export({ slide: current, format: "png", scale: 1 });
  await fs.writeFile(path.join(PREVIEWS, `updated-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await png.arrayBuffer()));
}
const montage = await deck.export({ format: "webp", montage: true, scale: 0.35 });
await fs.writeFile(path.join(BUILD, "updated-montage.webp"), new Uint8Array(await montage.arrayBuffer()));
const draft = await PresentationFile.exportPptx(deck);
await draft.save(path.join(BUILD, "candidate.pptx"));

const finalizer = await import(pathToFileURL(path.join(SKILL, "container_tools/artifact_tool_utils.mjs")).href);
const sha256 = createHash("sha256").update(await fs.readFile(SOURCE)).digest("hex");
const result = await finalizer.finalizePresentation({
  explicitTotalSlideCount: 11,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir: ROOT,
  candidatePath: path.join(BUILD, "candidate.pptx"),
  finalPath: FINAL,
  pythonExecutable: "C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe",
  integrityValidatorPath: path.join(SKILL, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit"],
  fontPolicy: { basis: "reference", families: [FONT], referencePath: SOURCE, referenceSha256: sha256 },
  verifyArtifactToolImport: true,
  receiptPath: path.join(BUILD, "validation-preview.json"),
});
console.log(JSON.stringify({ final: FINAL, slideCount: deck.slides.items.length, finalizer: result }, null, 2));
