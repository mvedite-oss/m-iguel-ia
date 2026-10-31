import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = {
  role?: string;
  content?: string;
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "A IA Gemini ainda não foi conectada. Configure GEMINI_API_KEY nas variáveis de ambiente da Vercel ou no arquivo .env.local."
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const mode = body.mode === "chat" ? "chat" : "code";
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const safeMessages = messages
      .filter(
        (item) =>
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string" &&
          item.content.length <= 30000
      )
      .slice(-24);

    const systemPrompt =
      mode === "code"
        ? "Você é o MV Code, um assistente de programação que conversa em português brasileiro. Ajude a criar sites, aplicativos, jogos e scripts. Analise os detalhes antes de sugerir mudanças. Quando escrever código, informe o caminho do arquivo e entregue blocos de código completos, prontos para copiar. Explique como instalar dependências e executar o projeto em passos simples. Preserve o código existente sempre que possível. IMPORTANTE: você não tem acesso ao computador, terminal, arquivos ou conta GitHub do usuário nesta conversa. Nunca diga que editou, executou, testou, publicou ou enviou arquivos. Diga claramente quando o usuário precisa copiar o código ou aplicar uma alteração. Para ações que possam apagar arquivos, instalar programas ou modificar sistemas, explique o que será feito antes e peça confirmação."
        : "Você é o MV Assistant, um assistente prestativo que responde em português brasileiro. Ajude com programação, ideias, estudos e projetos. Explique com clareza e exemplos. Você não tem acesso ao computador, terminal, arquivos ou GitHub do usuário; nunca afirme que executou ações ou alterou arquivos. Antes de sugerir ações que possam apagar arquivos, instalar programas ou alterar sistemas, explique o que será feito e peça confirmação.";

    const contents = safeMessages.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content as string }]
    }));

    if (contents.length === 0) {
      return NextResponse.json({ error: "Envie uma mensagem para começar." }, { status: 400 });
    }

    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const result = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" +
        encodeURIComponent(model) +
        ":generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents,
          generationConfig: {
            temperature: 0.55
          }
        })
      }
    );

    const data = await result.json();

    if (!result.ok) {
      const message =
        typeof data?.error?.message === "string"
          ? data.error.message
          : "Falha ao consultar a API Gemini.";
      return NextResponse.json({ error: message }, { status: result.status });
    }

    const parts = data?.candidates?.[0]?.content?.parts;
    const reply = Array.isArray(parts)
      ? parts
          .map((part: { text?: unknown }) => (typeof part.text === "string" ? part.text : ""))
          .filter(Boolean)
          .join("\n")
      : "";

    if (!reply) {
      return NextResponse.json(
        { error: "O Gemini não retornou texto. Tente enviar a mensagem novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao processar a mensagem." },
      { status: 500 }
    );
  }
}
