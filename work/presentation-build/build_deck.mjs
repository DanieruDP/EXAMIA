import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "file:///C:/Program%20Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";
import { resolvePresentationFont } from "file:///C:/Users/admin/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/Presentations/container_tools/artifact_tool_utils.mjs";

const ROOT = "C:/Users/admin/Documents/Codex/2026-11-08/desarrolla-una-aplicaci-n-web-en";
const SKILL = "C:/Users/admin/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/Presentations";
const BUILD = path.join(ROOT, "work/presentation-build");
const PREVIEWS = path.join(BUILD, "slides");
const FINAL = path.join(ROOT, "outputs/ARQ-EXAM-Guia-de-exposicion-final.pptx");
const FONT = resolvePresentationFont({ fontFamily: "Arial" });
const C = {
  ink: "#18323A", paper: "#F5F3EC", white: "#FFFFFF", muted: "#53666B",
  green: "#B9E575", greenDark: "#59822F", teal: "#67A5A5", tealPale: "#DCEBE8",
  coral: "#E97B61", coralPale: "#F7E3DA", line: "#D4DCD6", sand: "#E9E5D8",
  dark2: "#25444D", pale: "#E9F0E8", bluePale: "#E2EDF0",
};
const W = 1280, H = 720;
const ppt = Presentation.create({ slideSize: { width: W, height: H } });

function rect(slide, name, x, y, w, h, fill, opts = {}) {
  return slide.shapes.add({
    geometry: opts.geometry || "rect", name,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: "solid", fill: opts.stroke || "none", width: opts.stroke ? (opts.strokeWidth || 1) : 0 },
    ...(opts.radius ? { borderRadius: opts.radius } : {}),
  });
}
function text(slide, name, value, x, y, w, h, style = {}) {
  const sh = slide.shapes.add({
    geometry: "textbox", name,
    position: { left: x, top: y, width: w, height: h },
    fill: "none", line: { style: "solid", fill: "none", width: 0 },
  });
  sh.text = value;
  sh.text.style = {
    typeface: FONT, fontSize: 20, color: C.ink, alignment: "left",
    verticalAlignment: "top", wrap: "square", autoFit: "shrinkText", insets: 0,
    ...style,
  };
  return sh;
}
function line(slide, name, x, y, w, h, color = C.line, width = 2) {
  return slide.shapes.add({ geometry: "line", name, position: { left: x, top: y, width: w, height: h }, fill: "none", line: { style: "solid", fill: color, width } });
}
function arrow(slide, name, x, y, w, h, color = C.green) {
  return slide.shapes.add({ geometry: "rightArrow", name, position: { left: x, top: y, width: w, height: h }, fill: color, line: { style: "solid", fill: "none", width: 0 } });
}
function circle(slide, name, x, y, d, fill, label, labelColor = C.ink, size = 19) {
  const sh = slide.shapes.add({ geometry: "ellipse", name, position: { left: x, top: y, width: d, height: d }, fill, line: { style: "solid", fill: "none", width: 0 } });
  sh.text = label;
  sh.text.style = { typeface: FONT, fontSize: size, bold: true, color: labelColor, alignment: "center", verticalAlignment: "middle", insets: 0, autoFit: "shrinkText" };
  return sh;
}
function addNotes(slide, notes) {
  slide.speakerNotes.text = notes;
  slide.speakerNotes.setVisible(true);
}
function base(title, section, num) {
  const s = ppt.slides.add({ background: { fill: C.paper } });
  text(s, `section-${num}`, section.toUpperCase(), 76, 38, 500, 22, { fontSize: 12, bold: true, color: C.greenDark });
  text(s, `title-${num}`, title, 76, 72, 1120, 58, { fontSize: 40, bold: true, color: C.ink });
  line(s, `footer-rule-${num}`, 76, 672, 1128, 0, C.line, 1);
  text(s, `footer-project-${num}`, "ARQ·EXAM  /  ARQUITECTURA DE SOFTWARE", 76, 683, 620, 18, { fontSize: 10, color: C.muted });
  text(s, `footer-count-${num}`, `${String(num).padStart(2, "0")}  /  10`, 1110, 682, 94, 18, { fontSize: 10, color: C.muted, alignment: "right" });
  return s;
}
function step(slide, n, x, y, heading, body, accent = C.green) {
  circle(slide, `step-${n}-${x}`, x, y, 38, accent, String(n), C.ink, 15);
  text(slide, `step-title-${n}-${x}`, heading, x + 52, y - 2, 230, 28, { fontSize: 19, bold: true });
  text(slide, `step-body-${n}-${x}`, body, x + 52, y + 31, 230, 62, { fontSize: 15, color: C.muted });
}

