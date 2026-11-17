"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function load() {
    const me = await fetch("/api/auth/me", { cache: "no-store" }).then(r=>r.json());
    if (!me.user) { router.replace("/iniciar-sesion"); return; }
    if (me.user.role !== "TEACHER") { router.replace("/alumno"); return; }
    const response = await fetch("/api/teacher/exams", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    setExams(data); setBusy(false);
  }
  useEffect(()=>{ load().catch(reason=>{setError(reason.message||"No se pudieron cargar tus exámenes.");setBusy(false)}) },[]);
  async function logout() { await fetch("/api/auth/logout",{method:"POST"});router.replace("/"); }
  async function copy(value:string) { await navigator.clipboard.writeText(value);setNotice("Copiado al portapapeles.");setTimeout(()=>setNotice(""),1800); }
  return <main className="shell admin-shell"><header className="topbar"><a className="brand" href="/">EXAMIA</a><div><a className="admin-link" href="/profesor">PANEL DEL PROFESOR</a><button className="quiet-button header-logout" onClick={logout}>Salir</button></div></header><div className="admin-intro"><div><div className="eyebrow"><i/> ESPACIO DOCENTE</div><h1>Mis exámenes<span>.</span></h1></div><button className="primary teacher-create" onClick={()=>router.push("/profesor/examenes/nuevo")}>Crear examen <span>＋</span></button></div>{notice&&<p className="notice">{notice}</p>}{error&&<p className="error">{error}</p>}{busy?<p>Cargando tus exámenes…</p>:exams.length===0?<section className="panel empty-teacher"><small>PRIMER PASO</small><h2>Aún no has creado un examen</h2><p>Adjunta material de estudio, configura la evaluación y compártela con tu grupo.</p><button className="primary" onClick={()=>router.push("/profesor/examenes/nuevo")}>Crear mi primer examen →</button></section>:<section className="teacher-exam-list">{exams.map(exam=><article className="panel teacher-exam" key={exam.id}><div className="teacher-exam-head"><div><small>{exam.subject}</small><h2>{exam.title}</h2><p>{exam.questionCount} preguntas · {exam.durationMinutes} min · {exam.participantCount} participantes · {exam.attemptCount} intentos</p></div><span className={`exam-status ${exam.status.toLowerCase()}`}>{exam.status === "PUBLISHED"?"Publicado":exam.status === "CLOSED"?"Cerrado":"Borrador"}</span></div><div className="teacher-exam-actions"><button className="quiet-button" onClick={()=>router.push(`/profesor/examenes/${exam.id}`)}>Ver detalle y resultados</button>{exam.status === "PUBLISHED"&&<><button className="quiet-button" onClick={()=>copy(`${window.location.origin}/r/${exam.accessCode}`)}>Copiar enlace</button><button className="quiet-button" onClick={()=>copy(exam.accessCode)}>Copiar código {exam.accessCode}</button></>}</div></article>)}</section>}</main>;
}
