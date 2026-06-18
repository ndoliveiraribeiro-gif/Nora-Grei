"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const SENHA = "noragrei2024admin";
const OCASIOES = ["Festa", "Dia a dia", "Trabalho", "Jantar", "Férias", "Casamento", "Praia", "Cerimónia", "Cocktail", "Gala"];
const TAMANHOS = ["XS", "S", "M", "L", "XL", "XXL", "Único"];
const TABS = ["dashboard", "catalogo", "alugueres", "clientes", "reservas", "campanhas", "estatisticas", "config"];
const TAB_LABELS = { dashboard: "Dashboard", catalogo: "Catálogo", alugueres: "Alugueres", clientes: "Clientes", reservas: "Reservas", campanhas: "Campanhas", estatisticas: "Estatísticas & AI", config: "Configurações" };
const TAB_ICONS = { dashboard: "◈", catalogo: "✦", alugueres: "◎", clientes: "◉", reservas: "◌", campanhas: "✉", estatisticas: "◐", config: "⚙" };

const NIVEL = (n) => {
  if (n >= 20) return { nome: "Platina", icon: "💎", caucao: 0, cor: "#6c5ce7" };
  if (n >= 10) return { nome: "Ouro", icon: "🥇", caucao: 50, cor: "#f39c12" };
  if (n >= 5)  return { nome: "Prata", icon: "🥈", caucao: 75, cor: "#95a5a6" };
  return { nome: "Bronze", icon: "🥉", caucao: 100, cor: "#cd7f32" };
};

// ESTILOS INLINE REUTILIZÁVEIS
const C = {
  black: "#080808", white: "#f8f7f5", g1: "#f0eeeb", g2: "#e2dfda", rosa: "#c4748a",
  green: "#27ae60", orange: "#f39c12", red: "#e74c3c",
  serif: "'Cormorant',Georgia,serif", sans: "'Jost',Arial,sans-serif",
};

const btn = (type = "black", size = "normal") => ({
  display: "inline-block",
  padding: size === "sm" ? "0.35rem 0.65rem" : "0.5rem 0.85rem",
  fontSize: size === "sm" ? "0.6rem" : "0.65rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  border: "none",
  cursor: "pointer",
  fontFamily: C.sans,
  fontWeight: 500,
  background: type === "black" ? C.black : type === "rosa" ? C.rosa : type === "red" ? "#fff5f5" : C.white,
  color: type === "black" ? C.white : type === "rosa" ? C.white : type === "red" ? C.red : C.black,
  borderWidth: type === "outline" || type === "red" ? "1px" : 0,
  borderStyle: "solid",
  borderColor: type === "outline" ? C.g2 : type === "red" ? "#f5c6cb" : "transparent",
  transition: "opacity 0.2s",
});

const inp = {
  width: "100%", padding: "0.75rem 0.9rem",
  border: `1.5px solid ${C.g2}`, background: C.white,
  fontSize: "0.92rem", fontFamily: C.sans, color: C.black,
  outline: "none", boxSizing: "border-box",
};

