"use client";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
  },
  fr: {
    titulo: "Réserver une pièce",
    subtitulo: "Quand cette pièce sera disponible, vous serez le premier à le savoir.",
    peca: "La pièce que vous souhaitez réserver",
    tamanho: "Taille souhaitée",
    datas: "Quand avez-vous besoin de la pièce ?",
    dataInicio: "Date de début souhaitée",
    dataFim: "Date de fin souhaitée",
    entrega: "Comment souhaitez-vous recevoir ?",
    entregaOpcoes: [
      { id: "envio", label: "Livraison par courrier", desc: "Recevez chez vous en 2-3 jours ouvrés après confirmation" },
      { id: "presencial", label: "Retrait en boutique", desc: "Retirez en boutique quand la pièce sera disponible" },
    ],
    obs: "Observations (optionnel)",
    obsPlaceholder: "Ex: J'en ai besoin pour un mariage le 20...",
    confirmar: "Confirmer la réservation",
    sucesso: "Réservation confirmée !",
    sucessoDesc: "Vous recevrez une notification quand la pièce sera disponible. Vous aurez 24h pour confirmer.",
    verPedidos: "Voir mes commandes",
    login: "Vous devez vous connecter pour réserver",
    fazerLogin: "Se connecter",
    timer: "Disponible dans",
    semStock: "Aucune taille disponible",
    selTamanho: "Sélectionnez une taille",
    voltar: "← Catalogue",
    esgotado: "Épuisé",
    nota: "Vous recevrez une notification quand la pièce sera disponible. Vous avez 24h pour confirmer.",
  },
  lt: {
    titulo: "Rezervuoti drabužį",
    subtitulo: "Kai šis drabužis bus prieinamas, būsite pirmasis tai sužinojęs.",
    peca: "Drabužis, kurį norite rezervuoti",
    tamanho: "Pageidaujamas dydis",
    datas: "Kada jums reikia drabužio?",
    dataInicio: "Pageidaujama pradžios data",
    dataFim: "Pageidaujama pabaigos data",
    entrega: "Kaip norite gauti?",
    entregaOpcoes: [
      { id: "envio", label: "Pristatymas paštu", desc: "Gaukite namuose per 2-3 darbo dienas po patvirtinimo" },
      { id: "presencial", label: "Atsiėmimas asmeniškai", desc: "Atsiimkite parduotuvėje kai drabužis bus prieinamas" },
    ],
    obs: "Pastabos (neprivaloma)",
    obsPlaceholder: "Pvz: Reikia vestuvėms...",
    confirmar: "Patvirtinti rezervaciją",
    sucesso: "Rezervacija patvirtinta!",
    sucessoDesc: "Gausite pranešimą kai drabužis bus prieinamas. Turėsite 24h patvirtinti.",
    verPedidos: "Žiūrėti užsakymus",
    login: "Turite prisijungti rezervuoti",
    fazerLogin: "Prisijungti",
    timer: "Prieinama po",
    semStock: "Nėra dydžių",
    selTamanho: "Pasirinkite dydį",
    voltar: "← Katalogas",
    esgotado: "Išparduota",
    nota: "Gausite pranešimą kai drabužis bus prieinamas. Turėsite 24h patvirtinti.",
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
    const i = setInterval(calc, 60000);
    return () => clearInterval(i);
  }, [dataFim]);
  return (
    <div style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'1rem 1.25rem',background:'#fff8e1',border:'1px solid #f39c12',marginBottom:'1.5rem'}}>
      <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#e67e22',animation:'pulse 2s infinite',flexShrink:0}}></div>
      <span style={{fontSize:'0.9rem',color:'#1a1a18',fontFamily:"'Jost',sans-serif",fontWeight:400}}>
        {label}: <strong>{tempo}</strong>
      </span>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

