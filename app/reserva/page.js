"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

const t = {
  pt: {
    heroBadge: "Peça Indisponível",
    heroTitulo: "Garante a tua prioridade",
    heroDesc: "Esta peça está actualmente alugada. Reserva o teu lugar na fila — quando ficar disponível, tens 24h exclusivas para confirmar o aluguer antes de abrir ao público.",
    disponivelEm: "Disponível em",
    emBreve: "Em breve",
    comoFunciona: "Como funciona",
    passo1: "Reservas agora", passo1Desc: "Garantes o teu lugar na fila de prioridade",
    passo2: "Recebes alerta", passo2Desc: "Notificação imediata quando a peça ficar livre",
    passo3: "24h para confirmar", passo3Desc: "Janela exclusiva para activar o teu aluguer",
    peca: "A peça",
    tamanho: "Tamanho desejado",
    datas: "Datas pretendidas",
    datasOpcional: "(opcional — podes definir depois)",
    dataInicio: "Data de início",
    dataFim: "Data de fim",
    entrega: "Forma de entrega",
    entregaOpcoes: [
      { id: "envio", label: "Envio por correio", desc: "Recebe em casa em 2-3 dias úteis após confirmação" },
      { id: "presencial", label: "Levantamento presencial", desc: "Levanta na nossa loja quando a peça estiver disponível" },
    ],
    obs: "Nota adicional",
    obsPlaceholder: "Ex: Preciso para casamento no dia 20, tamanho S ou M...",
    confirmar: "Garantir prioridade",
    sucesso: "És o próximo!",
    sucessoTitulo: "Lugar garantido na fila",
    sucessoDesc: "Quando a peça ficar disponível receberás uma notificação. Tens 24h para confirmar o aluguer — depois o lugar passa para o próximo.",
    sucessoNota: "Guarda este número de reserva:",
    verPedidos: "Ver os meus pedidos",
    voltarCatalogo: "Continuar a explorar",
    login: "Inicia sessão para garantir o teu lugar",
    fazerLogin: "Iniciar sessão",
    semStock: "Sem tamanhos disponíveis",
    selTamanho: "Seleciona um tamanho para continuar",
    voltar: "← Voltar",
    esgotado: "Esgotado",
    nota: "Receberás uma notificação quando a peça ficar disponível. Tens 24h exclusivas para confirmar.",
    rPeca: "Peça", rTamanho: "Tamanho", rDatas: "Datas", rEntrega: "Entrega",
    envioPostal: "Envio postal", presencial: "Presencial",
    tamanhoNaoEncontrado: "Tamanho não encontrado",
    conflitoTitulo: "Datas com conflito",
    conflitoDesc: (inicio, fim) => `Já existe um aluguer que ocupa esta peça entre ${inicio} e ${fim} (inclui envio e higienização). Escolhe outro período ou deixa as datas em branco.`,
    semDatas: "Sem datas definidas",
  },
  fr: {
    heroBadge: "Pièce indisponible",
    heroTitulo: "Garantissez votre priorité",
    heroDesc: "Cette pièce est actuellement louée. Réservez votre place dans la file — quand elle sera disponible, vous aurez 24h exclusives pour confirmer avant l'ouverture au public.",
    disponivelEm: "Disponible dans",
    emBreve: "Bientôt",
    comoFunciona: "Comment ça marche",
    passo1: "Réservez maintenant", passo1Desc: "Garantissez votre place dans la file prioritaire",
    passo2: "Recevez une alerte", passo2Desc: "Notification immédiate quand la pièce est libre",
    passo3: "24h pour confirmer", passo3Desc: "Fenêtre exclusive pour activer votre location",
    peca: "La pièce",
    tamanho: "Taille souhaitée",
    datas: "Dates souhaitées",
    datasOpcional: "(optionnel — vous pouvez définir plus tard)",
    dataInicio: "Date de début",
    dataFim: "Date de fin",
    entrega: "Mode de livraison",
    entregaOpcoes: [{ id:"envio",label:"Livraison par courrier",desc:"Recevez chez vous en 2-3 jours ouvrés" },{ id:"presencial",label:"Retrait en boutique",desc:"Retirez en boutique quand disponible" }],
    obs: "Note supplémentaire", obsPlaceholder: "Ex: J'en ai besoin pour un mariage le 20...",
    confirmar: "Garantir la priorité",
    sucesso: "Vous êtes le prochain!",
    sucessoTitulo: "Place garantie dans la file",
    sucessoDesc: "Vous recevrez une notification quand la pièce sera disponible. Vous aurez 24h pour confirmer — ensuite la place passe au suivant.",
    sucessoNota: "Gardez ce numéro de réservation:",
    verPedidos: "Voir mes commandes",
    voltarCatalogo: "Continuer à explorer",
    login: "Connectez-vous pour garantir votre place", fazerLogin: "Se connecter",
    semStock: "Aucune taille disponible", selTamanho: "Sélectionnez une taille pour continuer",
    voltar: "← Retour", esgotado: "Épuisé",
    nota: "Vous recevrez une notification. Vous avez 24h exclusives pour confirmer.",
    rPeca: "Pièce", rTamanho: "Taille", rDatas: "Dates", rEntrega: "Livraison",
    envioPostal: "Envoi postal", presencial: "En personne",
    tamanhoNaoEncontrado: "Taille non trouvée",
    conflitoTitulo: "Dates en conflit",
    conflitoDesc: (inicio, fim) => `Une location occupe déjà cette pièce entre ${inicio} et ${fim}. Choisissez une autre période ou laissez les dates vides.`,
    semDatas: "Sans dates définies",
  },
  lt: {
    heroBadge: "Drabužis neprieinamas",
    heroTitulo: "Užtikrinkite savo prioritetą",
    heroDesc: "Šis drabužis šiuo metu išnuomotas. Rezervuokite vietą eilėje — kai jis bus prieinamas, turėsite 24h išimtinį langą patvirtinti nuomą.",
    disponivelEm: "Prieinama po",
    emBreve: "Netrukus",
    comoFunciona: "Kaip tai veikia",
    passo1: "Rezervuokite dabar", passo1Desc: "Užtikrinkite vietą prioritetinėje eilėje",
    passo2: "Gaukite pranešimą", passo2Desc: "Momentinis pranešimas kai drabužis bus laisvas",
    passo3: "24h patvirtinti", passo3Desc: "Išimtinis langas aktyvuoti nuomą",
    peca: "Drabužis",
    tamanho: "Pageidaujamas dydis",
    datas: "Pageidaujamos datos",
    datasOpcional: "(neprivaloma — galite nustatyti vėliau)",
    dataInicio: "Pradžios data",
    dataFim: "Pabaigos data",
    entrega: "Pristatymo būdas",
    entregaOpcoes: [{ id:"envio",label:"Pristatymas paštu",desc:"Gaukite namuose per 2-3 darbo dienas" },{ id:"presencial",label:"Atsiėmimas asmeniškai",desc:"Atsiimkite parduotuvėje" }],
    obs: "Papildoma pastaba", obsPlaceholder: "Pvz: Reikia vestuvėms...",
    confirmar: "Užtikrinti prioritetą",
    sucesso: "Jūs esate kitas!",
    sucessoTitulo: "Vieta eilėje garantuota",
    sucessoDesc: "Gausite pranešimą kai drabužis bus prieinamas. Turėsite 24h patvirtinti — po to vieta pereis kitam.",
    sucessoNota: "Išsaugokite šį rezervacijos numerį:",
    verPedidos: "Žiūrėti užsakymus",
    voltarCatalogo: "Tęsti naršymą",
    login: "Prisijunkite, kad užtikrintumėte vietą", fazerLogin: "Prisijungti",
    semStock: "Nėra dydžių", selTamanho: "Pasirinkite dydį tęsti",
    voltar: "← Grįžti", esgotado: "Išparduota",
    nota: "Gausite pranešimą. Turėsite 24h išimtinį langą patvirtinti.",
    rPeca: "Drabužis", rTamanho: "Dydis", rDatas: "Datos", rEntrega: "Pristatymas",
    envioPostal: "Pristatymas paštu", presencial: "Asmeniškai",
    tamanhoNaoEncontrado: "Dydis nerastas",
    conflitoTitulo: "Datų konfliktas",
    conflitoDesc: (inicio, fim) => `Jau yra nuoma, kuri užima šį drabužį nuo ${inicio} iki ${fim}. Pasirinkite kitą laikotarpį arba palikite datas tuščias.`,
    semDatas: "Be datų",
  },
};

