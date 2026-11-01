# Integrações Google

Nova aba administrativa, preservando autenticação/senha e permissões existentes.

- GA4 e GTM reutilizam o transporte existente após consentimento, sem duplicar tags.
- Search Console: código estritamente validado, renderizado como verification.google no head da home. Sem HTML arbitrário. Validação de propriedade ocorre no Google; propriedade de domínio exige DNS.
- Propriedade GA4 numérica e link Looker Studio servem para abrir relatórios autorizados em outra aba. Não são publicados no bootstrap, endpoint de configurações públicas ou painel do cliente.
- Ads: instruções para eventos personalizados no GTM; pedido registrado não significa pagamento. Nenhuma conversão de compra é criada automaticamente.
- Atalhos PageSpeed Insights, Tag Assistant e Rich Results Test.
- API administrativa específica mescla somente as chaves Google, preserva demais configurações e registra auditoria.

## Verificação
TypeScript, testes de autorização, validação, persistência, privacidade e metadados; regressões do CMS, autenticação e analytics. Build de produção no empacotamento.

## Ativação pelo proprietário
Preencher os IDs reais, salvar, confirmar propriedade no Search Console e publicar contêiner no GTM. Confirmar recebimento no Analytics/Tag Assistant após consentimento. O Google exige acesso à conta e permissões nas propriedades. Não foi solicitada senha nem armazenado segredo OAuth.

## Limites
Atualização: OAuth e relatórios no admin implementados; ver google-oauth.md. Ativação depende das credenciais e consentimento do proprietário. Verificação ponta a ponta em conta Google e inspeção visual autenticada permanecem pendentes.

Referências: https://support.google.com/webmasters/answer/9008080 ; https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart ; https://developers.google.com/identity/protocols/oauth2/
