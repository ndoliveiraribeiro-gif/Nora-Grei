"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const T = {
  pt: {
    pecas: "Peças disponíveis", vender: "À venda", alugar: "Alugar", comprar: "Comprar", comprarNova: "Comprar nova", usada: "Usada", dispDia: "/dia", semPecas: "Esta loja ainda não tem peças disponíveis.", disponivel: "Disponível", indisponivel: "Indisponível", voltar: "← Catálogo", lojaDeLabel: "Loja de", contactar: "Contactar lojista", verDetalhe: "Ver detalhe", todasOcasiao: "Todas as ocasiões", ocasiao: "Por ocasião",
  },
  fr: {
    pecas: "Pièces disponibles", vender: "À vendre", alugar: "Louer", comprar: "Acheter", comprarNova: "Acheter neuf", usada: "Occasion", dispDia: "/jour", semPecas: "Cette boutique n'a pas encore de pièces disponibles.", disponivel: "Disponible", indisponivel: "Indisponible", voltar: "← Catalogue", lojaDeLabel: "Boutique de", contactar: "Contacter le vendeur", verDetalhe: "Voir le détail", todasOcasiao: "Toutes les occasions", ocasiao: "Par occasion",
  },
  lt: {
    pecas: "Turimi drabužiai", vender: "Parduodama", alugar: "Nuomoti", comprar: "Pirkti", comprarNova: "Pirkti naują", usada: "Naudota", dispDia: "/d.", semPecas: "Ši parduotuvė dar neturi drabužių.", disponivel: "Prieinama", indisponivel: "Neprieinama", voltar: "← Katalogas", lojaDeLabel: "Parduotuvė", contactar: "Susisiekti", verDetalhe: "Žiūrėti", todasOcasiao: "Visos progos", ocasiao: "Pagal progą",
  },
};

// Ocasiões sem emojis (profissional)
const OCASIOES_LOJA = {
  pt: [
    { key: "Casamento", label: "Casamento" }, { key: "Gala", label: "Gala" }, { key: "Cocktail", label: "Cocktail" },
    { key: "Festa", label: "Festa" }, { key: "Jantar", label: "Jantar" }, { key: "Trabalho", label: "Trabalho" },
    { key: "Dia a dia", label: "Dia a dia" }, { key: "Praia", label: "Praia" }, { key: "Férias", label: "Férias" },
  ],
  fr: [
    { key: "Casamento", label: "Mariage" }, { key: "Gala", label: "Gala" }, { key: "Cocktail", label: "Cocktail" },
    { key: "Festa", label: "Fête" }, { key: "Jantar", label: "Dîner" }, { key: "Trabalho", label: "Travail" },
    { key: "Dia a dia", label: "Quotidien" }, { key: "Praia", label: "Plage" }, { key: "Férias", label: "Vacances" },
  ],
  lt: [
    { key: "Casamento", label: "Vestuvės" }, { key: "Gala", label: "Gala" }, { key: "Cocktail", label: "Kokteilis" },
    { key: "Festa", label: "Šventė" }, { key: "Jantar", label: "Vakarienė" }, { key: "Trabalho", label: "Darbas" },
    { key: "Dia a dia", label: "Kasdien" }, { key: "Praia", label: "Paplūdimys" }, { key: "Férias", label: "Atostogos" },
  ],
};

