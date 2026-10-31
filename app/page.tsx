"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const suggestions = [
  "Crie um site simples para mim",
  "Explique um código que eu enviar",
  "Me ajude a criar um jogo"
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Eu sou o MV Assistant. Posso ajudar com programação, ideias, estudos e criação de projetos. O que vamos fazer hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendMessage(event?: FormEvent, text = input) {
    event?.preventDefault();
    const prompt = text.trim();
    if (!prompt || busy) return;
    const next = [...messages, { role: "user" as const, content: prompt }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível responder.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado.";
      setMessages([...next, { role: "assistant", content: message }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">MV</span><span>MV Assistant</span></div>
        <button className="new-chat" onClick={() => setMessages([{ role: "assistant", content: "Nova conversa iniciada! Como posso ajudar?" }])}>＋ Nova conversa</button>
        <div className="side-note">SEU ESPAÇO DE CRIAÇÃO</div>
        <div className="side-item">✦ Programação</div>
        <div className="side-item">⌘ Projetos</div>
        <div className="side-item">◷ Conversas</div>
        <div className="sidebar-bottom"><span className="status-dot" /> Primeira versão</div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><span className="mobile-brand">MV Assistant</span><span className="model-label">Assistente de IA</span></div>
          <span className="online"><i /> Online</span>
        </header>

        <div className="chat-area">
          <div className="welcome">
            <div className="spark">✦</div>
            <p className="eyebrow">IDEIAS VIRAM PROJETOS</p>
            <h1>O que vamos criar<br /><span>hoje?</span></h1>
            <p className="subtitle">Converse com o MV Assistant para tirar ideias do papel e desenvolver seus projetos.</p>
            <div className="suggestions">
              {suggestions.map((item) => <button key={item} onClick={() => sendMessage(undefined, item)}>{item}<span>↗</span></button>)}
            </div>
          </div>

          <div className="messages">
            {messages.map((message, index) => (
              <article className={`message ${message.role}`} key={index}>
                <div className="avatar">{message.role === "assistant" ? "MV" : "EU"}</div>
                <div className="message-content"><div className="message-name">{message.role === "assistant" ? "MV Assistant" : "Você"}</div><p>{message.content}</p></div>
              </article>
            ))}
            {busy && <div className="typing"><span /> <span /> <span /> MV Assistant está pensando...</div>}
          </div>
        </div>

        <form className="composer" onSubmit={sendMessage}>
          <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Mande uma mensagem para o MV Assistant..." rows={1} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Enviar mensagem">↑</button>
          <div className="composer-hint">Enter para enviar · Shift + Enter para nova linha</div>
        </form>
        <footer>O MV Assistant pode cometer erros. Confira informações importantes.</footer>
      </section>
    </main>
  );
}