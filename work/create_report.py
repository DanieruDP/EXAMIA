from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.section import WD_SECTION
from pathlib import Path

ROOT = Path(r'C:\Users\admin\Documents\Codex\2026-11-08\desarrolla-una-aplicaci-n-web-en')
OUT = ROOT / 'outputs' / 'EXAMIA_Alcance_Funcionalidad_y_Exclusiones.docx'
OUT.parent.mkdir(parents=True, exist_ok=True)

doc = Document()
sec = doc.sections[0]
sec.top_margin = Inches(.72); sec.bottom_margin = Inches(.7); sec.left_margin = Inches(.82); sec.right_margin = Inches(.82)
sec.page_width = Inches(8.5); sec.page_height = Inches(11)

NAVY='17324D'; TEAL='087E8B'; LIGHT='EAF2F6'; PALE='F5F8FA'; GRAY='5B6570'; DARK='202A35'; BORDER='D9D9D9'; WHITE='FFFFFF'
styles=doc.styles
styles['Normal'].font.name='Aptos'; styles['Normal'].font.size=Pt(10.5); styles['Normal'].font.color.rgb=RGBColor.from_string(DARK)
styles['Normal'].paragraph_format.space_after=Pt(6); styles['Normal'].paragraph_format.line_spacing=1.12
for name,size,color in [('Title',30,NAVY),('Heading 1',19,NAVY),('Heading 2',13,TEAL),('Heading 3',11,NAVY)]:
    st=styles[name]; st.font.name='Aptos Display' if name!='Normal' else 'Aptos'; st.font.size=Pt(size); st.font.bold=True; st.font.color.rgb=RGBColor.from_string(color)
    st.paragraph_format.space_before=Pt(12 if name!='Title' else 0); st.paragraph_format.space_after=Pt(6)

def shade(cell, fill):
    tcPr=cell._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),fill); tcPr.append(shd)
def margins(cell, top=110, start=130, bottom=110, end=130):
    tc=cell._tc; pr=tc.get_or_add_tcPr(); mar=OxmlElement('w:tcMar')
    for m,v in [('top',top),('start',start),('bottom',bottom),('end',end)]:
        el=OxmlElement('w:'+m); el.set(qn('w:w'),str(v)); el.set(qn('w:type'),'dxa'); mar.append(el)
    pr.append(mar)
def borders(table):
    tblPr=table._tbl.tblPr; b=OxmlElement('w:tblBorders')
    for edge in ('top','left','bottom','right','insideH','insideV'):
        e=OxmlElement('w:'+edge); e.set(qn('w:val'),'single'); e.set(qn('w:sz'),'5'); e.set(qn('w:color'),BORDER); b.append(e)
    tblPr.append(b)
def table(headers, rows, widths=None, fontsize=9.3):
    t=doc.add_table(rows=1, cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=False
    if widths:
        for c,w in zip(t.columns,widths): c.width=Inches(w)
    for i,h in enumerate(headers):
        c=t.rows[0].cells[i]; c.text=h; shade(c,NAVY); margins(c); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for p in c.paragraphs:
            p.paragraph_format.space_after=Pt(0)
            for r in p.runs: r.font.bold=True; r.font.size=Pt(9); r.font.color.rgb=RGBColor.from_string(WHITE)
    for ri,row in enumerate(rows):
        cells=t.add_row().cells
        if widths:
            for c,w in zip(cells,widths): c.width=Inches(w)
        for i,txt in enumerate(row):
            c=cells[i]; c.text=str(txt); margins(c); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if ri%2==1: shade(c,PALE)
            for p in c.paragraphs:
                p.paragraph_format.space_after=Pt(1); p.paragraph_format.line_spacing=1.05
                for r in p.runs: r.font.size=Pt(fontsize)
    borders(t); doc.add_paragraph().paragraph_format.space_after=Pt(2)
    return t
def para(text='', boldlead=None, style=None):
    p=doc.add_paragraph(style=style)
    if boldlead and text.startswith(boldlead):
        p.add_run(boldlead).bold=True; p.add_run(text[len(boldlead):])
    else: p.add_run(text)
    return p
def bullet(text):
    p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.space_after=Pt(3); p.add_run(text); return p
def page_title(kicker,title,deck=None):
    p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(3); r=p.add_run(kicker.upper()); r.bold=True; r.font.size=Pt(9); r.font.color.rgb=RGBColor.from_string(TEAL)
    doc.add_heading(title,level=1)
    if deck: para(deck)
def add_page_field(p):
    p.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    run=p.add_run('EXAMIA · Documento de evaluación  |  '); run.font.size=Pt(8); run.font.color.rgb=RGBColor.from_string(GRAY)
    fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); p._p.append(fld)

