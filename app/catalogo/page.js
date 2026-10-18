"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import PecaCard from "@/components/PecaCard";

const CATEGORIAS_BD = ["Vestidos", "Casacos", "Conjuntos", "Acessórios", "Corsets", "Tops", "Calças", "Saias"];

// Card inline para peças de lojistas (link diferente)
function PecaCardLojista({ peca, lang }) {
  const disponivel = peca.estado !== "indisponivel";
  const l = { pt:{ alugar:"Alugar" }, fr:{ alugar:"Louer" }, lt:{ alugar:"Nuomoti" } };
  const lbl = (l[lang] || l.pt).alugar;
  const href = `/loja/${peca.lojaCodigo}/peca/${peca.id}`;
  return (
    <div style={{display:"flex",flexDirection:"column",background:"#f8f7f5",position:"relative",borderRadius:"2px",overflow:"hidden"}}>
      <a href={href} style={{textDecoration:"none",color:"inherit",display:"block",position:"relative"}}>
        <div style={{aspectRatio:"3/4",background:"#e8e5e0",overflow:"hidden",position:"relative"}}>
          {peca.fotos && peca.fotos[0] ? (
            <img src={peca.fotos[0]} alt={peca.nome} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",display:"block"}} />
          ) : (
            <div style={{width:"100%",height:"100%",background:"linear-gradient(160deg,#e8e4e0,#d5d0c8)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontFamily:"'Cormorant',serif",fontSize:"2.5rem",fontWeight:300,color:"rgba(0,0,0,0.06)",fontStyle:"italic"}}>NG</span>
            </div>
          )}
          {/* Badge Lojista */}
          <div style={{position:"absolute",top:"0.6rem",right:"0.6rem",fontSize:"0.44rem",letterSpacing:"0.18em",textTransform:"uppercase",background:"#b8964e",color:"#fff",padding:"0.22rem 0.5rem",fontFamily:"'Jost',sans-serif",fontWeight:500,zIndex:2}}>Lojista</div>
        </div>
        <div style={{padding:"0.65rem 0.7rem 0.3rem"}}>
          {peca.categoria && (
            <p style={{fontSize:"0.48rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#b0ada6",fontFamily:"'Jost',sans-serif",marginBottom:"0.15rem"}}>{peca.categoria}</p>
          )}
          <h3 style={{fontFamily:"'Cormorant',Georgia,serif",fontSize:"1rem",fontWeight:300,lineHeight:1.15,marginBottom:"0.15rem",color:"#080808"}}>{peca.nome}</h3>
          {peca.lojistaNome && (
            <p style={{fontSize:"0.46rem",letterSpacing:"0.08em",color:"#b8964e",fontFamily:"'Jost',sans-serif",marginBottom:"0.3rem"}}>{peca.lojistaNome}</p>
          )}
          {peca.tamanhos && peca.tamanhos.length > 0 && (
            <div style={{display:"flex",gap:"0.25rem",flexWrap:"wrap",marginBottom:"0.3rem"}}>
              {peca.tamanhos.slice(0,5).map(t => (
                <span key={t} style={{fontSize:"0.47rem",letterSpacing:"0.06em",border:"1px solid #dedad4",padding:"0.12rem 0.35rem",color:"#6b6960",fontFamily:"'Jost',sans-serif"}}>{t}</span>
              ))}
            </div>
          )}
          <div style={{display:"flex",alignItems:"baseline",gap:"0.3rem",paddingTop:"0.4rem",borderTop:"1px solid #ece9e4"}}>
            <span style={{fontFamily:"'Cormorant',Georgia,serif",fontSize:"1.2rem",fontWeight:300,color:"#080808"}}>{peca.preco_aluguer_dia}€</span>
            <span style={{fontFamily:"'Jost',sans-serif",fontSize:"0.55rem",color:"#b0ada6",fontWeight:300}}>/dia</span>
          </div>
        </div>
      </a>
      {disponivel ? (
        <a href={href} style={{display:"flex",alignItems:"center",justifyContent:"center",margin:"0 0.7rem 0.7rem",padding:"0.72rem",fontSize:"0.58rem",letterSpacing:"0.14em",textTransform:"uppercase",background:"#080808",color:"#f8f7f5",textAlign:"center",textDecoration:"none",fontFamily:"'Jost',sans-serif",fontWeight:400,minHeight:"44px"}}>{lbl}</a>
      ) : (
        <div style={{margin:"0 0.7rem 0.7rem",padding:"0.72rem",fontSize:"0.55rem",letterSpacing:"0.12em",textTransform:"uppercase",border:"1px solid #dedad4",color:"#b0ada6",textAlign:"center",fontFamily:"'Jost',sans-serif",minHeight:"44px",display:"flex",alignItems:"center",justifyContent:"center"}}>Indisponível</div>
      )}
    </div>
  );
}

// Ocasiões — filtro por tag/ocasiao na tabela pecas (coluna: ocasiao TEXT[])
const OCASIOES = {
  pt: [
    { key: "casamento",   label: "💍 Casamento" },
    { key: "gala",        label: "✨ Gala" },
    { key: "cocktail",    label: "🥂 Cocktail" },
    { key: "festa",       label: "🎉 Festa" },
    { key: "trabalho",    label: "💼 Trabalho" },
    { key: "dia",         label: "☀️ Dia a dia" },
    { key: "praia",       label: "🌊 Praia / Verão" },
  ],
  fr: [
    { key: "casamento",   label: "💍 Mariage" },
    { key: "gala",        label: "✨ Gala" },
    { key: "cocktail",    label: "🥂 Cocktail" },
    { key: "festa",       label: "🎉 Fête" },
    { key: "trabalho",    label: "💼 Travail" },
    { key: "dia",         label: "☀️ Quotidien" },
    { key: "praia",       label: "🌊 Plage / Été" },
  ],
  lt: [
    { key: "casamento",   label: "💍 Vestuvės" },
    { key: "gala",        label: "✨ Gala" },
    { key: "cocktail",    label: "🥂 Kokteilis" },
    { key: "festa",       label: "🎉 Šventė" },
    { key: "trabalho",    label: "💼 Darbas" },
    { key: "dia",         label: "☀️ Kasdien" },
    { key: "praia",       label: "🌊 Paplūdimys" },
  ],
};

const translations = {
  pt: {
    titulo: "Catálogo", subtitulo: "Roupa e acessórios para cada momento.", todas: "Todas", todasOcasiao: "Todas as ocasiões",
    semResultados: "Nenhuma peça encontrada.", loading: "A carregar...",
    categorias: ["Vestidos", "Casacos", "Conjuntos", "Acessórios", "Corsets", "Tops", "Calças", "Saias"],
    ordenar: "Ordenar", precoAsc: "Preço: menor primeiro", precoDesc: "Preço: maior primeiro", recentes: "Mais recentes",
    ocasiao: "Para que ocasião?",
    fonte: "Fonte", todasFontes: "Todas", noraGrei: "Nora Grei", lojistas: "Lojistas",
  },
  fr: {
    titulo: "Catalogue", subtitulo: "Vêtements et accessoires pour chaque moment.", todas: "Tout", todasOcasiao: "Toutes les occasions",
    semResultados: "Aucune pièce trouvée.", loading: "Chargement...",
    categorias: ["Robes", "Manteaux", "Ensembles", "Accessoires", "Corsets", "Hauts", "Pantalons", "Jupes"],
    ordenar: "Trier", precoAsc: "Prix: croissant", precoDesc: "Prix: décroissant", recentes: "Plus récents",
    ocasiao: "Pour quelle occasion ?",
    fonte: "Source", todasFontes: "Tout", noraGrei: "Nora Grei", lojistas: "Boutiques",
  },
  lt: {
    titulo: "Katalogas", subtitulo: "Drabužiai ir aksesuarai kiekvienai progai.", todas: "Visi", todasOcasiao: "Visos progos",
    semResultados: "Drabužių nerasta.", loading: "Kraunama...",
    categorias: ["Suknelės", "Paltai", "Komplektai", "Aksesuarai", "Korsetai", "Marškinėliai", "Kelnės", "Sijonai"],
    ordenar: "Rūšiuoti", precoAsc: "Kaina: mažiausia pirma", precoDesc: "Kaina: didžiausia pirma", recentes: "Naujausi",
    ocasiao: "Kokia proga?",
    fonte: "Šaltinis", todasFontes: "Visi", noraGrei: "Nora Grei", lojistas: "Parduotuvės",
  },
};

const pecasExemplo = [
  { id: "1", nome: "Vestido Seda Noite", categoria: "Vestidos", preco_aluguer_dia: 35, estado: "disponivel", tamanhos: ["XS", "S", "M"], fotos: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80"] },
  { id: "2", nome: "Casaco Tweed Dourado", categoria: "Casacos", preco_aluguer_dia: 28, estado: "disponivel", tamanhos: ["S", "M", "L"], fotos: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80"] },
];

export default function Catalogo() {
  const [pecas, setPecas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroOcasiao, setFiltroOcasiao] = useState("todas");
  const [filtroFonte, setFiltroFonte] = useState("todas");
  const [ordenar, setOrdenar] = useState("recentes");
  const [lang, setLang] = useState("pt");

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && translations[saved]) setLang(saved);
    carregarPecas();
  }, []);

  const carregarPecas = async () => {
    setLoading(true);
    try {
      // Peças Nora Grei
      const { data: ngData } = await supabase
        .from("pecas")
        .select("*, categorias(nome), stock_tamanhos(id, tamanho, quantidade_disponivel, quantidade_total)")
        .order("created_at", { ascending: false });

      const { data: alugueresAtivos } = await supabase
        .from("alugueres")
        .select("stock_tamanho_id, data_fim, data_disponivel_novamente, estado")
        .in("estado", ["pendente", "confirmado", "enviado", "ativo", "em_verificacao"]);

      const agora = new Date();
      const formatadas = (ngData || []).map(p => {
        const temStock = p.stock_tamanhos?.some(s => s.quantidade_disponivel > 0);
        const stockIds = p.stock_tamanhos?.map(s => s.id) || [];
        const aluguerEmCurso = (alugueresAtivos || [])
          .filter(a => stockIds.includes(a.stock_tamanho_id))
          .sort((a, b) => new Date(b.data_fim) - new Date(a.data_fim))[0];
        let dataFimFinal = null;
        if (aluguerEmCurso) {
          const dataDisp = aluguerEmCurso.data_disponivel_novamente
            ? new Date(aluguerEmCurso.data_disponivel_novamente)
            : new Date(new Date(aluguerEmCurso.data_fim).getTime() + 3 * 24 * 60 * 60 * 1000);
          if (dataDisp > agora) dataFimFinal = dataDisp.toISOString();
        }
        return {
          ...p,
          _origem: "ng",
          categoria: p.categorias?.nome || "",
          tamanhos: p.stock_tamanhos?.filter(s => s.quantidade_disponivel > 0).map(s => s.tamanho) || [],
          tamanhosSemStock: p.stock_tamanhos?.filter(s => s.quantidade_disponivel === 0).map(s => ({ tamanho: s.tamanho, id: s.id })) || [],
          data_fim: dataFimFinal,
          estado: temStock ? "disponivel" : "indisponivel",
        };
      });

      // Peças lojistas (pecas_lojista) + dados do lojista
      const { data: lojData } = await supabase
        .from("pecas_lojista")
        .select("*, stock_lojista(id, tamanho, quantidade_disponivel), clientes(id, nome, codigo_cliente)")
        .not("nome", "is", null)
        .order("created_at", { ascending: false });

      const formatadasLoj = (lojData || []).map(p => ({
        ...p,
        _origem: "lojista",
        categoria: p.categoria || "",
        tamanhos: (p.stock_lojista || []).filter(s => (s.quantidade_disponivel ?? 1) > 0).map(s => s.tamanho),
        estado: (p.stock_lojista || []).some(s => (s.quantidade_disponivel ?? 1) > 0) ? "disponivel" : "indisponivel",
        lojaCodigo: p.clientes?.codigo_cliente || "",
        lojistaNome: p.clientes?.nome || "",
        lojistaId: p.clientes?.id || "",
        preco_aluguer_dia: p.preco_aluguer_dia || 0,
      }));

      setPecas([...formatadas, ...formatadasLoj]);
    } catch (e) {
      console.error("Erro ao carregar peças:", e);
    }
    setLoading(false);
  };

  const t = translations[lang] || translations.pt;

  // Mapeia índice da categoria traduzida -> valor real em PT na BD
  const categoriaTraduzidaParaBD = (catTraduzida) => {
    const idx = t.categorias.indexOf(catTraduzida);
    return idx >= 0 ? CATEGORIAS_BD[idx] : catTraduzida;
  };

  const pecasFiltradas = pecas
    .filter(p => filtroFonte === "todas" || (filtroFonte === "ng" ? p._origem === "ng" : p._origem === "lojista"))
    .filter(p => filtroCategoria === "todas" || p.categoria === categoriaTraduzidaParaBD(filtroCategoria))
    .filter(p => filtroOcasiao === "todas" || (p.ocasiao && p.ocasiao.includes(filtroOcasiao)))
    .sort((a, b) => {
      if (ordenar === "precoAsc") return (a.preco_aluguer_dia||0) - (b.preco_aluguer_dia||0);
      if (ordenar === "precoDesc") return (b.preco_aluguer_dia||0) - (a.preco_aluguer_dia||0);
      return 0;
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --black: #080808; --white: #f8f7f5; --grey-100: #f0eeeb; --grey-200: #e2dfda; --serif: 'Cormorant', Georgia, serif; --sans: 'Jost', Arial, sans-serif; }
        body { background: var(--white); font-family: var(--sans); -webkit-font-smoothing: antialiased; }
        /* MOBILE FIRST */
        .cat-nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1rem 1rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--grey-200); }
        .cat-nav-logo { font-family:var(--serif); font-size:1.1rem; font-weight:300; letter-spacing:0.25em; text-transform:uppercase; text-decoration:none; color:var(--black); }
        .cat-nav-back { font-size:0.68rem; letter-spacing:0.15em; text-transform:uppercase; color:#3a3835; text-decoration:none; font-weight:400; }
        .cat-header { padding:5rem 1rem 1.5rem; }
        .cat-header-label { font-size:0.65rem; letter-spacing:0.3em; text-transform:uppercase; color:#3a3835; margin-bottom:0.5rem; font-weight:400; }
        .cat-header-title { font-family:var(--serif); font-size:clamp(1.8rem,8vw,3rem); font-weight:300; line-height:1.05; margin-bottom:0.5rem; color:#080808; }
        .cat-ocasiao-wrap { padding:0.75rem 1rem 0; }
        .cat-ocasiao-label { font-size:0.6rem; letter-spacing:0.25em; text-transform:uppercase; color:#888; font-weight:400; margin-bottom:0.5rem; display:block; }
        .cat-ocasiao { display:flex; gap:0.45rem; overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:0.75rem; scrollbar-width:none; }
        .cat-ocasiao::-webkit-scrollbar { display:none; }
        .ocasiao-btn { font-size:0.62rem; letter-spacing:0.05em; padding:0.42rem 0.85rem; border-radius:999px; border:1px solid var(--grey-200); background:var(--white); color:#3a3835; cursor:pointer; font-family:var(--sans); white-space:nowrap; flex-shrink:0; transition:all 0.15s; }
        .ocasiao-btn.active { background:#c4748a; color:#fff; border-color:#c4748a; }
        .cat-filters { padding:0 1rem 1rem; display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; border-bottom:1px solid var(--grey-200); margin-bottom:1rem; overflow-x:auto; -webkit-overflow-scrolling:touch; flex-wrap:nowrap; }
        .filter-btn { font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.5rem 0.9rem; border:1px solid var(--grey-200); background:var(--white); color:#1a1a18; cursor:pointer; font-family:var(--sans); font-weight:400; white-space:nowrap; flex-shrink:0; }
        .filter-btn.active { background:var(--black); color:var(--white); border-color:var(--black); }
        .filter-sep { width:1px; height:16px; background:var(--grey-200); flex-shrink:0; }
        .filter-select { font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; padding:0.5rem 0.7rem; border:1px solid var(--grey-200); background:var(--white); color:#1a1a18; cursor:pointer; font-family:var(--sans); font-weight:400; outline:none; flex-shrink:0; }
        .cat-grid { padding:0 1rem 4rem; display:grid; grid-template-columns:repeat(2,1fr); gap:0.75rem; }
        .cat-empty { padding:4rem 1rem; text-align:center; font-family:var(--serif); font-size:1.3rem; font-weight:300; color:#3a3835; font-style:italic; }
        .cat-loading { padding:4rem; text-align:center; font-size:0.78rem; color:#3a3835; letter-spacing:0.2em; text-transform:uppercase; }
        /* TABLET */
        @media (min-width:600px) {
          .cat-nav { padding:1.1rem 2rem; }
          .cat-header { padding:6rem 2rem 2rem; }
          .cat-ocasiao-wrap { padding:0.75rem 2rem 0; }
          .cat-filters { padding:0 2rem 1.5rem; flex-wrap:wrap; overflow-x:visible; }
          .cat-grid { padding:0 2rem 5rem; grid-template-columns:repeat(2,1fr); gap:1.25rem; }
        }
        /* DESKTOP */
        @media (min-width:960px) {
          .cat-nav { padding:1.25rem 3rem; }
          .cat-header { padding:7rem 3rem 2.5rem; }
          .cat-ocasiao-wrap { padding:0.75rem 3rem 0; }
          .cat-ocasiao { overflow-x:visible; flex-wrap:wrap; }
          .ocasiao-btn { font-size:0.68rem; padding:0.48rem 1rem; }
          .ocasiao-btn:hover:not(.active) { border-color:#c4748a; color:#c4748a; }
          .cat-filters { padding:0 3rem 2rem; }
          .cat-grid { padding:0 3rem 6rem; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
          .filter-btn { font-size:0.72rem; padding:0.6rem 1.1rem; }
          .filter-btn:hover { border-color:var(--black); color:var(--black); }
          .filter-select { font-size:0.72rem; }
        }
        @media (min-width:1280px) {
          .cat-grid { grid-template-columns:repeat(4,1fr); }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap" rel="stylesheet" />

      <nav className="cat-nav">
        <a href="/" className="cat-nav-logo">Nora Grei</a>
        <a href="/" className="cat-nav-back">← Início</a>
      </nav>

      <div className="cat-header">
        <p className="cat-header-label">{t.titulo}</p>
        <h1 className="cat-header-title">{t.subtitulo}</h1>
      </div>

      <div className="cat-ocasiao-wrap">
        <span className="cat-ocasiao-label">{t.ocasiao}</span>
        <div className="cat-ocasiao">
          <button className={`ocasiao-btn${filtroOcasiao === "todas" ? " active" : ""}`} onClick={() => setFiltroOcasiao("todas")}>{t.todasOcasiao}</button>
          {(OCASIOES[lang] || OCASIOES.pt).map(o => (
            <button key={o.key} className={`ocasiao-btn${filtroOcasiao === o.key ? " active" : ""}`} onClick={() => setFiltroOcasiao(o.key)}>{o.label}</button>
          ))}
        </div>
      </div>

      {/* Filtro de fonte (Nora Grei / Lojistas) */}
      <div style={{padding:"0 1rem 0.75rem",display:"flex",gap:"0.4rem",overflowX:"auto",scrollbarWidth:"none"}}>
        {[["todas", t.todasFontes], ["ng", t.noraGrei], ["lojista", t.lojistas]].map(([key, label]) => (
          <button key={key}
            onClick={() => setFiltroFonte(key)}
            style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.38rem 0.8rem",border:`1px solid ${filtroFonte===key?"#080808":"#e2dfda"}`,background:filtroFonte===key?"#080808":"transparent",color:filtroFonte===key?"#f8f7f5":"#5a5855",cursor:"pointer",fontFamily:"'Jost',sans-serif",whiteSpace:"nowrap",flexShrink:0,fontWeight:400}}>
            {label}
          </button>
        ))}
      </div>

      <div className="cat-filters">
        <button className={`filter-btn${filtroCategoria === "todas" ? " active" : ""}`} onClick={() => setFiltroCategoria("todas")}>{t.todas}</button>
        {t.categorias.map(cat => (
          <button key={cat} className={`filter-btn${filtroCategoria === cat ? " active" : ""}`} onClick={() => setFiltroCategoria(cat)}>{cat}</button>
        ))}
        <div className="filter-sep"></div>
        <select className="filter-select" value={ordenar} onChange={e => setOrdenar(e.target.value)}>
          <option value="recentes">{t.recentes}</option>
          <option value="precoAsc">{t.precoAsc}</option>
          <option value="precoDesc">{t.precoDesc}</option>
        </select>
      </div>

      {loading ? (
        <div className="cat-loading">{t.loading}</div>
      ) : pecasFiltradas.length === 0 ? (
        <div className="cat-empty">{t.semResultados}</div>
      ) : (
        <div className="cat-grid">
          {pecasFiltradas.map(peca =>
            peca._origem === "lojista"
              ? <PecaCardLojista key={`loj-${peca.id}`} peca={peca} lang={lang} />
              : <PecaCard key={`ng-${peca.id}`} peca={peca} lang={lang} />
          )}
        </div>
      )}
    </>
  );
}