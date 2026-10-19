"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const T = {
  pt: {
    titulo: "Pesquisar",
    placeholder: "Pesquisar peças, lojas, marcas...",
    pecas: "Peças",
    lojas: "Lojas",
    semResultados: "Sem resultados para",
    procura: "O que procuras?",
    alugar: "Alugar",
    comprar: "Comprar",
    verLoja: "Ver loja",
    voltar: "← Início",
    resultados: "resultados",
  },
  fr: {
    titulo: "Rechercher",
    placeholder: "Chercher des pièces, boutiques, marques...",
    pecas: "Pièces",
    lojas: "Boutiques",
    semResultados: "Aucun résultat pour",
    procura: "Que cherches-tu ?",
    alugar: "Louer",
    comprar: "Acheter",
    verLoja: "Voir la boutique",
    voltar: "← Accueil",
    resultados: "résultats",
  },
  lt: {
    titulo: "Paieška",
    placeholder: "Ieškoti drabužių, parduotuvių, prekių ženklų...",
    pecas: "Drabužiai",
    lojas: "Parduotuvės",
    semResultados: "Rezultatų nerasta:",
    procura: "Ko ieškai?",
    alugar: "Nuomoti",
    comprar: "Pirkti",
    verLoja: "Žiūrėti parduotuvę",
    voltar: "← Pradžia",
    resultados: "rezultatai",
  },
};