// 1. Portada
{
  const s = ppt.slides.add({ background: { fill: C.ink } });
  text(s, "cover-brand", "ARQ·EXAM", 78, 58, 300, 26, { fontSize: 15, bold: true, color: C.green, alignment: "left" });
  text(s, "cover-title", "Exámenes que\nse adaptan", 78, 164, 640, 190, { fontSize: 72, bold: true, color: C.white, lineSpacing: 0.92 });
  text(s, "cover-subtitle", "Una guía sencilla de Arquitectura de Software", 82, 386, 550, 52, { fontSize: 25, color: "#D6E1DD" });
  text(s, "cover-audience", "CÓMO FUNCIONA · PARA EXPOSICIÓN", 82, 468, 470, 22, { fontSize: 12, bold: true, color: C.green });
  text(s, "cover-level-label", "CINCO NIVELES DE DIFICULTAD", 750, 220, 430, 24, { fontSize: 13, bold: true, color: "#C5D2CE" });
  const heights = [72, 112, 152, 192, 232];
  for (let i = 0; i < 5; i++) {
    const x = 754 + i * 86, h = heights[i], y = 552 - h;
    rect(s, `cover-level-${i + 1}`, x, y, 68, h, i === 2 ? C.green : C.dark2);
    text(s, `cover-level-number-${i + 1}`, String(i + 1), x, y + h - 38, 68, 28, { fontSize: 22, bold: true, color: i === 2 ? C.ink : C.white, alignment: "center", verticalAlignment: "middle" });
  }
  text(s, "cover-level-note", "Empieza en intermedio · sube o baja según la respuesta", 750, 576, 465, 46, { fontSize: 14, color: "#D6E1DD" });
  addNotes(s, "Presenta ARQ·EXAM como una página para crear y realizar exámenes universitarios de Arquitectura de Software. La idea central es que el examen no mantiene siempre la misma dificultad: empieza en intermedio y cambia con las respuestas. En esta exposición veremos el recorrido desde las fuentes hasta los resultados. El banco de preguntas no viene precargado: primero el administrador debe agregar una fuente y publicar preguntas.");
}

