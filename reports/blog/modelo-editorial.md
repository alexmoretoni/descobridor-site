# Modelo de post — Descobridor

## Análise dos arquivos recebidos
19 termos no export Ubersuggest e 25 prompts sugeridos. São estimativas do arquivo, não medições atuais, tráfego do site ou evidência de citações por IA. A coluna Platform dos prompts informa a plataforma indicada pela ferramenta, não uma ocorrência comprovada.

| Grupo | Termos | Volume informado | Decisão |
|---|---|---|---|
| Tema principal | consultar dados pelo cpf | 3.600 | Guia informativo único |
| Gratuidade | consultar dados pelo cpf grátis | 170 | Seção e FAQ sobre serviço oficial gratuito |
| Processo | como consultar dados pelo cpf | 70 | Passo a passo no mesmo guia |
| Canal oficial | consultar dados pelo cpf receita federal | 10 | Fontes e links oficiais |
| Segurança | consultar dados pelo cpf telegram | 20 | Cuidados, sem recomendar bots ou acesso a terceiros |

Não somar volumes de variantes como pessoas únicas. Termos com zero não comprovam ausência de demanda. CPC e dificuldades são estimativas proprietárias, não garantias. As sugestões de crédito e score representam outra intenção: podem receber guias próprios depois de pesquisa específica; não são promessas de funcionalidade do Descobridor.

## Estrutura reutilizável
1. Um H1 descritivo; title e description exclusivos.
2. Introdução curta que define finalidade e leitor.
3. Autoria real institucional, publicação e atualização reais.
4. Capa original, alt descritivo, dimensões fixas; sem lazy loading da capa.
5. Resposta direta no primeiro bloco (40–80 palavras quando suficiente).
6. Sumário com âncoras; seções por dúvida e parágrafos curtos.
7. Etapas práticas, distinções, limitações e imagem explicativa quando útil.
8. FAQ original, sem repetição artificial de palavras-chave.
9. Fontes oficiais clicáveis e canal para correções.
10. CTA compatível com a capacidade real do serviço.
11. BlogPosting, WebPage, Organization e BreadcrumbList coerentes com o conteúdo visível; OG article, Twitter Card, canonical e sitemap.

## Uso no painel
Admin → Páginas → Novo artigo. Modelo “Artigo do blog”. Edite Destaque, Conteúdo, Perguntas frequentes e SEO. A imagem social é usada como capa. Em Geral, edite fontes e data original. Sem data, a primeira publicação recebe a data do servidor. Salve como rascunho para revisar. Publicar inclui automaticamente na listagem /blog e, se indexável, no sitemap. Duplicar cria rascunho e limpa a data original.

URLs usam slug de primeiro nível, compatível com o CMS existente. O breadcrumb organiza Início → Blog → Artigo, sem mudar rotas de consultas existentes.

## Busca e IA
O Google informa que não exige otimização ou marcação especial para seus recursos de IA. Conteúdo acessível em HTML, respostas claras, fontes e dados estruturados coerentes ajudam a compreensão; não garantem inclusão, rich results ou posição. Não criar páginas doorway para cada variante nem arquivos que prometam “ensinar” as IAs a citar a marca.

Referências técnicas:
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/appearance/structured-data/article

## Imagens
Capa criada com geração de imagem integrada, otimizada em WebP 1200×675: public/images/consultar-cpf-capa.webp.
Prompt: editorial 3D de cartão abstrato, lupa e cadeado, violeta e lavanda, sem texto, números ou dados pessoais.
Infográfico vetorial original: public/images/cpf-tipos-de-consulta.svg. Texto também disponível no corpo do artigo.

## Validação e limites
TypeScript, build e regressões de CMS/SSR; inspeção visual e navegação do artigo. Monitoramento orgânico, citações por IA e indexação dependem de publicação/rastreamento e devem ser acompanhados no Search Console. Não há métricas de tráfego ou performance inventadas. Validação externa de rich results não equivale a garantia de exibição.

Sugestões B2B de validação de clientes, APIs, prevenção de fraude e consultas completas precisam de escopo e pesquisa próprios. Não foram usadas para inventar integrações ou funcionalidades. CNH também tem intenção e órgão diferentes. Variações “online”, “nome”, “nome completo” e “data de nascimento” são tratadas no contexto de finalidade e acesso, sem criar páginas quase idênticas.

Testes concluídos: novas regressões verificam BlogPosting, OG article, breadcrumb de três níveis, fontes HTTPS/escape de HTML, exclusão de rascunhos da listagem, data automática e persistência no admin. A inspeção mobile foi realizada em iframe de 375px; a rota temporária foi removida. Rich Results Test e Search Console não foram executados nesta entrega.
