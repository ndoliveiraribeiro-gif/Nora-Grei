"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const SENHA = "noragrei2024admin";

const TABS = ["dashboard", "catalogo", "alugueres", "clientes", "reservas", "campanhas", "config"];
const TAB_LABELS = { dashboard: "Dashboard", catalogo: "Catálogo", alugueres: "Alugueres", clientes: "Clientes", reservas: "Reservas", campanhas: "Campanhas", config: "Configurações" };
const TAB_ICONS = { dashboard: "◈", catalogo: "✦", alugueres: "◎", clientes: "◉", reservas: "◌", campanhas: "✉", config: "⚙" };

export default function Backoffice() {
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erroSenha, setErroSenha] = useState(false);
  const [tab, setTab] = useState("dashboard");

  // DASHBOARD
  const [stats, setStats] = useState({ alugueres_ativos: 0, devolucoes_hoje: 0, receita_mes: 0, clientes_total: 0 });

  // CATÁLOGO
  const [pecas, setPecas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [novaPeca, setNovaPeca] = useState({ nome: "", categoria_id: "", preco_aluguer_dia: "", valor_peca: "", descricao: "", material: "", origem: "Portugal" });
  const [fotosUpload, setFotosUpload] = useState([]);
  const [uploadProgress, setUploadProgress] = useState("");
  const [criandoPeca, setCriandoPeca] = useState(false);

  // ALUGUERES
  const [alugueres, setAlugueres] = useState([]);

  // CLIENTES
  const [clientes, setClientes] = useState([]);

  // RESERVAS
  const [reservas, setReservas] = useState([]);

  // CAMPANHAS
  const [campanhas, setCampanhas] = useState([]);
  const [novaCampanha, setNovaCampanha] = useState({ titulo: "", mensagem: "", tipo: "cupao", codigo: "", desconto: "", probabilidade: 20, url_destino: "https://www.noragrei.com", validade: "" });

  // CONFIG
  const [config, setConfig] = useState({ higienizacao: 9, whatsapp: "", email_suporte: "" });

  const entrar = () => {
    if (senha === SENHA) {
      setLogado(true);
      setErroSenha(false);
    } else {
      setErroSenha(true);
    }
  };

  useEffect(() => {
    if (logado) carregarDados();
  }, [logado, tab]);

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
      const { data } = await supabase.from("alugueres").select("*, clientes(nome, email), stock_tamanhos(tamanho, pecas(nome))").order("data_fim", { ascending: true }).limit(100);
      if (data) setAlugueres(data);
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
      const { data } = await supabase.from("campanhas").select("*").order("created_at", { ascending: false });
      if (data) setCampanhas(data);
    }
  };

  const criarPeca = async () => {
    if (!novaPeca.nome || !novaPeca.preco_aluguer_dia) return;
    setCriandoPeca(true);
    setUploadProgress("");
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
    if (error) { setUploadProgress("Erro: " + error.message); setCriandoPeca(false); return; }
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
      setUploadProgress("✓ Peça criada!");
    }
    setNovaPeca({ nome: "", categoria_id: "", preco_aluguer_dia: "", valor_peca: "", descricao: "", material: "", origem: "Portugal" });
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
        <input
          type="password"
          placeholder="Password"
          value={senha}
          onChange={e => { setSenha(e.target.value); setErroSenha(false); }}
          onKeyDown={e => e.key === 'Enter' && entrar()}
          autoFocus
          style={{width:'100%',padding:'0.85rem 1rem',border: erroSenha ? '1.5px solid #e74c3c' : '1.5px solid #e2dfda',background:'#fff',fontFamily:"'Jost',sans-serif",fontSize:'0.9rem',outline:'none',marginBottom:'0.75rem',boxSizing:'border-box',color:'#080808'}}
        />
        {erroSenha && <div style={{fontSize:'0.72rem',color:'#e74c3c',marginBottom:'0.75rem'}}>Password incorreta</div>}
        <button
          onClick={entrar}
          style={{width:'100%',padding:'0.85rem',background:'#080808',color:'#f8f7f5',border:'none',cursor:'pointer',fontFamily:"'Jost',sans-serif",fontSize:'0.68rem',letterSpacing:'0.2em',textTransform:'uppercase'}}
        >
          Entrar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300&family=Jost:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --black:#080808; --white:#f8f7f5; --grey-100:#f0eeeb; --grey-200:#e2dfda; --rosa:#c4748a; --sans:'Jost',Arial,sans-serif; --serif:'Cormorant',Georgia,serif; }
        body { background:var(--grey-100); font-family:var(--sans); font-size:15px; -webkit-font-smoothing:antialiased; color:var(--black); display:block !important; }
        .bo-layout { display:grid; grid-template-columns:220px 1fr; min-height:100vh; }
        .bo-sidebar { background:var(--black); color:var(--white); display:flex; flex-direction:column; position:fixed; top:0; left:0; bottom:0; width:220px; z-index:100; }
        .bo-logo { padding:2rem 1.5rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.08); }
        .bo-logo-name { font-family:var(--serif); font-size:1.2rem; font-weight:300; letter-spacing:0.2em; text-transform:uppercase; }
        .bo-logo-tag { font-size:0.55rem; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-top:0.2rem; }
        .bo-nav { padding:1rem 0; flex:1; overflow-y:auto; }
        .bo-nav-item { display:flex; align-items:center; gap:0.75rem; padding:0.85rem 1.5rem; font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.5); cursor:pointer; transition:all 0.2s; border:none; background:none; width:100%; text-align:left; }
        .bo-nav-item:hover { color:var(--white); background:rgba(255,255,255,0.05); }
        .bo-nav-item.active { color:var(--white); background:rgba(255,255,255,0.08); border-left:2px solid var(--rosa); }
        .bo-sidebar-footer { padding:1.5rem; border-top:1px solid rgba(255,255,255,0.08); }
        .bo-sair { font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.4); background:none; border:none; cursor:pointer; font-family:var(--sans); padding:0; }
        .bo-sair:hover { color:var(--white); }
        .bo-main { margin-left:220px; padding:2.5rem; }
        .bo-header { margin-bottom:2rem; }
        .bo-titulo { font-family:var(--serif); font-size:2.5rem; font-weight:300; line-height:1; }
        .bo-sub { font-size:0.82rem; color:#5a5855; margin-top:0.4rem; }
        .bo-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:2rem; }
        .bo-stat { background:var(--white); padding:1.5rem; }
        .bo-stat-val { font-family:var(--serif); font-size:2.5rem; font-weight:300; line-height:1; margin-bottom:0.4rem; }
        .bo-stat-label { font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; color:#5a5855; }
        .bo-stat.destaque .bo-stat-val { color:var(--rosa); }
        .bo-card { background:var(--white); padding:1.5rem; margin-bottom:1.5rem; }
        .bo-card-title { font-size:0.65rem; letter-spacing:0.25em; text-transform:uppercase; color:#5a5855; font-weight:500; margin-bottom:1.25rem; padding-bottom:0.75rem; border-bottom:1px solid var(--grey-100); }
        .bo-table { width:100%; border-collapse:collapse; }
        .bo-table th { font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:#5a5855; font-weight:500; padding:0.6rem 0.75rem; text-align:left; border-bottom:1px solid var(--grey-200); }
        .bo-table td { font-size:0.88rem; padding:0.85rem 0.75rem; border-bottom:1px solid var(--grey-100); vertical-align:middle; }
        .bo-table tr:last-child td { border-bottom:none; }
        .bo-table tr:hover td { background:var(--grey-100); }
        .badge { display:inline-block; font-size:0.58rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.25rem 0.6rem; font-weight:500; }
        .badge-verde { background:#e8f5e9; color:#27ae60; }
        .badge-laranja { background:#fff8e1; color:#f39c12; }
        .badge-cinza { background:var(--grey-100); color:#5a5855; }
        .badge-rosa { background:#fff0f3; color:var(--rosa); }
        .badge-vermelho { background:#fff5f5; color:#e74c3c; }
        .bo-btn { font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.5rem 0.85rem; border:none; cursor:pointer; font-family:var(--sans); font-weight:500; transition:all 0.2s; }
        .bo-btn-black { background:var(--black); color:var(--white); }
        .bo-btn-rosa { background:var(--rosa); color:var(--white); }
        .bo-btn-outline { background:var(--white); color:var(--black); border:1px solid var(--grey-200); }
        .bo-btn-sm { padding:0.35rem 0.65rem; font-size:0.6rem; }
        .bo-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .bo-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; }
        .bo-form-full { grid-column:1/-1; }
        .bo-label { display:block; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#5a5855; margin-bottom:0.4rem; font-weight:500; }
        .bo-input { width:100%; padding:0.75rem 0.9rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.92rem; font-family:var(--sans); color:var(--black); outline:none; transition:border-color 0.2s; }
        .bo-input:focus { border-color:var(--black); }
        .bo-select { width:100%; padding:0.75rem 0.9rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.92rem; font-family:var(--sans); color:var(--black); outline:none; cursor:pointer; }
        .bo-textarea { width:100%; padding:0.75rem 0.9rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.92rem; font-family:var(--sans); color:var(--black); outline:none; resize:vertical; min-height:80px; }
        .bo-select-estado { font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; padding:0.35rem 0.5rem; border:1px solid var(--grey-200); background:var(--white); font-family:var(--sans); cursor:pointer; color:var(--black); }
        .bo-upload { width:100%; padding:1.5rem; border:2px dashed var(--grey-200); background:var(--grey-100); cursor:pointer; text-align:center; transition:border-color 0.2s; }
        .bo-upload:hover { border-color:var(--rosa); }
        .bo-fotos { display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.75rem; }
        .bo-foto-thumb { width:60px; height:60px; object-fit:cover; border:1px solid var(--grey-200); }
        @media (max-width:768px) {
          .bo-layout { grid-template-columns:1fr; }
          .bo-sidebar { position:static; width:100%; height:auto; }
          .bo-main { margin-left:0; padding:1rem; }
          .bo-stats { grid-template-columns:1fr 1fr; }
          .bo-form-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="bo-layout">
        <aside className="bo-sidebar">
          <div className="bo-logo">
            <div className="bo-logo-name">Nora Grei</div>
            <div className="bo-logo-tag">Backoffice</div>
          </div>
          <nav className="bo-nav">
            {TABS.map(t => (
              <button key={t} className={`bo-nav-item${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                <span style={{fontSize:'0.9rem',width:16}}>{TAB_ICONS[t]}</span>
                {TAB_LABELS[t]}
              </button>
            ))}
          </nav>
          <div className="bo-sidebar-footer">
            <button className="bo-sair" onClick={() => setLogado(false)}>Terminar sessão</button>
          </div>
        </aside>

        <main className="bo-main">

          {/* DASHBOARD */}
          {tab === "dashboard" && (
            <>
              <div className="bo-header">
                <h1 className="bo-titulo">Dashboard</h1>
                <p className="bo-sub">Resumo do negócio em tempo real</p>
              </div>
              <div className="bo-stats">
                <div className="bo-stat destaque">
                  <div className="bo-stat-val">{stats.alugueres_ativos}</div>
                  <div className="bo-stat-label">Alugueres ativos</div>
                </div>
                <div className="bo-stat">
                  <div className="bo-stat-val">{stats.devolucoes_hoje}</div>
                  <div className="bo-stat-label">Devoluções hoje</div>
                </div>
                <div className="bo-stat">
                  <div className="bo-stat-val">{Number(stats.receita_mes).toFixed(0)}€</div>
                  <div className="bo-stat-label">Receita este mês</div>
                </div>
                <div className="bo-stat">
                  <div className="bo-stat-val">{stats.clientes_total}</div>
                  <div className="bo-stat-label">Clientes total</div>
                </div>
              </div>
              <div className="bo-card">
                <p className="bo-card-title">Ações rápidas</p>
                <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                  <button className="bo-btn bo-btn-black" onClick={() => setTab("catalogo")}>+ Adicionar peça</button>
                  <button className="bo-btn bo-btn-rosa" onClick={() => setTab("alugueres")}>Ver alugueres</button>
                  <button className="bo-btn bo-btn-outline" onClick={() => setTab("reservas")}>Ver reservas</button>
                </div>
              </div>
            </>
          )}

          {/* CATÁLOGO */}
          {tab === "catalogo" && (
            <>
              <div className="bo-header">
                <h1 className="bo-titulo">Catálogo</h1>
                <p className="bo-sub">{pecas.length} peças</p>
              </div>
              <div className="bo-card">
                <p className="bo-card-title">Adicionar nova peça</p>
                <div className="bo-form-grid">
                  <div><label className="bo-label">Nome</label><input className="bo-input" value={novaPeca.nome} onChange={e => setNovaPeca(p => ({...p, nome: e.target.value}))} placeholder="Vestido Seda Noite" /></div>
                  <div><label className="bo-label">Categoria</label>
                    <select className="bo-select" value={novaPeca.categoria_id} onChange={e => setNovaPeca(p => ({...p, categoria_id: e.target.value}))}>
                      <option value="">Selecionar</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div><label className="bo-label">Preço aluguer / dia (€)</label><input className="bo-input" type="number" value={novaPeca.preco_aluguer_dia} onChange={e => setNovaPeca(p => ({...p, preco_aluguer_dia: e.target.value}))} placeholder="35" /></div>
                  <div><label className="bo-label">Valor peça (€) — depósito</label><input className="bo-input" type="number" value={novaPeca.valor_peca} onChange={e => setNovaPeca(p => ({...p, valor_peca: e.target.value}))} placeholder="450" /></div>
                  <div><label className="bo-label">Material</label><input className="bo-input" value={novaPeca.material} onChange={e => setNovaPeca(p => ({...p, material: e.target.value}))} placeholder="100% Seda natural" /></div>
                  <div><label className="bo-label">Origem</label><input className="bo-input" value={novaPeca.origem} onChange={e => setNovaPeca(p => ({...p, origem: e.target.value}))} /></div>
                  <div className="bo-form-full"><label className="bo-label">Descrição</label><textarea className="bo-textarea" value={novaPeca.descricao} onChange={e => setNovaPeca(p => ({...p, descricao: e.target.value}))} /></div>
                </div>
                <div style={{marginBottom:'1rem'}}>
                  <label className="bo-label">Fotos</label>
                  <label className="bo-upload" style={{display:'block'}}>
                    <input type="file" accept="image/*" multiple onChange={e => setFotosUpload(Array.from(e.target.files))} style={{display:'none'}} />
                    {fotosUpload.length === 0 ? <div><div style={{fontSize:'1.5rem'}}>📷</div><div style={{fontSize:'0.82rem',marginTop:'0.4rem'}}>Clica para selecionar fotos</div></div>
                      : <div style={{color:'#27ae60',fontWeight:500}}>{fotosUpload.length} foto(s) selecionada(s)</div>}
                  </label>
                  {fotosUpload.length > 0 && <div className="bo-fotos">{fotosUpload.map((f,i) => <img key={i} src={URL.createObjectURL(f)} alt="" className="bo-foto-thumb" />)}</div>}
                  {uploadProgress && <p style={{fontSize:'0.75rem',color: uploadProgress.startsWith('✓') ? '#27ae60' : '#c4748a',marginTop:'0.5rem'}}>{uploadProgress}</p>}
                </div>
                <button className="bo-btn bo-btn-black" onClick={criarPeca} disabled={criandoPeca}>{criandoPeca ? "A criar..." : "+ Adicionar peça"}</button>
              </div>

              <div className="bo-card">
                <p className="bo-card-title">Peças no catálogo</p>
                <table className="bo-table">
                  <thead><tr><th>Foto</th><th>Peça</th><th>Categoria</th><th>Preço/dia</th><th>Depósito</th><th>Tamanhos</th><th>Estado</th><th>Ações</th></tr></thead>
                  <tbody>
                    {pecas.map(p => (
                      <tr key={p.id}>
                        <td>{p.fotos?.length > 0 ? <img src={p.fotos[0]} alt="" style={{width:48,height:48,objectFit:'cover',border:'1px solid #e2dfda'}} /> : <div style={{width:48,height:48,background:'#f0eeeb',display:'flex',alignItems:'center',justifyContent:'center',color:'#ccc'}}>📷</div>}</td>
                        <td><strong>{p.nome}</strong></td>
                        <td>{p.categorias?.nome || "—"}</td>
                        <td>{p.preco_aluguer_dia}€</td>
                        <td>{p.valor_peca}€</td>
                        <td>{p.stock_tamanhos?.map(s => s.tamanho).join(", ") || "—"}</td>
                        <td><span className={`badge ${p.estado === 'disponivel' ? 'badge-verde' : 'badge-cinza'}`}>{p.estado}</span></td>
                        <td style={{display:'flex',gap:'0.4rem'}}>
                          <button className="bo-btn bo-btn-outline bo-btn-sm" onClick={async () => { await supabase.from("pecas").update({ estado: p.estado === 'disponivel' ? 'indisponivel' : 'disponivel' }).eq("id", p.id); carregarDados(); }}>{p.estado === 'disponivel' ? 'Desativar' : 'Ativar'}</button>
                          <button className="bo-btn bo-btn-sm" style={{background:'#fff5f5',color:'#e74c3c',border:'1px solid #f5c6cb'}} onClick={async () => { if (confirm("Apagar?")) { await supabase.from("pecas").delete().eq("id", p.id); carregarDados(); } }}>Apagar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ALUGUERES */}
          {tab === "alugueres" && (
            <>
              <div className="bo-header"><h1 className="bo-titulo">Alugueres</h1><p className="bo-sub">{alugueres.length} registados</p></div>
              <div className="bo-card">
                <table className="bo-table">
                  <thead><tr><th>Cliente</th><th>Peça</th><th>Datas</th><th>Atraso</th><th>Valor</th><th>Depósito</th><th>Estado</th><th>Ações</th></tr></thead>
                  <tbody>
                    {alugueres.map(a => (
                      <tr key={a.id}>
                        <td><div style={{fontWeight:500}}>{a.clientes?.nome || "—"}</div><div style={{fontSize:'0.78rem',color:'#5a5855'}}>{a.clientes?.email}</div></td>
                        <td><div>{a.stock_tamanhos?.pecas?.nome || "—"}</div><div style={{fontSize:'0.78rem',color:'#5a5855'}}>Tam: {a.stock_tamanhos?.tamanho}</div></td>
                        <td style={{fontSize:'0.82rem'}}>{a.data_inicio} → {a.data_fim}</td>
                        <td>{calcularAtraso(a.data_fim) > 0 ? <span style={{color:'#e74c3c',fontWeight:600}}>+{calcularAtraso(a.data_fim)} dias</span> : <span style={{color:'#27ae60',fontSize:'0.82rem'}}>✓ No prazo</span>}</td>
                        <td>{a.valor_aluguer}€</td>
                        <td>
                          <span className={`badge ${a.deposito_estado === 'recebido' || a.deposito_estado === 'libertado' ? 'badge-verde' : 'badge-laranja'}`}>{a.deposito_estado}</span>
                          {a.deposito_estado === 'pendente' && <button className="bo-btn bo-btn-rosa bo-btn-sm" style={{display:'block',marginTop:'0.25rem'}} onClick={() => confirmarDeposito(a.id)}>Confirmar</button>}
                        </td>
                        <td>
                          <select className="bo-select-estado" value={a.estado} onChange={e => atualizarEstado(a.id, e.target.value)}>
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
                            {a.estado === 'ativo' && <button className="bo-btn bo-btn-rosa bo-btn-sm" onClick={() => confirmarRecepcao(a.id)}>📦 Recebi a peça</button>}
                            {a.estado === 'em_verificacao' && <>
                              <button className="bo-btn bo-btn-sm" style={{background:'#080808',color:'#fff'}} onClick={() => confirmarVerificacao(a.id, false)}>✓ Aprovada</button>
                              <button className="bo-btn bo-btn-sm" style={{background:'#fff5f5',color:'#e74c3c',border:'1px solid #f5c6cb'}} onClick={() => confirmarVerificacao(a.id, true)}>✗ Danificada</button>
                            </>}
                            {a.estado === 'devolvido' && a.deposito_estado !== 'libertado' && <button className="bo-btn bo-btn-outline bo-btn-sm" onClick={() => libertarCaucao(a.id)}>💰 Libertar caução</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* CLIENTES */}
          {tab === "clientes" && (
            <>
              <div className="bo-header"><h1 className="bo-titulo">Clientes</h1><p className="bo-sub">{clientes.length} registados</p></div>
              <div className="bo-card">
                <table className="bo-table">
                  <thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Cidade</th><th>Pontos</th><th>NIF</th></tr></thead>
                  <tbody>
                    {clientes.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.nome || "—"}</strong></td>
                        <td style={{fontSize:'0.82rem'}}>{c.email}</td>
                        <td style={{fontSize:'0.82rem'}}>{c.telefone || "—"}</td>
                        <td style={{fontSize:'0.82rem'}}>{c.cidade || "—"}</td>
                        <td><span className="badge badge-rosa">{c.pontos || 0} pts</span></td>
                        <td style={{fontSize:'0.82rem'}}>{c.nif || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* RESERVAS */}
          {tab === "reservas" && (
            <>
              <div className="bo-header"><h1 className="bo-titulo">Reservas em espera</h1><p className="bo-sub">{reservas.length} pendentes</p></div>
              <div className="bo-card">
                <table className="bo-table">
                  <thead><tr><th>Cliente</th><th>Peça</th><th>Datas desejadas</th><th>Estado</th><th>Ações</th></tr></thead>
                  <tbody>
                    {reservas.length === 0 ? <tr><td colSpan={5} style={{textAlign:'center',color:'#5a5855',padding:'2rem'}}>Sem reservas em espera</td></tr>
                      : reservas.map(r => (
                        <tr key={r.id}>
                          <td><div style={{fontWeight:500}}>{r.clientes?.nome || "—"}</div><div style={{fontSize:'0.78rem',color:'#5a5855'}}>{r.clientes?.email}</div></td>
                          <td><div>{r.stock_tamanhos?.pecas?.nome || "—"}</div><div style={{fontSize:'0.78rem',color:'#5a5855'}}>Tam: {r.stock_tamanhos?.tamanho}</div></td>
                          <td style={{fontSize:'0.82rem'}}>{r.data_inicio_desejada} → {r.data_fim_desejada}</td>
                          <td><span className={`badge ${r.estado === 'aguarda' ? 'badge-laranja' : 'badge-verde'}`}>{r.estado}</span></td>
                          <td>{r.estado === 'aguarda' && <button className="bo-btn bo-btn-rosa bo-btn-sm" onClick={async () => { await supabase.from("reservas_espera").update({ estado: "notificado", notificado_em: new Date().toISOString() }).eq("id", r.id); carregarDados(); }}>Notificar cliente</button>}</td>
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
              <div className="bo-header"><h1 className="bo-titulo">Campanhas</h1><p className="bo-sub">Alertas e cupões</p></div>
              <div className="bo-card">
                <p className="bo-card-title">Nova campanha</p>
                <div className="bo-form-grid">
                  <div><label className="bo-label">Título</label><input className="bo-input" value={novaCampanha.titulo} onChange={e => setNovaCampanha(p => ({...p, titulo: e.target.value}))} placeholder="É o teu dia de sorte!" /></div>
                  <div><label className="bo-label">Tipo</label>
                    <select className="bo-select" value={novaCampanha.tipo} onChange={e => setNovaCampanha(p => ({...p, tipo: e.target.value}))}>
                      <option value="cupao">Cupão</option><option value="novidade">Novidade</option><option value="oferta">Oferta</option>
                    </select>
                  </div>
                  <div className="bo-form-full"><label className="bo-label">Mensagem</label><textarea className="bo-textarea" value={novaCampanha.mensagem} onChange={e => setNovaCampanha(p => ({...p, mensagem: e.target.value}))} /></div>
                  <div><label className="bo-label">Código desconto</label><input className="bo-input" value={novaCampanha.codigo} onChange={e => setNovaCampanha(p => ({...p, codigo: e.target.value}))} placeholder="NORA15" /></div>
                  <div><label className="bo-label">Descrição desconto</label><input className="bo-input" value={novaCampanha.desconto} onChange={e => setNovaCampanha(p => ({...p, desconto: e.target.value}))} placeholder="15% em toda a loja" /></div>
                  <div><label className="bo-label">Probabilidade (%)</label><input className="bo-input" type="number" min="1" max="100" value={novaCampanha.probabilidade} onChange={e => setNovaCampanha(p => ({...p, probabilidade: e.target.value}))} /></div>
                  <div><label className="bo-label">Validade</label><input className="bo-input" type="datetime-local" value={novaCampanha.validade} onChange={e => setNovaCampanha(p => ({...p, validade: e.target.value}))} /></div>
                </div>
                <button className="bo-btn bo-btn-rosa" onClick={criarCampanha}>✉ Criar campanha</button>
              </div>
              <div className="bo-card">
                <p className="bo-card-title">{campanhas.length} campanhas</p>
                <table className="bo-table">
                  <thead><tr><th>Título</th><th>Tipo</th><th>Código</th><th>Prob.</th><th>Estado</th><th>Ações</th></tr></thead>
                  <tbody>
                    {campanhas.length === 0 ? <tr><td colSpan={6} style={{textAlign:'center',color:'#5a5855',padding:'2rem'}}>Sem campanhas</td></tr>
                      : campanhas.map(c => (
                        <tr key={c.id}>
                          <td><div style={{fontWeight:500}}>{c.titulo}</div><div style={{fontSize:'0.78rem',color:'#5a5855'}}>{c.mensagem?.substring(0,50)}...</div></td>
                          <td><span className={`badge ${c.tipo === 'cupao' ? 'badge-rosa' : 'badge-verde'}`}>{c.tipo}</span></td>
                          <td style={{fontWeight:600}}>{c.codigo || "—"}</td>
                          <td>{c.probabilidade}%</td>
                          <td><span className={`badge ${c.ativa ? 'badge-verde' : 'badge-cinza'}`}>{c.ativa ? "Ativa" : "Inativa"}</span></td>
                          <td style={{display:'flex',gap:'0.4rem'}}>
                            <button className={`bo-btn bo-btn-sm ${c.ativa ? 'bo-btn-outline' : 'bo-btn-rosa'}`} onClick={async () => { await supabase.from("campanhas").update({ ativa: !c.ativa }).eq("id", c.id); carregarDados(); }}>{c.ativa ? "Pausar" : "Ativar"}</button>
                            <button className="bo-btn bo-btn-sm" style={{background:'#fff5f5',color:'#e74c3c',border:'1px solid #f5c6cb'}} onClick={async () => { if (confirm("Apagar?")) { await supabase.from("campanhas").delete().eq("id", c.id); carregarDados(); } }}>Apagar</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* CONFIG */}
          {tab === "config" && (
            <>
              <div className="bo-header"><h1 className="bo-titulo">Configurações</h1><p className="bo-sub">Preços e contactos</p></div>
              <div className="bo-card">
                <p className="bo-card-title">Preços e taxas</p>
                <div className="bo-form-grid">
                  <div><label className="bo-label">Taxa higienização (€)</label><input className="bo-input" type="number" value={config.higienizacao} onChange={e => setConfig(c => ({...c, higienizacao: e.target.value}))} /></div>
                </div>
              </div>
              <div className="bo-card">
                <p className="bo-card-title">Contactos</p>
                <div className="bo-form-grid">
                  <div><label className="bo-label">WhatsApp</label><input className="bo-input" value={config.whatsapp} onChange={e => setConfig(c => ({...c, whatsapp: e.target.value}))} placeholder="+351 912 345 678" /></div>
                  <div><label className="bo-label">Email suporte</label><input className="bo-input" type="email" value={config.email_suporte} onChange={e => setConfig(c => ({...c, email_suporte: e.target.value}))} placeholder="suporte@noragrei.com" /></div>
                </div>
                <button className="bo-btn bo-btn-black" onClick={() => alert("Guardado!")}>Guardar</button>
              </div>
            </>
          )}

        </main>
      </div>
    </>
  );
}