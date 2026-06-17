"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const t = {
  pt: {
    titulo: "Os meus pedidos",
    ativos: "Ativos", reservas: "Reservas", historico: "Histórico",
    semAtivos: "Não tens alugueres ativos.",
    semReservas: "Não tens reservas em espera.",
    semHistorico: "Ainda não tens alugueres.",
    verCatalogo: "Explorar catálogo",
    devolucao: "Devolução prevista",
    tamanho: "Tamanho",
    estado: { ativo: "Ativo", enviado: "Enviado", confirmado: "Confirmado", pendente: "Pendente", devolvido: "Devolvido", cancelado: "Cancelado" },
    reservaEspera: "A aguardar disponibilidade",
    dataDesejada: "Datas desejadas",
    loading: "A carregar...",
    voltar: "← Início",
  },
  fr: {
    titulo: "Mes commandes",
    ativos: "Actives", reservas: "Réservations", historico: "Historique",
    semAtivos: "Vous n'avez pas de locations actives.",
    semReservas: "Vous n'avez pas de réservations.",
    semHistorico: "Pas encore de locations.",
    verCatalogo: "Explorer le catalogue",
    devolucao: "Retour prévu",
    tamanho: "Taille",
    estado: { ativo: "Actif", enviado: "Envoyé", confirmado: "Confirmé", pendente: "En attente", devolvido: "Retourné", cancelado: "Annulé" },
    reservaEspera: "En attente de disponibilité",
    dataDesejada: "Dates souhaitées",
    loading: "Chargement...",
    voltar: "← Accueil",
  },
  lt: {
    titulo: "Mano užsakymai",
    ativos: "Aktyvūs", reservas: "Rezervacijos", historico: "Istorija",
    semAtivos: "Neturite aktyvių nuomų.",
    semReservas: "Neturite rezervacijų.",
    semHistorico: "Dar nėra nuomų.",
    verCatalogo: "Naršyti katalogą",
    devolucao: "Planuojamas grąžinimas",
    tamanho: "Dydis",
    estado: { ativo: "Aktyvus", enviado: "Išsiųstas", confirmado: "Patvirtintas", pendente: "Laukiama", devolvido: "Grąžintas", cancelado: "Atšauktas" },
    reservaEspera: "Laukiama prieinamumo",
    dataDesejada: "Pageidaujamos datos",
    loading: "Kraunama...",
    voltar: "← Pradžia",
  },
};

