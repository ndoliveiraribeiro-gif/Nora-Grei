"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const TXT = {
  pt: {
    semNotificacoes: "Sem notificações por agora.",
    seiHorasTitulo: "Devolução em 6 horas",
    seisHorasMsg: (nome, horas) => `O teu aluguer de "${nome}" termina em ${horas}h. Prepara a devolução — envia a peça hoje para evitar dias extra.`,
    ultimoDiaTitulo: "Último dia de uso",
    ultimoDiaMsg: (nome) => `Amanhã é o último dia de uso de "${nome}". Prepara-te para enviar a devolução — tens 24h após o fim do aluguer.`,
    atrasoTitulo: "Devolução em atraso",
    atrasoMsg: (nome, dias) => `"${nome}" devia já ter sido devolvida. Estás ${dias} dia${dias !== 1 ? "s" : ""} em atraso — podem aplicar-se custos extra.`,
    marcarLidas: "Marcar todas como lidas",
  },
  fr: {
    semNotificacoes: "Aucune notification pour le moment.",
    seiHorasTitulo: "Retour dans 6 heures",
    seisHorasMsg: (nome, horas) => `Votre location de "${nome}" se termine dans ${horas}h. Préparez le retour — envoyez la pièce aujourd'hui pour éviter des jours supplémentaires.`,
    ultimoDiaTitulo: "Dernier jour d'utilisation",
    ultimoDiaMsg: (nome) => `Demain est le dernier jour d'utilisation de "${nome}". Préparez le retour — vous avez 24h après la fin de la location.`,
    atrasoTitulo: "Retour en retard",
    atrasoMsg: (nome, dias) => `"${nome}" devrait déjà être retournée. Vous avez ${dias} jour${dias !== 1 ? "s" : ""} de retard — des frais supplémentaires peuvent s'appliquer.`,
    marcarLidas: "Tout marquer comme lu",
  },
  lt: {
    semNotificacoes: "Kol kas nėra pranešimų.",
    seiHorasTitulo: "Grąžinimas per 6 valandas",
    seisHorasMsg: (nome, horas) => `Jūsų "${nome}" nuoma baigiasi per ${horas}h. Pasiruoškite grąžinimui — išsiųskite šiandien, kad išvengtumėte papildomų dienų.`,
    ultimoDiaTitulo: "Paskutinė naudojimo diena",
    ultimoDiaMsg: (nome) => `Rytoj yra paskutinė "${nome}" naudojimo diena. Pasiruoškite grąžinimui — turite 24h po nuomos pabaigos.`,
    atrasoTitulo: "Vėluojantis grąžinimas",
    atrasoMsg: (nome, dias) => `"${nome}" turėjo būti grąžinta. Vėluojate ${dias} dieną(-as) — gali būti taikomi papildomi mokesčiai.`,
    marcarLidas: "Pažymėti visus kaip skaitytus",
  },
};

export default function NotificationBell({ lang = "pt" }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [userId, setUserId] = useState(null);
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
    await gerarNotificacoesAtuais(user.id);
    await carregarNotificacoes(user.id);
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
          cliente_id, aluguer_id: a.id, tipo, titulo, mensagem, lida: false,
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

  const marcarTodasLidas = async () => {
    if (!userId) return;
    await supabase.from("notificacoes_cliente").update({ lida: true }).eq("cliente_id", userId).eq("lida", false);
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

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
        {naoLidas > 0 && (
          <span style={{ position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#c0392b", color: "#fff", fontSize: "0.6rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost',sans-serif" }}>
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div style={{ position: "absolute", top: "calc(100% + 0.5rem)", right: 0, width: 320, maxHeight: 420, overflowY: "auto", background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 300, fontFamily: "'Jost',sans-serif" }}>
          {notificacoes.length === 0 ? (
            <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#5a5855", fontSize: "0.85rem" }}>{i.semNotificacoes}</div>
          ) : (
            <>
              {notificacoes.map(n => (
                <div key={n.id} style={{ padding: "0.9rem 1.1rem", borderBottom: "1px solid #f0eeeb", background: n.lida ? "#fff" : "#fff8e1" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#080808", marginBottom: "0.25rem" }}>
                    {n.tipo === "atraso" ? "🚨 " : "⏰ "}{n.titulo}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#3f3e3c", lineHeight: 1.5 }}>{n.mensagem}</div>
                  <div style={{ fontSize: "0.62rem", color: "#aaa89f", marginTop: "0.4rem" }}>
                    {new Date(n.created_at).toLocaleDateString(lang === "pt" ? "pt-PT" : lang === "fr" ? "fr-FR" : "lt-LT")}
                  </div>
                </div>
              ))}
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