import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MV Assistant",
  description: "Seu assistente de IA para ideias, estudos e programação."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}