"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const translations = {
  pt: {
    voltar: "← Catálogo",
    disponivel: "Disponível",
    indisponivel: "Indisponível",
    tamanho: "Tamanho",
    alugar: "Alugar esta peça",
    comprar: "Comprar no site Nora Grei",
    partilhar: "Partilhar",
    deposito: "Depósito de caução",
    higienizacao: "Taxa de higienização",
    dia: "/dia",
    descricao: "Descrição",
    detalhes: "Detalhes",
    colecao: "Ver coleção Nora Grei",
    selecioneTamanho: "Selecione um tamanho para continuar",
    stylistLabel: "✦ Nora Grei Stylist",
    stylistLoading: "A preparar a tua sugestão personalizada...",
  },
  fr: {
    voltar: "← Catalogue",
    disponivel: "Disponible",
    indisponivel: "Indisponible",
    tamanho: "Taille",
    alugar: "Louer cette pièce",
    comprar: "Acheter sur le site Nora Grei",
    partilhar: "Partager",
    deposito: "Dépôt de garantie",
    higienizacao: "Frais de nettoyage",
    dia: "/jour",
    descricao: "Description",
    detalhes: "Détails",
    colecao: "Voir la collection Nora Grei",
    selecioneTamanho: "Sélectionnez une taille pour continuer",
    stylistLabel: "✦ Nora Grei Stylist",
    stylistLoading: "Préparation de votre suggestion personnalisée...",
  },
  lt: {
    voltar: "← Katalogas",
    disponivel: "Prieinama",
    indisponivel: "Neprieinama",
    tamanho: "Dydis",
    alugar: "Išsinuomoti šį drabužį",
    comprar: "Pirkti Nora Grei svetainėje",
    partilhar: "Dalintis",
    deposito: "Užstatas",
    higienizacao: "Valymo mokestis",
    dia: "/dieną",
    descricao: "Aprašymas",
    detalhes: "Detalės",
    colecao: "Žiūrėti Nora Grei kolekciją",
    selecioneTamanho: "Pasirinkite dydį tęsti",
    stylistLabel: "✦ Nora Grei Stylist",
    stylistLoading: "Ruošiamas jūsų asmeninis pasiūlymas...",
  },
};

const pecaExemplo = {
  id: "1",
  nome: "Vestido Seda Noite",
  categoria: "Vestidos",
  descricao: "Um vestido elegante em seda natural, com corte fluido que acompanha o corpo. Ideal para jantares de gala, cerimónias e eventos especiais.",
  preco_aluguer_dia: 35,
  valor_peca: 450,
  estado: "disponivel",
  fotos: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&q=80",
  ],
  stock_tamanhos: [
    { tamanho: "XS", quantidade_disponivel: 1 },
    { tamanho: "S", quantidade_disponivel: 2 },
    { tamanho: "M", quantidade_disponivel: 1 },
    { tamanho: "L", quantidade_disponivel: 0 },
  ],
  material: "100% Seda natural",
  origem: "Portugal",
  codigo_nora_grei: "NG-VSD-001",
};

