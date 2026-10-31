# MV Assistant

Primeira versão web do MV Assistant, feita com Next.js e preparada para deploy na Vercel.

## Rodar localmente

1. Instale Node.js 20 ou superior.
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local` e configure sua chave de API.
4. Execute `npm run dev`.
5. Abra http://localhost:3000.

## Configurar a IA na Vercel

Em Project Settings → Environment Variables, configure:

- `OPENAI_API_KEY`: chave de API do provedor.
- `OPENAI_MODEL`: modelo disponível para sua chave (padrão: `gpt-4o-mini`).

A chave fica no servidor e não deve ser colocada no código do navegador. O uso da API pode gerar custos conforme o provedor e o plano da conta.

## Estado desta versão

Inclui interface de chat responsiva e rota de servidor para conversar com um modelo compatível com a API da OpenAI. Ainda não inclui banco de dados, login, histórico persistente, voz, loja de plugins, execução autônoma de agentes ou acesso ao computador local. Essas funções precisam ser implementadas separadamente, com permissões e confirmações para ações importantes.