"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NotificationBell from "@/components/NotificationBell";

const TRADUCOES = {
  pt: {
    titulo: "Os meus pedidos",
    ativos: "Ativos", reservas: "Reservas", historico: "Histórico",
    semAtivos: "Não tens alugueres ativos.", semReservas: "Não tens reservas em espera.", semHistorico: "Ainda não tens alugueres.",
    verCatalogo: "Explorar catálogo", devolucao: "Devolução prevista", tamanho: "Tamanho",
    estado: { ativo:"A usar", enviado:"A caminho", confirmado:"Pagamento confirmado — a preparar envio", pendente:"A aguardar pagamento", devolvido:"Concluído", cancelado:"Cancelado", em_verificacao:"Em inspeção", devolvido_danificado:"Concluído — com danos" },
    reservaEspera: "A aguardar disponibilidade", dataDesejada: "Datas desejadas", loading: "A carregar...", voltar: "← Início",
    entregaEm: "Entrega prevista em", entregaPrazo: "Até 24 horas",
    comprarPeca: "Comprar esta peça",
    codigoDesconto: "Código de desconto",
    copiado: "Copiado!",
    copiar: "Copiar código",
    irParaLoja: "Ir para loja ↗",
    descontoInfo: "O valor do teu aluguer é descontado no preço final",
    timerEntrega: "A caminho",
    reservaTimer: "Disponível em",
    reservaDisponivelTitulo: "🎉 Disponível agora!",
    reservaConfirmar: "Confirmar e pagar",
    comprarModal: "Como queres comprar esta peça?",
    comprarUsada: "Comprar usada",
    comprarUsadaDesc: "A peça que alugaste, inspeccionada e em bom estado",
    comprarUsadaPreco: "200 € + portes",
    comprarNova: "Voucher para peça nova",
    comprarNovaDesc: "Usa o valor do teu aluguer como desconto em noragrei.com",
    comprarNovaValor: "Desconto de",
    cancelar: "Cancelar",
    pagarReferencia: "Gerar referência MB",
    portesEnvio: "Portes de envio",
    portesValor: "6,90 €",
    totalUsada: "Total a pagar",
    referenciaGerada: "Referência MB",
    entidade: "Entidade",
    referencia: "Referência",
    montante: "Montante",
    validadeRef: "Válida até",
    pecaEnviada: "A Nora Grei enviará a peça após confirmação do pagamento.",
  },
  fr: {
    titulo: "Mes commandes",
    ativos: "Actives", reservas: "Réservations", historico: "Historique",
    semAtivos: "Vous n'avez pas de locations actives.", semReservas: "Pas de réservations.", semHistorico: "Pas encore de locations.",
    verCatalogo: "Explorer le catalogue", devolucao: "Retour prévu", tamanho: "Taille",
    estado: { ativo:"Actif", enviado:"Envoyé", confirmado:"Confirmé", pendente:"En attente", devolvido:"Retourné", cancelado:"Annulé", em_verificacao:"En vérification", devolvido_danificado:"Retourné endommagé" },
    reservaEspera: "En attente de disponibilité", dataDesejada: "Dates souhaitées", loading: "Chargement...", voltar: "← Accueil",
    entregaEm: "Livraison prévue dans", entregaPrazo: "sous 24 heures",
    comprarPeca: "Acheter cette pièce",
    codigoDesconto: "Code de réduction",
    copiado: "Copié!",
    copiar: "Copier le code",
    irParaLoja: "Aller à la boutique ↗",
    descontoInfo: "La valeur de votre location est déduite du prix final",
    timerEntrega: "En route",
    reservaTimer: "Disponible dans",
    reservaDisponivelTitulo: "🎉 Disponible maintenant !",
    reservaConfirmar: "Confirmer et payer",
    comprarModal: "Comment souhaitez-vous acheter cette pièce ?",
    comprarUsada: "Acheter d'occasion",
    comprarUsadaDesc: "La pièce que vous avez louée, inspectée et en bon état",
    comprarUsadaPreco: "200 € + livraison",
    comprarNova: "Bon pour une pièce neuve",
    comprarNovaDesc: "Utilisez votre montant de location comme remise sur noragrei.com",
    comprarNovaValor: "Réduction de",
    cancelar: "Annuler",
    pagarReferencia: "Générer référence MB",
    portesEnvio: "Frais de port",
    portesValor: "6,90 €",
    totalUsada: "Total à payer",
    referenciaGerada: "Référence MB",
    entidade: "Entité",
    referencia: "Référence",
    montante: "Montant",
    validadeRef: "Valable jusqu'au",
    pecaEnviada: "Nora Grei enverra la pièce après confirmation du paiement.",
  },
  lt: {
    titulo: "Mano užsakymai",
    ativos: "Aktyvūs", reservas: "Rezervacijos", historico: "Istorija",
    semAtivos: "Neturite aktyvių nuomų.", semReservas: "Neturite rezervacijų.", semHistorico: "Dar nėra nuomų.",
    verCatalogo: "Naršyti katalogą", devolucao: "Planuojamas grąžinimas", tamanho: "Dydis",
    estado: { ativo:"Aktyvus", enviado:"Išsiųstas", confirmado:"Patvirtintas", pendente:"Laukiama", devolvido:"Grąžintas", cancelado:"Atšauktas", em_verificacao:"Tikrinama", devolvido_danificado:"Grąžintas su žala" },
    reservaEspera: "Laukiama prieinamumo", dataDesejada: "Pageidaujamos datos", loading: "Kraunama...", voltar: "← Pradžia",
    entregaEm: "Pristatymas per", entregaPrazo: "iki 24 valandų",
    comprarPeca: "Pirkti šį drabužį",
    codigoDesconto: "Nuolaidos kodas",
    copiado: "Nukopijuota!",
    copiar: "Kopijuoti kodą",
    irParaLoja: "Eiti į parduotuvę ↗",
    descontoInfo: "Nuomos vertė atskaitoma nuo galutinės kainos",
    timerEntrega: "Keliauja",
    reservaTimer: "Prieinama po",
    reservaDisponivelTitulo: "🎉 Prieinama dabar!",
    reservaConfirmar: "Patvirtinti ir mokėti",
    comprarModal: "Kaip norite įsigyti šį drabužį?",
    comprarUsada: "Pirkti naudotą",
    comprarUsadaDesc: "Drabužis, kurį nuomojotės, patikrintas ir geros būklės",
    comprarUsadaPreco: "200 € + pristatymas",
    comprarNova: "Kuponas naujam drabužiui",
    comprarNovaDesc: "Naudokite nuomos sumą kaip nuolaidą noragrei.com",
    comprarNovaValor: "Nuolaida",
    cancelar: "Atšaukti",
    pagarReferencia: "Generuoti MB nuorodą",
    portesEnvio: "Pristatymo mokestis",
    portesValor: "6,90 €",
    totalUsada: "Iš viso mokėti",
    referenciaGerada: "MB nuoroda",
    entidade: "Įmonė",
    referencia: "Nuoroda",
    montante: "Suma",
    validadeRef: "Galioja iki",
    pecaEnviada: "Nora Grei išsiųs drabužį po mokėjimo patvirtinimo.",
  },
};