// 2. Qué es la aplicación
{
  const s = base("Una práctica guiada de Arquitectura de Software", "01 · Propósito", 2);
  text(s, "purpose-main", "Aprender\nrespondiendo", 78, 174, 450, 132, { fontSize: 52, bold: true, color: C.ink });
  text(s, "purpose-description", "La página convierte material de consulta en preguntas de opción múltiple y ajusta el reto al nivel de cada estudiante.", 80, 344, 445, 104, { fontSize: 22, color: C.muted });
  text(s, "purpose-topic", "SOLO ARQUITECTURA DE SOFTWARE", 80, 490, 440, 24, { fontSize: 13, bold: true, color: C.greenDark });
  const xs = [590, 755, 920, 1085];
  const labels = [["FUENTES", "Lecturas web"], ["PREGUNTAS", "4 opciones"], ["EXAMEN", "Nivel variable"], ["RESULTADOS", "Explicados"]];
  labels.forEach((item, i) => {
    circle(s, `purpose-node-${i}`, xs[i], 298, 76, [C.tealPale, C.green, C.coralPale, C.bluePale][i], String(i + 1), C.ink, 24);
    text(s, `purpose-label-${i}`, item[0], xs[i] - 32, 395, 138, 20, { fontSize: 11, bold: true, color: C.muted, alignment: "center" });
    text(s, `purpose-desc-${i}`, item[1], xs[i] - 42, 422, 158, 46, { fontSize: 15, color: C.ink, alignment: "center" });
    if (i < 3) arrow(s, `purpose-arrow-${i}`, xs[i] + 87, 320, 56, 30, C.line);
  });
  addNotes(s, "Explica que ARQ·EXAM sirve para estudiar Arquitectura de Software con preguntas fundamentadas en lecturas que el administrador agrega. El tema del curso está limitado a conceptos como atributos de calidad, microservicios, arquitectura limpia, patrones, seguridad y disponibilidad. El objetivo no es tener una lista idéntica para todos, sino practicar con preguntas y recibir un resultado comprensible.");
}

// 3. Cómo funciona
{
  const s = base("Del material al aprendizaje", "02 · Recorrido general", 3);
  text(s, "flow-intro", "Tres momentos: preparar, responder y revisar.", 80, 148, 980, 34, { fontSize: 21, color: C.muted });
  const colX = [86, 478, 870];
  const titles = ["Preparación", "Examen", "Revisión"];
  const bodies = ["El administrador agrega una URL y publica preguntas revisadas.", "El servidor muestra una pregunta y recibe la respuesta.", "Se calcula el puntaje, se adapta el siguiente nivel y se arma el reporte."];
  const accents = [C.tealPale, C.green, C.coralPale];
  for (let i = 0; i < 3; i++) {
    rect(s, `flow-block-${i}`, colX[i], 250, 314, 210, accents[i]);
    circle(s, `flow-number-${i}`, colX[i] + 24, 276, 44, i === 1 ? C.ink : C.white, String(i + 1), i === 1 ? C.white : C.ink, 17);
    text(s, `flow-heading-${i}`, titles[i], colX[i] + 24, 342, 266, 32, { fontSize: 25, bold: true });
    text(s, `flow-body-${i}`, bodies[i], colX[i] + 24, 388, 260, 62, { fontSize: 16, color: C.muted });
    if (i < 2) arrow(s, `flow-arrow-${i}`, colX[i] + 326, 333, 62, 34, C.greenDark);
  }
  line(s, "flow-security-line", 88, 524, 1098, 0, C.line, 1);
  text(s, "flow-security-label", "DURANTE EL EXAMEN", 90, 548, 180, 22, { fontSize: 11, bold: true, color: C.greenDark });
  text(s, "flow-security", "La respuesta correcta se queda en el servidor hasta que el estudiante contesta.", 274, 544, 880, 36, { fontSize: 19, bold: true, color: C.ink });
  addNotes(s, "Resume el funcionamiento completo. Primero se preparan preguntas a partir de una fuente. Después el estudiante responde una pregunta a la vez. El servidor evalúa la respuesta, guarda puntos y cambia el nivel. Al final, el estudiante ve el análisis. Un detalle importante: el navegador recibe las opciones, pero no la respuesta correcta ni la explicación antes de contestar.");
}

