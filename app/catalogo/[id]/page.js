"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function Timer({ dataFim, lang }) {
  const [tempo, setTempo] = useState("");
  const labels = { pt: "Disponível em", fr: "Disponible dans", lt: "Prieinama po" };
  useEffect(() => {
    const calc = () => {
      const diff = new Date(dataFim) - new Date();
      if (diff <= 0) { setTempo(""); return; }
      const dias = Math.floor(diff / 86400000);
      const horas = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (dias > 0) setTempo(`${dias}d ${horas}h`);
      else if (horas > 0) setTempo(`${horas}h ${mins}m`);
      else setTempo(`${mins}m`);
    };
    calc();
    const i = setInterval(calc, 60000);
    return () => clearInterval(i);
  }, [dataFim]);
  if (!tempo) return null;
  return (
    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'#fff8e1',padding:'0.75rem 1rem',marginBottom:'1rem',border:'1px solid #f39c12'}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:'#f39c12',flexShrink:0,animation:'pulse 2s infinite'}}/>
      <span style={{fontSize:'0.72rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#e67e22',fontFamily:"'Jost',sans-serif"}}>
        {labels[lang]||labels.pt} <strong>{tempo}</strong>
      </span>
    </div>
  );
}

const TRADUCOES = {
  pt: { voltar:"← Catálogo", alugar:"Alugar agora", reservar:"Reservar quando disponível", disponivel:"Disponível", indisponivel:"Indisponível", tamanho:"Tamanho", ocasioes:"Ocasiões", material:"Material", origem:"Origem", deposito:"Depósito de caução", depositoDesc:"Devolvido no final do aluguer", semTamanho:"Seleciona um tamanho", porcDia:"/dia", comprar:"Comprar", partilhar:"Partilhar", descricao:"Descrição", categoria:"Categoria", disponibilidade:"Disponibilidade", verCatalogo:"Ver catálogo completo", avaliacoes:"Avaliações", semAvaliacoes:"Ainda sem avaliações.", anonimo:"Cliente Nora Grei", livreEm:"livre em", reservarTamanho:"reservar" },
  fr: { voltar:"← Catalogue", alugar:"Louer maintenant", reservar:"Réserver quand disponible", disponivel:"Disponible", indisponivel:"Indisponible", tamanho:"Taille", ocasioes:"Occasions", material:"Matière", origem:"Origine", deposito:"Dépôt de garantie", depositoDesc:"Remboursé à la fin", semTamanho:"Sélectionne une taille", porcDia:"/jour", comprar:"Acheter", partilhar:"Partager", descricao:"Description", categoria:"Catégorie", disponibilidade:"Disponibilité", verCatalogo:"Voir tout le catalogue", avaliacoes:"Avis", semAvaliacoes:"Pas encore d'avis.", anonimo:"Cliente Nora Grei", livreEm:"libre le", reservarTamanho:"réserver" },
  lt: { voltar:"← Katalogas", alugar:"Nuomoti dabar", reservar:"Rezervuoti", disponivel:"Prieinama", indisponivel:"Neprieinama", tamanho:"Dydis", ocasioes:"Progos", material:"Medžiaga", origem:"Kilmė", deposito:"Užstatas", depositoDesc:"Grąžinamas pabaigoje", semTamanho:"Pasirink dydį", porcDia:"/d.", comprar:"Pirkti", partilhar:"Dalintis", descricao:"Aprašymas", categoria:"Kategorija", disponibilidade:"Prieinamumas", verCatalogo:"Peržiūrėti katalogą", avaliacoes:"Atsiliepimai", semAvaliacoes:"Dar nėra atsiliepimų.", anonimo:"Cliente Nora Grei", livreEm:"laisva", reservarTamanho:"rezervuoti" },
};

