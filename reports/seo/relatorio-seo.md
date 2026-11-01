# Auditoria e otimização SEO — Descobridor

Página prioritária: https://descobridor.online/puxar-dados-pelo-telefone

Data: 30/10/2026. A referência com www pertence à mesma página; o domínio canônico escolhido é HTTPS sem www.

## Diagnóstico inicial e prioridades

O diagnóstico com evidências e arquivos está em [diagnostico-inicial.md](diagnostico-inicial.md). O problema de maior impacto era arquitetural: o documento principal só trazia metadados/JSON-LD e um iframe fixo. O H1, o texto e o formulário dependiam de outro documento e de uma requisição JavaScript posterior. Não se conclui, somente por isso, que o Google não havia indexado a URL; isso exige Search Console.

O PageSpeed oficial anterior confirmou execução incompleta com NO_FCP em mobile e desktop. Os valores observados e os links estão em [medicoes.json](medicoes.json). Não foram inventadas métricas nem atribuídas notas de uma execução em branco à qualidade da página inteira.

## Alterações implementadas

| Área | Melhoria | Arquivos principais |
|---|---|---|
| Renderização | SSR real no documento principal de todas as páginas públicas. Um H1, texto, links, FAQ, formulário e breadcrumb já estão no HTML gerado pelo servidor. Admin e cliente continuam no framework existente. | app/site-page.tsx, app/public-render.ts |
| Layout e recursos | Layout preservado a partir do HTML existente; CSS/JS extraídos, minificados e identificados por hash. O documento auxiliar permanece para o painel/preview, com noindex. | scripts/prepare-public.mjs, scripts/run-framework.mjs, app/public-template.generated.ts, public/interface.html, public/site.*.css, public/site-runtime.*.js |
| Página de telefone | Title e description solicitados, H1 exclusivo, cinco seções, etapas H3, oito FAQs, CTA para formulário, preço e condições antes da contratação. A copy descreve o atendimento real, sem fingir busca externa. | content/puxar-dados-pelo-telefone.json, app/pages.ts |
| Metadados | Canonical, robots index/follow, Open Graph e Twitter Card por página, imagem da marca otimizada em WebP. | app/site-page.tsx, app/seo.ts, app/page-options.ts, public/images/descobridor-preview.webp |
| Arquitetura | Links reais entre páginas públicas, breadcrumbs visíveis, sitemap elegível com lastmod quando disponível, canonical sem parâmetros. | app/public-render.ts, app/sitemap.xml/route.ts |
| URLs | Regras permanentes para www/HTTPS, barra final, aliases de páginas renomeadas e rotas legadas. Sem redirecionar APIs ou alterar autenticação. | middleware.ts, app/page-routing.ts, public/_redirects |
| Indexação | Painéis com noindex permanecem autenticados; robots não impede reconhecer a diretiva. APIs e analytics continuam fora do rastreamento. | app/robots.txt/route.ts, public/_headers |
| CMS | Canonical, follow/nofollow, Twitter Card, H2/H3, breadcrumbs, JSON-LD controlado, redirecionamentos, prévias Google/social, histórico de até 20 versões e restauração no editor. Validação de duplicatas e conflitos. | app/page-manager.tsx, app/pages.ts, app/api/dashboard/route.ts |
| Medição | Ponte com consentimento, nomes de eventos permitidos, URL canônica sem parâmetros e deduplicação por etapa. Quando há GTM, ele é o único responsável pelo envio ao GA4. | public/analytics-bridge.js, app/analytics/route.ts, public/interface.html |
| Acessibilidade | Link para pular ao conteúdo, um H1, headings H2/H3, rótulos e foco da modal preservados, imagens de seções com alt e dimensões. | app/public-render.ts, app/page-manager.tsx |

### Metadados da página prioritária

