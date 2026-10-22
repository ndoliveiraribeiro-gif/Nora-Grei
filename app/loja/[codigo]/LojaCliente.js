"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

function Estrelas({ nota, size = "0.85rem" }) {
  const arredondado = Math.round(nota);
  return (
    <span style={{ display: "inline-flex", gap: "0.1rem" }}>
      {[1, 2, 3, 4, 5].map(v => (
        <span key={v} style={{ fontSize: size, color: v <= arredondado ? "#c4748a" : "rgba(255,255,255,0.2)" }}>★</span>
      ))}
    </span>
  );
}

const T = {
  pt: {
    voltar: "← Lojistas",
    alugar: "Alugar",
    comprar: "Comprar",
    dia: "/dia",
    semPecas: "Esta loja ainda não tem peças.",
    loading: "A carregar...",
    notFound: "Loja não encontrada.",
    pecas: "Peças",
    contactar: "Contactar",
    membro: "Membro Nora Grei",
    membroDesde: "Membro desde",
    seguir: "+ Seguir",
    aSeguir: "✓ A seguir",
    copiar: "Copiar ↗",
  },
  fr: {
    voltar: "← Boutiques",
    alugar: "Louer",
    comprar: "Acheter",
    dia: "/jour",
    semPecas: "Cette boutique n'a pas encore de pièces.",
    loading: "Chargement...",
    notFound: "Boutique introuvable.",
    pecas: "Pièces",
    contactar: "Contacter",
    membro: "Membre Nora Grei",
    membroDesde: "Membre depuis",
    seguir: "+ Suivre",
    aSeguir: "✓ Abonné(e)",
    copiar: "Copier ↗",
  },
  lt: {
    voltar: "← Parduotuvės",
    alugar: "Nuomoti",
    comprar: "Pirkti",
    dia: "/d.",
    semPecas: "Ši parduotuvė dar neturi drabužių.",
    loading: "Kraunama...",
    notFound: "Parduotuvė nerasta.",
    pecas: "Drabužiai",
    contactar: "Susisiekti",
    membro: "Nora Grei narė",
    membroDesde: "Narė nuo",
    seguir: "+ Sekti",
    aSeguir: "✓ Sekama",
    copiar: "Kopijuoti ↗",
  },
};

