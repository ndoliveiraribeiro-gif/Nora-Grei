"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import PecaCard from "@/components/PecaCard";

const CATEGORIAS_BD = ["Vestidos", "Casacos", "Conjuntos", "Acessórios", "Corsets", "Tops", "Calças", "Saias", "Relógios"];

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
          <div style={{position:"absolute",top:"0.6rem",right:"0.6rem",fontSize:"0.55rem",letterSpacing:"0.18em",textTransform:"uppercase",background:"#b8964e",color:"#fff",padding:"0.25rem 0.55rem",fontFamily:"'Jost',sans-serif",fontWeight:500,zIndex:2}}>Lojista</div>
        </div>
        <div style={{padding:"0.7rem 0.75rem 0.4rem"}}>
          {peca.categoria && (
            <p style={{fontSize:"0.62rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"#8a8783",fontFamily:"'Jost',sans-serif",marginBottom:"0.18rem",fontWeight:400}}>{peca.categoria}</p>
          )}
          <h3 style={{fontFamily:"'Jost',sans-serif",fontSize:"0.92rem",fontWeight:500,lineHeight:1.25,marginBottom:"0.2rem",color:"#111",letterSpacing:"0.01em"}}>{peca.nome}</h3>
          {peca.lojistaNome && (
            <p style={{fontSize:"0.65rem",letterSpacing:"0.04em",color:"#b8964e",fontFamily:"'Jost',sans-serif",marginBottom:"0.3rem",fontWeight:500}}>{peca.lojistaNome}</p>
          )}
          {peca.tamanhos && peca.tamanhos.length > 0 && (
            <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap",marginBottom:"0.4rem"}}>
              {peca.tamanhos.slice(0,5).map(t => (
                <span key={t} style={{fontSize:"0.65rem",letterSpacing:"0.03em",border:"1px solid #d0cdc8",padding:"0.16rem 0.45rem",color:"#4a4845",fontFamily:"'Jost',sans-serif",fontWeight:400,background:"#f2f0ed"}}>{t}</span>
              ))}
            </div>
          )}
          <div style={{display:"flex",alignItems:"baseline",gap:"0.25rem",paddingTop:"0.4rem",borderTop:"1px solid #e8e5e0"}}>
            <span style={{fontFamily:"'Jost',sans-serif",fontSize:"1.15rem",fontWeight:600,color:"#111"}}>{peca.preco_aluguer_dia}€</span>
            <span style={{fontFamily:"'Jost',sans-serif",fontSize:"0.72rem",color:"#8a8783",fontWeight:400}}>/dia</span>
          </div>
        </div>
      </a>
      {disponivel ? (
        <a href={href} style={{display:"flex",alignItems:"center",justifyContent:"center",margin:"0 0.75rem 0.75rem",padding:"0.8rem",fontSize:"0.78rem",letterSpacing:"0.1em",textTransform:"uppercase",background:"#080808",color:"#f8f7f5",textAlign:"center",textDecoration:"none",fontFamily:"'Jost',sans-serif",fontWeight:500,minHeight:"46px"}}>{lbl}</a>
      ) : (
        <div style={{margin:"0 0.75rem 0.75rem",padding:"0.8rem",fontSize:"0.75rem",letterSpacing:"0.08em",textTransform:"uppercase",border:"1.5px solid #ccc9c4",color:"#4a4845",textAlign:"center",fontFamily:"'Jost',sans-serif",minHeight:"46px",display:"flex",alignItems:"center",justifyContent:"center"}}>Indisponível</div>
      )}
    </div>
  );
}

// Ocasiões — filtro por tag/ocasiao na tabela pecas (coluna: ocasiao TEXT[])
const OCASIOES = {
  pt: [
    { key: "casamento",   label: "Casamento" },
    { key: "gala",        label: "Gala" },
    { key: "cocktail",    label: "Cocktail" },
    { key: "festa",       label: "Festa" },
    { key: "trabalho",    label: "Trabalho" },
    { key: "dia",         label: "Dia a dia" },
    { key: "praia",       label: "Praia / Verão" },
  ],
  fr: [
    { key: "casamento",   label: "Mariage" },
    { key: "gala",        label: "Gala" },
    { key: "cocktail",    label: "Cocktail" },
    { key: "festa",       label: "Fête" },
    { key: "trabalho",    label: "Travail" },
    { key: "dia",         label: "Quotidien" },
    { key: "praia",       label: "Plage / Été" },
  ],
  lt: [
    { key: "casamento",   label: "Vestuvės" },
    { key: "gala",        label: "Gala" },
    { key: "cocktail",    label: "Kokteilis" },
    { key: "festa",       label: "Šventė" },
    { key: "trabalho",    label: "Darbas" },
    { key: "dia",         label: "Kasdien" },
    { key: "praia",       label: "Paplūdimys" },
  ],
};

