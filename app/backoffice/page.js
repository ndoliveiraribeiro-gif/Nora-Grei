"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const SENHA = "noragrei2024admin";
const OCASIOES = ["Festa", "Dia a dia", "Trabalho", "Jantar", "Férias", "Casamento", "Praia", "Cerimónia", "Cocktail", "Gala"];
const TAMANHOS = ["XS", "S", "M", "L", "XL", "XXL", "Único"];
const TABS = ["dashboard", "catalogo", "alugueres", "clientes", "reservas", "campanhas", "estatisticas", "config"];
const TAB_LABELS = { dashboard: "Dashboard", catalogo: "Catálogo", alugueres: "Alugueres", clientes: "Clientes", reservas: "Reservas", campanhas: "Campanhas", estatisticas: "Estatísticas & AI", config: "Config" };

const NIVEL = (n) => {
  if (n >= 20) return { nome: "Platina", icon: "💎", caucao: 0, cor: "#6c5ce7" };
  if (n >= 10) return { nome: "Ouro", icon: "🥇", caucao: 50, cor: "#f39c12" };
  if (n >= 5)  return { nome: "Prata", icon: "🥈", caucao: 75, cor: "#95a5a6" };
  return { nome: "Bronze", icon: "🥉", caucao: 100, cor: "#cd7f32" };
};

