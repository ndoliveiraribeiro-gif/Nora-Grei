-- Venda Social: tipo "social" com preço livre (mínimo 5€ definido pelo sistema)
ALTER TABLE pecas_lojista
  ADD COLUMN IF NOT EXISTS preco_social_minimo NUMERIC(10,2) DEFAULT NULL;

-- Comentário: quando tipo = 'social', preco_social_minimo = 5.00 (fixo pelo sistema)
-- O comprador decide o valor >= preco_social_minimo no checkout
-- Comissão Nora Grei aplica-se normalmente sobre o valor pago