# Header/footer
header=sec.header.paragraphs[0]; header.text='EXAMIA  /  DOCUMENTACIÓN DEL PROYECTO'; header.runs[0].font.bold=True; header.runs[0].font.size=Pt(8); header.runs[0].font.color.rgb=RGBColor.from_string(TEAL)
add_page_field(sec.footer.paragraphs[0])

# Cover
p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(70); r=p.add_run('INFORME DE PROYECTO'); r.bold=True; r.font.size=Pt(11); r.font.color.rgb=RGBColor.from_string(TEAL)
doc.add_paragraph('Alcance, funcionalidad y criterios de exclusión',style='Title')
p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(10); r=p.add_run('EXAMIA'); r.bold=True; r.font.size=Pt(21); r.font.color.rgb=RGBColor.from_string(NAVY)
para('Aplicación web de exámenes adaptativos sobre Arquitectura de Software')
para('Documento formal elaborado a partir de la revisión de la estructura, el código, las rutas del servidor y el modelo de datos del proyecto.')
p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(35); p.add_run('Identificación del producto').bold=True
para('El nombre solicitado para el proyecto es EXAMIA. En la interfaz que contiene el código, la marca visible actualmente es ARQ·EXAM; este informe usa EXAMIA para identificar el proyecto y aclara esa diferencia cuando resulta útil.')
p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(35); r=p.add_run('Conclusión ejecutiva'); r.bold=True; r.font.color.rgb=RGBColor.from_string(TEAL)
para('El sistema implementa un flujo acotado para crear preguntas desde fuentes web aprobadas, revisarlas como administrador y aplicarlas en exámenes universitarios adaptativos. La evaluación y la puntuación se calculan en el servidor. Para que la instalación funcione de punta a punta necesita PostgreSQL, credenciales y configuración de OpenAI, además de fuentes y preguntas activas.')
para('Fecha de revisión: 10 de noviembre de 2026')

doc.add_page_break()
page_title('01 · Criterio de evaluación','Definir alcance','Esta sección delimita para qué sirve EXAMIA, qué problema atiende y hasta dónde llega la versión revisada.')
doc.add_heading('Objetivo del proyecto',level=2)
para('EXAMIA es una aplicación web para preparar y realizar exámenes de opción múltiple sobre Arquitectura de Software. Su objetivo es ofrecer una evaluación breve que ajuste el nivel de la siguiente pregunta según el resultado de la respuesta anterior, mientras asigna puntos según la dificultad.')
doc.add_heading('Problema que busca resolver',level=2)
para('Un examen fijo puede ser demasiado fácil para algunas personas y demasiado difícil para otras. EXAMIA propone una secuencia sencilla: comenzar en nivel intermedio y adaptar el nivel pregunta a pregunta. El administrador puede basar el banco de preguntas en material de consulta seleccionado, y el estudiante recibe sus resultados y explicaciones al terminar.')
doc.add_heading('Alcance funcional incluido',level=2)
table(['Área','Qué cubre la aplicación'],[
('Contenido','Seis grupos temáticos limitados a Arquitectura de Software: fundamentos; atributos de calidad; monolitos y microservicios; arquitecturas en capas, hexagonal y limpia; patrones; escalabilidad, rendimiento, seguridad y disponibilidad.'),
('Preguntas','Opción múltiple de cuatro opciones, una respuesta correcta, explicación, dificultad del 1 al 5, tema, material de apoyo y URL fuente.'),
('Examen','Nombre del estudiante, tema general o específico, cantidad y duración configurables; inicia en nivel 3 (Intermedio).'),
('Adaptación y calificación','Una correcta aumenta un nivel y otorga puntos iguales a la dificultad de esa pregunta; una incorrecta resta un nivel y otorga cero puntos. El nivel queda entre 1 y 5.'),
('Administración','Validar y guardar fuentes, generar borradores, activar o archivar preguntas y fuentes, consultar el historial reciente de resultados.')],[1.35,5.95])
doc.add_heading('Límites del alcance',level=2)
bullet('La lectura de fuentes acepta solo HTTPS de una lista codificada de dominios permitidos. No es un buscador abierto ni acepta cualquier sitio web.')
bullet('La generación usa OpenAI en el servidor. El resultado es un borrador: requiere revisión y publicación del administrador antes de aparecer en exámenes.')
bullet('La adaptación es una regla directa basada en la respuesta anterior y el nivel de la pregunta; no construye un perfil de aprendizaje del estudiante.')
bullet('La versión identifica al estudiante por el nombre introducido en el examen; no ofrece cuentas personales ni gestión de cursos.')
bullet('La duración limita la entrega de respuestas y permite finalizar por tiempo; el resumen informa las respuestas efectivamente contestadas.')
para('El proyecto está enfocado exclusivamente en evaluaciones sobre Arquitectura de Software. Las funciones descritas se basan en el código revisado, no en una propuesta futura.')

