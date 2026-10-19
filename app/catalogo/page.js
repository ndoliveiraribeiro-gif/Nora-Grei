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
              <span style={{fontFamily:"var(--sans)",fontSize:"1.5rem",fontWeight:300,color:"rgba(0,0,0,0.06)"}}>NG</span>
            </div>
          )}
          {/* Badge Lojista */}
          <div style={{position:"absolute",top:"0.6rem",right:"0.6rem",fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",background:"#b8964e",color:"#fff",padding:"0.25rem 0.55rem",fontFamily:"'Jost',sans-serif",fontWeight:500,zIndex:2}}>Lojista</div>
        </div>
        <div style={{padding:"0.7rem 0.75rem 0.4rem"}}>
          {peca.categoria && (
            <p style={{fontSize:"0.72rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"#8a8783",fontFamily:"'Jost',sans-serif",marginBottom:"0.18rem",fontWeight:400}}>{peca.categoria}</p>
          )}
          <h3 style={{fontFamily:"'Jost',sans-serif",fontSize:"0.92rem",fontWeight:500,lineHeight:1.25,marginBottom:"0.2rem",color:"#111",letterSpacing:"0.01em"}}>{peca.nome}</h3>
          {peca.lojistaNome && (
            <p style={{fontSize:"0.72rem",letterSpacing:"0.04em",color:"#b8964e",fontFamily:"'Jost',sans-serif",marginBottom:"0.3rem",fontWeight:500}}>{peca.lojistaNome}</p>
          )}
          {peca.tamanhos && peca.tamanhos.length > 0 && (
            <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap",marginBottom:"0.4rem"}}>
              {peca.tamanhos.slice(0,5).map(t => (
                <span key={t} style={{fontSize:"0.72rem",letterSpacing:"0.03em",border:"1px solid #d0cdc8",padding:"0.16rem 0.45rem",color:"#4a4845",fontFamily:"'Jost',sans-serif",fontWeight:400,background:"#f2f0ed"}}>{t}</span>
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
        <a href={href} style={{display:"flex",alignItems:"center",justifyContent:"center",margin:"0 0.75rem 0.75rem",padding:"0.8rem",fontSize:"0.78rem",letterSpacing:"0.1em",textTransform:"uppercase",background:"transparent",color:"#5a5855",border:"1px solid #d5d2cd",textAlign:"center",textDecoration:"none",fontFamily:"'Jost',sans-serif",fontWeight:400,minHeight:"46px"}}>{lbl}</a>
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --black: #080808; --white: #f8f7f5; --grey-100: #f0eeeb; --grey-200: #e2dfda; --rosa: #c4748a; --serif: 'Cormorant', Georgia, serif; --sans: 'Jost', Arial, sans-serif; }
        body { background: var(--white); font-family: var(--sans); -webkit-font-smoothing: antialiased; }

        /* ── NAV ── */
        .cat-nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; gap:0.75rem;
          padding:0.75rem 1rem;
          background:rgba(248,247,245,0.97); backdrop-filter:blur(20px);
          border-bottom:1px solid var(--grey-200);
          height:52px;
        }
        .cat-nav-logo { font-family:var(--serif); font-size:1rem; font-weight:300; letter-spacing:0.25em; text-transform:uppercase; text-decoration:none; color:var(--black); flex:1; }
        .cat-nav-icon { display:flex; align-items:center; justify-content:center; padding:0.35rem; color:var(--black); position:relative; text-decoration:none; }

        /* ── FILTROS TOPO — sticky abaixo da nav ── */
        .filtros-sticky {
          position:sticky; top:52px; z-index:90;
          background:rgba(248,247,245,0.98); backdrop-filter:blur(12px);
          border-bottom:1px solid var(--grey-200);
        }

        /* Linha 1: chips de categoria em scroll horizontal */
        .cats-scroll {
          display:flex; overflow-x:auto; -webkit-overflow-scrolling:touch;
          scrollbar-width:none; gap:0;
          border-bottom:1px solid var(--grey-200);
        }
        .cats-scroll::-webkit-scrollbar { display:none; }
        .cat-chip {
          flex-shrink:0; border:none; background:none; cursor:pointer;
          font-family:var(--sans); font-size:0.78rem; font-weight:400;
          letter-spacing:0.08em; text-transform:uppercase; color:#5a5855;
          padding:0.75rem 1rem; white-space:nowrap;
          border-bottom:2px solid transparent;
          transition:color 0.12s, border-color 0.12s;
        }
        .cat-chip:first-child { padding-left:1rem; }
        .cat-chip.active { color:var(--black); font-weight:600; border-bottom-color:var(--black); }

        /* Linha 2: ocasião em scroll + ordenar à direita */
        .filtros-sec {
          display:flex; align-items:center; gap:0;
          border-bottom:none;
          min-height:44px;
        }
        .ocas-scroll {
          display:flex; overflow-x:auto; -webkit-overflow-scrolling:touch;
          scrollbar-width:none; gap:0.4rem; flex:1;
          padding:0.5rem 1rem;
        }
        .ocas-scroll::-webkit-scrollbar { display:none; }
        .ocas-chip {
          flex-shrink:0; border:1px solid var(--grey-200); background:none; cursor:pointer;
          font-family:var(--sans); font-size:0.78rem; font-weight:400;
          letter-spacing:0.04em; color:#5a5855;
          padding:0.3rem 0.7rem; white-space:nowrap; border-radius:20px;
          transition:all 0.12s;
        }
        .ocas-chip.active { background:var(--black); color:var(--white); border-color:var(--black); }

        /* Select ordenar compacto */
        .sort-select {
          flex-shrink:0; border:none; border-left:1px solid var(--grey-200);
          background:none; outline:none; cursor:pointer;
          font-family:var(--sans); font-size:0.75rem; font-weight:400;
          letter-spacing:0.06em; text-transform:uppercase; color:#5a5855;
          padding:0.5rem 0.75rem; appearance:none; -webkit-appearance:none;
          height:100%; min-width:80px;
        }

        /* Linha 3 (só se tiver lojistas): filtro fonte — oculto por default no mobile se só NG */
        .fonte-linha {
          display:flex; gap:0.4rem; padding:0.4rem 1rem;
          border-top:1px solid var(--grey-200);
          overflow-x:auto; scrollbar-width:none;
        }
        .fonte-linha::-webkit-scrollbar { display:none; }
        .fonte-chip {
          flex-shrink:0; border:1px solid var(--grey-200); background:none; cursor:pointer;
          font-family:var(--sans); font-size:0.75rem; font-weight:400;
          letter-spacing:0.04em; color:#5a5855;
          padding:0.25rem 0.65rem; white-space:nowrap; border-radius:20px;
          transition:all 0.12s;
        }
        .fonte-chip.active { background:var(--black); color:var(--white); border-color:var(--black); }

        /* ── GRID ── */
        .cat-grid {
          padding:0.75rem 0.5rem 5rem;
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:0.5rem;
        }
        .cat-empty { padding:4rem 1rem; text-align:center; font-family:var(--sans); font-size:1rem; font-weight:400; color:#3a3835; }
        .cat-loading { padding:4rem; text-align:center; font-size:0.78rem; color:#3a3835; letter-spacing:0.2em; text-transform:uppercase; }

        /* ── BOTTOM NAV ── */
        .bottom-nav {
          position:fixed; bottom:0; left:0; right:0; z-index:100;
          display:flex; align-items:stretch;
          background:rgba(248,247,245,0.98); backdrop-filter:blur(20px);
          border-top:1px solid var(--grey-200);
          height:56px;
        }
        .bn-item {
          flex:1; display:flex; flex-direction:column; align-items:center;
          justify-content:center; gap:0.2rem; text-decoration:none;
          color:#5a5855; border:none; background:none; cursor:pointer;
          font-family:var(--sans); font-size:0.65rem; font-weight:500;
          letter-spacing:0.08em; text-transform:uppercase;
          transition:color 0.12s;
        }
        .bn-item.active { color:var(--black); }
        .bn-item svg { flex-shrink:0; }

        /* TABLET ≥ 600px */
        @media (min-width:600px) {
          .cat-nav { padding:0.85rem 2rem; }
          .cat-chip:first-child { padding-left:2rem; }
          .ocas-scroll { padding:0.5rem 2rem; }
          .cat-grid { padding:0.75rem 1.5rem 5rem; grid-template-columns:repeat(3,1fr); gap:1rem; }
          .bottom-nav { display:none; }
        }
        /* DESKTOP ≥ 960px */
        @media (min-width:960px) {
          .cat-nav { padding:1rem 3rem; height:60px; }
          .filtros-sticky { top:60px; }
          .cat-chip:first-child { padding-left:3rem; }
          .cat-chip { font-size:0.72rem; padding:0.85rem 1.1rem; }
          .ocas-scroll { padding:0.5rem 3rem; }
          .cat-grid { padding:1rem 3rem 5rem; grid-template-columns:repeat(4,1fr); gap:1.25rem; }
          .cat-chip:hover:not(.active) { color:var(--black); }
          .ocas-chip:hover:not(.active) { border-color:#aaa; color:var(--black); }
          .bottom-nav { display:none; }
        }
        @media (min-width:1440px) {
          .cat-grid { grid-template-columns:repeat(5,1fr); }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav className="cat-nav">
        <a href="/" className="cat-nav-logo">Nora Grei</a>
        <a href="/perfil" className="cat-nav-icon" title="Perfil">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </a>
        <a href="/cesto" className="cat-nav-icon" title="Cesto" style={{position:"relative"}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          {cestoCont > 0 && <span style={{position:"absolute",top:"0px",right:"0px",background:"var(--rosa)",color:"#fff",fontSize:"0.5rem",fontFamily:"'Jost',sans-serif",fontWeight:600,width:"14px",height:"14px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>{cestoCont > 9 ? "9+" : cestoCont}</span>}
        </a>
      </nav>

      {/* ── FILTROS STICKY ── */}
      <div className="filtros-sticky">
        {/* Categorias */}
        <div className="cats-scroll">
          <button className={`cat-chip${filtroCategoria === "todas" ? " active" : ""}`} onClick={() => setFiltroCategoria("todas")}>{t.todas}</button>
          {t.categorias.map(cat => (
            <button key={cat} className={`cat-chip${filtroCategoria === cat ? " active" : ""}`} onClick={() => setFiltroCategoria(cat)}>{cat}</button>
          ))}
        </div>

        {/* Ocasião + Ordenar */}
        <div className="filtros-sec">
          <div className="ocas-scroll">
            <button className={`ocas-chip${filtroOcasiao === "todas" ? " active" : ""}`} onClick={() => setFiltroOcasiao("todas")}>{t.todasOcasiao}</button>
            {(OCASIOES[lang] || OCASIOES.pt).map(o => (
              <button key={o.key} className={`ocas-chip${filtroOcasiao === o.key ? " active" : ""}`} onClick={() => setFiltroOcasiao(o.key)}>{o.label}</button>
            ))}
          </div>
          <select className="sort-select" value={ordenar} onChange={e => setOrdenar(e.target.value)}>
            <option value="recentes">{t.recentes}</option>
            <option value="precoAsc">↑ {t.precoAsc.split(":")[0]}</option>
            <option value="precoDesc">↓ {t.precoDesc.split(":")[0]}</option>
          </select>
        </div>

        {/* Fonte — só mostra se tiver lojistas */}
        <div className="fonte-linha">
          {[["todas", t.todasFontes], ["ng", t.noraGrei], ["lojista", t.lojistas]].map(([key, label]) => (
            <button key={key} className={`fonte-chip${filtroFonte === key ? " active" : ""}`} onClick={() => setFiltroFonte(key)}>{label}</button>
          ))}
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

      {/* ── BOTTOM NAV (mobile only) ── */}
      <nav className="bottom-nav">
        <a href="/" className="bn-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Início
        </a>
        <a href="/catalogo" className="bn-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Catálogo
        </a>
        <a href="/pedidos" className="bn-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Pedidos
        </a>
        <a href="/cesto" className="bn-item" style={{position:"relative"}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          {cestoCont > 0 && <span style={{position:"absolute",top:"4px",right:"calc(50% - 14px)",background:"var(--rosa)",color:"#fff",fontSize:"0.48rem",fontFamily:"'Jost',sans-serif",fontWeight:600,width:"13px",height:"13px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>{cestoCont > 9 ? "9+" : cestoCont}</span>}
          Cesto
        </a>
        <a href="/perfil" className="bn-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Perfil
        </a>
      </nav>
    </>
  );
}