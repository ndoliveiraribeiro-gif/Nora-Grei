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
    titulo: "Finalizar aluguer",
    peca: "A tua peça",
    datas: "Datas de aluguer",
    dataInicio: "Data de início",
    dataFim: "Data de fim",
    dias: (n) => `${n} dia${n !== 1 ? "s" : ""}`,
    entrega: "Método de entrega",
    entregaOpcoes: [
      { id: "envio", label: "Envio para casa", desc: "Entrega em 1-2 dias úteis" },
      { id: "presencial", label: "Levantamento presencial", desc: "Na nossa loja" },
    ],
    pagamento: "Método de pagamento",
    pagamentoOpcoes: [
      { id: "cartao", label: "Cartão crédito/débito", desc: "Via Stripe — seguro e rápido" },
      { id: "mbway", label: "MB Way", desc: "Pagamento instantâneo" },
      { id: "transferencia", label: "Transferência imediata", desc: "Envie comprovativo" },
      { id: "dinheiro", label: "Dinheiro", desc: "Apenas presencial" },
      { id: "cheque", label: "Cheque visado", desc: "Apenas presencial" },
    ],
    deposito: "Depósito de caução",
    depositoOpcoes: [
      { id: "cartao", label: "Cartão crédito/débito", desc: "Reservado via Stripe, devolvido automaticamente" },
      { id: "transferencia", label: "Transferência bancária", desc: "Envie comprovativo, devolvemos em 2 dias úteis" },
      { id: "cheque", label: "Cheque visado", desc: "Entregue presencialmente na recolha" },
      { id: "dinheiro", label: "Dinheiro", desc: "Pago e devolvido em mãos — presencial" },
    ],
    resumo: "Resumo",
    aluguer: "Aluguer",
    higienizacao: "Taxa de higienização",
    depositoVal: "Depósito (devolvido)",
    total: "Total a pagar agora",
    totalSemDeposito: "* O depósito será devolvido após inspeção da peça",
    confirmar: "Confirmar aluguer",
    login: "Precisa de fazer login para continuar",
    fazerLogin: "Fazer login",
    tamanho: "Tamanho",
    selecione: "Selecione",
    pontos: (n) => `Tens ${n} pontos — a ${10 - (n % 10)} de um aluguer gratuito!`,
    gratis: "🎉 Tens um aluguer gratuito disponível! Aplicado automaticamente.",
    obrigatorio: "Por favor preencha todos os campos",
    sucesso: "Aluguer confirmado! Receberás um email com os detalhes.",
  },
  fr: {
    titulo: "Finaliser la location",
    peca: "Votre pièce",
    datas: "Dates de location",
    dataInicio: "Date de début",
    dataFim: "Date de fin",
    dias: (n) => `${n} jour${n !== 1 ? "s" : ""}`,
    entrega: "Mode de livraison",
    entregaOpcoes: [
      { id: "envio", label: "Livraison à domicile", desc: "Livraison en 1-2 jours ouvrés" },
      { id: "presencial", label: "Retrait en boutique", desc: "Dans notre boutique" },
    ],
    pagamento: "Mode de paiement",
    pagamentoOpcoes: [
      { id: "cartao", label: "Carte crédit/débit", desc: "Via Stripe — sécurisé et rapide" },
      { id: "mbway", label: "MB Way", desc: "Paiement instantané" },
      { id: "transferencia", label: "Virement immédiat", desc: "Envoyez le justificatif" },
      { id: "dinheiro", label: "Espèces", desc: "En personne uniquement" },
      { id: "cheque", label: "Chèque certifié", desc: "En personne uniquement" },
    ],
    deposito: "Dépôt de garantie",
    depositoOpcoes: [
      { id: "cartao", label: "Carte crédit/débit", desc: "Réservé via Stripe, remboursé automatiquement" },
      { id: "transferencia", label: "Virement bancaire", desc: "Envoyez le justificatif, remboursé sous 2 jours" },
      { id: "cheque", label: "Chèque certifié", desc: "Remis en personne à la récupération" },
      { id: "dinheiro", label: "Espèces", desc: "Payé et remboursé en mains propres" },
    ],
    resumo: "Récapitulatif",
    aluguer: "Location",
    higienizacao: "Frais de nettoyage",
    depositoVal: "Dépôt (remboursé)",
    total: "Total à payer maintenant",
    totalSemDeposito: "* Le dépôt sera remboursé après inspection",
    confirmar: "Confirmer la location",
    login: "Vous devez vous connecter pour continuer",
    fazerLogin: "Se connecter",
    tamanho: "Taille",
    selecione: "Sélectionnez",
    pontos: (n) => `Vous avez ${n} points — encore ${10 - (n % 10)} pour une location gratuite!`,
    gratis: "🎉 Vous avez une location gratuite! Appliquée automatiquement.",
    obrigatorio: "Veuillez remplir tous les champs",
    sucesso: "Location confirmée! Vous recevrez un email avec les détails.",
  },
  lt: {
    titulo: "Užbaigti nuomą",
    peca: "Jūsų drabužis",
    datas: "Nuomos datos",
    dataInicio: "Pradžios data",
    dataFim: "Pabaigos data",
    dias: (n) => `${n} diena${n !== 1 ? "s" : ""}`,
    entrega: "Pristatymo būdas",
    entregaOpcoes: [
      { id: "envio", label: "Pristatymas į namus", desc: "Pristatymas per 1-2 darbo dienas" },
      { id: "presencial", label: "Atsiėmimas asmeniškai", desc: "Mūsų parduotuvėje" },
    ],
    pagamento: "Mokėjimo būdas",
    pagamentoOpcoes: [
      { id: "cartao", label: "Kredito/debeto kortelė", desc: "Per Stripe — saugu ir greita" },
      { id: "mbway", label: "MB Way", desc: "Momentinis mokėjimas" },
      { id: "transferencia", label: "Skubus pavedimas", desc: "Išsiųskite patvirtinimą" },
      { id: "dinheiro", label: "Grynieji pinigai", desc: "Tik asmeniškai" },
      { id: "cheque", label: "Banko čekis", desc: "Tik asmeniškai" },
    ],
    deposito: "Užstatas",
    depositoOpcoes: [
      { id: "cartao", label: "Kredito/debeto kortelė", desc: "Per Stripe, grąžinama automatiškai" },
      { id: "transferencia", label: "Banko pavedimas", desc: "Išsiųskite patvirtinimą, grąžiname per 2 dienas" },
      { id: "cheque", label: "Banko čekis", desc: "Pateikiamas asmeniškai atsiimant" },
      { id: "dinheiro", label: "Grynieji pinigai", desc: "Mokama ir grąžinama rankomis" },
    ],
    resumo: "Suvestinė",
    aluguer: "Nuoma",
    higienizacao: "Valymo mokestis",
    depositoVal: "Užstatas (grąžinamas)",
    total: "Iš viso mokėti dabar",
    totalSemDeposito: "* Užstatas bus grąžintas po patikrinimo",
    confirmar: "Patvirtinti nuomą",
    login: "Turite prisijungti tęsti",
    fazerLogin: "Prisijungti",
    tamanho: "Dydis",
    selecione: "Pasirinkite",
    pontos: (n) => `Turite ${n} taškų — dar ${10 - (n % 10)} iki nemokamos nuomos!`,
    gratis: "🎉 Turite nemokamą nuomą! Pritaikyta automatiškai.",
    obrigatorio: "Prašome užpildyti visus laukus",
    sucesso: "Nuoma patvirtinta! Gausite el. laišką su detalėmis.",
  },
};