function TimerEntrega({ i, dataEnvio }) {
  const [tempo, setTempo] = useState("");
  useEffect(() => {
    if (!dataEnvio) return;
    const calc = () => {
      const envio = new Date(dataEnvio);
      const prazo = new Date(envio.getTime() + 24 * 60 * 60 * 1000);
      const diff = prazo - new Date();
      if (diff <= 0) { setTempo(""); return; }
      const horas = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setTempo(`${horas}h ${mins}m`);
    };
    calc();
    const iv = setInterval(calc, 30000);
    return () => clearInterval(iv);
  }, [dataEnvio]);

  return (
    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'#e3f2fd',padding:'0.6rem 0.75rem',marginTop:'0.5rem',borderLeft:'3px solid #1976d2'}}>
      <span style={{fontSize:'1rem'}}>🚚</span>
      <div>
        <div style={{fontSize:'0.68rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1976d2',fontWeight:600}}>{i.timerEntrega}</div>
        <div style={{fontSize:'0.72rem',color:'#1565c0'}}>
          {tempo ? <>{i.entregaEm} <strong>{tempo}</strong></> : "A chegar a qualquer momento"}
        </div>
      </div>
    </div>
  );
}

function useCountdown(dataAlvo) {
  const [tempo, setTempo] = useState(null);
  const [terminou, setTerminou] = useState(false);

  useEffect(() => {
    if (!dataAlvo) { setTerminou(true); return; }
    const calc = () => {
      const diff = new Date(dataAlvo) - new Date();
      if (diff <= 0) { setTempo(null); setTerminou(true); return; }
      const dias = Math.floor(diff / 86400000);
      const horas = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (dias > 0) setTempo(`${dias}d ${horas}h`);
      else if (horas > 0) setTempo(`${horas}h ${mins}m`);
      else setTempo(`${mins}m`);
      setTerminou(false);
    };
    calc();
    const iv = setInterval(calc, 30000);
    return () => clearInterval(iv);
  }, [dataAlvo]);

  return { tempo, terminou };
}

const PORTES = 6.90;
const PRECO_USADA = 200;

