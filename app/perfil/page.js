"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import NotificationBell from "@/components/NotificationBell";

const NIVEL = (n) => {
  if (n >= 20) return { nome: "Platina", sigla: "PLT", cor: "#6c5ce7", caucao: 0, proximo: null, falta: 0 };
  if (n >= 10) return { nome: "Ouro", sigla: "OUR", cor: "#b8860b", caucao: 50, proximo: "Platina", falta: 20 - n };
  if (n >= 5)  return { nome: "Prata", sigla: "PRT", cor: "#6b7280", caucao: 75, proximo: "Ouro", falta: 10 - n };
  return { nome: "Bronze", sigla: "BRZ", cor: "#a8632f", caucao: 100, proximo: "Prata", falta: 5 - n };
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
              ["Data", new Date(recibo.created_at).toLocaleString("pt-PT")],
              ["Método", recibo.metodo_pagamento],
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

function GeradorCodigo({ aluguer, i }) {
  const [codigo, setCodigo] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [loading, setLoading] = useState(false);

  const verificarCodigo = async () => {
    const { data } = await supabase.from("codigos_desconto").select("*").eq("aluguer_id", aluguer.id).maybeSingle();
    if (data) setCodigo(data);
  };

  useEffect(() => { verificarCodigo(); }, []);

  const gerar = async () => {
    setLoading(true);
    if (codigo) { setAberto(true); setLoading(false); return; }
    const cod = "NORA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data } = await supabase.from("codigos_desconto").insert({
      aluguer_id: aluguer.id,
      cliente_id: aluguer.cliente_id,
      codigo: cod,
      valor: aluguer.valor_aluguer || 0,
      estado: "ativo",
      expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    }).select().single();
    if (data) { setCodigo(data); setAberto(true); }
    setLoading(false);
  };

  const copiar = () => {
    navigator.clipboard.writeText(codigo.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (aberto && codigo) return (
    <div style={{background:'#2a1820',border:'1px solid #4a2530',padding:'0.9rem',marginTop:'0.5rem'}}>
      <p style={{fontSize:'0.58rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#e8a4b8',fontWeight:700,marginBottom:'0.4rem'}}>{i.codigoDesconto}</p>
      <div style={{fontFamily:"'Cormorant',serif",fontSize:'1.4rem',fontWeight:400,letterSpacing:'0.15em',marginBottom:'0.3rem',color:'#fff'}}>{codigo.codigo}</div>
      <p style={{fontSize:'0.7rem',color:'#e8d5db',marginBottom:'0.6rem'}}>{i.descontoInfo} <strong>{codigo.valor}€</strong></p>
      <div style={{display:'flex',gap:'0.4rem'}}>
        <button onClick={copiar} style={{flex:1,padding:'0.5rem',background:copiado?'#1e7e3e':'#fff',color:copiado?'#fff':'#080808',border:'none',fontSize:'0.6rem',letterSpacing:'0.1em',textTransform:'uppercase',cursor:'pointer',fontFamily:"'Jost',sans-serif",fontWeight:700}}>{copiado?i.copiado:i.copiar}</button>
        <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" style={{flex:1,padding:'0.5rem',background:'#c4748a',color:'#fff',border:'none',fontSize:'0.6rem',letterSpacing:'0.1em',textTransform:'uppercase',textDecoration:'none',textAlign:'center',fontFamily:"'Jost',sans-serif",fontWeight:700}}>{i.irLoja}</a>
      </div>
    </div>
  );

  return (
    <button onClick={gerar} disabled={loading} style={{width:'100%',padding:'0.6rem',marginTop:'0.5rem',background:'#080808',color:'#fff',border:'none',fontSize:'0.64rem',letterSpacing:'0.12em',textTransform:'uppercase',cursor:'pointer',fontWeight:600,fontFamily:"'Jost',sans-serif"}}>
    {loading ? "..." : i.comprarPeca}
    </button>
  );
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
    aluguer: "Aluguer", higienizacao: "Higienização", deposito: "Depósito", total: "Total",
    pago: "✓ Pago", aguardarPagamento: "A aguardar pagamento",
  },
  fr: {
    titulo: "Mon profil", dadosPessoais: "Informations personnelles",
    nome: "Nom complet", email: "Email", telefone: "Téléphone",
    dataNascimento: "Date de naissance", genero: "Genre",
    generosOpcoes: ["Femme", "Homme", "Préfère ne pas préciser"],
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
    aluguer: "Location", higienizacao: "Nettoyage", deposito: "Dépôt", total: "Total",
    pago: "✓ Payé", aguardarPagamento: "En attente de paiement",
  },
  lt: {
    titulo: "Mano profilis", dadosPessoais: "Asmeniniai duomenys",
    nome: "Vardas, pavardė", email: "El. paštas", telefone: "Telefonas",
    dataNascimento: "Gimimo data", genero: "Lytis",
    generosOpcoes: ["Moteris", "Vyras", "Nenoriu nurodyti"],
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
    aluguer: "Nuoma", higienizacao: "Valymas", deposito: "Užstatas", total: "Iš viso",
    pago: "✓ Apmokėta", aguardarPagamento: "Laukiama mokėjimo",
  },
};

