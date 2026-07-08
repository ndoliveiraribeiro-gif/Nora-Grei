"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

const t = {
  pt: {
    titulo: "Reservar peça",
    subtitulo: "Quando esta peça ficar disponível, serás o primeiro a saber.",
    peca: "A peça que queres reservar",
    tamanho: "Tamanho desejado",
    datas: "Quando precisas da peça?",
    dataInicio: "Data de início desejada",
    dataFim: "Data de fim desejada",
    entrega: "Como queres receber?",
    entregaOpcoes: [
      { id: "envio", label: "Envio por correio", desc: "Recebe em casa em 2-3 dias úteis após confirmação" },
      { id: "presencial", label: "Levantamento presencial", desc: "Levanta na nossa loja quando a peça estiver disponível" },
    ],
    obs: "Observações (opcional)",
    obsPlaceholder: "Ex: Preciso para casamento no dia 20, tamanho S ou M...",
    confirmar: "Confirmar reserva",
    sucesso: "Reserva confirmada!",
    sucessoDesc: "Quando a peça ficar disponível receberás uma notificação. Tens 24h para confirmar o aluguer.",
    verPedidos: "Ver os meus pedidos",
    login: "Tens de fazer login para reservar",
    fazerLogin: "Fazer login",
    timer: "Disponível em",
    semStock: "Sem tamanhos disponíveis",
    selTamanho: "Seleciona um tamanho",
    voltar: "← Catálogo",
    esgotado: "Esgotado",
    nota: "Receberás uma notificação quando a peça ficar disponível. Tens 24h para confirmar.",
    resumoTitulo: "Resumo da reserva",
    rPeca: "Peça", rTamanho: "Tamanho", rDatas: "Datas", rEntrega: "Entrega",
    envioPostal: "Envio postal", presencial: "Presencial",
    datasObrigatorias: "Por favor seleciona as datas desejadas",
    tamanhoNaoEncontrado: "Tamanho não encontrado",
    conflitoTitulo: "⚠️ Estas datas não estão disponíveis",
    conflitoDesc: (inicio, fim) => `Já existe um aluguer marcado que ocupa a peça entre ${inicio} e ${fim} (inclui tempo de envio e higienização). Escolhe outro período.`,
    aVerificar: "A verificar disponibilidade...",
  },
  fr: {
    titulo: "Réserver une pièce", subtitulo: "Quand cette pièce sera disponible, vous serez le premier à le savoir.",
    peca: "La pièce que vous souhaitez réserver", tamanho: "Taille souhaitée", datas: "Quand avez-vous besoin de la pièce ?",
    dataInicio: "Date de début souhaitée", dataFim: "Date de fin souhaitée", entrega: "Comment souhaitez-vous recevoir ?",
    entregaOpcoes: [{ id:"envio",label:"Livraison par courrier",desc:"Recevez chez vous en 2-3 jours ouvrés" },{ id:"presencial",label:"Retrait en boutique",desc:"Retirez en boutique" }],
    obs: "Observations (optionnel)", obsPlaceholder: "Ex: J'en ai besoin pour un mariage le 20...",
    confirmar: "Confirmer la réservation", sucesso: "Réservation confirmée !", sucessoDesc: "Vous recevrez une notification. Vous aurez 24h pour confirmer.",
    verPedidos: "Voir mes commandes", login: "Vous devez vous connecter", fazerLogin: "Se connecter",
    timer: "Disponible dans", semStock: "Aucune taille disponible", selTamanho: "Sélectionnez une taille",
    voltar: "← Catalogue", esgotado: "Épuisé", nota: "Vous recevrez une notification. Vous avez 24h pour confirmer.",
    resumoTitulo: "Récapitulatif de la réservation",
    rPeca: "Pièce", rTamanho: "Taille", rDatas: "Dates", rEntrega: "Livraison",
    envioPostal: "Envoi postal", presencial: "En personne",
    datasObrigatorias: "Veuillez sélectionner les dates souhaitées",
    tamanhoNaoEncontrado: "Taille non trouvée",
    conflitoTitulo: "⚠️ Ces dates ne sont pas disponibles",
    conflitoDesc: (inicio, fim) => `Une location existe déjà et occupe la pièce entre ${inicio} et ${fim} (inclut le temps de livraison et nettoyage). Choisissez une autre période.`,
    aVerificar: "Vérification de la disponibilité...",
  },
  lt: {
    titulo: "Rezervuoti drabužį", subtitulo: "Kai šis drabužis bus prieinamas, būsite pirmasis sužinojęs.",
    peca: "Drabužis, kurį norite rezervuoti", tamanho: "Pageidaujamas dydis", datas: "Kada jums reikia drabužio?",
    dataInicio: "Pageidaujama pradžios data", dataFim: "Pageidaujama pabaigos data", entrega: "Kaip norite gauti?",
    entregaOpcoes: [{ id:"envio",label:"Pristatymas paštu",desc:"Gaukite namuose per 2-3 darbo dienas" },{ id:"presencial",label:"Atsiėmimas asmeniškai",desc:"Atsiimkite parduotuvėje" }],
    obs: "Pastabos (neprivaloma)", obsPlaceholder: "Pvz: Reikia vestuvėms...",
    confirmar: "Patvirtinti rezervaciją", sucesso: "Rezervacija patvirtinta!", sucessoDesc: "Gausite pranešimą. Turėsite 24h patvirtinti.",
    verPedidos: "Žiūrėti užsakymus", login: "Turite prisijungti", fazerLogin: "Prisijungti",
    timer: "Prieinama po", semStock: "Nėra dydžių", selTamanho: "Pasirinkite dydį",
    voltar: "← Katalogas", esgotado: "Išparduota", nota: "Gausite pranešimą. Turėsite 24h patvirtinti.",
    resumoTitulo: "Rezervacijos suvestinė",
    rPeca: "Drabužis", rTamanho: "Dydis", rDatas: "Datos", rEntrega: "Pristatymas",
    envioPostal: "Pristatymas paštu", presencial: "Asmeniškai",
    datasObrigatorias: "Pasirinkite pageidaujamas datas",
    tamanhoNaoEncontrado: "Dydis nerastas",
    conflitoTitulo: "⚠️ Šios datos negalimos",
    conflitoDesc: (inicio, fim) => `Jau yra nuoma, kuri užima drabužį nuo ${inicio} iki ${fim} (įskaitant pristatymo ir valymo laiką). Pasirinkite kitą laikotarpį.`,
    aVerificar: "Tikrinamas prieinamumas...",
  },
};