const METODOS_PAG_USADA = {
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

const COMISSAO = 0.20;

function BotaoComprarPeca({ aluguer, i, lang, isLojista = false, lojista_id = null }) {
  const [fase, setFase] = useState("botao"); // botao | modal | escolher_pag | pagamento_usada | voucher_nova
  const [metodoPag, setMetodoPag] = useState("mb");
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [codigo, setCodigo] = useState(null);
  const [compra, setCompra] = useState(null);
  // Cartão
  const [dadosCartao, setDadosCartao] = useState({ numero: "", nome: "", validade: "", cvc: "" });
  // MBWay
  const [telMbway, setTelMbway] = useState("");
  // Transferência
  const [comprovativo, setComprovativo] = useState(null);

  const totalUsada = PRECO_USADA + PORTES;
  const metodos = METODOS_PAG_USADA[lang] || METODOS_PAG_USADA.pt;
  const metodoSel = metodos.find(m => m.id === metodoPag);

  const confirmarPagamento = async () => {
    if (metodoPag === "cartao" && (!dadosCartao.numero || !dadosCartao.nome || !dadosCartao.validade || !dadosCartao.cvc)) return;
    if (metodoPag === "mbway" && !telMbway) return;
    if (metodoPag === "transferencia" && !comprovativo) return;

    setLoading(true);
    const { data: existente } = await supabase
      .from("compras_usadas").select("*").eq("aluguer_id", aluguer.id).maybeSingle();
    if (existente) { setCompra(existente); setFase("pagamento_usada"); setLoading(false); return; }

    const entidade = "21666";
    const ref = Math.floor(100000000 + Math.random() * 900000000).toString();
    const validade = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const automatico = metodoSel?.auto || false;

    const { data: nova } = await supabase.from("compras_usadas").insert({
      aluguer_id: aluguer.id,
      cliente_id: aluguer.cliente_id,
      peca_id: aluguer.stock_tamanhos?.pecas?.id || null,
      valor: totalUsada,
      estado: automatico ? "pago" : "aguarda_pagamento",
      metodo_pagamento: metodoPag,
      mb_entidade: metodoPag === "mb" ? entidade : null,
      mb_referencia: metodoPag === "mb" ? ref : null,
      mb_montante: metodoPag === "mb" ? totalUsada : null,
      mb_validade: metodoPag === "mb" ? validade : null,
      lojista_id: isLojista ? lojista_id : null,
      valor_lojista: isLojista ? PRECO_USADA * (1 - COMISSAO) : null,
      comissao_plataforma: isLojista ? PRECO_USADA * COMISSAO : null,
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
    inp: { width:'100%',padding:'0.7rem 0.9rem',border:'1.5px solid #e2dfda',background:'#fff',fontFamily:"'Jost',sans-serif",fontSize:'0.9rem',color:'#080808',outline:'none',marginBottom:'0.5rem' },
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

      {/* OPÇÃO A — Usada */}
      <div style={{border:'1.5px solid #e2dfda',background:'#fff',padding:'1rem',marginBottom:'0.75rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.4rem'}}>
          <div>
            <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.1rem',fontWeight:400,color:'#080808'}}>{i.comprarUsada}</p>
            <p style={{fontSize:'0.72rem',color:'#5a5855',marginTop:'0.2rem'}}>{i.comprarUsadaDesc}</p>
          </div>
          <div style={{textAlign:'right',flexShrink:0,marginLeft:'1rem'}}>
            <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.2rem',fontWeight:300,color:'#080808'}}>200€</p>
            <p style={{fontSize:'0.65rem',color:'#888'}}>+ {PORTES.toFixed(2).replace('.',',')}€ {i.portesEnvio}</p>
          </div>
        </div>
        <button onClick={() => setFase("escolher_pag")}
          style={{...sty.btnPrimary,marginTop:'0.5rem'}}>
          {i.pagarReferencia}
        </button>
      </div>

      {/* OPÇÃO B — Nova */}
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
        <button onClick={gerarVoucherNova} disabled={loading}
          style={{...sty.btnPrimary,background:'#c4748a',marginTop:'0.5rem'}}>
          {loading ? "..." : i.irParaLoja}
        </button>
      </div>

      <button onClick={() => setFase("botao")} style={sty.btnSecondary}>{i.cancelar}</button>
    </div>
  );

  if (fase === "escolher_pag") return (
    <div style={{marginTop:'0.75rem',background:'#fdf6f8',border:'1px solid #f0c0cc',padding:'1.25rem'}}>
      <p style={{...sty.sec,color:'#080808'}}>
        {lang === "fr" ? "Méthode de paiement" : lang === "lt" ? "Mokėjimo būdas" : "Método de pagamento"}
      </p>

      {/* Resumo do valor */}
      <div style={{background:'#fff',padding:'0.75rem 1rem',marginBottom:'1rem',border:'1px solid #e2dfda'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',color:'#5a5855',marginBottom:'0.3rem'}}>
          <span>{i.comprarUsada}</span><span>200€</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',color:'#5a5855',marginBottom:'0.3rem'}}>
          <span>{i.portesEnvio}</span><span>{PORTES.toFixed(2).replace('.',',')}€</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'1rem',fontWeight:600,color:'#080808',paddingTop:'0.4rem',borderTop:'1px solid #f0eeeb'}}>
          <span>{i.totalUsada}</span><span>{totalUsada.toFixed(2).replace('.',',')}€</span>
        </div>
      </div>

      {/* Opções de pagamento */}
      {metodos.map(m => (
        <div key={m.id} style={sty.opt(metodoPag === m.id)} onClick={() => setMetodoPag(m.id)}>
          <div style={sty.radio(metodoPag === m.id)}>
            {metodoPag === m.id && <div style={sty.radioDot} />}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:'0.9rem',fontWeight:500,color:'#080808',display:'flex',alignItems:'center'}}>
              {m.label}
              <span style={sty.badge(m.auto)}>{m.auto ? (lang==="fr"?"Immédiat":lang==="lt"?"Iš karto":"Imediato") : (lang==="fr"?"Manuel":lang==="lt"?"Rankinis":"Manual")}</span>
            </div>
            <div style={{fontSize:'0.75rem',color:'#5a5855'}}>{m.desc}</div>
          </div>
        </div>
      ))}

      {/* Formulários por método */}
      {metodoPag === "mb" && (
        <div style={{background:'#f0eeeb',padding:'1rem',marginTop:'0.75rem'}}>
          <p style={{...sty.ibanLabel,marginBottom:'0.25rem'}}>{lang==="fr"?"Référence générée après confirmation":lang==="lt"?"Nuoroda bus sugeneruota po patvirtinimo":"Referência gerada após confirmação"}</p>
          <p style={{fontSize:'0.72rem',color:'#5a5855',lineHeight:1.5}}>{i.pecaEnviada}</p>
        </div>
      )}
      {metodoPag === "mbway" && (
        <div style={{marginTop:'0.75rem'}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'#5a5855',marginBottom:'0.4rem'}}>
            {lang==="fr"?"Numéro de téléphone MB Way":lang==="lt"?"MB Way telefono numeris":"Número de telefone MB Way"}
          </p>
          <input style={sty.inp} placeholder="+351 912 345 678" value={telMbway} onChange={e => setTelMbway(e.target.value)} />
          <p style={{fontSize:'0.68rem',color:'#5a5855',fontStyle:'italic'}}>🔒 {lang==="fr"?"Simulation de paiement.":lang==="lt"?"Mokėjimo simuliacija.":"Pagamento simulado."}</p>
        </div>
      )}
      {metodoPag === "cartao" && (
        <div style={{marginTop:'0.75rem',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          <input style={sty.inp} placeholder="1234 5678 9012 3456"
            value={dadosCartao.numero}
            onChange={e => { const v=e.target.value.replace(/\D/g,"").slice(0,16).replace(/(\d{4})(?=\d)/g,"$1 ").trim(); setDadosCartao(d=>({...d,numero:v})); }}
            maxLength={19} />
          <input style={sty.inp} placeholder="NOME NO CARTÃO"
            value={dadosCartao.nome}
            onChange={e => setDadosCartao(d=>({...d,nome:e.target.value.toUpperCase()}))} />
          <div style={sty.row2}>
            <input style={{...sty.inp,marginBottom:0}} placeholder="MM/AA"
              value={dadosCartao.validade}
              onChange={e => { const l=e.target.value.replace(/\D/g,"").slice(0,4); setDadosCartao(d=>({...d,validade:l.length>=3?l.slice(0,2)+"/"+l.slice(2):l})); }}
              maxLength={5} />
            <input style={{...sty.inp,marginBottom:0}} placeholder="CVC"
              value={dadosCartao.cvc}
              onChange={e => setDadosCartao(d=>({...d,cvc:e.target.value.replace(/\D/g,"").slice(0,3)}))}
              maxLength={3} />
          </div>
          <p style={{fontSize:'0.68rem',color:'#5a5855',fontStyle:'italic'}}>🔒 {lang==="fr"?"Simulation de paiement.":lang==="lt"?"Mokėjimo simuliacija.":"Pagamento simulado."}</p>
        </div>
      )}
      {metodoPag === "transferencia" && (
        <div style={{marginTop:'0.75rem'}}>
          <div style={sty.ibanBox}>
            <p style={sty.ibanLabel}>IBAN Nora Grei</p>
            <p style={sty.ibanVal}>PT50 0000 0000 0000 0000 0000 0</p>
            <p style={sty.ibanLabel}>{lang==="fr"?"Montant à virer":lang==="lt"?"Suma pervedimui":i.totalUsada}</p>
            <p style={sty.ibanVal}>{totalUsada.toFixed(2).replace('.',',')}€</p>
            <p style={sty.ibanLabel}>{lang==="fr"?"Référence":lang==="lt"?"Nuoroda":i.referencia}</p>
            <p style={sty.ibanVal}>{lang==="fr"?"Votre nom complet":lang==="lt"?"Jūsų vardas ir pavardė":"O teu nome completo"}</p>
          </div>
          <label style={sty.uploadBox}>
            <input type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e => setComprovativo(e.target.files?.[0]||null)} />
            {comprovativo
              ? <span style={{color:'#27ae60',fontWeight:500}}>✓ {comprovativo.name}</span>
              : <span>{lang==="fr"?"📎 Joindre le justificatif":lang==="lt"?"📎 Pridėti įrodymą":"📎 Anexar comprovativo"}</span>
            }
          </label>
          <p style={sty.aviso}>{lang==="fr"?"Votre commande sera réservée 24h en attendant confirmation.":lang==="lt"?"Jūsų užsakymas bus rezervuotas 24h, kol patvirtinsime.":"O pedido fica reservado 24h até confirmarmos o comprovativo."}</p>
        </div>
      )}

      <button onClick={confirmarPagamento} disabled={loading} style={{...sty.btnPrimary,marginTop:'1rem'}}>
        {loading ? "..." : (lang==="fr"?"Confirmer l'achat":lang==="lt"?"Patvirtinti pirkimą":"Confirmar compra")}
      </button>
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
        <>
          <div style={{textAlign:'center',padding:'1.5rem 0'}}>
            <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>{compra?.metodo_pagamento === "transferencia" ? "⏳" : "✅"}</div>
            <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.4rem',fontWeight:300,color:'#080808',marginBottom:'0.5rem'}}>
              {compra?.metodo_pagamento === "transferencia"
                ? (lang==="fr"?"En attente de confirmation":lang==="lt"?"Laukiama patvirtinimo":"A aguardar confirmação")
                : (lang==="fr"?"Paiement confirmé !":lang==="lt"?"Mokėjimas patvirtintas !":"Pagamento confirmado!")}
            </p>
            <p style={{fontSize:'0.78rem',color:'#5a5855',lineHeight:1.5}}>{i.pecaEnviada}</p>
          </div>
        </>
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
        <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" style={{flex:1,padding:'0.6rem',background:'#c4748a',color:'#fff',border:'none',fontSize:'0.65rem',letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>{i.irParaLoja}</a>
      </div>
    </div>
  );

  return null;
}

function PedidosContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "ativos");
  const [ativos, setAtivos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [alugueresLojista, setAlugueresLojista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("pt");

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && TRADUCOES[saved]) setLang(saved);
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/entrar"; return; }

    const { data: alugueres } = await supabase
      .from("alugueres")
      .select("*, stock_tamanhos(tamanho, pecas(nome, fotos, preco_aluguer_dia, valor_peca)), envios(transportadora, codigo_rastreio, data_envio)")
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: false });

    if (alugueres) {
      setAtivos(alugueres.filter(a => ["ativo","enviado","confirmado","pendente","em_verificacao"].includes(a.estado)));
      setHistorico(alugueres.filter(a => ["devolvido","cancelado","devolvido_danificado"].includes(a.estado)));
    }

    // Alugueres de lojistas (lojas públicas)
    const { data: alLojista } = await supabase
      .from("alugueres_lojista")
      .select("*, pecas_lojista(nome, fotos), stock_lojista(tamanho)")
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: false });
    if (alLojista) setAlugueresLojista(alLojista);

    const { data: res } = await supabase
      .from("reservas_espera")
      .select("*, stock_tamanho_id, stock_tamanhos(id, tamanho, pecas(id, nome, fotos))")
      .eq("cliente_id", user.id)
      .eq("estado", "aguarda")
      .order("created_at", { ascending: false });

    if (res && res.length > 0) {
      const stockIds = [...new Set(res.map(r => r.stock_tamanho_id).filter(Boolean))];
      const { data: alugueresAtivos } = await supabase
        .from("alugueres")
        .select("stock_tamanho_id, data_fim, data_disponivel_novamente, estado")
        .in("stock_tamanho_id", stockIds)
        .in("estado", ["pendente", "confirmado", "enviado", "ativo", "em_verificacao"]);

      const resComDisponibilidade = res.map(r => {
        const ocupantes = (alugueresAtivos || []).filter(a => a.stock_tamanho_id === r.stock_tamanho_id);
        let dataDisponivel = null;
        ocupantes.forEach(a => {
          const dataDisp = a.data_disponivel_novamente
            ? new Date(a.data_disponivel_novamente)
            : new Date(new Date(a.data_fim).getTime() + 3 * 24 * 60 * 60 * 1000);
          if (!dataDisponivel || dataDisp > dataDisponivel) dataDisponivel = dataDisp;
        });
        return { ...r, dataDisponivel: dataDisponivel ? dataDisponivel.toISOString() : null };
      });
      setReservas(resComDisponibilidade);
    } else {
      setReservas([]);
    }
    setLoading(false);
  };

  const i = TRADUCOES[lang] || TRADUCOES.pt;

  const estadoBadge = (estado) => {
    const cores = {
      ativo:{ bg:"#e8f5e9",color:"#27ae60" }, enviado:{ bg:"#e3f2fd",color:"#1976d2" },
      confirmado:{ bg:"#f3e5f5",color:"#7b1fa2" }, pendente:{ bg:"#fff8e1",color:"#f39c12" },
      devolvido:{ bg:"#f0eeeb",color:"#5a5855" }, cancelado:{ bg:"#fff5f5",color:"#e74c3c" },
      em_verificacao:{ bg:"#fff8e1",color:"#e67e22" }, devolvido_danificado:{ bg:"#fff5f5",color:"#e74c3c" },
    };
    const c = cores[estado] || cores.pendente;
    return <span style={{fontSize:'0.6rem',letterSpacing:'0.15em',textTransform:'uppercase',padding:'0.25rem 0.6rem',fontWeight:500,fontFamily:"'Jost',sans-serif",background:c.bg,color:c.color}}>{i.estado[estado]||estado}</span>;
  };

  const CardAluguer = ({ a, mostrarComprar }) => {
    const peca = a.stock_tamanhos?.pecas;
    return (
      <div style={{background:'#fff',padding:'1.25rem',borderBottom:'1px solid #f0eeeb'}}>
        <div style={{display:'flex',gap:'1rem',alignItems:'flex-start'}}>
          <div style={{width:60,height:75,flexShrink:0,background:'#f0eeeb',overflow:'hidden'}}>
            {peca?.fotos?.[0] && <img src={peca.fotos[0]} alt={peca?.nome} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}} />}
          </div>
          <div style={{flex:1}}>
            <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.2rem',fontWeight:400,color:'#080808',marginBottom:'0.25rem'}}>{peca?.nome||"Peça"}</p>
            <p style={{fontSize:'0.78rem', color:'#2b2a28',marginBottom:'0.35rem'}}>{i.tamanho}: {a.stock_tamanhos?.tamanho} · {a.valor_aluguer}€</p>
            <p style={{fontSize:'0.78rem',color:'#2b2a28',marginBottom:'0.5rem'}}>{a.data_inicio} → {a.data_fim}</p>
            {estadoBadge(a.estado)}
            {a.estado === "enviado" && <TimerEntrega i={i} dataEnvio={a.envios?.[0]?.data_envio} />}
   
              {a.estado === "enviado" && a.envios?.[0]?.codigo_rastreio && (
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'#f0eeeb',padding:'0.5rem 0.75rem',marginTop:'0.4rem',borderLeft:'3px solid #080808'}}>
                  <span style={{fontSize:'0.68rem',color:'#3f3e3c'}}>Rastreio:</span>
                  <span style={{fontSize:'0.78rem',fontWeight:700,fontFamily:'monospace',color:'#080808'}}>{a.envios[0].codigo_rastreio}</span>
                  <span style={{fontSize:'0.65rem',color:'#888'}}>({a.envios[0].transportadora})</span>
                </div>
              )}
            {a.estado === "ativo" && a.data_fim && (
              <p style={{fontSize:'0.75rem',color:'#c4748a',marginTop:'0.5rem',fontWeight:500}}>↩ {i.devolucao}: <strong>{a.data_fim}</strong></p>
            )}
          </div>
        </div>
        {mostrarComprar && a.estado === "devolvido" && <BotaoComprarPeca aluguer={a} i={i} lang={lang} />}
      </div>
    );
  };

  const TRANSPORTADORA_URL = {
    CTT: "https://www.ctt.pt/feapl_2/app/open/cttexpresso/objectSearch/objectSearch.jspx?objects=",
    DHL: "https://www.dhl.com/pt-pt/home/tracking.html?tracking-id=",
    FEDEX: "https://www.fedex.com/fedextrack/?trknbr=",
    GLS: "https://gls-group.eu/PT/pt/seguimento-encomendas?match=",
    CORREOS: "https://www.correos.es/ss/Satellite/site/pagina-inicio/sidioma=pt_PT&tracking=",
    UPS: "https://www.ups.com/track?loc=pt_PT&tracknum=",
    SEUR: "https://www.seur.com/livetracking/?segOnlineIdentificador=",
    DPEX: "https://tracking.dpex.com/?track=",
    NACEX: "https://www.nacex.pt/seguimientoDetalle.do?reference=",
  };

  const trackingLink = (transportadora, numero) => {
    if (!transportadora || !numero) return null;
    const key = transportadora.toUpperCase().replace(/\s/g,"");
    return TRANSPORTADORA_URL[key] ? `${TRANSPORTADORA_URL[key]}${numero}` : null;
  };

  const CardAluguerLojista = ({ a }) => {
    const peca = a.pecas_lojista;
    const estadoCores = {
      pendente:{ bg:"#fff8e1",color:"#f39c12",label:"A aguardar confirmação do lojista" },
      confirmado:{ bg:"#f3e5f5",color:"#7b1fa2",label:"Confirmado — a preparar envio" },
      enviado:{ bg:"#e3f2fd",color:"#1976d2",label:"A caminho" },
      ativo:{ bg:"#e8f5e9",color:"#27ae60",label:"A usar" },
      em_devolucao:{ bg:"#fff8e1",color:"#e67e22",label:"Em devolução" },
      devolvido:{ bg:"#f0eeeb",color:"#5a5855",label:"Concluído" },
      devolvido_danificado:{ bg:"#fff5f5",color:"#e74c3c",label:"Concluído — com danos" },
    };
    const ec = estadoCores[a.estado] || estadoCores.pendente;
    const link = trackingLink(a.tracking_transportadora, a.tracking_numero);
    const isAtivo = ["pendente","confirmado","enviado","ativo","em_devolucao"].includes(a.estado);

    return (
      <div style={{background:"#fff",padding:"1.25rem",borderBottom:"1px solid #f0eeeb", borderLeft: a.estado==="enviado" ? "3px solid #1976d2" : a.estado==="ativo" ? "3px solid #27ae60" : "none"}}>
        <div style={{display:"flex",gap:"1rem",alignItems:"flex-start"}}>
          <div style={{width:60,height:75,flexShrink:0,background:"#f0eeeb",overflow:"hidden"}}>
            {peca?.fotos?.[0] && <img src={peca.fotos[0]} alt={peca?.nome} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}} />}
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.15rem"}}>
              <p style={{fontFamily:"'Cormorant',serif",fontSize:"1.1rem",fontWeight:400,color:"#080808"}}>{peca?.nome||"Peça"}</p>
              <span style={{fontSize:"0.52rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.15rem 0.4rem",background:"#f0eeeb",color:"#888",fontFamily:"'Jost',sans-serif"}}>Loja</span>
            </div>
            <p style={{fontSize:"0.78rem",color:"#5a5855",marginBottom:"0.25rem"}}>Tam. {a.stock_lojista?.tamanho} · {a.valor_aluguer}€</p>
            <p style={{fontSize:"0.78rem",color:"#5a5855",marginBottom:"0.5rem"}}>{a.data_inicio} → {a.data_fim}</p>
            <span style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",padding:"0.25rem 0.6rem",fontWeight:500,fontFamily:"'Jost',sans-serif",background:ec.bg,color:ec.color}}>{ec.label}</span>

            {/* TRACKING — visível quando enviado */}
            {a.estado === "enviado" && (
              <div style={{marginTop:"0.75rem",background:"#e3f2fd",borderLeft:"3px solid #1976d2",padding:"0.75rem 1rem"}}>
                <div style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#1976d2",fontWeight:600,marginBottom:"0.4rem"}}>📦 A caminho</div>
                {a.tracking_numero ? (
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap"}}>
                      <span style={{fontSize:"0.72rem",color:"#3f3e3c"}}>Transportadora:</span>
                      <span style={{fontSize:"0.82rem",fontWeight:600,color:"#080808"}}>{a.tracking_transportadora || "—"}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginTop:"0.25rem",flexWrap:"wrap"}}>
                      <span style={{fontSize:"0.72rem",color:"#3f3e3c"}}>Nº tracking:</span>
                      <span style={{fontSize:"0.85rem",fontWeight:700,fontFamily:"monospace",color:"#080808",letterSpacing:"0.05em"}}>{a.tracking_numero}</span>
                    </div>
                    {link ? (
                      <a href={link} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:"0.6rem",padding:"0.4rem 0.9rem",background:"#1976d2",color:"#fff",fontSize:"0.62rem",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",textDecoration:"none",fontWeight:500}}>
                        Rastrear encomenda ↗
                      </a>
                    ) : (
                      <div style={{marginTop:"0.4rem",fontSize:"0.68rem",color:"#5a5855"}}>Usa o nº acima no site da transportadora para rastrear.</div>
                    )}
                  </>
                ) : (
                  <div style={{fontSize:"0.78rem",color:"#5a5855"}}>Informação de tracking a aguardar pelo lojista.</div>
                )}
              </div>
            )}

            {/* DATA DEVOLUÇÃO — quando ativo */}
            {a.estado === "ativo" && a.data_fim && (
              <p style={{fontSize:"0.75rem",color:"#c4748a",marginTop:"0.5rem",fontWeight:500}}>↩ Devolução prevista: <strong>{a.data_fim}</strong></p>
            )}
          </div>
        </div>

        {/* COMPRAR USADA — após devolução (apenas devolvido, não danificado) */}
        {a.estado === "devolvido" && (
          <BotaoComprarPeca aluguer={a} i={0} lang={lang} isLojista={true} lojista_id={a.lojista_id} />
        )}

        {/* AVALIAÇÃO — após devolução */}
        {(a.estado === "devolvido" || a.estado === "devolvido_danificado") && (
          <CartaoAvaliacaoLojista aluguerLojista={a} />
        )}
      </div>
    );
  };

  const CartaoAvaliacaoLojista = ({ aluguerLojista }) => {
    const [avaliacao, setAvaliacao] = useState(null);
    const [nota, setNota] = useState(0);
    const [comentario, setComentario] = useState("");
    const [enviado, setEnviado] = useState(false);
    const [loadingAv, setLoadingAv] = useState(false);

    useEffect(() => {
      supabase.from("avaliacoes_lojista").select("*").eq("aluguer_lojista_id", aluguerLojista.id).maybeSingle().then(({ data }) => {
        if (data) { setAvaliacao(data); setNota(data.nota_cliente_lojista || 0); setEnviado(true); }
      });
    }, [aluguerLojista.id]);

    const enviarAvaliacao = async () => {
      if (nota === 0) return;
      setLoadingAv(true);
      await supabase.from("avaliacoes_lojista").upsert({
        aluguer_lojista_id: aluguerLojista.id,
        cliente_id: aluguerLojista.cliente_id,
        lojista_id: aluguerLojista.lojista_id,
        nota_cliente_lojista: nota,
        comentario_cliente: comentario || null,
      }, { onConflict: "aluguer_lojista_id" });
      setEnviado(true); setLoadingAv(false);
    };

    const estrelas = (n, onChange) => (
      <div style={{display:"flex",gap:"0.25rem",marginBottom:"0.5rem"}}>
        {[1,2,3,4,5].map(v => (
          <span key={v} onClick={() => onChange && onChange(v)} style={{fontSize:"1.4rem",cursor:onChange?"pointer":"default",color:v<=n?"#c4748a":"#e2dfda",lineHeight:1}}>★</span>
        ))}
      </div>
    );

    return (
      <div style={{marginTop:"0.75rem",padding:"0.85rem 1rem",background:"#fdf6f8",borderLeft:"3px solid #c4748a"}}>
        <div style={{fontSize:"0.58rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#c4748a",fontWeight:600,marginBottom:"0.6rem"}}>Avalia esta experiência</div>
        {enviado ? (
          <>
            {estrelas(nota, null)}
            {avaliacao?.comentario_cliente && <p style={{fontSize:"0.78rem",color:"#5a5855",fontStyle:"italic"}}>"{avaliacao.comentario_cliente}"</p>}
            {avaliacao?.nota_lojista_cliente && (
              <div style={{marginTop:"0.75rem",paddingTop:"0.6rem",borderTop:"1px solid #f0d0da"}}>
                <div style={{fontSize:"0.55rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.3rem"}}>Avaliação do lojista</div>
                {estrelas(avaliacao.nota_lojista_cliente, null)}
                {avaliacao.comentario_lojista && <p style={{fontSize:"0.78rem",color:"#5a5855",fontStyle:"italic"}}>"{avaliacao.comentario_lojista}"</p>}
              </div>
            )}
          </>
        ) : (
          <>
            {estrelas(nota, setNota)}
            {nota > 0 && (
              <>
                <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                  placeholder="Deixa um comentário sobre o lojista (opcional)..."
                  style={{width:"100%",padding:"0.6rem",border:"1.5px solid #e2dfda",background:"#fff",fontFamily:"'Jost',sans-serif",fontSize:"0.82rem",color:"#080808",resize:"vertical",minHeight:"70px",outline:"none",marginBottom:"0.5rem"}} />
                <button onClick={enviarAvaliacao} disabled={loadingAv}
                  style={{padding:"0.55rem 1.25rem",background:"#c4748a",color:"#fff",border:"none",fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",cursor:"pointer",fontWeight:500}}>
                  {loadingAv ? "..." : "Enviar avaliação"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    );
  };

  const CardReserva = ({ r }) => {
    const peca = r.stock_tamanhos?.pecas;
    const { tempo, terminou } = useCountdown(r.dataDisponivel);
    const disponivelAgora = r.dataDisponivel ? terminou : true;
    const linkCheckout = `/checkout?peca=${peca?.id}&tamanho=${r.stock_tamanho_id}`;

    return (
      <div style={{background:'#fff',padding:'1.25rem',borderBottom:'1px solid #f0eeeb',borderLeft: disponivelAgora ? '3px solid #27ae60' : 'none'}}>
        <div style={{display:'flex',gap:'1rem',alignItems:'flex-start'}}>
          <div style={{width:60,height:75,flexShrink:0,background:'#f0eeeb',overflow:'hidden'}}>
            {peca?.fotos?.[0] && <img src={peca.fotos[0]} alt={peca?.nome} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}} />}
          </div>
          <div style={{flex:1}}>
            <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.2rem',fontWeight:400,color:'#080808',marginBottom:'0.25rem'}}>{peca?.nome||"Peça"}</p>
            <p style={{fontSize:'0.78rem',color:'#5a5855',marginBottom:'0.35rem'}}>{i.tamanho}: {r.stock_tamanhos?.tamanho}</p>
            <p style={{fontSize:'0.78rem',color:'#5a5855',marginBottom:'0.5rem'}}>{i.dataDesejada}: {r.data_inicio_desejada} → {r.data_fim_desejada}</p>

            {disponivelAgora ? (
              <span style={{fontSize:'0.6rem',letterSpacing:'0.15em',textTransform:'uppercase',padding:'0.25rem 0.6rem',fontWeight:600,fontFamily:"'Jost',sans-serif",background:'#e8f5e9',color:'#27ae60'}}>{i.reservaDisponivelTitulo}</span>
            ) : (
              <>
                <span style={{fontSize:'0.6rem',letterSpacing:'0.15em',textTransform:'uppercase',padding:'0.25rem 0.6rem',fontWeight:500,fontFamily:"'Jost',sans-serif",background:'#fff8e1',color:'#f39c12'}}>{i.reservaEspera}</span>
                {tempo && (
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'#fff8e1',padding:'0.6rem 0.75rem',marginTop:'0.5rem',borderLeft:'3px solid #f39c12'}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:'#f39c12',flexShrink:0,animation:'pulse 2s infinite'}}/>
                    <span style={{fontSize:'0.72rem',color:'#946200'}}>{i.reservaTimer} <strong>{tempo}</strong></span>
                  </div>
                )}
              </>
            )}

            {disponivelAgora && (
              <a href={linkCheckout} style={{display:'block',textAlign:'center',marginTop:'0.75rem',padding:'0.7rem',background:'#080808',color:'#fff',textDecoration:'none',fontSize:'0.68rem',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",fontWeight:500}}>
                {i.reservaConfirmar}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#888'}}>
      {i.loading}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#f0eeeb;font-family:'Jost',sans-serif;font-size:17px;-webkit-font-smoothing:antialiased;padding-bottom:80px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid #e2dfda}
        .nav-logo{font-family:'Cormorant',serif;font-size:1.2rem;font-weight:400;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:#080808}
        .nav-back{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:#5a5855;text-decoration:none}
        .page{padding:5rem 0 2rem;max-width:600px;margin:0 auto}
        .titulo{font-family:'Cormorant',serif;font-size:2rem;font-weight:400;color:#080808;padding:1.5rem 1.25rem 1rem}
        .tabs{display:flex;border-bottom:1px solid #e2dfda;background:#f8f7f5;padding:0 1.25rem}
        .tab{padding:0.85rem 1.25rem;font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:#5a5855;cursor:pointer;border:none;background:none;font-family:'Jost',sans-serif;font-weight:400;border-bottom:2px solid transparent;transition:all 0.2s}
        .tab.on{color:#080808;border-bottom-color:#080808;font-weight:500}
        .content{background:#f8f7f5;margin-top:1rem}
        .empty{padding:3rem 1.25rem;text-align:center}
        .empty p{font-size:1rem;color:#5a5855;margin-bottom:1.25rem}
        .empty a{display:inline-block;padding:0.9rem 2rem;background:#080808;color:#f8f7f5;text-decoration:none;font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;font-family:'Jost',sans-serif;font-weight:500}
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <NotificationBell lang={lang} />
          <a href="/" className="nav-back">{i.voltar}</a>
        </div>
      </nav>

      <div className="page">
        <h1 className="titulo">{i.titulo}</h1>
        <div className="tabs">
          <button className={`tab${tab==="ativos"?" on":""}`} onClick={() => setTab("ativos")}>{i.ativos}{(ativos.length + alugueresLojista.filter(a=>["pendente","confirmado","enviado","ativo","em_devolucao"].includes(a.estado)).length)>0?` (${ativos.length + alugueresLojista.filter(a=>["pendente","confirmado","enviado","ativo","em_devolucao"].includes(a.estado)).length})`:""}</button>
          <button className={`tab${tab==="reservas"?" on":""}`} onClick={() => setTab("reservas")}>{i.reservas}{reservas.length>0?` (${reservas.length})`:""}</button>
          <button className={`tab${tab==="historico"?" on":""}`} onClick={() => setTab("historico")}>{i.historico}</button>
        </div>
        <div className="content">
          {tab==="ativos" && (() => {
            const ativosLojista = alugueresLojista.filter(a => ["pendente","confirmado","enviado","ativo","em_devolucao"].includes(a.estado));
            const totalAtivos = ativos.length + ativosLojista.length;
            return totalAtivos === 0
              ? <div className="empty"><p>{i.semAtivos}</p><a href="/catalogo">{i.verCatalogo}</a></div>
              : <>
                  {ativos.map(a => <CardAluguer key={a.id} a={a} mostrarComprar={false} />)}
                  {ativosLojista.map(a => <CardAluguerLojista key={"lj-"+a.id} a={a} />)}
                </>;
          })()}
          {tab==="reservas" && (reservas.length===0 ? <div className="empty"><p>{i.semReservas}</p><a href="/catalogo">{i.verCatalogo}</a></div> : reservas.map(r => <CardReserva key={r.id} r={r} />))}
          {tab==="historico" && (() => {
            const historicoLojista = alugueresLojista.filter(a => ["devolvido","devolvido_danificado"].includes(a.estado));
            const totalHistorico = historico.length + historicoLojista.length;
            return totalHistorico === 0
              ? <div className="empty"><p>{i.semHistorico}</p><a href="/catalogo">{i.verCatalogo}</a></div>
              : <>
                  {historico.map(a => <CardAluguer key={a.id} a={a} mostrarComprar={true} />)}
                  {historicoLojista.map(a => <CardAluguerLojista key={"lj-"+a.id} a={a} />)}
                </>;
          })()}
        </div>
      </div>
    </>
  );
}

export default function Pedidos() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#888'}}>A carregar...</div>}>
      <PedidosContent />
    </Suspense>
  );
}