const CAMPOS_OBRIGATORIOS = ["nome", "telefone", "morada", "numero_porta", "codigo_postal", "cidade", "nif", "numero_cc"];

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({ nome: "", telefone: "", morada: "", numero_porta: "", andar: "", avatar_url: "", nif: "", numero_cc: "", data_nascimento: "", genero: "", cidade: "", pais: "Portugal", codigo_postal: "", latitude: null, longitude: null });
  const [stats, setStats] = useState({ totalAlugueres: 0, totalGasto: 0, pecasAtivas: 0, reservas: 0, pontos: 0, totalPecas: 0 });
  const [alugueres, setAlugueres] = useState([]);
  const [reservasDisponiveis, setReservasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardado, setGuardado] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [detectandoLoc, setDetectandoLoc] = useState(false);
  const [locDetectada, setLocDetectada] = useState(false);
  const [lang, setLang] = useState("pt");
  const fileRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && t[saved]) setLang(saved);
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/entrar"; return; }
    setUser(user);

    const { data: c } = await supabase.from("clientes").select("*").eq("id", user.id).single();
    if (c) {
      setPerfil({ nome: c.nome||"", telefone: c.telefone||"", morada: c.morada||"", numero_porta: c.numero_porta||"", andar: c.andar||"", avatar_url: user.user_metadata?.avatar_url||"", nif: c.nif||"", numero_cc: c.numero_cc||"", data_nascimento: c.data_nascimento||"", genero: c.genero||"", cidade: c.cidade||"", pais: c.pais||"Portugal", codigo_postal: c.codigo_postal||"", latitude: c.latitude||null, longitude: c.longitude||null });
    }

    const { data: al } = await supabase.from("alugueres").select("*, stock_tamanhos(tamanho, pecas(nome, codigo_referencia, preco_aluguer_dia, fotos))").eq("cliente_id", user.id).order("created_at", { ascending: false });
    if (al) {
      setAlugueres(al);
      const completos = al.filter(a => ["devolvido","devolvido_danificado"].includes(a.estado)).length;
      const ativos = al.filter(a => ["ativo","enviado","confirmado","pendente","em_verificacao"].includes(a.estado)).length;
      const gasto = al.reduce((s, a) => s + (a.valor_aluguer || 0), 0);
      setStats({ totalAlugueres: al.filter(a => a.estado !== "cancelado").length, totalGasto: gasto, pecasAtivas: ativos, reservas: 0, pontos: c?.pontos || completos, totalPecas: completos });
    }

    const { data: res } = await supabase.from("reservas_espera").select("id").eq("cliente_id", user.id).eq("estado", "aguarda");
    if (res) setStats(prev => ({ ...prev, reservas: res.length }));

    const agora = new Date().toISOString();
    const { data: resDisponiveis } = await supabase
      .from("reservas_espera")
      .select("*, stock_tamanhos(id, tamanho, pecas(id, nome, codigo_referencia, fotos))")
      .eq("cliente_id", user.id)
      .eq("estado", "notificado")
      .gt("prazo_confirmacao", agora)
      .order("notificado_em", { ascending: false });
    if (resDisponiveis) setReservasDisponiveis(resDisponiveis);

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
    await supabase.from("clientes").upsert({ id: user.id, email: user.email, nome: perfil.nome, telefone: perfil.telefone, morada: perfil.morada, numero_porta: perfil.numero_porta, andar: perfil.andar, nif: perfil.nif, numero_cc: perfil.numero_cc, data_nascimento: perfil.data_nascimento || null, genero: perfil.genero, cidade: perfil.cidade, pais: perfil.pais, codigo_postal: perfil.codigo_postal, latitude: perfil.latitude, longitude: perfil.longitude, perfil_completo: perfilCompleto });
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
  const set = (k, v) => setPerfil(prev => ({ ...prev, [k]: v }));
  const i = t[lang] || t.pt;
  const estadoInfo = ESTADO_INFO[lang] || ESTADO_INFO.pt;

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#3f3e3c'}}>...</div>;

  const nv = NIVEL(stats.totalPecas);
  const proximoNivelMin = nv.nome === "Bronze" ? 5 : nv.nome === "Prata" ? 10 : nv.nome === "Ouro" ? 20 : 20;
  const progressoPct = nv.proximo ? Math.min(100, Math.round(((stats.totalPecas - (proximoNivelMin - nv.falta)) / nv.falta) * 100)) : 100;

  const alugueresAtivos = alugueres.filter(a => ["pendente","confirmado","enviado","ativo","em_verificacao"].includes(a.estado));
  const alugueresHistorico = alugueres.filter(a => ["devolvido","devolvido_danificado","cancelado"].includes(a.estado));

  const perfilIncompleto = !CAMPOS_OBRIGATORIOS.every(campo => perfil[campo] && perfil[campo].toString().trim() !== "");

  const NIVEIS_TABELA = [
    { sigla: "BRZ", nome: "Bronze", cor: "#a8632f", caucao: "100%" },
    { sigla: "PRT", nome: "Prata", cor: "#6b7280", caucao: "75%" },
    { sigla: "OUR", nome: "Ouro", cor: "#b8860b", caucao: "50%" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g6:#2b2a28;--serif:'Cormorant',Georgia,serif;--sans:'Jost',Arial,sans-serif}
        body{background:var(--g1);font-family:var(--sans);font-size:17px;-webkit-font-smoothing:antialiased}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 4rem;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2)}
        .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:400;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
        .nav-back{font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g6);text-decoration:none}
        .page{padding:6rem 4rem 4rem;max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:1.5rem}
        .hero{background:var(--white);padding:2.5rem;display:flex;align-items:center;gap:2rem}
        .avatar-wrap{position:relative;flex-shrink:0}
        .avatar{width:96px;height:96px;border-radius:50%;object-fit:cover}
        .avatar-ph{width:96px;height:96px;border-radius:50%;background:var(--g2);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:2.5rem;font-weight:300;color:var(--g6)}
        .avatar-btn{position:absolute;bottom:0;right:0;width:28px;height:28px;border-radius:50%;background:var(--black);color:var(--white);border:2px solid var(--white);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem}
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
              <div className="nivel-info"><span>{stats.totalPecas} · {i.alugueresLabel}</span><span>{i.faltam} {nv.falta} {i.para} {nv.nome}</span></div>
            </div>
          )}
          {!nv.proximo && <div style={{fontSize:'0.82rem',color:nv.cor,fontWeight:600,marginTop:'0.5rem'}}>{i.nivelMaximo}</div>}
          <div className="nivel-beneficios">
            {NIVEIS_TABELA.map(nivel => (
              <div key={nivel.sigla} className="beneficio">
                <div className="beneficio-sigla" style={{color:nivel.cor}}>{nivel.nome}</div>
                <div className="beneficio-label">Caução {nivel.caucao}</div>
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
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <p className="card-t" style={{padding:'2rem 2.5rem 0',border:'none',marginBottom:'1rem'}}>{i.emCurso}</p>
            {alugueresAtivos.map(a => {
              const peca = a.stock_tamanhos?.pecas;
              const ei = estadoInfo[a.estado] || estadoInfo.pendente;
              return (
                <div key={a.id} className="aluguer-card">
                  <div className="aluguer-row">
                    <div className="aluguer-img">
                      {peca?.fotos?.[0] ? <img src={peca.fotos[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontFamily:"'Cormorant',serif",fontSize:'1.5rem',color:'rgba(0,0,0,0.15)',fontStyle:'italic'}}>NG</span>}
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

        <div className="card">
          <p className="card-t">{i.dadosPessoais}</p>
          <div className="grid2">
            <div className="fg"><label className="lbl">{i.nome} *</label><input className="inp" value={perfil.nome} onChange={e => set("nome", e.target.value)} placeholder="Maria Silva" /></div>
            <div className="fg"><label className="lbl">{i.email}</label><input className="inp" value={user?.email||""} disabled /></div>
            <div className="fg"><label className="lbl">{i.telefone} *</label><input className="inp" type="tel" value={perfil.telefone} onChange={e => set("telefone", e.target.value)} placeholder="+351 912 345 678" /></div>
            <div className="fg"><label className="lbl">{i.dataNascimento}</label><input className="inp" type="date" value={perfil.data_nascimento} onChange={e => set("data_nascimento", e.target.value)} /></div>
            <div className="fg"><label className="lbl">{i.genero}</label>
              <select className="inp" value={perfil.genero} onChange={e => set("genero", e.target.value)}>
                <option value="">—</option>
                {i.generosOpcoes.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="fg"><label className="lbl">{i.nif} *</label><input className="inp" value={perfil.nif} onChange={e => set("nif", e.target.value)} placeholder={i.nifPlaceholder} /></div>
            <div className="fg"><label className="lbl">{i.numeroCC} *</label><input className="inp" value={perfil.numero_cc} onChange={e => set("numero_cc", e.target.value)} placeholder={i.numeroCCPlaceholder} /></div>
          </div>
          <div className="divider" />
          <p className="card-t" style={{marginBottom:'1rem'}}>{i.localizacao}</p>
          <div className="grid2">
            <div className="fg full"><button className="loc-btn" onClick={detectarLocalizacao} disabled={detectandoLoc}>{detectandoLoc?"...":locDetectada?i.localizacaoOk:i.detectarLocalizacao}</button></div>
            <div className="fg"><label className="lbl">{i.cidade} *</label><input className="inp" value={perfil.cidade} onChange={e => set("cidade", e.target.value)} placeholder="Lisboa" /></div>
            <div className="fg"><label className="lbl">{i.codigoPostal} *</label><input className="inp" value={perfil.codigo_postal} onChange={e => set("codigo_postal", e.target.value)} placeholder="1000-001" /></div>
            <div className="fg"><label className="lbl">{i.pais}</label><input className="inp" value={perfil.pais} onChange={e => set("pais", e.target.value)} /></div>
            <div className="fg"><label className="lbl">{i.morada} *</label><input className="inp" value={perfil.morada} onChange={e => set("morada", e.target.value)} placeholder="Rua das Flores" /></div>
          </div>
          <div className="grid3" style={{marginTop:'1.25rem'}}>
            <div className="fg"><label className="lbl">{i.numeroPorta} *</label><input className="inp" value={perfil.numero_porta} onChange={e => set("numero_porta", e.target.value)} placeholder="123" /></div>
            <div className="fg"><label className="lbl">{i.andar}</label><input className="inp" value={perfil.andar} onChange={e => set("andar", e.target.value)} placeholder="2º Esq." /></div>
          </div>
          <p className="nota-obrigatorio">{i.camposObrigatorios}</p>
          <div className="save-row"><button className={`btn-save${guardado?" btn-ok":""}`} onClick={guardarPerfil}>{guardado?i.guardado:i.guardar}</button></div>
        </div>

        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <p className="card-t" style={{padding:'2rem 2.5rem 0',border:'none',marginBottom: alugueresHistorico.length ? '1rem' : '2rem'}}>{i.historico}</p>
          {alugueresHistorico.length === 0 ? (
            <div style={{textAlign:'center',padding:'0 2.5rem 2rem'}}>
              <p style={{color:'var(--g6)',marginBottom:'1.25rem'}}>{i.semHistorico}</p>
              <a href="/catalogo" style={{display:'inline-block',padding:'0.9rem 2rem',background:'var(--black)',color:'var(--white)',textDecoration:'none',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",fontWeight:600}}>{i.verCatalogo}</a>
            </div>
          ) : (
            <>
              {alugueresHistorico.slice(0,5).map(a => {
                const peca = a.stock_tamanhos?.pecas;
                const ei = estadoInfo[a.estado] || estadoInfo.devolvido;
                return (
                  <div key={a.id} className="aluguer-card">
                    <div className="aluguer-row">
                      <div className="aluguer-img">
                        {peca?.fotos?.[0] ? <img src={peca.fotos[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontFamily:"'Cormorant',serif",fontSize:'1.5rem',color:'rgba(0,0,0,0.15)',fontStyle:'italic'}}>NG</span>}
                      </div>
                      <div style={{flex:1}}>
                        <div className="aluguer-nome">{peca?.nome || "—"}</div>
                        {peca?.codigo_referencia && <div className="aluguer-ref">{i.referencia} {peca.codigo_referencia}</div>}
                        <div className="aluguer-meta">{a.data_inicio} → {a.data_fim} · {a.valor_aluguer}€</div>
                        <span className="estado-badge" style={{background:ei.bg,color:ei.cor}}>{ei.label}</span>
                        <BotaoVerTalao aluguer={a} i={i} />
                        {a.estado === "devolvido" && <GeradorCodigo aluguer={a} i={i} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{padding:'0 0 0'}}><a href="/pedidos" className="btn-pedidos">{i.verPedidos} →</a></div>
            </>
          )}
        </div>

        <div style={{textAlign:'center',padding:'1rem 0 2rem'}}>
          <button className="btn-sair" onClick={sair}>{i.sair}</button>
        </div>
      </div>
    </>
  );
}