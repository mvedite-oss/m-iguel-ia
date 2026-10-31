import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MV Code — Assistente de programação",
  description: "Seu espaço para criar projetos, escrever código e resolver problemas com IA."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
