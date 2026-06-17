"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PecaDetalhe() {
  const { id } = useParams();
  const router = useRouter();
  const [peca, setPeca] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);
  const [lang, setLang] = useState("pt");
  const [userLogado, setUserLogado] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved) setLang(saved);
    carregarPeca();
    verificarUser();
  }, [id]);

  const verificarUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) setUserLogado(session.user);
  };

  const carregarPeca = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("pecas")
      .select("*, categorias(nome), stock_tamanhos(id, tamanho, quantidade_total, quantidade_disponivel)")
      .eq("id", id)
      .single();
    if (data) {
      setPeca(data);
      const disponivel = data.stock_tamanhos?.find(s => s.quantidade_disponivel > 0);
      if (disponivel) setTamanhoSelecionado(disponivel.id);
    }
    setLoading(false);
  };

  const t = {
    pt: {
      voltar: "← Catálogo",
      alugar: "Alugar agora",
      reservar: "Reservar quando disponível",
      disponivel: "Disponível",
      indisponivel: "Indisponível",
      tamanho: "Tamanho",
      ocasioes: "Ocasiões",
      material: "Material",
      origem: "Origem",
      deposito: "Depósito de caução",
      depositoDesc: "Devolvido no final do aluguer",
      semTamanho: "Seleciona um tamanho",
      porcDia: "/dia",
      comprar: "Comprar",
    },
    fr: {
      voltar: "← Catalogue",
      alugar: "Louer maintenant",
      reservar: "Réserver quand disponible",
      disponivel: "Disponible",
      indisponivel: "Indisponible",
      tamanho: "Taille",
      ocasioes: "Occasions",
      material: "Matière",
      origem: "Origine",
      deposito: "Dépôt de garantie",
      depositoDesc: "Remboursé à la fin",
      semTamanho: "Sélectionne une taille",
      porcDia: "/jour",
      comprar: "Acheter",
    },
    lt: {
      voltar: "← Katalogas",
      alugar: "Nuomoti dabar",
      reservar: "Rezervuoti",
      disponivel: "Prieinama",
      indisponivel: "Neprieinama",
      tamanho: "Dydis",
      ocasioes: "Progos",
      material: "Medžiaga",
      origem: "Kilmė",
      deposito: "Užstatas",
      depositoDesc: "Grąžinamas pabaigoje",
      semTamanho: "Pasirink dydį",
      porcDia: "/d.",
      comprar: "Pirkti",
    },
  }[lang] || { voltar: "← Catálogo", alugar: "Alugar agora", reservar: "Reservar", disponivel: "Disponível", indisponivel: "Indisponível", tamanho: "Tamanho", ocasioes: "Ocasiões", material: "Material", origem: "Origem", deposito: "Depósito", depositoDesc: "Devolvido no final", semTamanho: "Seleciona um tamanho", porcDia: "/dia", comprar: "Comprar" };

  const irParaCheckout = () => {
    if (!tamanhoSelecionado) return;
    if (!userLogado) { router.push("/entrar"); return; }
    router.push(`/checkout?peca=${id}&tamanho=${tamanhoSelecionado}`);
  };

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',color:'#888',textTransform:'uppercase'}}>
      A carregar...
    </div>
  );

  if (!peca) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",gap:'1rem'}}>
      <p style={{fontSize:'0.85rem',color:'#888'}}>Peça não encontrada</p>
      <a href="/catalogo" style={{fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#080808'}}>← Voltar ao catálogo</a>
    </div>
  );

  const fotos = peca.fotos?.length > 0 ? peca.fotos : [null];
  const tamanhosDisponiveis = peca.stock_tamanhos?.filter(s => s.quantidade_disponivel > 0) || [];
  const tamanhosSemStock = peca.stock_tamanhos?.filter(s => s.quantidade_disponivel === 0) || [];
  const disponivel = peca.estado === "disponivel" && tamanhosDisponiveis.length > 0;
  const tamanhoAtivo = peca.stock_tamanhos?.find(s => s.id === tamanhoSelecionado);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --black:#080808; --white:#f8f7f5; --g1:#f0eeeb; --g2:#e2dfda; --rosa:#c4748a; --serif:'Cormorant',Georgia,serif; --sans:'Jost',Arial,sans-serif; }
        body { background:var(--white); font-family:var(--sans); -webkit-font-smoothing:antialiased; color:var(--black); }
        .nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.25rem 4rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--g2); }
        .nav-logo { font-family:var(--serif); font-size:1.2rem; font-weight:300; letter-spacing:0.25em; text-transform:uppercase; text-decoration:none; color:var(--black); }
        .nav-back { font-size:0.78rem; letter-spacing:0.15em; text-transform:uppercase; color:#3a3835; text-decoration:none; transition:color 0.2s; }
        .nav-back:hover { color:var(--black); }
        .layout { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; padding-top:72px; }
        .fotos { position:sticky; top:72px; height:calc(100vh - 72px); display:flex; flex-direction:column; gap:0.5rem; padding:1.5rem; background:var(--g1); }
        .foto-main { flex:1; overflow:hidden; position:relative; }
        .foto-main img { width:100%; height:100%; object-fit:cover; object-position:center top; }
        .foto-placeholder { width:100%; height:100%; background:linear-gradient(160deg,#e8e4e0,#d5d0c8); display:flex; align-items:center; justify-content:center; }
        .fotos-thumb { display:flex; gap:0.5rem; height:80px; }
        .thumb { flex:1; cursor:pointer; overflow:hidden; opacity:0.6; transition:opacity 0.2s; border:2px solid transparent; }
        .thumb.active { opacity:1; border-color:var(--black); }
        .thumb img { width:100%; height:100%; object-fit:cover; }
        .info { padding:3rem; overflow-y:auto; }
        .badge-cat { font-size:0.6rem; letter-spacing:0.25em; text-transform:uppercase; color:#aaa89f; margin-bottom:0.5rem; }
        .nome { font-family:var(--serif); font-size:clamp(2rem,3vw,3rem); font-weight:300; line-height:1.1; margin-bottom:1rem; }
        .preco-row { display:flex; align-items:baseline; gap:0.5rem; margin-bottom:0.5rem; }
        .preco-val { font-family:var(--serif); font-size:2rem; font-weight:300; }
        .preco-unit { font-size:0.72rem; color:#aaa89f; letter-spacing:0.1em; }
        .badge-estado { display:inline-block; font-size:0.58rem; letter-spacing:0.18em; text-transform:uppercase; padding:0.3rem 0.75rem; margin-bottom:1.5rem; }
        .secao { margin-bottom:1.75rem; }
        .secao-label { font-size:0.62rem; letter-spacing:0.22em; text-transform:uppercase; color:#5a5855; margin-bottom:0.75rem; }
        .tamanhos-grid { display:flex; gap:0.5rem; flex-wrap:wrap; }
        .tam-btn { padding:0.5rem 1rem; font-size:0.72rem; letter-spacing:0.1em; font-family:var(--sans); border:1.5px solid var(--g2); background:var(--white); cursor:pointer; transition:all 0.2s; }
        .tam-btn:hover { border-color:var(--black); }
        .tam-btn.active { background:var(--black); color:var(--white); border-color:var(--black); }
        .tam-btn.sem-stock { opacity:0.35; cursor:not-allowed; text-decoration:line-through; }
        .ocasioes-wrap { display:flex; gap:0.4rem; flex-wrap:wrap; }
        .ocasiao-tag { font-size:0.62rem; letter-spacing:0.1em; padding:0.3rem 0.65rem; background:var(--g1); color:#5a5855; border:1px solid var(--g2); }
        .sep { border:none; border-top:1px solid var(--g2); margin:1.5rem 0; }
        .info-row { display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0; border-bottom:1px solid var(--g1); font-size:0.85rem; }
        .info-key { color:#5a5855; font-size:0.72rem; letter-spacing:0.1em; }
        .deposito-box { background:var(--g1); padding:1rem 1.25rem; margin-bottom:1.5rem; }
        .deposito-val { font-family:var(--serif); font-size:1.5rem; font-weight:300; }
        .deposito-desc { font-size:0.72rem; color:#5a5855; margin-top:0.2rem; }
        .btn-alugar { width:100%; padding:1.1rem; background:var(--black); color:var(--white); border:none; font-size:0.72rem; letter-spacing:0.2em; text-transform:uppercase; font-family:var(--sans); cursor:pointer; transition:background 0.2s; margin-bottom:0.75rem; }
        .btn-alugar:hover { background:#2a2926; }
        .btn-alugar:disabled { background:#ccc; cursor:not-allowed; }
        .btn-reservar { width:100%; padding:1rem; background:var(--white); color:var(--black); border:1.5px solid var(--g2); font-size:0.68rem; letter-spacing:0.18em; text-transform:uppercase; font-family:var(--sans); cursor:pointer; transition:border-color 0.2s; text-decoration:none; display:block; text-align:center; }
        .btn-reservar:hover { border-color:var(--black); }
        .descricao { font-size:0.92rem; line-height:1.7; color:#3a3835; }
        @media(max-width:768px) {
          .nav { padding:1rem 1.5rem; }
          .layout { grid-template-columns:1fr; padding-top:60px; }
          .fotos { position:static; height:auto; padding:0; }
          .foto-main { height:70vw; }
          .fotos-thumb { height:60px; padding:0 0.75rem; }
          .info { padding:1.5rem; }
        }
      `}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <a href="/catalogo" className="nav-back">{t.voltar}</a>
      </nav>

      <div className="layout">
        {/* FOTOS */}
        <div className="fotos">
          <div className="foto-main">
            {fotos[fotoAtiva] ? (
              <img src={fotos[fotoAtiva]} alt={peca.nome} />
            ) : (
              <div className="foto-placeholder">
                <span style={{fontFamily:'var(--serif)',fontSize:'4rem',fontWeight:300,color:'rgba(0,0,0,0.08)',fontStyle:'italic'}}>NG</span>
              </div>
            )}
          </div>
          {fotos.length > 1 && (
            <div className="fotos-thumb">
              {fotos.map((f, i) => (
                <div key={i} className={`thumb${fotoAtiva === i ? " active" : ""}`} onClick={() => setFotoAtiva(i)}>
                  {f ? <img src={f} alt="" /> : <div style={{width:'100%',height:'100%',background:'var(--g2)'}} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="info">
          {peca.categorias?.nome && <p className="badge-cat">{peca.categorias.nome}</p>}
          <h1 className="nome">{peca.nome}</h1>

          <div className="preco-row">
            <span className="preco-val">{peca.preco_aluguer_dia}€</span>
            <span className="preco-unit">{t.porcDia}</span>
            {peca.preco_avulso && <>
              <span style={{color:'#ccc',fontSize:'0.8rem'}}>·</span>
              <span className="preco-val" style={{fontSize:'1.3rem'}}>{peca.preco_avulso}€</span>
              <span className="preco-unit">/ocasião</span>
            </>}
          </div>

          <span className="badge-estado" style={{background: disponivel ? '#e8f5e9' : '#f0eeeb', color: disponivel ? '#27ae60' : '#5a5855'}}>
            {disponivel ? t.disponivel : t.indisponivel}
          </span>

          {/* TAMANHOS */}
          {peca.stock_tamanhos?.length > 0 && (
            <div className="secao">
              <p className="secao-label">{t.tamanho}</p>
              <div className="tamanhos-grid">
                {tamanhosDisponiveis.map(s => (
                  <button key={s.id} className={`tam-btn${tamanhoSelecionado === s.id ? " active" : ""}`} onClick={() => setTamanhoSelecionado(s.id)}>
                    {s.tamanho}
                  </button>
                ))}
                {tamanhosSemStock.map(s => (
                  <button key={s.id} className="tam-btn sem-stock" disabled>{s.tamanho}</button>
                ))}
              </div>
            </div>
          )}

          {/* OCASIÕES */}
          {peca.ocasioes?.length > 0 && (
            <div className="secao">
              <p className="secao-label">{t.ocasioes}</p>
              <div className="ocasioes-wrap">
                {peca.ocasioes.map(o => <span key={o} className="ocasiao-tag">{o}</span>)}
              </div>
            </div>
          )}

          {/* DEPÓSITO */}
          <div className="deposito-box">
            <p className="secao-label">{t.deposito}</p>
            <p className="deposito-val">{peca.valor_peca}€</p>
            <p className="deposito-desc">{t.depositoDesc}</p>
          </div>

          {/* BOTÕES */}
          {disponivel ? (
            <button className="btn-alugar" onClick={irParaCheckout} disabled={!tamanhoSelecionado}>
              {tamanhoSelecionado ? t.alugar : t.semTamanho}
            </button>
          ) : (
            <a href={`/reserva?peca=${id}`} className="btn-reservar">{t.reservar}</a>
          )}

          <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" className="btn-reservar" style={{marginTop:'0.5rem'}}>
            {t.comprar} ↗
          </a>

          <hr className="sep" />

          {/* DETALHES */}
          {peca.descricao && (
            <div className="secao">
              <p className="secao-label">Descrição</p>
              <p className="descricao">{peca.descricao}</p>
            </div>
          )}

          <div>
            {peca.material && <div className="info-row"><span className="info-key">{t.material}</span><span>{peca.material}</span></div>}
            {peca.origem && <div className="info-row"><span className="info-key">{t.origem}</span><span>{peca.origem}</span></div>}
            {peca.categorias?.nome && <div className="info-row"><span className="info-key">Categoria</span><span>{peca.categorias.nome}</span></div>}
          </div>
        </div>
      </div>
    </>
  );
}