export default function PecaDetalhe({ params }) {
  const [peca, setPeca] = useState(pecaExemplo);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);
  const [lang, setLang] = useState("pt");
  const [partilharAberto, setPartilharAberto] = useState(false);
  const [aiComment, setAiComment] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved) setLang(saved);
    if (params?.id && params.id !== "1") carregarPeca();
    else gerarComentarioAI(pecaExemplo);
  }, []);

  const carregarPeca = async () => {
    const { data } = await supabase
      .from("pecas")
      .select(`*, stock_tamanhos(tamanho, quantidade_disponivel), categorias(nome)`)
      .eq("id", params.id)
      .single();
    if (data) {
      const p = { ...data, categoria: data.categorias?.nome || "" };
      setPeca(p);
      gerarComentarioAI(p);
    }
  };

  const gerarComentarioAI = async (p) => {
    const cacheKey = `ng_ai_comment_${p.id}_${lang}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) { setAiComment(cached); return; }

    const consultant = localStorage.getItem("ng_consultant_v2");
    const { evento, sexo, idade } = consultant ? JSON.parse(consultant) : {};

    setAiLoading(true);
    try {
      const langNome = { pt: "português europeu", fr: "français", lt: "lietuvių" }[lang] || "português";
      const prompt = `És um stylist de moda de luxo da marca Nora Grei.

Cliente: ${sexo || "não especificado"}, ${idade || "idade não especificada"}.
Evento: ${evento || "não especificado"}.
Peça: "${p.nome}" — ${p.categoria || "roupa"}, ${p.preco_aluguer_dia}€/dia.
${p.descricao ? `Descrição: ${p.descricao}` : ""}

Escreve um comentário de stylist em ${langNome}.
Tom: elegante, pessoal, inspirador. Máximo 2 frases curtas.
Fala diretamente usando "tu" em PT. Sem emoji. Sem aspas.
Responde APENAS com o comentário.`;

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
      const text = data.content?.[0]?.text || "";
      if (text) {
        setAiComment(text);
        localStorage.setItem(cacheKey, text);
      }
    } catch(e) { console.error(e); }
    setAiLoading(false);
  };

  const t = translations[lang] || translations.pt;
  const url = typeof window !== "undefined" ? window.location.href : "";
  const ROSA = "#c4748a";

  const partilharLinks = [
    { nome: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(peca.nome + " — Nora Grei\n" + url)}`, cor: "#25D366" },
    { nome: "Instagram", url: `https://www.instagram.com/`, cor: "#E1306C" },
    { nome: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, cor: "#1877F2" },
    { nome: "X", url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(peca.nome + " — Nora Grei")}`, cor: "#000000" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --black: #080808; --white: #f8f7f5; --grey-100: #f0eeeb;
          --grey-200: #e2dfda; --grey-400: #5a5855; --grey-600: #1a1a18;
          --rosa: #c4748a;
          --serif: 'Cormorant', Georgia, serif; --sans: 'Jost', Arial, sans-serif;
        }
        body { background: var(--white); font-family: var(--sans); font-weight: 400; font-size: 17px; -webkit-font-smoothing: antialiased; }

        .pd-nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.25rem 4rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--grey-200); }
        .pd-nav-logo { font-family:var(--serif); font-size:1.2rem; font-weight:400; letter-spacing:0.25em; text-transform:uppercase; text-decoration:none; color:var(--black); }
        .pd-nav-back { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-400); text-decoration:none; font-weight:400; transition:color 0.2s; }
        .pd-nav-back:hover { color:var(--black); }

        .pd-page { padding-top:80px; display:grid; grid-template-columns:55% 45%; min-height:100vh; }

        .pd-galeria { position:sticky; top:80px; height:calc(100vh - 80px); display:flex; flex-direction:column; }
        .pd-foto-principal { flex:1; overflow:hidden; background:var(--grey-100); position:relative; }
        .pd-foto-principal img { width:100%; height:100%; object-fit:cover; object-position:center top; }
        .pd-fotos-thumb { display:flex; gap:0.5rem; padding:0.75rem; background:var(--white); border-top:1px solid var(--grey-200); }
        .pd-thumb { width:64px; height:80px; object-fit:cover; object-position:center top; cursor:pointer; opacity:0.5; transition:opacity 0.2s; border:1px solid transparent; }
        .pd-thumb.active { opacity:1; border-color:var(--black); }

        .pd-info { padding:4rem; display:flex; flex-direction:column; gap:1.5rem; overflow-y:auto; }
        .pd-categoria { font-size:0.68rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--grey-400); font-weight:400; }
        .pd-nome { font-family:var(--serif); font-size:clamp(2rem,3vw,3rem); font-weight:300; line-height:1.05; color:var(--black); }
        .pd-preco-wrap { display:flex; align-items:baseline; gap:0.5rem; }
        .pd-preco { font-family:var(--serif); font-size:2.5rem; font-weight:300; color:var(--black); }
        .pd-preco-dia { font-size:0.82rem; color:var(--grey-400); letter-spacing:0.1em; font-weight:400; }
        .pd-estado { display:inline-flex; align-items:center; gap:0.4rem; font-size:0.68rem; letter-spacing:0.2em; text-transform:uppercase; font-weight:500; color:var(--grey-600); }
        .pd-estado-dot { width:6px; height:6px; border-radius:50%; background:#27ae60; }
        .pd-estado-dot.indisponivel { background:#e74c3c; }

        .pd-divider { height:1px; background:var(--grey-200); }

        .pd-tamanhos-label { font-size:0.72rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--grey-600); margin-bottom:0.75rem; font-weight:500; }
        .pd-tamanhos { display:flex; gap:0.5rem; flex-wrap:wrap; }
        .pd-tamanho-btn { width:52px; height:52px; display:flex; align-items:center; justify-content:center; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.82rem; letter-spacing:0.1em; cursor:pointer; font-family:var(--sans); font-weight:400; transition:all 0.2s; color:var(--black); }
        .pd-tamanho-btn:hover:not(.esgotado) { border-color:var(--black); }
        .pd-tamanho-btn.selected { background:var(--black); color:var(--white); border-color:var(--black); }
        .pd-tamanho-btn.esgotado { color:var(--grey-200); cursor:not-allowed; text-decoration:line-through; }

        /* AI STYLIST */
        .pd-ai { background:var(--grey-100); padding:1.25rem 1.5rem; border-left:3px solid var(--rosa); }
        .pd-ai-label { font-size:0.62rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--rosa); font-family:var(--sans); font-weight:500; margin-bottom:0.6rem; }
        .pd-ai-text { font-family:var(--serif); font-size:1.2rem; font-style:italic; color:var(--grey-600); line-height:1.7; font-weight:300; }
        .pd-ai-loading { font-family:var(--serif); font-size:1rem; font-style:italic; color:var(--grey-200); }

        .pd-custos { background:var(--grey-100); padding:1rem 1.25rem; display:flex; flex-direction:column; gap:0.5rem; }
        .pd-custo { display:flex; justify-content:space-between; font-size:0.92rem; font-weight:400; }
        .pd-custo-key { color:var(--grey-600); }
        .pd-custo-val { color:var(--black); font-weight:500; }

        .pd-btn-alugar { display:block; width:100%; padding:1.1rem; background:var(--black); color:var(--white); border:none; font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase; font-family:var(--sans); font-weight:500; cursor:pointer; transition:background 0.2s; text-align:center; text-decoration:none; }
        .pd-btn-alugar:hover { background:#2a2926; }
        .pd-btn-alugar.disabled { background:var(--grey-200); color:var(--grey-400); cursor:not-allowed; }

        .pd-btn-comprar { display:block; width:100%; padding:1rem; background:var(--white); color:var(--black); border:1.5px solid var(--black); font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase; font-family:var(--sans); font-weight:400; cursor:pointer; transition:all 0.2s; text-align:center; text-decoration:none; }
        .pd-btn-comprar:hover { background:var(--grey-100); }

        .pd-descricao-titulo { font-size:0.72rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--grey-400); margin-bottom:0.75rem; font-weight:500; }
        .pd-descricao { font-size:1rem; color:var(--grey-600); line-height:1.9; font-weight:400; }

        .pd-detalhes { display:flex; flex-direction:column; gap:0; }
        .pd-detalhe { display:flex; justify-content:space-between; font-size:0.9rem; padding:0.75rem 0; border-bottom:1px solid var(--grey-100); }
        .pd-detalhe-key { color:var(--grey-400); font-weight:400; }
        .pd-detalhe-val { color:var(--black); font-weight:400; }

        .pd-partilhar-wrap { position:relative; }
        .pd-btn-partilhar { display:flex; align-items:center; gap:0.5rem; font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-400); background:none; border:none; cursor:pointer; font-family:var(--sans); font-weight:400; transition:color 0.2s; padding:0; }
        .pd-btn-partilhar:hover { color:var(--black); }
        .pd-partilhar-menu { position:absolute; bottom:calc(100% + 0.5rem); left:0; background:var(--white); border:1px solid var(--grey-200); padding:0.5rem; display:flex; flex-direction:column; gap:0.25rem; min-width:160px; box-shadow:0 8px 24px rgba(0,0,0,0.08); z-index:10; }
        .pd-partilhar-item { display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; font-size:0.85rem; text-decoration:none; color:var(--black); transition:background 0.15s; font-weight:400; }
        .pd-partilhar-item:hover { background:var(--grey-100); }
        .pd-partilhar-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

        .pd-colecao { display:flex; align-items:center; gap:0.5rem; font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-400); text-decoration:none; transition:color 0.2s; font-weight:400; }
        .pd-colecao:hover { color:var(--black); }

        @media (max-width:900px) {
          .pd-nav { padding:1rem 1.5rem; }
          .pd-page { grid-template-columns:1fr; padding-bottom:100px; }
          .pd-galeria { position:static; height:auto; }
          .pd-foto-principal { height:75vw; }
          .pd-info { padding:1.5rem; gap:1.25rem; }
          .pd-nome { font-size:1.8rem; }
          .pd-preco { font-size:2rem; }
          .pd-tamanho-btn { width:56px; height:56px; font-size:0.9rem; }
          .pd-btn-alugar, .pd-btn-comprar { font-size:0.82rem; padding:1.15rem; }
          .pd-descricao { font-size:1.05rem; }
          .pd-detalhe { font-size:0.95rem; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />

      <nav className="pd-nav">
        <a href="/" className="pd-nav-logo">Nora Grei</a>
        <a href="/catalogo" className="pd-nav-back">{t.voltar}</a>
      </nav>

      <div className="pd-page">
        {/* GALERIA */}
        <div className="pd-galeria">
          <div className="pd-foto-principal">
            {peca.fotos && peca.fotos[fotoAtiva] ? (
              <img src={peca.fotos[fotoAtiva]} alt={peca.nome} />
            ) : (
              <div style={{width:'100%',height:'100%',background:'linear-gradient(160deg,#e8e4e0,#d5d0c8)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontFamily:"'Cormorant',serif",fontSize:'5rem',fontWeight:300,color:'rgba(0,0,0,0.08)',fontStyle:'italic'}}>NG</span>
              </div>
            )}
          </div>
          {peca.fotos && peca.fotos.length > 1 && (
            <div className="pd-fotos-thumb">
              {peca.fotos.map((foto, i) => (
                <img key={i} src={foto} alt={`${peca.nome} ${i+1}`} className={`pd-thumb${fotoAtiva === i ? ' active' : ''}`} onClick={() => setFotoAtiva(i)} />
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="pd-info">
          <div>
            {peca.categoria && <p className="pd-categoria">{peca.categoria}</p>}
            <h1 className="pd-nome">{peca.nome}</h1>
          </div>

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div className="pd-preco-wrap">
              <span className="pd-preco">{peca.preco_aluguer_dia}€</span>
              <span className="pd-preco-dia">{t.dia}</span>
            </div>
            <div className="pd-estado">
              <div className={`pd-estado-dot${peca.estado !== 'disponivel' ? ' indisponivel' : ''}`}></div>
              {peca.estado === 'disponivel' ? t.disponivel : t.indisponivel}
            </div>
          </div>

          <div className="pd-divider"></div>

          {/* AI STYLIST COMMENT */}
          {(aiLoading || aiComment) && (
            <div className="pd-ai">
              <p className="pd-ai-label">{t.stylistLabel}</p>
              {aiLoading ? (
                <p className="pd-ai-loading">{t.stylistLoading}</p>
              ) : (
                <p className="pd-ai-text">{aiComment}</p>
              )}
            </div>
          )}

          {/* TAMANHOS */}
          <div>
            <p className="pd-tamanhos-label">{t.tamanho}</p>
            <div className="pd-tamanhos">
              {(peca.stock_tamanhos || []).map(s => (
                <button
                  key={s.tamanho}
                  className={`pd-tamanho-btn${s.quantidade_disponivel === 0 ? ' esgotado' : ''}${tamanhoSelecionado === s.tamanho ? ' selected' : ''}`}
                  onClick={() => s.quantidade_disponivel > 0 && setTamanhoSelecionado(s.tamanho)}
                  disabled={s.quantidade_disponivel === 0}
                >
                  {s.tamanho}
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOS */}
          <div className="pd-custos">
            <div className="pd-custo">
              <span className="pd-custo-key">{t.deposito}</span>
              <span className="pd-custo-val">{peca.valor_peca}€</span>
            </div>
            <div className="pd-custo">
              <span className="pd-custo-key">{t.higienizacao}</span>
              <span className="pd-custo-val">9€</span>
            </div>
          </div>

          {/* BOTÕES */}
          <a
            href={peca.estado === 'disponivel' && tamanhoSelecionado ? `/checkout?peca=${peca.id}&tamanho=${tamanhoSelecionado}&stock_id=${peca.stock_tamanhos?.find(s => s.tamanho === tamanhoSelecionado)?.id || ''}` : '#'}
            className={`pd-btn-alugar${!tamanhoSelecionado || peca.estado !== 'disponivel' ? ' disabled' : ''}`}
            onClick={e => { if (!tamanhoSelecionado) { e.preventDefault(); alert(t.selecioneTamanho); } }}
          >
            {t.alugar}
          </a>

          <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" className="pd-btn-comprar">
            {t.comprar} ↗
          </a>

          <div className="pd-divider"></div>

          {/* DESCRIÇÃO */}
          {peca.descricao && (
            <div>
              <p className="pd-descricao-titulo">{t.descricao}</p>
              <p className="pd-descricao">{peca.descricao}</p>
            </div>
          )}

          {/* DETALHES */}
          <div>
            <p className="pd-descricao-titulo">{t.detalhes}</p>
            <div className="pd-detalhes">
              {peca.material && <div className="pd-detalhe"><span className="pd-detalhe-key">Material</span><span className="pd-detalhe-val">{peca.material}</span></div>}
              {peca.origem && <div className="pd-detalhe"><span className="pd-detalhe-key">Origem</span><span className="pd-detalhe-val">{peca.origem}</span></div>}
              {peca.codigo_nora_grei && <div className="pd-detalhe"><span className="pd-detalhe-key">Referência</span><span className="pd-detalhe-val">{peca.codigo_nora_grei}</span></div>}
            </div>
          </div>

          <div className="pd-divider"></div>

          {/* PARTILHAR + COLEÇÃO */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div className="pd-partilhar-wrap">
              <button className="pd-btn-partilhar" onClick={() => setPartilharAberto(!partilharAberto)}>
                ↗ {t.partilhar}
              </button>
              {partilharAberto && (
                <div className="pd-partilhar-menu">
                  {partilharLinks.map(pl => (
                    <a key={pl.nome} href={pl.url} target="_blank" rel="noopener noreferrer" className="pd-partilhar-item">
                      <div className="pd-partilhar-dot" style={{background:pl.cor}}></div>
                      {pl.nome}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" className="pd-colecao">
              {t.colecao} ↗
            </a>
          </div>
        </div>
      </div>
    </>
  );
}