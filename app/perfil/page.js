"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const NIVEL = (n) => {
  if (n >= 20) return { nome: "Platina", icon: "💎", cor: "#6c5ce7", caucao: 0, proximo: null, falta: 0 };
  if (n >= 10) return { nome: "Ouro", icon: "🥇", cor: "#f39c12", caucao: 50, proximo: "Platina", falta: 20 - n };
  if (n >= 5)  return { nome: "Prata", icon: "🥈", cor: "#95a5a6", caucao: 75, proximo: "Ouro", falta: 10 - n };
  return { nome: "Bronze", icon: "🥉", cor: "#cd7f32", caucao: 100, proximo: "Prata", falta: 5 - n };
};

const t = {
  pt: {
    titulo: "O meu perfil", dadosPessoais: "Dados pessoais",
    nome: "Nome completo", email: "Email", telefone: "Telefone",
    dataNascimento: "Data de nascimento", genero: "Género",
    generosOpcoes: ["Mulher", "Homem", "Prefiro não especificar"],
    nif: "NIF", nifPlaceholder: "123 456 789",
    localizacao: "Localização", cidade: "Cidade", pais: "País",
    codigoPostal: "Código postal", morada: "Morada completa",
    detectarLocalizacao: "📍 Detectar automaticamente",
    localizacaoOk: "📍 Localização detectada ✓",
    guardar: "Guardar", guardado: "Guardado! ✓",
    historico: "Histórico de alugueres",
    semHistorico: "Ainda não tens alugueres.",
    verCatalogo: "Explorar catálogo",
    sair: "Terminar sessão",
    verPedidos: "Ver os meus pedidos",
  },
};

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({ nome: "", telefone: "", morada: "", avatar_url: "", nif: "", data_nascimento: "", genero: "", cidade: "", pais: "Portugal", codigo_postal: "", latitude: null, longitude: null });
  const [stats, setStats] = useState({ totalAlugueres: 0, totalGasto: 0, pecasAtivas: 0, reservas: 0, pontos: 0, totalPecas: 0, semDanos: 0 });
  const [alugueres, setAlugueres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardado, setGuardado] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [detectandoLoc, setDetectandoLoc] = useState(false);
  const [locDetectada, setLocDetectada] = useState(false);
  const [lang] = useState("pt");
  const fileRef = useRef();

  useEffect(() => { carregarPerfil(); }, []);

  const carregarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/entrar"; return; }
    setUser(user);

    const { data: c } = await supabase.from("clientes").select("*").eq("id", user.id).single();
    if (c) {
      setPerfil({ nome: c.nome || "", telefone: c.telefone || "", morada: c.morada || "", avatar_url: user.user_metadata?.avatar_url || "", nif: c.nif || "", data_nascimento: c.data_nascimento || "", genero: c.genero || "", cidade: c.cidade || "", pais: c.pais || "Portugal", codigo_postal: c.codigo_postal || "", latitude: c.latitude || null, longitude: c.longitude || null });
    }

    const { data: al } = await supabase.from("alugueres").select("*, stock_tamanhos(tamanho, pecas(nome, preco_aluguer_dia, fotos))").eq("cliente_id", user.id).order("created_at", { ascending: false });
    if (al) {
      setAlugueres(al);
      const completos = al.filter(a => ["devolvido","devolvido_danificado"].includes(a.estado)).length;
      const semDanos = al.filter(a => a.estado === "devolvido").length;
      const ativos = al.filter(a => a.estado === "ativo").length;
      const gasto = al.reduce((s, a) => s + (a.valor_aluguer || 0), 0);
      setStats({ totalAlugueres: al.filter(a => a.estado !== "cancelado").length, totalGasto: gasto, pecasAtivas: ativos, reservas: 0, pontos: c?.pontos || completos, totalPecas: completos, semDanos });
    }

    const { data: res } = await supabase.from("reservas_espera").select("id").eq("cliente_id", user.id).eq("estado", "aguarda");
    if (res) setStats(prev => ({ ...prev, reservas: res.length }));
    setLoading(false);
  };

  const detectarLocalizacao = () => {
    if (!navigator.geolocation) return;
    setDetectandoLoc(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      set("latitude", latitude); set("longitude", longitude);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        set("cidade", data.address?.city || data.address?.town || "");
        set("pais", data.address?.country || "");
        set("codigo_postal", data.address?.postcode || "");
        setLocDetectada(true);
      } catch(e) {}
      setDetectandoLoc(false);
    }, () => setDetectandoLoc(false));
  };

  const guardarPerfil = async () => {
    if (!user) return;
    await supabase.from("clientes").upsert({ id: user.id, email: user.email, nome: perfil.nome, telefone: perfil.telefone, morada: perfil.morada, nif: perfil.nif, data_nascimento: perfil.data_nascimento || null, genero: perfil.genero, cidade: perfil.cidade, pais: perfil.pais, codigo_postal: perfil.codigo_postal, latitude: perfil.latitude, longitude: perfil.longitude });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const uploadFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingFoto(true);
    const ext = file.name.split(".").pop();
    const { error } = await supabase.storage.from("avatars").upload(`${user.id}/avatar.${ext}`, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(`${user.id}/avatar.${ext}`);
      setPerfil(prev => ({ ...prev, avatar_url: data.publicUrl }));
    }
    setUploadingFoto(false);
  };

  const sair = async () => { await supabase.auth.signOut(); window.location.href = "/"; };
  const set = (k, v) => setPerfil(prev => ({ ...prev, [k]: v }));
  const i = t[lang] || t.pt;

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#888'}}>A carregar...</div>;

  const nv = NIVEL(stats.totalPecas);
  const progresso = nv.proximo ? Math.round(((stats.totalPecas - (nv.nome === "Bronze" ? 0 : nv.nome === "Prata" ? 5 : nv.nome === "Ouro" ? 10 : 20)) / nv.falta) * 100) : 100;
  const proximoNivelMin = nv.nome === "Bronze" ? 5 : nv.nome === "Prata" ? 10 : nv.nome === "Ouro" ? 20 : 20;
  const progressoPct = nv.proximo ? Math.min(100, Math.round(((stats.totalPecas - (proximoNivelMin - nv.falta)) / nv.falta) * 100)) : 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g5:#5a5855;--serif:'Cormorant',Georgia,serif;--sans:'Jost',Arial,sans-serif}
        body{background:var(--g1);font-family:var(--sans);font-size:17px;-webkit-font-smoothing:antialiased}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 4rem;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2)}
        .nav-logo{font-family:var(--serif);font-size:1.2rem;font-weight:400;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;color:var(--black)}
        .nav-back{font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g5);text-decoration:none}
        .page{padding:6rem 4rem 4rem;max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:1.5rem}
        
        /* HERO */
        .hero{background:var(--white);padding:2.5rem;display:flex;align-items:center;gap:2rem}
        .avatar-wrap{position:relative;flex-shrink:0}
        .avatar{width:96px;height:96px;border-radius:50%;object-fit:cover}
        .avatar-ph{width:96px;height:96px;border-radius:50%;background:var(--g2);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:2.5rem;font-weight:300;color:var(--g5)}
        .avatar-btn{position:absolute;bottom:0;right:0;width:28px;height:28px;border-radius:50%;background:var(--black);color:var(--white);border:2px solid var(--white);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem}
        .hero-nome{font-family:var(--serif);font-size:2rem;font-weight:400;line-height:1.1;margin-bottom:0.3rem}
        .hero-email{font-size:0.92rem;color:var(--g5)}
        
        /* NÍVEL */
        .nivel-card{background:var(--white);padding:2rem 2.5rem}
        .nivel-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem}
        .nivel-badge{display:inline-flex;align-items:center;gap:0.5rem;padding:0.4rem 1rem;font-size:0.82rem;font-weight:500;letter-spacing:0.05em}
        .nivel-caucao{font-size:0.75rem;color:var(--g5)}
        .nivel-barra-wrap{margin-bottom:0.5rem}
        .nivel-barra{height:6px;background:var(--g2);border-radius:3px;overflow:hidden}
        .nivel-barra-fill{height:100%;border-radius:3px;transition:width 0.8s ease}
        .nivel-info{display:flex;justify-content:space-between;font-size:0.72rem;color:var(--g5);margin-top:0.4rem}
        .nivel-beneficios{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--g1)}
        .beneficio{text-align:center;padding:1rem}
        .beneficio-val{font-family:var(--serif);font-size:1.8rem;font-weight:300;line-height:1;margin-bottom:0.3rem}
        .beneficio-label{font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--g5)}

        /* STATS */
        .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--g2)}
        .stat{background:var(--white);padding:1.5rem 1rem;text-align:center;cursor:pointer;transition:background 0.2s}
        .stat:hover{background:var(--g1)}
        .stat-val{font-family:var(--serif);font-size:2rem;font-weight:300;line-height:1;margin-bottom:0.4rem}
        .stat-label{font-size:0.58rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--g5)}
        
        /* PONTOS */
        .pontos-card{background:var(--white);padding:2rem 2.5rem}
        .pontos-circles{display:flex;gap:0.5rem;margin-top:1rem;flex-wrap:wrap}
        .ponto{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:600;font-family:var(--sans)}
        
        /* CARD */
        .card{background:var(--white);padding:2rem 2.5rem}
        .card-t{font-size:0.65rem;letter-spacing:0.25em;text-transform:uppercase;color:var(--g5);font-weight:500;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--g1)}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
        .full{grid-column:1/-1}
        .fg{display:flex;flex-direction:column;gap:0.5rem}
        .lbl{font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;color:#2e2d2b;font-weight:500}
        .inp{width:100%;padding:0.9rem 1rem;border:1.5px solid var(--g2);background:var(--white);font-size:1rem;font-family:var(--sans);color:var(--black);outline:none;transition:border-color 0.2s;-webkit-appearance:none}
        .inp:focus{border-color:var(--black)}
        .inp:disabled{background:var(--g1);color:var(--g5)}
        select.inp{cursor:pointer}
        .loc-btn{display:flex;align-items:center;gap:0.5rem;font-size:0.75rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--black);background:none;border:1.5px solid var(--g2);padding:0.9rem 1rem;cursor:pointer;font-family:var(--sans);font-weight:500;width:100%;transition:border-color 0.2s}
        .loc-btn:hover{border-color:var(--black)}
        .save-row{display:flex;align-items:center;gap:1rem;margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--g1)}
        .btn-save{padding:0.9rem 2.5rem;background:var(--black);color:var(--white);border:none;font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;transition:background 0.2s}
        .btn-save:hover{background:#2e2d2b}
        .btn-ok{background:#27ae60}
        .divider{height:1px;background:var(--g1);margin:1.25rem 0}
        
        /* HISTÓRICO */
        .historico{display:flex;flex-direction:column;gap:1px;background:var(--g2);margin-top:1rem}
        .aluguer{background:var(--white);padding:1.25rem 1.5rem;display:flex;align-items:center;gap:1.5rem}
        .aluguer-img{width:56px;height:70px;flex-shrink:0;background:var(--g1);overflow:hidden;display:flex;align-items:center;justify-content:center}
        .aluguer-nome{font-family:var(--serif);font-size:1.15rem;font-weight:400;margin-bottom:0.2rem}
        .aluguer-meta{font-size:0.82rem;color:var(--g5)}
        .estado{font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;padding:0.3rem 0.7rem;font-weight:500;flex-shrink:0}
        .e-ativo{background:#e8f5e9;color:#27ae60}
        .e-dev{background:var(--g1);color:var(--g5)}
        .e-pend{background:#fff8e1;color:#f39c12}
        
        .btn-pedidos{display:block;width:100%;padding:1rem;background:var(--g1);color:var(--black);border:none;font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);cursor:pointer;text-align:center;text-decoration:none;margin-top:1rem;transition:background 0.2s}
        .btn-pedidos:hover{background:var(--g2)}
        .btn-sair{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g5);background:none;border:none;cursor:pointer;font-family:var(--sans);text-decoration:underline}
        .btn-sair:hover{color:#c0392b}

        @media(max-width:768px){
          .nav{padding:1rem 1.25rem}
          .page{padding:5rem 1.25rem 6rem;gap:1rem}
          .hero{flex-direction:column;align-items:flex-start;padding:1.5rem;gap:1rem}
          .stats{grid-template-columns:repeat(3,1fr)}
          .nivel-beneficios{grid-template-columns:1fr 1fr}
          .card{padding:1.5rem}
          .grid2{grid-template-columns:1fr}
          .full{grid-column:auto}
        }
      `}</style>

      <nav className="nav">
        <a href="/" className="nav-logo">Nora Grei</a>
        <a href="/" className="nav-back">← Início</a>
      </nav>

      <div className="page">

        {/* HERO */}
        <div className="hero">
          <div className="avatar-wrap">
            {perfil.avatar_url
              ? <img src={perfil.avatar_url} alt="Avatar" className="avatar" />
              : <div className="avatar-ph">{perfil.nome?.[0]?.toUpperCase() || "?"}</div>}
            <button className="avatar-btn" onClick={() => fileRef.current?.click()}>{uploadingFoto ? "..." : "+"}</button>
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={uploadFoto} />
          </div>
          <div>
            <div className="hero-nome">{perfil.nome || "Cliente"}</div>
            <div className="hero-email">{user?.email}</div>
            {perfil.cidade && <div style={{fontSize:'0.85rem',color:'var(--g5)',marginTop:'0.3rem'}}>📍 {perfil.cidade}, {perfil.pais}</div>}
          </div>
        </div>

        {/* NÍVEL */}
        <div className="nivel-card">
          <div className="nivel-top">
            <div>
              <div style={{fontSize:'0.6rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--g5)',marginBottom:'0.4rem'}}>Nível de confiança</div>
              <div className="nivel-badge" style={{background: nv.cor + '22', color: nv.cor}}>
                <span style={{fontSize:'1.2rem'}}>{nv.icon}</span>
                <span style={{fontWeight:600}}>{nv.nome}</span>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'var(--serif)',fontSize:'2rem',fontWeight:300,color:nv.cor}}>{nv.caucao === 0 ? "Sem" : nv.caucao + "%"}</div>
              <div className="nivel-caucao">{nv.caucao === 0 ? "caução" : "de caução"}</div>
            </div>
          </div>

          {nv.proximo && (
            <div className="nivel-barra-wrap">
              <div className="nivel-barra">
                <div className="nivel-barra-fill" style={{width:`${progressoPct}%`, background: nv.cor}} />
              </div>
              <div className="nivel-info">
                <span>{stats.totalPecas} peças alugadas</span>
                <span>Faltam {nv.falta} para {nv.icon} {nv.proximo}</span>
              </div>
            </div>
          )}
          {!nv.proximo && (
            <div style={{fontSize:'0.82rem',color:nv.cor,fontWeight:500,marginTop:'0.5rem'}}>
              💎 Nível máximo atingido — caução gratuita em todos os alugueres!
            </div>
          )}

          <div className="nivel-beneficios">
            <div className="beneficio">
              <div className="beneficio-val" style={{color:'#cd7f32'}}>🥉</div>
              <div className="beneficio-label">Bronze · 100% caução</div>
              <div style={{fontSize:'0.7rem',color:'var(--g5)',marginTop:'0.3rem'}}>0–4 peças</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-val" style={{color:'#95a5a6'}}>🥈</div>
              <div className="beneficio-label">Prata · 75% caução</div>
              <div style={{fontSize:'0.7rem',color:'var(--g5)',marginTop:'0.3rem'}}>5–9 peças</div>
            </div>
            <div className="beneficio">
              <div className="beneficio-val" style={{color:'#f39c12'}}>🥇</div>
              <div className="beneficio-label">Ouro · 50% caução</div>
              <div style={{fontSize:'0.7rem',color:'var(--g5)',marginTop:'0.3rem'}}>10–19 peças</div>
            </div>
          </div>
          {nv.nome !== "Platina" && (
            <div style={{marginTop:'1rem',padding:'0.75rem 1rem',background:'#f8f4ff',borderLeft:'3px solid #6c5ce7',fontSize:'0.82rem',color:'#6c5ce7'}}>
              💎 Platina (20+ peças sem danos) → <strong>caução gratuita</strong>
            </div>
          )}
        </div>

        {/* STATS */}
        <div className="stats">
          {[
            { val: stats.totalAlugueres, label: "Alugueres", href: "/pedidos" },
            { val: Number(stats.totalGasto).toFixed(0) + "€", label: "Total gasto" },
            { val: stats.pecasAtivas, label: "Ativas agora" },
            { val: stats.reservas, label: "Reservas", cor: stats.reservas > 0 ? "#e67e22" : undefined },
            { val: stats.pontos || stats.totalPecas, label: "Pontos" },
          ].map((s, i) => (
            <div key={i} className="stat" onClick={() => s.href && (window.location.href = s.href)}>
              <div className="stat-val" style={s.cor ? {color:s.cor} : {}}>{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* PONTOS */}
        <div className="pontos-card">
          <p style={{fontSize:'0.65rem',letterSpacing:'0.25em',textTransform:'uppercase',color:'var(--g5)',fontWeight:500}}>Pontos de fidelização</p>
          <p style={{fontSize:'0.85rem',color:'var(--g5)',marginTop:'0.5rem'}}>1 ponto por peça alugada · A 10ª peça é <strong>grátis</strong></p>
          <div className="pontos-circles">
            {Array.from({length: 10}).map((_, i) => {
              const pontos = stats.pontos || stats.totalPecas;
              const ciclo = pontos % 10;
              const cheio = i < ciclo;
              const gratuito = i === 9;
              return (
                <div key={i} className="ponto" style={{
                  background: cheio ? (gratuito ? '#c4748a' : 'var(--black)') : 'var(--g1)',
                  color: cheio ? '#fff' : 'var(--g5)',
                  border: gratuito ? '2px solid #c4748a' : 'none',
                }}>
                  {gratuito ? (cheio ? "🎁" : "🎁") : (cheio ? "✓" : i + 1)}
                </div>
              );
            })}
          </div>
          {stats.totalPecas > 0 && (
            <p style={{fontSize:'0.75rem',color:'var(--g5)',marginTop:'0.75rem'}}>
              {10 - ((stats.pontos || stats.totalPecas) % 10) === 10 ? "🎉 Próximo aluguer é gratuito!" : `Faltam ${10 - ((stats.pontos || stats.totalPecas) % 10)} pontos para aluguer gratuito`}
            </p>
          )}
        </div>

        {/* DADOS PESSOAIS */}
        <div className="card">
          <p className="card-t">{i.dadosPessoais}</p>
          <div className="grid2">
            <div className="fg"><label className="lbl">{i.nome}</label><input className="inp" value={perfil.nome} onChange={e => set("nome", e.target.value)} placeholder="Maria Silva" /></div>
            <div className="fg"><label className="lbl">{i.email}</label><input className="inp" value={user?.email || ""} disabled /></div>
            <div className="fg"><label className="lbl">{i.telefone}</label><input className="inp" type="tel" value={perfil.telefone} onChange={e => set("telefone", e.target.value)} placeholder="+351 912 345 678" /></div>
            <div className="fg"><label className="lbl">{i.dataNascimento}</label><input className="inp" type="date" value={perfil.data_nascimento} onChange={e => set("data_nascimento", e.target.value)} /></div>
            <div className="fg"><label className="lbl">{i.genero}</label>
              <select className="inp" value={perfil.genero} onChange={e => set("genero", e.target.value)}>
                <option value="">—</option>
                {i.generosOpcoes.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="fg"><label className="lbl">{i.nif}</label><input className="inp" value={perfil.nif} onChange={e => set("nif", e.target.value)} placeholder={i.nifPlaceholder} /></div>
          </div>

          <div className="divider" />
          <p className="card-t" style={{marginBottom:'1rem'}}>{i.localizacao}</p>
          <div className="grid2">
            <div className="fg full"><button className="loc-btn" onClick={detectarLocalizacao} disabled={detectandoLoc}>{detectandoLoc ? "A detectar..." : locDetectada ? i.localizacaoOk : i.detectarLocalizacao}</button></div>
            <div className="fg"><label className="lbl">{i.cidade}</label><input className="inp" value={perfil.cidade} onChange={e => set("cidade", e.target.value)} placeholder="Lisboa" /></div>
            <div className="fg"><label className="lbl">{i.codigoPostal}</label><input className="inp" value={perfil.codigo_postal} onChange={e => set("codigo_postal", e.target.value)} placeholder="1000-001" /></div>
            <div className="fg"><label className="lbl">{i.pais}</label><input className="inp" value={perfil.pais} onChange={e => set("pais", e.target.value)} /></div>
            <div className="fg"><label className="lbl">{i.morada}</label><input className="inp" value={perfil.morada} onChange={e => set("morada", e.target.value)} placeholder="Rua, nº, andar" /></div>
          </div>
          <div className="save-row">
            <button className={`btn-save${guardado ? " btn-ok" : ""}`} onClick={guardarPerfil}>{guardado ? i.guardado : i.guardar}</button>
          </div>
        </div>

        {/* HISTÓRICO */}
        <div className="card">
          <p className="card-t">{i.historico}</p>
          {alugueres.length === 0 ? (
            <div style={{textAlign:'center',padding:'2rem 0'}}>
              <p style={{color:'var(--g5)',marginBottom:'1.25rem'}}>Ainda não tens alugueres.</p>
              <a href="/catalogo" style={{display:'inline-block',padding:'0.9rem 2rem',background:'var(--black)',color:'var(--white)',textDecoration:'none',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif"}}>Explorar catálogo</a>
            </div>
          ) : (
            <>
              <div className="historico">
                {alugueres.slice(0, 5).map(a => {
                  const peca = a.stock_tamanhos?.pecas;
                  const estadoCss = a.estado === 'ativo' ? 'e-ativo' : a.estado === 'devolvido' ? 'e-dev' : 'e-pend';
                  return (
                    <div key={a.id} className="aluguer">
                      <div className="aluguer-img">
                        {peca?.fotos?.[0] ? <img src={peca.fotos[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontFamily:'var(--serif)',color:'var(--g5)'}}>NG</span>}
                      </div>
                      <div style={{flex:1}}>
                        <div className="aluguer-nome">{peca?.nome || "Peça"}</div>
                        <div className="aluguer-meta">{a.data_inicio} → {a.data_fim} · {a.valor_aluguer || 0}€</div>
                      </div>
                      <span className={`estado ${estadoCss}`}>{a.estado}</span>
                    </div>
                  );
                })}
              </div>
              <a href="/pedidos" className="btn-pedidos">{i.verPedidos} →</a>
            </>
          )}
        </div>

        <div style={{textAlign:'center',padding:'1rem 0 2rem'}}>
          <button className="btn-sair" onClick={sair}>{i.sair}</button>
        </div>
      </div>
    </>
  );
}