const card = { background: C.white, padding: "1.5rem", marginBottom: "1.5rem" };
const cardTitle = { fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#5a5855", fontWeight: 500, marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: `1px solid ${C.g1}` };
const lbl = { display: "block", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#5a5855", marginBottom: "0.4rem", fontWeight: 500 };
const badge = (color) => ({ display: "inline-block", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.25rem 0.6rem", fontWeight: 500, background: color === "green" ? "#e8f5e9" : color === "orange" ? "#fff8e1" : color === "red" ? "#fff5f5" : color === "rosa" ? "#fff0f3" : C.g1, color: color === "green" ? C.green : color === "orange" ? C.orange : color === "red" ? C.red : color === "rosa" ? C.rosa : "#5a5855" });

export default function Backoffice() {
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erroSenha, setErroSenha] = useState(false);
  const [tab, setTab] = useState("dashboard");

  const [stats, setStats] = useState({ alugueres_ativos: 0, devolucoes_hoje: 0, receita_mes: 0, clientes_total: 0, reservas_espera: 0, taxa_ocupacao: 0 });
  const [pecas, setPecas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [novaPeca, setNovaPeca] = useState({ nome: "", categoria_id: "", preco_aluguer_dia: "", preco_avulso: "", valor_peca: "", descricao: "", material: "", origem: "Portugal", destaque: false, ocasioes: [], tamanhos: [{ tamanho: "M", quantidade_total: 1 }] });
  const [fotosUpload, setFotosUpload] = useState([]);
  const [uploadProgress, setUploadProgress] = useState("");
  const [criandoPeca, setCriandoPeca] = useState(false);
  const [editandoPeca, setEditandoPeca] = useState(null);

  const [alugueres, setAlugueres] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [novaCampanha, setNovaCampanha] = useState({ titulo: "", mensagem: "", tipo: "cupao", codigo: "", desconto: "", probabilidade: 20, url_destino: "https://www.noragrei.com", validade: "" });
  const [estatisticas, setEstatisticas] = useState(null);
  const [aiChat, setAiChat] = useState([]);
  const [aiPergunta, setAiPergunta] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [config, setConfig] = useState({ higienizacao: 9, whatsapp: "", email_suporte: "" });
  const chatRef = useRef(null);

  const entrar = () => {
    if (senha === SENHA) { setLogado(true); setErroSenha(false); }
    else setErroSenha(true);
  };

  useEffect(() => { if (logado) carregarDados(); }, [logado, tab]);

  const carregarDados = async () => {
    if (tab === "dashboard") {
      const { data: al } = await supabase.from("alugueres").select("estado, valor_aluguer, created_at");
      const { data: res } = await supabase.from("reservas_espera").select("id").eq("estado", "aguarda");
      const { data: stock } = await supabase.from("stock_tamanhos").select("quantidade_total");
      if (al) {
        const agora = new Date();
        const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
        const ativos = al.filter(a => a.estado === "ativo").length;
        const totalStock = stock?.reduce((s, t) => s + t.quantidade_total, 0) || 1;
        setStats({
          alugueres_ativos: ativos,
          devolucoes_hoje: al.filter(a => a.estado === "devolvido" && new Date(a.created_at).toDateString() === agora.toDateString()).length,
          receita_mes: al.filter(a => a.created_at >= inicioMes).reduce((s, a) => s + (a.valor_aluguer || 0), 0),
          clientes_total: 0, reservas_espera: res?.length || 0,
          taxa_ocupacao: Math.round((ativos / totalStock) * 100),
        });
      }
      const { count } = await supabase.from("clientes").select("id", { count: "exact" });
      setStats(prev => ({ ...prev, clientes_total: count || 0 }));
    }
    if (tab === "catalogo") {
      const { data: p } = await supabase.from("pecas").select("*, categorias(nome), stock_tamanhos(id, tamanho, quantidade_total, quantidade_disponivel)").order("created_at", { ascending: false });
      if (p) setPecas(p);
      const { data: c } = await supabase.from("categorias").select("*");
      if (c) setCategorias(c);
    }
    if (tab === "alugueres") {
      const { data } = await supabase.from("alugueres").select("*, clientes(nome, email, total_pecas_alugadas), stock_tamanhos(tamanho, pecas(nome, valor_peca))").order("created_at", { ascending: false }).limit(100);
      if (data) setAlugueres(data);
    }
    if (tab === "clientes") {
      const { data } = await supabase.from("clientes").select("*, alugueres(id, estado, created_at, valor_aluguer, data_inicio, data_fim, stock_tamanhos(tamanho, pecas(nome, fotos)))").order("created_at", { ascending: false });
      if (data) setClientes(data);
    }
    if (tab === "reservas") {
      const { data } = await supabase.from("reservas_espera").select("*, clientes(nome, email), stock_tamanhos(tamanho, pecas(nome))").order("created_at", { ascending: false });
      if (data) setReservas(data);
    }
    if (tab === "campanhas") {
      const { data } = await supabase.from("campanhas").select("*").order("created_at", { ascending: false });
      if (data) setCampanhas(data);
    }
    if (tab === "estatisticas") await carregarEstatisticas();
  };

  const carregarEstatisticas = async () => {
    const [alRes, pecasRes, clientesRes, reservasRes] = await Promise.all([
      supabase.from("alugueres").select("*, stock_tamanhos(tamanho, pecas(id, nome, valor_peca, preco_aluguer_dia, categorias(nome))), clientes(nome, email, cidade)"),
      supabase.from("pecas").select("*, categorias(nome), stock_tamanhos(quantidade_total, quantidade_disponivel)"),
      supabase.from("clientes").select("*, alugueres(id, estado, valor_aluguer, created_at)"),
      supabase.from("reservas_espera").select("*, stock_tamanhos(pecas(nome))"),
    ]);
    const al = alRes.data || [], pecasList = pecasRes.data || [], clientesList = clientesRes.data || [], reservasList = reservasRes.data || [];
    const roiPecas = pecasList.map(p => {
      const ap = al.filter(a => a.stock_tamanhos?.pecas?.id === p.id);
      const receita = ap.reduce((s, a) => s + (a.valor_aluguer || 0), 0);
      return { ...p, receitaGerada: receita, vezesAlugada: ap.length, roi: p.valor_peca > 0 ? ((receita / p.valor_peca) * 100).toFixed(0) : 0, danificada: ap.filter(a => a.estado === "devolvido_danificado").length };
    }).sort((a, b) => b.vezesAlugada - a.vezesAlugada);
    const pecasEspera = {};
    reservasList.forEach(r => { const n = r.stock_tamanhos?.pecas?.nome || "—"; pecasEspera[n] = (pecasEspera[n] || 0) + 1; });
    const cidades = {};
    al.forEach(a => { const c = a.clientes?.cidade || "Desconhecida"; cidades[c] = (cidades[c] || 0) + 1; });
    const categoriaCount = {};
    al.forEach(a => { const c = a.stock_tamanhos?.pecas?.categorias?.nome || "Outro"; categoriaCount[c] = (categoriaCount[c] || 0) + 1; });
    const clientesComNivel = clientesList.map(c => {
      const completos = (c.alugueres || []).filter(a => ["devolvido","devolvido_danificado"].includes(a.estado)).length;
      const total = (c.alugueres || []).filter(a => a.estado !== "cancelado").length;
      const gasto = (c.alugueres || []).reduce((s, a) => s + (a.valor_aluguer || 0), 0);
      return { ...c, alugueresTotal: total, alugueresCompletos: completos, totalGasto: gasto, nivel: NIVEL(completos) };
    });
    const ltv = clientesComNivel.reduce((s, c) => s + c.totalGasto, 0) / (clientesComNivel.length || 1);
    setEstatisticas({
      roiPecas, pecasEspera, cidades, categoriaCount,
      clientesMaisAtivos: [...clientesComNivel].sort((a, b) => b.alugueresTotal - a.alugueresTotal).slice(0, 5),
      taxaCancelamento: al.length > 0 ? ((al.filter(a => a.estado === "cancelado").length / al.length) * 100).toFixed(1) : 0,
      ltv, churn: clientesComNivel.filter(c => c.alugueresTotal === 1).length,
      totalReceita: al.reduce((s, a) => s + (a.valor_aluguer || 0), 0),
      totalAlugueres: al.length,
      pecaMaisAlugada: roiPecas[0]?.nome || "—",
      pecaMenosAlugada: [...roiPecas].reverse()[0]?.nome || "—",
    });
  };

  const perguntarAI = async () => {
    if (!aiPergunta.trim() || !estatisticas) return;
    const pergunta = aiPergunta;
    setAiPergunta(""); setAiLoading(true);
    setAiChat(prev => [...prev, { role: "user", content: pergunta }]);
    const contexto = `És um consultor de negócios de moda e aluguer de roupa de luxo. Dados da Nora Grei:
- Total alugueres: ${estatisticas.totalAlugueres}, Receita total: ${estatisticas.totalReceita.toFixed(2)}€
- LTV médio: ${estatisticas.ltv.toFixed(2)}€, Taxa cancelamento: ${estatisticas.taxaCancelamento}%
- Churn: ${estatisticas.churn}, Peça mais alugada: ${estatisticas.pecaMaisAlugada}
- Clientes ativos: ${estatisticas.clientesMaisAtivos.map(c => `${c.nome}(${c.alugueresTotal}x)`).join(", ")}
- Categorias: ${Object.entries(estatisticas.categoriaCount).map(([k,v]) => `${k}:${v}`).join(", ")}
- Cidades: ${Object.entries(estatisticas.cidades).map(([k,v]) => `${k}:${v}`).join(", ")}
Responde em português, de forma concisa e útil.`;
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: contexto, messages: [{ role: "user", content: pergunta }] })
      });
      const data = await resp.json();
      setAiChat(prev => [...prev, { role: "assistant", content: data.content?.[0]?.text || "Erro." }]);
    } catch (e) { setAiChat(prev => [...prev, { role: "assistant", content: "Erro de ligação." }]); }
    setAiLoading(false);
    setTimeout(() => chatRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 100);
  };

  const criarPeca = async () => {
    if (!novaPeca.nome || !novaPeca.preco_aluguer_dia) { alert("Nome e preço são obrigatórios"); return; }
    setCriandoPeca(true); setUploadProgress("A criar peça...");
    const { data: pecaCriada, error } = await supabase.from("pecas").insert({
      nome: novaPeca.nome, categoria_id: novaPeca.categoria_id || null,
      preco_aluguer_dia: parseFloat(novaPeca.preco_aluguer_dia),
      preco_avulso: parseFloat(novaPeca.preco_avulso) || null,
      valor_peca: parseFloat(novaPeca.valor_peca) || 0,
      descricao: novaPeca.descricao, material: novaPeca.material,
      origem: novaPeca.origem, destaque: novaPeca.destaque,
      ocasioes: novaPeca.ocasioes, estado: "disponivel",
    }).select().single();
    if (error) { setUploadProgress("❌ Erro: " + error.message); setCriandoPeca(false); return; }
    for (const t of novaPeca.tamanhos) {
      if (t.tamanho) await supabase.from("stock_tamanhos").insert({ peca_id: pecaCriada.id, tamanho: t.tamanho, quantidade_total: parseInt(t.quantidade_total) || 1, quantidade_disponivel: parseInt(t.quantidade_total) || 1 });
    }
    if (fotosUpload.length > 0) {
      const urls = [];
      for (const foto of fotosUpload) {
        const ext = foto.name.split(".").pop();
        const path = `${pecaCriada.id}/${Date.now()}.${ext}`;
        setUploadProgress(`Upload ${foto.name}...`);
        const { error: upErr } = await supabase.storage.from("pecas").upload(path, foto, { upsert: true });
        if (!upErr) { const { data } = supabase.storage.from("pecas").getPublicUrl(path); urls.push(data.publicUrl); }
      }
      if (urls.length > 0) { await supabase.from("pecas").update({ fotos: urls }).eq("id", pecaCriada.id); }
      setUploadProgress(`✓ Peça criada com ${urls.length} foto(s)!`);
    } else { setUploadProgress("✓ Peça criada com sucesso!"); }
    setNovaPeca({ nome: "", categoria_id: "", preco_aluguer_dia: "", preco_avulso: "", valor_peca: "", descricao: "", material: "", origem: "Portugal", destaque: false, ocasioes: [], tamanhos: [{ tamanho: "M", quantidade_total: 1 }] });
    setFotosUpload([]);
    setCriandoPeca(false);
    setTimeout(() => setUploadProgress(""), 4000);
    carregarDados();
  };

  const atualizarEstado = async (id, estado) => {
    await supabase.from("alugueres").update({ estado }).eq("id", id);
    carregarDados();
  };

  const confirmarDeposito = async (id) => {
    await supabase.from("alugueres").update({ deposito_estado: "recebido", deposito_confirmado_em: new Date().toISOString() }).eq("id", id);
    carregarDados();
  };

  const confirmarRecepcao = async (id) => {
    await supabase.from("alugueres").update({ estado: "em_verificacao", data_recepcao: new Date().toISOString() }).eq("id", id);
    carregarDados();
  };

  const confirmarVerificacao = async (id, danificado = false) => {
    await supabase.from("alugueres").update({ estado: danificado ? "devolvido_danificado" : "devolvido", data_verificacao: new Date().toISOString() }).eq("id", id);
    carregarDados();
  };

  const libertarCaucao = async (id) => {
    await supabase.from("alugueres").update({ deposito_estado: "libertado", caucao_libertada_em: new Date().toISOString() }).eq("id", id);
    carregarDados();
  };

  const criarCampanha = async () => {
    if (!novaCampanha.titulo || !novaCampanha.mensagem) { alert("Título e mensagem são obrigatórios"); return; }
    const { error } = await supabase.from("campanhas").insert({ ...novaCampanha, probabilidade: parseInt(novaCampanha.probabilidade), codigo: novaCampanha.codigo || null, desconto: novaCampanha.desconto || null, validade: novaCampanha.validade || null, ativa: true });
    if (error) { alert("Erro: " + error.message); return; }
    setNovaCampanha({ titulo: "", mensagem: "", tipo: "cupao", codigo: "", desconto: "", probabilidade: 20, url_destino: "https://www.noragrei.com", validade: "" });
    carregarDados();
  };

  const calcularAtraso = (dataFim) => {
    if (!dataFim) return 0;
    const diff = Math.floor((new Date() - new Date(dataFim)) / 86400000);
    return diff > 0 ? diff : 0;
  };

  // LOGIN
  if (!logado) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0eeeb", fontFamily: C.sans }}>
      <div style={{ background: C.white, padding: "3rem", width: "340px", textAlign: "center", boxShadow: "0 2px 40px rgba(0,0,0,0.06)" }}>
        <div style={{ fontFamily: C.serif, fontSize: "1.6rem", fontWeight: 300, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Nora Grei</div>
        <div style={{ fontSize: "0.55rem", letterSpacing: "0.35em", color: "#999", textTransform: "uppercase", marginBottom: "2.5rem" }}>Backoffice</div>
        <input type="password" placeholder="Password" value={senha} onChange={e => { setSenha(e.target.value); setErroSenha(false); }} onKeyDown={e => e.key === "Enter" && entrar()} autoFocus style={{ ...inp, marginBottom: "0.75rem", border: erroSenha ? "1.5px solid #e74c3c" : `1.5px solid ${C.g2}` }} />
        {erroSenha && <div style={{ fontSize: "0.72rem", color: C.red, marginBottom: "0.75rem" }}>Password incorreta</div>}
        <button onClick={entrar} style={{ width: "100%", padding: "0.85rem", background: C.black, color: C.white, border: "none", cursor: "pointer", fontFamily: C.sans, fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Entrar</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh", fontFamily: C.sans, background: C.g1 }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      {/* SIDEBAR */}
      <aside style={{ background: C.black, color: C.white, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, width: 220, zIndex: 100, overflowY: "auto" }}>
        <div style={{ padding: "2rem 1.5rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontFamily: C.serif, fontSize: "1.2rem", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase" }}>Nora Grei</div>
          <div style={{ fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginTop: "0.2rem" }}>Backoffice</div>
        </div>
        <nav style={{ padding: "1rem 0", flex: 1 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1.5rem", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: tab === t ? C.white : "rgba(255,255,255,0.5)", cursor: "pointer", border: "none", background: tab === t ? "rgba(255,255,255,0.08)" : "none", width: "100%", textAlign: "left", borderLeft: tab === t ? `2px solid ${C.rosa}` : "2px solid transparent", transition: "all 0.2s" }}>
              <span style={{ fontSize: "0.9rem", width: 16 }}>{TAB_ICONS[t]}</span>
              {TAB_LABELS[t]}
            </button>
          ))}
        </nav>
        <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => setLogado(false)} style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", fontFamily: C.sans, padding: 0 }}>Terminar sessão</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, padding: "2.5rem", minHeight: "100vh" }}>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <>
            <div style={{ marginBottom: "2rem" }}>
              <h1 style={{ fontFamily: C.serif, fontSize: "2.5rem", fontWeight: 300, lineHeight: 1 }}>Dashboard</h1>
              <p style={{ fontSize: "0.82rem", color: "#5a5855", marginTop: "0.4rem" }}>Resumo do negócio em tempo real</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
              {[
                { val: stats.alugueres_ativos, label: "Alugueres ativos", destaque: true },
                { val: stats.devolucoes_hoje, label: "Devoluções hoje" },
                { val: `${Number(stats.receita_mes).toFixed(0)}€`, label: "Receita este mês" },
                { val: stats.clientes_total, label: "Clientes total" },
              ].map((s, i) => (
                <div key={i} style={{ background: C.white, padding: "1.5rem" }}>
                  <div style={{ fontFamily: C.serif, fontSize: "2.5rem", fontWeight: 300, lineHeight: 1, marginBottom: "0.4rem", color: s.destaque ? C.rosa : C.black }}>{s.val}</div>
                  <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ background: C.white, padding: "1.5rem" }}><div style={{ fontFamily: C.serif, fontSize: "2rem", fontWeight: 300 }}>{stats.reservas_espera}</div><div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855" }}>Reservas em espera</div></div>
              <div style={{ background: C.white, padding: "1.5rem" }}><div style={{ fontFamily: C.serif, fontSize: "2rem", fontWeight: 300 }}>{stats.taxa_ocupacao}%</div><div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855" }}>Taxa de ocupação</div></div>
              <div style={{ background: C.white, padding: "1.5rem", cursor: "pointer" }} onClick={() => setTab("estatisticas")}><div style={{ fontSize: "1.5rem" }}>📊</div><div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855", marginTop: "0.4rem" }}>Ver analytics & AI</div></div>
            </div>
            <div style={card}>
              <p style={cardTitle}>Ações rápidas</p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {[["+ Adicionar peça","black","catalogo"],["Ver alugueres","rosa","alugueres"],["Ver clientes","outline","clientes"],["Ver reservas","outline","reservas"],["📊 Analytics","outline","estatisticas"]].map(([l,t,to]) => (
                  <button key={l} style={btn(t)} onClick={() => setTab(to)}>{l}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── CATÁLOGO ── */}
        {tab === "catalogo" && (
          <>
            <div style={{ marginBottom: "2rem" }}>
              <h1 style={{ fontFamily: C.serif, fontSize: "2.5rem", fontWeight: 300 }}>Catálogo</h1>
              <p style={{ fontSize: "0.82rem", color: "#5a5855", marginTop: "0.4rem" }}>{pecas.length} peças</p>
            </div>

            {/* FORM NOVA PEÇA */}
            <div style={card}>
              <p style={cardTitle}>Adicionar nova peça</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div><label style={lbl}>Nome *</label><input style={inp} value={novaPeca.nome} onChange={e => setNovaPeca(p => ({...p, nome: e.target.value}))} placeholder="Vestido Seda Noite" /></div>
                <div><label style={lbl}>Categoria</label>
                  <select style={inp} value={novaPeca.categoria_id} onChange={e => setNovaPeca(p => ({...p, categoria_id: e.target.value}))}>
                    <option value="">Selecionar</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Preço aluguer/dia (€) *</label><input style={inp} type="number" value={novaPeca.preco_aluguer_dia} onChange={e => setNovaPeca(p => ({...p, preco_aluguer_dia: e.target.value}))} placeholder="35" /></div>
                <div><label style={lbl}>Preço por ocasião (€)</label><input style={inp} type="number" value={novaPeca.preco_avulso} onChange={e => setNovaPeca(p => ({...p, preco_avulso: e.target.value}))} placeholder="89" /></div>
                <div><label style={lbl}>Valor peça (€) — caução base</label><input style={inp} type="number" value={novaPeca.valor_peca} onChange={e => setNovaPeca(p => ({...p, valor_peca: e.target.value}))} placeholder="450" /></div>
                <div><label style={lbl}>Material</label><input style={inp} value={novaPeca.material} onChange={e => setNovaPeca(p => ({...p, material: e.target.value}))} placeholder="100% Seda natural" /></div>
                <div><label style={lbl}>Origem</label><input style={inp} value={novaPeca.origem} onChange={e => setNovaPeca(p => ({...p, origem: e.target.value}))} /></div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "1.5rem" }}>
                  <input type="checkbox" id="destaque" checked={novaPeca.destaque} onChange={e => setNovaPeca(p => ({...p, destaque: e.target.checked}))} />
                  <label htmlFor="destaque" style={{ ...lbl, marginBottom: 0 }}>Peça em destaque</label>
                </div>
                <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Descrição</label><textarea style={{ ...inp, resize: "vertical", minHeight: "80px" }} value={novaPeca.descricao} onChange={e => setNovaPeca(p => ({...p, descricao: e.target.value}))} placeholder="Descrição da peça..." /></div>
              </div>

              {/* OCASIÕES */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={lbl}>Ocasiões</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  {OCASIOES.map(o => (
                    <button key={o} type="button" onClick={() => setNovaPeca(p => ({ ...p, ocasioes: p.ocasioes.includes(o) ? p.ocasioes.filter(x => x !== o) : [...p.ocasioes, o] }))}
                      style={{ fontSize: "0.65rem", padding: "0.4rem 0.75rem", border: `1.5px solid ${novaPeca.ocasioes.includes(o) ? C.black : C.g2}`, background: novaPeca.ocasioes.includes(o) ? C.black : C.white, color: novaPeca.ocasioes.includes(o) ? C.white : C.black, cursor: "pointer", fontFamily: C.sans }}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAMANHOS */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={lbl}>Tamanhos & stock</label>
                {novaPeca.tamanhos.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.5rem" }}>
                    <select style={{ ...inp, width: "120px" }} value={t.tamanho} onChange={e => { const ts = [...novaPeca.tamanhos]; ts[i].tamanho = e.target.value; setNovaPeca(p => ({...p, tamanhos: ts})); }}>
                      <option value="">Tamanho</option>
                      {TAMANHOS.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                    </select>
                    <input style={{ ...inp, width: "100px" }} type="number" min="1" value={t.quantidade_total} placeholder="Qtd" onChange={e => { const ts = [...novaPeca.tamanhos]; ts[i].quantidade_total = e.target.value; setNovaPeca(p => ({...p, tamanhos: ts})); }} />
                    {novaPeca.tamanhos.length > 1 && <button type="button" onClick={() => setNovaPeca(p => ({...p, tamanhos: p.tamanhos.filter((_, j) => j !== i)}))} style={{ background: "none", border: "none", cursor: "pointer", color: C.red, fontSize: "1.1rem" }}>✕</button>}
                  </div>
                ))}
                <button type="button" style={btn("outline", "sm")} onClick={() => setNovaPeca(p => ({...p, tamanhos: [...p.tamanhos, {tamanho: "", quantidade_total: 1}]}))}>+ Adicionar tamanho</button>
              </div>

              {/* FOTOS */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={lbl}>Fotos</label>
                <label style={{ width: "100%", padding: "1.5rem", border: `2px dashed ${C.g2}`, background: C.g1, cursor: "pointer", textAlign: "center", display: "block" }}>
                  <input type="file" accept="image/*" multiple onChange={e => setFotosUpload(Array.from(e.target.files))} style={{ display: "none" }} />
                  {fotosUpload.length === 0
                    ? <div><div style={{ fontSize: "1.5rem" }}>📷</div><div style={{ fontSize: "0.82rem", color: "#5a5855", marginTop: "0.4rem" }}>Clica para selecionar fotos</div></div>
                    : <div style={{ color: C.green, fontWeight: 500 }}>{fotosUpload.length} foto(s): {fotosUpload.map(f => f.name).join(", ")}</div>}
                </label>
                {fotosUpload.length > 0 && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                    {fotosUpload.map((f, i) => <img key={i} src={URL.createObjectURL(f)} alt="" style={{ width: 60, height: 60, objectFit: "cover", border: `1px solid ${C.g2}` }} />)}
                  </div>
                )}
                {uploadProgress && <p style={{ fontSize: "0.75rem", color: uploadProgress.startsWith("✓") ? C.green : uploadProgress.startsWith("❌") ? C.red : C.rosa, marginTop: "0.5rem", fontWeight: 500 }}>{uploadProgress}</p>}
              </div>

              <button style={{ ...btn("black"), opacity: criandoPeca ? 0.6 : 1 }} onClick={criarPeca} disabled={criandoPeca}>
                {criandoPeca ? "A criar..." : "+ Adicionar peça"}
              </button>
            </div>

            {/* LISTA PEÇAS */}
            <div style={card}>
              <p style={cardTitle}>Peças no catálogo ({pecas.length})</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Foto","Peça","Categoria","Preço/dia","Ocasiões","Tamanhos","Estado","Ações"].map(h => (
                        <th key={h} style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855", fontWeight: 500, padding: "0.6rem 0.75rem", textAlign: "left", borderBottom: `1px solid ${C.g2}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pecas.map(p => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${C.g1}` }}>
                        <td style={{ padding: "0.85rem 0.75rem" }}>{p.fotos?.length > 0 ? <img src={p.fotos[0]} alt="" style={{ width: 48, height: 48, objectFit: "cover", border: `1px solid ${C.g2}` }} /> : <div style={{ width: 48, height: 48, background: C.g1, display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>📷</div>}</td>
                        <td style={{ padding: "0.85rem 0.75rem" }}><strong>{p.nome}</strong>{p.destaque && <span style={{ marginLeft: "0.4rem", fontSize: "0.6rem", background: "#fff0f3", color: C.rosa, padding: "0.1rem 0.4rem" }}>★</span>}</td>
                        <td style={{ padding: "0.85rem 0.75rem", fontSize: "0.85rem" }}>{p.categorias?.nome || "—"}</td>
                        <td style={{ padding: "0.85rem 0.75rem", fontSize: "0.85rem" }}>{p.preco_aluguer_dia}€{p.preco_avulso ? <div style={{ fontSize: "0.72rem", color: "#5a5855" }}>{p.preco_avulso}€/ocas.</div> : null}</td>
                        <td style={{ padding: "0.85rem 0.75rem", fontSize: "0.72rem", maxWidth: "120px", color: "#5a5855" }}>{(p.ocasioes || []).slice(0, 3).join(", ") || "—"}</td>
                        <td style={{ padding: "0.85rem 0.75rem", fontSize: "0.75rem" }}>{p.stock_tamanhos?.map(s => `${s.tamanho}(${s.quantidade_disponivel}/${s.quantidade_total})`).join(", ") || "—"}</td>
                        <td style={{ padding: "0.85rem 0.75rem" }}><span style={badge(p.estado === "disponivel" ? "green" : "gray")}>{p.estado}</span></td>
                        <td style={{ padding: "0.85rem 0.75rem" }}>
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <button style={btn("outline", "sm")} onClick={async () => { await supabase.from("pecas").update({ estado: p.estado === "disponivel" ? "indisponivel" : "disponivel" }).eq("id", p.id); carregarDados(); }}>{p.estado === "disponivel" ? "Desativar" : "Ativar"}</button>
                            <button style={btn("red", "sm")} onClick={async () => { if (confirm("Apagar esta peça?")) { await supabase.from("pecas").delete().eq("id", p.id); carregarDados(); } }}>Apagar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── ALUGUERES ── */}
        {tab === "alugueres" && (
          <>
            <div style={{ marginBottom: "2rem" }}><h1 style={{ fontFamily: C.serif, fontSize: "2.5rem", fontWeight: 300 }}>Alugueres</h1><p style={{ fontSize: "0.82rem", color: "#5a5855", marginTop: "0.4rem" }}>{alugueres.length} registados</p></div>
            <div style={card}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Cliente","Peça","Datas","Atraso","Valor","Depósito","Estado","Ações"].map(h => <th key={h} style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855", fontWeight: 500, padding: "0.6rem 0.75rem", textAlign: "left", borderBottom: `1px solid ${C.g2}` }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {alugueres.map(a => {
                      const numAl = a.clientes?.total_pecas_alugadas || 0;
                      const nv = NIVEL(numAl);
                      const atraso = calcularAtraso(a.data_fim);
                      return (
                        <tr key={a.id} style={{ borderBottom: `1px solid ${C.g1}` }}>
                          <td style={{ padding: "0.85rem 0.75rem" }}>
                            <div style={{ fontWeight: 500 }}>{a.clientes?.nome || "—"}</div>
                            <div style={{ fontSize: "0.75rem", color: "#5a5855" }}>{a.clientes?.email}</div>
                            <span style={{ ...badge(""), background: nv.cor + "22", color: nv.cor, marginTop: "0.2rem", display: "inline-block" }}>{nv.icon} {nv.nome}</span>
                          </td>
                          <td style={{ padding: "0.85rem 0.75rem" }}>
                            <div>{a.stock_tamanhos?.pecas?.nome || "—"}</div>
                            <div style={{ fontSize: "0.78rem", color: "#5a5855" }}>Tam: {a.stock_tamanhos?.tamanho}</div>
                          </td>
                          <td style={{ padding: "0.85rem 0.75rem", fontSize: "0.82rem" }}>{a.data_inicio} → {a.data_fim}</td>
                          <td style={{ padding: "0.85rem 0.75rem" }}>{atraso > 0 ? <span style={{ color: C.red, fontWeight: 600 }}>+{atraso}d</span> : <span style={{ color: C.green }}>✓</span>}</td>
                          <td style={{ padding: "0.85rem 0.75rem" }}>{a.valor_aluguer}€</td>
                          <td style={{ padding: "0.85rem 0.75rem" }}>
                            <span style={badge(a.deposito_estado === "recebido" || a.deposito_estado === "libertado" ? "green" : "orange")}>{a.deposito_estado}</span>
                            {a.deposito_estado === "pendente" && <button style={{ ...btn("rosa", "sm"), display: "block", marginTop: "0.25rem" }} onClick={() => confirmarDeposito(a.id)}>Confirmar</button>}
                          </td>
                          <td style={{ padding: "0.85rem 0.75rem" }}>
                            <select value={a.estado} onChange={e => atualizarEstado(a.id, e.target.value)} style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.35rem 0.5rem", border: `1px solid ${C.g2}`, background: C.white, fontFamily: C.sans, cursor: "pointer", color: C.black }}>
                              {["pendente","confirmado","enviado","ativo","em_verificacao","devolvido","devolvido_danificado","nao_devolvido","cancelado"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: "0.85rem 0.75rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                              {a.estado === "ativo" && <button style={btn("rosa", "sm")} onClick={() => confirmarRecepcao(a.id)}>📦 Recebi</button>}
                              {a.estado === "em_verificacao" && <>
                                <button style={btn("black", "sm")} onClick={() => confirmarVerificacao(a.id, false)}>✓ OK</button>
                                <button style={btn("red", "sm")} onClick={() => confirmarVerificacao(a.id, true)}>✗ Dano</button>
                              </>}
                              {a.estado === "devolvido" && a.deposito_estado !== "libertado" && <button style={btn("outline", "sm")} onClick={() => libertarCaucao(a.id)}>💰 Libertar</button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── CLIENTES ── */}
        {tab === "clientes" && (
          <>
            <div style={{ marginBottom: "2rem" }}><h1 style={{ fontFamily: C.serif, fontSize: "2.5rem", fontWeight: 300 }}>Clientes</h1><p style={{ fontSize: "0.82rem", color: "#5a5855", marginTop: "0.4rem" }}>{clientes.length} registados</p></div>
            <div style={card}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Cliente","Cidade","Nível","Alugueres","Total gasto","Caução","Detalhe"].map(h => <th key={h} style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855", fontWeight: 500, padding: "0.6rem 0.75rem", textAlign: "left", borderBottom: `1px solid ${C.g2}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {clientes.map(c => {
                    const al = c.alugueres || [];
                    const total = al.filter(a => a.estado !== "cancelado").length;
                    const completos = al.filter(a => ["devolvido","devolvido_danificado"].includes(a.estado)).length;
                    const gasto = al.reduce((s, a) => s + (a.valor_aluguer || 0), 0);
                    const nv = NIVEL(completos);
                    return (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${C.g1}` }}>
                        <td style={{ padding: "0.85rem 0.75rem" }}>
                          <div style={{ fontWeight: 500 }}>{c.nome || "—"}</div>
                          <div style={{ fontSize: "0.78rem", color: "#5a5855" }}>{c.email}</div>
                          <div style={{ fontSize: "0.72rem", color: "#5a5855" }}>{c.telefone || ""}</div>
                        </td>
                        <td style={{ padding: "0.85rem 0.75rem", fontSize: "0.85rem" }}>{c.cidade || "—"}</td>
                        <td style={{ padding: "0.85rem 0.75rem" }}>
                          <span style={{ ...badge(""), background: nv.cor + "22", color: nv.cor }}>{nv.icon} {nv.nome}</span>
                          <div style={{ fontSize: "0.68rem", color: "#5a5855", marginTop: "0.2rem" }}>
                            {completos < 5 ? `${5-completos} para Prata` : completos < 10 ? `${10-completos} para Ouro` : completos < 20 ? `${20-completos} para Platina` : "Platina ✓"}
                          </div>
                        </td>
                        <td style={{ padding: "0.85rem 0.75rem" }}><span style={badge("rosa")}>{total} pts</span></td>
                        <td style={{ padding: "0.85rem 0.75rem", fontWeight: 500 }}>{gasto.toFixed(0)}€</td>
                        <td style={{ padding: "0.85rem 0.75rem", color: nv.cor, fontWeight: 500 }}>{nv.caucao}%</td>
                        <td style={{ padding: "0.85rem 0.75rem" }}>
                          <button style={btn("outline", "sm")} onClick={() => setClienteSelecionado(clienteSelecionado?.id === c.id ? null : c)}>
                            {clienteSelecionado?.id === c.id ? "Fechar" : "Ver"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* DETALHE CLIENTE */}
            {clienteSelecionado && (
              <div style={card}>
                <p style={cardTitle}>Perfil — {clienteSelecionado.nome}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                  {[["Email", clienteSelecionado.email],["Telefone", clienteSelecionado.telefone || "—"],["NIF", clienteSelecionado.nif || "—"],["Cidade", clienteSelecionado.cidade || "—"],["País", clienteSelecionado.pais || "—"],["Membro desde", new Date(clienteSelecionado.created_at).toLocaleDateString("pt-PT")]].map(([k,v]) => (
                    <div key={k}><div style={{ fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#5a5855", marginBottom: "0.2rem" }}>{k}</div><div style={{ fontSize: "0.9rem" }}>{v}</div></div>
                  ))}
                </div>
                <p style={{ ...cardTitle, marginBottom: "0.75rem" }}>Histórico de alugueres</p>
                {(clienteSelecionado.alugueres || []).length === 0 ? (
                  <p style={{ color: "#5a5855", fontSize: "0.85rem" }}>Sem alugueres</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Peça","Tamanho","Datas","Valor","Estado"].map(h => <th key={h} style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855", fontWeight: 500, padding: "0.5rem 0.75rem", textAlign: "left", borderBottom: `1px solid ${C.g2}` }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(clienteSelecionado.alugueres || []).map(a => (
                        <tr key={a.id} style={{ borderBottom: `1px solid ${C.g1}` }}>
                          <td style={{ padding: "0.65rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {a.stock_tamanhos?.pecas?.fotos?.[0] && <img src={a.stock_tamanhos.pecas.fotos[0]} alt="" style={{ width: 32, height: 40, objectFit: "cover" }} />}
                            {a.stock_tamanhos?.pecas?.nome || "—"}
                          </td>
                          <td style={{ padding: "0.65rem 0.75rem", fontSize: "0.82rem" }}>{a.stock_tamanhos?.tamanho || "—"}</td>
                          <td style={{ padding: "0.65rem 0.75rem", fontSize: "0.82rem" }}>{a.data_inicio} → {a.data_fim}</td>
                          <td style={{ padding: "0.65rem 0.75rem", fontWeight: 500 }}>{a.valor_aluguer}€</td>
                          <td style={{ padding: "0.65rem 0.75rem" }}><span style={badge(a.estado === "devolvido" ? "green" : a.estado === "ativo" ? "orange" : "gray")}>{a.estado}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}

        {/* ── RESERVAS ── */}
        {tab === "reservas" && (
          <>
            <div style={{ marginBottom: "2rem" }}><h1 style={{ fontFamily: C.serif, fontSize: "2.5rem", fontWeight: 300 }}>Reservas em espera</h1><p style={{ fontSize: "0.82rem", color: "#5a5855", marginTop: "0.4rem" }}>{reservas.length} pendentes</p></div>
            <div style={card}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Cliente","Peça","Datas desejadas","Estado","Ações"].map(h => <th key={h} style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855", fontWeight: 500, padding: "0.6rem 0.75rem", textAlign: "left", borderBottom: `1px solid ${C.g2}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {reservas.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", color: "#5a5855", padding: "2rem", fontSize: "0.85rem" }}>Sem reservas em espera</td></tr>
                    : reservas.map(r => (
                      <tr key={r.id} style={{ borderBottom: `1px solid ${C.g1}` }}>
                        <td style={{ padding: "0.85rem 0.75rem" }}><div style={{ fontWeight: 500 }}>{r.clientes?.nome || "—"}</div><div style={{ fontSize: "0.78rem", color: "#5a5855" }}>{r.clientes?.email}</div></td>
                        <td style={{ padding: "0.85rem 0.75rem" }}><div>{r.stock_tamanhos?.pecas?.nome || "—"}</div><div style={{ fontSize: "0.78rem", color: "#5a5855" }}>Tam: {r.stock_tamanhos?.tamanho}</div></td>
                        <td style={{ padding: "0.85rem 0.75rem", fontSize: "0.82rem" }}>{r.data_inicio_desejada} → {r.data_fim_desejada}</td>
                        <td style={{ padding: "0.85rem 0.75rem" }}><span style={badge(r.estado === "aguarda" ? "orange" : "green")}>{r.estado}</span></td>
                        <td style={{ padding: "0.85rem 0.75rem" }}>{r.estado === "aguarda" && <button style={btn("rosa", "sm")} onClick={async () => { await supabase.from("reservas_espera").update({ estado: "notificado", notificado_em: new Date().toISOString() }).eq("id", r.id); carregarDados(); }}>Notificar</button>}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── CAMPANHAS ── */}
        {tab === "campanhas" && (
          <>
            <div style={{ marginBottom: "2rem" }}><h1 style={{ fontFamily: C.serif, fontSize: "2.5rem", fontWeight: 300 }}>Campanhas</h1><p style={{ fontSize: "0.82rem", color: "#5a5855", marginTop: "0.4rem" }}>Alertas e cupões para clientes</p></div>
            <div style={card}>
              <p style={cardTitle}>Nova campanha</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div><label style={lbl}>Título *</label><input style={inp} value={novaCampanha.titulo} onChange={e => setNovaCampanha(p => ({...p, titulo: e.target.value}))} placeholder="É o teu dia de sorte!" /></div>
                <div><label style={lbl}>Tipo</label>
                  <select style={inp} value={novaCampanha.tipo} onChange={e => setNovaCampanha(p => ({...p, tipo: e.target.value}))}>
                    <option value="cupao">Cupão de desconto</option>
                    <option value="novidade">Novidade de produto</option>
                    <option value="oferta">Oferta especial</option>
                  </select>
                </div>
                <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Mensagem *</label><textarea style={{ ...inp, resize: "vertical", minHeight: "80px" }} value={novaCampanha.mensagem} onChange={e => setNovaCampanha(p => ({...p, mensagem: e.target.value}))} placeholder="Descrição da campanha..." /></div>
                <div><label style={lbl}>Código desconto</label><input style={inp} value={novaCampanha.codigo} onChange={e => setNovaCampanha(p => ({...p, codigo: e.target.value}))} placeholder="NORA15" /></div>
                <div><label style={lbl}>Descrição desconto</label><input style={inp} value={novaCampanha.desconto} onChange={e => setNovaCampanha(p => ({...p, desconto: e.target.value}))} placeholder="15% em toda a loja" /></div>
                <div><label style={lbl}>Probabilidade de aparecer (%)</label><input style={inp} type="number" min="1" max="100" value={novaCampanha.probabilidade} onChange={e => setNovaCampanha(p => ({...p, probabilidade: e.target.value}))} /></div>
                <div><label style={lbl}>Validade (opcional)</label><input style={inp} type="datetime-local" value={novaCampanha.validade} onChange={e => setNovaCampanha(p => ({...p, validade: e.target.value}))} /></div>
                <div style={{ gridColumn: "1/-1" }}><label style={lbl}>URL destino</label><input style={inp} value={novaCampanha.url_destino} onChange={e => setNovaCampanha(p => ({...p, url_destino: e.target.value}))} /></div>
              </div>
              <button style={btn("rosa")} onClick={criarCampanha}>✉ Criar campanha</button>
            </div>

            <div style={card}>
              <p style={cardTitle}>{campanhas.length} campanhas criadas</p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Título","Tipo","Código","Prob.","Estado","Ações"].map(h => <th key={h} style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855", fontWeight: 500, padding: "0.6rem 0.75rem", textAlign: "left", borderBottom: `1px solid ${C.g2}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {campanhas.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", color: "#5a5855", padding: "2rem", fontSize: "0.85rem" }}>Sem campanhas criadas</td></tr>
                    : campanhas.map(c => (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${C.g1}` }}>
                        <td style={{ padding: "0.85rem 0.75rem" }}><div style={{ fontWeight: 500 }}>{c.titulo}</div><div style={{ fontSize: "0.75rem", color: "#5a5855", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.mensagem}</div></td>
                        <td style={{ padding: "0.85rem 0.75rem" }}><span style={badge(c.tipo === "cupao" ? "rosa" : "green")}>{c.tipo}</span></td>
                        <td style={{ padding: "0.85rem 0.75rem", fontWeight: 600, letterSpacing: "0.1em" }}>{c.codigo || "—"}</td>
                        <td style={{ padding: "0.85rem 0.75rem" }}>{c.probabilidade}%</td>
                        <td style={{ padding: "0.85rem 0.75rem" }}><span style={badge(c.ativa ? "green" : "gray")}>{c.ativa ? "Ativa" : "Inativa"}</span></td>
                        <td style={{ padding: "0.85rem 0.75rem" }}>
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <button style={btn(c.ativa ? "outline" : "rosa", "sm")} onClick={async () => { await supabase.from("campanhas").update({ ativa: !c.ativa }).eq("id", c.id); carregarDados(); }}>{c.ativa ? "Pausar" : "Ativar"}</button>
                            <button style={btn("red", "sm")} onClick={async () => { if (confirm("Apagar?")) { await supabase.from("campanhas").delete().eq("id", c.id); carregarDados(); } }}>Apagar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── ESTATÍSTICAS & AI ── */}
        {tab === "estatisticas" && (
          <>
            <div style={{ marginBottom: "2rem" }}><h1 style={{ fontFamily: C.serif, fontSize: "2.5rem", fontWeight: 300 }}>Estatísticas & AI</h1><p style={{ fontSize: "0.82rem", color: "#5a5855", marginTop: "0.4rem" }}>Analytics completo + consultor inteligente</p></div>
            {!estatisticas ? <div style={{ textAlign: "center", padding: "3rem", color: "#5a5855" }}>A carregar dados...</div> : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                  {[
                    { val: `${estatisticas.totalReceita.toFixed(0)}€`, label: "Receita total", d: true },
                    { val: estatisticas.totalAlugueres, label: "Total alugueres" },
                    { val: `${estatisticas.ltv.toFixed(0)}€`, label: "LTV médio" },
                    { val: `${estatisticas.taxaCancelamento}%`, label: "Taxa cancelamento" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: C.white, padding: "1.5rem" }}>
                      <div style={{ fontFamily: C.serif, fontSize: "2rem", fontWeight: 300, color: s.d ? C.rosa : C.black }}>{s.val}</div>
                      <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855", marginTop: "0.4rem" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div style={card}>
                    <p style={cardTitle}>Categorias mais alugadas</p>
                    {Object.entries(estatisticas.categoriaCount).sort((a,b) => b[1]-a[1]).map(([cat, count]) => {
                      const max = Math.max(...Object.values(estatisticas.categoriaCount));
                      return (
                        <div key={cat} style={{ marginBottom: "0.75rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}><span>{cat}</span><span style={{ fontWeight: 600 }}>{count}</span></div>
                          <div style={{ height: 8, background: C.g2, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(count/max)*100}%`, background: C.rosa, borderRadius: 4 }} /></div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={card}>
                    <p style={cardTitle}>Cidades com mais alugueres</p>
                    {Object.entries(estatisticas.cidades).sort((a,b) => b[1]-a[1]).slice(0,6).map(([cidade, count]) => {
                      const max = Math.max(...Object.values(estatisticas.cidades));
                      return (
                        <div key={cidade} style={{ marginBottom: "0.75rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}><span>{cidade}</span><span style={{ fontWeight: 600 }}>{count}</span></div>
                          <div style={{ height: 8, background: C.g2, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(count/max)*100}%`, background: C.rosa, borderRadius: 4 }} /></div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ ...card, marginBottom: "1.5rem" }}>
                  <p style={cardTitle}>ROI por peça</p>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr>{["Peça","Valor","Vezes alugada","Receita","ROI","Danos","Break-even"].map(h => <th key={h} style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855", fontWeight: 500, padding: "0.6rem 0.75rem", textAlign: "left", borderBottom: `1px solid ${C.g2}` }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {estatisticas.roiPecas.map(p => (
                          <tr key={p.id} style={{ borderBottom: `1px solid ${C.g1}` }}>
                            <td style={{ padding: "0.75rem" }}><strong>{p.nome}</strong></td>
                            <td style={{ padding: "0.75rem" }}>{p.valor_peca}€</td>
                            <td style={{ padding: "0.75rem" }}>{p.vezesAlugada}x</td>
                            <td style={{ padding: "0.75rem", color: C.green, fontWeight: 500 }}>{p.receitaGerada.toFixed(0)}€</td>
                            <td style={{ padding: "0.75rem" }}><span style={{ color: p.roi >= 100 ? C.green : p.roi >= 50 ? C.orange : C.red, fontWeight: 600 }}>{p.roi}%</span></td>
                            <td style={{ padding: "0.75rem" }}>{p.danificada > 0 ? <span style={{ color: C.red }}>{p.danificada}x</span> : <span style={{ color: C.green }}>0</span>}</td>
                            <td style={{ padding: "0.75rem", fontSize: "0.82rem", color: "#5a5855" }}>{p.preco_aluguer_dia > 0 ? `${Math.ceil(p.valor_peca / p.preco_aluguer_dia)} dias` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div style={card}>
                    <p style={cardTitle}>Clientes mais ativos</p>
                    {estatisticas.clientesMaisAtivos.map((c, i) => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0", borderBottom: `1px solid ${C.g1}` }}>
                        <div style={{ fontSize: "1.2rem", width: 30, textAlign: "center" }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: "0.88rem" }}>{c.nome}</div>
                          <div style={{ fontSize: "0.75rem", color: "#5a5855" }}>{c.alugueresTotal} alugueres · {c.totalGasto.toFixed(0)}€</div>
                        </div>
                        <span style={{ ...badge(""), background: c.nivel.cor + "22", color: c.nivel.cor }}>{c.nivel.icon} {c.nivel.nome}</span>
                      </div>
                    ))}
                  </div>
                  <div style={card}>
                    <p style={cardTitle}>Peças em lista de espera</p>
                    {Object.keys(estatisticas.pecasEspera).length === 0
                      ? <p style={{ color: "#5a5855", fontSize: "0.85rem" }}>Nenhuma peça em espera</p>
                      : Object.entries(estatisticas.pecasEspera).sort((a,b) => b[1]-a[1]).map(([peca, count]) => (
                        <div key={peca} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: `1px solid ${C.g1}`, fontSize: "0.88rem" }}>
                          <span>{peca}</span><span style={badge("orange")}>{count} em espera</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* AI CONSULTING */}
                <div style={card}>
                  <p style={cardTitle}>AI Consulting — Análise inteligente</p>
                  <div ref={chatRef} style={{ height: 320, overflowY: "auto", padding: "1rem", background: C.g1, marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {aiChat.length === 0 && <div style={{ color: "#5a5855", fontSize: "0.85rem", textAlign: "center", paddingTop: "2rem" }}>Pergunta-me qualquer coisa sobre o teu negócio.</div>}
                    {aiChat.map((m, i) => (
                      <div key={i} style={{ padding: "0.75rem 1rem", maxWidth: "80%", fontSize: "0.88rem", lineHeight: 1.5, whiteSpace: "pre-wrap", background: m.role === "user" ? C.black : C.white, color: m.role === "user" ? C.white : C.black, alignSelf: m.role === "user" ? "flex-end" : "flex-start", borderLeft: m.role === "assistant" ? `3px solid ${C.rosa}` : "none" }}>{m.content}</div>
                    ))}
                    {aiLoading && <div style={{ padding: "0.75rem 1rem", background: C.white, alignSelf: "flex-start", color: "#5a5855", borderLeft: `3px solid ${C.rosa}` }}>A analisar...</div>}
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <input style={{ ...inp, flex: 1 }} value={aiPergunta} onChange={e => setAiPergunta(e.target.value)} onKeyDown={e => e.key === "Enter" && perguntarAI()} placeholder="Pergunta ao consultor AI..." />
                    <button style={btn("black")} onClick={perguntarAI} disabled={aiLoading}>Enviar</button>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {["Que peças devo comprar mais?","Quais clientes em risco de não voltar?","Onde focar o marketing?","Que preços ajustar?","Análise geral do negócio"].map(q => (
                      <button key={q} style={btn("outline", "sm")} onClick={() => setAiPergunta(q)}>{q}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── CONFIG ── */}
        {tab === "config" && (
          <>
            <div style={{ marginBottom: "2rem" }}><h1 style={{ fontFamily: C.serif, fontSize: "2.5rem", fontWeight: 300 }}>Configurações</h1><p style={{ fontSize: "0.82rem", color: "#5a5855", marginTop: "0.4rem" }}>Preços e contactos</p></div>
            <div style={card}>
              <p style={cardTitle}>Preços e taxas</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><label style={lbl}>Taxa higienização (€)</label><input style={inp} type="number" value={config.higienizacao} onChange={e => setConfig(c => ({...c, higienizacao: e.target.value}))} /></div>
              </div>
            </div>
            <div style={card}>
              <p style={cardTitle}>Contactos</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div><label style={lbl}>WhatsApp</label><input style={inp} value={config.whatsapp} onChange={e => setConfig(c => ({...c, whatsapp: e.target.value}))} placeholder="+351 912 345 678" /></div>
                <div><label style={lbl}>Email suporte</label><input style={inp} type="email" value={config.email_suporte} onChange={e => setConfig(c => ({...c, email_suporte: e.target.value}))} placeholder="suporte@noragrei.com" /></div>
              </div>
              <button style={btn("black")} onClick={() => alert("Guardado!")}>Guardar</button>
            </div>
            <div style={card}>
              <p style={cardTitle}>Sistema de níveis de confiança</p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Nível","Alugueres","Desconto caução","Caução paga"].map(h => <th key={h} style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a5855", fontWeight: 500, padding: "0.6rem 0.75rem", textAlign: "left", borderBottom: `1px solid ${C.g2}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {[["🥉 Bronze","0–4","0%","100%"],["🥈 Prata","5–9","25%","75%"],["🥇 Ouro","10–19","50%","50%"],["💎 Platina","20+ (sem danos)","100%","0%"]].map(([n,a,d,c]) => (
                    <tr key={n} style={{ borderBottom: `1px solid ${C.g1}` }}>
                      <td style={{ padding: "0.75rem" }}><strong>{n}</strong></td>
                      <td style={{ padding: "0.75rem" }}>{a}</td>
                      <td style={{ padding: "0.75rem", color: C.green }}>{d}</td>
                      <td style={{ padding: "0.75rem" }}>{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </main>
    </div>
  );
}