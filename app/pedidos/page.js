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
    entregaEm: "Entrega prevista em", entregaPrazo: "3-5 dias úteis",
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
  },
  fr: {
    titulo: "Mes commandes",
    ativos: "Actives", reservas: "Réservations", historico: "Historique",
    semAtivos: "Vous n'avez pas de locations actives.", semReservas: "Pas de réservations.", semHistorico: "Pas encore de locations.",
    verCatalogo: "Explorer le catalogue", devolucao: "Retour prévu", tamanho: "Taille",
    estado: { ativo:"Actif", enviado:"Envoyé", confirmado:"Confirmé", pendente:"En attente", devolvido:"Retourné", cancelado:"Annulé", em_verificacao:"En vérification", devolvido_danificado:"Retourné endommagé" },
    reservaEspera: "En attente de disponibilité", dataDesejada: "Dates souhaitées", loading: "Chargement...", voltar: "← Accueil",
    entregaEm: "Livraison prévue dans", entregaPrazo: "3-5 jours ouvrés",
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
  },
  lt: {
    titulo: "Mano užsakymai",
    ativos: "Aktyvūs", reservas: "Rezervacijos", historico: "Istorija",
    semAtivos: "Neturite aktyvių nuomų.", semReservas: "Neturite rezervacijų.", semHistorico: "Dar nėra nuomų.",
    verCatalogo: "Naršyti katalogą", devolucao: "Planuojamas grąžinimas", tamanho: "Dydis",
    estado: { ativo:"Aktyvus", enviado:"Išsiųstas", confirmado:"Patvirtintas", pendente:"Laukiama", devolvido:"Grąžintas", cancelado:"Atšauktas", em_verificacao:"Tikrinama", devolvido_danificado:"Grąžintas su žala" },
    reservaEspera: "Laukiama prieinamumo", dataDesejada: "Pageidaujamos datos", loading: "Kraunama...", voltar: "← Pradžia",
    entregaEm: "Pristatymas per", entregaPrazo: "3-5 darbo dienas",
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
  },
};

function TimerEntrega({ i }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'#e3f2fd',padding:'0.6rem 0.75rem',marginTop:'0.5rem',borderLeft:'3px solid #1976d2'}}>
      <span style={{fontSize:'1rem'}}>🚚</span>
      <div>
        <div style={{fontSize:'0.68rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1976d2',fontWeight:600}}>{i.timerEntrega}</div>
        <div style={{fontSize:'0.72rem',color:'#1565c0'}}>{i.entregaEm} {i.entregaPrazo}</div>
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

