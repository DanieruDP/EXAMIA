import {pathToFileURL} from 'node:url';
const runtime='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const {PresentationFile,FileBlob}=await import(pathToFileURL(runtime).href);
const p=await PresentationFile.importPptx(await FileBlob.load('C:/Users/admin/Documents/Codex/2026-11-08/desarrolla-una-aplicaci-n-web-en/outputs/EXAMIA_Arquitectura_y_funcionamiento_v2.pptx'));
const r=await p.inspect({kind:'slide,textbox',limit:300});
console.log(JSON.stringify({slideCount:p.slides.items.length,records:r.records?.map(v=>({id:v.id,text:v.text,slideId:v.slideId})),notes:p.slides.items.map(s=>s.speakerNotes.text)}));