export default function LojaCliente({ lojaInicial, pecasIniciais }) {
  const [lang, setLang] = useState("pt");
  const [loja] = useState(lojaInicial);
  const [pecas] = useState(pecasIniciais || []);
  const [media, setMedia] = useState(null);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);
  const [aSegui, setASegui] = useState(false);
  const [seguirLoading, setSeguirLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [voltarUrl, setVoltarUrl] = useState("/lojas");

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    if (loja?.id) {
      carregarAvaliacoes(loja.id);
      carregarSeguir(loja.id);
    }
    // Detectar origem para o botão voltar
    try {
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      if (from === "perfil") { setVoltarUrl("/perfil"); return; }
      if (from === "mensagens") { setVoltarUrl("/mensagens"); return; }
      const ref = document.referrer;
      if (ref && ref.includes("/perfil")) setVoltarUrl("/perfil");
      else if (ref && ref.includes("/mensagens")) setVoltarUrl("/mensagens");
      else if (ref && ref.includes("/dashboard")) setVoltarUrl("/perfil");
    } catch {}
  }, [loja?.id]);

  const carregarAvaliacoes = async (lojistaId) => {
    const { data: avs } = await supabase
      .from("avaliacoes_lojista")
      .select("nota_cliente_lojista, nota_plataforma")
      .eq("lojista_id", lojistaId);
    if (!avs || avs.length === 0) return;
    const notas = [
      ...avs.filter(a => a.nota_cliente_lojista != null).map(a => a.nota_cliente_lojista),
      ...avs.filter(a => a.nota_plataforma != null).map(a => a.nota_plataforma),
    ];
    if (notas.length > 0) {
      const m = notas.reduce((s, n) => s + n, 0) / notas.length;
      setMedia(m.toFixed(1));
      setTotalAvaliacoes(avs.filter(a => a.nota_cliente_lojista != null).length);
    }
  };

  const carregarSeguir = async (lojistaId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);
    const { data } = await supabase
      .from("follows")
      .select("lojista_id")
      .eq("follower_id", user.id)
      .eq("lojista_id", lojistaId)
      .maybeSingle();
    setASegui(!!data);
  };

  const toggleSeguir = async () => {
    if (!currentUserId || seguirLoading) return;
    setSeguirLoading(true);
    if (aSegui) {
      await supabase.from("follows").delete()
        .eq("follower_id", currentUserId)
        .eq("lojista_id", loja.id);
      setASegui(false);
    } else {
      await supabase.from("follows").upsert(
        { follower_id: currentUserId, lojista_id: loja.id },
        { onConflict: "follower_id,lojista_id" }
      );
      setASegui(true);
    }
    setSeguirLoading(false);
  };

  const t = T[lang] || T.pt;
  const nomeVis = loja?.nome_publico || loja?.nome;
  const initials = nomeVis ? nomeVis.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "NG";
  const anoMembro = loja?.created_at ? new Date(loja.created_at).getFullYear() : null;
  const voltarLabel = voltarUrl === "/perfil"
    ? {pt:"← Perfil",fr:"← Profil",lt:"← Profilis"}[lang]||"← Perfil"
    : voltarUrl === "/mensagens"
    ? {pt:"← Mensagens",fr:"← Messages",lt:"← Žinutės"}[lang]||"← Mensagens"
    : t.voltar;

  if (!loja) return (
    <div style={{minHeight:"100svh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem",fontFamily:"'Jost',sans-serif",color:"#5a5855"}}>
      <p style={{fontSize:"0.75rem",letterSpacing:"0.2em",textTransform:"uppercase"}}>{t.notFound}</p>
      <a href={voltarUrl} style={{fontSize:"0.65rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#c4748a",textDecoration:"none"}}>{voltarLabel}</a>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--cream:#f8f7f5;--white:#fff;--g1:#f0eeeb;--g2:#e2dfda;--g4:#5a5855;--ink:#1a1816;--rosa:#c4748a;--serif:'Cormorant Garamond',serif;--sans:'Jost',sans-serif}
        html,body{overflow-x:hidden;background:var(--cream);color:var(--ink);font-family:var(--sans)}

        .loja-header{background:var(--ink);padding:2.5rem 1.5rem;position:relative;overflow:hidden}
        .loja-header-voltar{font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.45);text-decoration:none;font-family:var(--sans);display:inline-block;margin-bottom:2rem;transition:color 0.2s}
        .loja-header-voltar:hover{color:rgba(255,255,255,0.8)}
        .loja-header-inner{display:flex;align-items:flex-start;gap:1.5rem}
        .loja-avatar-lg{width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.08);overflow:hidden;border:2px solid rgba(255,255,255,0.15);flex-shrink:0}
        .loja-avatar-lg img{width:100%;height:100%;object-fit:cover}
        .loja-avatar-lg-initials{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:1.8rem;font-weight:300;color:var(--rosa)}
        .loja-header-info{flex:1;min-width:0}
        .loja-header-membro{font-size:0.58rem;letter-spacing:0.25em;text-transform:uppercase;color:var(--rosa);font-family:var(--sans);margin-bottom:0.4rem}
        .loja-header-nome{font-family:var(--serif);font-size:clamp(1.8rem,6vw,3rem);font-weight:300;color:#fff;line-height:1.1;margin-bottom:0.5rem}
        .loja-header-local{font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.4);font-family:var(--sans)}
        .loja-header-desc{font-size:0.82rem;color:rgba(255,255,255,0.6);line-height:1.6;margin-top:1rem;max-width:520px}
        .loja-header-ano{font-size:0.58rem;letter-spacing:0.15em;color:rgba(255,255,255,0.25);font-family:var(--sans);margin-top:0.75rem}
        .loja-header-deco{position:absolute;right:-1rem;top:-1rem;font-family:var(--serif);font-size:8rem;font-weight:300;color:rgba(255,255,255,0.04);line-height:1;pointer-events:none;user-select:none}
        .loja-header-meta{display:flex;align-items:center;gap:1rem;margin-top:0.85rem;flex-wrap:wrap}
        .loja-rating-bloco{display:flex;align-items:center;gap:0.4rem;text-decoration:none;cursor:pointer}
        .loja-rating-num{font-size:0.78rem;font-weight:500;color:#fff;font-family:var(--sans)}
        .loja-rating-count{font-size:0.62rem;color:rgba(255,255,255,0.35);font-family:var(--sans)}
        .btn-seguir{font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);padding:0.3rem 0.85rem;border:1px solid;cursor:pointer;transition:all 0.2s;background:none;border-radius:0}
        .btn-seguir.ativo{border-color:var(--rosa);color:var(--rosa)}
        .btn-seguir.inativo{border-color:rgba(255,255,255,0.3);color:rgba(255,255,255,0.6)}
        .btn-seguir:hover.inativo{border-color:var(--rosa);color:var(--rosa)}
        .btn-seguir:hover.ativo{border-color:rgba(255,255,255,0.5);color:rgba(255,255,255,0.5)}

        .loja-share-bar{background:rgba(255,255,255,0.04);border-top:1px solid rgba(255,255,255,0.08);padding:0.75rem 1.5rem;display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap}
        .share-label{font-size:0.58rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);font-family:var(--sans)}
        .share-url{font-size:0.72rem;color:rgba(255,255,255,0.5);font-family:var(--sans);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .share-copy{font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;padding:0.3rem 0.65rem;border:1px solid rgba(255,255,255,0.2);background:none;color:rgba(255,255,255,0.5);font-family:var(--sans);cursor:pointer;transition:all 0.2s;white-space:nowrap}
        .share-copy:hover{border-color:var(--rosa);color:var(--rosa)}

        .pecas-sec{padding:2rem 1.5rem}
        .pecas-label{font-size:0.62rem;letter-spacing:0.28em;text-transform:uppercase;color:var(--rosa);font-family:var(--sans);margin-bottom:1.25rem}
        .pecas-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .peca-card{display:block;text-decoration:none;background:var(--white);border:1px solid var(--g2);overflow:hidden;transition:border-color 0.2s}
        .peca-card:hover{border-color:var(--rosa)}
        .peca-img{aspect-ratio:3/4;overflow:hidden;background:var(--g1)}
        .peca-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease}
        .peca-card:hover .peca-img img{transform:scale(1.03)}
        .peca-info{padding:0.75rem}
        .peca-cat{font-size:0.55rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--g4);font-family:var(--sans);margin-bottom:0.2rem}
        .peca-nome{font-family:var(--serif);font-size:0.95rem;font-weight:400;color:var(--ink);line-height:1.2;margin-bottom:0.35rem}
        .peca-precos{display:flex;gap:0.6rem;align-items:baseline;flex-wrap:wrap}
        .peca-aluguer{font-size:0.72rem;color:var(--rosa);font-family:var(--sans);font-weight:500}
        .peca-venda{font-size:0.65rem;color:var(--g4);font-family:var(--sans)}
        .sem-pecas{padding:3rem 1.5rem;text-align:center;font-family:var(--serif);font-size:1.1rem;font-weight:300;color:var(--g4)}

        @media(min-width:600px){.pecas-grid{grid-template-columns:repeat(3,1fr)}}
        @media(min-width:900px){
          .loja-header{padding:3rem 4rem}
          .loja-share-bar{padding:0.75rem 4rem}
          .pecas-sec{padding:2.5rem 4rem}
          .pecas-grid{grid-template-columns:repeat(4,1fr);gap:10px}
          .loja-avatar-lg{width:88px;height:88px}
        }
      `}</style>

      <div className="loja-header">
        <a href={voltarUrl} className="loja-header-voltar">{voltarLabel}</a>
        <div className="loja-header-deco">NG</div>
        <div className="loja-header-inner">
          <div className="loja-avatar-lg">
            {loja.foto_perfil
              ? <img src={loja.foto_perfil} alt={nomeVis} />
              : <div className="loja-avatar-lg-initials">{initials}</div>
            }
          </div>
          <div className="loja-header-info">
            <p className="loja-header-membro">{t.membro}</p>
            <h1 className="loja-header-nome">{nomeVis}</h1>
            {(loja.cidade || loja.pais) && (
              <p className="loja-header-local">{[loja.cidade, loja.pais].filter(Boolean).join(", ")}</p>
            )}
            {loja.descricao && <p className="loja-header-desc">{loja.descricao}</p>}
            {anoMembro && <p className="loja-header-ano">{t.membroDesde} {anoMembro}</p>}
            <div className="loja-header-meta">
              {media && (
                <a href={`/loja/${loja.codigo_cliente}/avaliacoes`} className="loja-rating-bloco">
                  <span className="loja-rating-num">{media}</span>
                  <Estrelas nota={parseFloat(media)} size="0.78rem" />
                  {totalAvaliacoes > 0 && (
                    <span className="loja-rating-count">({totalAvaliacoes})</span>
                  )}
                </a>
              )}
              {currentUserId && (
                <button
                  onClick={toggleSeguir}
                  disabled={seguirLoading}
                  className={`btn-seguir ${aSegui ? "ativo" : "inativo"}`}
                >
                  {aSegui ? t.aSeguir : t.seguir}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de partilha + Contactar */}
      <div className="loja-share-bar">
        <span className="share-label">Link</span>
        <span className="share-url">noragrei.com/loja/{loja.codigo_cliente}</span>
        <button className="share-copy" onClick={() => {
          navigator.clipboard.writeText(`${window.location.origin}/loja/${loja.codigo_cliente}`);
        }}>{t.copiar}</button>
        <a href={`/mensagens?lojista=${loja.id}`} className="share-copy" style={{textDecoration:"none",display:"inline-block"}}>
          {t.contactar || "Contactar"}
        </a>
      </div>

      <section className="pecas-sec">
        <p className="pecas-label">{t.pecas} — {pecas.length}</p>
        {pecas.length === 0 ? (
          <p className="sem-pecas">{t.semPecas}</p>
        ) : (
          <div className="pecas-grid">
            {pecas.map(p => (
              <a key={p.id} href={`/catalogo/${p.id}`} className="peca-card">
                <div className="peca-img">
                  {p.fotos?.[0] && <img src={p.fotos[0]} alt={p.nome} loading="lazy" />}
                </div>
                <div className="peca-info">
                  {p.categorias?.nome && <p className="peca-cat">{p.categorias.nome}</p>}
                  <p className="peca-nome">{p.nome}</p>
                  <div className="peca-precos">
                    {p.preco_aluguer_dia && <span className="peca-aluguer">{p.preco_aluguer_dia}€{t.dia}</span>}
                    {p.preco_venda && <span className="peca-venda">{p.preco_venda}€</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
