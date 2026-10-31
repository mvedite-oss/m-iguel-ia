# MV Code

Um assistente de programação em português, construído com Next.js, React e TypeScript, conectado à API Gemini.

## Recursos

- Interface responsiva de assistente de programação.
- Modos Código e Chat.
- Histórico de conversas salvo no navegador.
- Blocos de código com botão para copiar.
- Painel de contexto com links para os arquivos do repositório.
- Rota de servidor integrada à API Gemini.

## Executar no computador

1. Instale o Node.js 20 ou superior. O instalador inclui o npm.
2. Abra a pasta do projeto no terminal.
3. Execute npm install.
4. Crie um arquivo chamado .env.local na raiz do projeto.
5. Adicione GEMINI_API_KEY com sua chave do Google AI Studio e, opcionalmente, GEMINI_MODEL.
6. Execute npm run dev.
7. Abra http://localhost:3000 no navegador.

Exemplo de .env.local:

GEMINI_API_KEY=sua_chave_do_google_ai_studio
GEMINI_MODEL=gemini-3.8-flash

## Configurar a IA na Vercel

Em Project Settings → Environment Variables, adicione:

- GEMINI_API_KEY: chave criada no Google AI Studio.
- GEMINI_MODEL: modelo Gemini disponível para sua chave (padrão: gemini-3.8-flash).

Depois de salvar as variáveis, faça um novo deploy para a configuração entrar em vigor.

A chave deve ficar apenas no servidor, nunca no código do navegador ou em commits do GitHub. Não compartilhe a chave em conversas, capturas de tela ou repositórios.

## Obter uma chave Gemini

Crie ou consulte sua chave na página oficial do Google AI Studio:
https://aistudio.google.com/app/apikey

## Limitações atuais

O MV Code conversa com o Gemini, ajuda a escrever código e mantém o histórico local no navegador. Nesta versão, ele ainda não executa comandos, acessa o computador, sincroniza arquivos de um repositório nem cria commits automaticamente. Essas funções exigem uma camada de agente e permissões adicionais.