export default function LojaPublica() {
  const { codigo } = useParams();
  const [lang, setLang] = useState("pt");
  const [lojista, setLojista] = useState(null);
  const [timers, setTimers] = useState({});
  const [pecas, setPecas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [filtroOcasiao, setFiltroOcasiao] = useState("todas");
  const [mediaRating, setMediaRating] = useState(null);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);
  const [user, setUser] = useState(null);
  const [seguindo, setSeguindo] = useState(false);
  const [seguidores, setSeguidores] = useState(0);
  const [seguindoLoading, setSeguindoLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    carregarLoja();
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, [codigo]);

  const carregarLoja = async () => {
    setLoading(true);
    const { data: cli } = await supabase.from("clientes").select("id, nome, codigo_cliente, cidade, pais").eq("codigo_cliente", codigo).maybeSingle();
    if (!cli) { setLoading(false); return; }
    setLojista(cli);
    const { data: ps } = await supabase.from("pecas_lojista").select("*, stock_lojista(id, tamanho, quantidade_disponivel)").eq("cliente_id", cli.id).eq("estado", "disponivel").order("created_at", { ascending: false });
    setPecas(ps || []);

    // Buscar timers para peças esgotadas
    if (ps && ps.length > 0) {
      const stockIds = ps.flatMap(p => (p.stock_lojista || []).map(s => s.id));
      if (stockIds.length > 0) {
        const { data: alugAtivos } = await supabase
          .from("alugueres_lojista")
          .select("stock_lojista_id, data_fim, data_disponivel_novamente, pecas_lojista_id")
          .in("stock_lojista_id", stockIds)
          .eq("estado", "ativo")
          .order("data_fim", { ascending: false });
        if (alugAtivos) {
          // Mapear por peca id → data_fim mais distante
          const timerMap = {};
          for (const p of ps) {
            const stockIds_p = (p.stock_lojista || []).map(s => s.id);
            const alugsDaPeca = alugAtivos.filter(a => stockIds_p.includes(a.stock_lojista_id));
            if (alugsDaPeca.length > 0) {
              const maisRecente = alugsDaPeca[0];
              timerMap[p.id] = maisRecente.data_disponivel_novamente || maisRecente.data_fim;
            }
          }
          setTimers(timerMap);
        }
      }
    }

    // Média de avaliações do lojista
    const { data: avs } = await supabase.from("avaliacoes_lojista").select("nota_cliente_lojista").eq("lojista_id", cli.id).not("nota_cliente_lojista","is",null);
    if (avs && avs.length > 0) {
      const media = avs.reduce((s,a) => s + a.nota_cliente_lojista, 0) / avs.length;
      setMediaRating(media.toFixed(1));
      setTotalAvaliacoes(avs.length);
    }

    // Seguidores
    const { count: numSeg } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("lojista_id", cli.id);
    setSeguidores(numSeg || 0);

    // Verificar se utilizador atual segue
    const { data: sess } = await supabase.auth.getSession();
    if (sess?.session?.user) {
      const { data: follow } = await supabase.from("follows").select("id").eq("follower_id", sess.session.user.id).eq("lojista_id", cli.id).maybeSingle();
      if (follow) setSeguindo(true);
    }

    setLoading(false);
  };

  const toggleSeguir = async () => {
    if (!user) { window.location.href = "/entrar"; return; }
    setSeguindoLoading(true);
    if (seguindo) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("lojista_id", lojista.id);
      setSeguindo(false);
      setSeguidores(s => Math.max(0, s - 1));
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, lojista_id: lojista.id });
      setSeguindo(true);
      setSeguidores(s => s + 1);
    }
    setSeguindoLoading(false);
  };

  function MiniTimer({ dataFim }) {
    const [tempo, setTempo] = useState("");
    useEffect(() => {
      if (!dataFim) return;
      const calc = () => {
        const diff = new Date(dataFim) - new Date();
        if (diff <= 0) { setTempo("em breve"); return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setTempo(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`);
      };
      calc();
      const iv = setInterval(calc, 60000);
      return () => clearInterval(iv);
    }, [dataFim]);
    return <span className="tag tag-timer">⏱ {tempo}</span>;
  }

  const t = T[lang] || T.pt;
  const temNoraGrei = pecas.some(p => p.origem === "Nora Grei");
  const ocasioesDisponiveis = OCASIOES_LOJA[lang] || OCASIOES_LOJA.pt;
  const pecasFiltradas = pecas
    .filter(p => {
      if (filtro === "alugar") return !!p.preco_aluguer_dia;
      if (filtro === "comprar") return !!p.preco_venda;
      if (filtro === "comprar_nova") return p.origem === "Nora Grei";
      if (filtro === "usada") return p.origem !== "Nora Grei";
      return true;
    })
    .filter(p => filtroOcasiao === "todas" || (Array.isArray(p.ocasioes) && p.ocasioes.includes(filtroOcasiao)));

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Jost',sans-serif",fontSize:"0.8rem",letterSpacing:"0.2em",color:"#888",textTransform:"uppercase"}}>...</div>
  );

  if (!lojista) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Jost',sans-serif",gap:"1rem"}}>
      <p style={{fontSize:"0.85rem",color:"#888"}}>Loja não encontrada.</p>
      <a href="/catalogo" style={{fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#080808"}}>← Catálogo</a>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g4:#5a5855;--rosa:#c4748a;--serif:'Cormorant Garamond',serif;--sans:'Jost',sans-serif}
        body{background:var(--white);color:var(--black);font-family:var(--sans);-webkit-font-smoothing:antialiased}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2);padding:1rem 2rem;padding-top:max(1rem,env(safe-area-inset-top));display:flex;align-items:center;justify-content:space-between}
        .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:300;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
        .nav-back{font-size:0.78rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);text-decoration:none}

        /* ── HERO ── */
        .hero-loja{padding:6.5rem 2rem 2.5rem;text-align:center;background:linear-gradient(180deg,#f5f2ee 0%,var(--white) 100%);border-bottom:1px solid var(--g2);position:relative}
        .hero-loja::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(196,116,138,0.06) 0%,transparent 70%);pointer-events:none}
        .loja-nome{font-family:var(--serif);font-size:clamp(2.2rem,7vw,4.5rem);font-weight:300;letter-spacing:0.04em;line-height:1.1;margin-bottom:0.6rem;text-wrap:balance}
        .loja-local{font-size:0.78rem;color:var(--g4);letter-spacing:0.18em;text-transform:uppercase}
        .hero-meta{display:flex;align-items:center;justify-content:center;gap:1.5rem;margin-top:1rem;flex-wrap:wrap}
        .hero-rating-link{display:flex;align-items:center;gap:0.35rem;text-decoration:none;color:inherit}
        .hero-stars span{font-size:0.9rem}
        .hero-rating-val{font-size:0.8rem;font-weight:500}
        .hero-rating-count{font-size:0.72rem;color:var(--g4);text-decoration:underline;text-underline-offset:2px}
        .hero-sep{width:1px;height:14px;background:var(--g2)}
        .hero-seguidores{font-size:0.72rem;color:var(--g4);letter-spacing:0.08em}
        .btn-seguir{margin-top:1.5rem;padding:0.65rem 2.5rem;font-size:0.68rem;letter-spacing:0.2em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;transition:all 0.25s;border-radius:0;display:inline-block}
        .btn-seguir.off{background:var(--rosa);color:#fff;border:1.5px solid var(--rosa)}
        .btn-seguir.off:hover{background:#b5627a;border-color:#b5627a}
        .btn-seguir.on{background:transparent;color:var(--black);border:1.5px solid var(--g2)}
        .btn-seguir.on:hover{border-color:var(--g4)}

        /* ── FILTROS ── */
        .filtros-wrap{border-bottom:1px solid var(--g2)}
        .filtros{display:flex;justify-content:center;gap:0;padding:0 1rem;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
        .filtros::-webkit-scrollbar{display:none}
        .filtro-btn{padding:0.9rem 1.2rem;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-family:var(--sans);color:var(--g4);transition:all 0.18s;white-space:nowrap;flex-shrink:0}
        .filtro-btn:hover{color:var(--black)}
        .filtro-btn.on{color:var(--black);border-bottom-color:var(--rosa);font-weight:500}
        .ocasioes-wrap{padding:0.75rem 1.5rem 0.9rem;display:flex;gap:0.4rem;overflow-x:auto;WebkitOverflowScrolling:touch;scrollbar-width:none}
        .ocasioes-wrap::-webkit-scrollbar{display:none}
        .pill{font-size:0.72rem;letter-spacing:0.05em;padding:0.32rem 0.8rem;border-radius:999px;border:1px solid var(--g2);background:transparent;color:var(--g4);cursor:pointer;font-family:var(--sans);white-space:nowrap;flex-shrink:0;transition:all 0.15s}
        .pill:hover{border-color:var(--rosa);color:var(--rosa)}
        .pill.on{background:var(--rosa);border-color:var(--rosa);color:#fff}

        /* ── GRID ── */
        .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--g2)}
        @media(min-width:768px){.grid{grid-template-columns:repeat(3,1fr)}}
        @media(min-width:1200px){.grid{grid-template-columns:repeat(4,1fr)}}
        .peca-card{background:var(--white);text-decoration:none;color:var(--black);display:block;transition:background 0.2s}
        .peca-card:hover{background:var(--g1)}
        .peca-foto{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}
        .peca-foto-ph{width:100%;aspect-ratio:3/4;background:linear-gradient(160deg,#ede9e4 0%,#e8e2db 100%);display:flex;align-items:center;justify-content:center}
        .peca-foto-ph-txt{font-family:var(--serif);font-size:1.8rem;font-weight:300;color:rgba(0,0,0,0.12);letter-spacing:0.15em}
        .peca-info{padding:0.85rem 1rem 1rem}
        .peca-nome{font-family:var(--sans);font-size:0.88rem;font-weight:500;margin-bottom:0.2rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .peca-preco{font-size:0.82rem;color:var(--g4)}
        .peca-tags{display:flex;gap:0.35rem;margin-top:0.5rem;flex-wrap:wrap}
        .tag{font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;padding:0.18rem 0.45rem;background:var(--g1);color:var(--g4)}
        .tag-rosa{background:rgba(196,116,138,0.1);color:var(--rosa)}
        .tag-timer{background:#fff8e1;color:#b8860b;font-variant-numeric:tabular-nums}
        .sem-pecas{text-align:center;padding:6rem 2rem;font-size:0.82rem;color:var(--g4);letter-spacing:0.08em}
      `}</style>

      {/* Banner de gestão — visível apenas para o dono da loja */}
      {user && lojista && user.id === lojista.id && (
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"var(--black)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.45rem 2rem",fontFamily:"var(--sans)"}}>
          <span style={{fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",opacity:0.7}}>Modo lojista — vista pública da tua loja</span>
          <div style={{display:"flex",gap:"0.5rem"}}>
            <a href="/perfil#loja-dashboard" onClick={e=>{e.preventDefault();window.location.href="/perfil";}} style={{fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#fff",textDecoration:"none",padding:"0.25rem 0.6rem",border:"1px solid rgba(255,255,255,0.3)",whiteSpace:"nowrap"}}>← Dashboard</a>
            <a href="/perfil" style={{fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#fff",textDecoration:"none",padding:"0.25rem 0.6rem",border:"1px solid rgba(255,255,255,0.3)",whiteSpace:"nowrap"}}>Perfil</a>
          </div>
        </div>
      )}
      <nav className="nav" style={user && lojista && user.id === lojista.id ? {top:"32px"} : {}}>
        <a href="/" className="nav-logo">Nora Grei</a>
        <div style={{display:"flex",alignItems:"center",gap:"1.5rem"}}>
          <div style={{display:"flex",gap:"0.4rem"}}>
            {["pt","fr","lt"].map(l => (
              <button key={l} onClick={() => { localStorage.setItem("ng_lang",l); setLang(l); }} style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--sans)",color:lang===l?"var(--black)":"var(--g4)",fontWeight:lang===l?500:300}}>{l.toUpperCase()}</button>
            ))}
          </div>
          <a href="/catalogo" className="nav-back">{t.voltar}</a>
        </div>
      </nav>

      <div className="hero-loja" style={user && lojista && user.id === lojista.id ? {paddingTop:"9.5rem"} : {}}>
        <h1 className="loja-nome">{lojista.nome}</h1>
        {lojista.cidade && <p className="loja-local">{lojista.cidade}{lojista.pais ? `, ${lojista.pais}` : ""}</p>}
        <div className="hero-meta">
          {mediaRating && (
            <>
              <a href={`/loja/${codigo}/avaliacoes`} className="hero-rating-link">
                <span className="hero-stars">
                  {[1,2,3,4,5].map(v=><span key={v} style={{color:v<=Math.round(mediaRating)?"var(--rosa)":"var(--g2)"}}>★</span>)}
                </span>
                <span className="hero-rating-val">{mediaRating}</span>
                <span className="hero-rating-count">({totalAvaliacoes})</span>
              </a>
              <span className="hero-sep"/>
            </>
          )}
          {seguidores > 0 && (
            <span className="hero-seguidores">{seguidores} {seguidores === 1 ? "seguidor" : "seguidores"}</span>
          )}
        </div>
        <button
          onClick={toggleSeguir}
          disabled={seguindoLoading}
          className={`btn-seguir ${seguindo ? "on" : "off"}`}
        >
          {seguindo ? "✓ A seguir" : "+ Seguir"}
        </button>
      </div>

      {/* Filtros principais */}
      <div className="filtros-wrap">
        <div className="filtros">
          {[
            {id:"todos",       label:{pt:"Todos",fr:"Tous",lt:"Visi"}},
            {id:"alugar",      label:{pt:t.alugar,fr:t.alugar,lt:t.alugar}},
            {id:"comprar",     label:{pt:t.comprar,fr:t.comprar,lt:t.comprar}},
            ...(temNoraGrei ? [{id:"comprar_nova", label:{pt:t.comprarNova,fr:t.comprarNova,lt:t.comprarNova}}] : []),
            {id:"usada",       label:{pt:t.usada,fr:t.usada,lt:t.usada}},
          ].map(f => (
            <button key={f.id} className={`filtro-btn${filtro===f.id?" on":""}`} onClick={() => setFiltro(f.id)}>{f.label[lang]||f.label.pt}</button>
          ))}
        </div>
        {/* Pills de ocasião */}
        <div className="ocasioes-wrap">
          <button onClick={()=>setFiltroOcasiao("todas")} className={`pill${filtroOcasiao==="todas"?" on":""}`}>{t.todasOcasiao}</button>
          {ocasioesDisponiveis.map(o => (
            <button key={o.key} onClick={()=>setFiltroOcasiao(o.key)} className={`pill${filtroOcasiao===o.key?" on":""}`}>{o.label}</button>
          ))}
        </div>
      </div>

      {pecasFiltradas.length === 0 ? (
        <div className="sem-pecas">{t.semPecas}</div>
      ) : (
        <div className="grid">
          {pecasFiltradas.map(p => (
            <a key={p.id} href={`/loja/${codigo}/peca/${p.id}`} className="peca-card">
              {p.fotos?.[0] ? <img src={p.fotos[0]} className="peca-foto" alt={p.nome} /> : <div className="peca-foto-ph"><span className="peca-foto-ph-txt">NG</span></div>}
              <div className="peca-info">
                <div className="peca-nome">{p.nome}</div>
                <div className="peca-preco">
                  {p.preco_aluguer_dia && <span>{p.preco_aluguer_dia}€{t.dispDia}</span>}
                  {p.preco_aluguer_dia && p.preco_venda && <span style={{margin:"0 0.4rem",color:"var(--g2)"}}>·</span>}
                  {p.preco_venda && <span>{p.preco_venda}€</span>}
                </div>
                <div className="peca-tags">
                  {p.origem === "Nora Grei"
                    ? <span className="tag" style={{background:"#c4a882",color:"#fff",border:"none",fontWeight:600,letterSpacing:"0.08em"}}>Nora Grei</span>
                    : <span className="tag" style={{background:"var(--g1)",color:"var(--g6)",border:"none"}}>{t.usada}</span>
                  }
                  {p.preco_aluguer_dia && <span className="tag tag-rosa">{t.alugar}</span>}
                  {p.preco_venda && <span className="tag">{t.comprar}</span>}
                  {Array.isArray(p.ocasioes) && p.ocasioes[0] && (
                    <span className="tag" style={{background:"transparent",border:"1px solid var(--g2)",color:"var(--g4)",fontSize:"0.68rem"}}>{p.ocasioes[0]}</span>
                  )}
                  {p.stock_lojista?.every(s => s.quantidade_disponivel === 0) && (
                    timers[p.id]
                      ? <MiniTimer dataFim={timers[p.id]} />
                      : <span className="tag">{t.indisponivel}</span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}