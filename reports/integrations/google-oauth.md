# Google OAuth e relatórios administrativos

Implementação: fluxo Authorization Code com PKCE S256 e state aleatório, cookie HttpOnly/Secure/SameSite=Lax de 10 minutos, consumo atômico do state contra replay. Entrada e configuração exigem identidade administrativa, senha administrativa e origem correspondente. O callback usa o state e cookie (a sessão administrativa SameSite=Strict não acompanha o retorno externo).

Client Secret, access token, refresh token, seleção e estado são armazenados criptografados com AES-GCM, IV aleatório e identificador da linha como contexto autenticado. Chave GOOGLE_TOKEN_ENCRYPTION_KEY provisionada como segredo de runtime, fora do repositório. Não remover/rotacionar sem migrar os registros ou reconectar as contas. Não são emitidos segredos em respostas públicas, diagnósticos ou auditoria.

Permissões somente de leitura: analytics.readonly e webmasters.readonly. Lista propriedades acessíveis pelas APIs oficiais; valida seleção antes de persistir; atualiza tokens no servidor. Relatórios sob demanda dos últimos 28 dias completos: Search Console (totais e até 10 queries; dados finais), Analytics (usuários ativos, sessões e visualizações). Falhas independentes por ferramenta. Desconexão revoga token e remove conexão e seleção local. Não armazena relatórios em cache nem exporta dados para terceiros.

## Configuração necessária pelo proprietário
1. Google Cloud: habilitar Search Console API, Analytics Data API e Analytics Admin API.
2. Configurar consentimento; para app externo em teste, incluir a conta nos usuários de teste. Verificar exigências do Google para produção.
3. Criar cliente OAuth Web; URI exata: https://descobridor.online/api/google/callback
4. No admin → Integrações Google, salvar Client ID e Client Secret nos campos protegidos (não enviar pelo chat).
5. Conectar Google, autorizar ambas as permissões, carregar e selecionar propriedades, salvar e atualizar relatórios.

## Validações
TypeScript; regressões de CMS, autenticação, analytics; testes com Google mockado para criptografia, contexto, autorização, CSRF, PKCE, cookie/state, replay, não exposição de tokens, refresh, seleção, relatórios, erro parcial e revogação. Build de produção via Sites.

Pendente: configuração do cliente OAuth real, consentimento do proprietário e teste ponta a ponta com APIs Google reais; inspeção visual autenticada. Nenhuma métrica simulada é exibida no site. Google Ads e Looker permanecem atalhos/configuração; não fazem parte dos relatórios OAuth desta entrega.

Referências: https://developers.google.com/identity/protocols/oauth2/web-server ; https://developers.google.com/identity/protocols/oauth2/resources/best-practices ; https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport ; https://developers.google.com/webmaster-tools/v1/searchanalytics/query
