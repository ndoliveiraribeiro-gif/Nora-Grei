"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import PontosWidget from "@/components/PontosWidget";
import CodigoDesconto from "@/components/CodigoDesconto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const t = {
  pt: {
    titulo: "O meu perfil",
    dadosPessoais: "Dados pessoais",
    nome: "Nome completo", email: "Email", telefone: "Telefone",
    dataNascimento: "Data de nascimento", genero: "Género",
    generosOpcoes: ["Mulher", "Homem", "Prefiro não especificar"],
    nif: "NIF / Contribuinte", nifPlaceholder: "123 456 789",
    localizacao: "Localização", cidade: "Cidade", pais: "País",
    codigoPostal: "Código postal", morada: "Morada completa",
    detectarLocalizacao: "📍 Detectar automaticamente",
    localizacaoOk: "📍 Localização detectada ✓",
    guardar: "Guardar", guardado: "Guardado! ✓",
    estatisticas: "As minhas estatísticas",
    totalAlugueres: "Alugueres", totalGasto: "Total gasto",
    pecasAtivas: "Ativas", reservas: "Reservas", categoriaFav: "Favorita",
    historico: "Histórico de alugueres",
    semHistorico: "Ainda não tens alugueres.",
    verCatalogo: "Explorar catálogo",
    sair: "Terminar sessão",
    ativo: "Ativo", devolvido: "Devolvido", pendente: "Pendente",
  },
  fr: {
    titulo: "Mon profil",
    dadosPessoais: "Données personnelles",
    nome: "Nom complet", email: "Email", telefone: "Téléphone",
    dataNascimento: "Date de naissance", genero: "Genre",
    generosOpcoes: ["Femme", "Homme", "Préfère ne pas préciser"],
    nif: "Numéro fiscal", nifPlaceholder: "FR 12 345678901",
    localizacao: "Localisation", cidade: "Ville", pais: "Pays",
    codigoPostal: "Code postal", morada: "Adresse complète",
    detectarLocalizacao: "📍 Détecter automatiquement",
    localizacaoOk: "📍 Localisation détectée ✓",
    guardar: "Enregistrer", guardado: "Enregistré ! ✓",
    estatisticas: "Mes statistiques",
    totalAlugueres: "Locations", totalGasto: "Total dépensé",
    pecasAtivas: "Actives", reservas: "Réservations", categoriaFav: "Favorite",
    historico: "Historique des locations",
    semHistorico: "Pas encore de locations.",
    verCatalogo: "Explorer le catalogue",
    sair: "Se déconnecter",
    ativo: "Actif", devolvido: "Retourné", pendente: "En attente",
  },
  lt: {
    titulo: "Mano profilis",
    dadosPessoais: "Asmeniniai duomenys",
    nome: "Pilnas vardas", email: "El. paštas", telefone: "Telefonas",
    dataNascimento: "Gimimo data", genero: "Lytis",
    generosOpcoes: ["Moteris", "Vyras", "Nenurodyti"],
    nif: "Mokesčių numeris", nifPlaceholder: "LT123456789",
    localizacao: "Vieta", cidade: "Miestas", pais: "Šalis",
    codigoPostal: "Pašto kodas", morada: "Pilnas adresas",
    detectarLocalizacao: "📍 Aptikti automatiškai",
    localizacaoOk: "📍 Vieta aptikta ✓",
    guardar: "Išsaugoti", guardado: "Išsaugota! ✓",
    estatisticas: "Mano statistika",
    totalAlugueres: "Nuomos", totalGasto: "Išleista",
    pecasAtivas: "Aktyvios", reservas: "Rezervacijos", categoriaFav: "Mėgstama",
    historico: "Nuomų istorija",
    semHistorico: "Dar nėra nuomų.",
    verCatalogo: "Naršyti katalogą",
    sair: "Atsijungti",
    ativo: "Aktyvus", devolvido: "Grąžintas", pendente: "Laukiama",
  },
};

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({
    nome: "", telefone: "", morada: "", avatar_url: "",
    nif: "", data_nascimento: "", genero: "",
    cidade: "", pais: "Portugal", codigo_postal: "",
    latitude: null, longitude: null,
  });
  const [stats, setStats] = useState({ totalAlugueres: 0, totalGasto: 0, pecasAtivas: 0, reservas: 0, pontos: 0, totalPecas: 0 });
  const [alugueres, setAlugueres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardado, setGuardado] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [detectandoLoc, setDetectandoLoc] = useState(false);
  const [locDetectada, setLocDetectada] = useState(false);
  const [lang, setLang] = useState("pt");
  const fileRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved) setLang(saved);
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/entrar"; return; }
    setUser(user);

    const { data: clienteData } = await supabase
      .from("clientes").select("*").eq("id", user.id).single();

    if (clienteData) {
      setPerfil({
        nome: clienteData.nome || user.user_metadata?.nome || "",
        telefone: clienteData.telefone || "",
        morada: clienteData.morada || "",
        avatar_url: user.user_metadata?.avatar_url || "",
        nif: clienteData.nif || "",
        data_nascimento: clienteData.data_nascimento || "",
        genero: clienteData.genero || "",
        cidade: clienteData.cidade || "",
        pais: clienteData.pais || "Portugal",
        codigo_postal: clienteData.codigo_postal || "",
        latitude: clienteData.latitude || null,
        longitude: clienteData.longitude || null,
      });
    }

    const { data: statsData } = await supabase
      .from("estatisticas_cliente").select("*").eq("id", user.id).single();

    if (statsData) {
      setStats({
        totalAlugueres: statsData.total_alugueres || 0,
        totalGasto: statsData.total_gasto || 0,
        pecasAtivas: statsData.pecas_ativas || 0,
        reservas: statsData.reservas_espera || 0,
        pontos: clienteData?.pontos || 0,
        totalPecas: clienteData?.total_pecas_alugadas || 0,
      });
    }

    const { data: alugueresData } = await supabase
      .from("alugueres")
      .select(`*, stock_tamanhos(tamanho, pecas(nome, preco_aluguer_dia, fotos))`)
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (alugueresData) setAlugueres(alugueresData);
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
    await supabase.from("clientes").upsert({
      id: user.id, email: user.email,
      nome: perfil.nome, telefone: perfil.telefone, morada: perfil.morada,
      nif: perfil.nif, data_nascimento: perfil.data_nascimento || null,
      genero: perfil.genero, cidade: perfil.cidade, pais: perfil.pais,
      codigo_postal: perfil.codigo_postal,
      latitude: perfil.latitude, longitude: perfil.longitude,
    });
    await supabase.auth.updateUser({ data: { nome: perfil.nome, telefone: perfil.telefone, avatar_url: perfil.avatar_url } });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const uploadFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingFoto(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setPerfil(prev => ({ ...prev, avatar_url: data.publicUrl }));
      await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
    }
    setUploadingFoto(false);
  };

  const sair = async () => { await supabase.auth.signOut(); window.location.href = "/"; };
  const set = (key, val) => setPerfil(prev => ({ ...prev, [key]: val }));
  const i = t[lang] || t.pt;

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#888580'}}>
      A carregar...
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --black:#080808; --white:#f8f7f5; --grey-100:#f0eeeb; --grey-200:#e2dfda; --grey-500:#5a5855; --grey-700:#2e2d2b; --serif:'Cormorant',Georgia,serif; --sans:'Jost',Arial,sans-serif; }
        body { background:var(--grey-100); font-family:var(--sans); font-weight:400; font-size:17px; -webkit-font-smoothing:antialiased; }
        .pf-nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.25rem 4rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--grey-200); }
        .pf-nav-logo { font-family:var(--serif); font-size:1.2rem; font-weight:400; letter-spacing:0.25em; text-transform:uppercase; text-decoration:none; color:var(--black); }
        .pf-nav-back { font-size:0.68rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-500); text-decoration:none; font-weight:400; }
        .pf-page { padding:6rem 4rem 4rem; max-width:900px; margin:0 auto; display:flex; flex-direction:column; gap:1.5rem; }
        .pf-hero { background:var(--white); padding:2.5rem; display:flex; align-items:center; gap:2rem; }
        .pf-avatar-wrap { position:relative; flex-shrink:0; }
        .pf-avatar { width:96px; height:96px; border-radius:50%; object-fit:cover; }
        .pf-avatar-placeholder { width:96px; height:96px; border-radius:50%; background:var(--grey-200); display:flex; align-items:center; justify-content:center; font-family:var(--serif); font-size:2.5rem; font-weight:300; color:var(--grey-500); }
        .pf-avatar-btn { position:absolute; bottom:0; right:0; width:28px; height:28px; border-radius:50%; background:var(--black); color:var(--white); border:2px solid var(--white); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1rem; font-weight:500; }
        .pf-hero-nome { font-family:var(--serif); font-size:2rem; font-weight:400; color:var(--black); line-height:1.1; margin-bottom:0.3rem; }
        .pf-hero-email { font-size:0.92rem; color:var(--grey-500); }
        .pf-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:1px; background:var(--grey-200); }
        .pf-stat { background:var(--white); padding:1.5rem 1rem; text-align:center; }
        .pf-stat-val { font-family:var(--serif); font-size:2rem; font-weight:300; color:var(--black); line-height:1; margin-bottom:0.4rem; }
        .pf-stat-label { font-size:0.58rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--grey-500); font-weight:400; }
        .pf-stat.reservas .pf-stat-val { color: #e67e22; }
        .pf-card { background:var(--white); padding:2rem 2.5rem; }
        .pf-card-title { font-size:0.65rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--grey-500); font-weight:500; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--grey-100); }
        .pf-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
        .pf-form-group { display:flex; flex-direction:column; gap:0.5rem; }
        .pf-form-group-full { grid-column:1/-1; }
        .pf-label { font-size:0.72rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--grey-700); font-weight:500; }
        .pf-input { width:100%; padding:0.9rem 1rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:1rem; font-family:var(--sans); font-weight:400; color:var(--black); outline:none; transition:border-color 0.2s; border-radius:0; -webkit-appearance:none; }
        .pf-input:focus { border-color:var(--black); }
        .pf-input[disabled] { background:var(--grey-100); color:var(--grey-500); }
        .pf-select { width:100%; padding:0.9rem 1rem; border:1.5px solid var(--grey-200); background:var(--white); font-size:1rem; font-family:var(--sans); font-weight:400; color:var(--black); outline:none; border-radius:0; -webkit-appearance:none; cursor:pointer; }
        .pf-loc-btn { display:flex; align-items:center; gap:0.5rem; font-size:0.75rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--black); background:none; border:1.5px solid var(--grey-200); padding:0.9rem 1rem; cursor:pointer; font-family:var(--sans); font-weight:500; width:100%; transition:border-color 0.2s; }
        .pf-loc-btn:hover { border-color:var(--black); }
        .pf-save-row { display:flex; align-items:center; gap:1rem; margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid var(--grey-100); }
        .pf-btn { padding:0.9rem 2.5rem; background:var(--black); color:var(--white); border:none; font-size:0.72rem; letter-spacing:0.18em; text-transform:uppercase; font-family:var(--sans); font-weight:500; cursor:pointer; transition:background 0.2s; }
        .pf-btn:hover { background:var(--grey-700); }
        .pf-btn-success { background:#27ae60; }
        .pf-historico { display:flex; flex-direction:column; gap:1px; background:var(--grey-200); margin-top:1rem; }
        .pf-aluguer { background:var(--white); padding:1.25rem 1.5rem; display:flex; align-items:center; gap:1.5rem; }
        .pf-aluguer-img { width:56px; height:70px; flex-shrink:0; background:var(--grey-100); overflow:hidden; display:flex; align-items:center; justify-content:center; }
        .pf-aluguer-nome { font-family:var(--serif); font-size:1.15rem; font-weight:400; color:var(--black); margin-bottom:0.2rem; }
        .pf-aluguer-meta { font-size:0.82rem; color:var(--grey-500); }
        .pf-estado { font-size:0.6rem; letter-spacing:0.15em; text-transform:uppercase; padding:0.3rem 0.7rem; font-weight:500; flex-shrink:0; }
        .pf-estado-ativo { background:#e8f5e9; color:#27ae60; }
        .pf-estado-devolvido { background:var(--grey-100); color:var(--grey-500); }
        .pf-estado-pendente { background:#fff8e1; color:#f39c12; }
        .pf-sair { text-align:center; padding:1rem 0 2rem; }
        .pf-btn-sair { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-500); background:none; border:none; cursor:pointer; font-family:var(--sans); font-weight:400; text-decoration:underline; }
        .pf-btn-sair:hover { color:#c0392b; }
        .sec-divider { height:1px; background:var(--grey-100); margin:1.25rem 0; }

        @media (max-width:768px) {
          .pf-nav { padding:1rem 1.25rem; }
          .pf-page { padding:5rem 1.25rem 6rem; gap:1rem; }
          .pf-hero { flex-direction:column; align-items:flex-start; padding:1.5rem 1.25rem; gap:1rem; }
          .pf-stats { grid-template-columns:repeat(3,1fr); }
          .pf-stat { padding:1rem 0.75rem; }
          .pf-stat-val { font-size:1.8rem; }
          .pf-stat-label { font-size:0.55rem; }
          .pf-card { padding:1.5rem 1.25rem; }
          .pf-grid { grid-template-columns:1fr; }
          .pf-form-group-full { grid-column:auto; }
          .pf-input, .pf-select { font-size:1.05rem; padding:1rem; }
          .pf-label { font-size:0.78rem; }
          .pf-aluguer { padding:1rem 1.25rem; gap:1rem; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap" rel="stylesheet" />

      <nav className="pf-nav">
        <a href="/" className="pf-nav-logo">Nora Grei</a>
        <a href="/" className="pf-nav-back">← Início</a>
      </nav>

      <div className="pf-page">

        {/* HERO */}
        <div className="pf-hero">
          <div className="pf-avatar-wrap">
            {perfil.avatar_url ? (
              <img src={perfil.avatar_url} alt="Avatar" className="pf-avatar" />
            ) : (
              <div className="pf-avatar-placeholder">{perfil.nome ? perfil.nome[0].toUpperCase() : "?"}</div>
            )}
            <button className="pf-avatar-btn" onClick={() => fileRef.current?.click()}>
              {uploadingFoto ? "..." : "+"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={uploadFoto} />
          </div>
          <div>
            <div className="pf-hero-nome">{perfil.nome || "Cliente"}</div>
            <div className="pf-hero-email">{user?.email}</div>
            {perfil.cidade && <div style={{fontSize:'0.85rem',color:'var(--grey-500)',marginTop:'0.3rem'}}>📍 {perfil.cidade}, {perfil.pais}</div>}
          </div>
        </div>

        {/* STATS — 5 métricas */}
        <div className="pf-stats">
          <div className="pf-stat">
            <div className="pf-stat-val">{stats.totalAlugueres}</div>
            <div className="pf-stat-label">{i.totalAlugueres}</div>
          </div>
          <div className="pf-stat">
            <div className="pf-stat-val">{Number(stats.totalGasto).toFixed(0)}€</div>
            <div className="pf-stat-label">{i.totalGasto}</div>
          </div>
          <div className="pf-stat">
            <div className="pf-stat-val">{stats.pecasAtivas}</div>
            <div className="pf-stat-label">{i.pecasAtivas}</div>
          </div>
          <div className="pf-stat reservas">
            <div className="pf-stat-val">{stats.reservas}</div>
            <div className="pf-stat-label">{i.reservas}</div>
          </div>
          <div className="pf-stat">
            <div className="pf-stat-val">{stats.pontos}</div>
            <div className="pf-stat-label">Pontos</div>
          </div>
        </div>

        {/* PONTOS FIDELIZAÇÃO */}
        <PontosWidget pontos={stats.pontos} totalPecas={stats.totalPecas} lang={lang} />

        {/* DADOS PESSOAIS */}
        <div className="pf-card">
          <p className="pf-card-title">{i.dadosPessoais}</p>
          <div className="pf-grid">
            <div className="pf-form-group">
              <label className="pf-label">{i.nome}</label>
              <input className="pf-input" type="text" value={perfil.nome} onChange={e => set("nome", e.target.value)} placeholder="Maria Silva" />
            </div>
            <div className="pf-form-group">
              <label className="pf-label">{i.email}</label>
              <input className="pf-input" type="email" value={user?.email || ""} disabled />
            </div>
            <div className="pf-form-group">
              <label className="pf-label">{i.telefone}</label>
              <input className="pf-input" type="tel" value={perfil.telefone} onChange={e => set("telefone", e.target.value)} placeholder="+351 912 345 678" />
            </div>
            <div className="pf-form-group">
              <label className="pf-label">{i.dataNascimento}</label>
              <input className="pf-input" type="date" value={perfil.data_nascimento} onChange={e => set("data_nascimento", e.target.value)} />
            </div>
            <div className="pf-form-group">
              <label className="pf-label">{i.genero}</label>
              <select className="pf-select" value={perfil.genero} onChange={e => set("genero", e.target.value)}>
                <option value="">—</option>
                {i.generosOpcoes.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="pf-form-group">
              <label className="pf-label">{i.nif}</label>
              <input className="pf-input" type="text" value={perfil.nif} onChange={e => set("nif", e.target.value)} placeholder={i.nifPlaceholder} />
            </div>
          </div>

          <div className="sec-divider"></div>
          <p className="pf-card-title" style={{marginBottom:'1rem'}}>{i.localizacao}</p>
          <div className="pf-grid">
            <div className="pf-form-group pf-form-group-full">
              <button className="pf-loc-btn" onClick={detectarLocalizacao} disabled={detectandoLoc}>
                {detectandoLoc ? "A detectar..." : locDetectada ? i.localizacaoOk : i.detectarLocalizacao}
              </button>
            </div>
            <div className="pf-form-group">
              <label className="pf-label">{i.cidade}</label>
              <input className="pf-input" type="text" value={perfil.cidade} onChange={e => set("cidade", e.target.value)} placeholder="Lisboa" />
            </div>
            <div className="pf-form-group">
              <label className="pf-label">{i.codigoPostal}</label>
              <input className="pf-input" type="text" value={perfil.codigo_postal} onChange={e => set("codigo_postal", e.target.value)} placeholder="1000-001" />
            </div>
            <div className="pf-form-group">
              <label className="pf-label">{i.pais}</label>
              <input className="pf-input" type="text" value={perfil.pais} onChange={e => set("pais", e.target.value)} />
            </div>
            <div className="pf-form-group">
              <label className="pf-label">{i.morada}</label>
              <input className="pf-input" type="text" value={perfil.morada} onChange={e => set("morada", e.target.value)} placeholder="Rua, nº, andar" />
            </div>
          </div>

          <div className="pf-save-row">
            <button className={`pf-btn${guardado ? ' pf-btn-success' : ''}`} onClick={guardarPerfil}>
              {guardado ? i.guardado : i.guardar}
            </button>
          </div>
        </div>

        {/* HISTÓRICO */}
        <div className="pf-card">
          <p className="pf-card-title">{i.historico}</p>
          {alugueres.length === 0 ? (
            <div style={{textAlign:'center',padding:'2rem 0'}}>
              <p style={{color:'var(--grey-500)',marginBottom:'1.25rem'}}>{i.semHistorico}</p>
              <a href="/catalogo" style={{display:'inline-block',padding:'0.9rem 2rem',background:'var(--black)',color:'var(--white)',textDecoration:'none',fontSize:'0.72rem',letterSpacing:'0.15em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",fontWeight:500}}>
                {i.verCatalogo}
              </a>
            </div>
          ) : (
            <div className="pf-historico">
              {alugueres.map(a => {
                const peca = a.stock_tamanhos?.pecas;
                return (
                  <div key={a.id} className="pf-aluguer">
                    <div className="pf-aluguer-img">
                      {peca?.fotos?.[0] ? <img src={peca.fotos[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontFamily:"'Cormorant',serif",color:'var(--grey-400)'}}>NG</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div className="pf-aluguer-nome">{peca?.nome || "Peça"}</div>
                      <div className="pf-aluguer-meta">{a.data_inicio} → {a.data_fim} · {a.valor_aluguer || 0}€</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.5rem'}}>
                      <div className={`pf-estado pf-estado-${a.estado === 'ativo' ? 'ativo' : a.estado === 'devolvido' ? 'devolvido' : 'pendente'}`}>
                        {i[a.estado] || a.estado}
                      </div>
                      {a.estado === 'devolvido' && (
                        <CodigoDesconto aluguer={a} clienteId={user?.id} lang={lang} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pf-sair">
          <button className="pf-btn-sair" onClick={sair}>{i.sair}</button>
        </div>
      </div>
    </>
  );
}