-- =============================================================
-- SISTEMA DE MENSAGENS INTERNAS — Nora Grei
-- Executar no Supabase SQL Editor se as tabelas não existirem
-- ou se as RLS policies estiverem a bloquear
-- =============================================================

-- ── 1. TABELA conversas ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversas (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id           UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  lojista_id           UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  aluguer_lojista_id   UUID REFERENCES alugueres_lojista(id) ON DELETE SET NULL,
  assunto              TEXT,
  ultima_mensagem_em   TIMESTAMPTZ,
  nao_lidas_cliente    INT DEFAULT 0,
  nao_lidas_lojista    INT DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS conversas_cliente_idx  ON conversas(cliente_id);
CREATE INDEX IF NOT EXISTS conversas_lojista_idx  ON conversas(lojista_id);

-- ── 2. TABELA mensagens_conversa ─────────────────────────────
CREATE TABLE IF NOT EXISTS mensagens_conversa (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id    UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
  remetente_id   UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  conteudo       TEXT NOT NULL,
  lida           BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mensagens_conversa_idx ON mensagens_conversa(conversa_id);

-- ── 3. RLS ───────────────────────────────────────────────────
ALTER TABLE conversas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_conversa  ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS conversas_select  ON conversas;
DROP POLICY IF EXISTS conversas_insert  ON conversas;
DROP POLICY IF EXISTS conversas_update  ON conversas;
DROP POLICY IF EXISTS mensagens_select  ON mensagens_conversa;
DROP POLICY IF EXISTS mensagens_insert  ON mensagens_conversa;
DROP POLICY IF EXISTS mensagens_update  ON mensagens_conversa;

-- conversas: o participante (cliente ou lojista) pode ler/escrever a sua conversa
CREATE POLICY conversas_select ON conversas
  FOR SELECT USING (
    auth.uid() = cliente_id OR auth.uid() = lojista_id
  );

CREATE POLICY conversas_insert ON conversas
  FOR INSERT WITH CHECK (
    auth.uid() = cliente_id OR auth.uid() = lojista_id
  );

CREATE POLICY conversas_update ON conversas
  FOR UPDATE USING (
    auth.uid() = cliente_id OR auth.uid() = lojista_id
  );

-- mensagens: qualquer participante da conversa pode ler/inserir/actualizar
CREATE POLICY mensagens_select ON mensagens_conversa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversas c
      WHERE c.id = conversa_id
        AND (auth.uid() = c.cliente_id OR auth.uid() = c.lojista_id)
    )
  );

CREATE POLICY mensagens_insert ON mensagens_conversa
  FOR INSERT WITH CHECK (
    auth.uid() = remetente_id
    AND EXISTS (
      SELECT 1 FROM conversas c
      WHERE c.id = conversa_id
        AND (auth.uid() = c.cliente_id OR auth.uid() = c.lojista_id)
    )
  );

CREATE POLICY mensagens_update ON mensagens_conversa
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversas c
      WHERE c.id = conversa_id
        AND (auth.uid() = c.cliente_id OR auth.uid() = c.lojista_id)
    )
  );

-- ── 4. Realtime (activar nas tabelas) ────────────────────────
-- No painel Supabase: Database → Replication → activar mensagens_conversa
-- Ou via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE mensagens_conversa;
