# MCP v3 — implementação por etapas

Etapa 1: central no admin, política por ferramenta, auditoria e aprovações persistidas.
Etapa 2: adapter GitHub REST restrito a alexmoretoni/descobridor-site; branches mcp/*, arquivos UTF-8, commit atômico com HEAD esperado, PR em rascunho e comparação.
Etapa 3: workflow GitHub Actions para TypeScript, regressão e build; requisições assíncronas com SHA exato e consulta dos jobs.
Etapa 4: tabelas de negócio paginadas, schema, exportação lógica paginada, snapshots e restauração de conteúdo, migrações aditivas ext_ com aprovação.
Etapa 5: interface de dispatch para workflows de preview/produção/rollback. A ativação depende de workflows que publiquem no provedor escolhido; o Sites não fornece ao Worker suas ferramentas de publicação do ChatGPT.

## Ativação

Configure GITHUB_MCP_TOKEN como segredo do runtime Sites ou cadastre o token no campo privado da central MCP no admin autenticado por senha. Nesse caso, é armazenado com AES-GCM e contexto próprio, usando a chave de criptografia já configurada no servidor; o valor nunca é retornado ao cliente. Use token fine-grained restrito ao repositório: Contents, Pull requests e Actions com leitura/escrita e Metadata com leitura. Não salvar no código ou conversa. A autenticação do plugin GitHub no chat não é transferida para o servidor.

Instale .github/workflows/mcp-checks.yml na branch descobridor-site. No admin, teste GitHub e configure o nome do workflow. Para preview/produção, forneça workflows próprios na branch principal com inputs operation, source_ref, source_sha, checkout do SHA exato e publicação no provedor. O workflow de produção deve usar environment com revisão obrigatória, verificar a origem do commit e usar credenciais restritas ao deploy. Campos vazios são mostrados como pendências, nunca como deploy ativo.

## Aprovações

Ferramentas sensíveis retornam approval_required e requestId. No admin autenticado por senha, revisar os argumentos e aprovar/rejeitar. Repetir a mesma chamada com approvalId=requestId em até 30 minutos. Hash dos argumentos, identidade e consumo atômico impedem alterar o payload ou reutilizar uma aprovação. Falha após consumo exige nova aprovação; interrupção deixa estado executing para investigação, sem retry automático de escrita.

Publicar páginas, alterar produtos/preços, excluir arquivos, restaurar snapshots, migrar e publicar/rollback de código exigem aprovação. O MCP não pode editar sua própria política nem aprovar solicitações. Políticas são verificadas novamente a cada chamada.

## Limites reais

Sem terminal no Worker ou acesso ao diretório /workspace. Testes/build são jobs remotos. Segredos e admin_security ficam fora das leituras do banco; site_settings não é exportada genericamente. Exportações não incluem checkout_snapshot e notas internas. Snapshots contêm páginas, configurações públicas e produtos, até 1 MB, sem backup físico do D1. Restauração preserva registros posteriores. Migrações permitem apenas adicionar coluna opcional ext_ em tabela de negócio; SQL livre e mudanças destrutivas exigem processo separado.

Deploy solicitado significa workflow aceito, não publicação concluída. Consulte runId no GitHub Actions e o status do provedor para confirmação. DNS, pagamentos externos, envios e credenciais continuam nas integrações próprias; estas não são inventadas pelo MCP.
