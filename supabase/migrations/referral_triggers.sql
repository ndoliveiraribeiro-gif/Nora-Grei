-- ============================================================
-- Nora Grei — Triggers de marcos de referido
-- Cada trigger gera um crédito em creditos_afiliado
-- para o lojista que recrutou o novo lojista.
--
-- Marco 1 (€5): registo — já feito em app/registar/page.js
-- Marco 2 (€5): publica 10 peças
-- Marco 3 (€5): faz 1.º aluguer ou venda
-- Marco 4 (€5): loja ativa há 3 meses
-- ============================================================


-- ── Marco 2: 10 peças publicadas ─────────────────────────────
CREATE OR REPLACE FUNCTION fn_referral_marco_10_pecas()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_referidor_id  uuid;
  v_total_pecas   int;
  v_valor         numeric;
BEGIN
  -- Contar peças do lojista (incluindo a que acabou de entrar)
  SELECT COUNT(*) INTO v_total_pecas
  FROM pecas_lojista
  WHERE cliente_id = NEW.cliente_id;

  -- Só actua exactamente na 10.ª peça
  IF v_total_pecas <> 10 THEN
    RETURN NEW;
  END IF;

  -- Verificar se já foi dado este crédito (idempotência)
  IF EXISTS (
    SELECT 1 FROM creditos_afiliado
    WHERE ref_id = NEW.cliente_id AND ref_tipo = '10_pecas'
  ) THEN
    RETURN NEW;
  END IF;

  -- Encontrar o referidor
  SELECT referidor_id INTO v_referidor_id
  FROM referrals
  WHERE referido_id = NEW.cliente_id
    AND status <> 'cancelado'
  LIMIT 1;

  IF v_referidor_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Ler valor configurado (default €5)
  SELECT COALESCE(credito_10_pecas, 5) INTO v_valor
  FROM config_referral LIMIT 1;

  -- Inserir crédito
  INSERT INTO creditos_afiliado (cliente_id, valor, motivo, ref_tipo, ref_id, usado)
  VALUES (
    v_referidor_id,
    v_valor,
    '10 peças publicadas pela loja que recrutaste',
    '10_pecas',
    NEW.cliente_id,
    false
  );

  -- Actualizar marco no referral
  UPDATE referrals
  SET comissao_gerada = COALESCE(comissao_gerada, 0) + v_valor
  WHERE referido_id = NEW.cliente_id AND status <> 'cancelado';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_referral_10_pecas ON pecas_lojista;
CREATE TRIGGER trg_referral_10_pecas
  AFTER INSERT ON pecas_lojista
  FOR EACH ROW
  EXECUTE FUNCTION fn_referral_marco_10_pecas();


-- ── Marco 3: 1.º aluguer ou venda ────────────────────────────
CREATE OR REPLACE FUNCTION fn_referral_marco_primeira_venda()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_referidor_id  uuid;
  v_lojista_id    uuid;
  v_valor         numeric;
BEGIN
  -- O aluguer/venda é do cliente (quem alugou), mas queremos o lojista da peça
  SELECT p.cliente_id INTO v_lojista_id
  FROM pecas_lojista p
  WHERE p.id = (
    SELECT peca_id FROM stock_lojista s WHERE s.id = NEW.stock_tamanho_id LIMIT 1
  );

  IF v_lojista_id IS NULL OR v_lojista_id = NEW.cliente_id THEN
    RETURN NEW;
  END IF;

  -- Verificar se já foi dado este crédito
  IF EXISTS (
    SELECT 1 FROM creditos_afiliado
    WHERE ref_id = v_lojista_id AND ref_tipo = 'primeira_venda'
  ) THEN
    RETURN NEW;
  END IF;

  -- Encontrar o referidor deste lojista
  SELECT referidor_id INTO v_referidor_id
  FROM referrals
  WHERE referido_id = v_lojista_id
    AND status <> 'cancelado'
  LIMIT 1;

  IF v_referidor_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Ler valor configurado (default €5)
  SELECT COALESCE(credito_primeira_venda, 5) INTO v_valor
  FROM config_referral LIMIT 1;

  -- Inserir crédito
  INSERT INTO creditos_afiliado (cliente_id, valor, motivo, ref_tipo, ref_id, usado)
  VALUES (
    v_referidor_id,
    v_valor,
    '1.º aluguer/venda da loja que recrutaste',
    'primeira_venda',
    v_lojista_id,
    false
  );

  -- Actualizar status do referral para activo
  UPDATE referrals
  SET status = 'ativo',
      comissao_gerada = COALESCE(comissao_gerada, 0) + v_valor
  WHERE referido_id = v_lojista_id AND status = 'pendente';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_referral_primeira_venda ON alugueres;
CREATE TRIGGER trg_referral_primeira_venda
  AFTER INSERT ON alugueres
  FOR EACH ROW
  EXECUTE FUNCTION fn_referral_marco_primeira_venda();


