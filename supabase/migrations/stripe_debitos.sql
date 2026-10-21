-- Colunas Stripe na tabela clientes
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT;

-- Tabela de débitos automáticos ao cliente (atrasos na devolução)
CREATE TABLE IF NOT EXISTS debitos_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  aluguer_id UUID REFERENCES alugueres(id),
  tipo TEXT NOT NULL DEFAULT 'atraso_devolucao', -- 'atraso_devolucao' | 'dano_peca'
  valor NUMERIC(10,2) NOT NULL,                  -- valor em euros (preço/dia original)
  dia_atraso INT,                                -- qual o dia de atraso (1º dia, 2º dia…)
  stripe_payment_intent_id TEXT,
  estado TEXT NOT NULL DEFAULT 'pendente',       -- 'cobrado' | 'falhou' | 'pendente'
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS debitos_cliente_cliente_id ON debitos_cliente(cliente_id);
CREATE INDEX IF NOT EXISTS debitos_cliente_aluguer_id ON debitos_cliente(aluguer_id);

-- RLS: cliente vê os seus próprios débitos, admin vê tudo
ALTER TABLE debitos_cliente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cliente vê os seus débitos"
  ON debitos_cliente FOR SELECT
  USING (auth.uid() = cliente_id);

-- Admin usa service_role (bypass RLS automático)
