"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Analytics() {
  const [dados, setDados] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [periodo, setPeriodo] = useState("30");

  useEffect(() => { carregarDados(); }, [periodo]);

  const carregarDados = async () => {
    setLoading(true);
    const desde = new Date();
    desde.setDate(desde.getDate() - parseInt(periodo));

    const { data } = await supabase
      .from("analytics_alugueres")
      .select("*")
      .gte("created_at", desde.toISOString());

    const { data: camp } = await supabase
      .from("campanha_stats")
      .select("*");

    if (data) setDados(data);
    if (camp) setCampanhas(camp);
    setLoading(false);
  };

  const gerarInsight = async () => {
    setAiLoading(true);
    setAiInsight("");

    const resumo = {
      total_alugueres: dados.length,
      receita_total: dados.reduce((s, d) => s + (d.valor_aluguer || 0), 0),
      pecas_mais_alugadas: Object.entries(
        dados.reduce((acc, d) => { acc[d.peca_nome] = (acc[d.peca_nome] || 0) + 1; return acc; }, {})
      ).sort((a, b) => b[1] - a[1]).slice(0, 5),
      cidades: Object.entries(
        dados.reduce((acc, d) => { if (d.cidade) acc[d.cidade] = (acc[d.cidade] || 0) + 1; return acc; }, {})
      ).sort((a, b) => b[1] - a[1]).slice(0, 5),
      generos: Object.entries(
        dados.reduce((acc, d) => { if (d.genero) acc[d.genero] = (acc[d.genero] || 0) + 1; return acc; }, {})
      ),
      eventos: Object.entries(
        dados.reduce((acc, d) => { if (d.evento) acc[d.evento] = (acc[d.evento] || 0) + 1; return acc; }, {})
      ).sort((a, b) => b[1] - a[1]).slice(0, 5),
      idades: dados.filter(d => d.idade).map(d => d.idade),
      campanhas_stats: campanhas.map(c => ({ titulo: c.titulo, impressoes: c.impressoes, cliques: c.cliques, copias: c.copias, taxa: c.taxa_clique })),
    };

    const prompt = `És um consultor de negócios especialista em moda e aluguer de roupa premium para a marca Nora Grei.

Analisa estes dados dos últimos ${periodo} dias:

${JSON.stringify(resumo, null, 2)}

Com base nestes dados, fornece:
1. **3 insights principais** sobre o negócio
2. **2 alertas** sobre problemas ou oportunidades que precisam atenção imediata  
3. **3 recomendações concretas** para aumentar receita e eliminar produtos que não vendem

Sê direto, específico e acionável. Usa dados concretos. Máximo 400 palavras.
Responde em português europeu, formatado com secções claras.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      setAiInsight(data.content?.[0]?.text || "");
    } catch(e) { console.error(e); }
    setAiLoading(false);
  };

  // CÁLCULOS
  const receita = dados.reduce((s, d) => s + (d.valor_aluguer || 0), 0);
  
  const porPeca = Object.entries(
    dados.reduce((acc, d) => {
      if (!d.peca_nome) return acc;
      if (!acc[d.peca_nome]) acc[d.peca_nome] = { count: 0, receita: 0, categoria: d.categoria };
      acc[d.peca_nome].count++;
      acc[d.peca_nome].receita += d.valor_aluguer || 0;
      return acc;
    }, {})
  ).sort((a, b) => b[1].count - a[1].count);

  const porCidade = Object.entries(
    dados.reduce((acc, d) => {
      const c = d.cidade || "Desconhecida";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const porGenero = Object.entries(
    dados.reduce((acc, d) => {
      if (d.genero) acc[d.genero] = (acc[d.genero] || 0) + 1;
      return acc;
    }, {})
  );

  const porEvento = Object.entries(
    dados.reduce((acc, d) => {
      if (d.evento) acc[d.evento] = (acc[d.evento] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const porIdade = dados.filter(d => d.idade).reduce((acc, d) => {
    const grupo = d.idade < 25 ? "18-24" : d.idade < 35 ? "25-34" : d.idade < 45 ? "35-44" : "45+";
    acc[grupo] = (acc[grupo] || 0) + 1;
    return acc;
  }, {});

  const maxCidade = Math.max(...porCidade.map(([,v]) => v), 1);
  const maxPeca = Math.max(...porPeca.map(([,v]) => v.count), 1);
  const maxEvento = Math.max(...porEvento.map(([,v]) => v), 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300&family=Jost:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --black:#080808; --white:#f8f7f5; --grey-100:#f0eeeb; --grey-200:#e2dfda; --grey-600:#1a1a18; --rosa:#c4748a; --sans:'Jost',Arial,sans-serif; --serif:'Cormorant',Georgia,serif; }
        body { background:var(--grey-100); font-family:var(--sans); font-size:15px; color:var(--black); -webkit-font-smoothing:antialiased; }
        .an-page { padding:2rem; max-width:1200px; margin:0 auto; }
        .an-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:2rem; flex-wrap:wrap; gap:1rem; }
        .an-titulo { font-family:var(--serif); font-size:2rem; font-weight:300; color:var(--black); }
        .an-periodo { display:flex; gap:0.5rem; }
        .an-periodo-btn { font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.5rem 1rem; border:1px solid var(--grey-200); background:var(--white); color:var(--grey-600); cursor:pointer; font-family:var(--sans); font-weight:400; transition:all 0.2s; }
        .an-periodo-btn.active { background:var(--black); color:var(--white); border-color:var(--black); }
        .an-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:2rem; }
        .an-stat { background:var(--white); padding:1.5rem; }
        .an-stat-val { font-family:var(--serif); font-size:2.5rem; font-weight:300; color:var(--black); line-height:1; margin-bottom:0.4rem; }
        .an-stat-label { font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; color:#5a5855; font-weight:400; }
        .an-stat.destaque .an-stat-val { color:var(--rosa); }
        .an-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; }
        .an-grid-3 { grid-template-columns:1fr 1fr 1fr; }
        .an-card { background:var(--white); padding:1.5rem; }
        .an-card-title { font-size:0.65rem; letter-spacing:0.25em; text-transform:uppercase; color:#5a5855; font-weight:500; margin-bottom:1.25rem; padding-bottom:0.75rem; border-bottom:1px solid var(--grey-100); display:flex; justify-content:space-between; }
        .an-bar-item { margin-bottom:0.75rem; }
        .an-bar-label { display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:0.3rem; color:var(--black); }
        .an-bar-label span { color:#5a5855; font-size:0.75rem; }
        .an-bar-bg { height:6px; background:var(--grey-100); border-radius:3px; overflow:hidden; }
        .an-bar-fill { height:100%; background:var(--black); border-radius:3px; transition:width 0.5s ease; }
        .an-bar-fill.rosa { background:var(--rosa); }
        .an-peca-row { display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid var(--grey-100); }
        .an-peca-row:last-child { border-bottom:none; }
        .an-peca-nome { font-size:0.9rem; color:var(--black); font-weight:400; }
        .an-peca-cat { font-size:0.7rem; color:#5a5855; }
        .an-peca-stats { display:flex; gap:1.5rem; text-align:right; }
        .an-peca-stat { font-size:0.82rem; }
        .an-peca-stat span { display:block; font-size:0.6rem; color:#5a5855; letter-spacing:0.1em; text-transform:uppercase; }
        .an-badge { font-size:0.58rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.2rem 0.5rem; font-weight:500; }
        .an-badge-verde { background:#e8f5e9; color:#27ae60; }
        .an-badge-laranja { background:#fff8e1; color:#f39c12; }
        .an-badge-rosa { background:#fff0f3; color:var(--rosa); }
        .an-camp-row { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr; gap:1rem; padding:0.75rem 0; border-bottom:1px solid var(--grey-100); align-items:center; font-size:0.82rem; }
        .an-camp-header { font-size:0.6rem; letter-spacing:0.15em; text-transform:uppercase; color:#5a5855; font-weight:500; }

        /* AI CONSULTING */
        .an-ai { background:var(--black); color:var(--white); padding:2rem; margin-bottom:1rem; }
        .an-ai-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; }
        .an-ai-titulo { font-family:var(--serif); font-size:1.4rem; font-weight:300; color:var(--white); }
        .an-ai-sub { font-size:0.68rem; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-top:0.25rem; }
        .an-ai-btn { font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; background:var(--rosa); color:var(--white); border:none; padding:0.75rem 1.5rem; cursor:pointer; font-family:var(--sans); font-weight:500; transition:background 0.2s; white-space:nowrap; }
        .an-ai-btn:hover { background:#a85c72; }
        .an-ai-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .an-ai-content { font-size:0.92rem; color:rgba(255,255,255,0.8); line-height:1.8; white-space:pre-wrap; font-family:var(--sans); }
        .an-ai-placeholder { font-family:var(--serif); font-size:1rem; font-style:italic; color:rgba(255,255,255,0.3); }
        .an-ai-loading { display:flex; gap:0.5rem; align-items:center; color:rgba(255,255,255,0.5); font-size:0.82rem; }
        .an-dot { width:6px; height:6px; border-radius:50%; background:var(--rosa); animation:pulse 1.2s infinite; }
        .an-dot:nth-child(2) { animation-delay:0.2s; }
        .an-dot:nth-child(3) { animation-delay:0.4s; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }

        .an-empty { padding:2rem; text-align:center; color:#5a5855; font-size:0.9rem; }
        .an-voltar { display:inline-flex; align-items:center; gap:0.5rem; font-size:0.68rem; letter-spacing:0.15em; text-transform:uppercase; color:#5a5855; text-decoration:none; margin-bottom:1.5rem; font-weight:400; transition:color 0.2s; }
        .an-voltar:hover { color:var(--black); }

        @media (max-width:768px) {
          .an-stats { grid-template-columns:repeat(2,1fr); }
          .an-grid { grid-template-columns:1fr; }
          .an-grid-3 { grid-template-columns:1fr; }
          .an-camp-row { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      <div className="an-page">
        <a href="/admin" className="an-voltar">← Admin</a>

        <div className="an-header">
          <div>
            <h1 className="an-titulo">Estatísticas & Analytics</h1>
            <p style={{fontSize:'0.82rem',color:'#5a5855',marginTop:'0.25rem'}}>{dados.length} alugueres nos últimos {periodo} dias</p>
          </div>
          <div className="an-periodo">
            {["7","30","90","365"].map(p => (
              <button key={p} className={`an-periodo-btn${periodo===p?" active":""}`} onClick={() => setPeriodo(p)}>
                {p === "365" ? "1 ano" : `${p} dias`}
              </button>
            ))}
          </div>
        </div>

        {/* STATS TOPO */}
        <div className="an-stats">
          <div className="an-stat destaque">
            <div className="an-stat-val">{dados.length}</div>
            <div className="an-stat-label">Total alugueres</div>
          </div>
          <div className="an-stat">
            <div className="an-stat-val">{receita.toFixed(0)}€</div>
            <div className="an-stat-label">Receita total</div>
          </div>
          <div className="an-stat">
            <div className="an-stat-val">{dados.length > 0 ? (receita / dados.length).toFixed(0) : 0}€</div>
            <div className="an-stat-label">Ticket médio</div>
          </div>
          <div className="an-stat">
            <div className="an-stat-val">{new Set(dados.map(d => d.cidade).filter(Boolean)).size}</div>
            <div className="an-stat-label">Cidades diferentes</div>
          </div>
        </div>

        {/* AI CONSULTING */}
        <div className="an-ai">
          <div className="an-ai-header">
            <div>
              <div className="an-ai-titulo">✦ Nora Grei AI Consulting</div>
              <div className="an-ai-sub">Análise inteligente dos teus dados de negócio</div>
            </div>
            <button className="an-ai-btn" onClick={gerarInsight} disabled={aiLoading || dados.length === 0}>
              {aiLoading ? "A analisar..." : "Gerar análise"}
            </button>
          </div>
          {aiLoading ? (
            <div className="an-ai-loading">
              <div className="an-dot"></div>
              <div className="an-dot"></div>
              <div className="an-dot"></div>
              <span>A analisar os teus dados...</span>
            </div>
          ) : aiInsight ? (
            <div className="an-ai-content">{aiInsight}</div>
          ) : (
            <p className="an-ai-placeholder">Clica em "Gerar análise" para receber insights personalizados sobre o teu negócio.</p>
          )}
        </div>

        {/* PEÇAS + CIDADES */}
        <div className="an-grid">
          {/* PEÇAS MAIS ALUGADAS */}
          <div className="an-card">
            <p className="an-card-title">
              <span>Peças mais alugadas</span>
              <span style={{fontSize:'0.72rem',color:'#5a5855'}}>Top {Math.min(porPeca.length, 8)}</span>
            </p>
            {porPeca.length === 0 ? <p className="an-empty">Sem dados</p> : (
              porPeca.slice(0,8).map(([nome, stats]) => (
                <div key={nome} className="an-peca-row">
                  <div>
                    <div className="an-peca-nome">{nome}</div>
                    <div className="an-peca-cat">{stats.categoria}</div>
                  </div>
                  <div className="an-peca-stats">
                    <div className="an-peca-stat">
                      {stats.count}
                      <span>alugueres</span>
                    </div>
                    <div className="an-peca-stat">
                      {stats.receita.toFixed(0)}€
                      <span>receita</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CIDADES */}
          <div className="an-card">
            <p className="an-card-title">Alugueres por cidade</p>
            {porCidade.length === 0 ? <p className="an-empty">Sem dados de localização</p> : (
              porCidade.map(([cidade, count]) => (
                <div key={cidade} className="an-bar-item">
                  <div className="an-bar-label">
                    <span>{cidade}</span>
                    <span>{count} ({Math.round(count/dados.length*100)}%)</span>
                  </div>
                  <div className="an-bar-bg">
                    <div className="an-bar-fill" style={{width:`${count/maxCidade*100}%`}}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* GÉNERO + EVENTOS + IDADES */}
        <div className="an-grid an-grid-3">
          {/* GÉNERO */}
          <div className="an-card">
            <p className="an-card-title">Por género</p>
            {porGenero.length === 0 ? <p className="an-empty">Sem dados</p> : (
              porGenero.map(([genero, count]) => (
                <div key={genero} className="an-bar-item">
                  <div className="an-bar-label">
                    <span>{genero}</span>
                    <span>{count} ({Math.round(count/dados.length*100)}%)</span>
                  </div>
                  <div className="an-bar-bg">
                    <div className="an-bar-fill rosa" style={{width:`${count/Math.max(...porGenero.map(([,v])=>v))*100}%`}}></div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* EVENTOS */}
          <div className="an-card">
            <p className="an-card-title">Tipo de evento</p>
            {porEvento.length === 0 ? <p className="an-empty">Sem dados de evento</p> : (
              porEvento.slice(0,6).map(([evento, count]) => (
                <div key={evento} className="an-bar-item">
                  <div className="an-bar-label">
                    <span>{evento}</span>
                    <span>{count}</span>
                  </div>
                  <div className="an-bar-bg">
                    <div className="an-bar-fill" style={{width:`${count/maxEvento*100}%`}}></div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* IDADES */}
          <div className="an-card">
            <p className="an-card-title">Faixa etária</p>
            {Object.keys(porIdade).length === 0 ? <p className="an-empty">Sem dados de idade</p> : (
              Object.entries(porIdade).sort().map(([grupo, count]) => (
                <div key={grupo} className="an-bar-item">
                  <div className="an-bar-label">
                    <span>{grupo} anos</span>
                    <span>{count} ({Math.round(count/dados.filter(d=>d.idade).length*100)}%)</span>
                  </div>
                  <div className="an-bar-bg">
                    <div className="an-bar-fill rosa" style={{width:`${count/Math.max(...Object.values(porIdade))*100}%`}}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CAMPANHAS */}
        <div className="an-card" style={{marginTop:'1rem'}}>
          <p className="an-card-title">Performance de campanhas</p>
          {campanhas.length === 0 ? <p className="an-empty">Sem campanhas criadas</p> : (
            <>
              <div className="an-camp-row an-camp-header">
                <span>Campanha</span>
                <span>Impressões</span>
                <span>Cliques</span>
                <span>Cópias</span>
                <span>Taxa clique</span>
              </div>
              {campanhas.map(c => (
                <div key={c.id} className="an-camp-row">
                  <div>
                    <div style={{fontWeight:500}}>{c.titulo}</div>
                    <span className={`an-badge ${c.tipo === 'cupao' ? 'an-badge-rosa' : c.tipo === 'novidade' ? 'an-badge-verde' : 'an-badge-laranja'}`}>{c.tipo}</span>
                  </div>
                  <span>{c.impressoes || 0}</span>
                  <span>{c.cliques || 0}</span>
                  <span>{c.copias || 0}</span>
                  <span style={{fontWeight:500,color: c.taxa_clique > 20 ? '#27ae60' : c.taxa_clique > 10 ? '#f39c12' : '#e74c3c'}}>
                    {c.taxa_clique || 0}%
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}