- Title: **Puxar Dados pelo Telefone: Consulta com DDD | Descobridor**
- Description: **Quer puxar dados pelo telefone? Saiba como consultar números de celular ou fixo, identificar contatos desconhecidos e verificar informações disponíveis.**
- H1: **Puxar Dados pelo Telefone: Consulte um Número Online**
- Canonical: **https://descobridor.online/puxar-dados-pelo-telefone**
- OG title: **Puxar Dados pelo Telefone | Descobridor**
- OG description: **Consulte informações disponíveis sobre números de telefone e saiba como verificar contatos desconhecidos.**
- OG type website, locale pt_BR, site_name Descobridor; Twitter summary_large_image por padrão.

As alterações solicitadas são aplicadas também aos registros antigos dessa página por uma revisão de conteúdo. Edições futuras feitas no admin continuam personalizáveis. Configurações de aparência e categorias de checkout existentes foram preservadas.

## Comparativo verificável

| Verificação | Antes | Após implementação local |
|---|---|---|
| H1 no HTML principal gerado | 0 | 1 por página pública, testado no renderer SSR e React server rendering |
| Iframe como conteúdo principal | 1 | 0 |
| Conteúdo inicial | Metadados e iframe | H1, texto, formulário, links e FAQ |
| Canonical | Já existia | Mantida e validada; editor por página |
| page_view | Sempre origem + / | URL da página publicada, sem query/hash |
| GA4 + GTM juntos | Duas instalações diretas possíveis | GTM assume o envio quando configurado |
| Página de pacotes sem produtos | Indexável | Noindex e fora do sitemap até catálogo ativo |
| Renomear slug personalizado | Sem alias | Alias 301 automático |
| Recursos do layout | CSS/JS inline no documento auxiliar | Recursos estáticos minificados com hash e regras de cache |

Não há valor de INP percentil 75 disponível. TBT de laboratório não equivale a INP. Os valores do PageSpeed de antes/depois e suas limitações são registrados separadamente, sem prometer cumprimento das metas de campo.

## Validação executada antes da publicação

- TypeScript sem erros.
- Suíte de regressão: autenticação, senha/sessão admin, bloqueio, isolamento entre usuários, clientes, pedidos, preços no servidor, snapshots, leads parciais e auditoria.
- CMS: publicação/rascunho, criação, edição, rename, aliases, canonical inválida, duplicatas, histórico protegido e validação de campos/imagens/cores.
- SSR e metadados para todas as páginas públicas dos dados de teste; um H1, conteúdo e links, sem iframe principal.
- Schema.org: JSON-LD gerado a partir do CMS, FAQ apenas quando visível e habilitado; imagens e breadcrumb coerentes. Sem notas, avaliações, ofertas ou autores inventados. SoftwareApplication não foi usado porque o fluxo atual é uma solicitação de atendimento.
- Sitemap e robots: testes dos handlers, URLs elegíveis e canonicals.
- Analytics: lista permitida, consentimento, origem/source do postMessage, confirmação de recebimento, deduplicação e ausência de dados digitados no payload.
- Verificação visual em desktop e viewport de 375 × 812: formulário com máscara, modal, cadastro de teste local salvo e checkout correspondente. O teclado real de um aparelho físico não estava disponível; a adaptação à viewport é coberta pela suíte existente.
- Testes de navegação móvel e ajuste da modal acima do teclado passaram.
- O editor SEO foi verificado numa rota temporária de teste, removida antes do build. Não houve bypass do login de produção.

## Eventos e limites de medição

| Evento | Momento |
|---|---|
| page_view | Visita à página institucional, somente após consentimento |
| form_start | Início de interação com o campo de consulta |
| consulta_iniciada | Referência válida enviada para iniciar o cadastro |
| form_submit | Cadastro salvo com sucesso pelo backend |
| consulta_concluida | **Pedido de atendimento registrado**, com etapa=pedido_registrado; não indica resultado externo, PDF entregue, pagamento ou dados encontrados |

Nenhum telefone, CPF, nome, e-mail, referência, ID de pedido ou chave de lead é enviado nesses eventos. O documento isolado de análise recebe somente a página pública validada no servidor e nomes de etapas. O evento de pedido concluído depende do consentimento e da configuração das tags.