function Timer({ dataFim, label }) {
  const [tempo, setTempo] = useState("");
  useEffect(() => {
    const calc = () => {
      const diff = new Date(dataFim) - new Date();
      if (diff <= 0) { setTempo("Em breve"); return; }
      const dias = Math.floor(diff / 86400000);
      const horas = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (dias > 0) setTempo(`${dias}d ${horas}h`);
      else if (horas > 0) setTempo(`${horas}h ${mins}m`);
      else setTempo(`${mins}m`);
    };
    calc();
    const iv = setInterval(calc, 60000);
    return () => clearInterval(iv);
  }, [dataFim]);
  return (
    <div style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'1rem 1.25rem',background:'#fff8e1',border:'1px solid #f39c12',marginBottom:'1.5rem'}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:'#e67e22',animation:'pulse 2s infinite',flexShrink:0}} />
      <span style={{fontSize:'0.9rem',color:'#1a1a18',fontFamily:"'Jost',sans-serif"}}>{label}: <strong>{tempo}</strong></span>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// Janela real de ocupação de um aluguer: 1 dia antes (envio) + uso + 2 dias depois (retorno + higienização)
function janelaOcupacao(dataInicio, dataFim) {
  const inicio = new Date(dataInicio);
  inicio.setDate(inicio.getDate() - 1);
  const fim = new Date(dataFim);
  fim.setDate(fim.getDate() + 2);
  return { inicio, fim };
}

