import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const {PresentationFile,FileBlob}=await import(pathToFileURL(runtime).href);
const root='C:/Users/admin/Documents/Codex/2026-11-08/desarrolla-una-aplicaci-n-web-en';
const build=path.join(root,'outputs','.build');
const source=path.join(root,'outputs','EXAMIA_Arquitectura_y_funcionamiento_v2.pptx');
const candidate=path.join(build,'candidate-criteria.pptx');
await fs.mkdir(build,{recursive:true});
const p=await PresentationFile.importPptx(await FileBlob.load(source));
const titles=new Map([
 ['Alcance del proyecto','Alcance'],
 ['Qué hace cada tipo de usuario','Funcionalidad'],
 ['Qué queda fuera del proyecto','Criterios de exclusión'],
 ['Flujo de datos del examen','Flujo de datos y arquitectura'],
 ['Bloques principales de la aplicación','Diagrama de bloques'],
 ['Cómo se organiza la información','Modelado de datos'],
 ['Interfaz de creación y acceso','Diseño de interfaz'],
 ['Cómo se limita la generación con IA','Ingeniería de prompts'],
 ['Qué comprueba la suite de pruebas','Pruebas'],
]);
const labelMap=new Map([
 ['1 · DEFINIR ALCANCE','CRITERIO 1'],['2 · FUNCIONALIDAD','CRITERIO 2'],
 ['3 · CRITERIOS DE EXCLUSIÓN','CRITERIO 3'],['4 · FLUJO DE DATOS Y ARQUITECTURA','CRITERIO 4'],
 ['5 · DIAGRAMA DE BLOQUES','CRITERIO 5'],['6 · MODELADO DE DATOS','CRITERIO 6'],
 ['7 · DISEÑO DE INTERFAZ','CRITERIO 7'],['8 · INGENIERÍA DE PROMPTS','CRITERIO 8'],
 ['9 · PRUEBAS','CRITERIO 9'],
]);
const snap=await p.inspect({kind:'slide,textbox',limit:400});
const changed=[];
for(const item of snap.records||[]){
  const next=titles.get(item.text)||labelMap.get(item.text);
  if(!next)continue;
  const target=p.resolve(item.id);
  target.text.replace(item.text,next);
  changed.push({from:item.text,to:next,id:item.id});
}
if(changed.length!==18)throw new Error(`Se esperaban 18 cambios de encabezado, se aplicaron ${changed.length}`);
const verify=await p.inspect({kind:'slide,textbox',limit:400});
for(const expected of titles.values())if(!(verify.records||[]).some(v=>v.text===expected))throw new Error(`No se confirmó el título: ${expected}`);
for(const [i,s] of p.slides.items.entries()){
 const png=await p.export({slide:s,format:'png',scale:1});
 await fs.writeFile(path.join(build,`criteria-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
await (await PresentationFile.exportPptx(p)).save(candidate);
console.log(JSON.stringify({candidate,slideCount:p.slides.items.length,changed,notes:p.slides.items.map(s=>Boolean(s.speakerNotes.text))}));
