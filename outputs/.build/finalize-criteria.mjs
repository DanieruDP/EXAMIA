import path from 'node:path';
import {pathToFileURL} from 'node:url';
process.env.RUNTIME_NODE_MODULES='C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules';
const skill='C:/Users/admin/.codex/plugins/cache/openai-primary-runtime/presentations/26.1111.10930/skills/presentations';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const result=await finalizePresentation({
 workspaceDir:'C:/Users/admin/Documents/Codex/2026-11-08/desarrolla-una-aplicaci-n-web-en',
 candidatePath:'C:/Users/admin/Documents/Codex/2026-11-08/desarrolla-una-aplicaci-n-web-en/outputs/.build/candidate-criteria.pptx',
 finalPath:'C:/Users/admin/Documents/Codex/2026-11-08/desarrolla-una-aplicaci-n-web-en/outputs/EXAMIA_Presentacion_Criterios_Evaluacion.pptx',
 pythonExecutable:'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1111-570-0_26.1111.570.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
 explicitTotalSlideCount:11,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],
 fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,
 receiptPath:'C:/Users/admin/Documents/Codex/2026-11-08/desarrolla-una-aplicaci-n-web-en/.codex-finalizer/EXAMIA_Presentacion_Criterios_Evaluacion.validation.json'
});
console.log(JSON.stringify(result));
