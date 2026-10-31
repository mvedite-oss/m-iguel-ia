import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "A IA ainda não foi conectada. Configure OPENAI_API_KEY nas variáveis de ambiente da Vercel ou no arquivo .env.local." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const mode = body.mode === "chat" ? "chat" : "code";
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const safeMessages = messages
      .filter((item: { role?: string; content?: string }) =>
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.length <= 30000
      )
      .slice(-24);

    const systemPrompt = mode === "code"
      ? "Você é o MV Code, um assistente de programação que conversa em português brasileiro. Ajude a criar sites, aplicativos, jogos e scripts. Analise os detalhes antes de sugerir mudanças. Quando escrever código, informe o caminho do arquivo e entregue blocos de código completos, prontos para copiar. Explique como instalar dependências e executar o projeto em passos simples. Preserve o código existente sempre que possível. IMPORTANTE: você não tem acesso ao computador, terminal, arquivos ou conta GitHub do usuário nesta conversa. Nunca diga que editou, executou, testou, publicou ou enviou arquivos. Diga claramente quando o usuário precisa copiar o código ou aplicar uma alteração. Para ações que possam apagar arquivos, instalar programas ou modificar sistemas, explique o que será feito antes e peça confirmação."
      : "Você é o MV Assistant, um assistente prestativo que responde em português brasileiro. Ajude com programação, ideias, estudos e projetos. Explique com clareza e exemplos. Você não tem acesso ao computador, terminal, arquivos ou GitHub do usuário; nunca afirme que executou ações ou alterou arquivos. Antes de sugerir ações que possam apagar arquivos, instalar programas ou alterar sistemas, explique o que será feito e peça confirmação.";

    const result = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...safeMessages
        ],
        temperature: 0.55
      })
    });

    const data = await result.json();
    if (!result.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Falha ao consultar o serviço de IA." },
        { status: result.status }
      );
    }

    const reply = data.choices?.[0]?.message?.content;
    return NextResponse.json({
      reply: typeof reply === "string" ? reply : "Não consegui gerar uma resposta."
    });
  } catch {
    return NextResponse.json({ error: "Erro interno ao processar a mensagem." }, { status: 500 });
  }
}
