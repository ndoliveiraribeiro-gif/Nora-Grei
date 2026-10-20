"use client";
import { useState, useMemo } from "react";

// Comissões reais da plataforma
const COMISSAO_ALUGUER = 0.10;
const COMISSAO_VENDA = 0.20;
const CUSTO_HIGIENIZACAO = 8;
const CUSTO_ENVIO = 6;

// Fatores de depreciação por categoria
const CATEGORIAS = [
  { id: "luxo",    label: "Luxo / Designer",    fator: 0.70, rotacao: 2.5 },
  { id: "mid",     label: "Mid-market",          fator: 0.42, rotacao: 1.8 },
  { id: "festa",   label: "Festa / Ocasião",     fator: 0.55, rotacao: 1.2 },
  { id: "casual",  label: "Casual / Dia-a-dia",  fator: 0.28, rotacao: 2.2 },
  { id: "acessorio", label: "Acessório / Mala",  fator: 0.65, rotacao: 2.0 },
];

const ESTADOS = [
  { id: "novo",       label: "Nunca usado / com etiqueta", fator: 1.00 },
  { id: "excelente",  label: "Excelente — como novo",      fator: 0.85 },
  { id: "bom",        label: "Bom — uso cuidadoso",        fator: 0.65 },
  { id: "aceitavel",  label: "Aceitável — uso visível",    fator: 0.40 },
];

const IDADES = [
  { id: "novo",   label: "Menos de 1 ano",  fator: 1.00 },
  { id: "1a2",    label: "1 a 2 anos",      fator: 0.85 },
  { id: "2a4",    label: "2 a 4 anos",      fator: 0.70 },
  { id: "4mais",  label: "Mais de 4 anos",  fator: 0.50 },
];

const USOS = [
  { id: "nunca",  label: "Nunca / 1 vez",  fator: 1.00 },
  { id: "pouco",  label: "2 a 5 vezes",    fator: 0.88 },
  { id: "medio",  label: "6 a 15 vezes",   fator: 0.72 },
  { id: "muito",  label: "Mais de 15×",    fator: 0.52 },
];

// Estimativa de preço Vinted por categoria (desconto agressivo)
const VINTED_FATOR = { luxo: 0.35, mid: 0.20, festa: 0.25, casual: 0.15, acessorio: 0.30 };

