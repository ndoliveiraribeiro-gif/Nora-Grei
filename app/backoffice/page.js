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

export default function Backoffice() {
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erroSenha, setErroSenha] = useState(false);
  const [tab, setTab] = useState("dashboard");

  // DASHBOARD
  const [stats, setStats] = useState({ alugueres_ativos: 0, devolucoes_hoje: 0, receita_mes: 0, clientes_total: 0, reservas_espera: 0, taxa_ocupacao: 0 });

  // CATÁLOGO
  const [pecas, setPecas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editPeca, setEditPeca] = useState(null);
  const [novaPeca, setNovaPeca] = useState({
    nome: "", categoria_id: "", preco_aluguer_dia: "", preco_avulso: "", valor_peca: "",
    descricao: "", material: "", origem: "Portugal", destaque: false,
    ocasioes: [], tamanhos: [{ tamanho: "M", quantidade_total: 1 }]
  });
  const [fotosUpload, setFotosUpload] = useState([]);
  const [uploadProgress, setUploadProgress] = useState("");
  const [criandoPeca, setCriandoPeca] = useState(false);

  // ALUGUERES
  const [alugueres, setAlugueres] = useState([]);

  // CLIENTES
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  // RESERVAS
  const [reservas, setReservas] = useState([]);

  // CAMPANHAS
  const [campanhas, setCampanhas] = useState([]);
  const [novaCampanha, setNovaCampanha] = useState({ titulo: "", mensagem: "", tipo: "cupao", codigo: "", desconto: "", probabilidade: 20, url_destino: "https://www.noragrei.com", validade: "" });

  // ESTATÍSTICAS
  const [estatisticas, setEstatisticas] = useState(null);
  const [aiChat, setAiChat] = useState([]);
  const [aiPergunta, setAiPergunta] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const chatRef = useRef(null);

  // CONFIG
  const [config, setConfig] = useState({ higienizacao: 9, whatsapp: "", email_suporte: "" });

  const entrar = () => {
    if (senha === SENHA) { setLogado(true); setErroSenha(false); }
    else setErroSenha(true);
  };

  useEffect(() => { if (logado) carregarDados(); }, [logado, tab]);

  const carregarDados = async () => {
    if (tab === "dashboard") {
      const { data: al } = await supabase.from("alugueres").select("estado, valor_aluguer, created_at");
      const { data: res } = await supabase.from("reservas_espera").select("id").eq("estado", "aguarda");
      if (al) {
        const agora = new Date();
        const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
        const ativos = al.filter(a => a.estado === "ativo").length;
        const totalPecas = await supabase.from("stock_tamanhos").select("quantidade_total");
        const totalStock = totalPecas.data?.reduce((s, t) => s + t.quantidade_total, 0) || 1;
        setStats({
          alugueres_ativos: ativos,
          devolucoes_hoje: al.filter(a => a.estado === "devolvido" && new Date(a.created_at).toDateString() === agora.toDateString()).length,
          receita_mes: al.filter(a => a.created_at >= inicioMes).reduce((s, a) => s + (a.valor_aluguer || 0), 0),
          clientes_total: 0,
          reservas_espera: res?.length || 0,
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
      const { data } = await supabase.from("alugueres").select("*, clientes(nome, email), stock_tamanhos(tamanho, pecas(nome, valor_peca))").order("data_fim", { ascending: true }).limit(100);
      if (data) setAlugueres(data);
    }

    if (tab === "clientes") {
      const { data } = await supabase.from("clientes").select("*, alugueres(id, estado, created_at, valor_aluguer)").order("created_at", { ascending: false });
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
      supabase.from("alugueres").select("*, stock_tamanhos(tamanho, pecas(id, nome, valor_peca, preco_aluguer_dia, categoria_id, categorias(nome))), clientes(nome, email, cidade)"),
      supabase.from("pecas").select("*, categorias(nome), stock_tamanhos(quantidade_total, quantidade_disponivel)"),
      supabase.from("clientes").select("*, alugueres(id, estado, valor_aluguer, created_at, data_fim)"),
      supabase.from("reservas_espera").select("*, stock_tamanhos(pecas(nome))"),
    ]);

    const al = alRes.data || [];
    const pecas = pecasRes.data || [];
    const clientes = clientesRes.data || [];
    const reservas = reservasRes.data || [];

    // Receita por mês (últimos 6 meses)
    const receitaMes = {};
    al.forEach(a => {
      if (!a.created_at) return;
      const mes = new Date(a.created_at).toLocaleDateString("pt-PT", { month: "short", year: "numeric" });
      receitaMes[mes] = (receitaMes[mes] || 0) + (a.valor_aluguer || 0);
    });

    // ROI por peça
    const roiPecas = pecas.map(p => {
      const alugueresPeca = al.filter(a => a.stock_tamanhos?.pecas?.id === p.id);
      const receitaGerada = alugueresPeca.reduce((s, a) => s + (a.valor_aluguer || 0), 0);
      const vezesAlugada = alugueresPeca.length;
      const roi = p.valor_peca > 0 ? ((receitaGerada / p.valor_peca) * 100).toFixed(0) : 0;
      const danificada = alugueresPeca.filter(a => a.estado === "devolvido_danificado").length;
      return { ...p, receitaGerada, vezesAlugada, roi, danificada };
    }).sort((a, b) => b.vezesAlugada - a.vezesAlugada);

    // Peças em lista de espera
    const pecasEspera = {};
    reservas.forEach(r => {
      const nome = r.stock_tamanhos?.pecas?.nome || "—";
      pecasEspera[nome] = (pecasEspera[nome] || 0) + 1;
    });

    // Cidades
    const cidades = {};
    al.forEach(a => {
      const cidade = a.clientes?.cidade || "Desconhecida";
      cidades[cidade] = (cidades[cidade] || 0) + 1;
    });

    // Clientes por nível
    const clientesComNivel = clientes.map(c => {
      const alugueresCompletos = (c.alugueres || []).filter(a => ["devolvido", "devolvido_danificado"].includes(a.estado)).length;
      const alugueresTotal = (c.alugueres || []).filter(a => a.estado !== "cancelado").length;
      const semDanos = (c.alugueres || []).filter(a => a.estado === "devolvido").length;
      const totalGasto = (c.alugueres || []).reduce((s, a) => s + (a.valor_aluguer || 0), 0);
      return { ...c, alugueresTotal, alugueresCompletos, semDanos, totalGasto, nivel: NIVEL(alugueresCompletos) };
    });

    // Frequência de aluguer
    const clientesMaisAtivos = [...clientesComNivel].sort((a, b) => b.alugueresTotal - a.alugueresTotal).slice(0, 5);

    // Categorias mais alugadas
    const categoriaCount = {};
    al.forEach(a => {
      const cat = a.stock_tamanhos?.pecas?.categorias?.nome || "Outro";
      categoriaCount[cat] = (categoriaCount[cat] || 0) + 1;
    });

    // Método entrega
    const entregas = { envio: 0, presencial: 0 };
    al.forEach(a => { if (a.metodo_entrega) entregas[a.metodo_entrega] = (entregas[a.metodo_entrega] || 0) + 1; });

    // Taxa cancelamento
    const cancelados = al.filter(a => a.estado === "cancelado").length;
    const taxaCancelamento = al.length > 0 ? ((cancelados / al.length) * 100).toFixed(1) : 0;

    // LTV clientes
    const ltv = clientesComNivel.reduce((s, c) => s + c.totalGasto, 0) / (clientesComNivel.length || 1);

    // Churn (alugaram 1x e não voltaram)
    const churn = clientesComNivel.filter(c => c.alugueresTotal === 1).length;

    setEstatisticas({
      receitaMes, roiPecas, pecasEspera, cidades, clientesComNivel,
      clientesMaisAtivos, categoriaCount, entregas, taxaCancelamento, ltv, churn,
      totalReceita: al.reduce((s, a) => s + (a.valor_aluguer || 0), 0),
      totalAlugueres: al.length,
      pecaMaisAlugada: roiPecas[0]?.nome || "—",
      pecaMenosAlugada: [...roiPecas].reverse()[0]?.nome || "—",
    });
  };

  const perguntarAI = async () => {
    if (!aiPergunta.trim() || !estatisticas) return;
    const pergunta = aiPergunta;
    setAiPergunta("");
    setAiLoading(true);
    setAiChat(prev => [...prev, { role: "user", content: pergunta }]);

    const contexto = `
És um consultor de negócios especializado em moda e aluguer de roupa de luxo. Analisa estes dados da Nora Grei e responde de forma concisa e útil em português.

DADOS DO NEGÓCIO:
- Total de alugueres: ${estatisticas.totalAlugueres}
- Receita total: ${estatisticas.totalReceita.toFixed(2)}€
- LTV médio por cliente: ${estatisticas.ltv.toFixed(2)}€
- Taxa cancelamento: ${estatisticas.taxaCancelamento}%
- Churn (clientes que não voltaram): ${estatisticas.churn}
- Peça mais alugada: ${estatisticas.pecaMaisAlugada}
- Peça menos alugada: ${estatisticas.pecaMenosAlugada}

CLIENTES MAIS ATIVOS:
${estatisticas.clientesMaisAtivos.map(c => `- ${c.nome}: ${c.alugueresTotal} alugueres, ${c.totalGasto.toFixed(0)}€ gastos, nível ${c.nivel.nome}`).join("\n")}

CATEGORIAS MAIS ALUGADAS:
${Object.entries(estatisticas.categoriaCount).sort((a,b) => b[1]-a[1]).map(([k,v]) => `- ${k}: ${v} alugueres`).join("\n")}

CIDADES COM MAIS ALUGUERES:
${Object.entries(estatisticas.cidades).sort((a,b) => b[1]-a[1]).slice(0,5).map(([k,v]) => `- ${k}: ${v}`).join("\n")}

ROI DAS PEÇAS (top 5):
${estatisticas.roiPecas.slice(0,5).map(p => `- ${p.nome}: ${p.vezesAlugada}x alugada, ${p.receitaGerada.toFixed(0)}€ receita, ROI ${p.roi}%`).join("\n")}

PEÇAS EM LISTA DE ESPERA:
${Object.entries(estatisticas.pecasEspera).map(([k,v]) => `- ${k}: ${v} em espera`).join("\n") || "Nenhuma"}
    `;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: contexto,
          messages: [{ role: "user", content: pergunta }]
        })
      });
      const data = await resp.json();
      const resposta = data.content?.[0]?.text || "Erro ao obter resposta.";
      setAiChat(prev => [...prev, { role: "assistant", content: resposta }]);
    } catch (e) {
      setAiChat(prev => [...prev, { role: "assistant", content: "Erro de ligação." }]);
    }
    setAiLoading(false);
    setTimeout(() => chatRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 100);
  };

  const criarPeca = async () => {
    if (!novaPeca.nome || !novaPeca.preco_aluguer_dia) return;
    setCriandoPeca(true);
    setUploadProgress("");
    const { data: pecaCriada, error } = await supabase.from("pecas").insert({
      nome: novaPeca.nome,
      categoria_id: novaPeca.categoria_id || null,
      preco_aluguer_dia: parseFloat(novaPeca.preco_aluguer_dia),
      preco_avulso: parseFloat(novaPeca.preco_avulso) || null,
      valor_peca: parseFloat(novaPeca.valor_peca) || 0,
      descricao: novaPeca.descricao,
      material: novaPeca.material,
      origem: novaPeca.origem,
      destaque: novaPeca.destaque,
      ocasioes: novaPeca.ocasioes,
      estado: "disponivel",
    }).select().single();

    if (error) { setUploadProgress("Erro: " + error.message); setCriandoPeca(false); return; }

    // Criar tamanhos
    for (const t of novaPeca.tamanhos) {
      if (t.tamanho) {
        await supabase.from("stock_tamanhos").insert({
          peca_id: pecaCriada.id,
          tamanho: t.tamanho,
          quantidade_total: parseInt(t.quantidade_total) || 1,
          quantidade_disponivel: parseInt(t.quantidade_total) || 1,
        });
      }
    }

    // Upload fotos
    if (fotosUpload.length > 0) {
      const urls = [];
      for (const foto of fotosUpload) {
        const ext = foto.name.split(".").pop();
        const path = `${pecaCriada.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        setUploadProgress(`Upload ${foto.name}...`);
        const { error: upErr } = await supabase.storage.from("pecas").upload(path, foto, { upsert: true });
        if (!upErr) {
          const { data } = supabase.storage.from("pecas").getPublicUrl(path);
          urls.push(data.publicUrl);
        }
      }
      if (urls.length > 0) {
        await supabase.from("pecas").update({ fotos: urls }).eq("id", pecaCriada.id);
        setUploadProgress(`✓ ${urls.length} foto(s) guardada(s)!`);
      }
    } else {
      setUploadProgress("✓ Peça criada com sucesso!");
    }

    setNovaPeca({ nome: "", categoria_id: "", preco_aluguer_dia: "", preco_avulso: "", valor_peca: "", descricao: "", material: "", origem: "Portugal", destaque: false, ocasioes: [], tamanhos: [{ tamanho: "M", quantidade_total: 1 }] });
    setFotosUpload([]);
    setCriandoPeca(false);
    setTimeout(() => setUploadProgress(""), 3000);
    carregarDados();
  };

  const calcularAtraso = (dataFim) => {
    if (!dataFim) return 0;
    const diff = Math.floor((new Date() - new Date(dataFim)) / 86400000);
    return diff > 0 ? diff : 0;
  };

  const calcularCaucao = (valorPeca, valorAluguer, numAlugueres) => {
    const nivel = NIVEL(numAlugueres);
    const base = Math.max(0, (valorPeca || 0) - (valorAluguer || 0));
    return (base * nivel.caucao / 100).toFixed(2);
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
    if (!novaCampanha.titulo || !novaCampanha.mensagem) return;
    await supabase.from("campanhas").insert({ ...novaCampanha, probabilidade: parseInt(novaCampanha.probabilidade), codigo: novaCampanha.codigo || null, desconto: novaCampanha.desconto || null, validade: novaCampanha.validade || null, ativa: true });
    setNovaCampanha({ titulo: "", mensagem: "", tipo: "cupao", codigo: "", desconto: "", probabilidade: 20, url_destino: "https://www.noragrei.com", validade: "" });
    carregarDados();
  };

  // PÁGINA DE LOGIN
  if (!logado) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0eeeb',fontFamily:"'Jost',Arial,sans-serif"}}>
      <div style={{background:'#f8f7f5',padding:'3rem',width:'340px',textAlign:'center',boxShadow:'0 2px 40px rgba(0,0,0,0.06)'}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'1.6rem',fontWeight:300,letterSpacing:'0.25em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Nora Grei</div>
        <div style={{fontSize:'0.55rem',letterSpacing:'0.35em',color:'#999',textTransform:'uppercase',marginBottom:'2.5rem'}}>Backoffice</div>
        <input type="password" placeholder="Password" value={senha} onChange={e => { setSenha(e.target.value); setErroSenha(false); }} onKeyDown={e => e.key === 'Enter' && entrar()} autoFocus style={{width:'100%',padding:'0.85rem 1rem',border: erroSenha ? '1.5px solid #e74c3c' : '1.5px solid #e2dfda',background:'#fff',fontFamily:"'Jost',sans-serif",fontSize:'0.9rem',outline:'none',marginBottom:'0.75rem',boxSizing:'border-box',color:'#080808'}} />
        {erroSenha && <div style={{fontSize:'0.72rem',color:'#e74c3c',marginBottom:'0.75rem'}}>Password incorreta</div>}
        <button onClick={entrar} style={{width:'100%',padding:'0.85rem',background:'#080808',color:'#f8f7f5',border:'none',cursor:'pointer',fontFamily:"'Jost',sans-serif",fontSize:'0.68rem',letterSpacing:'0.2em',textTransform:'uppercase'}}>Entrar</button>
      </div>
    </div>
  );

  const s = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300&family=Jost:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--rosa:#c4748a;--sans:'Jost',Arial,sans-serif;--serif:'Cormorant',Georgia,serif}
    body{background:var(--g1);font-family:var(--sans);font-size:15px;-webkit-font-smoothing:antialiased;color:var(--black);display:block!important}
    .bo-layout{display:grid;grid-template-columns:220px 1fr;min-height:100vh}
    .bo-sb{background:var(--black);color:var(--white);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;width:220px;z-index:100;overflow-y:auto}
    .bo-logo{padding:2rem 1.5rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.08)}
    .bo-logo-n{font-family:var(--serif);font-size:1.2rem;font-weight:300;letter-spacing:0.2em;text-transform:uppercase}
    .bo-logo-t{font-size:0.55rem;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-top:0.2rem}
    .bo-nav{padding:1rem 0;flex:1}
    .bo-ni{display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1.5rem;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.5);cursor:pointer;transition:all 0.2s;border:none;background:none;width:100%;text-align:left}
    .bo-ni:hover{color:var(--white);background:rgba(255,255,255,0.05)}
    .bo-ni.active{color:var(--white);background:rgba(255,255,255,0.08);border-left:2px solid var(--rosa)}
    .bo-footer{padding:1.5rem;border-top:1px solid rgba(255,255,255,0.08)}
    .bo-sair{font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.4);background:none;border:none;cursor:pointer;font-family:var(--sans);padding:0}
    .bo-sair:hover{color:var(--white)}
    .bo-main{margin-left:220px;padding:2.5rem}
    .bo-h1{font-family:var(--serif);font-size:2.5rem;font-weight:300;line-height:1}
    .bo-sub{font-size:0.82rem;color:#5a5855;margin-top:0.4rem}
    .bo-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem}
    .bo-stat{background:var(--white);padding:1.5rem}
    .bo-sv{font-family:var(--serif);font-size:2.5rem;font-weight:300;line-height:1;margin-bottom:0.4rem}
    .bo-sl{font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;color:#5a5855}
    .bo-stat.d .bo-sv{color:var(--rosa)}
    .card{background:var(--white);padding:1.5rem;margin-bottom:1.5rem}
    .card-t{font-size:0.65rem;letter-spacing:0.25em;text-transform:uppercase;color:#5a5855;font-weight:500;margin-bottom:1.25rem;padding-bottom:0.75rem;border-bottom:1px solid var(--g1)}
    table{width:100%;border-collapse:collapse}
    th{font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:#5a5855;font-weight:500;padding:0.6rem 0.75rem;text-align:left;border-bottom:1px solid var(--g2)}
    td{font-size:0.88rem;padding:0.85rem 0.75rem;border-bottom:1px solid var(--g1);vertical-align:middle}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:var(--g1)}
    .badge{display:inline-block;font-size:0.58rem;letter-spacing:0.12em;text-transform:uppercase;padding:0.25rem 0.6rem;font-weight:500}
    .bv{background:#e8f5e9;color:#27ae60}.bl{background:#fff8e1;color:#f39c12}.bc{background:var(--g1);color:#5a5855}.br{background:#fff0f3;color:var(--rosa)}.bvr{background:#fff5f5;color:#e74c3c}
    .btn{font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;padding:0.5rem 0.85rem;border:none;cursor:pointer;font-family:var(--sans);font-weight:500;transition:all 0.2s}
    .btn-k{background:var(--black);color:var(--white)}.btn-r{background:var(--rosa);color:var(--white)}.btn-o{background:var(--white);color:var(--black);border:1px solid var(--g2)}
    .btn-sm{padding:0.35rem 0.65rem;font-size:0.6rem}
    .btn:disabled{opacity:0.5;cursor:not-allowed}
    .fg{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
    .fg3{grid-template-columns:1fr 1fr 1fr}
    .full{grid-column:1/-1}
    label.lbl{display:block;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:#5a5855;margin-bottom:0.4rem;font-weight:500}
    .inp{width:100%;padding:0.75rem 0.9rem;border:1.5px solid var(--g2);background:var(--white);font-size:0.92rem;font-family:var(--sans);color:var(--black);outline:none;transition:border-color 0.2s}
    .inp:focus{border-color:var(--black)}
    select.inp{cursor:pointer}
    textarea.inp{resize:vertical;min-height:80px}
    .se{font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;padding:0.35rem 0.5rem;border:1px solid var(--g2);background:var(--white);font-family:var(--sans);cursor:pointer;color:var(--black)}
    .upload{width:100%;padding:1.5rem;border:2px dashed var(--g2);background:var(--g1);cursor:pointer;text-align:center;transition:border-color 0.2s;display:block}
    .upload:hover{border-color:var(--rosa)}
    .thumbs{display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.75rem}
    .thumb{width:60px;height:60px;object-fit:cover;border:1px solid var(--g2)}
    .ocasiao-btn{font-size:0.65rem;padding:0.4rem 0.75rem;border:1.5px solid var(--g2);background:var(--white);cursor:pointer;font-family:var(--sans);transition:all 0.2s;letter-spacing:0.05em}
    .ocasiao-btn.on{background:var(--black);color:var(--white);border-color:var(--black)}
    .stat-bar{height:8px;background:var(--g2);border-radius:4px;overflow:hidden;margin-top:0.4rem}
    .stat-bar-fill{height:100%;background:var(--rosa);border-radius:4px;transition:width 0.6s}
    .ai-chat{height:320px;overflow-y:auto;padding:1rem;background:var(--g1);margin-bottom:1rem;display:flex;flex-direction:column;gap:0.75rem}
    .ai-msg{padding:0.75rem 1rem;max-width:80%;font-size:0.88rem;line-height:1.5}
    .ai-user{background:var(--black);color:var(--white);align-self:flex-end}
    .ai-bot{background:var(--white);color:var(--black);align-self:flex-start;border-left:3px solid var(--rosa)}
    .nivel-badge{display:inline-flex;align-items:center;gap:0.3rem;font-size:0.65rem;font-weight:500;padding:0.2rem 0.5rem;letter-spacing:0.05em}
    @media(max-width:768px){.bo-layout{grid-template-columns:1fr}.bo-sb{position:static;width:100%;height:auto}.bo-main{margin-left:0;padding:1rem}.bo-stats{grid-template-columns:1fr 1fr}.fg{grid-template-columns:1fr}}
  `;

  return (
    <>
      <style>{s}</style>
      <div className="bo-layout">
        <aside className="bo-sb">
          <div className="bo-logo">
            <div className="bo-logo-n">Nora Grei</div>
            <div className="bo-logo-t">Backoffice</div>
          </div>
          <nav className="bo-nav">
            {TABS.map(t => (
              <button key={t} className={`bo-ni${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                <span style={{fontSize:'0.9rem',width:16}}>{TAB_ICONS[t]}</span>
                {TAB_LABELS[t]}
              </button>
            ))}
          </nav>
          <div className="bo-footer">
            <button className="bo-sair" onClick={() => setLogado(false)}>Terminar sessão</button>
          </div>
        </aside>

        <main className="bo-main">

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <>
              <div style={{marginBottom:'2rem'}}><h1 className="bo-h1">Dashboard</h1><p className="bo-sub">Resumo do negócio em tempo real</p></div>
              <div className="bo-stats">
                <div className="bo-stat d"><div className="bo-sv">{stats.alugueres_ativos}</div><div className="bo-sl">Alugueres ativos</div></div>
                <div className="bo-stat"><div className="bo-sv">{stats.devolucoes_hoje}</div><div className="bo-sl">Devoluções hoje</div></div>
                <div className="bo-stat"><div className="bo-sv">{Number(stats.receita_mes).toFixed(0)}€</div><div className="bo-sl">Receita este mês</div></div>
                <div className="bo-stat"><div className="bo-sv">{stats.clientes_total}</div><div className="bo-sl">Clientes total</div></div>
              </div>
              <div className="bo-stats" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                <div className="bo-stat"><div className="bo-sv">{stats.reservas_espera}</div><div className="bo-sl">Reservas em espera</div></div>
                <div className="bo-stat"><div className="bo-sv">{stats.taxa_ocupacao}%</div><div className="bo-sl">Taxa de ocupação</div></div>
                <div className="bo-stat"><div className="bo-sv" style={{fontSize:'1.5rem',cursor:'pointer'}} onClick={() => setTab("estatisticas")}>📊</div><div className="bo-sl">Ver analytics & AI</div></div>
              </div>
              <div className="card">
                <p className="card-t">Ações rápidas</p>
                <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                  <button className="btn btn-k" onClick={() => setTab("catalogo")}>+ Adicionar peça</button>
                  <button className="btn btn-r" onClick={() => setTab("alugueres")}>Ver alugueres</button>
                  <button className="btn btn-o" onClick={() => setTab("clientes")}>Ver clientes</button>
                  <button className="btn btn-o" onClick={() => setTab("reservas")}>Ver reservas</button>
                  <button className="btn btn-o" onClick={() => setTab("estatisticas")}>📊 Analytics & AI</button>
                </div>
              </div>
            </>
          )}

          {/* ── CATÁLOGO ── */}
          {tab === "catalogo" && (
            <>
              <div style={{marginBottom:'2rem'}}><h1 className="bo-h1">Catálogo</h1><p className="bo-sub">{pecas.length} peças</p></div>
              <div className="card">
                <p className="card-t">Adicionar nova peça</p>
                <div className="fg">
                  <div><label className="lbl">Nome da peça *</label><input className="inp" value={novaPeca.nome} onChange={e => setNovaPeca(p => ({...p, nome: e.target.value}))} placeholder="Vestido Seda Noite" /></div>
                  <div><label className="lbl">Categoria</label>
                    <select className="inp" value={novaPeca.categoria_id} onChange={e => setNovaPeca(p => ({...p, categoria_id: e.target.value}))}>
                      <option value="">Selecionar</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div><label className="lbl">Preço aluguer / dia (€) *</label><input className="inp" type="number" value={novaPeca.preco_aluguer_dia} onChange={e => setNovaPeca(p => ({...p, preco_aluguer_dia: e.target.value}))} placeholder="35" /></div>
                  <div><label className="lbl">Preço por ocasião (€)</label><input className="inp" type="number" value={novaPeca.preco_avulso} onChange={e => setNovaPeca(p => ({...p, preco_avulso: e.target.value}))} placeholder="89" /></div>
                  <div><label className="lbl">Valor da peça (€) — base caução</label><input className="inp" type="number" value={novaPeca.valor_peca} onChange={e => setNovaPeca(p => ({...p, valor_peca: e.target.value}))} placeholder="450" /></div>
                  <div><label className="lbl">Material</label><input className="inp" value={novaPeca.material} onChange={e => setNovaPeca(p => ({...p, material: e.target.value}))} placeholder="100% Seda natural" /></div>
                  <div><label className="lbl">Origem</label><input className="inp" value={novaPeca.origem} onChange={e => setNovaPeca(p => ({...p, origem: e.target.value}))} /></div>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem',paddingTop:'1.5rem'}}>
                    <input type="checkbox" id="destaque" checked={novaPeca.destaque} onChange={e => setNovaPeca(p => ({...p, destaque: e.target.checked}))} />
                    <label htmlFor="destaque" className="lbl" style={{marginBottom:0}}>Peça em destaque</label>
                  </div>
                  <div className="full"><label className="lbl">Descrição</label><textarea className="inp" value={novaPeca.descricao} onChange={e => setNovaPeca(p => ({...p, descricao: e.target.value}))} placeholder="Descrição da peça..." /></div>
                </div>

                {/* OCASIÕES */}
                <div style={{marginBottom:'1.25rem'}}>
                  <label className="lbl">Ocasiões / eventos</label>
                  <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginTop:'0.5rem'}}>
                    {OCASIOES.map(o => (
                      <button key={o} type="button" className={`ocasiao-btn${novaPeca.ocasioes.includes(o) ? " on" : ""}`}
                        onClick={() => setNovaPeca(p => ({ ...p, ocasioes: p.ocasioes.includes(o) ? p.ocasioes.filter(x => x !== o) : [...p.ocasioes, o] }))}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TAMANHOS */}
                <div style={{marginBottom:'1.25rem'}}>
                  <label className="lbl">Tamanhos & stock</label>
                  {novaPeca.tamanhos.map((t, i) => (
                    <div key={i} style={{display:'flex',gap:'0.75rem',alignItems:'center',marginBottom:'0.5rem'}}>
                      <select className="inp" style={{width:'120px'}} value={t.tamanho} onChange={e => {
                        const ts = [...novaPeca.tamanhos]; ts[i].tamanho = e.target.value; setNovaPeca(p => ({...p, tamanhos: ts}));
                      }}>
                        <option value="">Tamanho</option>
                        {TAMANHOS.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                      </select>
                      <input className="inp" type="number" style={{width:'100px'}} min="1" value={t.quantidade_total} placeholder="Qtd" onChange={e => {
                        const ts = [...novaPeca.tamanhos]; ts[i].quantidade_total = e.target.value; setNovaPeca(p => ({...p, tamanhos: ts}));
                      }} />
                      {novaPeca.tamanhos.length > 1 && <button type="button" onClick={() => setNovaPeca(p => ({...p, tamanhos: p.tamanhos.filter((_, j) => j !== i)}))} style={{background:'none',border:'none',cursor:'pointer',color:'#e74c3c',fontSize:'1.1rem'}}>✕</button>}
                    </div>
                  ))}
                  <button type="button" className="btn btn-o btn-sm" onClick={() => setNovaPeca(p => ({...p, tamanhos: [...p.tamanhos, {tamanho:"",quantidade_total:1}]}))}>+ Adicionar tamanho</button>
                </div>

                {/* FOTOS */}
                <div style={{marginBottom:'1rem'}}>
                  <label className="lbl">Fotos</label>
                  <label className="upload">
                    <input type="file" accept="image/*" multiple onChange={e => setFotosUpload(Array.from(e.target.files))} style={{display:'none'}} />
                    {fotosUpload.length === 0 ? <div><div style={{fontSize:'1.5rem'}}>📷</div><div style={{fontSize:'0.82rem',marginTop:'0.4rem',color:'#5a5855'}}>Clica para selecionar fotos (múltiplas)</div></div>
                      : <div style={{color:'#27ae60',fontWeight:500}}>{fotosUpload.length} foto(s) — {fotosUpload.map(f => f.name).join(", ")}</div>}
                  </label>
                  {fotosUpload.length > 0 && <div className="thumbs">{fotosUpload.map((f,i) => <img key={i} src={URL.createObjectURL(f)} alt="" className="thumb" />)}</div>}
                  {uploadProgress && <p style={{fontSize:'0.75rem',color: uploadProgress.startsWith('✓') ? '#27ae60' : '#c4748a',marginTop:'0.5rem'}}>{uploadProgress}</p>}
                </div>

                <button className="btn btn-k" onClick={criarPeca} disabled={criandoPeca}>{criandoPeca ? "A criar..." : "+ Adicionar peça"}</button>
              </div>

              {/* LISTA */}
              <div className="card">
                <p className="card-t">Peças no catálogo</p>
                <table>
                  <thead><tr><th>Foto</th><th>Peça</th><th>Categoria</th><th>Preço/dia</th><th>Ocasiões</th><th>Tamanhos</th><th>Estado</th><th>Ações</th></tr></thead>
                  <tbody>
                    {pecas.map(p => (
                      <tr key={p.id}>
                        <td>{p.fotos?.length > 0 ? <img src={p.fotos[0]} alt="" style={{width:48,height:48,objectFit:'cover',border:'1px solid #e2dfda'}} /> : <div style={{width:48,height:48,background:'#f0eeeb',display:'flex',alignItems:'center',justifyContent:'center',color:'#ccc'}}>📷</div>}</td>
                        <td><strong>{p.nome}</strong>{p.destaque && <span style={{marginLeft:'0.4rem',fontSize:'0.6rem',background:'#fff0f3',color:'var(--rosa)',padding:'0.1rem 0.4rem'}}>DESTAQUE</span>}</td>
                        <td>{p.categorias?.nome || "—"}</td>
                        <td>{p.preco_aluguer_dia}€{p.preco_avulso ? <div style={{fontSize:'0.75rem',color:'#5a5855'}}>{p.preco_avulso}€/ocas.</div> : null}</td>
                        <td style={{fontSize:'0.75rem',maxWidth:'120px'}}>{(p.ocasioes || []).join(", ") || "—"}</td>
                        <td style={{fontSize:'0.78rem'}}>{p.stock_tamanhos?.map(s => `${s.tamanho}(${s.quantidade_disponivel}/${s.quantidade_total})`).join(", ") || "—"}</td>
                        <td><span className={`badge ${p.estado === 'disponivel' ? 'bv' : 'bc'}`}>{p.estado}</span></td>
                        <td style={{display:'flex',gap:'0.4rem'}}>
                          <button className="btn btn-o btn-sm" onClick={async () => { await supabase.from("pecas").update({ estado: p.estado === 'disponivel' ? 'indisponivel' : 'disponivel' }).eq("id", p.id); carregarDados(); }}>{p.estado === 'disponivel' ? 'Desativar' : 'Ativar'}</button>
                          <button className="btn btn-sm" style={{background:'#fff5f5',color:'#e74c3c',border:'1px solid #f5c6cb'}} onClick={async () => { if (confirm("Apagar?")) { await supabase.from("pecas").delete().eq("id", p.id); carregarDados(); } }}>Apagar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── ALUGUERES ── */}
          {tab === "alugueres" && (
            <>
              <div style={{marginBottom:'2rem'}}><h1 className="bo-h1">Alugueres</h1><p className="bo-sub">{alugueres.length} registados</p></div>
              <div className="card">
                <table>
                  <thead><tr><th>Cliente</th><th>Peça</th><th>Datas</th><th>Atraso</th><th>Valor</th><th>Caução</th><th>Depósito</th><th>Estado</th><th>Ações</th></tr></thead>
                  <tbody>
                    {alugueres.map(a => {
                      const clienteAlugueres = clientes.find(c => c.id === a.cliente_id);
                      const numAl = clienteAlugueres?.alugueres?.filter(x => x.estado !== "cancelado").length || 0;
                      const nv = NIVEL(numAl);
                      return (
                        <tr key={a.id}>
                          <td>
                            <div style={{fontWeight:500}}>{a.clientes?.nome || "—"}</div>
                            <div style={{fontSize:'0.75rem',color:'#5a5855'}}>{a.clientes?.email}</div>
                            <span className="nivel-badge" style={{background: nv.cor + '22', color: nv.cor, marginTop:'0.2rem'}}>{nv.icon} {nv.nome}</span>
                          </td>
                          <td><div>{a.stock_tamanhos?.pecas?.nome || "—"}</div><div style={{fontSize:'0.78rem',color:'#5a5855'}}>Tam: {a.stock_tamanhos?.tamanho}</div></td>
                          <td style={{fontSize:'0.82rem'}}>{a.data_inicio} → {a.data_fim}</td>
                          <td>{calcularAtraso(a.data_fim) > 0 ? <span style={{color:'#e74c3c',fontWeight:600}}>+{calcularAtraso(a.data_fim)} dias</span> : <span style={{color:'#27ae60',fontSize:'0.82rem'}}>✓</span>}</td>
                          <td>{a.valor_aluguer}€</td>
                          <td style={{fontSize:'0.82rem'}}>
                            <div>{calcularCaucao(a.stock_tamanhos?.pecas?.valor_peca, a.valor_aluguer, numAl)}€</div>
                            <div style={{fontSize:'0.68rem',color:nv.cor}}>{nv.caucao}% ({nv.nome})</div>
                          </td>
                          <td>
                            <span className={`badge ${a.deposito_estado === 'recebido' || a.deposito_estado === 'libertado' ? 'bv' : 'bl'}`}>{a.deposito_estado}</span>
                            {a.deposito_estado === 'pendente' && <button className="btn btn-r btn-sm" style={{display:'block',marginTop:'0.25rem'}} onClick={() => confirmarDeposito(a.id)}>Confirmar</button>}
                          </td>
                          <td>
                            <select className="se" value={a.estado} onChange={e => atualizarEstado(a.id, e.target.value)}>
                              <option value="pendente">Pendente</option>
                              <option value="confirmado">Confirmado</option>
                              <option value="enviado">Enviado</option>
                              <option value="ativo">Ativo</option>
                              <option value="em_verificacao">Em verificação</option>
                              <option value="devolvido">Devolvido</option>
                              <option value="devolvido_danificado">Danificado</option>
                              <option value="nao_devolvido">Não devolvido</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </td>
                          <td>
                            <div style={{display:'flex',flexDirection:'column',gap:'0.3rem'}}>
                              {a.estado === 'ativo' && <button className="btn btn-r btn-sm" onClick={() => confirmarRecepcao(a.id)}>📦 Recebi</button>}
                              {a.estado === 'em_verificacao' && <>
                                <button className="btn btn-sm btn-k" onClick={() => confirmarVerificacao(a.id, false)}>✓ OK</button>
                                <button className="btn btn-sm" style={{background:'#fff5f5',color:'#e74c3c',border:'1px solid #f5c6cb'}} onClick={() => confirmarVerificacao(a.id, true)}>✗ Dano</button>
                              </>}
                              {a.estado === 'devolvido' && a.deposito_estado !== 'libertado' && <button className="btn btn-o btn-sm" onClick={() => libertarCaucao(a.id)}>💰 Libertar</button>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── CLIENTES ── */}
          {tab === "clientes" && (
            <>
              <div style={{marginBottom:'2rem'}}><h1 className="bo-h1">Clientes</h1><p className="bo-sub">{clientes.length} registados</p></div>
              <div className="card">
                <table>
                  <thead><tr><th>Cliente</th><th>Cidade</th><th>Nível</th><th>Pontos</th><th>Alugueres</th><th>Total gasto</th><th>Caução atual</th></tr></thead>
                  <tbody>
                    {clientes.map(c => {
                      const al = c.alugueres || [];
                      const total = al.filter(a => a.estado !== "cancelado").length;
                      const completos = al.filter(a => ["devolvido","devolvido_danificado"].includes(a.estado)).length;
                      const gasto = al.reduce((s, a) => s + (a.valor_aluguer || 0), 0);
                      const nv = NIVEL(completos);
                      const proximoNivel = completos < 5 ? `${5-completos} para Prata` : completos < 10 ? `${10-completos} para Ouro` : completos < 20 ? `${20-completos} para Platina` : "Platina ✓";
                      return (
                        <tr key={c.id} onClick={() => setClienteSelecionado(clienteSelecionado?.id === c.id ? null : c)} style={{cursor:'pointer'}}>
                          <td>
                            <div style={{fontWeight:500}}>{c.nome || "—"}</div>
                            <div style={{fontSize:'0.78rem',color:'#5a5855'}}>{c.email}</div>
                          </td>
                          <td style={{fontSize:'0.82rem'}}>{c.cidade || "—"}</td>
                          <td>
                            <span className="nivel-badge" style={{background: nv.cor + '22', color: nv.cor}}>{nv.icon} {nv.nome}</span>
                            <div style={{fontSize:'0.68rem',color:'#5a5855',marginTop:'0.2rem'}}>{proximoNivel}</div>
                          </td>
                          <td><span className="badge br">{total} pts</span></td>
                          <td>{total}</td>
                          <td>{gasto.toFixed(0)}€</td>
                          <td style={{color: nv.cor, fontWeight:500}}>{nv.caucao}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {clienteSelecionado && (
                <div className="card">
                  <p className="card-t">Detalhe — {clienteSelecionado.nome}</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                    {[
                      ["Email", clienteSelecionado.email],
                      ["Telefone", clienteSelecionado.telefone || "—"],
                      ["Cidade", clienteSelecionado.cidade || "—"],
                      ["NIF", clienteSelecionado.nif || "—"],
                      ["Membro desde", new Date(clienteSelecionado.created_at).toLocaleDateString("pt-PT")],
                    ].map(([k, v]) => (
                      <div key={k}><div style={{fontSize:'0.62rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#5a5855',marginBottom:'0.2rem'}}>{k}</div><div style={{fontSize:'0.9rem'}}>{v}</div></div>
                    ))}
                  </div>
                  <div>
                    <div className="card-t" style={{marginBottom:'0.75rem'}}>Histórico de alugueres</div>
                    <table>
                      <thead><tr><th>Data</th><th>Valor</th><th>Estado</th></tr></thead>
                      <tbody>
                        {(clienteSelecionado.alugueres || []).map(a => (
                          <tr key={a.id}>
                            <td style={{fontSize:'0.82rem'}}>{new Date(a.created_at).toLocaleDateString("pt-PT")}</td>
                            <td>{a.valor_aluguer}€</td>
                            <td><span className={`badge ${a.estado === 'devolvido' ? 'bv' : a.estado === 'ativo' ? 'bl' : 'bc'}`}>{a.estado}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── RESERVAS ── */}
          {tab === "reservas" && (
            <>
              <div style={{marginBottom:'2rem'}}><h1 className="bo-h1">Reservas em espera</h1><p className="bo-sub">{reservas.length} pendentes</p></div>
              <div className="card">
                <table>
                  <thead><tr><th>Cliente</th><th>Peça</th><th>Datas desejadas</th><th>Estado</th><th>Ações</th></tr></thead>
                  <tbody>
                    {reservas.length === 0 ? <tr><td colSpan={5} style={{textAlign:'center',color:'#5a5855',padding:'2rem'}}>Sem reservas em espera</td></tr>
                      : reservas.map(r => (
                        <tr key={r.id}>
                          <td><div style={{fontWeight:500}}>{r.clientes?.nome || "—"}</div><div style={{fontSize:'0.78rem',color:'#5a5855'}}>{r.clientes?.email}</div></td>
                          <td><div>{r.stock_tamanhos?.pecas?.nome || "—"}</div><div style={{fontSize:'0.78rem',color:'#5a5855'}}>Tam: {r.stock_tamanhos?.tamanho}</div></td>
                          <td style={{fontSize:'0.82rem'}}>{r.data_inicio_desejada} → {r.data_fim_desejada}</td>
                          <td><span className={`badge ${r.estado === 'aguarda' ? 'bl' : 'bv'}`}>{r.estado}</span></td>
                          <td>{r.estado === 'aguarda' && <button className="btn btn-r btn-sm" onClick={async () => { await supabase.from("reservas_espera").update({ estado: "notificado", notificado_em: new Date().toISOString() }).eq("id", r.id); carregarDados(); }}>Notificar</button>}</td>
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
              <div style={{marginBottom:'2rem'}}><h1 className="bo-h1">Campanhas</h1><p className="bo-sub">Alertas e cupões</p></div>
              <div className="card">
                <p className="card-t">Nova campanha</p>
                <div className="fg">
                  <div><label className="lbl">Título</label><input className="inp" value={novaCampanha.titulo} onChange={e => setNovaCampanha(p => ({...p, titulo: e.target.value}))} placeholder="É o teu dia de sorte!" /></div>
                  <div><label className="lbl">Tipo</label><select className="inp" value={novaCampanha.tipo} onChange={e => setNovaCampanha(p => ({...p, tipo: e.target.value}))}><option value="cupao">Cupão</option><option value="novidade">Novidade</option><option value="oferta">Oferta</option></select></div>
                  <div className="full"><label className="lbl">Mensagem</label><textarea className="inp" value={novaCampanha.mensagem} onChange={e => setNovaCampanha(p => ({...p, mensagem: e.target.value}))} /></div>
                  <div><label className="lbl">Código desconto</label><input className="inp" value={novaCampanha.codigo} onChange={e => setNovaCampanha(p => ({...p, codigo: e.target.value}))} placeholder="NORA15" /></div>
                  <div><label className="lbl">Descrição desconto</label><input className="inp" value={novaCampanha.desconto} onChange={e => setNovaCampanha(p => ({...p, desconto: e.target.value}))} placeholder="15% em toda a loja" /></div>
                  <div><label className="lbl">Probabilidade (%)</label><input className="inp" type="number" min="1" max="100" value={novaCampanha.probabilidade} onChange={e => setNovaCampanha(p => ({...p, probabilidade: e.target.value}))} /></div>
                  <div><label className="lbl">Validade</label><input className="inp" type="datetime-local" value={novaCampanha.validade} onChange={e => setNovaCampanha(p => ({...p, validade: e.target.value}))} /></div>
                </div>
                <button className="btn btn-r" onClick={criarCampanha}>✉ Criar campanha</button>
              </div>
              <div className="card">
                <p className="card-t">{campanhas.length} campanhas</p>
                <table>
                  <thead><tr><th>Título</th><th>Tipo</th><th>Código</th><th>Prob.</th><th>Estado</th><th>Ações</th></tr></thead>
                  <tbody>
                    {campanhas.length === 0 ? <tr><td colSpan={6} style={{textAlign:'center',color:'#5a5855',padding:'2rem'}}>Sem campanhas</td></tr>
                      : campanhas.map(c => (
                        <tr key={c.id}>
                          <td><div style={{fontWeight:500}}>{c.titulo}</div><div style={{fontSize:'0.78rem',color:'#5a5855'}}>{c.mensagem?.substring(0,50)}...</div></td>
                          <td><span className={`badge ${c.tipo === 'cupao' ? 'br' : 'bv'}`}>{c.tipo}</span></td>
                          <td style={{fontWeight:600}}>{c.codigo || "—"}</td>
                          <td>{c.probabilidade}%</td>
                          <td><span className={`badge ${c.ativa ? 'bv' : 'bc'}`}>{c.ativa ? "Ativa" : "Inativa"}</span></td>
                          <td style={{display:'flex',gap:'0.4rem'}}>
                            <button className={`btn btn-sm ${c.ativa ? 'btn-o' : 'btn-r'}`} onClick={async () => { await supabase.from("campanhas").update({ ativa: !c.ativa }).eq("id", c.id); carregarDados(); }}>{c.ativa ? "Pausar" : "Ativar"}</button>
                            <button className="btn btn-sm" style={{background:'#fff5f5',color:'#e74c3c',border:'1px solid #f5c6cb'}} onClick={async () => { if (confirm("Apagar?")) { await supabase.from("campanhas").delete().eq("id", c.id); carregarDados(); } }}>Apagar</button>
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
              <div style={{marginBottom:'2rem'}}><h1 className="bo-h1">Estatísticas & AI</h1><p className="bo-sub">Analytics completo + consultor inteligente</p></div>

              {!estatisticas ? (
                <div style={{textAlign:'center',padding:'3rem',color:'#5a5855'}}>A carregar dados...</div>
              ) : (
                <>
                  {/* KPIs */}
                  <div className="bo-stats" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
                    <div className="bo-stat d"><div className="bo-sv">{estatisticas.totalReceita.toFixed(0)}€</div><div className="bo-sl">Receita total</div></div>
                    <div className="bo-stat"><div className="bo-sv">{estatisticas.totalAlugueres}</div><div className="bo-sl">Total alugueres</div></div>
                    <div className="bo-stat"><div className="bo-sv">{estatisticas.ltv.toFixed(0)}€</div><div className="bo-sl">LTV médio cliente</div></div>
                    <div className="bo-stat"><div className="bo-sv">{estatisticas.taxaCancelamento}%</div><div className="bo-sl">Taxa cancelamento</div></div>
                  </div>
                  <div className="bo-stats" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
                    <div className="bo-stat"><div className="bo-sv">{estatisticas.churn}</div><div className="bo-sl">Clientes sem regresso</div></div>
                    <div className="bo-stat"><div className="bo-sv" style={{fontSize:'1.2rem'}}>{estatisticas.pecaMaisAlugada}</div><div className="bo-sl">Peça mais alugada</div></div>
                    <div className="bo-stat"><div className="bo-sv" style={{fontSize:'1.2rem'}}>{estatisticas.pecaMenosAlugada}</div><div className="bo-sl">Peça menos alugada</div></div>
                  </div>

                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
                    {/* Categorias */}
                    <div className="card">
                      <p className="card-t">Categorias mais alugadas</p>
                      {Object.entries(estatisticas.categoriaCount).sort((a,b) => b[1]-a[1]).map(([cat, count]) => {
                        const max = Math.max(...Object.values(estatisticas.categoriaCount));
                        return (
                          <div key={cat} style={{marginBottom:'0.75rem'}}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',marginBottom:'0.25rem'}}>
                              <span>{cat}</span><span style={{fontWeight:600}}>{count}</span>
                            </div>
                            <div className="stat-bar"><div className="stat-bar-fill" style={{width:`${(count/max)*100}%`}} /></div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Cidades */}
                    <div className="card">
                      <p className="card-t">Cidades com mais alugueres</p>
                      {Object.entries(estatisticas.cidades).sort((a,b) => b[1]-a[1]).slice(0,6).map(([cidade, count]) => {
                        const max = Math.max(...Object.values(estatisticas.cidades));
                        return (
                          <div key={cidade} style={{marginBottom:'0.75rem'}}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',marginBottom:'0.25rem'}}>
                              <span>{cidade}</span><span style={{fontWeight:600}}>{count}</span>
                            </div>
                            <div className="stat-bar"><div className="stat-bar-fill" style={{width:`${(count/max)*100}%`}} /></div>
                          </div>
                        );
                      })}
                    </div>

                    {/* ROI Peças */}
                    <div className="card" style={{gridColumn:'1/-1'}}>
                      <p className="card-t">ROI por peça</p>
                      <table>
                        <thead><tr><th>Peça</th><th>Valor peça</th><th>Vezes alugada</th><th>Receita gerada</th><th>ROI</th><th>Danos</th><th>Break-even</th></tr></thead>
                        <tbody>
                          {estatisticas.roiPecas.map(p => (
                            <tr key={p.id}>
                              <td><strong>{p.nome}</strong></td>
                              <td>{p.valor_peca}€</td>
                              <td>{p.vezesAlugada}x</td>
                              <td style={{color:'#27ae60',fontWeight:500}}>{p.receitaGerada.toFixed(0)}€</td>
                              <td>
                                <span style={{color: p.roi >= 100 ? '#27ae60' : p.roi >= 50 ? '#f39c12' : '#e74c3c', fontWeight:600}}>{p.roi}%</span>
                              </td>
                              <td>{p.danificada > 0 ? <span style={{color:'#e74c3c'}}>{p.danificada}x</span> : <span style={{color:'#27ae60'}}>0</span>}</td>
                              <td style={{fontSize:'0.82rem',color:'#5a5855'}}>
                                {p.preco_aluguer_dia > 0 ? `${Math.ceil(p.valor_peca / p.preco_aluguer_dia)} dias` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Clientes mais ativos */}
                    <div className="card">
                      <p className="card-t">Clientes mais ativos</p>
                      {estatisticas.clientesMaisAtivos.map((c, i) => (
                        <div key={c.id} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem 0',borderBottom:'1px solid var(--g1)'}}>
                          <div style={{fontSize:'1.2rem',width:30,textAlign:'center'}}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:500,fontSize:'0.88rem'}}>{c.nome}</div>
                            <div style={{fontSize:'0.75rem',color:'#5a5855'}}>{c.alugueresTotal} alugueres · {c.totalGasto.toFixed(0)}€</div>
                          </div>
                          <span className="nivel-badge" style={{background: c.nivel.cor + '22', color: c.nivel.cor}}>{c.nivel.icon} {c.nivel.nome}</span>
                        </div>
                      ))}
                    </div>

                    {/* Lista espera */}
                    <div className="card">
                      <p className="card-t">Peças em lista de espera</p>
                      {Object.keys(estatisticas.pecasEspera).length === 0 ? (
                        <p style={{color:'#5a5855',fontSize:'0.85rem'}}>Nenhuma peça em espera</p>
                      ) : Object.entries(estatisticas.pecasEspera).sort((a,b) => b[1]-a[1]).map(([peca, count]) => (
                        <div key={peca} style={{display:'flex',justifyContent:'space-between',padding:'0.5rem 0',borderBottom:'1px solid var(--g1)',fontSize:'0.88rem'}}>
                          <span>{peca}</span>
                          <span className="badge bl">{count} em espera</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI CONSULTING */}
                  <div className="card" style={{marginTop:'1.5rem'}}>
                    <p className="card-t">AI Consulting — Análise inteligente</p>
                    <div className="ai-chat" ref={chatRef}>
                      {aiChat.length === 0 && (
                        <div style={{color:'#5a5855',fontSize:'0.85rem',textAlign:'center',paddingTop:'2rem'}}>
                          Pergunta-me qualquer coisa sobre o teu negócio.<br/>
                          <span style={{fontSize:'0.78rem'}}>Ex: "Que peças devo comprar mais?", "Quais os clientes em risco de churn?", "Onde devo focar o marketing?"</span>
                        </div>
                      )}
                      {aiChat.map((m, i) => (
                        <div key={i} className={`ai-msg ${m.role === 'user' ? 'ai-user' : 'ai-bot'}`} style={{whiteSpace:'pre-wrap'}}>{m.content}</div>
                      ))}
                      {aiLoading && <div className="ai-msg ai-bot" style={{color:'#5a5855'}}>A analisar...</div>}
                    </div>
                    <div style={{display:'flex',gap:'0.75rem'}}>
                      <input className="inp" style={{flex:1}} value={aiPergunta} onChange={e => setAiPergunta(e.target.value)} onKeyDown={e => e.key === 'Enter' && perguntarAI()} placeholder="Pergunta ao consultor AI..." />
                      <button className="btn btn-k" onClick={perguntarAI} disabled={aiLoading}>Enviar</button>
                    </div>
                    <div style={{marginTop:'0.75rem',display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                      {["Que peças devo comprar mais?", "Quais clientes em risco de não voltar?", "Onde focar o marketing?", "Que preços ajustar?", "Análise geral do negócio"].map(q => (
                        <button key={q} className="btn btn-o btn-sm" onClick={() => { setAiPergunta(q); }}>{q}</button>
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
              <div style={{marginBottom:'2rem'}}><h1 className="bo-h1">Configurações</h1><p className="bo-sub">Preços e contactos</p></div>
              <div className="card">
                <p className="card-t">Preços e taxas</p>
                <div className="fg"><div><label className="lbl">Taxa higienização (€)</label><input className="inp" type="number" value={config.higienizacao} onChange={e => setConfig(c => ({...c, higienizacao: e.target.value}))} /></div></div>
              </div>
              <div className="card">
                <p className="card-t">Contactos</p>
                <div className="fg">
                  <div><label className="lbl">WhatsApp</label><input className="inp" value={config.whatsapp} onChange={e => setConfig(c => ({...c, whatsapp: e.target.value}))} placeholder="+351 912 345 678" /></div>
                  <div><label className="lbl">Email suporte</label><input className="inp" type="email" value={config.email_suporte} onChange={e => setConfig(c => ({...c, email_suporte: e.target.value}))} placeholder="suporte@noragrei.com" /></div>
                </div>
                <button className="btn btn-k" onClick={() => alert("Guardado!")}>Guardar</button>
              </div>
              <div className="card">
                <p className="card-t">Sistema de níveis</p>
                <table>
                  <thead><tr><th>Nível</th><th>Alugueres</th><th>Desconto caução</th><th>Caução paga</th></tr></thead>
                  <tbody>
                    {[["🥉 Bronze","0–4","0%","100%"],["🥈 Prata","5–9","25%","75%"],["🥇 Ouro","10–19","50%","50%"],["💎 Platina","20+ (sem danos)","100%","0%"]].map(([n,a,d,c]) => (
                      <tr key={n}><td><strong>{n}</strong></td><td>{a}</td><td style={{color:'#27ae60'}}>{d}</td><td>{c}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </main>
      </div>
    </>
  );
}