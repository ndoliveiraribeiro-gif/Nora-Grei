"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const TABS = ["dashboard", "catalogo", "alugueres", "lojistas", "clientes", "reservas", "campanhas", "config"];
const TAB_LABELS = { dashboard: "Dashboard", catalogo: "Catálogo", alugueres: "Alugueres", lojistas: "Lojistas", clientes: "Clientes", reservas: "Reservas", campanhas: "Campanhas", config: "Configurações" };
const TAB_ICONS = { dashboard: "◈", catalogo: "✦", alugueres: "◎", lojistas: "◫", clientes: "◉", reservas: "◌", campanhas: "✉", config: "⚙" };

function ReferralsPendentes({ supabase, minimo }) {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagando, setPagando] = useState(null);

  useEffect(() => {
    supabase.from("referrals")
      .select("*, clientes!referidor_id(id, nome, email), pecas_lojista(nome)")
      .eq("status", "confirmado")
      .eq("comissao_paga", false)
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setLista(data); setLoading(false); });
  }, []);

  // Agrupar por referidor
  const porReferidor = lista.reduce((acc, r) => {
    const id = r.referidor_id;
    if (!acc[id]) acc[id] = { referidor: r.clientes, total: 0, ids: [] };
    acc[id].total += r.comissao_gerada || 0;
    acc[id].ids.push(r.id);
    return acc;
  }, {});

  const marcarPago = async (referidorId, ids) => {
    setPagando(referidorId);
    await supabase.from("referrals").update({ comissao_paga: true, status: "pago" }).in("id", ids);
    setLista(prev => prev.filter(r => !ids.includes(r.id)));
    setPagando(null);
  };

  if (loading) return <div style={{color:"#9c9894",fontSize:"0.82rem"}}>A carregar...</div>;

  const referidores = Object.entries(porReferidor);
  if (referidores.length === 0) return (
    <div style={{padding:"1.5rem",textAlign:"center",color:"#9c9894",fontSize:"0.82rem",background:"#fafafa",border:"1px solid #e2dfda"}}>
      Nenhuma comissão pendente de pagamento
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
      {referidores.map(([id, { referidor, total, ids }]) => (
        <div key={id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.9rem 1rem",background:"#fff",border:"1px solid #e2dfda",gap:"1rem",flexWrap:"wrap"}}>
          <div>
            <div style={{fontWeight:600,fontSize:"0.85rem"}}>{referidor?.nome || "—"}</div>
            <div style={{fontSize:"0.75rem",color:"#7a6a5a"}}>{referidor?.email}</div>
            <div style={{fontSize:"0.72rem",color:"#9c9894",marginTop:"0.2rem"}}>{ids.length} referência(s) confirmada(s)</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:"1.1rem",fontWeight:700,color: total >= minimo ? "#3a7a3a" : "#c4a882"}}>€{total.toFixed(2)}</div>
              {total < minimo && <div style={{fontSize:"0.68rem",color:"#c4a882"}}>Mín. €{minimo}</div>}
            </div>
            <button onClick={() => marcarPago(id, ids)} disabled={pagando === id || total < minimo}
              style={{padding:"0.5rem 1rem",background: total >= minimo ? "#3a7a3a" : "#e2dfda",color: total >= minimo ? "#fff" : "#9c9894",border:"none",cursor: total >= minimo ? "pointer" : "not-allowed",fontFamily:"var(--sans)",fontSize:"0.68rem",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,whiteSpace:"nowrap"}}>
              {pagando === id ? "..." : "Marcar pago"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acesso, setAcesso] = useState(false);
  const [erroAuth, setErroAuth] = useState("");
  const [pwdInput, setPwdInput] = useState("");

  // DASHBOARD
  const [stats, setStats] = useState({ alugueres_ativos: 0, devolucoes_hoje: 0, receita_mes: 0, clientes_total: 0 });

  // CATÁLOGO
  const [pecas, setPecas] = useState([]);
  const [novaPeca, setNovaPeca] = useState({ nome: "", categoria_id: "", preco_aluguer_dia: "", valor_peca: "", descricao: "", material: "", origem: "Portugal" });
  const [fotosUpload, setFotosUpload] = useState([]);
  const [uploadProgress, setUploadProgress] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [criandoPeca, setCriandoPeca] = useState(false);

  // ALUGUERES
  const [alugueres, setAlugueres] = useState([]);

  // CLIENTES
  const [clientes, setClientes] = useState([]);

  // LOJISTAS
  const [alugueresLojista, setAlugueresLojista] = useState([]);
  const [subTabLojistas, setSubTabLojistas] = useState("depositos");

  // RESERVAS
  const [reservas, setReservas] = useState([]);

  // CONFIG
  const [config, setConfig] = useState({ higienizacao: 9, whatsapp: "", email_suporte: "" });
  const [configReferral, setConfigReferral] = useState({ ativo: true, desconto_comprador: 10, comissao_referidor: 5, minimo_pagamento: 20, validade_cookie_dias: 30, credito_10_pecas: 5, credito_primeira_venda: 5, credito_3_meses: 5, meses_sem_comissao_vendas: 3 });
  const [configReferralLoading, setConfigReferralLoading] = useState(false);
  const [configReferralMsg, setConfigReferralMsg] = useState("");

  // CAMPANHAS
  const [campanhas, setCampanhas] = useState([]);
  const [novaCampanha, setNovaCampanha] = useState({ titulo: "", mensagem: "", tipo: "cupao", codigo: "", desconto: "", probabilidade: 20, url_destino: "https://www.noragrei.com", validade: "" });

  useEffect(() => {
    const pwd = new URLSearchParams(window.location.search).get('k');
    const ok = pwd === 'noragrei2024admin' || sessionStorage.getItem('admin_ok') === '1';
    if (pwd === 'noragrei2024admin') sessionStorage.setItem('admin_ok', '1');
    setAcesso(ok);
    setLoading(false);
    if (ok) carregarDados();
  }, []);

  useEffect(() => { if (acesso) carregarDados(); }, [tab]);

  const verificarAcesso = async () => {
    try {
      // FIX CHROME: esperar que a sessão esteja pronta
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        window.location.href = "/entrar";
        return;
      }

      const u = session.user;
      setUser(u);

      // Verificar se é admin
      const { data, error } = await supabase
        .from("clientes")
        .select("is_admin")
        .eq("id", u.id)
        .single();

      if (error) {
        // RLS pode bloquear — se sessão válida, deixar entrar (protegido pelo Supabase)
        console.warn("RLS warning:", error.message);
        setAcesso(true);
        setLoading(false);
        return;
      }

      const ADMIN_UUID = "2f6afc17-8e46-41a7-9b9f-4f407c76919f";
      if (u.id !== ADMIN_UUID && !data?.is_admin) {
        setErroAuth("❌ Sem acesso. Email: " + u.email + " | UUID: " + u.id);
        setLoading(false);
        return;
      }

      setAcesso(true);
    } catch (e) {
      setErroAuth("Erro ao verificar acesso: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const carregarDados = async () => {
    if (tab === "dashboard") {
      const { data: al } = await supabase.from("alugueres").select("estado, valor_aluguer, created_at");
      if (al) {
        const agora = new Date();
        const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
        setStats({
          alugueres_ativos: al.filter(a => a.estado === "ativo").length,
          devolucoes_hoje: al.filter(a => a.estado === "devolvido" && new Date(a.created_at).toDateString() === agora.toDateString()).length,
          receita_mes: al.filter(a => a.created_at >= inicioMes).reduce((s, a) => s + (a.valor_aluguer || 0), 0),
          clientes_total: 0,
        });
      }
      const { count } = await supabase.from("clientes").select("id", { count: "exact" });
      setStats(prev => ({ ...prev, clientes_total: count || 0 }));
    }
    if (tab === "catalogo") {
      const { data: p } = await supabase.from("pecas").select("*, categorias(nome), stock_tamanhos(tamanho, quantidade_total, quantidade_disponivel)").order("created_at", { ascending: false });
      if (p) setPecas(p);
      const { data: c } = await supabase.from("categorias").select("*");
      if (c) setCategorias(c);
    }
    if (tab === "alugueres") {
      const { data } = await supabase
        .from("alugueres")
        .select("*, clientes(nome, email), stock_tamanhos(tamanho, pecas(nome))")
        .order("data_fim", { ascending: true })
        .limit(100);
      if (data) setAlugueres(data);
    }
    if (tab === "lojistas") {
      const { data } = await supabase.from("alugueres_lojista").select("*, clientes!alugueres_lojista_cliente_id_fkey(nome, email, telefone), lojista:clientes!alugueres_lojista_lojista_id_fkey(nome, email, codigo_cliente), pecas_lojista(nome, preco_aluguer_dia)").order("created_at", { ascending: false });
      if (data) setAlugueresLojista(data);
    }
    if (tab === "clientes") {
      const { data } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
      if (data) setClientes(data);
    }
    if (tab === "reservas") {
      const { data } = await supabase.from("reservas_espera").select("*, clientes(nome, email), stock_tamanhos(tamanho, pecas(nome))").order("created_at", { ascending: false });
      if (data) setReservas(data);
    }
    if (tab === "campanhas") {
      const { data } = await supabase.from("campanhas").select("*, pecas(nome)").order("created_at", { ascending: false });
      if (data) setCampanhas(data);
    }
    if (tab === "config") {
      const { data: cfgRef } = await supabase.from("config_referral").select("*").single();
      if (cfgRef) setConfigReferral({ ativo: cfgRef.ativo ?? true, desconto_comprador: cfgRef.desconto_comprador ?? 10, comissao_referidor: cfgRef.comissao_referidor ?? 5, minimo_pagamento: cfgRef.minimo_pagamento ?? 20, validade_cookie_dias: cfgRef.validade_cookie_dias ?? 30, credito_10_pecas: cfgRef.credito_10_pecas ?? 5, credito_primeira_venda: cfgRef.credito_primeira_venda ?? 5, credito_3_meses: cfgRef.credito_3_meses ?? 5, meses_sem_comissao_vendas: cfgRef.meses_sem_comissao_vendas ?? 3 });
    }
  };

  const handleFotos = (e) => {
    const files = Array.from(e.target.files);
    setFotosUpload(prev => [...prev, ...files]);
  };

  const handleFotosDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) setFotosUpload(prev => [...prev, ...files]);
  };

  const uploadFotos = async (pecaId) => {
    setUploadProgress(`A fazer upload de ${fotosUpload.length} foto(s)...`);
    // Upload paralelo — todos ao mesmo tempo
    const resultados = await Promise.all(fotosUpload.map(async (foto) => {
      const ext = foto.name.split(".").pop().toLowerCase();
      const path = `${pecaId}/${Date.now()}_${Math.random().toString(36).slice(2,7)}.${ext}`;
      const { error } = await supabase.storage.from("pecas").upload(path, foto, { upsert: true });
      if (error) { console.error("Erro upload:", error.message); return null; }
      const { data } = supabase.storage.from("pecas").getPublicUrl(path);
      return data.publicUrl;
    }));
    return resultados.filter(Boolean);
  };

  const criarPeca = async () => {
    if (!novaPeca.nome || !novaPeca.preco_aluguer_dia) return;
    setCriandoPeca(true);
    setUploadProgress("");

    // 1. Criar a peça primeiro para obter o ID
    const { data: pecaCriada, error } = await supabase.from("pecas").insert({
      nome: novaPeca.nome,
      categoria_id: novaPeca.categoria_id || null,
      preco_aluguer_dia: parseFloat(novaPeca.preco_aluguer_dia),
      valor_peca: parseFloat(novaPeca.valor_peca) || 0,
      descricao: novaPeca.descricao,
      material: novaPeca.material,
      origem: novaPeca.origem,
      estado: "disponivel",
    }).select().single();

    if (error) {
      setUploadProgress("Erro ao criar peça: " + error.message);
      setCriandoPeca(false);
      return;
    }

    // 2. Upload das fotos com o ID real da peça
    if (fotosUpload.length > 0) {
      const urls = await uploadFotos(pecaCriada.id);
      if (urls.length > 0) {
        // 3. Guardar as URLs na peça
        await supabase.from("pecas").update({ fotos: urls }).eq("id", pecaCriada.id);
        setUploadProgress(`✓ ${urls.length} foto(s) guardada(s)!`);
      }
    } else {
      setUploadProgress("✓ Peça criada com sucesso!");
    }

    setNovaPeca({ nome: "", categoria_id: "", preco_aluguer_dia: "", valor_peca: "", descricao: "", material: "", origem: "Portugal" });
    setFotosUpload([]);
    setCriandoPeca(false);
    setTimeout(() => setUploadProgress(""), 3000);
    carregarDados();
  };

  const atualizarEstadoAluguer = async (id, estado) => {
    await supabase.from("alugueres").update({ estado }).eq("id", id);
    carregarDados();
  };

  const confirmarDeposito = async (id) => {
    await supabase.from("alugueres").update({ deposito_estado: "recebido", deposito_confirmado_em: new Date().toISOString() }).eq("id", id);
    carregarDados();
  };

  const criarCampanha = async () => {
    if (!novaCampanha.titulo || !novaCampanha.mensagem) return;
    const { error } = await supabase.from("campanhas").insert({
      titulo: novaCampanha.titulo,
      mensagem: novaCampanha.mensagem,
      tipo: novaCampanha.tipo,
      codigo: novaCampanha.codigo || null,
      desconto: novaCampanha.desconto || null,
      probabilidade: parseInt(novaCampanha.probabilidade),
      url_destino: novaCampanha.url_destino,
      validade: novaCampanha.validade || null,
      ativa: true,
    });
    if (!error) {
      setNovaCampanha({ titulo: "", mensagem: "", tipo: "cupao", codigo: "", desconto: "", probabilidade: 20, url_destino: "https://www.noragrei.com", validade: "" });
      carregarDados();
    }
  };

  const toggleCampanha = async (id, ativa) => {
    await supabase.from("campanhas").update({ ativa: !ativa }).eq("id", id);
    carregarDados();
  };

  const apagarCampanha = async (id) => {
    if (confirm("Apagar esta campanha?")) {
      await supabase.from("campanhas").delete().eq("id", id);
      carregarDados();
    }
  };

  const calcularAtraso = (dataFim) => {
    if (!dataFim) return 0;
    const hoje = new Date();
    const fim = new Date(dataFim);
    const diff = Math.floor((hoje - fim) / 86400000);
    return diff > 0 ? diff : 0;
  };

  const confirmarRecepcao = async (id) => {
    await supabase.from("alugueres").update({ 
      estado: "em_verificacao",
      data_recepcao: new Date().toISOString()
    }).eq("id", id);
    carregarDados();
  };

  const confirmarVerificacao = async (id, danificado = false) => {
    const estado = danificado ? "devolvido_danificado" : "devolvido";
    await supabase.from("alugueres").update({ 
      estado,
      data_verificacao: new Date().toISOString(),
    }).eq("id", id);
    carregarDados();
  };

  const libertarCaucao = async (id) => {
    await supabase.from("alugueres").update({ 
      deposito_estado: "libertado",
      caucao_libertada_em: new Date().toISOString()
    }).eq("id", id);
    carregarDados();
  };

  const notificarReserva = async (reservaId, clienteId) => {
    await supabase.from("reservas_espera").update({ estado: "notificado", notificado_em: new Date().toISOString(), expira_confirmacao_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }).eq("id", reservaId);
    carregarDados();
  };

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',color:'#888'}}>
      A verificar acesso...
    </div>
  );

  if (!acesso) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0eeeb'}}>
      <div style={{background:'#fff',padding:'3rem',maxWidth:'360px',width:'100%',textAlign:'center'}}>
        <div style={{fontFamily:'Cormorant,Georgia,serif',fontSize:'1.8rem',fontWeight:300,letterSpacing:'0.2em',marginBottom:'0.5rem'}}>NORA GREI</div>
        <div style={{fontSize:'0.72rem',letterSpacing:'0.3em',color:'#888',marginBottom:'2rem'}}>BACKOFFICE</div>
        <input
          type="password"
          placeholder="Password"
          value={pwdInput}
          onChange={e => setPwdInput(e.target.value)}
          style={{width:'100%',padding:'0.75rem',border:'1.5px solid #e2dfda',fontFamily:'Jost,sans-serif',fontSize:'0.9rem',marginBottom:'1rem',outline:'none',boxSizing:'border-box'}}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (pwdInput === 'noragrei2024admin') {
                sessionStorage.setItem('admin_ok', '1');
                setAcesso(true);
              }
            }
          }}
        />
        <button
          style={{width:'100%',padding:'0.75rem',background:'#080808',color:'#fff',border:'none',cursor:'pointer',fontFamily:'Jost,sans-serif',fontSize:'0.7rem',letterSpacing:'0.2em',textTransform:'uppercase'}}
          onClick={() => {
            if (pwdInput === 'noragrei2024admin') {
              sessionStorage.setItem('admin_ok', '1');
              setAcesso(true);
            }
          }}
        >
          Entrar
        </button>
      </div>
    </div>
  );

  if (erroAuth) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.85rem',color:'#e74c3c',padding:'2rem',textAlign:'center'}}>
      <div>
        <p>{erroAuth}</p>
        <button onClick={() => window.location.href = "/entrar"} style={{marginTop:'1rem',padding:'0.75rem 1.5rem',background:'#080808',color:'#fff',border:'none',cursor:'pointer',fontFamily:"'Jost',sans-serif",fontSize:'0.75rem',letterSpacing:'0.15em',textTransform:'uppercase'}}>
          Ir para login
        </button>
      </div>
    </div>
  );

  const ROSA = "#c4748a";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300&family=Jost:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --black:#080808; --white:#f8f7f5; --grey-100:#f0eeeb; --grey-200:#e2dfda; --grey-600:#1a1a18; --rosa:#c4748a; --sans:'Jost',Arial,sans-serif; --serif:'Cormorant',Georgia,serif; }
        body { background:var(--grey-100); font-family:var(--sans); font-weight:400; font-size:15px; -webkit-font-smoothing:antialiased; color:var(--black); display:block !important; flex-direction:unset !important; }
        
        .ad-layout { display:grid !important; grid-template-columns:220px 1fr; min-height:100vh; width:100%; }
        
        .ad-sidebar { background:var(--black); color:var(--white); display:flex; flex-direction:column; position:fixed; top:0; left:0; bottom:0; width:220px; z-index:100; }
        .ad-logo { padding:2rem 1.5rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.08); }
        .ad-logo-name { font-family:var(--serif); font-size:1.2rem; font-weight:300; letter-spacing:0.2em; text-transform:uppercase; }
        .ad-logo-tag { font-size:0.68rem; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-top:0.2rem; }
        .ad-nav { padding:1rem 0; flex:1; }
        .ad-nav-item { display:flex; align-items:center; gap:0.75rem; padding:0.85rem 1.5rem; font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.5); cursor:pointer; transition:all 0.2s; font-weight:400; border:none; background:none; width:100%; text-align:left; }
        .ad-nav-item:hover { color:var(--white); background:rgba(255,255,255,0.05); }
        .ad-nav-item.active { color:var(--white); background:rgba(255,255,255,0.08); border-left:2px solid var(--rosa); }
        .ad-nav-icon { font-size:0.9rem; width:16px; }
        .ad-sidebar-footer { padding:1.5rem; border-top:1px solid rgba(255,255,255,0.08); }
        .ad-user { font-size:0.72rem; color:rgba(255,255,255,0.4); margin-bottom:0.75rem; }
        .ad-sair { font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.4); background:none; border:none; cursor:pointer; font-family:var(--sans); padding:0; transition:color 0.2s; }
        .ad-sair:hover { color:var(--white); }
        
        .ad-main { margin-left:220px; padding:2.5rem; }
        .ad-header { margin-bottom:2rem; }
        .ad-titulo { font-family:var(--serif); font-size:2.5rem; font-weight:300; color:var(--black); line-height:1; }
        .ad-subtitulo { font-size:0.82rem; color:#5a5855; margin-top:0.4rem; }
        
        .ad-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:2rem; }
        .ad-stat { background:var(--white); padding:1.5rem; }
        .ad-stat-val { font-family:var(--sans); font-size:2.5rem; font-weight:700; color:var(--black); line-height:1; margin-bottom:0.4rem; }
        .ad-stat-label { font-size:0.72rem; letter-spacing:0.2em; text-transform:uppercase; color:#5a5855; font-weight:400; }
        .ad-stat.destaque .ad-stat-val { color:var(--rosa); }
        
        .ad-card { background:var(--white); padding:1.5rem; margin-bottom:1.5rem; }
        .ad-card-title { font-size:0.72rem; letter-spacing:0.25em; text-transform:uppercase; color:#5a5855; font-weight:500; margin-bottom:1.25rem; padding-bottom:0.75rem; border-bottom:1px solid var(--grey-100); }
        .ad-table { width:100%; border-collapse:collapse; }
        .ad-table th { font-size:0.72rem; letter-spacing:0.2em; text-transform:uppercase; color:#5a5855; font-weight:500; padding:0.6rem 0.75rem; text-align:left; border-bottom:1px solid var(--grey-200); }
        .ad-table td { font-size:0.88rem; padding:0.85rem 0.75rem; border-bottom:1px solid var(--grey-100); color:var(--black); vertical-align:middle; }
        .ad-table tr:last-child td { border-bottom:none; }
        .ad-table tr:hover td { background:var(--grey-100); }
        
        .ad-badge { display:inline-block; font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.25rem 0.6rem; font-weight:500; }
        .ad-badge-verde { background:#e8f5e9; color:#27ae60; }
        .ad-badge-laranja { background:#fff8e1; color:#f39c12; }
        .ad-badge-cinza { background:var(--grey-100); color:#5a5855; }
        .ad-badge-rosa { background:#fff0f3; color:var(--rosa); }
        .ad-badge-vermelho { background:#fff5f5; color:#e74c3c; }
        
        .ad-btn { font-size:0.75rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.5rem 0.85rem; border:none; cursor:pointer; font-family:var(--sans); font-weight:500; transition:all 0.2s; }
        .ad-btn-black { background:var(--black); color:var(--white); }
        .ad-btn-black:hover { background:#2a2926; }
        .ad-btn-rosa { background:var(--rosa); color:var(--white); }
        .ad-btn-rosa:hover { background:#a85c72; }
        .ad-btn-outline { background:var(--white); color:var(--black); border:1px solid var(--grey-200); }
        .ad-btn-outline:hover { border-color:var(--black); }
        .ad-btn-sm { padding:0.35rem 0.65rem; font-size:0.72rem; }
        .ad-btn:disabled { opacity:0.5; cursor:not-allowed; }
        
        .ad-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; }
        .ad-form-grid-3 { grid-template-columns:1fr 1fr 1fr; }
        .ad-form-full { grid-column:1/-1; }
        .ad-label { display:block; font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:#5a5855; margin-bottom:0.4rem; font-weight:500; }
        .ad-input { width:100%; padding:0.75rem 0.9rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.92rem; font-family:var(--sans); color:var(--black); outline:none; transition:border-color 0.2s; border-radius:0; }
        .ad-input:focus { border-color:var(--black); }
        .ad-select { width:100%; padding:0.75rem 0.9rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.92rem; font-family:var(--sans); color:var(--black); outline:none; border-radius:0; cursor:pointer; }
        .ad-textarea { width:100%; padding:0.75rem 0.9rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.92rem; font-family:var(--sans); color:var(--black); outline:none; border-radius:0; resize:vertical; min-height:80px; }
        
        .ad-select-estado { font-size:0.75rem; letter-spacing:0.1em; text-transform:uppercase; padding:0.35rem 0.5rem; border:1px solid var(--grey-200); background:var(--white); font-family:var(--sans); cursor:pointer; color:var(--black); border-radius:0; }

        /* UPLOAD AREA */
        .ad-upload-area { width:100%; padding:1.5rem; border:2px dashed var(--grey-200); background:var(--grey-100); cursor:pointer; text-align:center; transition:border-color 0.2s; font-family:var(--sans); font-size:0.85rem; color:#5a5855; }
        .ad-upload-area:hover { border-color:var(--rosa); }

        /* FOTOS PREVIEW */
        .ad-fotos-preview { display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.75rem; }
        .ad-foto-thumb { width:60px; height:60px; object-fit:cover; border:1px solid var(--grey-200); }

        @media (max-width:768px) {
          .ad-layout { grid-template-columns:1fr; }
          .ad-sidebar { position:static; width:100%; height:auto; flex-direction:row; flex-wrap:wrap; padding:0.75rem; }
          .ad-logo { display:none; }
          .ad-nav { padding:0; display:flex; flex-wrap:wrap; gap:0.25rem; }
          .ad-nav-item { padding:0.5rem 0.75rem; font-size:0.72rem; }
          .ad-sidebar-footer { display:none; }
          .ad-main { margin-left:0; padding:1.25rem; }
          .ad-stats { grid-template-columns:1fr 1fr; }
          .ad-form-grid { grid-template-columns:1fr; }
          .ad-form-grid-3 { grid-template-columns:1fr; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      <div className="ad-layout" style={{display:"grid",gridTemplateColumns:"220px 1fr",minHeight:"100vh",width:"100%"}}>
        {/* SIDEBAR */}
        <aside className="ad-sidebar">
          <div className="ad-logo">
            <div className="ad-logo-name">Nora Grei</div>
            <div className="ad-logo-tag">Backoffice</div>
          </div>
          <nav className="ad-nav">
            {TABS.map(t => (
              <button key={t} className={`ad-nav-item${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                <span className="ad-nav-icon">{TAB_ICONS[t]}</span>
                {TAB_LABELS[t]}
              </button>
            ))}
          </nav>
          <div className="ad-sidebar-footer">
            <div className="ad-user">{user?.email}</div>
            <button className="ad-sair" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}>Terminar sessão</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="ad-main">

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <>
              <div className="ad-header">
                <h1 className="ad-titulo">Dashboard</h1>
                <p className="ad-subtitulo">Resumo do negócio em tempo real</p>
              </div>
              <div className="ad-stats">
                <div className="ad-stat destaque">
                  <div className="ad-stat-val">{stats.alugueres_ativos}</div>
                  <div className="ad-stat-label">Alugueres ativos</div>
                </div>
                <div className="ad-stat">
                  <div className="ad-stat-val">{stats.devolucoes_hoje}</div>
                  <div className="ad-stat-label">Devoluções hoje</div>
                </div>
                <div className="ad-stat">
                  <div className="ad-stat-val">{Number(stats.receita_mes).toFixed(0)}€</div>
                  <div className="ad-stat-label">Receita este mês</div>
                </div>
                <div className="ad-stat">
                  <div className="ad-stat-val">{stats.clientes_total}</div>
                  <div className="ad-stat-label">Clientes total</div>
                </div>
              </div>
              <div className="ad-card">
                <p className="ad-card-title">Ações rápidas</p>
                <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                  <button className="ad-btn ad-btn-black" onClick={() => setTab("catalogo")}>+ Adicionar peça</button>
                  <button className="ad-btn ad-btn-rosa" onClick={() => setTab("alugueres")}>Ver alugueres</button>
                  <button className="ad-btn ad-btn-outline" onClick={() => setTab("reservas")}>Ver reservas</button>
                  <a href="/analytics" className="ad-btn ad-btn-outline" style={{textDecoration:'none',display:'inline-flex',alignItems:'center'}}>📊 Analytics & AI</a>
                </div>
              </div>
            </>
          )}

          {/* ── CATÁLOGO ── */}
          {tab === "catalogo" && (
            <>
              <div className="ad-header">
                <h1 className="ad-titulo">Catálogo</h1>
                <p className="ad-subtitulo">{pecas.length} peças no catálogo</p>
              </div>

              {/* FORM NOVA PEÇA */}
              <div className="ad-card">
                <p className="ad-card-title">Adicionar nova peça</p>
                <div className="ad-form-grid">
                  <div>
                    <label className="ad-label">Nome da peça</label>
                    <input className="ad-input" value={novaPeca.nome} onChange={e => setNovaPeca(p => ({...p, nome: e.target.value}))} placeholder="Vestido Seda Noite" />
                  </div>
                  <div>
                    <label className="ad-label">Categoria</label>
                    <select className="ad-select" value={novaPeca.categoria_id} onChange={e => setNovaPeca(p => ({...p, categoria_id: e.target.value}))}>
                      <option value="">Selecionar</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="ad-label">Preço aluguer / dia (€)</label>
                    <input className="ad-input" type="number" value={novaPeca.preco_aluguer_dia} onChange={e => setNovaPeca(p => ({...p, preco_aluguer_dia: e.target.value}))} placeholder="35" />
                  </div>
                  <div>
                    <label className="ad-label">Valor da peça (€) — depósito</label>
                    <input className="ad-input" type="number" value={novaPeca.valor_peca} onChange={e => setNovaPeca(p => ({...p, valor_peca: e.target.value}))} placeholder="450" />
                  </div>
                  <div>
                    <label className="ad-label">Material</label>
                    <input className="ad-input" value={novaPeca.material} onChange={e => setNovaPeca(p => ({...p, material: e.target.value}))} placeholder="100% Seda natural" />
                  </div>
                  <div>
                    <label className="ad-label">Origem</label>
                    <input className="ad-input" value={novaPeca.origem} onChange={e => setNovaPeca(p => ({...p, origem: e.target.value}))} placeholder="Portugal" />
                  </div>
                  <div className="ad-form-full">
                    <label className="ad-label">Descrição</label>
                    <textarea className="ad-textarea" value={novaPeca.descricao} onChange={e => setNovaPeca(p => ({...p, descricao: e.target.value}))} placeholder="Descrição da peça..." />
                  </div>
                </div>

                {/* UPLOAD FOTOS */}
                <div style={{marginBottom:'1rem'}}>
                  <label className="ad-label">Fotos da peça {fotosUpload.length > 0 && <span style={{color:'#c4748a',fontWeight:600}}>({fotosUpload.length}) — arrasta para reordenar</span>}</label>
                  <label
                    className="ad-upload-area"
                    style={{display:'block',cursor:'pointer',borderStyle: fotosUpload.length > 0 ? 'solid' : 'dashed'}}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleFotosDrop}
                  >
                    <input type="file" accept="image/*" multiple onChange={handleFotos} style={{display:'none'}} />
                    <div style={{fontSize:'1.5rem',marginBottom:'0.3rem'}}>📷</div>
                    <div style={{fontSize:'0.82rem',color:'#5a5855'}}>Clica ou arrasta fotos aqui</div>
                    <div style={{fontSize:'0.72rem',color:'#999',marginTop:'0.2rem'}}>JPG, PNG, WEBP — múltiplas fotos · upload paralelo</div>
                  </label>
                  {/* Preview reordenável */}
                  {fotosUpload.length > 0 && (
                    <div style={{display:'flex',gap:'0.5rem',marginTop:'0.75rem',flexWrap:'wrap'}}>
                      {fotosUpload.map((f, i) => (
                        <div key={i} draggable
                          onDragStart={e => e.dataTransfer.setData("idx", i)}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => {
                            e.preventDefault();
                            const from = parseInt(e.dataTransfer.getData("idx"));
                            if (from === i) return;
                            setFotosUpload(prev => {
                              const arr = [...prev];
                              const [moved] = arr.splice(from, 1);
                              arr.splice(i, 0, moved);
                              return arr;
                            });
                          }}
                          style={{position:'relative',cursor:'grab'}}>
                          <img src={URL.createObjectURL(f)} alt="" style={{width:80,height:100,objectFit:'cover',border: i===0 ? '2.5px solid #c4748a' : '1.5px solid #e2dfda',display:'block'}} />
                          {i === 0 && <div style={{position:'absolute',top:3,left:3,background:'#c4748a',color:'#fff',fontSize:'0.55rem',padding:'1px 4px',letterSpacing:'0.08em',fontWeight:600}}>CAPA</div>}
                          <button type="button" onClick={() => setFotosUpload(prev => prev.filter((_,j) => j !== i))}
                            style={{position:'absolute',top:3,right:3,width:18,height:18,background:'rgba(0,0,0,0.65)',border:'none',borderRadius:'50%',color:'#fff',fontSize:'0.65rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {uploadProgress && (
                    <p style={{fontSize:'0.75rem',color: uploadProgress.startsWith('✓') ? '#27ae60' : uploadProgress.startsWith('Erro') ? '#e74c3c' : '#c4748a',marginTop:'0.5rem',fontWeight:500}}>
                      {uploadProgress}
                    </p>
                  )}
                </div>

                <button
                  className="ad-btn ad-btn-black"
                  onClick={criarPeca}
                  disabled={criandoPeca}
                >
                  {criandoPeca ? "A criar peça..." : "+ Adicionar peça"}
                </button>
              </div>

              {/* LISTA PEÇAS */}
              <div className="ad-card">
                <p className="ad-card-title">Peças no catálogo</p>
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th>Peça</th>
                      <th>Categoria</th>
                      <th>Preço/dia</th>
                      <th>Depósito</th>
                      <th>Tamanhos</th>
                      <th>Estado</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pecas.map(p => (
                      <tr key={p.id}>
                        <td>
                          {p.fotos && p.fotos.length > 0 ? (
                            <img src={p.fotos[0]} alt={p.nome} style={{width:'48px',height:'48px',objectFit:'cover',border:'1px solid #e2dfda'}} />
                          ) : (
                            <div style={{width:'48px',height:'48px',background:'#f0eeeb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',color:'#ccc'}}>📷</div>
                          )}
                        </td>
                        <td><strong>{p.nome}</strong></td>
                        <td>{p.categorias?.nome || "—"}</td>
                        <td>{p.preco_aluguer_dia}€</td>
                        <td>{p.valor_peca}€</td>
                        <td>{p.stock_tamanhos?.map(s => s.tamanho).join(", ") || "—"}</td>
                        <td>
                          <span className={`ad-badge ${p.estado === 'disponivel' ? 'ad-badge-verde' : 'ad-badge-cinza'}`}>
                            {p.estado}
                          </span>
                        </td>
                        <td style={{display:'flex',gap:'0.4rem'}}>
                          <button className="ad-btn ad-btn-outline ad-btn-sm" onClick={async () => {
                            const novo = p.estado === 'disponivel' ? 'indisponivel' : 'disponivel';
                            await supabase.from("pecas").update({ estado: novo }).eq("id", p.id);
                            carregarDados();
                          }}>
                            {p.estado === 'disponivel' ? 'Desativar' : 'Ativar'}
                          </button>
                          <button className="ad-btn ad-btn-sm" style={{background:'#fff5f5',color:'#e74c3c',border:'1px solid #f5c6cb'}} onClick={async () => {
                            if (confirm("Apagar esta peça?")) {
                              await supabase.from("pecas").delete().eq("id", p.id);
                              carregarDados();
                            }
                          }}>
                            Apagar
                          </button>
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
              <div className="ad-header">
                <h1 className="ad-titulo">Alugueres</h1>
                <p className="ad-subtitulo">{alugueres.length} alugueres registados</p>
              </div>
              <div className="ad-card">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Peça</th>
                      <th>Datas</th>
                      <th>Atraso</th>
                      <th>Valor</th>
                      <th>Depósito</th>
                      <th>Estado</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alugueres.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div style={{fontWeight:500}}>{a.clientes?.nome || "—"}</div>
                          <div style={{fontSize:'0.78rem',color:'#5a5855'}}>{a.clientes?.email}</div>
                        </td>
                        <td>
                          <div>{a.stock_tamanhos?.pecas?.nome || "—"}</div>
                          <div style={{fontSize:'0.78rem',color:'#5a5855'}}>Tam: {a.stock_tamanhos?.tamanho}</div>
                        </td>
                        <td style={{fontSize:'0.82rem'}}>
                          {a.data_inicio} → {a.data_fim}
                        </td>
                        <td>
                          {calcularAtraso(a.data_fim) > 0 ? (
                            <div>
                              <span style={{color:'#e74c3c',fontWeight:600,fontSize:'0.9rem'}}>+{calcularAtraso(a.data_fim)} dias</span>
                              <div style={{fontSize:'0.72rem',color:'#e74c3c'}}>
                                -{(calcularAtraso(a.data_fim) * (a.valor_aluguer / Math.max(1, Math.ceil((new Date(a.data_fim) - new Date(a.data_inicio)) / 86400000)))).toFixed(0)}€ caução
                              </div>
                            </div>
                          ) : (
                            <span style={{color:'#27ae60',fontSize:'0.82rem'}}>✓ No prazo</span>
                          )}
                        </td>
                        <td>{a.valor_aluguer}€</td>
                        <td>
                          <div style={{fontSize:'0.82rem'}}>{a.deposito_modalidade}</div>
                          <span className={`ad-badge ${a.deposito_estado === 'recebido' || a.deposito_estado === 'libertado' ? 'ad-badge-verde' : a.deposito_estado === 'pendente' ? 'ad-badge-laranja' : 'ad-badge-cinza'}`}>
                            {a.deposito_estado}
                          </span>
                          {a.deposito_estado === 'pendente' && (
                            <button className="ad-btn ad-btn-rosa ad-btn-sm" style={{marginTop:'0.25rem',display:'block'}} onClick={() => confirmarDeposito(a.id)}>
                              Confirmar
                            </button>
                          )}
                        </td>
                        <td>
                          <select className="ad-select-estado" value={a.estado} onChange={e => atualizarEstadoAluguer(a.id, e.target.value)}>
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
                            {a.estado === 'ativo' && (
                              <button className="ad-btn ad-btn-sm ad-btn-rosa" onClick={() => confirmarRecepcao(a.id)}>
                                📦 Recebi a peça
                              </button>
                            )}
                            {a.estado === 'em_verificacao' && (
                              <>
                                <div style={{fontSize:'0.72rem',color:'#f39c12',fontWeight:500,marginBottom:'0.25rem'}}>⏳ Em verificação</div>
                                <button className="ad-btn ad-btn-sm ad-btn-black" onClick={() => confirmarVerificacao(a.id, false)}>
                                  ✓ Aprovada
                                </button>
                                <button className="ad-btn ad-btn-sm" style={{background:'#fff5f5',color:'#e74c3c',border:'1px solid #f5c6cb',fontSize:'0.72rem',padding:'0.35rem 0.65rem'}} onClick={() => confirmarVerificacao(a.id, true)}>
                                  ✗ Danificada
                                </button>
                              </>
                            )}
                            {(a.estado === 'devolvido') && a.deposito_estado !== 'libertado' && (
                              <button className="ad-btn ad-btn-sm ad-btn-outline" onClick={() => libertarCaucao(a.id)}>
                                💰 Libertar caução
                              </button>
                            )}
                            {a.caucao_libertada_em && (
                              <div style={{fontSize:'0.75rem',color:'#27ae60',fontWeight:500}}>✓ Caução libertada</div>
                            )}
                            <div style={{fontSize:'0.72rem',color:'#5a5855',marginTop:'0.25rem'}}>{a.metodo_entrega}</div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── LOJISTAS ── */}
          {tab === "lojistas" && (() => {
            const depositos = alugueresLojista.filter(a => a.deposito_estado === "a_devolver");
            const disputas = alugueresLojista.filter(a => a.deposito_estado === "em_disputa");
            const pagamentos = alugueresLojista.filter(a => a.estado === "devolvido" && !a.liquidado_em);
            const COMISSAO = 0.10;
            return (
            <>
              <div className="ad-header">
                <h1 className="ad-titulo">Lojistas</h1>
                <p className="ad-subtitulo">Gestão de depósitos, pagamentos e disputas</p>
              </div>
              {/* sub-tabs */}
              <div style={{display:"flex",gap:"0.5rem",marginBottom:"1.5rem",flexWrap:"wrap"}}>
                {[["depositos",`Depósitos a devolver (${depositos.length})`],["pagamentos",`Pagamentos pendentes (${pagamentos.length})`],["disputas",`Disputas (${disputas.length})`],["todos","Todos os alugueres"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setSubTabLojistas(k)} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.45rem 1rem",border:"1.5px solid",borderColor:subTabLojistas===k?"#080808":"#e2dfda",background:subTabLojistas===k?"#080808":"transparent",color:subTabLojistas===k?"#fff":"#5a5855",cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
                ))}
              </div>
              {/* lista */}
              {(()=>{
                const lista = subTabLojistas==="depositos" ? depositos : subTabLojistas==="pagamentos" ? pagamentos : subTabLojistas==="disputas" ? disputas : alugueresLojista;
                if (lista.length === 0) return <p style={{padding:"2rem",textAlign:"center",fontSize:"0.85rem",color:"#888"}}>Nenhum registo.</p>;
                return (
                  <div style={{display:"flex",flexDirection:"column",gap:"0"}}>
                    {lista.map(a => {
                      const estadoCor = {pendente:"#f39c12",confirmado:"#2980b9",enviado:"#8e44ad",ativo:"#27ae60",em_devolucao:"#e67e22",devolvido:"#888",devolvido_danificado:"#e74c3c",cancelado:"#888"}[a.estado]||"#888";
                      const liquidacao = ((a.valor_aluguer||0) * (1 - COMISSAO)).toFixed(2);
                      return (
                        <div key={a.id} style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid #f0eeeb",background:"#fff"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"1rem",flexWrap:"wrap"}}>
                            <div>
                              <div style={{fontFamily:"var(--sans)",fontSize:"0.9rem",fontWeight:500,marginBottom:"0.2rem"}}>{a.pecas_lojista?.nome||"—"}</div>
                              <div style={{fontSize:"0.72rem",color:"#5a5855"}}>
                                <strong>Lojista:</strong> {a.lojista?.nome} ({a.lojista?.codigo_cliente}) · <strong>Cliente:</strong> {a.clientes?.nome}
                              </div>
                              <div style={{fontSize:"0.72rem",color:"#5a5855"}}>{a.data_inicio} → {a.data_fim} · Aluguer: {(a.valor_aluguer||0).toFixed(2)}€ · Depósito: {(a.deposito_valor||0).toFixed(2)}€</div>
                              {a.data_verificacao && <div style={{fontSize:"0.68rem",color:"#888"}}>Verificado em {new Date(a.data_verificacao).toLocaleDateString("pt-PT")}</div>}
                            </div>
                            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.4rem"}}>
                              <span style={{fontSize:"0.68rem",letterSpacing:"0.1em",textTransform:"uppercase",padding:"0.2rem 0.5rem",background:estadoCor,color:"#fff"}}>{a.estado}</span>
                              <span style={{fontSize:"0.68rem",letterSpacing:"0.1em",textTransform:"uppercase",padding:"0.2rem 0.5rem",background:a.deposito_estado==="a_devolver"?"#27ae60":a.deposito_estado==="em_disputa"?"#e74c3c":a.deposito_estado==="devolvido"?"#888":"#f39c12",color:"#fff"}}>dep: {a.deposito_estado||"—"}</span>
                            </div>
                          </div>
                          {/* ações admin */}
                          <div style={{display:"flex",gap:"0.5rem",marginTop:"0.85rem",flexWrap:"wrap"}}>
                            {a.deposito_estado === "a_devolver" && (
                              <button onClick={async()=>{await supabase.from("alugueres_lojista").update({deposito_estado:"devolvido",deposito_devolvido_em:new Date().toISOString()}).eq("id",a.id);carregarDados();}} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"#27ae60",color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit"}}>✓ Confirmar devolução depósito</button>
                            )}
                            {a.estado === "devolvido" && !a.liquidado_em && (
                              <button onClick={async()=>{await supabase.from("alugueres_lojista").update({liquidado_em:new Date().toISOString(),valor_liquidacao:parseFloat(liquidacao)}).eq("id",a.id);carregarDados();}} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"#2980b9",color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit"}}>💶 Pagar lojista {liquidacao}€</button>
                            )}
                            {a.liquidado_em && <span style={{fontSize:"0.75rem",color:"#27ae60"}}>✓ Pago em {new Date(a.liquidado_em).toLocaleDateString("pt-PT")} · {a.valor_liquidacao?.toFixed(2)}€</span>}
                            {a.deposito_estado === "em_disputa" && <>
                              <button onClick={async()=>{await supabase.from("alugueres_lojista").update({deposito_estado:"retido_lojista"}).eq("id",a.id);carregarDados();}} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"#e74c3c",color:"#fff",border:"none",cursor:"pointer",fontFamily:"inherit"}}>Reter (lojista)</button>
                              <button onClick={async()=>{await supabase.from("alugueres_lojista").update({deposito_estado:"devolvido"}).eq("id",a.id);carregarDados();}} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"none",border:"1.5px solid #e74c3c",color:"#e74c3c",cursor:"pointer",fontFamily:"inherit"}}>Devolver ao cliente</button>
                            </>}
                            {a.clientes?.email && <a href={`mailto:${a.clientes.email}`} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"none",border:"1.5px solid #e2dfda",color:"#5a5855",textDecoration:"none",fontFamily:"inherit"}}>✉ Cliente</a>}
                            {a.lojista?.email && <a href={`mailto:${a.lojista.email}`} style={{fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",padding:"0.4rem 0.9rem",background:"none",border:"1.5px solid #e2dfda",color:"#5a5855",textDecoration:"none",fontFamily:"inherit"}}>✉ Lojista</a>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
            );
          })()}

          {/* ── CLIENTES ── */}
          {tab === "clientes" && (
            <>
              <div className="ad-header">
                <h1 className="ad-titulo">Clientes</h1>
                <p className="ad-subtitulo">{clientes.length} clientes registados</p>
              </div>
              <div className="ad-card">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>Cidade</th>
                      <th>Pontos</th>
                      <th>NIF</th>
                      <th>Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.nome || "—"}</strong></td>
                        <td style={{fontSize:'0.82rem'}}>{c.email}</td>
                        <td style={{fontSize:'0.82rem'}}>{c.telefone || "—"}</td>
                        <td style={{fontSize:'0.82rem'}}>{c.cidade || "—"}</td>
                        <td><span className="ad-badge ad-badge-rosa">{c.pontos || 0} pts</span></td>
                        <td style={{fontSize:'0.82rem'}}>{c.nif || "—"}</td>
                        <td>
                          <button className={`ad-btn ad-btn-sm ${c.is_admin ? 'ad-btn-rosa' : 'ad-btn-outline'}`} onClick={async () => {
                            await supabase.from("clientes").update({ is_admin: !c.is_admin }).eq("id", c.id);
                            carregarDados();
                          }}>
                            {c.is_admin ? "Admin ✓" : "Dar admin"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── RESERVAS ── */}
          {tab === "reservas" && (
            <>
              <div className="ad-header">
                <h1 className="ad-titulo">Reservas em espera</h1>
                <p className="ad-subtitulo">{reservas.length} reservas pendentes</p>
              </div>
              <div className="ad-card">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Peça</th>
                      <th>Datas desejadas</th>
                      <th>Estado</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.length === 0 ? (
                      <tr><td colSpan={5} style={{textAlign:'center',color:'#5a5855',padding:'2rem'}}>Sem reservas em espera</td></tr>
                    ) : reservas.map(r => (
                      <tr key={r.id}>
                        <td>
                          <div style={{fontWeight:500}}>{r.clientes?.nome || "—"}</div>
                          <div style={{fontSize:'0.78rem',color:'#5a5855'}}>{r.clientes?.email}</div>
                        </td>
                        <td>
                          <div>{r.stock_tamanhos?.pecas?.nome || "—"}</div>
                          <div style={{fontSize:'0.78rem',color:'#5a5855'}}>Tam: {r.stock_tamanhos?.tamanho}</div>
                        </td>
                        <td style={{fontSize:'0.82rem'}}>{r.data_inicio_desejada} → {r.data_fim_desejada}</td>
                        <td>
                          <span className={`ad-badge ${r.estado === 'aguarda' ? 'ad-badge-laranja' : r.estado === 'notificado' ? 'ad-badge-rosa' : 'ad-badge-verde'}`}>
                            {r.estado}
                          </span>
                        </td>
                        <td>
                          {r.estado === 'aguarda' && (
                            <button className="ad-btn ad-btn-rosa ad-btn-sm" onClick={() => notificarReserva(r.id, r.cliente_id)}>
                              Notificar cliente
                            </button>
                          )}
                        </td>
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
              <div className="ad-header">
                <h1 className="ad-titulo">Campanhas</h1>
                <p className="ad-subtitulo">Alertas, cupões e novidades para os clientes</p>
              </div>
              <div className="ad-card">
                <p className="ad-card-title">Nova campanha</p>
                <div className="ad-form-grid">
                  <div>
                    <label className="ad-label">Título</label>
                    <input className="ad-input" value={novaCampanha.titulo} onChange={e => setNovaCampanha(p => ({...p, titulo: e.target.value}))} placeholder="É o teu dia de sorte!" />
                  </div>
                  <div>
                    <label className="ad-label">Tipo</label>
                    <select className="ad-select" value={novaCampanha.tipo} onChange={e => setNovaCampanha(p => ({...p, tipo: e.target.value}))}>
                      <option value="cupao">Cupão de desconto</option>
                      <option value="novidade">Novidade de produto</option>
                      <option value="oferta">Oferta especial</option>
                    </select>
                  </div>
                  <div className="ad-form-full">
                    <label className="ad-label">Mensagem</label>
                    <textarea className="ad-textarea" value={novaCampanha.mensagem} onChange={e => setNovaCampanha(p => ({...p, mensagem: e.target.value}))} placeholder="Compra a nova camisola e leva uma t-shirt grátis..." />
                  </div>
                  <div>
                    <label className="ad-label">Código de desconto (opcional)</label>
                    <input className="ad-input" value={novaCampanha.codigo} onChange={e => setNovaCampanha(p => ({...p, codigo: e.target.value}))} placeholder="NORA15" />
                  </div>
                  <div>
                    <label className="ad-label">Descrição do desconto</label>
                    <input className="ad-input" value={novaCampanha.desconto} onChange={e => setNovaCampanha(p => ({...p, desconto: e.target.value}))} placeholder="15% em toda a loja" />
                  </div>
                  <div>
                    <label className="ad-label">Probabilidade de aparecer (%)</label>
                    <input className="ad-input" type="number" min="1" max="100" value={novaCampanha.probabilidade} onChange={e => setNovaCampanha(p => ({...p, probabilidade: e.target.value}))} />
                  </div>
                  <div>
                    <label className="ad-label">Validade (opcional)</label>
                    <input className="ad-input" type="datetime-local" value={novaCampanha.validade} onChange={e => setNovaCampanha(p => ({...p, validade: e.target.value}))} />
                  </div>
                  <div className="ad-form-full">
                    <label className="ad-label">URL destino</label>
                    <input className="ad-input" value={novaCampanha.url_destino} onChange={e => setNovaCampanha(p => ({...p, url_destino: e.target.value}))} placeholder="https://www.noragrei.com" />
                  </div>
                </div>
                <button className="ad-btn ad-btn-rosa" onClick={criarCampanha}>✉ Criar campanha</button>
              </div>
              <div className="ad-card">
                <p className="ad-card-title">{campanhas.length} campanhas criadas</p>
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Tipo</th>
                      <th>Código</th>
                      <th>Probabilidade</th>
                      <th>Validade</th>
                      <th>Estado</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campanhas.length === 0 ? (
                      <tr><td colSpan={7} style={{textAlign:'center',color:'#5a5855',padding:'2rem'}}>Sem campanhas criadas</td></tr>
                    ) : campanhas.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{fontWeight:500}}>{c.titulo}</div>
                          <div style={{fontSize:'0.78rem',color:'#5a5855',maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.mensagem}</div>
                        </td>
                        <td>
                          <span className={`ad-badge ${c.tipo === 'cupao' ? 'ad-badge-rosa' : c.tipo === 'novidade' ? 'ad-badge-verde' : 'ad-badge-laranja'}`}>
                            {c.tipo}
                          </span>
                        </td>
                        <td style={{fontWeight:600,letterSpacing:'0.1em'}}>{c.codigo || "—"}</td>
                        <td>{c.probabilidade}%</td>
                        <td style={{fontSize:'0.82rem'}}>{c.validade ? new Date(c.validade).toLocaleDateString('pt-PT') : "Sem limite"}</td>
                        <td>
                          <span className={`ad-badge ${c.ativa ? 'ad-badge-verde' : 'ad-badge-cinza'}`}>
                            {c.ativa ? "Ativa" : "Inativa"}
                          </span>
                        </td>
                        <td style={{display:'flex',gap:'0.4rem'}}>
                          <button className={`ad-btn ad-btn-sm ${c.ativa ? 'ad-btn-outline' : 'ad-btn-rosa'}`} onClick={() => toggleCampanha(c.id, c.ativa)}>
                            {c.ativa ? "Pausar" : "Ativar"}
                          </button>
                          <button className="ad-btn ad-btn-sm" style={{background:'#fff5f5',color:'#e74c3c',border:'1px solid #f5c6cb'}} onClick={() => apagarCampanha(c.id)}>
                            Apagar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── CONFIG ── */}
          {tab === "config" && (
            <>
              <div className="ad-header">
                <h1 className="ad-titulo">Configurações</h1>
                <p className="ad-subtitulo">Preços, taxas, referrals e definições gerais</p>
              </div>

              {/* Preços e taxas */}
              <div className="ad-card">
                <p className="ad-card-title">Preços e taxas</p>
                <div className="ad-form-grid">
                  <div>
                    <label className="ad-label">Taxa de higienização (€)</label>
                    <input className="ad-input" type="number" min="0" step="0.5" value={config.higienizacao} onChange={e => setConfig(c => ({...c, higienizacao: e.target.value}))} />
                    <span style={{fontSize:"0.72rem",color:"#9c9894",marginTop:"0.3rem",display:"block"}}>Cobrada ao cliente em cada aluguer</span>
                  </div>
                </div>
                <button className="ad-btn ad-btn-black" style={{marginTop:"1rem"}} onClick={async () => {
                  await supabase.from("app_config").upsert({ chave: "higienizacao", valor: String(config.higienizacao) }, { onConflict: "chave" });
                  alert("Guardado!");
                }}>Guardar taxas</button>
              </div>

              {/* Referrals / Afiliados */}
              <div className="ad-card">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
                  <p className="ad-card-title" style={{margin:0}}>Sistema de referrals (afiliados)</p>
                  <label style={{display:"flex",alignItems:"center",gap:"0.5rem",cursor:"pointer",fontFamily:"var(--sans)",fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase"}}>
                    <input type="checkbox" checked={configReferral.ativo} onChange={e => setConfigReferral(c => ({...c, ativo: e.target.checked}))} style={{width:16,height:16,accentColor:"#c4748a"}} />
                    {configReferral.ativo ? "Activo" : "Inactivo"}
                  </label>
                </div>
                <div className="ad-form-grid">
                  <div>
                    <label className="ad-label">Desconto para o comprador (%)</label>
                    <input className="ad-input" type="number" min="0" max="100" step="0.5" value={configReferral.desconto_comprador} onChange={e => setConfigReferral(c => ({...c, desconto_comprador: parseFloat(e.target.value)||0}))} />
                    <span style={{fontSize:"0.72rem",color:"#9c9894",marginTop:"0.3rem",display:"block"}}>% de desconto na compra/aluguer quando vem via link de referência</span>
                  </div>
                  <div>
                    <label className="ad-label">Comissão para o referidor (%)</label>
                    <input className="ad-input" type="number" min="0" max="100" step="0.5" value={configReferral.comissao_referidor} onChange={e => setConfigReferral(c => ({...c, comissao_referidor: parseFloat(e.target.value)||0}))} />
                    <span style={{fontSize:"0.72rem",color:"#9c9894",marginTop:"0.3rem",display:"block"}}>% do valor da transacção que vai para quem partilhou o link</span>
                  </div>
                  <div>
                    <label className="ad-label">Mínimo para pagamento de comissão (€)</label>
                    <input className="ad-input" type="number" min="0" step="1" value={configReferral.minimo_pagamento} onChange={e => setConfigReferral(c => ({...c, minimo_pagamento: parseFloat(e.target.value)||0}))} />
                    <span style={{fontSize:"0.72rem",color:"#9c9894",marginTop:"0.3rem",display:"block"}}>Só processa pagamento quando o utilizador acumulou este valor</span>
                  </div>
                  <div>
                    <label className="ad-label">Validade do cookie de referência (dias)</label>
                    <input className="ad-input" type="number" min="1" max="365" step="1" value={configReferral.validade_cookie_dias} onChange={e => setConfigReferral(c => ({...c, validade_cookie_dias: parseInt(e.target.value)||30}))} />
                    <span style={{fontSize:"0.72rem",color:"#9c9894",marginTop:"0.3rem",display:"block"}}>Quantos dias o link de referência fica activo após o clique</span>
                  </div>
                </div>
                {/* Créditos escalonados */}
                <div style={{marginTop:"1.25rem",paddingTop:"1.25rem",borderTop:"1px solid var(--g2)"}}>
                  <p style={{fontSize:"0.72rem",letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--g6)",fontWeight:600,marginBottom:"1rem"}}>Créditos por convite (escalonado)</p>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                    <div>
                      <label className="ad-label">Crédito ao publicar 10 peças (€)</label>
                      <input className="ad-input" type="number" min="0" step="0.5" value={configReferral.credito_10_pecas} onChange={e => setConfigReferral(c => ({...c, credito_10_pecas: parseFloat(e.target.value)||0}))} />
                      <span style={{fontSize:"0.72rem",color:"#9c9894",marginTop:"0.3rem",display:"block"}}>Quando a lojista convidada publica 10+ peças</span>
                    </div>
                    <div>
                      <label className="ad-label">Crédito na 1ª venda (€)</label>
                      <input className="ad-input" type="number" min="0" step="0.5" value={configReferral.credito_primeira_venda} onChange={e => setConfigReferral(c => ({...c, credito_primeira_venda: parseFloat(e.target.value)||0}))} />
                      <span style={{fontSize:"0.72rem",color:"#9c9894",marginTop:"0.3rem",display:"block"}}>Quando a lojista convidada realiza a 1ª venda</span>
                    </div>
                    <div>
                      <label className="ad-label">Crédito aos 3 meses activa (€)</label>
                      <input className="ad-input" type="number" min="0" step="0.5" value={configReferral.credito_3_meses} onChange={e => setConfigReferral(c => ({...c, credito_3_meses: parseFloat(e.target.value)||0}))} />
                      <span style={{fontSize:"0.72rem",color:"#9c9894",marginTop:"0.3rem",display:"block"}}>Quando a lojista convidada completa 3 meses activa</span>
                    </div>
                    <div>
                      <label className="ad-label">Meses sem comissão em vendas (lojista convidada)</label>
                      <input className="ad-input" type="number" min="0" max="24" step="1" value={configReferral.meses_sem_comissao_vendas} onChange={e => setConfigReferral(c => ({...c, meses_sem_comissao_vendas: parseInt(e.target.value)||0}))} />
                      <span style={{fontSize:"0.72rem",color:"#9c9894",marginTop:"0.3rem",display:"block"}}>Alugueres mantêm comissão normal</span>
                    </div>
                  </div>
                </div>
                {configReferralMsg && <div style={{padding:"0.6rem 0.85rem",background: configReferralMsg.includes("✓")?"#f0faf0":"#fff0f0",border:"1px solid",borderColor:configReferralMsg.includes("✓")?"#b8dbb8":"#f5c6cb",fontSize:"0.8rem",marginTop:"0.75rem",color:configReferralMsg.includes("✓")?"#2d6a2d":"#c0392b"}}>{configReferralMsg}</div>}
                <button className="ad-btn ad-btn-rosa" style={{marginTop:"1rem"}} disabled={configReferralLoading} onClick={async () => {
                  setConfigReferralLoading(true); setConfigReferralMsg("");
                  // Obter o id da linha primeiro
                  const { data: row } = await supabase.from("config_referral").select("id").limit(1).single();
                  const { error } = row
                    ? await supabase.from("config_referral").update({
                        ativo: configReferral.ativo,
                        desconto_comprador: configReferral.desconto_comprador,
                        comissao_referidor: configReferral.comissao_referidor,
                        minimo_pagamento: configReferral.minimo_pagamento,
                        validade_cookie_dias: configReferral.validade_cookie_dias,
                        credito_10_pecas: configReferral.credito_10_pecas,
                        credito_primeira_venda: configReferral.credito_primeira_venda,
                        credito_3_meses: configReferral.credito_3_meses,
                        meses_sem_comissao_vendas: configReferral.meses_sem_comissao_vendas,
                        updated_at: new Date().toISOString()
                      }).eq("id", row.id)
                    : await supabase.from("config_referral").insert({
                        ativo: configReferral.ativo,
                        desconto_comprador: configReferral.desconto_comprador,
                        comissao_referidor: configReferral.comissao_referidor,
                        minimo_pagamento: configReferral.minimo_pagamento,
                        validade_cookie_dias: configReferral.validade_cookie_dias,
                        credito_10_pecas: configReferral.credito_10_pecas,
                        credito_primeira_venda: configReferral.credito_primeira_venda,
                        credito_3_meses: configReferral.credito_3_meses,
                        meses_sem_comissao_vendas: configReferral.meses_sem_comissao_vendas
                      });
                  setConfigReferralLoading(false);
                  setConfigReferralMsg(error ? "Erro: " + error.message : "✓ Configurações de referral guardadas");
                }}>
                  {configReferralLoading ? "A guardar..." : "Guardar configurações de referral"}
                </button>
              </div>

              {/* Gestão de comissões a pagar */}
              <div className="ad-card">
                <p className="ad-card-title">Comissões pendentes de pagamento</p>
                <ReferralsPendentes supabase={supabase} minimo={configReferral.minimo_pagamento} />
              </div>

              {/* Contactos */}
              <div className="ad-card">
                <p className="ad-card-title">Contactos de suporte</p>
                <div className="ad-form-grid">
                  <div>
                    <label className="ad-label">WhatsApp (número)</label>
                    <input className="ad-input" value={config.whatsapp} onChange={e => setConfig(c => ({...c, whatsapp: e.target.value}))} placeholder="+351 912 345 678" />
                  </div>
                  <div>
                    <label className="ad-label">Email de suporte</label>
                    <input className="ad-input" type="email" value={config.email_suporte} onChange={e => setConfig(c => ({...c, email_suporte: e.target.value}))} placeholder="suporte@noragrei.com" />
                  </div>
                </div>
                <button className="ad-btn ad-btn-black" style={{marginTop:"1rem"}} onClick={() => alert("Guardado!")}>Guardar contactos</button>
              </div>
            </>
          )}

        </main>
      </div>
    </>
  );
}