# EXAMIA

Aplicación web de exámenes adaptativos creada a partir de materiales PDF e imágenes.

## Roles y recorrido

- Profesores y alumnos pueden registrarse y entrar con correo y contraseña. Las contraseñas se guardan con hash y las sesiones usan cookies HTTP-only con token aleatorio almacenado como hash.
- El profesor crea un borrador, adjunta materiales, configura título, materia, instrucciones, cantidad, duración y visibilidad de resultados. Revisa las preguntas antes de publicar.
- El examen publicado queda asociado a su profesor y tiene un enlace `/r/CODIGO` y un código de 12 caracteres. La configuración y las preguntas no se pueden editar después de publicar; se puede cerrar para impedir nuevos intentos.
- El alumno abre el enlace o introduce el código, escribe su nombre y comienza sin tener que registrarse. Si ya tiene una cuenta de alumno iniciada, el intento también queda asociado a su historial personal.
- El servidor copia la cantidad y duración publicadas al intento. Las respuestas correctas no se entregan antes de contestar; la evaluación y adaptación permanecen en el servidor.

## Materiales y generación

Se aceptan exclusivamente PDF, JPG/JPEG y PNG, con validación de firma binaria. Límites: 5 archivos por examen, 15 MB cada uno, 30 MB en total, 40 páginas por PDF, 40 megapíxeles por imagen y 80 000 caracteres extraídos.

PDF con texto: extracción mediante `pdfjs-dist`. Imágenes y páginas escaneadas: OCR con Tesseract.js para español e inglés. La IA genera preguntas solo con el texto adjunto, cada una con cita literal, y ejecuta una comprobación adicional. Si no hay respaldo suficiente para todas las preguntas solicitadas, no se crea el examen.

Los archivos originales se conservan fuera de `public/` bajo `.private-materials` por defecto, o en la ruta definida por `MATERIAL_STORAGE_DIR`. Solo el profesor dueño puede descargarlos. El texto íntegro se procesa en memoria; la base conserva preguntas, evidencia textual y metadatos de los archivos. El texto extraído se envía a la API de OpenAI configurada.

## Arquitectura

- **Next.js App Router, React y TypeScript**: interfaces, formularios y API.
- **PostgreSQL y Prisma**: cuentas, sesiones, exámenes publicados, materiales, preguntas, intentos y respuestas.
- **OpenAI API**: generación y revisión fundamentada de preguntas.
- **pdfjs-dist, @napi-rs/canvas y Tesseract.js**: extracción de PDF y OCR.
- **file-type y sharp**: firma de archivo y límites de resolución.
- **bcryptjs**: hash de contraseñas.

## Configuración local

1. Node.js 20 o posterior y PostgreSQL.
2. `npm install`.
3. Copia `.env.example` a `.env` y configura `DATABASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL` y un `ADMIN_TOKEN` largo y aleatorio. Opcionalmente define `MATERIAL_STORAGE_DIR` y `TESSDATA_PATH`.
4. `npx prisma generate` y `npm run db:push` para aplicar las tablas y relaciones nuevas conservando los datos existentes.
5. `npm test` y `npm run dev`.

La primera operación OCR descarga los datos de idioma si `TESSDATA_PATH` no apunta a los archivos instalados. El historial administrativo existente continúa en `/admin`; el profesor consulta exclusivamente sus propios exámenes y resultados en `/profesor`.
