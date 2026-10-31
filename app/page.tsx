"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
type Thread = { id: string; title: string; updatedAt: number; messages: Message[] };
type Mode = "chat" | "code";

const STORAGE_KEY = "mv-code-threads-v1";
const suggestions = [
  { icon: "✦", title: "Criar um site", prompt: "Quero criar um site moderno e responsivo. Me ajude a planejar e gerar os arquivos completos.", mode: "code" as Mode },
  { icon: "⌘", title: "Corrigir um erro", prompt: "Vou enviar um erro do meu projeto. Me ajude a encontrar a causa e corrigir.", mode: "code" as Mode },
  { icon: "⌁", title: "Explicar um código", prompt: "Explique este código passo a passo, usando exemplos simples.", mode: "chat" as Mode }
];

function MessageBody({ content }: { content: string }) {
  const parts = content.split(/\x60{3}([a-zA-Z0-9_-]*)\n([\s\S]*?)\x60{3}/g);
  return (
    <div className="message-body">
      {parts.map((part, index) => {
        if (index % 3 === 1) return null;
        if (index % 3 === 2) {
          const language = parts[index - 1] || "código";
          return (
            <div className="code-block" key={index}>
              <div className="code-block-head">
                <span>{language}</span>
                <button onClick={() => void navigator.clipboard.writeText(part)} type="button">Copiar código</button>
              </div>
              <pre><code>{part}</code></pre>
            </div>
          );
        }
        return part.trim() ? <p key={index}>{part}</p> : null;
      })}
    </div>
  );
}