function ReservaContent() {
  const searchParams = useSearchParams();
  const pecaId = searchParams.get("peca");
  const tamanhoParam = searchParams.get("tamanho");

  const [lang, setLang] = useState("pt");
  const [user, setUser] = useState(null);
  const [peca, setPeca] = useState(null);
  const [stockTamanhos, setStockTamanhos] = useState([]);
  const [dataFimAluguer, setDataFimAluguer] = useState(null);
  const [tamanho, setTamanho] = useState(tamanhoParam || "");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [entrega, setEntrega] = useState("envio");
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(true);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved) setLang(saved);
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (pecaId) {
      const { data: p } = await supabase
        .from("pecas")
        .select("*, categorias(nome), stock_tamanhos(id, tamanho, quantidade_disponivel, alugueres(data_fim, estado))")
        .eq("id", pecaId)
        .single();

      if (p) {
        setPeca({ ...p, categoria: p.categorias?.nome || "" });
        setStockTamanhos(p.stock_tamanhos || []);
        const aluguerAtivo = p.stock_tamanhos
          ?.flatMap(s => s.alugueres || [])
          .find(a => a.estado === "ativo");
        if (aluguerAtivo) setDataFimAluguer(aluguerAtivo.data_fim);
      }
    }
    setLoading(false);
  };

  const confirmarReserva = async () => {
    if (!tamanho) { setErro(i.selTamanho); return; }
    if (!dataInicio || !dataFim) { setErro("Por favor seleciona as datas desejadas"); return; }
    if (!user) { window.location.href = `/entrar?redirect=/reserva?peca=${pecaId}`; return; }

    setLoading(true); setErro("");
    const stockItem = stockTamanhos.find(s => s.tamanho === tamanho);
    if (!stockItem) { setErro("Tamanho não encontrado"); setLoading(false); return; }

    const { error } = await supabase.from("reservas_espera").insert({
      cliente_id: user.id,
      stock_tamanho_id: stockItem.id,
      data_inicio_desejada: dataInicio,
      data_fim_desejada: dataFim,
      tamanho: tamanho,
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
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',color:'#888580'}}>
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
        .rv-nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.25rem 4rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--grey-200); }
        .rv-nav-logo { font-family:var(--serif); font-size:1.2rem; font-weight:400; letter-spacing:0.25em; text-transform:uppercase; text-decoration:none; color:var(--black); }
        .rv-nav-back { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:#5a5855; text-decoration:none; font-weight:400; }
        .rv-page { padding:6rem 4rem 4rem; max-width:900px; margin:0 auto; display:grid; grid-template-columns:1fr 360px; gap:2rem; align-items:start; }
        .rv-section { background:var(--white); padding:2rem; margin-bottom:1.5rem; }
        .rv-title { font-size:0.68rem; letter-spacing:0.25em; text-transform:uppercase; color:#5a5855; font-weight:500; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--grey-100); }
        .rv-peca { display:flex; gap:1.25rem; align-items:center; }
        .rv-peca-img { width:72px; height:90px; object-fit:cover; background:var(--grey-100); flex-shrink:0; }
        .rv-peca-nome { font-family:var(--serif); font-size:1.4rem; font-weight:300; color:var(--black); margin-bottom:0.25rem; }
        .rv-peca-cat { font-size:0.68rem; letter-spacing:0.2em; text-transform:uppercase; color:#5a5855; }
        .rv-tamanhos { display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.5rem; }
        .rv-tam { width:52px; height:52px; display:flex; align-items:center; justify-content:center; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.85rem; cursor:pointer; font-family:var(--sans); font-weight:400; transition:all 0.2s; color:var(--black); }
        .rv-tam:hover { border-color:var(--black); }
        .rv-tam.selected { background:var(--black); color:var(--white); border-color:var(--black); }
        .rv-tam.esgotado { color:var(--grey-200); cursor:not-allowed; text-decoration:line-through; }
        .rv-dates { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .rv-label { display:block; font-size:0.72rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--grey-600); margin-bottom:0.5rem; font-weight:500; }
        .rv-input { width:100%; padding:0.9rem 1rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:1rem; font-family:var(--sans); color:var(--black); outline:none; transition:border-color 0.2s; border-radius:0; }
        .rv-input:focus { border-color:var(--black); }
        .rv-textarea { width:100%; padding:0.9rem 1rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:1rem; font-family:var(--sans); color:var(--black); outline:none; border-radius:0; resize:vertical; min-height:80px; }
        .rv-opcoes { display:flex; flex-direction:column; gap:0.75rem; }
        .rv-opcao { display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem; border:1.5px solid var(--grey-200); cursor:pointer; transition:all 0.2s; }
        .rv-opcao.selected { border-color:var(--black); background:var(--grey-100); }
        .rv-opcao-radio { width:18px; height:18px; border-radius:50%; border:2px solid var(--grey-200); flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .rv-opcao.selected .rv-opcao-radio { border-color:var(--black); background:var(--black); }
        .rv-opcao.selected .rv-opcao-radio::after { content:''; width:6px; height:6px; border-radius:50%; background:var(--white); }
        .rv-opcao-label { font-size:0.95rem; font-weight:500; color:var(--black); }
        .rv-opcao-desc { font-size:0.8rem; color:#5a5855; }
        .rv-resumo { background:var(--white); padding:2rem; position:sticky; top:6rem; }
        .rv-nota { background:#f0eeeb; padding:1rem 1.25rem; border-left:3px solid var(--rosa); font-size:0.88rem; color:var(--grey-600); line-height:1.7; margin-bottom:1.25rem; }
        .rv-btn { width:100%; padding:1.15rem; background:var(--rosa); color:var(--white); border:none; font-size:0.78rem; letter-spacing:0.2em; text-transform:uppercase; font-family:var(--sans); font-weight:500; cursor:pointer; transition:background 0.2s; }
        .rv-btn:hover { background:#a85c72; }
        .rv-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .rv-erro { color:#c0392b; font-size:0.9rem; margin-top:0.75rem; padding:0.75rem; background:#fff5f5; border:1px solid #f5c6cb; }
        .rv-login { text-align:center; padding:2rem; }
        .rv-login p { font-size:1rem; color:#5a5855; margin-bottom:1.25rem; }
        .rv-login a { display:inline-block; padding:1rem 2rem; background:var(--black); color:var(--white); text-decoration:none; font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; font-family:var(--sans); font-weight:500; }
        @media (max-width:768px) {
          .rv-nav { padding:1rem 1.25rem; }
          .rv-page { grid-template-columns:1fr; padding:5rem 1.25rem 6rem; }
          .rv-resumo { position:static; }
          .rv-dates { grid-template-columns:1fr; }
          .rv-section { padding:1.5rem 1.25rem; }
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      <nav className="rv-nav">
        <a href="/" className="rv-nav-logo">Nora Grei</a>
        <a href="/catalogo" className="rv-nav-back">{i.voltar}</a>
      </nav>

      <div className="rv-page">
        <div>
          {/* TIMER */}
          {dataFimAluguer && <Timer dataFim={dataFimAluguer} label={i.timer} />}

          {/* PEÇA */}
          <div className="rv-section">
            <p className="rv-title">{i.peca}</p>
            {peca && (
              <div className="rv-peca">
                {peca.fotos?.[0] && <img src={peca.fotos[0]} alt={peca.nome} className="rv-peca-img" />}
                <div>
                  {peca.categoria && <p className="rv-peca-cat">{peca.categoria}</p>}
                  <p className="rv-peca-nome">{peca.nome}</p>
                  <p style={{fontSize:'1rem',color:'var(--black)',fontWeight:500,marginTop:'0.25rem'}}>{peca.preco_aluguer_dia}€/dia</p>
                </div>
              </div>
            )}
          </div>

          {/* TAMANHOS */}
          <div className="rv-section">
            <p className="rv-title">{i.tamanho}</p>
            <div className="rv-tamanhos">
              {stockTamanhos.map(s => (
                <button
                  key={s.tamanho}
                  className={`rv-tam${tamanho === s.tamanho ? " selected" : ""}${s.quantidade_disponivel > 0 ? " esgotado" : ""}`}
                  onClick={() => s.quantidade_disponivel === 0 && setTamanho(s.tamanho)}
                  title={s.quantidade_disponivel > 0 ? i.esgotado : ""}
                >
                  {s.tamanho}
                </button>
              ))}
            </div>
          </div>

          {/* DATAS */}
          <div className="rv-section">
            <p className="rv-title">{i.datas}</p>
            <div className="rv-dates">
              <div>
                <label className="rv-label">{i.dataInicio}</label>
                <input className="rv-input" type="date" min={hoje} value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
              </div>
              <div>
                <label className="rv-label">{i.dataFim}</label>
                <input className="rv-input" type="date" min={dataInicio || hoje} value={dataFim} onChange={e => setDataFim(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ENTREGA */}
          <div className="rv-section">
            <p className="rv-title">{i.entrega}</p>
            <div className="rv-opcoes">
              {i.entregaOpcoes.map(op => (
                <div key={op.id} className={`rv-opcao${entrega === op.id ? " selected" : ""}`} onClick={() => setEntrega(op.id)}>
                  <div className="rv-opcao-radio"></div>
                  <div>
                    <div className="rv-opcao-label">{op.label}</div>
                    <div className="rv-opcao-desc">{op.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OBSERVAÇÕES */}
          <div className="rv-section">
            <p className="rv-title">{i.obs}</p>
            <textarea className="rv-textarea" value={obs} onChange={e => setObs(e.target.value)} placeholder={i.obsPlaceholder} />
          </div>
        </div>

        {/* RESUMO */}
        <div className="rv-resumo">
          <p className="rv-title">Resumo da reserva</p>
          {!user ? (
            <div className="rv-login">
              <p>{i.login}</p>
              <a href="/entrar">{i.fazerLogin}</a>
            </div>
          ) : (
            <>
              <div className="rv-nota">{i.nota}</div>
              {peca && (
                <div style={{marginBottom:'1.25rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.92rem',padding:'0.6rem 0',borderBottom:'1px solid var(--grey-100)',color:'#5a5855'}}>
                    <span>Peça</span>
                    <span style={{color:'var(--black)',fontWeight:500}}>{peca.nome}</span>
                  </div>
                  {tamanho && (
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.92rem',padding:'0.6rem 0',borderBottom:'1px solid var(--grey-100)',color:'#5a5855'}}>
                      <span>Tamanho</span>
                      <span style={{color:'var(--black)',fontWeight:500}}>{tamanho}</span>
                    </div>
                  )}
                  {dataInicio && dataFim && (
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.92rem',padding:'0.6rem 0',borderBottom:'1px solid var(--grey-100)',color:'#5a5855'}}>
                      <span>Datas</span>
                      <span style={{color:'var(--black)',fontWeight:500}}>{dataInicio} → {dataFim}</span>
                    </div>
                  )}
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.92rem',padding:'0.6rem 0',color:'#5a5855'}}>
                    <span>Entrega</span>
                    <span style={{color:'var(--black)',fontWeight:500}}>{entrega === 'envio' ? 'Envio postal' : 'Presencial'}</span>
                  </div>
                </div>
              )}
              {erro && <div className="rv-erro">{erro}</div>}
              <button className="rv-btn" onClick={confirmarReserva} disabled={loading || !tamanho || !dataInicio || !dataFim}>
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