export default function Calculadora() {
  const [step, setStep] = useState(0); // 0=intro, 1=inputs, 2=resultado
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("mid");
  const [estado, setEstado] = useState("bom");
  const [idade, setIdade] = useState("1a2");
  const [uso, setUso] = useState("pouco");
  const [meses, setMeses] = useState(12);

  const p = parseFloat(preco) || 0;

  const calc = useMemo(() => {
    if (!p) return null;
    const cat = CATEGORIAS.find(c => c.id === categoria);
    const est = ESTADOS.find(e => e.id === estado);
    const id  = IDADES.find(i => i.id === idade);
    const us  = USOS.find(u => u.id === uso);

    // Valor de mercado estimado agora
    const valorMercado = p * cat.fator * est.fator * id.fator * us.fator;

    // Preço de aluguer sugerido (12-18% do valor de mercado)
    const precoAluguer = Math.round(valorMercado * 0.15 / 5) * 5 || 5;

    // Rotação estimada por mês (média da categoria, ajustada pelo estado)
    const rotacaoMes = cat.rotacao * est.fator;
    const alugueresTotal = Math.round(rotacaoMes * meses);

    // Receita bruta aluguer
    const receitaBruta = precoAluguer * alugueresTotal;
    const comissaoTotal = receitaBruta * COMISSAO_ALUGUER;
    const higienizacaoTotal = CUSTO_HIGIENIZACAO * alugueresTotal;
    const liquidoAluguer = receitaBruta - comissaoTotal - higienizacaoTotal;

    // Valor residual da peça após os alugueres (deprecia mais lentamente com cuidado NG)
    // Assumimos que o aluguer controlado deprecia menos que uso privado (fator 0.85 vs 1.0)
    const depreciacaoAluguerMes = 0.008; // 0.8% por mês de aluguer ativo
    const valorFinalPeca = valorMercado * Math.pow(1 - depreciacaoAluguerMes, alugueresTotal);
    const vendaFinalLiquido = Math.max(0, valorFinalPeca - valorFinalPeca * COMISSAO_VENDA - CUSTO_ENVIO);

    // Total Nora Grei
    const totalNG = liquidoAluguer + vendaFinalLiquido;

    // Vinted — vende já agora ao preço de ocasião
    const vendaVinted = p * VINTED_FATOR[categoria];

    // Diferença
    const ganhoExtra = totalNG - vendaVinted;
    const multiplicador = vendaVinted > 0 ? (totalNG / vendaVinted) : 0;

    return {
      valorMercado, precoAluguer, rotacaoMes, alugueresTotal,
      receitaBruta, liquidoAluguer, valorFinalPeca,
      vendaFinalLiquido, totalNG, vendaVinted, ganhoExtra, multiplicador,
    };
  }, [p, categoria, estado, idade, uso, meses]);

  const catObj = CATEGORIAS.find(c => c.id === categoria);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        :root {
          --bg: #f8f7f5;
          --card: #ffffff;
          --fg: #1a1816;
          --sub: #6b6560;
          --accent: #c4748a;
          --border: #e2dfda;
          --dark: #100c0a;
          --green: #2a6b45;
          --green-bg: #edf7f1;
          --gold: #c4a882;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--fg); font-family: 'Jost', sans-serif; }
        .serif { font-family: 'Cormorant Garamond', serif; }

        .wrap {
          min-height: 100svh;
          max-width: 480px;
          margin: 0 auto;
          padding: 0 1rem 5rem;
        }

        /* Header */
        .pg-header {
          padding: 2rem 0 1.75rem;
          text-align: center;
        }
        .pg-eyebrow {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.6rem;
        }
        .pg-titulo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.1rem;
          font-weight: 400;
          line-height: 1.15;
          color: var(--fg);
          margin-bottom: 0.5rem;
        }
        .pg-sub {
          font-size: 0.82rem;
          color: var(--sub);
          line-height: 1.55;
          max-width: 32ch;
          margin: 0 auto;
        }

        /* Cards */
        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .card-label {
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--sub);
          margin-bottom: 1rem;
          font-weight: 500;
        }

        /* Input preço */
        .preco-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0 0.9rem;
        }
        .preco-prefix { font-size: 1.1rem; color: var(--sub); }
        .preco-input {
          flex: 1; border: none; background: transparent;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem; font-weight: 400;
          color: var(--fg); padding: 0.5rem 0;
          outline: none;
        }
        .preco-hint { font-size: 0.72rem; color: var(--sub); margin-top: 0.4rem; }

        /* Opções pill */
        .pills {
          display: flex; flex-wrap: wrap; gap: 0.4rem;
        }
        .pill {
          padding: 0.45rem 0.85rem;
          border: 1px solid var(--border);
          border-radius: 20px;
          font-size: 0.74rem;
          background: var(--bg);
          color: var(--sub);
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Jost', sans-serif;
        }
        .pill.sel {
          background: var(--fg);
          color: #fff;
          border-color: var(--fg);
        }

        /* Slider meses */
        .slider-header { display: flex; justify-content: space-between; margin-bottom: 0.6rem; }
        .slider-val { font-size: 1rem; font-weight: 600; color: var(--fg); }
        input[type=range] {
          -webkit-appearance: none; width: 100%; height: 4px;
          border-radius: 2px; background: var(--border); outline: none;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px;
          border-radius: 50%; background: var(--accent); cursor: pointer;
          box-shadow: 0 1px 4px rgba(196,116,138,0.35);
        }

        /* Botão */
        .btn {
          display: block; width: 100%; padding: 1rem;
          background: var(--fg); color: #fff; border: none;
          border-radius: 10px; font-family: 'Jost', sans-serif;
          font-size: 0.74rem; letter-spacing: 0.14em;
          text-transform: uppercase; cursor: pointer;
          text-align: center; text-decoration: none;
          transition: background 0.2s;
        }
        .btn:hover { background: #2d2926; }
        .btn-outline {
          background: transparent; color: var(--sub);
          border: 1px solid var(--border);
          margin-top: 0.5rem;
        }
        .btn-outline:hover { background: var(--bg); }

        /* Resultado hero */
        .hero-res {
          background: var(--dark);
          border-radius: 16px;
          padding: 1.75rem 1.5rem;
          margin-bottom: 0.75rem;
          position: relative;
          overflow: hidden;
        }
        .hero-res::before {
          content: 'NG';
          position: absolute; right: 1rem; top: 50%;
          transform: translateY(-50%);
          font-family: 'Cormorant Garamond', serif;
          font-size: 6rem; font-weight: 300;
          color: rgba(255,255,255,0.04);
          line-height: 1;
        }
        .hero-label {
          font-size: 0.62rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(255,255,255,0.4);
          margin-bottom: 0.4rem;
        }
        .hero-valor {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.5rem; font-weight: 400;
          color: #fff; line-height: 1;
          margin-bottom: 0.3rem;
        }
        .hero-nota {
          font-size: 0.75rem; color: rgba(255,255,255,0.45);
          line-height: 1.4;
        }

        /* Comparação Vinted */
        .comp-card {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0.6rem; margin-bottom: 0.75rem;
        }
        .comp-col {
          border-radius: 12px; padding: 1rem;
          border: 1px solid var(--border);
        }
        .comp-col.ng { background: var(--dark); border-color: transparent; }
        .comp-col.vinted { background: var(--card); }
        .comp-marca {
          font-size: 0.6rem; letter-spacing: 0.18em;
          text-transform: uppercase; margin-bottom: 0.5rem;
        }
        .comp-col.ng .comp-marca { color: rgba(255,255,255,0.4); }
        .comp-col.vinted .comp-marca { color: var(--sub); }
        .comp-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.9rem; font-weight: 400; line-height: 1;
          margin-bottom: 0.3rem;
        }
        .comp-col.ng .comp-num { color: #fff; }
        .comp-col.vinted .comp-num { color: var(--fg); }
        .comp-desc { font-size: 0.68rem; line-height: 1.35; }
        .comp-col.ng .comp-desc { color: rgba(255,255,255,0.4); }
        .comp-col.vinted .comp-desc { color: var(--sub); }
        .comp-badge {
          font-size: 0.62rem; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--accent);
          margin-top: 0.5rem; font-weight: 500;
        }

        /* Ganho extra */
        .ganho-banner {
          background: linear-gradient(135deg, #c4748a 0%, #a85870 100%);
          border-radius: 12px; padding: 1rem 1.25rem;
          margin-bottom: 0.75rem;
          display: flex; justify-content: space-between;
          align-items: center; gap: 1rem;
        }
        .ganho-text { font-size: 0.78rem; color: rgba(255,255,255,0.85); line-height: 1.4; }
        .ganho-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 400; color: #fff;
          white-space: nowrap;
        }

        /* Breakdown */
        .breakdown { display: flex; flex-direction: column; gap: 0.55rem; }
        .bk-row { display: flex; justify-content: space-between; font-size: 0.8rem; }
        .bk-label { color: var(--sub); }
        .bk-val { font-weight: 500; }
        .bk-val.pos { color: var(--green); }
        .bk-val.neg { color: #c0392b; }
        .bk-div { height: 1px; background: var(--border); }
        .bk-total { display: flex; justify-content: space-between; font-weight: 600; font-size: 0.88rem; }

        /* Rotação */
        .rotacao-card {
          background: var(--green-bg);
          border: 1px solid #b8e0ca;
          border-radius: 12px; padding: 1rem 1.25rem;
          margin-bottom: 0.75rem;
        }
        .rotacao-label {
          font-size: 0.62rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--green);
          margin-bottom: 0.5rem; font-weight: 500;
        }
        .rotacao-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; font-weight: 400;
          color: var(--green); line-height: 1;
        }
        .rotacao-sub { font-size: 0.75rem; color: #3a7a55; margin-top: 0.25rem; line-height: 1.4; }

        @media (max-width: 768px) {
          .wrap { padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }
        }
      `}</style>

      <div className="wrap">

        <div className="pg-header">
          <div className="pg-eyebrow">Nora Grei · Calculadora</div>
          <h1 className="pg-titulo serif">Quanto vale<br/>o teu armário?</h1>
          <p className="pg-sub">Introduz os dados da peça e vê quanto podes ganhar — antes e depois de a vender.</p>
        </div>

        {/* INPUTS */}
        <div className="card">
          <div className="card-label">Preço original de compra</div>
          <div className="preco-row">
            <span className="preco-prefix">€</span>
            <input
              className="preco-input"
              type="number" min="0" placeholder="0"
              value={preco} onChange={e => setPreco(e.target.value)}
            />
          </div>
          <p className="preco-hint">Quanto pagaste pela peça quando era nova</p>
        </div>

        <div className="card">
          <div className="card-label">Categoria</div>
          <div className="pills">
            {CATEGORIAS.map(c => (
              <button key={c.id} className={`pill${categoria === c.id ? " sel" : ""}`} onClick={() => setCategoria(c.id)}>{c.label}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-label">Estado actual da peça</div>
          <div className="pills">
            {ESTADOS.map(e => (
              <button key={e.id} className={`pill${estado === e.id ? " sel" : ""}`} onClick={() => setEstado(e.id)}>{e.label}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-label">Idade da peça</div>
          <div className="pills">
            {IDADES.map(i => (
              <button key={i.id} className={`pill${idade === i.id ? " sel" : ""}`} onClick={() => setIdade(i.id)}>{i.label}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-label">Quantas vezes a usaste</div>
          <div className="pills">
            {USOS.map(u => (
              <button key={u.id} className={`pill${uso === u.id ? " sel" : ""}`} onClick={() => setUso(u.id)}>{u.label}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-label">Durante quantos meses queres alugar?</div>
          <div className="slider-header">
            <span style={{fontSize:"0.78rem",color:"var(--sub)"}}>Período de aluguer</span>
            <span className="slider-val">{meses} meses</span>
          </div>
          <input type="range" min="1" max="36" value={meses} onChange={e => setMeses(parseInt(e.target.value))} />
          <p style={{fontSize:"0.7rem",color:"var(--sub)",marginTop:"0.5rem"}}>Depois vendes a peça usada com valor de ocasião</p>
        </div>

        {/* RESULTADOS */}
        {calc && p > 0 && (
          <>
            {/* Hero total */}
            <div className="hero-res">
              <div className="hero-label">Total estimado — aluguer + venda final</div>
              <div className="hero-valor">€{Math.round(calc.totalNG)}</div>
              <div className="hero-nota">
                €{Math.round(calc.liquidoAluguer)} em alugueres · €{Math.round(calc.vendaFinalLiquido)} na venda final
              </div>
            </div>

            {/* Comparação Vinted */}
            <div className="comp-card">
              <div className="comp-col ng">
                <div className="comp-marca">Nora Grei</div>
                <div className="comp-num">€{Math.round(calc.totalNG)}</div>
                <div className="comp-desc">Alugueres + venda com valor de ocasião</div>
                <div className="comp-badge">{calc.multiplicador.toFixed(1)}× mais →</div>
              </div>
              <div className="comp-col vinted">
                <div className="comp-marca">Vinted / Usada</div>
                <div className="comp-num">€{Math.round(calc.vendaVinted)}</div>
                <div className="comp-desc">Venda única ao preço de mercado de ocasião</div>
              </div>
            </div>

            {/* Ganho extra */}
            <div className="ganho-banner">
              <div className="ganho-text">
                Ganhas <strong>€{Math.round(calc.ganhoExtra)} a mais</strong> do que se vendesses já na Vinted
              </div>
              <div className="ganho-num">+€{Math.round(calc.ganhoExtra)}</div>
            </div>

            {/* Rotação estimada */}
            <div className="rotacao-card">
              <div className="rotacao-label">Rotação estimada</div>
              <div className="rotacao-num">{calc.alugueresTotal} alugueres em {meses} meses</div>
              <div className="rotacao-sub">
                ~{calc.rotacaoMes.toFixed(1)} por mês para {catObj?.label} em estado {ESTADOS.find(e=>e.id===estado)?.label.split("—")[0].trim().toLowerCase()}.
                A peça fica disponível entre alugueres e deprecia de forma controlada.
              </div>
            </div>

            {/* Breakdown */}
            <div className="card">
              <div className="card-label">Como se chega ao valor</div>
              <div className="breakdown">
                <div className="bk-row">
                  <span className="bk-label">Valor de mercado estimado agora</span>
                  <span className="bk-val">€{Math.round(calc.valorMercado)}</span>
                </div>
                <div className="bk-row">
                  <span className="bk-label">Preço sugerido por aluguer</span>
                  <span className="bk-val">€{calc.precoAluguer}</span>
                </div>
                <div className="bk-row">
                  <span className="bk-label">Receita bruta ({calc.alugueresTotal}× €{calc.precoAluguer})</span>
                  <span className="bk-val pos">+€{Math.round(calc.receitaBruta)}</span>
                </div>
                <div className="bk-row">
                  <span className="bk-label">Comissão Nora Grei (10%)</span>
                  <span className="bk-val neg">−€{Math.round(calc.receitaBruta * COMISSAO_ALUGUER)}</span>
                </div>
                <div className="bk-row">
                  <span className="bk-label">Higienização ({calc.alugueresTotal}× €{CUSTO_HIGIENIZACAO})</span>
                  <span className="bk-val neg">−€{CUSTO_HIGIENIZACAO * calc.alugueresTotal}</span>
                </div>
                <div className="bk-div"/>
                <div className="bk-row">
                  <span className="bk-label">Líquido de alugueres</span>
                  <span className="bk-val pos">€{Math.round(calc.liquidoAluguer)}</span>
                </div>
                <div className="bk-div"/>
                <div className="bk-row">
                  <span className="bk-label">Valor residual da peça após {meses} meses</span>
                  <span className="bk-val">€{Math.round(calc.valorFinalPeca)}</span>
                </div>
                <div className="bk-row">
                  <span className="bk-label">Venda usada líquida (comissão 20% + envio)</span>
                  <span className="bk-val pos">+€{Math.round(calc.vendaFinalLiquido)}</span>
                </div>
                <div className="bk-div"/>
                <div className="bk-total">
                  <span>Total recebido</span>
                  <span>€{Math.round(calc.totalNG)}</span>
                </div>
              </div>
            </div>

            <a href="/registar?lojista=1" className="btn">Publicar a minha peça agora</a>
            <a href="/lojas" className="btn btn-outline">Ver como outras lojistas fazem →</a>
          </>
        )}

        {(!calc || !p) && (
          <p style={{textAlign:"center",color:"var(--sub)",fontSize:"0.82rem",padding:"1.5rem 0"}}>
            Introduz o preço original para ver a estimativa
          </p>
        )}

      </div>
    </>
  );
}
