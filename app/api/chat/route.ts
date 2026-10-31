import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "A IA ainda não foi conectada. Configure OPENAI_API_KEY nas variáveis de ambiente da Vercel." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const safeMessages = messages
      .filter((item: { role?: string; content?: string }) =>
        (item.role === "user" || item.role === "assistant") && typeof item.content === "string"
      )
      .slice(-20);

    const result = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é o MV Assistant, um assistente prestativo que responde em português brasileiro. Ajude com programação, ideias, estudos e projetos. Explique com clareza. Antes de sugerir ações que possam apagar arquivos, instalar programas ou alterar sistemas, peça confirmação."
          },
          ...safeMessages
        ],
        temperature: 0.7
      })
    });

    const data = await result.json();
    if (!result.ok) {
      return NextResponse.json({ error: data.error?.message || "Falha ao consultar o serviço de IA." }, { status: result.status });
    }

    const reply = data.choices?.[0]?.message?.content;
    return NextResponse.json({ reply: typeof reply === "string" ? reply : "Não consegui gerar uma resposta." });
  } catch {
    return NextResponse.json({ error: "Erro interno ao processar a mensagem." }, { status: 500 });
  }
}