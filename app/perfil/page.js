"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const t = {
  pt: {
    titulo: "O meu perfil",
    editarFoto: "Alterar foto",
    dadosPessoais: "Dados pessoais",
    nome: "Nome",
    email: "Email",
    telefone: "Telefone",
    morada: "Morada",
    guardar: "Guardar alterações",
    guardado: "Guardado!",
    plano: "Plano atual",
    semPlano: "Sem plano ativo",
    verPlanos: "Ver planos",
    estatisticas: "As minhas estatísticas",
    totalAlugueres: "Total de alugueres",
    totalGasto: "Total gasto",
    pecasAtivas: "Peças ativas",
    categoriaFav: "Categoria favorita",
    historicoTitulo: "Histórico de alugueres",
    semHistorico: "Ainda não tens alugueres.",
    verCatalogo: "Explorar catálogo",
    sair: "Terminar sessão",
    ativo: "Ativo",
    devolvido: "Devolvido",
    pendente: "Pendente",
  },
  fr: {
    titulo: "Mon profil",
    editarFoto: "Changer la photo",
    dadosPessoais: "Données personnelles",
    nome: "Nom",
    email: "Email",
    telefone: "Téléphone",
    morada: "Adresse",
    guardar: "Enregistrer",
    guardado: "Enregistré !",
    plano: "Abonnement actuel",
    semPlano: "Aucun abonnement actif",
    verPlanos: "Voir les abonnements",
    estatisticas: "Mes statistiques",
    totalAlugueres: "Total de locations",
    totalGasto: "Total dépensé",
    pecasAtivas: "Pièces actives",
    categoriaFav: "Catégorie favorite",
    historicoTitulo: "Historique des locations",
    semHistorico: "Vous n'avez pas encore de locations.",
    verCatalogo: "Explorer le catalogue",
    sair: "Se déconnecter",
    ativo: "Actif",
    devolvido: "Retourné",
    pendente: "En attente",
  },
  lt: {
    titulo: "Mano profilis",
    editarFoto: "Keisti nuotrauką",
    dadosPessoais: "Asmeniniai duomenys",
    nome: "Vardas",
    email: "El. paštas",
    telefone: "Telefonas",
    morada: "Adresas",
    guardar: "Išsaugoti",
    guardado: "Išsaugota!",
    plano: "Dabartinis planas",
    semPlano: "Nėra aktyvaus plano",
    verPlanos: "Žiūrėti planus",
    estatisticas: "Mano statistika",
    totalAlugueres: "Iš viso nuomų",
    totalGasto: "Iš viso išleista",
    pecasAtivas: "Aktyvūs drabužiai",
    categoriaFav: "Mėgstamiausia kategorija",
    historicoTitulo: "Nuomų istorija",
    semHistorico: "Dar neturite nuomų.",
    verCatalogo: "Naršyti katalogą",
    sair: "Atsijungti",
    ativo: "Aktyvus",
    devolvido: "Grąžintas",
    pendente: "Laukiama",
  },
};

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({ nome: "", telefone: "", morada: "", avatar_url: "" });
  const [alugueres, setAlugueres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardado, setGuardado] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
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
    setPerfil(prev => ({
      ...prev,
      nome: user.user_metadata?.nome || "",
      telefone: user.user_metadata?.telefone || "",
      avatar_url: user.user_metadata?.avatar_url || "",
    }));

    const { data: alugueresData } = await supabase
      .from("alugueres")
      .select(`*, stock_tamanhos(tamanho, pecas(nome, preco_aluguer_dia, fotos))`)
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (alugueresData) setAlugueres(alugueresData);
    setLoading(false);
  };

  const guardarPerfil = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { nome: perfil.nome, telefone: perfil.telefone, morada: perfil.morada, avatar_url: perfil.avatar_url }
    });
    if (!error) { setGuardado(true); setTimeout(() => setGuardado(false), 3000); }
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
    }
    setUploadingFoto(false);
  };

  const sair = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const i = t[lang] || t.pt;

  const totalGasto = alugueres.reduce((sum, a) => sum + (a.valor_aluguer || 0), 0);
  const pecasAtivas = alugueres.filter(a => a.estado === "ativo").length;

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Jost',sans-serif",fontSize:'0.8rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#888580'}}>
      A carregar...
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --black: #080808; --white: #f8f7f5; --grey-100: #f0eeeb; --grey-200: #e2dfda; --grey-500: #5a5855; --grey-700: #2e2d2b; --serif: 'Cormorant', Georgia, serif; --sans: 'Jost', Arial, sans-serif; }
        body { background: var(--grey-100); font-family: var(--sans); font-weight: 400; font-size: 17px; -webkit-font-smoothing: antialiased; }

        .pf-nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.25rem 4rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--grey-200); }
        .pf-nav-logo { font-family:var(--serif); font-size:1.2rem; font-weight:400; letter-spacing:0.25em; text-transform:uppercase; text-decoration:none; color:var(--black); }
        .pf-nav-back { font-size:0.68rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-500); text-decoration:none; font-weight:400; transition:color 0.2s; }
        .pf-nav-back:hover { color:var(--black); }

        .pf-page { padding: 6rem 4rem 4rem; max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }

        /* HERO PERFIL */
        .pf-hero { background: var(--white); padding: 2.5rem; display: flex; align-items: center; gap: 2rem; }
        .pf-avatar-wrap { position: relative; flex-shrink: 0; }
        .pf-avatar { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; background: var(--grey-200); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .pf-avatar-placeholder { width: 96px; height: 96px; border-radius: 50%; background: var(--grey-200); display: flex; align-items: center; justify-content: center; font-family: var(--serif); font-size: 2.5rem; font-weight: 300; color: var(--grey-500); }
        .pf-avatar-btn { position: absolute; bottom: 0; right: 0; width: 28px; height: 28px; border-radius: 50%; background: var(--black); color: var(--white); border: 2px solid var(--white); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem; }
        .pf-hero-info { flex: 1; }
        .pf-hero-nome { font-family: var(--serif); font-size: 2rem; font-weight: 400; color: var(--black); line-height: 1.1; margin-bottom: 0.3rem; }
        .pf-hero-email { font-size: 0.9rem; color: var(--grey-500); font-weight: 400; }
        .pf-hero-plano { display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--grey-700); font-weight: 500; }
        .pf-hero-plano-dot { width: 6px; height: 6px; border-radius: 50%; background: #27ae60; }

        /* STATS */
        .pf-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--grey-200); }
        .pf-stat { background: var(--white); padding: 1.5rem; text-align: center; }
        .pf-stat-val { font-family: var(--serif); font-size: 2.5rem; font-weight: 300; color: var(--black); line-height: 1; margin-bottom: 0.4rem; }
        .pf-stat-label { font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--grey-500); font-weight: 400; }

        /* CARD SECÇÃO */
        .pf-card { background: var(--white); padding: 2rem 2.5rem; }
        .pf-card-title { font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--grey-500); font-weight: 500; margin-bottom: 1.75rem; }
        .pf-form-group { margin-bottom: 1.25rem; }
        .pf-label { display: block; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--grey-700); margin-bottom: 0.5rem; font-weight: 500; }
        .pf-input { width: 100%; padding: 0.9rem 1rem; border: 1.5px solid var(--grey-200); background: var(--white); font-size: 1rem; font-family: var(--sans); font-weight: 400; color: var(--black); outline: none; transition: border-color 0.2s; }
        .pf-input:focus { border-color: var(--black); }
        .pf-input[disabled] { background: var(--grey-100); color: var(--grey-500); }
        .pf-btn { padding: 0.9rem 2rem; background: var(--black); color: var(--white); border: none; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; font-family: var(--sans); font-weight: 500; cursor: pointer; transition: background 0.2s; }
        .pf-btn:hover { background: var(--grey-700); }
        .pf-btn-success { background: #27ae60; }

        /* HISTÓRICO */
        .pf-historico { display: flex; flex-direction: column; gap: 1px; background: var(--grey-200); }
        .pf-aluguer { background: var(--white); padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1.5rem; }
        .pf-aluguer-img { width: 56px; height: 70px; object-fit: cover; background: var(--grey-100); flex-shrink: 0; }
        .pf-aluguer-info { flex: 1; }
        .pf-aluguer-nome { font-family: var(--serif); font-size: 1.15rem; font-weight: 400; color: var(--black); margin-bottom: 0.2rem; }
        .pf-aluguer-meta { font-size: 0.8rem; color: var(--grey-500); font-weight: 400; }
        .pf-aluguer-estado { font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.3rem 0.7rem; font-weight: 500; }
        .pf-estado-ativo { background: #e8f5e9; color: #27ae60; }
        .pf-estado-devolvido { background: var(--grey-100); color: var(--grey-500); }
        .pf-estado-pendente { background: #fff8e1; color: #f39c12; }

        .pf-sair { display: flex; justify-content: center; padding: 1rem 0 3rem; }
        .pf-btn-sair { font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--grey-500); background: none; border: none; cursor: pointer; font-family: var(--sans); font-weight: 400; text-decoration: underline; transition: color 0.2s; }
        .pf-btn-sair:hover { color: #c0392b; }

        @media (max-width: 768px) {
          .pf-nav { padding: 1rem 1.25rem; }
          .pf-page { padding: 5rem 1.25rem 6rem; gap: 1.25rem; }
          .pf-hero { flex-direction: column; align-items: flex-start; padding: 1.75rem 1.25rem; gap: 1.25rem; }
          .pf-stats { grid-template-columns: repeat(2, 1fr); }
          .pf-stat { padding: 1.25rem; }
          .pf-stat-val { font-size: 2rem; }
          .pf-card { padding: 1.5rem 1.25rem; }
          .pf-aluguer { padding: 1rem 1.25rem; gap: 1rem; }
          .pf-input { font-size: 1.05rem; padding: 1rem; }
          .pf-label { font-size: 0.78rem; }
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
              <div className="pf-avatar-placeholder">
                {perfil.nome ? perfil.nome[0].toUpperCase() : "?"}
              </div>
            )}
            <button className="pf-avatar-btn" onClick={() => fileRef.current?.click()}>
              {uploadingFoto ? "..." : "+"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={uploadFoto} />
          </div>
          <div className="pf-hero-info">
            <div className="pf-hero-nome">{perfil.nome || "Cliente"}</div>
            <div className="pf-hero-email">{user?.email}</div>
            <div className="pf-hero-plano">
              <div className="pf-hero-plano-dot"></div>
              {i.semPlano} — <a href="#planos" style={{color:'var(--black)',fontWeight:500}}>{i.verPlanos}</a>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="pf-stats">
          <div className="pf-stat">
            <div className="pf-stat-val">{alugueres.length}</div>
            <div className="pf-stat-label">{i.totalAlugueres}</div>
          </div>
          <div className="pf-stat">
            <div className="pf-stat-val">{totalGasto.toFixed(0)}€</div>
            <div className="pf-stat-label">{i.totalGasto}</div>
          </div>
          <div className="pf-stat">
            <div className="pf-stat-val">{pecasAtivas}</div>
            <div className="pf-stat-label">{i.pecasAtivas}</div>
          </div>
          <div className="pf-stat">
            <div className="pf-stat-val">—</div>
            <div className="pf-stat-label">{i.categoriaFav}</div>
          </div>
        </div>

        {/* DADOS PESSOAIS */}
        <div className="pf-card">
          <p className="pf-card-title">{i.dadosPessoais}</p>
          <div className="pf-form-group">
            <label className="pf-label">{i.nome}</label>
            <input className="pf-input" type="text" value={perfil.nome} onChange={e => setPerfil(p => ({...p, nome: e.target.value}))} />
          </div>
          <div className="pf-form-group">
            <label className="pf-label">{i.email}</label>
            <input className="pf-input" type="email" value={user?.email || ""} disabled />
          </div>
          <div className="pf-form-group">
            <label className="pf-label">{i.telefone}</label>
            <input className="pf-input" type="tel" value={perfil.telefone} onChange={e => setPerfil(p => ({...p, telefone: e.target.value}))} placeholder="+351 912 345 678" />
          </div>
          <div className="pf-form-group" style={{marginBottom:'1.5rem'}}>
            <label className="pf-label">{i.morada}</label>
            <input className="pf-input" type="text" value={perfil.morada} onChange={e => setPerfil(p => ({...p, morada: e.target.value}))} placeholder="Rua, nº, cidade" />
          </div>
          <button className={`pf-btn${guardado ? ' pf-btn-success' : ''}`} onClick={guardarPerfil}>
            {guardado ? i.guardado : i.guardar}
          </button>
        </div>

        {/* HISTÓRICO */}
        <div className="pf-card">
          <p className="pf-card-title">{i.historicoTitulo}</p>
          {alugueres.length === 0 ? (
            <div style={{textAlign:'center',padding:'2rem 0'}}>
              <p style={{color:'var(--grey-500)',marginBottom:'1.25rem',fontSize:'1rem'}}>{i.semHistorico}</p>
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
                    {peca?.fotos?.[0] ? (
                      <img src={peca.fotos[0]} alt={peca.nome} className="pf-aluguer-img" />
                    ) : (
                      <div className="pf-aluguer-img" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <span style={{fontFamily:"'Cormorant',serif",fontSize:'1.2rem',color:'var(--grey-400)'}}>NG</span>
                      </div>
                    )}
                    <div className="pf-aluguer-info">
                      <div className="pf-aluguer-nome">{peca?.nome || "Peça"}</div>
                      <div className="pf-aluguer-meta">
                        {a.data_inicio} → {a.data_fim} · {a.valor_aluguer}€
                      </div>
                    </div>
                    <div className={`pf-aluguer-estado pf-estado-${a.estado === 'ativo' ? 'ativo' : a.estado === 'devolvido' ? 'devolvido' : 'pendente'}`}>
                      {i[a.estado] || a.estado}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SAIR */}
        <div className="pf-sair">
          <button className="pf-btn-sair" onClick={sair}>{i.sair}</button>
        </div>

      </div>
    </>
  );
}