// 4. Administración
{
  const s = base("El administrador prepara el banco", "03 · Administración", 4);
  text(s, "admin-intro", "Las preguntas nuevas requieren revisión antes de usarse.", 80, 146, 1000, 32, { fontSize: 21, color: C.muted });
  const xs = [82, 378, 674, 970];
  const heads = ["Agrega una URL", "El servidor lee", "OpenAI redacta", "Revisa y publica"];
  const desc = ["HTTPS en un dominio de referencia admitido. Ej.: martinfowler.com", "Comprueba la página y extrae el texto útil.", "Crea borradores de 4 opciones con tema, nivel, explicación y material.", "El administrador confirma la respuesta y activa la pregunta."];
  for (let i = 0; i < 4; i++) {
    circle(s, `admin-step-${i}`, xs[i], 230, 48, [C.teal, C.green, C.coral, C.ink][i], String(i + 1), i === 3 ? C.white : C.ink, 18);
    text(s, `admin-head-${i}`, heads[i], xs[i], 299, 232, 34, { fontSize: 20, bold: true });
    text(s, `admin-desc-${i}`, desc[i], xs[i], 346, 232, 106, { fontSize: 16, color: C.muted });
    if (i < 3) arrow(s, `admin-arrow-${i}`, xs[i] + 246, 238, 42, 28, C.line);
  }
  rect(s, "admin-review-band", 82, 500, 1112, 94, C.ink);
  text(s, "admin-review-tag", "ANTES DE PUBLICAR", 106, 521, 220, 20, { fontSize: 11, bold: true, color: C.green });
  text(s, "admin-review-rule", "Comprueba la opción correcta, la explicación y la fuente.", 106, 550, 900, 28, { fontSize: 20, bold: true, color: C.white });
  addNotes(s, "En el panel se agrega una URL. La aplicación solo consulta HTTPS en los dominios que están permitidos en el código y revisa redirecciones. El servidor extrae el texto y lo envía a OpenAI para redactar preguntas. Las preguntas se guardan desactivadas como borradores. El administrador puede revisar opciones, respuesta correcta, explicación, tema, dificultad, material anexado y URL antes de publicarlas.");
}

// 5. Realización del examen
{
  const s = base("El estudiante realiza el examen", "04 · Paso a paso", 5);
  step(s, 1, 84, 175, "Configura", "Escribe su nombre y elige tema, cantidad y duración.", C.tealPale);
  step(s, 2, 84, 304, "Empieza", "La primera pregunta es de nivel intermedio.", C.green);
  step(s, 3, 84, 433, "Responde", "Elige una de cuatro opciones y confirma.", C.coralPale);
  step(s, 4, 84, 562, "Continúa", "Ve la explicación y recibe la siguiente pregunta.", C.bluePale);
  // Editable schematic of the verified landing form, not a literal screenshot.
  rect(s, "student-screen-frame", 700, 166, 480, 444, C.white, { stroke: C.line });
  rect(s, "student-screen-top", 700, 166, 480, 54, C.ink);
  text(s, "student-screen-brand", "ARQ·EXAM", 724, 183, 180, 20, { fontSize: 13, bold: true, color: C.green });
  text(s, "student-screen-label", "PANTALLA INICIAL · ESQUEMA", 722, 242, 420, 19, { fontSize: 10, bold: true, color: C.greenDark });
  text(s, "student-name-label", "Nombre del estudiante", 722, 276, 250, 18, { fontSize: 13, bold: true });
  rect(s, "student-name-input", 722, 298, 430, 38, C.paper, { stroke: C.line });
  text(s, "student-name-placeholder", "Tu nombre", 736, 308, 390, 18, { fontSize: 12, color: C.muted });
  text(s, "student-topic-label", "Tema", 722, 352, 250, 18, { fontSize: 13, bold: true });
  rect(s, "student-topic-input", 722, 374, 430, 38, C.paper, { stroke: C.line });
  text(s, "student-topic-placeholder", "General  ▾", 736, 384, 390, 18, { fontSize: 12, color: C.muted });
  text(s, "student-count-label", "Preguntas", 722, 427, 170, 18, { fontSize: 13, bold: true });
  text(s, "student-time-label", "Duración · min", 946, 427, 190, 18, { fontSize: 13, bold: true });
  rect(s, "student-count-input", 722, 449, 194, 36, C.paper, { stroke: C.line });
  rect(s, "student-time-input", 946, 449, 206, 36, C.paper, { stroke: C.line });
  text(s, "student-count-value", "10", 736, 458, 160, 18, { fontSize: 12, color: C.ink });
  text(s, "student-time-value", "30", 960, 458, 172, 18, { fontSize: 12, color: C.ink });
  rect(s, "student-level-pill", 722, 501, 125, 30, C.pale);
  text(s, "student-level-value", "NIVEL 03", 734, 508, 102, 16, { fontSize: 11, bold: true, color: C.greenDark, alignment: "center" });
  rect(s, "student-start-button", 722, 547, 430, 42, C.green);
  text(s, "student-start-button-label", "Iniciar examen     →", 744, 558, 385, 20, { fontSize: 15, bold: true });
  addNotes(s, "La pantalla real de inicio pide nombre, tema, número de preguntas y duración. En la diapositiva aparece un esquema editable de esa pantalla, no una captura literal. Tras iniciar, la primera pregunta empieza en nivel intermedio. El estudiante elige una opción y confirma; la página muestra la explicación después de registrar la respuesta, y entonces pasa a la siguiente pregunta. El tiempo también se controla en el servidor.");
}