doc.add_page_break()
page_title('02 · Criterio de evaluación','Funcionalidad por tipo de usuario','Las acciones disponibles se separan entre administración del contenido y realización del examen.')
doc.add_heading('Funciones del administrador',level=2)
table(['Acción','Funcionamiento observado'],[
('Acceder al panel','La API de administración exige un token configurado en el servidor. La interfaz de administración se encuentra en la ruta /admin.'),
('Agregar una fuente','Introduce una URL; el servidor comprueba que sea HTTPS y pertenezca a un dominio permitido, consulta el contenido, obtiene un título y muestra una vista previa breve. La fuente puede activarse o desactivarse.'),
('Generar preguntas','Selecciona una fuente activa, un tema y una cantidad. El servidor extrae texto y solicita a OpenAI preguntas en español con cuatro opciones, una respuesta correcta, explicación, nivel y material.'),
('Revisar y administrar','Las preguntas generadas se guardan desactivadas como borradores. El administrador puede revisarlas y activarlas o archivarlas; también puede consultar el banco de preguntas.'),
('Consultar historial','Puede ver resultados guardados de exámenes recientes, hasta 100 registros según la página de resultados administrativa.')],[1.5,5.8])
para('Las fuentes pasan por límites prácticos de seguridad: redirecciones controladas, tiempo máximo de consulta, tipo de contenido HTML o texto y tamaño máximo. Si el sitio bloquea la consulta o no contiene texto suficiente, se devuelve un error en vez de guardarlo como fuente válida.')
doc.add_heading('Funciones del estudiante',level=2)
table(['Paso','Qué hace el estudiante / qué hace el sistema'],[
('1. Configurar','Escribe su nombre y elige examen general o tema; establece cantidad de preguntas y minutos.'),
('2. Iniciar','El sistema revisa que haya preguntas activas para ese alcance y disponibles para el examen. Si no existen, muestra un mensaje indicando que hace falta contenido.'),
('3. Responder','Ve una pregunta y cuatro opciones. La respuesta correcta y la explicación no se envían junto con la pregunta.'),
('4. Recibir la siguiente','Tras enviar la opción, el servidor la valida, califica, guarda el resultado y selecciona una pregunta cercana al nuevo nivel.'),
('5. Terminar','Al completar la cantidad solicitada o agotarse el tiempo, se puede consultar el resultado detallado.')],[1.5,5.8])
doc.add_heading('Recorrido general de la información',level=2)
table(['Fuente web aprobada','→','Texto extraído','→','Borrador generado','→','Revisión del administrador','→','Pregunta activa'],[
('URL HTTPS permitida','','HTML o texto','','OpenAI en servidor','','Publicar / archivar','','Banco de preguntas')],[1.2,.25,1.1,.25,1.2,.25,1.35,.25,1.0],8.1)
para('Para el examen, la secuencia es: configuración → pregunta pública sin clave → respuesta al servidor → calificación y actualización de nivel → siguiente pregunta o resultado.')

