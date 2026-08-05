"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const T = {
  pt: {
    pecas: "Peças disponíveis", vender: "À venda", alugar: "Alugar", comprar: "Comprar", dispDia: "/dia", semPecas: "Esta loja ainda não tem peças disponíveis.", disponivel: "Disponível", indisponivel: "Indisponível", voltar: "← Catálogo", lojaDeLabel: "Loja de", contactar: "Contactar lojista", dias: "dias de teste", verDetalhe: "Ver detalhe",
  },
  fr: {
    pecas: "Pièces disponibles", vender: "À vendre", alugar: "Louer", comprar: "Acheter", dispDia: "/jour", semPecas: "Cette boutique n'a pas encore de pièces disponibles.", disponivel: "Disponible", indisponivel: "Indisponible", voltar: "← Catalogue", lojaDeLabel: "Boutique de", contactar: "Contacter le vendeur", dias: "jours d'essai", verDetalhe: "Voir le détail",
  },
  lt: {
    pecas: "Turimi drabužiai", vender: "Parduodama", alugar: "Nuomoti", comprar: "Pirkti", dispDia: "/d.", semPecas: "Ši parduotuvė dar neturi drabužių.", disponivel: "Prieinama", indisponivel: "Neprieinama", voltar: "← Katalogas", lojaDeLabel: "Parduotuvė", contactar: "Susisiekti", dias: "bandymo dienos", verDetalhe: "Žiūrėti",
  },
};

