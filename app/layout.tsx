import type { Metadata } from "next";
import "./styles.css";
export const metadata: Metadata = { title: "EXAMIA · Exámenes adaptativos", description: "Crea exámenes adaptativos a partir de tus materiales de estudio" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