// 6. Dificultad adaptativa
{
  const s = base("Cada respuesta cambia el siguiente reto", "05 · Dificultad adaptativa", 6);
  text(s, "adaptive-start-label", "EMPIEZA", 82, 173, 180, 19, { fontSize: 11, bold: true, color: C.muted });
  circle(s, "adaptive-level-three", 108, 220, 112, C.ink, "3", C.white, 38);
  text(s, "adaptive-start-name", "Intermedio", 83, 348, 164, 24, { fontSize: 17, bold: true, alignment: "center" });
  arrow(s, "adaptive-correct-arrow", 278, 259, 130, 36, C.greenDark);
  text(s, "adaptive-correct", "CORRECTA", 288, 219, 150, 20, { fontSize: 12, bold: true, color: C.greenDark, alignment: "center" });
  circle(s, "adaptive-level-four", 448, 220, 112, C.green, "4", C.ink, 38);
  text(s, "adaptive-advanced", "Avanzado", 424, 348, 164, 24, { fontSize: 17, bold: true, alignment: "center" });
  arrow(s, "adaptive-error-arrow", 636, 259, 130, 36, C.coral);
  text(s, "adaptive-error", "INCORRECTA", 626, 219, 150, 20, { fontSize: 12, bold: true, color: C.coral, alignment: "center" });
  circle(s, "adaptive-back-level-three", 806, 220, 112, C.tealPale, "3", C.ink, 38);
  text(s, "adaptive-intermediate", "Intermedio", 782, 348, 164, 24, { fontSize: 17, bold: true, alignment: "center" });
  rect(s, "adaptive-limits", 1008, 216, 178, 180, C.white, { stroke: C.line });
  text(s, "adaptive-limits-title", "LÍMITES", 1030, 240, 140, 20, { fontSize: 12, bold: true, color: C.greenDark, alignment: "center" });
  text(s, "adaptive-limits-values", "1  ·  2  ·  3  ·  4  ·  5", 1024, 280, 150, 28, { fontSize: 16, bold: true, alignment: "center" });
  text(s, "adaptive-limits-note", "No baja de 1\nni supera 5", 1030, 332, 140, 44, { fontSize: 15, color: C.muted, alignment: "center" });
  line(s, "adaptive-note-rule", 82, 452, 1104, 0, C.line, 1);
  text(s, "adaptive-example", "Si hay varias preguntas disponibles, el sistema elige una de dificultad más cercana al nuevo nivel.", 82, 486, 1070, 55, { fontSize: 19, color: C.ink });
  text(s, "adaptive-level-list", "1 Muy básico   ·   2 Básico   ·   3 Intermedio   ·   4 Avanzado   ·   5 Experto", 82, 566, 1090, 28, { fontSize: 14, color: C.muted });
  addNotes(s, "Explica el ejemplo paso a paso. El examen comienza en nivel 3, intermedio. Si la respuesta del nivel 3 es correcta, el nivel siguiente sube a 4, avanzado. Si en esa pregunta se equivoca, el nivel baja a 3. La lógica del servidor nunca permite superar nivel 5 ni bajar de nivel 1. Si no hay una pregunta exactamente del nivel recomendado, la página escoge una de dificultad disponible que esté más cerca.");
}

