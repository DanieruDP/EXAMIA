"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TEACHER");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch(`/api/auth/${mode === "register" ? "register" : "login"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo completar el acceso.");
      router.push(data.user.role === "TEACHER" ? "/profesor" : "/alumno");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo completar el acceso."); }
    finally { setBusy(false); }
  }
  return <main className="shell admin-shell"><header className="topbar"><a className="brand" href="/">EXAMIA</a><a className="admin-link" href="/">Volver al inicio</a></header><section className="panel login-panel"><small>{mode === "register" ? "CREA TU CUENTA" : "ACCESO SEGURO"}</small><h1>{mode === "register" ? "Registro." : "Iniciar sesión."}</h1><p>{mode === "register" ? "Elige el tipo de cuenta que necesitas." : "Entra a tu espacio de EXAMIA."}</p><form onSubmit={submit}>
    {mode === "register" && <><label>Nombre<input required maxLength={80} value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label><label>Tipo de cuenta<select value={role} onChange={e=>setRole(e.target.value)}><option value="TEACHER">Profesor</option><option value="STUDENT">Alumno</option></select></label></>}
    <label>Correo electrónico<input required type="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><label>Contraseña<input required type="password" minLength={10} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"}/>{mode === "register"&&<small>Mínimo 10 caracteres.</small>}</label>
    {error&&<p className="error" role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy?"Procesando…":mode === "register"?"Crear cuenta":"Entrar"}<span>→</span></button></form><p className="note">{mode === "register"?"¿Ya tienes cuenta?":"¿Aún no tienes cuenta?"} <a href={mode === "register"?"/iniciar-sesion":"/registro"}>{mode === "register"?"Inicia sesión":"Regístrate"}</a></p></section></main>;
}
