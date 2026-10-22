"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fmtData } from "@/lib/i18n";

const T = {
  pt: {
    titulo: "Mensagens",
    semConversas: "Não tens conversas ainda.",
    escrever: "Escrever uma mensagem...",
    enviar: "Enviar",
    hoje: "Hoje",
    ontem: "Ontem",
    voce: "Você",
    lojista: "Lojista",
    cliente: "Cliente",
    sobre: "Sobre a reserva",
    semMensagens: "Sem mensagens ainda. Inicia a conversa!",
    voltar: "← Voltar",
    carregando: "...",
    nova: "Nova mensagem",
    traduzir: "Traduzir",
    verOriginal: "Ver original",
    traduzindo: "...",
    tabMsgs: "Mensagens",
    tabAvals: "Avaliações",
    semAvals: "Ainda não tens avaliações.",
    mediaGlobal: "Classificação global",
    avals: "avaliações",
    tipoAluguer: "Aluguer",
    tipoVenda: "Venda",
    semComentario: "Sem comentário.",
  },
  fr: {
    titulo: "Messages",
    semConversas: "Vous n'avez pas encore de conversations.",
    escrever: "Écrire un message...",
    enviar: "Envoyer",
    hoje: "Aujourd'hui",
    ontem: "Hier",
    voce: "Vous",
    lojista: "Vendeur",
    cliente: "Client",
    sobre: "À propos de la réservation",
    semMensagens: "Pas encore de messages. Commencez la conversation !",
    voltar: "← Retour",
    carregando: "...",
    nova: "Nouveau message",
    traduzir: "Traduire",
    verOriginal: "Voir l'original",
    traduzindo: "...",
    tabMsgs: "Messages",
    tabAvals: "Évaluations",
    semAvals: "Pas encore d'évaluations.",
    mediaGlobal: "Note globale",
    avals: "évaluations",
    tipoAluguer: "Location",
    tipoVenda: "Vente",
    semComentario: "Sans commentaire.",
  },
  lt: {
    titulo: "Žinutės",
    semConversas: "Dar neturi pokalbių.",
    escrever: "Rašyti žinutę...",
    enviar: "Siųsti",
    hoje: "Šiandien",
    ontem: "Vakar",
    voce: "Jūs",
    lojista: "Pardavėjas",
    cliente: "Klientas",
    sobre: "Apie rezervaciją",
    semMensagens: "Dar nėra žinučių. Pradėkite pokalbį!",
    voltar: "← Atgal",
    carregando: "...",
    nova: "Nauja žinutė",
    traduzir: "Versti",
    verOriginal: "Žiūrėti originalą",
    traduzindo: "...",
    tabMsgs: "Žinutės",
    tabAvals: "Vertinimai",
    semAvals: "Dar nėra vertinimų.",
    mediaGlobal: "Bendras įvertinimas",
    avals: "vertinimai",
    tipoAluguer: "Nuoma",
    tipoVenda: "Pardavimas",
    semComentario: "Be komentaro.",
  },
};

const LANG_LOCALE = { pt: "pt-PT", fr: "fr-FR", lt: "lt-LT" };

function formatHora(iso, lang = "pt") {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString(LANG_LOCALE[lang] || "pt-PT", { hour: "2-digit", minute: "2-digit" });
}

function formatData(iso, t, lang = "pt") {
  if (!iso) return "";
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  if (d.toDateString() === hoje.toDateString()) return t.hoje;
  if (d.toDateString() === ontem.toDateString()) return t.ontem;
  return fmtData(iso, lang, { day: "2-digit", month: "short" });
}