const translations = {
  pt: {
    titulo: "Catálogo", subtitulo: "Roupa e acessórios para cada momento.", todas: "Todas", todasOcasiao: "Todas as ocasiões",
    semResultados: "Nenhuma peça encontrada.", loading: "A carregar...",
    categorias: ["Vestidos", "Casacos", "Conjuntos", "Acessórios", "Corsets", "Tops", "Calças", "Saias", "Relógios"],
    ordenar: "Ordenar", precoAsc: "Preço: menor primeiro", precoDesc: "Preço: maior primeiro", recentes: "Mais recentes",
    ocasiao: "Ocasião",
    fonte: "Fonte", todasFontes: "Todas", noraGrei: "Nora Grei", lojistas: "Lojistas",
  },
  fr: {
    titulo: "Catalogue", subtitulo: "Vêtements et accessoires pour chaque moment.", todas: "Tout", todasOcasiao: "Toutes",
    semResultados: "Aucune pièce trouvée.", loading: "Chargement...",
    categorias: ["Robes", "Manteaux", "Ensembles", "Accessoires", "Corsets", "Hauts", "Pantalons", "Jupes", "Montres"],
    ordenar: "Trier", precoAsc: "Prix: croissant", precoDesc: "Prix: décroissant", recentes: "Plus récents",
    ocasiao: "Occasion",
    fonte: "Source", todasFontes: "Tout", noraGrei: "Nora Grei", lojistas: "Boutiques",
  },
  lt: {
    titulo: "Katalogas", subtitulo: "Drabužiai ir aksesuarai kiekvienai progai.", todas: "Visi", todasOcasiao: "Visos",
    semResultados: "Drabužių nerasta.", loading: "Kraunama...",
    categorias: ["Suknelės", "Paltai", "Komplektai", "Aksesuarai", "Korsetai", "Marškinėliai", "Kelnės", "Sijonai", "Laikrodžiai"],
    ordenar: "Rūšiuoti", precoAsc: "Kaina: mažiausia pirma", precoDesc: "Kaina: didžiausia pirma", recentes: "Naujausi",
    ocasiao: "Proga",
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
  const [cestoCont, setCestoCont] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && translations[saved]) setLang(saved);
    carregarPecas();
    const lerCesto = () => {
      try { setCestoCont(JSON.parse(localStorage.getItem("ng_cesto") || "[]").length); } catch (_) { setCestoCont(0); }
    };
    lerCesto();
    window.addEventListener("cesto-atualizado", lerCesto);
    return () => window.removeEventListener("cesto-atualizado", lerCesto);
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
      // Mapear stock_tamanho_id -> nº de alugueres ativos nesse stock
      const alugueresAtivosIds = new Set((alugueresAtivos || []).map(a => a.stock_tamanho_id));

      const formatadas = (ngData || []).map(p => {
        const stockTamanhos = p.stock_tamanhos || [];
        // Um tamanho está disponível se: tem quantidade_disponivel > 0 E não está em aluguer ativo
        const tamanhosDisponiveis = stockTamanhos.filter(s =>
          s.quantidade_disponivel > 0 && !alugueresAtivosIds.has(s.id)
        );
        const temStock = tamanhosDisponiveis.length > 0;

        // Data de regresso: o aluguer ativo mais tardio
        const stockIds = stockTamanhos.map(s => s.id);
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
          tamanhos: tamanhosDisponiveis.map(s => s.tamanho),
          tamanhosSemStock: stockTamanhos.filter(s =>
            s.quantidade_disponivel === 0 || alugueresAtivosIds.has(s.id)
          ).map(s => ({ tamanho: s.tamanho, id: s.id })),
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

      // Alugueres ativos de lojistas
      const { data: alugueresLojAtivos } = await supabase
        .from("alugueres_lojista")
        .select("stock_lojista_id")
        .in("estado", ["pendente", "confirmado", "enviado", "ativo", "em_verificacao"]);
      const alugueresLojAtivosIds = new Set((alugueresLojAtivos || []).map(a => a.stock_lojista_id));

      const formatadasLoj = (lojData || []).map(p => {
        const stockLoj = p.stock_lojista || [];
        const tamanhosDisponiveis = stockLoj.filter(s =>
          (s.quantidade_disponivel ?? 1) > 0 && !alugueresLojAtivosIds.has(s.id)
        );
        return {
          ...p,
          _origem: "lojista",
          categoria: p.categoria || "",
          tamanhos: tamanhosDisponiveis.map(s => s.tamanho),
          estado: tamanhosDisponiveis.length > 0 ? "disponivel" : "indisponivel",
          lojaCodigo: p.clientes?.codigo_cliente || "",
          lojistaNome: p.clientes?.nome || "",
          lojistaId: p.clientes?.id || "",
          preco_aluguer_dia: p.preco_aluguer_dia || 0,
        };
      });

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
        /* Filtros */
        .filtros-bloco { border-top:1px solid var(--grey-200); border-bottom:1px solid var(--grey-200); margin-bottom:1.5rem; }
        .filtros-linha { display:flex; align-items:center; gap:0; border-bottom:1px solid var(--grey-200); }
        .filtros-scroll { display:flex; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; flex:1; }
        .filtros-scroll::-webkit-scrollbar { display:none; }
        .filter-btn { font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.85rem 1rem; border:none; border-right:1px solid var(--grey-200); background:transparent; color:#4a4845; cursor:pointer; font-family:var(--sans); font-weight:400; white-space:nowrap; flex-shrink:0; transition:background 0.12s,color 0.12s; }
        .filter-btn:first-child { padding-left:1rem; }
        .filter-btn.active { background:var(--black); color:var(--white); }
        .filter-select { font-size:0.7rem; letter-spacing:0.08em; text-transform:uppercase; padding:0.85rem 0.85rem; border:none; border-left:1px solid var(--grey-200); background:transparent; color:#4a4845; cursor:pointer; font-family:var(--sans); font-weight:400; outline:none; flex-shrink:0; appearance:none; -webkit-appearance:none; }
        /* Linha 2: ocasião + fonte em blocos empilhados no mobile */
        .filtros-linha-2 { display:flex; flex-direction:column; gap:0; }
        .filtros-grupo { display:flex; align-items:center; gap:0.6rem; padding:0.65rem 1rem; border-bottom:1px solid var(--grey-200); flex-wrap:wrap; }
        .filtros-grupo:last-child { border-bottom:none; }
        .filtros-grupo-label { font-size:0.64rem; letter-spacing:0.2em; text-transform:uppercase; color:#888580; font-family:var(--sans); white-space:nowrap; flex-shrink:0; min-width:56px; }
        .filtros-tags { display:flex; gap:0.4rem; flex-wrap:wrap; }
        .tag-btn { font-size:0.7rem; letter-spacing:0.06em; padding:0.38rem 0.75rem; border:1px solid var(--grey-200); background:transparent; color:#4a4845; cursor:pointer; font-family:var(--sans); white-space:nowrap; flex-shrink:0; transition:all 0.12s; min-height:36px; display:flex; align-items:center; }
        .tag-btn.active { background:var(--black); color:var(--white); border-color:var(--black); }
        .cat-grid { padding:0 1rem 4rem; display:grid; grid-template-columns:repeat(2,1fr); gap:0.75rem; }
        .cat-empty { padding:4rem 1rem; text-align:center; font-family:var(--serif); font-size:1.3rem; font-weight:300; color:#3a3835; font-style:italic; }
        .cat-loading { padding:4rem; text-align:center; font-size:0.78rem; color:#3a3835; letter-spacing:0.2em; text-transform:uppercase; }
        /* TABLET */
        @media (min-width:600px) {
          .cat-nav { padding:1.1rem 2rem; }
          .cat-header { padding:6rem 2rem 2rem; }
          .cat-grid { padding:0 2rem 5rem; grid-template-columns:repeat(2,1fr); gap:1.25rem; }
          .filter-btn:first-child { padding-left:2rem; }
          .filtros-linha-2 { flex-direction:row; }
          .filtros-grupo { border-bottom:none; border-left:1px solid var(--grey-200); padding:0.65rem 1.5rem; }
          .filtros-grupo:first-child { border-left:none; }
        }
        /* DESKTOP */
        @media (min-width:960px) {
          .cat-nav { padding:1.25rem 3rem; }
          .cat-header { padding:7rem 3rem 2.5rem; }
          .cat-grid { padding:0 3rem 6rem; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
          .filter-btn { font-size:0.72rem; padding:0.85rem 1.2rem; }
          .filter-btn:first-child { padding-left:3rem; }
          .filter-btn:hover:not(.active) { color:var(--black); }
          .filter-select { font-size:0.72rem; padding:0.85rem 1.2rem; }
          .filtros-grupo { padding:0.65rem 2rem; }
          .tag-btn:hover:not(.active) { border-color:#aaa; color:var(--black); }
        }
        @media (min-width:1280px) {
          .cat-grid { grid-template-columns:repeat(4,1fr); }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap" rel="stylesheet" />

      <nav className="cat-nav">
        <a href="/" className="cat-nav-logo">Nora Grei</a>
        <a href="/" className="cat-nav-back">← Início</a>
        <a href="/cesto" style={{position:"relative",display:"flex",alignItems:"center",padding:"0.4rem",color:"#080808",lineHeight:1,marginLeft:"auto"}} title="Cesto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          {cestoCont > 0 && <span style={{position:"absolute",top:"-2px",right:"-2px",background:"#c4748a",color:"#fff",fontSize:"0.45rem",fontFamily:"'Jost',sans-serif",fontWeight:600,width:"14px",height:"14px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>{cestoCont > 9 ? "9+" : cestoCont}</span>}
        </a>
      </nav>

      <div className="cat-header">
        <p className="cat-header-label">{t.titulo}</p>
        <h1 className="cat-header-title">{t.subtitulo}</h1>
      </div>

      {/* Bloco de filtros unificado */}
      <div className="filtros-bloco">
        {/* Linha 1: Categorias + ordenar */}
        <div className="filtros-linha">
          <div className="filtros-scroll">
            <button className={`filter-btn${filtroCategoria === "todas" ? " active" : ""}`} onClick={() => setFiltroCategoria("todas")}>{t.todas}</button>
            {t.categorias.map(cat => (
              <button key={cat} className={`filter-btn${filtroCategoria === cat ? " active" : ""}`} onClick={() => setFiltroCategoria(cat)}>{cat}</button>
            ))}
          </div>
          <select className="filter-select" value={ordenar} onChange={e => setOrdenar(e.target.value)}>
            <option value="recentes">{t.recentes}</option>
            <option value="precoAsc">{t.precoAsc}</option>
            <option value="precoDesc">{t.precoDesc}</option>
          </select>
        </div>

        {/* Linha 2: Ocasião + Fonte — mais subtil */}
        <div className="filtros-linha-2">
          <div className="filtros-grupo">
            <span className="filtros-grupo-label">{t.ocasiao}</span>
            <div className="filtros-tags">
              <button className={`tag-btn${filtroOcasiao === "todas" ? " active" : ""}`} onClick={() => setFiltroOcasiao("todas")}>{t.todasOcasiao}</button>
              {(OCASIOES[lang] || OCASIOES.pt).map(o => (
                <button key={o.key} className={`tag-btn${filtroOcasiao === o.key ? " active" : ""}`} onClick={() => setFiltroOcasiao(o.key)}>{o.label}</button>
              ))}
            </div>
          </div>
          <div className="filtros-grupo">
            <span className="filtros-grupo-label">{t.fonte}</span>
            <div className="filtros-tags">
              {[["todas", t.todasFontes], ["ng", t.noraGrei], ["lojista", t.lojistas]].map(([key, label]) => (
                <button key={key} className={`tag-btn${filtroFonte === key ? " active" : ""}`} onClick={() => setFiltroFonte(key)}>{label}</button>
              ))}
            </div>
          </div>
        </div>
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