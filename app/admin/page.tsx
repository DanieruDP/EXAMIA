"use client";
import { useEffect, useState } from "react";

export default function Admin() {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const headers = { Authorization: `Bearer ${token}` };
  async function load() {
    const response = await fetch("/api/results", { headers, cache: "no-store" });
    if (!response.ok) { setMessage("Token de administración inválido."); return; }
    setResults(await response.json()); setMessage("");
  }
  useEffect(() => { const saved = localStorage.getItem("admin-token"); if (saved) { setToken(saved); setReady(true); } }, []);
  useEffect(() => { if (ready && token) { localStorage.setItem("admin-token", token); load(); } }, [ready, token]);
  if (!ready) return <main className="shell admin-shell"><header className="topbar"><a className="brand" href="/">EXAMIA</a></header><section className="panel login-panel"><small>ÁREA RESTRINGIDA</small><h1>Historial de exámenes.</h1><p>Ingresa el token definido por ADMIN_TOKEN en el servidor.</p><form onSubmit={event => { event.preventDefault(); setReady(true); }}><label>Token de administrador<input type="password" value={token} onChange={event => setToken(event.target.value)} required /></label><button className="primary">Entrar →</button></form></section></main>;
  return <main className="shell admin-shell"><header className="topbar"><a className="brand" href="/">EXAMIA</a><span className="admin-link">HISTORIAL DE EXÁMENES</span></header><div className="admin-intro"><div><div className="eyebrow"><i/> CONTROL ACADÉMICO</div><h1>Resultados<span>.</span></h1></div><button className="quiet-button" onClick={() => { localStorage.removeItem("admin-token"); setToken(""); setReady(false); }}>Salir ↗</button></div>{message && <p className="error" role="alert">{message}</p>}<section className="panel"><small>HISTORIAL · ÚLTIMOS 100 EXÁMENES</small><h2>Exámenes realizados</h2><div className="table-wrap"><table><thead><tr><th>Estudiante</th><th>Materia</th><th>Resultado</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>{results.map(result => <tr key={result.id}><td>{result.studentName}</td><td>{result.topic}</td><td>{result.correct}/{result.answered} · {result.percent}% · {result.score} pts</td><td>{result.status}</td><td>{new Date(result.startedAt).toLocaleString("es-MX")}</td></tr>)}</tbody></table>{results.length === 0 && <p>Aún no hay exámenes registrados.</p>}</div></section></main>;
}