function HeroTimer({ dataFim, labelDisponivel, labelEmBreve }) {
  const [tempo, setTempo] = useState({ dias: 0, horas: 0, mins: 0, total: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(dataFim) - new Date();
      if (diff <= 0) { setTempo({ dias: 0, horas: 0, mins: 0, total: 0 }); return; }
      setTempo({
        dias: Math.floor(diff / 86400000),
        horas: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        total: diff,
      });
    };
    calc();
    const iv = setInterval(calc, 60000);
    return () => clearInterval(iv);
  }, [dataFim]);

  if (tempo.total <= 0) return (
    <div style={{textAlign:'center',padding:'1rem 0',fontFamily:"'Jost',sans-serif",fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#5a5855'}}>{labelEmBreve}</div>
  );

  return (
    <div style={{marginBottom:'2rem'}}>
      <p style={{fontFamily:"'Jost',sans-serif",fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:'#888',marginBottom:'0.75rem',textAlign:'center'}}>{labelDisponivel}</p>
      <div style={{display:'flex',gap:'0.5rem',justifyContent:'center'}}>
        {tempo.dias > 0 && (
          <div style={{textAlign:'center',background:'#080808',color:'#f8f7f5',padding:'0.75rem 1.25rem',minWidth:'64px'}}>
            <div style={{fontFamily:"var(--sans)",fontSize:'2rem',fontWeight:600,lineHeight:1}}>{tempo.dias}</div>
            <div style={{fontFamily:"'Jost',sans-serif",fontSize:'0.52rem',letterSpacing:'0.18em',textTransform:'uppercase',opacity:0.6,marginTop:'0.2rem'}}>dias</div>
          </div>
        )}
        <div style={{textAlign:'center',background:'#080808',color:'#f8f7f5',padding:'0.75rem 1.25rem',minWidth:'64px'}}>
          <div style={{fontFamily:"var(--sans)",fontSize:'2rem',fontWeight:600,lineHeight:1}}>{String(tempo.horas).padStart(2,'0')}</div>
          <div style={{fontFamily:"'Jost',sans-serif",fontSize:'0.52rem',letterSpacing:'0.18em',textTransform:'uppercase',opacity:0.6,marginTop:'0.2rem'}}>horas</div>
        </div>
        <div style={{textAlign:'center',background:'#080808',color:'#f8f7f5',padding:'0.75rem 1.25rem',minWidth:'64px'}}>
          <div style={{fontFamily:"var(--sans)",fontSize:'2rem',fontWeight:600,lineHeight:1}}>{String(tempo.mins).padStart(2,'0')}</div>
          <div style={{fontFamily:"'Jost',sans-serif",fontSize:'0.52rem',letterSpacing:'0.18em',textTransform:'uppercase',opacity:0.6,marginTop:'0.2rem'}}>min</div>
        </div>
      </div>
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
    <div style={{minHeight:'100vh',background:'#f8f7f5',fontFamily:"'Jost',sans-serif",display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');`}</style>
      <div style={{maxWidth:'420px',width:'100%'}}>
        {/* Checkmark animado */}
        <div style={{width:64,height:64,borderRadius:'50%',background:'#080808',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem',fontSize:'1.6rem',color:'#f8f7f5'}}>✓</div>
        <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',textTransform:'uppercase',color:'#b0ada6',marginBottom:'0.5rem'}}>{i.sucesso}</p>
        <h1 style={{fontFamily:"var(--sans)",fontSize:'2rem',fontWeight:600,color:'#080808',marginBottom:'1rem',lineHeight:1.1}}>{i.sucessoTitulo}</h1>
        <p style={{fontSize:'0.92rem',color:'#5a5855',lineHeight:1.8,marginBottom:'2rem'}}>{i.sucessoDesc}</p>

        {/* Passos do que vai acontecer */}
        <div style={{background:'#f0eeeb',padding:'1.25rem',marginBottom:'2rem',textAlign:'left'}}>
          {[
            { n:'1', t: i.passo2, d: i.passo2Desc },
            { n:'2', t: i.passo3, d: i.passo3Desc },
          ].map(p => (
            <div key={p.n} style={{display:'flex',gap:'0.75rem',alignItems:'flex-start',marginBottom:'0.75rem'}}>
              <div style={{width:22,height:22,borderRadius:'50%',background:'#080808',color:'#f8f7f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.58rem',fontWeight:500,flexShrink:0,marginTop:'0.1rem'}}>{p.n}</div>
              <div>
                <div style={{fontSize:'0.82rem',fontWeight:500,color:'#080808'}}>{p.t}</div>
                <div style={{fontSize:'0.78rem',color:'#5a5855'}}>{p.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          <a href="/pedidos" style={{display:'block',padding:'1rem',background:'#080808',color:'#f8f7f5',textDecoration:'none',fontSize:'0.72rem',letterSpacing:'0.18em',textTransform:'uppercase',fontWeight:500,textAlign:'center'}}>
            {i.verPedidos}
          </a>
          <a href="/catalogo" style={{display:'block',padding:'0.9rem',border:'1px solid #dedad4',color:'#5a5855',textDecoration:'none',fontSize:'0.7rem',letterSpacing:'0.15em',textTransform:'uppercase',textAlign:'center'}}>
            {i.voltarCatalogo}
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --black:#080808; --white:#f8f7f5; --grey-100:#f0eeeb; --grey-200:#e2dfda; --grey-600:#1a1a18; --rosa:#c4748a; --serif:'Cormorant',Georgia,serif; --sans:'Jost',Arial,sans-serif; }
        body { background:var(--grey-100); font-family:var(--sans); -webkit-font-smoothing:antialiased; }

        /* NAV */
        .nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1rem 1.25rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--grey-200); }
        .nav-logo { font-family:var(--serif); font-size:1.1rem; font-weight:300; letter-spacing:0.25em; text-transform:uppercase; text-decoration:none; color:var(--black); }
        .nav-back { font-size:0.82rem; letter-spacing:0.15em; text-transform:uppercase; color:#5a5855; text-decoration:none; }

        /* HERO PANEL */
        .hero { background:var(--black); color:var(--white); padding:5.5rem 1.25rem 2rem; text-align:center; }
        .hero-badge { display:inline-block; font-size:0.75rem; letter-spacing:0.28em; text-transform:uppercase; color:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.2); padding:0.3rem 0.75rem; margin-bottom:1.25rem; }
        .hero-titulo { font-family:var(--serif); font-size:clamp(1.8rem,7vw,2.8rem); font-weight:300; line-height:1.05; margin-bottom:0.75rem; }
        .hero-desc { font-size:0.82rem; color:rgba(255,255,255,0.65); line-height:1.8; max-width:44ch; margin:0 auto 1.75rem; }

        /* COMO FUNCIONA */
        .passos { display:flex; gap:0; border-top:1px solid rgba(255,255,255,0.1); padding-top:1.5rem; margin-top:0.5rem; justify-content:center; }
        .passo { text-align:center; padding:0 1rem; flex:1; max-width:140px; }
        .passo-n { width:28px; height:28px; border-radius:50%; border:1px solid rgba(255,255,255,0.3); display:flex; align-items:center; justify-content:center; font-size:0.78rem; margin:0 auto 0.5rem; color:rgba(255,255,255,0.5); }
        .passo-t { font-size:0.82rem; font-weight:500; color:var(--white); margin-bottom:0.2rem; }
        .passo-d { font-size:0.62rem; color:rgba(255,255,255,0.45); line-height:1.5; }

        /* LAYOUT PRINCIPAL */
        .page { padding:1.5rem 1.25rem 7rem; max-width:900px; margin:0 auto; }
        .sec { background:var(--white); padding:1.5rem 1.25rem; margin-bottom:1rem; }
        .sec-t { font-size:0.65rem; letter-spacing:0.25em; text-transform:uppercase; color:#5a5855; font-weight:500; margin-bottom:1.25rem; padding-bottom:0.75rem; border-bottom:1px solid var(--grey-100); }
        .sec-sub { font-size:0.62rem; color:#b0ada6; letter-spacing:0.1em; margin-left:0.5rem; font-weight:400; }

        /* PEÇA */
        .peca-row { display:flex; gap:1rem; align-items:center; }
        .peca-img { width:60px; height:76px; object-fit:cover; background:var(--grey-100); flex-shrink:0; }
        .peca-nome { font-family:var(--sans); font-size:1.1rem; font-weight:500; color:var(--black); margin-bottom:0.2rem; }
        .peca-cat { font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; color:#b0ada6; margin-bottom:0.2rem; }

        /* TAMANHOS */
        .tamanhos { display:flex; gap:0.5rem; flex-wrap:wrap; }
        .tam { min-width:48px; height:48px; display:flex; align-items:center; justify-content:center; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.82rem; cursor:pointer; font-family:var(--sans); color:var(--black); padding:0 0.5rem; }
        .tam.on { background:var(--black); color:var(--white); border-color:var(--black); }
        .tam.esgotado { color:#c4748a; border-color:#e8c4ce; }
        .tam-hint { font-size:0.72rem; color:#888; margin-top:0.6rem; }

        /* DATAS */
        .dates { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
        .lbl { display:block; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; color:#5a5855; margin-bottom:0.4rem; }
        .inp { width:100%; padding:0.85rem 0.9rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.95rem; font-family:var(--sans); color:var(--black); outline:none; }
        .inp:focus { border-color:var(--black); }
        .inp.erro-input { border-color:#c0392b; }
        .conflito-box { background:#fff5f5; padding:0.9rem 1rem; border-left:3px solid #c0392b; margin-top:0.75rem; }
        .conflito-titulo { font-size:0.78rem; font-weight:600; color:#c0392b; margin-bottom:0.2rem; }
        .conflito-desc { font-size:0.75rem; color:#943126; line-height:1.5; }

        /* ENTREGA */
        .opts { display:flex; flex-direction:column; gap:0.6rem; }
        .opt { display:flex; align-items:center; gap:0.9rem; padding:0.9rem 1rem; border:1.5px solid var(--grey-200); cursor:pointer; }
        .opt.on { border-color:var(--black); background:var(--grey-100); }
        .opt-radio { width:16px; height:16px; border-radius:50%; border:2px solid var(--grey-200); flex-shrink:0; }
        .opt.on .opt-radio { border:5px solid var(--black); }
        .opt-label { font-size:0.88rem; font-weight:500; color:var(--black); }
        .opt-desc { font-size:0.75rem; color:#5a5855; }

        /* TEXTAREA */
        .textarea { width:100%; padding:0.85rem 0.9rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.9rem; font-family:var(--sans); color:var(--black); outline:none; resize:vertical; min-height:72px; }

        /* STICKY CTA */
        .sticky-bar { position:fixed; bottom:0; left:0; right:0; z-index:200; background:rgba(248,247,245,0.97); backdrop-filter:blur(16px); border-top:1px solid var(--grey-200); padding:0.85rem 1.25rem calc(0.85rem + env(safe-area-inset-bottom)); }
        .btn-principal { width:100%; padding:1.05rem; background:var(--black); color:var(--white); border:none; font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase; font-family:var(--sans); font-weight:500; cursor:pointer; min-height:48px; }
        .btn-principal:disabled { opacity:0.45; cursor:not-allowed; }
        .btn-login { width:100%; padding:1.05rem; background:var(--black); color:var(--white); border:none; font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase; font-family:var(--sans); font-weight:500; cursor:pointer; min-height:48px; text-decoration:none; display:flex; align-items:center; justify-content:center; }
        .nota-bar { font-size:0.68rem; color:#888; text-align:center; margin-bottom:0.5rem; letter-spacing:0.05em; }
        .erro { font-size:0.78rem; color:#c0392b; padding:0.6rem 0.9rem; background:#fff5f5; border:1px solid #f5c6cb; margin-bottom:0.6rem; }

        /* DESKTOP */
        @media (min-width:769px) {
          .nav { padding:1.25rem 3rem; }
          .hero { padding:6rem 4rem 2.5rem; }
          .page { padding:2rem 3rem 5rem; display:grid; grid-template-columns:1fr 340px; gap:2rem; align-items:start; }
          .col-right { position:sticky; top:5rem; }
          .sticky-bar { display:none; }
          .desktop-cta { display:block; }
          .sec { padding:1.75rem 2rem; }
        }
        @media (max-width:768px) {
          .desktop-cta { display:none; }
          .dates { grid-template-columns:1fr; }
          .passos { gap:0; }
          .passo { padding:0 0.6rem; }
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <a href={`/catalogo${pecaId ? `/${pecaId}` : ''}`} className="nav-back">{i.voltar}</a>
      </nav>

      {/* HERO — countdown + contexto */}
      <div className="hero">
        <div className="hero-badge">{i.heroBadge}</div>
        <h1 className="hero-titulo">{i.heroTitulo}</h1>
        <p className="hero-desc">{i.heroDesc}</p>

        {dataFimAluguer && (
          <HeroTimer dataFim={dataFimAluguer} labelDisponivel={i.disponivelEm} labelEmBreve={i.emBreve} />
        )}

        <div className="passos">
          {[
            { n:'1', t:i.passo1, d:i.passo1Desc },
            { n:'2', t:i.passo2, d:i.passo2Desc },
            { n:'3', t:i.passo3, d:i.passo3Desc },
          ].map(p => (
            <div key={p.n} className="passo">
              <div className="passo-n">{p.n}</div>
              <div className="passo-t">{p.t}</div>
              <div className="passo-d">{p.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="page">
        {/* COLUNA ESQUERDA — formulário */}
        <div>
          {/* PEÇA */}
          {peca && (
            <div className="sec">
              <p className="sec-t">{i.peca}</p>
              <div className="peca-row">
                {peca.fotos?.[0]
                  ? <img src={peca.fotos[0]} alt={peca.nome} className="peca-img" />
                  : <div style={{width:60,height:76,background:'#e8e5e0',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontFamily:"var(--sans)",fontSize:'1rem',fontWeight:300,color:'rgba(0,0,0,0.1)'}}>NG</span></div>
                }
                <div>
                  {peca.categoria && <p className="peca-cat">{peca.categoria}</p>}
                  <p className="peca-nome">{peca.nome}</p>
                  <p style={{fontSize:'1.1rem',color:'var(--black)',fontFamily:"var(--sans)",fontWeight:600,marginTop:'0.25rem'}}>{peca.preco_aluguer_dia}€<span style={{fontSize:'0.7rem',fontFamily:"'Jost',sans-serif",color:'#b0ada6'}}>/dia</span></p>
                </div>
              </div>
            </div>
          )}

          {/* TAMANHO */}
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
                    title={esgotado ? i.esgotado : ""}
                  >
                    {s.tamanho}
                  </button>
                );
              })}
            </div>
            {stockTamanhos.length === 0 && <p style={{fontSize:'0.82rem',color:'#888'}}>{i.semStock}</p>}
            {!tamanho && stockTamanhos.length > 0 && <p className="tam-hint">{i.selTamanho}</p>}
          </div>

          {/* DATAS — opcionais */}
          <div className="sec">
            <p className="sec-t">{i.datas} <span className="sec-sub">{i.datasOpcional}</span></p>
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

          {/* ENTREGA */}
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

          {/* OBS */}
          <div className="sec">
            <p className="sec-t">{i.obs}</p>
            <textarea className="textarea" value={obs} onChange={e => setObs(e.target.value)} placeholder={i.obsPlaceholder} />
          </div>
        </div>

        {/* COLUNA DIREITA — desktop only */}
        <div className="col-right desktop-cta">
          <div className="sec">
            <p className="sec-t">{i.nota}</p>
            {peca && (
              <div style={{marginBottom:'1.25rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',padding:'0.5rem 0',borderBottom:'1px solid var(--grey-100)',color:'#5a5855'}}>
                  <span>{i.rPeca}</span><span style={{color:'var(--black)',fontWeight:500,textAlign:'right',maxWidth:'55%'}}>{peca.nome}</span>
                </div>
                {tamanho && (
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',padding:'0.5rem 0',borderBottom:'1px solid var(--grey-100)',color:'#5a5855'}}>
                    <span>{i.rTamanho}</span><span style={{color:'var(--black)',fontWeight:500}}>{tamanho}</span>
                  </div>
                )}
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',padding:'0.5rem 0',borderBottom:'1px solid var(--grey-100)',color:'#5a5855'}}>
                  <span>{i.rDatas}</span><span style={{color:'var(--black)',fontWeight:500}}>{dataInicio && dataFim ? `${dataInicio} → ${dataFim}` : i.semDatas}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',padding:'0.5rem 0',color:'#5a5855'}}>
                  <span>{i.rEntrega}</span><span style={{color:'var(--black)',fontWeight:500}}>{entrega === 'envio' ? i.envioPostal : i.presencial}</span>
                </div>
              </div>
            )}
            {erro && <div className="erro">{erro}</div>}
            {!user ? (
              <a href={`/entrar?redirect=/reserva?peca=${pecaId}`} className="btn-login">{i.fazerLogin}</a>
            ) : (
              <button className="btn-principal" onClick={confirmarReserva} disabled={loading || !tamanho || !!conflito}>
                {loading ? "..." : i.confirmar}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STICKY BAR — mobile only */}
      <div className="sticky-bar">
        {erro && <div className="erro">{erro}</div>}
        {!tamanho && <p className="nota-bar">{i.selTamanho}</p>}
        {!user ? (
          <a href={`/entrar?redirect=/reserva?peca=${pecaId}`} className="btn-login">{i.fazerLogin}</a>
        ) : (
          <button className="btn-principal" onClick={confirmarReserva} disabled={loading || !tamanho || !!conflito}>
            {loading ? "..." : i.confirmar}
          </button>
        )}
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