function MensagensInner() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState("pt");
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversas, setConversas] = useState([]);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [vistaChat, setVistaChat] = useState(false); // mobile: true = mostra chat
  const [traducoes, setTraducoes] = useState({}); // { msgId: { texto, loading } }
  const [tabPrincipal, setTabPrincipal] = useState("msgs"); // "msgs" | "avals"
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loadingAvals, setLoadingAvals] = useState(false);
  const chatRef = useRef(null);
  const subRef = useRef(null);

  const t = T[lang] || T.pt;

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    iniciar();
  }, []);

  const iniciar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/entrar"; return; }
    const { data: cli } = await supabase.from("clientes").select("id, nome, modo_lojista").eq("id", user.id).maybeSingle();
    if (!cli) { setLoading(false); return; }
    setCliente(cli);
    carregarAvaliacoes(cli);
    const lista = await carregarConversas(cli);

    // Abrir conversa via URL param (?conversa=ID ou ?lojista=ID)
    const paramConversa = searchParams.get("conversa");
    const paramLojista = searchParams.get("lojista");

    if (paramConversa) {
      const conv = lista?.find(c => c.id === paramConversa);
      if (conv) { await abrirConversa(conv, cli); setLoading(false); return; }
    }

    if (paramLojista && !cli.modo_lojista) {
      // Verificar se já existe conversa com este lojista
      let conv = lista?.find(c => c.lojista?.id === paramLojista);
      if (!conv) {
        // Criar nova conversa
        const { data: novaConv } = await supabase.from("conversas").insert({
          cliente_id: cli.id,
          lojista_id: paramLojista,
          assunto: null,
        }).select(`
          id, assunto, ultima_mensagem_em, nao_lidas_cliente, nao_lidas_lojista,
          cliente:cliente_id(id, nome),
          lojista:lojista_id(id, nome),
          aluguer:aluguer_lojista_id(id, referencia)
        `).maybeSingle();
        if (novaConv) {
          setConversas(prev => [novaConv, ...prev]);
          conv = novaConv;
        }
      }
      if (conv) { await abrirConversa(conv, cli); setLoading(false); return; }
    }

    setLoading(false);
  };

  const carregarConversas = async (cli) => {
    const campo = cli.modo_lojista ? "lojista_id" : "cliente_id";
    const { data } = await supabase
      .from("conversas")
      .select(`
        id, assunto, ultima_mensagem_em, nao_lidas_cliente, nao_lidas_lojista,
        cliente:cliente_id(id, nome),
        lojista:lojista_id(id, nome),
        aluguer:aluguer_lojista_id(id, referencia)
      `)
      .eq(campo, cli.id)
      .order("ultima_mensagem_em", { ascending: false, nullsFirst: false });
    setConversas(data || []);
    return data || [];
  };

  const carregarAvaliacoes = async (cli) => {
    const cliAtivo = cli || cliente;
    if (!cliAtivo?.modo_lojista) return;
    setLoadingAvals(true);
    const { data } = await supabase
      .from("avaliacoes_lojista")
      .select(`
        id, nota_cliente_lojista, nota_plataforma, comentario_cliente, created_at, tipo_transacao,
        cliente:cliente_id(nome, foto_perfil),
        peca:peca_id(nome, fotos)
      `)
      .eq("lojista_id", cliAtivo.id)
      .order("created_at", { ascending: false });
    setAvaliacoes(data || []);
    setLoadingAvals(false);
  };

  const abrirConversa = async (conv, cliOverride) => {
    const cliAtivo = cliOverride || cliente;
    setConversaAtiva(conv);
    setVistaChat(true);
    setMensagens([]);

    // Cancelar sub anterior
    if (subRef.current) {
      supabase.removeChannel(subRef.current);
      subRef.current = null;
    }

    // Marcar lidas
    if (cliAtivo) {
      const campo = cliAtivo.modo_lojista ? "nao_lidas_lojista" : "nao_lidas_cliente";
      await supabase.from("conversas").update({ [campo]: 0 }).eq("id", conv.id);
      setConversas(prev => prev.map(c => c.id === conv.id ? { ...c, [campo]: 0 } : c));
    }

    // Carregar mensagens
    const { data } = await supabase
      .from("mensagens_conversa")
      .select("id, conteudo, remetente_id, lida, created_at")
      .eq("conversa_id", conv.id)
      .order("created_at", { ascending: true });
    setMensagens(data || []);

    // Marcar como lidas as mensagens recebidas
    if (cliAtivo && data) {
      const idsNaoLidas = data.filter(m => m.remetente_id !== cliAtivo.id && !m.lida).map(m => m.id);
      if (idsNaoLidas.length > 0) {
        await supabase.from("mensagens_conversa").update({ lida: true }).in("id", idsNaoLidas);
      }
    }

    // Realtime
    const ch = supabase
      .channel(`chat-${conv.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "mensagens_conversa",
        filter: `conversa_id=eq.${conv.id}`,
      }, (payload) => {
        setMensagens(prev => [...prev, payload.new]);
        // Atualizar lista de conversas
        setConversas(prev => prev.map(c => c.id === conv.id
          ? { ...c, ultima_mensagem_em: payload.new.created_at }
          : c
        ));
      })
      .subscribe();
    subRef.current = ch;
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensagens]);

  const enviarMensagem = async () => {
    if (!texto.trim() || !conversaAtiva || !cliente || enviando) return;
    setEnviando(true);
    const conteudo = texto.trim();
    setTexto("");
    const { error } = await supabase.from("mensagens_conversa").insert({
      conversa_id: conversaAtiva.id,
      remetente_id: cliente.id,
      conteudo,
    });
    if (error) {
      setTexto(conteudo); // restaurar se falhou
    } else {
      // Atualizar ultima_mensagem_em e incrementar nao_lidas do destinatário
      const campoNaoLidas = cliente.modo_lojista ? "nao_lidas_cliente" : "nao_lidas_lojista";
      const convAtual = conversas.find(c => c.id === conversaAtiva.id);
      const naoLidasAtual = convAtual?.[campoNaoLidas] || 0;
      await supabase.from("conversas").update({
        ultima_mensagem_em: new Date().toISOString(),
        [campoNaoLidas]: naoLidasAtual + 1,
      }).eq("id", conversaAtiva.id);
      setConversas(prev => prev.map(c => c.id === conversaAtiva.id
        ? { ...c, ultima_mensagem_em: new Date().toISOString(), [campoNaoLidas]: naoLidasAtual + 1 }
        : c
      ));
    }
    setEnviando(false);
  };

  const traduzirMensagem = async (id, conteudo) => {
    // Já tem tradução: toggle para original
    if (traducoes[id]?.texto) {
      setTraducoes(prev => ({ ...prev, [id]: { ...prev[id], mostrar: !prev[id].mostrar } }));
      return;
    }
    // Carregar tradução
    setTraducoes(prev => ({ ...prev, [id]: { loading: true, texto: null, mostrar: true } }));
    try {
      const res = await fetch("/api/traduzir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: conteudo, paraLingua: lang }),
      });
      const json = await res.json();
      setTraducoes(prev => ({ ...prev, [id]: { loading: false, texto: json.traducao || null, mostrar: true } }));
    } catch {
      setTraducoes(prev => ({ ...prev, [id]: { loading: false, texto: null, mostrar: false } }));
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  // Agrupar mensagens por dia
  const mensagensAgrupadas = [];
  let diaAtual = null;
  for (const m of mensagens) {
    const dia = new Date(m.created_at).toDateString();
    if (dia !== diaAtual) {
      mensagensAgrupadas.push({ tipo: "separador", data: m.created_at });
      diaAtual = dia;
    }
    mensagensAgrupadas.push({ tipo: "mensagem", ...m });
  }

  const naoLidasTotal = conversas.reduce((s, c) => {
    if (!cliente) return s;
    return s + (cliente.modo_lojista ? (c.nao_lidas_lojista || 0) : (c.nao_lidas_cliente || 0));
  }, 0);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost',sans-serif", fontSize: "0.8rem", letterSpacing: "0.2em", color: "#888", textTransform: "uppercase" }}>
      {T.pt.carregando}
    </div>
  );

  if (!cliente) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Jost',sans-serif", gap: "1rem" }}>
      <p style={{ fontSize: "0.85rem", color: "#888" }}>Sem sessão activa.</p>
      <a href="/entrar" style={{ fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#080808" }}>Entrar →</a>
    </div>
  );

  const outraPessoa = (conv) => {
    if (!conv) return "";
    return cliente.modo_lojista ? conv.cliente?.nome : conv.lojista?.nome;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g4:#5a5855;--rosa:#c4748a;--serif:'Cormorant Garamond',serif;--sans:'Jost',sans-serif}
        body{background:var(--white);color:var(--black);font-family:var(--sans);-webkit-font-smoothing:antialiased}

        .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2);padding:1rem 2rem;padding-top:max(1rem,env(safe-area-inset-top));display:flex;align-items:center;justify-content:space-between}
        .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:300;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
        .nav-voltar{font-size:0.78rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);text-decoration:none;background:none;border:none;cursor:pointer}

        .layout{display:flex;height:calc(100vh - 57px);margin-top:57px}

        /* Lista conversas */
        .lista-col{width:340px;min-width:340px;border-right:1px solid var(--g2);display:flex;flex-direction:column;background:var(--white)}
        .lista-header{padding:1.25rem 1.5rem;border-bottom:1px solid var(--g1);display:flex;align-items:center;justify-content:space-between}
        .lista-titulo{font-family:var(--sans);font-size:1.2rem;font-weight:600}
        .badge-total{background:var(--rosa);color:#fff;font-size:0.72rem;letter-spacing:0.1em;padding:0.15rem 0.5rem;border-radius:10px}
        .lista-scroll{overflow-y:auto;flex:1}
        .conv-item{padding:1rem 1.5rem;border-bottom:1px solid var(--g1);cursor:pointer;transition:background 0.15s;display:flex;gap:0.75rem;align-items:flex-start}
        .conv-item:hover{background:var(--g1)}
        .conv-item.ativa{background:var(--g1)}
        .conv-avatar{width:40px;height:40px;border-radius:50%;background:var(--g2);display:flex;align-items:center;justify-content:center;font-family:var(--sans);font-size:0.9rem;font-weight:500;color:var(--g4);flex-shrink:0}
        .conv-body{flex:1;min-width:0}
        .conv-nome{font-size:0.82rem;font-weight:500;margin-bottom:0.15rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .conv-assunto{font-size:0.82rem;color:var(--g4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .conv-meta{display:flex;flex-direction:column;align-items:flex-end;gap:0.25rem;flex-shrink:0}
        .conv-hora{font-size:0.75rem;color:var(--g4);letter-spacing:0.05em}
        .conv-badge{background:var(--rosa);color:#fff;font-size:0.72rem;padding:0.1rem 0.4rem;border-radius:10px;min-width:18px;text-align:center}
        .sem-conv{padding:3rem 1.5rem;text-align:center;font-size:0.78rem;color:var(--g4);line-height:1.6}

        /* Tabs */
        .tabs-row{display:flex;border-bottom:1px solid var(--g1)}
        .tab-btn{flex:1;padding:0.85rem 0.5rem;background:none;border:none;cursor:pointer;font-family:var(--sans);font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--g4);display:flex;align-items:center;justify-content:center;gap:0.4rem;border-bottom:2px solid transparent;margin-bottom:-1px;transition:color 0.15s,border-color 0.15s}
        .tab-btn.ativa{color:var(--black);border-bottom-color:var(--black)}
        .tab-badge{background:var(--rosa);color:#fff;font-size:0.62rem;padding:0.1rem 0.35rem;border-radius:8px;min-width:16px;text-align:center}

        /* Painel avaliações (lista esquerda) */
        .aval-mini{padding:1rem 1.5rem;border-bottom:1px solid var(--g1)}
        .aval-mini-stars{font-size:0.85rem;letter-spacing:0.05em;margin-bottom:0.2rem}
        .aval-mini-nome{font-size:0.78rem;font-weight:500}
        .aval-mini-peca{font-size:0.72rem;color:var(--g4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .aval-mini-data{font-size:0.68rem;color:var(--g4);margin-top:0.15rem}

        /* Painel avaliações (direita) */
        .avals-panel{flex:1;overflow-y:auto;padding:2rem 2.5rem}
        .avals-sumario{display:flex;align-items:center;gap:2rem;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid var(--g1)}
        .avals-nota-grande{font-family:var(--serif);font-size:4rem;font-weight:300;line-height:1}
        .avals-stars-grande{font-size:1.2rem;letter-spacing:0.1em;margin-bottom:0.25rem}
        .avals-count{font-size:0.72rem;color:var(--g4);letter-spacing:0.08em}
        .avals-barras{flex:1}
        .barra-row{display:flex;align-items:center;gap:0.6rem;margin-bottom:0.4rem}
        .barra-label{font-size:0.7rem;color:var(--g4);width:18px;text-align:right;flex-shrink:0}
        .barra-track{flex:1;height:6px;background:var(--g1);border-radius:3px;overflow:hidden}
        .barra-fill{height:100%;background:var(--rosa);border-radius:3px;transition:width 0.4s ease}
        .barra-pct{font-size:0.65rem;color:var(--g4);width:28px;flex-shrink:0}
        .aval-card{padding:1.25rem 0;border-bottom:1px solid var(--g1)}
        .aval-card:last-child{border-bottom:none}
        .aval-card-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:0.6rem}
        .aval-card-left{display:flex;gap:0.75rem;align-items:flex-start}
        .aval-avatar{width:36px;height:36px;border-radius:50%;background:var(--g2);display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:500;color:var(--g4);flex-shrink:0}
        .aval-nome{font-size:0.82rem;font-weight:500}
        .aval-stars{font-size:0.82rem;margin-top:0.1rem}
        .aval-tipo{font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;padding:0.1rem 0.4rem;border-radius:2px}
        .aval-tipo.aluguer{background:#e8f5e8;color:#2d6a2d}
        .aval-tipo.venda{background:#e8f0fb;color:#1a45a0}
        .aval-peca{font-size:0.75rem;color:var(--g4);margin-bottom:0.5rem}
        .aval-comentario{font-size:0.8rem;line-height:1.6;color:var(--black);font-style:italic}
        .aval-data{font-size:0.68rem;color:var(--g4);margin-top:0.4rem;letter-spacing:0.05em}
        .sem-avals{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:0.75rem;color:var(--g4)}
        .sem-avals-txt{font-size:0.78rem;letter-spacing:0.08em}

        /* Área chat */
        .chat-col{flex:1;display:flex;flex-direction:column;min-width:0}
        .chat-header{padding:1rem 1.5rem;border-bottom:1px solid var(--g2);display:flex;align-items:center;gap:1rem}
        .chat-nome{font-family:var(--sans);font-size:1.1rem;font-weight:500}
        .chat-sub{font-size:0.65rem;color:var(--g4);letter-spacing:0.08em;margin-top:0.1rem}
        .chat-msgs{flex:1;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:0.75rem}
        .chat-vazio{display:flex;align-items:center;justify-content:center;height:100%;font-size:0.78rem;color:var(--g4)}

        .separador-dia{text-align:center;font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--g4);padding:0.5rem 0}

        .msg-wrap{display:flex;flex-direction:column;max-width:70%}
        .msg-wrap.enviada{align-self:flex-end;align-items:flex-end}
        .msg-wrap.recebida{align-self:flex-start;align-items:flex-start}
        .msg-balao{padding:0.75rem 1rem;font-size:0.82rem;line-height:1.5;word-break:break-word;border-radius:2px}
        .msg-wrap.enviada .msg-balao{background:var(--black);color:var(--white)}
        .msg-wrap.recebida .msg-balao{background:var(--g1);color:var(--black)}
        .msg-hora{font-size:0.58rem;color:var(--g4);margin-top:0.25rem;letter-spacing:0.05em}
        .msg-traduzir{background:none;border:none;cursor:pointer;font-size:0.58rem;color:var(--g4);letter-spacing:0.08em;text-transform:uppercase;padding:0.1rem 0;margin-top:0.15rem;opacity:0.7;transition:opacity 0.15s}
        .msg-traduzir:hover{opacity:1}
        .msg-traducao{font-size:0.78rem;line-height:1.5;color:var(--g4);margin-top:0.4rem;padding:0.5rem 0.75rem;border-left:2px solid var(--rosa);font-style:italic;word-break:break-word;max-width:100%}

        .chat-input{border-top:1px solid var(--g2);padding:1rem 1.5rem;display:flex;gap:0.75rem;align-items:flex-end}
        .chat-textarea{flex:1;resize:none;border:1px solid var(--g2);background:var(--white);padding:0.75rem 1rem;font-family:var(--sans);font-size:0.82rem;color:var(--black);outline:none;min-height:44px;max-height:120px;line-height:1.5;transition:border-color 0.2s}
        .chat-textarea:focus{border-color:var(--black)}
        .chat-textarea::placeholder{color:var(--g4)}
        .btn-enviar{padding:0.75rem 1.25rem;background:var(--black);color:var(--white);border:none;cursor:pointer;font-family:var(--sans);font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;transition:opacity 0.2s;white-space:nowrap;height:44px}
        .btn-enviar:disabled{opacity:0.4;cursor:not-allowed}

        .sem-chat{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:1rem;color:var(--g4)}
        .sem-chat-icon{font-family:var(--sans);font-size:2rem;opacity:0.3}
        .sem-chat-txt{font-size:0.78rem;letter-spacing:0.08em}

        /* Mobile */
        @media(max-width:767px){
          .layout{height:calc(100vh - 57px - 65px)}
          .chat-input{padding-bottom:calc(1rem + env(safe-area-inset-bottom,0px))}
          .lista-col{width:100%;min-width:0;display:flex}
          .chat-col{display:none}
          .layout.chat-aberto .lista-col{display:none}
          .layout.chat-aberto .chat-col{display:flex;width:100%}
          .btn-voltar-mobile{display:flex}
        }
        @media(min-width:768px){
          .btn-voltar-mobile{display:none!important}
        }
      `}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <a href="/perfil" className="nav-voltar">{t.voltar}</a>
      </nav>

      <div className={`layout${vistaChat ? " chat-aberto" : ""}`}>

        {/* ── LISTA / TABS ── */}
        <div className="lista-col">
          {/* Tabs row */}
          <div className="tabs-row">
            <button
              className={`tab-btn${tabPrincipal === "msgs" ? " ativa" : ""}`}
              onClick={() => setTabPrincipal("msgs")}
            >
              {t.tabMsgs}
              {naoLidasTotal > 0 && <span className="tab-badge">{naoLidasTotal}</span>}
            </button>
            {cliente.modo_lojista && (
              <button
                className={`tab-btn${tabPrincipal === "avals" ? " ativa" : ""}`}
                onClick={() => { setTabPrincipal("avals"); setVistaChat(false); }}
              >
                {t.tabAvals}
                {avaliacoes.length > 0 && <span className="tab-badge">{avaliacoes.length}</span>}
              </button>
            )}
          </div>

          <div className="lista-scroll">
            {tabPrincipal === "msgs" ? (
              conversas.length === 0 ? (
                <div className="sem-conv">{t.semConversas}</div>
              ) : conversas.map(conv => {
                const nome = outraPessoa(conv);
                const inicial = nome?.[0]?.toUpperCase() || "?";
                const naoLidas = cliente.modo_lojista ? conv.nao_lidas_lojista : conv.nao_lidas_cliente;
                return (
                  <div
                    key={conv.id}
                    className={`conv-item${conversaAtiva?.id === conv.id ? " ativa" : ""}`}
                    onClick={() => abrirConversa(conv)}
                  >
                    <div className="conv-avatar">{inicial}</div>
                    <div className="conv-body">
                      <div className="conv-nome">{nome}</div>
                      <div className="conv-assunto">
                        {conv.aluguer?.referencia ? `Ref. ${conv.aluguer.referencia}` : conv.assunto || "—"}
                      </div>
                    </div>
                    <div className="conv-meta">
                      {conv.ultima_mensagem_em && (
                        <span className="conv-hora">{formatData(conv.ultima_mensagem_em, t, lang)}</span>
                      )}
                      {naoLidas > 0 && <span className="conv-badge">{naoLidas}</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              /* Mini-lista de avaliações */
              loadingAvals ? (
                <div className="sem-conv">{t.carregando}</div>
              ) : avaliacoes.length === 0 ? (
                <div className="sem-conv">{t.semAvals}</div>
              ) : avaliacoes.map(av => {
                const nota = av.nota_cliente_lojista || 0;
                const stars = "★".repeat(Math.round(nota)) + "☆".repeat(5 - Math.round(nota));
                const nomeCliente = av.cliente?.nome || "—";
                const inicial = nomeCliente[0]?.toUpperCase() || "?";
                return (
                  <div key={av.id} className="aval-mini">
                    <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                      <div className="conv-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem" }}>{inicial}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="aval-mini-stars">{stars}</div>
                        <div className="aval-mini-nome">{nomeCliente}</div>
                        <div className="aval-mini-peca">{av.peca?.nome || "—"}</div>
                        <div className="aval-mini-data">{formatData(av.created_at, t, lang)}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── ÁREA DIREITA ── */}
        <div className="chat-col">
          {tabPrincipal === "avals" ? (
            /* ── PAINEL AVALIAÇÕES ── */
            (() => {
              if (loadingAvals) return <div className="sem-avals"><div className="sem-avals-txt">{t.carregando}</div></div>;
              if (avaliacoes.length === 0) return <div className="sem-avals"><div className="sem-chat-icon">NG</div><div className="sem-avals-txt">{t.semAvals}</div></div>;
              const media = avaliacoes.reduce((s, a) => s + (a.nota_cliente_lojista || 0), 0) / avaliacoes.length;
              const dist = [5, 4, 3, 2, 1].map(n => ({
                n,
                count: avaliacoes.filter(a => Math.round(a.nota_cliente_lojista || 0) === n).length,
              }));
              return (
                <div className="avals-panel">
                  <div className="avals-sumario">
                    <div style={{ textAlign: "center" }}>
                      <div className="avals-nota-grande">{media.toFixed(1)}</div>
                      <div className="avals-stars-grande">{"★".repeat(Math.round(media))}{"☆".repeat(5 - Math.round(media))}</div>
                      <div className="avals-count">{avaliacoes.length} {t.avals}</div>
                    </div>
                    <div className="avals-barras">
                      {dist.map(({ n, count }) => {
                        const pct = avaliacoes.length > 0 ? Math.round(count / avaliacoes.length * 100) : 0;
                        return (
                          <div key={n} className="barra-row">
                            <span className="barra-label">{n}★</span>
                            <div className="barra-track"><div className="barra-fill" style={{ width: pct + "%" }} /></div>
                            <span className="barra-pct">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {avaliacoes.map(av => {
                    const nota = av.nota_cliente_lojista || 0;
                    const stars = "★".repeat(Math.round(nota)) + "☆".repeat(5 - Math.round(nota));
                    const nomeCliente = av.cliente?.nome || "—";
                    const inicial = nomeCliente[0]?.toUpperCase() || "?";
                    const tipo = av.tipo_transacao === "venda" ? "venda" : "aluguer";
                    const tipoLabel = tipo === "venda" ? t.tipoVenda : t.tipoAluguer;
                    return (
                      <div key={av.id} className="aval-card">
                        <div className="aval-card-header">
                          <div className="aval-card-left">
                            <div className="aval-avatar">{inicial}</div>
                            <div>
                              <div className="aval-nome">{nomeCliente}</div>
                              <div className="aval-stars">{stars}</div>
                            </div>
                          </div>
                          <span className={`aval-tipo ${tipo}`}>{tipoLabel}</span>
                        </div>
                        {av.peca?.nome && <div className="aval-peca">{av.peca.nome}</div>}
                        <div className="aval-comentario">{av.comentario_cliente || <span style={{ color: "var(--g4)" }}>{t.semComentario}</span>}</div>
                        <div className="aval-data">{formatData(av.created_at, t, lang)}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          ) : !conversaAtiva ? (
            <div className="sem-chat">
              <div className="sem-chat-icon">NG</div>
              <div className="sem-chat-txt">{t.semConversas}</div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button
                  className="nav-voltar btn-voltar-mobile"
                  onClick={() => { setVistaChat(false); setConversaAtiva(null); }}
                  style={{ display: "flex" }}
                >
                  ←
                </button>
                <div>
                  <div className="chat-nome">{outraPessoa(conversaAtiva)}</div>
                  {conversaAtiva.aluguer?.referencia && (
                    <div className="chat-sub">{t.sobre}: Ref. {conversaAtiva.aluguer.referencia}</div>
                  )}
                </div>
              </div>

              <div className="chat-msgs" ref={chatRef}>
                {mensagensAgrupadas.length === 0 ? (
                  <div className="chat-vazio">{t.semMensagens}</div>
                ) : mensagensAgrupadas.map((item, i) => {
                  if (item.tipo === "separador") {
                    return <div key={`sep-${i}`} className="separador-dia">{formatData(item.data, t, lang)}</div>;
                  }
                  const sou = item.remetente_id === cliente.id;
                  const trad = traducoes[item.id];
                  return (
                    <div key={item.id} className={`msg-wrap ${sou ? "enviada" : "recebida"}`}>
                      <div className="msg-balao">
                        {trad?.mostrar && trad?.texto ? trad.texto : item.conteudo}
                      </div>
                      {trad?.mostrar && trad?.texto && (
                        <div className="msg-traducao">🌐 {item.conteudo}</div>
                      )}
                      <div className="msg-hora">{formatHora(item.created_at, lang)}</div>
                      {!sou && (
                        <button
                          className="msg-traduzir"
                          onClick={() => traduzirMensagem(item.id, item.conteudo)}
                        >
                          {trad?.loading
                            ? t.traduzindo
                            : trad?.mostrar && trad?.texto
                              ? t.verOriginal
                              : "🌐 " + t.traduzir}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="chat-input">
                <textarea
                  className="chat-textarea"
                  placeholder={t.escrever}
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                  onInput={e => {
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                />
                <button
                  className="btn-enviar"
                  onClick={enviarMensagem}
                  disabled={!texto.trim() || enviando}
                >
                  {t.enviar}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}


export default function MensagensPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100svh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f8f7f5"}}><div style={{width:32,height:32,border:"2px solid #e2dfda",borderTopColor:"#c4748a",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <MensagensInner />
    </Suspense>
  );
}