export default function PecaDetalhe() {
  const { id } = useParams();
  const router = useRouter();
  const [peca, setPeca] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);
  const [lang, setLang] = useState("pt");
  const [userLogado, setUserLogado] = useState(null);
  const [dataFimTimer, setDataFimTimer] = useState(null);
  const [partilhado, setPartilhado] = useState(false);
  const [datasPorTamanho, setDatasPorTamanho] = useState({});
  const [avaliacoesPeca, setAvaliacoesPeca] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && TRADUCOES[saved]) setLang(saved);
    carregarPeca();
    supabase.auth.getSession().then(({ data }) => { if (data.session) setUserLogado(data.session.user); });
  }, [id]);

  const carregarPeca = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("pecas")
      .select("*, categorias(nome), stock_tamanhos(id, tamanho, quantidade_total, quantidade_disponivel)")
      .eq("id", id)
      .single();

    if (data) {
      setPeca(data);
      // Selecionar primeiro tamanho disponível
      const primDisponivel = data.stock_tamanhos?.find(s => s.quantidade_disponivel > 0);
      if (primDisponivel) setTamanhoSelecionado(primDisponivel.id);

      // Buscar alugueres ativos para calcular datas de disponibilidade por tamanho
      const stockIds = data.stock_tamanhos?.map(s => s.id) || [];
      if (stockIds.length > 0) {
        const { data: alugueresAtivos } = await supabase
          .from("alugueres")
          .select("stock_tamanho_id, data_fim, data_disponivel_novamente, estado")
          .in("stock_tamanho_id", stockIds)
          .in("estado", ["pendente", "confirmado", "enviado", "ativo", "em_verificacao"]);

        if (alugueresAtivos && alugueresAtivos.length > 0) {
          const mapa = {};
          let dataMaisDistante = null;
          alugueresAtivos.forEach(a => {
            const dataDisp = a.data_disponivel_novamente
              ? new Date(a.data_disponivel_novamente)
              : new Date(new Date(a.data_fim).getTime() + 3 * 24 * 60 * 60 * 1000);
            // Mapa por tamanho
            if (!mapa[a.stock_tamanho_id] || dataDisp > mapa[a.stock_tamanho_id]) {
              mapa[a.stock_tamanho_id] = dataDisp;
            }
            // Data mais distante global para o timer
            if (!dataMaisDistante || dataDisp > dataMaisDistante) {
              dataMaisDistante = dataDisp;
            }
          });
          setDatasPorTamanho(mapa);
          if (dataMaisDistante) setDataFimTimer(dataMaisDistante.toISOString());
        }
      }

      // Buscar avaliações desta peça
      const { data: avs } = await supabase
        .from("avaliacoes")
        .select("nota_cliente_empresa, comentario_cliente, created_at, clientes(nome), alugueres(stock_tamanhos(pecas(id)))")
        .not("nota_cliente_empresa", "is", null)
        .order("created_at", { ascending: false });
      if (avs) {
        const filtradas = avs.filter(av => av.alugueres?.stock_tamanhos?.pecas?.id === id);
        setAvaliacoesPeca(filtradas);
      }
    }
    setLoading(false);
  };

  const t = TRADUCOES[lang] || TRADUCOES.pt;

  const irParaCheckout = () => {
    if (!tamanhoSelecionado) return;
    if (!userLogado) { router.push("/entrar"); return; }
    router.push(`/checkout?peca=${id}&tamanho=${tamanhoSelecionado}`);
  };

  const partilhar = (rede) => {
    const url = encodeURIComponent(window.location.href);
    const texto = encodeURIComponent(`${peca.nome} — Nora Grei | Aluga peças exclusivas de moda`);
    const links = {
      whatsapp: `https://wa.me/?text=${texto}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      link: null,
    };
    if (rede === "link") {
      navigator.clipboard.writeText(window.location.href);
      setPartilhado(true);
      setTimeout(() => setPartilhado(false), 2000);
    } else {
      window.open(links[rede], "_blank");
    }
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

  const fotos = peca.fotos?.filter(f => f)?.length > 0 ? peca.fotos.filter(f => f) : [null];
  const tamanhosDisponiveis = peca.stock_tamanhos?.filter(s => s.quantidade_disponivel > 0) || [];
  const tamanhosSemStock = peca.stock_tamanhos?.filter(s => s.quantidade_disponivel === 0) || [];
  const disponivel = tamanhosDisponiveis.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--rosa:#c4748a;--serif:'Cormorant',Georgia,serif;--sans:'Jost',Arial,sans-serif}
        body{background:var(--white);font-family:var(--sans);-webkit-font-smoothing:antialiased;color:var(--black)}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 4rem;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2)}
        .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:300;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
        .nav-back{font-size:0.78rem;letter-spacing:0.15em;text-transform:uppercase;color:#3a3835;text-decoration:none;transition:color 0.2s}
        .nav-back:hover{color:var(--black)}
        .layout{display:grid;grid-template-columns:1fr 1fr;min-height:100vh;padding-top:72px}
        .fotos{position:sticky;top:72px;height:calc(100vh - 72px);display:flex;flex-direction:column;gap:0.5rem;padding:1.5rem;background:var(--g1)}
        .foto-main{flex:1;overflow:hidden;position:relative}
        .foto-main img{width:100%;height:100%;object-fit:contain;background:var(--g1)}
        .foto-counter{position:absolute;top:1rem;right:1rem;background:rgba(8,8,8,0.6);color:#fff;font-size:0.65rem;letter-spacing:0.1em;padding:0.3rem 0.6rem;font-family:var(--sans)}
        .foto-placeholder{width:100%;height:100%;background:linear-gradient(160deg,#e8e4e0,#d5d0c8);display:flex;align-items:center;justify-content:center}
        .fotos-thumb{display:flex;gap:0.5rem;height:80px;overflow-x:auto}
        .thumb{flex-shrink:0;width:80px;cursor:pointer;overflow:hidden;opacity:0.5;transition:opacity 0.2s;border:2px solid transparent}
        .thumb.active{opacity:1;border-color:var(--black)}
        .thumb img{width:100%;height:100%;object-fit:cover}
        .info{padding:3rem;overflow-y:auto}
        .badge-cat{font-size:0.6rem;letter-spacing:0.25em;text-transform:uppercase;color:#aaa89f;margin-bottom:0.5rem}
        .nome{font-family:var(--serif);font-size:clamp(2rem,3vw,3rem);font-weight:300;line-height:1.1;margin-bottom:1rem}
        .preco-row{display:flex;align-items:baseline;gap:0.5rem;margin-bottom:0.75rem}
        .preco-val{font-family:var(--serif);font-size:2rem;font-weight:300}
        .preco-unit{font-size:0.72rem;color:#aaa89f;letter-spacing:0.1em}
        .badge-estado{display:inline-block;font-size:0.58rem;letter-spacing:0.18em;text-transform:uppercase;padding:0.3rem 0.75rem;margin-bottom:1.25rem}
        .secao{margin-bottom:1.75rem}
        .secao-label{font-size:0.62rem;letter-spacing:0.22em;text-transform:uppercase;color:#5a5855;margin-bottom:0.75rem}
        .tamanhos-grid{display:flex;gap:0.75rem;flex-wrap:wrap;align-items:flex-start}
        .tam-wrap{display:flex;flex-direction:column;align-items:center;gap:0.25rem}
        .tam-btn{padding:0.5rem 1rem;font-size:0.72rem;letter-spacing:0.1em;font-family:var(--sans);border:1.5px solid var(--g2);background:var(--white);cursor:pointer;transition:all 0.2s}
        .tam-btn:hover{border-color:var(--black)}
        .tam-btn.active{background:var(--black);color:var(--white);border-color:var(--black)}
        .tam-btn.sem-stock{opacity:0.4;cursor:not-allowed;text-decoration:line-through}
        .tam-data{font-size:0.54rem;color:var(--rosa);letter-spacing:0.08em;text-transform:uppercase}
        .tam-reservar{font-size:0.54rem;color:#5a5855;letter-spacing:0.08em;text-transform:uppercase;text-decoration:underline;cursor:pointer;background:none;border:none;font-family:var(--sans);padding:0}
        .tam-reservar:hover{color:var(--black)}
        .ocasioes-wrap{display:flex;gap:0.4rem;flex-wrap:wrap}
        .ocasiao-tag{font-size:0.62rem;letter-spacing:0.1em;padding:0.3rem 0.65rem;background:var(--g1);color:#5a5855;border:1px solid var(--g2)}
        .sep{border:none;border-top:1px solid var(--g2);margin:1.5rem 0}
        .info-row{display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0;border-bottom:1px solid var(--g1);font-size:0.85rem}
        .info-key{color:#5a5855;font-size:0.72rem;letter-spacing:0.1em}
        .deposito-box{background:var(--g1);padding:1rem 1.25rem;margin-bottom:1.5rem;border-left:3px solid var(--g2)}
        .deposito-val{font-family:var(--serif);font-size:1.5rem;font-weight:300}
        .deposito-desc{font-size:0.72rem;color:#5a5855;margin-top:0.2rem}
        .btn-alugar{width:100%;padding:1.1rem;background:var(--black);color:var(--white);border:none;font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;transition:background 0.2s;margin-bottom:0.75rem}
        .btn-alugar:hover{background:#2a2926}
        .btn-alugar:disabled{background:#ccc;cursor:not-allowed}
        .btn-reservar{width:100%;padding:1rem;background:var(--white);color:var(--black);border:1.5px solid var(--g2);font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;transition:border-color 0.2s;text-decoration:none;display:block;text-align:center;margin-bottom:0.75rem}
        .btn-reservar:hover{border-color:var(--black)}
        .btn-comprar{width:100%;padding:1rem;background:var(--rosa);color:var(--white);border:none;font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;text-decoration:none;display:block;text-align:center;transition:background 0.2s}
        .btn-comprar:hover{background:#a85c72}
        .descricao{font-size:0.92rem;line-height:1.7;color:#3a3835}
        .partilha{display:flex;gap:0.5rem;align-items:center;margin-top:1.5rem}
        .partilha-label{font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:#5a5855;margin-right:0.25rem}
        .partilha-btn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid var(--g2);background:var(--white);cursor:pointer;font-size:1rem;transition:all 0.2s;text-decoration:none;color:var(--black)}
        .partilha-btn:hover{border-color:var(--black);background:var(--g1)}
        @media(max-width:768px){
          .nav{padding:1rem 1.5rem}
          .layout{grid-template-columns:1fr;padding-top:60px}
          .fotos{position:static;height:auto;padding:0}
          .foto-main{height:75vw}
          .fotos-thumb{height:65px;padding:0.5rem 0.75rem}
          .thumb{width:65px}
          .info{padding:1.5rem}
          .nome{font-size:clamp(1.8rem,7vw,2.5rem)}
        }
      `}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <a href="/catalogo" className="nav-back">{t.voltar}</a>
      </nav>

      <div className="layout">
        <div className="fotos">
          <div className="foto-main">
            {fotos[fotoAtiva] ? (
              <img src={fotos[fotoAtiva]} alt={peca.nome} />
            ) : (
              <div className="foto-placeholder">
                <span style={{fontFamily:'var(--serif)',fontSize:'4rem',fontWeight:300,color:'rgba(0,0,0,0.08)',fontStyle:'italic'}}>NG</span>
              </div>
            )}
            {fotos.length > 1 && (
              <div className="foto-counter">{fotoAtiva + 1}/{fotos.length}</div>
            )}
          </div>
          {fotos.length > 1 && (
            <div className="fotos-thumb">
              {fotos.map((f, i) => (
                <div key={i} className={`thumb${fotoAtiva === i ? " active" : ""}`} onClick={() => setFotoAtiva(i)}>
                  {f ? <img src={f} alt="" /> : <div style={{width:'100%',height:'100%',background:'var(--g2)'}}/>}
                </div>
              ))}
            </div>
          )}
        </div>

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

          <span className="badge-estado" style={{background:disponivel?'#e8f5e9':'#f0eeeb',color:disponivel?'#27ae60':'#5a5855'}}>
            {disponivel ? t.disponivel : t.indisponivel}
          </span>

          {!disponivel && dataFimTimer && <Timer dataFim={dataFimTimer} lang={lang} />}

          {peca.stock_tamanhos?.length > 0 && (
            <div className="secao">
              <p className="secao-label">{t.tamanho}</p>
              <div className="tamanhos-grid">
                {tamanhosDisponiveis.map(s => (
                  <div key={s.id} className="tam-wrap">
                    <button className={`tam-btn${tamanhoSelecionado === s.id ? " active" : ""}`} onClick={() => setTamanhoSelecionado(s.id)}>
                      {s.tamanho}
                    </button>
                  </div>
                ))}
                {tamanhosSemStock.map(s => {
                  const dataDisp = datasPorTamanho[s.id];
                  const dataStr = dataDisp ? dataDisp.toLocaleDateString("pt-PT", { day:"numeric", month:"short" }) : null;
                  return (
                    <div key={s.id} className="tam-wrap">
                      <button className="tam-btn sem-stock" disabled>{s.tamanho}</button>
                      {dataStr && <span className="tam-data">{t.livreEm} {dataStr}</span>}
                      <a href={`/reserva?peca=${id}&tamanho=${s.id}`} className="tam-reservar">{t.reservarTamanho}</a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {peca.ocasioes?.length > 0 && (
            <div className="secao">
              <p className="secao-label">{t.ocasioes}</p>
              <div className="ocasioes-wrap">
                {peca.ocasioes.map(o => <span key={o} className="ocasiao-tag">{o}</span>)}
              </div>
            </div>
          )}

          <div className="deposito-box">
            <p className="secao-label">{t.deposito}</p>
            <p className="deposito-val">{peca.valor_peca}€</p>
            <p className="deposito-desc">{t.depositoDesc}</p>
          </div>

          {disponivel ? (
            <button className="btn-alugar" onClick={irParaCheckout} disabled={!tamanhoSelecionado}>
              {tamanhoSelecionado ? t.alugar : t.semTamanho}
            </button>
          ) : (
            <a href={`/reserva?peca=${id}`} className="btn-reservar">{t.reservar}</a>
          )}

          <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" className="btn-comprar">
            {t.comprar} — noragrei.com ↗
          </a>

          <hr className="sep" />

          {peca.descricao && (
            <div className="secao">
              <p className="secao-label">{t.descricao}</p>
              <p className="descricao">{peca.descricao}</p>
            </div>
          )}

          <div style={{marginBottom:'1.5rem'}}>
            {peca.material && <div className="info-row"><span className="info-key">{t.material}</span><span>{peca.material}</span></div>}
            {peca.origem && <div className="info-row"><span className="info-key">{t.origem}</span><span>{peca.origem}</span></div>}
            {peca.categorias?.nome && <div className="info-row"><span className="info-key">{t.categoria}</span><span>{peca.categorias.nome}</span></div>}
          </div>

          <div className="partilha">
            <span className="partilha-label">{t.partilhar}</span>
            <button className="partilha-btn" onClick={() => partilhar("whatsapp")} title="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.858L.057 23.998l6.305-1.654A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.64-.516-5.14-1.41l-.368-.218-3.812 1 1.021-3.727-.239-.385A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            </button>
            <button className="partilha-btn" onClick={() => partilhar("facebook")} title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            <a className="partilha-btn" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <button className="partilha-btn" onClick={() => partilhar("link")} title="Copiar link">
              {partilhado ? "✓" : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>}
            </button>
          </div>

          {/* AVALIAÇÕES */}
          <div style={{marginTop:'2rem',paddingTop:'1.5rem',borderTop:'1px solid var(--g2)'}}>
            <p style={{fontSize:'0.6rem',letterSpacing:'0.25em',textTransform:'uppercase',color:'#5a5855',marginBottom:'1rem',fontWeight:600}}>{t.avaliacoes}</p>
            {avaliacoesPeca.length === 0 ? (
              <p style={{fontSize:'0.85rem',color:'#9c9894',fontStyle:'italic'}}>{t.semAvaliacoes}</p>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {avaliacoesPeca.map((av, idx) => (
                  <div key={idx} style={{padding:'1rem',background:'var(--g1)',borderLeft:'3px solid #c4748a'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.4rem'}}>
                      <div style={{display:'flex',gap:'0.15rem'}}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{fontSize:'1rem',color:s <= av.nota_cliente_empresa ? '#c4748a' : '#e2dfda'}}>★</span>
                        ))}
                      </div>
                      <span style={{fontSize:'0.65rem',color:'#9c9894'}}>{av.clientes?.nome || t.anonimo}</span>
                    </div>
                    {av.comentario_cliente && (
                      <p style={{fontSize:'0.85rem',color:'#3f3e3c',fontStyle:'italic',lineHeight:1.6}}>"{av.comentario_cliente}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <a href="/catalogo" style={{display:'block',textAlign:'center',fontSize:'0.68rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#5a5855',marginTop:'2rem',textDecoration:'none',paddingTop:'1rem',borderTop:'1px solid var(--g2)'}}>
            {t.verCatalogo} →
          </a>
        </div>
      </div>
    </>
  );
}