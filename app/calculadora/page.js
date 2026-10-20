"use client";
import { useState } from "react";

const COMISSAO_ALUGUER = 0.10;
const COMISSAO_VENDA = 0.20;
const CUSTO_HIGIENIZACAO = 8;
const CUSTO_ENVIO = 6;
const CUSTO_FOTOGRAFIA = 80;
const CUSTO_GESTAO_HORA = 15;

export default function Calculadora() {
  const [modo, setModo] = useState("aluguer"); // "aluguer" | "venda"
  const [preco, setPreco] = useState("");
  const [alugueres, setAlugueres] = useState(4);
  const [incluirFoto, setIncluirFoto] = useState(false);

  const p = parseFloat(preco) || 0;

  // --- Aluguer ---
  const receitaBrutaAluguer = p * alugueres;
  const comissaoAluguer = receitaBrutaAluguer * COMISSAO_ALUGUER;
  const higienizacaoTotal = CUSTO_HIGIENIZACAO * alugueres;
  const liquidoAluguer = receitaBrutaAluguer - comissaoAluguer - higienizacaoTotal;
  const alugueresPAraRecuperar = p > 0 ? Math.ceil(p / (p * (1 - COMISSAO_ALUGUER) - CUSTO_HIGIENIZACAO)) : 0;

  // --- Venda ---
  const comissaoVenda = p * COMISSAO_VENDA;
  const custoEnvioVenda = CUSTO_ENVIO;
  const liquidoVenda = p - comissaoVenda - custoEnvioVenda;

  // --- Esforço evitado (mesmo valor para ambos) ---
  const esforcoEvitado = CUSTO_FOTOGRAFIA + (CUSTO_GESTAO_HORA * (modo === "aluguer" ? alugueres * 0.5 : 1)) + (modo === "aluguer" ? custoEnvioVenda * alugueres : custoEnvioVenda);
  const esforcoFoto = incluirFoto ? CUSTO_FOTOGRAFIA : 0;

  return (
    <>
      <style>{`
        :root {
          --bg: #f8f7f5;
          --card: #ffffff;
          --fg: #1a1816;
          --sub: #6b6560;
          --accent: #c4748a;
          --border: #e2dfda;
          --green: #2d7a4f;
          --green-bg: #edf7f1;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--fg); font-family: 'Jost', sans-serif; }

        .calc-wrap {
          min-height: 100svh;
          padding: 0 1rem 6rem;
          max-width: 480px;
          margin: 0 auto;
        }

        .calc-header {
          padding: 2.5rem 0 1.5rem;
          text-align: center;
        }
        .calc-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .calc-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 400;
          line-height: 1.2;
          color: var(--fg);
        }
        .calc-sub {
          font-size: 0.82rem;
          color: var(--sub);
          margin-top: 0.5rem;
          line-height: 1.5;
        }

        .modo-tabs {
          display: flex;
          background: var(--border);
          border-radius: 10px;
          padding: 3px;
          margin-bottom: 1.25rem;
        }
        .modo-tab {
          flex: 1;
          padding: 0.65rem;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-family: 'Jost', sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--sub);
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
          font-weight: 500;
        }
        .modo-tab.active {
          background: var(--card);
          color: var(--fg);
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }

        .card {
          background: var(--card);
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 0.75rem;
          border: 1px solid var(--border);
        }
        .card-title {
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--sub);
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .input-group { margin-bottom: 1rem; }
        .input-label {
          display: block;
          font-size: 0.75rem;
          color: var(--sub);
          margin-bottom: 0.4rem;
          letter-spacing: 0.05em;
        }
        .input-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0 0.75rem;
        }
        .input-prefix {
          font-size: 0.9rem;
          color: var(--sub);
          font-weight: 500;
        }
        .input-field {
          flex: 1;
          border: none;
          background: transparent;
          font-family: 'Jost', sans-serif;
          font-size: 1rem;
          color: var(--fg);
          padding: 0.65rem 0;
          outline: none;
        }

        .slider-wrap { display: flex; flex-direction: column; gap: 0.5rem; }
        .slider-top { display: flex; justify-content: space-between; align-items: baseline; }
        .slider-val {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--fg);
        }
        .slider {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: var(--border);
          outline: none;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(196,116,138,0.3);
        }

        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .toggle-label { font-size: 0.82rem; color: var(--sub); }
        .toggle {
          width: 40px; height: 22px;
          background: var(--border);
          border-radius: 11px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .toggle.on { background: var(--accent); }
        .toggle::after {
          content: '';
          position: absolute;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: white;
          top: 3px; left: 3px;
          transition: left 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .toggle.on::after { left: 21px; }

        /* Resultado */
        .resultado-card {
          background: var(--fg);
          border-radius: 14px;
          padding: 1.5rem 1.25rem;
          margin-bottom: 0.75rem;
          color: white;
        }
        .resultado-label {
          font-size: 0.68rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          opacity: 0.55;
          margin-bottom: 0.4rem;
        }
        .resultado-valor {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 500;
          line-height: 1;
          margin-bottom: 0.25rem;
        }
        .resultado-nota {
          font-size: 0.75rem;
          opacity: 0.6;
          line-height: 1.4;
        }

        .breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .breakdown-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
        }
        .breakdown-label { color: var(--sub); }
        .breakdown-val { font-weight: 500; color: var(--fg); }
        .breakdown-val.neg { color: #c0392b; }
        .breakdown-val.pos { color: var(--green); }
        .breakdown-divider {
          height: 1px;
          background: var(--border);
          margin: 0.25rem 0;
        }
        .breakdown-total {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .esforco-card {
          background: var(--green-bg);
          border: 1px solid #b8e0ca;
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .esforco-title {
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--green);
          margin-bottom: 0.75rem;
          font-weight: 500;
        }
        .esforco-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #2d5a3f;
          margin-bottom: 0.4rem;
        }
        .esforco-total {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--green);
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #b8e0ca;
        }

        .recuperar-badge {
          background: #fff8eb;
          border: 1px solid #f0d9a0;
          border-radius: 10px;
          padding: 0.85rem 1rem;
          font-size: 0.8rem;
          color: #7a5c00;
          line-height: 1.4;
          margin-bottom: 0.75rem;
          text-align: center;
        }
        .recuperar-badge strong {
          display: block;
          font-size: 1.1rem;
          margin-bottom: 0.2rem;
          color: #5a4200;
        }

        .cta-btn {
          display: block;
          width: 100%;
          padding: 1rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 10px;
          font-family: 'Jost', sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .calc-wrap { padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }
        }
      `}</style>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Jost:wght@300;400;500&display=swap" />

      <div className="calc-wrap">
        <div className="calc-header">
          <div className="calc-eyebrow">Nora Grei</div>
          <h1 className="calc-title">Quanto vais ganhar?</h1>
          <p className="calc-sub">Descobre o teu rendimento real antes de publicar a peça.</p>
        </div>

        {/* Tabs modo */}
        <div className="modo-tabs">
          <button className={`modo-tab${modo === "aluguer" ? " active" : ""}`} onClick={() => setModo("aluguer")}>Aluguer</button>
          <button className={`modo-tab${modo === "venda" ? " active" : ""}`} onClick={() => setModo("venda")}>Venda</button>
        </div>

        {/* Inputs */}
        <div className="card">
          <div className="card-title">A tua peça</div>

          <div className="input-group">
            <label className="input-label">Preço {modo === "aluguer" ? "por aluguer" : "de venda"}</label>
            <div className="input-row">
              <span className="input-prefix">€</span>
              <input
                className="input-field"
                type="number"
                min="0"
                placeholder="0"
                value={preco}
                onChange={e => setPreco(e.target.value)}
              />
            </div>
          </div>

          {modo === "aluguer" && (
            <div className="input-group">
              <div className="slider-wrap">
                <div className="slider-top">
                  <label className="input-label" style={{margin:0}}>Número de alugueres por ano</label>
                  <span className="slider-val">{alugueres}×</span>
                </div>
                <input
                  className="slider"
                  type="range"
                  min="1"
                  max="24"
                  value={alugueres}
                  onChange={e => setAlugueres(parseInt(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="toggle-row">
            <span className="toggle-label">Incluo fotografia profissional (±€{CUSTO_FOTOGRAFIA})</span>
            <button className={`toggle${incluirFoto ? " on" : ""}`} onClick={() => setIncluirFoto(v => !v)} />
          </div>
        </div>

        {/* Resultado principal */}
        {p > 0 && (
          <>
            <div className="resultado-card">
              <div className="resultado-label">
                {modo === "aluguer" ? `Recebes em ${alugueres} aluguer${alugueres > 1 ? "es" : ""}` : "Recebes na venda"}
              </div>
              <div className="resultado-valor">
                €{modo === "aluguer" ? Math.max(0, liquidoAluguer).toFixed(0) : Math.max(0, liquidoVenda).toFixed(0)}
              </div>
              <div className="resultado-nota">
                {modo === "aluguer"
                  ? `€${(Math.max(0, liquidoAluguer) / alugueres).toFixed(0)} líquido por aluguer · comissão ${COMISSAO_ALUGUER * 100}%`
                  : `Comissão ${COMISSAO_VENDA * 100}% + envio incluído`}
              </div>
            </div>

            {/* Breakdown */}
            <div className="card">
              <div className="card-title">Detalhes do cálculo</div>
              <div className="breakdown">
                {modo === "aluguer" ? (
                  <>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Receita bruta ({alugueres}× €{p})</span>
                      <span className="breakdown-val pos">+€{receitaBrutaAluguer.toFixed(2)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Comissão Nora Grei (10%)</span>
                      <span className="breakdown-val neg">−€{comissaoAluguer.toFixed(2)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Higienização ({alugueres}× €{CUSTO_HIGIENIZACAO})</span>
                      <span className="breakdown-val neg">−€{higienizacaoTotal.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Preço de venda</span>
                      <span className="breakdown-val pos">+€{p.toFixed(2)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Comissão Nora Grei (20%)</span>
                      <span className="breakdown-val neg">−€{comissaoVenda.toFixed(2)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Envio (incluído)</span>
                      <span className="breakdown-val neg">−€{custoEnvioVenda.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="breakdown-divider" />
                <div className="breakdown-total">
                  <span>Total líquido</span>
                  <span>€{modo === "aluguer" ? Math.max(0, liquidoAluguer).toFixed(2) : Math.max(0, liquidoVenda).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Alugueres para recuperar */}
            {modo === "aluguer" && alugueresPAraRecuperar > 0 && (
              <div className="recuperar-badge">
                <strong>{alugueresPAraRecuperar} aluguer{alugueresPAraRecuperar > 1 ? "es" : ""} para recuperar o investimento</strong>
                A partir daí, tudo é lucro. A peça continua a trabalhar por ti.
              </div>
            )}

            {/* Esforço evitado */}
            <div className="esforco-card">
              <div className="esforco-title">O que a Nora Grei trata por ti</div>
              {incluirFoto && (
                <div className="esforco-item">
                  <span>Fotografia profissional</span>
                  <span>~€{CUSTO_FOTOGRAFIA}</span>
                </div>
              )}
              <div className="esforco-item">
                <span>Gestão de reservas e contratos</span>
                <span>~€{(CUSTO_GESTAO_HORA * (modo === "aluguer" ? alugueres * 0.5 : 1)).toFixed(0)}</span>
              </div>
              <div className="esforco-item">
                <span>Logística e envios</span>
                <span>~€{(CUSTO_ENVIO * (modo === "aluguer" ? alugueres : 1)).toFixed(0)}</span>
              </div>
              <div className="esforco-item">
                <span>Proteção contra não-pagamento</span>
                <span>incluído</span>
              </div>
              <div className="esforco-item">
                <span>Acesso à base de clientes</span>
                <span>incluído</span>
              </div>
              <div className="esforco-total">
                <span>Valor do serviço</span>
                <span>~€{(esforcoEvitado + esforcoFoto).toFixed(0)}</span>
              </div>
            </div>

            <a href="/registar?lojista=1" className="cta-btn">Publicar a minha peça</a>
          </>
        )}

        {!p && (
          <div style={{textAlign:"center",padding:"2rem 0",color:"var(--sub)",fontSize:"0.85rem"}}>
            Introduz o preço para ver os resultados
          </div>
        )}
      </div>
    </>
  );
}