// 7. Sistema de puntuación
{
  const s = base("Los puntos dependen del nivel", "06 · Puntuación", 7);
  text(s, "score-rule", "Pregunta correcta = puntos iguales a su dificultad.\nPregunta incorrecta = 0 puntos.", 82, 153, 560, 76, { fontSize: 24, bold: true, color: C.ink });
  const rows = [
    { n: "PREGUNTA 1", detail: "Nivel 3 · correcta", pts: "+3", fill: C.tealPale },
    { n: "PREGUNTA 2", detail: "Nivel 4 · correcta", pts: "+4", fill: C.green },
    { n: "PREGUNTA 3", detail: "Nivel 5 · incorrecta", pts: "+0", fill: C.coralPale },
  ];
  rows.forEach((r, i) => {
    const y = 276 + i * 78;
    rect(s, `score-row-${i}`, 84, y, 560, 60, r.fill);
    text(s, `score-row-label-${i}`, r.n, 106, y + 9, 145, 17, { fontSize: 11, bold: true, color: C.muted });
    text(s, `score-row-detail-${i}`, r.detail, 106, y + 31, 390, 20, { fontSize: 16, bold: true });
    text(s, `score-row-points-${i}`, r.pts, 540, y + 13, 76, 32, { fontSize: 24, bold: true, alignment: "right", color: i === 2 ? C.coral : C.ink });
  });
  rect(s, "score-total", 700, 276, 484, 234, C.ink);
  text(s, "score-total-label", "TOTAL DEL EJEMPLO", 736, 315, 385, 20, { fontSize: 12, bold: true, color: C.green });
  text(s, "score-total-number", "7", 736, 354, 300, 92, { fontSize: 76, bold: true, color: C.white });
  text(s, "score-total-points", "puntos", 820, 408, 220, 29, { fontSize: 20, color: "#D6E1DD" });
  text(s, "score-percent", "Aciertos: 2 de 3  =  67%", 735, 462, 410, 24, { fontSize: 16, color: C.green });
  text(s, "score-footnote", "Puntos y porcentaje son medidas distintas: los puntos también reflejan la dificultad.", 84, 548, 1080, 45, { fontSize: 18, color: C.muted });
  addNotes(s, "Usa el ejemplo visual. Una respuesta correcta en nivel 3 suma 3 puntos; una correcta en nivel 4 suma 4. Una incorrecta, aunque sea de nivel 5, suma cero. El total del ejemplo es 7 puntos. El porcentaje cuenta los aciertos sobre las respuestas registradas: dos de tres equivale a 67 por ciento. Por eso porcentaje y puntaje total describen cosas distintas.");
}