export default function LojaPublica() {
  const { codigo } = useParams();
  const [lang, setLang] = useState("pt");
  const [lojista, setLojista] = useState(null);
  const [pecas, setPecas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos"); // todos, alugar, comprar

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    carregarLoja();
  }, [codigo]);

  const carregarLoja = async () => {
    setLoading(true);
    // Buscar lojista pelo código
    const { data: cli } = await supabase.from("clientes").select("id, nome, cidade, pais, codigo, lojista_estado").eq("codigo_cliente", codigo).maybeSingle();
    if (!cli || !cli.lojista_estado) { setLoading(false); return; }
    setLojista(cli);

    // Buscar peças da loja
    const { data: ps } = await supabase.from("pecas_lojista").select("*, stock_lojista(tamanho, quantidade_disponivel)").eq("cliente_id", cli.id).eq("estado", "disponivel").order("created_at", { ascending: false });
    setPecas(ps || []);
    setLoading(false);
  };

  const t = T[lang] || T.pt;
  const pecasFiltradas = filtro === "alugar" ? pecas.filter(p => p.preco_aluguer_dia) : filtro === "comprar" ? pecas.filter(p => p.preco_venda) : pecas;

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Jost',sans-serif",fontSize:"0.8rem",letterSpacing:"0.2em",color:"#888",textTransform:"uppercase"}}>...</div>
  );

  if (!lojista) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Jost',sans-serif",gap:"1rem"}}>
      <p style={{fontSize:"0.85rem",color:"#888"}}>Loja não encontrada.</p>
      <a href="/catalogo" style={{fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#080808"}}>← {t.voltar}</a>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g4:#5a5855;--rosa:#c4748a;--serif:'Cormorant Garamond',serif;--sans:'Jost',sans-serif}
        body{background:var(--white);color:var(--black);font-family:var(--sans);-webkit-font-smoothing:antialiased}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2);padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between}
        .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:300;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
        .nav-back{font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);text-decoration:none}
        .hero-loja{padding:7rem 2rem 3rem;text-align:center;border-bottom:1px solid var(--g2)}
        .loja-nome{font-family:var(--serif);font-size:clamp(2rem,6vw,4rem);font-weight:300;margin-bottom:0.5rem}
        .loja-local{font-size:0.78rem;color:var(--g4);letter-spacing:0.1em}
        .filtros{display:flex;justify-content:center;gap:0.5rem;padding:1.5rem 2rem;border-bottom:1px solid var(--g1)}
        .filtro-btn{padding:0.5rem 1.5rem;font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;background:none;border:1.5px solid var(--g2);cursor:pointer;font-family:var(--sans);color:var(--g4);transition:all 0.2s}
        .filtro-btn.on{background:var(--black);color:#fff;border-color:var(--black)}
        .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--g2);padding:1px}
        @media(min-width:768px){.grid{grid-template-columns:repeat(3,1fr)}}
        @media(min-width:1024px){.grid{grid-template-columns:repeat(4,1fr)}}
        .peca-card{background:var(--white);text-decoration:none;color:var(--black);display:block;transition:background 0.2s}
        .peca-card:hover{background:var(--g1)}
        .peca-foto{width:100%;aspect-ratio:3/4;object-fit:cover;background:var(--g1);display:block}
        .peca-foto-ph{width:100%;aspect-ratio:3/4;background:var(--g1);display:flex;align-items:center;justify-content:center}
        .peca-info{padding:1rem}
        .peca-nome{font-family:var(--serif);font-size:1rem;font-weight:300;margin-bottom:0.25rem}
        .peca-preco{font-size:0.78rem;color:var(--g4)}
        .peca-tags{display:flex;gap:0.4rem;margin-top:0.5rem;flex-wrap:wrap}
        .tag{font-size:0.55rem;letter-spacing:0.12em;text-transform:uppercase;padding:0.2rem 0.5rem;background:var(--g1);color:var(--g4)}
        .tag-rosa{background:#fce4ec;color:var(--rosa)}
        .sem-pecas{text-align:center;padding:5rem 2rem;font-size:0.85rem;color:var(--g4)}
      `}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <div style={{display:"flex",alignItems:"center",gap:"1.5rem"}}>
          <div style={{display:"flex",gap:"0.4rem"}}>
            {["pt","fr","lt"].map(l => (
              <button key={l} onClick={() => { localStorage.setItem("ng_lang",l); setLang(l); }} style={{fontSize:"0.56rem",letterSpacing:"0.15em",textTransform:"uppercase",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--sans)",color:lang===l?"var(--black)":"var(--g4)",fontWeight:lang===l?500:300}}>{l.toUpperCase()}</button>
            ))}
          </div>
          <a href="/catalogo" className="nav-back">{t.voltar}</a>
        </div>
      </nav>

      <div className="hero-loja">
        <h1 className="loja-nome">{t.lojaDeLabel} {lojista.nome}</h1>
        {lojista.cidade && <p className="loja-local">{lojista.cidade}, {lojista.pais}</p>}
      </div>

      <div className="filtros">
        {[
          {id:"todos", label:{pt:"Todos",fr:"Tous",lt:"Visi"}},
          {id:"alugar", label:{pt:t.alugar,fr:t.alugar,lt:t.alugar}},
          {id:"comprar", label:{pt:t.comprar,fr:t.comprar,lt:t.comprar}},
        ].map(f => (
          <button key={f.id} className={`filtro-btn${filtro===f.id?" on":""}`} onClick={() => setFiltro(f.id)}>{f.label[lang]||f.label.pt}</button>
        ))}
      </div>

      {pecasFiltradas.length === 0 ? (
        <div className="sem-pecas">{t.semPecas}</div>
      ) : (
        <div className="grid">
          {pecasFiltradas.map(p => (
            <a key={p.id} href={`/loja/${codigo}/peca/${p.id}`} className="peca-card">
              {p.fotos?.[0] ? <img src={p.fotos[0]} className="peca-foto" alt={p.nome} /> : <div className="peca-foto-ph"><span style={{fontFamily:"var(--serif)",fontSize:"2rem",color:"rgba(0,0,0,0.08)",fontStyle:"italic"}}>NG</span></div>}
              <div className="peca-info">
                <div className="peca-nome">{p.nome}</div>
                <div className="peca-preco">
                  {p.preco_aluguer_dia && <span>{p.preco_aluguer_dia}€{t.dispDia}</span>}
                  {p.preco_aluguer_dia && p.preco_venda && <span style={{margin:"0 0.4rem",color:"var(--g2)"}}>·</span>}
                  {p.preco_venda && <span>{p.preco_venda}€</span>}
                </div>
                <div className="peca-tags">
                  {p.preco_aluguer_dia && <span className="tag tag-rosa">{t.alugar}</span>}
                  {p.preco_venda && <span className="tag">{t.comprar}</span>}
                  {p.stock_lojista?.every(s => s.quantidade_disponivel === 0) && <span className="tag">{t.indisponivel}</span>}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}