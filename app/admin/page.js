"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TABS = ["dashboard", "catalogo", "alugueres", "clientes", "reservas", "config"];
const TAB_LABELS = { dashboard: "Dashboard", catalogo: "Catálogo", alugueres: "Alugueres", clientes: "Clientes", reservas: "Reservas", config: "Configurações" };
const TAB_ICONS = { dashboard: "◈", catalogo: "✦", alugueres: "◎", clientes: "◉", reservas: "◌", config: "⚙" };

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acesso, setAcesso] = useState(false);

  // DASHBOARD
  const [stats, setStats] = useState({ alugueres_ativos: 0, devolucoes_hoje: 0, receita_mes: 0, clientes_total: 0 });

  // CATÁLOGO
  const [pecas, setPecas] = useState([]);
  const [novaPeca, setNovaPeca] = useState({ nome: "", categoria_id: "", preco_aluguer_dia: "", valor_peca: "", descricao: "", material: "", origem: "Portugal" });
  const [categorias, setCategorias] = useState([]);
  const [editPeca, setEditPeca] = useState(null);

  // ALUGUERES
  const [alugueres, setAlugueres] = useState([]);

  // CLIENTES
  const [clientes, setClientes] = useState([]);

  // RESERVAS
  const [reservas, setReservas] = useState([]);

  // CONFIG
  const [config, setConfig] = useState({ higienizacao: 9, whatsapp: "", email_suporte: "" });

  useEffect(() => { verificarAcesso(); }, []);
  useEffect(() => { if (acesso) carregarDados(); }, [acesso, tab]);

  const verificarAcesso = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/entrar"; return; }
    setUser(user);
    const { data } = await supabase.from("clientes").select("is_admin").eq("id", user.id).single();
    if (!data?.is_admin) { window.location.href = "/"; return; }
    setAcesso(true);
    setLoading(false);
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
      const { data } = await supabase.from("alugueres").select("*, clientes(nome, email), stock_tamanhos(tamanho, pecas(nome))").order("created_at", { ascending: false }).limit(50);
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
  };

  const criarPeca = async () => {
    if (!novaPeca.nome || !novaPeca.preco_aluguer_dia) return;
    const { error } = await supabase.from("pecas").insert({
      nome: novaPeca.nome,
      categoria_id: novaPeca.categoria_id || null,
      preco_aluguer_dia: parseFloat(novaPeca.preco_aluguer_dia),
      valor_peca: parseFloat(novaPeca.valor_peca) || 0,
      descricao: novaPeca.descricao,
      material: novaPeca.material,
      origem: novaPeca.origem,
      estado: "disponivel",
    });
    if (!error) {
      setNovaPeca({ nome: "", categoria_id: "", preco_aluguer_dia: "", valor_peca: "", descricao: "", material: "", origem: "Portugal" });
      carregarDados();
    }
  };

  const atualizarEstadoAluguer = async (id, estado) => {
    await supabase.from("alugueres").update({ estado }).eq("id", id);
    carregarDados();
  };

  const confirmarDeposito = async (id) => {
    await supabase.from("alugueres").update({ deposito_estado: "recebido", deposito_confirmado_em: new Date().toISOString() }).eq("id", id);
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

  const ROSA = "#c4748a";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300&family=Jost:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --black:#080808; --white:#f8f7f5; --grey-100:#f0eeeb; --grey-200:#e2dfda; --grey-600:#1a1a18; --rosa:#c4748a; --sans:'Jost',Arial,sans-serif; --serif:'Cormorant',Georgia,serif; }
        body { background:var(--grey-100); font-family:var(--sans); font-weight:400; font-size:15px; -webkit-font-smoothing:antialiased; color:var(--black); }
        
        .ad-layout { display:grid; grid-template-columns:220px 1fr; min-height:100vh; }
        
        /* SIDEBAR */
        .ad-sidebar { background:var(--black); color:var(--white); display:flex; flex-direction:column; position:fixed; top:0; left:0; bottom:0; width:220px; z-index:100; }
        .ad-logo { padding:2rem 1.5rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.08); }
        .ad-logo-name { font-family:var(--serif); font-size:1.2rem; font-weight:300; letter-spacing:0.2em; text-transform:uppercase; }
        .ad-logo-tag { font-size:0.55rem; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-top:0.2rem; }
        .ad-nav { padding:1rem 0; flex:1; }
        .ad-nav-item { display:flex; align-items:center; gap:0.75rem; padding:0.85rem 1.5rem; font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.5); cursor:pointer; transition:all 0.2s; font-weight:400; border:none; background:none; width:100%; text-align:left; }
        .ad-nav-item:hover { color:var(--white); background:rgba(255,255,255,0.05); }
        .ad-nav-item.active { color:var(--white); background:rgba(255,255,255,0.08); border-left:2px solid var(--rosa); }
        .ad-nav-icon { font-size:0.9rem; width:16px; }
        .ad-sidebar-footer { padding:1.5rem; border-top:1px solid rgba(255,255,255,0.08); }
        .ad-user { font-size:0.72rem; color:rgba(255,255,255,0.4); margin-bottom:0.75rem; }
        .ad-sair { font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.4); background:none; border:none; cursor:pointer; font-family:var(--sans); padding:0; transition:color 0.2s; }
        .ad-sair:hover { color:var(--white); }
        
        /* MAIN */
        .ad-main { margin-left:220px; padding:2.5rem; }
        .ad-header { margin-bottom:2rem; }
        .ad-titulo { font-family:var(--serif); font-size:2.5rem; font-weight:300; color:var(--black); line-height:1; }
        .ad-subtitulo { font-size:0.82rem; color:#5a5855; margin-top:0.4rem; }
        
        /* CARDS STATS */
        .ad-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:2rem; }
        .ad-stat { background:var(--white); padding:1.5rem; }
        .ad-stat-val { font-family:var(--serif); font-size:2.5rem; font-weight:300; color:var(--black); line-height:1; margin-bottom:0.4rem; }
        .ad-stat-label { font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; color:#5a5855; font-weight:400; }
        .ad-stat.destaque .ad-stat-val { color:var(--rosa); }
        
        /* TABELA */
        .ad-card { background:var(--white); padding:1.5rem; margin-bottom:1.5rem; }
        .ad-card-title { font-size:0.65rem; letter-spacing:0.25em; text-transform:uppercase; color:#5a5855; font-weight:500; margin-bottom:1.25rem; padding-bottom:0.75rem; border-bottom:1px solid var(--grey-100); }
        .ad-table { width:100%; border-collapse:collapse; }
        .ad-table th { font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:#5a5855; font-weight:500; padding:0.6rem 0.75rem; text-align:left; border-bottom:1px solid var(--grey-200); }
        .ad-table td { font-size:0.88rem; padding:0.85rem 0.75rem; border-bottom:1px solid var(--grey-100); color:var(--black); vertical-align:middle; }
        .ad-table tr:last-child td { border-bottom:none; }
        .ad-table tr:hover td { background:var(--grey-100); }
        
        /* BADGES */
        .ad-badge { display:inline-block; font-size:0.58rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.25rem 0.6rem; font-weight:500; }
        .ad-badge-verde { background:#e8f5e9; color:#27ae60; }
        .ad-badge-laranja { background:#fff8e1; color:#f39c12; }
        .ad-badge-cinza { background:var(--grey-100); color:#5a5855; }
        .ad-badge-rosa { background:#fff0f3; color:var(--rosa); }
        .ad-badge-vermelho { background:#fff5f5; color:#e74c3c; }
        
        /* BOTÕES */
        .ad-btn { font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase; padding:0.5rem 0.85rem; border:none; cursor:pointer; font-family:var(--sans); font-weight:500; transition:all 0.2s; }
        .ad-btn-black { background:var(--black); color:var(--white); }
        .ad-btn-black:hover { background:#2a2926; }
        .ad-btn-rosa { background:var(--rosa); color:var(--white); }
        .ad-btn-rosa:hover { background:#a85c72; }
        .ad-btn-outline { background:var(--white); color:var(--black); border:1px solid var(--grey-200); }
        .ad-btn-outline:hover { border-color:var(--black); }
        .ad-btn-sm { padding:0.35rem 0.65rem; font-size:0.6rem; }
        
        /* FORM */
        .ad-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; }
        .ad-form-grid-3 { grid-template-columns:1fr 1fr 1fr; }
        .ad-form-full { grid-column:1/-1; }
        .ad-label { display:block; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:#5a5855; margin-bottom:0.4rem; font-weight:500; }
        .ad-input { width:100%; padding:0.75rem 0.9rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.92rem; font-family:var(--sans); color:var(--black); outline:none; transition:border-color 0.2s; border-radius:0; }
        .ad-input:focus { border-color:var(--black); }
        .ad-select { width:100%; padding:0.75rem 0.9rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.92rem; font-family:var(--sans); color:var(--black); outline:none; border-radius:0; cursor:pointer; }
        .ad-textarea { width:100%; padding:0.75rem 0.9rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:0.92rem; font-family:var(--sans); color:var(--black); outline:none; border-radius:0; resize:vertical; min-height:80px; }
        
        /* SELECT ESTADO */
        .ad-select-estado { font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; padding:0.35rem 0.5rem; border:1px solid var(--grey-200); background:var(--white); font-family:var(--sans); cursor:pointer; color:var(--black); border-radius:0; }

        @media (max-width:768px) {
          .ad-layout { grid-template-columns:1fr; }
          .ad-sidebar { position:static; width:100%; height:auto; flex-direction:row; flex-wrap:wrap; padding:0.75rem; }
          .ad-logo { display:none; }
          .ad-nav { padding:0; display:flex; flex-wrap:wrap; gap:0.25rem; }
          .ad-nav-item { padding:0.5rem 0.75rem; font-size:0.6rem; }
          .ad-sidebar-footer { display:none; }
          .ad-main { margin-left:0; padding:1.25rem; }
          .ad-stats { grid-template-columns:1fr 1fr; }
          .ad-form-grid { grid-template-columns:1fr; }
          .ad-form-grid-3 { grid-template-columns:1fr; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      <div className="ad-layout">
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
                <button className="ad-btn ad-btn-black" onClick={criarPeca}>+ Adicionar peça</button>
              </div>

              {/* LISTA PEÇAS */}
              <div className="ad-card">
                <p className="ad-card-title">Peças no catálogo</p>
                <table className="ad-table">
                  <thead>
                    <tr>
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
                          <button className="ad-btn ad-btn-vermelho ad-btn-sm" style={{background:'#fff5f5',color:'#e74c3c',border:'1px solid #f5c6cb'}} onClick={async () => {
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
                            <option value="devolvido">Devolvido</option>
                            <option value="devolvido_danificado">Danificado</option>
                            <option value="nao_devolvido">Não devolvido</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td>
                          <div style={{fontSize:'0.75rem',color:'#5a5855'}}>{a.metodo_entrega}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

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
                        <td>
                          <span className="ad-badge ad-badge-rosa">{c.pontos || 0} pts</span>
                        </td>
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

          {/* ── CONFIG ── */}
          {tab === "config" && (
            <>
              <div className="ad-header">
                <h1 className="ad-titulo">Configurações</h1>
                <p className="ad-subtitulo">Preços, contactos e definições gerais</p>
              </div>
              <div className="ad-card">
                <p className="ad-card-title">Preços e taxas</p>
                <div className="ad-form-grid">
                  <div>
                    <label className="ad-label">Taxa de higienização (€)</label>
                    <input className="ad-input" type="number" value={config.higienizacao} onChange={e => setConfig(c => ({...c, higienizacao: e.target.value}))} />
                  </div>
                </div>
              </div>
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
                <button className="ad-btn ad-btn-black" onClick={() => alert("Guardado!")}>Guardar configurações</button>
              </div>
            </>
          )}

        </main>
      </div>
    </>
  );
}