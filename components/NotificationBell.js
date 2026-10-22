"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const TXT = {
  pt: {
    semNotificacoes: "Sem notificações por agora.",
    pagamentoTitulo: "Pagamento processado",
    pagamentoMsg: (valor, ref) => `Foi cobrado €${valor} ao teu cartão${ref ? ` — ref. ${ref}` : ""}.`,
    transferenciaTitulo: "Transferência enviada",
    transferenciaMsg: (valor) => `Foi enviado €${valor} para o teu IBAN.`,
    seiHorasTitulo: "Devolução em 6 horas",
    seisHorasMsg: (nome, horas) => `O teu aluguer de "${nome}" termina em ${horas}h. Prepara a devolução — envia a peça hoje para evitar dias extra.`,
    ultimoDiaTitulo: "Último dia de uso",
    ultimoDiaMsg: (nome) => `Amanhã é o último dia de uso de "${nome}". Prepara-te para enviar a devolução — tens 24h após o fim do aluguer.`,
    atrasoTitulo: "Devolução em atraso",
    atrasoMsg: (nome, dias) => `"${nome}" devia já ter sido devolvida. Estás ${dias} dia${dias !== 1 ? "s" : ""} em atraso — podem aplicar-se custos extra.`,
    reservaTitulo: "Reserva disponível",
    reservaMsg: (nome) => `A tua reserva de "${nome}" está disponível. Confirma antes que expire!`,
    campanhaTitulo: "Nova campanha",
    campanhaMsg: (titulo) => `${titulo}`,
    novoAluguerTitulo: "Novo aluguer",
    novoAluguerMsg: (nome, cliente) => `"${nome}" pedido por ${cliente}. Confirma ou recusa.`,
    novaVendaTitulo: "Nova venda",
    novaVendaMsg: (nome, cliente) => `"${nome}" comprada por ${cliente}. Confirma o envio.`,
    devolucaoTitulo: "Devolução a verificar",
    devolucaoMsg: (nome) => `"${nome}" foi devolvida. Confirma o estado da peça.`,
    liquidacaoTitulo: "Liquidação disponível",
    liquidacaoMsg: (valor) => `Tens €${Number(valor).toFixed(2)} prontos a transferir.`,
    penalizacaoTitulo: "Penalização atribuída",
    penalizacaoMsg: (motivo, valor) => `${motivo || "Incidente registado"}${valor ? ` — €${Number(valor).toFixed(2)}` : ""}.`,
    marcarLidas: "Marcar todas como lidas",
  },
  fr: {
    semNotificacoes: "Aucune notification pour le moment.",
    pagamentoTitulo: "Paiement traité",
    pagamentoMsg: (valor, ref) => `€${valor} ont été débités de votre carte${ref ? ` — réf. ${ref}` : ""}.`,
    transferenciaTitulo: "Virement envoyé",
    transferenciaMsg: (valor) => `€${valor} ont été envoyés sur votre IBAN.`,
    seiHorasTitulo: "Retour dans 6 heures",
    seisHorasMsg: (nome, horas) => `Votre location de "${nome}" se termine dans ${horas}h. Préparez le retour — envoyez la pièce aujourd'hui pour éviter des jours supplémentaires.`,
    ultimoDiaTitulo: "Dernier jour d'utilisation",
    ultimoDiaMsg: (nome) => `Demain est le dernier jour d'utilisation de "${nome}". Préparez le retour — vous avez 24h après la fin de la location.`,
    atrasoTitulo: "Retour en retard",
    atrasoMsg: (nome, dias) => `"${nome}" devrait déjà être retournée. Vous avez ${dias} jour${dias !== 1 ? "s" : ""} de retard — des frais supplémentaires peuvent s'appliquer.`,
    reservaTitulo: "Réservation disponible",
    reservaMsg: (nome) => `Votre réservation de "${nome}" est disponible. Confirmez avant qu'elle n'expire !`,
    campanhaTitulo: "Nouvelle campagne",
    campanhaMsg: (titulo) => `${titulo}`,
    novoAluguerTitulo: "Nouvelle location",
    novoAluguerMsg: (nome, cliente) => `"${nome}" demandée par ${cliente}. Confirmez ou refusez.`,
    novaVendaTitulo: "Nouvelle vente",
    novaVendaMsg: (nome, cliente) => `"${nome}" achetée par ${cliente}. Confirmez l'expédition.`,
    devolucaoTitulo: "Retour à vérifier",
    devolucaoMsg: (nome) => `"${nome}" a été retournée. Vérifiez l'état de la pièce.`,
    liquidacaoTitulo: "Liquidation disponible",
    liquidacaoMsg: (valor) => `Vous avez €${Number(valor).toFixed(2)} prêts à transférer.`,
    penalizacaoTitulo: "Pénalité attribuée",
    penalizacaoMsg: (motivo, valor) => `${motivo || "Incident enregistré"}${valor ? ` — €${Number(valor).toFixed(2)}` : ""}.`,
    marcarLidas: "Tout marquer comme lu",
  },
  lt: {
    semNotificacoes: "Kol kas nėra pranešimų.",
    pagamentoTitulo: "Mokėjimas apdorotas",
    pagamentoMsg: (valor, ref) => `Iš jūsų kortelės nurašyta €${valor}${ref ? ` — ref. ${ref}` : ""}.`,
    transferenciaTitulo: "Pavedimas išsiųstas",
    transferenciaMsg: (valor) => `€${valor} išsiųsta į jūsų IBAN.`,
    seiHorasTitulo: "Grąžinimas per 6 valandas",
    seisHorasMsg: (nome, horas) => `Jūsų "${nome}" nuoma baigiasi per ${horas}h. Pasiruoškite grąžinimui — išsiųskite šiandien, kad išvengtumėte papildomų dienų.`,
    ultimoDiaTitulo: "Paskutinė naudojimo diena",
    ultimoDiaMsg: (nome) => `Rytoj yra paskutinė "${nome}" naudojimo diena. Pasiruoškite grąžinimui — turite 24h po nuomos pabaigos.`,
    atrasoTitulo: "Vėluojantis grąžinimas",
    atrasoMsg: (nome, dias) => `"${nome}" turėjo būti grąžinta. Vėluojate ${dias} dieną(-as) — gali būti taikomi papildomi mokesčiai.`,
    reservaTitulo: "Rezervacija prieinama",
    reservaMsg: (nome) => `Jūsų "${nome}" rezervacija prieinama. Patvirtinkite prieš galiojimo pabaigą!`,
    campanhaTitulo: "Nauja kampanija",
    campanhaMsg: (titulo) => `${titulo}`,
    novoAluguerTitulo: "Nauja nuoma",
    novoAluguerMsg: (nome, cliente) => `"${nome}" užsakė ${cliente}. Patvirtinkite arba atmeskite.`,
    novaVendaTitulo: "Naujas pardavimas",
    novaVendaMsg: (nome, cliente) => `"${nome}" nupirko ${cliente}. Patvirtinkite siuntimą.`,
    devolucaoTitulo: "Grąžinimas tikrinimui",
    devolucaoMsg: (nome) => `"${nome}" buvo grąžinta. Patikrinkite daikto būklę.`,
    liquidacaoTitulo: "Išmoka prieinama",
    liquidacaoMsg: (valor) => `Turite €${Number(valor).toFixed(2)} paruoštų pervedimui.`,
    penalizacaoTitulo: "Skirta bauda",
    penalizacaoMsg: (motivo, valor) => `${motivo || "Įvykis užregistruotas"}${valor ? ` — €${Number(valor).toFixed(2)}` : ""}.`,
    marcarLidas: "Pažymėti visus kaip skaitytus",
  },
};

