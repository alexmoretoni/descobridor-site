# Produtos, planos e preços de consulta

No admin, abra **Produtos e pacotes** para criar produtos, pacotes ou planos.
Informe nome, descrição, valor em reais, créditos e tipos de consulta permitidos.
Os créditos e bônus são informativos; planos não ativam cobrança recorrente.

- **Visível**: aparece em Planos e pacotes e nas opções livres do checkout.
- **Oculto**: sai do catálogo, mas pode ser oferecido por uma regra de página ou tipo.
- **Inativo**: bloqueia novos pedidos em todos os locais, inclusive regras vinculadas.

As regras podem definir um preço avulso ou vincular uma oferta específica.
A ordem de prioridade é página + tipo, página inteira, tipo e valor padrão em Configurações.
Vincular uma oferta fixa o produto do pedido. Preços avulsos permitem selecionar outras ofertas visíveis compatíveis.
Em **Páginas → Editar → Checkout**, as regras da página podem ser ajustadas diretamente.
A página deve estar salva antes de configurar seu preço. As regras são salvas separadamente do conteúdo.

O catálogo direciona a oferta escolhida ao formulário inicial. Após a consulta, o visitante confere o valor e informa seu WhatsApp no painel de checkout.
O backend calcula novamente o preço, valida disponibilidade/tipo e registra produto, valor e origem no pedido.
Se o valor mudou desde a cotação apresentada, o pedido novo é recusado até que o visitante reabra o checkout com o preço atualizado.
Pedidos usam chave de idempotência, e o registro de lead/pedido antecede o redirecionamento ao WhatsApp.

## Implementação

- `app/commerce.ts`: validação, catálogo e resolução de preços.
- `/api/quote`: cotação pública sem identificador pessoal.
- `/api/commerce`: leitura e gravação restritas à identidade e sessão administrativa; exige mesma origem nas alterações.
- Metadados comerciais ficam em `site_settings`, sem migração destrutiva. Produtos continuam em `packages`.
- Produto, visibilidade e auditoria são persistidos juntos em um batch D1.
- `commerce-rule:<página ou *>:<tipo>` guarda cada regra independentemente.
- `commerce-product:<id>` guarda visibilidade e tipos permitidos.

Verificação: `node scripts/tests/commerce.mjs`, `pnpm test:regression` e `pnpm build`.
As prévias do relatório continuam ilustrativas, com exemplos fictícios e mascaramento visual.
Endereços, telefones e e-mails compartilham um card após a identificação, com rolagem vertical, atalhos por categoria e vidro borrado.
O runtime público inicia após a hidratação do HTML, e o botão inicial aguarda essa inicialização para evitar perda da transição.