// 8. Resultados
{
  const s = base("El resultado explica qué sigue", "07 · Resultados", 8);
  text(s, "results-intro", "Al terminar, el estudiante puede revisar tanto el total como cada respuesta.", 82, 147, 1060, 33, { fontSize: 20, color: C.muted });
  text(s, "results-summary-label", "RESUMEN", 84, 221, 240, 22, { fontSize: 12, bold: true, color: C.greenDark });
  const summary = ["Correctas e incorrectas", "Puntuación y porcentaje", "Dificultad máxima alcanzada"];
  summary.forEach((v, i) => {
    const y = 265 + i * 69;
    circle(s, `result-check-${i}`, 86, y, 28, [C.tealPale, C.green, C.coralPale][i], "✓", C.ink, 14);
    text(s, `result-summary-${i}`, v, 130, y + 4, 430, 25, { fontSize: 19, bold: true });
  });
  line(s, "results-column-line", 604, 219, 0, 300, C.line, 1);
  text(s, "results-topic-label", "POR TEMA", 656, 221, 230, 22, { fontSize: 12, bold: true, color: C.greenDark });
  text(s, "results-topic-example", "Atributos de calidad", 656, 268, 330, 24, { fontSize: 19, bold: true });
  rect(s, "results-topic-bar-bg", 656, 308, 450, 12, C.sand);
  rect(s, "results-topic-bar-fg", 656, 308, 324, 12, C.teal);
  text(s, "results-topic-mastery", "72%  ·  DOMINA", 656, 334, 235, 21, { fontSize: 12, bold: true, color: C.greenDark });
  text(s, "results-topic-rule", "70% o más se marca como dominio;\npor debajo, como tema por reforzar.", 656, 380, 472, 54, { fontSize: 16, color: C.muted });
  rect(s, "results-review-band", 82, 507, 1114, 91, C.tealPale);
  text(s, "results-review-title", "En cada pregunta también aparece:", 106, 527, 420, 23, { fontSize: 16, bold: true });
  text(s, "results-review-items", "tu respuesta  ·  la correcta  ·  explicación  ·  tema  ·  fuente URL", 106, 560, 1030, 22, { fontSize: 16, color: C.ink });
  addNotes(s, "El reporte muestra el número de respuestas correctas e incorrectas, la puntuación, el porcentaje y la mayor dificultad que se preguntó. También agrupa el desempeño por tema. En el código, los temas con al menos 70 por ciento de aciertos se marcan como dominados; los demás se señalan para refuerzo. Al abrir una respuesta aparecen la opción elegida, la correcta, la explicación y el enlace a la fuente.");
}

// 9. Tecnología
{
  const s = base("Qué hay detrás de la página", "08 · Tecnología, sin complicaciones", 9);
  text(s, "tech-intro", "Cada herramienta cumple una tarea concreta.", 82, 146, 970, 32, { fontSize: 21, color: C.muted });
  const nodes = [
    { x: 82, w: 300, title: "React", desc: "Muestra las pantallas y recoge las respuestas.", fill: C.tealPale },
    { x: 456, w: 300, title: "Next.js + TypeScript", desc: "Coordina el proceso y aplica las reglas en el servidor.", fill: C.green },
    { x: 830, w: 300, title: "OpenAI API", desc: "Redacta borradores a partir del texto consultado.", fill: C.coralPale },
  ];
  nodes.forEach((n, i) => {
    rect(s, `tech-node-${i}`, n.x, 241, n.w, 166, n.fill);
    text(s, `tech-name-${i}`, n.title, n.x + 18, 267, n.w - 36, 28, { fontSize: 19, bold: true });
    text(s, `tech-desc-${i}`, n.desc, n.x + 18, 310, n.w - 36, 70, { fontSize: 15, color: C.muted });
    if (i < 2) arrow(s, `tech-arrow-${i}`, n.x + n.w + 16, 309, 58, 28, C.ink);
  });
  rect(s, "tech-storage-band", 82, 428, 1123, 62, C.bluePale);
  text(s, "tech-storage-name", "PRISMA + POSTGRESQL", 104, 447, 274, 22, { fontSize: 13, bold: true, color: C.ink });
  text(s, "tech-storage-desc", "Guarda fuentes, preguntas, exámenes e historial.", 400, 446, 740, 24, { fontSize: 17, color: C.muted });
  rect(s, "tech-security-band", 82, 514, 1123, 106, C.ink);
  circle(s, "tech-lock-circle", 108, 538, 56, C.green, "✓", C.ink, 22);
  text(s, "tech-security-title", "La clave de OpenAI y la respuesta correcta se guardan del lado del servidor.", 190, 534, 965, 36, { fontSize: 19, bold: true, color: C.white });
  text(s, "tech-security-sub", "La página revela la explicación después de que el estudiante responde.", 190, 580, 900, 23, { fontSize: 15, color: "#D6E1DD" });
  addNotes(s, "No hace falta explicar código. React se ocupa de lo que se ve y de los botones. Next.js conecta las pantallas con las funciones del servidor; TypeScript ayuda a detectar errores mientras se construye el proyecto. Prisma sirve de puente para guardar información en PostgreSQL. Cuando el administrador genera preguntas, el servidor consulta OpenAI con el texto de la fuente. La clave de OpenAI no se pone en el navegador y la respuesta correcta se mantiene en el servidor hasta recibir la contestación.");
}