export default function NotificationBell({ lang = "pt" }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState([]);
  const [recibosRecentes, setRecibosRecentes] = useState([]);
  const [reservasDisponiveis, setReservasDisponiveis] = useState([]);
  const [campanhasNovas, setCampanhasNovas] = useState([]);
  const [alertasLojista, setAlertasLojista] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [userId, setUserId] = useState(null);
  const [modoLojista, setModoLojista] = useState(false);
  const ref = useRef(null);
  const i = TXT[lang] || TXT.pt;

  useEffect(() => {
    init();
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false); };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data: cli } = await supabase.from("clientes").select("modo_lojista").eq("id", user.id).single();
    const lojista = cli?.modo_lojista || false;
    setModoLojista(lojista);
    await gerarNotificacoesAtuais(user.id);
    await carregarNotificacoes(user.id);
    await carregarMensagensNaoLidas(user.id, lojista);
    await carregarRecibosRecentes(user.id);
    await carregarReservasDisponiveis(user.id);
    await carregarCampanhasNovas();
    if (lojista) await carregarAlertasLojista(user.id);
  };

  const gerarNotificacoesAtuais = async (cliente_id) => {
    const { data: alugueres } = await supabase
      .from("alugueres")
      .select("id, data_fim, estado, stock_tamanhos(pecas(nome))")
      .eq("cliente_id", cliente_id)
      .eq("estado", "ativo");

    if (!alugueres || alugueres.length === 0) return;

    const hoje = new Date();
    const hojeZero = new Date(hoje);
    hojeZero.setHours(0, 0, 0, 0);

    for (const a of alugueres) {
      const nome = a.stock_tamanhos?.pecas?.nome || "a peça";
      const dataFim = new Date(a.data_fim);
      dataFim.setHours(23, 59, 59, 0); // fim do dia
      const dataFimZero = new Date(a.data_fim);
      dataFimZero.setHours(0, 0, 0, 0);
      const diffDias = Math.round((dataFimZero - hojeZero) / 86400000);
      const horasRestantes = (dataFim - hoje) / 3600000;
      let tipo = null, titulo = null, mensagem = null;
      if (horasRestantes <= 6 && horasRestantes > 0) {
        tipo = "seis_horas";
        titulo = i.seiHorasTitulo;
        mensagem = i.seisHorasMsg(nome, Math.floor(horasRestantes));
      } else if (diffDias === 1) {
        tipo = "ultimo_dia";
        titulo = i.ultimoDiaTitulo;
        mensagem = i.ultimoDiaMsg(nome);
      } else if (diffDias < 0) {
        tipo = "atraso";
        titulo = i.atrasoTitulo;
        mensagem = i.atrasoMsg(nome, Math.abs(diffDias));
      }
      if (!tipo) continue;

      const { data: existente } = await supabase
        .from("notificacoes_cliente")
        .select("id")
        .eq("aluguer_id", a.id)
        .eq("tipo", tipo)
        .maybeSingle();

      if (!existente) {
        await supabase.from("notificacoes_cliente").insert({
          cliente_id, aluguer_id: a.id, tipo, titulo: tipo, mensagem: nome, lida: false,
        });
      }
    }
  };

  const carregarNotificacoes = async (cliente_id) => {
    const { data } = await supabase
      .from("notificacoes_cliente")
      .select("*")
      .eq("cliente_id", cliente_id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotificacoes(data);
  };

  const carregarRecibosRecentes = async (cliente_id) => {
    const sete = new Date();
    sete.setDate(sete.getDate() - 7);
    const { data } = await supabase
      .from("recibos")
      .select("id, valor_total, estado, created_at, referencia, aluguer_id")
      .eq("cliente_id", cliente_id)
      .eq("estado", "pago")
      .gte("created_at", sete.toISOString())
      .order("created_at", { ascending: false })
      .limit(5);
    setRecibosRecentes(data || []);
  };

  const carregarAlertasLojista = async (lojista_id) => {
    const alertas = [];

    // 1. Alugueres e vendas novos (pendente) — precisam confirmação
    const { data: pendentes } = await supabase
      .from("alugueres_lojista")
      .select("id, estado, tipo_transacao, created_at, pecas_lojista(nome), clientes(nome)")
      .eq("lojista_id", lojista_id)
      .eq("estado", "pendente")
      .order("created_at", { ascending: false })
      .limit(10);
    (pendentes || []).forEach(a => alertas.push({
      id: `aluguer-${a.id}`,
      tipo: a.tipo_transacao === "venda" ? "nova_venda" : "novo_aluguer",
      nome: a.pecas_lojista?.nome || "Peça", cliente: a.clientes?.nome || "Cliente",
      created_at: a.created_at, href: "/perfil?tab=loja&subtab=alugueres",
    }));

    // 2. Devoluções por verificar
    const { data: devolucoes } = await supabase
      .from("alugueres_lojista")
      .select("id, estado, created_at, pecas_lojista(nome)")
      .eq("lojista_id", lojista_id)
      .eq("estado", "em_devolucao")
      .order("created_at", { ascending: false })
      .limit(5);
    (devolucoes || []).forEach(a => alertas.push({
      id: `dev-${a.id}`, tipo: "devolucao",
      nome: a.pecas_lojista?.nome || "Peça",
      created_at: a.created_at, href: "/perfil?tab=loja&subtab=alugueres",
    }));

    // 3. Liquidações prontas (estado = "disponivel" ou equivalente)
    const { data: liquidacoes } = await supabase
      .from("liquidacoes")
      .select("id, valor, created_at, estado")
      .eq("lojista_id", lojista_id)
      .eq("estado", "disponivel")
      .order("created_at", { ascending: false })
      .limit(3);
    (liquidacoes || []).forEach(l => alertas.push({
      id: `liq-${l.id}`, tipo: "liquidacao",
      valor: l.valor,
      created_at: l.created_at, href: "/perfil?tab=loja&subtab=liquidacoes",
    }));

    // 4. Penalizações recentes (últimos 30 dias)
    const trintaDias = new Date();
    trintaDias.setDate(trintaDias.getDate() - 30);
    const { data: penalizacoes } = await supabase
      .from("penalizacoes_lojista")
      .select("id, motivo, valor, created_at")
      .eq("lojista_id", lojista_id)
      .gte("created_at", trintaDias.toISOString())
      .order("created_at", { ascending: false })
      .limit(3);
    (penalizacoes || []).forEach(p => alertas.push({
      id: `pen-${p.id}`, tipo: "penalizacao",
      motivo: p.motivo, valor: p.valor,
      created_at: p.created_at, href: "/perfil?tab=loja",
    }));

    setAlertasLojista(alertas);
  };

  const carregarReservasDisponiveis = async (cliente_id) => {
    const { data } = await supabase
      .from("reservas_espera")
      .select("id, estado, notificado_em, expira_confirmacao_em, peca:peca_id(nome)")
      .eq("cliente_id", cliente_id)
      .eq("estado", "notificado")
      .order("notificado_em", { ascending: false })
      .limit(5);
    setReservasDisponiveis(data || []);
  };

  const carregarCampanhasNovas = async () => {
    const trintaDias = new Date();
    trintaDias.setDate(trintaDias.getDate() - 30);
    const hoje = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("campanhas")
      .select("id, titulo, titulo_fr, titulo_lt, mensagem, mensagem_fr, mensagem_lt, created_at, validade")
      .eq("ativa", true)
      .or(`validade.is.null,validade.gte.${hoje}`)
      .gte("created_at", trintaDias.toISOString())
      .order("created_at", { ascending: false })
      .limit(3);
    setCampanhasNovas(data || []);
  };

  const carregarMensagensNaoLidas = async (cliente_id, lojista) => {
    const campo = lojista ? "lojista_id" : "cliente_id";
    const campoCont = lojista ? "nao_lidas_lojista" : "nao_lidas_cliente";
    const { data } = await supabase
      .from("conversas")
      .select(`id, assunto, ultima_mensagem_em, ${campoCont}, cliente:cliente_id(nome), lojista:lojista_id(nome)`)
      .eq(campo, cliente_id)
      .gt(campoCont, 0)
      .order("ultima_mensagem_em", { ascending: false })
      .limit(10);
    setMensagensNaoLidas(data || []);
  };

  const marcarTodasLidas = async () => {
    if (!userId) return;
    await supabase.from("notificacoes_cliente").update({ lida: true }).eq("cliente_id", userId).eq("lida", false);
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;
  const totalBadge = naoLidas + mensagensNaoLidas.length + recibosRecentes.length + reservasDisponiveis.length + campanhasNovas.length + alertasLojista.length;
  const campoCont = modoLojista ? "nao_lidas_lojista" : "nao_lidas_cliente";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setAberto(prev => !prev)}
        style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: "0.5rem", display: "flex", alignItems: "center" }}
        aria-label="Notificações"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#080808" }}>
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {totalBadge > 0 && (
          <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#c0392b", color: "#fff", fontSize: "0.6rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost',sans-serif" }}>
            {totalBadge > 9 ? "9+" : totalBadge}
          </span>
        )}
      </button>

      {aberto && (
        <div style={{ position: "fixed", top: "4rem", left: "50%", transform: "translateX(-50%)", width: "min(340px, calc(100vw - 2rem))", maxHeight: "70vh", overflowY: "auto", background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 3000, fontFamily: "'Jost',sans-serif", borderRadius: "8px" }}>
          {totalBadge === 0 && notificacoes.length === 0 ? (
            <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#5a5855", fontSize: "0.85rem" }}>{i.semNotificacoes}</div>
          ) : (
            <>
              {/* Mensagens não lidas */}
              {mensagensNaoLidas.map(conv => {
                const outro = modoLojista ? conv.cliente?.nome : conv.lojista?.nome;
                const total = conv[campoCont] || 0;
                return (
                  <a key={conv.id} href="/mensagens" onClick={() => setAberto(false)} style={{ display: "block", padding: "0.9rem 1.1rem", borderBottom: "1px solid #f0eeeb", background: "#f0f7ff", textDecoration: "none" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#080808", marginBottom: "0.2rem" }}>
                      ✉ {outro || "Mensagem"}
                      <span style={{ marginLeft: "0.5rem", background: "#c4748a", color: "#fff", fontSize: "0.6rem", padding: "0.1rem 0.4rem", borderRadius: "10px", fontWeight: 700 }}>{total}</span>
                    </div>
                    {conv.assunto && <div style={{ fontSize: "0.72rem", color: "#5a5855", lineHeight: 1.4 }}>{conv.assunto}</div>}
                    {conv.ultima_mensagem_em && <div style={{ fontSize: "0.62rem", color: "#aaa89f", marginTop: "0.3rem" }}>{new Date(conv.ultima_mensagem_em).toLocaleDateString(lang === "pt" ? "pt-PT" : lang === "fr" ? "fr-FR" : "lt-LT")}</div>}
                  </a>
                );
              })}

              {/* Recibos / pagamentos recentes */}
              {recibosRecentes.map(r => (
                <a key={r.id} href="/pedidos" onClick={() => setAberto(false)} style={{ display: "block", padding: "0.9rem 1.1rem", borderBottom: "1px solid #f0eeeb", background: "#f0fff4", textDecoration: "none" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#080808", marginBottom: "0.2rem" }}>
                    💳 {i.pagamentoTitulo}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#3f3e3c", lineHeight: 1.4 }}>
                    {i.pagamentoMsg(Number(r.valor_total).toFixed(2), r.referencia)}
                  </div>
                  <div style={{ fontSize: "0.62rem", color: "#aaa89f", marginTop: "0.3rem" }}>
                    {new Date(r.created_at).toLocaleDateString(lang === "pt" ? "pt-PT" : lang === "fr" ? "fr-FR" : "lt-LT")}
                  </div>
                </a>
              ))}

              {/* Reservas disponíveis */}
              {reservasDisponiveis.map(r => {
                const nomePeca = r.peca?.nome || "a peça";
                const expira = r.expira_confirmacao_em ? new Date(r.expira_confirmacao_em) : null;
                const horasRestantes = expira ? Math.max(0, Math.round((expira - new Date()) / 3600000)) : null;
                return (
                  <a key={r.id} href="/pedidos" onClick={() => setAberto(false)} style={{ display: "block", padding: "0.9rem 1.1rem", borderBottom: "1px solid #f0eeeb", background: "#fff8e1", textDecoration: "none" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#080808", marginBottom: "0.2rem" }}>
                      🏷 {i.reservaTitulo}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#3f3e3c", lineHeight: 1.4 }}>
                      {i.reservaMsg(nomePeca)}
                    </div>
                    {horasRestantes !== null && (
                      <div style={{ fontSize: "0.62rem", color: horasRestantes < 12 ? "#c0392b" : "#aaa89f", marginTop: "0.3rem", fontWeight: horasRestantes < 12 ? 600 : 400 }}>
                        {horasRestantes > 0 ? `Expira em ${horasRestantes}h` : "Expirado"}
                      </div>
                    )}
                  </a>
                );
              })}

              {/* Campanhas / novidades */}
              {campanhasNovas.map(c => {
                const titulo = lang === "fr" ? (c.titulo_fr || c.titulo) : lang === "lt" ? (c.titulo_lt || c.titulo) : c.titulo;
                const mensagem = lang === "fr" ? (c.mensagem_fr || c.mensagem) : lang === "lt" ? (c.mensagem_lt || c.mensagem) : c.mensagem;
                return (
                  <div key={c.id} style={{ padding: "0.9rem 1.1rem", borderBottom: "1px solid #f0eeeb", background: "#fdf6f9" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#080808", marginBottom: "0.2rem" }}>
                      ✦ {i.campanhaTitulo}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#3f3e3c", fontWeight: 500, marginBottom: "0.15rem" }}>
                      {titulo}
                    </div>
                    {mensagem && (
                      <div style={{ fontSize: "0.72rem", color: "#5a5855", lineHeight: 1.4 }}>
                        {mensagem.slice(0, 120)}{mensagem.length > 120 ? "…" : ""}
                      </div>
                    )}
                    <div style={{ fontSize: "0.62rem", color: "#aaa89f", marginTop: "0.3rem" }}>
                      {new Date(c.created_at).toLocaleDateString(lang === "pt" ? "pt-PT" : lang === "fr" ? "fr-FR" : "lt-LT")}
                    </div>
                  </div>
                );
              })}

              {/* Notificações de alugueres */}
              {notificacoes.map(n => (
                <div key={n.id} style={{ padding: "0.9rem 1.1rem", borderBottom: "1px solid #f0eeeb", background: n.lida ? "#fff" : "#fff8e1" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#080808", marginBottom: "0.25rem" }}>
                    {n.tipo === "atraso" ? "🚨 " : "⏰ "}
                    {n.tipo === "atraso" ? i.atrasoTitulo : n.tipo === "ultimo_dia" ? i.ultimoDiaTitulo : i.seiHorasTitulo}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#3f3e3c", lineHeight: 1.5 }}>
                    {n.tipo === "atraso" ? i.atrasoMsg(n.mensagem, Math.abs(Math.round((new Date(n.created_at) - new Date()) / 86400000)))
                      : n.tipo === "ultimo_dia" ? i.ultimoDiaMsg(n.mensagem)
                      : i.seisHorasMsg(n.mensagem, 6)}
                  </div>
                  <div style={{ fontSize: "0.62rem", color: "#aaa89f", marginTop: "0.4rem" }}>
                    {new Date(n.created_at).toLocaleDateString(lang === "pt" ? "pt-PT" : lang === "fr" ? "fr-FR" : "lt-LT")}
                  </div>
                </div>
              ))}

              {/* Alertas de lojista: operacionais + económicos */}
              {alertasLojista.map(a => {
                const locale = lang === "fr" ? "fr-FR" : lang === "lt" ? "lt-LT" : "pt-PT";
                const data = new Date(a.created_at).toLocaleDateString(locale);
                if (a.tipo === "novo_aluguer") return (
                  <a key={a.id} href={a.href} onClick={() => setAberto(false)} style={{ display: "block", padding: "0.9rem 1.1rem", borderBottom: "1px solid #f0eeeb", background: "#f0f7ff", textDecoration: "none" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#080808", marginBottom: "0.2rem" }}>📦 {i.novoAluguerTitulo}</div>
                    <div style={{ fontSize: "0.72rem", color: "#3f3e3c", lineHeight: 1.4 }}>{i.novoAluguerMsg(a.nome, a.cliente)}</div>
                    <div style={{ fontSize: "0.62rem", color: "#aaa89f", marginTop: "0.3rem" }}>{data}</div>
                  </a>
                );
                if (a.tipo === "nova_venda") return (
                  <a key={a.id} href={a.href} onClick={() => setAberto(false)} style={{ display: "block", padding: "0.9rem 1.1rem", borderBottom: "1px solid #f0eeeb", background: "#f5f0ff", textDecoration: "none" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#080808", marginBottom: "0.2rem" }}>🛍 {i.novaVendaTitulo}</div>
                    <div style={{ fontSize: "0.72rem", color: "#3f3e3c", lineHeight: 1.4 }}>{i.novaVendaMsg(a.nome, a.cliente)}</div>
                    <div style={{ fontSize: "0.62rem", color: "#aaa89f", marginTop: "0.3rem" }}>{data}</div>
                  </a>
                );
                if (a.tipo === "devolucao") return (
                  <a key={a.id} href={a.href} onClick={() => setAberto(false)} style={{ display: "block", padding: "0.9rem 1.1rem", borderBottom: "1px solid #f0eeeb", background: "#fff8e1", textDecoration: "none" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#080808", marginBottom: "0.2rem" }}>🔄 {i.devolucaoTitulo}</div>
                    <div style={{ fontSize: "0.72rem", color: "#3f3e3c", lineHeight: 1.4 }}>{i.devolucaoMsg(a.nome)}</div>
                    <div style={{ fontSize: "0.62rem", color: "#aaa89f", marginTop: "0.3rem" }}>{data}</div>
                  </a>
                );
                if (a.tipo === "liquidacao") return (
                  <a key={a.id} href={a.href} onClick={() => setAberto(false)} style={{ display: "block", padding: "0.9rem 1.1rem", borderBottom: "1px solid #f0eeeb", background: "#f0fff4", textDecoration: "none" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#080808", marginBottom: "0.2rem" }}>💶 {i.liquidacaoTitulo}</div>
                    <div style={{ fontSize: "0.72rem", color: "#3f3e3c", lineHeight: 1.4 }}>{i.liquidacaoMsg(a.valor)}</div>
                    <div style={{ fontSize: "0.62rem", color: "#aaa89f", marginTop: "0.3rem" }}>{data}</div>
                  </a>
                );
                if (a.tipo === "penalizacao") return (
                  <div key={a.id} style={{ padding: "0.9rem 1.1rem", borderBottom: "1px solid #f0eeeb", background: "#fff2f2" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#c0392b", marginBottom: "0.2rem" }}>⚠ {i.penalizacaoTitulo}</div>
                    <div style={{ fontSize: "0.72rem", color: "#3f3e3c", lineHeight: 1.4 }}>{i.penalizacaoMsg(a.motivo, a.valor)}</div>
                    <div style={{ fontSize: "0.62rem", color: "#aaa89f", marginTop: "0.3rem" }}>{data}</div>
                  </div>
                );
                return null;
              })}

              {notificacoes.length === 0 && mensagensNaoLidas.length === 0 && recibosRecentes.length === 0 && reservasDisponiveis.length === 0 && campanhasNovas.length === 0 && alertasLojista.length === 0 && (
                <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#5a5855", fontSize: "0.85rem" }}>{i.semNotificacoes}</div>
              )}

              {naoLidas > 0 && (
                <button onClick={marcarTodasLidas} style={{ width: "100%", padding: "0.75rem", background: "#f0eeeb", border: "none", color: "#3f3e3c", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>
                  {i.marcarLidas}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}