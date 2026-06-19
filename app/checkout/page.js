"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

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
      { id: "cartao", label: "Cartão crédito/débito", desc: "Via Stripe — confirmação imediata", automatico: true },
      { id: "mbway", label: "MB Way", desc: "Pagamento instantâneo", automatico: true },
      { id: "transferencia", label: "Transferência bancária", desc: "Envia comprovativo — confirmamos em até 1 dia útil", automatico: false },
      { id: "dinheiro", label: "Dinheiro (presencial)", desc: "Pago no levantamento da peça", automatico: false },
    ],
    deposito: "Depósito de caução",
    depositoOpcoes: [
      { id: "cartao", label: "Cartão crédito/débito", desc: "Reservado via Stripe, devolvido automaticamente", automatico: true },
      { id: "transferencia", label: "Transferência bancária", desc: "Envia comprovativo, devolvemos em 2 dias úteis", automatico: false },
      { id: "dinheiro", label: "Dinheiro (presencial)", desc: "Pago e devolvido em mãos", automatico: false },
    ],
    resumo: "Resumo",
    aluguer: "Aluguer",
    higienizacao: "Taxa de higienização",
    depositoVal: "Depósito (devolvido)",
    total: "Total a pagar agora",
    totalSemDeposito: "* O depósito será devolvido após inspeção da peça",
    confirmar: "Confirmar e pagar",
    confirmarPendente: "Confirmar pedido",
    login: "Precisa de fazer login para continuar",
    fazerLogin: "Fazer login",
    tamanho: "Tamanho",
    pontos: (n) => `Tens ${n} pontos — a ${10 - (n % 10)} de um aluguer gratuito!`,
    gratis: "🎉 Tens um aluguer gratuito disponível! Aplicado automaticamente.",
    obrigatorio: "Por favor preencha todos os campos",
    sucesso: "Pagamento confirmado!",
    sucessoPendente: "Pedido registado!",
    sucessoDesc: "O teu aluguer está confirmado. Vamos preparar a tua peça.",
    sucessoPendenteDesc: "Falta confirmar o pagamento. Envia o comprovativo ou paga presencialmente para avançarmos.",
    nivel: "Nível",
    caucaoDesconto: "Desconto de caução",
    avisoTransferencia: "Após o pagamento, envia o comprovativo para o nosso WhatsApp ou email. O teu pedido fica reservado por 24h.",
    avisoDinheiro: "Paga no momento do levantamento presencial na nossa loja.",
    conflito: "Esta peça já está reservada para essas datas. Escolhe outro período.",
  },
};

const HIGIENIZACAO = 9;

