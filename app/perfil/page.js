"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import NotificationBell from "@/components/NotificationBell";

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
      <button onClick={buscarRecibo} disabled={loading} style={{ width:'100%',marginTop:'0.5rem',padding:'0.55rem',background:'#fff',color:'#080808',border:'1.5px solid #2e2d2b',fontSize:'0.65rem',letterSpacing:'0.1em',textTransform:'uppercase',cursor:'pointer',fontWeight:600,fontFamily:"'Jost',sans-serif" }}>
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
              [i.dataLabel, new Date(recibo.created_at).toLocaleString("pt-PT")],
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
    sec: { fontSize:'0.6rem',letterSpacing:'0.2em',textTransform:'uppercase',fontWeight:600,marginBottom:'0.75rem' },
    opt: (on) => ({ display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.85rem 1rem',border:`1.5px solid ${on?'#080808':'#e2dfda'}`,background:on?'#f0eeeb':'#fff',cursor:'pointer',marginBottom:'0.5rem' }),
    radio: (on) => ({ width:16,height:16,borderRadius:'50%',border:`2px solid ${on?'#080808':'#ccc'}`,background:on?'#080808':'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center' }),
    radioDot: { width:6,height:6,borderRadius:'50%',background:'#fff' },
    badge: (auto) => ({ fontSize:'0.5rem',letterSpacing:'0.08em',textTransform:'uppercase',padding:'0.12rem 0.35rem',background:auto?'#e8f5e9':'#fff8e1',color:auto?'#27ae60':'#f39c12',fontWeight:600,marginLeft:'0.4rem' }),
    inp: { width:'100%',padding:'0.7rem 0.9rem',border:'1.5px solid #e2dfda',background:'#fff',fontFamily:"'Jost',sans-serif",fontSize:'0.9rem',color:'#080808',outline:'none',marginBottom:'0.5rem',boxSizing:'border-box' },
    row2: { display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.5rem' },
    ibanBox: { background:'#f0eeeb',padding:'1rem',marginBottom:'0.75rem' },
    ibanLabel: { fontSize:'0.62rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#888' },
    ibanVal: { fontFamily:"'Cormorant',serif",fontSize:'1.1rem',fontWeight:400,color:'#080808',marginTop:'0.15rem',marginBottom:'0.5rem' },
    aviso: { fontSize:'0.72rem',color:'#946200',background:'#fff8e1',padding:'0.75rem 1rem',borderLeft:'3px solid #f39c12',lineHeight:1.5,marginTop:'0.5rem' },
    uploadBox: { display:'block',padding:'0.85rem',border:'2px dashed #e2dfda',background:'#f0eeeb',cursor:'pointer',textAlign:'center',fontSize:'0.78rem',color:'#5a5855',marginBottom:'0.5rem' },
    btnPrimary: { width:'100%',padding:'0.7rem',background:'#080808',color:'#fff',border:'none',fontSize:'0.63rem',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",cursor:'pointer',fontWeight:500 },
    btnSecondary: { width:'100%',padding:'0.5rem',background:'transparent',color:'#888',border:'1px solid #e2dfda',fontSize:'0.62rem',letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",cursor:'pointer',marginTop:'0.5rem' },
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
            <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.1rem',fontWeight:400,color:'#080808'}}>{i.comprarUsada}</p>
            <p style={{fontSize:'0.72rem',color:'#5a5855',marginTop:'0.2rem'}}>{i.comprarUsadaDesc}</p>
          </div>
          <div style={{textAlign:'right',flexShrink:0,marginLeft:'1rem'}}>
            <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.2rem',fontWeight:300,color:'#080808'}}>{PRECO_USADA_PERFIL}€</p>
            <p style={{fontSize:'0.65rem',color:'#888'}}>+ {PORTES_PERFIL.toFixed(2).replace('.',',')}€ {i.portesEnvio}</p>
          </div>
        </div>
        <button onClick={() => setFase("escolher_pag")} style={{...sty.btnPrimary,marginTop:'0.5rem'}}>{i.pagarReferencia}</button>
      </div>
      <div style={{border:'1.5px solid #e2dfda',background:'#fff',padding:'1rem',marginBottom:'0.75rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.4rem'}}>
          <div>
            <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.1rem',fontWeight:400,color:'#080808'}}>{i.comprarNova}</p>
            <p style={{fontSize:'0.72rem',color:'#5a5855',marginTop:'0.2rem'}}>{i.comprarNovaDesc}</p>
          </div>
          <div style={{textAlign:'right',flexShrink:0,marginLeft:'1rem'}}>
            <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.2rem',fontWeight:300,color:'#c4748a'}}>{i.comprarNovaValor} {aluguer.valor_aluguer || 0}€</p>
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
          <p style={{fontSize:'0.65rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#5a5855',marginBottom:'0.4rem'}}>{i.telMbway}</p>
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
          <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.4rem',fontWeight:300,color:'#080808',marginBottom:'0.5rem'}}>
            {compra?.metodo_pagamento === "transferencia" ? i.aguardarPagamento : i.pago}
          </p>
          <p style={{fontSize:'0.78rem',color:'#5a5855',lineHeight:1.5}}>{i.pecaEnviada}</p>
        </div>
      )}
    </div>
  );

  if (fase === "voucher_nova" && codigo) return (
    <div style={{background:'#fff0f3',border:'1px solid #f0c0cc',padding:'1rem',marginTop:'0.75rem'}}>
      <p style={{fontSize:'0.6rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#c4748a',fontWeight:600,marginBottom:'0.5rem'}}>{i.codigoDesconto}</p>
      <div style={{fontFamily:"'Cormorant',serif",fontSize:'1.8rem',fontWeight:300,letterSpacing:'0.2em',color:'#080808',marginBottom:'0.3rem'}}>{codigo.codigo}</div>
      <p style={{fontSize:'0.72rem',color:'#5a5855',marginBottom:'0.75rem'}}>{i.descontoInfo} — <strong>{codigo.valor}€</strong></p>
      <div style={{display:'flex',gap:'0.5rem'}}>
        <button onClick={() => copiar(codigo.codigo)} style={{flex:1,padding:'0.6rem',background:copiado?'#27ae60':'#080808',color:'#fff',border:'none',fontSize:'0.65rem',letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",cursor:'pointer'}}>{copiado ? i.copiado : i.copiar}</button>
        <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" style={{flex:1,padding:'0.6rem',background:'#c4748a',color:'#fff',border:'none',fontSize:'0.65rem',letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>{i.irLoja}</a>
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
        {peca?.fotos?.[0] ? <img src={peca.fotos[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontFamily:"'Cormorant',serif",fontSize:'1.3rem',color:'rgba(0,0,0,0.15)',fontStyle:'italic'}}>NG</span>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'Cormorant',serif",fontSize:'1.1rem',fontWeight:400}}>{peca?.nome || "—"}</div>
        <div style={{fontSize:'0.78rem',color:'#3f3e3c'}}>{i.reservaTamanho} {tamanho} · {reserva.data_inicio_desejada} → {reserva.data_fim_desejada}</div>
        {tempo && (
          <div style={{fontSize:'0.72rem',color:'#1e7e3e',fontWeight:600,marginTop:'0.25rem'}}>{i.reservaPrazoTempo} {tempo}</div>
        )}
      </div>
      <a href={linkCheckout} style={{flexShrink:0,padding:'0.65rem 1.25rem',background:'#080808',color:'#fff',textDecoration:'none',fontSize:'0.65rem',letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:600,fontFamily:"'Jost',sans-serif",whiteSpace:'nowrap'}}>
        {i.reservaConfirmar}
      </a>
    </div>
  );
}

const t = {
  pt: {
    titulo: "O meu perfil", dadosPessoais: "Dados pessoais",
    nome: "Nome completo", email: "Email", telefone: "Telefone",
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
    pago: "✓ Pago", aguardarPagamento: "A aguardar pagamento", mudarPassword: "Alterar password", novaPassword: "Nova password", confirmarPassword: "Confirmar nova password", guardarPassword: "Guardar password", passwordMin: "A password deve ter pelo menos 6 caracteres.", passwordMatch: "As passwords não coincidem.", passwordOk: "Password alterada com sucesso!", passwordErro: "Erro ao alterar. Tenta novamente.", reclamacoes: "Reclamações", novaReclamacao: "Nova reclamação", assunto: "Assunto", mensagem: "Mensagem", enviarReclamacao: "Enviar reclamação", reclamacaoEnviada: "Reclamação enviada! Entraremos em contacto brevemente.", reclamacaoPendente: "Pendente", reclamacaoResolvida: "Resolvida", semReclamacoes: "Sem reclamações.", assuntoPlaceholder: "Ex: Peça danificada, atraso na entrega...", mensagemPlaceholder: "Descreve o problema em detalhe...", avaliacoes: "Avaliações", avaliarExperiencia: "Avalia a tua experiência", avaliacaoEnviada: "Avaliação enviada! Obrigado.", comentarioPlaceholder: "Deixa um comentário (opcional)...", enviarAvaliacao: "Enviar avaliação", tuaAvaliacao: "A tua avaliação", avaliacaoEmpresa: "Avaliação da Nora Grei", semAvaliacoes: "Ainda não tens alugueres concluídos para avaliar.", tabPerfil: "Perfil", tabPedidos: "Pedidos", tabGuardados: "Guardados", tabLoja: "A minha loja", tabMensagens: "Mensagens", caucaoLabel: "Caução", semPedidos: "Ainda não tens pedidos.", explorarCatalogo: "Explorar catálogo →", pecasGuardadas: "Peças guardadas", semGuardados: "Ainda não guardaste nenhuma peça.", indisponivel: "Indisponível", disponivel: "Disponível", alugada: "Alugada", disponivelEm: "Disponível em", alugar: "Alugar →", reservar: "Reservar →", selecionar: "— Selecionar —", moradaEntrega: "Morada de entrega", moradaVazia: "Não preenchida", documentosIdentidade: "Documentos de identidade", docsVazios: "Não preenchidos", docsDesc: "Necessários para verificação de identidade e caução.",
  },
  fr: {
    titulo: "Mon profil", dadosPessoais: "Informations personnelles",
    nome: "Nom complet", email: "Email", telefone: "Téléphone",
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
    pago: "✓ Payé", aguardarPagamento: "En attente de paiement", mudarPassword: "Changer le mot de passe", novaPassword: "Nouveau mot de passe", confirmarPassword: "Confirmer", guardarPassword: "Enregistrer", passwordMin: "Au moins 6 caractères.", passwordMatch: "Les mots de passe ne correspondent pas.", passwordOk: "Mot de passe modifié !", passwordErro: "Erreur. Réessayez.", reclamacoes: "Réclamations", novaReclamacao: "Nouvelle réclamation", assunto: "Sujet", mensagem: "Message", enviarReclamacao: "Envoyer", reclamacaoEnviada: "Réclamation envoyée !", reclamacaoPendente: "En attente", reclamacaoResolvida: "Résolue", semReclamacoes: "Aucune réclamation.", assuntoPlaceholder: "Ex: Article endommagé...", mensagemPlaceholder: "Décrivez le problème...", avaliacoes: "Évaluations", avaliarExperiencia: "Évaluez votre expérience", avaliacaoEnviada: "Évaluation envoyée ! Merci.", comentarioPlaceholder: "Laissez un commentaire (facultatif)...", enviarAvaliacao: "Envoyer", tuaAvaliacao: "Votre évaluation", avaliacaoEmpresa: "Évaluation de Nora Grei", semAvaliacoes: "Pas encore de locations terminées.", tabPerfil: "Profil", tabPedidos: "Commandes", tabGuardados: "Favoris", tabLoja: "Ma boutique", tabMensagens: "Messages", caucaoLabel: "Dépôt", semPedidos: "Vous n'avez pas encore de commandes.", explorarCatalogo: "Explorer le catalogue →", pecasGuardadas: "Pièces sauvegardées", semGuardados: "Vous n'avez encore rien sauvegardé.", indisponivel: "Indisponible", disponivel: "Disponible", alugada: "Louée", disponivelEm: "Disponible dans", alugar: "Louer →", reservar: "Réserver →", selecionar: "— Sélectionner —", moradaEntrega: "Adresse de livraison", moradaVazia: "Non renseignée", documentosIdentidade: "Documents d'identité", docsVazios: "Non renseignés", docsDesc: "Nécessaires pour la vérification d'identité et le dépôt.",
  },
  lt: {
    titulo: "Mano profilis", dadosPessoais: "Asmeniniai duomenys",
    nome: "Vardas, pavardė", email: "El. paštas", telefone: "Telefonas",
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
    pago: "✓ Apmokėta", aguardarPagamento: "Laukiama mokėjimo", mudarPassword: "Keisti slaptažodį", novaPassword: "Naujas slaptažodis", confirmarPassword: "Patvirtinti", guardarPassword: "Išsaugoti", passwordMin: "Mažiausiai 6 simboliai.", passwordMatch: "Slaptažodžiai nesutampa.", passwordOk: "Slaptažodis pakeistas!", passwordErro: "Klaida. Bandykite dar kartą.", reclamacoes: "Skundai", novaReclamacao: "Naujas skundas", assunto: "Tema", mensagem: "Žinutė", enviarReclamacao: "Siųsti", reclamacaoEnviada: "Skundas išsiųstas!", reclamacaoPendente: "Laukiama", reclamacaoResolvida: "Išspręsta", semReclamacoes: "Nėra skundų.", assuntoPlaceholder: "Pvz: Sugadintas drabužis...", mensagemPlaceholder: "Aprašykite problemą...", avaliacoes: "Atsiliepimai", avaliarExperiencia: "Įvertinkite savo patirtį", avaliacaoEnviada: "Atsiliepimas išsiųstas!", comentarioPlaceholder: "Palikite komentarą...", enviarAvaliacao: "Siųsti", tuaAvaliacao: "Jūsų įvertinimas", avaliacaoEmpresa: "Nora Grei įvertinimas", semAvaliacoes: "Dar nėra užbaigtų nuomų.", tabPerfil: "Profilis", tabPedidos: "Užsakymai", tabGuardados: "Išsaugoti", tabLoja: "Mano parduotuvė", tabMensagens: "Žinutės", caucaoLabel: "Užstatas", semPedidos: "Dar neturite užsakymų.", explorarCatalogo: "Naršyti katalogą →", pecasGuardadas: "Išsaugoti drabužiai", semGuardados: "Dar nieko neišsaugojote.", indisponivel: "Neprieinama", disponivel: "Prieinama", alugada: "Išnuomota", disponivelEm: "Prieinama po", alugar: "Nuomoti →", reservar: "Rezervuoti →", selecionar: "— Pasirinkti —", moradaEntrega: "Pristatymo adresas", moradaVazia: "Nepildyta", documentosIdentidade: "Tapatybės dokumentai", docsVazios: "Nepildyti", docsDesc: "Reikalingi tapatybės patikrinimui ir užstatui.",
  },
};

function WishlistCard({ p, eDisponivel, i }) {
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
            <div style={{display:"inline-block",fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#27ae60",background:"rgba(39,174,96,0.08)",padding:"0.15rem 0.4rem",borderRadius:"2px",marginBottom:"0.5rem"}}>{i.disponivel}</div>
            <a href={`/catalogo/${p.id}`} style={{display:"block",textAlign:"center",padding:"0.45rem 0",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",background:"#c4748a",color:"#fff",textDecoration:"none",borderRadius:"2px"}}>{i.alugar}</a>
          </>
        ) : (
          <>
            <div style={{display:"inline-block",fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#c0392b",background:"rgba(192,57,43,0.08)",padding:"0.15rem 0.4rem",borderRadius:"2px",marginBottom:"0.35rem"}}>{i.alugada}</div>
            {tempo && (
              <div style={{fontSize:"0.65rem",color:"var(--g5)",marginBottom:"0.35rem"}}>
                <span style={{color:"var(--g4)"}}>{i.disponivelEm}: </span>
                <span style={{fontWeight:600,color:"var(--black)"}}>{tempo}</span>
              </div>
            )}
            {!tempo && p._dataDisponivel && (
              <div style={{fontSize:"0.65rem",color:"var(--g5)",marginBottom:"0.35rem"}}>
                {i.disponivelEm}: {new Date(p._dataDisponivel).toLocaleDateString()}
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
              <div style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.3rem"}}>{i.tuaAvaliacao}</div>
              <StarRating value={nota} readonly />
              {avaliacao?.comentario_cliente && <p style={{fontSize:"0.82rem",color:"var(--g6)",marginTop:"0.4rem",fontStyle:"italic"}}>"{avaliacao.comentario_cliente}"</p>}
              {avaliacao?.nota_empresa_cliente && (
                <div style={{marginTop:"1rem",paddingTop:"0.75rem",borderTop:"1px solid var(--g1)"}}>
                  <div style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#c4748a",marginBottom:"0.3rem"}}>{i.avaliacaoEmpresa}</div>
                  <StarRating value={avaliacao.nota_empresa_cliente} readonly />
                  {avaliacao.comentario_empresa && <p style={{fontSize:"0.82rem",color:"var(--g6)",marginTop:"0.4rem",fontStyle:"italic"}}>"{avaliacao.comentario_empresa}"</p>}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.5rem"}}>{i.avaliarExperiencia}</div>
              <StarRating value={nota} onChange={setNota} />
              {nota > 0 && (
                <>
                  <textarea value={comentario} onChange={e => setComentario(e.target.value)} placeholder={i.comentarioPlaceholder}
                    style={{width:"100%",marginTop:"0.75rem",padding:"0.75rem",border:"1.5px solid var(--g2)",background:"var(--white)",fontFamily:"sans-serif",fontSize:"0.85rem",color:"var(--black)",resize:"vertical",minHeight:"80px",outline:"none"}} />
                  <button onClick={enviar} disabled={loading}
                    style={{marginTop:"0.5rem",padding:"0.6rem 1.5rem",background:"var(--black)",color:"var(--white)",border:"none",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontWeight:500}}>
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
                <div style={{fontSize:"0.55rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g4)",marginBottom:"0.3rem"}}>Avaliação do cliente</div>
                {estrelas(av.nota_cliente_lojista, null)}
                {av.comentario_cliente && <p style={{fontSize:"0.78rem",color:"var(--g4)",marginTop:"0.3rem",fontStyle:"italic"}}>"{av.comentario_cliente}"</p>}
              </div>
            ) : (
              <p style={{fontSize:"0.75rem",color:"#aaa",marginBottom:"0.75rem",fontStyle:"italic"}}>Cliente ainda não avaliou.</p>
            )}

            <div style={{background:"#fdf6f8",padding:"0.75rem",borderLeft:"2px solid #c4748a"}}>
              <div style={{fontSize:"0.55rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#c4748a",marginBottom:"0.4rem"}}>
                {jaRespondeu ? "A tua avaliação do cliente" : "Avaliar este cliente"}
              </div>
              {estrelas(jaRespondeu || r.nota, jaRespondeu ? null : (v) => setRespostas(prev=>({...prev,[a.id]:{...r,nota:v}})))}
              {!jaRespondeu && r.nota > 0 && (
                <>
                  <textarea value={r.comentario} onChange={e=>setRespostas(prev=>({...prev,[a.id]:{...r,comentario:e.target.value}}))}
                    placeholder="Comentário opcional sobre o cliente..."
                    style={{width:"100%",marginTop:"0.5rem",padding:"0.5rem",border:"1.5px solid var(--g2)",background:"#fff",fontFamily:"var(--sans)",fontSize:"0.8rem",resize:"vertical",minHeight:"60px",outline:"none"}} />
                  <button onClick={()=>enviarResposta(a)} disabled={loadingIds[a.id]}
                    style={{marginTop:"0.5rem",padding:"0.5rem 1.1rem",background:"#c4748a",color:"#fff",border:"none",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"var(--sans)",cursor:"pointer"}}>
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

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({ nome: "", telefone: "", morada: "", numero_porta: "", andar: "", avatar_url: "", nif: "", numero_cc: "", data_nascimento: "", genero: "", profissao: "", cidade: "", pais: "Portugal", codigo_postal: "", latitude: null, longitude: null });
  const [stats, setStats] = useState({ totalAlugueres: 0, totalGasto: 0, pecasAtivas: 0, reservas: 0, pontos: 0, totalPecas: 0 });
  const [alugueres, setAlugueres] = useState([]);
  const [wishlistPecas, setWishlistPecas] = useState([]);
  const [reservasDisponiveis, setReservasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardado, setGuardado] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [detectandoLoc, setDetectandoLoc] = useState(false);
  const [locDetectada, setLocDetectada] = useState(false);
  const [lang, setLang] = useState("pt");
  const [modoLojista, setModoLojista] = useState(false);
  const [tabAtiva, setTabAtiva] = useState("perfil");
  const [naoLidasMsg, setNaoLidasMsg] = useState(0);
  const [pecasLoja, setPecasLoja] = useState([]);
  const [alugueresLoja, setAlugueresLoja] = useState([]);
  const [diasTeste, setDiasTeste] = useState(180);
  const [codigoLoja, setCodigoLoja] = useState(null);
  const [tabLoja, setTabLoja] = useState("dashboard");
  const [showNovaPeca, setShowNovaPeca] = useState(false);
  const [novaPeca, setNovaPeca] = useState({ nome: "", descricao: "", preco_aluguer_dia: "", preco_venda: "", valor_peca: "", material: "", ocasioes: [], tamanhos: [{ tamanho: "M", quantidade: 1 }] });
  const [novaPecaLoading, setNovaPecaLoading] = useState(false);
  const [editarPeca, setEditarPeca] = useState(null);
  const [editarLoading, setEditarLoading] = useState(false);
  const [modalEnvio, setModalEnvio] = useState(null); // aluguer a marcar como enviado
  const [trackingInfo, setTrackingInfo] = useState({ transportadora: "", numero: "" });
  const [modalVerificar, setModalVerificar] = useState(null); // aluguer a verificar devolução
  const [fotosLojista, setFotosLojista] = useState([]);
  const [uploadProgressLoja, setUploadProgressLoja] = useState("");
  const fotosLojistaRef = typeof window !== "undefined" ? { current: null } : { current: null };
  const [lojaIban, setLojaIban] = useState("");
  const [lojaEstado, setLojaEstado] = useState("inativo");
  const [candidaturaLojista, setCandidaturaLojista] = useState(null); // null | "pendente" | "recusada"
  const [showFormLojista, setShowFormLojista] = useState(false);
  const [formLojista, setFormLojista] = useState({ nome_loja: "", descricao: "", iban: "", tipo_pagamento: "transferencia", aceita_termos: false });
  const [formLojistaMsg, setFormLojistaMsg] = useState("");
  const [formLojistaLoading, setFormLojistaLoading] = useState(false);
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
  const [secaoAberta, setSecaoAberta] = useState("pessoal"); // "pessoal" | "morada" | "docs" | "seguranca" | "suporte"
  const fileRef = useRef();

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
      setPerfil({ nome: c.nome||"", telefone: c.telefone||"", morada: c.morada||"", numero_porta: c.numero_porta||"", andar: c.andar||"", avatar_url: user.user_metadata?.avatar_url||"", nif: c.nif||"", numero_cc: c.numero_cc||"", data_nascimento: c.data_nascimento||"", genero: c.genero||"", profissao: c.profissao||"", cidade: c.cidade||"", pais: c.pais||"Portugal", codigo_postal: c.codigo_postal||"", latitude: c.latitude||null, longitude: c.longitude||null });
      if (c.modo_lojista) {
        setModoLojista(true);
        setLojaEstado(c.lojista_estado||"teste");
        if (c.codigo_cliente) setCodigoLoja(c.codigo_cliente);
        setLojaIban(c.lojista_iban||"");
        if (c.candidatura_lojista) setCandidaturaLojista(c.candidatura_lojista);
        if (c.lojista_desde) {
          const diasPassados = Math.floor((new Date() - new Date(c.lojista_desde)) / 86400000);
          setDiasTeste(Math.max(0, 180 - diasPassados));
        }
        const { data: ps } = await supabase.from("pecas_lojista").select("*, stock_lojista(*)").eq("cliente_id", user.id).order("created_at", { ascending: false });
        if (ps) setPecasLoja(ps);
        if (ps && ps.length > 0) {
          const { data: als } = await supabase.from("alugueres_lojista").select("*, clientes(nome, email, telefone, cidade), pecas_lojista(nome, fotos, preco_aluguer_dia), stock_lojista(tamanho)").eq("lojista_id", user.id).order("created_at", { ascending: false });
          if (als) setAlugueresLoja(als);
        }
      } else {
        // Não é lojista — verificar se tem candidatura pendente
        if (c.candidatura_lojista) setCandidaturaLojista(c.candidatura_lojista);
      }
    }

    const { data: al } = await supabase.from("alugueres").select("*, stock_tamanhos(tamanho, pecas(nome, codigo_referencia, preco_aluguer_dia, fotos))").eq("cliente_id", user.id).order("created_at", { ascending: false });
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

  const guardarPerfil = async () => {
    if (!user) return;
    const perfilCompleto = CAMPOS_OBRIGATORIOS.every(campo => perfil[campo] && perfil[campo].toString().trim() !== "");
    await supabase.from("clientes").upsert({ id: user.id, email: user.email, nome: perfil.nome, telefone: perfil.telefone, morada: perfil.morada, numero_porta: perfil.numero_porta, andar: perfil.andar, nif: perfil.nif, numero_cc: perfil.numero_cc, data_nascimento: perfil.data_nascimento || null, genero: perfil.genero, profissao: perfil.profissao||null, cidade: perfil.cidade, pais: perfil.pais, codigo_postal: perfil.codigo_postal, latitude: perfil.latitude, longitude: perfil.longitude, perfil_completo: perfilCompleto });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const uploadFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingFoto(true);
    const ext = file.name.split(".").pop();
    const { error } = await supabase.storage.from("avatars").upload(`${user.id}/avatar.${ext}`, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(`${user.id}/avatar.${ext}`);
      setPerfil(prev => ({ ...prev, avatar_url: data.publicUrl }));
    }
    setUploadingFoto(false);
  };

  const sair = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  const submeterCandidaturaLojista = async () => {
    if (!formLojista.nome_loja.trim()) { setFormLojistaMsg("Indica o nome da tua loja."); return; }
    if (!formLojista.iban.trim()) { setFormLojistaMsg("Indica o teu IBAN ou NIB para receberes pagamentos."); return; }
    if (!formLojista.aceita_termos) { setFormLojistaMsg("Tens de aceitar os termos para continuar."); return; }
    setFormLojistaLoading(true);
    setFormLojistaMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setFormLojistaLoading(false); return; }
    const candidatura = {
      nome_loja: formLojista.nome_loja.trim(),
      descricao: formLojista.descricao.trim(),
      iban: formLojista.iban.trim().toUpperCase(),
      tipo_pagamento: formLojista.tipo_pagamento,
      submetida_em: new Date().toISOString(),
    };
    const { error } = await supabase.from("clientes").update({
      candidatura_lojista: "pendente",
      lojista_candidatura_dados: candidatura,
    }).eq("id", user.id);
    setFormLojistaLoading(false);
    if (error) {
      setFormLojistaMsg("Erro ao submeter. Tenta novamente.");
    } else {
      setCandidaturaLojista("pendente");
      setShowFormLojista(false);
    }
  };

  const guardarNovaPeca = async () => {
    if (!novaPeca.nome || !novaPeca.preco_aluguer_dia) return;
    setNovaPecaLoading(true);
    setUploadProgressLoja("A criar peça...");
    const { data: { session } } = await supabase.auth.getSession();
    const { data: peca } = await supabase.from("pecas_lojista").insert({
      cliente_id: session.user.id,
      nome: novaPeca.nome,
      descricao: novaPeca.descricao||null,
      preco_aluguer_dia: parseFloat(novaPeca.preco_aluguer_dia),
      preco_venda: novaPeca.preco_venda ? parseFloat(novaPeca.preco_venda) : null,
      valor_peca: novaPeca.valor_peca ? parseFloat(novaPeca.valor_peca) : null,
      material: novaPeca.material||null,
      ocasioes: novaPeca.ocasioes,
      estado: "disponivel",
      codigo_referencia: `${cliente?.codigo_cliente || "NG"}-${String(pecasLoja.length + 1).padStart(3, "0")}`,
    }).select().single();
    if (peca) {
      for (const t of novaPeca.tamanhos) {
        await supabase.from("stock_lojista").insert({ peca_id: peca.id, tamanho: t.tamanho, quantidade_total: t.quantidade, quantidade_disponivel: t.quantidade });
      }
      if (fotosLojista.length > 0) {
        const urls = [];
        for (const foto of fotosLojista) {
          const ext = foto.name.split(".").pop();
          const path = `${peca.id}/${Date.now()}.${ext}`;
          setUploadProgressLoja(`A fazer upload de ${foto.name}...`);
          const { error: upErr } = await supabase.storage.from("pecas_lojista").upload(path, foto, { upsert: true });
          if (!upErr) { const { data } = supabase.storage.from("pecas_lojista").getPublicUrl(path); urls.push(data.publicUrl); }
        }
        if (urls.length > 0) { await supabase.from("pecas_lojista").update({ fotos: urls }).eq("id", peca.id); }
      }
      setUploadProgressLoja("✓ Peça adicionada!");
      const { data: ps } = await supabase.from("pecas_lojista").select("*, stock_lojista(*)").eq("cliente_id", session.user.id).order("created_at", { ascending: false });
      if (ps) setPecasLoja(ps);
    }
    setShowNovaPeca(false);
    setNovaPeca({ nome: "", descricao: "", preco_aluguer_dia: "", preco_venda: "", valor_peca: "", material: "", ocasioes: [], tamanhos: [{ tamanho: "M", quantidade: 1 }] });
    setFotosLojista([]);
    setUploadProgressLoja("");
    setNovaPecaLoading(false);
  };

  const guardarEdicaoPeca = async () => {
    if (!editarPeca || !editarPeca.nome) return;
    setEditarLoading(true);
    await supabase.from("pecas_lojista").update({
      nome: editarPeca.nome,
      descricao: editarPeca.descricao || null,
      preco_aluguer_dia: editarPeca.preco_aluguer_dia ? parseFloat(editarPeca.preco_aluguer_dia) : null,
      preco_venda: editarPeca.preco_venda ? parseFloat(editarPeca.preco_venda) : null,
      valor_peca: editarPeca.valor_peca ? parseFloat(editarPeca.valor_peca) : null,
      material: editarPeca.material || null,
      ocasioes: editarPeca.ocasioes || [],
    }).eq("id", editarPeca.id);
    // reload peças
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: ps } = await supabase.from("pecas_lojista").select("*, stock_lojista(*)").eq("cliente_id", session.user.id).order("created_at", { ascending: false });
      if (ps) setPecasLoja(ps);
    }
    setEditarPeca(null);
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
    { sigla: "BRZ", nome: _nm.bronze, cor: "#a8632f", caucao: "100%" },
    { sigla: "PRT", nome: _nm.prata,  cor: "#6b7280", caucao: "75%" },
    { sigla: "OUR", nome: _nm.ouro,   cor: "#b8860b", caucao: "50%" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g3:#c8c4bc;--g4:#7a776f;--g5:#4a4844;--g6:#2b2a28;--rosa:#c4748a;--serif:'Cormorant',Georgia,serif;--sans:'Jost',Arial,sans-serif}
        body{background:var(--g1);font-family:var(--sans);font-size:17px;-webkit-font-smoothing:antialiased}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 4rem;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2)}
        .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:400;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
        .nav-back{font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g6);text-decoration:none}
        .page{padding:6rem 4rem 4rem;max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:1.5rem}
        .hero{background:var(--white);padding:2.5rem;display:flex;align-items:center;gap:2rem}
        .avatar-wrap{position:relative;flex-shrink:0}
        .avatar{width:96px;height:96px;border-radius:50%;object-fit:cover}
        .avatar-ph{width:96px;height:96px;border-radius:50%;background:var(--g2);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:2.5rem;font-weight:300;color:var(--g6)}
        .avatar-btn{position:absolute;bottom:0;right:0;width:36px;height:36px;border-radius:50%;background:var(--black);color:var(--white);border:2.5px solid var(--white);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.1rem;box-shadow:0 2px 8px rgba(0,0,0,0.18);touch-action:manipulation;-webkit-tap-highlight-color:transparent}
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
        .nivel-info{display:flex;justify-content:space-between;font-size:0.72rem;color:var(--g6);margin-top:0.4rem}
        .nivel-beneficios{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--g1)}
        .beneficio{text-align:center;padding:1rem}
        .beneficio-sigla{font-family:var(--serif);font-size:1.1rem;font-weight:500;margin-bottom:0.3rem}
        .beneficio-label{font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--g6)}
        .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--g2)}
        .stat{background:var(--white);padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:background 0.2s}
        .stat:hover{background:var(--g1)}
        .stat-val{font-family:var(--serif);font-size:2rem;font-weight:600;margin-bottom:0.4rem;color:#080808}
        .stat-label{font-size:0.58rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--g6)}
        .pontos-card{background:var(--white);padding:2rem 2.5rem}
        .pontos-circles{display:flex;gap:0.5rem;margin-top:1rem;flex-wrap:wrap}
        .ponto{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700}
        .card{background:var(--white);padding:2rem 2.5rem}
        .card-t{font-size:0.65rem;letter-spacing:0.25em;text-transform:uppercase;color:var(--g6);font-weight:600;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--g1)}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
        .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.25rem}
        .full{grid-column:1/-1}
        .fg{display:flex;flex-direction:column;gap:0.5rem}
        .lbl{font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;color:#1a1a18;font-weight:600}
        .inp{width:100%;padding:0.9rem 1rem;border:1.5px solid var(--g2);background:var(--white);font-size:1rem;font-family:var(--sans);color:var(--black);outline:none}
        .inp:focus{border-color:var(--black)}
        .inp:disabled{background:var(--g1);color:var(--g6)}
        .inp::placeholder{color:#7a7874}
        .loc-btn{display:flex;align-items:center;gap:0.5rem;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--black);background:none;border:1.5px solid var(--g2);padding:0.9rem 1rem;cursor:pointer;font-family:var(--sans);font-weight:600;width:100%}
        .loc-btn:hover{border-color:var(--black)}
        .save-row{display:flex;align-items:center;gap:1rem;margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--g1)}
        .btn-save{padding:0.9rem 2.5rem;background:var(--black);color:var(--white);border:none;font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;font-weight:600}
        .btn-save:hover{background:#2e2d2b}
        .btn-ok{background:#1e7e3e}
        .divider{height:1px;background:var(--g1);margin:1.25rem 0}
        .nota-obrigatorio{font-size:0.7rem;color:var(--g6);font-style:italic;margin-top:0.5rem}
        .aluguer-card{background:var(--white);padding:1.25rem 1.5rem;margin-bottom:1px}
        .aluguer-row{display:flex;align-items:flex-start;gap:1.5rem}
        .aluguer-img{width:56px;height:70px;flex-shrink:0;background:var(--g1);overflow:hidden;display:flex;align-items:center;justify-content:center}
        .aluguer-nome{font-family:var(--serif);font-size:1.15rem;font-weight:400;margin-bottom:0.2rem}
        .aluguer-ref{font-size:0.64rem;color:#9c4d63;font-weight:700;font-family:monospace;letter-spacing:0.05em}
        .aluguer-meta{font-size:0.82rem;color:var(--g6)}
        .estado-badge{font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;padding:0.3rem 0.7rem;font-weight:600;display:inline-block;margin-top:0.4rem}
        .btn-pedidos{display:block;width:100%;padding:1rem;background:var(--g1);color:var(--black);border:none;font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;text-align:center;text-decoration:none;margin-top:1rem;font-weight:600}
        .btn-pedidos:hover{background:var(--g2)}
        .btn-sair{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g6);background:none;border:none;cursor:pointer;font-family:var(--sans);text-decoration:underline}
        .btn-sair:hover{color:#c0392b}
        @media(max-width:768px){
          .nav{padding:1rem 1.25rem}
          .page{padding:5rem 1.25rem 6rem;gap:1rem}
          .hero{flex-direction:column;align-items:flex-start;padding:1.5rem;gap:1rem}
          .stats{grid-template-columns:repeat(3,1fr)}
          .nivel-beneficios{grid-template-columns:1fr 1fr}
          .card{padding:1.5rem}
          .grid2{grid-template-columns:1fr}
          .grid3{grid-template-columns:1fr}
          .full{grid-column:auto}
          .aluguer-row{flex-direction:row}
        }
      `}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <NotificationBell lang={lang} />
          <a href="/" className="nav-back">{i.voltarInicio}</a>
        </div>
      </nav>

      <div className="page">

        <div style={{display:"flex",borderBottom:"2px solid var(--g2)",marginBottom:"1.5rem",overflowX:"auto"}}>
          {[
            {id:"perfil",label:i.tabPerfil},
            {id:"pedidos",label:i.tabPedidos, badge: alugueresAtivos.length > 0 ? alugueresAtivos.length : null},
            {id:"guardados",label:i.tabGuardados, badge: wishlistPecas.length > 0 ? wishlistPecas.length : null},
            ...(modoLojista ? [{id:"loja",label:i.tabLoja}] : []),
          ].map(tab => (
            <button key={tab.id} onClick={() => setTabAtiva(tab.id)} style={{padding:"0.85rem 1.25rem",fontSize:"0.65rem",letterSpacing:"0.18em",textTransform:"uppercase",background:"none",border:"none",borderBottom:tabAtiva===tab.id?"2px solid #c4748a":"2px solid transparent",color:tabAtiva===tab.id?"#c4748a":"var(--g4)",cursor:"pointer",fontFamily:"var(--sans)",marginBottom:"-2px",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:"0.35rem"}}>
              {tab.label}
              {tab.badge && <span style={{background:"#c4748a",color:"#fff",fontSize:"0.55rem",padding:"0.1rem 0.4rem",borderRadius:"10px",fontWeight:600}}>{tab.badge}</span>}
            </button>
          ))}
          <a href="/mensagens" style={{padding:"0.85rem 1.25rem",fontSize:"0.65rem",letterSpacing:"0.18em",textTransform:"uppercase",borderBottom:"2px solid transparent",color:"var(--g4)",cursor:"pointer",fontFamily:"var(--sans)",marginBottom:"-2px",textDecoration:"none",display:"flex",alignItems:"center",gap:"0.4rem",whiteSpace:"nowrap"}}>
            {i.tabMensagens}
            {naoLidasMsg > 0 && <span style={{background:"#c4748a",color:"#fff",fontSize:"0.55rem",padding:"0.1rem 0.4rem",borderRadius:"10px"}}>{naoLidasMsg}</span>}
          </a>
        </div>

        <div style={{display:modoLojista && tabAtiva==="loja"?"none":"block"}}>

        {/* TAB PEDIDOS */}
        {tabAtiva === "pedidos" && (
          <div style={{padding:"0 0 2rem"}}>
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
                              {peca?.fotos?.[0] ? <img src={peca.fotos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <span style={{fontFamily:"'Cormorant',serif",fontSize:"1.5rem",color:"rgba(0,0,0,0.15)",fontStyle:"italic"}}>NG</span>}
                            </div>
                            <div style={{flex:1}}>
                              <div className="aluguer-nome">{peca?.nome || "—"}</div>
                              {peca?.codigo_referencia && <div className="aluguer-ref">{i.referencia} {peca.codigo_referencia}</div>}
                              <div className="aluguer-meta">{a.data_inicio} → {a.data_fim} · {a.valor_aluguer}€</div>
                              <span className="estado-badge" style={{background:ei.bg,color:ei.cor}}>{ei.label}</span>
                              <TimerInfo aluguer={a} lang={lang} />
                              {a.estado === "enviado" && <BotaoConfirmarRecepcao aluguer={a} i={i} onConfirmado={carregarPerfil} />}
                              <BotaoVerTalao aluguer={a} i={i} />
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
                              {peca?.fotos?.[0] ? <img src={peca.fotos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <span style={{fontFamily:"'Cormorant',serif",fontSize:"1.5rem",color:"rgba(0,0,0,0.15)",fontStyle:"italic"}}>NG</span>}
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
            <p style={{fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--g4)",marginBottom:"1.25rem",fontFamily:"var(--sans)"}}>{i.pecasGuardadas}</p>
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
                    <WishlistCard key={p.id} p={p} eDisponivel={eDisponivel} i={i} />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PERFIL NORMAL — oculto nas tabs guardados, pedidos e loja */}
        <div style={{display: (tabAtiva === "guardados" || tabAtiva === "pedidos" || tabAtiva === "loja") ? "none" : "block"}}>
        <div className="hero">
          <div className="avatar-wrap">
            {perfil.avatar_url ? <img src={perfil.avatar_url} alt="Avatar" className="avatar" /> : <div className="avatar-ph">{perfil.nome?.[0]?.toUpperCase()||"?"}</div>}
            <button className="avatar-btn" onClick={() => fileRef.current?.click()}>{uploadingFoto?"...":"+"}</button>
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={uploadFoto} />
          </div>
          <div>
            <div className="hero-nome">{perfil.nome || "—"}</div>
            <div className="hero-email">{user?.email}</div>
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
              <div style={{fontSize:'0.6rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--g6)',marginBottom:'0.4rem'}}>{i.nivelConfianca}</div>
              <div className="nivel-badge" style={{color: nv.cor}}>
                <span style={{fontWeight:700}}>{nv.nome}</span>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'var(--serif)',fontSize:'2rem',fontWeight:300,color:nv.cor}}>{nv.caucao===0?i.semCaucao:nv.caucao+"%"}</div>
              <div style={{fontSize:'0.75rem',color:'var(--g6)'}}>{i.caucao}</div>
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
        </div>

        <div className="pontos-card">
          <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:'var(--g6)',fontWeight:600}}>{i.pontosFidelizacao}</p>
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

        {/* SECÇÃO: Dados pessoais */}
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div onClick={() => setSecaoAberta(s => s==="pessoal"?null:"pessoal")} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.5rem 2rem",cursor:"pointer",userSelect:"none"}}>
            <div>
              <p style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:400,color:"var(--black)",margin:0}}>{i.dadosPessoais}</p>
              {secaoAberta !== "pessoal" && <p style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.2rem"}}>{perfil.nome || "—"} · {perfil.telefone || "—"}</p>}
            </div>
            <span style={{color:"var(--g4)",fontSize:"0.85rem"}}>{secaoAberta==="pessoal"?"▲":"▼"}</span>
          </div>
          {secaoAberta === "pessoal" && (
            <div style={{padding:"0 2rem 2rem"}}>
              <div className="grid2">
                <div className="fg"><label className="lbl">{i.nome} *</label><input className="inp" value={perfil.nome} onChange={e => set("nome", e.target.value)} placeholder="Maria Silva" /></div>
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
        <div className="card" style={{padding:0,overflow:"hidden"}}>
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
        <div className="card" style={{padding:0,overflow:"hidden"}}>
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

        {alugueresHistorico.length > 0 && (
          <div style={{textAlign:"center",padding:"0.5rem 0"}}>
            <a href="/pedidos" style={{fontSize:"0.7rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g4)",textDecoration:"none",fontFamily:"var(--sans)"}}>{i.verPedidos} →</a>
          </div>
        )}
        {/* SECÇÃO: Segurança */}
        <div className="card" style={{padding:0,overflow:"hidden"}}>
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
                        <span style={{fontSize:"0.62rem",letterSpacing:"0.1em",textTransform:"uppercase",color:r.estado==="resolvida"?"#27ae60":"#f39c12"}}>{r.estado==="resolvida"?i.reclamacaoResolvida:i.reclamacaoPendente}</span>
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

        {/* BLOCO LOJISTA — CTA / formulário / estado candidatura */}
        {!modoLojista && (
          <div style={{margin:"2rem 0 3rem"}}>

            {/* Estado: candidatura pendente */}
            {candidaturaLojista === "pendente" && (
              <div style={{padding:"2rem",background:"#f0f7f0",border:"1px solid #b8dbb8",textAlign:"center"}}>
                <div style={{fontSize:"1.5rem",marginBottom:"0.75rem"}}>⏳</div>
                <div style={{fontFamily:"var(--serif)",fontSize:"1.2rem",fontWeight:400,marginBottom:"0.5rem",color:"var(--black)"}}>Candidatura em análise</div>
                <p style={{fontSize:"0.82rem",color:"#4a7a4a",lineHeight:1.6,maxWidth:"380px",margin:"0 auto"}}>Recebemos o teu pedido para abrir loja. A equipa Nora Grei irá rever os teus dados e entrar em contacto em breve. Normalmente em 1–2 dias úteis.</p>
              </div>
            )}

            {/* Estado: candidatura recusada */}
            {candidaturaLojista === "recusada" && (
              <div style={{padding:"2rem",background:"#fff5f5",border:"1px solid #f5c6c6",textAlign:"center"}}>
                <div style={{fontSize:"1.5rem",marginBottom:"0.75rem"}}>✗</div>
                <div style={{fontFamily:"var(--serif)",fontSize:"1.2rem",fontWeight:400,marginBottom:"0.5rem",color:"#c0392b"}}>Candidatura não aprovada</div>
                <p style={{fontSize:"0.82rem",color:"#888",lineHeight:1.6,maxWidth:"380px",margin:"0 auto 1.25rem"}}>A tua candidatura não foi aprovada desta vez. Podes contactar-nos para mais informações.</p>
                <button onClick={() => { setCandidaturaLojista(null); setShowFormLojista(true); }} style={{padding:"0.7rem 1.8rem",background:"var(--black)",color:"var(--white)",border:"none",cursor:"pointer",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"var(--sans)",fontWeight:600}}>
                  Submeter nova candidatura
                </button>
              </div>
            )}

            {/* Estado: sem candidatura — botão inicial */}
            {!candidaturaLojista && !showFormLojista && (
              <div style={{padding:"2rem",background:"#f8f5f0",border:"1px solid #e8e3dc",textAlign:"center"}}>
                <div style={{fontFamily:"var(--serif)",fontSize:"1.3rem",fontWeight:400,marginBottom:"0.5rem",color:"var(--black)"}}>Abre a tua loja na Nora Grei</div>
                <p style={{fontSize:"0.82rem",color:"var(--g6)",lineHeight:1.6,maxWidth:"380px",margin:"0 auto 1.25rem"}}>Aluga as tuas peças de moda a outras mulheres. Sem compromissos — 180 dias de período de teste gratuito.</p>
                <button onClick={() => setShowFormLojista(true)} style={{display:"inline-block",padding:"0.9rem 2.5rem",background:"var(--black)",color:"var(--white)",border:"none",cursor:"pointer",fontSize:"0.68rem",letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:"var(--sans)",fontWeight:600}}>
                  Tornar-me Lojista →
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

                {/* Dados da loja */}
                <div style={{marginBottom:"1.25rem"}}>
                  <div style={{fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--g4)",fontWeight:600,marginBottom:"1rem",paddingBottom:"0.5rem",borderBottom:"1px solid #e2dfda"}}>Sobre a tua loja</div>
                  <div style={{marginBottom:"0.75rem"}}>
                    <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.35rem",fontWeight:500}}>Nome da loja *</label>
                    <input style={{width:"100%",padding:"0.75rem",border:"1.5px solid #e2dfda",background:"#fff",fontSize:"0.9rem",fontFamily:"var(--sans)",color:"var(--black)",outline:"none",boxSizing:"border-box"}} value={formLojista.nome_loja} onChange={e => setFormLojista(f => ({...f, nome_loja: e.target.value}))} placeholder="ex: Atelier da Maria" />
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.35rem",fontWeight:500}}>Descrição breve (opcional)</label>
                    <textarea style={{width:"100%",padding:"0.75rem",border:"1.5px solid #e2dfda",background:"#fff",fontSize:"0.9rem",fontFamily:"var(--sans)",color:"var(--black)",outline:"none",boxSizing:"border-box",resize:"vertical",minHeight:"80px"}} value={formLojista.descricao} onChange={e => setFormLojista(f => ({...f, descricao: e.target.value}))} placeholder="Que tipo de peças tens para alugar? Qual é o teu estilo?" />
                  </div>
                </div>

                {/* Dados bancários */}
                <div style={{marginBottom:"1.25rem"}}>
                  <div style={{fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--g4)",fontWeight:600,marginBottom:"1rem",paddingBottom:"0.5rem",borderBottom:"1px solid #e2dfda"}}>Dados para receber pagamentos</div>
                  <div style={{marginBottom:"0.75rem"}}>
                    <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.35rem",fontWeight:500}}>IBAN / NIB *</label>
                    <input style={{width:"100%",padding:"0.75rem",border:"1.5px solid #e2dfda",background:"#fff",fontSize:"0.9rem",fontFamily:"'Jost',monospace",color:"var(--black)",outline:"none",boxSizing:"border-box",letterSpacing:"0.05em"}} value={formLojista.iban} onChange={e => setFormLojista(f => ({...f, iban: e.target.value}))} placeholder="PT50 0002 0000 0000 0000 0000 0" />
                    <p style={{fontSize:"0.72rem",color:"var(--g4)",marginTop:"0.3rem",lineHeight:1.5}}>Usado para transferir os teus ganhos (90% de cada aluguer).</p>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--g6)",marginBottom:"0.35rem",fontWeight:500}}>Preferência de pagamento *</label>
                    <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                      {[["transferencia","Transferência bancária"],["mbway","MB Way"],["cheque","Cheque"]].map(([val,label]) => (
                        <button key={val} onClick={() => setFormLojista(f => ({...f, tipo_pagamento: val}))} style={{padding:"0.5rem 1rem",fontSize:"0.68rem",letterSpacing:"0.08em",border:"1.5px solid",borderColor:formLojista.tipo_pagamento===val?"var(--black)":"#e2dfda",background:formLojista.tipo_pagamento===val?"var(--black)":"#fff",color:formLojista.tipo_pagamento===val?"#fff":"var(--g6)",cursor:"pointer",fontFamily:"var(--sans)",transition:"all 0.15s"}}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Termos */}
                <div style={{marginBottom:"1.5rem",padding:"1rem",background:"#fff",border:"1px solid #e8e3dc"}}>
                  <label style={{display:"flex",gap:"0.75rem",alignItems:"flex-start",cursor:"pointer"}}>
                    <input type="checkbox" checked={formLojista.aceita_termos} onChange={e => setFormLojista(f => ({...f, aceita_termos: e.target.checked}))} style={{marginTop:"0.2rem",accentColor:"var(--black)",width:"16px",height:"16px",flexShrink:0}} />
                    <span style={{fontSize:"0.78rem",color:"var(--g6)",lineHeight:1.6}}>
                      Aceito os <a href="/termos-lojista" target="_blank" style={{color:"var(--black)",fontWeight:500}}>termos e condições para lojistas</a>. Entendo que recebo 90% do valor de cada aluguer, após higienização (9€ por peça). O período de teste é de 180 dias gratuitos.
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

        {modoLojista && tabAtiva === "loja" && (
          <div style={{padding:"1rem 0"}}>
            <div style={{display:"flex",gap:"0.5rem",marginBottom:"1.5rem",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                {["Dashboard","Peças","Alugueres","Liquidações","Avaliações","Estatísticas"].map((s,idx) => (
                  <button key={idx} onClick={() => setTabLoja(["dashboard","pecas","alugueres","liquidacoes","avaliacoes","estatisticas"][idx])} style={{padding:"0.4rem 1rem",fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",background:tabLoja===["dashboard","pecas","alugueres","liquidacoes","avaliacoes","estatisticas"][idx]?"var(--black)":"var(--g1)",color:tabLoja===["dashboard","pecas","alugueres","liquidacoes","avaliacoes","estatisticas"][idx]?"#fff":"var(--g4)",border:"none",cursor:"pointer",fontFamily:"var(--sans)"}}>{s}</button>
                ))}
              </div>
              {codigoLoja && (
                <a href={`/loja/${codigoLoja}`} target="_blank" rel="noopener noreferrer"
                  style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"var(--rosa)",color:"#fff",textDecoration:"none",fontFamily:"var(--sans)",fontWeight:500,whiteSpace:"nowrap"}}>
                  Ver loja pública ↗
                </a>
              )}
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
                      <div style={{fontSize:"0.55rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--g4)",marginBottom:"0.3rem"}}>Receita este mês</div>
                      <div style={{fontFamily:"var(--serif)",fontSize:"2.4rem",fontWeight:300,color:"var(--rosa)",lineHeight:1}}>{receitaMes.toFixed(0)}€</div>
                      <div style={{fontSize:"0.68rem",color:"var(--g4)",marginTop:"0.3rem"}}>{doMes.length} aluguer{doMes.length!==1?"es":""} · total acumulado {receitaTotal.toFixed(0)}€</div>
                    </div>
                    {[
                      {val:ativos.length, lbl:"Ativos agora", cor:"#27ae60"},
                      {val:pecasLoja.length, lbl:"Peças na loja", cor:"var(--rosa)"},
                    ].map((k,i)=>(
                      <div key={i} style={{background:"var(--white)",padding:"1.1rem",borderTop:`3px solid ${k.cor}`}}>
                        <div style={{fontFamily:"var(--serif)",fontSize:"1.8rem",fontWeight:300,color:k.cor}}>{k.val}</div>
                        <div style={{fontSize:"0.55rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--g4)",marginTop:"0.25rem"}}>{k.lbl}</div>
                      </div>
                    ))}
                  </div>
                  {/* Taxa de ocupação */}
                  <div style={{background:"var(--white)",padding:"1.1rem",marginBottom:"0.6rem"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
                      <span style={{fontSize:"0.58rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--g4)"}}>Taxa de ocupação (30 dias)</span>
                      <span style={{fontFamily:"var(--serif)",fontSize:"1.2rem",color:taxaOcupacao>=50?"#27ae60":taxaOcupacao>=25?"#f39c12":"#e74c3c"}}>{taxaOcupacao}%</span>
                    </div>
                    <div style={{height:6,background:"#f0eeeb"}}>
                      <div style={{height:"100%",width:`${taxaOcupacao}%`,background:taxaOcupacao>=50?"#27ae60":taxaOcupacao>=25?"#f39c12":"#e74c3c",transition:"width 0.4s"}}/>
                    </div>
                    <div style={{fontSize:"0.62rem",color:"var(--g4)",marginTop:"0.35rem"}}>{taxaOcupacao<25?"Preço pode estar alto ou peças precisam de mais visibilidade":taxaOcupacao<50?"A crescer — considera promover no feed":taxaOcupacao<75?"Boa ocupação":"Excelente — considera subir preço ou adicionar stock"}</div>
                  </div>
                  {/* Peça estrela do mês */}
                  {estrela && (
                    <div style={{background:"var(--white)",padding:"1.1rem",display:"flex",gap:"1rem",alignItems:"center"}}>
                      {estrela.foto?<img src={estrela.foto} style={{width:52,height:66,objectFit:"cover",flexShrink:0}} alt=""/>:<div style={{width:52,height:66,background:"var(--g1)",flexShrink:0}}/>}
                      <div style={{flex:1}}>
                        <div style={{fontSize:"0.55rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--rosa)",fontWeight:600,marginBottom:"0.25rem"}}>⭐ Peça do mês</div>
                        <div style={{fontFamily:"var(--serif)",fontSize:"1rem"}}>{estrela.nome}</div>
                        <div style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.2rem"}}>{estrela.total.toFixed(0)}€ gerados este mês</div>
                      </div>
                    </div>
                  )}
                  {diasTeste>0 && <div style={{marginTop:"0.6rem",fontSize:"0.65rem",color:"var(--g4)",textAlign:"center",padding:"0.6rem",background:"var(--g1)"}}>{diasTeste} dias de período teste restantes</div>}
                </div>
              );
            })()}
            {tabLoja === "pecas" && (
              <div className="card" style={{padding:0}}>
                <div style={{padding:"1rem 1.5rem",borderBottom:"1px solid var(--g1)",display:"flex",justifyContent:"flex-end"}}><button onClick={()=>setShowNovaPeca(true)} style={{fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",background:"var(--black)",color:"#fff",padding:"0.5rem 1rem",border:"none",cursor:"pointer",fontFamily:"var(--sans)"}}>+ Adicionar peça</button></div>
                {pecasLoja.length === 0 ? <p style={{padding:"2rem",textAlign:"center",fontSize:"0.85rem",color:"var(--g4)"}}>Ainda sem peças.</p> : pecasLoja.map(p=>(
                  <div key={p.id} style={{padding:"1rem 1.5rem",display:"flex",gap:"1rem",alignItems:"center",borderBottom:"1px solid var(--g1)"}}>
                    {p.fotos?.[0]?<img src={p.fotos[0]} style={{width:48,height:60,objectFit:"cover"}} alt=""/>:<div style={{width:48,height:60,background:"var(--g1)"}}/>}
                    <div style={{flex:1}}><div style={{fontFamily:"var(--serif)",fontSize:"1rem"}}>{p.nome}</div><div style={{fontSize:"0.75rem",color:"var(--g4)"}}>{p.preco_aluguer_dia ? `${p.preco_aluguer_dia}€/dia` : "—"}{p.preco_venda ? ` · ${p.preco_venda}€ venda` : ""}</div></div>
                    <button onClick={()=>setEditarPeca({...p})} style={{fontSize:"0.62rem",letterSpacing:"0.12em",textTransform:"uppercase",background:"none",border:"1.5px solid var(--g2)",padding:"0.35rem 0.75rem",cursor:"pointer",fontFamily:"var(--sans)",color:"var(--g4)",whiteSpace:"nowrap"}}>Editar</button>
                  </div>
                ))}
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
                          <span style={{fontSize:"0.58rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.2rem 0.6rem",background:estadoCor,color:"#fff",whiteSpace:"nowrap"}}>{estadoLabel}</span>
                        </div>
                        <div style={{fontSize:"0.75rem",color:"var(--g4)",marginTop:"0.2rem"}}>
                          {a.clientes?.nome} · {a.stock_lojista?.tamanho||"—"} · {a.data_inicio} → {a.data_fim}
                        </div>
                        <div style={{fontSize:"0.82rem",fontFamily:"var(--serif)",color:"var(--rosa)",marginTop:"0.25rem"}}>
                          {(a.valor_aluguer||0).toFixed(2)}€ {a.deposito_valor ? `+ ${(a.deposito_valor||0).toFixed(2)}€ dep.` : ""}
                        </div>
                        {a.tracking_numero && (
                          <div style={{marginTop:"0.6rem",background:"#e3f2fd",borderLeft:"3px solid #1976d2",padding:"0.6rem 0.85rem"}}>
                            <div style={{fontSize:"0.58rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#1976d2",fontWeight:600,marginBottom:"0.3rem"}}>📦 Envio registado</div>
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
                        <button onClick={()=>atualizarEstadoAluguer(a.id,"confirmado")} style={{fontSize:"0.62rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"#27ae60",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)"}}>✓ Confirmar</button>
                        <button onClick={()=>atualizarEstadoAluguer(a.id,"cancelado")} style={{fontSize:"0.62rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"none",border:"1.5px solid #e74c3c",color:"#e74c3c",cursor:"pointer",fontFamily:"var(--sans)"}}>✕ Recusar</button>
                      </>}
                      {a.estado === "confirmado" && <>
                        <button onClick={()=>{setModalEnvio(a);setTrackingInfo({transportadora:"",numero:""});}} style={{fontSize:"0.62rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"#8e44ad",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)"}}>📦 Marcar enviado</button>
                      </>}
                      {(a.estado === "enviado" || a.estado === "ativo") && <>
                        <button onClick={()=>atualizarEstadoAluguer(a.id,"em_devolucao")} style={{fontSize:"0.62rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"#e67e22",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)"}}>↩ Devolução iniciada</button>
                        {a.clientes?.email && <a href={`mailto:${a.clientes.email}`} style={{fontSize:"0.62rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"none",border:"1.5px solid var(--g2)",color:"var(--g4)",textDecoration:"none",fontFamily:"var(--sans)"}}>✉ Contactar</a>}
                      </>}
                      {a.estado === "em_devolucao" && <>
                        <button onClick={()=>setModalVerificar(a)} style={{fontSize:"0.62rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"var(--black)",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--sans)"}}>🔍 Verificar peça</button>
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
                            <div style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.3rem"}}>{k.lbl}</div>
                            <div style={{fontFamily:"var(--serif)",fontSize:"1.8rem",fontWeight:300,color:k.cor,lineHeight:1}}>{k.val}</div>
                            <div style={{fontSize:"0.65rem",color:"#aaa",marginTop:"0.25rem"}}>{k.nota}</div>
                          </div>
                        ))}
                      </div>

                      {/* A RECEBER */}
                      {aReceber.length > 0 && (
                        <div style={{marginBottom:"1.5rem"}}>
                          <p style={{fontSize:"0.62rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#c4748a",fontWeight:600,marginBottom:"0.75rem",paddingBottom:"0.5rem",borderBottom:"1px solid var(--g1)"}}>A receber (nos próximos 10 dias úteis)</p>
                          {aReceber.map(a => (
                            <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.6rem 0",borderBottom:"1px solid var(--g1)",fontSize:"0.82rem"}}>
                              <div>
                                <span style={{fontWeight:500}}>{a.pecas_lojista?.nome||"—"}</span>
                                <span style={{color:"#aaa",marginLeft:"0.5rem",fontSize:"0.72rem"}}>· {a.clientes?.nome}</span>
                                {a.data_verificacao && <div style={{fontSize:"0.68rem",color:"#888"}}>Verificado em {new Date(a.data_verificacao).toLocaleDateString("pt-PT")}</div>}
                              </div>
                              <span style={{color:"#c4748a",fontWeight:600}}>{((a.valor_aluguer||0)*0.9).toFixed(2)}€</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* JÁ RECEBIDO */}
                      {recebido.length > 0 && (
                        <div style={{marginBottom:"1.5rem"}}>
                          <p style={{fontSize:"0.62rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#27ae60",fontWeight:600,marginBottom:"0.75rem",paddingBottom:"0.5rem",borderBottom:"1px solid var(--g1)"}}>Já recebido</p>
                          {recebido.map(a => (
                            <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.6rem 0",borderBottom:"1px solid var(--g1)",fontSize:"0.82rem"}}>
                              <div>
                                <span style={{fontWeight:500}}>{a.pecas_lojista?.nome||"—"}</span>
                                <span style={{color:"#aaa",marginLeft:"0.5rem",fontSize:"0.72rem"}}>· {a.clientes?.nome}</span>
                                {a.liquidado_em && <div style={{fontSize:"0.68rem",color:"#888"}}>Pago em {new Date(a.liquidado_em).toLocaleDateString("pt-PT")}</div>}
                              </div>
                              <span style={{color:"#27ae60",fontWeight:600}}>{(a.valor_liquidacao||0).toFixed(2)}€</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* DEPÓSITOS CATIVOS */}
                      {depositosCativos.length > 0 && (
                        <div style={{marginBottom:"1rem"}}>
                          <p style={{fontSize:"0.62rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#e74c3c",fontWeight:600,marginBottom:"0.75rem",paddingBottom:"0.5rem",borderBottom:"1px solid var(--g1)"}}>Depósitos cativos / em disputa</p>
                          {depositosCativos.map(a => (
                            <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.6rem 0",borderBottom:"1px solid var(--g1)",fontSize:"0.82rem",background:"#fff5f5",margin:"0 -0.5rem",padding:"0.6rem 0.5rem"}}>
                              <div>
                                <span style={{fontWeight:500}}>{a.pecas_lojista?.nome||"—"}</span>
                                <span style={{color:"#aaa",marginLeft:"0.5rem",fontSize:"0.72rem"}}>· {a.clientes?.nome}</span>
                                <div style={{fontSize:"0.68rem",color:"#e74c3c",marginTop:"0.1rem"}}>{a.deposito_estado==="em_disputa"?"Em análise pela Nora Grei":"Depósito retido — danos confirmados"}</div>
                              </div>
                              <span style={{display:"inline-block",fontSize:"0.58rem",letterSpacing:"0.1em",textTransform:"uppercase",padding:"0.2rem 0.5rem",fontWeight:600,background:"#fff5f5",color:"#e74c3c"}}>{a.deposito_estado}</span>
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
            {tabLoja === "avaliacoes" && (
              <div className="card" style={{padding:"1.5rem"}}>
                <AvaliacoesLojista alugueresLoja={alugueresLoja} clienteId={clienteData?.id} />
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
                    return { key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`, label: d.toLocaleDateString("pt-PT",{month:"short",year:"numeric"}) };
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
                      <p style={{fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#888",fontWeight:600,marginBottom:"1.25rem"}}>Receita líquida — últimos 6 meses</p>
                      <div style={{display:"flex",alignItems:"flex-end",gap:"0.5rem",height:120}}>
                        {receitaMes.map(m=>(
                          <div key={m.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem"}}>
                            <div style={{fontSize:"0.62rem",color:"#c4748a",fontWeight:600}}>{m.val>0?`${m.val.toFixed(0)}€`:""}</div>
                            <div style={{width:"100%",background:"#c4748a",height:`${Math.round((m.val/maxReceita)*80)+4}px`,minHeight:4,transition:"height 0.3s"}}/>
                            <div style={{fontSize:"0.55rem",color:"#aaa",textAlign:"center",letterSpacing:"0.05em"}}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Breakeven por peça */}
                    <div className="card" style={{padding:"1.5rem",marginBottom:"1rem"}}>
                      <p style={{fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#888",fontWeight:600,marginBottom:"1.25rem"}}>Breakeven por peça</p>
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
                            <span style={{fontSize:"0.62rem",color:"#aaa"}}>{p.receitaGerada.toFixed(0)}€ gerados</span>
                            <span style={{fontSize:"0.62rem",color:"#aaa"}}>{p.valor_peca?`objetivo ${p.valor_peca}€`:"valor peça não definido"}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pareto */}
                    {rankPecas.length>0 && (
                      <div className="card" style={{padding:"1.5rem"}}>
                        <p style={{fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#888",fontWeight:600,marginBottom:"1.25rem"}}>Pareto — top peças por receita</p>
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
                              <span style={{fontSize:"0.6rem",color:"#aaa",width:36,flexShrink:0,textAlign:"right"}}>{p.alugs}x</span>
                            </div>
                          );
                        })}
                        <p style={{fontSize:"0.65rem",color:"#aaa",marginTop:"1rem",borderTop:"1px solid var(--g1)",paddingTop:"0.75rem"}}>
                          {rankPecas.length>=3 ? `As top 3 peças geram ${(rankPecas.slice(0,3).reduce((s,p)=>s+p.total,0)/totalGeral*100).toFixed(0)}% da receita total.` : ""}
                        </p>
                      </div>
                    )}
                  </>);
                })()}
              </div>
            )}
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
      {editarPeca && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"1rem",overflowY:"auto"}}>
          <div style={{background:"#fff",padding:"2rem",maxWidth:"480px",width:"100%",marginTop:"2rem"}}>
            <h3 style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:300,marginBottom:"1.5rem"}}>Editar peça</h3>
            <div className="fg"><label className="lbl">Nome *</label><input className="inp" value={editarPeca.nome||""} onChange={e=>setEditarPeca(p=>({...p,nome:e.target.value}))} /></div>
            <div className="fg"><label className="lbl">Descrição</label><textarea className="inp" value={editarPeca.descricao||""} onChange={e=>setEditarPeca(p=>({...p,descricao:e.target.value}))} style={{resize:"vertical",minHeight:"80px"}} /></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
              <div className="fg"><label className="lbl">Preço aluguer/dia (€)</label><input className="inp" type="number" value={editarPeca.preco_aluguer_dia||""} onChange={e=>setEditarPeca(p=>({...p,preco_aluguer_dia:e.target.value}))} placeholder="25" /></div>
              <div className="fg"><label className="lbl">Preço venda (€)</label><input className="inp" type="number" value={editarPeca.preco_venda||""} onChange={e=>setEditarPeca(p=>({...p,preco_venda:e.target.value}))} placeholder="150" /></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
              <div className="fg"><label className="lbl">Valor da peça (€)</label><input className="inp" type="number" value={editarPeca.valor_peca||""} onChange={e=>setEditarPeca(p=>({...p,valor_peca:e.target.value}))} placeholder="200" /></div>
              <div className="fg"><label className="lbl">Material</label><input className="inp" value={editarPeca.material||""} onChange={e=>setEditarPeca(p=>({...p,material:e.target.value}))} placeholder="Seda, algodão..." /></div>
            </div>
            <div className="fg">
              <label className="lbl">Ocasiões</label>
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                {["Festa","Trabalho","Férias","Jantar","Dia a dia","Casamento","Gala"].map(oc => (
                  <button key={oc} type="button" onClick={()=>setEditarPeca(p=>({...p,ocasioes:(p.ocasioes||[]).includes(oc)?(p.ocasioes||[]).filter(x=>x!==oc):[...(p.ocasioes||[]),oc]}))} style={{padding:"0.3rem 0.75rem",fontSize:"0.7rem",border:"1.5px solid",borderColor:(editarPeca.ocasioes||[]).includes(oc)?"var(--black)":"var(--g2)",background:(editarPeca.ocasioes||[]).includes(oc)?"var(--black)":"transparent",color:(editarPeca.ocasioes||[]).includes(oc)?"#fff":"var(--g4)",cursor:"pointer",fontFamily:"var(--sans)"}}>{oc}</button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:"0.75rem",marginTop:"1.5rem"}}>
              <button onClick={guardarEdicaoPeca} disabled={!editarPeca.nome||editarLoading} style={{flex:1,padding:"0.85rem",background:"var(--black)",color:"#fff",border:"none",fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)",opacity:!editarPeca.nome?0.5:1}}>{editarLoading?"...":"Guardar"}</button>
              <button onClick={()=>setEditarPeca(null)} style={{padding:"0.85rem 1.25rem",background:"none",border:"1.5px solid var(--g2)",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {showNovaPeca && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"1rem",overflowY:"auto"}}>
          <div style={{background:"#fff",padding:"2rem",maxWidth:"480px",width:"100%",marginTop:"2rem"}}>
            <h3 style={{fontFamily:"var(--serif)",fontSize:"1.5rem",fontWeight:300,marginBottom:"1.5rem"}}>{lang==="fr"?"Nouvelle pièce":lang==="lt"?"Naujas drabužis":"Nova peça"}</h3>
            <div className="fg">
              <label className="lbl">{lang==="fr"?"Photos":lang==="lt"?"Nuotraukos":"Fotos"}</label>
              <input type="file" accept="image/*" multiple onChange={e=>setFotosLojista(Array.from(e.target.files))} style={{padding:"0.5rem",border:"1.5px solid var(--g2)",width:"100%",fontFamily:"var(--sans)",fontSize:"0.82rem"}} />
              {fotosLojista.length > 0 && <div style={{display:"flex",gap:"0.5rem",marginTop:"0.5rem",flexWrap:"wrap"}}>{fotosLojista.map((f,i)=><span key={i} style={{fontSize:"0.7rem",color:"var(--g4)",background:"var(--g1)",padding:"0.2rem 0.5rem"}}>{f.name}</span>)}</div>}
            </div>
            <div className="fg"><label className="lbl">Nome *</label><input className="inp" value={novaPeca.nome} onChange={e=>setNovaPeca(p=>({...p,nome:e.target.value}))} placeholder="Ex: Vestido de festa azul" /></div>
            <div className="fg"><label className="lbl">Descrição</label><textarea className="inp" value={novaPeca.descricao} onChange={e=>setNovaPeca(p=>({...p,descricao:e.target.value}))} style={{resize:"vertical",minHeight:"80px"}} /></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
              <div className="fg"><label className="lbl">Preço aluguer/dia (€) *</label><input className="inp" type="number" value={novaPeca.preco_aluguer_dia} onChange={e=>setNovaPeca(p=>({...p,preco_aluguer_dia:e.target.value}))} placeholder="25" /></div>
              <div className="fg"><label className="lbl">Preço venda (€)</label><input className="inp" type="number" value={novaPeca.preco_venda} onChange={e=>setNovaPeca(p=>({...p,preco_venda:e.target.value}))} placeholder="150" /></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
              <div className="fg"><label className="lbl">Valor da peça (€)</label><input className="inp" type="number" value={novaPeca.valor_peca} onChange={e=>setNovaPeca(p=>({...p,valor_peca:e.target.value}))} placeholder="200" /></div>
              <div className="fg"><label className="lbl">Material</label><input className="inp" value={novaPeca.material} onChange={e=>setNovaPeca(p=>({...p,material:e.target.value}))} placeholder="Seda, algodão..." /></div>
            </div>
            <div className="fg">
              <label className="lbl">Ocasiões</label>
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                {["Festa","Trabalho","Férias","Jantar","Dia a dia","Casamento","Gala"].map(oc => (
                  <button key={oc} type="button" onClick={() => setNovaPeca(p=>({...p,ocasioes:p.ocasioes.includes(oc)?p.ocasioes.filter(x=>x!==oc):[...p.ocasioes,oc]}))} style={{padding:"0.3rem 0.75rem",fontSize:"0.7rem",border:"1.5px solid",borderColor:novaPeca.ocasioes.includes(oc)?"var(--black)":"var(--g2)",background:novaPeca.ocasioes.includes(oc)?"var(--black)":"transparent",color:novaPeca.ocasioes.includes(oc)?"#fff":"var(--g4)",cursor:"pointer",fontFamily:"var(--sans)"}}>{oc}</button>
                ))}
              </div>
            </div>
            <div className="fg">
              <label className="lbl">Tamanhos</label>
              {novaPeca.tamanhos.map((t,idx) => (
                <div key={idx} style={{display:"flex",gap:"0.5rem",marginBottom:"0.5rem",alignItems:"center"}}>
                  <select value={t.tamanho} onChange={e=>setNovaPeca(p=>({...p,tamanhos:p.tamanhos.map((x,i)=>i===idx?{...x,tamanho:e.target.value}:x)}))} style={{padding:"0.5rem",border:"1.5px solid var(--g2)",fontFamily:"var(--sans)",flex:1}}>
                    {["XS","S","M","L","XL","XXL","34","36","38","40","42","44","46"].map(s=><option key={s}>{s}</option>)}
                  </select>
                  <input type="number" value={t.quantidade} min={1} onChange={e=>setNovaPeca(p=>({...p,tamanhos:p.tamanhos.map((x,i)=>i===idx?{...x,quantidade:parseInt(e.target.value)||1}:x)}))} style={{width:"70px",padding:"0.5rem",border:"1.5px solid var(--g2)",fontFamily:"var(--sans)"}} />
                  {novaPeca.tamanhos.length > 1 && <button type="button" onClick={()=>setNovaPeca(p=>({...p,tamanhos:p.tamanhos.filter((_,i)=>i!==idx)}))} style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:"1rem"}}>✕</button>}
                </div>
              ))}
              <button type="button" onClick={()=>setNovaPeca(p=>({...p,tamanhos:[...p.tamanhos,{tamanho:"M",quantidade:1}]}))} style={{fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",background:"none",border:"1.5px solid var(--g2)",padding:"0.4rem 0.75rem",cursor:"pointer",fontFamily:"var(--sans)"}}>+ Tamanho</button>
            </div>
            {uploadProgressLoja && <p style={{fontSize:"0.82rem",color:"var(--g4)",margin:"0.5rem 0",fontStyle:"italic"}}>{uploadProgressLoja}</p>}
            <div style={{display:"flex",gap:"0.75rem",marginTop:"1rem"}}>
              <button onClick={guardarNovaPeca} disabled={!novaPeca.nome||!novaPeca.preco_aluguer_dia||novaPecaLoading} style={{flex:1,padding:"0.85rem",background:"var(--black)",color:"#fff",border:"none",fontSize:"0.68rem",letterSpacing:"0.18em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)",opacity:(!novaPeca.nome||!novaPeca.preco_aluguer_dia)?0.5:1}}>{novaPecaLoading?"...":"Adicionar peça"}</button>
              <button onClick={()=>setShowNovaPeca(false)} style={{padding:"0.85rem 1.25rem",background:"none",border:"1.5px solid var(--g2)",fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",fontFamily:"var(--sans)"}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}