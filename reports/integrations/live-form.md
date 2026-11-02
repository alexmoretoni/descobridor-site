# Form Live — prévia e pedido

O formulário valida localmente o formato: CPF com dígitos verificadores e telefone brasileiro com DDD. O selo verde diz Formato verificado, sem prometer consulta oficial ou titularidade confirmada. CPF e telefone recebem máscara; validação após pausa de digitação mostra estado de verificação.

Fluxo: referência → cadastro com nome e telefone → persistência de lead parcial → animação de preparação → prévia ilustrativa → checkout com e-mail e autorização de contato → POST /api/orders → pedido, lead e cliente → URL WhatsApp retornada pelo servidor. O backend continua definindo o preço e usando idempotência. A referência completa existe somente na sessão; o backend recebe a versão mascarada.

Prévia com nome e nascimento totalmente mascarados; referência digitada completa. Cards com situação, RG, mãe/pai, quatro endereços fictícios, três parentes fictícios, empresas, empregos, e-mails e telefones. Exemplos borrados identificados como fictícios; sem alegação de dados encontrados. Cada bloqueio abre o checkout.

Desktop: coluna principal com cards e oferta lateral fixa. Mobile: cards em coluna, CTA inferior e checkout em caixa inferior. Modais nativos com foco e escape, reduced-motion respeitado. Captura parcial não impede o pedido; falhas de cadastro obrigatório exibem erro recuperável. Nenhuma chave/CPF é colocado em parâmetros de URL ou armazenamento local.

Validação: testes unitários das máscaras/DDD/verificadores; regressões de leads, pedidos/idempotência, WhatsApp, permissões, tracking, CMS; teste visual e de navegação em desktop e frame mobile 390px; pedido sintético salvo somente no banco local, sem mensagem externa.