const ROW = { display: "flex", gap: "1rem", flexWrap: "wrap" };
const COL2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" };
const COL4 = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" };
const CARD = { background: "#fff", padding: "1.5rem", marginBottom: "1.5rem", borderRadius: 0 };
const CARD_T = { fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#888", fontWeight: 600, marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f0eeeb" };
const LBL = { display: "block", fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: "0.4rem", fontWeight: 500 };
const INP = { width: "100%", padding: "0.75rem 0.9rem", border: "1.5px solid #e2dfda", background: "#fff", fontSize: "0.9rem", fontFamily: "'Jost',sans-serif", color: "#080808", outline: "none", boxSizing: "border-box" };
const BTN = (c="black",s="md") => ({ padding: s==="sm"?"0.3rem 0.65rem":"0.55rem 1rem", fontSize: s==="sm"?"0.6rem":"0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", border: c==="outline"?"1.5px solid #e2dfda":"none", background: c==="black"?"#080808":c==="rosa"?"#c4748a":c==="red"?"#fff5f5":c==="green"?"#27ae60":"#fff", color: c==="black"||c==="rosa"||c==="green"?"#fff":c==="red"?"#e74c3c":"#080808", cursor: "pointer", fontFamily: "'Jost',sans-serif", fontWeight: 500 });
const BADGE = (c) => ({ display: "inline-block", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.2rem 0.5rem", fontWeight: 600, background: c==="green"?"#e8f5e9":c==="orange"?"#fff8e1":c==="red"?"#fff5f5":c==="rosa"?"#fff0f3":"#f0eeeb", color: c==="green"?"#27ae60":c==="orange"?"#f39c12":c==="red"?"#e74c3c":c==="rosa"?"#c4748a":"#888" });
const TH = { fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#888", fontWeight: 600, padding: "0.6rem 0.75rem", textAlign: "left", borderBottom: "2px solid #f0eeeb", whiteSpace: "nowrap" };
const TD = { fontSize: "0.85rem", padding: "0.85rem 0.75rem", borderBottom: "1px solid #f8f8f8", verticalAlign: "middle" };

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
  const [alugueres, setAlugueres] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteSel, setClienteSel] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [novaCampanha, setNovaCampanha] = useState({ titulo: "", mensagem: "", tipo: "cupao", codigo: "", desconto: "", probabilidade: 20, url_destino: "https://www.noragrei.com", validade: "" });
  const [estatisticas, setEstatisticas] = useState(null);
  const [aiChat, setAiChat] = useState([]);
  const [aiPergunta, setAiPergunta] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [config, setConfig] = useState({ higienizacao: 9, whatsapp: "", email_suporte: "" });
  const chatRef = useRef(null);

  const entrar = () => { if (senha === SENHA) { setLogado(true); setErroSenha(false); } else setErroSenha(true); };

  useEffect(() => { if (logado) carregarDados(); }, [logado, tab]);

  const carregarDados = async () => {
    if (tab === "dashboard") {
      const { data: al } = await supabase.from("alugueres").select("estado, valor_aluguer, created_at");
      const { data: res } = await supabase.from("reservas_espera").select("id").eq("estado", "aguarda");
      const { data: stock } = await supabase.from("stock_tamanhos").select("quantidade_total");
      if (al) {
        const agora = new Date(), inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
        const ativos = al.filter(a => a.estado === "ativo").length;
        const totalStock = stock?.reduce((s, t) => s + t.quantidade_total, 0) || 1;
        setStats({ alugueres_ativos: ativos, devolucoes_hoje: al.filter(a => a.estado === "devolvido" && new Date(a.created_at).toDateString() === agora.toDateString()).length, receita_mes: al.filter(a => a.created_at >= inicioMes).reduce((s, a) => s + (a.valor_aluguer || 0), 0), clientes_total: 0, reservas_espera: res?.length || 0, taxa_ocupacao: Math.round((ativos / totalStock) * 100) });
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
      if (data && data.length > 0) {
        setAlugueres(data);
      } else {
        // Fallback: query separada
        const { data: al } = await supabase.from("alugueres").select("*").order("created_at", { ascending: false }).limit(100);
        if (al) {
          const alComDados = await Promise.all(al.map(async (a) => {
            const { data: cl } = await supabase.from("clientes").select("nome, email, total_pecas_alugadas").eq("id", a.cliente_id).single();
            const { data: st } = await supabase.from("stock_tamanhos").select("tamanho, pecas(nome, valor_peca)").eq("id", a.stock_tamanho_id).single();
            return { ...a, clientes: cl, stock_tamanhos: st };
          }));
          setAlugueres(alComDados);
        }
      }
    }
    if (tab === "clientes") {
      const { data, error } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
      console.log("Clientes:", data, error);
      if (data) {
        // Buscar alugueres separadamente
        const clientesComAl = await Promise.all(data.map(async (c) => {
          const { data: al } = await supabase.from("alugueres").select("id, estado, created_at, valor_aluguer, data_inicio, data_fim, stock_tamanhos(tamanho, pecas(nome, fotos))").eq("cliente_id", c.id);
          return { ...c, alugueres: al || [] };
        }));
        setClientes(clientesComAl);
      }
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
    const al = alRes.data || [], pl = pecasRes.data || [], cl = clientesRes.data || [], rl = reservasRes.data || [];
    const roiPecas = pl.map(p => { const ap = al.filter(a => a.stock_tamanhos?.pecas?.id === p.id); const rec = ap.reduce((s, a) => s + (a.valor_aluguer || 0), 0); return { ...p, receitaGerada: rec, vezesAlugada: ap.length, roi: p.valor_peca > 0 ? ((rec/p.valor_peca)*100).toFixed(0) : 0, danificada: ap.filter(a => a.estado === "devolvido_danificado").length }; }).sort((a,b) => b.vezesAlugada - a.vezesAlugada);
    const pecasEspera = {}; rl.forEach(r => { const n = r.stock_tamanhos?.pecas?.nome || "—"; pecasEspera[n] = (pecasEspera[n]||0)+1; });
    const cidades = {}; al.forEach(a => { const c = a.clientes?.cidade || "Desconhecida"; cidades[c] = (cidades[c]||0)+1; });
    const catCount = {}; al.forEach(a => { const c = a.stock_tamanhos?.pecas?.categorias?.nome || "Outro"; catCount[c] = (catCount[c]||0)+1; });
    const clNivel = cl.map(c => { const comp = (c.alugueres||[]).filter(a => ["devolvido","devolvido_danificado"].includes(a.estado)).length; const tot = (c.alugueres||[]).filter(a => a.estado !== "cancelado").length; const gasto = (c.alugueres||[]).reduce((s,a) => s+(a.valor_aluguer||0),0); return { ...c, alugueresTotal: tot, alugueresCompletos: comp, totalGasto: gasto, nivel: NIVEL(comp) }; });
    const ltv = clNivel.reduce((s,c) => s+c.totalGasto,0) / (clNivel.length||1);
    setEstatisticas({ roiPecas, pecasEspera, cidades, catCount, clientesMaisAtivos: [...clNivel].sort((a,b) => b.alugueresTotal-a.alugueresTotal).slice(0,5), taxaCancelamento: al.length > 0 ? ((al.filter(a => a.estado==="cancelado").length/al.length)*100).toFixed(1) : 0, ltv, churn: clNivel.filter(c => c.alugueresTotal===1).length, totalReceita: al.reduce((s,a) => s+(a.valor_aluguer||0),0), totalAlugueres: al.length, pecaMaisAlugada: roiPecas[0]?.nome || "—", pecaMenosAlugada: [...roiPecas].reverse()[0]?.nome || "—" });
  };

  const perguntarAI = async () => {
    if (!aiPergunta.trim() || !estatisticas) return;
    const pergunta = aiPergunta; setAiPergunta(""); setAiLoading(true);
    setAiChat(prev => [...prev, { role: "user", content: pergunta }]);
    const ctx = `És consultor de negócios de moda e aluguer de roupa de luxo. Dados Nora Grei: Total alugueres:${estatisticas.totalAlugueres}, Receita:${estatisticas.totalReceita.toFixed(0)}€, LTV:${estatisticas.ltv.toFixed(0)}€, Cancelamentos:${estatisticas.taxaCancelamento}%, Churn:${estatisticas.churn}. Clientes ativos:${estatisticas.clientesMaisAtivos.map(c=>`${c.nome}(${c.alugueresTotal}x)`).join(",")}. Categorias:${Object.entries(estatisticas.catCount).map(([k,v])=>`${k}:${v}`).join(",")}. Responde em português, conciso e útil.`;
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: ctx, messages: [{ role: "user", content: pergunta }] }) });
      const data = await resp.json();
      setAiChat(prev => [...prev, { role: "assistant", content: data.content?.[0]?.text || "Erro." }]);
    } catch { setAiChat(prev => [...prev, { role: "assistant", content: "Erro de ligação." }]); }
    setAiLoading(false);
    setTimeout(() => chatRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 100);
  };

  const criarPeca = async () => {
    if (!novaPeca.nome || !novaPeca.preco_aluguer_dia) { alert("Nome e preço são obrigatórios"); return; }
    setCriandoPeca(true); setUploadProgress("A criar peça...");
    const { data: pc, error } = await supabase.from("pecas").insert({ nome: novaPeca.nome, categoria_id: novaPeca.categoria_id||null, preco_aluguer_dia: parseFloat(novaPeca.preco_aluguer_dia), preco_avulso: parseFloat(novaPeca.preco_avulso)||null, valor_peca: parseFloat(novaPeca.valor_peca)||0, descricao: novaPeca.descricao, material: novaPeca.material, origem: novaPeca.origem, destaque: novaPeca.destaque, ocasioes: novaPeca.ocasioes, estado: "disponivel" }).select().single();
    if (error) { setUploadProgress("❌ " + error.message); setCriandoPeca(false); return; }
    for (const t of novaPeca.tamanhos) { if (t.tamanho) await supabase.from("stock_tamanhos").insert({ peca_id: pc.id, tamanho: t.tamanho, quantidade_total: parseInt(t.quantidade_total)||1, quantidade_disponivel: parseInt(t.quantidade_total)||1 }); }
    if (fotosUpload.length > 0) {
      const urls = [];
      for (const foto of fotosUpload) { const ext = foto.name.split(".").pop(); const path = `${pc.id}/${Date.now()}.${ext}`; setUploadProgress(`A fazer upload de ${foto.name}...`); const { error: upErr } = await supabase.storage.from("pecas").upload(path, foto, { upsert: true }); if (!upErr) { const { data } = supabase.storage.from("pecas").getPublicUrl(path); urls.push(data.publicUrl); } }
      if (urls.length > 0) { await supabase.from("pecas").update({ fotos: urls }).eq("id", pc.id); setUploadProgress(`✓ ${urls.length} foto(s) guardada(s)!`); }
    } else { setUploadProgress("✓ Peça criada!"); }
    setNovaPeca({ nome: "", categoria_id: "", preco_aluguer_dia: "", preco_avulso: "", valor_peca: "", descricao: "", material: "", origem: "Portugal", destaque: false, ocasioes: [], tamanhos: [{ tamanho: "M", quantidade_total: 1 }] });
    setFotosUpload([]); setCriandoPeca(false);
    setTimeout(() => setUploadProgress(""), 4000);
    carregarDados();
  };

  const atualizarEstado = async (id, estado) => { await supabase.from("alugueres").update({ estado }).eq("id", id); carregarDados(); };
  const confirmarDeposito = async (id) => { await supabase.from("alugueres").update({ deposito_estado: "recebido", deposito_confirmado_em: new Date().toISOString() }).eq("id", id); carregarDados(); };
  const confirmarRecepcao = async (id) => { await supabase.from("alugueres").update({ estado: "em_verificacao", data_recepcao: new Date().toISOString() }).eq("id", id); carregarDados(); };
  const confirmarVerificacao = async (id, danificado=false) => { await supabase.from("alugueres").update({ estado: danificado?"devolvido_danificado":"devolvido", data_verificacao: new Date().toISOString() }).eq("id", id); carregarDados(); };
  const libertarCaucao = async (id) => { await supabase.from("alugueres").update({ deposito_estado: "libertado", caucao_libertada_em: new Date().toISOString() }).eq("id", id); carregarDados(); };
  const calcularAtraso = (dataFim) => { if (!dataFim) return 0; const diff = Math.floor((new Date()-new Date(dataFim))/86400000); return diff>0?diff:0; };

  const criarCampanha = async () => {
    if (!novaCampanha.titulo || !novaCampanha.mensagem) { alert("Título e mensagem obrigatórios"); return; }
    const { error } = await supabase.from("campanhas").insert({ ...novaCampanha, probabilidade: parseInt(novaCampanha.probabilidade), codigo: novaCampanha.codigo||null, desconto: novaCampanha.desconto||null, validade: novaCampanha.validade||null, ativa: true });
    if (error) { alert("Erro: " + error.message); return; }
    setNovaCampanha({ titulo: "", mensagem: "", tipo: "cupao", codigo: "", desconto: "", probabilidade: 20, url_destino: "https://www.noragrei.com", validade: "" });
    carregarDados();
  };

  if (!logado) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0eeeb", fontFamily: "'Jost',sans-serif" }}>
      <div style={{ background: "#fff", padding: "3rem", width: "340px", textAlign: "center", boxShadow: "0 4px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ fontFamily: "'Cormorant',serif", fontSize: "1.8rem", fontWeight: 300, letterSpacing: "0.25em", textTransform: "uppercase" }}>Nora Grei</div>
        <div style={{ fontSize: "0.55rem", letterSpacing: "0.35em", color: "#999", textTransform: "uppercase", marginBottom: "2rem", marginTop: "0.3rem" }}>Backoffice</div>
        <input type="password" placeholder="Password" value={senha} onChange={e => { setSenha(e.target.value); setErroSenha(false); }} onKeyDown={e => e.key==="Enter"&&entrar()} autoFocus style={{ ...INP, marginBottom: "0.75rem", border: erroSenha?"1.5px solid #e74c3c":"1.5px solid #e2dfda" }} />
        {erroSenha && <div style={{ fontSize: "0.72rem", color: "#e74c3c", marginBottom: "0.75rem" }}>Password incorreta</div>}
        <button onClick={entrar} style={{ width: "100%", padding: "0.9rem", background: "#080808", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Jost',sans-serif", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Entrar</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f3", fontFamily: "'Jost',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      {/* TOP NAV */}
      <div style={{ background: "#080808", color: "#fff", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", gap: "0" }}>
          <div style={{ fontFamily: "'Cormorant',serif", fontSize: "1.1rem", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", padding: "1rem 2rem 1rem 0", borderRight: "1px solid rgba(255,255,255,0.1)", marginRight: "1rem", whiteSpace: "nowrap" }}>Nora Grei</div>
          <div style={{ display: "flex", overflowX: "auto", gap: 0 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "1rem 1.25rem", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: tab===t?"#fff":"rgba(255,255,255,0.5)", background: tab===t?"rgba(255,255,255,0.1)":"none", border: "none", borderBottom: tab===t?"2px solid #c4748a":"2px solid transparent", cursor: "pointer", fontFamily: "'Jost',sans-serif", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", paddingLeft: "1rem" }}>
            <button onClick={() => setLogado(false)} style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Jost',sans-serif" }}>Sair</button>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem" }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <>
            <h1 style={{ fontFamily: "'Cormorant',serif", fontSize: "2rem", fontWeight: 300, marginBottom: "0.25rem" }}>Dashboard</h1>
            <p style={{ fontSize: "0.82rem", color: "#888", marginBottom: "2rem" }}>Resumo do negócio em tempo real</p>
            <div style={COL4}>
              {[{val:stats.alugueres_ativos,lbl:"Alugueres ativos",cor:"#c4748a"},{val:`${Number(stats.receita_mes).toFixed(0)}€`,lbl:"Receita este mês"},{val:stats.clientes_total,lbl:"Clientes total"},{val:stats.reservas_espera,lbl:"Reservas em espera"}].map((s,i) => (
                <div key={i} style={{ background:"#fff",padding:"1.5rem",borderTop:`3px solid ${s.cor||"#080808"}` }}>
                  <div style={{ fontFamily:"'Cormorant',serif",fontSize:"2.2rem",fontWeight:300,color:s.cor||"#080808",lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:"0.62rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#888",marginTop:"0.5rem" }}>{s.lbl}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginTop:"1rem",marginBottom:"2rem" }}>
              <div style={{ background:"#fff",padding:"1.5rem",borderTop:"3px solid #080808" }}>
                <div style={{ fontFamily:"'Cormorant',serif",fontSize:"2rem",fontWeight:300 }}>{stats.taxa_ocupacao}%</div>
                <div style={{ fontSize:"0.62rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#888",marginTop:"0.5rem" }}>Taxa de ocupação</div>
              </div>
              <div style={{ background:"#fff",padding:"1.5rem",borderTop:"3px solid #c4748a",cursor:"pointer" }} onClick={() => setTab("estatisticas")}>
                <div style={{ fontSize:"1.5rem" }}>📊</div>
                <div style={{ fontSize:"0.62rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#888",marginTop:"0.5rem" }}>Ver Analytics & AI →</div>
              </div>
            </div>
            <div style={CARD}>
              <p style={CARD_T}>Ações rápidas</p>
              <div style={ROW}>
                {[["+ Adicionar peça","black","catalogo"],["Ver alugueres","rosa","alugueres"],["Ver clientes","outline","clientes"],["Ver reservas","outline","reservas"],["📊 Analytics","outline","estatisticas"]].map(([l,c,t]) => (
                  <button key={l} style={BTN(c)} onClick={() => setTab(t)}>{l}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CATÁLOGO */}
        {tab === "catalogo" && (
          <>
            <h1 style={{ fontFamily:"'Cormorant',serif",fontSize:"2rem",fontWeight:300,marginBottom:"0.25rem" }}>Catálogo</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>{pecas.length} peças</p>

            <div style={CARD}>
              <p style={CARD_T}>Adicionar nova peça</p>
              <div style={COL2}>
                <div><label style={LBL}>Nome *</label><input style={INP} value={novaPeca.nome} onChange={e => setNovaPeca(p=>({...p,nome:e.target.value}))} placeholder="Vestido Seda Noite" /></div>
                <div><label style={LBL}>Categoria</label>
                  <select style={INP} value={novaPeca.categoria_id} onChange={e => setNovaPeca(p=>({...p,categoria_id:e.target.value}))}>
                    <option value="">Selecionar</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div><label style={LBL}>Preço aluguer/dia (€) *</label><input style={INP} type="number" value={novaPeca.preco_aluguer_dia} onChange={e => setNovaPeca(p=>({...p,preco_aluguer_dia:e.target.value}))} placeholder="35" /></div>
                <div><label style={LBL}>Preço por ocasião (€)</label><input style={INP} type="number" value={novaPeca.preco_avulso} onChange={e => setNovaPeca(p=>({...p,preco_avulso:e.target.value}))} placeholder="89" /></div>
                <div><label style={LBL}>Valor peça (€) — caução base</label><input style={INP} type="number" value={novaPeca.valor_peca} onChange={e => setNovaPeca(p=>({...p,valor_peca:e.target.value}))} placeholder="450" /></div>
                <div><label style={LBL}>Material</label><input style={INP} value={novaPeca.material} onChange={e => setNovaPeca(p=>({...p,material:e.target.value}))} placeholder="100% Seda natural" /></div>
                <div><label style={LBL}>Origem</label><input style={INP} value={novaPeca.origem} onChange={e => setNovaPeca(p=>({...p,origem:e.target.value}))} /></div>
                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",paddingTop:"1.5rem" }}>
                  <input type="checkbox" id="dest" checked={novaPeca.destaque} onChange={e => setNovaPeca(p=>({...p,destaque:e.target.checked}))} />
                  <label htmlFor="dest" style={{ ...LBL,marginBottom:0 }}>Em destaque</label>
                </div>
                <div style={{ gridColumn:"1/-1" }}><label style={LBL}>Descrição</label><textarea style={{ ...INP,resize:"vertical",minHeight:"80px" }} value={novaPeca.descricao} onChange={e => setNovaPeca(p=>({...p,descricao:e.target.value}))} /></div>
              </div>

              <div style={{ marginBottom:"1.25rem" }}>
                <label style={LBL}>Ocasiões</label>
                <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap",marginTop:"0.5rem" }}>
                  {OCASIOES.map(o => (
                    <button key={o} type="button" onClick={() => setNovaPeca(p=>({...p,ocasioes:p.ocasioes.includes(o)?p.ocasioes.filter(x=>x!==o):[...p.ocasioes,o]}))}
                      style={{ fontSize:"0.68rem",padding:"0.4rem 0.75rem",border:`1.5px solid ${novaPeca.ocasioes.includes(o)?"#080808":"#e2dfda"}`,background:novaPeca.ocasioes.includes(o)?"#080808":"#fff",color:novaPeca.ocasioes.includes(o)?"#fff":"#080808",cursor:"pointer",fontFamily:"'Jost',sans-serif",transition:"all 0.15s" }}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:"1.25rem" }}>
                <label style={LBL}>Tamanhos & stock</label>
                {novaPeca.tamanhos.map((t,i) => (
                  <div key={i} style={{ display:"flex",gap:"0.75rem",alignItems:"center",marginBottom:"0.5rem" }}>
                    <select style={{ ...INP,width:"130px" }} value={t.tamanho} onChange={e => { const ts=[...novaPeca.tamanhos]; ts[i].tamanho=e.target.value; setNovaPeca(p=>({...p,tamanhos:ts})); }}>
                      <option value="">Tamanho</option>
                      {TAMANHOS.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                    </select>
                    <input style={{ ...INP,width:"100px" }} type="number" min="1" value={t.quantidade_total} placeholder="Qtd" onChange={e => { const ts=[...novaPeca.tamanhos]; ts[i].quantidade_total=e.target.value; setNovaPeca(p=>({...p,tamanhos:ts})); }} />
                    {novaPeca.tamanhos.length > 1 && <button type="button" onClick={() => setNovaPeca(p=>({...p,tamanhos:p.tamanhos.filter((_,j)=>j!==i)}))} style={{ background:"none",border:"none",cursor:"pointer",color:"#e74c3c",fontSize:"1.2rem" }}>✕</button>}
                  </div>
                ))}
                <button type="button" style={BTN("outline","sm")} onClick={() => setNovaPeca(p=>({...p,tamanhos:[...p.tamanhos,{tamanho:"",quantidade_total:1}]}))}>+ Tamanho</button>
              </div>

              <div style={{ marginBottom:"1rem" }}>
                <label style={LBL}>Fotos</label>
                <label style={{ display:"block",padding:"1.5rem",border:"2px dashed #e2dfda",background:"#f8f8f6",cursor:"pointer",textAlign:"center",transition:"border-color 0.2s" }}>
                  <input type="file" accept="image/*" multiple onChange={e => setFotosUpload(Array.from(e.target.files))} style={{ display:"none" }} />
                  {fotosUpload.length===0 ? <div><div style={{ fontSize:"2rem" }}>📷</div><div style={{ fontSize:"0.82rem",color:"#888",marginTop:"0.4rem" }}>Clica para selecionar fotos</div></div>
                    : <div style={{ color:"#27ae60",fontWeight:500 }}>{fotosUpload.length} foto(s): {fotosUpload.map(f=>f.name).join(", ")}</div>}
                </label>
                {fotosUpload.length > 0 && <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap",marginTop:"0.75rem" }}>{fotosUpload.map((f,i) => <img key={i} src={URL.createObjectURL(f)} alt="" style={{ width:60,height:60,objectFit:"cover",border:"1px solid #e2dfda" }} />)}</div>}
                {uploadProgress && <p style={{ fontSize:"0.78rem",color:uploadProgress.startsWith("✓")?"#27ae60":uploadProgress.startsWith("❌")?"#e74c3c":"#c4748a",marginTop:"0.5rem",fontWeight:500 }}>{uploadProgress}</p>}
              </div>

              <button style={{ ...BTN("black"),opacity:criandoPeca?0.6:1 }} onClick={criarPeca} disabled={criandoPeca}>{criandoPeca?"A criar...":"+ Adicionar peça"}</button>
            </div>

            <div style={CARD}>
              <p style={CARD_T}>Peças ({pecas.length})</p>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead><tr>{["Foto","Peça","Cat.","€/dia","Ocasiões","Tamanhos","Estado","Ações"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {pecas.map(p => (
                      <tr key={p.id} style={{ background:"#fff" }}>
                        <td style={TD}>{p.fotos?.length>0?<img src={p.fotos[0]} alt="" style={{ width:48,height:60,objectFit:"cover" }}/>:<div style={{ width:48,height:60,background:"#f0eeeb",display:"flex",alignItems:"center",justifyContent:"center",color:"#ccc" }}>📷</div>}</td>
                        <td style={TD}><div style={{ fontWeight:600 }}>{p.nome}</div>{p.destaque&&<span style={{ fontSize:"0.6rem",background:"#fff0f3",color:"#c4748a",padding:"0.1rem 0.4rem" }}>★ DESTAQUE</span>}</td>
                        <td style={TD}>{p.categorias?.nome||"—"}</td>
                        <td style={TD}>{p.preco_aluguer_dia}€{p.preco_avulso?<div style={{ fontSize:"0.72rem",color:"#888" }}>{p.preco_avulso}€/oc.</div>:null}</td>
                        <td style={{ ...TD,maxWidth:120 }}><div style={{ fontSize:"0.72rem",color:"#888" }}>{(p.ocasioes||[]).slice(0,3).join(", ")||"—"}</div></td>
                        <td style={TD}><div style={{ fontSize:"0.75rem" }}>{p.stock_tamanhos?.map(s=>`${s.tamanho}(${s.quantidade_disponivel}/${s.quantidade_total})`).join(", ")||"—"}</div></td>
                        <td style={TD}><span style={BADGE(p.estado==="disponivel"?"green":"gray")}>{p.estado}</span></td>
                        <td style={TD}>
                          <div style={{ display:"flex",gap:"0.4rem",flexWrap:"wrap" }}>
                            <button style={BTN("outline","sm")} onClick={async()=>{ await supabase.from("pecas").update({estado:p.estado==="disponivel"?"indisponivel":"disponivel"}).eq("id",p.id); carregarDados(); }}>{p.estado==="disponivel"?"Desativar":"Ativar"}</button>
                            <button style={BTN("red","sm")} onClick={async()=>{ if(confirm("Apagar?")){ await supabase.from("pecas").delete().eq("id",p.id); carregarDados(); } }}>Apagar</button>
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

        {/* ALUGUERES */}
        {tab === "alugueres" && (
          <>
            <h1 style={{ fontFamily:"'Cormorant',serif",fontSize:"2rem",fontWeight:300,marginBottom:"0.25rem" }}>Alugueres</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>{alugueres.length} registados</p>
            <div style={CARD}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead><tr>{["Cliente","Peça","Datas","Atraso","Valor","Depósito","Estado","Ações"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {alugueres.map(a => {
                      const nv = NIVEL(a.clientes?.total_pecas_alugadas||0);
                      const atraso = calcularAtraso(a.data_fim);
                      return (
                        <tr key={a.id} style={{ background:"#fff" }}>
                          <td style={TD}>
                            <div style={{ fontWeight:600 }}>{a.clientes?.nome||"—"}</div>
                            <div style={{ fontSize:"0.75rem",color:"#888" }}>{a.clientes?.email}</div>
                            <span style={{ ...BADGE(""),background:nv.cor+"22",color:nv.cor,marginTop:"0.2rem",display:"inline-block" }}>{nv.icon} {nv.nome}</span>
                          </td>
                          <td style={TD}><div>{a.stock_tamanhos?.pecas?.nome||"—"}</div><div style={{ fontSize:"0.75rem",color:"#888" }}>Tam: {a.stock_tamanhos?.tamanho}</div></td>
                          <td style={{ ...TD,whiteSpace:"nowrap" }}>{a.data_inicio} → {a.data_fim}</td>
                          <td style={TD}>{atraso>0?<span style={{ color:"#e74c3c",fontWeight:700 }}>+{atraso}d</span>:<span style={{ color:"#27ae60" }}>✓</span>}</td>
                          <td style={TD}><strong>{a.valor_aluguer}€</strong></td>
                          <td style={TD}>
                            <span style={BADGE(a.deposito_estado==="recebido"||a.deposito_estado==="libertado"?"green":"orange")}>{a.deposito_estado}</span>
                            {a.deposito_estado==="pendente"&&<button style={{ ...BTN("rosa","sm"),display:"block",marginTop:"0.25rem" }} onClick={()=>confirmarDeposito(a.id)}>Confirmar</button>}
                          </td>
                          <td style={TD}>
                            <select value={a.estado} onChange={e=>atualizarEstado(a.id,e.target.value)} style={{ fontSize:"0.65rem",padding:"0.35rem 0.5rem",border:"1px solid #e2dfda",background:"#fff",fontFamily:"'Jost',sans-serif",cursor:"pointer" }}>
                              {["pendente","confirmado","enviado","ativo","em_verificacao","devolvido","devolvido_danificado","nao_devolvido","cancelado"].map(s=><option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td style={TD}>
                            <div style={{ display:"flex",flexDirection:"column",gap:"0.3rem" }}>
                              {a.estado==="ativo"&&<button style={BTN("rosa","sm")} onClick={()=>confirmarRecepcao(a.id)}>📦 Recebi</button>}
                              {a.estado==="em_verificacao"&&<><button style={BTN("black","sm")} onClick={()=>confirmarVerificacao(a.id,false)}>✓ OK</button><button style={BTN("red","sm")} onClick={()=>confirmarVerificacao(a.id,true)}>✗ Dano</button></>}
                              {a.estado==="devolvido"&&a.deposito_estado!=="libertado"&&<button style={BTN("outline","sm")} onClick={()=>libertarCaucao(a.id)}>💰 Libertar</button>}
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

        {/* CLIENTES */}
        {tab === "clientes" && (
          <>
            <h1 style={{ fontFamily:"'Cormorant',serif",fontSize:"2rem",fontWeight:300,marginBottom:"0.25rem" }}>Clientes</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>{clientes.length} registados</p>
            <div style={CARD}>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead><tr>{["Cliente","Contacto","Cidade","Nível","Alugueres","Gasto","Caução",""].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {clientes.map(c => {
                    const al = c.alugueres||[];
                    const total = al.filter(a=>a.estado!=="cancelado").length;
                    const comp = al.filter(a=>["devolvido","devolvido_danificado"].includes(a.estado)).length;
                    const gasto = al.reduce((s,a)=>s+(a.valor_aluguer||0),0);
                    const nv = NIVEL(comp);
                    return (
                      <tr key={c.id} style={{ background:"#fff" }}>
                        <td style={TD}><div style={{ fontWeight:600 }}>{c.nome||"—"}</div><div style={{ fontSize:"0.72rem",color:"#888" }}>{c.email}</div></td>
                        <td style={TD}><div style={{ fontSize:"0.82rem" }}>{c.telefone||"—"}</div><div style={{ fontSize:"0.72rem",color:"#888" }}>{c.nif?"NIF: "+c.nif:""}</div></td>
                        <td style={TD}>{c.cidade||"—"}</td>
                        <td style={TD}>
                          <span style={{ ...BADGE(""),background:nv.cor+"22",color:nv.cor }}>{nv.icon} {nv.nome}</span>
                          <div style={{ fontSize:"0.68rem",color:"#888",marginTop:"0.2rem" }}>{comp<5?`${5-comp}→Prata`:comp<10?`${10-comp}→Ouro`:comp<20?`${20-comp}→Platina`:"Platina ✓"}</div>
                        </td>
                        <td style={TD}><span style={BADGE("rosa")}>{total} pts</span></td>
                        <td style={TD}><strong>{gasto.toFixed(0)}€</strong></td>
                        <td style={{ ...TD,color:nv.cor,fontWeight:700 }}>{nv.caucao}%</td>
                        <td style={TD}><button style={BTN("outline","sm")} onClick={()=>setClienteSel(clienteSel?.id===c.id?null:c)}>{clienteSel?.id===c.id?"Fechar":"Ver"}</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {clienteSel && (
              <div style={CARD}>
                <p style={CARD_T}>Perfil — {clienteSel.nome}</p>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"1.5rem" }}>
                  {[["Email",clienteSel.email],["Telefone",clienteSel.telefone||"—"],["NIF",clienteSel.nif||"—"],["Cidade",clienteSel.cidade||"—"],["País",clienteSel.pais||"—"],["Membro desde",new Date(clienteSel.created_at).toLocaleDateString("pt-PT")],["Género",clienteSel.genero||"—"],["Código postal",clienteSel.codigo_postal||"—"]].map(([k,v])=>(
                    <div key={k} style={{ background:"#f8f8f6",padding:"1rem" }}>
                      <div style={{ fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#888",marginBottom:"0.3rem" }}>{k}</div>
                      <div style={{ fontSize:"0.9rem",fontWeight:500 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <p style={CARD_T}>Histórico de alugueres</p>
                {(clienteSel.alugueres||[]).length===0?<p style={{ color:"#888",fontSize:"0.85rem" }}>Sem alugueres</p>:(
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <thead><tr>{["Foto","Peça","Tam.","Datas","Valor","Estado"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(clienteSel.alugueres||[]).map(a=>(
                        <tr key={a.id} style={{ background:"#fff" }}>
                          <td style={TD}>{a.stock_tamanhos?.pecas?.fotos?.[0]?<img src={a.stock_tamanhos.pecas.fotos[0]} alt="" style={{ width:32,height:40,objectFit:"cover" }}/>:<div style={{ width:32,height:40,background:"#f0eeeb" }}/>}</td>
                          <td style={TD}>{a.stock_tamanhos?.pecas?.nome||"—"}</td>
                          <td style={TD}>{a.stock_tamanhos?.tamanho||"—"}</td>
                          <td style={{ ...TD,whiteSpace:"nowrap",fontSize:"0.8rem" }}>{a.data_inicio} → {a.data_fim}</td>
                          <td style={TD}><strong>{a.valor_aluguer}€</strong></td>
                          <td style={TD}><span style={BADGE(a.estado==="devolvido"?"green":a.estado==="ativo"?"orange":"gray")}>{a.estado}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}

        {/* RESERVAS */}
        {tab === "reservas" && (
          <>
            <h1 style={{ fontFamily:"'Cormorant',serif",fontSize:"2rem",fontWeight:300,marginBottom:"0.25rem" }}>Reservas em espera</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>{reservas.length} pendentes</p>
            <div style={CARD}>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead><tr>{["Cliente","Peça","Datas desejadas","Estado","Ações"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {reservas.length===0?<tr><td colSpan={5} style={{ textAlign:"center",color:"#888",padding:"2rem",fontSize:"0.85rem" }}>Sem reservas em espera</td></tr>
                    :reservas.map(r=>(
                      <tr key={r.id} style={{ background:"#fff" }}>
                        <td style={TD}><div style={{ fontWeight:600 }}>{r.clientes?.nome||"—"}</div><div style={{ fontSize:"0.75rem",color:"#888" }}>{r.clientes?.email}</div></td>
                        <td style={TD}><div>{r.stock_tamanhos?.pecas?.nome||"—"}</div><div style={{ fontSize:"0.75rem",color:"#888" }}>Tam: {r.stock_tamanhos?.tamanho}</div></td>
                        <td style={{ ...TD,whiteSpace:"nowrap" }}>{r.data_inicio_desejada} → {r.data_fim_desejada}</td>
                        <td style={TD}><span style={BADGE(r.estado==="aguarda"?"orange":"green")}>{r.estado}</span></td>
                        <td style={TD}>{r.estado==="aguarda"&&<button style={BTN("rosa","sm")} onClick={async()=>{ await supabase.from("reservas_espera").update({estado:"notificado",notificado_em:new Date().toISOString()}).eq("id",r.id); carregarDados(); }}>Notificar</button>}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* CAMPANHAS */}
        {tab === "campanhas" && (
          <>
            <h1 style={{ fontFamily:"'Cormorant',serif",fontSize:"2rem",fontWeight:300,marginBottom:"0.25rem" }}>Campanhas</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>Alertas e cupões para clientes</p>
            <div style={CARD}>
              <p style={CARD_T}>Nova campanha</p>
              <div style={COL2}>
                <div><label style={LBL}>Título *</label><input style={INP} value={novaCampanha.titulo} onChange={e=>setNovaCampanha(p=>({...p,titulo:e.target.value}))} placeholder="É o teu dia de sorte!" /></div>
                <div><label style={LBL}>Tipo</label>
                  <select style={INP} value={novaCampanha.tipo} onChange={e=>setNovaCampanha(p=>({...p,tipo:e.target.value}))}>
                    <option value="cupao">Cupão de desconto</option>
                    <option value="novidade">Novidade de produto</option>
                    <option value="oferta">Oferta especial</option>
                  </select>
                </div>
                <div style={{ gridColumn:"1/-1" }}><label style={LBL}>Mensagem *</label><textarea style={{ ...INP,resize:"vertical",minHeight:"80px" }} value={novaCampanha.mensagem} onChange={e=>setNovaCampanha(p=>({...p,mensagem:e.target.value}))} /></div>
                <div><label style={LBL}>Código desconto</label><input style={INP} value={novaCampanha.codigo} onChange={e=>setNovaCampanha(p=>({...p,codigo:e.target.value}))} placeholder="NORA15" /></div>
                <div><label style={LBL}>Descrição desconto</label><input style={INP} value={novaCampanha.desconto} onChange={e=>setNovaCampanha(p=>({...p,desconto:e.target.value}))} placeholder="15% em toda a loja" /></div>
                <div><label style={LBL}>Probabilidade (%)</label><input style={INP} type="number" min="1" max="100" value={novaCampanha.probabilidade} onChange={e=>setNovaCampanha(p=>({...p,probabilidade:e.target.value}))} /></div>
                <div><label style={LBL}>Validade (opcional)</label><input style={INP} type="datetime-local" value={novaCampanha.validade} onChange={e=>setNovaCampanha(p=>({...p,validade:e.target.value}))} /></div>
                <div style={{ gridColumn:"1/-1" }}><label style={LBL}>URL destino</label><input style={INP} value={novaCampanha.url_destino} onChange={e=>setNovaCampanha(p=>({...p,url_destino:e.target.value}))} /></div>
              </div>
              <button style={BTN("rosa")} onClick={criarCampanha}>✉ Criar campanha</button>
            </div>

            <div style={CARD}>
              <p style={CARD_T}>{campanhas.length} campanhas</p>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead><tr>{["Título / Mensagem","Tipo","Código","Prob.","Validade","Estado","Ações"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {campanhas.length===0?<tr><td colSpan={7} style={{ textAlign:"center",color:"#888",padding:"2rem",fontSize:"0.85rem" }}>Sem campanhas</td></tr>
                    :campanhas.map(c=>(
                      <tr key={c.id} style={{ background:"#fff" }}>
                        <td style={TD}><div style={{ fontWeight:600 }}>{c.titulo}</div><div style={{ fontSize:"0.75rem",color:"#888",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.mensagem}</div></td>
                        <td style={TD}><span style={BADGE(c.tipo==="cupao"?"rosa":"green")}>{c.tipo}</span></td>
                        <td style={{ ...TD,fontWeight:700,letterSpacing:"0.1em" }}>{c.codigo||"—"}</td>
                        <td style={TD}>{c.probabilidade}%</td>
                        <td style={{ ...TD,fontSize:"0.8rem" }}>{c.validade?new Date(c.validade).toLocaleDateString("pt-PT"):"Sem limite"}</td>
                        <td style={TD}><span style={BADGE(c.ativa?"green":"gray")}>{c.ativa?"Ativa":"Inativa"}</span></td>
                        <td style={TD}>
                          <div style={{ display:"flex",gap:"0.4rem" }}>
                            <button style={BTN(c.ativa?"outline":"rosa","sm")} onClick={async()=>{ await supabase.from("campanhas").update({ativa:!c.ativa}).eq("id",c.id); carregarDados(); }}>{c.ativa?"Pausar":"Ativar"}</button>
                            <button style={BTN("red","sm")} onClick={async()=>{ if(confirm("Apagar?")){ await supabase.from("campanhas").delete().eq("id",c.id); carregarDados(); } }}>Apagar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ESTATÍSTICAS */}
        {tab === "estatisticas" && (
          <>
            <h1 style={{ fontFamily:"'Cormorant',serif",fontSize:"2rem",fontWeight:300,marginBottom:"0.25rem" }}>Estatísticas & AI</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>Analytics completo + consultor inteligente</p>
            {!estatisticas?<div style={{ textAlign:"center",padding:"3rem",color:"#888" }}>A carregar dados...</div>:(
              <>
                <div style={COL4}>
                  {[{val:`${estatisticas.totalReceita.toFixed(0)}€`,lbl:"Receita total",cor:"#c4748a"},{val:estatisticas.totalAlugueres,lbl:"Total alugueres"},{val:`${estatisticas.ltv.toFixed(0)}€`,lbl:"LTV médio"},{val:`${estatisticas.taxaCancelamento}%`,lbl:"Taxa cancelamento"}].map((s,i)=>(
                    <div key={i} style={{ background:"#fff",padding:"1.5rem",borderTop:`3px solid ${s.cor||"#080808"}` }}>
                      <div style={{ fontFamily:"'Cormorant',serif",fontSize:"2rem",fontWeight:300,color:s.cor||"#080808" }}>{s.val}</div>
                      <div style={{ fontSize:"0.62rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"#888",marginTop:"0.5rem" }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",marginTop:"1rem" }}>
                  <div style={CARD}>
                    <p style={CARD_T}>Categorias mais alugadas</p>
                    {Object.entries(estatisticas.catCount).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>{
                      const max = Math.max(...Object.values(estatisticas.catCount));
                      return (<div key={cat} style={{ marginBottom:"0.75rem" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",marginBottom:"0.25rem" }}><span>{cat}</span><strong>{count}</strong></div>
                        <div style={{ height:6,background:"#f0eeeb",borderRadius:3 }}><div style={{ height:"100%",width:`${(count/max)*100}%`,background:"#c4748a",borderRadius:3 }}/></div>
                      </div>);
                    })}
                  </div>
                  <div style={CARD}>
                    <p style={CARD_T}>Cidades</p>
                    {Object.entries(estatisticas.cidades).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([cidade,count])=>{
                      const max = Math.max(...Object.values(estatisticas.cidades));
                      return (<div key={cidade} style={{ marginBottom:"0.75rem" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"0.85rem",marginBottom:"0.25rem" }}><span>{cidade}</span><strong>{count}</strong></div>
                        <div style={{ height:6,background:"#f0eeeb",borderRadius:3 }}><div style={{ height:"100%",width:`${(count/max)*100}%`,background:"#080808",borderRadius:3 }}/></div>
                      </div>);
                    })}
                  </div>
                </div>
                <div style={{ ...CARD,marginTop:"1rem" }}>
                  <p style={CARD_T}>ROI por peça</p>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%",borderCollapse:"collapse" }}>
                      <thead><tr>{["Peça","Valor peça","Vezes","Receita","ROI","Danos","Break-even"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                      <tbody>
                        {estatisticas.roiPecas.map(p=>(
                          <tr key={p.id} style={{ background:"#fff" }}>
                            <td style={TD}><strong>{p.nome}</strong></td>
                            <td style={TD}>{p.valor_peca}€</td>
                            <td style={TD}>{p.vezesAlugada}x</td>
                            <td style={{ ...TD,color:"#27ae60",fontWeight:600 }}>{p.receitaGerada.toFixed(0)}€</td>
                            <td style={TD}><span style={{ color:p.roi>=100?"#27ae60":p.roi>=50?"#f39c12":"#e74c3c",fontWeight:700 }}>{p.roi}%</span></td>
                            <td style={TD}>{p.danificada>0?<span style={{ color:"#e74c3c" }}>{p.danificada}x</span>:<span style={{ color:"#27ae60" }}>0</span>}</td>
                            <td style={{ ...TD,color:"#888" }}>{p.preco_aluguer_dia>0?`${Math.ceil(p.valor_peca/p.preco_aluguer_dia)} dias`:"—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginTop:"1rem" }}>
                  <div style={CARD}>
                    <p style={CARD_T}>Clientes mais ativos</p>
                    {estatisticas.clientesMaisAtivos.map((c,i)=>(
                      <div key={c.id} style={{ display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem 0",borderBottom:"1px solid #f8f8f6" }}>
                        <div style={{ fontSize:"1.2rem",width:30 }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</div>
                        <div style={{ flex:1 }}><div style={{ fontWeight:600,fontSize:"0.88rem" }}>{c.nome}</div><div style={{ fontSize:"0.75rem",color:"#888" }}>{c.alugueresTotal}x · {c.totalGasto.toFixed(0)}€</div></div>
                        <span style={{ ...BADGE(""),background:c.nivel.cor+"22",color:c.nivel.cor }}>{c.nivel.icon} {c.nivel.nome}</span>
                      </div>
                    ))}
                  </div>
                  <div style={CARD}>
                    <p style={CARD_T}>Peças em espera</p>
                    {Object.keys(estatisticas.pecasEspera).length===0?<p style={{ color:"#888",fontSize:"0.85rem" }}>Nenhuma</p>
                      :Object.entries(estatisticas.pecasEspera).sort((a,b)=>b[1]-a[1]).map(([peca,count])=>(
                        <div key={peca} style={{ display:"flex",justifyContent:"space-between",padding:"0.5rem 0",borderBottom:"1px solid #f8f8f6",fontSize:"0.88rem" }}>
                          <span>{peca}</span><span style={BADGE("orange")}>{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div style={{ ...CARD,marginTop:"1rem" }}>
                  <p style={CARD_T}>AI Consulting — Análise inteligente</p>
                  <div ref={chatRef} style={{ height:320,overflowY:"auto",padding:"1rem",background:"#f8f8f6",marginBottom:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem" }}>
                    {aiChat.length===0&&<div style={{ color:"#888",fontSize:"0.85rem",textAlign:"center",paddingTop:"2rem" }}>Pergunta-me qualquer coisa sobre o teu negócio.</div>}
                    {aiChat.map((m,i)=>(<div key={i} style={{ padding:"0.75rem 1rem",maxWidth:"80%",fontSize:"0.88rem",lineHeight:1.5,whiteSpace:"pre-wrap",background:m.role==="user"?"#080808":"#fff",color:m.role==="user"?"#fff":"#080808",alignSelf:m.role==="user"?"flex-end":"flex-start",borderLeft:m.role==="assistant"?"3px solid #c4748a":"none" }}>{m.content}</div>))}
                    {aiLoading&&<div style={{ padding:"0.75rem 1rem",background:"#fff",alignSelf:"flex-start",color:"#888",borderLeft:"3px solid #c4748a" }}>A analisar...</div>}
                  </div>
                  <div style={{ display:"flex",gap:"0.75rem",marginBottom:"0.75rem" }}>
                    <input style={{ ...INP,flex:1 }} value={aiPergunta} onChange={e=>setAiPergunta(e.target.value)} onKeyDown={e=>e.key==="Enter"&&perguntarAI()} placeholder="Pergunta ao consultor AI..." />
                    <button style={BTN("black")} onClick={perguntarAI} disabled={aiLoading}>Enviar</button>
                  </div>
                  <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap" }}>
                    {["Que peças devo comprar mais?","Quais clientes em risco?","Onde focar o marketing?","Que preços ajustar?","Análise geral"].map(q=>(<button key={q} style={BTN("outline","sm")} onClick={()=>setAiPergunta(q)}>{q}</button>))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* CONFIG */}
        {tab === "config" && (
          <>
            <h1 style={{ fontFamily:"'Cormorant',serif",fontSize:"2rem",fontWeight:300,marginBottom:"0.25rem" }}>Configurações</h1>
            <p style={{ fontSize:"0.82rem",color:"#888",marginBottom:"2rem" }}>Preços e contactos</p>
            <div style={CARD}>
              <p style={CARD_T}>Preços e taxas</p>
              <div style={{ maxWidth:300 }}><label style={LBL}>Taxa higienização (€)</label><input style={INP} type="number" value={config.higienizacao} onChange={e=>setConfig(c=>({...c,higienizacao:e.target.value}))} /></div>
            </div>
            <div style={CARD}>
              <p style={CARD_T}>Contactos</p>
              <div style={{ ...COL2,maxWidth:600,marginBottom:"1rem" }}>
                <div><label style={LBL}>WhatsApp</label><input style={INP} value={config.whatsapp} onChange={e=>setConfig(c=>({...c,whatsapp:e.target.value}))} placeholder="+351 912 345 678" /></div>
                <div><label style={LBL}>Email suporte</label><input style={INP} type="email" value={config.email_suporte} onChange={e=>setConfig(c=>({...c,email_suporte:e.target.value}))} placeholder="suporte@noragrei.com" /></div>
              </div>
              <button style={BTN("black")} onClick={()=>alert("Guardado!")}>Guardar</button>
            </div>
            <div style={CARD}>
              <p style={CARD_T}>Sistema de níveis de confiança</p>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead><tr>{["Nível","Alugueres","Desconto caução","Caução paga"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {[["🥉 Bronze","0–4","0%","100%"],["🥈 Prata","5–9","25%","75%"],["🥇 Ouro","10–19","50%","50%"],["💎 Platina","20+ sem danos","100%","0%"]].map(([n,a,d,c])=>(
                    <tr key={n} style={{ background:"#fff",borderBottom:"1px solid #f0eeeb" }}>
                      <td style={TD}><strong>{n}</strong></td><td style={TD}>{a}</td><td style={{ ...TD,color:"#27ae60",fontWeight:600 }}>{d}</td><td style={TD}>{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </div>
  );
}