export default function Pesquisa() {
  const [lang, setLang] = useState("pt");
  const [query, setQuery] = useState("");
  const [pecas, setPecas] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    // Focar no input ao entrar
    setTimeout(() => inputRef.current?.focus(), 100);
    // Verificar se há query na URL
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) { setQuery(q); pesquisar(q); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setPecas([]); setLojas([]); setBuscado(false); return; }
    debounceRef.current = setTimeout(() => pesquisar(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const pesquisar = async (q) => {
    if (!q || q.trim().length < 2) return;
    setLoading(true);
    const termo = q.trim();

    // Pesquisar peças
    const { data: ps } = await supabase
      .from("pecas_lojista")
      .select("id, nome, fotos, preco_aluguer_dia, preco_venda, categoria, cor, cliente_id, clientes:cliente_id(nome, codigo_cliente)")
      .eq("estado", "disponivel")
      .or(`nome.ilike.%${termo}%,categoria.ilike.%${termo}%,cor.ilike.%${termo}%`)
      .limit(24);

    // Pesquisar lojas
    const { data: ls } = await supabase
      .from("clientes")
      .select("id, nome, codigo_cliente, cidade, pais")
      .eq("is_lojista", true)
      .or(`nome.ilike.%${termo}%,cidade.ilike.%${termo}%`)
      .limit(8);

    setPecas(ps || []);
    setLojas(ls || []);
    setBuscado(true);
    setLoading(false);
  };

  const t = T[lang] || T.pt;
  const totalResultados = pecas.length + lojas.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g4:#5a5855;--rosa:#c4748a;--serif:'Cormorant Garamond',serif;--sans:'Jost',sans-serif}
        html,body{overflow-x:hidden;max-width:100%}
        body{background:var(--white);color:var(--black);font-family:var(--sans);-webkit-font-smoothing:antialiased}

        .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2);padding:1rem 2rem;padding-top:max(1rem,env(safe-area-inset-top));display:flex;align-items:center;justify-content:space-between}
        .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:300;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
        .nav-back{font-size:0.78rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);text-decoration:none}

        .search-wrap{padding:calc(5rem + env(safe-area-inset-top,0px)) 1.5rem 1.5rem;max-width:800px;margin:0 auto}
        .search-bar{display:flex;align-items:center;gap:0.8rem;background:var(--white);border:1.5px solid var(--g2);padding:0.85rem 1.2rem;margin-bottom:1.5rem;transition:border-color 0.2s}
        .search-bar:focus-within{border-color:var(--black)}
        .search-icon{font-size:1.1rem;color:var(--g4);flex-shrink:0}
        .search-input{flex:1;border:none;background:transparent;font-family:var(--sans);font-size:1rem;color:var(--black);outline:none;min-width:0}
        .search-input::placeholder{color:var(--g4);font-size:0.88rem}
        .search-clear{background:none;border:none;cursor:pointer;font-size:1rem;color:var(--g4);padding:0.1rem 0.2rem;flex-shrink:0}

        .secao-label{font-size:0.68rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--g4);margin-bottom:0.8rem;padding-bottom:0.5rem;border-bottom:1px solid var(--g2)}
        .secao{margin-bottom:2rem}

        .grid-pecas{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--g2);margin-bottom:1px}
        @media(min-width:600px){.grid-pecas{grid-template-columns:repeat(3,1fr)}}
        @media(min-width:900px){.grid-pecas{grid-template-columns:repeat(4,1fr)}}
        .peca-card{background:var(--white);text-decoration:none;color:var(--black);display:block;transition:background 0.2s}
        .peca-card:hover{background:var(--g1)}
        .peca-foto{width:100%;aspect-ratio:3/4;object-fit:cover;display:block}
        .peca-foto-ph{width:100%;aspect-ratio:3/4;background:linear-gradient(160deg,#ede9e4 0%,#e8e2db 100%);display:flex;align-items:center;justify-content:center}
        .peca-foto-ph-txt{font-family:var(--serif);font-size:1.8rem;font-weight:300;color:rgba(0,0,0,0.12);letter-spacing:0.15em}
        .peca-info{padding:0.75rem 0.9rem 0.9rem}
        .peca-nome{font-size:0.85rem;font-weight:500;margin-bottom:0.15rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .peca-sub{font-size:0.72rem;color:var(--g4)}
        .peca-preco{font-size:0.8rem;color:var(--g4);margin-top:0.2rem}
        .tag{font-size:0.62rem;letter-spacing:0.08em;text-transform:uppercase;padding:0.14rem 0.4rem;background:var(--g1);color:var(--g4)}
        .tag-rosa{background:rgba(196,116,138,0.1);color:var(--rosa)}

        .lojas-list{display:flex;flex-direction:column;gap:1px;background:var(--g2)}
        .loja-row{background:var(--white);display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;text-decoration:none;color:var(--black);transition:background 0.15s}
        .loja-row:hover{background:var(--g1)}
        .loja-nome{font-size:0.92rem;font-weight:500}
        .loja-local{font-size:0.72rem;color:var(--g4);margin-top:0.1rem}
        .loja-link{font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--rosa)}

        .estado-central{text-align:center;padding:4rem 2rem;color:var(--g4);font-size:0.82rem;letter-spacing:0.08em}
        .estado-icon{font-size:2rem;margin-bottom:0.8rem;opacity:0.3}
        .estado-titulo{font-family:var(--serif);font-size:1.6rem;font-weight:300;color:var(--black);margin-bottom:0.4rem}
        .resultado-count{font-size:0.72rem;color:var(--g4);letter-spacing:0.1em;margin-bottom:1.5rem}
      `}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <div style={{display:"flex",alignItems:"center",gap:"1.5rem"}}>
          <div style={{display:"flex",gap:"0.4rem"}}>
            {["pt","fr","lt"].map(l => (
              <button key={l} onClick={() => { localStorage.setItem("ng_lang",l); setLang(l); }} style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",background:"none",border:"none",cursor:"pointer",fontFamily:"'Jost',sans-serif",color:lang===l?"var(--black)":"var(--g4)",fontWeight:lang===l?500:300}}>{l.toUpperCase()}</button>
            ))}
          </div>
          <a href="/" className="nav-back">{t.voltar}</a>
        </div>
      </nav>

      <div className="search-wrap">
        {/* Barra de pesquisa */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t.placeholder}
            autoComplete="off"
          />
          {query && (
            <button className="search-clear" onClick={() => { setQuery(""); setPecas([]); setLojas([]); setBuscado(false); inputRef.current?.focus(); }}>✕</button>
          )}
        </div>

        {/* Estado vazio */}
        {!buscado && !loading && (
          <div className="estado-central">
            <div className="estado-icon">🔍</div>
            <div className="estado-titulo">{t.procura}</div>
          </div>
        )}

        {/* A carregar */}
        {loading && (
          <div className="estado-central">...</div>
        )}

        {/* Sem resultados */}
        {buscado && !loading && totalResultados === 0 && (
          <div className="estado-central">
            <div className="estado-icon">○</div>
            <p>{t.semResultados} "{query}"</p>
          </div>
        )}

        {/* Resultados */}
        {buscado && !loading && totalResultados > 0 && (
          <>
            <p className="resultado-count">{totalResultados} {t.resultados}</p>

            {/* Peças */}
            {pecas.length > 0 && (
              <div className="secao">
                <div className="secao-label">{t.pecas} ({pecas.length})</div>
                <div className="grid-pecas">
                  {pecas.map(p => (
                    <a key={p.id} href={`/loja/${p.clientes?.codigo_cliente}/peca/${p.id}`} className="peca-card">
                      {p.fotos?.[0]
                        ? <img src={p.fotos[0]} className="peca-foto" alt={p.nome} />
                        : <div className="peca-foto-ph"><span className="peca-foto-ph-txt">NG</span></div>
                      }
                      <div className="peca-info">
                        <div className="peca-nome">{p.nome}</div>
                        {p.clientes?.nome && <div className="peca-sub">{p.clientes.nome}</div>}
                        <div className="peca-preco">
                          {p.preco_aluguer_dia && <span>{p.preco_aluguer_dia}€/dia</span>}
                          {p.preco_aluguer_dia && p.preco_venda && <span style={{margin:"0 0.3rem",color:"var(--g2)"}}>·</span>}
                          {p.preco_venda && <span>{p.preco_venda}€</span>}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Lojas */}
            {lojas.length > 0 && (
              <div className="secao">
                <div className="secao-label">{t.lojas} ({lojas.length})</div>
                <div className="lojas-list">
                  {lojas.map(l => (
                    <a key={l.id} href={`/loja/${l.codigo_cliente}`} className="loja-row">
                      <div>
                        <div className="loja-nome">{l.nome}</div>
                        {l.cidade && <div className="loja-local">{l.cidade}{l.pais ? `, ${l.pais}` : ""}</div>}
                      </div>
                      <span className="loja-link">{t.verLoja} →</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
