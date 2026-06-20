@'
"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const TXT = {
  pt: {
    semNotificacoes: "Sem notificacoes por agora.",
    ultimoDiaTitulo: "Ultimo dia de uso",
    ultimoDiaMsg: (nome) => `Amanha e o ultimo dia de uso de "${nome}". Prepara-te para enviar a devolucao - tens 24h apos o fim do aluguer.`,
    atrasoTitulo: "Devolucao em atraso",
    atrasoMsg: (nome, dias) => `"${nome}" devia ja ter sido devolvida. Estas ${dias} dia${dias !== 1 ? "s" : ""} em atraso - podem aplicar-se custos extra.`,
    marcarLidas: "Marcar todas como lidas",
  },
  fr: {
    semNotificacoes: "Aucune notification pour le moment.",
    ultimoDiaTitulo: "Dernier jour d'utilisation",
    ultimoDiaMsg: (nome) => `Demain est le dernier jour d'utilisation de "${nome}". Preparez le retour - vous avez 24h apres la fin de la location.`,
    atrasoTitulo: "Retour en retard",
    atrasoMsg: (nome, dias) => `"${nome}" devrait deja etre retournee. Vous avez ${dias} jour${dias !== 1 ? "s" : ""} de retard - des frais supplementaires peuvent s'appliquer.`,
    marcarLidas: "Tout marquer comme lu",
  },
  lt: {
    semNotificacoes: "Kol kas nera pranesimu.",
    ultimoDiaTitulo: "Paskutine naudojimo diena",
    ultimoDiaMsg: (nome) => `Rytoj yra paskutine "${nome}" naudojimo diena. Pasiruoskite grazinimui - turite 24h po nuomos pabaigos.`,
    atrasoTitulo: "Veluojantis grazinimas",
    atrasoMsg: (nome, dias) => `"${nome}" turejo buti grazinta. Veluojate ${dias} diena(-as) - gali buti taikomi papildomi mokesciai.`,
    marcarLidas: "Pazymeti visus kaip skaitytus",
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
    hoje.setHours(0, 0, 0, 0);

    for (const a of alugueres) {
      const nome = a.stock_tamanhos?.pecas?.nome || "a peca";
      const dataFim = new Date(a.data_fim);
      dataFim.setHours(0, 0, 0, 0);
      const diffDias = Math.round((dataFim - hoje) / 86400000);

      let tipo = null, titulo = null, mensagem = null;
      if (diffDias === 1) {
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
        aria-label="Notificacoes"
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
'@ | Set-Content -Path "components\NotificationBell.js" -Encoding UTF8
