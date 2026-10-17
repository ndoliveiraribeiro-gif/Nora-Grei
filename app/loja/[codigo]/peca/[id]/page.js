"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function PecaLojaPage() {
  const { codigo, id } = useParams();
  const [peca, setPeca] = useState(null);
  const [lojista, setLojista] = useState(null);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("");
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [loading, setLoading] = useState(true);
  const [partilhado, setPartilhado] = useState(false);
  const [dataFimTimer, setDataFimTimer] = useState(null);

  useEffect(() => {
    if (codigo && id) carregarDados();
  }, [codigo, id]);

  const carregarDados = async () => {
    const { data: cli } = await supabase
      .from("clientes")
      .select("id, nome, codigo_cliente, iban")
      .eq("codigo_cliente", codigo)
      .maybeSingle();
    if (cli) setLojista(cli);

    const { data } = await supabase
      .from("pecas_lojista")
      .select("*, stock_lojista(id, tamanho, quantidade_disponivel)")
      .eq("id", id)
      .maybeSingle();
    if (data) {
      setPeca(data);
      const disponivel = data.stock_lojista?.find(s => s.quantidade_disponivel > 0);
      if (disponivel) setTamanhoSelecionado(disponivel.id);

      // Buscar data_fim do aluguer ativo para mostrar timer
      const stockIds = (data.stock_lojista || []).map(s => s.id);
      if (stockIds.length > 0) {
        const { data: alug } = await supabase
          .from("alugueres_lojista")
          .select("data_fim, data_disponivel_novamente")
          .in("stock_lojista_id", stockIds)
          .eq("estado", "ativo")
          .order("data_fim", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (alug) {
          setDataFimTimer(alug.data_disponivel_novamente || alug.data_fim);
        }
      }
    }
    setLoading(false);
  };

  const irParaCheckout = () => {
    if (!tamanhoSelecionado) return;
    window.location.href = `/loja/${codigo}/checkout?peca=${id}&tamanho=${tamanhoSelecionado}`;
  };

  const adicionarAoCesto = () => {
    if (!tamanhoSelecionado) return;
    const stockSel = peca?.stock_lojista?.find(s => s.id === tamanhoSelecionado);
    let cesto = [];
    try { cesto = JSON.parse(localStorage.getItem("ng_cesto") || "[]"); } catch (_) {}
    const jaExiste = cesto.some(i => i.pecaId === id && i.tamanhoNome === (stockSel?.tamanho || tamanhoSelecionado));
    if (!jaExiste) {
      cesto.push({
        pecaId: id,
        stockId: tamanhoSelecionado,
        tamanhoNome: stockSel?.tamanho || tamanhoSelecionado,
        pecaNome: peca?.nome,
        precoDia: peca?.preco_aluguer_dia,
        valorPeca: peca?.valor_peca,
        fotos: peca?.fotos,
        dataInicio: null,
        dataFim: null,
        lojaCodigo: codigo,
      });
      localStorage.setItem("ng_cesto", JSON.stringify(cesto));
      window.dispatchEvent(new Event("cesto-atualizado"));
    }
    window.location.href = "/cesto";
  };

  const partilharLoja = async () => {
    const url = `${window.location.origin}/loja/${codigo}`;
    try { await navigator.share({ title: lojista?.nome, url }); }
    catch { await navigator.clipboard.writeText(url); setPartilhado(true); setTimeout(() => setPartilhado(false), 2000); }
  };

  const partilharPeca = async () => {
    const url = window.location.href;
    try { await navigator.share({ title: peca?.nome, text: `${peca?.nome} — ${lojista?.nome}`, url }); }
    catch { await navigator.clipboard.writeText(url); setPartilhado(true); setTimeout(() => setPartilhado(false), 2000); }
  };

  const stockDisponivel = peca?.stock_lojista?.filter(s => s.quantidade_disponivel > 0) || [];

  function Timer({ dataFim }) {
    const [tempo, setTempo] = useState("");
    useEffect(() => {
      if (!dataFim) return;
      const calc = () => {
        const diff = new Date(dataFim) - new Date();
        if (diff <= 0) { setTempo("Disponível em breve"); return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTempo(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
      };
      calc();
      const iv = setInterval(calc, 1000);
      return () => clearInterval(iv);
    }, [dataFim]);
    return <span className="timer-count">{tempo}</span>;
  }

  if (loading) return (
    <>
      <style>{ESTILOS}</style>
      <div className="loading">...</div>
    </>
  );

  if (!peca) return (
    <>
      <style>{ESTILOS}</style>
      <div className="loading">Peça não encontrada.</div>
    </>
  );

  return (
    <>
      <style>{ESTILOS}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <a href={`/loja/${codigo}`} className="nav-back">← {lojista?.nome || "Loja"}</a>
      </nav>

      <div className="page">
        {/* Galeria */}
        <div className="galeria">
          <div className="foto-principal">
            {peca.fotos?.[fotoAtiva]
              ? <img src={peca.fotos[fotoAtiva]} alt={peca.nome} className="foto-img"/>
              : <div className="foto-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="48" height="48"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                </div>
            }
          </div>
          {peca.fotos?.length > 1 && (
            <div className="thumbnails">
              {peca.fotos.map((f, i) => (
                <img key={i} src={f} alt="" className={`thumb${fotoAtiva===i?" ativa":""}`} onClick={() => setFotoAtiva(i)}/>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div className="detalhes">
          {lojista && (
            <p className="loja-nome">{lojista.nome}</p>
          )}
          <h1 className="peca-nome">{peca.nome}</h1>

          {peca.tipo === "ambos" || peca.tipo === "alugar" ? (
            <p className="preco-aluguer">{peca.preco_aluguer_dia}€ / dia</p>
          ) : null}
          {peca.tipo === "ambos" || peca.tipo === "comprar" ? (
            <p className="preco-compra">Compra: {peca.preco_venda}€</p>
          ) : null}

          {peca.descricao && (
            <p className="descricao">{peca.descricao}</p>
          )}

          {/* Tamanhos */}
          {stockDisponivel.length > 0 && (
            <div className="sec-tamanho">
              <p className="sec-label">Tamanho</p>
              <div className="tamanhos">
                {peca.stock_lojista?.map(s => (
                  <button
                    key={s.id}
                    className={`tam-btn${tamanhoSelecionado===s.id?" on":""}${s.quantidade_disponivel===0?" esgotado":""}`}
                    onClick={() => s.quantidade_disponivel > 0 && setTamanhoSelecionado(s.id)}
                    disabled={s.quantidade_disponivel === 0}
                  >
                    {s.tamanho}
                    {s.quantidade_disponivel === 0 && <span className="esgotado-linha"/>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {stockDisponivel.length === 0 ? (
            <div className="esgotado-bloco">
              {dataFimTimer && (
                <div className="timer-bloco">
                  <p className="timer-label">Disponível em</p>
                  <Timer dataFim={dataFimTimer} />
                </div>
              )}
              <a
                href={`/reserva?peca=${id}&loja=${codigo}`}
                className="btn-reservar-disponivel"
              >
                Garantir reserva quando disponível
              </a>
            </div>
          ) : (
            <button
              className="btn-checkout"
              onClick={irParaCheckout}
              disabled={!tamanhoSelecionado}
            >
              {peca.tipo === "comprar" ? "Comprar" : "Reservar / Alugar"}
            </button>
            {peca.tipo !== "comprar" && (
              <button
                className="btn-cesto"
                onClick={adicionarAoCesto}
                disabled={!tamanhoSelecionado}
              >
                🛍 Adicionar ao cesto
              </button>
            )}
          )}

          {/* Botões de partilha */}
          <div className="partilha-sec">
            <p className="partilha-label">Partilhar</p>
            <div className="partilha-btns">
              <button className="btn-partilhar" onClick={partilharPeca}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
                Esta peça
              </button>
              <button className="btn-partilhar" onClick={partilharLoja}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                A loja toda
              </button>
            </div>
            {partilhado && <p className="copiado">✓ Link copiado!</p>}
          </div>

          {/* Links diretos para redes sociais */}
          <div className="redes">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${peca.nome} — ${lojista?.nome}\n${typeof window!=="undefined"?window.location.href:""}`)}`}
              target="_blank" rel="noopener"
              className="rede-link whatsapp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.12 1.523 5.854L0 24l6.335-1.5A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.657-.522-5.17-1.43l-.37-.22-3.76.891.9-3.66-.24-.38A9.951 9.951 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              WhatsApp
            </a>
            <a
              href={`https://www.instagram.com/`}
              target="_blank" rel="noopener"
              className="rede-link instagram"
              title="Copia o link e partilha no Instagram"
              onClick={partilharPeca}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              Instagram
            </a>
          </div>

          {peca.condicao && (
            <div className="info-extra">
              <span className="info-badge">{peca.condicao}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const ESTILOS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--rosa:#c4748a;--serif:'Cormorant',Georgia,serif;--sans:'Jost',Arial,sans-serif}
  body{background:var(--g1);font-family:var(--sans);-webkit-font-smoothing:antialiased}
  .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 4rem;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2)}
  .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:400;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
  .nav-back{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:#5a5855;text-decoration:none}
  .loading{min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:var(--sans);font-size:0.78rem;letter-spacing:0.2em;text-transform:uppercase;color:#888}
  .page{padding:6rem 4rem 4rem;max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start}
  .galeria{}
  .foto-principal{aspect-ratio:3/4;background:var(--white);overflow:hidden;margin-bottom:0.75rem}
  .foto-img{width:100%;height:100%;object-fit:cover}
  .foto-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--g2)}
  .thumbnails{display:flex;gap:0.5rem;flex-wrap:wrap}
  .thumb{width:72px;height:90px;object-fit:cover;cursor:pointer;opacity:0.6;transition:opacity 0.2s}
  .thumb.ativa{opacity:1;outline:2px solid var(--black)}
  .detalhes{padding-top:1rem}
  .loja-nome{font-size:0.68rem;letter-spacing:0.25em;text-transform:uppercase;color:#5a5855;margin-bottom:0.75rem}
  .peca-nome{font-family:var(--serif);font-size:2.4rem;font-weight:300;line-height:1.2;color:var(--black);margin-bottom:1.25rem}
  .preco-aluguer{font-size:1.5rem;font-family:var(--serif);color:var(--black);margin-bottom:0.35rem}
  .preco-compra{font-size:0.85rem;color:#5a5855;margin-bottom:1.5rem}
  .descricao{font-size:0.95rem;color:#5a5855;line-height:1.7;margin-bottom:2rem}
  .sec-label{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:#5a5855;margin-bottom:0.75rem;font-weight:500}
  .sec-tamanho{margin-bottom:2rem}
  .tamanhos{display:flex;flex-wrap:wrap;gap:0.5rem}
  .tam-btn{padding:0.6rem 1.1rem;border:1.5px solid var(--g2);background:var(--white);font-size:0.82rem;font-family:var(--sans);cursor:pointer;position:relative;transition:all 0.15s}
  .tam-btn.on{border-color:var(--black);background:var(--black);color:var(--white)}
  .tam-btn.esgotado{opacity:0.4;cursor:not-allowed}
  .esgotado-linha{position:absolute;top:50%;left:0;right:0;height:1px;background:currentColor;opacity:0.5}
  .btn-checkout{width:100%;padding:1.2rem;background:var(--black);color:var(--white);border:none;font-size:0.78rem;letter-spacing:0.2em;text-transform:uppercase;font-family:var(--sans);font-weight:500;cursor:pointer;transition:background 0.2s;margin-bottom:2rem}
  .btn-checkout:hover{background:#2a2926}
  .btn-checkout:disabled{opacity:0.5;cursor:not-allowed}
  .btn-cesto{width:100%;padding:1rem;background:transparent;color:var(--black);border:1.5px solid var(--black);font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.4rem;margin-bottom:1.5rem}
  .btn-cesto:hover{background:var(--g1)}
  .btn-cesto:disabled{opacity:0.4;cursor:not-allowed}
  .esgotado-bloco{margin-bottom:2rem}
  .timer-bloco{background:var(--g1);border:1px solid var(--g2);padding:1rem 1.25rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between}
  .timer-label{font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:#5a5855;font-weight:500}
  .timer-count{font-family:var(--serif);font-size:1.5rem;font-weight:300;color:var(--black);letter-spacing:0.05em}
  .btn-reservar-disponivel{display:block;width:100%;padding:1.2rem;background:transparent;color:var(--black);border:1.5px solid var(--black);font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;font-family:var(--sans);font-weight:500;cursor:pointer;transition:all 0.2s;text-align:center;text-decoration:none}
  .btn-reservar-disponivel:hover{background:var(--black);color:var(--white)}
  .partilha-sec{border-top:1px solid var(--g2);padding-top:1.5rem;margin-bottom:1.5rem}
  .partilha-label{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:#5a5855;margin-bottom:0.75rem;font-weight:500}
  .partilha-btns{display:flex;gap:0.75rem;flex-wrap:wrap}
  .btn-partilhar{display:flex;align-items:center;gap:0.5rem;padding:0.65rem 1.1rem;border:1.5px solid var(--g2);background:var(--white);font-size:0.75rem;font-family:var(--sans);cursor:pointer;color:var(--black);transition:border-color 0.2s}
  .btn-partilhar:hover{border-color:var(--black)}
  .copiado{font-size:0.78rem;color:#27ae60;margin-top:0.5rem;font-weight:500}
  .redes{display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1.5rem}
  .rede-link{display:flex;align-items:center;gap:0.5rem;padding:0.65rem 1.1rem;text-decoration:none;font-size:0.75rem;font-family:var(--sans);font-weight:500;border:1.5px solid var(--g2);transition:all 0.2s}
  .rede-link.whatsapp{color:#25D366;border-color:#25D366}
  .rede-link.whatsapp:hover{background:#25D366;color:white}
  .rede-link.instagram{color:#E1306C;border-color:#E1306C}
  .rede-link.instagram:hover{background:#E1306C;color:white}
  .info-extra{margin-top:1rem}
  .info-badge{font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;padding:0.3rem 0.6rem;border:1px solid var(--g2);color:#5a5855}
  @media(max-width:768px){
    .nav{padding:1rem 1.25rem}
    .page{grid-template-columns:1fr;padding:5rem 1.25rem 4rem;gap:2rem}
    .peca-nome{font-size:1.9rem}
    .partilha-btns{flex-direction:column}
    .redes{flex-direction:column}
  }
`;
