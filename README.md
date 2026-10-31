# MV Code

Um assistente de programação em português, construído com Next.js, React e TypeScript.

## Recursos

- Interface responsiva de assistente de programação.
- Modos Código e Chat.
- Histórico de conversas salvo no navegador.
- Blocos de código com botão para copiar.
- Painel de contexto com links para os arquivos do repositório.
- Rota de servidor para conversar com um modelo compatível com a API da OpenAI.

## Executar no computador

1. Instale o Node.js 20 ou superior. O instalador inclui o npm.
2. Abra a pasta do projeto no terminal.
3. Execute npm install.
4. Crie um arquivo chamado .env.local com OPENAI_API_KEY e, opcionalmente, OPENAI_MODEL.
5. Execute npm run dev.
6. Abra http://localhost:3000 no navegador.

## Configurar a IA na Vercel

Em Project Settings → Environment Variables, adicione:

- OPENAI_API_KEY: chave de API do provedor.
- OPENAI_MODEL: modelo disponível para sua chave (padrão: gpt-4o-mini).

A chave deve ficar apenas no servidor, nunca no código do navegador. O uso da API pode gerar custos.

## Limitações atuais

O MV Code conversa com um modelo de IA, ajuda a escrever código e mantém o histórico local no navegador. Nesta versão, ele ainda não executa comandos, acessa o computador, sincroniza arquivos de um repositório nem cria commits automaticamente. Essas funções exigem uma camada de agente e permissões adicionais.
