# Auditoria inicial — Descobridor — 30/10/2026

Escopo: páginas públicas do CMS, página prioritária /puxar-dados-pelo-telefone, rotas auxiliares e painéis. Inspeção do código na versão 31, antes de qualquer alteração desta auditoria.

| Problema comprovado | URLs/escopo | Evidência técnica | Gravidade | Correção | Arquivos |
|---|---|---|---|---|---|
| Conteúdo principal ausente do documento principal inicial | Todas as páginas públicas | SitePageView devolve JSON-LD e iframe fixo; não devolve H1, texto ou links da página. O iframe consulta /api/pages e reescreve o conteúdo. | Alta | SSR do conteúdo real no documento principal usando o mesmo CMS/layout | app/site-page.tsx, public/interface.html, public/page-content.js |
| Documento auxiliar pode competir com as páginas | /interface e /interface.html | Arquivo público contém title genérico, não contém canonical nem noindex | Alta | Noindex do documento auxiliar, manter funcional para prévia e painel do cliente | public/interface.html, public/_headers |
| Eventos analíticos incompletos e page_view sem contexto | Todas as páginas institucionais | /analytics usa page_location origin+'/' e page_title 'Página institucional'; não há form_start/form_submit/consulta_iniciada | Alta | Ponte isolada, consentida, com parâmetros de lista permitida e URL sem query/hash | app/analytics/route.ts, public/interface.html |
| Robots bloqueia painéis com noindex | /admin e /cliente | robots.txt Disallow /admin e /cliente; páginas já têm meta robots noindex | Média | Permitir reconhecimento de noindex; manter autenticação | app/robots.txt/route.ts |
| SEO avançado incompleto no CMS | Admin → Páginas | Sem configuração de canonical, follow, Twitter Card, breadcrumbs, marcação, redirecionamentos ou histórico por página | Média | Campos tipados/validados, conflitos e histórico recuperável | app/pages.ts, app/page-options.ts, app/page-manager.tsx, app/api/dashboard/route.ts |
| Redirecionamento no rename não é registrado | Páginas personalizadas renomeadas | Ação page grava novo slug e apaga registro anterior, sem mapa de 301 | Média | Registrar alias permanente, prevenir ciclos e conflito com páginas reais | app/api/dashboard/route.ts, middleware.ts |
| Decoração com 399.400 bytes não comprimidos | /wave.svg | Tamanho real do arquivo fonte (medição local); não comprova LCP ruim | Baixa | Avaliar otimização e cache sem alterar a identidade visual | public/wave.svg, public/_headers |

## Não comprovado / não declarar como falha

- Indexação real no Google, rankings, tráfego, políticas/aprovação de anúncios: sem Search Console/Google Ads.
- LCP, INP e CLS no percentil 75: não há série de dados CrUX/RUM disponível nesta sessão.
- HTTP/HTTPS, redirecionamentos externos, erros 404/500 e cabeçalhos em produção: urllib recebeu 403 em todas as URLs, e a ferramenta de busca não conseguiu abrir o domínio. Isso é limitação deste ambiente, não prova de erro de origem.
- Não foi identificado binário Lighthouse, Chromium ou Google Chrome no executor. A verificação visual usa o navegador conectado; não substitui Lighthouse.
- Não há evidência suficiente para afirmar títulos duplicados, links quebrados ou páginas órfãs em produção antes do inventário completo.

## Fontes oficiais consultadas

- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/updates (FAQ rich result descontinuado em maio/2026; Schema.org FAQPage não implica destaque no Google)
- https://developers.google.com/analytics/devguides/collection/ga4/events
- https://developers.google.com/analytics/devguides/collection/protocol/ga4/policy
- https://web.dev/articles/defining-core-web-vitals-thresholds
- https://support.google.com/adspolicy/answer/15938071

## Execução oficial anterior à publicação

PageSpeed Insights/Lighthouse 13.6.0 executado em mobile e desktop: ambos retornaram NO_FCP e nenhuma pontuação de desempenho. O relatório desktop registrou CLS 0,525, mas a execução incompleta impede comparar as demais métricas. Sem dados CrUX. Referências e valores brutos em medicoes.json.