function BotaoCodigoDesconto({ aluguer, i }) {
  const [codigo, setCodigo] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);

  const gerarCodigo = async () => {
    setLoading(true);
    const { data: existente } = await supabase.from("codigos_desconto").select("*").eq("aluguer_id", aluguer.id).maybeSingle();
    if (existente) { setCodigo(existente); setMostrar(true); setLoading(false); return; }
    const cod = "NORA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: novo } = await supabase.from("codigos_desconto").insert({
      aluguer_id: aluguer.id, cliente_id: aluguer.cliente_id, codigo: cod,
      valor: aluguer.valor_aluguer || 0, estado: "ativo",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).select().single();
    if (novo) { setCodigo(novo); setMostrar(true); }
    setLoading(false);
  };

  const copiar = () => { navigator.clipboard.writeText(codigo.codigo); setCopiado(true); setTimeout(() => setCopiado(false), 2000); };

  if (mostrar && codigo) return (
    <div style={{background:'#fff0f3',border:'1px solid #f0c0cc',padding:'1rem',marginTop:'0.75rem'}}>
      <p style={{fontSize:'0.6rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#c4748a',fontWeight:600,marginBottom:'0.5rem'}}>{i.codigoDesconto}</p>
      <div style={{fontFamily:"'Cormorant',serif",fontSize:'1.8rem',fontWeight:300,letterSpacing:'0.2em',color:'#080808',marginBottom:'0.3rem'}}>{codigo.codigo}</div>
      <p style={{fontSize:'0.72rem',color:'#5a5855',marginBottom:'0.75rem'}}>{i.descontoInfo} — <strong>{codigo.valor}€</strong></p>
      <div style={{display:'flex',gap:'0.5rem'}}>
        <button onClick={copiar} style={{flex:1,padding:'0.6rem',background:copiado?'#27ae60':'#080808',color:'#fff',border:'none',fontSize:'0.65rem',letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",cursor:'pointer'}}>{copiado ? i.copiado : i.copiar}</button>
        <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" style={{flex:1,padding:'0.6rem',background:'#c4748a',color:'#fff',border:'none',fontSize:'0.65rem',letterSpacing:'0.12em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>{i.irParaLoja}</a>
      </div>
    </div>
  );

  return (
    <button onClick={gerarCodigo} disabled={loading} style={{width:'100%',padding:'0.7rem',marginTop:'0.75rem',background:'#fff0f3',color:'#c4748a',border:'1.5px solid #f0c0cc',fontSize:'0.68rem',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",cursor:'pointer',fontWeight:500}}>
      {loading ? "..." : `🏷️ ${i.comprarPeca}`}
    </button>
  );
}

function PedidosContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "ativos");
  const [ativos, setAtivos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [historico, setHistorico] = useState([]);
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
      .select("*, stock_tamanhos(tamanho, pecas(nome, fotos, preco_aluguer_dia, valor_peca))")
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: false });

    if (alugueres) {
      setAtivos(alugueres.filter(a => ["ativo","enviado","confirmado","pendente","em_verificacao"].includes(a.estado)));
      setHistorico(alugueres.filter(a => ["devolvido","cancelado","devolvido_danificado"].includes(a.estado)));
    }

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
            <p style={{fontSize:'0.78rem',color:'#5a5855',marginBottom:'0.35rem'}}>{i.tamanho}: {a.stock_tamanhos?.tamanho} · {a.valor_aluguer}€</p>
            <p style={{fontSize:'0.78rem',color:'#5a5855',marginBottom:'0.5rem'}}>{a.data_inicio} → {a.data_fim}</p>
            {estadoBadge(a.estado)}
            {a.estado === "enviado" && <TimerEntrega i={i} />}
            {a.estado === "ativo" && a.data_fim && (
              <p style={{fontSize:'0.75rem',color:'#c4748a',marginTop:'0.5rem',fontWeight:500}}>↩ {i.devolucao}: <strong>{a.data_fim}</strong></p>
            )}
          </div>
        </div>
        {mostrarComprar && <BotaoCodigoDesconto aluguer={a} i={i} />}
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
          <button className={`tab${tab==="ativos"?" on":""}`} onClick={() => setTab("ativos")}>{i.ativos}{ativos.length>0?` (${ativos.length})`:""}</button>
          <button className={`tab${tab==="reservas"?" on":""}`} onClick={() => setTab("reservas")}>{i.reservas}{reservas.length>0?` (${reservas.length})`:""}</button>
          <button className={`tab${tab==="historico"?" on":""}`} onClick={() => setTab("historico")}>{i.historico}</button>
        </div>
        <div className="content">
          {tab==="ativos" && (ativos.length===0 ? <div className="empty"><p>{i.semAtivos}</p><a href="/catalogo">{i.verCatalogo}</a></div> : ativos.map(a => <CardAluguer key={a.id} a={a} mostrarComprar={false} />))}
          {tab==="reservas" && (reservas.length===0 ? <div className="empty"><p>{i.semReservas}</p><a href="/catalogo">{i.verCatalogo}</a></div> : reservas.map(r => <CardReserva key={r.id} r={r} />))}
          {tab==="historico" && (historico.length===0 ? <div className="empty"><p>{i.semHistorico}</p><a href="/catalogo">{i.verCatalogo}</a></div> : historico.map(a => <CardAluguer key={a.id} a={a} mostrarComprar={true} />))}
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