export default function Pedidos() {
  const [tab, setTab] = useState("ativos");
  const [ativos, setAtivos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("pt");

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved) setLang(saved);
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/entrar"; return; }

    const { data: alugueres } = await supabase
      .from("alugueres")
      .select(`*, stock_tamanhos(tamanho, pecas(nome, fotos, preco_aluguer_dia))`)
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: false });

    if (alugueres) {
      setAtivos(alugueres.filter(a => ["ativo", "enviado", "confirmado", "pendente"].includes(a.estado)));
      setHistorico(alugueres.filter(a => ["devolvido", "cancelado", "devolvido_danificado"].includes(a.estado)));
    }

    const { data: res } = await supabase
      .from("reservas_espera")
      .select(`*, stock_tamanhos(tamanho, pecas(nome, fotos))`)
      .eq("cliente_id", user.id)
      .eq("estado", "aguarda")
      .order("created_at", { ascending: false });

    if (res) setReservas(res);
    setLoading(false);
  };

  const i = t[lang] || t.pt;

  const estadoBadge = (estado) => {
    const cores = {
      ativo: { bg: "#e8f5e9", color: "#27ae60" },
      enviado: { bg: "#e3f2fd", color: "#1976d2" },
      confirmado: { bg: "#f3e5f5", color: "#7b1fa2" },
      pendente: { bg: "#fff8e1", color: "#f39c12" },
      devolvido: { bg: "#f0eeeb", color: "#5a5855" },
      cancelado: { bg: "#fff5f5", color: "#e74c3c" },
    };
    const c = cores[estado] || cores.pendente;
    return (
      <span style={{fontSize:'0.6rem',letterSpacing:'0.15em',textTransform:'uppercase',padding:'0.25rem 0.6rem',fontWeight:500,fontFamily:"'Jost',sans-serif",background:c.bg,color:c.color}}>
        {i.estado[estado] || estado}
      </span>
    );
  };

  const CardAluguer = ({ a }) => {
    const peca = a.stock_tamanhos?.pecas;
    return (
      <div style={{background:'#fff',padding:'1.25rem',display:'flex',gap:'1rem',alignItems:'flex-start',borderBottom:'1px solid #f0eeeb'}}>
        <div style={{width:'60px',height:'75px',flexShrink:0,background:'#f0eeeb',overflow:'hidden'}}>
          {peca?.fotos?.[0] && <img src={peca.fotos[0]} alt={peca?.nome} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}} />}
        </div>
        <div style={{flex:1}}>
          <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.2rem',fontWeight:400,color:'#080808',marginBottom:'0.25rem'}}>{peca?.nome || "Peça"}</p>
          <p style={{fontSize:'0.8rem',color:'#5a5855',marginBottom:'0.5rem'}}>{i.tamanho}: {a.stock_tamanhos?.tamanho} · {a.valor_aluguer}€</p>
          <p style={{fontSize:'0.8rem',color:'#5a5855',marginBottom:'0.5rem'}}>{a.data_inicio} → {a.data_fim}</p>
          {estadoBadge(a.estado)}
          {a.estado === 'ativo' && a.data_fim && (
            <p style={{fontSize:'0.78rem',color:'#c4748a',marginTop:'0.5rem',fontWeight:500}}>{i.devolucao}: {a.data_fim}</p>
          )}
        </div>
      </div>
    );
  };

  const CardReserva = ({ r }) => {
    const peca = r.stock_tamanhos?.pecas;
    return (
      <div style={{background:'#fff',padding:'1.25rem',display:'flex',gap:'1rem',alignItems:'flex-start',borderBottom:'1px solid #f0eeeb'}}>
        <div style={{width:'60px',height:'75px',flexShrink:0,background:'#f0eeeb',overflow:'hidden'}}>
          {peca?.fotos?.[0] && <img src={peca.fotos[0]} alt={peca?.nome} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}} />}
        </div>
        <div style={{flex:1}}>
          <p style={{fontFamily:"'Cormorant',serif",fontSize:'1.2rem',fontWeight:400,color:'#080808',marginBottom:'0.25rem'}}>{peca?.nome || "Peça"}</p>
          <p style={{fontSize:'0.8rem',color:'#5a5855',marginBottom:'0.5rem'}}>{i.tamanho}: {r.stock_tamanhos?.tamanho}</p>
          <p style={{fontSize:'0.8rem',color:'#5a5855',marginBottom:'0.5rem'}}>{i.dataDesejada}: {r.data_inicio_desejada} → {r.data_fim_desejada}</p>
          <span style={{fontSize:'0.6rem',letterSpacing:'0.15em',textTransform:'uppercase',padding:'0.25rem 0.6rem',fontWeight:500,fontFamily:"'Jost',sans-serif",background:'#fff8e1',color:'#f39c12'}}>{i.reservaEspera}</span>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#888580'}}>
      {i.loading}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#f0eeeb; font-family:'Jost',sans-serif; font-size:17px; -webkit-font-smoothing:antialiased; padding-bottom:80px; }
        .pd-nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1rem 1.5rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid #e2dfda; }
        .pd-nav-logo { font-family:'Cormorant',serif; font-size:1.2rem; font-weight:400; letter-spacing:0.25em; text-transform:uppercase; text-decoration:none; color:#080808; }
        .pd-nav-back { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:#5a5855; text-decoration:none; font-weight:400; }
        .pd-page { padding:5rem 0 2rem; max-width:600px; margin:0 auto; }
        .pd-titulo { font-family:'Cormorant',serif; font-size:2rem; font-weight:400; color:#080808; padding:1.5rem 1.25rem 1rem; }
        .pd-tabs { display:flex; border-bottom:1px solid #e2dfda; background:#f8f7f5; padding:0 1.25rem; }
        .pd-tab { padding:0.85rem 1.25rem; font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:#5a5855; cursor:pointer; border:none; background:none; font-family:'Jost',sans-serif; font-weight:400; border-bottom:2px solid transparent; transition:all 0.2s; }
        .pd-tab.active { color:#080808; border-bottom-color:#080808; font-weight:500; }
        .pd-content { background:#f8f7f5; margin-top:1rem; }
        .pd-empty { padding:3rem 1.25rem; text-align:center; }
        .pd-empty p { font-size:1rem; color:#5a5855; margin-bottom:1.25rem; }
        .pd-empty a { display:inline-block; padding:0.9rem 2rem; background:#080808; color:#f8f7f5; text-decoration:none; font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; font-family:'Jost',sans-serif; font-weight:500; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      <nav className="pd-nav">
        <a href="/" className="pd-nav-logo">Nora Grei</a>
        <a href="/" className="pd-nav-back">{i.voltar}</a>
      </nav>

      <div className="pd-page">
        <h1 className="pd-titulo">{i.titulo}</h1>

        <div className="pd-tabs">
          <button className={`pd-tab${tab==="ativos"?" active":""}`} onClick={() => setTab("ativos")}>
            {i.ativos} {ativos.length > 0 && `(${ativos.length})`}
          </button>
          <button className={`pd-tab${tab==="reservas"?" active":""}`} onClick={() => setTab("reservas")}>
            {i.reservas} {reservas.length > 0 && `(${reservas.length})`}
          </button>
          <button className={`pd-tab${tab==="historico"?" active":""}`} onClick={() => setTab("historico")}>
            {i.historico}
          </button>
        </div>

        <div className="pd-content">
          {tab === "ativos" && (
            ativos.length === 0 ? (
              <div className="pd-empty">
                <p>{i.semAtivos}</p>
                <a href="/catalogo">{i.verCatalogo}</a>
              </div>
            ) : ativos.map(a => <CardAluguer key={a.id} a={a} />)
          )}
          {tab === "reservas" && (
            reservas.length === 0 ? (
              <div className="pd-empty">
                <p>{i.semReservas}</p>
                <a href="/catalogo">{i.verCatalogo}</a>
              </div>
            ) : reservas.map(r => <CardReserva key={r.id} r={r} />)
          )}
          {tab === "historico" && (
            historico.length === 0 ? (
              <div className="pd-empty">
                <p>{i.semHistorico}</p>
                <a href="/catalogo">{i.verCatalogo}</a>
              </div>
            ) : historico.map(a => <CardAluguer key={a.id} a={a} />)
          )}
        </div>
      </div>
    </>
  );
}