Se GTM estiver configurado, o container precisa ter as tags e os gatilhos desses eventos. Desative o page_view automático duplicado e verifique o encaminhamento no DebugView. Código do site não altera a conta GA4/GTM nem confirma recebimento de conversões na propriedade.

## Políticas, privacidade e transparência

A página não promete titularidade, CPF, endereço privado ou localização de terceiros a partir do telefone. A disponibilidade e as fontes são confirmadas no atendimento. O preço exibido vem da configuração do servidor, e enviar o cadastro não gera cobrança. Privacidade e termos estão disponíveis em links reais.

Não foi atestada conformidade jurídica integral nem aprovação de Google Ads: isso depende de práticas comerciais, fontes reais, documentação, conta de anúncios e revisão do provedor. A finalidade autorizada não é, isoladamente, garantia de conformidade.

## Pendências externas

1. Search Console: inspeção de URL, canonical escolhida pelo Google, renderização rastreada, envio do sitemap, cobertura e reindexação. Sem credenciais nesta sessão.
2. CrUX/RUM: coleta suficiente para LCP/INP/CLS no percentil 75; não há dados de campo no PageSpeed desta sessão.
3. GA4/GTM/Ads: validar eventos no DebugView/tempo real, configurar conversões e evitar autoeventos duplicados no container. Não há acesso à conta publicitária nesta tarefa.
4. Rich Results Test foi executado e aprovou dois itens. O Schema.org Validator exibiu bloqueio de tráfego incomum/reCAPTCHA no navegador desta sessão; essa checagem complementar ficou pendente. A inspeção de todas as URLs no Search Console também permanece pendente; não se confunde validade com exibição em resultados avançados.
5. Cabeçalhos/HTTP externos: urllib e curl foram bloqueados ou expiraram neste ambiente. Regras foram testadas localmente; os resultados de navegação/validador posteriores são documentados separadamente.
6. Informações institucionais: legalName, CNPJ e endereço só são exibidos quando preenchidos nas configurações. Nenhum dado comercial foi inventado.
7. Revisão manual de contraste, navegação por teclado e leitor de tela em aparelhos físicos continua recomendada. A auditoria automática é parcial.

## Fontes oficiais

- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/updates — FAQ rich results descontinuados em maio de 2026; FAQPage pode descrever o conteúdo, sem promessa de destaque.
- https://developers.google.com/analytics/devguides/collection/ga4/events
- https://developers.google.com/analytics/devguides/collection/protocol/ga4/policy
- https://web.dev/articles/defining-core-web-vitals-thresholds
- https://support.google.com/adspolicy/answer/15938071

## Verificações posteriores à publicação

A versão 32 foi publicada com sucesso e auditada no domínio público.

- A navegação iniciada em https://www.descobridor.online/puxar-dados-pelo-telefone terminou em https://descobridor.online/puxar-dados-pelo-telefone. As regras de 301 estão no código; a navegação confirma o destino, sem afirmar inspeção de todos os códigos intermediários.
- As sete páginas públicas exibiram H1 exclusivo, metadados e canonical, sem iframe principal. A URL inexistente exibiu 404 e meta robots noindex.
- Rich Results Test: **2 itens válidos (Organization e BreadcrumbList)**. Resultado: https://search.google.com/test/rich-results/result?id=_TxocuXFBGiVmGXwN7mNdw. Isso não garante destaque no Google.
- Lighthouse desktop: **100 desempenho / 96 acessibilidade / 100 boas práticas / 100 SEO**. FCP e LCP 262 ms; TBT 0 ms; CLS 0. Valores de laboratório de uma execução.
- Lighthouse mobile: FCP 960 ms e CLS 0, mas **NO_LCP**. Não há pontuação de desempenho nem LCP/INP conclusivos. Acessibilidade 96, boas práticas 100, SEO 100.
- O contraste de textos pequenos do rodapé e links Início com destinos inconsistentes foi corrigido com base nessa auditoria.
- O catálogo de pacotes sem produtos ativos foi identificado durante a navegação. A página agora mostra uma mensagem de disponibilidade e recebe noindex, saindo do sitemap enquanto não houver produtos ativos. A preferência de indexação do admin permanece preservada.

