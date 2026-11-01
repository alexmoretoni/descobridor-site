# Plugin MCP Descobridor

Servidor stateless POST /mcp, protocolo 2026-07-28: server/discover, tools/list, tools/call, initialize e ping. Manifesto Sites declara capabilities: [mcp]. A publicação provisiona o plugin privado do proprietário; o site público mantém a audiência atual.

Ferramentas: list_pages, get_page, save_page, list_products, save_product, get_public_settings, google_connection_status, google_reports.

## Autorização
Sites autentica o chamador e injeta identidade verificada. tools/call exige identidade cujo e-mail corresponde ao ADMIN_EMAIL. Descoberta/listagem de schemas não inclui dados privados. Não há token administrativo em URLs, HTML ou respostas MCP. O painel mantém sua exigência de senha e cookie assinado. Para MCP, a identidade administrativa do plugin é um caminho de autenticação distinto, restrito às ferramentas declaradas.

A aba Plugin MCP permite desligar todas as chamadas. O estado padrão habilitado foi autorizado pelo pedido de implementação. save_page e save_product reutilizam as regras do painel, sem duplicar lógica de validação/histórico. Alterações são auditadas. A API HTTP do dashboard não aceita flags que ignorem sua senha.

Sem acesso a tokens OAuth, senhas, chaves, dados de clientes/leads ou exclusão de registros. Google exige conexão e seleção de propriedades previamente autorizadas. Plugin não concede automaticamente acesso a serviços externos, agendamentos ou campanhas. Confirmações e permissões do aplicativo hospedeiro continuam aplicáveis.

## Validação
Testes: protocolo, descoberta, rejeição de anônimos/clientes, identidade administrativa, manutenção da senha no navegador, criação de rascunho, rejeição de publicação duplicada, argumentos extras/ferramentas desconhecidas, auditoria e desativação. Regressões existentes e OAuth mockado aprovados. TypeScript e build de produção.

Ativação final: plugin criado pelo Sites e instalado/conectado no ChatGPT/Codex. Se as ferramentas não forem carregadas na conversa atual, abrir nova conversa após instalar. Teste ponta a ponta do plugin será feito quando suas ferramentas forem disponibilizadas.
