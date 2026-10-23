-- ══════════════════════════════════════════════════════════════════════
-- NORA GREI — Schema completo Supabase
-- Colar no Supabase Dashboard → SQL Editor → Run
-- Última actualização: 2026-10-23
-- ══════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────
-- EXTENSÕES
-- ──────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────────────────
-- CLIENTES
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo_cliente      text UNIQUE,
  nome                text,
  email               text,
  telefone            text,
  pais                text DEFAULT 'PT',
  cidade              text,
  is_lojista          boolean DEFAULT false,
  slug_loja           text UNIQUE,
  nome_loja           text,
  descricao_loja      text,
  foto_perfil         text,
  foto_capa           text,
  stripe_customer_id  text,
  stripe_setup_intent text,
  metodo_pagamento    text,
  saldo_creditos      numeric(10,2) DEFAULT 0,
  created_at          timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_slug ON clientes(slug_loja);

-- ──────────────────────────────────────────────────────────────────────
-- PEÇAS LOJISTA
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pecas_lojista (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id            uuid REFERENCES clientes(id) ON DELETE CASCADE,
  nome                  text NOT NULL,
  descricao             text,
  categoria             text,
  subcategoria          text,
  marca                 text,
  tamanho               text,
  cor                   text,
  condicao              text DEFAULT 'bom',
  tem_defeito           boolean DEFAULT false,
  descricao_defeito     text,
  preco_original        numeric(10,2),
  preco_aluguer_dia     numeric(10,2),
  preco_venda           numeric(10,2),
  disponivel_aluguer    boolean DEFAULT true,
  disponivel_venda      boolean DEFAULT false,
  fotos                 text[],
  video_url             text,
  link_compra_externa   text,
  link_externo_ativo    boolean DEFAULT false,
  ocasiao               text[],
  publicado             boolean DEFAULT false,
  aprovado              boolean DEFAULT false,
  slug                  text UNIQUE,
  created_at            timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pecas_lojista_id ON pecas_lojista(lojista_id);
CREATE INDEX IF NOT EXISTS idx_pecas_categoria ON pecas_lojista(categoria);

-- Tabela pecas (alias/view simplificada usada em alguns contextos)
CREATE TABLE IF NOT EXISTS pecas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id  uuid REFERENCES clientes(id),
  nome        text,
  categoria   text,
  preco       numeric(10,2),
  fotos       text[],
  publicado   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- STOCK
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_lojista (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id     uuid REFERENCES pecas_lojista(id) ON DELETE CASCADE,
  lojista_id  uuid REFERENCES clientes(id),
  quantidade  integer DEFAULT 1,
  reservado   integer DEFAULT 0,
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_tamanhos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  peca_id     uuid REFERENCES pecas_lojista(id) ON DELETE CASCADE,
  tamanho     text NOT NULL,
  quantidade  integer DEFAULT 1,
  reservado   integer DEFAULT 0
);

-- ──────────────────────────────────────────────────────────────────────
-- ALUGUERES
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alugueres (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id          uuid REFERENCES clientes(id),
  peca_id             uuid REFERENCES pecas_lojista(id),
  lojista_id          uuid REFERENCES clientes(id),
  data_inicio         date NOT NULL,
  data_fim            date NOT NULL,
  preco_total         numeric(10,2),
  comissao            numeric(10,2),
  estado              text DEFAULT 'pendente',
  stripe_payment_id   text,
  notas               text,
  created_at          timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alugueres_cliente ON alugueres(cliente_id);
CREATE INDEX IF NOT EXISTS idx_alugueres_lojista ON alugueres(lojista_id);

CREATE TABLE IF NOT EXISTS alugueres_lojista (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluguer_id  uuid REFERENCES alugueres(id) ON DELETE CASCADE,
  lojista_id  uuid REFERENCES clientes(id),
  valor       numeric(10,2),
  estado      text DEFAULT 'pendente',
  created_at  timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- COMPRAS / VENDAS
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compras_usadas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id        uuid REFERENCES clientes(id),
  peca_id           uuid REFERENCES pecas_lojista(id),
  lojista_id        uuid REFERENCES clientes(id),
  preco             numeric(10,2),
  comissao          numeric(10,2),
  estado            text DEFAULT 'pendente',
  stripe_payment_id text,
  created_at        timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- MENSAGENS / CONVERSAS
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente1_id     uuid REFERENCES clientes(id),
  cliente2_id     uuid REFERENCES clientes(id),
  ultima_mensagem text,
  updated_at      timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mensagens_conversa (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id   uuid REFERENCES conversas(id) ON DELETE CASCADE,
  remetente_id  uuid REFERENCES clientes(id),
  conteudo      text NOT NULL,
  lida          boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_msgs_conversa ON mensagens_conversa(conversa_id);

-- ──────────────────────────────────────────────────────────────────────
-- FEED SOCIAL
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feed_posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id    uuid REFERENCES clientes(id),
  tipo        text DEFAULT 'post',
  conteudo    text,
  fotos       text[],
  peca_id     uuid REFERENCES pecas_lojista(id),
  likes       integer DEFAULT 0,
  publicado   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feed_likes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid REFERENCES feed_posts(id) ON DELETE CASCADE,
  cliente_id  uuid REFERENCES clientes(id),
  created_at  timestamptz DEFAULT now(),
  UNIQUE(post_id, cliente_id)
);

CREATE TABLE IF NOT EXISTS follows (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seguidor_id     uuid REFERENCES clientes(id) ON DELETE CASCADE,
  seguido_id      uuid REFERENCES clientes(id) ON DELETE CASCADE,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(seguidor_id, seguido_id)
);

CREATE TABLE IF NOT EXISTS videos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id    uuid REFERENCES clientes(id),
  url         text NOT NULL,
  thumbnail   text,
  titulo      text,
  peca_id     uuid REFERENCES pecas_lojista(id),
  created_at  timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- WISHLIST
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id) ON DELETE CASCADE,
  peca_id     uuid REFERENCES pecas_lojista(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(cliente_id, peca_id)
);

CREATE TABLE IF NOT EXISTS wishlist_lojista (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id) ON DELETE CASCADE,
  lojista_id  uuid REFERENCES clientes(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(cliente_id, lojista_id)
);

-- ──────────────────────────────────────────────────────────────────────
-- AVALIAÇÕES
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS avaliacoes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluguer_id    uuid REFERENCES alugueres(id),
  cliente_id    uuid REFERENCES clientes(id),
  lojista_id    uuid REFERENCES clientes(id),
  nota          integer CHECK (nota BETWEEN 1 AND 5),
  comentario    text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS avaliacoes_lojista (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluguer_id    uuid REFERENCES alugueres(id),
  lojista_id    uuid REFERENCES clientes(id),
  cliente_id    uuid REFERENCES clientes(id),
  nota          integer CHECK (nota BETWEEN 1 AND 5),
  comentario    text,
  created_at    timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- NOTIFICAÇÕES / ENVIOS / LOGÍSTICA
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notificacoes_cliente (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id),
  titulo      text,
  mensagem    text,
  tipo        text,
  lida        boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS envios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluguer_id    uuid REFERENCES alugueres(id),
  tipo          text,
  transportador text,
  tracking      text,
  estado        text DEFAULT 'pendente',
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS logistica_tarifas (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zona      text,
  peso_max  numeric(5,2),
  preco     numeric(8,2),
  ativo     boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS logistica_volumes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluguer_id  uuid REFERENCES alugueres(id),
  peso        numeric(5,2),
  dimensoes   text,
  created_at  timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- HIGIENIZAÇÃO
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS higienizacao_padrao (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL,
  preco     numeric(8,2),
  descricao text
);

CREATE TABLE IF NOT EXISTS higienizacao_lojista (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id  uuid REFERENCES clientes(id),
  peca_id     uuid REFERENCES pecas_lojista(id),
  aluguer_id  uuid REFERENCES alugueres(id),
  estado      text DEFAULT 'pendente',
  preco       numeric(8,2),
  created_at  timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- PAGAMENTOS / STRIPE / DÉBITOS
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS debitos_cliente (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id        uuid REFERENCES clientes(id),
  aluguer_id        uuid REFERENCES alugueres(id),
  motivo            text,
  valor             numeric(10,2),
  estado            text DEFAULT 'pendente',
  stripe_payment_id text,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reembolsos_pendentes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluguer_id        uuid REFERENCES alugueres(id),
  cliente_id        uuid REFERENCES clientes(id),
  valor             numeric(10,2),
  motivo            text,
  estado            text DEFAULT 'pendente',
  stripe_refund_id  text,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recibos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id),
  aluguer_id  uuid REFERENCES alugueres(id),
  valor       numeric(10,2),
  tipo        text,
  pdf_url     text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comprovativos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id  uuid REFERENCES clientes(id),
  periodo     text,
  valor       numeric(10,2),
  pdf_url     text,
  created_at  timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- RECLAMAÇÕES / TICKETS
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reclamacoes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluguer_id  uuid REFERENCES alugueres(id),
  cliente_id  uuid REFERENCES clientes(id),
  lojista_id  uuid REFERENCES clientes(id),
  motivo      text,
  descricao   text,
  estado      text DEFAULT 'aberta',
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tickets_lojista (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id  uuid REFERENCES clientes(id),
  assunto     text,
  estado      text DEFAULT 'aberto',
  prioridade  text DEFAULT 'normal',
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tickets_mensagens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   uuid REFERENCES tickets_lojista(id) ON DELETE CASCADE,
  autor_id    uuid REFERENCES clientes(id),
  conteudo    text,
  is_admin    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- AFILIADOS / REFERRAL
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS afiliados (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      uuid REFERENCES clientes(id),
  codigo          text UNIQUE,
  comissao_pct    numeric(5,2) DEFAULT 10,
  ativo           boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS codigos_afiliado (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  afiliado_id uuid REFERENCES afiliados(id),
  codigo      text UNIQUE,
  usos        integer DEFAULT 0,
  ativo       boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversoes_afiliado (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  afiliado_id     uuid REFERENCES afiliados(id),
  aluguer_id      uuid REFERENCES alugueres(id),
  valor_comissao  numeric(10,2),
  estado          text DEFAULT 'pendente',
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS creditos_afiliado (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  afiliado_id uuid REFERENCES afiliados(id),
  valor       numeric(10,2),
  motivo      text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     uuid REFERENCES clientes(id),
  referred_id     uuid REFERENCES clientes(id),
  codigo          text,
  convertido      boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config_referral (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credito_euros   numeric(8,2) DEFAULT 10,
  ativo           boolean DEFAULT true,
  updated_at      timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- RESERVAS / LISTA DE ESPERA
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservas_espera (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  nome        text,
  pais        text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pedidos_procura (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id),
  categoria   text,
  descricao   text,
  tamanho     text,
  ocasiao     text,
  ativo       boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pedidos_respostas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id       uuid REFERENCES pedidos_procura(id),
  lojista_id      uuid REFERENCES clientes(id),
  peca_id         uuid REFERENCES pecas_lojista(id),
  created_at      timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- BOOSTERS / DESTAQUE
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booster_tipos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text,
  duracao_dias integer,
  preco       numeric(8,2),
  multiplicador numeric(4,2) DEFAULT 1.5,
  ativo       boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS boosters_lojista (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id      uuid REFERENCES clientes(id),
  peca_id         uuid REFERENCES pecas_lojista(id),
  booster_tipo_id uuid REFERENCES booster_tipos(id),
  data_inicio     timestamptz,
  data_fim        timestamptz,
  ativo           boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS boost_pagamentos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id        uuid REFERENCES clientes(id),
  booster_id        uuid REFERENCES boosters_lojista(id),
  valor             numeric(8,2),
  stripe_payment_id text,
  estado            text DEFAULT 'pendente',
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pagamentos_booster (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lojista_id        uuid REFERENCES clientes(id),
  booster_id        uuid REFERENCES boosters_lojista(id),
  valor             numeric(8,2),
  stripe_payment_id text,
  estado            text DEFAULT 'pendente',
  created_at        timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- DESCONTOS / CAMPANHAS
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS codigos_desconto (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        text UNIQUE NOT NULL,
  tipo          text DEFAULT 'percentagem',
  valor         numeric(8,2),
  usos_max      integer,
  usos_actuais  integer DEFAULT 0,
  data_expiry   timestamptz,
  ativo         boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campanhas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text,
  tipo        text,
  ativo       boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campanha_stats (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id   uuid REFERENCES campanhas(id),
  data          date,
  impressoes    integer DEFAULT 0,
  cliques       integer DEFAULT 0,
  conversoes    integer DEFAULT 0
);

-- ──────────────────────────────────────────────────────────────────────
-- ANALYTICS
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos_utilizador (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id),
  tipo        text,
  payload     jsonb,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_alugueres (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data        date,
  total       integer DEFAULT 0,
  valor       numeric(12,2) DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads_calculadora (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text,
  marca       text,
  tipo        text,
  preco       numeric(10,2),
  valor_calc  numeric(10,2),
  created_at  timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- CATEGORIAS / CONFIG
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome    text NOT NULL,
  slug    text UNIQUE,
  icone   text,
  ordem   integer DEFAULT 0,
  ativo   boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS configuracoes (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave   text UNIQUE NOT NULL,
  valor   text,
  tipo    text DEFAULT 'string'
);

CREATE TABLE IF NOT EXISTS app_config (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chave   text UNIQUE NOT NULL,
  valor   jsonb,
  updated_at timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- AVATARS (storage references)
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS avatars (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id) ON DELETE CASCADE,
  url         text,
  created_at  timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- MARCAS — TAXAS DE APRECIAÇÃO (calculadora)
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marca_aprec_rates (
  id                  bigserial PRIMARY KEY,
  marca_key           text NOT NULL UNIQUE,
  marca_display       text NOT NULL,
  taxa_anual          numeric(6,4) NOT NULL DEFAULT 0,
  tier                text NOT NULL DEFAULT 'semMarca',
  categoria           text,
  fonte               text,
  ultima_atualizacao  timestamptz DEFAULT now(),
  created_at          timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_marca_aprec_key ON marca_aprec_rates(marca_key);

-- ──────────────────────────────────────────────────────────────────────
-- VIEWS
-- ──────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_afiliados_resumo AS
  SELECT
    a.id,
    a.cliente_id,
    c.nome,
    c.email,
    a.codigo,
    a.comissao_pct,
    COUNT(ca.id) AS total_conversoes,
    COALESCE(SUM(ca.valor_comissao), 0) AS total_ganho
  FROM afiliados a
  LEFT JOIN clientes c ON c.id = a.cliente_id
  LEFT JOIN conversoes_afiliado ca ON ca.afiliado_id = a.id
  GROUP BY a.id, a.cliente_id, c.nome, c.email, a.codigo, a.comissao_pct;

-- ══════════════════════════════════════════════════════════════════════
-- FIM DO SCHEMA
-- Para popular a tabela marca_aprec_rates, corre o cron manualmente:
-- GET /api/cron/calibrar-marcas (com header x-cron-secret: <CRON_SECRET>)
-- ou espera segunda-feira às 3h (automático via Vercel Cron)
-- ══════════════════════════════════════════════════════════════════════