-- ── Marco 4: loja ativa 3 meses ──────────────────────────────
-- Este trigger corre quando o campo updated_at do cliente muda
-- (ou pode ser chamado por um cron diário via pg_cron)
-- Estratégia: verificar na inserção de qualquer aluguer se a
-- data de registo do lojista foi há >= 90 dias

CREATE OR REPLACE FUNCTION fn_referral_marco_3_meses()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_referidor_id  uuid;
  v_lojista_id    uuid;
  v_data_registo  timestamptz;
  v_valor         numeric;
BEGIN
  -- Identificar o lojista da peça (mesmo lógica do marco 3)
  SELECT p.cliente_id INTO v_lojista_id
  FROM pecas_lojista p
  WHERE p.id = (
    SELECT peca_id FROM stock_lojista s WHERE s.id = NEW.stock_tamanho_id LIMIT 1
  );

  IF v_lojista_id IS NULL OR v_lojista_id = NEW.cliente_id THEN
    RETURN NEW;
  END IF;

  -- Já foi dado este crédito?
  IF EXISTS (
    SELECT 1 FROM creditos_afiliado
    WHERE ref_id = v_lojista_id AND ref_tipo = '3_meses'
  ) THEN
    RETURN NEW;
  END IF;

  -- O lojista foi recrutado?
  SELECT referidor_id INTO v_referidor_id
  FROM referrals
  WHERE referido_id = v_lojista_id
    AND status <> 'cancelado'
  LIMIT 1;

  IF v_referidor_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Data de registo do lojista
  SELECT created_at INTO v_data_registo
  FROM clientes WHERE id = v_lojista_id;

  -- Só actua se passaram >= 90 dias desde o registo
  IF v_data_registo IS NULL OR NOW() - v_data_registo < INTERVAL '90 days' THEN
    RETURN NEW;
  END IF;

  -- Ler valor configurado (default €5)
  SELECT COALESCE(credito_3_meses, 5) INTO v_valor
  FROM config_referral LIMIT 1;

  -- Inserir crédito
  INSERT INTO creditos_afiliado (cliente_id, valor, motivo, ref_tipo, ref_id, usado)
  VALUES (
    v_referidor_id,
    v_valor,
    'Loja recrutada ativa há 3 meses',
    '3_meses',
    v_lojista_id,
    false
  );

  UPDATE referrals
  SET comissao_gerada = COALESCE(comissao_gerada, 0) + v_valor
  WHERE referido_id = v_lojista_id AND status <> 'cancelado';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_referral_3_meses ON alugueres;
CREATE TRIGGER trg_referral_3_meses
  AFTER INSERT ON alugueres
  FOR EACH ROW
  EXECUTE FUNCTION fn_referral_marco_3_meses();


-- ── Tabelas necessárias (criar se não existirem) ─────────────

CREATE TABLE IF NOT EXISTS referrals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referidor_id    uuid REFERENCES clientes(id) ON DELETE CASCADE,
  referido_id     uuid REFERENCES clientes(id) ON DELETE CASCADE,
  ref_codigo      text,
  status          text DEFAULT 'pendente', -- pendente | ativo | cancelado | pago
  comissao_gerada numeric(10,2) DEFAULT 0,
  comissao_paga   boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(referido_id) -- cada pessoa só pode ter 1 referidor
);

CREATE TABLE IF NOT EXISTS creditos_afiliado (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id) ON DELETE CASCADE,
  valor       numeric(10,2) NOT NULL,
  motivo      text,
  ref_tipo    text, -- registo | 10_pecas | primeira_venda | 3_meses | manual
  ref_id      uuid, -- id do referido que gerou o crédito
  usado       boolean DEFAULT false,
  usado_em    timestamptz,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config_referral (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ativo                     boolean DEFAULT true,
  desconto_comprador        numeric(5,2) DEFAULT 10,
  comissao_referidor        numeric(5,2) DEFAULT 5,
  minimo_pagamento          numeric(10,2) DEFAULT 20,
  validade_cookie_dias      int DEFAULT 30,
  credito_10_pecas          numeric(10,2) DEFAULT 5,
  credito_primeira_venda    numeric(10,2) DEFAULT 5,
  credito_3_meses           numeric(10,2) DEFAULT 5,
  meses_sem_comissao_vendas int DEFAULT 3,
  created_at                timestamptz DEFAULT now()
);

-- Inserir config por defeito se não existir
INSERT INTO config_referral (
  ativo, desconto_comprador, comissao_referidor, minimo_pagamento,
  validade_cookie_dias, credito_10_pecas, credito_primeira_venda,
  credito_3_meses, meses_sem_comissao_vendas
)
SELECT true, 10, 5, 20, 30, 5, 5, 5, 3
WHERE NOT EXISTS (SELECT 1 FROM config_referral);