const HIGIENIZACAO = 9;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const pecaId = searchParams.get("peca");
  const tamanhoParam = searchParams.get("tamanho");

  const [lang, setLang] = useState("pt");
  const [user, setUser] = useState(null);
  const [peca, setPeca] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [entrega, setEntrega] = useState("envio");
  const [pagamento, setPagamento] = useState("cartao");
  const [deposito, setDeposito] = useState("cartao");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

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
      const { data } = await supabase
        .from("pecas")
        .select("*, categorias(nome)")
        .eq("id", pecaId)
        .single();
      if (data) setPeca({ ...data, categoria: data.categorias?.nome || "" });
    } else {
      setPeca({
        id: "1", nome: "Vestido Seda Noite", categoria: "Vestidos",
        preco_aluguer_dia: 35, valor_peca: 450,
        fotos: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80"],
      });
    }

    if (user) {
      const { data: cliente } = await supabase.from("clientes").select("pontos").eq("id", user.id).single();
      if (cliente) setPontos(cliente.pontos || 0);
    }
  };

  const i = t[lang] || t.pt;

  const numDias = dataInicio && dataFim
    ? Math.max(1, Math.ceil((new Date(dataFim) - new Date(dataInicio)) / 86400000))
    : 0;

  const temGratis = pontos >= 10 && pontos % 10 === 0;
  const valorAluguer = temGratis ? 0 : (peca ? peca.preco_aluguer_dia * numDias : 0);
  const valorDeposito = peca ? peca.valor_peca : 0;
  const totalAgora = valorAluguer + HIGIENIZACAO + (deposito === "cartao" ? valorDeposito : 0);

  const confirmar = async () => {
    if (!dataInicio || !dataFim) { setErro(i.obrigatorio); return; }
    if (!user) { window.location.href = `/entrar?redirect=/checkout?peca=${pecaId}&tamanho=${tamanhoParam}`; return; }
    setLoading(true); setErro("");
    try {
      const { error } = await supabase.from("alugueres").insert({
        cliente_id: user.id,
        stock_tamanho_id: tamanhoParam,
        data_inicio: dataInicio,
        data_fim: dataFim,
        tipo: temGratis ? "subscricao" : "avulso",
        estado: "pendente",
        metodo_entrega: entrega,
        valor_aluguer: valorAluguer,
        deposito_valor: valorDeposito,
        deposito_modalidade: deposito,
        deposito_estado: "pendente",
      });
      if (error) throw error;
      if (temGratis) {
        await supabase.from("clientes").update({ pontos: pontos - 10 }).eq("id", user.id);
      } else {
        await supabase.from("clientes").update({ pontos: pontos + 1, total_pecas_alugadas: pontos + 1 }).eq("id", user.id);
      }
      setSucesso(true);
    } catch(e) { setErro(e.message); }
    setLoading(false);
  };

  if (sucesso) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1.5rem',padding:'2rem',fontFamily:"'Jost',sans-serif",textAlign:'center'}}>
      <div style={{fontSize:'3rem'}}>🎉</div>
      <h1 style={{fontFamily:"'Cormorant',serif",fontSize:'2.5rem',fontWeight:300,color:'#080808'}}>{i.sucesso}</h1>
      <a href="/perfil" style={{background:'#080808',color:'#f8f7f5',padding:'1rem 2.5rem',textDecoration:'none',fontSize:'0.75rem',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",fontWeight:500}}>Ver os meus pedidos</a>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --black:#080808; --white:#f8f7f5; --grey-100:#f0eeeb; --grey-200:#e2dfda; --grey-600:#1a1a18; --rosa:#c4748a; --serif:'Cormorant',Georgia,serif; --sans:'Jost',Arial,sans-serif; }
        body { background:var(--grey-100); font-family:var(--sans); font-weight:400; font-size:17px; -webkit-font-smoothing:antialiased; }
        .ck-nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.25rem 4rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--grey-200); }
        .ck-nav-logo { font-family:var(--serif); font-size:1.2rem; font-weight:400; letter-spacing:0.25em; text-transform:uppercase; text-decoration:none; color:var(--black); }
        .ck-nav-back { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:#5a5855; text-decoration:none; font-weight:400; }
        .ck-page { padding:6rem 4rem 4rem; max-width:1000px; margin:0 auto; display:grid; grid-template-columns:1fr 380px; gap:2rem; align-items:start; }
        .ck-section { background:var(--white); padding:2rem; margin-bottom:1.5rem; }
        .ck-section-title { font-size:0.68rem; letter-spacing:0.25em; text-transform:uppercase; color:#5a5855; font-weight:500; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--grey-100); }
        .ck-peca { display:flex; gap:1.25rem; align-items:center; }
        .ck-peca-img { width:72px; height:90px; object-fit:cover; background:var(--grey-100); flex-shrink:0; }
        .ck-peca-nome { font-family:var(--serif); font-size:1.4rem; font-weight:300; color:var(--black); margin-bottom:0.3rem; }
        .ck-peca-cat { font-size:0.68rem; letter-spacing:0.2em; text-transform:uppercase; color:#5a5855; font-weight:400; }
        .ck-peca-tam { font-size:0.82rem; color:#5a5855; margin-top:0.3rem; }
        .ck-dates { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .ck-label { display:block; font-size:0.72rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--grey-600); margin-bottom:0.5rem; font-weight:500; }
        .ck-input { width:100%; padding:0.9rem 1rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:1rem; font-family:var(--sans); color:var(--black); outline:none; transition:border-color 0.2s; border-radius:0; }
        .ck-input:focus { border-color:var(--black); }
        .ck-options { display:flex; flex-direction:column; gap:0.75rem; }
        .ck-option { display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem; border:1.5px solid var(--grey-200); cursor:pointer; transition:border-color 0.2s; background:var(--white); }
        .ck-option.selected { border-color:var(--black); background:var(--grey-100); }
        .ck-option-radio { width:18px; height:18px; border-radius:50%; border:2px solid var(--grey-200); flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .ck-option.selected .ck-option-radio { border-color:var(--black); background:var(--black); }
        .ck-option.selected .ck-option-radio::after { content:''; width:6px; height:6px; border-radius:50%; background:var(--white); }
        .ck-option-label { font-size:0.95rem; font-weight:500; color:var(--black); margin-bottom:0.2rem; }
        .ck-option-desc { font-size:0.8rem; color:#5a5855; font-weight:400; }
        .ck-pontos { background:var(--grey-100); padding:1rem 1.25rem; border-left:3px solid var(--rosa); font-size:0.9rem; color:var(--grey-600); font-weight:400; }
        .ck-gratis { background:#fff0f3; padding:1rem 1.25rem; border-left:3px solid var(--rosa); font-size:0.95rem; color:#a85c72; font-weight:500; }
        .ck-resumo { background:var(--white); padding:2rem; position:sticky; top:6rem; }
        .ck-resumo-linha { display:flex; justify-content:space-between; font-size:0.95rem; padding:0.6rem 0; border-bottom:1px solid var(--grey-100); color:var(--grey-600); }
        .ck-resumo-linha:last-of-type { border-bottom:none; }
        .ck-resumo-total { display:flex; justify-content:space-between; font-size:1.1rem; font-weight:500; padding:1rem 0 0; color:var(--black); border-top:2px solid var(--black); margin-top:0.5rem; }
        .ck-resumo-nota { font-size:0.75rem; color:#5a5855; margin-top:0.75rem; line-height:1.5; font-style:italic; }
        .ck-btn { width:100%; padding:1.15rem; background:var(--black); color:var(--white); border:none; font-size:0.78rem; letter-spacing:0.2em; text-transform:uppercase; font-family:var(--sans); font-weight:500; cursor:pointer; transition:background 0.2s; margin-top:1.25rem; }
        .ck-btn:hover { background:#2a2926; }
        .ck-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .ck-erro { color:#c0392b; font-size:0.9rem; margin-top:0.75rem; padding:0.75rem; background:#fff5f5; border:1px solid #f5c6cb; }
        .ck-login { text-align:center; padding:3rem; }
        .ck-login p { font-size:1rem; color:#5a5855; margin-bottom:1.5rem; }
        .ck-login a { display:inline-block; padding:1rem 2.5rem; background:var(--black); color:var(--white); text-decoration:none; font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; font-family:var(--sans); font-weight:500; }
        @media (max-width:768px) {
          .ck-nav { padding:1rem 1.25rem; }
          .ck-page { grid-template-columns:1fr; padding:5rem 1.25rem 6rem; gap:1rem; }
          .ck-resumo { position:static; }
          .ck-dates { grid-template-columns:1fr; }
          .ck-section { padding:1.5rem 1.25rem; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      <nav className="ck-nav">
        <a href="/" className="ck-nav-logo">Nora Grei</a>
        <a href="/catalogo" className="ck-nav-back">← Catálogo</a>
      </nav>

      <div className="ck-page">
        <div>
          {/* PEÇA */}
          <div className="ck-section">
            <p className="ck-section-title">{i.peca}</p>
            {peca && (
              <div className="ck-peca">
                {peca.fotos?.[0] && <img src={peca.fotos[0]} alt={peca.nome} className="ck-peca-img" />}
                <div>
                  {peca.categoria && <p className="ck-peca-cat">{peca.categoria}</p>}
                  <p className="ck-peca-nome">{peca.nome}</p>
                  {tamanhoParam && <p className="ck-peca-tam">{i.tamanho}: {tamanhoParam}</p>}
                  <p style={{fontSize:'1rem',color:'var(--black)',fontWeight:500,marginTop:'0.3rem'}}>{peca.preco_aluguer_dia}€ {i.dias(1)}</p>
                </div>
              </div>
            )}
          </div>

          {/* PONTOS */}
          {user && pontos > 0 && (
            <div className="ck-section" style={{padding:'1rem 1.5rem'}}>
              {temGratis ? (
                <div className="ck-gratis">{i.gratis}</div>
              ) : (
                <div className="ck-pontos">{i.pontos(pontos)}</div>
              )}
            </div>
          )}

          {/* DATAS */}
          <div className="ck-section">
            <p className="ck-section-title">{i.datas}</p>
            <div className="ck-dates">
              <div>
                <label className="ck-label">{i.dataInicio}</label>
                <input className="ck-input" type="date" min={hoje} value={dataInicio} onChange={e => { setDataInicio(e.target.value); if (dataFim && e.target.value > dataFim) setDataFim(""); }} />
              </div>
              <div>
                <label className="ck-label">{i.dataFim}</label>
                <input className="ck-input" type="date" min={dataInicio || hoje} value={dataFim} onChange={e => setDataFim(e.target.value)} />
              </div>
            </div>
            {numDias > 0 && (
              <p style={{fontSize:'0.9rem',color:'#5a5855',marginTop:'0.75rem'}}>{i.dias(numDias)} selecionados — {(peca?.preco_aluguer_dia * numDias).toFixed(2)}€</p>
            )}
          </div>

          {/* ENTREGA */}
          <div className="ck-section">
            <p className="ck-section-title">{i.entrega}</p>
            <div className="ck-options">
              {i.entregaOpcoes.map(op => (
                <div key={op.id} className={`ck-option${entrega === op.id ? " selected" : ""}`} onClick={() => setEntrega(op.id)}>
                  <div className="ck-option-radio"></div>
                  <div>
                    <div className="ck-option-label">{op.label}</div>
                    <div className="ck-option-desc">{op.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAGAMENTO */}
          <div className="ck-section">
            <p className="ck-section-title">{i.pagamento}</p>
            <div className="ck-options">
              {i.pagamentoOpcoes.map(op => (
                <div key={op.id} className={`ck-option${pagamento === op.id ? " selected" : ""}`} onClick={() => setPagamento(op.id)}>
                  <div className="ck-option-radio"></div>
                  <div>
                    <div className="ck-option-label">{op.label}</div>
                    <div className="ck-option-desc">{op.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DEPÓSITO */}
          <div className="ck-section">
            <p className="ck-section-title">{i.deposito}</p>
            <div className="ck-options">
              {i.depositoOpcoes.map(op => (
                <div key={op.id} className={`ck-option${deposito === op.id ? " selected" : ""}`} onClick={() => setDeposito(op.id)}>
                  <div className="ck-option-radio"></div>
                  <div>
                    <div className="ck-option-label">{op.label}</div>
                    <div className="ck-option-desc">{op.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RESUMO */}
        <div className="ck-resumo">
          <p className="ck-section-title">{i.resumo}</p>

          {!user ? (
            <div className="ck-login">
              <p>{i.login}</p>
              <a href="/entrar">{i.fazerLogin}</a>
            </div>
          ) : (
            <>
              <div className="ck-resumo-linha">
                <span>{i.aluguer} {numDias > 0 ? `(${i.dias(numDias)})` : ""}</span>
                <span>{temGratis ? <span style={{color:'#c4748a',fontWeight:500}}>Grátis</span> : `${valorAluguer.toFixed(2)}€`}</span>
              </div>
              <div className="ck-resumo-linha">
                <span>{i.higienizacao}</span>
                <span>{HIGIENIZACAO}€</span>
              </div>
              <div className="ck-resumo-linha">
                <span>{i.depositoVal}</span>
                <span>{valorDeposito}€</span>
              </div>
              <div className="ck-resumo-total">
                <span>{i.total}</span>
                <span>{totalAgora.toFixed(2)}€</span>
              </div>
              <p className="ck-resumo-nota">{i.totalSemDeposito}</p>
              {erro && <div className="ck-erro">{erro}</div>}
              <button className="ck-btn" onClick={confirmar} disabled={loading || !dataInicio || !dataFim}>
                {loading ? "..." : i.confirmar}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#888580'}}>A carregar...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}