export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("code");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [showContext, setShowContext] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setThreads(parsed as Thread[]);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  }, [threads, ready]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeId) ?? null,
    [threads, activeId]
  );
  const recentThreads = useMemo(
    () => [...threads].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 12),
    [threads]
  );

  function startNewTask() {
    setActiveId(null);
    setInput("");
  }

  async function sendMessage(event?: FormEvent<HTMLFormElement>, suppliedText?: string, suppliedMode?: Mode) {
    event?.preventDefault();
    const prompt = (suppliedText ?? input).trim();
    const requestMode = suppliedMode ?? mode;
    if (!prompt || busy) return;

    const threadId = activeId || ("task-" + Date.now() + "-" + Math.floor(Math.random() * 100000));
    const userMessage: Message = { role: "user", content: prompt };
    const nextMessages = [...(activeThread?.messages ?? []), userMessage];
    const title = activeThread?.title ?? prompt.slice(0, 48);

    setThreads((current) => {
      const exists = current.some((thread) => thread.id === threadId);
      if (exists) {
        return current.map((thread) =>
          thread.id === threadId
            ? { ...thread, messages: [...thread.messages, userMessage], updatedAt: Date.now() }
            : thread
        );
      }
      return [{ id: threadId, title, updatedAt: Date.now(), messages: nextMessages }, ...current];
    });
    setActiveId(threadId);
    setInput("");
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, mode: requestMode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível obter uma resposta.");
      const assistantMessage: Message = { role: "assistant", content: data.reply || "Não consegui gerar uma resposta." };
      setThreads((current) =>
        current.map((thread) =>
          thread.id === threadId
            ? { ...thread, messages: [...thread.messages, assistantMessage], updatedAt: Date.now() }
            : thread
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
      setThreads((current) =>
        current.map((thread) =>
          thread.id === threadId
            ? { ...thread, messages: [...thread.messages, { role: "assistant", content: errorMessage }], updatedAt: Date.now() }
            : thread
        )
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-symbol"><span /></span>
          <span className="brand-name">MV Code</span>
          <span className="beta-tag">BETA</span>
        </a>

        <button className="new-task-button" onClick={startNewTask} type="button">
          <span className="plus-icon">＋</span> Nova tarefa
          <kbd>Ctrl K</kbd>
        </button>

        <div className="sidebar-section-label">WORKSPACE</div>
        <div className="workspace-card">
          <div className="workspace-icon">M</div>
          <div className="workspace-meta">
            <strong>m-iguel-ia</strong>
            <span>Projeto atual</span>
          </div>
          <span className="workspace-chevron">⌄</span>
        </div>

        <div className="sidebar-section-label recent-label">RECENTES</div>
        <nav className="task-list" aria-label="Conversas recentes">
          {recentThreads.length === 0 ? (
            <div className="empty-history">Suas tarefas vão aparecer aqui.</div>
          ) : recentThreads.map((thread) => (
            <button
              className={thread.id === activeId ? "task-link active" : "task-link"}
              key={thread.id}
              onClick={() => setActiveId(thread.id)}
              type="button"
              title={thread.title}
            >
              <span className="task-link-icon">◷</span>
              <span>{thread.title}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <a className="repo-link" href="https://github.com/mvedite-oss/m-iguel-ia" target="_blank" rel="noreferrer">
            <span className="github-mark">⌘</span> Abrir repositório <span className="external-arrow">↗</span>
          </a>
          <div className="profile-row">
            <div className="profile-avatar">M</div>
            <div className="profile-copy"><strong>Meu workspace</strong><span>Plano pessoal</span></div>
            <span className="profile-menu">···</span>
          </div>
        </div>
      </aside>

      <section className="main-column">
        <header className="topbar">
          <div className="breadcrumbs">
            <span className="crumb-muted">Workspace</span><span className="crumb-slash">/</span>
            <strong>m-iguel-ia</strong><span className="branch-pill">main</span>
          </div>
          <div className="topbar-actions">
            <span className="connection-state"><i /> Projeto carregado</span>
            <a className="topbar-github" href="https://github.com/mvedite-oss/m-iguel-ia" target="_blank" rel="noreferrer">GitHub ↗</a>
            <button className="context-toggle" onClick={() => setShowContext((value) => !value)} type="button" aria-label="Mostrar contexto do projeto">▤</button>
          </div>
        </header>

        <div className="conversation-area">
          {!activeThread || activeThread.messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-mark"><span>✳</span></div>
              <div className="welcome-kicker">SEU PARCEIRO DE PROGRAMAÇÃO</div>
              <h1>Vamos construir<br /><span>algo incrível.</span></h1>
              <p className="welcome-description">Descreva uma ideia, cole um erro ou peça ajuda com seu código. Vamos trabalhar nisso juntos.</p>

              <div className="suggestion-grid">
                {suggestions.map((item) => (
                  <button
                    className="suggestion-card"
                    key={item.title}
                    onClick={() => { setMode(item.mode); void sendMessage(undefined, item.prompt, item.mode); }}
                    type="button"
                  >
                    <span className="suggestion-icon">{item.icon}</span>
                    <span className="suggestion-title">{item.title}</span>
                    <span className="suggestion-arrow">↗</span>
                    <span className="suggestion-description">
                      {item.title === "Criar um site" ? "Comece uma página do zero" : item.title === "Corrigir um erro" ? "Encontre e resolva problemas" : "Entenda cada parte do código"}
                    </span>
                  </button>
                ))}
              </div>

              <div className="welcome-footnote"><span className="sparkle-small">✦</span> Feito para transformar ideias em código.</div>
            </div>
          ) : (
            <div className="message-list">
              <div className="thread-heading">
                <div><span className="thread-eyebrow">TAREFA</span><h2>{activeThread.title}</h2></div>
                <span className="thread-count">{activeThread.messages.length} mensagens</span>
              </div>
              {activeThread.messages.map((message, index) => (
                <article className={"message-row " + message.role} key={index}>
                  <div className={message.role === "assistant" ? "message-avatar ai-avatar" : "message-avatar user-avatar"}>
                    {message.role === "assistant" ? "✳" : "M"}
                  </div>
                  <div className="message-main">
                    <div className="message-meta">
                      <strong>{message.role === "assistant" ? "MV Code" : "Você"}</strong>
                      {message.role === "assistant" && <span className="assistant-label">ASSISTENTE</span>}
                      <button className="copy-message" onClick={() => void navigator.clipboard.writeText(message.content)} type="button">Copiar</button>
                    </div>
                    <MessageBody content={message.content} />
                  </div>
                </article>
              ))}
              {busy && <div className="thinking-row"><span className="thinking-dots"><i /><i /><i /></span> MV Code está pensando...</div>}
            </div>
          )}
        </div>

        <div className="composer-wrap">
          <form className="composer" onSubmit={(event) => void sendMessage(event)}>
            <textarea
              aria-label="Mensagem"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={mode === "code" ? "Descreva o que você quer construir ou corrigir..." : "Pergunte alguma coisa..."}
              rows={2}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
            />
            <div className="composer-toolbar">
              <div className="composer-tools">
                <button className={mode === "code" ? "mode-button selected" : "mode-button"} onClick={() => setMode(mode === "code" ? "chat" : "code")} type="button">
                  <span>⌘</span> {mode === "code" ? "Modo Código" : "Modo Chat"} <span className="mode-chevron">⌄</span>
                </button>
                <span className="composer-hint">Enter para enviar · Shift + Enter para quebrar linha</span>
              </div>
              <button className="send-button" disabled={busy || !input.trim()} type="submit" aria-label="Enviar mensagem">↑</button>
            </div>
          </form>
          <div className="disclaimer">O MV Code pode cometer erros. Revise o código antes de usar.</div>
        </div>
      </section>

      <aside className={showContext ? "context-panel is-open" : "context-panel"}>
        <div className="context-header"><span>CONTEXTO DO PROJETO</span><button onClick={() => setShowContext(false)} type="button" aria-label="Fechar painel">×</button></div>
        <div className="project-summary">
          <div className="project-icon">⌘</div>
          <div><strong>m-iguel-ia</strong><span>Repositório GitHub</span></div>
        </div>
        <div className="context-divider" />
        <div className="context-group-title">AMBIENTE</div>
        <div className="context-row"><span>Branch</span><strong><i className="branch-dot" /> main</strong></div>
        <div className="context-row"><span>Framework</span><strong>Next.js 15</strong></div>
        <div className="context-row"><span>Linguagem</span><strong>TypeScript</strong></div>
        <div className="context-divider" />
        <div className="context-group-title">ARQUIVOS DO PROJETO</div>
        <a className="file-row" href="https://github.com/mvedite-oss/m-iguel-ia/blob/main/app/page.tsx" target="_blank" rel="noreferrer"><span className="file-icon ts">TS</span><span>app/page.tsx</span><span>↗</span></a>
        <a className="file-row" href="https://github.com/mvedite-oss/m-iguel-ia/blob/main/app/globals.css" target="_blank" rel="noreferrer"><span className="file-icon css">#</span><span>app/globals.css</span><span>↗</span></a>
        <a className="file-row" href="https://github.com/mvedite-oss/m-iguel-ia/blob/main/app/api/chat/route.ts" target="_blank" rel="noreferrer"><span className="file-icon ts">TS</span><span>app/api/chat/route.ts</span><span>↗</span></a>
        <a className="file-row" href="https://github.com/mvedite-oss/m-iguel-ia/blob/main/package.json" target="_blank" rel="noreferrer"><span className="file-icon json">{ }</span><span>package.json</span><span>↗</span></a>
        <div className="context-divider" />
        <div className="context-group-title">SOBRE ESTE AMBIENTE</div>
        <div className="info-card">
          <span className="info-card-icon">✦</span>
          <strong>Assistente de código</strong>
          <p>Conversa com IA e ajuda para escrever, entender e corrigir código.</p>
        </div>
        <div className="notice-card">
          <span>ⓘ</span>
          <p>Esta versão ainda não executa comandos nem grava alterações no GitHub automaticamente.</p>
        </div>
        <a className="view-repo-button" href="https://github.com/mvedite-oss/m-iguel-ia" target="_blank" rel="noreferrer">Ver repositório completo <span>↗</span></a>
      </aside>
    </main>
  );
}