const NIVEL = (n) => {
  if (n >= 20) return { nome: "Platina", icon: "💎", caucao: 0, cor: "#6c5ce7" };
  if (n >= 10) return { nome: "Ouro", icon: "🥇", caucao: 50, cor: "#f39c12" };
  if (n >= 5)  return { nome: "Prata", icon: "🥈", caucao: 75, cor: "#95a5a6" };
  return { nome: "Bronze", icon: "🥉", caucao: 100, cor: "#cd7f32" };
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const pecaId = searchParams.get("peca");
  const tamanhoParam = searchParams.get("tamanho");
  const stockId = searchParams.get("stock_id") || tamanhoParam;

  const [lang, setLang] = useState("pt");
  const [user, setUser] = useState(null);
  const [peca, setPeca] = useState(null);
  const [tamanhoNome, setTamanhoNome] = useState("");
  const [pontos, setPontos] = useState(0);
  const [totalAlugueres, setTotalAlugueres] = useState(0);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [entrega, setEntrega] = useState("envio");
  const [pagamento, setPagamento] = useState("cartao");
  const [deposito, setDeposito] = useState("cartao");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [sucessoPendente, setSucessoPendente] = useState(false);
  const [aReservar, setAReservar] = useState(false);

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
        .select("*, categorias(nome), stock_tamanhos(id, tamanho)")
        .eq("id", pecaId)
        .single();
      if (data) {
        setPeca({ ...data, categoria: data.categorias?.nome || "" });
        if (stockId) {
          const st = data.stock_tamanhos?.find(s => s.id === stockId);
          if (st) setTamanhoNome(st.tamanho);
        }
      }
    }

    if (user) {
      const { data: cliente } = await supabase
        .from("clientes")
        .select("pontos, total_pecas_alugadas")
        .eq("id", user.id)
        .single();
      if (cliente) {
        setPontos(cliente.pontos || 0);
        setTotalAlugueres(cliente.total_pecas_alugadas || 0);
      }
    }
  };

  const i = t[lang] || t.pt;
  const nv = NIVEL(totalAlugueres);

  const numDias = dataInicio && dataFim
    ? Math.max(1, Math.ceil((new Date(dataFim) - new Date(dataInicio)) / 86400000))
    : 0;

  const temGratis = pontos >= 10 && pontos % 10 === 0;
  const valorAluguer = temGratis ? 0 : (peca ? peca.preco_aluguer_dia * numDias : 0);

  const valorDepositoBase = peca ? peca.valor_peca : 0;
  const valorDeposito = Math.round(valorDepositoBase * nv.caucao / 100);
  const descontoDeposito = valorDepositoBase - valorDeposito;

  const pagamentoSelecionado = t.pt.pagamentoOpcoes.find(p => p.id === pagamento);
  const depositoSelecionado = t.pt.depositoOpcoes.find(p => p.id === deposito);
  const tudoAutomatico = pagamentoSelecionado?.automatico && (valorDeposito === 0 || depositoSelecionado?.automatico);

  const totalAgora = valorAluguer + HIGIENIZACAO + (deposito === "cartao" ? valorDeposito : 0);

  // Validar se há conflito de datas com alugueres já em curso para este tamanho
  const verificarConflito = async () => {
    if (!stockId || !dataInicio || !dataFim) return false;
    const { data: conflitos } = await supabase
      .from("alugueres")
      .select("data_inicio, data_fim, data_disponivel_novamente")
      .eq("stock_tamanho_id", stockId)
      .in("estado", ["pendente", "confirmado", "enviado", "ativo", "em_verificacao"]);

    if (!conflitos || conflitos.length === 0) return false;

    const inicioNovo = new Date(dataInicio);
    const fimNovo = new Date(dataFim);

    return conflitos.some(c => {
      const fimExistente = c.data_disponivel_novamente
        ? new Date(c.data_disponivel_novamente)
        : new Date(new Date(c.data_fim).getTime() + 3 * 24 * 60 * 60 * 1000);
      const inicioExistente = new Date(c.data_inicio);
      // Há conflito se os períodos se sobrepõem
      return inicioNovo < fimExistente && fimNovo > inicioExistente;
    });
  };

  const confirmar = async () => {
    if (!dataInicio || !dataFim) { setErro(i.obrigatorio); return; }
    if (!user) { window.location.href = `/entrar?redirect=/checkout?peca=${pecaId}&tamanho=${tamanhoParam}`; return; }

    setLoading(true); setErro("");

    try {
      // Validar conflito de datas antes de criar
      const temConflito = await verificarConflito();
      if (temConflito) {
        setErro(i.conflito);
        setLoading(false);
        return;
      }

      const pagamentoAutomatico = pagamentoSelecionado?.automatico;
      const depositoAutomatico = valorDeposito === 0 || depositoSelecionado?.automatico;
      const tudoConfirmado = pagamentoAutomatico && depositoAutomatico;

      const estadoInicial = tudoConfirmado ? "confirmado" : "pendente";
      const depositoEstadoInicial = depositoAutomatico ? "recebido" : "pendente";

      const { error } = await supabase.from("alugueres").insert({
        cliente_id: user.id,
        stock_tamanho_id: stockId,
        data_inicio: dataInicio,
        data_fim: dataFim,
        tipo: temGratis ? "subscricao" : "avulso",
        estado: estadoInicial,
        metodo_entrega: entrega,
        metodo_pagamento: pagamento,
        valor_aluguer: valorAluguer,
        deposito_valor: valorDeposito,
        deposito_modalidade: deposito,
        deposito_estado: depositoEstadoInicial,
        ...(tudoConfirmado ? { deposito_confirmado_em: new Date().toISOString() } : {}),
      });
      if (error) throw error;

      if (temGratis) {
        await supabase.from("clientes").update({ pontos: pontos - 10 }).eq("id", user.id);
      } else {
        await supabase.from("clientes").update({
          pontos: pontos + 1,
          total_pecas_alugadas: totalAlugueres + 1
        }).eq("id", user.id);
      }

      if (tudoConfirmado) {
        setSucesso(true);
      } else {
        setSucessoPendente(true);
      }
    } catch(e) { setErro(e.message); }
    setLoading(false);
  };

  if (sucesso || sucessoPendente) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1.5rem',padding:'2rem',fontFamily:"'Jost',sans-serif",textAlign:'center'}}>
      <div style={{fontSize:'3rem'}}>{sucesso ? "🎉" : "⏳"}</div>
      <h1 style={{fontFamily:"'Cormorant',serif",fontSize:'2.5rem',fontWeight:300,color:'#080808'}}>{sucesso ? i.sucesso : i.sucessoPendente}</h1>
      <p style={{fontSize:'0.95rem',color:'#5a5855',maxWidth:'40ch',lineHeight:1.7}}>
        {sucesso ? i.sucessoDesc : i.sucessoPendenteDesc}
      </p>
      {sucessoPendente && (pagamento === "transferencia" || deposito === "transferencia") && (
        <div style={{background:'#fff8e1',padding:'1rem 1.5rem',maxWidth:'40ch',fontSize:'0.85rem',color:'#946200',borderLeft:'3px solid #f39c12'}}>
          {i.avisoTransferencia}
        </div>
      )}
      {sucessoPendente && (pagamento === "dinheiro" || deposito === "dinheiro") && (
        <div style={{background:'#f0eeeb',padding:'1rem 1.5rem',maxWidth:'40ch',fontSize:'0.85rem',color:'#5a5855',borderLeft:'3px solid #888'}}>
          {i.avisoDinheiro}
        </div>
      )}
      <a href="/pedidos" style={{background:'#080808',color:'#f8f7f5',padding:'1rem 2.5rem',textDecoration:'none',fontSize:'0.75rem',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",fontWeight:500}}>Ver os meus pedidos</a>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--rosa:#c4748a;--serif:'Cormorant',Georgia,serif;--sans:'Jost',Arial,sans-serif}
        body{background:var(--g1);font-family:var(--sans);font-weight:400;font-size:17px;-webkit-font-smoothing:antialiased}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 4rem;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2)}
        .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:400;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
        .nav-back{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:#5a5855;text-decoration:none;font-weight:400}
        .page{padding:6rem 4rem 4rem;max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 380px;gap:2rem;align-items:start}
        .sec{background:var(--white);padding:2rem;margin-bottom:1.5rem}
        .sec-t{font-size:0.68rem;letter-spacing:0.25em;text-transform:uppercase;color:#5a5855;font-weight:500;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--g1)}
        .peca-row{display:flex;gap:1.25rem;align-items:center}
        .peca-img{width:72px;height:90px;object-fit:cover;background:var(--g1);flex-shrink:0}
        .peca-nome{font-family:var(--serif);font-size:1.4rem;font-weight:300;color:var(--black);margin-bottom:0.3rem}
        .peca-cat{font-size:0.68rem;letter-spacing:0.2em;text-transform:uppercase;color:#5a5855;font-weight:400}
        .peca-tam{font-size:0.82rem;color:#5a5855;margin-top:0.3rem}
        .dates{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .lbl{display:block;font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;color:#1a1a18;margin-bottom:0.5rem;font-weight:500}
        .inp{width:100%;padding:0.9rem 1rem;border:1.5px solid var(--g2);background:var(--white);font-size:1rem;font-family:var(--sans);color:var(--black);outline:none;transition:border-color 0.2s}
        .inp:focus{border-color:var(--black)}
        .opts{display:flex;flex-direction:column;gap:0.75rem}
        .opt{display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem;border:1.5px solid var(--g2);cursor:pointer;transition:border-color 0.2s;background:var(--white)}
        .opt.on{border-color:var(--black);background:var(--g1)}
        .opt-radio{width:18px;height:18px;border-radius:50%;border:2px solid var(--g2);flex-shrink:0;display:flex;align-items:center;justify-content:center}
        .opt.on .opt-radio{border-color:var(--black);background:var(--black)}
        .opt.on .opt-radio::after{content:'';width:6px;height:6px;border-radius:50%;background:var(--white)}
        .opt-label{font-size:0.95rem;font-weight:500;color:var(--black);margin-bottom:0.2rem;display:flex;align-items:center;gap:0.5rem}
        .opt-desc{font-size:0.8rem;color:#5a5855;font-weight:400}
        .badge-auto{font-size:0.55rem;letter-spacing:0.08em;text-transform:uppercase;padding:0.15rem 0.4rem;background:#e8f5e9;color:#27ae60;font-weight:600}
        .badge-manual{font-size:0.55rem;letter-spacing:0.08em;text-transform:uppercase;padding:0.15rem 0.4rem;background:#fff8e1;color:#f39c12;font-weight:600}
        .pontos-box{background:var(--g1);padding:1rem 1.25rem;border-left:3px solid var(--rosa);font-size:0.9rem;color:#1a1a18}
        .gratis-box{background:#fff0f3;padding:1rem 1.25rem;border-left:3px solid var(--rosa);font-size:0.95rem;color:#a85c72;font-weight:500}
        .nivel-box{display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;background:var(--g1);margin-bottom:1rem;font-size:0.85rem}
        .resumo{background:var(--white);padding:2rem;position:sticky;top:6rem}
        .r-linha{display:flex;justify-content:space-between;font-size:0.95rem;padding:0.6rem 0;border-bottom:1px solid var(--g1);color:#5a5855}
        .r-linha:last-of-type{border-bottom:none}
        .r-total{display:flex;justify-content:space-between;font-size:1.1rem;font-weight:500;padding:1rem 0 0;color:var(--black);border-top:2px solid var(--black);margin-top:0.5rem}
        .r-nota{font-size:0.75rem;color:#5a5855;margin-top:0.75rem;line-height:1.5;font-style:italic}
        .btn{width:100%;padding:1.15rem;background:var(--black);color:var(--white);border:none;font-size:0.78rem;letter-spacing:0.2em;text-transform:uppercase;font-family:var(--sans);font-weight:500;cursor:pointer;transition:background 0.2s;margin-top:1.25rem}
        .btn:hover{background:#2a2926}
        .btn:disabled{opacity:0.6;cursor:not-allowed}
        .erro{color:#c0392b;font-size:0.9rem;margin-top:0.75rem;padding:0.75rem;background:#fff5f5;border:1px solid #f5c6cb}
        .login-box{text-align:center;padding:3rem}
        .login-box p{font-size:1rem;color:#5a5855;margin-bottom:1.5rem}
        .login-box a{display:inline-block;padding:1rem 2.5rem;background:var(--black);color:var(--white);text-decoration:none;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;font-family:var(--sans);font-weight:500}
        .desconto-caucao{font-size:0.78rem;color:#27ae60;margin-top:0.25rem}
        .aviso-pendente{background:#fff8e1;padding:0.85rem 1rem;border-left:3px solid #f39c12;font-size:0.82rem;color:#946200;margin-bottom:1rem;line-height:1.5}
        @media(max-width:768px){
          .nav{padding:1rem 1.25rem}
          .page{grid-template-columns:1fr;padding:5rem 1.25rem 6rem;gap:1rem}
          .resumo{position:static}
          .dates{grid-template-columns:1fr}
          .sec{padding:1.5rem 1.25rem}
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <a href="/catalogo" className="nav-back">← Catálogo</a>
      </nav>

      <div className="page">
        <div>
          <div className="sec">
            <p className="sec-t">{i.peca}</p>
            {peca && (
              <div className="peca-row">
                {peca.fotos?.[0] && <img src={peca.fotos[0]} alt={peca.nome} className="peca-img" />}
                <div>
                  {peca.categoria && <p className="peca-cat">{peca.categoria}</p>}
                  <p className="peca-nome">{peca.nome}</p>
                  {tamanhoNome && <p className="peca-tam">{i.tamanho}: {tamanhoNome}</p>}
                  <p style={{fontSize:'1rem',color:'var(--black)',fontWeight:500,marginTop:'0.3rem'}}>{peca.preco_aluguer_dia}€ {i.dias(1)}</p>
                </div>
              </div>
            )}
          </div>

          {user && (
            <div className="sec" style={{padding:'1rem 1.5rem'}}>
              <div className="nivel-box">
                <span style={{fontSize:'1.2rem'}}>{nv.icon}</span>
                <div>
                  <div style={{fontWeight:500,fontSize:'0.88rem'}}>{i.nivel} {nv.nome}</div>
                  <div style={{fontSize:'0.75rem',color:nv.cor}}>
                    {nv.caucao === 0 ? "Sem caução" : `Caução com ${100 - nv.caucao}% de desconto`}
                  </div>
                </div>
              </div>
              {temGratis ? (
                <div className="gratis-box">{i.gratis}</div>
              ) : pontos > 0 ? (
                <div className="pontos-box">{i.pontos(pontos)}</div>
              ) : null}
            </div>
          )}

          <div className="sec">
            <p className="sec-t">{i.datas}</p>
            <div className="dates">
              <div>
                <label className="lbl">{i.dataInicio}</label>
                <input className="inp" type="date" min={hoje} value={dataInicio} onChange={e => { setDataInicio(e.target.value); if (dataFim && e.target.value > dataFim) setDataFim(""); setErro(""); }} />
              </div>
              <div>
                <label className="lbl">{i.dataFim}</label>
                <input className="inp" type="date" min={dataInicio || hoje} value={dataFim} onChange={e => { setDataFim(e.target.value); setErro(""); }} />
              </div>
            </div>
            {numDias > 0 && (
              <p style={{fontSize:'0.9rem',color:'#5a5855',marginTop:'0.75rem'}}>
                {i.dias(numDias)} selecionados — {temGratis ? <span style={{color:'#c4748a',fontWeight:500}}>Grátis</span> : `${(peca?.preco_aluguer_dia * numDias).toFixed(2)}€`}
              </p>
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
            <p className="sec-t">{i.pagamento}</p>
            <div className="opts">
              {i.pagamentoOpcoes.map(op => (
                <div key={op.id} className={`opt${pagamento === op.id ? " on" : ""}`} onClick={() => setPagamento(op.id)}>
                  <div className="opt-radio"></div>
                  <div>
                    <div className="opt-label">{op.label}<span className={op.automatico ? "badge-auto" : "badge-manual"}>{op.automatico ? "Imediato" : "Confirmação manual"}</span></div>
                    <div className="opt-desc">{op.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sec">
            <p className="sec-t">{i.deposito}</p>
            {nv.caucao < 100 && (
              <div style={{padding:'0.75rem 1rem',background:'#e8f5e9',borderLeft:'3px solid #27ae60',marginBottom:'1rem',fontSize:'0.85rem',color:'#27ae60'}}>
                {nv.icon} Nível {nv.nome} — pagas apenas {nv.caucao}% da caução ({valorDeposito}€ em vez de {valorDepositoBase}€)
              </div>
            )}
            {nv.caucao === 0 ? (
              <div style={{padding:'0.75rem 1rem',background:'#f8f4ff',borderLeft:'3px solid #6c5ce7',fontSize:'0.85rem',color:'#6c5ce7'}}>
                💎 Platina — sem caução!
              </div>
            ) : (
              <div className="opts">
                {i.depositoOpcoes.map(op => (
                  <div key={op.id} className={`opt${deposito === op.id ? " on" : ""}`} onClick={() => setDeposito(op.id)}>
                    <div className="opt-radio"></div>
                    <div>
                      <div className="opt-label">{op.label}<span className={op.automatico ? "badge-auto" : "badge-manual"}>{op.automatico ? "Imediato" : "Confirmação manual"}</span></div>
                      <div className="opt-desc">{op.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="resumo">
          <p className="sec-t">{i.resumo}</p>
          {!user ? (
            <div className="login-box">
              <p>{i.login}</p>
              <a href={`/entrar?redirect=/checkout?peca=${pecaId}&tamanho=${tamanhoParam}`}>{i.fazerLogin}</a>
            </div>
          ) : (
            <>
              {!tudoAutomatico && (
                <div className="aviso-pendente">
                  ⏳ O teu pedido fica <strong>pendente</strong> até confirmarmos o pagamento {pagamento === "dinheiro" || deposito === "dinheiro" ? "presencial" : "da transferência"}.
                </div>
              )}
              <div className="r-linha">
                <span>{i.aluguer} {numDias > 0 ? `(${i.dias(numDias)})` : ""}</span>
                <span>{temGratis ? <span style={{color:'#c4748a',fontWeight:500}}>Grátis</span> : `${valorAluguer.toFixed(2)}€`}</span>
              </div>
              <div className="r-linha">
                <span>{i.higienizacao}</span>
                <span>{HIGIENIZACAO}€</span>
              </div>
              <div className="r-linha">
                <div>
                  <div>{i.depositoVal}</div>
                  {descontoDeposito > 0 && <div className="desconto-caucao">Poupas {descontoDeposito}€ ({nv.icon} {nv.nome})</div>}
                </div>
                <span>{valorDeposito}€</span>
              </div>
              <div className="r-total">
                <span>{i.total}</span>
                <span>{totalAgora.toFixed(2)}€</span>
              </div>
              <p className="r-nota">{i.totalSemDeposito}</p>
              {erro && <div className="erro">{erro}</div>}
              <button className="btn" onClick={confirmar} disabled={loading || !dataInicio || !dataFim}>
                {loading ? "..." : (tudoAutomatico ? i.confirmar : i.confirmarPendente)}
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
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#888'}}>A carregar...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}