doc.add_page_break()
page_title('03 · Criterio de evaluación','Adaptación y puntuación','Las reglas son deterministas y se ejecutan en el servidor para cada respuesta.')
doc.add_heading('Cómo cambia la dificultad',level=2)
para('El primer nivel es 3, llamado Intermedio. Una respuesta correcta aumenta el nivel en uno; una respuesta incorrecta lo reduce en uno. La aplicación limita siempre el resultado al rango del 1 al 5. Para elegir la siguiente pregunta, busca entre las preguntas activas del tema una cuyo nivel esté más cerca del nivel actual; si hay empate, prioriza la más antigua.')
table(['Respuesta','Nivel de la pregunta','Nivel siguiente','Puntos obtenidos'],[
('Correcta','3 · Intermedio','4 · Avanzado','3 puntos'),
('Correcta','4 · Avanzado','5 · Experto','4 puntos'),
('Incorrecta','3 · Intermedio','2 · Básico','0 puntos'),
('Incorrecta en nivel 1','1 · Muy básico','1 · Muy básico','0 puntos'),
('Correcta en nivel 5','5 · Experto','5 · Experto','5 puntos')],[1.35,1.8,2.0,2.15])
para('Ejemplo práctico: una estudiante responde correctamente una pregunta intermedia sobre microservicios. Recibe 3 puntos y el sistema intenta presentar una pregunta avanzada. Si después falla, obtiene cero puntos y el nivel baja a intermedio.')
doc.add_heading('Cómo se calcula la puntuación',level=2)
para('Cada respuesta correcta suma tantos puntos como el nivel de dificultad de la pregunta respondida. Las respuestas incorrectas suman cero. Por tanto, la puntuación total es la suma de los puntos ganados en las respuestas correctas; no se restan puntos por equivocarse.')
table(['Nivel','Etiqueta','Puntos si es correcta'],[
('1','Muy básico','1'),('2','Básico','2'),('3','Intermedio','3'),('4','Avanzado','4'),('5','Experto','5')],[1.0,3.8,2.5])
para('El porcentaje mostrado es el número de respuestas correctas dividido entre las respuestas contestadas. Si el examen termina por tiempo, las preguntas sin respuesta no se consideran aciertos ni errores dentro de ese porcentaje.')
doc.add_heading('Protección de las respuestas',level=2)
para('Al presentar una pregunta, el servidor elimina el índice de la opción correcta y su explicación antes de enviarla al navegador. Cuando el estudiante envía una opción, el servidor valida que sea una de las cuatro opciones, comprueba que la pregunta siga activa y no haya sido respondida, y calcula el resultado. La explicación, la opción correcta y la URL fuente se entregan después del envío y aparecen en el resultado.')
para('La clave de OpenAI y el token administrativo se leen desde variables de entorno en el servidor. Las rutas administrativas exigen el token configurado. Estas medidas reducen la exposición de datos sensibles en la interfaz; la protección operativa depende también de configurar correctamente el servidor y mantener secretos fuera del navegador.')

doc.add_page_break()
page_title('04 · Alcance y evidencia','Resultados, tecnología y límites','Esta parte resume la salida para el estudiante y relaciona las afirmaciones con componentes verificables del proyecto.')
doc.add_heading('Información del resultado',level=2)
bullet('Puntuación total y número de respuestas correctas e incorrectas.')
bullet('Porcentaje de aciertos sobre las respuestas contestadas.')
bullet('Nivel de dificultad más alto presentado. Aunque la API también calcula el nivel actual del examen, la pantalla de resultados visible muestra el máximo presentado.')
bullet('Desglose de cada respuesta: pregunta, selección, respuesta correcta, puntos, explicación, tema y URL de referencia.')
bullet('Resumen por tema, con cantidades y porcentajes; el resultado clasifica como dominio los temas con 70 % o más de aciertos y señala los demás para reforzar.')
para('La clasificación por tema solo es orientativa: depende de las preguntas contestadas y no equivale a una certificación académica.')
doc.add_heading('Tecnología y función',level=2)
table(['Tecnología','Uso en el proyecto'],[
('Next.js y React','Construyen la página web, las pantallas del estudiante y la administración, además de las rutas del servidor.'),
('TypeScript','Ayuda a definir y comprobar la estructura de los datos y las funciones.'),
('PostgreSQL y Prisma','Guardan fuentes, preguntas, exámenes y respuestas; Prisma conecta la aplicación con la base de datos.'),
('OpenAI API','Genera borradores de preguntas a partir del texto extraído de una fuente; se invoca desde el servidor.'),
('Variables de entorno','Guardan la URL de base de datos, la clave de OpenAI, el modelo y el token de administración.')],[1.65,5.65])
doc.add_heading('Criterios de exclusión',level=2)
table(['Fuera del proyecto','Motivo / efecto práctico'],[
('Materias distintas de Arquitectura de Software','Mantiene el banco y los exámenes dentro del temario definido.'),
('Cualquier URL de Internet sin restricción','Se limita a dominios permitidos para controlar el origen del material y reducir riesgos al consultar páginas.'),
('Publicación automática de preguntas','Los borradores deben ser revisados por el administrador antes de usarse en evaluaciones.'),
('Cuentas, perfiles, cursos y roles institucionales','El flujo actual funciona con nombre de estudiante y token de administración; no incluye una plataforma académica.'),
('Preguntas abiertas, ensayos o varias respuestas correctas','El modelo implementado es de cuatro opciones y una respuesta correcta, que permite calificación automática sencilla.'),
('Subida de archivos y generación desde documentos cargados','La fuente de contenido se introduce mediante URL consultada por el servidor.'),
('Adaptación basada en IA o historial de aprendizaje','La regla se limita a subir o bajar un nivel según la respuesta inmediata.'),
('Verificación independiente de hechos o fuentes','El sistema valida formato, dominio y estructura, pero no garantiza automáticamente que toda afirmación generada sea correcta; por eso existe la revisión administrativa.'),
('Analítica avanzada, reportes institucionales o historial ilimitado','La consulta administrativa disponible es un historial sencillo y acotado; no hay un módulo de analítica avanzada.')],[2.55,4.75],8.8)