// 10. Conclusión
{
  const s = ppt.slides.add({ background: { fill: C.ink } });
  text(s, "conclusion-brand", "ARQ·EXAM", 78, 54, 280, 24, { fontSize: 14, bold: true, color: C.green });
  text(s, "conclusion-title", "Fuentes claras.\nRetos a tu nivel.", 78, 142, 780, 166, { fontSize: 58, bold: true, color: C.white });
  text(s, "conclusion-copy", "La página une material consultado, preguntas revisadas, un examen adaptable y resultados explicados.", 82, 344, 750, 72, { fontSize: 22, color: "#D6E1DD" });
  const closeSteps = ["Agregar una fuente", "Revisar y publicar preguntas", "Invitar al estudiante a practicar"];
  closeSteps.forEach((v, i) => {
    circle(s, `conclusion-step-${i}`, 86 + i * 370, 510, 36, [C.teal, C.green, C.coral][i], String(i + 1), C.ink, 15);
    text(s, `conclusion-step-text-${i}`, v, 135 + i * 370, 515, 300, 26, { fontSize: 17, bold: true, color: C.white });
  });
  text(s, "conclusion-setup", "El banco empieza vacío. Para usarlo hacen falta PostgreSQL y las variables de configuración del servidor.", 82, 610, 1070, 31, { fontSize: 14, color: "#BFCFC8" });
  addNotes(s, "Cierra con la secuencia práctica: el administrador incorpora una fuente permitida, genera preguntas y las revisa antes de publicarlas. Después el estudiante puede iniciar un examen y recibir explicaciones con la referencia. Recuerda que el banco comienza vacío. Para poner la aplicación en marcha se configura la conexión a PostgreSQL, la clave de OpenAI y el token administrativo en variables de entorno.");
}

await fs.mkdir(PREVIEWS, { recursive: true });
await fs.mkdir(path.dirname(FINAL), { recursive: true });
for (const [i, slide] of ppt.slides.items.entries()) {
  const png = await ppt.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(PREVIEWS, `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await png.arrayBuffer()));
}
const montage = await ppt.export({ format: "webp", montage: true, scale: 0.35 });
await fs.writeFile(path.join(BUILD, "montage.webp"), new Uint8Array(await montage.arrayBuffer()));
const draft = await PresentationFile.exportPptx(ppt);
await draft.save(path.join(BUILD, "candidate.pptx"));

const finalizer = await import(pathToFileURL(path.join(SKILL, "container_tools/artifact_tool_utils.mjs")).href);
const expectedSlideSizeEmu = `${W * 9525},${H * 9525}`;
const requirements = {
  explicitTotalSlideCount: 10,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
};
const result = await finalizer.finalizePresentation({
  ...requirements,
  workspaceDir: ROOT,
  candidatePath: path.join(BUILD, "candidate.pptx"),
  finalPath: FINAL,
  pythonExecutable: "C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe",
  integrityValidatorPath: path.join(SKILL, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", expectedSlideSizeEmu, "--validate-heading-fit"],
  fontPolicy: { basis: "design", families: [FONT] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(BUILD, "validation-final.json"),
});
console.log(JSON.stringify({ final: FINAL, font: FONT, slides: ppt.slides.items.length, finalizer: result }, null, 2));
