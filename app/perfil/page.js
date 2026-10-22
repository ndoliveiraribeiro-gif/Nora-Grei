"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import NotificationBell from "@/components/NotificationBell";
import { fmtData, fmtDataHora } from "@/lib/i18n";

// ── Estimativa de valor ─────────────────────────────────────────────────────
// Marcas que podem APRECIAR acima do preço de compra (investimento)
const MARCAS_INVESTIMENTO_P = ["rolex","patek philippe","patek","audemars piguet","ap","richard mille","hermès","hermes","chanel","louis vuitton","lv","birkin","kelly"];
const MARCAS_PREMIUM_P = ["gucci","prada","bottega veneta","dior","christian dior","saint laurent","ysl","celine","céline",
  "givenchy","valentino","versace","balenciaga","jacquemus","loewe","loro piana",
  "brunello cucinelli","max mara","tod's","tods","ferragamo","burberry","mulberry","ralph lauren"];
const MARCAS_ALTA_P = ["zara","mango","&other stories","other stories","cos","arket",
  "massimo dutti","pedro del hierro","escorpion","escorpión","hugo boss","boss",
  "calvin klein","ck","tommy hilfiger","tommy","lacoste","levis","levi's","gant",
  "scotch soda","weekday","monki","stradivarius","bershka","pull&bear","sfera",
  "phase eight","whistles","reiss","allsaints","all saints","ba&sh","bash","sandro","maje"];
function fatorMarcaP(marca = "") {
  const m = marca.toLowerCase().trim();
  if (MARCAS_INVESTIMENTO_P.some(b => m.includes(b))) return { fator: 1.15, tier: "investimento" };
  if (MARCAS_PREMIUM_P.some(b => m.includes(b))) return { fator: 0.82, tier: "premium" };
  if (MARCAS_ALTA_P.some(b => m.includes(b))) return { fator: 0.50, tier: "alta" };
  return { fator: 0.32, tier: "massmarket" };
}
// condicao: como_novo | bom | usado | com_defeito  (substituiu "número de usos")
const FATOR_ESTADO_P = { como_novo: 0.92, bom: 0.68, usado: 0.45, com_defeito: 0.25 };
const FATOR_IDADE_P  = { novo: 1.0, "1a2": 0.85, "2a4": 0.70, "4mais": 0.52 };
const ROTACAO_CAT_P = {
  Vestidos:   { rot: 1.8, dias: 3.5, fp: 0.10 },
  Fatos:      { rot: 1.5, dias: 4.0, fp: 0.09 },
  Macacões:   { rot: 1.4, dias: 3.5, fp: 0.09 },
  Conjuntos:  { rot: 1.3, dias: 3.5, fp: 0.09 },
  Casacos:    { rot: 1.0, dias: 5.0, fp: 0.07 },
  Saias:      { rot: 1.2, dias: 3.0, fp: 0.08 },
  Calças:     { rot: 1.1, dias: 3.0, fp: 0.07 },
  Blusas:     { rot: 1.1, dias: 3.0, fp: 0.07 },
  Camisas:    { rot: 1.0, dias: 3.0, fp: 0.07 },
  Kaftans:    { rot: 0.9, dias: 5.0, fp: 0.08 },
  Malas:      { rot: 2.0, dias: 4.0, fp: 0.12 },
  Acessórios: { rot: 1.6, dias: 3.0, fp: 0.10 },
  _default:   { rot: 1.2, dias: 3.5, fp: 0.08 },
};
function fatorEstadoIdadeP(condicao, idade_peca) {
  const fe = FATOR_ESTADO_P[condicao] ?? 0.68;
  const fi = FATOR_IDADE_P[idade_peca] ?? 0.85;
  const combinado = fe * fi;
  if (combinado < 0.30) return combinado * 0.85;
  if (combinado > 0.85) return combinado * 1.05;
  return combinado;
}
// contexto_venda: 0 = sem pressa (preço máximo), 100 = liquidez urgente (desconto)
function calcEstimativaP({ valor_peca, marca, condicao, idade_peca, categoria, contexto_venda = 0 }) {
  const p = parseFloat(valor_peca) || 0;
  if (!p) return null;
  const { fator: fm, tier } = fatorMarcaP(marca);
  const fei = fatorEstadoIdadeP(condicao, idade_peca);
  // marcas de investimento: valor pode superar preço original; aplicar fator antes do ajuste estado/idade
  const valorBase = tier === "investimento" ? Math.round(p * fm) : Math.round(p * fm * fei);
  const valorMercado = tier === "investimento" ? valorBase : valorBase; // mantemos para flexibilidade futura
  const cat = ROTACAO_CAT_P[categoria] ?? ROTACAO_CAT_P._default;
  const tierBonus = tier === "investimento" ? 1.35 : tier === "premium" ? 1.20 : tier === "alta" ? 1.05 : 1.0;
  const precoAluguerDia = Math.max(5, Math.round(valorMercado * cat.fp * tierBonus / 5) * 5);
  // contexto_venda: slider 0-100; 0=sem pressa→preço pleno, 100=liquidez urgente→-30%
  const fatorContexto = 1 - (contexto_venda / 100) * 0.30;
  const precoVendaUsada = Math.max(5, Math.round(valorMercado * 0.75 * fatorContexto));
  const precoVendaMax = Math.max(5, Math.round(valorMercado * 0.75)); // sem urgência
  const caucao = Math.round(valorMercado * 0.30 / 10) * 10;
  const ganho12m = Math.round(precoAluguerDia * cat.dias * cat.rot * 12 * 0.90 * 0.90);
  // quantas rendas para recuperar o valor de venda
  const rendasParaRecuperar = precoAluguerDia > 0 ? Math.ceil(precoVendaMax / precoAluguerDia) : null;
  return { valorMercado, precoAluguerDia, precoVendaUsada, precoVendaMax, caucao, rotMes: cat.rot.toFixed(1), diasAlug: cat.dias, ganho12m, tier, rendasParaRecuperar };
}

const NIVEL_NOMES_PERFIL = {
  pt: { platina:"Platina", ouro:"Ouro", prata:"Prata", bronze:"Bronze" },
  fr: { platina:"Platine", ouro:"Or",   prata:"Argent", bronze:"Bronze" },
  lt: { platina:"Platina", ouro:"Auksas", prata:"Sidabras", bronze:"Bronza" },
};
const NIVEL = (n, lang = "pt") => {
  const nm = NIVEL_NOMES_PERFIL[lang] || NIVEL_NOMES_PERFIL.pt;
  if (n >= 20) return { nome: nm.platina, sigla: "PLT", cor: "#6c5ce7", caucao: 0, proximo: null, falta: 0 };
  if (n >= 10) return { nome: nm.ouro,    sigla: "OUR", cor: "#b8860b", caucao: 50, proximo: nm.platina, falta: 20 - n };
  if (n >= 5)  return { nome: nm.prata,   sigla: "PRT", cor: "#6b7280", caucao: 75, proximo: nm.ouro,    falta: 10 - n };
  return { nome: nm.bronze, sigla: "BRZ", cor: "#a8632f", caucao: 100, proximo: nm.prata, falta: 5 - n };
};

const ESTADO_INFO = {
  pt: {
    pendente: { label: "A aguardar pagamento", cor: "#b8860b", bg: "#fff8e1" },
    confirmado: { label: "Pagamento confirmado", cor: "#6b3fa0", bg: "#f3e5f5" },
    enviado: { label: "A caminho", cor: "#1565c0", bg: "#e3f2fd" },
    ativo: { label: "A usar", cor: "#1e7e3e", bg: "#e8f5e9" },
    em_verificacao: { label: "Em inspeção", cor: "#b35900", bg: "#fff8e1" },
    devolvido: { label: "Concluído", cor: "#3f3e3c", bg: "#f0eeeb" },
    devolvido_danificado: { label: "Concluído — com danos", cor: "#c0392b", bg: "#fff5f5" },
    cancelado: { label: "Cancelado", cor: "#c0392b", bg: "#fff5f5" },
  },
  fr: {
    pendente: { label: "En attente de paiement", cor: "#b8860b", bg: "#fff8e1" },
    confirmado: { label: "Paiement confirmé", cor: "#6b3fa0", bg: "#f3e5f5" },
    enviado: { label: "En route", cor: "#1565c0", bg: "#e3f2fd" },
    ativo: { label: "En cours d'utilisation", cor: "#1e7e3e", bg: "#e8f5e9" },
    em_verificacao: { label: "En inspection", cor: "#b35900", bg: "#fff8e1" },
    devolvido: { label: "Terminé", cor: "#3f3e3c", bg: "#f0eeeb" },
    devolvido_danificado: { label: "Terminé — avec dommages", cor: "#c0392b", bg: "#fff5f5" },
    cancelado: { label: "Annulé", cor: "#c0392b", bg: "#fff5f5" },
  },
  lt: {
    pendente: { label: "Laukiama mokėjimo", cor: "#b8860b", bg: "#fff8e1" },
    confirmado: { label: "Mokėjimas patvirtintas", cor: "#6b3fa0", bg: "#f3e5f5" },
    enviado: { label: "Keliauja", cor: "#1565c0", bg: "#e3f2fd" },
    ativo: { label: "Naudojama", cor: "#1e7e3e", bg: "#e8f5e9" },
    em_verificacao: { label: "Tikrinama", cor: "#b35900", bg: "#fff8e1" },
    devolvido: { label: "Užbaigta", cor: "#3f3e3c", bg: "#f0eeeb" },
    devolvido_danificado: { label: "Užbaigta — su pažeidimais", cor: "#c0392b", bg: "#fff5f5" },
    cancelado: { label: "Atšaukta", cor: "#c0392b", bg: "#fff5f5" },
  },
};

// ── Tooltip de ajuda contextual ──────────────────────────────────────────────
function Tooltip({ texto }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!aberto) return;
    const fechar = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false); };
    document.addEventListener("mousedown", fechar);
    document.addEventListener("touchstart", fechar);
    return () => { document.removeEventListener("mousedown", fechar); document.removeEventListener("touchstart", fechar); };
  }, [aberto]);
  return (
    <span ref={ref} style={{position:"relative",display:"inline-flex",alignItems:"center",verticalAlign:"middle"}}>
      <button
        onClick={e => { e.stopPropagation(); setAberto(v => !v); }}
        style={{width:15,height:15,borderRadius:"50%",border:"1px solid #89c4e1",background:aberto?"#89c4e1":"transparent",color:aberto?"#fff":"#89c4e1",fontSize:"0.55rem",fontWeight:700,lineHeight:1,cursor:"pointer",padding:0,fontFamily:"var(--sans)",flexShrink:0,marginLeft:"0.3rem"}}
        aria-label="Ajuda"
      >?</button>
      {aberto && (
        <span style={{position:"absolute",bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",background:"#1a1816",color:"#f0ede8",fontSize:"0.68rem",lineHeight:1.5,padding:"0.5rem 0.7rem",borderRadius:"4px",whiteSpace:"normal",width:"200px",zIndex:9999,boxShadow:"0 4px 16px rgba(0,0,0,0.25)",pointerEvents:"none"}}>
          {texto}
          <span style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",borderWidth:"5px",borderStyle:"solid",borderColor:"#1a1816 transparent transparent transparent"}}/>
        </span>
      )}
    </span>
  );
}
// ── Nudge de primeiro uso (aparece uma vez em secções vazias) ─────────────────
const NUDGE_STORAGE_KEY = "ng_nudges_vistos_v1";
function getNudgesVistos() {
  try { return new Set(JSON.parse(localStorage.getItem(NUDGE_STORAGE_KEY) || "[]")); }
  catch { return new Set(); }
}
function marcarNudgeVisto(id) {
  try {
    const vistos = getNudgesVistos();
    vistos.add(id);
    localStorage.setItem(NUDGE_STORAGE_KEY, JSON.stringify([...vistos]));
  } catch {}
}

function NudgeBanner({ id, icone, titulo, descricao, ctaLabel, onCta, onFechar }) {
  const [visto, setVisto] = useState(() => {
    try { return getNudgesVistos().has(id); } catch { return false; }
  });
  if (visto) return null;
  const fechar = () => { marcarNudgeVisto(id); setVisto(true); if (onFechar) onFechar(); };
  return (
    <div style={{
      background:"linear-gradient(135deg,#eef7fc,#e6f3f9)",
      border:"1.5px solid #89c4e1",
      borderRadius:"6px",
      padding:"1rem 1.25rem",
      marginBottom:"1.25rem",
      display:"flex",
      gap:"0.85rem",
      alignItems:"flex-start",
      position:"relative",
    }}>
      <div style={{fontSize:"1.4rem",lineHeight:1,flexShrink:0,marginTop:"0.1rem"}}>{icone}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:"0.8rem",fontWeight:700,color:"#2a7a9f",marginBottom:"0.25rem",fontFamily:"var(--sans)",letterSpacing:"0.02em"}}>{titulo}</div>
        <div style={{fontSize:"0.78rem",color:"#3a5a6e",lineHeight:1.55,marginBottom:"0.6rem"}}>{descricao}</div>
        {ctaLabel && onCta && (
          <button
            onClick={() => { fechar(); onCta(); }}
            style={{fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",background:"#89c4e1",color:"#fff",border:"none",padding:"0.35rem 0.85rem",cursor:"pointer",fontFamily:"var(--sans)",fontWeight:600}}
          >{ctaLabel}</button>
        )}
      </div>
      <button
        onClick={fechar}
        aria-label="Fechar"
        style={{position:"absolute",top:"0.5rem",right:"0.6rem",background:"none",border:"none",cursor:"pointer",color:"#89c4e1",fontSize:"1rem",lineHeight:1,padding:"0.1rem",fontFamily:"var(--sans)"}}
      >×</button>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function useCountdownDetalhado(dataAlvo) {
  const [tempo, setTempo] = useState("");
  useEffect(() => {
    if (!dataAlvo) return;
    const calc = () => {
      const diff = new Date(dataAlvo) - new Date();
      if (diff <= 0) { setTempo(""); return; }
      const dias = Math.floor(diff / 86400000);
      const horas = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (dias > 0) setTempo(`${dias}d ${horas}h ${mins}m`);
      else setTempo(`${horas}h ${mins}m`);
    };
    calc();
    const iv = setInterval(calc, 30000);
    return () => clearInterval(iv);
  }, [dataAlvo]);
  return tempo;
}

function TimerInfo({ aluguer, lang }) {
  let alvo = null;
  if (aluguer.estado === "enviado") alvo = aluguer.data_entrega_prevista || aluguer.data_inicio;
  else if (aluguer.estado === "ativo") alvo = aluguer.data_fim;
  const tempo = useCountdownDetalhado(alvo);

  const TXT = {
    pt: { chega: "Chega em", aCaminho: "A caminho", devolver: "Devolver em" },
    fr: { chega: "Arrive dans", aCaminho: "En route", devolver: "À retourner dans" },
    lt: { chega: "Atvyks per", aCaminho: "Keliauja", devolver: "Grąžinti per" },
  };
  const x = TXT[lang] || TXT.pt;

  if (aluguer.estado === "enviado") {
    return (
      <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'#e3f2fd',padding:'0.5rem 0.75rem',marginTop:'0.5rem',borderLeft:'3px solid #1565c0'}}>
        <span style={{fontSize:'0.9rem'}}>🚚</span>
        <span style={{fontSize:'0.74rem',color:'#0d47a1'}}>
          {tempo ? <>{x.chega} <strong>{tempo}</strong></> : x.aCaminho}
        </span>
      </div>
    );
  }
  if (aluguer.estado === "ativo" && tempo) {
    return (
      <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'#fff8e1',padding:'0.5rem 0.75rem',marginTop:'0.5rem',borderLeft:'3px solid #b8860b'}}>
        <span style={{fontSize:'0.9rem'}}>↩</span>
        <span style={{fontSize:'0.74rem',color:'#8a5a00'}}>{x.devolver} <strong>{tempo}</strong></span>
      </div>
    );
  }
  return null;
}

function BotaoConfirmarRecepcao({ aluguer, i, onConfirmado }) {
  const [loading, setLoading] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  const confirmar = async () => {
    setLoading(true);
    const agora = new Date().toISOString();
    const { error } = await supabase.from("alugueres").update({
      estado: "ativo",
      data_inicio_real: agora,
      data_confirmacao_recepcao: agora,
    }).eq("id", aluguer.id);
    setLoading(false);
    if (!error) {
      setConfirmado(true);
      setTimeout(() => onConfirmado && onConfirmado(), 1200);
    }
  };

  if (confirmado) {
    return <div style={{marginTop:'0.5rem',padding:'0.6rem 0.75rem',background:'#e8f5e9',color:'#1e7e3e',fontSize:'0.78rem',fontWeight:600}}>✓ {i.recepcaoConfirmada}</div>;
  }

  return (
    <button onClick={confirmar} disabled={loading} style={{width:'100%',marginTop:'0.5rem',padding:'0.65rem',background:'#080808',color:'#fff',border:'none',fontSize:'0.68rem',letterSpacing:'0.1em',textTransform:'uppercase',cursor:'pointer',fontWeight:500,fontFamily:"'Jost',sans-serif"}}>
      {loading ? i.confirmandoRecepcao : i.confirmarRecepcao}
    </button>
  );
}

function BotaoVerTalao({ aluguer, i }) {
  const [recibo, setRecibo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aberto, setAberto] = useState(false);

  const buscarRecibo = async () => {
    if (recibo) { setAberto(true); return; }
    setLoading(true);
    const { data } = await supabase.from("recibos").select("*").eq("aluguer_id", aluguer.id).maybeSingle();
    setLoading(false);
    if (data) { setRecibo(data); setAberto(true); }
  };

  return (
    <>
      <button onClick={buscarRecibo} disabled={loading} style={{ width:'100%',marginTop:'0.5rem',padding:'0.55rem',background:'#fff',color:'#080808',border:'1.5px solid #2e2d2b',fontSize:'0.75rem',letterSpacing:'0.1em',textTransform:'uppercase',cursor:'pointer',fontWeight:600,fontFamily:"'Jost',sans-serif" }}>
        {loading ? "..." : `${i.verTalao}`}
      </button>
      {aberto && recibo && (
        <div style={{ position:"fixed",inset:0,background:"rgba(8,8,8,0.6)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem" }} onClick={(e) => e.target === e.currentTarget && setAberto(false)}>
          <div style={{ background:"#fff",width:"100%",maxWidth:380,padding:"1.75rem",position:"relative" }}>
            <button onClick={() => setAberto(false)} style={{ position:"absolute",top:"1rem",right:"1rem",background:"none",border:"none",fontSize:"1.2rem",cursor:"pointer",color:"#3f3e3c" }}>✕</button>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"1rem",paddingBottom:"0.75rem",borderBottom:"2px dashed #e2dfda" }}>
              <span style={{ fontFamily:"'Cormorant',serif",fontSize:"1.1rem",letterSpacing:"0.15em",textTransform:"uppercase" }}>NORA GREI</span>
              <span style={{ fontSize:"0.68rem",color:"#3f3e3c",fontFamily:"monospace" }}>{recibo.numero}</span>
            </div>
            {[
              [i.dataLabel, fmtDataHora(recibo.created_at, lang)],
              [i.metodoLabel, recibo.metodo_pagamento],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span style={{color:"#3f3e3c"}}>{k}</span><span style={{textTransform:"capitalize"}}>{v}</span></div>
            ))}
            <div style={{ borderTop:"1px dashed #e2dfda", margin:"0.5rem 0" }} />
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span style={{color:"#3f3e3c"}}>{i.aluguer}</span><span>{recibo.valor_aluguer}€</span></div>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span style={{color:"#3f3e3c"}}>{i.higienizacao}</span><span>{recibo.valor_higienizacao}€</span></div>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",padding:"0.35rem 0" }}><span style={{color:"#3f3e3c"}}>{i.deposito}</span><span>{recibo.valor_deposito}€</span></div>
            <div style={{ borderTop:"1px dashed #e2dfda", margin:"0.5rem 0" }} />
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:"1.05rem",fontWeight:700,padding:"0.5rem 0" }}><span>{i.total}</span><span>{recibo.valor_total}€</span></div>
            <div style={{ textAlign:"center",fontSize:"1rem",fontWeight:700,marginTop:"0.75rem",paddingTop:"0.75rem",borderTop:"2px dashed #e2dfda",color:recibo.estado==="pago"?"#1e7e3e":"#b8860b" }}>
              {recibo.estado==="pago" ? i.pago : i.aguardarPagamento}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const PORTES_PERFIL = 6.90;
const PRECO_USADA_PERFIL = 200;
const COMISSAO_PERFIL = 0.20;
const METODOS_PAG_PERFIL = {
  pt: [
    { id: "mb", label: "Referência MB", desc: "Paga em qualquer ATM ou app bancária", auto: false },
    { id: "mbway", label: "MB Way", desc: "Confirmação imediata", auto: true },
    { id: "cartao", label: "Cartão crédito/débito", desc: "Confirmação imediata", auto: true },
    { id: "transferencia", label: "Transferência bancária", desc: "Confirmamos em até 1 dia útil", auto: false },
  ],
  fr: [
    { id: "mb", label: "Référence MB", desc: "Payez dans n'importe quel ATM ou app bancaire", auto: false },
    { id: "mbway", label: "MB Way", desc: "Confirmation immédiate", auto: true },
    { id: "cartao", label: "Carte crédit/débit", desc: "Confirmation immédiate", auto: true },
    { id: "transferencia", label: "Virement bancaire", desc: "Confirmé sous 1 jour ouvré", auto: false },
  ],
  lt: [
    { id: "mb", label: "MB nuoroda", desc: "Mokėkite bet kuriame bankomate ar banko programėlėje", auto: false },
    { id: "mbway", label: "MB Way", desc: "Patvirtinama iš karto", auto: true },
    { id: "cartao", label: "Kredito/debeto kortelė", desc: "Patvirtinama iš karto", auto: true },
    { id: "transferencia", label: "Bankinis pervedimas", desc: "Patvirtinsime per 1 darbo dieną", auto: false },
  ],
};

function BotaoComprarPecaPerfil({ aluguer, i, lang }) {
  const [fase, setFase] = useState("botao");
  const [metodoPag, setMetodoPag] = useState("mb");
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [codigo, setCodigo] = useState(null);
  const [compra, setCompra] = useState(null);
  const [dadosCartao, setDadosCartao] = useState({ numero: "", nome: "", validade: "", cvc: "" });
  const [telMbway, setTelMbway] = useState("");
  const [comprovativo, setComprovativo] = useState(null);

  const totalUsada = PRECO_USADA_PERFIL + PORTES_PERFIL;
  const metodos = METODOS_PAG_PERFIL[lang] || METODOS_PAG_PERFIL.pt;
  const metodoSel = metodos.find(m => m.id === metodoPag);

  useEffect(() => {
    supabase.from("codigos_desconto").select("*").eq("aluguer_id", aluguer.id).maybeSingle().then(({ data }) => { if (data) setCodigo(data); });
  }, []);

  const confirmarPagamento = async () => {
    if (metodoPag === "cartao" && (!dadosCartao.numero || !dadosCartao.nome || !dadosCartao.validade || !dadosCartao.cvc)) return;
    if (metodoPag === "mbway" && !telMbway) return;
    if (metodoPag === "transferencia" && !comprovativo) return;
    setLoading(true);
    const { data: existente } = await supabase.from("compras_usadas").select("*").eq("aluguer_id", aluguer.id).maybeSingle();
    if (existente) { setCompra(existente); setFase("pagamento_usada"); setLoading(false); return; }
    const entidade = "21666";
    const ref = Math.floor(100000000 + Math.random() * 900000000).toString();
    const validade = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const automatico = metodoSel?.auto || false;
    const { data: nova } = await supabase.from("compras_usadas").insert({
      aluguer_id: aluguer.id, cliente_id: aluguer.cliente_id,
      peca_id: aluguer.stock_tamanhos?.pecas?.id || null,
      valor: totalUsada, estado: automatico ? "pago" : "aguarda_pagamento",
      metodo_pagamento: metodoPag,
      mb_entidade: metodoPag === "mb" ? entidade : null,
      mb_referencia: metodoPag === "mb" ? ref : null,
      mb_montante: metodoPag === "mb" ? totalUsada : null,
      mb_validade: metodoPag === "mb" ? validade : null,
    }).select().single();
    if (nova) setCompra(nova);
    setFase("pagamento_usada");
    setLoading(false);
  };

  const gerarVoucherNova = async () => {
    setLoading(true);
    const { data: existente } = await supabase.from("codigos_desconto").select("*").eq("aluguer_id", aluguer.id).maybeSingle();
    if (existente) { setCodigo(existente); setFase("voucher_nova"); setLoading(false); return; }
    const cod = "NORA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: novo } = await supabase.from("codigos_desconto").insert({
      aluguer_id: aluguer.id, cliente_id: aluguer.cliente_id, codigo: cod,
      valor: aluguer.valor_aluguer || 0, estado: "ativo",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).select().single();
    if (novo) setCodigo(novo);
    setFase("voucher_nova");
    setLoading(false);
  };

  const copiar = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const sty = {
    sec: { fontSize:'0.72rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:600,marginBottom:'0.75rem' },
    opt: (on) => ({ display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.85rem 1rem',border:`1.5px solid ${on?'#080808':'#e2dfda'}`,background:on?'#f0eeeb':'#fff',cursor:'pointer',marginBottom:'0.5rem' }),
    radio: (on) => ({ width:16,height:16,borderRadius:'50%',border:`2px solid ${on?'#080808':'#ccc'}`,background:on?'#080808':'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center' }),
    radioDot: { width:6,height:6,borderRadius:'50%',background:'#fff' },
    badge: (auto) => ({ fontSize:'0.68rem',letterSpacing:'0.08em',textTransform:'uppercase',padding:'0.12rem 0.35rem',background:auto?'#e8f5e9':'#fff8e1',color:auto?'#27ae60':'#f39c12',fontWeight:600,marginLeft:'0.4rem' }),
    inp: { width:'100%',padding:'0.7rem 0.9rem',border:'1.5px solid #e2dfda',background:'#fff',fontFamily:"'Jost',sans-serif",fontSize:'0.9rem',color:'#080808',outline:'none',marginBottom:'0.5rem',boxSizing:'border-box' },
    row2: { display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.5rem' },
    ibanBox: { background:'#f0eeeb',padding:'1rem',marginBottom:'0.75rem' },
    ibanLabel: { fontSize:'0.75rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#888' },
    ibanVal: { fontFamily:"var(--sans)",fontSize:'1rem',fontWeight:500,color:'#080808',marginTop:'0.15rem',marginBottom:'0.5rem' },
    aviso: { fontSize:'0.72rem',color:'#946200',background:'#fff8e1',padding:'0.75rem 1rem',borderLeft:'3px solid #f39c12',lineHeight:1.5,marginTop:'0.5rem' },
    uploadBox: { display:'block',padding:'0.85rem',border:'2px dashed #e2dfda',background:'#f0eeeb',cursor:'pointer',textAlign:'center',fontSize:'0.78rem',color:'#5a5855',marginBottom:'0.5rem' },
    btnPrimary: { width:'100%',padding:'0.7rem',background:'#080808',color:'#fff',border:'none',fontSize:'0.75rem',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",cursor:'pointer',fontWeight:500 },
    btnSecondary: { width:'100%',padding:'0.5rem',background:'transparent',color:'#888',border:'1px solid #e2dfda',fontSize:'0.75rem',letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",cursor:'pointer',marginTop:'0.5rem' },
    mbRow: { display:'flex',justifyContent:'space-between',padding:'0.4rem 0',borderBottom:'1px solid #f0eeeb' },
    mbLabel: { fontSize:'0.68rem',color:'#888',letterSpacing:'0.08em',textTransform:'uppercase' },
    mbVal: { fontSize:'0.88rem',fontWeight:700,fontFamily:'monospace',color:'#080808' },
  };

  if (fase === "botao") return (
    <button onClick={() => setFase("modal")}
      style={{width:'100%',padding:'0.7rem',marginTop:'0.75rem',background:'#fff0f3',color:'#c4748a',border:'1.5px solid #f0c0cc',fontSize:'0.68rem',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",cursor:'pointer',fontWeight:500}}>
      🏷️ {i.comprarPeca}
    </button>
  );

  if (fase === "modal") return (
    <div style={{marginTop:'0.75rem',background:'#fdf6f8',border:'1px solid #f0c0cc',padding:'1.25rem'}}>
      <p style={{...sty.sec,color:'#c4748a'}}>{i.comprarModal}</p>
      <div style={{border:'1.5px solid #e2dfda',background:'#fff',padding:'1rem',marginBottom:'0.75rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.4rem'}}>
          <div>
            <p style={{fontFamily:"var(--sans)",fontSize:'0.95rem',fontWeight:500,color:'#080808'}}>{i.comprarUsada}</p>
            <p style={{fontSize:'0.72rem',color:'#5a5855',marginTop:'0.2rem'}}>{i.comprarUsadaDesc}</p>
          </div>
          <div style={{textAlign:'right',flexShrink:0,marginLeft:'1rem'}}>
            <p style={{fontFamily:"var(--sans)",fontSize:'1.1rem',fontWeight:600,color:'#080808'}}>{PRECO_USADA_PERFIL}€</p>
            <p style={{fontSize:'0.75rem',color:'#888'}}>+ {PORTES_PERFIL.toFixed(2).replace('.',',')}€ {i.portesEnvio}</p>
          </div>
        </div>
        <button onClick={() => setFase("escolher_pag")} style={{...sty.btnPrimary,marginTop:'0.5rem'}}>{i.pagarReferencia}</button>
      </div>
      <div style={{border:'1.5px solid #e2dfda',background:'#fff',padding:'1rem',marginBottom:'0.75rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.4rem'}}>
          <div>
            <p style={{fontFamily:"var(--sans)",fontSize:'0.95rem',fontWeight:500,color:'#080808'}}>{i.comprarNova}</p>
            <p style={{fontSize:'0.72rem',color:'#5a5855',marginTop:'0.2rem'}}>{i.comprarNovaDesc}</p>
          </div>
          <div style={{textAlign:'right',flexShrink:0,marginLeft:'1rem'}}>
            <p style={{fontFamily:"var(--sans)",fontSize:'1.1rem',fontWeight:600,color:'#c4748a'}}>{i.comprarNovaValor} {aluguer.valor_aluguer || 0}€</p>
          </div>
        </div>
        <button onClick={gerarVoucherNova} disabled={loading} style={{...sty.btnPrimary,background:'#c4748a',marginTop:'0.5rem'}}>{loading ? "..." : i.irLoja}</button>
      </div>
      <button onClick={() => setFase("botao")} style={sty.btnSecondary}>{i.cancelar}</button>
    </div>
  );

  if (fase === "escolher_pag") return (
    <div style={{marginTop:'0.75rem',background:'#fdf6f8',border:'1px solid #f0c0cc',padding:'1.25rem'}}>
      <p style={{...sty.sec,color:'#080808'}}>{i.metodoPagamento}</p>
      <div style={{background:'#fff',padding:'0.75rem 1rem',marginBottom:'1rem',border:'1px solid #e2dfda'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',color:'#5a5855',marginBottom:'0.3rem'}}>
          <span>{i.comprarUsada}</span><span>{PRECO_USADA_PERFIL}€</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',color:'#5a5855',marginBottom:'0.3rem'}}>
          <span>{i.portesEnvio}</span><span>{PORTES_PERFIL.toFixed(2).replace('.',',')}€</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'1rem',fontWeight:600,color:'#080808',paddingTop:'0.4rem',borderTop:'1px solid #f0eeeb'}}>
          <span>{i.totalUsada}</span><span>{totalUsada.toFixed(2).replace('.',',')}€</span>
        </div>
      </div>
      {metodos.map(m => (
        <div key={m.id} style={sty.opt(metodoPag === m.id)} onClick={() => setMetodoPag(m.id)}>
          <div style={sty.radio(metodoPag === m.id)}>{metodoPag === m.id && <div style={sty.radioDot} />}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:'0.9rem',fontWeight:500,color:'#080808',display:'flex',alignItems:'center'}}>
              {m.label}<span style={sty.badge(m.auto)}>{m.auto ? i.imediato : i.manual}</span>
            </div>
            <div style={{fontSize:'0.75rem',color:'#5a5855'}}>{m.desc}</div>
          </div>
        </div>
      ))}
      {metodoPag === "mb" && (
        <div style={{background:'#f0eeeb',padding:'1rem',marginTop:'0.75rem'}}>
          <p style={{...sty.ibanLabel,marginBottom:'0.25rem'}}>{i.refGerada}</p>
          <p style={{fontSize:'0.72rem',color:'#5a5855',lineHeight:1.5}}>{i.pecaEnviada}</p>
        </div>
      )}
      {metodoPag === "mbway" && (
        <div style={{marginTop:'0.75rem'}}>
          <p style={{fontSize:'0.75rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#5a5855',marginBottom:'0.4rem'}}>{i.telMbway}</p>
          <input style={sty.inp} placeholder="+351 912 345 678" value={telMbway} onChange={e => setTelMbway(e.target.value)} />
          <p style={{fontSize:'0.68rem',color:'#5a5855',fontStyle:'italic'}}>🔒 {i.simPag}</p>
        </div>
      )}
      {metodoPag === "cartao" && (
        <div style={{marginTop:'0.75rem',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          <input style={sty.inp} placeholder="1234 5678 9012 3456" value={dadosCartao.numero}
            onChange={e => { const v=e.target.value.replace(/\D/g,"").slice(0,16).replace(/(\d{4})(?=\d)/g,"$1 ").trim(); setDadosCartao(d=>({...d,numero:v})); }} maxLength={19} />
          <input style={sty.inp} placeholder="NOME NO CARTÃO" value={dadosCartao.nome}
            onChange={e => setDadosCartao(d=>({...d,nome:e.target.value.toUpperCase()}))} />
          <div style={sty.row2}>
            <input style={{...sty.inp,marginBottom:0}} placeholder="MM/AA" value={dadosCartao.validade}
              onChange={e => { const l=e.target.value.replace(/\D/g,"").slice(0,4); setDadosCartao(d=>({...d,validade:l.length>=3?l.slice(0,2)+"/"+l.slice(2):l})); }} maxLength={5} />
            <input style={{...sty.inp,marginBottom:0}} placeholder="CVC" value={dadosCartao.cvc}
              onChange={e => setDadosCartao(d=>({...d,cvc:e.target.value.replace(/\D/g,"").slice(0,3)}))} maxLength={3} />
          </div>
          <p style={{fontSize:'0.68rem',color:'#5a5855',fontStyle:'italic'}}>🔒 {i.simPag}</p>
        </div>
      )}
      {metodoPag === "transferencia" && (
        <div style={{marginTop:'0.75rem'}}>
          <div style={sty.ibanBox}>
            <p style={sty.ibanLabel}>IBAN Nora Grei</p>
            <p style={sty.ibanVal}>PT50 0000 0000 0000 0000 0000 0</p>
            <p style={sty.ibanLabel}>{i.montanteVirer}</p>
            <p style={sty.ibanVal}>{totalUsada.toFixed(2).replace('.',',')}€</p>
            <p style={sty.ibanLabel}>{i.referencia}</p>
            <p style={sty.ibanVal}>{i.nomeCompleto}</p>
          </div>
          <label style={sty.uploadBox}>
            <input type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e => setComprovativo(e.target.files?.[0]||null)} />
            {comprovativo ? <span style={{color:'#27ae60',fontWeight:500}}>✓ {comprovativo.name}</span> : <span>{i.anexarComp}</span>}
          </label>
          <p style={sty.aviso}>{i.reservado24h}</p>
        </div>
      )}
      <button onClick={confirmarPagamento} disabled={loading} style={{...sty.btnPrimary,marginTop:'1rem'}}>{loading ? "..." : i.confirmarCompra}</button>
      <button onClick={() => setFase("modal")} style={sty.btnSecondary}>{i.cancelar}</button>
    </div>
  );

  if (fase === "pagamento_usada") return (
    <div style={{marginTop:'0.75rem',background:'#f0eeeb',border:'1px solid #e2dfda',padding:'1.25rem'}}>
      {compra?.metodo_pagamento === "mb" ? (
        <>
          <p style={{...sty.sec,color:'#080808'}}>{i.referenciaGerada}</p>
          <div style={{background:'#fff',padding:'1rem',marginBottom:'0.75rem'}}>
            <div style={sty.mbRow}><span style={sty.mbLabel}>{i.entidade}</span><span style={sty.mbVal}>{compra?.mb_entidade}</span></div>
            <div style={sty.mbRow}><span style={sty.mbLabel}>{i.referencia}</span><span style={{...sty.mbVal,letterSpacing:'0.1em'}}>{compra?.mb_referencia}</span></div>
            <div style={sty.mbRow}><span style={sty.mbLabel}>{i.montante}</span><span style={{...sty.mbVal,fontSize:'1rem'}}>{compra?.mb_montante}€</span></div>
            <div style={{...sty.mbRow,borderBottom:'none'}}><span style={sty.mbLabel}>{i.validadeRef}</span><span style={{fontSize:'0.82rem',color:'#5a5855'}}>{compra?.mb_validade}</span></div>
          </div>
          <p style={{fontSize:'0.72rem',color:'#5a5855',marginBottom:'0.75rem',lineHeight:1.5}}>{i.pecaEnviada}</p>
          <button onClick={() => copiar(`${compra?.mb_entidade} ${compra?.mb_referencia}`)}
            style={{...sty.btnPrimary,background:copiado?'#27ae60':'#080808'}}>
            {copiado ? i.copiado : "📋 Copiar dados MB"}
          </button>
        </>
      ) : (
        <div style={{textAlign:'center',padding:'1.5rem 0'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>{compra?.metodo_pagamento === "transferencia" ? "⏳" : "✅"}</div>
          <p style={{fontFamily:"var(--sans)",fontSize:'1.2rem',fontWeight:500,color:'#080808',marginBottom:'0.5rem'}}>
            {compra?.metodo_pagamento === "transferencia" ? i.aguardarPagamento : i.pago}
          </p>
          <p style={{fontSize:'0.78rem',color:'#5a5855',lineHeight:1.5}}>{i.pecaEnviada}</p>
        </div>
      )}
    </div>
  );

  if (fase === "voucher_nova" && codigo) return (
    <div style={{background:'#fff0f3',border:'1px solid #f0c0cc',padding:'1rem',marginTop:'0.75rem'}}>
      <p style={{fontSize:'0.72rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#c4748a',fontWeight:600,marginBottom:'0.5rem'}}>{i.codigoDesconto}</p>
      <div style={{fontFamily:"var(--sans)",fontSize:'1.6rem',fontWeight:600,letterSpacing:'0.15em',color:'#080808',marginBottom:'0.3rem'}}>{codigo.codigo}</div>
      <p style={{fontSize:'0.72rem',color:'#5a5855',marginBottom:'0.75rem'}}>{i.descontoInfo} — <strong>{codigo.valor}€</strong></p>
      <div style={{display:'flex',gap:'0.5rem'}}>
        <button onClick={() => copiar(codigo.codigo)} style={{flex:1,padding:'0.6rem',background:copiado?'#27ae60':'#080808',color:'#fff',border:'none',fontSize:'0.75rem',letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",cursor:'pointer'}}>{copiado ? i.copiado : i.copiar}</button>
        <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" style={{flex:1,padding:'0.6rem',background:'#c4748a',color:'#fff',border:'none',fontSize:'0.75rem',letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>{i.irLoja}</a>
      </div>
    </div>
  );

  return null;
}

function ReservaDisponivelCard({ reserva, i }) {
  const peca = reserva.stock_tamanhos?.pecas;
  const tamanho = reserva.stock_tamanhos?.tamanho;
  const linkCheckout = reserva.link_checkout || `/checkout?peca=${peca?.id}&tamanho=${reserva.stock_tamanho_id}`;
  const tempo = useCountdownDetalhado(reserva.prazo_confirmacao);

  return (
    <div style={{display:'flex',gap:'1rem',alignItems:'center',background:'#fff',padding:'1rem 1.25rem',marginBottom:'0.6rem',borderLeft:'3px solid #1e7e3e'}}>
      <div style={{width:48,height:60,flexShrink:0,background:'#f0eeeb',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
        {peca?.fotos?.[0] ? <img src={peca.fotos[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontFamily:"var(--sans)",fontSize:'1rem',color:'rgba(0,0,0,0.12)'}}>NG</span>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"var(--sans)",fontSize:'1rem',fontWeight:500}}>{peca?.nome || "—"}</div>
        <div style={{fontSize:'0.78rem',color:'#3f3e3c'}}>{i.reservaTamanho} {tamanho} · {reserva.data_inicio_desejada} → {reserva.data_fim_desejada}</div>
        {tempo && (
          <div style={{fontSize:'0.72rem',color:'#1e7e3e',fontWeight:600,marginTop:'0.25rem'}}>{i.reservaPrazoTempo} {tempo}</div>
        )}
      </div>
      <a href={linkCheckout} style={{flexShrink:0,padding:'0.65rem 1.25rem',background:'#080808',color:'#fff',textDecoration:'none',fontSize:'0.75rem',letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:600,fontFamily:"'Jost',sans-serif",whiteSpace:'nowrap'}}>
        {i.reservaConfirmar}
      </a>
    </div>
  );
}

const t = {
  pt: {
    titulo: "O meu perfil", dadosPessoais: "Dados pessoais",
    nome: "Nome completo", nomePub: "Nome público / Pseudónimo", nomePubDica: "Como apareces na plataforma. Se não definires, usa o nome real.", email: "Email", telefone: "Telefone",
    dataNascimento: "Data de nascimento", genero: "Género",
    generosOpcoes: ["Mulher", "Homem", "Prefiro não especificar"],
    comoTeVes: "Como te vês hoje?", comoTeVesOpcoes: ["Administrativa / Escritório","Saúde e cuidados","Educação","Restauração e hotelaria","Diversão e vida noturna","Criativo / Arte / Moda","Gestão e negócios","Tecnologia","Comércio e retalho","Estudante","Empreendedora","Em trânsito","Prefiro não partilhar"],
    nif: "NIF", nifPlaceholder: "123 456 789",
    numeroCC: "Número de Cartão de Cidadão", numeroCCPlaceholder: "12345678 9 ZZ0",
    localizacao: "Localização", cidade: "Cidade", pais: "País",
    codigoPostal: "Código postal", morada: "Morada completa",
    numeroPorta: "Número de porta", andar: "Andar / Fração",
    detectarLocalizacao: "Detectar automaticamente",
    localizacaoOk: "Localização detectada ✓",
    guardar: "Guardar", guardado: "Guardado! ✓",
    historico: "Histórico de alugueres",
    semHistorico: "Ainda não tens alugueres.",
    verCatalogo: "Explorar catálogo",
    sair: "Terminar sessão",
    verPedidos: "Ver os meus pedidos",
    perfilIncompleto: "Perfil incompleto",
    perfilIncompletoDesc: "Para poderes alugar peças, precisamos destes dados para a entrega: morada completa, código postal, cidade, NIF, número de Cartão de Cidadão e telefone.",
    camposObrigatorios: "* Campos obrigatórios para alugar",
    nivelConfianca: "Nível de confiança",
    caucao: "caução",
    semCaucao: "Sem",
    faltam: "Faltam",
    para: "para",
    nivelMaximo: "Nível máximo — caução gratuita",
    pontosFidelizacao: "Pontos de fidelização",
    pontosDesc: "1 ponto por peça alugada · A 10ª peça é grátis",
    emCurso: "Em curso",
    alugueresLabel: "Alugueres",
    totalGasto: "Total gasto",
    reservas: "Reservas",
    pontosLabel: "Pontos",
    codigoDesconto: "Código de desconto",
    descontoInfo: "Desconta no preço final em noragrei.com —",
    copiado: "Copiado!",
    copiar: "Copiar",
    irLoja: "Ir à loja ↗",
    comprarPeca: "Comprar esta peça",
    comprarModal: "Como queres comprar esta peça?",
    comprarUsada: "Comprar usada",
    comprarUsadaDesc: "A peça que alugaste, inspeccionada e em bom estado",
    comprarNova: "Voucher para peça nova",
    comprarNovaDesc: "Usa o valor do teu aluguer como desconto em noragrei.com",
    comprarNovaValor: "Desconto de",
    cancelar: "Cancelar",
    pagarReferencia: "Gerar referência MB",
    portesEnvio: "Portes de envio",
    totalUsada: "Total a pagar",
    referenciaGerada: "Referência MB",
    entidade: "Entidade",
    montante: "Montante",
    validadeRef: "Válida até",
    pecaEnviada: "A Nora Grei enviará a peça após confirmação do pagamento.",
    metodoPagamento: "Método de pagamento",
    imediato: "Imediato", manual: "Manual",
    refGerada: "Referência gerada após confirmação",
    telMbway: "Número de telefone MB Way",
    simPag: "Pagamento simulado.",
    montanteVirer: "Montante a transferir",
    nomeCompleto: "O teu nome completo",
    anexarComp: "📎 Anexar comprovativo",
    reservado24h: "O pedido fica reservado 24h até confirmarmos o comprovativo.",
    confirmarCompra: "Confirmar compra",
    voltarInicio: "← Início",
    confirmarRecepcao: "Confirmar receção",
    confirmandoRecepcao: "A confirmar...",
    recepcaoConfirmada: "Receção confirmada! O teu aluguer está agora ativo.",
    referencia: "Ref.",
    reservaDisponivelTitulo: "A peça que reservaste está disponível",
    reservaDisponivelDesc: "Confirma o pagamento para garantir o teu aluguer antes que a reserva expire.",
    reservaTamanho: "Tam.",
    reservaConfirmar: "Confirmar e pagar",
    reservaPrazoTempo: "Tempo restante para confirmar:",
    verTalao: "Ver talão",
    dataLabel: "Data", metodoLabel: "Método",
    aluguer: "Aluguer", higienizacao: "Higienização", deposito: "Depósito", total: "Total",
    pago: "✓ Pago", aguardarPagamento: "A aguardar pagamento", mudarPassword: "Alterar password", novaPassword: "Nova password", confirmarPassword: "Confirmar nova password", guardarPassword: "Guardar password", passwordMin: "A password deve ter pelo menos 6 caracteres.", passwordMatch: "As passwords não coincidem.", passwordOk: "Password alterada com sucesso!", passwordErro: "Erro ao alterar. Tenta novamente.", reclamacoes: "Reclamações", novaReclamacao: "Nova reclamação", assunto: "Assunto", mensagem: "Mensagem", enviarReclamacao: "Enviar reclamação", reclamacaoEnviada: "Reclamação enviada! Entraremos em contacto brevemente.", reclamacaoPendente: "Pendente", reclamacaoResolvida: "Resolvida", semReclamacoes: "Sem reclamações.", assuntoPlaceholder: "Ex: Peça danificada, atraso na entrega...", mensagemPlaceholder: "Descreve o problema em detalhe...", avaliacoes: "Avaliações", avaliarExperiencia: "Avalia a tua experiência", avaliacaoEnviada: "Avaliação enviada! Obrigado.", comentarioPlaceholder: "Deixa um comentário (opcional)...", enviarAvaliacao: "Enviar avaliação", tuaAvaliacao: "A tua avaliação", avaliacaoEmpresa: "Avaliação da Nora Grei", semAvaliacoes: "Ainda não tens alugueres concluídos para avaliar.", tabPerfil: "Perfil", tabPedidos: "Pedidos", tabGuardados: "Guardados", tabLoja: "A minha loja", tabMensagens: "Mensagens", tabCalculadora: "Calculadora", tabNotificacoes: "Notificações", falarLojista: "Falar com o lojista", semNotificacoes: "Sem notificações por agora.", marcarLidas: "Marcar todas como lidas", caucaoLabel: "Caução", popCuriosidade: "Já avaliaste alguma peça hoje que te pode trazer valor?", popCuriosidadeBtn: "Avaliar agora →", calcTitulo: "Quanto vale a tua peça?", calcSub: "Descobre o potencial da tua peça no circuito circular de moda.", calcPrecoLabel: "Valor original da peça (€)", calcPrecoPlaceholder: "Ex: 350", calcMarcaLabel: "Marca", calcMarcaPlaceholder: "Ex: Gucci, Zara…", calcEstadoLabel: "Estado", calcIdadeLabel: "Idade da peça", calcResultado: "Estimativa de retorno", calcVerMais: "Calculadora completa →", semPedidos: "Ainda não tens pedidos.", explorarCatalogo: "Explorar catálogo →", pecasGuardadas: "Peças guardadas", semGuardados: "Ainda não guardaste nenhuma peça.", indisponivel: "Indisponível", disponivel: "Disponível", alugada: "Alugada", disponivelEm: "Disponível em", alugar: "Alugar →", reservar: "Reservar →", selecionar: "— Selecionar —", moradaEntrega: "Morada de entrega", moradaVazia: "Não preenchida", documentosIdentidade: "Documentos de identidade", docsVazios: "Não preenchidos", docsDesc: "Necessários para verificação de identidade e caução.", erroFoto: "Erro ao guardar foto. Tenta novamente.", erroGeral: "Ocorreu um erro. Tenta novamente.", tabSuporte: "Suporte", novoTicket: "Novo ticket", semTickets: "Sem tickets de suporte.", ticketAssunto: "Assunto do ticket", ticketCategoria: "Categoria", ticketPrioridade: "Prioridade", ticketMensagem: "Descreve o problema", criarTicket: "Criar ticket", ticketCriado: "Ticket criado com sucesso!", ticketAberto: "Aberto", ticketEmCurso: "Em curso", ticketFechado: "Fechado", prioUrgente: "Urgente", prioNormal: "Normal", prioBaixa: "Baixa", catBug: "Bug técnico", catPagamento: "Pagamento", catConta: "Conta", catStock: "Stock / Peças", catEnvios: "Envios", catOutro: "Outro", enviarResposta: "Enviar resposta", respostaAdmin: "Nora Grei", respostaLojista: "Tu",
    dadosFinanceiros: "Dados financeiros", dadosFinanceirosDesc: "Informação bancária para recebimento dos ganhos e pagamento de serviços Nora Grei.", ibanLabel: "IBAN (para onde são enviados os ganhos)", ibanPlaceholder: "PT50 0000 0000 0000 0000 0000 0", ibanVazio: "IBAN não configurado", ibanValido: "IBAN válido ✓", ibanInvalido: "Formato de IBAN inválido", cartaoLabel: "Cartão de crédito ou débito (pagamento de serviços)", cartaoNumero: "Número do cartão", cartaoNome: "Nome no cartão", cartaoValidade: "Validade (MM/AA)", cartaoVazio: "Cartão não configurado", cartaoValido: "Cartão válido ✓", cartaoInvalido: "Número de cartão inválido", cartaoValidadeInvalida: "Data de validade inválida", cartaoGuardadoFim: "Cartão a terminar em", guardarFinanceiros: "Guardar dados financeiros", navPessoal: "Pessoal", navMorada: "Morada", navDocs: "Documentos", navFinanceiros: "Financeiros", navSeguranca: "Segurança",
  },
  fr: {
    titulo: "Mon profil", dadosPessoais: "Informations personnelles",
    nome: "Nom complet", nomePub: "Nom public / Pseudonyme", nomePubDica: "Comment vous apparaissez sur la plateforme. Si non défini, utilise le nom réel.", email: "Email", telefone: "Téléphone",
    dataNascimento: "Date de naissance", genero: "Genre",
    generosOpcoes: ["Femme", "Homme", "Préfère ne pas préciser"],
    comoTeVes: "Comment vous voyez-vous aujourd'hui?", comoTeVesOpcoes: ["Administrative / Bureau","Santé et soins","Éducation","Restauration et hôtellerie","Divertissement et vie nocturne","Créatif / Art / Mode","Gestion et affaires","Technologie","Commerce et vente","Étudiante","Entrepreneuse","En transition","Je préfère ne pas partager"],
    nif: "NIF (numéro fiscal)", nifPlaceholder: "123 456 789",
    numeroCC: "Numéro de carte d'identité", numeroCCPlaceholder: "12345678 9 ZZ0",
    localizacao: "Localisation", cidade: "Ville", pais: "Pays",
    codigoPostal: "Code postal", morada: "Adresse complète",
    numeroPorta: "Numéro de rue", andar: "Étage / Appartement",
    detectarLocalizacao: "Détecter automatiquement",
    localizacaoOk: "Localisation détectée ✓",
    guardar: "Enregistrer", guardado: "Enregistré ! ✓",
    historico: "Historique des locations",
    semHistorico: "Vous n'avez pas encore de locations.",
    verCatalogo: "Explorer le catalogue",
    sair: "Se déconnecter",
    verPedidos: "Voir mes commandes",
    perfilIncompleto: "Profil incomplet",
    perfilIncompletoDesc: "Pour louer des pièces, nous avons besoin de ces informations pour la livraison : adresse complète, code postal, ville, NIF, numéro de carte d'identité et téléphone.",
    camposObrigatorios: "* Champs obligatoires pour louer",
    nivelConfianca: "Niveau de confiance",
    caucao: "dépôt",
    semCaucao: "Sans",
    faltam: "Encore",
    para: "pour",
    nivelMaximo: "Niveau maximum — dépôt gratuit",
    pontosFidelizacao: "Points de fidélité",
    pontosDesc: "1 point par location · La 10ème pièce est gratuite",
    emCurso: "En cours",
    alugueresLabel: "Locations",
    totalGasto: "Total dépensé",
    reservas: "Réservations",
    pontosLabel: "Points",
    codigoDesconto: "Code de réduction",
    descontoInfo: "Déduit du prix final sur noragrei.com —",
    copiado: "Copié !",
    copiar: "Copier",
    irLoja: "Aller à la boutique ↗",
    comprarPeca: "Acheter cette pièce",
    comprarModal: "Comment souhaitez-vous acheter cette pièce ?",
    comprarUsada: "Acheter d'occasion",
    comprarUsadaDesc: "La pièce que vous avez louée, inspectée et en bon état",
    comprarNova: "Bon pour une pièce neuve",
    comprarNovaDesc: "Utilisez votre montant de location comme remise sur noragrei.com",
    comprarNovaValor: "Réduction de",
    cancelar: "Annuler",
    pagarReferencia: "Générer référence MB",
    portesEnvio: "Frais de port",
    totalUsada: "Total à payer",
    referenciaGerada: "Référence MB",
    entidade: "Entité",
    montante: "Montant",
    validadeRef: "Valable jusqu'au",
    pecaEnviada: "Nora Grei enverra la pièce après confirmation du paiement.",
    metodoPagamento: "Méthode de paiement",
    imediato: "Immédiat", manual: "Manuel",
    refGerada: "Référence générée après confirmation",
    telMbway: "Numéro de téléphone MB Way",
    simPag: "Simulation de paiement.",
    montanteVirer: "Montant à virer",
    nomeCompleto: "Votre nom complet",
    anexarComp: "📎 Joindre le justificatif",
    reservado24h: "Votre commande sera réservée 24h en attendant confirmation.",
    confirmarCompra: "Confirmer l'achat",
    voltarInicio: "← Accueil",
    confirmarRecepcao: "Confirmer la réception",
    confirmandoRecepcao: "Confirmation...",
    recepcaoConfirmada: "Réception confirmée ! Votre location est maintenant active.",
    referencia: "Réf.",
    reservaDisponivelTitulo: "La pièce que vous avez réservée est disponible",
    reservaDisponivelDesc: "Confirmez le paiement pour garantir votre location avant l'expiration de la réservation.",
    reservaTamanho: "Taille",
    reservaConfirmar: "Confirmer et payer",
    reservaPrazoTempo: "Temps restant pour confirmer :",
    verTalao: "Voir le reçu",
    dataLabel: "Date", metodoLabel: "Méthode",
    aluguer: "Location", higienizacao: "Nettoyage", deposito: "Dépôt", total: "Total",
    pago: "✓ Payé", aguardarPagamento: "En attente de paiement", mudarPassword: "Changer le mot de passe", novaPassword: "Nouveau mot de passe", confirmarPassword: "Confirmer", guardarPassword: "Enregistrer", passwordMin: "Au moins 6 caractères.", passwordMatch: "Les mots de passe ne correspondent pas.", passwordOk: "Mot de passe modifié !", passwordErro: "Erreur. Réessayez.", reclamacoes: "Réclamations", novaReclamacao: "Nouvelle réclamation", assunto: "Sujet", mensagem: "Message", enviarReclamacao: "Envoyer", reclamacaoEnviada: "Réclamation envoyée !", reclamacaoPendente: "En attente", reclamacaoResolvida: "Résolue", semReclamacoes: "Aucune réclamation.", assuntoPlaceholder: "Ex: Article endommagé...", mensagemPlaceholder: "Décrivez le problème...", avaliacoes: "Évaluations", avaliarExperiencia: "Évaluez votre expérience", avaliacaoEnviada: "Évaluation envoyée ! Merci.", comentarioPlaceholder: "Laissez un commentaire (facultatif)...", enviarAvaliacao: "Envoyer", tuaAvaliacao: "Votre évaluation", avaliacaoEmpresa: "Évaluation de Nora Grei", semAvaliacoes: "Pas encore de locations terminées.", tabPerfil: "Profil", tabPedidos: "Commandes", tabGuardados: "Favoris", tabLoja: "Ma boutique", tabMensagens: "Messages", tabCalculadora: "Calculatrice", tabNotificacoes: "Notifications", falarLojista: "Contacter la boutique", semNotificacoes: "Aucune notification pour le moment.", marcarLidas: "Tout marquer comme lu", caucaoLabel: "Dépôt", popCuriosidade: "Avez-vous évalué une pièce aujourd'hui qui pourrait vous rapporter ?", popCuriosidadeBtn: "Évaluer maintenant →", calcTitulo: "Combien vaut votre pièce ?", calcSub: "Découvrez le potentiel de votre pièce dans le circuit de mode circulaire.", calcPrecoLabel: "Valeur d'origine (€)", calcPrecoPlaceholder: "Ex: 350", calcMarcaLabel: "Marque", calcMarcaPlaceholder: "Ex: Gucci, Zara…", calcEstadoLabel: "État", calcIdadeLabel: "Âge de la pièce", calcResultado: "Estimation de retour", calcVerMais: "Calculatrice complète →", semPedidos: "Vous n'avez pas encore de commandes.", explorarCatalogo: "Explorer le catalogue →", pecasGuardadas: "Pièces sauvegardées", semGuardados: "Vous n'avez encore rien sauvegardé.", indisponivel: "Indisponible", disponivel: "Disponible", alugada: "Louée", disponivelEm: "Disponible dans", alugar: "Louer →", reservar: "Réserver →", selecionar: "— Sélectionner —", moradaEntrega: "Adresse de livraison", moradaVazia: "Non renseignée", documentosIdentidade: "Documents d'identité", docsVazios: "Non renseignés", docsDesc: "Nécessaires pour la vérification d'identité et le dépôt.", erroFoto: "Erreur lors de l'enregistrement de la photo. Réessayez.", erroGeral: "Une erreur s'est produite. Réessayez.", tabSuporte: "Support", novoTicket: "Nouveau ticket", semTickets: "Aucun ticket de support.", ticketAssunto: "Sujet du ticket", ticketCategoria: "Catégorie", ticketPrioridade: "Priorité", ticketMensagem: "Décrivez le problème", criarTicket: "Créer le ticket", ticketCriado: "Ticket créé avec succès !", ticketAberto: "Ouvert", ticketEmCurso: "En cours", ticketFechado: "Fermé", prioUrgente: "Urgent", prioNormal: "Normal", prioBaixa: "Basse", catBug: "Bug technique", catPagamento: "Paiement", catConta: "Compte", catStock: "Stock / Pièces", catEnvios: "Livraisons", catOutro: "Autre", enviarResposta: "Envoyer la réponse", respostaAdmin: "Nora Grei", respostaLojista: "Vous",
    dadosFinanceiros: "Données financières", dadosFinanceirosDesc: "Coordonnées bancaires pour la réception des gains et le paiement des services Nora Grei.", ibanLabel: "IBAN (pour recevoir vos gains)", ibanPlaceholder: "FR76 0000 0000 0000 0000 0000 000", ibanVazio: "IBAN non configuré", ibanValido: "IBAN valide ✓", ibanInvalido: "Format IBAN invalide", cartaoLabel: "Carte de crédit ou débit (paiement des services)", cartaoNumero: "Numéro de carte", cartaoNome: "Nom sur la carte", cartaoValidade: "Validité (MM/AA)", cartaoVazio: "Carte non configurée", cartaoValido: "Carte valide ✓", cartaoInvalido: "Numéro de carte invalide", cartaoValidadeInvalida: "Date de validité invalide", cartaoGuardadoFim: "Carte se terminant par", guardarFinanceiros: "Enregistrer les données financières", navPessoal: "Personnel", navMorada: "Adresse", navDocs: "Documents", navFinanceiros: "Finances", navSeguranca: "Sécurité",
  },
  lt: {
    titulo: "Mano profilis", dadosPessoais: "Asmeniniai duomenys",
    nome: "Vardas, pavardė", nomePub: "Viešas vardas / Slapyvardis", nomePubDica: "Kaip matote platformoje. Jei nenustatyta, naudojamas tikrasis vardas.", email: "El. paštas", telefone: "Telefonas",
    dataNascimento: "Gimimo data", genero: "Lytis",
    generosOpcoes: ["Moteris", "Vyras", "Nenoriu nurodyti"],
    comoTeVes: "Kaip šiandien save matote?", comoTeVesOpcoes: ["Administracinė / Biuras","Sveikata ir priežiūra","Švietimas","Restoranai ir viešbučiai","Pramogos ir naktinis gyvenimas","Kūryba / Menas / Mada","Vadyba ir verslas","Technologijos","Prekyba ir mažmeninė","Studentė","Verslininkė","Pereinamajame etape","Nenoriu dalintis"],
    nif: "Mokesčių mokėtojo kodas", nifPlaceholder: "123 456 789",
    numeroCC: "Asmens kodas / dokumento numeris", numeroCCPlaceholder: "12345678 9 ZZ0",
    localizacao: "Vieta", cidade: "Miestas", pais: "Šalis",
    codigoPostal: "Pašto kodas", morada: "Pilnas adresas",
    numeroPorta: "Namo numeris", andar: "Aukštas / Butas",
    detectarLocalizacao: "Nustatyti automatiškai",
    localizacaoOk: "Vieta nustatyta ✓",
    guardar: "Išsaugoti", guardado: "Išsaugota! ✓",
    historico: "Nuomos istorija",
    semHistorico: "Kol kas neturite nuomos.",
    verCatalogo: "Naršyti katalogą",
    sair: "Atsijungti",
    verPedidos: "Žiūrėti mano užsakymus",
    perfilIncompleto: "Profilis nepilnas",
    perfilIncompletoDesc: "Norėdami nuomoti drabužius, mums reikia šių pristatymo duomenų: pilno adreso, pašto kodo, miesto, mokesčių kodo, asmens dokumento numerio ir telefono.",
    camposObrigatorios: "* Privalomi laukai norint nuomoti",
    nivelConfianca: "Pasitikėjimo lygis",
    caucao: "užstatas",
    semCaucao: "Be",
    faltam: "Trūksta",
    para: "iki",
    nivelMaximo: "Maksimalus lygis — užstatas nemokamas",
    pontosFidelizacao: "Lojalumo taškai",
    pontosDesc: "1 taškas už kiekvieną nuomą · 10-as drabužis nemokamas",
    emCurso: "Vykstantys",
    alugueresLabel: "Nuomos",
    totalGasto: "Iš viso išleista",
    reservas: "Rezervacijos",
    pontosLabel: "Taškai",
    codigoDesconto: "Nuolaidos kodas",
    descontoInfo: "Atskaitoma nuo galutinės kainos noragrei.com —",
    copiado: "Nukopijuota!",
    copiar: "Kopijuoti",
    irLoja: "Eiti į parduotuvę ↗",
    comprarPeca: "Pirkti šį drabužį",
    comprarModal: "Kaip norite įsigyti šį drabužį?",
    comprarUsada: "Pirkti naudotą",
    comprarUsadaDesc: "Drabužis, kurį nuomojotės, patikrintas ir geros būklės",
    comprarNova: "Kuponas naujam drabužiui",
    comprarNovaDesc: "Naudokite nuomos sumą kaip nuolaidą noragrei.com",
    comprarNovaValor: "Nuolaida",
    cancelar: "Atšaukti",
    pagarReferencia: "Generuoti MB nuorodą",
    portesEnvio: "Pristatymo mokestis",
    totalUsada: "Iš viso mokėti",
    referenciaGerada: "MB nuoroda",
    entidade: "Įmonė",
    montante: "Suma",
    validadeRef: "Galioja iki",
    pecaEnviada: "Nora Grei išsiųs drabužį po mokėjimo patvirtinimo.",
    metodoPagamento: "Mokėjimo būdas",
    imediato: "Iš karto", manual: "Rankinis",
    refGerada: "Nuoroda bus sugeneruota po patvirtinimo",
    telMbway: "MB Way telefono numeris",
    simPag: "Mokėjimo simuliacija.",
    montanteVirer: "Suma pervedimui",
    nomeCompleto: "Jūsų vardas ir pavardė",
    anexarComp: "📎 Pridėti įrodymą",
    reservado24h: "Jūsų užsakymas bus rezervuotas 24h, kol patvirtinsime.",
    confirmarCompra: "Patvirtinti pirkimą",
    voltarInicio: "← Pradžia",
    confirmarRecepcao: "Patvirtinti gavimą",
    confirmandoRecepcao: "Tvirtinama...",
    recepcaoConfirmada: "Gavimas patvirtintas! Jūsų nuoma dabar aktyvi.",
    referencia: "Nr.",
    reservaDisponivelTitulo: "Jūsų rezervuotas drabužis yra prieinamas",
    reservaDisponivelDesc: "Patvirtinkite mokėjimą, kad užtikrintumėte savo nuomą, kol rezervacija nepasibaigė.",
    reservaTamanho: "Dydis",
    reservaConfirmar: "Patvirtinti ir mokėti",
    reservaPrazoTempo: "Laikas patvirtinti:",
    verTalao: "Žiūrėti kvitą",
    dataLabel: "Data", metodoLabel: "Mokėjimo būdas",
    aluguer: "Nuoma", higienizacao: "Valymas", deposito: "Užstatas", total: "Iš viso",
    pago: "✓ Apmokėta", aguardarPagamento: "Laukiama mokėjimo", mudarPassword: "Keisti slaptažodį", novaPassword: "Naujas slaptažodis", confirmarPassword: "Patvirtinti", guardarPassword: "Išsaugoti", passwordMin: "Mažiausiai 6 simboliai.", passwordMatch: "Slaptažodžiai nesutampa.", passwordOk: "Slaptažodis pakeistas!", passwordErro: "Klaida. Bandykite dar kartą.", reclamacoes: "Skundai", novaReclamacao: "Naujas skundas", assunto: "Tema", mensagem: "Žinutė", enviarReclamacao: "Siųsti", reclamacaoEnviada: "Skundas išsiųstas!", reclamacaoPendente: "Laukiama", reclamacaoResolvida: "Išspręsta", semReclamacoes: "Nėra skundų.", assuntoPlaceholder: "Pvz: Sugadintas drabužis...", mensagemPlaceholder: "Aprašykite problemą...", avaliacoes: "Atsiliepimai", avaliarExperiencia: "Įvertinkite savo patirtį", avaliacaoEnviada: "Atsiliepimas išsiųstas!", comentarioPlaceholder: "Palikite komentarą...", enviarAvaliacao: "Siųsti", tuaAvaliacao: "Jūsų įvertinimas", avaliacaoEmpresa: "Nora Grei įvertinimas", semAvaliacoes: "Dar nėra užbaigtų nuomų.", tabPerfil: "Profilis", tabPedidos: "Užsakymai", tabGuardados: "Išsaugoti", tabLoja: "Mano parduotuvė", tabMensagens: "Žinutės", tabCalculadora: "Skaičiuoklė", tabNotificacoes: "Pranešimai", falarLojista: "Susisiekti su pardavėju", semNotificacoes: "Kol kas nėra pranešimų.", marcarLidas: "Pažymėti visus kaip skaitytus", caucaoLabel: "Užstatas", popCuriosidade: "Ar šiandien įvertinote kokį drabužį, kuris galėtų jums atnešti vertės?", popCuriosidadeBtn: "Įvertinti dabar →", calcTitulo: "Kiek verta jūsų dalis?", calcSub: "Atraskite savo drabužio potencialą aplinkai draugiškoje madoje.", calcPrecoLabel: "Originali drabužio kaina (€)", calcPrecoPlaceholder: "Pvz: 350", calcMarcaLabel: "Prekės ženklas", calcMarcaPlaceholder: "Pvz: Gucci, Zara…", calcEstadoLabel: "Būklė", calcIdadeLabel: "Amžius", calcResultado: "Grąžos įvertinimas", calcVerMais: "Išsami skaičiuoklė →", semPedidos: "Dar neturite užsakymų.", explorarCatalogo: "Naršyti katalogą →", pecasGuardadas: "Išsaugoti drabužiai", semGuardados: "Dar nieko neišsaugojote.", indisponivel: "Neprieinama", disponivel: "Prieinama", alugada: "Išnuomota", disponivelEm: "Prieinama po", alugar: "Nuomoti →", reservar: "Rezervuoti →", selecionar: "— Pasirinkti —", moradaEntrega: "Pristatymo adresas", moradaVazia: "Nepildyta", documentosIdentidade: "Tapatybės dokumentai", docsVazios: "Nepildyti", docsDesc: "Reikalingi tapatybės patikrinimui ir užstatui.", erroFoto: "Klaida išsaugant nuotrauką. Bandykite dar kartą.", erroGeral: "Įvyko klaida. Bandykite dar kartą.", tabSuporte: "Pagalba", novoTicket: "Naujas bilietas", semTickets: "Nėra pagalbos bilietų.", ticketAssunto: "Bilieto tema", ticketCategoria: "Kategorija", ticketPrioridade: "Prioritetas", ticketMensagem: "Aprašykite problemą", criarTicket: "Sukurti bilietą", ticketCriado: "Bilietas sėkmingai sukurtas!", ticketAberto: "Atidarytas", ticketEmCurso: "Vykdomas", ticketFechado: "Uždarytas", prioUrgente: "Skubus", prioNormal: "Normalus", prioBaixa: "Žemas", catBug: "Techninis klaida", catPagamento: "Mokėjimas", catConta: "Paskyra", catStock: "Sandėlis / Drabužiai", catEnvios: "Pristatymas", catOutro: "Kita", enviarResposta: "Siųsti atsakymą", respostaAdmin: "Nora Grei", respostaLojista: "Jūs",
    dadosFinanceiros: "Finansiniai duomenys", dadosFinanceirosDesc: "Banko informacija pajamų gavimui ir Nora Grei paslaugų apmokėjimui.", ibanLabel: "IBAN (kur siunčiamos pajamos)", ibanPlaceholder: "LT00 0000 0000 0000 0000", ibanVazio: "IBAN nesukonfigūruotas", ibanValido: "IBAN galioja ✓", ibanInvalido: "Neteisingas IBAN formatas", cartaoLabel: "Kredito arba debeto kortelė (paslaugų apmokėjimas)", cartaoNumero: "Kortelės numeris", cartaoNome: "Vardas ant kortelės", cartaoValidade: "Galioja iki (MM/MM)", cartaoVazio: "Kortelė nesukonfigūruota", cartaoValido: "Kortelė galioja ✓", cartaoInvalido: "Neteisingas kortelės numeris", cartaoValidadeInvalida: "Neteisinga galiojimo data", cartaoGuardadoFim: "Kortelė baigiasi", guardarFinanceiros: "Išsaugoti finansinius duomenis", navPessoal: "Asmeniniai", navMorada: "Adresas", navDocs: "Dokumentai", navFinanceiros: "Finansai", navSeguranca: "Saugumas",
  },
};

function WishlistCard({ p, eDisponivel, i, lang }) {
  const tempo = useCountdownDetalhado(p._dataDisponivel || null);
  return (
    <div style={{display:"block",background:"var(--white)",textDecoration:"none",color:"var(--black)",position:"relative"}}>
      <a href={`/catalogo/${p.id}`} style={{display:"block",textDecoration:"none",color:"inherit"}}>
        {p.fotos?.[0]
          ? <img src={p.fotos[0]} alt={p.nome} style={{width:"100%",aspectRatio:"3/4",objectFit:"cover",display:"block"}} />
          : <div style={{width:"100%",aspectRatio:"3/4",background:"var(--g1)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"var(--serif)",fontSize:"2rem",color:"rgba(0,0,0,0.08)",fontStyle:"italic"}}>NG</span></div>
        }
      </a>
      <div style={{padding:"0.75rem"}}>
        <div style={{fontFamily:"var(--serif)",fontSize:"0.95rem",fontWeight:300,marginBottom:"0.2rem"}}>{p.nome}</div>
        {p.preco_aluguer_dia && <div style={{fontSize:"0.75rem",color:"var(--g4)",marginBottom:"0.4rem"}}>{p.preco_aluguer_dia}€/dia</div>}
        {eDisponivel ? (
          <>
            <div style={{display:"inline-block",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#27ae60",background:"rgba(39,174,96,0.08)",padding:"0.15rem 0.4rem",borderRadius:"2px",marginBottom:"0.5rem"}}>{i.disponivel}</div>
            <a href={`/catalogo/${p.id}`} style={{display:"block",textAlign:"center",padding:"0.45rem 0",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",background:"#c4748a",color:"#fff",textDecoration:"none",borderRadius:"2px"}}>{i.alugar}</a>
          </>
        ) : (
          <>
            <div style={{display:"inline-block",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#c0392b",background:"rgba(192,57,43,0.08)",padding:"0.15rem 0.4rem",borderRadius:"2px",marginBottom:"0.35rem"}}>{i.alugada}</div>
            {tempo && (
              <div style={{fontSize:"0.75rem",color:"var(--g5)",marginBottom:"0.35rem"}}>
                <span style={{color:"var(--g4)"}}>{i.disponivelEm}: </span>
                <span style={{fontWeight:600,color:"var(--black)"}}>{tempo}</span>
              </div>
            )}
            {!tempo && p._dataDisponivel && (
              <div style={{fontSize:"0.75rem",color:"var(--g5)",marginBottom:"0.35rem"}}>
                {i.disponivelEm}: {fmtData(p._dataDisponivel, lang)}
              </div>
            )}
            <a href={`/catalogo/${p.id}`} style={{display:"block",textAlign:"center",padding:"0.45rem 0",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",background:"var(--g2)",color:"var(--g6)",border:"1px solid var(--g2)",textDecoration:"none",borderRadius:"2px"}}>{i.reservar}</a>
          </>
        )}
      </div>
    </div>
  );
}

function StarRating({ value, onChange, readonly }) {
  return (
    <div style={{display:"flex",gap:"0.25rem"}}>
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button" onClick={() => !readonly && onChange && onChange(star)}
          style={{background:"none",border:"none",cursor:readonly?"default":"pointer",padding:"0.1rem",fontSize:"1.6rem",color:star <= value ? "#c4748a" : "#e2dfda",transition:"color 0.15s",lineHeight:1}}>
          ★
        </button>
      ))}
    </div>
  );
}

function CartaoAvaliacao({ aluguer, i }) {
  const peca = aluguer.stock_tamanhos?.pecas;
  const [avaliacao, setAvaliacao] = useState(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("avaliacoes").select("*").eq("aluguer_id", aluguer.id).maybeSingle().then(({ data }) => {
      if (data) { setAvaliacao(data); setNota(data.nota_cliente_empresa || 0); setEnviado(true); }
    });
  }, [aluguer.id]);

  const enviar = async () => {
    if (nota === 0) return;
    setLoading(true);
    await supabase.from("avaliacoes").upsert({
      aluguer_id: aluguer.id, cliente_id: aluguer.cliente_id,
      nota_cliente_empresa: nota, comentario_cliente: comentario || null,
    }, { onConflict: "aluguer_id" });
    setEnviado(true); setLoading(false);
  };

  return (
    <div style={{background:"var(--white)",padding:"1.25rem 1.5rem",marginBottom:"1px",borderLeft:"3px solid " + (enviado ? "#c4748a" : "var(--g2)")}}>
      <div style={{display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{width:48,height:60,flexShrink:0,background:"var(--g1)",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {peca?.fotos?.[0] ? <img src={peca.fotos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <span style={{fontFamily:"serif",fontSize:"1.3rem",color:"rgba(0,0,0,0.15)",fontStyle:"italic"}}>NG</span>}
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"serif",fontSize:"1.1rem",fontWeight:400,marginBottom:"0.5rem"}}>{peca?.nome || "—"}</div>
          <div style={{fontSize:"0.72rem",color:"var(--g6)",marginBottom:"0.75rem"}}>{aluguer.data_inicio} → {aluguer.data_fim}</div>
          {enviado ? (
            <>
              <div style={{fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.3rem"}}>{i.tuaAvaliacao}</div>
              <StarRating value={nota} readonly />
              {avaliacao?.comentario_cliente && <p style={{fontSize:"0.82rem",color:"var(--g6)",marginTop:"0.4rem",fontStyle:"italic"}}>"{avaliacao.comentario_cliente}"</p>}
              {avaliacao?.nota_empresa_cliente && (
                <div style={{marginTop:"1rem",paddingTop:"0.75rem",borderTop:"1px solid var(--g1)"}}>
                  <div style={{fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#c4748a",marginBottom:"0.3rem"}}>{i.avaliacaoEmpresa}</div>
                  <StarRating value={avaliacao.nota_empresa_cliente} readonly />
                  {avaliacao.comentario_empresa && <p style={{fontSize:"0.82rem",color:"var(--g6)",marginTop:"0.4rem",fontStyle:"italic"}}>"{avaliacao.comentario_empresa}"</p>}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.5rem"}}>{i.avaliarExperiencia}</div>
              <StarRating value={nota} onChange={setNota} />
              {nota > 0 && (
                <>
                  <textarea value={comentario} onChange={e => setComentario(e.target.value)} placeholder={i.comentarioPlaceholder}
                    style={{width:"100%",marginTop:"0.75rem",padding:"0.75rem",border:"1.5px solid var(--g2)",background:"var(--white)",fontFamily:"sans-serif",fontSize:"0.85rem",color:"var(--black)",resize:"vertical",minHeight:"80px",outline:"none"}} />
                  <button onClick={enviar} disabled={loading}
                    style={{marginTop:"0.5rem",padding:"0.6rem 1.5rem",background:"var(--black)",color:"var(--white)",border:"none",fontSize:"0.75rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontWeight:500}}>
                    {loading ? "..." : i.enviarAvaliacao}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AvaliacoesLojista({ alugueresLoja, clienteId }) {
  const concluidos = alugueresLoja.filter(a => ["devolvido","devolvido_danificado"].includes(a.estado));
  const [avaliacoes, setAvaliacoes] = useState({});
  const [respostas, setRespostas] = useState({});
  const [loadingIds, setLoadingIds] = useState({});

  useEffect(() => {
    if (!concluidos.length) return;
    const ids = concluidos.map(a => a.id);
    supabase.from("avaliacoes_lojista").select("*").in("aluguer_lojista_id", ids).then(({ data }) => {
      if (data) {
        const map = {};
        data.forEach(av => { map[av.aluguer_lojista_id] = av; });
        setAvaliacoes(map);
        const r = {};
        data.forEach(av => { r[av.aluguer_lojista_id] = { nota: av.nota_lojista_cliente || 0, comentario: av.comentario_lojista || "" }; });
        setRespostas(r);
      }
    });
  }, [concluidos.length]);

  const estrelas = (n, onChange) => (
    <div style={{display:"flex",gap:"0.2rem"}}>
      {[1,2,3,4,5].map(v => (
        <span key={v} onClick={() => onChange && onChange(v)} style={{fontSize:"1.2rem",cursor:onChange?"pointer":"default",color:v<=n?"#c4748a":"#e2dfda",lineHeight:1}}>★</span>
      ))}
    </div>
  );

  const enviarResposta = async (aluguerLojista) => {
    const r = respostas[aluguerLojista.id];
    if (!r?.nota) return;
    setLoadingIds(l => ({...l, [aluguerLojista.id]: true}));
    await supabase.from("avaliacoes_lojista").upsert({
      aluguer_lojista_id: aluguerLojista.id,
      cliente_id: aluguerLojista.cliente_id,
      lojista_id: clienteId,
      nota_lojista_cliente: r.nota,
      comentario_lojista: r.comentario || null,
    }, { onConflict: "aluguer_lojista_id" });
    setAvaliacoes(prev => ({...prev, [aluguerLojista.id]: {...(prev[aluguerLojista.id]||{}), nota_lojista_cliente: r.nota, comentario_lojista: r.comentario}}));
    setLoadingIds(l => ({...l, [aluguerLojista.id]: false}));
  };

  if (concluidos.length === 0) return (
    <p style={{color:"#aaa",fontSize:"0.85rem",textAlign:"center",padding:"2rem 0"}}>Ainda não tens alugueres concluídos.</p>
  );

  // Média global
  const notasRecebidas = Object.values(avaliacoes).filter(av => av.nota_cliente_lojista).map(av => av.nota_cliente_lojista);
  const media = notasRecebidas.length ? (notasRecebidas.reduce((s,n)=>s+n,0)/notasRecebidas.length).toFixed(1) : null;

  return (
    <>
      {media && (
        <div style={{display:"flex",alignItems:"center",gap:"1rem",padding:"1rem",background:"#fdf6f8",borderLeft:"3px solid #c4748a",marginBottom:"1.5rem"}}>
          <div style={{fontFamily:"var(--serif)",fontSize:"2.5rem",fontWeight:300,color:"#c4748a",lineHeight:1}}>{media}</div>
          <div>
            <div style={{display:"flex",gap:"0.15rem",marginBottom:"0.2rem"}}>
              {[1,2,3,4,5].map(v=><span key={v} style={{fontSize:"1rem",color:v<=Math.round(media)?"#c4748a":"#e2dfda"}}>★</span>)}
            </div>
            <div style={{fontSize:"0.68rem",color:"var(--g4)",letterSpacing:"0.1em"}}>{notasRecebidas.length} avaliação{notasRecebidas.length!==1?"ões":""}</div>
          </div>
        </div>
      )}

      {concluidos.map(a => {
        const av = avaliacoes[a.id];
        const r = respostas[a.id] || { nota: 0, comentario: "" };
        const jaRespondeu = av?.nota_lojista_cliente;

        return (
          <div key={a.id} style={{padding:"1rem 0",borderBottom:"1px solid var(--g1)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.5rem"}}>
              <div>
                <span style={{fontWeight:500,fontSize:"0.88rem"}}>{a.pecas_lojista?.nome||"—"}</span>
                <span style={{color:"#aaa",marginLeft:"0.5rem",fontSize:"0.75rem"}}>· {a.clientes?.nome}</span>
              </div>
              <span style={{fontSize:"0.68rem",color:"var(--g4)"}}>{a.data_fim}</span>
            </div>

            {av?.nota_cliente_lojista ? (
              <div style={{background:"var(--g1)",padding:"0.75rem",marginBottom:"0.75rem"}}>
                <div style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g4)",marginBottom:"0.3rem"}}>Avaliação do cliente</div>
                {estrelas(av.nota_cliente_lojista, null)}
                {av.comentario_cliente && <p style={{fontSize:"0.78rem",color:"var(--g4)",marginTop:"0.3rem",fontStyle:"italic"}}>"{av.comentario_cliente}"</p>}
              </div>
            ) : (
              <p style={{fontSize:"0.75rem",color:"#aaa",marginBottom:"0.75rem",fontStyle:"italic"}}>Cliente ainda não avaliou.</p>
            )}

            <div style={{background:"#fdf6f8",padding:"0.75rem",borderLeft:"2px solid #c4748a"}}>
              <div style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#c4748a",marginBottom:"0.4rem"}}>
                {jaRespondeu ? "A tua avaliação do cliente" : "Avaliar este cliente"}
              </div>
              {estrelas(jaRespondeu || r.nota, jaRespondeu ? null : (v) => setRespostas(prev=>({...prev,[a.id]:{...r,nota:v}})))}
              {!jaRespondeu && r.nota > 0 && (
                <>
                  <textarea value={r.comentario} onChange={e=>setRespostas(prev=>({...prev,[a.id]:{...r,comentario:e.target.value}}))}
                    placeholder="Comentário opcional sobre o cliente..."
                    style={{width:"100%",marginTop:"0.5rem",padding:"0.5rem",border:"1.5px solid var(--g2)",background:"#fff",fontFamily:"var(--sans)",fontSize:"0.8rem",resize:"vertical",minHeight:"60px",outline:"none"}} />
                  <button onClick={()=>enviarResposta(a)} disabled={loadingIds[a.id]}
                    style={{marginTop:"0.5rem",padding:"0.5rem 1.1rem",background:"#c4748a",color:"#fff",border:"none",fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"var(--sans)",cursor:"pointer"}}>
                    {loadingIds[a.id]?"...":"Guardar avaliação"}
                  </button>
                </>
              )}
              {jaRespondeu && av.comentario_lojista && <p style={{fontSize:"0.78rem",color:"var(--g4)",marginTop:"0.3rem",fontStyle:"italic"}}>"{av.comentario_lojista}"</p>}
            </div>
          </div>
        );
      })}
    </>
  );
}

const CAMPOS_OBRIGATORIOS = ["nome", "telefone", "morada", "numero_porta", "codigo_postal", "cidade", "nif", "numero_cc"];

// Mini calculadora para a tab Calculadora no perfil
function MiniCalculadora({ lang, i }) {
  const [preco, setPreco] = useState("");
  const [marca, setMarca] = useState("");
  const [estado, setEstado] = useState("bom");
  const [idade, setIdade] = useState("1a2");

  const ESTADOS_MINI = [
    { id:"como_novo", label: {pt:"Como novo",fr:"Comme neuf",lt:"Kaip naujas"} },
    { id:"bom",       label: {pt:"Bom estado",fr:"Bon état",lt:"Gera būklė"} },
    { id:"usado",     label: {pt:"Usado",fr:"Utilisé",lt:"Naudotas"} },
    { id:"com_defeito", label: {pt:"Com defeito",fr:"Avec défaut",lt:"Su defektu"} },
  ];
  const IDADES_MINI = [
    { id:"novo",  label: {pt:"< 1 ano",fr:"< 1 an",lt:"< 1 metai"} },
    { id:"1a2",   label: {pt:"1-2 anos",fr:"1-2 ans",lt:"1-2 metai"} },
    { id:"2a4",   label: {pt:"2-4 anos",fr:"2-4 ans",lt:"2-4 metai"} },
    { id:"4mais", label: {pt:"+4 anos",fr:"+4 ans",lt:"+4 metai"} },
  ];

  const est = calcEstimativaP({ valor_peca: preco, marca, condicao: estado, idade_peca: idade, categoria: "mid", contexto_venda: 0 });
  const p = parseFloat(preco) || 0;

  const pill = {
    display:"inline-block", padding:"0.35rem 0.75rem",
    border:"1px solid var(--g1)", borderRadius:"20px",
    fontSize:"0.72rem", cursor:"pointer",
    fontFamily:"var(--sans)", margin:"0.2rem",
    transition:"all 0.15s",
  };
  const pillSel = { ...pill, background:"var(--g5)", color:"#fff", borderColor:"var(--g5)" };

  return (
    <div style={{maxWidth:"440px",margin:"0 auto",padding:"0 0.5rem"}}>
      <h2 style={{fontFamily:"var(--serif)",fontSize:"1.45rem",fontWeight:300,marginBottom:"0.25rem",letterSpacing:"0.03em"}}>{i.calcTitulo}</h2>
      <p style={{fontSize:"0.78rem",color:"var(--g4)",marginBottom:"1.5rem",lineHeight:1.5}}>{i.calcSub}</p>

      {/* Preço */}
      <div style={{marginBottom:"1rem"}}>
        <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g4)",marginBottom:"0.4rem"}}>{i.calcPrecoLabel}</div>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",border:"1px solid var(--g1)",borderRadius:"10px",padding:"0.65rem 1rem",background:"var(--bg)"}}>
          <span style={{color:"var(--g4)",fontFamily:"var(--serif)",fontSize:"1.1rem"}}>€</span>
          <input type="number" min="0" placeholder={i.calcPrecoPlaceholder}
            value={preco} onChange={e=>setPreco(e.target.value)}
            style={{border:"none",background:"transparent",fontFamily:"var(--serif)",fontSize:"1.5rem",color:"var(--g5)",outline:"none",width:"100%"}}
          />
        </div>
      </div>

      {/* Marca */}
      <div style={{marginBottom:"1rem"}}>
        <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g4)",marginBottom:"0.4rem"}}>{i.calcMarcaLabel}</div>
        <input type="text" placeholder={i.calcMarcaPlaceholder}
          value={marca} onChange={e=>setMarca(e.target.value)}
          style={{width:"100%",border:"1px solid var(--g1)",borderRadius:"10px",padding:"0.65rem 1rem",background:"var(--bg)",fontFamily:"var(--sans)",fontSize:"0.85rem",color:"var(--g5)",outline:"none",boxSizing:"border-box"}}
        />
      </div>

      {/* Estado */}
      <div style={{marginBottom:"1rem"}}>
        <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g4)",marginBottom:"0.5rem"}}>{i.calcEstadoLabel}</div>
        <div>{ESTADOS_MINI.map(e=>(
          <button key={e.id} style={estado===e.id?pillSel:pill} onClick={()=>setEstado(e.id)}>{e.label[lang]||e.label.pt}</button>
        ))}</div>
      </div>

      {/* Idade */}
      <div style={{marginBottom:"1.5rem"}}>
        <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g4)",marginBottom:"0.5rem"}}>{i.calcIdadeLabel}</div>
        <div>{IDADES_MINI.map(id=>(
          <button key={id.id} style={idade===id.id?pillSel:pill} onClick={()=>setIdade(id.id)}>{id.label[lang]||id.label.pt}</button>
        ))}</div>
      </div>

      {/* Resultado */}
      {est && p > 0 && (
        <div style={{background:"var(--g5)",borderRadius:"14px",padding:"1.5rem",marginBottom:"1rem",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:"1rem",top:"50%",transform:"translateY(-50%)",fontFamily:"var(--serif)",fontSize:"5rem",fontWeight:300,color:"rgba(255,255,255,0.05)",lineHeight:1}}>NG</div>
          <div style={{fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(255,255,255,0.4)",marginBottom:"0.4rem"}}>{i.calcResultado}</div>
          <div style={{fontFamily:"var(--serif)",fontSize:"2.8rem",fontWeight:400,color:"#fff",lineHeight:1,marginBottom:"0.4rem"}}>€{Math.round(est.ganho12m ?? est.valorMercado)}</div>
          <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.45)",marginBottom:"0.3rem"}}>{lang==="fr"?"Estimation sur 12 mois":lang==="lt"?"Įvertinimas per 12 mėn.":"Estimativa a 12 meses"}</div>
          {est.tier && est.tier !== "massmarket" && (
            <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.55)"}}>
              {est.tier==="investimento" ? "📈 " + (lang==="fr"?"Pièce d'investissement":lang==="lt"?"Investicinė dalis":"Peça de investimento") :
               est.tier==="premium" ? "✦ " + (lang==="fr"?"Marque premium":lang==="lt"?"Premium prekės ženklas":"Marca premium") : ""}
            </div>
          )}
        </div>
      )}

      <a href="/calculadora" style={{display:"block",textAlign:"center",padding:"0.85rem",border:"1px solid var(--g1)",borderRadius:"10px",color:"var(--rosa)",textDecoration:"none",fontFamily:"var(--sans)",fontSize:"0.72rem",letterSpacing:"0.14em",textTransform:"uppercase",marginTop:"0.5rem"}}>
        {i.calcVerMais}
      </a>
    </div>
  );
}

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({ nome: "", nome_publico: "", telefone: "", morada: "", numero_porta: "", andar: "", foto_perfil: "", nif: "", numero_cc: "", data_nascimento: "", genero: "", profissao: "", cidade: "", pais: "Portugal", codigo_postal: "", latitude: null, longitude: null });
  const [stats, setStats] = useState({ totalAlugueres: 0, totalGasto: 0, pecasAtivas: 0, reservas: 0, pontos: 0, totalPecas: 0 });
  const [alugueres, setAlugueres] = useState([]);
  const [reembolsosPendentes, setReembolsosPendentes] = useState([]);
  const [wishlistPecas, setWishlistPecas] = useState([]);
  const [reservasDisponiveis, setReservasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardado, setGuardado] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [showReferralBanner, setShowReferralBanner] = useState(false);
  const [showModalConvida, setShowModalConvida] = useState(false);
  const [detectandoLoc, setDetectandoLoc] = useState(false);
  const [locDetectada, setLocDetectada] = useState(false);
  const [lang, setLang] = useState("pt");
  const [modoLojista, setModoLojista] = useState(false);
  const [tabAtiva, setTabAtiva] = useState("perfil");
  const [menuAberto, setMenuAberto] = useState(false);
  const [naoLidasMsg, setNaoLidasMsg] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [naoLidasNotifs, setNaoLidasNotifs] = useState(0);
  const [popCuriosidadeVisto, setPopCuriosidadeVisto] = useState(false);
  const [pecasLoja, setPecasLoja] = useState([]);
  const [alugueresLoja, setAlugueresLoja] = useState([]);
  const [diasTeste, setDiasTeste] = useState(180);
  const [codigoLoja, setCodigoLoja] = useState(null);
  const [editandoUrl, setEditandoUrl] = useState(false);
  const [novoUrl, setNovoUrl] = useState("");
  const [urlStatus, setUrlStatus] = useState(null); // null | "checking" | "ok" | "taken" | "invalid"
  const [urlCheckTimer, setUrlCheckTimer] = useState(null);
  const [tabLoja, setTabLoja] = useState("dashboard");
  const [tickets, setTickets] = useState([]);
  const [ticketAtivo, setTicketAtivo] = useState(null);
  const [ticketMsgs, setTicketMsgs] = useState([]);
  const [novoTicketAberto, setNovoTicketAberto] = useState(false);
  const [tkAssunto, setTkAssunto] = useState("");
  const [tkCategoria, setTkCategoria] = useState("outro");
  const [tkPrioridade, setTkPrioridade] = useState("normal");
  const [tkMensagem, setTkMensagem] = useState("");
  const [tkResposta, setTkResposta] = useState("");
  const [tkEnviando, setTkEnviando] = useState(false);
  const [showNovaPeca, setShowNovaPeca] = useState(false);
  const [novaPeca, setNovaPeca] = useState({ nome: "", descricao: "", tipo: "alugar", preco_aluguer_dia: "", preco_venda: "", valor_peca: "", material: "", marca: "", cor: "", categoria: "", condicao: "como_novo", tem_defeito: false, descricao_defeito: "", higienizacao_ativa: false, higienizacao_valor: "", ocasioes: [], tamanhos: [{ tamanho: "M", quantidade: 1 }], link_compra_externa: "" });
  const [novaPecaLoading, setNovaPecaLoading] = useState(false);
  const [editarPeca, setEditarPeca] = useState(null);
  const [editarLoading, setEditarLoading] = useState(false);
  const [fotosEditar, setFotosEditar] = useState([]); // fotos a manter na edição
  const [gerirLojaLoading, setGerirLojaLoading] = useState(""); // "suspender"|"reativar"|"eliminar"|""
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [contextoVendaEditar, setContextoVendaEditar] = useState(0); // 0=sem pressa, 100=liquidez urgente
  const [contextoVendaNova, setContextoVendaNova] = useState(0);
  const [modalEnvio, setModalEnvio] = useState(null); // aluguer a marcar como enviado
  const [trackingInfo, setTrackingInfo] = useState({ transportadora: "", numero: "" });
  const [modalVerificar, setModalVerificar] = useState(null); // aluguer a verificar devolução
  const [modalCancelarLojista, setModalCancelarLojista] = useState(null); // lojista cancela por indisponibilidade
  const [fotosLojista, setFotosLojista] = useState([]);
  const [uploadProgressLoja, setUploadProgressLoja] = useState("");
  const [fotoValidacao, setFotoValidacao] = useState([]); // [{ok, motivo, categoria}] por foto
  const fotosLojistaRef = typeof window !== "undefined" ? { current: null } : { current: null };
  const [lojaIban, setLojaIban] = useState("");
  const [lojaIbanValido, setLojaIbanValido] = useState(null); // null | true | false
  const [lojaCartaoNumero, setLojaCartaoNumero] = useState("");
  const [lojaCartaoNome, setLojaCartaoNome] = useState("");
  const [lojaCartaoValidade, setLojaCartaoValidade] = useState("");
  const [lojaCartaoGuardadoUltimos4, setLojaCartaoGuardadoUltimos4] = useState("");
  const [financeirosMsg, setFinanceirosMsg] = useState("");
  const [financeirosLoading, setFinanceirosLoading] = useState(false);
  const [stripeFinDisponivel, setStripeFinDisponivel] = useState(false);
  const [stripeFinCarregando, setStripeFinCarregando] = useState(false);
  const [stripeFinClientSecret, setStripeFinClientSecret] = useState(null);
  const [stripeFinUltimos4, setStripeFinUltimos4] = useState("");
  const [lojaEstado, setLojaEstado] = useState("inativo");
  const [candidaturaLojista, setCandidaturaLojista] = useState(null); // null | "pendente" | "recusada"
  const [showFormLojista, setShowFormLojista] = useState(false);
  const [formLojista, setFormLojista] = useState({ nome_loja: "", descricao: "", iban: "", tipo_pagamento: "transferencia", nif: "", telefone_loja: "", morada: "", tipo_pecas: "", aceita_termos: false, aceita_responsabilidades: false, cartao_numero: "", cartao_validade: "", cartao_cvv: "" });
  const [formLojistaMsg, setFormLojistaMsg] = useState("");
  const [formLojistaLoading, setFormLojistaLoading] = useState(false);
  const [stripeDisponivel, setStripeDisponivel] = useState(false);
  const [stripeCarregando, setStripeCarregando] = useState(true);
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [novaPass, setNovaPass] = useState("");
  const [confirmarPass, setConfirmarPass] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passMsgTipo, setPassMsgTipo] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [reclamacoes, setReclamacoes] = useState([]);
  const [showNovaReclamacao, setShowNovaReclamacao] = useState(false);
  const [novaRec, setNovaRec] = useState({ assunto: "", mensagem: "", aluguer_id: "" });
  const [recMsg, setRecMsg] = useState("");
  const [recLoading, setRecLoading] = useState(false);
  const [secaoAberta, setSecaoAberta] = useState(null); // "pessoal" | "morada" | "docs" | "seguranca" | "suporte"
  const [ganhos, setGanhos] = useState({ referrals: [], config: null, totalPendente: 0, totalPago: 0 });
  const [codigoAfiliado, setCodigoAfiliado] = useState(null);
  const [creditosAfiliado, setCreditosAfiliado] = useState({ total: 0, disponiveis: 0, lista: [] });
  // Transferência de crédito
  const [showTransfCredito, setShowTransfCredito] = useState(false);
  const [transfDestinatario, setTransfDestinatario] = useState("");
  const [transfValor, setTransfValor] = useState("");
  const [transfStatus, setTransfStatus] = useState(null); // null | "loading" | "ok" | "erro"
  const [transfMsg, setTransfMsg] = useState("");
  const [boostersLoja, setBoostersLoja] = useState([]);
  const [tiposBoosters, setTiposBoosters] = useState([]);
  const [boostersLoading, setBoostersLoading] = useState(false);
  const [pagamentosBooster, setPagamentosBooster] = useState([]);
  const [subTabCustos, setSubTabCustos] = useState("alugueres");
  const [pecaLinksAberta, setPecaLinksAberta] = useState(null);
  const [pecaSimuladorAberta, setPecaSimuladorAberta] = useState(null); // id da peça com simulador aberto
  const [avaliacoesLoja, setAvaliacoesLoja] = useState([]); // avaliacoes_lojista para cálculo de nota média
  const [higienizacaoLojista, setHigienizacaoLojista] = useState({}); // { categoria: valor }
  const [higienizacaoPadrao, setHigienizacaoPadrao] = useState({}); // fallback da plataforma
  const [higienizacaoSaving, setHigienizacaoSaving] = useState(false);
  const [higienizacaoOk, setHigienizacaoOk] = useState(false);
  const fileRef = useRef();

  // Lembrete de referral — aparece 45s após carregar, se não foi dispensado hoje
  useEffect(() => {
    const dispensado = localStorage.getItem("ng_referral_dispensado");
    const hoje = new Date().toDateString();
    if (dispensado === hoje) return;
    const timer = setTimeout(() => setShowReferralBanner(true), 45000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && t[saved]) setLang(saved);
    carregarPerfil();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: recs } = await supabase.from("reclamacoes").select("*").eq("cliente_id", session.user.id).order("created_at", { ascending: false });
        if (recs) setReclamacoes(recs);
      }
    });
  }, []);

  const carregarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/entrar"; return; }
    setUser(user);

    const { data: c } = await supabase.from("clientes").select("*").eq("id", user.id).single();
    if (c) {
      setPerfil({ nome: c.nome||"", nome_publico: c.nome_publico||"", telefone: c.telefone||"", morada: c.morada||"", numero_porta: c.numero_porta||"", andar: c.andar||"", foto_perfil: c.foto_perfil||user.user_metadata?.avatar_url||"", nif: c.nif||"", numero_cc: c.numero_cc||"", data_nascimento: c.data_nascimento||"", genero: c.genero||"", profissao: c.profissao||"", cidade: c.cidade||"", pais: c.pais||"Portugal", codigo_postal: c.codigo_postal||"", latitude: c.latitude||null, longitude: c.longitude||null });
      if (c.modo_lojista) {
        setModoLojista(true);
        setLojaEstado(c.lojista_estado||"teste");
        if (c.codigo_cliente) setCodigoLoja(c.codigo_cliente);
        setLojaIban(c.lojista_iban||"");
        if (c.lojista_cartao_ultimo4) setLojaCartaoGuardadoUltimos4(c.lojista_cartao_ultimo4);
        if (c.lojista_cartao_nome) setLojaCartaoNome(c.lojista_cartao_nome);
        if (c.lojista_cartao_validade) setLojaCartaoValidade(c.lojista_cartao_validade);
        if (c.candidatura_lojista) setCandidaturaLojista(c.candidatura_lojista);
        if (c.lojista_desde) {
          const diasPassados = Math.floor((new Date() - new Date(c.lojista_desde)) / 86400000);
          setDiasTeste(Math.max(0, 180 - diasPassados));
        }
        const { data: ps } = await supabase.from("pecas_lojista").select("*, stock_lojista(*)").eq("cliente_id", user.id).order("created_at", { ascending: false });
        if (ps) setPecasLoja(ps);
        if (ps && ps.length > 0) {
          const { data: als } = await supabase.from("alugueres_lojista").select("*, clientes(nome, email, telefone, cidade), pecas_lojista(nome, fotos, preco_aluguer_dia), stock_lojista(tamanho)").eq("lojista_id", user.id).order("created_at", { ascending: false });
          if (als) {
            setAlugueresLoja(als);
            // carregar avaliações para cálculo da nota média no dashboard
            const { data: avs } = await supabase.from("avaliacoes_lojista").select("nota_cliente_lojista, nota_plataforma, motivo_plataforma, comentario_cliente, created_at, clientes(nome, foto_perfil)").eq("lojista_id", user.id).order("created_at", { ascending: false });
            if (avs) setAvaliacoesLoja(avs);
            // Carregar tabela de higienização do lojista
            const { data: hig } = await supabase.from("higienizacao_lojista").select("categoria, valor").eq("lojista_id", user.id);
            if (hig) {
              const map = {};
              hig.forEach(h => { map[h.categoria] = h.valor; });
              setHigienizacaoLojista(map);
            }
            // Carregar valores padrão da plataforma
            const { data: pad } = await supabase.from("higienizacao_padrao").select("categoria, valor");
            if (pad) {
              const map = {};
              pad.forEach(h => { map[h.categoria] = h.valor; });
              setHigienizacaoPadrao(map);
            }
          }
        }
      } else {
        // Não é lojista — verificar se tem candidatura pendente
        if (c.candidatura_lojista) setCandidaturaLojista(c.candidatura_lojista);
      }
    }

    // reembolsos pendentes de escolha do cliente
    const { data: rp } = await supabase.from("reembolsos_pendentes").select("*, alugueres_lojista(id, pecas_lojista(nome))").eq("cliente_id", user.id).eq("estado", "aguarda_escolha").order("created_at", { ascending: false });
    if (rp) setReembolsosPendentes(rp);

    const { data: al } = await supabase.from("alugueres").select("*, stock_tamanhos(tamanho, pecas(nome, codigo_referencia, preco_aluguer_dia, fotos, lojista_id))").eq("cliente_id", user.id).order("created_at", { ascending: false });
    if (al) {
      setAlugueres(al);
      const completos = al.filter(a => ["devolvido","devolvido_danificado"].includes(a.estado)).length;
      const ativos = al.filter(a => ["ativo","enviado","confirmado","pendente","em_verificacao"].includes(a.estado)).length;
      const gasto = al.reduce((s, a) => s + (a.valor_aluguer || 0), 0);
      setStats({ totalAlugueres: al.filter(a => a.estado !== "cancelado").length, totalGasto: gasto, pecasAtivas: ativos, reservas: 0, pontos: completos, totalPecas: completos });
    }

    const { data: res } = await supabase.from("reservas_espera").select("id").eq("cliente_id", user.id).eq("estado", "aguarda");
    if (res) setStats(prev => ({ ...prev, reservas: res.length }));

    // Wishlist — inclui alugueres activos para mostrar disponibilidade
    const { data: wl } = await supabase.from("wishlist").select("peca_id, pecas(id, nome, preco_aluguer_dia, fotos, estado)").eq("cliente_id", user.id).order("created_at", { ascending: false });
    if (wl) {
      const pecasWl = wl.map(w => w.pecas).filter(Boolean);
      // Para cada peça, verificar se há aluguer activo e quando fica disponível
      const pecasComDisp = await Promise.all(pecasWl.map(async (p) => {
        if (p.estado !== "disponivel") {
          // Buscar stock_ids desta peça
          const { data: stocks } = await supabase.from("stock_tamanhos").select("id").eq("peca_id", p.id);
          const stockIds = stocks?.map(s => s.id) || [];
          if (stockIds.length > 0) {
            const { data: alAtivo } = await supabase
              .from("alugueres")
              .select("data_fim, data_disponivel_novamente, estado")
              .in("estado", ["ativo","enviado","confirmado","pendente"])
              .in("stock_id", stockIds)
              .order("data_fim", { ascending: false })
              .limit(1);
            const al = alAtivo?.[0];
            return { ...p, _dataDisponivel: al?.data_disponivel_novamente || al?.data_fim || null };
          }
        }
        return p;
      }));
      setWishlistPecas(pecasComDisp);
    }

    const agora = new Date().toISOString();
    const { data: resDisponiveis } = await supabase
      .from("reservas_espera")
      .select("*, stock_tamanhos(id, tamanho, pecas(id, nome, codigo_referencia, fotos))")
      .eq("cliente_id", user.id)
      .eq("estado", "notificado")
      .gt("prazo_confirmacao", agora)
      .order("notificado_em", { ascending: false });
    if (resDisponiveis) setReservasDisponiveis(resDisponiveis);

    // Não lidas de mensagens (cliente id = user.id neste projecto)
    const eLojistaLocal = !!(c && c.modo_lojista);
    const campoNL = eLojistaLocal ? "nao_lidas_lojista" : "nao_lidas_cliente";
    const campoId = eLojistaLocal ? "lojista_id" : "cliente_id";
    const { data: convNL } = await supabase.from("conversas").select(campoNL).eq(campoId, user.id);
    if (convNL) setNaoLidasMsg(convNL.reduce((s, cv) => s + (cv[campoNL] || 0), 0));

    // Notificações do cliente
    const { data: notifsData } = await supabase.from("notificacoes_cliente").select("*").eq("cliente_id", user.id).order("created_at", { ascending: false }).limit(30);
    if (notifsData) {
      setNotifs(notifsData);
      setNaoLidasNotifs(notifsData.filter(n => !n.lida).length);
    }

    // Ganhos de referral — disponível para todos
    const [{ data: refs }, { data: cfgRef }] = await Promise.all([
      supabase.from("referrals").select("*, pecas_lojista(nome, fotos)").eq("referidor_id", user.id).order("created_at", { ascending: false }),
      supabase.from("config_referral").select("*").single()
    ]);
    if (refs) {
      const pendente = refs.filter(r => !r.comissao_paga && r.status !== "cancelado").reduce((s, r) => s + (r.comissao_gerada || 0), 0);
      const pago = refs.filter(r => r.comissao_paga).reduce((s, r) => s + (r.comissao_gerada || 0), 0);
      setGanhos({ referrals: refs, config: cfgRef, totalPendente: pendente, totalPago: pago });
    }

    // Código de afiliado — gerar automaticamente se não existir
    let { data: codAfil } = await supabase.from("codigos_afiliado").select("*").eq("cliente_id", user.id).maybeSingle();
    if (!codAfil) {
      // Gerar código baseado no nome: primeiras letras + 4 dígitos aleatórios
      const { data: cli2 } = await supabase.from("clientes").select("nome").eq("id", user.id).maybeSingle();
      const nomeParts = (cli2?.nome || "USER").toUpperCase().replace(/[^A-Z]/g,"").slice(0,4);
      const sufixo = Math.floor(1000 + Math.random() * 9000);
      const novoCodigo = `${nomeParts}${sufixo}`;
      const { data: novo } = await supabase.from("codigos_afiliado").insert({ cliente_id: user.id, codigo: novoCodigo }).select().maybeSingle();
      codAfil = novo;
    }
    if (codAfil) setCodigoAfiliado(codAfil.codigo);

    // Créditos de afiliado
    const { data: creds } = await supabase.from("creditos_afiliado").select("*").eq("cliente_id", user.id).order("created_at", { ascending: false });
    if (creds) {
      const disponiveis = creds.filter(c => !c.usado).reduce((s, c) => s + (c.valor || 0), 0);
      const total = creds.reduce((s, c) => s + (c.valor || 0), 0);
      setCreditosAfiliado({ total, disponiveis, lista: creds });
    }

    // Boosters activos do lojista
    if (modoLojista) {
      const [{ data: boosters }, { data: tipos }, { data: pagsBst }] = await Promise.all([
        supabase.from("boosters_lojista").select("*, booster_tipos(nome, descricao)").eq("cliente_id", user.id).eq("ativo", true).order("created_at", { ascending: false }),
        supabase.from("booster_tipos").select("*").eq("ativo", true),
        supabase.from("pagamentos_booster").select("*").eq("cliente_id", user.id).order("created_at", { ascending: false })
      ]);
      if (boosters) setBoostersLoja(boosters);
      if (tipos) setTiposBoosters(tipos);
      if (pagsBst) setPagamentosBooster(pagsBst);
    }

    setLoading(false);
  };

  const detectarLocalizacao = () => {
    if (!navigator.geolocation) return;
    setDetectandoLoc(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      set("latitude", latitude); set("longitude", longitude);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        set("cidade", data.address?.city || data.address?.town || "");
        set("pais", data.address?.country || "");
        set("codigo_postal", data.address?.postcode || "");
        setLocDetectada(true);
      } catch(e) {}
      setDetectandoLoc(false);
    }, () => setDetectandoLoc(false));
  };

  // ── TRANSFERIR CRÉDITO ENTRE UTILIZADORES ─────────────────────────────
  const transferirCredito = async () => {
    setTransfStatus("loading");
    setTransfMsg("");
    const valor = parseFloat(transfValor);
    if (!transfDestinatario.trim() || isNaN(valor) || valor <= 0) {
      setTransfStatus("erro"); setTransfMsg("Preenche o destinatário e um valor válido."); return;
    }
    if (valor > creditosAfiliado.disponiveis) {
      setTransfStatus("erro"); setTransfMsg("Saldo insuficiente."); return;
    }
    try {
      // Encontrar destinatário pelo codigo_cliente
      const { data: dest } = await supabase
        .from("clientes").select("id, nome")
        .eq("codigo_cliente", transfDestinatario.toLowerCase().trim())
        .neq("id", user.id).maybeSingle();
      if (!dest) { setTransfStatus("erro"); setTransfMsg("Utilizador não encontrado."); return; }

      // Marcar créditos como usados (até cobrir o valor)
      let restante = valor;
      const creditosDisponiveis = creditosAfiliado.lista
        .filter(c => !c.usado && (c.valor||0) > 0)
        .sort((a,b) => new Date(a.created_at) - new Date(b.created_at));

      for (const c of creditosDisponiveis) {
        if (restante <= 0) break;
        const usar = Math.min(c.valor, restante);
        await supabase.from("creditos_afiliado").update({ usado: true }).eq("id", c.id);
        restante -= usar;
      }

      // Adicionar crédito ao destinatário
      await supabase.from("creditos_afiliado").insert({
        cliente_id: dest.id,
        valor,
        motivo: `Transferido por ${codigoLoja || user.id}`,
        ref_tipo: "transferencia",
        ref_id: user.id,
        usado: false,
      });

      setTransfStatus("ok");
      setTransfMsg(`€${valor.toFixed(2)} transferidos para ${dest.nome} com sucesso.`);
      // Refrescar saldo local
      const novoDisp = creditosAfiliado.disponiveis - valor;
      setCreditosAfiliado(prev => ({ ...prev, disponiveis: Math.max(0, novoDisp) }));
      setTransfDestinatario(""); setTransfValor("");
    } catch(e) {
      setTransfStatus("erro"); setTransfMsg("Erro inesperado. Tenta novamente.");
    }
  };

  // ── URL PERSONALIZADO DA LOJA ──────────────────────────────────────────
  const slugify = (str) => str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]/g,"").slice(0,30);

  const verificarUrl = async (valor) => {
    const slug = slugify(valor);
    if (!slug || slug.length < 3) { setUrlStatus("invalid"); return; }
    setUrlStatus("checking");
    const { data } = await supabase.from("clientes").select("id").eq("codigo_cliente", slug).neq("id", user.id).maybeSingle();
    setUrlStatus(data ? "taken" : "ok");
  };

  const onNovoUrlChange = (val) => {
    setNovoUrl(val);
    setUrlStatus(null);
    if (urlCheckTimer) clearTimeout(urlCheckTimer);
    const t = setTimeout(() => verificarUrl(val), 600);
    setUrlCheckTimer(t);
  };

  const gravarUrl = async () => {
    const slug = slugify(novoUrl);
    if (urlStatus !== "ok" || slug.length < 3) return;
    await supabase.from("clientes").update({ codigo_cliente: slug }).eq("id", user.id);
    setCodigoLoja(slug);
    setEditandoUrl(false);
    setUrlStatus(null);
  };
  // ──────────────────────────────────────────────────────────────────────

  // Validação Luhn para cartão de débito
  const validarLuhn = (num) => {
    const digits = num.replace(/\s|-/g, "");
    if (!/^\d{13,19}$/.test(digits)) return false;
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits[i], 10);
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      alt = !alt;
    }
    return sum % 10 === 0;
  };

  // Validação IBAN simplificada (formato + módulo 97)
  const validarIBAN = (iban) => {
    const clean = iban.replace(/\s/g, "").toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(clean)) return false;
    const rearranged = clean.slice(4) + clean.slice(0, 4);
    const numeric = rearranged.split("").map(c => isNaN(c) ? (c.charCodeAt(0) - 55).toString() : c).join("");
    let remainder = 0;
    for (let i = 0; i < numeric.length; i++) {
      remainder = (remainder * 10 + parseInt(numeric[i], 10)) % 97;
    }
    return remainder === 1;
  };

  const guardarDadosFinanceiros = async () => {
    setFinanceirosMsg("");
    const ibanLimpo = lojaIban.replace(/\s/g, "").toUpperCase();
    if (ibanLimpo && !validarIBAN(ibanLimpo)) {
      setFinanceirosMsg(i.ibanInvalido);
      return;
    }
    setFinanceirosLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setFinanceirosLoading(false); return; }
    const updateData = {};
    if (ibanLimpo) updateData.lojista_iban = ibanLimpo;

    // Guardar cartão via Stripe SetupIntent
    if (stripeFinDisponivel && window._stripeFinElements) {
      const { stripe, cardElement } = window._stripeFinElements;
      const { setupIntent, error: stripeErr } = await stripe.confirmCardSetup(stripeFinClientSecret, {
        payment_method: { card: cardElement },
      });
      if (stripeErr) {
        setFinanceirosMsg(`Erro no cartão: ${stripeErr.message}`);
        setFinanceirosLoading(false);
        return;
      }
      if (setupIntent?.payment_method) {
        updateData.stripe_payment_method_id = setupIntent.payment_method;
        // Obter últimos 4 dígitos da resposta Stripe
        try {
          const { data: pmData } = await fetch(`/api/stripe/payment-method?id=${setupIntent.payment_method}`).then(r => r.json()).catch(() => ({ data: null }));
          if (pmData?.card?.last4) {
            updateData.lojista_cartao_ultimo4 = pmData.card.last4;
            setStripeFinUltimos4(pmData.card.last4);
          }
        } catch (_) {}
        // Obter stripe_customer_id do setupIntent se disponível
        if (setupIntent.customer) updateData.stripe_customer_id = setupIntent.customer;
      }
    }

    const { error } = await supabase.from("clientes").update(updateData).eq("id", user.id);
    setFinanceirosLoading(false);
    if (error) {
      setFinanceirosMsg(i.erroGeral);
    } else {
      if (ibanLimpo) setLojaIban(ibanLimpo);
      setFinanceirosMsg(i.guardado);
      // Resetar o SetupIntent para a próxima vez
      setStripeFinClientSecret(null);
      setStripeFinDisponivel(false);
    }
  };

  const guardarPerfil = async () => {
    if (!user) return;
    const perfilCompleto = CAMPOS_OBRIGATORIOS.every(campo => perfil[campo] && perfil[campo].toString().trim() !== "");
    // foto_perfil: remover o ?t= antes de gravar para não ficar URL suja na BD
    const avatarParaGuardar = perfil.foto_perfil ? perfil.foto_perfil.split("?t=")[0] : null;
    await supabase.from("clientes").upsert({ id: user.id, email: user.email, nome: perfil.nome, nome_publico: perfil.nome_publico||null, telefone: perfil.telefone, morada: perfil.morada, numero_porta: perfil.numero_porta, andar: perfil.andar, nif: perfil.nif, numero_cc: perfil.numero_cc, data_nascimento: perfil.data_nascimento || null, genero: perfil.genero, profissao: perfil.profissao||null, cidade: perfil.cidade, pais: perfil.pais, codigo_postal: perfil.codigo_postal, latitude: perfil.latitude, longitude: perfil.longitude, perfil_completo: perfilCompleto, foto_perfil: avatarParaGuardar });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const uploadFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingFoto(true);
    try {
      // Comprime antes de fazer upload
      const ext = file.type === "image/png" ? "png" : "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (error) {
        console.error("Erro upload avatar:", error.message);
        alert((t[lang] || t.pt).erroFoto);
      } else {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        const urlBase = data.publicUrl;
        const urlLocal = urlBase + "?t=" + Date.now(); // cache-bust só para o estado local
        setPerfil(prev => ({ ...prev, foto_perfil: urlLocal }));
        // Guardar na BD sem o timestamp — assim persiste entre sessões
        await supabase.from("clientes").update({ foto_perfil: urlBase }).eq("id", user.id);
      }
    } catch(err) {
      console.error("Erro inesperado avatar:", err);
      alert((t[lang] || t.pt).erroGeral);
    }
    setUploadingFoto(false);
  };

  const sair = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  // Iniciar SetupIntent Stripe quando o formulário de candidatura abre
  useEffect(() => {
    if (!showFormLojista) return;
    let cancelled = false;
    setStripeCarregando(true);
    setStripeDisponivel(false);
    setStripeClientSecret(null);
    const iniciarStripe = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data: perfil } = await supabase.from("clientes").select("email, nome").eq("id", user.id).single();
        const res = await fetch("/api/stripe/setup-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cliente_id: user.id, email: perfil?.email || user.email, nome: perfil?.nome || "" }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (json.modo === "real" && json.client_secret) {
          setStripeClientSecret(json.client_secret);
          setStripeDisponivel(true);
          // Montar Stripe Elements no container
          if (window.Stripe) {
            const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
            const elements = stripe.elements({ clientSecret: json.client_secret });
            const cardElement = elements.create("card", {
              style: { base: { fontFamily: "'Jost', sans-serif", fontSize: "15px", color: "#1a1a1a" } },
            });
            cardElement.mount("#stripe-card-element");
            window._stripeElements = { stripe, elements, cardElement };
          }
        }
        // Se modo simulado, stripeDisponivel fica false — mostra campos manuais
      } catch (e) {
        // Silencioso — modo simulado activa automaticamente
      } finally {
        if (!cancelled) setStripeCarregando(false);
      }
    };
    iniciarStripe();
    return () => { cancelled = true; };
  }, [showFormLojista]);

  // Iniciar SetupIntent Stripe quando o accordion Dados Financeiros abre
  useEffect(() => {
    if (secaoAberta !== "financeiros" || !modoLojista) return;
    if (stripeFinClientSecret) return; // já iniciado
    let cancelled = false;
    setStripeFinCarregando(true);
    setStripeFinDisponivel(false);
    const iniciarStripeFin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data: perfil } = await supabase.from("clientes").select("email, nome").eq("id", user.id).single();
        const res = await fetch("/api/stripe/setup-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cliente_id: user.id, email: perfil?.email || user.email, nome: perfil?.nome || "" }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (json.modo === "real" && json.client_secret) {
          setStripeFinClientSecret(json.client_secret);
          setStripeFinDisponivel(true);
          if (window.Stripe) {
            const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
            const elements = stripe.elements({ clientSecret: json.client_secret });
            const cardElement = elements.create("card", {
              style: { base: { fontFamily: "'Jost', sans-serif", fontSize: "15px", color: "#1a1a1a" } },
            });
            // Montar com pequeno delay para garantir que o DOM está pronto
            setTimeout(() => {
              if (!cancelled && document.getElementById("stripe-card-financeiros")) {
                cardElement.mount("#stripe-card-financeiros");
                window._stripeFinElements = { stripe, elements, cardElement };
              }
            }, 100);
          }
        }
      } catch (e) {
        // Silencioso — modo simulado
      } finally {
        if (!cancelled) setStripeFinCarregando(false);
      }
    };
    iniciarStripeFin();
    return () => { cancelled = true; };
  }, [secaoAberta, modoLojista]);

  const submeterCandidaturaLojista = async () => {
    if (!formLojista.nome_loja.trim()) { setFormLojistaMsg("Indica o nome da tua loja."); return; }
    if (!formLojista.nif.trim()) { setFormLojistaMsg("Indica o teu NIF (obrigatório por lei)."); return; }
    if (!formLojista.telefone_loja.trim()) { setFormLojistaMsg("Indica um número de telefone de contacto."); return; }
    if (!formLojista.morada.trim()) { setFormLojistaMsg("Indica a tua morada para levantamento das peças."); return; }
    if (!formLojista.iban.trim()) { setFormLojistaMsg("Indica o teu IBAN ou NIB para receberes pagamentos."); return; }
    if (!formLojista.aceita_termos) { setFormLojistaMsg("Tens de aceitar os termos e condições para continuar."); return; }
    if (!formLojista.aceita_responsabilidades) { setFormLojistaMsg("Tens de confirmar que compreendes as responsabilidades do lojista."); return; }
    setFormLojistaLoading(true);
    setFormLojistaMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setFormLojistaLoading(false); return; }

    // Se Stripe disponível, confirmar SetupIntent para guardar cartão
    let stripePaymentMethodId = null;
    if (stripeDisponivel && window._stripeElements) {
      const { stripe, elements, cardElement } = window._stripeElements;
      const { setupIntent, error: stripeErr } = await stripe.confirmCardSetup(stripeClientSecret, {
        payment_method: { card: cardElement },
      });
      if (stripeErr) {
        setFormLojistaMsg(`Erro no cartão: ${stripeErr.message}`);
        setFormLojistaLoading(false);
        return;
      }
      stripePaymentMethodId = setupIntent?.payment_method;
    }

    const candidatura = {
      nome_loja: formLojista.nome_loja.trim(),
      descricao: formLojista.descricao.trim(),
      iban: formLojista.iban.trim().toUpperCase(),
      tipo_pagamento: formLojista.tipo_pagamento,
      nif: formLojista.nif.trim(),
      telefone_loja: formLojista.telefone_loja.trim(),
      morada: formLojista.morada.trim(),
      tipo_pecas: formLojista.tipo_pecas.trim(),
      submetida_em: new Date().toISOString(),
      stripe_configurado: !!stripePaymentMethodId,
    };
    const updateData = {
      candidatura_lojista: "pendente",
      lojista_candidatura_dados: candidatura,
    };
    if (stripePaymentMethodId) {
      updateData.stripe_payment_method_id = stripePaymentMethodId;
    }
    const { error } = await supabase.from("clientes").update(updateData).eq("id", user.id);
    setFormLojistaLoading(false);
    if (error) {
      setFormLojistaMsg("Erro ao submeter. Tenta novamente.");
    } else {
      setCandidaturaLojista("pendente");
      setShowFormLojista(false);
    }
  };

  const handleFotosLojista = async (files) => {
    const arr = Array.from(files);
    setFotosLojista(arr);
    setFotoValidacao(arr.map(() => ({ estado: "a validar" })));
    for (let idx = 0; idx < arr.length; idx++) {
      const file = arr[idx];
      try {
        const reader = new FileReader();
        const base64 = await new Promise((res, rej) => {
          reader.onload = () => res(reader.result.split(",")[1]);
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });
        const resp = await fetch("/api/validar-foto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imagem: base64, tipo: file.type }),
        });
        const resultado = await resp.json();
        // Se a IA detetou categoria, pré-preenche automaticamente
        if (resultado.valida && resultado.categoria && !novaPeca.categoria) {
          const mapCat = { roupa: "Vestidos", acessorio: "Acessórios", calcado: "Saltos" };
          if (mapCat[resultado.categoria]) {
            setNovaPeca(p => ({ ...p, categoria: mapCat[resultado.categoria] }));
          }
        }
        setFotoValidacao(prev => {
          const next = [...prev];
          next[idx] = resultado;
          return next;
        });
      } catch {
        setFotoValidacao(prev => {
          const next = [...prev];
          next[idx] = { valida: true, motivo: "" };
          return next;
        });
      }
    }
  };

  const guardarNovaPeca = async () => {
    const precisaAluguer = novaPeca.tipo==="alugar"||novaPeca.tipo==="ambos";
    const precisaVenda = novaPeca.tipo==="comprar"||novaPeca.tipo==="ambos";
    if (!novaPeca.nome) return;
    if (precisaAluguer && !novaPeca.preco_aluguer_dia) return;
    if (precisaVenda && !novaPeca.preco_venda) return;
    setNovaPecaLoading(true);
    setUploadProgressLoja("A criar peça...");
    const { data: { session } } = await supabase.auth.getSession();
    const { data: peca } = await supabase.from("pecas_lojista").insert({
      cliente_id: session.user.id,
      nome: novaPeca.nome,
      descricao: novaPeca.descricao||null,
      tipo: novaPeca.tipo||"alugar",
      preco_aluguer_dia: novaPeca.preco_aluguer_dia ? parseFloat(novaPeca.preco_aluguer_dia) : null,
      preco_venda: novaPeca.preco_venda ? parseFloat(novaPeca.preco_venda) : null,
      valor_peca: novaPeca.valor_peca ? parseFloat(novaPeca.valor_peca) : null,
      material: novaPeca.material||null,
      marca: novaPeca.marca||null,
      cor: novaPeca.cor||null,
      categoria: novaPeca.categoria||null,
      condicao: novaPeca.condicao||"como_novo",
      tem_defeito: novaPeca.tem_defeito||false,
      descricao_defeito: novaPeca.tem_defeito?(novaPeca.descricao_defeito||null):null,
      higienizacao_ativa: novaPeca.higienizacao_ativa||false,
      higienizacao_valor: novaPeca.higienizacao_ativa?(parseFloat(novaPeca.higienizacao_valor)||null):null,
      ocasioes: novaPeca.ocasioes,
      link_compra_externa: novaPeca.link_compra_externa||null,
      link_externo_ativo: false,
      estado: "disponivel",
      // codigo_referencia gerado pelo trigger SQL (<codigo_cliente>-001, -002, ...)

    }).select().single();
    if (peca) {
      for (const t of novaPeca.tamanhos) {
        await supabase.from("stock_lojista").insert({ peca_id: peca.id, tamanho: t.tamanho, quantidade_total: t.quantidade, quantidade_disponivel: t.quantidade });
      }
      if (fotosLojista.length > 0) {
        const urls = [];
        for (const foto of fotosLojista) {
          const ext = foto.name.split(".").pop().toLowerCase();
          const path = `lojista/${peca.id}/${Date.now()}_${Math.random().toString(36).slice(2,7)}.${ext}`;
          setUploadProgressLoja(`A fazer upload de ${foto.name}...`);
          const { error: upErr } = await supabase.storage.from("pecas").upload(path, foto, { upsert: true });
          if (upErr) {
            console.error("Upload error:", upErr);
            setUploadProgressLoja(`❌ Erro no upload: ${upErr.message}`);
          } else {
            const { data: urlData } = supabase.storage.from("pecas").getPublicUrl(path);
            urls.push(urlData.publicUrl);
          }
        }
        if (urls.length > 0) {
          const { error: fotoErr } = await supabase.from("pecas_lojista").update({ fotos: urls }).eq("id", peca.id);
          if (fotoErr) console.error("Fotos update error:", fotoErr);
        }
      }
      setUploadProgressLoja("✓ Peça adicionada!");
      const { data: ps } = await supabase.from("pecas_lojista").select("*, stock_lojista(*)").eq("cliente_id", session.user.id).order("created_at", { ascending: false });
      if (ps) setPecasLoja(ps);
    }
    setShowNovaPeca(false);
    setNovaPeca({ nome: "", descricao: "", tipo: "alugar", preco_aluguer_dia: "", preco_venda: "", valor_peca: "", material: "", marca: "", cor: "", categoria: "", condicao: "como_novo", tem_defeito: false, descricao_defeito: "", higienizacao_ativa: false, higienizacao_valor: "", ocasioes: [], tamanhos: [{ tamanho: "M", quantidade: 1 }], link_compra_externa: "" });
    setFotosLojista([]);
    setFotoValidacao([]);
    setUploadProgressLoja("");
    setNovaPecaLoading(false);
  };

  const guardarEdicaoPeca = async () => {
    if (!editarPeca || !editarPeca.nome) return;
    setEditarLoading(true);
    await supabase.from("pecas_lojista").update({
      nome: editarPeca.nome,
      descricao: editarPeca.descricao || null,
      tipo: editarPeca.tipo || "alugar",
      preco_aluguer_dia: editarPeca.preco_aluguer_dia ? parseFloat(editarPeca.preco_aluguer_dia) : null,
      preco_venda: editarPeca.preco_venda ? parseFloat(editarPeca.preco_venda) : null,
      valor_peca: editarPeca.valor_peca ? parseFloat(editarPeca.valor_peca) : null,
      idade_peca: editarPeca.idade_peca || "1a2",
      caucao: (() => { const e = calcEstimativaP(editarPeca); return e ? e.caucao : null; })(),
      material: editarPeca.material || null,
      marca: editarPeca.marca || null,
      cor: editarPeca.cor || null,
      categoria: editarPeca.categoria || null,
      condicao: editarPeca.condicao || "como_novo",
      tem_defeito: editarPeca.tem_defeito || false,
      descricao_defeito: editarPeca.tem_defeito ? (editarPeca.descricao_defeito || null) : null,
      higienizacao_ativa: editarPeca.higienizacao_ativa || false,
      higienizacao_valor: editarPeca.higienizacao_ativa ? (parseFloat(editarPeca.higienizacao_valor) || null) : null,
      ocasioes: editarPeca.ocasioes || [],
      link_compra_externa: editarPeca.link_compra_externa || null,
      fotos: fotosEditar.length > 0 ? fotosEditar : null,
    }).eq("id", editarPeca.id);
    // reload peças
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: ps } = await supabase.from("pecas_lojista").select("*, stock_lojista(*)").eq("cliente_id", session.user.id).order("created_at", { ascending: false });
      if (ps) setPecasLoja(ps);
    }
    setEditarPeca(null);
    setFotosEditar([]);
    setEditarLoading(false);
  };

  const atualizarEstadoAluguer = async (id, novoEstado, extras = {}) => {
    await supabase.from("alugueres_lojista").update({ estado: novoEstado, ...extras }).eq("id", id);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: als } = await supabase.from("alugueres_lojista").select("*, clientes(nome, email, telefone, cidade), pecas_lojista(nome, fotos, preco_aluguer_dia), stock_lojista(tamanho)").eq("lojista_id", session.user.id).order("created_at", { ascending: false });
      if (als) setAlugueresLoja(als);
    }
  };

  const cancelarAluguerLojista = async (aluguer) => {
    const agora = new Date().toISOString();
    // 1. Muda estado para cancelado
    await atualizarEstadoAluguer(aluguer.id, "cancelado", { cancelado_por: "lojista", cancelado_em: agora });
    // 2. Cria pedido de reembolso pendente — cliente escolhe crédito ou dinheiro
    if (aluguer.cliente_id && aluguer.valor_aluguer) {
      const { data: recibo } = await supabase.from("recibos").select("id, metodo_pagamento").eq("aluguer_id", aluguer.id).maybeSingle();
      await supabase.from("reembolsos_pendentes").insert({
        aluguer_id: aluguer.id,
        cliente_id: aluguer.cliente_id,
        lojista_id: aluguer.lojista_id,
        valor: aluguer.valor_aluguer,
        metodo_pagamento: recibo?.metodo_pagamento || null,
        recibo_id: recibo?.id || null,
        estado: "aguarda_escolha",
        created_at: agora,
      });
    }
    // 3. Penalização automática 1★ da plataforma por cancelamento do lojista
    await supabase.from("avaliacoes_lojista").upsert({
      aluguer_lojista_id: aluguer.id,
      cliente_id: aluguer.cliente_id,
      lojista_id: aluguer.lojista_id,
      nota_plataforma: 1,
      motivo_plataforma: "Cancelamento por iniciativa do lojista",
      created_at: agora,
    }, { onConflict: "aluguer_lojista_id" });
    setModalCancelarLojista(null);
  };

  const escolherReembolso = async (reembolsoId, escolha) => {
    const agora = new Date().toISOString();
    if (escolha === "credito") {
      // crédito imediato na conta
      const rp = reembolsosPendentes.find(r => r.id === reembolsoId);
      if (rp) {
        await supabase.from("creditos_afiliado").insert({
          cliente_id: rp.cliente_id,
          valor: rp.valor,
          origem: "cancelamento_lojista",
          usado: false,
          created_at: agora,
        });
      }
    }
    // em ambos os casos regista a escolha — "dinheiro" fica para a Nora Grei processar
    await supabase.from("reembolsos_pendentes").update({
      estado: escolha === "credito" ? "credito" : "reembolso_dinheiro",
      escolha_cliente: escolha,
      escolha_em: agora,
    }).eq("id", reembolsoId);
    setReembolsosPendentes(prev => prev.filter(r => r.id !== reembolsoId));
  };

  const mudarPassword = async () => {
    setPassMsg("");
    if (novaPass.length < 6) { setPassMsg(i.passwordMin); setPassMsgTipo("erro"); return; }
    if (novaPass !== confirmarPass) { setPassMsg(i.passwordMatch); setPassMsgTipo("erro"); return; }
    setPassLoading(true);
    const { error } = await supabase.auth.updateUser({ password: novaPass });
    if (error) { setPassMsg(i.passwordErro); setPassMsgTipo("erro"); }
    else { setPassMsg(i.passwordOk); setPassMsgTipo("ok"); setNovaPass(""); setConfirmarPass(""); setTimeout(() => setShowPassword(false), 2000); }
    setPassLoading(false);
  };

  const enviarReclamacao = async () => {
    if (!novaRec.assunto || !novaRec.mensagem) return;
    setRecLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { data: cli } = await supabase.from("clientes").select("id").eq("id", session.user.id).single();
    await supabase.from("reclamacoes").insert({
      cliente_id: cli.id,
      aluguer_id: novaRec.aluguer_id || null,
      assunto: novaRec.assunto,
      mensagem: novaRec.mensagem,
    });
    setRecMsg(i.reclamacaoEnviada);
    setNovaRec({ assunto: "", mensagem: "", aluguer_id: "" });
    setShowNovaReclamacao(false);
    const { data: recs } = await supabase.from("reclamacoes").select("*").eq("cliente_id", cli.id).order("created_at", { ascending: false });
    if (recs) setReclamacoes(recs);
    setRecLoading(false);
    setTimeout(() => setRecMsg(""), 4000);
  };
  const set = (k, v) => setPerfil(prev => ({ ...prev, [k]: v }));
  const i = t[lang] || t.pt;
  const estadoInfo = ESTADO_INFO[lang] || ESTADO_INFO.pt;

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#3f3e3c'}}>...</div>;

  const nv = NIVEL(stats.totalPecas, lang);
  const proximoNivelMin = nv.sigla === "BRZ" ? 5 : nv.sigla === "PRT" ? 10 : nv.sigla === "OUR" ? 20 : 20;
  const progressoPct = nv.proximo ? Math.min(100, Math.round(((stats.totalPecas - (proximoNivelMin - nv.falta)) / nv.falta) * 100)) : 100;

  const alugueresAtivos = alugueres.filter(a => ["pendente","confirmado","enviado","ativo","em_verificacao"].includes(a.estado));
  const alugueresHistorico = alugueres.filter(a => ["devolvido","devolvido_danificado","cancelado"].includes(a.estado));

  const perfilIncompleto = !CAMPOS_OBRIGATORIOS.every(campo => perfil[campo] && perfil[campo].toString().trim() !== "");

  const _nm = NIVEL_NOMES_PERFIL[lang] || NIVEL_NOMES_PERFIL.pt;
  const NIVEIS_TABELA = [
    { sigla: "BRZ", nome: _nm.bronze,  cor: "#a8632f", caucao: "100%" },
    { sigla: "PRT", nome: _nm.prata,   cor: "#6b7280", caucao: "75%" },
    { sigla: "OUR", nome: _nm.ouro,    cor: "#b8860b", caucao: "50%" },
    { sigla: "PLT", nome: _nm.platina, cor: "#6c5ce7", caucao: "0%" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g3:#c8c4bc;--g4:#7a776f;--g5:#4a4844;--g6:#2b2a28;--rosa:#c4748a;--serif:'Cormorant',Georgia,serif;--sans:'Jost',Arial,sans-serif}
        html,body{overflow-x:hidden;max-width:100%}
        body{background:var(--g1);font-family:var(--sans);font-size:17px;-webkit-font-smoothing:antialiased}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 2rem;padding-top:max(1.25rem,env(safe-area-inset-top));background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2);width:100%}
        .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:400;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
        .nav-back{font-size:0.82rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g6);text-decoration:none}
        .page{padding:6rem 2rem 4rem;padding-top:calc(4.5rem + env(safe-area-inset-top, 0px));max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:1.5rem;width:100%;box-sizing:border-box}
        .hero{background:var(--white);padding:2.5rem;display:flex;align-items:center;gap:2rem;min-width:0}
        .avatar-wrap{position:relative;flex-shrink:0}
        .avatar{width:96px;height:96px;border-radius:50%;object-fit:cover}
        .avatar-ph{width:96px;height:96px;border-radius:50%;background:var(--g2);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:2.5rem;font-weight:300;color:var(--g6)}
        .avatar-btn{position:absolute;bottom:0;right:0;width:36px;height:36px;border-radius:50%;background:var(--black);color:var(--white);border:2.5px solid var(--white);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.1rem;box-shadow:0 2px 8px rgba(0,0,0,0.18);touch-action:manipulation;-webkit-tap-highlight-color:transparent}
        .hero-info{min-width:0;flex:1;overflow:hidden}
        .hero-nome{font-family:var(--serif);font-size:2rem;font-weight:500;line-height:1.1;margin-bottom:0.3rem;color:var(--black)}
        .hero-email{font-size:0.92rem;color:var(--g6)}
        .alerta-perfil{background:#fff8e1;border-left:3px solid #b8860b;padding:1.25rem 1.5rem}
        .alerta-perfil-titulo{font-size:0.85rem;font-weight:700;color:#6b4500;margin-bottom:0.3rem}
        .alerta-perfil-desc{font-size:0.78rem;color:#6b4500;line-height:1.5}
        .alerta-reserva{background:#e8f5e9;border-left:3px solid #1e7e3e;padding:1.25rem 1.5rem}
        .alerta-reserva-titulo{font-size:0.92rem;font-weight:700;color:#175c2e;margin-bottom:0.3rem}
        .alerta-reserva-desc{font-size:0.8rem;color:#175c2e;line-height:1.5;margin-bottom:1rem}
        .nivel-card{background:var(--white);padding:2rem 2.5rem}
        .nivel-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem}
        .nivel-badge{display:inline-flex;align-items:center;gap:0.5rem;padding:0.45rem 1rem;font-size:0.85rem;font-weight:700;border:1.5px solid currentColor}
        .nivel-barra{height:6px;background:var(--g2);border-radius:3px;overflow:hidden}
        .nivel-barra-fill{height:100%;border-radius:3px;transition:width 0.8s ease}
        .nivel-info{display:flex;justify-content:space-between;font-size:0.82rem;color:var(--g6);margin-top:0.4rem}
        .nivel-beneficios{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--g1)}
        .beneficio{text-align:center;padding:1rem}
        .beneficio-sigla{font-family:var(--serif);font-size:1.1rem;font-weight:500;margin-bottom:0.3rem}
        .beneficio-label{font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--g6)}
        .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--g2)}
        .stat{background:var(--white);padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:background 0.2s}
        .stat:hover{background:var(--g1)}
        .stat-val{font-family:var(--serif);font-size:2rem;font-weight:600;margin-bottom:0.4rem;color:#080808}
        .stat-label{font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--g6)}
        .pontos-card{background:var(--white);padding:2rem 2.5rem}
        .pontos-circles{display:flex;gap:0.5rem;margin-top:1rem;flex-wrap:wrap}
        .ponto{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700}
        .card{background:var(--white);padding:2rem 2.5rem}
        .card-t{font-size:0.78rem;letter-spacing:0.25em;text-transform:uppercase;color:var(--g6);font-weight:600;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--g1)}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
        .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.25rem}
        .full{grid-column:1/-1}
        .fg{display:flex;flex-direction:column;gap:0.5rem}
        .lbl{font-size:0.82rem;letter-spacing:0.18em;text-transform:uppercase;color:#1a1a18;font-weight:600}
        .inp{width:100%;padding:0.9rem 1rem;border:1.5px solid var(--g2);background:var(--white);font-size:1rem;font-family:var(--sans);color:var(--black);outline:none}
        .inp:focus{border-color:var(--black)}
        .inp:disabled{background:var(--g1);color:var(--g6)}
        .inp::placeholder{color:#7a7874}
        .loc-btn{display:flex;align-items:center;gap:0.5rem;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--black);background:none;border:1.5px solid var(--g2);padding:0.9rem 1rem;cursor:pointer;font-family:var(--sans);font-weight:600;width:100%}
        .loc-btn:hover{border-color:var(--black)}
        .save-row{display:flex;align-items:center;gap:1rem;margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--g1)}
        .btn-save{padding:0.9rem 2.5rem;background:var(--black);color:var(--white);border:none;font-size:0.82rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;font-weight:600}
        .btn-save:hover{background:#2e2d2b}
        .btn-ok{background:#1e7e3e}
        .divider{height:1px;background:var(--g1);margin:1.25rem 0}
        .nota-obrigatorio{font-size:0.78rem;color:var(--g6);font-style:italic;margin-top:0.5rem}
        .aluguer-card{background:var(--white);padding:1.25rem 1.5rem;margin-bottom:1px}
        .aluguer-row{display:flex;align-items:flex-start;gap:1.5rem}
        .aluguer-img{width:56px;height:70px;flex-shrink:0;background:var(--g1);overflow:hidden;display:flex;align-items:center;justify-content:center}
        .aluguer-nome{font-family:var(--serif);font-size:1.15rem;font-weight:400;margin-bottom:0.2rem}
        .aluguer-ref{font-size:0.72rem;color:#9c4d63;font-weight:700;font-family:monospace;letter-spacing:0.05em}
        .aluguer-meta{font-size:0.82rem;color:var(--g6)}
        .estado-badge{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;padding:0.3rem 0.7rem;font-weight:600;display:inline-block;margin-top:0.4rem}
        .btn-pedidos{display:block;width:100%;padding:1rem;background:var(--g1);color:var(--black);border:none;font-size:0.82rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;text-align:center;text-decoration:none;margin-top:1rem;font-weight:600}
        .btn-pedidos:hover{background:var(--g2)}
        .btn-sair{font-size:0.82rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g6);background:none;border:none;cursor:pointer;font-family:var(--sans);text-decoration:underline}
        .btn-sair:hover{color:#c0392b}
        @media(max-width:768px){
          .nav{padding:0.85rem 1rem;width:100%}
          .page{padding:4.5rem 0.85rem 3rem;gap:1rem;width:100%}
          .hero{flex-direction:column;align-items:flex-start;gap:1rem;padding:1.25rem 1rem;width:100%;min-width:0}
          .hero-nome{font-size:1.4rem}
          .nivel-card{padding:1.25rem 1rem}
          .nivel-top{flex-direction:column;align-items:flex-start;gap:0.75rem}
          .stats{grid-template-columns:repeat(3,1fr)}
          .nivel-beneficios{grid-template-columns:1fr 1fr}
          .pontos-card{padding:1.25rem 1rem}
          .card{padding:1.25rem 1rem}
          .card-t{margin-bottom:1rem;padding-bottom:0.75rem}
          .grid2{grid-template-columns:1fr}
          .grid3{grid-template-columns:1fr}
          .full{grid-column:auto}
          .save-row{flex-direction:column;align-items:flex-start}
          .btn-save{width:100%;text-align:center}
          .aluguer-card{padding:1rem}
          .aluguer-row{gap:1rem}
        }
      `}</style>

      {/* DRAWER DE NAVEGAÇÃO RÁPIDA */}
      {menuAberto && (
        <div onClick={() => setMenuAberto(false)} style={{position:"fixed",inset:0,background:"rgba(10,8,6,0.55)",zIndex:3000,backdropFilter:"blur(2px)"}}>
          <div onClick={e => e.stopPropagation()} style={{position:"fixed",top:0,right:0,bottom:0,width:"min(320px,85vw)",background:"#faf9f7",display:"flex",flexDirection:"column",boxShadow:"-8px 0 32px rgba(0,0,0,0.18)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.25rem 1.5rem",borderBottom:"1px solid #ece8e2"}}>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.1rem",letterSpacing:"0.05em",color:"#1a1816"}}>Nora Grei</span>
              <button onClick={() => setMenuAberto(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#888",fontSize:"1.4rem",lineHeight:1,padding:"0.2rem"}}>✕</button>
            </div>
            <div style={{overflowY:"auto",flex:1,padding:"1rem 0"}}>
              {/* Secções do perfil */}
              <div style={{padding:"0.4rem 1.5rem 0.6rem",fontSize:"0.62rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#aaa",fontFamily:"var(--sans)"}}>
                {{pt:"O teu espaço",fr:"Ton espace",lt:"Tavo erdvė"}[lang]||"O teu espaço"}
              </div>
              {[
                {id:"perfil", icon:"👤", label:i.tabPerfil},
                {id:"pedidos", icon:"📦", label:i.tabPedidos, badge: alugueresAtivos.length > 0 ? alugueresAtivos.length : null},
                {id:"guardados", icon:"♡", label:i.tabGuardados, badge: wishlistPecas.length > 0 ? wishlistPecas.length : null},
                {id:"ganhos", icon:"€", label:{pt:"Ganhos",fr:"Gains",lt:"Pajamos"}[lang]||"Ganhos"},
                {id:"notificacoes", icon:"◎", label:i.tabNotificacoes, badge: naoLidasNotifs > 0 ? naoLidasNotifs : null},
                {id:"calculadora", icon:"✦", label:i.tabCalculadora},
                ...(modoLojista ? [{id:"loja", icon:"🏪", label:i.tabLoja}] : []),
              ].map(item => (
                <button key={item.id} onClick={() => { setTabAtiva(item.id); if(item.id==="loja") setTabLoja("dashboard"); setMenuAberto(false); window.scrollTo({top:0,behavior:"smooth"}); }}
                  style={{display:"flex",alignItems:"center",gap:"0.85rem",width:"100%",padding:"0.85rem 1.5rem",background:tabAtiva===item.id?"#f0ece6":"none",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.82rem",letterSpacing:"0.08em",color:tabAtiva===item.id?"#1a1816":"#5a5855",textAlign:"left",transition:"background 0.15s",borderLeft:tabAtiva===item.id?"3px solid #c4748a":"3px solid transparent"}}>
                  <span style={{fontSize:"0.9rem",width:"1.1rem",textAlign:"center",flexShrink:0}}>{item.icon}</span>
                  <span style={{flex:1}}>{item.label}</span>
                  {item.badge && <span style={{background:"#c4748a",color:"#fff",fontSize:"0.65rem",padding:"0.1rem 0.4rem",borderRadius:"10px",fontWeight:600,minWidth:"1.2rem",textAlign:"center"}}>{item.badge}</span>}
                </button>
              ))}
              <a href="/mensagens" style={{display:"flex",alignItems:"center",gap:"0.85rem",width:"100%",padding:"0.85rem 1.5rem",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.82rem",letterSpacing:"0.08em",color:"#5a5855",textDecoration:"none",borderLeft:"3px solid transparent"}}>
                <span style={{fontSize:"0.9rem",width:"1.1rem",textAlign:"center",flexShrink:0}}>✉</span>
                <span style={{flex:1}}>{i.tabMensagens}</span>
                {naoLidasMsg > 0 && <span style={{background:"#c4748a",color:"#fff",fontSize:"0.65rem",padding:"0.1rem 0.4rem",borderRadius:"10px",fontWeight:600}}>{naoLidasMsg}</span>}
              </a>
              {/* Explorar */}
              <div style={{padding:"0.4rem 1.5rem 0.6rem",fontSize:"0.62rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#aaa",fontFamily:"var(--sans)",marginTop:"0.75rem",borderTop:"1px solid #ece8e2",paddingTop:"1rem"}}>
                {{pt:"Explorar",fr:"Explorer",lt:"Naršyti"}[lang]||"Explorar"}
              </div>
              {[
                {href:"/catalogo", icon:"◈", label:{pt:"Catálogo",fr:"Catalogue",lt:"Katalogas"}[lang]||"Catálogo"},
                {href:"/publicar", icon:"+", label:{pt:"Publicar peça",fr:"Publier une pièce",lt:"Publikuoti"}[lang]||"Publicar peça"},
                {href:"/feed", icon:"◎", label:"Feed"},
                {href:"/lojas", icon:"◫", label:{pt:"Lojistas",fr:"Boutiques",lt:"Parduotuvės"}[lang]||"Lojistas"},
                ...(modoLojista && codigoLoja ? [{href:`/loja/${codigoLoja}?from=perfil`, icon:"→", label:{pt:"Ver a minha loja",fr:"Voir ma boutique",lt:"Mano parduotuvė"}[lang]||"Ver a minha loja"}] : []),
              ].map(item => (
                <a key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:"0.85rem",width:"100%",padding:"0.85rem 1.5rem",fontFamily:"var(--sans)",fontSize:"0.82rem",letterSpacing:"0.08em",color:"#5a5855",textDecoration:"none",borderLeft:"3px solid transparent"}}>
                  <span style={{fontSize:"0.9rem",width:"1.1rem",textAlign:"center",flexShrink:0}}>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
            <div style={{padding:"1rem 1.5rem",borderTop:"1px solid #ece8e2"}}>
              <button onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }} style={{width:"100%",padding:"0.75rem",background:"none",border:"1px solid #e2dfda",fontFamily:"var(--sans)",fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",color:"#888"}}>
                {i.sair}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href="/pesquisa" aria-label="Pesquisar" style={{display:"flex",alignItems:"center",color:"var(--g4)",textDecoration:"none",lineHeight:1}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </a>
          <NotificationBell lang={lang} />
          <button onClick={() => setMenuAberto(true)} aria-label="Menu" style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:"4px",background:"none",border:"none",cursor:"pointer",padding:"0.3rem",color:"var(--g6)"}}>
            <span style={{display:"block",width:"18px",height:"1.5px",background:"currentColor",borderRadius:"1px"}}></span>
            <span style={{display:"block",width:"18px",height:"1.5px",background:"currentColor",borderRadius:"1px"}}></span>
            <span style={{display:"block",width:"12px",height:"1.5px",background:"currentColor",borderRadius:"1px",alignSelf:"flex-start"}}></span>
          </button>
        </div>
      </nav>

      <div className="page">


        <div style={{display:modoLojista && tabAtiva==="loja"?"none":"block"}}>

        {/* TAB PEDIDOS */}
        {tabAtiva === "pedidos" && (
          <div style={{padding:"0 0 2rem"}}>
            {reembolsosPendentes.length > 0 && (
              <div style={{marginBottom:"1.5rem"}}>
                {reembolsosPendentes.map(rp => (
                  <div key={rp.id} style={{background:"#fff8e1",border:"1.5px solid #f9a825",borderRadius:10,padding:"1.25rem 1.5rem",marginBottom:"0.75rem"}}>
                    <div style={{fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#c17f00",fontWeight:600,marginBottom:"0.5rem"}}>⚠ Reserva cancelada pelo lojista</div>
                    <div style={{fontSize:"0.82rem",color:"#3f3e3c",marginBottom:"0.35rem"}}><strong>{rp.alugueres_lojista?.pecas_lojista?.nome}</strong></div>
                    <div style={{fontSize:"0.78rem",color:"#3f3e3c",marginBottom:"1rem"}}>
                      O teu aluguer foi cancelado. Como preferes receber o reembolso de <strong>€{rp.valor?.toFixed(2)}</strong>?
                    </div>
                    <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap"}}>
                      <button onClick={()=>escolherReembolso(rp.id,"credito")} style={{flex:1,minWidth:140,padding:"0.7rem 1rem",background:"#c4748a",color:"#fff",border:"none",borderRadius:6,fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>
                        Crédito na conta
                      </button>
                      <button onClick={()=>escolherReembolso(rp.id,"dinheiro")} style={{flex:1,minWidth:140,padding:"0.7rem 1rem",background:"#fff",color:"#3f3e3c",border:"1.5px solid #ccc",borderRadius:6,fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>
                        Devolução pelo método original
                      </button>
                    </div>
                    <div style={{fontSize:"0.67rem",color:"#9c9894",marginTop:"0.75rem",lineHeight:1.4}}>
                      Crédito: disponível imediatamente para próximas reservas. · Devolução em dinheiro: processada pela Nora Grei nos próximos 10 dias úteis.
                    </div>
                  </div>
                ))}
              </div>
            )}
            {alugueresAtivos.length === 0 && alugueresHistorico.length === 0 ? (
              <div style={{textAlign:"center",padding:"3rem 1rem",color:"#9c9894"}}>
                <p style={{marginBottom:"0.75rem",fontSize:"0.85rem"}}>{i.semPedidos}</p>
                <a href="/catalogo" style={{fontSize:"0.7rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#c4748a",textDecoration:"none"}}>{i.explorarCatalogo}</a>
              </div>
            ) : (
              <>
                {alugueresAtivos.length > 0 && (
                  <div className="card" style={{padding:0,overflow:"hidden",marginBottom:"1px"}}>
                    <p className="card-t" style={{padding:"2rem 2.5rem 0",border:"none",marginBottom:"1rem"}}>{i.emCurso}</p>
                    {alugueresAtivos.map(a => {
                      const peca = a.stock_tamanhos?.pecas;
                      const ei = estadoInfo[a.estado] || estadoInfo.pendente;
                      return (
                        <div key={a.id} className="aluguer-card">
                          <div className="aluguer-row">
                            <div className="aluguer-img">
                              {peca?.fotos?.[0] ? <img src={peca.fotos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <span style={{fontFamily:"var(--sans)",fontSize:"1rem",color:"rgba(0,0,0,0.12)"}}>NG</span>}
                            </div>
                            <div style={{flex:1}}>
                              <div className="aluguer-nome">{peca?.nome || "—"}</div>
                              {peca?.codigo_referencia && <div className="aluguer-ref">{i.referencia} {peca.codigo_referencia}</div>}
                              <div className="aluguer-meta">{a.data_inicio} → {a.data_fim} · {a.valor_aluguer}€</div>
                              <span className="estado-badge" style={{background:ei.bg,color:ei.cor}}>{ei.label}</span>
                              <TimerInfo aluguer={a} lang={lang} />
                              {a.estado === "enviado" && <BotaoConfirmarRecepcao aluguer={a} i={i} onConfirmado={carregarPerfil} />}
                              <BotaoVerTalao aluguer={a} i={i} />
                              {a.stock_tamanhos?.pecas?.lojista_id && (
                                <a href={`/mensagens?lojista=${a.stock_tamanhos.pecas.lojista_id}`} style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",marginTop:"0.5rem",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#5a5855",textDecoration:"none",border:"1px solid #ddd",padding:"0.35rem 0.75rem",borderRadius:"4px",fontFamily:"var(--sans)"}}>
                                  ✉ {i.falarLojista}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {alugueresHistorico.length > 0 && (
                  <div className="card" style={{padding:0,overflow:"hidden"}}>
                    <p className="card-t" style={{padding:"2rem 2.5rem 0",border:"none",marginBottom:"1rem"}}>{i.historico}</p>
                    {alugueresHistorico.slice(0,10).map(a => {
                      const peca = a.stock_tamanhos?.pecas;
                      const ei = estadoInfo[a.estado] || estadoInfo.devolvido;
                      return (
                        <div key={a.id} className="aluguer-card">
                          <div className="aluguer-row">
                            <div className="aluguer-img">
                              {peca?.fotos?.[0] ? <img src={peca.fotos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <span style={{fontFamily:"var(--sans)",fontSize:"1rem",color:"rgba(0,0,0,0.12)"}}>NG</span>}
                            </div>
                            <div style={{flex:1}}>
                              <div className="aluguer-nome">{peca?.nome || "—"}</div>
                              {peca?.codigo_referencia && <div className="aluguer-ref">{i.referencia} {peca.codigo_referencia}</div>}
                              <div className="aluguer-meta">{a.data_inicio} → {a.data_fim} · {a.valor_aluguer}€</div>
                              <span className="estado-badge" style={{background:ei.bg,color:ei.cor}}>{ei.label}</span>
                              <BotaoVerTalao aluguer={a} i={i} />
                              {a.estado === "devolvido" && <BotaoComprarPecaPerfil aluguer={a} i={i} lang={lang} />}
                              {(a.estado === "devolvido" || a.estado === "devolvido_danificado") && <CartaoAvaliacao aluguer={a} i={i} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {alugueresHistorico.length > 10 && <div style={{padding:"0"}}><a href="/pedidos" className="btn-pedidos">{i.verPedidos} →</a></div>}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB GUARDADOS */}
        {tabAtiva === "guardados" && (
          <div style={{padding:"0 0 2rem"}}>
            <p style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--g4)",marginBottom:"1.25rem",fontFamily:"var(--sans)"}}>{i.pecasGuardadas}</p>
            {wishlistPecas.length === 0 ? (
              <div style={{textAlign:"center",padding:"3rem 1rem",color:"#9c9894"}}>
                <p style={{marginBottom:"0.75rem",fontSize:"0.85rem"}}>{i.semGuardados}</p>
                <a href="/catalogo" style={{fontSize:"0.7rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#c4748a",textDecoration:"none"}}>{i.explorarCatalogo}</a>
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"1px",background:"var(--g2)"}}>
                {wishlistPecas.map(p => {
                  const eDisponivel = p.estado === "disponivel";
                  return (
                    <WishlistCard key={p.id} p={p} eDisponivel={eDisponivel} i={i} lang={lang} />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB NOTIFICAÇÕES */}
        {tabAtiva === "notificacoes" && (
          <div style={{padding:"0 0 3rem"}}>
            {notifs.length === 0 ? (
              <div style={{textAlign:"center",padding:"3rem 1rem",color:"#9c9894"}}>
                <p style={{fontSize:"0.85rem"}}>{i.semNotificacoes}</p>
              </div>
            ) : (
              <>
                {naoLidasNotifs > 0 && (
                  <button onClick={async () => {
                    await supabase.from("notificacoes_cliente").update({lida:true}).eq("cliente_id",user.id).eq("lida",false);
                    setNotifs(prev => prev.map(n => ({...n,lida:true})));
                    setNaoLidasNotifs(0);
                  }} style={{display:"block",width:"100%",marginBottom:"1rem",padding:"0.65rem",background:"#f0eeeb",border:"none",color:"#3f3e3c",fontSize:"0.68rem",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)",textAlign:"center"}}>
                    {i.marcarLidas}
                  </button>
                )}
                <div className="card" style={{padding:0,overflow:"hidden"}}>
                  {notifs.map(n => {
                    const TIPO_LABELS = {
                      pt: { seis_horas:"Devolução em 6 horas", ultimo_dia:"Último dia de uso", atraso:"Devolução em atraso", reserva:"Reserva disponível", campanha:"Novidade", pagamento:"Pagamento processado", geral:"Notificação" },
                      fr: { seis_horas:"Retour dans 6 heures", ultimo_dia:"Dernier jour", atraso:"Retour en retard", reserva:"Réservation disponible", campanha:"Nouveau", pagamento:"Paiement traité", geral:"Notification" },
                      lt: { seis_horas:"Grąžinimas per 6 val.", ultimo_dia:"Paskutinė diena", atraso:"Vėluojantis grąžinimas", reserva:"Rezervacija prieinama", campanha:"Naujiena", pagamento:"Mokėjimas", geral:"Pranešimas" },
                    };
                    const labels = TIPO_LABELS[lang] || TIPO_LABELS.pt;
                    const label = labels[n.tipo] || labels.geral;
                    const icone = n.tipo === "atraso" ? "🚨" : n.tipo === "seis_horas" || n.tipo === "ultimo_dia" ? "⏰" : n.tipo === "reserva" ? "🏷" : n.tipo === "pagamento" ? "💳" : "◎";
                    return (
                      <div key={n.id} style={{padding:"1rem 1.25rem",borderBottom:"1px solid #f0eeeb",background:n.lida?"#fff":"#fff8e1",display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
                        <span style={{fontSize:"1.1rem",lineHeight:1,marginTop:"0.1rem",flexShrink:0}}>{icone}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:"0.78rem",fontWeight:600,color:"#1a1816",marginBottom:"0.2rem",fontFamily:"var(--sans)"}}>{label}</div>
                          {n.mensagem && <div style={{fontSize:"0.75rem",color:"#3f3e3c",lineHeight:1.5}}>{n.mensagem}</div>}
                          <div style={{fontSize:"0.62rem",color:"#aaa89f",marginTop:"0.35rem"}}>{new Date(n.created_at).toLocaleDateString(lang==="fr"?"fr-FR":lang==="lt"?"lt-LT":"pt-PT")}</div>
                        </div>
                        {!n.lida && <span style={{width:8,height:8,borderRadius:"50%",background:"#c4748a",flexShrink:0,marginTop:"0.3rem"}}></span>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* GANHOS — referrals e comissões */}
        {tabAtiva === "ganhos" && (
          <div style={{padding:"0 0 3rem"}}>
            {/* Sumário */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"1.5rem"}}>
              <div style={{padding:"1.25rem",background:"linear-gradient(135deg,#fdf6ee,#faf0f4)",border:"1px solid #e8d8c8",textAlign:"center"}}>
                <div style={{fontSize:"1.6rem",fontFamily:"var(--serif)",color:"#c4a882",fontWeight:600}}>€{ganhos.totalPendente.toFixed(2)}</div>
                <div style={{fontSize:"0.62rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"#7a6a5a",marginTop:"0.3rem",fontFamily:"var(--sans)"}}>Por receber</div>
              </div>
              <div style={{padding:"1.25rem",background:"var(--g1)",border:"1px solid var(--g2)",textAlign:"center"}}>
                <div style={{fontSize:"1.6rem",fontFamily:"var(--serif)",color:"#3a7a3a",fontWeight:600}}>€{ganhos.totalPago.toFixed(2)}</div>
                <div style={{fontSize:"0.62rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--g4)",marginTop:"0.3rem",fontFamily:"var(--sans)"}}>Já recebido</div>
              </div>
            </div>

            {/* Créditos disponíveis */}
            <div style={{padding:"1rem",background:"linear-gradient(135deg,#fdf6ee,#faf3e8)",border:"1.5px solid #c4a882",marginBottom:"0.75rem",display:"flex",alignItems:"center",gap:"1rem"}}>
              <div style={{textAlign:"center",flex:1}}>
                <div style={{fontSize:"1.8rem",fontFamily:"var(--serif)",color:"#c4a882",fontWeight:600,lineHeight:1}}>€{creditosAfiliado.disponiveis.toFixed(2)}</div>
                <div style={{fontSize:"0.6rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"#7a6a5a",marginTop:"0.25rem",fontFamily:"var(--sans)"}}>Créditos disponíveis</div>
              </div>
              <div style={{width:"1px",height:"40px",background:"#e8d8c8"}}/>
              <div style={{textAlign:"center",flex:1}}>
                <div style={{fontSize:"1.8rem",fontFamily:"var(--serif)",color:"#9c9894",fontWeight:600,lineHeight:1}}>€{creditosAfiliado.total.toFixed(2)}</div>
                <div style={{fontSize:"0.6rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"#9c9894",marginTop:"0.25rem",fontFamily:"var(--sans)"}}>Total ganho</div>
              </div>
            </div>

            {/* Transferir crédito */}
            <div style={{marginBottom:"1.25rem"}}>
              <button
                onClick={() => { setShowTransfCredito(v => !v); setTransfStatus(null); setTransfMsg(""); }}
                style={{width:"100%",padding:"0.6rem 1rem",background:"none",border:"1.5px solid #c4a882",color:"#c4a882",fontSize:"0.65rem",letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"var(--sans)",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}
              >
                <span>↔ Transferir crédito para outro utilizador</span>
                <span>{showTransfCredito ? "▲" : "▼"}</span>
              </button>
              {showTransfCredito && (
                <div style={{padding:"1rem",background:"#fff",border:"1px solid #e8d8c8",borderTop:"none"}}>
                  <div style={{fontSize:"0.72rem",color:"#7a6a5a",marginBottom:"0.75rem",lineHeight:1.5}}>
                    Transfere créditos da tua conta para outro utilizador — ela pode usar em alugueres ou devolver-te em dinheiro.
                  </div>
                  <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.5rem",flexWrap:"wrap"}}>
                    <input
                      type="text"
                      placeholder="URL da loja (ex: nunoribeiro)"
                      value={transfDestinatario}
                      onChange={e => { setTransfDestinatario(e.target.value); setTransfStatus(null); }}
                      style={{flex:2,minWidth:120,padding:"0.5rem 0.75rem",border:"1px solid #e2dfda",fontSize:"0.78rem",fontFamily:"var(--sans)",outline:"none",background:"#f8f7f5"}}
                    />
                    <input
                      type="number"
                      min="0.50"
                      step="0.50"
                      max={creditosAfiliado.disponiveis}
                      placeholder="€ valor"
                      value={transfValor}
                      onChange={e => { setTransfValor(e.target.value); setTransfStatus(null); }}
                      style={{flex:1,minWidth:80,padding:"0.5rem 0.75rem",border:"1px solid #e2dfda",fontSize:"0.78rem",fontFamily:"var(--sans)",outline:"none",background:"#f8f7f5"}}
                    />
                    <button
                      onClick={transferirCredito}
                      disabled={transfStatus === "loading"}
                      style={{padding:"0.5rem 1rem",background:"#c4a882",color:"#fff",border:"none",fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"var(--sans)",cursor:"pointer",whiteSpace:"nowrap",opacity:transfStatus==="loading"?0.6:1}}
                    >
                      {transfStatus === "loading" ? "..." : "Transferir"}
                    </button>
                  </div>
                  {transfMsg && (
                    <div style={{fontSize:"0.75rem",color:transfStatus==="ok"?"#27ae60":"#c0392b",padding:"0.4rem 0.5rem",background:transfStatus==="ok"?"#f0fff4":"#fff5f5",border:`1px solid ${transfStatus==="ok"?"#a8e6c0":"#f5c6cb"}`}}>
                      {transfMsg}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Como funciona */}
            <div style={{padding:"0.9rem 1rem",background:"#f8f7f5",border:"1px solid #e2dfda",marginBottom:"1.25rem",fontSize:"0.78rem",color:"#5a5855",lineHeight:1.65}}>
              <div style={{fontFamily:"var(--sans)",fontSize:"0.62rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"#7a6a5a",fontWeight:600,marginBottom:"0.5rem"}}>Como funciona</div>
              <div style={{marginBottom:"0.4rem"}}>🔗 <strong>Link partilhado</strong> — quem comprar ou alugar via o teu link, tu ganhas <strong style={{color:"#c4a882"}}>10% em créditos</strong>. Sem desconto para o comprador.</div>
              <div>🏷️ <strong>Código pessoal</strong> — o comprador usa o teu código e recebe <strong>10% de desconto</strong>. Tu ganhas <strong style={{color:"#c4a882"}}>5% em créditos</strong>.</div>
              <div style={{marginTop:"0.5rem",fontSize:"0.72rem",color:"#9c9894"}}>Os créditos são usados em alugueres ou compras de peças usadas na plataforma.</div>
            </div>

            {/* Convida e Ganha — abertura de lojas */}
            <div style={{padding:"0.9rem 1rem",background:"linear-gradient(135deg,#fdf6ee,#faf3e8)",border:"1.5px solid #c4a882",marginBottom:"1.5rem"}}>
              <div style={{fontFamily:"var(--sans)",fontSize:"0.62rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"#c4a882",fontWeight:600,marginBottom:"0.4rem"}}>Convida e Ganha — abertura de lojas</div>
              <div style={{fontSize:"0.78rem",color:"#5a4a35",lineHeight:1.6,marginBottom:"0.65rem"}}>
                Convida uma amiga a abrir loja. Ela publica 10 peças → ganhas €{ganhos.config?.credito_10_pecas??5}. Ela faz a 1.ª venda → mais €{ganhos.config?.credito_primeira_venda??5}. Ela fica 3 meses → mais €{ganhos.config?.credito_3_meses??5}.
              </div>
              <button onClick={() => setShowModalConvida(true)} style={{padding:"0.45rem 1rem",background:"#c4a882",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600}}>
                Saber mais e obter link
              </button>
            </div>

            {/* Código pessoal */}
            <div style={{padding:"0.9rem 1rem",background:"#fff",border:"1.5px solid #080808",marginBottom:"1rem"}}>
              <div style={{fontFamily:"var(--sans)",fontSize:"0.62rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"#3f3e3c",fontWeight:600,marginBottom:"0.5rem"}}>O teu código pessoal — para vídeos e stories</div>
              <div style={{display:"flex",gap:"0.5rem",alignItems:"center",marginBottom:"0.4rem"}}>
                <div style={{flex:1,fontSize:"1.1rem",fontWeight:700,fontFamily:"monospace",color:"#080808",background:"#f8f7f5",padding:"0.6rem 0.75rem",letterSpacing:"0.2em",border:"1px solid #e2dfda",textAlign:"center"}}>
                  {codigoAfiliado || "A gerar…"}
                </div>
                <button onClick={async () => { try { await navigator.clipboard.writeText(codigoAfiliado||""); } catch {} }}
                  style={{padding:"0.6rem 0.85rem",background:"#080808",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap",fontWeight:600}}>
                  Copiar
                </button>
              </div>
              <div style={{fontSize:"0.7rem",color:"#9c9894"}}>Diz no vídeo: <em>"usa o código {codigoAfiliado||"…"} para 10% de desconto"</em></div>
            </div>

            {/* Link de referência */}
            <div style={{padding:"0.9rem 1rem",background:"#fff",border:"1.5px solid #c4748a",marginBottom:"1.5rem"}}>
              <div style={{fontFamily:"var(--sans)",fontSize:"0.62rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"#c4748a",fontWeight:600,marginBottom:"0.5rem"}}>O teu link — para bio, WhatsApp e mensagens</div>
              <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                <div style={{flex:1,fontSize:"0.72rem",color:"#5a5855",background:"#f8f7f5",padding:"0.5rem 0.75rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",border:"1px solid #e2dfda",fontFamily:"monospace"}}>
                  {typeof window !== "undefined" ? `${window.location.origin}?ref=${codigoLoja || user?.id?.slice(0,8)}` : "noragrei.com?ref=…"}
                </div>
                <button onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}?ref=${codigoLoja || user?.id}`); } catch {} }}
                  style={{padding:"0.5rem 0.85rem",background:"#c4748a",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap",fontWeight:600}}>
                  Copiar
                </button>
              </div>
              <div style={{fontSize:"0.7rem",color:"#9c9894",marginTop:"0.4rem"}}>Funciona em qualquer página do site. Ganhas 10% de créditos por cada compra ou aluguer.</div>
            </div>

            {/* Lista de referrals */}
            <div style={{fontFamily:"var(--sans)",fontSize:"0.62rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--g4)",fontWeight:600,marginBottom:"0.75rem"}}>
              Histórico de partilhas ({ganhos.referrals.length})
            </div>
            {ganhos.referrals.length === 0 ? (
              <div style={{padding:"2rem 1rem",textAlign:"center",color:"#9c9894"}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e2dfda" strokeWidth="1.5" style={{marginBottom:"0.75rem",display:"block",margin:"0 auto 0.75rem"}}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                <div style={{fontSize:"0.85rem",marginBottom:"0.4rem"}}>Ainda não partilhaste nenhuma peça</div>
                <div style={{fontSize:"0.75rem"}}>Vai a qualquer peça e clica em "Partilhar e ganhar"</div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
                {ganhos.referrals.map(r => (
                  <div key={r.id} style={{padding:"0.9rem 1rem",background:"#fff",border:"1px solid #e2dfda",display:"flex",alignItems:"center",gap:"0.85rem"}}>
                    {r.pecas_lojista?.fotos?.[0] && (
                      <img src={r.pecas_lojista.fotos[0]} alt="" style={{width:44,height:44,objectFit:"cover",flexShrink:0,background:"#f8f7f5"}} />
                    )}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"0.82rem",fontWeight:600,color:"var(--black)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.pecas_lojista?.nome||"Peça"}</div>
                      <div style={{fontSize:"0.72rem",color:"#7a6a5a",marginTop:"0.2rem"}}>{r.tipo==="aluguer"?"Aluguer":"Compra"} · {r.comprador_email||"visitante"}</div>
                      <div style={{fontSize:"0.7rem",color:"#9c9894",marginTop:"0.15rem"}}>{fmtData(r.created_at, lang, {day:"2-digit",month:"short",year:"numeric"})}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:"0.9rem",fontFamily:"var(--serif)",fontWeight:600,color:r.status==="cancelado"?"#c0392b":r.comissao_paga?"#3a7a3a":"#c4a882"}}>
                        {r.comissao_gerada ? `+€${r.comissao_gerada.toFixed(2)}` : "—"}
                      </div>
                      <div style={{fontSize:"0.62rem",letterSpacing:"0.1em",textTransform:"uppercase",marginTop:"0.15rem",color:r.status==="cancelado"?"#c0392b":r.status==="confirmado"||r.status==="pago"?"#3a7a3a":"#c4a882",fontFamily:"var(--sans)",fontWeight:600}}>
                        {{pendente:"Pendente",confirmado:"Confirmado",pago:"Pago",cancelado:"Cancelado"}[r.status]||r.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PERFIL NORMAL — oculto nas tabs guardados, pedidos, ganhos e loja */}
        <div style={{display: (tabAtiva === "guardados" || tabAtiva === "pedidos" || tabAtiva === "ganhos" || tabAtiva === "loja" || tabAtiva === "calculadora") ? "none" : "block"}}>

        {/* POP DE CURIOSIDADE — banner único por sessão, leva à calculadora */}
        {!popCuriosidadeVisto && (
          <div style={{background:"linear-gradient(135deg,#fdf0f4,#f8e8ee)",border:"1px solid #f0c8d4",borderRadius:"14px",padding:"1rem 1.25rem",marginBottom:"1rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:0}}>
              <p style={{margin:0,fontSize:"0.82rem",color:"#8b2a42",lineHeight:1.45,fontFamily:"var(--sans)"}}>{i.popCuriosidade}</p>
            </div>
            <div style={{display:"flex",gap:"0.5rem",alignItems:"center",flexShrink:0}}>
              <a href="/calculadora" style={{fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.45rem 0.9rem",background:"#c4748a",color:"#fff",textDecoration:"none",fontFamily:"var(--sans)",borderRadius:"8px",whiteSpace:"nowrap"}}>{i.popCuriosidadeBtn}</a>
              <button onClick={()=>setPopCuriosidadeVisto(true)} style={{background:"none",border:"none",cursor:"pointer",color:"#c4748a",fontSize:"1.1rem",padding:"0.2rem",lineHeight:1}}>×</button>
            </div>
          </div>
        )}

        <div className="hero">
          <div className="avatar-wrap">
            {perfil.foto_perfil ? <img src={perfil.foto_perfil} alt="Avatar" className="avatar" /> : <div className="avatar-ph">{perfil.nome?.[0]?.toUpperCase()||"?"}</div>}
            <button className="avatar-btn" onClick={() => fileRef.current?.click()}>{uploadingFoto?"...":"+"}</button>
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={uploadFoto} />
          </div>
          <div className="hero-info">
            <div className="hero-nome">{perfil.nome || "—"}</div>
            <div className="hero-email" style={{wordBreak:'break-all'}}>{user?.email}</div>
            {perfil.cidade && <div style={{fontSize:'0.85rem',color:'var(--g6)',marginTop:'0.3rem'}}>{perfil.cidade}, {perfil.pais}</div>}
          </div>
        </div>

        {reservasDisponiveis.length > 0 && (
          <div className="alerta-reserva">
            <div className="alerta-reserva-titulo">{i.reservaDisponivelTitulo}</div>
            <div className="alerta-reserva-desc">{i.reservaDisponivelDesc}</div>
            {reservasDisponiveis.map(r => <ReservaDisponivelCard key={r.id} reserva={r} i={i} />)}
          </div>
        )}

        {perfilIncompleto && (
          <div className="alerta-perfil">
            <div className="alerta-perfil-titulo">{i.perfilIncompleto}</div>
            <div className="alerta-perfil-desc">{i.perfilIncompletoDesc}</div>
          </div>
        )}

        <div className="nivel-card">
          <div className="nivel-top">
            <div>
              <div style={{fontSize:'0.72rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--g6)',marginBottom:'0.4rem'}}>{i.nivelConfianca}<Tooltip texto="O teu nível determina a percentagem de caução cobrada ao cliente no início de cada aluguer. Nível Bronze: 100% do valor da peça; Prata: 75%; Ouro: 50%; Platina: sem caução. Sobe de nível completando alugueres com sucesso." /></div>
              <div className="nivel-badge" style={{color: nv.cor}}>
                <span style={{fontWeight:700}}>{nv.nome}</span>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'var(--serif)',fontSize:'2rem',fontWeight:300,color:nv.cor}}>{nv.caucao===0?i.semCaucao:nv.caucao+"%"}</div>
              <div style={{fontSize:'0.75rem',color:'var(--g6)'}}>{i.caucao}<Tooltip texto="Depósito de segurança retido no cartão do cliente durante o aluguer. Devolvido automaticamente após a peça ser verificada. Quanto mais alto o teu nível de confiança, menor a caução exigida." /></div>
            </div>
          </div>
          {nv.proximo && (
            <div>
              <div className="nivel-barra"><div className="nivel-barra-fill" style={{width:`${progressoPct}%`,background:nv.cor}} /></div>
              <div className="nivel-info"><span>{stats.totalPecas} · {i.alugueresLabel}</span><span>{i.faltam} {nv.falta} {i.para} {nv.proximo}</span></div>
            </div>
          )}
          {!nv.proximo && <div style={{fontSize:'0.82rem',color:nv.cor,fontWeight:600,marginTop:'0.5rem'}}>{i.nivelMaximo}</div>}
          <div className="nivel-beneficios">
            {NIVEIS_TABELA.map(nivel => (
              <div key={nivel.sigla} className="beneficio">
                <div className="beneficio-sigla" style={{color:nivel.cor}}>{nivel.nome}</div>
                <div className="beneficio-label">{i.caucaoLabel} {nivel.caucao}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats">
          {[
            { val: stats.totalAlugueres, label: i.alugueresLabel, href: "/pedidos" },
            { val: Number(stats.totalGasto).toFixed(0)+"€", label: i.totalGasto },
            { val: stats.pecasAtivas, label: i.emCurso },
            { val: stats.reservas, label: i.reservas, cor: stats.reservas>0?"#b35900":undefined, href: "/pedidos?tab=reservas" },
            { val: stats.pontos||stats.totalPecas, label: i.pontosLabel },
          ].map((s,idx) => (
            <div key={idx} className="stat" onClick={() => s.href && (window.location.href = s.href)}>
              <div className="stat-val" style={s.cor?{color:s.cor}:{}}>{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
          {/* 6º tile — convite lojista */}
          <div className="stat" onClick={() => setTabAtiva("ganhos")} style={{cursor:"pointer",background:"linear-gradient(135deg,#fdf6ee,#f5e9d8)"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{marginBottom:"0.25rem"}}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#c4a882" stroke="#c4a882" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
            <div style={{fontSize:"0.62rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#c4a882",fontWeight:600,lineHeight:1.3,textAlign:"center"}}>Convida<br/>e Ganha</div>
          </div>
        </div>

        <div className="pontos-card">
          <p style={{fontSize:'0.75rem',letterSpacing:'0.25em',textTransform:'uppercase',color:'var(--g6)',fontWeight:600}}>{i.pontosFidelizacao}</p>
          <p style={{fontSize:'0.85rem',color:'var(--g6)',marginTop:'0.5rem'}}>{i.pontosDesc}</p>
          <div className="pontos-circles">
            {Array.from({length:10}).map((_,idx) => {
              const pontos = stats.pontos||stats.totalPecas;
              const ciclo = pontos % 10;
              const cheio = idx < ciclo;
              const gratuito = idx === 9;
              return <div key={idx} className="ponto" style={{background:cheio?(gratuito?'#c4748a':'var(--black)'):'var(--g1)',color:cheio?'#fff':'var(--g6)',border:gratuito?'2px solid #c4748a':'none'}}>{gratuito?"★":(cheio?"✓":idx+1)}</div>;
            })}
          </div>
        </div>

        {alugueresAtivos.length > 0 && (
          <div className="card" style={{padding:"1rem 1.5rem",background:"#f0f7f0",border:"1px solid #b8dbb8",cursor:"pointer"}} onClick={() => setTabAtiva("pedidos")}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                <span style={{fontSize:"1.2rem"}}>📦</span>
                <div>
                  <div style={{fontFamily:"var(--serif)",fontSize:"0.95rem",color:"var(--black)"}}>{alugueresAtivos.length} pedido{alugueresAtivos.length>1?"s":""} activo{alugueresAtivos.length>1?"s":""}</div>
                  <div style={{fontSize:"0.72rem",color:"#4a7a4a",marginTop:"0.1rem"}}>{i.emCurso}</div>
                </div>
              </div>
              <span style={{color:"#4a7a4a",fontSize:"0.8rem",letterSpacing:"0.05em"}}>Ver →</span>
            </div>
          </div>
        )}

        {/* QUICK-NAV: atalhos para as secções */}
        <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.25rem"}}>
          {[
            {key:"pessoal",label:i.navPessoal},
            {key:"morada",label:i.navMorada},
            {key:"docs",label:i.navDocs},
            ...(modoLojista ? [{key:"financeiros",label:i.navFinanceiros}] : []),
            {key:"seguranca",label:i.navSeguranca},
          ].map(({key,label}) => (
            <button key={key} onClick={() => {
              setSecaoAberta(key);
              setTimeout(() => { document.getElementById(`sec-${key}`)?.scrollIntoView({behavior:"smooth",block:"start"}); }, 80);
            }} style={{padding:"0.35rem 0.8rem",fontSize:"0.7rem",letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"var(--sans)",border:"1px solid",borderColor:secaoAberta===key?"var(--black)":"var(--g2)",background:secaoAberta===key?"var(--black)":"transparent",color:secaoAberta===key?"var(--white)":"var(--g5)",borderRadius:"20px",cursor:"pointer",transition:"all 0.15s"}}>
              {label}
            </button>
          ))}
        </div>

        {/* SECÇÃO: Dados pessoais */}
        <div id="sec-pessoal" className="card" style={{padding:0,overflow:"hidden"}}>
          <div onClick={() => setSecaoAberta(s => s==="pessoal"?null:"pessoal")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.5rem 2rem",cursor:"pointer",userSelect:"none"}}>
            <div>
              <p style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:400,color:"var(--black)",margin:0}}>{i.dadosPessoais}</p>
              {secaoAberta !== "pessoal" && <p style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.2rem"}}>{perfil.nome_publico || perfil.nome || "—"} · {perfil.telefone || "—"}</p>}
            </div>
            <span style={{color:"var(--g4)",fontSize:"0.85rem"}}>{secaoAberta==="pessoal"?"▲":"▼"}</span>
          </div>
          {secaoAberta === "pessoal" && (
            <div style={{padding:"0 2rem 2rem"}}>
              <div className="grid2">
                <div className="fg"><label className="lbl">{i.nome} *</label><input className="inp" value={perfil.nome} onChange={e => set("nome", e.target.value)} placeholder="Maria Silva" /></div>
                <div className="fg"><label className="lbl">{i.nomePub} <Tooltip texto={i.nomePubDica} /></label><input className="inp" value={perfil.nome_publico} onChange={e => set("nome_publico", e.target.value)} placeholder={perfil.nome || "Maria Silva"} /></div>
                <div className="fg"><label className="lbl">{i.email}</label><input className="inp" value={user?.email||""} disabled /></div>
                <div className="fg"><label className="lbl">{i.telefone} *</label><input className="inp" type="tel" value={perfil.telefone} onChange={e => set("telefone", e.target.value)} placeholder="+351 912 345 678" /></div>
                <div className="fg"><label className="lbl">{i.dataNascimento}</label><input className="inp" type="date" value={perfil.data_nascimento} onChange={e => set("data_nascimento", e.target.value)} /></div>
                <div className="fg"><label className="lbl">{i.comoTeVes}</label>
                  <select className="inp" value={perfil.profissao} onChange={e => set("profissao", e.target.value)}>
                    <option value="">{i.selecionar}</option>
                    {i.comoTeVesOpcoes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="fg"><label className="lbl">{i.genero}</label>
                  <select className="inp" value={perfil.genero} onChange={e => set("genero", e.target.value)}>
                    <option value="">—</option>
                    {i.generosOpcoes.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="save-row" style={{marginTop:"1.25rem",paddingTop:"1.25rem"}}><button className={`btn-save${guardado?" btn-ok":""}`} onClick={guardarPerfil}>{guardado?i.guardado:i.guardar}</button></div>
            </div>
          )}
        </div>

        {/* SECÇÃO: Morada de entrega */}
        <div id="sec-morada" className="card" style={{padding:0,overflow:"hidden"}}>
          <div onClick={() => setSecaoAberta(s => s==="morada"?null:"morada")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.5rem 2rem",cursor:"pointer",userSelect:"none"}}>
            <div>
              <p style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:400,color:"var(--black)",margin:0}}>{i.moradaEntrega}</p>
              {secaoAberta !== "morada" && <p style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.2rem"}}>{perfil.morada ? `${perfil.morada} ${perfil.numero_porta}, ${perfil.cidade}` : i.moradaVazia}</p>}
            </div>
            <span style={{color:"var(--g4)",fontSize:"0.85rem"}}>{secaoAberta==="morada"?"▲":"▼"}</span>
          </div>
          {secaoAberta === "morada" && (
            <div style={{padding:"0 2rem 2rem"}}>
              <div className="grid2">
                <div className="fg full"><button className="loc-btn" onClick={detectarLocalizacao} disabled={detectandoLoc}>{detectandoLoc?"...":locDetectada?i.localizacaoOk:i.detectarLocalizacao}</button></div>
                <div className="fg"><label className="lbl">{i.cidade} *</label><input className="inp" value={perfil.cidade} onChange={e => set("cidade", e.target.value)} placeholder="Lisboa" /></div>
                <div className="fg"><label className="lbl">{i.codigoPostal} *</label><input className="inp" value={perfil.codigo_postal} onChange={e => set("codigo_postal", e.target.value)} placeholder="1000-001" /></div>
                <div className="fg"><label className="lbl">{i.pais}</label><input className="inp" value={perfil.pais} onChange={e => set("pais", e.target.value)} /></div>
                <div className="fg"><label className="lbl">{i.morada} *</label><input className="inp" value={perfil.morada} onChange={e => set("morada", e.target.value)} placeholder="Rua das Flores" /></div>
              </div>
              <div className="grid3" style={{marginTop:"1rem"}}>
                <div className="fg"><label className="lbl">{i.numeroPorta} *</label><input className="inp" value={perfil.numero_porta} onChange={e => set("numero_porta", e.target.value)} placeholder="123" /></div>
                <div className="fg"><label className="lbl">{i.andar}</label><input className="inp" value={perfil.andar} onChange={e => set("andar", e.target.value)} placeholder="2º Esq." /></div>
              </div>
              <p className="nota-obrigatorio">{i.camposObrigatorios}</p>
              <div className="save-row" style={{marginTop:"1.25rem",paddingTop:"1.25rem"}}><button className={`btn-save${guardado?" btn-ok":""}`} onClick={guardarPerfil}>{guardado?i.guardado:i.guardar}</button></div>
            </div>
          )}
        </div>

        {/* SECÇÃO: Documentos */}
        <div id="sec-docs" className="card" style={{padding:0,overflow:"hidden"}}>
          <div onClick={() => setSecaoAberta(s => s==="docs"?null:"docs")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.5rem 2rem",cursor:"pointer",userSelect:"none"}}>
            <div>
              <p style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:400,color:"var(--black)",margin:0}}>{i.documentosIdentidade}</p>
              {secaoAberta !== "docs" && <p style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.2rem"}}>{perfil.nif ? `NIF: ${perfil.nif}` : i.docsVazios}</p>}
            </div>
            <span style={{color:"var(--g4)",fontSize:"0.85rem"}}>{secaoAberta==="docs"?"▲":"▼"}</span>
          </div>
          {secaoAberta === "docs" && (
            <div style={{padding:"0 2rem 2rem"}}>
              <p style={{fontSize:"0.78rem",color:"var(--g4)",marginBottom:"1.25rem",lineHeight:1.5}}>{i.docsDesc}</p>
              <div className="grid2">
                <div className="fg"><label className="lbl">{i.nif} *</label><input className="inp" value={perfil.nif} onChange={e => set("nif", e.target.value)} placeholder={i.nifPlaceholder} /></div>
                <div className="fg"><label className="lbl">{i.numeroCC} *</label><input className="inp" value={perfil.numero_cc} onChange={e => set("numero_cc", e.target.value)} placeholder={i.numeroCCPlaceholder} /></div>
              </div>
              <div className="save-row" style={{marginTop:"1.25rem",paddingTop:"1.25rem"}}><button className={`btn-save${guardado?" btn-ok":""}`} onClick={guardarPerfil}>{guardado?i.guardado:i.guardar}</button></div>
            </div>
          )}
        </div>

        {/* SECÇÃO: Dados Financeiros (só para lojistas) */}
        {modoLojista && (
          <div id="sec-financeiros" className="card" style={{padding:0,overflow:"hidden"}}>
            <div onClick={() => setSecaoAberta(s => s==="financeiros"?null:"financeiros")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.5rem 2rem",cursor:"pointer",userSelect:"none"}}>
              <div>
                <p style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:400,color:"var(--black)",margin:0}}>{i.dadosFinanceiros}</p>
                {secaoAberta !== "financeiros" && (
                  <p style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.2rem"}}>
                    {lojaIban ? `IBAN: ${lojaIban.slice(0,4)} •••• ${lojaIban.slice(-4)}` : i.ibanVazio}
                    {lojaCartaoGuardadoUltimos4 ? ` · ${i.cartaoGuardadoFim} •••• ${lojaCartaoGuardadoUltimos4}` : ` · ${i.cartaoVazio}`}
                  </p>
                )}
              </div>
              <span style={{color:"var(--g4)",fontSize:"0.85rem"}}>{secaoAberta==="financeiros"?"▲":"▼"}</span>
            </div>
            {secaoAberta === "financeiros" && (
              <div style={{padding:"0 2rem 2rem"}}>
                <p style={{fontSize:"0.78rem",color:"var(--g4)",marginBottom:"1.5rem",lineHeight:1.5}}>{i.dadosFinanceirosDesc}</p>

                {/* IBAN */}
                <div style={{marginBottom:"1.5rem"}}>
                  <label className="lbl" style={{display:"block",marginBottom:"0.4rem"}}>{i.ibanLabel}</label>
                  <input
                    className="inp"
                    value={lojaIban}
                    onChange={e => {
                      const v = e.target.value.toUpperCase();
                      setLojaIban(v);
                      const clean = v.replace(/\s/g,"");
                      if (clean.length >= 15) setLojaIbanValido(validarIBAN(clean));
                      else setLojaIbanValido(null);
                    }}
                    placeholder={i.ibanPlaceholder}
                    style={{fontFamily:"monospace",letterSpacing:"0.05em"}}
                  />
                  {lojaIbanValido === true && <p style={{fontSize:"0.72rem",color:"#27ae60",marginTop:"0.3rem"}}>{i.ibanValido}</p>}
                  {lojaIbanValido === false && <p style={{fontSize:"0.72rem",color:"#c0392b",marginTop:"0.3rem"}}>{i.ibanInvalido}</p>}
                </div>

                {/* Cartão — Stripe Elements */}
                <div style={{padding:"1.25rem",background:"var(--g1)",borderRadius:"6px",marginBottom:"1.25rem"}}>
                  <p style={{fontFamily:"var(--serif)",fontSize:"0.85rem",color:"var(--black)",margin:"0 0 1rem 0"}}>{i.cartaoLabel}</p>
                  {(lojaCartaoGuardadoUltimos4 || stripeFinUltimos4) && (
                    <div style={{fontSize:"0.75rem",color:"#27ae60",marginBottom:"0.75rem",padding:"0.5rem 0.75rem",background:"rgba(39,174,96,0.08)",borderRadius:"4px"}}>
                      {i.cartaoValido} — {i.cartaoGuardadoFim} •••• {stripeFinUltimos4 || lojaCartaoGuardadoUltimos4}
                    </div>
                  )}
                  {stripeFinCarregando && (
                    <p style={{fontSize:"0.75rem",color:"var(--g4)",marginBottom:"0.5rem"}}>A carregar formulário seguro...</p>
                  )}
                  {stripeFinDisponivel && (
                    <div id="stripe-card-financeiros" style={{padding:"0.75rem 1rem",border:"1px solid var(--g2)",borderRadius:"6px",background:"var(--bg)",minHeight:"42px"}} />
                  )}
                  {!stripeFinCarregando && !stripeFinDisponivel && (
                    <p style={{fontSize:"0.72rem",color:"#b8860b",marginTop:"0.25rem"}}>
                      {(lojaCartaoGuardadoUltimos4 || stripeFinUltimos4) ? "Para actualizar o cartão, recarrega a página e abre esta secção." : "Stripe em activação — tenta novamente em breve."}
                    </p>
                  )}
                </div>

                {financeirosMsg && (
                  <p style={{fontSize:"0.78rem",color:financeirosMsg===i.guardado?"#27ae60":"#c0392b",marginBottom:"1rem"}}>{financeirosMsg}</p>
                )}
                <div className="save-row">
                  <button className={`btn-save${financeirosMsg===i.guardado?" btn-ok":""}`} onClick={guardarDadosFinanceiros} disabled={financeirosLoading}>
                    {financeirosLoading?"...":financeirosMsg===i.guardado?i.guardado:i.guardarFinanceiros}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {alugueresHistorico.length > 0 && (
          <div style={{textAlign:"center",padding:"0.5rem 0"}}>
            <a href="/pedidos" style={{fontSize:"0.7rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g4)",textDecoration:"none",fontFamily:"var(--sans)"}}>{i.verPedidos} →</a>
          </div>
        )}
        {/* SECÇÃO: Segurança */}
        <div id="sec-seguranca" className="card" style={{padding:0,overflow:"hidden"}}>
          <div onClick={() => { setSecaoAberta(s => s==="seguranca"?null:"seguranca"); setPassMsg(""); }} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.5rem 2rem",cursor:"pointer",userSelect:"none"}}>
            <p style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:400,color:"var(--black)",margin:0}}>{i.mudarPassword}</p>
            <span style={{color:"var(--g4)",fontSize:"0.85rem"}}>{secaoAberta==="seguranca"?"▲":"▼"}</span>
          </div>
          {secaoAberta === "seguranca" && (
            <div style={{padding:"0 2rem 2rem"}}>
              <div className="fg"><label className="lbl">{i.novaPassword}</label>
                <input className="inp" type="password" value={novaPass} onChange={e=>setNovaPass(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </div>
              <div className="fg"><label className="lbl">{i.confirmarPassword}</label>
                <input className="inp" type="password" value={confirmarPass} onChange={e=>setConfirmarPass(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </div>
              {passMsg && <p style={{fontSize:"0.85rem",color:passMsgTipo==="ok"?"#27ae60":"#e74c3c",margin:"0.5rem 0 1rem",fontWeight:500}}>{passMsg}</p>}
              <button className="btn-guardar" onClick={mudarPassword} disabled={passLoading} style={{padding:"0.9rem 2rem",background:"var(--black)",color:"#fff",border:"none",cursor:"pointer",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"var(--sans)",fontWeight:600,opacity:passLoading?0.6:1,marginTop:"0.5rem"}}>
                {passLoading ? "..." : i.guardarPassword}
              </button>
            </div>
          )}
        </div>

        {/* SECÇÃO: Suporte */}
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div onClick={() => setSecaoAberta(s => s==="suporte"?null:"suporte")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.5rem 2rem",cursor:"pointer",userSelect:"none"}}>
            <div>
              <p style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:400,color:"var(--black)",margin:0}}>{i.reclamacoes}</p>
              {secaoAberta !== "suporte" && reclamacoes.length > 0 && <p style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.2rem"}}>{reclamacoes.length} pedido{reclamacoes.length>1?"s":""}</p>}
            </div>
            <span style={{color:"var(--g4)",fontSize:"0.85rem"}}>{secaoAberta==="suporte"?"▲":"▼"}</span>
          </div>
          {secaoAberta === "suporte" && (
            <div style={{padding:"0 2rem 2rem"}}>
              {recMsg && <p style={{fontSize:"0.85rem",color:"#27ae60",padding:"0.5rem 0",fontWeight:500}}>{recMsg}</p>}
              <button onClick={() => setShowNovaReclamacao(!showNovaReclamacao)} style={{fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#c4748a",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontWeight:500,marginBottom:"1rem",padding:0}}>
                {showNovaReclamacao ? "▲ Fechar" : `+ ${i.novaReclamacao}`}
              </button>
              {showNovaReclamacao && (
                <div style={{marginBottom:"1.25rem"}}>
                  <div className="fg">
                    <label className="lbl">{i.assunto}</label>
                    <input className="inp" value={novaRec.assunto} onChange={e=>setNovaRec(r=>({...r,assunto:e.target.value}))} placeholder={i.assuntoPlaceholder} />
                  </div>
                  <div className="fg">
                    <label className="lbl">{i.mensagem}</label>
                    <textarea className="inp" value={novaRec.mensagem} onChange={e=>setNovaRec(r=>({...r,mensagem:e.target.value}))} placeholder={i.mensagemPlaceholder} style={{resize:"vertical",minHeight:"100px"}} />
                  </div>
                  <button onClick={enviarReclamacao} disabled={recLoading||!novaRec.assunto||!novaRec.mensagem} style={{padding:"0.8rem 1.8rem",background:"var(--black)",color:"#fff",border:"none",cursor:"pointer",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"var(--sans)",fontWeight:600,opacity:recLoading?0.6:1}}>
                    {recLoading ? "..." : i.enviarReclamacao}
                  </button>
                </div>
              )}
              {reclamacoes.length > 0 ? (
                <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
                  {reclamacoes.map(r => (
                    <div key={r.id} style={{padding:"0.75rem 1rem",background:"var(--g1)",borderLeft:`3px solid ${r.estado==="resolvida"?"#27ae60":"#f39c12"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.3rem"}}>
                        <span style={{fontSize:"0.82rem",fontWeight:500}}>{r.assunto}</span>
                        <span style={{fontSize:"0.75rem",letterSpacing:"0.1em",textTransform:"uppercase",color:r.estado==="resolvida"?"#27ae60":"#f39c12"}}>{r.estado==="resolvida"?i.reclamacaoResolvida:i.reclamacaoPendente}</span>
                      </div>
                      <p style={{fontSize:"0.78rem",color:"var(--g4)"}}>{r.mensagem}</p>
                      {r.resposta && <p style={{fontSize:"0.78rem",color:"#080808",marginTop:"0.5rem",fontStyle:"italic",borderTop:"1px solid var(--g2)",paddingTop:"0.5rem"}}>↳ {r.resposta}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                !showNovaReclamacao && <p style={{fontSize:"0.8rem",color:"var(--g4)"}}>{i.semReclamacoes}</p>
              )}
            </div>
          )}
        </div>

        <div style={{textAlign:'center',padding:'1rem 0 2rem'}}>
          <button className="btn-sair" onClick={sair}>{i.sair}</button>
        </div>

      </div>
        </div>{/* fim display:none guardados */}
        </div>{/* fim display:none loja */}

        {/* BLOCO LOJISTA — CTA / formulário / estado candidatura — só na tab perfil */}
        {!modoLojista && tabAtiva === "perfil" && (
          <div style={{margin:"1.5rem 0 0"}}>

            {/* Estado: candidatura pendente — compacto */}
            {candidaturaLojista === "pendente" && (
              <div style={{padding:"0.75rem 1rem",background:"#f0f7f0",border:"1px solid #b8dbb8",display:"flex",alignItems:"center",gap:"0.6rem"}}>
                <span style={{fontSize:"0.9rem"}}>⏳</span>
                <span style={{fontSize:"0.78rem",color:"#4a7a4a"}}>Candidatura a lojista em análise — entraremos em contacto em 1–2 dias úteis.</span>
              </div>
            )}

            {/* Estado: loja eliminada — pode reabrir candidatura */}
            {candidaturaLojista === "eliminada" && (
              <div style={{padding:"0.75rem 1rem",background:"#fff5f5",border:"1px solid #f5c6c6",display:"flex",alignItems:"center",gap:"0.6rem",justifyContent:"space-between"}}>
                <span style={{fontSize:"0.78rem",color:"#c0392b"}}>✕ Loja eliminada.</span>
                <button onClick={() => { setCandidaturaLojista(null); setShowFormLojista(true); }} style={{background:"none",border:"none",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--black)",cursor:"pointer",fontFamily:"var(--sans)",fontWeight:600,whiteSpace:"nowrap",textDecoration:"underline",padding:0}}>
                  Abrir nova loja
                </button>
              </div>
            )}

            {/* Estado: candidatura recusada — compacto */}
            {candidaturaLojista === "recusada" && (
              <div style={{padding:"0.75rem 1rem",background:"#fff5f5",border:"1px solid #f5c6c6",display:"flex",alignItems:"center",gap:"0.6rem",justifyContent:"space-between"}}>
                <span style={{fontSize:"0.78rem",color:"#c0392b"}}>✗ Candidatura não aprovada desta vez.</span>
                <button onClick={() => { setCandidaturaLojista(null); setShowFormLojista(true); }} style={{background:"none",border:"none",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--black)",cursor:"pointer",fontFamily:"var(--sans)",fontWeight:600,whiteSpace:"nowrap",textDecoration:"underline",padding:0}}>
                  Nova candidatura
                </button>
              </div>
            )}

            {/* Estado: sem candidatura — convite discreto */}
            {!candidaturaLojista && !showFormLojista && (
              <div style={{padding:"1rem",background:"#f8f5f0",border:"1px solid #e8e3dc",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap"}}>
                <div>
                  <div style={{fontSize:"0.78rem",fontWeight:600,color:"var(--black)",marginBottom:"0.2rem"}}>Tens peças para alugar?</div>
                  <div style={{fontSize:"0.72rem",color:"var(--g4)"}}>180 dias de teste gratuito · comissão 10%</div>
                </div>
                <button onClick={() => setShowFormLojista(true)} style={{padding:"0.6rem 1.25rem",background:"var(--black)",color:"var(--white)",border:"none",cursor:"pointer",fontSize:"0.65rem",letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"var(--sans)",fontWeight:600,whiteSpace:"nowrap"}}>
                  Abrir loja →
                </button>
              </div>
            )}

            {/* Formulário de candidatura */}
            {!candidaturaLojista && showFormLojista && (
              <div style={{padding:"2rem",background:"#f8f5f0",border:"1px solid #e8e3dc"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
                  <div style={{fontFamily:"var(--serif)",fontSize:"1.3rem",fontWeight:400,color:"var(--black)"}}>Candidatura a Lojista</div>
                  <button onClick={() => setShowFormLojista(false)} style={{background:"none",border:"none",fontSize:"1.2rem",cursor:"pointer",color:"var(--g4)",lineHeight:1}}>✕</button>
                </div>

                {/* 1. Sobre a loja */}
                <div style={{marginBottom:"1.5rem"}}>
                  <div style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--g4)",fontWeight:600,marginBottom:"1rem",paddingBottom:"0.5rem",borderBottom:"1px solid #e2dfda"}}>1 · Sobre a tua loja</div>
                  <div style={{marginBottom:"0.75rem"}}>
                    <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.35rem",fontWeight:500}}>Nome da loja *</label>
                    <input style={{width:"100%",padding:"0.75rem",border:"1.5px solid #e2dfda",background:"#fff",fontSize:"0.9rem",fontFamily:"var(--sans)",color:"var(--black)",outline:"none",boxSizing:"border-box"}} value={formLojista.nome_loja} onChange={e => setFormLojista(f => ({...f, nome_loja: e.target.value}))} placeholder="ex: Atelier da Maria" />
                  </div>
                  <div style={{marginBottom:"0.75rem"}}>
                    <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.35rem",fontWeight:500}}>Que tipo de peças tens para alugar? *</label>
                    <input style={{width:"100%",padding:"0.75rem",border:"1.5px solid #e2dfda",background:"#fff",fontSize:"0.9rem",fontFamily:"var(--sans)",color:"var(--black)",outline:"none",boxSizing:"border-box"}} value={formLojista.tipo_pecas} onChange={e => setFormLojista(f => ({...f, tipo_pecas: e.target.value}))} placeholder="ex: Vestidos de noite, casacos de inverno, acessórios..." />
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.35rem",fontWeight:500}}>Descrição breve (opcional)</label>
                    <textarea style={{width:"100%",padding:"0.75rem",border:"1.5px solid #e2dfda",background:"#fff",fontSize:"0.9rem",fontFamily:"var(--sans)",color:"var(--black)",outline:"none",boxSizing:"border-box",resize:"vertical",minHeight:"72px"}} value={formLojista.descricao} onChange={e => setFormLojista(f => ({...f, descricao: e.target.value}))} placeholder="O que torna a tua loja especial? Qual é o teu estilo?" />
                  </div>
                </div>

                {/* 2. Dados pessoais */}
                <div style={{marginBottom:"1.5rem"}}>
                  <div style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--g4)",fontWeight:600,marginBottom:"1rem",paddingBottom:"0.5rem",borderBottom:"1px solid #e2dfda"}}>2 · Identificação e contacto</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"0.75rem"}}>
                    <div>
                      <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.35rem",fontWeight:500}}>NIF *</label>
                      <input style={{width:"100%",padding:"0.75rem",border:"1.5px solid #e2dfda",background:"#fff",fontSize:"0.9rem",fontFamily:"var(--sans)",color:"var(--black)",outline:"none",boxSizing:"border-box"}} value={formLojista.nif} onChange={e => setFormLojista(f => ({...f, nif: e.target.value}))} placeholder="123 456 789" inputMode="numeric" maxLength={11} />
                    </div>
                    <div>
                      <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.35rem",fontWeight:500}}>Telefone *</label>
                      <input style={{width:"100%",padding:"0.75rem",border:"1.5px solid #e2dfda",background:"#fff",fontSize:"0.9rem",fontFamily:"var(--sans)",color:"var(--black)",outline:"none",boxSizing:"border-box"}} value={formLojista.telefone_loja} onChange={e => setFormLojista(f => ({...f, telefone_loja: e.target.value}))} placeholder="+351 912 345 678" inputMode="tel" />
                    </div>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.35rem",fontWeight:500}}>Morada de levantamento das peças *</label>
                    <input style={{width:"100%",padding:"0.75rem",border:"1.5px solid #e2dfda",background:"#fff",fontSize:"0.9rem",fontFamily:"var(--sans)",color:"var(--black)",outline:"none",boxSizing:"border-box"}} value={formLojista.morada} onChange={e => setFormLojista(f => ({...f, morada: e.target.value}))} placeholder="Rua, número, código postal, cidade" />
                    <p style={{fontSize:"0.72rem",color:"var(--g4)",marginTop:"0.3rem",lineHeight:1.5}}>Endereço onde a Nora Grei recolhe as peças após cada aluguer.</p>
                  </div>
                </div>

                {/* 3. Dados bancários */}
                <div style={{marginBottom:"1.5rem"}}>
                  <div style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--g4)",fontWeight:600,marginBottom:"1rem",paddingBottom:"0.5rem",borderBottom:"1px solid #e2dfda"}}>3 · Dados para receber pagamentos</div>
                  <div style={{marginBottom:"0.75rem"}}>
                    <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.35rem",fontWeight:500}}>IBAN / NIB *</label>
                    <input style={{width:"100%",padding:"0.75rem",border:"1.5px solid #e2dfda",background:"#fff",fontSize:"0.9rem",fontFamily:"'Jost',monospace",color:"var(--black)",outline:"none",boxSizing:"border-box",letterSpacing:"0.05em"}} value={formLojista.iban} onChange={e => setFormLojista(f => ({...f, iban: e.target.value}))} placeholder="PT50 0002 0000 0000 0000 0000 0" />
                    <p style={{fontSize:"0.72rem",color:"var(--g4)",marginTop:"0.3rem",lineHeight:1.5}}>Recebes 90% do valor de cada aluguer, após dedução de 9€ de higienização por peça.</p>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.35rem",fontWeight:500}}>Preferência de pagamento *</label>
                    <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                      {[["transferencia","Transferência bancária"],["mbway","MB Way"],["cheque","Cheque"]].map(([val,label]) => (
                        <button key={val} type="button" onClick={() => setFormLojista(f => ({...f, tipo_pagamento: val}))} style={{padding:"0.5rem 1rem",fontSize:"0.68rem",letterSpacing:"0.08em",border:"1.5px solid",borderColor:formLojista.tipo_pagamento===val?"var(--black)":"#e2dfda",background:formLojista.tipo_pagamento===val?"var(--black)":"#fff",color:formLojista.tipo_pagamento===val?"#fff":"var(--g6)",cursor:"pointer",fontFamily:"var(--sans)",transition:"all 0.15s"}}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Cartão para débitos */}
                <div style={{marginBottom:"1.5rem"}}>
                  <div style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--g4)",fontWeight:600,marginBottom:"1rem",paddingBottom:"0.5rem",borderBottom:"1px solid #e2dfda"}}>4 · Cartão para débitos futuros</div>
                  <div style={{background:"#fff8f0",border:"1px solid #f5e0c0",padding:"0.9rem 1rem",marginBottom:"1rem",fontSize:"0.78rem",color:"#7a4a00",lineHeight:1.6}}>
                    ⚠️ O cartão não é cobrado agora. É guardado de forma segura (via Stripe) para débitos automáticos em caso de <strong>atraso na devolução (5€/dia)</strong> ou <strong>danos confirmados</strong> na peça.
                  </div>

                  {/* Campos de cartão — renderizados pelo Stripe Elements quando disponível */}
                  <div id="stripe-card-container" style={{border:"1.5px solid #e2dfda",padding:"0.85rem 1rem",background:"#fff",marginBottom:"0.75rem",minHeight:"48px",display:"flex",alignItems:"center"}}>
                    {stripeCarregando ? (
                      <span style={{fontSize:"0.82rem",color:"var(--g4)"}}>A carregar campos de cartão…</span>
                    ) : stripeDisponivel ? (
                      /* Stripe Elements monta aqui quando disponível */
                      <div id="stripe-card-element" style={{width:"100%"}} />
                    ) : (
                      /* Modo simulado — Stripe ainda não configurado */
                      <div style={{width:"100%"}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:"0.5rem",alignItems:"center"}}>
                          <input
                            style={{padding:"0",border:"none",outline:"none",fontSize:"0.9rem",fontFamily:"'Jost',monospace",color:"var(--black)",background:"transparent",letterSpacing:"0.08em",width:"100%"}}
                            value={formLojista.cartao_numero || ""}
                            onChange={e => setFormLojista(f => ({...f, cartao_numero: e.target.value}))}
                            placeholder="•••• •••• •••• ••••"
                            maxLength={19}
                          />
                          <input
                            style={{padding:"0",border:"none",outline:"none",fontSize:"0.9rem",fontFamily:"'Jost',monospace",color:"var(--black)",background:"transparent",width:"52px",textAlign:"center"}}
                            value={formLojista.cartao_validade || ""}
                            onChange={e => setFormLojista(f => ({...f, cartao_validade: e.target.value}))}
                            placeholder="MM/AA"
                            maxLength={5}
                          />
                          <input
                            style={{padding:"0",border:"none",outline:"none",fontSize:"0.9rem",fontFamily:"'Jost',monospace",color:"var(--black)",background:"transparent",width:"40px",textAlign:"center"}}
                            value={formLojista.cartao_cvv || ""}
                            onChange={e => setFormLojista(f => ({...f, cartao_cvv: e.target.value}))}
                            placeholder="CVV"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <p style={{fontSize:"0.72rem",color:"var(--g4)",lineHeight:1.5}}>
                    🔒 Dados processados com encriptação Stripe. A Nora Grei nunca tem acesso ao número completo do cartão.
                    {!stripeDisponivel && <span style={{color:"#b8860b"}}> (Stripe em activação — dados guardados após configuração)</span>}
                  </p>
                </div>

                {/* 5. Confirmações */}
                <div style={{marginBottom:"1.5rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
                  <div style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--g4)",fontWeight:600,marginBottom:"0.25rem",paddingBottom:"0.5rem",borderBottom:"1px solid #e2dfda"}}>5 · Confirmações obrigatórias</div>

                  <label style={{display:"flex",gap:"0.75rem",alignItems:"flex-start",cursor:"pointer",padding:"0.9rem",background:"#fff",border:"1px solid #e8e3dc"}}>
                    <input type="checkbox" checked={formLojista.aceita_termos} onChange={e => setFormLojista(f => ({...f, aceita_termos: e.target.checked}))} style={{marginTop:"0.15rem",accentColor:"var(--black)",width:"16px",height:"16px",flexShrink:0}} />
                    <span style={{fontSize:"0.78rem",color:"var(--g6)",lineHeight:1.6}}>
                      Li e aceito os <a href="/termos-lojista" target="_blank" style={{color:"var(--black)",fontWeight:600,textDecoration:"underline"}}>Termos e Condições para Lojistas</a> da Nora Grei. O período de teste é de 180 dias gratuitos.
                    </span>
                  </label>

                  <label style={{display:"flex",gap:"0.75rem",alignItems:"flex-start",cursor:"pointer",padding:"0.9rem",background:"#fff",border:"1px solid #e8e3dc"}}>
                    <input type="checkbox" checked={formLojista.aceita_responsabilidades} onChange={e => setFormLojista(f => ({...f, aceita_responsabilidades: e.target.checked}))} style={{marginTop:"0.15rem",accentColor:"var(--black)",width:"16px",height:"16px",flexShrink:0}} />
                    <span style={{fontSize:"0.78rem",color:"var(--g6)",lineHeight:1.6}}>
                      Compreendo que sou responsável pelo estado das peças que coloco à venda. Em caso de dano causado pelo cliente, a Nora Grei medeia mas não garante compensação total. Comprometo-me a entregar as peças em bom estado e dentro dos prazos acordados.
                    </span>
                  </label>
                </div>

                {formLojistaMsg && (
                  <p style={{fontSize:"0.8rem",color:"#c0392b",marginBottom:"1rem",padding:"0.75rem",background:"#fff5f5",border:"1px solid #f5c6c6"}}>{formLojistaMsg}</p>
                )}

                <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
                  <button onClick={submeterCandidaturaLojista} disabled={formLojistaLoading} style={{padding:"0.9rem 2rem",background:formLojistaLoading?"#ccc":"var(--black)",color:"#fff",border:"none",cursor:formLojistaLoading?"not-allowed":"pointer",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"var(--sans)",fontWeight:600,transition:"background 0.2s"}}>
                    {formLojistaLoading ? "A enviar..." : "Enviar candidatura →"}
                  </button>
                  <button onClick={() => { setShowFormLojista(false); setFormLojistaMsg(""); }} style={{padding:"0.9rem 1.5rem",background:"none",color:"var(--g4)",border:"none",cursor:"pointer",fontSize:"0.68rem",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"var(--sans)"}}>Cancelar</button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB CALCULADORA — disponível para todos os utilizadores */}
        {tabAtiva === "calculadora" && (
          <div style={{padding:"1rem 0 3rem"}}>
            <MiniCalculadora lang={lang} i={i} />
          </div>
        )}

        {modoLojista && tabAtiva === "loja" && (
          <div style={{padding:"0.5rem 0 2rem"}}>
            {/* Header da loja: título + link Ver loja */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem",paddingBottom:"1rem",borderBottom:"1px solid var(--g1)"}}>
              <h2 style={{fontFamily:"var(--serif)",fontSize:"1.35rem",fontWeight:300,margin:0,letterSpacing:"0.04em"}}>
                {lang==="fr"?"Ma boutique":lang==="lt"?"Mano parduotuvė":"Gestão da loja"}
              </h2>
              {codigoLoja && !editandoUrl && (
                <div style={{display:"flex",gap:"0.5rem",alignItems:"center",flexWrap:"wrap"}}>
                  <a href={`/loja/${codigoLoja}?from=perfil`} style={{fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.35rem 0.75rem",background:"var(--rosa)",color:"#fff",textDecoration:"none",fontFamily:"var(--sans)",whiteSpace:"nowrap"}}>Ver loja ↗</a>
                  <button onClick={()=>navigator.clipboard.writeText(window.location.origin+`/loja/${codigoLoja}`)} style={{fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.35rem 0.75rem",background:"none",border:"1.5px solid var(--g2)",color:"var(--g6)",fontFamily:"var(--sans)",whiteSpace:"nowrap",cursor:"pointer"}}>Copiar link</button>
                  <button onClick={()=>{setNovoUrl(codigoLoja);setEditandoUrl(true);setUrlStatus(null);}} style={{fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.35rem 0.75rem",background:"none",border:"1.5px solid var(--g2)",color:"var(--g4)",fontFamily:"var(--sans)",whiteSpace:"nowrap",cursor:"pointer"}}>✎ URL</button>
                </div>
              )}
              {editandoUrl && (
                <div style={{display:"flex",flexDirection:"column",gap:"0.4rem",minWidth:0,maxWidth:340}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.4rem",background:"var(--g1)",border:`1.5px solid ${urlStatus==="ok"?"#4caf50":urlStatus==="taken"||urlStatus==="invalid"?"#e57373":"var(--g2)"}`,padding:"0.3rem 0.6rem"}}>
                    <span style={{fontSize:"0.65rem",color:"var(--g4)",fontFamily:"var(--sans)",whiteSpace:"nowrap"}}>/loja/</span>
                    <input
                      value={novoUrl}
                      onChange={e=>onNovoUrlChange(e.target.value)}
                      placeholder="o-meu-url"
                      style={{border:"none",background:"none",outline:"none",fontFamily:"var(--sans)",fontSize:"0.82rem",color:"var(--ink)",minWidth:80,flex:1}}
                      autoFocus
                    />
                    {urlStatus==="checking" && <span style={{fontSize:"0.65rem",color:"var(--g4)"}}>···</span>}
                    {urlStatus==="ok" && <span style={{fontSize:"0.75rem",color:"#4caf50"}}>✓</span>}
                    {urlStatus==="taken" && <span style={{fontSize:"0.65rem",color:"#e57373"}}>Ocupado</span>}
                    {urlStatus==="invalid" && <span style={{fontSize:"0.65rem",color:"#e57373"}}>Mín. 3 letras</span>}
                  </div>
                  <div style={{fontSize:"0.6rem",color:"var(--g4)",fontFamily:"var(--sans)",letterSpacing:"0.05em"}}>Só letras e números · sem espaços · único na plataforma</div>
                  <div style={{display:"flex",gap:"0.4rem"}}>
                    <button onClick={gravarUrl} disabled={urlStatus!=="ok"} style={{fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.3rem 0.75rem",background:urlStatus==="ok"?"var(--rosa)":"var(--g2)",color:urlStatus==="ok"?"#fff":"var(--g4)",border:"none",fontFamily:"var(--sans)",cursor:urlStatus==="ok"?"pointer":"not-allowed"}}>Guardar</button>
                    <button onClick={()=>{setEditandoUrl(false);setUrlStatus(null);}} style={{fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.3rem 0.75rem",background:"none",border:"1.5px solid var(--g2)",color:"var(--g4)",fontFamily:"var(--sans)",cursor:"pointer"}}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
            {/* Tabs da loja — scroll horizontal no mobile */}
            <div className="tabs-scroll">
              {[["dashboard","Dashboard"],["pecas","Peças"],["alugueres","Alugueres"],["liquidacoes","Liquidações"],["custos","Custos"],["avaliacoes","Avaliações"],["higienizacao","Higienização"],["estatisticas","Estatísticas"],["gerir","Gerir loja"],["suporte",i.tabSuporte]].map(([key,label]) => (
                <button key={key} onClick={() => setTabLoja(key)} style={{padding:"0.75rem 1rem",fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",background:"none",border:"none",borderBottom:tabLoja===key?"2px solid #c4748a":"2px solid transparent",color:tabLoja===key?"#c4748a":"var(--g4)",cursor:"pointer",fontFamily:"var(--sans)",marginBottom:"-2px",whiteSpace:"nowrap",flexShrink:0}}>{label}</button>
              ))}
            </div>
            {tabLoja === "dashboard" && (() => {
              const agora = new Date();
              const mesAtual = `${agora.getFullYear()}-${String(agora.getMonth()+1).padStart(2,"0")}`;
              const concluidos = alugueresLoja.filter(a=>!["cancelado"].includes(a.estado));
              const doMes = concluidos.filter(a=>(a.data_inicio||"").startsWith(mesAtual));
              const receitaMes = doMes.reduce((s,a)=>s+(a.valor_aluguer||0)*0.9,0);
              const receitaTotal = concluidos.reduce((s,a)=>s+(a.valor_aluguer||0)*0.9,0);
              const ativos = alugueresLoja.filter(a=>["ativo","enviado"].includes(a.estado));
              const pendentesAcao = alugueresLoja.filter(a=>["pendente","em_devolucao"].includes(a.estado));

              // ── CHECKLIST DE ONBOARDING ──────────────────────────────
              const temFoto = !!(perfil?.foto_perfil);
              const temPecas = pecasLoja.length > 0;
              const temPecaLink = pecasLoja.some(p => p.link_compra_externa);
              const temAluguerConcluido = alugueresLoja.some(a => ["devolvido","devolvido_danificado"].includes(a.estado));
              const temBooster = boostersLoja.length > 0;
              const temCodigo = !!codigoAfiliado?.codigo;
              const passos = [
                { id:"foto",   feito: temFoto,             label: "Adiciona uma foto de perfil",        dica: "Lojas com foto têm 2× mais confiança dos clientes.", acao: null },
                { id:"peca",   feito: temPecas,            label: "Publica a tua primeira peça",        dica: "Fotografa bem e escreve uma boa descrição — faz toda a diferença.", acao: () => setTabLoja("pecas") },
                { id:"link",   feito: temPecaLink,         label: "Ativa um link externo numa peça",    dica: "Permite que os clientes comprem nova se quiserem — tu ganhas comissão.", acao: () => setTabLoja("pecas") },
                { id:"alug",   feito: temAluguerConcluido, label: "Completa o teu primeiro aluguer",    dica: "O primeiro vai sempre parecer mais difícil — depois flui naturalmente.", acao: () => setTabLoja("alugueres") },
                { id:"boost",  feito: temBooster,          label: "Experimenta um Booster de destaque", dica: "Boosters aumentam visibilidade quando há concorrência na mesma categoria.", acao: () => setTabLoja("custos") },
                { id:"codigo", feito: temCodigo,           label: "Partilha o teu link de convite",     dica: "Cada compra via link teu gera crédito automático — sem esforço extra.", acao: () => setShowReferralBanner(true) },
              ];
              const feitos = passos.filter(p=>p.feito).length;
              const pct = Math.round(feitos/passos.length*100);
              const lojaCompleta = feitos === passos.length;
              const proximoPasso = passos.find(p=>!p.feito);
              // ── FIM CHECKLIST ────────────────────────────────────────
              // Peça estrela do mês
              const recMes = {};
              doMes.forEach(a=>{
                const id = a.peca_lojista_id;
                if(!id) return;
                recMes[id]=(recMes[id]||{id,nome:a.pecas_lojista?.nome||"—",foto:a.pecas_lojista?.fotos?.[0]||null,total:0});
                recMes[id].total+=(a.valor_aluguer||0)*0.9;
              });
              const estrela = Object.values(recMes).sort((a,b)=>b.total-a.total)[0]||null;
              // Taxa de ocupação (dias alugados / dias totais disponíveis últimos 30 dias)
              const diasJanela = 30;
              const diasOcupados = concluidos.filter(a=>a.data_inicio&&a.data_fim).reduce((s,a)=>{
                const ini=new Date(a.data_inicio), fim=new Date(a.data_fim);
                const corte=new Date(agora-diasJanela*86400000);
                const inicio=ini<corte?corte:ini;
                const ffim=fim>agora?agora:fim;
                return s+Math.max(0,(ffim-inicio)/86400000);
              },0);
              const diasPossiveis = pecasLoja.length * diasJanela;
              const taxaOcupacao = diasPossiveis>0 ? Math.min(100,Math.round(diasOcupados/diasPossiveis*100)) : 0;
              return (
                <div>
                  {/* ── CHECKLIST ONBOARDING ── */}
                  {!lojaCompleta && (
                    <div style={{background:"var(--white)",padding:"1.1rem",marginBottom:"0.6rem",borderTop:"3px solid #89c4e1"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
                        <span style={{fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#4a9ec4",fontWeight:600}}>Primeiros passos</span>
                        <span style={{fontSize:"0.72rem",fontWeight:600,color:"#4a9ec4"}}>{feitos}/{passos.length}</span>
                      </div>
                      {/* barra de progresso */}
                      <div style={{height:5,background:"#e8f4fb",marginBottom:"0.75rem"}}>
                        <div style={{height:"100%",width:`${pct}%`,background:"#89c4e1",transition:"width 0.5s"}}/>
                      </div>
                      {/* lista de passos */}
                      <div style={{display:"flex",flexDirection:"column",gap:"0.45rem"}}>
                        {passos.map((p,idx) => (
                          <div key={p.id} style={{display:"flex",alignItems:"flex-start",gap:"0.6rem",opacity:p.feito?0.45:1}}>
                            <span style={{fontSize:"1rem",flexShrink:0,marginTop:"0.05rem"}}>{p.feito?"✅":"⬜"}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:"0.75rem",fontWeight:p.feito?400:500,color:"var(--black)",textDecoration:p.feito?"line-through":"none"}}>{p.label}</div>
                              {!p.feito && idx===passos.findIndex(x=>!x.feito) && (
                                <div style={{fontSize:"0.68rem",color:"var(--g4)",marginTop:"0.1rem",lineHeight:1.4}}>{p.dica}</div>
                              )}
                            </div>
                            {!p.feito && p.acao && idx===passos.findIndex(x=>!x.feito) && (
                              <button onClick={p.acao} style={{fontSize:"0.62rem",padding:"0.2rem 0.5rem",background:"#89c4e1",color:"#fff",border:"none",cursor:"pointer",borderRadius:"2px",flexShrink:0,fontFamily:"var(--sans)",letterSpacing:"0.08em"}}>Ir →</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {lojaCompleta && (
                    <div style={{background:"#e8f5e9",border:"1px solid #a8d5b5",padding:"0.85rem 1rem",marginBottom:"0.6rem",display:"flex",alignItems:"center",gap:"0.75rem"}}>
                      <span style={{fontSize:"1.3rem"}}>🎉</span>
                      <div>
                        <div style={{fontSize:"0.72rem",fontWeight:600,color:"#1e7e3e"}}>Loja completa — parabéns!</div>
                        <div style={{fontSize:"0.68rem",color:"#2e7d4f",marginTop:"0.1rem"}}>Tens tudo configurado. Continua a publicar peças e a partilhar o teu link.</div>
                      </div>
                    </div>
                  )}
                  {/* Alertas de ação */}
                  {pendentesAcao.length>0 && (
                    <div style={{background:"#fff8e1",border:"1.5px solid #f39c12",padding:"0.85rem 1rem",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.75rem",cursor:"pointer"}} onClick={()=>setTabLoja("alugueres")}>
                      <span style={{fontSize:"1.2rem"}}>⚠️</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:"0.72rem",fontWeight:600,color:"#b8860b"}}>Ação necessária</div>
                        <div style={{fontSize:"0.68rem",color:"#8a5a00",marginTop:"0.1rem"}}>
                          {alugueresLoja.filter(a=>a.estado==="pendente").length>0 && `${alugueresLoja.filter(a=>a.estado==="pendente").length} aluguer(es) por confirmar · `}
                          {alugueresLoja.filter(a=>a.estado==="em_devolucao").length>0 && `${alugueresLoja.filter(a=>a.estado==="em_devolucao").length} devolução(ões) por verificar`}
                        </div>
                      </div>
                      <span style={{fontSize:"0.7rem",color:"#b8860b"}}>Ver →</span>
                    </div>
                  )}
                  {/* KPIs principais */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"0.6rem"}}>
                    <div style={{background:"var(--white)",padding:"1.25rem",borderTop:"3px solid var(--rosa)",gridColumn:"1/-1"}}>
                      <div style={{fontSize:"0.68rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--g4)",marginBottom:"0.3rem"}}>Receita este mês</div>
                      <div style={{fontFamily:"var(--serif)",fontSize:"2.4rem",fontWeight:300,color:"var(--rosa)",lineHeight:1}}>{receitaMes.toFixed(0)}€</div>
                      <div style={{fontSize:"0.68rem",color:"var(--g4)",marginTop:"0.3rem"}}>{doMes.length} aluguer{doMes.length!==1?"es":""} · total acumulado {receitaTotal.toFixed(0)}€</div>
                    </div>
                    {[
                      {val:ativos.length, lbl:"Ativos agora", cor:"#27ae60"},
                      {val:pecasLoja.length, lbl:"Peças na loja", cor:"var(--rosa)"},
                    ].map((k,i)=>(
                      <div key={i} style={{background:"var(--white)",padding:"1.1rem",borderTop:`3px solid ${k.cor}`}}>
                        <div style={{fontFamily:"var(--serif)",fontSize:"1.8rem",fontWeight:300,color:k.cor}}>{k.val}</div>
                        <div style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g4)",marginTop:"0.25rem"}}>{k.lbl}</div>
                      </div>
                    ))}
                  </div>
                  {/* Taxa de ocupação */}
                  <div style={{background:"var(--white)",padding:"1.1rem",marginBottom:"0.6rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
                      <span style={{fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--g4)",display:"inline-flex",alignItems:"center"}}>Taxa de ocupação (30 dias)<Tooltip texto="Percentagem de dias em que as tuas peças estiveram alugadas nos últimos 30 dias. Acima de 50% é bom; abaixo de 25% pode indicar preço alto ou falta de visibilidade." /></span>
                      <span style={{fontFamily:"var(--serif)",fontSize:"1.2rem",color:taxaOcupacao>=50?"#27ae60":taxaOcupacao>=25?"#f39c12":"#e74c3c"}}>{taxaOcupacao}%</span>
                    </div>
                    <div style={{height:6,background:"#f0eeeb"}}>
                      <div style={{height:"100%",width:`${taxaOcupacao}%`,background:taxaOcupacao>=50?"#27ae60":taxaOcupacao>=25?"#f39c12":"#e74c3c",transition:"width 0.4s"}}/>
                    </div>
                    <div style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.35rem"}}>{taxaOcupacao<25?"Preço pode estar alto ou peças precisam de mais visibilidade":taxaOcupacao<50?"A crescer — considera promover no feed":taxaOcupacao<75?"Boa ocupação":"Excelente — considera subir preço ou adicionar stock"}</div>
                  </div>
                  {/* ── NOTA DA PLATAFORMA ── */}
                  {(() => {
                    // Nota média combinada: clientes + penalizações plataforma
                    const notasClientes = avaliacoesLoja.filter(av => av.nota_cliente_lojista).map(av => av.nota_cliente_lojista);
                    const notasPlataforma = avaliacoesLoja.filter(av => av.nota_plataforma).map(av => av.nota_plataforma);
                    const todasNotas = [...notasClientes, ...notasPlataforma];
                    if (todasNotas.length === 0) return null;
                    const mediaGlobal = (todasNotas.reduce((s,n)=>s+n,0) / todasNotas.length);
                    const mediaStr = mediaGlobal.toFixed(1);
                    const estrelasCor = mediaGlobal >= 4 ? "#c4748a" : mediaGlobal >= 3 ? "#f39c12" : "#e74c3c";
                    const penalizacoes = notasPlataforma.filter(n => n <= 2);
                    return (
                      <div style={{background:"var(--white)",padding:"1.1rem",marginBottom:"0.6rem",border:"1.5px solid #f0eeeb"}}>
                        <div style={{fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--g4)",fontWeight:600,marginBottom:"0.75rem"}}>⭐ Nota da plataforma</div>
                        <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"0.6rem"}}>
                          <div style={{fontFamily:"var(--serif)",fontSize:"2.8rem",fontWeight:300,color:estrelasCor,lineHeight:1}}>{mediaStr}</div>
                          <div>
                            <div style={{display:"flex",gap:"0.1rem",marginBottom:"0.2rem"}}>
                              {[1,2,3,4,5].map(v=><span key={v} style={{fontSize:"1.1rem",color:v<=Math.round(mediaGlobal)?estrelasCor:"#e2dfda"}}>★</span>)}
                            </div>
                            <div style={{fontSize:"0.68rem",color:"var(--g4)",letterSpacing:"0.05em"}}>
                              {notasClientes.length > 0 && <span>{notasClientes.length} avaliação{notasClientes.length!==1?"ões":""} de clientes</span>}
                              {notasClientes.length > 0 && notasPlataforma.length > 0 && <span> · </span>}
                              {notasPlataforma.length > 0 && <span>{notasPlataforma.length} nota{notasPlataforma.length!==1?"s":""} da Nora Grei</span>}
                            </div>
                          </div>
                        </div>
                        {penalizacoes.length > 0 && (
                          <div style={{background:"#ffeaea",border:"1px solid #e74c3c22",padding:"0.5rem 0.7rem",fontSize:"0.72rem",color:"#c0392b",lineHeight:1.4}}>
                            ⚠ {penalizacoes.length} penalização{penalizacoes.length!==1?"ões":""} atribuída{penalizacoes.length!==1?"s":""} pela plataforma — cancela reservas ou incidentes afetam a tua nota.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  {/* ── AVALIAÇÕES DOS CLIENTES ── */}
                  {(() => {
                    const avsComComentario = avaliacoesLoja.filter(av => av.nota_cliente_lojista || av.comentario_cliente);
                    if (avsComComentario.length === 0) return null;
                    return (
                      <div style={{background:"var(--white)",padding:"1.1rem",marginBottom:"0.6rem",border:"1.5px solid #f0eeeb"}}>
                        <div style={{fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--g4)",fontWeight:600,marginBottom:"0.85rem"}}>💬 Avaliações recebidas</div>
                        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
                          {avsComComentario.slice(0,5).map((av, i) => {
                            const nota = av.nota_cliente_lojista;
                            const cor = nota >= 4 ? "#c4748a" : nota >= 3 ? "#f39c12" : "#e74c3c";
                            const data = av.created_at ? fmtData(av.created_at, lang, {day:"numeric",month:"short",year:"numeric"}) : "";
                            return (
                              <div key={i} style={{borderBottom:"1px solid #f5f3f0",paddingBottom:"0.75rem"}}>
                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.3rem"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                                    <span style={{fontSize:"0.72rem",fontWeight:600,color:"var(--fg)",fontFamily:"var(--sans)"}}>{av.clientes?.nome || "Cliente"}</span>
                                  </div>
                                  <span style={{fontSize:"0.62rem",color:"var(--g4)"}}>{data}</span>
                                </div>
                                {nota && (
                                  <div style={{display:"flex",gap:"0.1rem",marginBottom:"0.25rem"}}>
                                    {[1,2,3,4,5].map(v=><span key={v} style={{fontSize:"0.9rem",color:v<=nota?cor:"#e2dfda"}}>★</span>)}
                                  </div>
                                )}
                                {av.comentario_cliente && (
                                  <p style={{fontSize:"0.78rem",color:"var(--g5)",lineHeight:1.4,margin:0,fontStyle:"italic"}}>"{av.comentario_cliente}"</p>
                                )}
                              </div>
                            );
                          })}
                          {avsComComentario.length > 5 && (
                            <div style={{fontSize:"0.72rem",color:"var(--g4)",textAlign:"center"}}>+ {avsComComentario.length - 5} avaliações anteriores</div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  {/* ── SAÚDE OPERACIONAL ── */}
                  {(() => {
                    const total = alugueresLoja.length;
                    if (total === 0) return null;
                    const canceladosPorLojista = alugueresLoja.filter(a => a.estado === "cancelado" && a.cancelado_por === "lojista");
                    const danificados = alugueresLoja.filter(a => a.estado === "devolvido_danificado");
                    const naoDevolvidos = alugueresLoja.filter(a => a.estado === "nao_devolvido");
                    const custoCancelamentos = canceladosPorLojista.reduce((s,a) => s+(a.valor_aluguer||0), 0);
                    const taxaCancelamento = total > 0 ? Math.round(canceladosPorLojista.length / total * 100) : 0;
                    // aviso de risco de suspensão: ≥3 cancelamentos sem justificação
                    const riscoSuspensao = canceladosPorLojista.length >= 3;
                    // score de reputação: começa em 100, -10 por cancelamento, -15 por dano, -20 por não devolução
                    const scoreBase = 100 - canceladosPorLojista.length*10 - danificados.length*15 - naoDevolvidos.length*20;
                    const score = Math.max(0, Math.min(100, scoreBase));
                    const scoreCor = score >= 80 ? "#27ae60" : score >= 50 ? "#f39c12" : "#e74c3c";
                    const scoreLabel = score >= 80 ? "Bom" : score >= 50 ? "A melhorar" : "Crítico";
                    const temProblemas = canceladosPorLojista.length > 0 || danificados.length > 0 || naoDevolvidos.length > 0;
                    return (
                      <div style={{background:"var(--white)",padding:"1.1rem",marginBottom:"0.6rem",marginTop:"0.6rem",borderTop:`3px solid ${scoreCor}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.85rem"}}>
                          <span style={{fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--g4)",fontWeight:600}}>Saúde operacional</span>
                          <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                            <span style={{fontFamily:"var(--serif)",fontSize:"1.3rem",color:scoreCor,fontWeight:300}}>{score}</span>
                            <span style={{fontSize:"0.65rem",color:scoreCor,fontWeight:600,letterSpacing:"0.08em"}}>{scoreLabel}</span>
                          </div>
                        </div>
                        {riscoSuspensao && (
                          <div style={{background:"#ffeaea",border:"1px solid #e74c3c",padding:"0.6rem 0.85rem",marginBottom:"0.85rem",borderRadius:4,fontSize:"0.72rem",color:"#c0392b",lineHeight:1.4}}>
                            ⚠ Atenção: {canceladosPorLojista.length} cancelamentos por tua iniciativa. Ao atingir 3 cancelamentos sem justificação válida, a conta pode ser suspensa temporariamente.
                          </div>
                        )}
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
                          {[
                            {
                              val: canceladosPorLojista.length,
                              lbl: "Cancelamentos teus",
                              sub: custoCancelamentos > 0 ? `${custoCancelamentos.toFixed(0)}€ em créditos gerados` : "Sem custo ainda",
                              cor: canceladosPorLojista.length === 0 ? "#27ae60" : canceladosPorLojista.length < 3 ? "#f39c12" : "#e74c3c",
                              ico: canceladosPorLojista.length === 0 ? "✓" : "✕",
                            },
                            {
                              val: `${taxaCancelamento}%`,
                              lbl: "Taxa cancelamento",
                              sub: `${total} alugueres no total`,
                              cor: taxaCancelamento === 0 ? "#27ae60" : taxaCancelamento < 10 ? "#f39c12" : "#e74c3c",
                              ico: null,
                            },
                            {
                              val: danificados.length,
                              lbl: "Peças devolvidas c/ danos",
                              sub: danificados.length > 0 ? "Revê condição das peças antes de enviar" : "Sem ocorrências",
                              cor: danificados.length === 0 ? "#27ae60" : "#e74c3c",
                              ico: danificados.length === 0 ? "✓" : "⚠",
                            },
                            {
                              val: naoDevolvidos.length,
                              lbl: "Não devolvidos",
                              sub: naoDevolvidos.length > 0 ? "Casos em aberto com a Nora Grei" : "Sem ocorrências",
                              cor: naoDevolvidos.length === 0 ? "#27ae60" : "#e74c3c",
                              ico: naoDevolvidos.length === 0 ? "✓" : "⚠",
                            },
                          ].map((k,idx) => (
                            <div key={idx} style={{padding:"0.75rem",background:"#fafaf9",border:`1px solid ${k.cor}22`}}>
                              <div style={{display:"flex",alignItems:"baseline",gap:"0.35rem"}}>
                                <span style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:300,color:k.cor,lineHeight:1}}>{k.val}</span>
                                {k.ico && <span style={{fontSize:"0.75rem",color:k.cor}}>{k.ico}</span>}
                              </div>
                              <div style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--g4)",margin:"0.2rem 0 0.15rem",fontWeight:600}}>{k.lbl}</div>
                              <div style={{fontSize:"0.63rem",color:"#aaa",lineHeight:1.3}}>{k.sub}</div>
                            </div>
                          ))}
                        </div>
                        {!temProblemas && (
                          <div style={{fontSize:"0.7rem",color:"#27ae60",marginTop:"0.75rem",textAlign:"center"}}>✓ Excelente — zero cancelamentos, zero ocorrências</div>
                        )}
                      </div>
                    );
                  })()}
                  {/* Peça estrela do mês */}
                  {estrela && (
                    <div style={{background:"var(--white)",padding:"1.1rem",display:"flex",gap:"1rem",alignItems:"center"}}>
                      {estrela.foto?<img src={estrela.foto} style={{width:52,height:66,objectFit:"cover",flexShrink:0}} alt=""/>:<div style={{width:52,height:66,background:"var(--g1)",flexShrink:0}}/>}
                      <div style={{flex:1}}>
                        <div style={{fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--rosa)",fontWeight:600,marginBottom:"0.25rem"}}>⭐ Peça do mês</div>
                        <div style={{fontFamily:"var(--serif)",fontSize:"1rem"}}>{estrela.nome}</div>
                        <div style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.2rem"}}>{estrela.total.toFixed(0)}€ gerados este mês</div>
                      </div>
                    </div>
                  )}
                  {/* Painel links externos */}
                  {(() => {
                    const pecasComLink = pecasLoja.filter(p=>p.link_compra_externa);
                    if(!pecasComLink.length) return null;
                    const ativas = pecasComLink.filter(p=>p.link_externo_ativo).length;
                    const pendentes = pecasComLink.filter(p=>!p.link_externo_ativo).length;
                    const custoTotal = pecasComLink.length * 15;
                    return (
                      <div style={{background:"#faf8f5",border:"1.5px solid #e8d5a3",padding:"1.1rem",marginTop:"0.6rem"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
                          <div style={{fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#8a6a2a",fontWeight:600}}>Links externos ↗</div>
                          <span style={{fontSize:"0.75rem",color:"#8a6a2a",fontWeight:600}}>{custoTotal}€/mês</span>
                        </div>
                        {pecasComLink.map(p=>(
                          <div key={p.id} style={{display:"flex",gap:"0.75rem",alignItems:"center",marginBottom:"0.5rem",padding:"0.5rem",background:"#fff",border:"1px solid #e8d5a3"}}>
                            {p.fotos?.[0]?<img src={p.fotos[0]} style={{width:32,height:40,objectFit:"cover",flexShrink:0}} alt=""/>:<div style={{width:32,height:40,background:"#e8d5a3",flexShrink:0}}/>}
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:"0.75rem",fontFamily:"var(--serif)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.nome}</div>
                              <div style={{fontSize:"0.68rem",color:"var(--g4)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.link_compra_externa}</div>
                            </div>
                            <span style={{fontSize:"0.68rem",fontWeight:600,whiteSpace:"nowrap",color:p.link_externo_ativo?"#27ae60":"#e67e22"}}>{p.link_externo_ativo?"✓ Ativo":"⏳ Pendente"}</span>
                          </div>
                        ))}
                        {pendentes>0 && <div style={{fontSize:"0.75rem",color:"#8a6a2a",marginTop:"0.5rem"}}>⏳ {pendentes} link{pendentes!==1?"s":""} pendente{pendentes!==1?"s":""} de ativação — contacta a Nora Grei para ativar.</div>}
                        {ativas>0 && <div style={{fontSize:"0.75rem",color:"#27ae60",marginTop:"0.35rem"}}>✓ {ativas} link{ativas!==1?"s":""} ativo{ativas!==1?"s":""}</div>}
                      </div>
                    );
                  })()}
                  {/* ── OPTIMIZAÇÃO DE PEÇAS ── */}
                  {(() => {
                    const agora30 = new Date(Date.now() - 30*24*60*60*1000);
                    // peças sem nenhum aluguer nos últimos 30 dias
                    const idsComAluguer30 = new Set(
                      alugueresLoja
                        .filter(a => a.data_inicio && new Date(a.data_inicio) >= agora30)
                        .map(a => a.peca_lojista_id)
                    );
                    const pecasSemMovimento = pecasLoja.filter(p => !idsComAluguer30.has(p.id));
                    if (pecasSemMovimento.length === 0) return null;
                    return (
                      <div style={{background:"var(--white)",padding:"1.1rem",marginTop:"0.6rem",borderTop:"3px solid #f39c12"}}>
                        <div style={{fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#b8860b",fontWeight:600,marginBottom:"0.75rem"}}>
                          💡 {pecasSemMovimento.length} {({pt:`peça${pecasSemMovimento.length!==1?"s":""} sem alugueres nos últimos 30 dias`,fr:`pièce${pecasSemMovimento.length!==1?"s":""} sans location ces 30 derniers jours`,lt:`daiktas${pecasSemMovimento.length!==1?"ų":""} be nuomos per pastarąsias 30 dienų`})[lang]||`peça${pecasSemMovimento.length!==1?"s":""} sem alugueres nos últimos 30 dias`}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                          {pecasSemMovimento.slice(0,3).map(p => {
                            const precoAtual = p.preco_aluguer_dia || 0;
                            const precoSugerido = Math.max(5, Math.round(precoAtual * 0.85 / 5) * 5);
                            const totalAlugueres = alugueresLoja.filter(a => a.peca_lojista_id === p.id).length;
                            return (
                              <div key={p.id} style={{display:"flex",gap:"0.75rem",alignItems:"center",padding:"0.75rem",background:"#fffbf0",border:"1px solid #f0d58a"}}>
                                {p.fotos?.[0]
                                  ? <img src={p.fotos[0]} style={{width:40,height:50,objectFit:"cover",flexShrink:0}} alt=""/>
                                  : <div style={{width:40,height:50,background:"#f0d58a",flexShrink:0}}/>
                                }
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:"0.78rem",fontFamily:"var(--serif)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nome}</div>
                                  <div style={{fontSize:"0.68rem",color:"var(--g4)",marginTop:"0.15rem"}}>
                                    {precoAtual > 0 ? `${precoAtual}€/dia · ` : ""}{totalAlugueres} {({pt:`aluguer${totalAlugueres!==1?"es":""} no total`,fr:`location${totalAlugueres!==1?"s":""} au total`,lt:`nuoma${totalAlugueres!==1?"s":""} iš viso`})[lang]||`aluguer${totalAlugueres!==1?"es":""} no total`}
                                  </div>
                                  {precoAtual > 0 && (
                                    <div style={{fontSize:"0.65rem",color:"#8a6a00",marginTop:"0.1rem"}}>
                                      {({pt:`Sugestão: baixar para ${precoSugerido}€/dia para ganhar visibilidade`,fr:`Suggestion: baisser à ${precoSugerido}€/jour pour gagner en visibilité`,lt:`Pasiūlymas: sumažinti iki ${precoSugerido}€/dieną, kad padidėtų matomumas`})[lang]||`Sugestão: baixar para ${precoSugerido}€/dia para ganhar visibilidade`}
                                    </div>
                                  )}
                                </div>
                                <div style={{display:"flex",flexDirection:"column",gap:"0.3rem",flexShrink:0}}>
                                  <button onClick={()=>{setEditarPeca({...p});setFotosEditar(p.fotos||[]);}}
                                    style={{fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",padding:"0.3rem 0.55rem",background:"#f39c12",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontWeight:600,whiteSpace:"nowrap"}}>
                                    {({pt:"Editar preço",fr:"Modifier prix",lt:"Keisti kainą"})[lang]||"Editar preço"}
                                  </button>
                                  <button onClick={()=>{setTabLoja("pecas"); setPecaSimuladorAberta(p.id);}}
                                    style={{fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",padding:"0.3rem 0.55rem",background:"none",border:"1.5px solid #f39c12",color:"#b8860b",cursor:"pointer",fontFamily:"var(--sans)",fontWeight:600,whiteSpace:"nowrap"}}>
                                    {({pt:"Simular",fr:"Simuler",lt:"Simuliuoti"})[lang]||"Simular"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {pecasSemMovimento.length > 3 && (
                            <div style={{fontSize:"0.72rem",color:"var(--g4)",textAlign:"center",paddingTop:"0.25rem"}}>
                              + {pecasSemMovimento.length - 3} {({pt:`peça${pecasSemMovimento.length-3!==1?"s":""} sem movimento — ver tab Peças`,fr:`pièce${pecasSemMovimento.length-3!==1?"s":""} sans mouvement — voir onglet Pièces`,lt:`daiktas${pecasSemMovimento.length-3!==1?"ų":""} be judėjimo — žiūrėti skirtuką Daiktai`})[lang]||`peça${pecasSemMovimento.length-3!==1?"s":""} sem movimento — ver tab Peças`}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  {diasTeste>0 && <div style={{marginTop:"0.6rem",fontSize:"0.75rem",color:"var(--g4)",textAlign:"center",padding:"0.6rem",background:"var(--g1)"}}>{diasTeste} dias de período teste restantes</div>}
                </div>
              );
            })()}
            {tabLoja === "pecas" && (
              <div className="card" style={{padding:0}}>
                <div style={{padding:"1rem 1.5rem",borderBottom:"1px solid var(--g1)",display:"flex",justifyContent:"flex-end"}}><button onClick={()=>setShowNovaPeca(true)} style={{fontSize:"0.75rem",letterSpacing:"0.15em",textTransform:"uppercase",background:"var(--black)",color:"#fff",padding:"0.5rem 1rem",border:"none",cursor:"pointer",fontFamily:"var(--sans)"}}>+ Adicionar peça</button></div>
                {pecasLoja.length === 0 ? (
                  <div style={{padding:"1.25rem 1.5rem 1.5rem"}}>
                    <NudgeBanner
                      id="nudge_primeira_peca"
                      icone="👗"
                      titulo="A tua loja está vazia — vamos mudar isso"
                      descricao="Adiciona a tua primeira peça em menos de 3 minutos. Tira uma boa fotografia, escreve uma descrição curta e define o preço — é tudo. Lojas com pelo menos 3 peças recebem 4× mais visitas."
                      ctaLabel="Adicionar primeira peça"
                      onCta={() => setShowNovaPeca(true)}
                    />
                    <p style={{textAlign:"center",fontSize:"0.85rem",color:"var(--g4)"}}>Ainda sem peças.</p>
                  </div>
                ) : pecasLoja.map(p=>{
                  const urlPeca = typeof window !== "undefined" ? `${window.location.origin}/loja/${codigoLoja}/peca/${p.id}` : "";
                  const urlAfiliado = user ? `${urlPeca}?ref=${user.id}` : urlPeca;
                  return (
                  <div key={p.id} style={{borderBottom:"1px solid var(--g1)"}}>
                    <div style={{padding:"1rem 1.5rem",display:"flex",gap:"1rem",alignItems:"center"}}>
                      {p.fotos?.[0]?<img src={p.fotos[0]} style={{width:48,height:60,objectFit:"cover"}} alt=""/>:<div style={{width:48,height:60,background:"var(--g1)"}}/>}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:"var(--serif)",fontSize:"1rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nome}</div>
                        <div style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.2rem"}}>{p.preco_aluguer_dia ? `${p.preco_aluguer_dia}€/dia` : "—"}{p.preco_venda ? ` · ${p.preco_venda}€ venda` : ""}</div>
                      </div>
                      <div style={{display:"flex",gap:"0.4rem",flexShrink:0}}>
                        <button onClick={()=>setPecaLinksAberta(prev => prev===p.id ? null : p.id)}
                          style={{fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",background:"none",border:"1.5px solid #c4a882",padding:"0.35rem 0.65rem",cursor:"pointer",fontFamily:"var(--sans)",color:"#c4a882",whiteSpace:"nowrap",fontWeight:600}}>
                          🔗 Links
                        </button>
                        <button onClick={()=>setPecaSimuladorAberta(prev => prev===p.id ? null : p.id)}
                          style={{fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",background:"none",border:"1.5px solid #89c4e1",padding:"0.35rem 0.65rem",cursor:"pointer",fontFamily:"var(--sans)",color:"#4a9ec4",whiteSpace:"nowrap",fontWeight:600}}>
                          📊 {({pt:"Simular",fr:"Simuler",lt:"Simuliuoti"})[lang]||"Simular"}
                        </button>
                        <button onClick={()=>{setEditarPeca({...p});setFotosEditar(p.fotos||[]);}} style={{fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",background:"none",border:"1.5px solid var(--g2)",padding:"0.35rem 0.65rem",cursor:"pointer",fontFamily:"var(--sans)",color:"var(--g4)",whiteSpace:"nowrap"}}>Editar</button>
                      </div>
                    </div>
                    {/* Painel de links da peça */}
                    {pecaLinksAberta === p.id && (
                      <div style={{padding:"0.85rem 1.5rem 1rem",background:"#fdf6ee",borderTop:"1px solid #e8d8c8"}}>
                        <div style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#7a6a5a",fontWeight:600,marginBottom:"0.65rem"}}>Links desta peça</div>
                        {/* Link afiliado (com ref) */}
                        <div style={{marginBottom:"0.6rem"}}>
                          <div style={{fontSize:"0.68rem",color:"#c4a882",fontWeight:600,marginBottom:"0.3rem"}}>🔗 Link afiliado — partilha e ganhas 10% em créditos</div>
                          <div style={{display:"flex",gap:"0.4rem"}}>
                            <div style={{flex:1,fontSize:"0.68rem",fontFamily:"monospace",background:"#fff",border:"1px solid #e8d8c8",padding:"0.4rem 0.6rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#5a5855"}}>{urlAfiliado}</div>
                            <button onClick={async()=>{try{await navigator.clipboard.writeText(urlAfiliado)}catch{} }}
                              style={{padding:"0.4rem 0.65rem",background:"#c4a882",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,whiteSpace:"nowrap"}}>Copiar</button>
                          </div>
                        </div>
                        {/* Link directo (sem ref) */}
                        <div style={{marginBottom:"0.6rem"}}>
                          <div style={{fontSize:"0.68rem",color:"#5a5855",fontWeight:600,marginBottom:"0.3rem"}}>🌐 Link directo da peça</div>
                          <div style={{display:"flex",gap:"0.4rem"}}>
                            <div style={{flex:1,fontSize:"0.68rem",fontFamily:"monospace",background:"#fff",border:"1px solid #e2dfda",padding:"0.4rem 0.6rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#5a5855"}}>{urlPeca}</div>
                            <button onClick={async()=>{try{await navigator.clipboard.writeText(urlPeca)}catch{} }}
                              style={{padding:"0.4rem 0.65rem",background:"#080808",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,whiteSpace:"nowrap"}}>Copiar</button>
                          </div>
                        </div>
                        {/* Partilha rápida */}
                        <div style={{display:"flex",gap:"0.4rem",marginTop:"0.25rem"}}>
                          <button onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(p.nome+" — "+urlAfiliado)}`,"_blank")}
                            style={{flex:1,padding:"0.45rem",background:"#25D366",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.6rem",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600}}>WhatsApp</button>
                          <button onClick={async()=>{try{await navigator.clipboard.writeText(urlAfiliado)}catch{} }}
                            style={{flex:1,padding:"0.45rem",background:"linear-gradient(45deg,#f09433,#dc2743,#bc1888)",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.6rem",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600}}>Instagram</button>
                          <button onClick={async()=>{try{await navigator.clipboard.writeText(urlAfiliado)}catch{} }}
                            style={{flex:1,padding:"0.45rem",background:"#010101",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.6rem",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600}}>TikTok</button>
                        </div>
                        <div style={{fontSize:"0.65rem",color:"#9c9894",marginTop:"0.4rem"}}>Instagram e TikTok copiam o link — cola na bio ou caption.</div>
                      </div>
                    )}
                    {/* ── SIMULADOR DE PREÇO ── */}
                    {pecaSimuladorAberta === p.id && (() => {
                      const precoAtual = p.preco_aluguer_dia || 0;
                      // rotação estimada por categoria
                      const rotCat = { vestidos:2.2, casacos:1.5, blazers:1.8, calcado:1.6, malas:2.0, acessorios:2.0 };
                      const catKey = (p.categoria||"").toLowerCase().replace(/\s/g,"");
                      const rotBase = Object.entries(rotCat).find(([k])=>catKey.includes(k))?.[1] || 1.8;
                      const simMeses = [6, 12, 24];
                      const simPrecos = [
                        Math.max(5, Math.round(precoAtual * 0.75 / 5) * 5),
                        precoAtual,
                        Math.round(precoAtual * 1.20 / 5) * 5,
                      ].filter((v,i,a) => a.indexOf(v)===i && v > 0);
                      return (
                        <div style={{padding:"1rem 1.5rem 1.25rem",background:"#f0f8fd",borderTop:"1px solid #c8e6f5"}}>
                          <div style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#4a9ec4",fontWeight:600,marginBottom:"0.75rem"}}>📊 {({pt:"Simulador de rendimento",fr:"Simulateur de revenus",lt:"Pajamų simuliatorius"})[lang]||"Simulador de rendimento"}</div>
                          {precoAtual === 0 ? (
                            <div style={{fontSize:"0.75rem",color:"var(--g4)"}}>{({pt:"Define um preço por dia para simular o rendimento.",fr:"Définissez un prix par jour pour simuler les revenus.",lt:"Nustatykite dienos kainą, kad galėtumėte simuliuoti pajamas."})[lang]||"Define um preço por dia para simular o rendimento."}</div>
                          ) : (
                            <>
                              <div style={{fontSize:"0.68rem",color:"var(--g4)",marginBottom:"0.75rem",lineHeight:1.5}}>
                                {({pt:"Rotação estimada para esta categoria:",fr:"Rotation estimée pour cette catégorie :",lt:"Numatoma šios kategorijos rotacija:"})[lang]||"Rotação estimada para esta categoria:"} <strong style={{color:"#4a9ec4"}}>{rotBase.toFixed(1)}×/{({pt:"mês",fr:"mois",lt:"mėn"})[lang]||"mês"}</strong> · {({pt:"baseado em benchmarks do sector",fr:"basé sur des benchmarks du secteur",lt:"remiantis sektoriaus etalonais"})[lang]||"baseado em benchmarks do sector"}
                              </div>
                              {/* tabela de simulação */}
                              <div style={{overflowX:"auto"}}>
                                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.72rem"}}>
                                  <thead>
                                    <tr style={{background:"#d8eef9"}}>
                                      <th style={{padding:"0.4rem 0.6rem",textAlign:"left",color:"#4a9ec4",fontWeight:600,letterSpacing:"0.08em",fontSize:"0.62rem",textTransform:"uppercase"}}>{({pt:"Preço/dia",fr:"Prix/jour",lt:"Kaina/dieną"})[lang]||"Preço/dia"}</th>
                                      {simMeses.map(m=>(
                                        <th key={m} style={{padding:"0.4rem 0.6rem",textAlign:"right",color:"#4a9ec4",fontWeight:600,letterSpacing:"0.08em",fontSize:"0.62rem",textTransform:"uppercase"}}>{m} {({pt:"meses",fr:"mois",lt:"mėn."})[lang]||"meses"}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {simPrecos.map((preco,idx) => {
                                      const isAtual = preco === precoAtual;
                                      return (
                                        <tr key={preco} style={{background:isAtual?"#e0f2fe":"#fff",borderBottom:"1px solid #c8e6f5"}}>
                                          <td style={{padding:"0.45rem 0.6rem",fontWeight:isAtual?600:400,color:isAtual?"#4a9ec4":"var(--fg)"}}>
                                            {preco}€{isAtual?` ← ${({pt:"atual",fr:"actuel",lt:"dabartinis"})[lang]||"atual"}`:""}
                                          </td>
                                          {simMeses.map(m=>{
                                            const alugueres = Math.round(rotBase * m);
                                            const bruto = preco * alugueres;
                                            const liquido = bruto * 0.90;
                                            return (
                                              <td key={m} style={{padding:"0.45rem 0.6rem",textAlign:"right",color:isAtual?"#4a9ec4":"var(--fg)",fontWeight:isAtual?600:400}}>
                                                {liquido.toFixed(0)}€
                                              </td>
                                            );
                                          })}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              <div style={{fontSize:"0.62rem",color:"#7ab5ce",marginTop:"0.5rem",lineHeight:1.45}}>
                                {({pt:"Valores líquidos após comissão Nora Grei (10%). Estimativas baseadas em rotação média da categoria — não garantidas.",fr:"Valeurs nettes après commission Nora Grei (10%). Estimations basées sur la rotation moyenne de la catégorie — non garanties.",lt:"Grynosios vertės po Nora Grei komisinio mokesčio (10%). Įvertinimai pagrįsti vidutine kategorijos rotacija — negarantuojama."})[lang]||"Valores líquidos após comissão Nora Grei (10%). Estimativas baseadas em rotação média da categoria — não garantidas."}
                              </div>
                              <button onClick={()=>{setEditarPeca({...p});setFotosEditar(p.fotos||[]);}}
                                style={{marginTop:"0.75rem",fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.85rem",background:"#4a9ec4",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontWeight:600}}>
                                {({pt:"Editar preço desta peça →",fr:"Modifier le prix de cette pièce →",lt:"Keisti šio daikto kainą →"})[lang]||"Editar preço desta peça →"}
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  );
                })}
              </div>
            )}
            {tabLoja === "alugueres" && (
              <div className="card" style={{padding:0}}>
                {alugueresLoja.length === 0 ? (
                  <p style={{padding:"2rem",textAlign:"center",fontSize:"0.85rem",color:"var(--g4)"}}>Ainda sem alugueres.</p>
                ) : alugueresLoja.map(a => {
                  const estadoCor = {pendente:"#f39c12",confirmado:"#2980b9",enviado:"#8e44ad",ativo:"#27ae60",em_devolucao:"#e67e22",devolvido:"var(--g4)",devolvido_danificado:"#e74c3c",cancelado:"var(--g4)"}[a.estado]||"var(--g4)";
                  const estadoLabel = {pendente:"Pendente",confirmado:"Confirmado",enviado:"Enviado",ativo:"Ativo",em_devolucao:"Em devolução",devolvido:"Devolvido",devolvido_danificado:"Danificado",cancelado:"Cancelado"}[a.estado]||a.estado;
                  return (
                  <div key={a.id} style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid var(--g1)"}}>
                    <div style={{display:"flex",gap:"1rem",alignItems:"flex-start"}}>
                      {a.pecas_lojista?.fotos?.[0] ? <img src={a.pecas_lojista.fotos[0]} style={{width:44,height:56,objectFit:"cover",flexShrink:0}} alt=""/> : <div style={{width:44,height:56,background:"var(--g1)",flexShrink:0}}/>}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"0.5rem",flexWrap:"wrap"}}>
                          <div style={{fontFamily:"var(--serif)",fontSize:"1rem"}}>{a.pecas_lojista?.nome||"—"}</div>
                          <span style={{fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.2rem 0.6rem",background:estadoCor,color:"#fff",whiteSpace:"nowrap"}}>{estadoLabel}</span>
                        </div>
                        <div style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.2rem"}}>
                          {a.clientes?.nome} · {a.stock_lojista?.tamanho||"—"} · {a.data_inicio} → {a.data_fim}
                        </div>
                        <div style={{fontSize:"0.82rem",fontFamily:"var(--serif)",color:"var(--rosa)",marginTop:"0.25rem"}}>
                          {(a.valor_aluguer||0).toFixed(2)}€ {a.deposito_valor ? `+ ${(a.deposito_valor||0).toFixed(2)}€ dep.` : ""}
                        </div>
                        {a.tracking_numero && (
                          <div style={{marginTop:"0.6rem",background:"#e3f2fd",borderLeft:"3px solid #1976d2",padding:"0.6rem 0.85rem"}}>
                            <div style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#1976d2",fontWeight:600,marginBottom:"0.3rem"}}>📦 Envio registado</div>
                            <div style={{display:"flex",gap:"0.5rem",alignItems:"center",flexWrap:"wrap"}}>
                              <span style={{fontSize:"0.7rem",color:"#3f3e3c"}}>{a.tracking_transportadora}</span>
                              <span style={{fontSize:"0.8rem",fontWeight:700,fontFamily:"monospace",color:"#080808",letterSpacing:"0.05em"}}>{a.tracking_numero}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Ações por estado */}
                    <div style={{display:"flex",gap:"0.5rem",marginTop:"0.85rem",flexWrap:"wrap"}}>
                      {a.estado === "pendente" && <>
                        <button onClick={()=>atualizarEstadoAluguer(a.id,"confirmado")} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"#27ae60",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)"}}>✓ Confirmar</button>
                        <button onClick={()=>atualizarEstadoAluguer(a.id,"cancelado")} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"none",border:"1.5px solid #e74c3c",color:"#e74c3c",cursor:"pointer",fontFamily:"var(--sans)"}}>✕ Recusar</button>
                      </>}
                      {a.estado === "confirmado" && <>
                        <button onClick={()=>{setModalEnvio(a);setTrackingInfo({transportadora:"",numero:""});}} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"#8e44ad",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)"}}>📦 Marcar enviado</button>
                        <button onClick={()=>setModalCancelarLojista(a)} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"none",border:"1.5px solid #e74c3c",color:"#e74c3c",cursor:"pointer",fontFamily:"var(--sans)"}}>⚠ Cancelar reserva</button>
                      </>}
                      {(a.estado === "enviado" || a.estado === "ativo") && <>
                        <button onClick={()=>atualizarEstadoAluguer(a.id,"em_devolucao")} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"#e67e22",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)"}}>↩ Devolução iniciada</button>
                        {a.clientes?.email && <a href={`mailto:${a.clientes.email}`} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"none",border:"1.5px solid var(--g2)",color:"var(--g4)",textDecoration:"none",fontFamily:"var(--sans)"}}>✉ Contactar</a>}
                        <button onClick={()=>setModalCancelarLojista(a)} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"none",border:"1.5px solid #e74c3c",color:"#e74c3c",cursor:"pointer",fontFamily:"var(--sans)"}}>⚠ Cancelar reserva</button>
                      </>}
                      {a.estado === "em_devolucao" && <>
                        <button onClick={()=>setModalVerificar(a)} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"var(--black)",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)"}}>🔍 Verificar peça</button>
                      </>}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
            {tabLoja === "liquidacoes" && (
              <div className="card" style={{padding:"1.5rem"}}>
                {/* RESUMO FINANCEIRO */}
                {(() => {
                  const aReceber = alugueresLoja.filter(a => a.estado === "devolvido" && !a.liquidado_em);
                  const recebido = alugueresLoja.filter(a => a.liquidado_em);
                  const totalAReceber = aReceber.reduce((s,a) => s + (a.valor_aluguer||0)*0.9, 0);
                  const totalRecebido = recebido.reduce((s,a) => s + (a.valor_liquidacao||0), 0);
                  const depositosDevolvidosCliente = alugueresLoja.filter(a => a.deposito_estado === "devolvido");
                  const depositosCativos = alugueresLoja.filter(a => ["em_disputa","retido_lojista"].includes(a.deposito_estado));
                  const depositosAtivos = alugueresLoja.filter(a => ["pendente","confirmado","enviado","ativo","em_devolucao"].includes(a.estado) && a.deposito_estado === "recebido");
                  return (
                    <>
                      {/* KPIs */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px",background:"var(--g2)",marginBottom:"1.5rem"}}>
                        {[
                          {val:`${totalAReceber.toFixed(2)}€`,lbl:"A receber",cor:"#c4748a",nota:"Peças devolvidas OK, pagamento pendente"},
                          {val:`${totalRecebido.toFixed(2)}€`,lbl:"Já recebido",cor:"#27ae60",nota:"Transferências processadas pela Nora Grei"},
                          {val:depositosAtivos.length,lbl:"Depósitos em curso",cor:"#f39c12",nota:"Alugueres ainda ativos"},
                          {val:depositosCativos.length,lbl:"Depósitos cativos",cor:"#e74c3c",nota:"Em disputa ou retidos por danos"},
                        ].map((k,i) => (
                          <div key={i} style={{background:"#fff",padding:"1rem"}}>
                            <div style={{fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.3rem"}}>{k.lbl}</div>
                            <div style={{fontFamily:"var(--serif)",fontSize:"1.8rem",fontWeight:300,color:k.cor,lineHeight:1}}>{k.val}</div>
                            <div style={{fontSize:"0.75rem",color:"#aaa",marginTop:"0.25rem"}}>{k.nota}</div>
                          </div>
                        ))}
                      </div>

                      {/* A RECEBER */}
                      {aReceber.length > 0 && (
                        <div style={{marginBottom:"1.5rem"}}>
                          <p style={{fontSize:"0.75rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#c4748a",fontWeight:600,marginBottom:"0.75rem",paddingBottom:"0.5rem",borderBottom:"1px solid var(--g1)"}}>A receber (nos próximos 10 dias úteis)</p>
                          {aReceber.map(a => (
                            <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.6rem 0",borderBottom:"1px solid var(--g1)",fontSize:"0.82rem"}}>
                              <div>
                                <span style={{fontWeight:500}}>{a.pecas_lojista?.nome||"—"}</span>
                                <span style={{color:"#aaa",marginLeft:"0.5rem",fontSize:"0.72rem"}}>· {a.clientes?.nome}</span>
                                {a.data_verificacao && <div style={{fontSize:"0.68rem",color:"#888"}}>Verificado em {fmtData(a.data_verificacao, lang)}</div>}
                              </div>
                              <span style={{color:"#c4748a",fontWeight:600}}>{((a.valor_aluguer||0)*0.9).toFixed(2)}€</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* JÁ RECEBIDO */}
                      {recebido.length > 0 && (
                        <div style={{marginBottom:"1.5rem"}}>
                          <p style={{fontSize:"0.75rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#27ae60",fontWeight:600,marginBottom:"0.75rem",paddingBottom:"0.5rem",borderBottom:"1px solid var(--g1)"}}>Já recebido</p>
                          {recebido.map(a => (
                            <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.6rem 0",borderBottom:"1px solid var(--g1)",fontSize:"0.82rem"}}>
                              <div>
                                <span style={{fontWeight:500}}>{a.pecas_lojista?.nome||"—"}</span>
                                <span style={{color:"#aaa",marginLeft:"0.5rem",fontSize:"0.72rem"}}>· {a.clientes?.nome}</span>
                                {a.liquidado_em && <div style={{fontSize:"0.68rem",color:"#888"}}>Pago em {fmtData(a.liquidado_em, lang)}</div>}
                              </div>
                              <span style={{color:"#27ae60",fontWeight:600}}>{(a.valor_liquidacao||0).toFixed(2)}€</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* DEPÓSITOS CATIVOS */}
                      {depositosCativos.length > 0 && (
                        <div style={{marginBottom:"1rem"}}>
                          <p style={{fontSize:"0.75rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#e74c3c",fontWeight:600,marginBottom:"0.75rem",paddingBottom:"0.5rem",borderBottom:"1px solid var(--g1)"}}>Depósitos cativos / em disputa</p>
                          {depositosCativos.map(a => (
                            <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.6rem 0",borderBottom:"1px solid var(--g1)",fontSize:"0.82rem",background:"#fff5f5",margin:"0 -0.5rem",padding:"0.6rem 0.5rem"}}>
                              <div>
                                <span style={{fontWeight:500}}>{a.pecas_lojista?.nome||"—"}</span>
                                <span style={{color:"#aaa",marginLeft:"0.5rem",fontSize:"0.72rem"}}>· {a.clientes?.nome}</span>
                                <div style={{fontSize:"0.68rem",color:"#e74c3c",marginTop:"0.1rem"}}>{a.deposito_estado==="em_disputa"?"Em análise pela Nora Grei":"Depósito retido — danos confirmados"}</div>
                              </div>
                              <span style={{display:"inline-block",fontSize:"0.68rem",letterSpacing:"0.1em",textTransform:"uppercase",padding:"0.2rem 0.5rem",fontWeight:600,background:"#fff5f5",color:"#e74c3c"}}>{a.deposito_estado}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {aReceber.length === 0 && recebido.length === 0 && depositosCativos.length === 0 && (
                        <p style={{color:"#aaa",fontSize:"0.85rem",textAlign:"center",padding:"2rem 0"}}>Ainda não há movimentos financeiros.</p>
                      )}

                      <p style={{fontSize:"0.68rem",color:"#aaa",marginTop:"1rem",lineHeight:1.6}}>Comissão Nora Grei: 10% sobre o valor de aluguer. Pagamentos processados até 10 dias úteis após verificação da peça.</p>
                    </>
                  );
                })()}
              </div>
            )}
            {tabLoja === "custos" && (() => {
              const METODO_LABEL = {
                cartao: "Cartão",
                saldo_alugueres: "Saldo alugueres",
                creditos_afiliado: "Créditos afiliado",
              };
              const METODO_COR = {
                cartao: "#c4748a",
                saldo_alugueres: "#27ae60",
                creditos_afiliado: "#c4a882",
              };

              // ── Dados para cada sub-tab ──────────────────────────────
              // 1. Ganhos de aluguer e venda (devolvidos)
              const ganhosList = alugueresLoja
                .filter(a => ["devolvido","devolvido_danificado"].includes(a.estado))
                .map(a => ({
                  id: a.id,
                  nome: a.pecas_lojista?.nome || "—",
                  data: a.data_fim || a.data_inicio,
                  valor: (a.valor_aluguer||0)*0.9,
                  tipo: a.tipo_transacao === "venda" ? "Venda" : "Aluguer",
                  liquidado: !!a.liquidado_em,
                }))
                .sort((a,b) => (b.data||"").localeCompare(a.data||""));
              const totalGanhos = ganhosList.reduce((s,g) => s+g.valor, 0);
              const totalPendente = ganhosList.filter(g=>!g.liquidado).reduce((s,g) => s+g.valor, 0);

              // 2. Ganhos de afiliado
              const afiliadosList = (creditosAfiliado.lista||[])
                .sort((a,b) => (b.created_at||"").localeCompare(a.created_at||""));
              const totalAfiliados = creditosAfiliado.total || 0;
              const totalAfiliadosDisp = creditosAfiliado.disponiveis || 0;

              // 3. Custos pagos de boosters
              const totalCustosPagos = pagamentosBooster.reduce((s,p) => s+p.valor, 0);

              // Sub-tabs header
              const SUB_TABS = [
                { id:"alugueres", label:"Ganhos Aluguer & Venda", cor:"#27ae60", tooltip: null },
                { id:"afiliado",  label:"Ganhos Afiliado",        cor:"#c4a882", tooltip:"Créditos que ganhas por promover outras lojas — via link ?ref= ou código pessoal. Não são alugueres teus; são comissões por trazer clientes à plataforma." },
                { id:"boosters",  label:"Custos Boosters",        cor:"#c4748a", tooltip:"Ferramentas pagas para dar destaque às tuas peças (visibilidade, notificações, link externo). Debitados imediatamente por cartão, saldo de alugueres ou créditos afiliado." },
              ];

              return (
                <div>
                  {/* Sub-tab nav */}
                  <div style={{display:"flex",gap:"1px",background:"var(--g2)",marginBottom:"1rem",overflowX:"auto"}}>
                    {SUB_TABS.map(t => (
                      <button key={t.id} onClick={() => setSubTabCustos(t.id)}
                        style={{flex:"1 0 auto",padding:"0.6rem 0.75rem",background:subTabCustos===t.id?"var(--bg)":"var(--g1)",border:"none",cursor:"pointer",fontSize:"0.7rem",letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:subTabCustos===t.id?700:400,color:subTabCustos===t.id?t.cor:"#aaa",borderBottom:subTabCustos===t.id?`2px solid ${t.cor}`:"2px solid transparent",whiteSpace:"nowrap",transition:"all 0.15s",display:"inline-flex",alignItems:"center",gap:"0.2rem"}}>
                        {t.label}{t.tooltip && <Tooltip texto={t.tooltip} />}
                      </button>
                    ))}
                  </div>

                  {/* ── SUB-TAB 1: Ganhos de aluguer e venda ── */}
                  {subTabCustos === "alugueres" && (
                    <div>
                      {/* Totais */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px",background:"var(--g2)",marginBottom:"1rem"}}>
                        {[
                          {val:`${totalGanhos.toFixed(2)}€`, lbl:"Total acumulado", cor:"#27ae60"},
                          {val:`${totalPendente.toFixed(2)}€`, lbl:"Pendente de liquidação", cor:"#b8860b", tooltip:"Valor que ainda não foi transferido para o teu IBAN. As liquidações são processadas até 10 dias úteis após a verificação da peça devolvida."},
                        ].map((k,i) => (
                          <div key={i} style={{background:"var(--bg)",padding:"1rem"}}>
                            <div style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.2rem",display:"inline-flex",alignItems:"center"}}>
                              {k.lbl}{k.tooltip && <Tooltip texto={k.tooltip} />}
                            </div>
                            <div style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:300,color:k.cor}}>{k.val}</div>
                          </div>
                        ))}
                      </div>
                      {/* Lista */}
                      <div className="card" style={{padding:"1.5rem"}}>
                        <p style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#27ae60",fontWeight:600,marginBottom:"1rem",paddingBottom:"0.5rem",borderBottom:"1px solid var(--g1)"}}>Histórico de ganhos</p>
                        {ganhosList.length === 0 ? (
                          <p style={{color:"#aaa",fontSize:"0.85rem",textAlign:"center",padding:"2rem 0"}}>Ainda não há alugueres ou vendas concluídos.</p>
                        ) : ganhosList.map(g => (
                          <div key={g.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.65rem 0",borderBottom:"1px solid var(--g1)"}}>
                            <div>
                              <div style={{fontSize:"0.85rem",fontWeight:500,marginBottom:"0.1rem"}}>{g.nome}</div>
                              <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                                <span style={{fontSize:"0.68rem",background:"var(--g1)",padding:"0.1rem 0.4rem",color:"#888"}}>{g.tipo}</span>
                                {g.data && <span style={{fontSize:"0.7rem",color:"#bbb"}}>{fmtData(g.data, lang)}</span>}
                                {g.liquidado
                                  ? <span style={{fontSize:"0.68rem",color:"#27ae60"}}>✓ Liquidado</span>
                                  : <span style={{fontSize:"0.68rem",color:"#b8860b"}}>Pendente</span>}
                              </div>
                            </div>
                            <span style={{fontFamily:"var(--serif)",fontSize:"1.1rem",fontWeight:300,color:"#27ae60",flexShrink:0,marginLeft:"1rem"}}>{g.valor.toFixed(2)}€</span>
                          </div>
                        ))}
                        <p style={{fontSize:"0.7rem",color:"#bbb",marginTop:"1rem",lineHeight:1.5}}>Valor líquido (90% do aluguer — 10% comissão Nora Grei). Liquidações até 10 dias úteis após verificação.</p>
                      </div>
                    </div>
                  )}

                  {/* ── SUB-TAB 2: Ganhos de afiliado ── */}
                  {subTabCustos === "afiliado" && (
                    <div>
                      {/* Totais */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px",background:"var(--g2)",marginBottom:"1rem"}}>
                        {[
                          {val:`${totalAfiliados.toFixed(2)}€`, lbl:"Total acumulado", cor:"#c4a882"},
                          {val:`${totalAfiliadosDisp.toFixed(2)}€`, lbl:"Disponível", cor:"#c4a882"},
                        ].map((k,i) => (
                          <div key={i} style={{background:"var(--bg)",padding:"1rem"}}>
                            <div style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.2rem"}}>{k.lbl}</div>
                            <div style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:300,color:k.cor}}>{k.val}</div>
                          </div>
                        ))}
                      </div>
                      {/* Lista */}
                      <div className="card" style={{padding:"1.5rem"}}>
                        <p style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#c4a882",fontWeight:600,marginBottom:"0.5rem",paddingBottom:"0.5rem",borderBottom:"1px solid var(--g1)"}}>Comissões recebidas</p>
                        <p style={{fontSize:"0.75rem",color:"#aaa",marginBottom:"1rem",lineHeight:1.5}}>Ganhos ao partilhar o teu link ou código com clientes de outras lojas na plataforma.</p>
                        {afiliadosList.length === 0 ? (
                          <div>
                            <NudgeBanner
                              id="nudge_afiliado"
                              icone="🔗"
                              titulo="Como ganhar créditos de afiliado"
                              descricao="Partilha o teu link pessoal (?ref=...) em qualquer peça da plataforma — nas redes sociais, em grupos ou com amigas. Quando alguém alugar via esse link, recebes uma comissão automática. Sem esforço extra."
                              ctaLabel="Copiar o meu link"
                              onCta={() => setShowReferralBanner(true)}
                            />
                            <p style={{color:"#aaa",fontSize:"0.85rem",textAlign:"center",padding:"1rem 0 2rem"}}>Ainda não há comissões de afiliado registadas.</p>
                          </div>
                        ) : afiliadosList.map(c => (
                          <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.65rem 0",borderBottom:"1px solid var(--g1)"}}>
                            <div>
                              <div style={{fontSize:"0.82rem",fontWeight:500,marginBottom:"0.1rem"}}>{c.descricao||"Comissão de afiliado"}</div>
                              <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                                <span style={{fontSize:"0.68rem",background:"var(--g1)",padding:"0.1rem 0.4rem",color:"#888"}}>{c.tipo==="link_ref"?"Link ref":"Código"}</span>
                                {c.created_at && <span style={{fontSize:"0.7rem",color:"#bbb"}}>{fmtData(c.created_at, lang)}</span>}
                                {c.usado
                                  ? <span style={{fontSize:"0.68rem",color:"#bbb"}}>Usado</span>
                                  : <span style={{fontSize:"0.68rem",color:"#c4a882"}}>Disponível</span>}
                              </div>
                            </div>
                            <span style={{fontFamily:"var(--serif)",fontSize:"1.1rem",fontWeight:300,color:c.usado?"#bbb":"#c4a882",flexShrink:0,marginLeft:"1rem"}}>{(c.valor||0).toFixed(2)}€</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── SUB-TAB 3: Custos de boosters pagos ── */}
                  {subTabCustos === "boosters" && (
                    <div>
                      {/* Totais + boosters activos */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px",background:"var(--g2)",marginBottom:"1rem"}}>
                        {[
                          {val:`${totalCustosPagos.toFixed(2)}€`, lbl:"Total pago", cor:"#c4748a"},
                          {val:`${boostersLoja.length}`, lbl:"Ferramentas activas", cor:"#c4748a"},
                        ].map((k,i) => (
                          <div key={i} style={{background:"var(--bg)",padding:"1rem"}}>
                            <div style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.2rem"}}>{k.lbl}</div>
                            <div style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:300,color:k.cor}}>{k.val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Nudge se ainda não tem boosters */}
                      {boostersLoja.length === 0 && (
                        <NudgeBanner
                          id="nudge_boosters"
                          icone="🚀"
                          titulo="Dá mais visibilidade às tuas peças"
                          descricao="Os Boosters colocam as tuas peças em destaque na listagem e enviam notificações a clientes que já as viram. Úteis quando há mais concorrência na mesma categoria. Podes activar por semana, sem compromisso."
                          ctaLabel="Ver boosters disponíveis"
                          onCta={() => setTabLoja("pecas")}
                        />
                      )}

                      {/* Ferramentas activas actualmente */}
                      {boostersLoja.length > 0 && (
                        <div className="card" style={{padding:"1.5rem",marginBottom:"1rem"}}>
                          <p style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#c4748a",fontWeight:600,marginBottom:"1rem",paddingBottom:"0.5rem",borderBottom:"1px solid var(--g1)"}}>Ferramentas activas</p>
                          {boostersLoja.map(b => (
                            <div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.65rem 0",borderBottom:"1px solid var(--g1)"}}>
                              <div>
                                <div style={{fontSize:"0.85rem",fontWeight:500,marginBottom:"0.1rem"}}>{b.booster_tipos?.nome||b.booster_id}</div>
                                <div style={{fontSize:"0.72rem",color:"#aaa"}}>{b.booster_tipos?.descricao||""}</div>
                                {b.inicio_em && <div style={{fontSize:"0.68rem",color:"#bbb",marginTop:"0.1rem"}}>Desde {fmtData(b.inicio_em, lang)}</div>}
                              </div>
                              <div style={{textAlign:"right",flexShrink:0,marginLeft:"1rem"}}>
                                <div style={{fontWeight:600,color:"#c4748a",fontSize:"0.92rem"}}>{(b.preco_semana||0).toFixed(2)}€<span style={{fontSize:"0.68rem",color:"#aaa",fontWeight:400}}>/sem</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Histórico de pagamentos */}
                      <div className="card" style={{padding:"1.5rem"}}>
                        <p style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#888",fontWeight:600,marginBottom:"1rem",paddingBottom:"0.5rem",borderBottom:"1px solid var(--g1)"}}>Histórico de pagamentos</p>
                        {pagamentosBooster.length === 0 ? (
                          <p style={{color:"#aaa",fontSize:"0.85rem",textAlign:"center",padding:"2rem 0"}}>Ainda não há pagamentos de boosters registados.</p>
                        ) : pagamentosBooster.map(p => (
                          <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.65rem 0",borderBottom:"1px solid var(--g1)"}}>
                            <div>
                              <div style={{fontSize:"0.85rem",fontWeight:500,marginBottom:"0.1rem"}}>{p.booster_nome}</div>
                              <div style={{display:"flex",gap:"0.5rem",alignItems:"center",flexWrap:"wrap"}}>
                                <span style={{fontSize:"0.68rem",padding:"0.1rem 0.5rem",background:METODO_COR[p.metodo]||"#888",color:"#fff",fontWeight:600}}>
                                  {METODO_LABEL[p.metodo]||p.metodo}
                                </span>
                                {p.created_at && <span style={{fontSize:"0.7rem",color:"#bbb"}}>{fmtData(p.created_at, lang)}</span>}
                                {p.periodo_inicio && p.periodo_fim && (
                                  <span style={{fontSize:"0.68rem",color:"#bbb"}}>{fmtData(p.periodo_inicio, lang)} – {fmtData(p.periodo_fim, lang)}</span>
                                )}
                              </div>
                              {p.descricao && <div style={{fontSize:"0.72rem",color:"#aaa",marginTop:"0.1rem"}}>{p.descricao}</div>}
                            </div>
                            <span style={{fontFamily:"var(--serif)",fontSize:"1.1rem",fontWeight:300,color:"#c4748a",flexShrink:0,marginLeft:"1rem"}}>–{(p.valor||0).toFixed(2)}€</span>
                          </div>
                        ))}
                        {pagamentosBooster.length > 0 && (
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:"0.75rem",marginTop:"0.25rem",borderTop:"2px solid var(--g2)"}}>
                            <span style={{fontSize:"0.75rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#888"}}>Total pago</span>
                            <span style={{fontFamily:"var(--serif)",fontSize:"1.3rem",fontWeight:300,color:"#c4748a"}}>–{totalCustosPagos.toFixed(2)}€</span>
                          </div>
                        )}
                        <p style={{fontSize:"0.7rem",color:"#bbb",marginTop:"0.75rem",lineHeight:1.5}}>Débito imediato por cartão, saldo de alugueres ou créditos de afiliado. Para cancelar ferramentas, contacta o suporte.</p>
                      </div>

                      {/* Catálogo disponível */}
                      {tiposBoosters.length > 0 && (
                        <div className="card" style={{padding:"1.5rem",marginTop:"1rem"}}>
                          <p style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#888",fontWeight:600,marginBottom:"1rem",paddingBottom:"0.5rem",borderBottom:"1px solid var(--g1)"}}>Ferramentas disponíveis</p>
                          {tiposBoosters.map(t => {
                            const jaActivo = boostersLoja.some(b => b.booster_id === t.id);
                            return (
                              <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.65rem 0",borderBottom:"1px solid var(--g1)"}}>
                                <div>
                                  <div style={{fontSize:"0.85rem",fontWeight:500,marginBottom:"0.1rem"}}>{t.nome}</div>
                                  <div style={{fontSize:"0.72rem",color:"#aaa"}}>{t.descricao}</div>
                                </div>
                                <div style={{textAlign:"right",flexShrink:0,marginLeft:"1rem"}}>
                                  <div style={{fontWeight:600,color:jaActivo?"#27ae60":"var(--g6)",fontSize:"0.85rem"}}>{(t.preco_semana||0).toFixed(2)}€/sem</div>
                                  {jaActivo ? <div style={{fontSize:"0.68rem",color:"#27ae60"}}>✓ Activo</div> : <div style={{fontSize:"0.68rem",color:"#bbb"}}>Contacta o suporte</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {tabLoja === "avaliacoes" && (
              <div className="card" style={{padding:"1.5rem"}}>
                <AvaliacoesLojista alugueresLoja={alugueresLoja} clienteId={clienteData?.id} />
              </div>
            )}
            {tabLoja === "higienizacao" && (() => {
              const TODAS = [
                "Vestidos","Saias","Calças","Blusas","Casacos","Fatos","Macacões","Conjuntos","Camisas","Kaftans",
                "Malas","Anéis","Colares","Pulseiras","Cachecóis","Chapéus","Cintos","Óculos","Luvas","Acessórios",
                "Relógios","Saltos","Sandálias","Botas","Sapatilhas","Calçado"
              ];
              const salvarHigienizacao = async () => {
                setHigienizacaoSaving(true);
                const upserts = TODAS.map(cat => ({
                  lojista_id: user.id,
                  categoria: cat,
                  valor: parseFloat(higienizacaoLojista[cat]) || parseFloat(higienizacaoPadrao[cat]) || 0,
                  updated_at: new Date().toISOString(),
                }));
                await supabase.from("higienizacao_lojista").upsert(upserts, { onConflict: "lojista_id,categoria" });
                setHigienizacaoSaving(false);
                setHigienizacaoOk(true);
                setTimeout(() => setHigienizacaoOk(false), 2500);
              };
              return (
                <div className="card" style={{padding:"1.5rem"}}>
                  <p style={{fontSize:"0.62rem",letterSpacing:"0.25em",textTransform:"uppercase",color:"#c4748a",marginBottom:"0.4rem"}}>Parceria com lavandaria</p>
                  <h3 style={{fontFamily:"var(--serif)",fontSize:"1.4rem",fontWeight:300,marginBottom:"0.5rem"}}>Tabela de higienização</h3>
                  <p style={{fontSize:"0.82rem",color:"var(--g4)",lineHeight:1.6,marginBottom:"1.5rem"}}>
                    Define o preço que a tua lavandaria parceira cobra por cada tipo de peça. Os valores aparecem no checkout e o cliente pode optar por tratar da higienização ele próprio.
                    Os valores em cinzento são os padrões da plataforma — podes ajustar.
                  </p>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"1.5rem"}}>
                    {TODAS.map(cat => {
                      const val = higienizacaoLojista[cat] !== undefined ? higienizacaoLojista[cat] : higienizacaoPadrao[cat] ?? "";
                      const isPadrao = higienizacaoLojista[cat] === undefined;
                      return (
                        <div key={cat} style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.5rem 0.75rem",background:isPadrao?"#fafafa":"#fff",border:`1px solid ${isPadrao?"var(--g2)":"#c4748a33"}`}}>
                          <span style={{flex:1,fontSize:"0.8rem",fontFamily:"var(--sans)"}}>{cat}</span>
                          <div style={{display:"flex",alignItems:"center",gap:"0.2rem"}}>
                            <input
                              type="number" min="0" step="0.5"
                              value={val}
                              onChange={e => setHigienizacaoLojista(prev => ({ ...prev, [cat]: e.target.value }))}
                              style={{width:54,border:"1px solid var(--g2)",padding:"0.25rem 0.4rem",fontSize:"0.82rem",fontFamily:"var(--sans)",textAlign:"right",background:"transparent",outline:"none"}}
                            />
                            <span style={{fontSize:"0.72rem",color:"var(--g4)"}}>€</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={salvarHigienizacao}
                    disabled={higienizacaoSaving}
                    style={{padding:"0.85rem 2rem",background:"#080808",color:"#f8f7f5",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.7rem",letterSpacing:"0.18em",textTransform:"uppercase"}}
                  >
                    {higienizacaoSaving ? "A guardar..." : higienizacaoOk ? "✓ Guardado" : "Guardar tabela"}
                  </button>
                </div>
              );
            })()}
            {tabLoja === "gerir" && (
              <div style={{padding:"1.5rem 0"}}>
                <h3 style={{fontFamily:"var(--serif)",fontSize:"1.3rem",fontWeight:300,marginBottom:"1.5rem"}}>Gerir loja</h3>

                {/* Suspender loja */}
                {lojaEstado !== "suspenso" && (
                  <div style={{padding:"1.25rem",border:"1.5px solid var(--g2)",marginBottom:"1rem"}}>
                    <div style={{fontFamily:"var(--sans)",fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,marginBottom:"0.4rem"}}>⏸ Suspender loja temporariamente</div>
                    <p style={{fontSize:"0.82rem",color:"var(--g4)",marginBottom:"0.75rem",lineHeight:1.5}}>A tua loja deixa de aparecer publicamente. As tuas peças ficam guardadas e podes reactivar quando quiseres, sem nova candidatura.</p>
                    <button
                      disabled={gerirLojaLoading==="suspender"}
                      onClick={async()=>{
                        setGerirLojaLoading("suspender");
                        await supabase.from("clientes").update({ modo_lojista: false, candidatura_lojista: "suspensa" }).eq("id", (await supabase.auth.getSession()).data.session.user.id);
                        setModoLojista(false);
                        setLojaEstado("suspenso");
                        setCandidaturaLojista("suspensa");
                        setGerirLojaLoading("");
                      }}
                      style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",padding:"0.55rem 1rem",background:"#f39c12",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontWeight:600}}
                    >{gerirLojaLoading==="suspender"?"...":"Suspender loja"}</button>
                  </div>
                )}

                {/* Reactivar loja (só visível se suspensa) */}
                {lojaEstado === "suspenso" && (
                  <div style={{padding:"1.25rem",border:"1.5px solid #b8dbb8",background:"#f0f7f0",marginBottom:"1rem"}}>
                    <div style={{fontFamily:"var(--sans)",fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,color:"#2e7d32",marginBottom:"0.4rem"}}>▶ Loja suspensa — reactivar</div>
                    <p style={{fontSize:"0.82rem",color:"var(--g4)",marginBottom:"0.75rem",lineHeight:1.5}}>A tua loja está temporariamente suspensa. Clica para voltar a aparecer publicamente com todas as tuas peças.</p>
                    <button
                      disabled={gerirLojaLoading==="reativar"}
                      onClick={async()=>{
                        setGerirLojaLoading("reativar");
                        await supabase.from("clientes").update({ modo_lojista: true, candidatura_lojista: "aprovada" }).eq("id", (await supabase.auth.getSession()).data.session.user.id);
                        setModoLojista(true);
                        setLojaEstado("teste");
                        setCandidaturaLojista("aprovada");
                        setGerirLojaLoading("");
                      }}
                      style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",padding:"0.55rem 1rem",background:"#27ae60",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontWeight:600}}
                    >{gerirLojaLoading==="reativar"?"...":"Reactivar loja"}</button>
                  </div>
                )}

                {/* Eliminar loja definitivamente */}
                <div style={{padding:"1.25rem",border:"1.5px solid #f5c6c6",background:"#fff5f5",marginTop:"1rem"}}>
                  <div style={{fontFamily:"var(--sans)",fontSize:"0.72rem",letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,color:"#c0392b",marginBottom:"0.4rem"}}>✕ Eliminar loja definitivamente</div>
                  <p style={{fontSize:"0.82rem",color:"var(--g4)",marginBottom:"0.5rem",lineHeight:1.5}}>Elimina todas as tuas peças e stock. <strong>Esta acção é irreversível.</strong></p>
                  <p style={{fontSize:"0.78rem",color:"#888",marginBottom:"0.75rem",lineHeight:1.5}}>O histórico financeiro (vendas, alugueres, transferências) é mantido por razões legais e de controlo interno.</p>
                  {!confirmarEliminar ? (
                    <button onClick={()=>setConfirmarEliminar(true)} style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",padding:"0.55rem 1rem",background:"none",color:"#c0392b",border:"1.5px solid #e74c3c",cursor:"pointer",fontFamily:"var(--sans)",fontWeight:600}}>Eliminar loja</button>
                  ) : (
                    <div style={{background:"#fff",border:"1.5px solid #e74c3c",padding:"1rem",marginTop:"0.5rem"}}>
                      <p style={{fontSize:"0.82rem",color:"#c0392b",fontWeight:600,marginBottom:"0.75rem"}}>⚠ Tens a certeza? Esta acção não pode ser desfeita.</p>
                      <div style={{display:"flex",gap:"0.5rem"}}>
                        <button
                          disabled={gerirLojaLoading==="eliminar"}
                          onClick={async()=>{
                            setGerirLojaLoading("eliminar");
                            const { data: { session } } = await supabase.auth.getSession();
                            const uid = session.user.id;
                            // 1. apagar stock
                            const { data: ps } = await supabase.from("pecas_lojista").select("id").eq("cliente_id", uid);
                            if (ps && ps.length > 0) {
                              const ids = ps.map(p => p.id);
                              await supabase.from("stock_lojista").delete().in("peca_id", ids);
                              await supabase.from("pecas_lojista").delete().in("id", ids);
                            }
                            // 2. desactivar modo lojista (mantém histórico financeiro)
                            await supabase.from("clientes").update({
                              modo_lojista: false,
                              candidatura_lojista: "eliminada",
                              lojista_iban: null,
                            }).eq("id", uid);
                            setModoLojista(false);
                            setPecasLoja([]);
                            setAlugueresLoja([]);
                            setCandidaturaLojista("eliminada");
                            setGerirLojaLoading("");
                            setConfirmarEliminar(false);
                            setTabLoja("dashboard");
                          }}
                          style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",padding:"0.55rem 1rem",background:"#e74c3c",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontWeight:600}}
                        >{gerirLojaLoading==="eliminar"?"...":"Confirmar eliminação"}</button>
                        <button onClick={()=>setConfirmarEliminar(false)} style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",padding:"0.55rem 0.85rem",background:"none",border:"1.5px solid var(--g2)",cursor:"pointer",fontFamily:"var(--sans)"}}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tabLoja === "estatisticas" && (
              <div>
                {(() => {
                  const concluidos = alugueresLoja.filter(a => !["cancelado","pendente"].includes(a.estado));
                  // Receita por mês (últimos 6 meses)
                  const agora = new Date();
                  const meses = Array.from({length:6}, (_,i) => {
                    const d = new Date(agora.getFullYear(), agora.getMonth()-i, 1);
                    return { key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`, label: fmtData(d, lang, {month:"short",year:"numeric"}) };
                  }).reverse();
                  const receitaMes = meses.map(m => ({
                    ...m,
                    val: concluidos.filter(a => (a.data_inicio||"").startsWith(m.key)).reduce((s,a)=>s+(a.valor_aluguer||0)*0.9,0)
                  }));
                  const maxReceita = Math.max(...receitaMes.map(m=>m.val), 1);
                  // Pareto por peça
                  const receitaPorPeca = {};
                  const alugsPorPeca = {};
                  concluidos.forEach(a => {
                    const nome = a.pecas_lojista?.nome || "Sem nome";
                    const id = a.peca_lojista_id || nome;
                    receitaPorPeca[id] = (receitaPorPeca[id]||0) + (a.valor_aluguer||0)*0.9;
                    alugsPorPeca[id] = (alugsPorPeca[id]||{nome, total:0, alugs:0});
                    alugsPorPeca[id].nome = nome;
                    alugsPorPeca[id].total = receitaPorPeca[id];
                    alugsPorPeca[id].alugs = (alugsPorPeca[id].alugs||0)+1;
                  });
                  const rankPecas = Object.values(alugsPorPeca).sort((a,b)=>b.total-a.total);
                  const totalGeral = rankPecas.reduce((s,p)=>s+p.total,0)||1;
                  // Breakeven por peça
                  const diasMedios = 3;
                  const pecasComBreak = pecasLoja.map(p => {
                    const id = p.id;
                    const alugsFeitos = alugsPorPeca[id]?.alugs||0;
                    const receitaGerada = (alugsPorPeca[id]?.total||0)/0.9; // bruto
                    const valorPeca = p.valor_peca||0;
                    const precoDia = p.preco_aluguer_dia||0;
                    const receitaNecessaria = valorPeca;
                    const pct = valorPeca>0 ? Math.min(100, Math.round(receitaGerada/valorPeca*100)) : 0;
                    const alugsNecessarios = precoDia>0 ? Math.ceil((valorPeca - receitaGerada)/(precoDia*diasMedios)) : null;
                    return { ...p, alugsFeitos, receitaGerada, pct, alugsNecessarios };
                  }).sort((a,b)=>b.pct-a.pct);

                  return (<>
                    {/* Receita por mês */}
                    <div className="card" style={{padding:"1.5rem",marginBottom:"1rem"}}>
                      <p style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#888",fontWeight:600,marginBottom:"1.25rem"}}>Receita líquida — últimos 6 meses</p>
                      <div style={{display:"flex",alignItems:"flex-end",gap:"0.5rem",height:120}}>
                        {receitaMes.map(m=>(
                          <div key={m.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem"}}>
                            <div style={{fontSize:"0.75rem",color:"#c4748a",fontWeight:600}}>{m.val>0?`${m.val.toFixed(0)}€`:""}</div>
                            <div style={{width:"100%",background:"#c4748a",height:`${Math.round((m.val/maxReceita)*80)+4}px`,minHeight:4,transition:"height 0.3s"}}/>
                            <div style={{fontSize:"0.68rem",color:"#aaa",textAlign:"center",letterSpacing:"0.05em"}}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Breakeven por peça */}
                    <div className="card" style={{padding:"1.5rem",marginBottom:"1rem"}}>
                      <p style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#888",fontWeight:600,marginBottom:"1.25rem"}}>Breakeven por peça</p>
                      {pecasComBreak.length===0 && <p style={{color:"#aaa",fontSize:"0.85rem"}}>Sem peças ainda.</p>}
                      {pecasComBreak.map(p=>(
                        <div key={p.id} style={{marginBottom:"1.25rem"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.35rem",gap:"0.5rem",flexWrap:"wrap"}}>
                            <span style={{fontFamily:"var(--serif)",fontSize:"0.95rem"}}>{p.nome}</span>
                            <span style={{fontSize:"0.68rem",color:p.pct>=100?"#27ae60":"#c4748a",fontWeight:600}}>
                              {p.pct>=100 ? "✓ Breakeven atingido" : p.alugsNecessarios ? `~${p.alugsNecessarios} alug. para breakeven` : "—"}
                            </span>
                          </div>
                          <div style={{height:8,background:"#f0eeeb",borderRadius:0,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${p.pct}%`,background:p.pct>=100?"#27ae60":"#c4748a",transition:"width 0.4s"}}/>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.25rem"}}>
                            <span style={{fontSize:"0.75rem",color:"#aaa"}}>{p.receitaGerada.toFixed(0)}€ gerados</span>
                            <span style={{fontSize:"0.75rem",color:"#aaa"}}>{p.valor_peca?`objetivo ${p.valor_peca}€`:"valor peça não definido"}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pareto */}
                    {rankPecas.length>0 && (
                      <div className="card" style={{padding:"1.5rem"}}>
                        <p style={{fontSize:"0.72rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#888",fontWeight:600,marginBottom:"1.25rem"}}>Pareto — top peças por receita</p>
                        {rankPecas.map((p,i)=>{
                          const pctAcum = rankPecas.slice(0,i+1).reduce((s,x)=>s+x.total,0)/totalGeral*100;
                          return (
                            <div key={i} style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"}}>
                              <span style={{fontSize:"0.72rem",fontWeight:700,color:i<3?"#c4748a":"#aaa",width:16,flexShrink:0}}>#{i+1}</span>
                              <div style={{flex:1}}>
                                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.2rem"}}>
                                  <span style={{fontSize:"0.82rem",fontFamily:"var(--serif)"}}>{p.nome}</span>
                                  <span style={{fontSize:"0.75rem",fontWeight:600,color:"#c4748a"}}>{p.total.toFixed(0)}€</span>
                                </div>
                                <div style={{height:5,background:"#f0eeeb"}}>
                                  <div style={{height:"100%",width:`${p.total/totalGeral*100}%`,background:i<3?"#c4748a":"#d4c4ca"}}/>
                                </div>
                              </div>
                              <span style={{fontSize:"0.72rem",color:"#aaa",width:36,flexShrink:0,textAlign:"right"}}>{p.alugs}x</span>
                            </div>
                          );
                        })}
                        <p style={{fontSize:"0.75rem",color:"#aaa",marginTop:"1rem",borderTop:"1px solid var(--g1)",paddingTop:"0.75rem"}}>
                          {rankPecas.length>=3 ? `As top 3 peças geram ${(rankPecas.slice(0,3).reduce((s,p)=>s+p.total,0)/totalGeral*100).toFixed(0)}% da receita total.` : ""}
                        </p>
                      </div>
                    )}
                  </>);
                })()}
              </div>
            )}

            {tabLoja === "suporte" && (() => {
              const carregarTickets = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { data } = await supabase.from("tickets_lojista").select("*").eq("lojista_id", user.id).order("created_at", { ascending: false });
                if (data) setTickets(data);
              };
              const abrirTicket = async (tk) => {
                setTicketAtivo(tk);
                const { data } = await supabase.from("tickets_mensagens").select("*").eq("ticket_id", tk.id).order("created_at", { ascending: true });
                if (data) setTicketMsgs(data);
              };
              const criarNovoTicket = async () => {
                if (!tkAssunto.trim() || !tkMensagem.trim()) return;
                setTkEnviando(true);
                const { data: { user } } = await supabase.auth.getUser();
                const { data: tk } = await supabase.from("tickets_lojista").insert({ lojista_id: user.id, assunto: tkAssunto, categoria: tkCategoria, prioridade: tkPrioridade, estado: "aberto" }).select().single();
                if (tk) {
                  await supabase.from("tickets_mensagens").insert({ ticket_id: tk.id, remetente_id: user.id, texto: tkMensagem, is_admin: false });
                  setTkAssunto(""); setTkCategoria("outro"); setTkPrioridade("normal"); setTkMensagem("");
                  setNovoTicketAberto(false);
                  await carregarTickets();
                }
                setTkEnviando(false);
              };
              const enviarResposta = async () => {
                if (!tkResposta.trim() || !ticketAtivo) return;
                setTkEnviando(true);
                const { data: { user } } = await supabase.auth.getUser();
                await supabase.from("tickets_mensagens").insert({ ticket_id: ticketAtivo.id, remetente_id: user.id, texto: tkResposta, is_admin: false });
                await supabase.from("tickets_lojista").update({ updated_at: new Date().toISOString(), estado: ticketAtivo.estado === "fechado" ? "aberto" : ticketAtivo.estado }).eq("id", ticketAtivo.id);
                setTkResposta("");
                const { data } = await supabase.from("tickets_mensagens").select("*").eq("ticket_id", ticketAtivo.id).order("created_at", { ascending: true });
                if (data) setTicketMsgs(data);
                setTkEnviando(false);
              };
              if (tickets.length === 0 && !novoTicketAberto) carregarTickets();
              const PRIO_COR = { urgente: "#e74c3c", normal: "#f39c12", baixa: "#3498db" };
              const PRIO_LABEL = { urgente: i.prioUrgente, normal: i.prioNormal, baixa: i.prioBaixa };
              const EST_LABEL = { aberto: i.ticketAberto, em_curso: i.ticketEmCurso, fechado: i.ticketFechado };
              const EST_COR = { aberto: "#e74c3c", em_curso: "#f39c12", fechado: "#27ae60" };
              const CAT_LABEL = { bug: i.catBug, pagamento: i.catPagamento, conta: i.catConta, stock: i.catStock, envios: i.catEnvios, outro: i.catOutro };
              return (
                <div style={{padding:"0 0 3rem"}}>
                  {ticketAtivo ? (
                    <div>
                      <button onClick={() => { setTicketAtivo(null); setTicketMsgs([]); }} style={{background:"none",border:"none",cursor:"pointer",fontSize:"0.78rem",color:"#5a5855",fontFamily:"var(--sans)",letterSpacing:"0.05em",padding:"0 0 1rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>← Todos os tickets</button>
                      <div className="card" style={{padding:"1.25rem 1.5rem",marginBottom:"1rem"}}>
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"0.75rem",flexWrap:"wrap"}}>
                          <div>
                            <p style={{fontFamily:"var(--serif)",fontSize:"1.05rem",margin:"0 0 0.3rem"}}>{ticketAtivo.assunto}</p>
                            <p style={{fontSize:"0.72rem",color:"#888",margin:0,letterSpacing:"0.05em"}}>{ticketAtivo.referencia} · {CAT_LABEL[ticketAtivo.categoria]}</p>
                          </div>
                          <div style={{display:"flex",gap:"0.4rem",flexShrink:0}}>
                            <span style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",background:PRIO_COR[ticketAtivo.prioridade]+"22",color:PRIO_COR[ticketAtivo.prioridade],padding:"0.2rem 0.5rem",borderRadius:3,fontFamily:"var(--sans)"}}>{PRIO_LABEL[ticketAtivo.prioridade]}</span>
                            <span style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",background:EST_COR[ticketAtivo.estado]+"22",color:EST_COR[ticketAtivo.estado],padding:"0.2rem 0.5rem",borderRadius:3,fontFamily:"var(--sans)"}}>{EST_LABEL[ticketAtivo.estado]}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1rem"}}>
                        {ticketMsgs.map(m => (
                          <div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:m.is_admin?"flex-start":"flex-end"}}>
                            <div style={{maxWidth:"80%",background:m.is_admin?"#f0ece6":"#1a1816",color:m.is_admin?"#1a1816":"#f8f7f5",padding:"0.75rem 1rem",borderRadius:m.is_admin?"0 8px 8px 8px":"8px 0 8px 8px",fontSize:"0.85rem",lineHeight:1.5}}>
                              {m.texto}
                            </div>
                            <span style={{fontSize:"0.65rem",color:"#aaa",marginTop:"0.2rem"}}>{m.is_admin ? i.respostaAdmin : i.respostaLojista} · {new Date(m.created_at).toLocaleDateString(lang==="pt"?"pt-PT":lang==="fr"?"fr-FR":"lt-LT",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                          </div>
                        ))}
                      </div>
                      {ticketAtivo.estado !== "fechado" && (
                        <div style={{display:"flex",gap:"0.5rem"}}>
                          <textarea value={tkResposta} onChange={e=>setTkResposta(e.target.value)} placeholder={i.ticketMensagem} rows={3} style={{flex:1,padding:"0.75rem",border:"1px solid #ddd",borderRadius:4,fontFamily:"var(--sans)",fontSize:"0.85rem",resize:"vertical"}}/>
                          <button onClick={enviarResposta} disabled={tkEnviando||!tkResposta.trim()} style={{padding:"0.75rem 1rem",background:"#1a1816",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",alignSelf:"flex-end",opacity:tkEnviando||!tkResposta.trim()?0.5:1}}>{i.enviarResposta}</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
                        <p style={{fontFamily:"var(--serif)",fontSize:"1.1rem",margin:0}}>{i.tabSuporte}</p>
                        <button onClick={() => setNovoTicketAberto(v=>!v)} style={{padding:"0.5rem 1rem",background:"#1a1816",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase"}}>{i.novoTicket}</button>
                      </div>
                      {novoTicketAberto && (
                        <div className="card" style={{padding:"1.5rem",marginBottom:"1.25rem"}}>
                          <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
                            <div>
                              <label style={{fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#888",fontFamily:"var(--sans)",display:"block",marginBottom:"0.3rem"}}>{i.ticketAssunto}</label>
                              <input value={tkAssunto} onChange={e=>setTkAssunto(e.target.value)} placeholder="Ex: Erro ao publicar peça" style={{width:"100%",padding:"0.6rem 0.75rem",border:"1px solid #ddd",borderRadius:4,fontFamily:"var(--sans)",fontSize:"0.85rem",boxSizing:"border-box"}}/>
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
                              <div>
                                <label style={{fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#888",fontFamily:"var(--sans)",display:"block",marginBottom:"0.3rem"}}>{i.ticketCategoria}</label>
                                <select value={tkCategoria} onChange={e=>setTkCategoria(e.target.value)} style={{width:"100%",padding:"0.6rem 0.75rem",border:"1px solid #ddd",borderRadius:4,fontFamily:"var(--sans)",fontSize:"0.85rem",boxSizing:"border-box"}}>
                                  {[["bug",i.catBug],["pagamento",i.catPagamento],["conta",i.catConta],["stock",i.catStock],["envios",i.catEnvios],["outro",i.catOutro]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                                </select>
                              </div>
                              <div>
                                <label style={{fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#888",fontFamily:"var(--sans)",display:"block",marginBottom:"0.3rem"}}>{i.ticketPrioridade}</label>
                                <select value={tkPrioridade} onChange={e=>setTkPrioridade(e.target.value)} style={{width:"100%",padding:"0.6rem 0.75rem",border:"1px solid #ddd",borderRadius:4,fontFamily:"var(--sans)",fontSize:"0.85rem",boxSizing:"border-box"}}>
                                  <option value="urgente">🔴 {i.prioUrgente}</option>
                                  <option value="normal">🟡 {i.prioNormal}</option>
                                  <option value="baixa">🔵 {i.prioBaixa}</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label style={{fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#888",fontFamily:"var(--sans)",display:"block",marginBottom:"0.3rem"}}>{i.ticketMensagem}</label>
                              <textarea value={tkMensagem} onChange={e=>setTkMensagem(e.target.value)} rows={4} style={{width:"100%",padding:"0.6rem 0.75rem",border:"1px solid #ddd",borderRadius:4,fontFamily:"var(--sans)",fontSize:"0.85rem",resize:"vertical",boxSizing:"border-box"}}/>
                            </div>
                            <div style={{display:"flex",gap:"0.5rem",justifyContent:"flex-end"}}>
                              <button onClick={()=>setNovoTicketAberto(false)} style={{padding:"0.5rem 1rem",background:"none",border:"1px solid #ddd",borderRadius:4,cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#5a5855"}}>Cancelar</button>
                              <button onClick={criarNovoTicket} disabled={tkEnviando||!tkAssunto.trim()||!tkMensagem.trim()} style={{padding:"0.5rem 1rem",background:"#c4748a",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",opacity:tkEnviando||!tkAssunto.trim()||!tkMensagem.trim()?0.5:1}}>{tkEnviando?"…":i.criarTicket}</button>
                            </div>
                          </div>
                        </div>
                      )}
                      {tickets.length === 0 ? (
                        <div style={{textAlign:"center",padding:"3rem 1rem",color:"#9c9894"}}>
                          <p style={{fontSize:"0.85rem"}}>{i.semTickets}</p>
                        </div>
                      ) : (
                        <div className="card" style={{padding:0,overflow:"hidden"}}>
                          {tickets.map((tk,idx) => (
                            <div key={tk.id} onClick={()=>abrirTicket(tk)} style={{padding:"1rem 1.5rem",borderBottom:idx<tickets.length-1?"1px solid #f0ece6":"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem"}}>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.2rem",flexWrap:"wrap"}}>
                                  <span style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",background:PRIO_COR[tk.prioridade]+"22",color:PRIO_COR[tk.prioridade],padding:"0.15rem 0.4rem",borderRadius:3,fontFamily:"var(--sans)",flexShrink:0}}>{PRIO_LABEL[tk.prioridade]}</span>
                                  <span style={{fontSize:"0.65rem",color:"#aaa",fontFamily:"var(--sans)"}}>{tk.referencia}</span>
                                </div>
                                <p style={{fontFamily:"var(--serif)",fontSize:"0.9rem",margin:"0 0 0.15rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tk.assunto}</p>
                                <p style={{fontSize:"0.72rem",color:"#888",margin:0,fontFamily:"var(--sans)"}}>{CAT_LABEL[tk.categoria]} · {new Date(tk.created_at).toLocaleDateString(lang==="pt"?"pt-PT":lang==="fr"?"fr-FR":"lt-LT",{day:"2-digit",month:"short",year:"numeric"})}</p>
                              </div>
                              <span style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",background:EST_COR[tk.estado]+"22",color:EST_COR[tk.estado],padding:"0.2rem 0.5rem",borderRadius:3,fontFamily:"var(--sans)",flexShrink:0}}>{EST_LABEL[tk.estado]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      {modalEnvio && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:"#fff",padding:"2rem",maxWidth:"400px",width:"100%"}}>
            <h3 style={{fontFamily:"var(--serif)",fontSize:"1.4rem",fontWeight:300,marginBottom:"1rem"}}>Marcar como enviado</h3>
            <p style={{fontSize:"0.82rem",color:"var(--g4)",marginBottom:"1.5rem"}}>{modalEnvio.pecas_lojista?.nome} → {modalEnvio.clientes?.nome}</p>
            <div className="fg"><label className="lbl">Transportadora</label><input className="inp" value={trackingInfo.transportadora} onChange={e=>setTrackingInfo(t=>({...t,transportadora:e.target.value}))} placeholder="CTT, DHL, FEDEX..." /></div>
            <div className="fg"><label className="lbl">Nº de tracking</label><input className="inp" value={trackingInfo.numero} onChange={e=>setTrackingInfo(t=>({...t,numero:e.target.value}))} placeholder="PT123456789" /></div>
            <div style={{display:"flex",gap:"0.75rem",marginTop:"1.25rem"}}>
              <button onClick={async()=>{await atualizarEstadoAluguer(modalEnvio.id,"enviado",{tracking_transportadora:trackingInfo.transportadora||null,tracking_numero:trackingInfo.numero||null});setModalEnvio(null);}} style={{flex:1,padding:"0.85rem",background:"#8e44ad",color:"#fff",border:"none",fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>Confirmar envio</button>
              <button onClick={()=>setModalEnvio(null)} style={{padding:"0.85rem 1.25rem",background:"none",border:"1.5px solid var(--g2)",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {modalVerificar && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:"#fff",padding:"2rem",maxWidth:"400px",width:"100%"}}>
            <h3 style={{fontFamily:"var(--serif)",fontSize:"1.4rem",fontWeight:300,marginBottom:"1rem"}}>Verificar devolução</h3>
            <p style={{fontSize:"0.82rem",color:"var(--g4)",marginBottom:"0.5rem"}}>{modalVerificar.pecas_lojista?.nome} · {modalVerificar.clientes?.nome}</p>
            <p style={{fontSize:"0.78rem",color:"var(--g4)",marginBottom:"1.5rem"}}>Inspeciona a peça e regista o estado:</p>
            <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
              <button onClick={async()=>{await atualizarEstadoAluguer(modalVerificar.id,"devolvido",{deposito_estado:"a_devolver",data_verificacao:new Date().toISOString()});setModalVerificar(null);}} style={{padding:"1rem",background:"#27ae60",color:"#fff",border:"none",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>✓ Peça em bom estado</button>
              <button onClick={async()=>{await atualizarEstadoAluguer(modalVerificar.id,"devolvido_danificado",{deposito_estado:"em_disputa",data_verificacao:new Date().toISOString()});setModalVerificar(null);}} style={{padding:"1rem",background:"#e74c3c",color:"#fff",border:"none",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>✕ Peça danificada</button>
              <button onClick={()=>setModalVerificar(null)} style={{padding:"0.75rem",background:"none",border:"1.5px solid var(--g2)",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>Cancelar</button>
            </div>
            <p style={{fontSize:"0.7rem",color:"var(--g4)",marginTop:"1.25rem",lineHeight:1.5}}>Após confirmação, a Nora Grei processa: devolução do depósito ao cliente (peça OK) ou abertura de disputa (peça danificada). O teu pagamento é transferido nos 10 dias úteis seguintes, deduzida a comissão Nora Grei.</p>
          </div>
        </div>
      )}
      {modalCancelarLojista && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:"#fff",padding:"2rem",maxWidth:"420px",width:"100%"}}>
            <h3 style={{fontFamily:"var(--serif)",fontSize:"1.4rem",fontWeight:300,marginBottom:"0.75rem"}}>Cancelar reserva</h3>
            <p style={{fontSize:"0.82rem",color:"var(--g4)",marginBottom:"0.25rem"}}>{modalCancelarLojista.pecas_lojista?.nome} · {modalCancelarLojista.clientes?.nome}</p>
            <p style={{fontSize:"0.78rem",color:"var(--g4)",marginBottom:"1.25rem"}}>Valor da reserva: <strong>€{modalCancelarLojista.valor_aluguer?.toFixed(2)}</strong></p>
            <div style={{background:"#fff8e1",border:"1px solid #f9a825",borderRadius:6,padding:"0.75rem 1rem",fontSize:"0.75rem",color:"#5a4a00",lineHeight:1.5,marginBottom:"1.5rem"}}>
              ⚠ Ao cancelares esta reserva, o valor total (€{modalCancelarLojista.valor_aluguer?.toFixed(2)}) será creditado automaticamente na conta da cliente para usar numa futura reserva. Esta ação não pode ser desfeita.
            </div>
            <div style={{display:"flex",gap:"0.75rem"}}>
              <button onClick={()=>cancelarAluguerLojista(modalCancelarLojista)} style={{flex:1,padding:"0.85rem",background:"#e74c3c",color:"#fff",border:"none",fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>Confirmar cancelamento</button>
              <button onClick={()=>setModalCancelarLojista(null)} style={{padding:"0.85rem 1.25rem",background:"none",border:"1.5px solid var(--g2)",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>Voltar</button>
            </div>
          </div>
        </div>
      )}
      {editarPeca && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"1rem",overflowY:"auto"}}>
          <div style={{background:"#fff",padding:"2rem",maxWidth:"520px",width:"100%",marginTop:"2rem",marginBottom:"2rem"}}>
            <h3 style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:300,marginBottom:"1.5rem"}}>Editar peça</h3>

            {/* Categoria */}
            <div className="fg" style={{marginBottom:"1rem"}}>
              <label className="lbl">Categoria</label>
              <select className="inp" value={editarPeca.categoria||""} onChange={e=>{
                const cat=e.target.value;
                const semTamanho=["Acessórios","Malas","Anéis","Colares","Pulseiras","Cachecóis","Relógios","Chapéus","Cintos","Óculos"];
                const tams=semTamanho.includes(cat)?[{tamanho:"Único",quantidade:1}]:editarPeca.tamanhos;
                setEditarPeca(p=>({...p,categoria:cat,tamanhos:tams}));
              }} style={{background:"#fff"}}>
                <option value="">Selecionar categoria...</option>
                <optgroup label="Vestuário">
                  {["Vestidos","Saias","Calças","Blusas","Casacos","Fatos","Macacões","Conjuntos","Camisas","Kaftans"].map(c=><option key={c}>{c}</option>)}
                </optgroup>
                <optgroup label="Acessórios">
                  {["Malas","Anéis","Colares","Pulseiras","Cachecóis","Chapéus","Cintos","Óculos","Luvas","Acessórios"].map(c=><option key={c}>{c}</option>)}
                </optgroup>
                <optgroup label="Relógios">
                  <option>Relógios</option>
                </optgroup>
                <optgroup label="Calçado">
                  {["Saltos","Sandálias","Botas","Sapatilhas","Calçado"].map(c=><option key={c}>{c}</option>)}
                </optgroup>
              </select>
            </div>

            {/* Nome + Marca */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
              <div className="fg"><label className="lbl">Nome da peça *</label><input className="inp" value={editarPeca.nome||""} onChange={e=>setEditarPeca(p=>({...p,nome:e.target.value}))} /></div>
              <div className="fg"><label className="lbl">Marca / Designer</label><input className="inp" value={editarPeca.marca||""} onChange={e=>setEditarPeca(p=>({...p,marca:e.target.value}))} placeholder="Zara, Mango, Gucci..." /></div>
            </div>

            {/* Cor + Condição */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
              <div className="fg">
                <label className="lbl">Cor principal</label>
                <input className="inp" value={editarPeca.cor||""} onChange={e=>setEditarPeca(p=>({...p,cor:e.target.value}))} placeholder="Preto, Branco, Azul..." list="cores-editar" />
                <datalist id="cores-editar">
                  {["Preto","Branco","Creme","Bege","Castanho","Azul","Azul marinho","Verde","Verde esmeralda","Vermelho","Rosa","Lilás","Roxo","Laranja","Amarelo","Dourado","Prateado","Multicolor","Estampado","Animal print"].map(c=><option key={c} value={c}/>)}
                </datalist>
              </div>
              <div className="fg">
                <label className="lbl">Condição</label>
                <select className="inp" value={editarPeca.condicao||"como_novo"} onChange={e=>setEditarPeca(p=>({...p,condicao:e.target.value}))} style={{background:"#fff"}}>
                  <option value="novo">Novo (com etiqueta)</option>
                  <option value="como_novo">Como novo (nunca usado)</option>
                  <option value="muito_bom">Muito bom estado</option>
                  <option value="bom">Bom estado</option>
                  <option value="usado">Usado</option>
                </select>
              </div>
            </div>

            {/* Defeito */}
            <div style={{marginBottom:"1rem",padding:"0.85rem 1rem",border:`1.5px solid ${editarPeca.tem_defeito?"#e74c3c":"var(--g2)"}`,background:editarPeca.tem_defeito?"#fff5f5":"#fafafa"}}>
              <label style={{display:"flex",alignItems:"center",gap:"0.6rem",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",color:editarPeca.tem_defeito?"#c0392b":"var(--g4)",fontWeight:600}}>
                <input type="checkbox" checked={editarPeca.tem_defeito||false} onChange={e=>setEditarPeca(p=>({...p,tem_defeito:e.target.checked,descricao_defeito:""}))} style={{width:"1rem",height:"1rem",cursor:"pointer",accentColor:"#e74c3c"}} />
                Peça tem defeito
              </label>
              {editarPeca.tem_defeito && (
                <textarea className="inp" value={editarPeca.descricao_defeito||""} onChange={e=>setEditarPeca(p=>({...p,descricao_defeito:e.target.value}))} style={{resize:"vertical",minHeight:"60px",marginTop:"0.6rem",border:"1.5px solid #e74c3c"}} placeholder="Descreve o defeito — ex: ligeira mancha na manga, fio solto na bainha..." />
              )}
              {!editarPeca.tem_defeito && <span style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.3rem",display:"block"}}>A peça está em perfeitas condições para aluguer.</span>}
            </div>

            {/* Higienização */}
            <div style={{marginBottom:"1rem",padding:"0.85rem 1rem",border:`1.5px solid ${editarPeca.higienizacao_ativa?"#c4748a":"var(--g2)"}`,background:editarPeca.higienizacao_ativa?"#fdf5f8":"#fafafa"}}>
              <label style={{display:"flex",alignItems:"center",gap:"0.6rem",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",color:editarPeca.higienizacao_ativa?"#c4748a":"var(--g4)",fontWeight:600}}>
                <input type="checkbox" checked={editarPeca.higienizacao_ativa||false} onChange={e=>setEditarPeca(p=>({...p,higienizacao_ativa:e.target.checked,higienizacao_valor:""}))} style={{width:"1rem",height:"1rem",cursor:"pointer",accentColor:"#c4748a"}} />
                Requer higienização profissional
              </label>
              {editarPeca.higienizacao_ativa && (
                <div style={{marginTop:"0.6rem"}}>
                  <label className="lbl" style={{fontSize:"0.68rem"}}>Custo (€)</label>
                  <input className="inp" type="number" min="0" step="0.5" value={editarPeca.higienizacao_valor||""} onChange={e=>setEditarPeca(p=>({...p,higienizacao_valor:e.target.value}))} placeholder="ex: 6.00" style={{maxWidth:120,marginTop:"0.3rem"}} />
                  <span style={{fontSize:"0.65rem",color:"var(--g4)",marginTop:"0.3rem",display:"block"}}>Cobrado ao cliente no checkout.</span>
                </div>
              )}
              {!editarPeca.higienizacao_ativa && <span style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.3rem",display:"block"}}>Sem taxa — limpeza tratada internamente.</span>}
            </div>

            {/* Descrição */}
            <div className="fg" style={{marginBottom:"1rem"}}>
              <label className="lbl">Descrição</label>
              <textarea className="inp" value={editarPeca.descricao||""} onChange={e=>setEditarPeca(p=>({...p,descricao:e.target.value}))} style={{resize:"vertical",minHeight:"70px"}} placeholder="Conta a história desta peça — ocasião ideal, como usar..." />
            </div>

            {/* Tipo — alugar / vender / ambos */}
            {(()=>{
              const est = calcEstimativaP(editarPeca);
              const opcoesE = [
                { val:"alugar",  titulo:"Alugar",          icone:"↻", desc:"Rendimento recorrente", detalhe: est ? `€${est.ganho12m}/ano` : "rendimento recorrente", cor:"#c4748a" },
                { val:"comprar", titulo:"Vender",           icone:"→", desc:"Liquidez imediata",     detalhe: est ? `€${est.precoVendaUsada} imediato` : "liquidez imediata", cor:"#5b8a6b" },
                { val:"ambos",   titulo:"Alugar e Vender",  icone:"◈", desc:"Máxima flexibilidade",  detalhe: est ? `€${est.precoVendaUsada} + rendas` : "máxima flexibilidade", cor:"#7a6a9e" },
              ];
              return (
                <div className="fg" style={{marginBottom:"1rem"}}>
                  <label className="lbl">Disponível para</label>
                  <div style={{display:"flex",flexDirection:"column",gap:"0.45rem"}}>
                    {opcoesE.map(({val,titulo,icone,desc,detalhe,cor})=>{
                      const ativo=(editarPeca.tipo||"alugar")===val;
                      return (
                        <button key={val} type="button" onClick={()=>setEditarPeca(p=>({...p,tipo:val}))}
                          style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.65rem 0.85rem",border:ativo?`2px solid ${cor}`:"1.5px solid #e2dfda",borderRadius:9,background:ativo?`${cor}12`:"#fff",cursor:"pointer",textAlign:"left",fontFamily:"inherit",width:"100%",transition:"all 0.15s"}}>
                          <span style={{fontSize:"1.1rem",lineHeight:1,color:ativo?cor:"#bbb",minWidth:22,textAlign:"center"}}>{icone}</span>
                          <div style={{flex:1}}>
                            <div style={{fontSize:"0.73rem",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:ativo?cor:"#1a1816",marginBottom:"0.15rem",fontFamily:"inherit"}}>{titulo}</div>
                            <div style={{fontSize:"0.65rem",color:"#999",lineHeight:1.3}}>{desc}</div>
                          </div>
                          <div style={{fontSize:"0.65rem",fontWeight:600,color:ativo?cor:"#ccc",textAlign:"right",whiteSpace:"nowrap"}}>{detalhe}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Valor nova + idade */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"0.75rem"}}>
              <div className="fg">
                <label className="lbl">Valor peça nova (€) <span style={{color:"#c0392b"}}>*</span></label>
                <input className="inp" type="number" min="0" value={editarPeca.valor_peca||""}
                  onChange={e=>setEditarPeca(p=>({...p,valor_peca:e.target.value}))}
                  placeholder="200" />
              </div>
              <div className="fg">
                <label className="lbl">Idade da peça</label>
                <select className="inp" value={editarPeca.idade_peca||"1a2"} onChange={e=>setEditarPeca(p=>({...p,idade_peca:e.target.value}))}>
                  <option value="novo">Nova / nunca usada</option>
                  <option value="1a2">1 – 2 anos</option>
                  <option value="2a4">2 – 4 anos</option>
                  <option value="4mais">+ de 4 anos</option>
                </select>
              </div>
            </div>

            {/* Bloco de estimativa */}
            {(()=>{
              const est = calcEstimativaP({...editarPeca, contexto_venda: contextoVendaEditar});
              if (!est) return (
                <p style={{fontSize:"0.75rem",color:"var(--g4)",marginBottom:"1rem",padding:"0.75rem",background:"#f7f6f4",borderRadius:"8px",border:"1px dashed #d5d0c8"}}>
                  Preenche o valor da peça nova para ver a nossa avaliação ↑
                </p>
              );
              const tierLabel = est.tier === "investimento" ? "peça de investimento ↑" : est.tier === "premium" ? "marca premium" : est.tier === "alta" ? "marca alta" : "mass market";
              const tierCor = est.tier === "investimento" ? "#a8d8a8" : "#c4748a";
              return (
                <div style={{background:"#1a1816",color:"#f5f3ef",borderRadius:"10px",padding:"1rem",marginBottom:"1rem"}}>
                  <div style={{fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#a09890",marginBottom:"0.4rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
                    <span>✦</span> Com base na nossa avaliação
                    <span style={{marginLeft:"auto",fontSize:"0.6rem",background:"#2a2826",padding:"0.1rem 0.35rem",borderRadius:"3px",color:tierCor}}>
                      {tierLabel}
                    </span>
                  </div>
                  <div style={{fontSize:"0.68rem",color:"#a09890",marginBottom:"0.8rem",fontStyle:"italic"}}>
                    Valor estimado para a sua peça neste momento
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0.4rem",marginBottom:"0.8rem"}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"1rem",fontWeight:700,color:est.tier==="investimento"?"#a8d8a8":"#f5f3ef"}}>{est.valorMercado}€</div>
                      <div style={{fontSize:"0.58rem",color:"#a09890",letterSpacing:"0.08em",textTransform:"uppercase"}}>mercado</div>
                    </div>
                    <div style={{textAlign:"center",borderLeft:"1px solid #2a2826"}}>
                      <div style={{fontSize:"1rem",fontWeight:700,color:"#c4748a"}}>{est.precoAluguerDia}€</div>
                      <div style={{fontSize:"0.58rem",color:"#a09890",letterSpacing:"0.08em",textTransform:"uppercase"}}>aluguer/dia</div>
                    </div>
                    <div style={{textAlign:"center",borderLeft:"1px solid #2a2826"}}>
                      <div style={{fontSize:"1rem",fontWeight:700,color:"#5b8a6b"}}>{est.precoVendaUsada}€</div>
                      <div style={{fontSize:"0.58rem",color:"#a09890",letterSpacing:"0.08em",textTransform:"uppercase"}}>venda sugerida</div>
                    </div>
                    <div style={{textAlign:"center",borderLeft:"1px solid #2a2826"}}>
                      <div style={{fontSize:"1rem",fontWeight:700,color:"#a8d8a8"}}>{est.caucao}€</div>
                      <div style={{fontSize:"0.58rem",color:"#a09890",letterSpacing:"0.08em",textTransform:"uppercase"}}>caução</div>
                    </div>
                  </div>
                  {/* Slider contexto de venda */}
                  <div style={{marginBottom:"0.8rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.6rem",color:"#a09890",marginBottom:"0.3rem",letterSpacing:"0.06em"}}>
                      <span>Sem pressa · preço máximo</span>
                      <span>Preciso de liquidez</span>
                    </div>
                    <input type="range" min={0} max={100} step={5} value={contextoVendaEditar}
                      onChange={e=>setContextoVendaEditar(Number(e.target.value))}
                      style={{width:"100%",accentColor:"#5b8a6b",height:"3px",cursor:"pointer"}} />
                    {contextoVendaEditar > 20 && (
                      <div style={{fontSize:"0.62rem",color:"#5b8a6b",textAlign:"center",marginTop:"0.25rem"}}>
                        Ajuste de liquidez: −{Math.round(contextoVendaEditar*0.30)}% sobre o valor de venda
                      </div>
                    )}
                  </div>
                  <div style={{fontSize:"0.65rem",color:"#a09890",marginBottom:"0.6rem",textAlign:"center"}}>
                    ~{est.rotMes}× rotações/mês · ~{est.diasAlug} dias/aluguer · potencial {est.ganho12m}€/ano
                    {est.rendasParaRecuperar && <span> · recupera em {est.rendasParaRecuperar} rendas</span>}
                  </div>
                  <button type="button"
                    onClick={()=>setEditarPeca(p=>({...p,preco_aluguer_dia:est.precoAluguerDia,preco_venda:est.precoVendaUsada}))}
                    style={{width:"100%",background:"#c4748a",color:"#fff",border:"none",borderRadius:"6px",padding:"0.5rem",fontSize:"0.75rem",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer"}}>
                    Usar sugestão →
                  </button>
                </div>
              );
            })()}

            {/* Aluguer / dia + Venda */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"0.25rem"}}>
              {((editarPeca.tipo||"alugar")==="alugar"||(editarPeca.tipo||"alugar")==="ambos") && (
                <div className="fg">
                  <label className="lbl">Aluguer / dia (€)</label>
                  <input className="inp" type="number" min="0" value={editarPeca.preco_aluguer_dia||""} onChange={e=>setEditarPeca(p=>({...p,preco_aluguer_dia:e.target.value}))} placeholder="16" />
                </div>
              )}
            </div>

            {/* Preço venda + Material */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
              {((editarPeca.tipo||"alugar")==="comprar"||(editarPeca.tipo||"alugar")==="ambos") && <div className="fg"><label className="lbl">Preço venda (€)</label><input className="inp" type="number" min="0" value={editarPeca.preco_venda||""} onChange={e=>setEditarPeca(p=>({...p,preco_venda:e.target.value}))} placeholder="150" /></div>}
              <div className="fg"><label className="lbl">Material</label><input className="inp" value={editarPeca.material||""} onChange={e=>setEditarPeca(p=>({...p,material:e.target.value}))} placeholder="Seda, algodão..." /></div>
            </div>

            {/* Ocasiões — select múltiplo */}
            <div className="fg" style={{marginBottom:"1rem"}}>
              <label className="lbl">Ocasiões (seleciona todas que se aplicam)</label>
              <select multiple value={editarPeca.ocasioes||[]}
                onChange={e=>setEditarPeca(p=>({...p,ocasioes:Array.from(e.target.selectedOptions,o=>o.value)}))}
                style={{width:"100%",border:"1.5px solid var(--g2)",fontFamily:"var(--sans)",fontSize:"0.85rem",padding:"0.25rem",background:"#fff",minHeight:"120px",outline:"none"}}>
                {["Casamento","Gala","Cocktail","Festa","Jantar","Trabalho","Dia a dia","Praia","Férias","Praia/Férias"].map(oc=>(
                  <option key={oc} value={oc} style={{padding:"0.4rem 0.6rem",fontSize:"0.85rem"}}>{oc}</option>
                ))}
              </select>
              <span style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.25rem"}}>Ctrl+clique (Windows) ou Cmd+clique (Mac) para selecionar várias</span>
            </div>

            {/* Link externo para compra nova */}
            <div className="fg" style={{marginBottom:"1rem",padding:"1rem",background:"#faf8f5",border:"1.5px solid #e8d5a3"}}>
              <label className="lbl" style={{color:"#8a6a2a",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                Link para comprar nova ↗
                <span style={{fontSize:"0.68rem",background:"#c4a882",color:"#fff",padding:"0.1rem 0.4rem",borderRadius:"3px",fontWeight:600,letterSpacing:"0.08em"}}>15€/mês</span>
              </label>
              <input className="inp" type="url" value={editarPeca.link_compra_externa||""} onChange={e=>setEditarPeca(p=>({...p,link_compra_externa:e.target.value}))} placeholder="https://www.zara.com/produto/..." style={{marginBottom:"0.4rem"}} />
              {editarPeca.link_externo_ativo
                ? <span style={{fontSize:"0.75rem",color:"#27ae60",display:"flex",alignItems:"center",gap:"0.3rem"}}>✓ Link ativo</span>
                : editarPeca.link_compra_externa
                  ? <span style={{fontSize:"0.75rem",color:"#e67e22"}}>⏳ Pendente ativação — após pagamento de 15€/mês a Nora Grei ativa o link</span>
                  : <span style={{fontSize:"0.75rem",color:"var(--g4)"}}>Direciona clientes para comprar a peça nova noutro site. Custo: 15€/mês por peça.</span>
              }
            </div>

            {/* Fotos — remover existentes / adicionar novas */}
            <div style={{marginBottom:"1.25rem"}}>
              <label className="lbl" style={{display:"block",marginBottom:"0.5rem"}}>Fotos</label>
              {fotosEditar.length > 0 && (
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem",marginBottom:"0.6rem"}}>
                  {fotosEditar.map((url, i) => (
                    <div key={i} style={{position:"relative",width:72,height:72,flexShrink:0}}>
                      <img src={url} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:3}} />
                      <button
                        type="button"
                        onClick={()=>setFotosEditar(f=>f.filter((_,j)=>j!==i))}
                        style={{position:"absolute",top:-5,right:-5,width:18,height:18,borderRadius:"50%",background:"#e74c3c",color:"#fff",border:"none",cursor:"pointer",fontSize:"0.6rem",lineHeight:"18px",textAlign:"center",fontFamily:"var(--sans)",fontWeight:700,padding:0}}
                        title="Remover foto"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
              <label style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.72rem",color:"var(--g4)",border:"1.5px dashed var(--g2)",padding:"0.4rem 0.75rem",borderRadius:3}}>
                <input type="file" accept="image/*" multiple style={{display:"none"}} onChange={async e=>{
                  const files = Array.from(e.target.files);
                  if (!files.length) return;
                  const urls = await Promise.all(files.map(f => new Promise(res=>{
                    const reader = new FileReader();
                    reader.onload = ev => res(ev.target.result);
                    reader.readAsDataURL(f);
                  })));
                  // upload imediato para Supabase
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  const uploadedUrls = await Promise.all(files.map(async (f, i) => {
                    const ext = f.name.split(".").pop() || "jpg";
                    const path = `${session.user.id}/${editarPeca.id}/${Date.now()}-${i}.${ext}`;
                    let bucket = "pecas_lojista";
                    let res = await supabase.storage.from(bucket).upload(path, f, { upsert: true });
                    if (res.error) { bucket = "pecas"; res = await supabase.storage.from(bucket).upload(path, f, { upsert: true }); }
                    if (res.error) return null;
                    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
                    return pub?.publicUrl || null;
                  }));
                  setFotosEditar(f => [...f, ...uploadedUrls.filter(Boolean)]);
                  e.target.value = "";
                }} />
                📷 Adicionar fotos
              </label>
              {fotosEditar.length === 0 && <span style={{fontSize:"0.72rem",color:"#e74c3c",marginLeft:"0.5rem"}}>Sem fotos — a peça não aparece na loja</span>}
            </div>

            <div style={{display:"flex",gap:"0.75rem",marginTop:"1.25rem"}}>
              <button onClick={guardarEdicaoPeca} disabled={!editarPeca.nome||editarLoading} style={{flex:1,padding:"0.85rem",background:"var(--black)",color:"#fff",border:"none",fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)",opacity:!editarPeca.nome?0.5:1}}>{editarLoading?"...":"Guardar"}</button>
              <button onClick={()=>{setEditarPeca(null);setFotosEditar([]);}} style={{padding:"0.85rem 1.25rem",background:"none",border:"1.5px solid var(--g2)",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {showNovaPeca && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"1rem",overflowY:"auto"}}>
          <div style={{background:"#fff",padding:"2rem",maxWidth:"520px",width:"100%",marginTop:"2rem",marginBottom:"2rem"}}>
            <h3 style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:300,marginBottom:"1.5rem"}}>{lang==="fr"?"Nouvelle pièce":lang==="lt"?"Naujas drabužis":"Nova peça"}</h3>

            {/* Fotos */}
            <div className="fg" style={{marginBottom:"1rem"}}>
              <label className="lbl">{lang==="fr"?"Photos":lang==="lt"?"Nuotraukos":"Fotos"}</label>
              <label style={{display:"block",cursor:"pointer"}}>
                <input type="file" accept="image/*" multiple onChange={e=>handleFotosLojista(e.target.files)} style={{display:"none"}} />
                <div style={{border:"1.5px dashed var(--g2)",borderRadius:4,padding:"1.25rem 1rem",textAlign:"center",background:"var(--g1)",transition:"border-color 0.2s"}}>
                  <div style={{fontSize:"1.6rem",marginBottom:"0.3rem"}}>📷</div>
                  <div style={{fontFamily:"var(--sans)",fontSize:"0.82rem",color:"var(--g4)"}}>
                    {lang==="fr"?"Clique pour ajouter des photos":lang==="lt"?"Spustelėkite norėdami pridėti nuotraukas":"Clica para adicionar fotos"}
                  </div>
                  <div style={{fontFamily:"var(--sans)",fontSize:"0.72rem",color:"var(--g3)",marginTop:"0.2rem"}}>JPG, PNG · várias fotos · IA valida automaticamente</div>
                </div>
              </label>
              {fotosLojista.length > 0 && (
                <div style={{display:"flex",gap:"0.5rem",marginTop:"0.75rem",flexWrap:"wrap"}}>
                  {fotosLojista.map((f,idx2)=>{
                    const v = fotoValidacao[idx2];
                    const cor = !v || v.estado==="a validar" ? "#e2dfda" : v.valida ? "#27ae60" : "#c0392b";
                    return (
                      <div key={idx2} style={{position:"relative"}}>
                        <img src={URL.createObjectURL(f)} alt="" style={{width:72,height:90,objectFit:"cover",border:`2px solid ${cor}`}} />
                        {v?.estado==="a validar" && <div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem"}}>⏳</div>}
                        {v && v.estado!=="a validar" && !v.valida && <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(192,57,43,0.85)",color:"#fff",fontSize:"0.55rem",padding:"2px 3px",lineHeight:1.2,textAlign:"center"}}>❌ {v.motivo?.slice(0,30)}</div>}
                        {v?.valida && <div style={{position:"absolute",top:2,left:2,background:"rgba(39,174,96,0.85)",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem",color:"#fff"}}>✓</div>}
                        <button type="button" onClick={()=>{setFotosLojista(prev=>prev.filter((_,i)=>i!==idx2));setFotoValidacao(prev=>prev.filter((_,i)=>i!==idx2));}} style={{position:"absolute",top:2,right:2,width:18,height:18,background:"rgba(0,0,0,0.6)",border:"none",borderRadius:"50%",color:"#fff",fontSize:"0.6rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Categoria */}
            <div className="fg" style={{marginBottom:"1rem"}}>
              <label className="lbl">Categoria *</label>
              <select className="inp" value={novaPeca.categoria} onChange={e=>{
                const cat=e.target.value;
                const semTamanho=["Acessórios","Malas","Anéis","Colares","Pulseiras","Cachecóis","Relógios","Chapéus","Cintos","Óculos"];
                const tams=semTamanho.includes(cat)?[{tamanho:"Único",quantidade:1}]:novaPeca.tamanhos;
                setNovaPeca(p=>({...p,categoria:cat,tamanhos:tams}));
              }} style={{background:"#fff"}}>
                <option value="">Selecionar categoria...</option>
                <optgroup label="Vestuário">
                  {["Vestidos","Saias","Calças","Blusas","Casacos","Fatos","Macacões","Conjuntos","Camisas","Kaftans"].map(c=><option key={c}>{c}</option>)}
                </optgroup>
                <optgroup label="Acessórios">
                  {["Malas","Anéis","Colares","Pulseiras","Cachecóis","Chapéus","Cintos","Óculos","Luvas","Acessórios"].map(c=><option key={c}>{c}</option>)}
                </optgroup>
                <optgroup label="Relógios">
                  <option>Relógios</option>
                </optgroup>
                <optgroup label="Calçado">
                  {["Saltos","Sandálias","Botas","Sapatilhas","Calçado"].map(c=><option key={c}>{c}</option>)}
                </optgroup>
              </select>
            </div>

            {/* Nome + Marca */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
              <div className="fg"><label className="lbl">Nome da peça *</label><input className="inp" value={novaPeca.nome} onChange={e=>setNovaPeca(p=>({...p,nome:e.target.value}))} placeholder="Ex: Vestido midi azul" /></div>
              <div className="fg"><label className="lbl">Marca / Designer</label><input className="inp" value={novaPeca.marca} onChange={e=>setNovaPeca(p=>({...p,marca:e.target.value}))} placeholder="Zara, Mango, Gucci..." /></div>
            </div>

            {/* Cor + Condição */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
              <div className="fg">
                <label className="lbl">Cor principal</label>
                <input className="inp" value={novaPeca.cor} onChange={e=>setNovaPeca(p=>({...p,cor:e.target.value}))} placeholder="Preto, Branco, Azul..." list="cores-lista" />
                <datalist id="cores-lista">
                  {["Preto","Branco","Creme","Bege","Castanho","Azul","Azul marinho","Verde","Verde esmeralda","Vermelho","Rosa","Lilás","Roxo","Laranja","Amarelo","Dourado","Prateado","Multicolor","Estampado","Animal print"].map(c=><option key={c} value={c}/>)}
                </datalist>
              </div>
              <div className="fg">
                <label className="lbl">Condição</label>
                <select className="inp" value={novaPeca.condicao} onChange={e=>setNovaPeca(p=>({...p,condicao:e.target.value}))} style={{background:"#fff"}}>
                  <option value="novo">Novo (com etiqueta)</option>
                  <option value="como_novo">Como novo (nunca usado)</option>
                  <option value="muito_bom">Muito bom estado</option>
                  <option value="bom">Bom estado</option>
                  <option value="usado">Usado</option>
                </select>
              </div>
            </div>

            {/* Defeito */}
            <div style={{marginBottom:"1rem",padding:"0.85rem 1rem",border:`1.5px solid ${novaPeca.tem_defeito?"#e74c3c":"var(--g2)"}`,background:novaPeca.tem_defeito?"#fff5f5":"#fafafa"}}>
              <label style={{display:"flex",alignItems:"center",gap:"0.6rem",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",color:novaPeca.tem_defeito?"#c0392b":"var(--g4)",fontWeight:600}}>
                <input type="checkbox" checked={novaPeca.tem_defeito} onChange={e=>setNovaPeca(p=>({...p,tem_defeito:e.target.checked,descricao_defeito:""}))} style={{width:"1rem",height:"1rem",cursor:"pointer",accentColor:"#e74c3c"}} />
                Peça tem defeito
              </label>
              {novaPeca.tem_defeito && (
                <textarea className="inp" value={novaPeca.descricao_defeito} onChange={e=>setNovaPeca(p=>({...p,descricao_defeito:e.target.value}))} style={{resize:"vertical",minHeight:"60px",marginTop:"0.6rem",border:"1.5px solid #e74c3c"}} placeholder="Descreve o defeito — ex: ligeira mancha na manga, fio solto na bainha..." />
              )}
              {!novaPeca.tem_defeito && <span style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.3rem",display:"block"}}>A peça está em perfeitas condições para aluguer.</span>}
            </div>

            {/* Higienização */}
            <div style={{marginBottom:"1rem",padding:"0.85rem 1rem",border:`1.5px solid ${novaPeca.higienizacao_ativa?"#c4748a":"var(--g2)"}`,background:novaPeca.higienizacao_ativa?"#fdf5f8":"#fafafa"}}>
              <label style={{display:"flex",alignItems:"center",gap:"0.6rem",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",color:novaPeca.higienizacao_ativa?"#c4748a":"var(--g4)",fontWeight:600}}>
                <input type="checkbox" checked={novaPeca.higienizacao_ativa} onChange={e=>setNovaPeca(p=>({...p,higienizacao_ativa:e.target.checked,higienizacao_valor:""}))} style={{width:"1rem",height:"1rem",cursor:"pointer",accentColor:"#c4748a"}} />
                Requer higienização profissional
              </label>
              {novaPeca.higienizacao_ativa && (
                <div style={{marginTop:"0.6rem"}}>
                  <label className="lbl" style={{fontSize:"0.68rem"}}>Custo (€)</label>
                  <input className="inp" type="number" min="0" step="0.5" value={novaPeca.higienizacao_valor} onChange={e=>setNovaPeca(p=>({...p,higienizacao_valor:e.target.value}))} placeholder="ex: 6.00" style={{maxWidth:120,marginTop:"0.3rem"}} />
                  <span style={{fontSize:"0.65rem",color:"var(--g4)",marginTop:"0.3rem",display:"block"}}>Cobrado ao cliente no checkout.</span>
                </div>
              )}
              {!novaPeca.higienizacao_ativa && <span style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.3rem",display:"block"}}>Sem taxa — limpeza tratada internamente.</span>}
            </div>

            {/* Descrição */}
            <div className="fg" style={{marginBottom:"1rem"}}>
              <label className="lbl">Descrição</label>
              <textarea className="inp" value={novaPeca.descricao} onChange={e=>setNovaPeca(p=>({...p,descricao:e.target.value}))} style={{resize:"vertical",minHeight:"70px"}} placeholder="Conta a história desta peça — ocasião ideal, como usar..." />
            </div>

            {/* Tipo — alugar / vender / ambos */}
            {(()=>{
              const estN = calcEstimativaP({...novaPeca, contexto_venda: contextoVendaNova});
              const opcoesN = [
                { val:"alugar",  titulo:"Alugar",          icone:"↻", desc:"Rendimento recorrente", detalhe: estN ? `€${estN.ganho12m}/ano` : "rendimento recorrente", cor:"#c4748a" },
                { val:"comprar", titulo:"Vender",           icone:"→", desc:"Liquidez imediata",     detalhe: estN ? `€${estN.precoVendaUsada} imediato` : "liquidez imediata", cor:"#5b8a6b" },
                { val:"ambos",   titulo:"Alugar e Vender",  icone:"◈", desc:"Máxima flexibilidade",  detalhe: estN ? `€${estN.precoVendaUsada} + rendas` : "máxima flexibilidade", cor:"#7a6a9e" },
              ];
              return (
                <div className="fg" style={{marginBottom:"1rem"}}>
                  <label className="lbl">Disponível para *</label>
                  <div style={{display:"flex",flexDirection:"column",gap:"0.45rem"}}>
                    {opcoesN.map(({val,titulo,icone,desc,detalhe,cor})=>{
                      const ativo=novaPeca.tipo===val;
                      return (
                        <button key={val} type="button" onClick={()=>setNovaPeca(p=>({...p,tipo:val}))}
                          style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.65rem 0.85rem",border:ativo?`2px solid ${cor}`:"1.5px solid #e2dfda",borderRadius:9,background:ativo?`${cor}12`:"#fff",cursor:"pointer",textAlign:"left",fontFamily:"inherit",width:"100%",transition:"all 0.15s"}}>
                          <span style={{fontSize:"1.1rem",lineHeight:1,color:ativo?cor:"#bbb",minWidth:22,textAlign:"center"}}>{icone}</span>
                          <div style={{flex:1}}>
                            <div style={{fontSize:"0.73rem",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:ativo?cor:"#1a1816",marginBottom:"0.15rem",fontFamily:"inherit"}}>{titulo}</div>
                            <div style={{fontSize:"0.65rem",color:"#999",lineHeight:1.3}}>{desc}</div>
                          </div>
                          <div style={{fontSize:"0.65rem",fontWeight:600,color:ativo?cor:"#ccc",textAlign:"right",whiteSpace:"nowrap"}}>{detalhe}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Valor nova + sugestão aluguer */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"0.25rem"}}>
              <div className="fg">
                <label className="lbl">Valor peça nova (€)</label>
                <input className="inp" type="number" min="0" value={novaPeca.valor_peca}
                  onChange={e=>{
                    const v=e.target.value;
                    const sugestao=v&&parseFloat(v)>0?Math.round(parseFloat(v)*0.08):"";
                    setNovaPeca(p=>({...p,valor_peca:v,preco_aluguer_dia:p.preco_aluguer_dia||sugestao}));
                  }}
                  placeholder="200" />
              </div>
              {(novaPeca.tipo==="alugar"||novaPeca.tipo==="ambos") && (
                <div className="fg">
                  <label className="lbl" style={{display:"flex",alignItems:"center",gap:"0.4rem"}}>
                    Aluguer / dia (€) *
                    {novaPeca.valor_peca&&parseFloat(novaPeca.valor_peca)>0&&<span style={{fontSize:"0.68rem",background:"#e8f5e9",color:"#27ae60",padding:"0.1rem 0.35rem",borderRadius:"3px",fontWeight:600,letterSpacing:"0.05em"}}>sugerido: {Math.round(parseFloat(novaPeca.valor_peca)*0.08)}€</span>}
                  </label>
                  <input className="inp" type="number" min="0" value={novaPeca.preco_aluguer_dia} onChange={e=>setNovaPeca(p=>({...p,preco_aluguer_dia:e.target.value}))} placeholder="16" />
                </div>
              )}
            </div>
            {novaPeca.valor_peca&&novaPeca.preco_aluguer_dia&&parseFloat(novaPeca.valor_peca)>0&&parseFloat(novaPeca.preco_aluguer_dia)>0&&(
              <p style={{fontSize:"0.68rem",color:"#27ae60",marginBottom:"0.5rem",paddingLeft:"0.25rem"}}>
                A cliente poupa {Math.round((1-parseFloat(novaPeca.preco_aluguer_dia)/parseFloat(novaPeca.valor_peca))*100)}% vs comprar nova
              </p>
            )}

            {/* Estimativa Nora Grei — nova peça */}
            {(()=>{
              const estN2 = calcEstimativaP({...novaPeca, contexto_venda: contextoVendaNova});
              if (!estN2) return null;
              const tierLabelN = estN2.tier === "investimento" ? "peça de investimento ↑" : estN2.tier === "premium" ? "marca premium" : estN2.tier === "alta" ? "marca alta" : "mass market";
              const tierCorN = estN2.tier === "investimento" ? "#a8d8a8" : "#c4748a";
              return (
                <div style={{background:"#1a1816",color:"#f5f3ef",borderRadius:"10px",padding:"1rem",marginBottom:"1rem"}}>
                  <div style={{fontSize:"0.65rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#a09890",marginBottom:"0.4rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
                    <span>✦</span> Com base na nossa avaliação
                    <span style={{marginLeft:"auto",fontSize:"0.6rem",background:"#2a2826",padding:"0.1rem 0.35rem",borderRadius:"3px",color:tierCorN}}>{tierLabelN}</span>
                  </div>
                  <div style={{fontSize:"0.68rem",color:"#a09890",marginBottom:"0.8rem",fontStyle:"italic"}}>Valor estimado para a sua peça neste momento</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0.4rem",marginBottom:"0.8rem"}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"1rem",fontWeight:700,color:estN2.tier==="investimento"?"#a8d8a8":"#f5f3ef"}}>{estN2.valorMercado}€</div>
                      <div style={{fontSize:"0.58rem",color:"#a09890",letterSpacing:"0.08em",textTransform:"uppercase"}}>mercado</div>
                    </div>
                    <div style={{textAlign:"center",borderLeft:"1px solid #2a2826"}}>
                      <div style={{fontSize:"1rem",fontWeight:700,color:"#c4748a"}}>{estN2.precoAluguerDia}€</div>
                      <div style={{fontSize:"0.58rem",color:"#a09890",letterSpacing:"0.08em",textTransform:"uppercase"}}>aluguer/dia</div>
                    </div>
                    <div style={{textAlign:"center",borderLeft:"1px solid #2a2826"}}>
                      <div style={{fontSize:"1rem",fontWeight:700,color:"#5b8a6b"}}>{estN2.precoVendaUsada}€</div>
                      <div style={{fontSize:"0.58rem",color:"#a09890",letterSpacing:"0.08em",textTransform:"uppercase"}}>venda sugerida</div>
                    </div>
                    <div style={{textAlign:"center",borderLeft:"1px solid #2a2826"}}>
                      <div style={{fontSize:"1rem",fontWeight:700,color:"#a8d8a8"}}>{estN2.caucao}€</div>
                      <div style={{fontSize:"0.58rem",color:"#a09890",letterSpacing:"0.08em",textTransform:"uppercase"}}>caução</div>
                    </div>
                  </div>
                  <div style={{marginBottom:"0.8rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.6rem",color:"#a09890",marginBottom:"0.3rem",letterSpacing:"0.06em"}}>
                      <span>Sem pressa · preço máximo</span>
                      <span>Preciso de liquidez</span>
                    </div>
                    <input type="range" min={0} max={100} step={5} value={contextoVendaNova}
                      onChange={e=>setContextoVendaNova(Number(e.target.value))}
                      style={{width:"100%",accentColor:"#5b8a6b",height:"3px",cursor:"pointer"}} />
                    {contextoVendaNova > 20 && (
                      <div style={{fontSize:"0.62rem",color:"#5b8a6b",textAlign:"center",marginTop:"0.25rem"}}>
                        Ajuste de liquidez: −{Math.round(contextoVendaNova*0.30)}% sobre o valor de venda
                      </div>
                    )}
                  </div>
                  <div style={{fontSize:"0.65rem",color:"#a09890",marginBottom:"0.6rem",textAlign:"center"}}>
                    ~{estN2.rotMes}× rotações/mês · ~{estN2.diasAlug} dias/aluguer · potencial {estN2.ganho12m}€/ano
                    {estN2.rendasParaRecuperar && <span> · recupera em {estN2.rendasParaRecuperar} rendas</span>}
                  </div>
                  <button type="button"
                    onClick={()=>setNovaPeca(p=>({...p,preco_aluguer_dia:estN2.precoAluguerDia,preco_venda:estN2.precoVendaUsada}))}
                    style={{width:"100%",background:"#c4748a",color:"#fff",border:"none",borderRadius:"6px",padding:"0.5rem",fontSize:"0.75rem",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer"}}>
                    Usar sugestão →
                  </button>
                </div>
              );
            })()}

            {/* Preço venda + Material */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
              {(novaPeca.tipo==="comprar"||novaPeca.tipo==="ambos") && <div className="fg"><label className="lbl">Preço venda (€) *</label><input className="inp" type="number" min="0" value={novaPeca.preco_venda} onChange={e=>setNovaPeca(p=>({...p,preco_venda:e.target.value}))} placeholder="150" /></div>}
              <div className="fg"><label className="lbl">Material</label><input className="inp" value={novaPeca.material} onChange={e=>setNovaPeca(p=>({...p,material:e.target.value}))} placeholder="Seda, algodão..." /></div>
            </div>

            {/* Ocasiões — select múltiplo */}
            <div className="fg" style={{marginBottom:"1rem"}}>
              <label className="lbl">Ocasiões (seleciona todas que se aplicam)</label>
              <select multiple value={novaPeca.ocasioes}
                onChange={e=>setNovaPeca(p=>({...p,ocasioes:Array.from(e.target.selectedOptions,o=>o.value)}))}
                style={{width:"100%",border:"1.5px solid var(--g2)",fontFamily:"var(--sans)",fontSize:"0.85rem",padding:"0.25rem",background:"#fff",minHeight:"120px",outline:"none"}}>
                {["Casamento","Gala","Cocktail","Festa","Jantar","Trabalho","Dia a dia","Praia","Férias","Praia/Férias"].map(oc=>(
                  <option key={oc} value={oc} style={{padding:"0.4rem 0.6rem",fontSize:"0.85rem"}}>{oc}</option>
                ))}
              </select>
              <span style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.25rem"}}>Ctrl+clique (Windows) ou Cmd+clique (Mac) para selecionar várias</span>
            </div>

            {/* Tamanhos */}
            <div className="fg" style={{marginBottom:"1rem"}}>
              <label className="lbl">Tamanhos disponíveis</label>
              {novaPeca.tamanhos.map((t,idx)=>(
                <div key={idx} style={{display:"flex",gap:"0.5rem",marginBottom:"0.5rem",alignItems:"center"}}>
                  <select value={t.tamanho} onChange={e=>setNovaPeca(p=>({...p,tamanhos:p.tamanhos.map((x,i)=>i===idx?{...x,tamanho:e.target.value}:x)}))} style={{padding:"0.5rem",border:"1.5px solid var(--g2)",fontFamily:"var(--sans)",flex:1,background:"#fff"}}>
                    {["XS","S","M","L","XL","XXL","34","36","38","40","42","44","46","48","Único"].map(s=><option key={s}>{s}</option>)}
                  </select>
                  <input type="number" value={t.quantidade} min={1} onChange={e=>setNovaPeca(p=>({...p,tamanhos:p.tamanhos.map((x,i)=>i===idx?{...x,quantidade:parseInt(e.target.value)||1}:x)}))} style={{width:"70px",padding:"0.5rem",border:"1.5px solid var(--g2)",fontFamily:"var(--sans)"}} title="Quantidade" />
                  {novaPeca.tamanhos.length>1&&<button type="button" onClick={()=>setNovaPeca(p=>({...p,tamanhos:p.tamanhos.filter((_,i)=>i!==idx)}))} style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:"1rem",lineHeight:1}}>✕</button>}
                </div>
              ))}
              <button type="button" onClick={()=>setNovaPeca(p=>({...p,tamanhos:[...p.tamanhos,{tamanho:"M",quantidade:1}]}))} style={{fontSize:"0.75rem",letterSpacing:"0.15em",textTransform:"uppercase",background:"none",border:"1.5px solid var(--g2)",padding:"0.4rem 0.75rem",cursor:"pointer",fontFamily:"var(--sans)"}}>+ Tamanho</button>
            </div>

            {/* Link externo para compra nova */}
            <div className="fg" style={{marginBottom:"1rem",padding:"1rem",background:"#faf8f5",border:"1.5px solid #e8d5a3"}}>
              <label className="lbl" style={{color:"#8a6a2a",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                Link para comprar nova ↗
                <span style={{fontSize:"0.68rem",background:"#c4a882",color:"#fff",padding:"0.1rem 0.4rem",borderRadius:"3px",fontWeight:600,letterSpacing:"0.08em"}}>15€/mês</span>
              </label>
              <input className="inp" type="url" value={novaPeca.link_compra_externa} onChange={e=>setNovaPeca(p=>({...p,link_compra_externa:e.target.value}))} placeholder="https://www.zara.com/produto/..." style={{marginBottom:"0.4rem"}} />
              <span style={{fontSize:"0.75rem",color:"var(--g4)"}}>Direciona clientes para comprar a peça nova noutro site. A Nora Grei ativa após pagamento de 15€/mês.</span>
            </div>

            {uploadProgressLoja && <p style={{fontSize:"0.82rem",color:"var(--g4)",margin:"0.5rem 0",fontStyle:"italic"}}>{uploadProgressLoja}</p>}
            <div style={{display:"flex",gap:"0.75rem",marginTop:"1.25rem"}}>
              <button onClick={guardarNovaPeca} disabled={!novaPeca.nome||((novaPeca.tipo==="alugar"||novaPeca.tipo==="ambos")&&!novaPeca.preco_aluguer_dia)||((novaPeca.tipo==="comprar"||novaPeca.tipo==="ambos")&&!novaPeca.preco_venda)||novaPecaLoading} style={{flex:1,padding:"0.85rem",background:"var(--black)",color:"#fff",border:"none",fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)",opacity:(!novaPeca.nome||((novaPeca.tipo==="alugar"||novaPeca.tipo==="ambos")&&!novaPeca.preco_aluguer_dia)||((novaPeca.tipo==="comprar"||novaPeca.tipo==="ambos")&&!novaPeca.preco_venda))?0.5:1}}>{novaPecaLoading?"...":"Adicionar peça"}</button>
              <button onClick={()=>setShowNovaPeca(false)} style={{padding:"0.85rem 1.25rem",background:"none",border:"1.5px solid var(--g2)",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Banner lembrete referral */}
      {showReferralBanner && (
        <div style={{position:"fixed",bottom:"5.5rem",left:"1rem",right:"1rem",zIndex:9998,background:"#fff",borderRadius:"14px",boxShadow:"0 8px 32px rgba(0,0,0,0.13)",padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem",border:"1px solid #f0e6d6"}}>
          <div style={{flexShrink:0,width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#fdf6ee,#f5e9d8)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#c4a882" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:"0.75rem",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--black)",fontFamily:"var(--sans)"}}>Convida e ganha</div>
            <div style={{fontSize:"0.78rem",color:"var(--g6)",marginTop:"0.15rem",fontFamily:"var(--serif)"}}>Convida uma amiga a abrir loja. Ela publica 10 peças → ganhas €{ganhos.config?.credito_10_pecas??5}. Ela faz a 1ª venda → mais €{ganhos.config?.credito_primeira_venda??5}. Ela fica 3 meses → mais €{ganhos.config?.credito_3_meses??5}.</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.4rem",flexShrink:0}}>
            <button onClick={() => { setShowModalConvida(true); setShowReferralBanner(false); }} style={{padding:"0.4rem 0.85rem",background:"#c4a882",color:"#fff",border:"none",borderRadius:"6px",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)",whiteSpace:"nowrap"}}>Saber mais</button>
            <button onClick={() => { setShowReferralBanner(false); try{localStorage.setItem("ng_referral_dispensado", new Date().toDateString());}catch{} }} style={{padding:"0.4rem 0.85rem",background:"none",color:"var(--g6)",border:"none",fontSize:"0.7rem",cursor:"pointer",fontFamily:"var(--sans)"}}>Agora não</button>
          </div>
        </div>
      )}

      {/* Modal — Convida e Ganha (abertura de lojas) */}
      {showModalConvida && (
        <div onClick={() => setShowModalConvida(false)} style={{position:"fixed",inset:0,zIndex:10000,background:"rgba(8,8,8,0.55)",display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
          <div onClick={e => e.stopPropagation()} style={{background:"var(--bg,#f8f7f5)",width:"100%",maxWidth:600,maxHeight:"88vh",overflowY:"auto",padding:"2rem 1.5rem 3rem",borderRadius:"18px 18px 0 0",boxShadow:"0 -8px 48px rgba(0,0,0,0.18)"}}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.5rem"}}>
              <div>
                <div style={{fontSize:"0.65rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#c4a882",fontWeight:600,marginBottom:"0.3rem"}}>Programa de referral</div>
                <div style={{fontFamily:"var(--serif,Georgia)",fontSize:"1.5rem",fontWeight:300,color:"#080808",lineHeight:1.2}}>Convida e Ganha</div>
              </div>
              <button onClick={() => setShowModalConvida(false)} style={{background:"none",border:"none",fontSize:"1.4rem",cursor:"pointer",color:"#aaa",lineHeight:1,padding:"0.25rem"}}>✕</button>
            </div>

            {/* O que é */}
            <div style={{fontSize:"0.85rem",color:"#5a5855",lineHeight:1.7,marginBottom:"1.5rem"}}>
              Tanto utilizadores como lojistas podem angariar novas lojas para a plataforma. Quando alguém que conheces abre uma loja pela primeira vez através do <strong>teu link único</strong>, os créditos são automaticamente creditados na tua conta à medida que a loja evolui.
            </div>

            {/* Como funciona — passos */}
            <div style={{marginBottom:"1.5rem"}}>
              <div style={{fontSize:"0.65rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#888",fontWeight:600,marginBottom:"0.75rem"}}>Como funciona</div>
              {[
                { step:"1", titulo:"Partilha o teu link de abertura de loja", desc:"No teu perfil encontras um link único de convite. Partilha-o com amigas, colegas ou conhecidos que queiram abrir loja na Nora Grei — via WhatsApp, Instagram, email ou onde preferires.", cor:"#c4a882" },
                { step:"2", titulo:"A pessoa abre a loja pelo teu link", desc:"Para que a angariação seja registada, quem crias a conta tem de o fazer através do teu link. Contas criadas por outro meio não são associadas a ti.", cor:"#c4748a" },
                { step:"3", titulo:"Ela publica 10 peças → ganhas €"+(ganhos.config?.credito_10_pecas??5), desc:"Assim que a nova loja publicar as primeiras 10 peças, recebe o primeiro crédito na tua conta.", cor:"#27ae60" },
                { step:"4", titulo:"Ela faz a 1.ª venda ou aluguer → mais €"+(ganhos.config?.credito_primeira_venda??5), desc:"Quando a loja concretizar a primeira transação (aluguer ou venda), recebe o segundo crédito.", cor:"#27ae60" },
                { step:"5", titulo:"Ela permanece ativa 3 meses → mais €"+(ganhos.config?.credito_3_meses??5), desc:"Se a loja se mantiver ativa durante 3 meses, recebes o terceiro e último crédito do ciclo.", cor:"#27ae60" },
              ].map(s => (
                <div key={s.step} style={{display:"flex",gap:"0.75rem",marginBottom:"0.85rem",alignItems:"flex-start"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:s.cor,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:700,flexShrink:0,marginTop:"0.1rem"}}>{s.step}</div>
                  <div>
                    <div style={{fontSize:"0.85rem",fontWeight:600,color:"#080808",marginBottom:"0.2rem"}}>{s.titulo}</div>
                    <div style={{fontSize:"0.78rem",color:"#7a6a5a",lineHeight:1.55}}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Onde ver os créditos */}
            <div style={{background:"#fdf6ee",border:"1.5px solid #c4a882",padding:"0.9rem 1rem",marginBottom:"1.5rem",fontSize:"0.8rem",color:"#5a4a35",lineHeight:1.6}}>
              <strong>Onde ver os teus créditos:</strong> no teu perfil, vai ao separador <strong>Ganhos</strong> (ícone ⚡). Aí encontras o histórico de créditos ganhos, o saldo disponível e quando cada crédito foi creditado.
            </div>

            {/* Link de convite */}
            <div style={{marginBottom:"1.25rem"}}>
              <div style={{fontSize:"0.65rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#c4748a",fontWeight:600,marginBottom:"0.5rem"}}>O teu link de convite para abertura de loja</div>
              <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                <div style={{flex:1,fontSize:"0.72rem",color:"#5a5855",background:"#fff",padding:"0.55rem 0.75rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",border:"1px solid #e2dfda",fontFamily:"monospace"}}>
                  {typeof window !== "undefined" ? `${window.location.origin}/registar?ref=${codigoLoja || user?.id?.slice(0,8)}` : "noragrei.com/registar?ref=…"}
                </div>
                <button onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/registar?ref=${codigoLoja || user?.id}`); } catch {} }}
                  style={{padding:"0.55rem 0.85rem",background:"#c4748a",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap",fontWeight:600}}>
                  Copiar
                </button>
              </div>
              <div style={{fontSize:"0.7rem",color:"#9c9894",marginTop:"0.4rem"}}>Partilha este link específico — é diferente do link de produtos. Só conta se a pessoa criar conta por aqui.</div>
            </div>

            <button onClick={() => setShowModalConvida(false)} style={{width:"100%",padding:"0.85rem",background:"#080808",color:"#f8f7f5",border:"none",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600}}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Botão flutuante — acesso rápido a /publicar (para todos os utilizadores autenticados) */}
      {user && (
        <button
          onClick={() => { window.location.href = "/publicar"; }}
          style={{
            position:"fixed", bottom:"calc(env(safe-area-inset-bottom, 0px) + 1.5rem)", left:"1.25rem", zIndex:9999,
            width:56, height:56, borderRadius:"50%",
            background:"#89c4e1", color:"#fff", border:"none",
            fontSize:"1.7rem", lineHeight:1, cursor:"pointer",
            boxShadow:"0 4px 20px rgba(137,196,225,0.5)",
            display:"flex", alignItems:"center", justifyContent:"center",
            touchAction:"manipulation", WebkitTapHighlightColor:"transparent",
          }}
          title="Publicar peça"
        >＋</button>
      )}
    </>
  );
}