Os links e detalhes das execuções estão em medicoes.json. O relatório mobile incompleto não foi usado para afirmar aprovação das metas de campo.

Robots.txt e sitemap.xml foram abertos em produção e conferidos: seis URLs elegíveis no sitemap (catálogo de pacotes vazio excluído), domínio HTTPS sem www e ausência de bloqueio aos painéis no robots. O lastmod da revisão de conteúdo da página de telefone usa o horário real da primeira publicação da otimização, sem gerar uma data nova a cada acesso.


## Medição final oficial — 04:56 BRT

Após os ajustes de contraste, links e rolagem inicial, o PageSpeed concluiu mobile e desktop sem NO_FCP/NO_LCP:

| Métrica de laboratório | Antes (versão 31) | Mobile (versão 33) | Desktop (versão 33) |
|---|---|---|---|
| Desempenho | Indisponível: NO_FCP | **100** | **100** |
| Acessibilidade | Execução incompleta; não usar a nota como prova | **100** | **100** |
| Boas práticas | Execução incompleta | **100** | **100** |
| SEO básico Lighthouse | Execução incompleta | **100** | **100** |
| FCP | Indisponível | 938 ms | 292 ms |
| LCP | Indisponível | 1.876 ms | 440 ms |
| TBT | Indisponível | 9 ms (UI arredonda 10 ms) | 8 ms (UI arredonda 10 ms) |
| CLS | Execução incompleta | 0 | 0 |
| Speed Index | Indisponível | 1.784 ms | 587 ms |

- Relatório mobile: https://pagespeed.web.dev/analysis/https-descobridor-online-puxar-dados-pelo-telefone/1i403cn2eu?form_factor=mobile
- Relatório desktop: https://pagespeed.web.dev/analysis/https-descobridor-online-puxar-dados-pelo-telefone/1i403cn2eu?form_factor=desktop

Lighthouse 13.6.0; mobile Moto G Power emulado e 4G lento. Notas e valores variam entre execuções. Não há dados CrUX nem INP p75. As metas de campo permanecem sujeitas a medição real; não se usa TBT como substituto de INP.

Os ajustes finais do texto exato do CTA, da quebra responsiva desse texto e do lastmod foram validados no código/testes e não receberam outra rodada de Lighthouse. As execuções estão preservadas em medicoes.json, com a versão efetivamente medida.

### Resultado dos critérios de conclusão

- Conteúdo principal no HTML inicial: implementado e verificado por SSR/React server rendering e navegação em produção.
- Metadados, H1, canonical, links, sitemap e robots: conferidos; sete páginas públicas renderizam sem iframe principal, seis elegíveis estão no sitemap.
- Dados estruturados: dois itens válidos no teste oficial do Google. Schema.org Validator bloqueado por tráfego incomum/reCAPTCHA nesta sessão, sem tentativa de contorno.
- Formulários e backend: regressão automatizada aprovada; máscara, modal e cadastro/checkout testados com dados locais fictícios.
- Administração: editor ampliado, permissões preservadas e testadas. Login real de produção não foi contornado.
- Mobile/acessibilidade: verificação visual em 375 × 812 e Lighthouse mobile 100; teclado físico e leitor de tela dependem de validação manual complementar.
- SEO gerenciável no CMS: metadados, canonical/robots, social, H1/H2/H3/FAQ, breadcrumbs, marcação controlada, redirects e histórico.
- Performance: execução final de laboratório concluída com 100 nas quatro categorias nos dois formatos; sem alegação de percentil 75 em campo.

Não há promessa de primeira posição, volume de tráfego, rich snippets ou aprovação de anúncios. Search Console e validação de conversões na conta GA4/GTM permanecem pendentes de acesso.