function formatarData(d) {
  return d.toISOString().split("T")[0];
}

function ReservaContent() {
  const searchParams = useSearchParams();
  const pecaId = searchParams.get("peca");
  const tamanhoParam = searchParams.get("tamanho");
  const tamanhoNomeParam = searchParams.get("tamanhoNome");

  const [lang, setLang] = useState("pt");
  const [user, setUser] = useState(null);
  const [peca, setPeca] = useState(null);
  const [stockTamanhos, setStockTamanhos] = useState([]);
  const [dataFimAluguer, setDataFimAluguer] = useState(null);
  const [tamanho, setTamanho] = useState(tamanhoNomeParam || "");
  const [tamanhoIdParam] = useState(tamanhoParam || "");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [entrega, setEntrega] = useState("envio");
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(true);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [alugueresExistentes, setAlugueresExistentes] = useState([]);
  const [conflito, setConflito] = useState(null);
  const [verificandoConflito, setVerificandoConflito] = useState(false);

  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && t[saved]) setLang(saved);
    carregarDados();
  }, []);

  useEffect(() => {
    verificarConflitoDatas();
  }, [dataInicio, dataFim, tamanho, alugueresExistentes]);

  const carregarDados = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (pecaId) {
      const { data: p } = await supabase
        .from("pecas")
        .select("*, categorias(nome), stock_tamanhos(id, tamanho, quantidade_disponivel, quantidade_total)")
        .eq("id", pecaId)
        .single();

      if (p) {
        setPeca({ ...p, categoria: p.categorias?.nome || "" });
        setStockTamanhos(p.stock_tamanhos || []);

        const stockIds = p.stock_tamanhos?.map(s => s.id) || [];
        if (stockIds.length > 0) {
          const { data: al } = await supabase
            .from("alugueres")
            .select("stock_tamanho_id, data_inicio, data_fim, data_disponivel_novamente")
            .in("stock_tamanho_id", stockIds)
            .in("estado", ["pendente","confirmado","enviado","ativo","em_verificacao"])
            .order("data_fim", { ascending: false });

          if (al && al.length > 0) {
            setAlugueresExistentes(al);
            const dataDisp = al[0].data_disponivel_novamente || al[0].data_fim;
            setDataFimAluguer(dataDisp);
          }
        }
      }
    }
    setLoading(false);
  };

  const verificarConflitoDatas = () => {
    if (!dataInicio || !dataFim || !tamanho || alugueresExistentes.length === 0) { setConflito(null); return; }
    setVerificandoConflito(true);

    const stockItem = stockTamanhos.find(s => s.tamanho === tamanho);
    if (!stockItem) { setConflito(null); setVerificandoConflito(false); return; }

    const desejadoInicio = new Date(dataInicio);
    const desejadoFim = new Date(dataFim);

    const conflitante = alugueresExistentes
      .filter(a => a.stock_tamanho_id === stockItem.id)
      .find(a => {
        const { inicio, fim } = janelaOcupacao(a.data_inicio, a.data_disponivel_novamente || a.data_fim);
        return desejadoInicio <= fim && desejadoFim >= inicio;
      });

    if (conflitante) {
      const { inicio, fim } = janelaOcupacao(conflitante.data_inicio, conflitante.data_disponivel_novamente || conflitante.data_fim);
      setConflito({ inicio: formatarData(inicio), fim: formatarData(fim) });
    } else {
      setConflito(null);
    }
    setVerificandoConflito(false);
  };

  const confirmarReserva = async () => {
    if (!tamanho) { setErro(i.selTamanho); return; }
    if (!dataInicio || !dataFim) { setErro(i.datasObrigatorias); return; }
    if (conflito) { return; }
    if (!user) { window.location.href = `/entrar?redirect=/reserva?peca=${pecaId}`; return; }

    setLoading(true); setErro("");
    const stockItem = stockTamanhos.find(s => s.tamanho === tamanho);
    if (!stockItem) { setErro(i.tamanhoNaoEncontrado); setLoading(false); return; }

    const { error } = await supabase.from("reservas_espera").insert({
      cliente_id: user.id,
      stock_tamanho_id: stockItem.id,
      data_inicio_desejada: dataInicio,
      data_fim_desejada: dataFim,
      tipo_entrega: entrega,
      observacoes: obs || null,
      estado: "aguarda",
    });

    if (error) { setErro(error.message); setLoading(false); return; }
    setSucesso(true);
    setLoading(false);
  };

  const i = t[lang] || t.pt;

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',color:'#888'}}>
      A carregar...
    </div>
  );

  if (sucesso) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1.5rem',padding:'2rem',fontFamily:"'Jost',sans-serif",textAlign:'center',background:'#f8f7f5'}}>
      <div style={{fontSize:'3rem'}}>✓</div>
      <h1 style={{fontFamily:"'Cormorant',serif",fontSize:'2.5rem',fontWeight:300,color:'#080808'}}>{i.sucesso}</h1>
      <p style={{fontSize:'1rem',color:'#5a5855',maxWidth:'40ch',lineHeight:1.8}}>{i.sucessoDesc}</p>
      <a href="/pedidos" style={{background:'#080808',color:'#f8f7f5',padding:'1rem 2.5rem',textDecoration:'none',fontSize:'0.75rem',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",fontWeight:500}}>
        {i.verPedidos}
      </a>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --black:#080808; --white:#f8f7f5; --grey-100:#f0eeeb; --grey-200:#e2dfda; --grey-600:#1a1a18; --rosa:#c4748a; --serif:'Cormorant',Georgia,serif; --sans:'Jost',Arial,sans-serif; }
        body { background:var(--grey-100); font-family:var(--sans); font-size:17px; -webkit-font-smoothing:antialiased; }
        .nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.25rem 4rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--grey-200); }
        .nav-logo { font-family:var(--serif); font-size:1.2rem; font-weight:400; letter-spacing:0.25em; text-transform:uppercase; text-decoration:none; color:var(--black); }
        .nav-back { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:#5a5855; text-decoration:none; }
        .page { padding:6rem 4rem 4rem; max-width:900px; margin:0 auto; display:grid; grid-template-columns:1fr 360px; gap:2rem; align-items:start; }
        .sec { background:var(--white); padding:2rem; margin-bottom:1.5rem; }
        .sec-t { font-size:0.68rem; letter-spacing:0.25em; text-transform:uppercase; color:#5a5855; font-weight:500; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--grey-100); }
        .peca-row { display:flex; gap:1.25rem; align-items:center; }
        .peca-img { width:72px; height:90px; object-fit:cover; background:var(--grey-100); flex-shrink:0; }
        .peca-nome { font-family:var(--serif); font-size:1.4rem; font-weight:300; color:var(--black); margin-bottom:0.25rem; }
        .peca-cat { font-size:0.68rem; letter-spacing:0.2em; text-transform:uppercase; color:#5a5855; }
        .tamanhos { display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.5rem; }
        .tam { width:52px; height:52px; display:flex; align-items:center; justify-content:center; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.85rem; cursor:pointer; font-family:var(--sans); transition:all 0.2s; color:var(--black); }
        .tam:hover { border-color:var(--black); }
        .tam.on { background:var(--black); color:var(--white); border-color:var(--black); }
        .tam.esgotado { color:var(--grey-200); cursor:not-allowed; text-decoration:line-through; background:var(--grey-100); }
        .dates { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .lbl { display:block; font-size:0.72rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--grey-600); margin-bottom:0.5rem; font-weight:500; }
        .inp { width:100%; padding:0.9rem 1rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:1rem; font-family:var(--sans); color:var(--black); outline:none; transition:border-color 0.2s; }
        .inp:focus { border-color:var(--black); }
        .inp.erro-input { border-color:#c0392b; }
        .textarea { width:100%; padding:0.9rem 1rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:1rem; font-family:var(--sans); color:var(--black); outline:none; resize:vertical; min-height:80px; }
        .opts { display:flex; flex-direction:column; gap:0.75rem; }
        .opt { display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem; border:1.5px solid var(--grey-200); cursor:pointer; transition:all 0.2s; }
        .opt.on { border-color:var(--black); background:var(--grey-100); }
        .opt-radio { width:18px; height:18px; border-radius:50%; border:2px solid var(--grey-200); flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .opt.on .opt-radio { border-color:var(--black); background:var(--black); }
        .opt.on .opt-radio::after { content:''; width:6px; height:6px; border-radius:50%; background:var(--white); }
        .opt-label { font-size:0.95rem; font-weight:500; color:var(--black); }
        .opt-desc { font-size:0.8rem; color:#5a5855; }
        .resumo { background:var(--white); padding:2rem; position:sticky; top:6rem; }
        .nota { background:#f0eeeb; padding:1rem 1.25rem; border-left:3px solid var(--rosa); font-size:0.88rem; color:var(--grey-600); line-height:1.7; margin-bottom:1.25rem; }
        .conflito-box { background:#fff5f5; padding:1rem 1.25rem; border-left:3px solid #c0392b; margin-top:0.75rem; }
        .conflito-titulo { font-size:0.85rem; font-weight:600; color:#c0392b; margin-bottom:0.3rem; }
        .conflito-desc { font-size:0.8rem; color:#943126; line-height:1.5; }
        .btn { width:100%; padding:1.15rem; background:var(--rosa); color:var(--white); border:none; font-size:0.78rem; letter-spacing:0.2em; text-transform:uppercase; font-family:var(--sans); font-weight:500; cursor:pointer; transition:background 0.2s; }
        .btn:hover { background:#a85c72; }
        .btn:disabled { opacity:0.6; cursor:not-allowed; }
        .erro { color:#c0392b; font-size:0.9rem; margin-top:0.75rem; padding:0.75rem; background:#fff5f5; border:1px solid #f5c6cb; }
        .login-box { text-align:center; padding:2rem; }
        .login-box p { font-size:1rem; color:#5a5855; margin-bottom:1.25rem; }
        .login-box a { display:inline-block; padding:1rem 2rem; background:var(--black); color:var(--white); text-decoration:none; font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; font-family:var(--sans); font-weight:500; }
        @media (max-width:768px) {
          .nav { padding:1rem 1.25rem; }
          .page { grid-template-columns:1fr; padding:5rem 1.25rem 6rem; }
          .resumo { position:static; }
          .dates { grid-template-columns:1fr; }
          .sec { padding:1.5rem 1.25rem; }
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <a href="/catalogo" className="nav-back">{i.voltar}</a>
      </nav>

      <div className="page">
        <div>
          {dataFimAluguer && <Timer dataFim={dataFimAluguer} label={i.timer} />}

          <div className="sec">
            <p className="sec-t">{i.peca}</p>
            {peca && (
              <div className="peca-row">
                {peca.fotos?.[0] && <img src={peca.fotos[0]} alt={peca.nome} className="peca-img" />}
                <div>
                  {peca.categoria && <p className="peca-cat">{peca.categoria}</p>}
                  <p className="peca-nome">{peca.nome}</p>
                  <p style={{fontSize:'1rem',color:'var(--black)',fontWeight:500,marginTop:'0.25rem'}}>{peca.preco_aluguer_dia}€/dia</p>
                </div>
              </div>
            )}
          </div>

          <div className="sec">
            <p className="sec-t">{i.tamanho}</p>
            <div className="tamanhos">
              {stockTamanhos.map(s => {
                const esgotado = s.quantidade_disponivel === 0;
                return (
                  <button
                    key={s.id}
                    className={`tam${tamanho === s.tamanho ? " on" : ""}${esgotado ? " esgotado" : ""}`}
                    onClick={() => setTamanho(s.tamanho)}
                    disabled={false}
                    title={esgotado ? i.esgotado : ""}
                  >
                    {s.tamanho}
                  </button>
                );
              })}
            </div>
            {stockTamanhos.length === 0 && <p style={{fontSize:'0.85rem',color:'#5a5855'}}>{i.semStock}</p>}
          </div>

          <div className="sec">
            <p className="sec-t">{i.datas}</p>
            <div className="dates">
              <div>
                <label className="lbl">{i.dataInicio}</label>
                <input className={`inp${conflito ? " erro-input" : ""}`} type="date" min={hoje} value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
              </div>
              <div>
                <label className="lbl">{i.dataFim}</label>
                <input className={`inp${conflito ? " erro-input" : ""}`} type="date" min={dataInicio || hoje} value={dataFim} onChange={e => setDataFim(e.target.value)} />
              </div>
            </div>
            {conflito && (
              <div className="conflito-box">
                <div className="conflito-titulo">{i.conflitoTitulo}</div>
                <div className="conflito-desc">{i.conflitoDesc(conflito.inicio, conflito.fim)}</div>
              </div>
            )}
          </div>

          <div className="sec">
            <p className="sec-t">{i.entrega}</p>
            <div className="opts">
              {i.entregaOpcoes.map(op => (
                <div key={op.id} className={`opt${entrega === op.id ? " on" : ""}`} onClick={() => setEntrega(op.id)}>
                  <div className="opt-radio"></div>
                  <div><div className="opt-label">{op.label}</div><div className="opt-desc">{op.desc}</div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="sec">
            <p className="sec-t">{i.obs}</p>
            <textarea className="textarea" value={obs} onChange={e => setObs(e.target.value)} placeholder={i.obsPlaceholder} />
          </div>
        </div>

        <div className="resumo">
          <p className="sec-t">{i.resumoTitulo}</p>
          {!user ? (
            <div className="login-box">
              <p>{i.login}</p>
              <a href={`/entrar?redirect=/reserva?peca=${pecaId}`}>{i.fazerLogin}</a>
            </div>
          ) : (
            <>
              <div className="nota">{i.nota}</div>
              {peca && (
                <div style={{marginBottom:'1.25rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.92rem',padding:'0.6rem 0',borderBottom:'1px solid var(--grey-100)',color:'#5a5855'}}>
                    <span>{i.rPeca}</span><span style={{color:'var(--black)',fontWeight:500}}>{peca.nome}</span>
                  </div>
                  {tamanho && (
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.92rem',padding:'0.6rem 0',borderBottom:'1px solid var(--grey-100)',color:'#5a5855'}}>
                      <span>{i.rTamanho}</span><span style={{color:'var(--black)',fontWeight:500}}>{tamanho}</span>
                    </div>
                  )}
                  {dataInicio && dataFim && (
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.92rem',padding:'0.6rem 0',borderBottom:'1px solid var(--grey-100)',color:'#5a5855'}}>
                      <span>{i.rDatas}</span><span style={{color:'var(--black)',fontWeight:500}}>{dataInicio} → {dataFim}</span>
                    </div>
                  )}
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.92rem',padding:'0.6rem 0',color:'#5a5855'}}>
                    <span>{i.rEntrega}</span><span style={{color:'var(--black)',fontWeight:500}}>{entrega === 'envio' ? i.envioPostal : i.presencial}</span>
                  </div>
                </div>
              )}
              {erro && <div className="erro">{erro}</div>}
              <button className="btn" onClick={confirmarReserva} disabled={loading || !tamanho || !dataInicio || !dataFim || !!conflito}>
                {loading ? "..." : i.confirmar}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function Reserva() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>A carregar...</div>}>
      <ReservaContent />
    </Suspense>
  );
}