doc.add_page_break()
page_title('05 · Cierre','Conclusión y trazabilidad','El alcance queda definido por las funciones visibles en la aplicación, las rutas de servidor y las entidades persistidas.')
doc.add_heading('Conclusión',level=2)
para('EXAMIA implementa un ciclo completo de examen adaptativo de opción múltiple sobre Arquitectura de Software: el administrador agrega fuentes permitidas, genera y revisa preguntas, y el estudiante responde un examen configurado por tema, cantidad y duración. El servidor mantiene la clave correcta protegida durante la evaluación, aplica las reglas de nivel y puntos, y entrega un resumen explicativo al finalizar.')
para('La solución mantiene un propósito deliberadamente acotado. No sustituye un sistema de gestión académica ni garantiza por sí sola la exactitud del contenido generado. Antes de utilizarla en una instalación local o institucional se requiere configurar la base PostgreSQL, las variables de entorno y el acceso al servicio de OpenAI, así como cargar y publicar preguntas revisadas.')
doc.add_heading('Evidencia revisada en el código',level=2)
table(['Componente','Qué evidencia'],[
('app/page.tsx','Pantalla inicial: nombre, tema, cantidad, duración e inicio en nivel intermedio.'),
('app/api/exams/route.ts','Validación de configuración, selección temática y creación del examen en nivel 3.'),
('lib/domain.ts','Niveles, ajuste entre 1 y 5, puntuación y eliminación de clave/explicación en el objeto público.'),
('lib/exam-service.ts','Selección adaptativa, validación y evaluación de respuestas en el servidor.'),
('lib/source.ts','Allowlist de dominios, HTTPS, límites de lectura y extracción del texto de las fuentes.'),
('lib/generate.ts','Uso servidor de OpenAI y validación de formato de las preguntas generadas.'),
('app/api/admin/sources y questions','Gestión de fuentes, generación, revisión y activación de preguntas.'),
('app/api/exams/[id]/finish/route.ts','Cálculo del resultado, desglose, porcentaje y resumen por tema.'),
('prisma/schema.prisma','Persistencia de fuentes, preguntas, exámenes y respuestas.'),
('package.json y .env.example','Tecnologías, comandos del proyecto y variables requeridas para configurarlo.')],[2.65,4.65],8.7)
doc.add_heading('Condiciones de ejecución',level=2)
para('La configuración de ejemplo muestra PostgreSQL en DATABASE_URL, OPENAI_API_KEY, OPENAI_MODEL y ADMIN_TOKEN. La base de preguntas no viene precargada: para que un estudiante pueda iniciar un examen, primero se debe guardar al menos una fuente válida, generar preguntas, revisarlas y activarlas. La generación requiere una clave de API de OpenAI válida.')
para('Documento elaborado con base en el estado del código revisado el 10 de noviembre de 2026.')

# Keep headings with following paragraphs and repeat table headers.
for p in doc.paragraphs:
    if p.style.name.startswith('Heading'):
        p.paragraph_format.keep_with_next=True
for t in doc.tables:
    trPr=t.rows[0]._tr.get_or_add_trPr(); rep=OxmlElement('w:tblHeader'); rep.set(qn('w:val'),'true'); trPr.append(rep)

doc.core_properties.title='EXAMIA Alcance funcionalidad y criterios de exclusión'
doc.core_properties.subject='Documentación formal de criterios de evaluación del proyecto EXAMIA'
doc.core_properties.author='OpenAI'
doc.save(OUT)
print(OUT)

