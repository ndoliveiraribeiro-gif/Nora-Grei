# CLAUDE.md — Nora Grei
> Lê este ficheiro no início de CADA sessão. Contém o estado real do projecto.

## Stack
- **Framework:** Next.js 15 App Router (`"use client"` em todas as páginas interactivas)
- **Base de dados:** Supabase (`xxhenvqjymulwrusqbvv.supabase.co`)
- **Deploy:** Vercel + GitHub (`ndoliveiraribeiro-gif/Nora-Grei`)
- **Idiomas:** PT / FR / LT — sempre os 3 em simultâneo, no objecto `T` de cada página
- **Auth:** Supabase Auth — admin UUID: `2f6afc17-8e46-41a7-9b9f-4f407c76919f`

## Regras de trabalho (CRÍTICO)
1. **Edições cirúrgicas sempre** — nunca reescrever ficheiros completos. Usar `old_str`/`new_str` precisos.
2. Fazer `git add` + `git commit` + `git push` no fim de cada alteração.
3. Commit message em inglês, com `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`.
4. Traduções PT/FR/LT obrigatórias em qualquer string nova — nunca deixar para depois.

## Conceito
Plataforma de moda de luxo francesa/lituana:
- **Peças Nora Grei novas** → aluguer
- **Peças usadas de lojistas** → venda ou aluguer
- Marca premium: editorial, tipografia Cormorant Garamond + Jost, paleta preto/bege/rosa

## Páginas existentes
| Rota | Ficheiro | Estado |
|------|----------|--------|
| `/` | `app/page.js` | ✅ Landing com calc strip + secção destaque |
| `/calculadora` | `app/calculadora/page.js` | ✅ Com marcas, tiers, uso, idade, estado |
| `/catalogo` | `app/catalogo/page.js` | ✅ Filtros: categoria, ocasião, tamanho, cor, condição |
| `/perfil` | `app/perfil/page.js` | ⚠️ FP (botão +) sobrepõe widget de chat — ver pendentes |
| `/loja/[slug]` | `app/loja/` | ✅ |
| `/lojas` | `app/lojas/` | ✅ |
| `/publicar` | `app/publicar/` | ✅ Upload mobile + câmara |
| `/feed` | `app/feed/` | ✅ Feed social interno |
| `/pedidos` | `app/pedidos/` | ✅ |
| `/reserva` | `app/reserva/` | ✅ Lista de espera |
| `/checkout` | `app/checkout/` | ✅ |
| `/mensagens` | `app/mensagens/` | ✅ |
| `/backoffice` | `app/backoffice/` | ✅ Password: `noragrei2024admin` |
| `/analytics` | `app/analytics/` | ✅ Com AI consulting via Claude API |
| `/admin` | `app/admin/` | ✅ |
| `/entrar` | `app/entrar/` | ✅ |
| `/registar` | `app/registar/` | ✅ Com geolocalização |

## Sistema de marcas (calculadora + perfil lojista)
```js
MARCAS_INVESTIMENTO → fator 1.15, tierBonus aluguer 1.35×, Vinted 0.50
  ["rolex","patek philippe","audemars piguet","richard mille","hermès","chanel","louis vuitton","birkin","kelly"]

MARCAS_PREMIUM → fator 0.82, tierBonus 1.20×, Vinted 0.35
  ["gucci","prada","bottega veneta","dior","saint laurent","celine","givenchy","valentino",
   "versace","balenciaga","jacquemus","loewe","burberry","mulberry","ralph lauren","max mara"]

MARCAS_ALTA → fator 0.50, tierBonus 1.05×, Vinted 0.20
  ["zara","mango","cos","arket","massimo dutti","hugo boss","calvin klein","tommy hilfiger",
   "lacoste","levi's","sandro","maje","ba&sh","phase eight","reiss","allsaints"]

MASSMARKET → fator 0.32, tierBonus 1.0×, Vinted 0.12
```

## Campos da calculadora (`/calculadora`)
1. **Preço original de compra** (€)
2. **Marca** — input texto com datalist autocomplete (33 marcas sugeridas) + badge de tier
3. **Tipo de peça** — pills: Vestido / Fato / Casaco / Calças / Saia / Blusa / Mala / Acessório / Outra
4. **Estado actual** — pills: Nunca usado/etiqueta (0.92) / Bom (0.68) / Usado (0.45) / Com defeito (0.25)
5. **Frequência de uso** — pills: Nunca usada (1.00) / Pouco uso (0.88) / Uso moderado (0.72) / Uso frequente (0.52)
6. **Idade da peça** — pills: <1 ano (1.00) / 1-2 anos (0.85) / 2-4 anos (0.70) / >4 anos (0.52)
7. **Período de aluguer** — slider 1-36 meses

**Fórmula:** `fei = estado × uso × idade` → `valorMercado = preço × fatorMarca × feiClamp`

## Comissões
- Aluguer: 10% (`COMISSAO_ALUGUER`)
- Venda: 20% (`COMISSAO_VENDA`)
- Envio: €6 (`CUSTO_ENVIO`)

## Supabase — tabelas principais
- `clientes` — campo chave: `codigo_cliente`
- `pecas_lojista` — campos: categoria, cor, condicao, tem_defeito, descricao_defeito, link_compra_externa, link_externo_ativo
- `alugueres` — RLS desactivado (admin)
- `leads_calculadora` — captura email da calculadora
- `feed_posts`, `boost_pagamentos`, `feed_likes` — feed social
- `afiliados`, `conversoes_afiliado` — sistema afiliados
- `envios`, `despesas`, `notificacoes_cliente` — logística
- `campanha_eventos` — tracking campanhas

## Pendentes conhecidos
### ⚠️ URGENTE
- [ ] **FP sobreposto ao chat no `/perfil`** — o botão flutuante "+" (`zIndex:9999`, bottom fixo) sobrepõe o widget de chat de suporte. Solução: baixar o FP quando o chat estiver aberto, ou ajustar posição/z-index para coexistirem. **PERGUNTAR ao Nuno qual é exactamente o widget de chat antes de mexer.**

### 🔧 Por fazer
- [ ] Notificações push/email/WhatsApp (Brevo + Meta API) — credenciais pendentes
- [ ] Seguir lojas — botão na página de loja, feed prioriza lojas seguidas
- [ ] Moderação automática de imagens (AWS Rekognition / Google Vision / Anthropic Vision)
- [ ] Cron `/api/cron/verificar-reservas` — scaffolded mas não live

### 💡 Funcionalidades acordadas mas não implementadas
- [ ] **Anotar aqui** quando Nuno mencionar algo acordado numa sessão anterior

## Landing page (`/`) — secções actuais
1. `calc-strip` — barra de topo escura com link para calculadora
2. Nav
3. `destaque-sec` — hero principal
4. `calc-sec` — secção editorial da calculadora (peças novas→aluguer, usadas→vende/aluga)
5. `como-funciona`
6. `lojas-sec`
7. (resto das secções)

## Notas de design
- Tipografia: `Cormorant Garamond` (serif, títulos) + `Jost` (sans, corpo)
- Paleta: `--bg:#f8f7f5`, `--fg:#1a1816`, `--accent:#c4748a`, `--dark:#100c0a`, `--gold:#c4a882`
- Mobile-first, max-width 480px na calculadora
- Sem emojis na UI — tipografia e ícones minimalistas
