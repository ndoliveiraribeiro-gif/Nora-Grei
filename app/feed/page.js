"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const T = {
  pt: { titulo:"Feed Nora Grei", sub:"Descobre as últimas peças e looks", buscar:"Pesquisar peças, looks, marcas...", publicar:"+ Publicar", boosted:"Destaque", novo:"Novo", verPeca:"Ver peça", alugar:"Alugar", semPosts:"Ainda sem posts. Sê o primeiro!", carregarMais:"Ver mais", likes:"gostos", hoje:"Hoje", ontem:"Ontem" },
  fr: { titulo:"Feed Nora Grei", sub:"Découvrez les dernières pièces et looks", buscar:"Rechercher pièces, looks, marques...", publicar:"+ Publier", boosted:"À la une", novo:"Nouveau", verPeca:"Voir la pièce", alugar:"Louer", semPosts:"Pas encore de posts.", carregarMais:"Voir plus", likes:"j'aime", hoje:"Aujourd'hui", ontem:"Hier" },
  lt: { titulo:"Nora Grei Srautas", sub:"Atraskite naujausias detales ir vaizdus", buscar:"Ieškoti...", publicar:"+ Skelbti", boosted:"Išskirta", novo:"Nauja", verPeca:"Žiūrėti", alugar:"Nuomoti", semPosts:"Dar nėra įrašų.", carregarMais:"Rodyti daugiau", likes:"patiktimai", hoje:"Šiandien", ontem:"Vakar" },
};

function tempoRelativo(dt, t) {
  const d = new Date(dt), n = new Date();
  const diff = n - d;
  if (diff < 86400000) return t.hoje;
  if (diff < 172800000) return t.ontem;
  return d.toLocaleDateString("pt-PT", { day:"numeric", month:"short" });
}

export default function FeedPage() {
  const [lang, setLang] = useState("pt");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [user, setUser] = useState(null);
  const [likesFeitos, setLikesFeitos] = useState({});
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [feedTab, setFeedTab] = useState("parati"); // "parati" | "seguindo"
  const POR_PAG = 12;
  const t = T[lang] || T.pt;

  useEffect(() => {
    const l = localStorage.getItem("ng_lang") || navigator.language?.split("-")[0] || "pt";
    setLang(["pt","fr","lt"].includes(l) ? l : "pt");
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      carregar(0, true, data?.user || null, feedTab);
    });
  }, []);

  useEffect(() => {
    carregar(0, true, user, feedTab);
  }, [feedTab]);

  const carregar = async (pag = 0, reset = false, currentUser = user, tab = feedTab) => {
    setLoading(true);
    let query = supabase
      .from("feed_posts")
      .select("*, clientes(nome, avatar_url, id), pecas(id, nome, preco_aluguer_dia, fotos, categorias(nome))")
      .eq("estado", "publicado")
      .order("boosted", { ascending: false })
      .order("publicado_em", { ascending: false })
      .range(pag * POR_PAG, pag * POR_PAG + POR_PAG - 1);

    // Tab "Seguindo": filtrar só posts de lojistas que o user segue
    if (tab === "seguindo" && currentUser) {
      const { data: follows } = await supabase.from("follows").select("lojista_id").eq("follower_id", currentUser.id);
      const lojistaIds = (follows || []).map(f => f.lojista_id);
      if (lojistaIds.length === 0) {
        setPosts(reset ? [] : posts);
        setTemMais(false);
        setPagina(pag);
        setLoading(false);
        return;
      }
      query = query.in("cliente_id", lojistaIds);
    }

    const { data } = await query;
    const lista = data || [];
    setPosts(prev => reset ? lista : [...prev, ...lista]);
    setTemMais(lista.length === POR_PAG);
    setPagina(pag);
    setLoading(false);
    // likes do user
    if (currentUser && lista.length > 0) {
      const ids = lista.map(p => p.id);
      const { data: lk } = await supabase.from("feed_likes").select("post_id").eq("cliente_id", currentUser.id).in("post_id", ids);
      if (lk) {
        const map = {};
        lk.forEach(l => { map[l.post_id] = true; });
        setLikesFeitos(prev => ({ ...prev, ...map }));
      }
    }
  };

  const toggleLike = async (post) => {
    if (!user) { window.location.href = "/entrar"; return; }
    const jaLikei = likesFeitos[post.id];
    setLikesFeitos(prev => ({ ...prev, [post.id]: !jaLikei }));
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: (p.likes || 0) + (jaLikei ? -1 : 1) } : p));
    if (jaLikei) {
      await supabase.from("feed_likes").delete().eq("post_id", post.id).eq("cliente_id", user.id);
      await supabase.from("feed_posts").update({ likes: Math.max(0, (post.likes || 1) - 1) }).eq("id", post.id);
    } else {
      await supabase.from("feed_likes").insert({ post_id: post.id, cliente_id: user.id });
      await supabase.from("feed_posts").update({ likes: (post.likes || 0) + 1 }).eq("id", post.id);
      await supabase.from("feed_posts").update({ visualizacoes: (post.visualizacoes || 0) + 1 }).eq("id", post.id);
    }
  };

  const postsFiltrados = posts.filter(p => {
    if (!busca.trim()) return true;
    const q = busca.toLowerCase();
    return (p.titulo || "").toLowerCase().includes(q) ||
           (p.descricao || "").toLowerCase().includes(q) ||
           (p.pecas?.nome || "").toLowerCase().includes(q) ||
           (p.pecas?.categorias?.nome || "").toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight:"100vh", background:"#f7f5f2", fontFamily:"'Jost',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .feed-header{background:#fff;border-bottom:1px solid #e8e4df;position:sticky;top:0;z-index:100;padding:0.75rem 1rem}
        .feed-header-top{display:flex;align-items:center;justify-content:space-between;max-width:600px;margin:0 auto 0.6rem}
        .feed-logo{font-family:'Playfair Display',serif;font-size:1.1rem;letter-spacing:0.05em;color:#1a1a1a;text-decoration:none}
        .feed-pub-btn{background:#1a1a1a;color:#fff;border:none;padding:0.45rem 1rem;border-radius:20px;font-size:0.75rem;font-weight:600;cursor:pointer;letter-spacing:0.05em;font-family:'Jost',sans-serif}
        .feed-search{max-width:600px;margin:0 auto;position:relative}
        .feed-search input{width:100%;padding:0.55rem 1rem 0.55rem 2.2rem;border:1.5px solid #e8e4df;border-radius:20px;font-size:0.85rem;font-family:'Jost',sans-serif;background:#f7f5f2;outline:none}
        .feed-search svg{position:absolute;left:0.7rem;top:50%;transform:translateY(-50%);color:#9c9894}
        .feed-tabs{display:flex;max-width:600px;margin:0.5rem auto 0;border-bottom:1px solid #e8e4df}
        .feed-tab{flex:1;background:none;border:none;border-bottom:2px solid transparent;padding:0.55rem 0;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;font-family:'Jost',sans-serif;cursor:pointer;color:#9c9894;margin-bottom:-1px;transition:color 0.2s,border-color 0.2s}
        .feed-tab.on{color:#1a1a1a;border-bottom-color:#c4748a}
        .feed-grid{max-width:600px;margin:0 auto;padding:1rem}
        .post-card{background:#fff;border-radius:12px;overflow:hidden;margin-bottom:1rem;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
        .post-card.boosted{border:2px solid #c4a882;box-shadow:0 2px 12px rgba(196,168,130,0.2)}
        .post-header{display:flex;align-items:center;gap:0.6rem;padding:0.75rem 1rem}
        .post-avatar{width:36px;height:36px;border-radius:50%;background:#e8e4df;object-fit:cover;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:600;color:#5a5855}
        .post-meta{flex:1;min-width:0}
        .post-nome{font-size:0.82rem;font-weight:600;color:#1a1a1a}
        .post-tempo{font-size:0.7rem;color:#9c9894}
        .post-badge-boost{background:#c4a882;color:#fff;font-size:0.6rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:10px;letter-spacing:0.08em;text-transform:uppercase}
        .post-fotos{position:relative;overflow:hidden;aspect-ratio:4/5;background:#e8e4df}
        .post-fotos img{width:100%;height:100%;object-fit:cover}
        .post-fotos-nav{position:absolute;bottom:0.5rem;left:50%;transform:translateX(-50%);display:flex;gap:0.3rem}
        .post-fotos-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.5)}
        .post-fotos-dot.active{background:#fff}
        .post-acoes{display:flex;align-items:center;gap:1rem;padding:0.75rem 1rem 0.4rem}
        .btn-like{background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:0.3rem;font-size:0.8rem;color:#5a5855;padding:0;font-family:'Jost',sans-serif}
        .btn-like.liked{color:#e74c3c}
        .post-likes{font-size:0.75rem;color:#9c9894;margin-left:auto}
        .post-body{padding:0 1rem 0.75rem}
        .post-titulo{font-size:0.9rem;font-weight:600;color:#1a1a1a;margin-bottom:0.2rem}
        .post-desc{font-size:0.8rem;color:#5a5855;line-height:1.5}
        .post-peca-link{display:flex;align-items:center;gap:0.75rem;margin:0.75rem 1rem;padding:0.6rem 0.75rem;background:#f7f5f2;border-radius:8px;text-decoration:none;border:1px solid #e8e4df}
        .post-peca-img{width:44px;height:44px;border-radius:6px;object-fit:cover;background:#e8e4df;flex-shrink:0}
        .post-peca-info{flex:1;min-width:0}
        .post-peca-nome{font-size:0.78rem;font-weight:600;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .post-peca-preco{font-size:0.72rem;color:#c4a882;font-weight:600}
        .post-peca-btn{background:#1a1a1a;color:#fff;border:none;padding:0.4rem 0.75rem;border-radius:6px;font-size:0.7rem;font-weight:600;cursor:pointer;white-space:nowrap;font-family:'Jost',sans-serif}
        .feed-empty{text-align:center;padding:3rem 1rem;color:#9c9894}
        .btn-mais{display:block;margin:0 auto 2rem;background:#fff;border:1.5px solid #e8e4df;padding:0.75rem 2rem;border-radius:20px;font-size:0.8rem;font-weight:600;cursor:pointer;font-family:'Jost',sans-serif;color:#1a1a1a}
        .foto-slider{position:relative;overflow:hidden}
        .foto-slider-track{display:flex;transition:transform 0.3s}
        .foto-slider-track img{flex-shrink:0;width:100%;height:100%;object-fit:cover}
      `}</style>

      <header className="feed-header">
        <div className="feed-header-top">
          <a href="/" className="feed-logo">NORA GREI</a>
          <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
            <a href="/catalogo" style={{ fontSize:"0.75rem", color:"#5a5855", textDecoration:"none" }}>Catálogo</a>
            <button className="feed-pub-btn" onClick={() => window.location.href = "/publicar"}>{t.publicar}</button>
          </div>
        </div>
        <div className="feed-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder={t.buscar} />
        </div>
        <div className="feed-tabs">
          <button className={`feed-tab${feedTab==="parati"?" on":""}`} onClick={() => setFeedTab("parati")}>Para ti</button>
          <button className={`feed-tab${feedTab==="seguindo"?" on":""}`} onClick={() => { if (!user) { window.location.href="/entrar"; return; } setFeedTab("seguindo"); }}>Seguindo</button>
        </div>
      </header>

      <div className="feed-grid">
        {loading && posts.length === 0 ? (
          [1,2,3].map(i => (
            <div key={i} style={{ background:"#fff", borderRadius:"12px", overflow:"hidden", marginBottom:"1rem", height:"420px", animation:"pulse 1.5s infinite" }}>
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
            </div>
          ))
        ) : postsFiltrados.length === 0 ? (
          <div className="feed-empty">
            {feedTab === "seguindo"
              ? <><p style={{marginBottom:"0.75rem"}}>Ainda não segues nenhuma lojista.</p><a href="/catalogo" style={{fontSize:"0.72rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#c4748a",textDecoration:"none"}}>Explorar catálogo →</a></>
              : t.semPosts
            }
          </div>
        ) : (
          postsFiltrados.map(post => <PostCard key={post.id} post={post} t={t} lang={lang} liked={!!likesFeitos[post.id]} onLike={() => toggleLike(post)} />)
        )}

        {!loading && temMais && !busca && (
          <button className="btn-mais" onClick={() => carregar(pagina + 1)}>{t.carregarMais}</button>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, t, lang, liked, onLike }) {
  const [fotoIdx, setFotoIdx] = useState(0);
  const fotos = post.fotos?.filter(Boolean) || (post.pecas?.fotos?.filter(Boolean) || []);
  const fotoUrl = fotos[fotoIdx] || null;
  const tempo = tempoRelativo(post.publicado_em || post.created_at, t);
  const iniciais = (post.clientes?.nome || "N").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  const passarFoto = (dir) => {
    setFotoIdx(i => Math.max(0, Math.min(fotos.length - 1, i + dir)));
  };

  return (
    <div className={`post-card${post.boosted ? " boosted" : ""}`}>
      <div className="post-header">
        {post.clientes?.avatar_url
          ? <img src={post.clientes.avatar_url} className="post-avatar" alt="" />
          : <div className="post-avatar">{iniciais}</div>
        }
        <div className="post-meta">
          <p className="post-nome">{post.clientes?.nome || "Nora Grei"}</p>
          <p className="post-tempo">{tempo}</p>
        </div>
        {post.boosted && <span className="post-badge-boost">{t.boosted}</span>}
        {!post.boosted && (new Date() - new Date(post.publicado_em || post.created_at) < 86400000 * 2) && (
          <span style={{ background:"#e8f5e9", color:"#27ae60", fontSize:"0.6rem", fontWeight:700, padding:"0.15rem 0.5rem", borderRadius:"10px", letterSpacing:"0.08em", textTransform:"uppercase" }}>{t.novo}</span>
        )}
      </div>

      {fotos.length > 0 && (
        <div className="post-fotos" onClick={e => { if (e.clientX > e.currentTarget.offsetLeft + e.currentTarget.offsetWidth / 2) passarFoto(1); else passarFoto(-1); }}>
          <img src={fotos[fotoIdx]} alt={post.titulo || ""} />
          {fotos.length > 1 && (
            <div className="post-fotos-nav">
              {fotos.map((_, i) => <span key={i} className={`post-fotos-dot${i === fotoIdx ? " active" : ""}`} />)}
            </div>
          )}
        </div>
      )}

      <div className="post-acoes">
        <button className={`btn-like${liked ? " liked" : ""}`} onClick={onLike}>
          {liked
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          }
          {post.likes > 0 && <span>{post.likes}</span>}
        </button>
        <a href={`/catalogo/${post.peca_id}`} style={{ color:"#9c9894", fontSize:"0.75rem", marginLeft:"0.5rem", textDecoration:"none", display:"flex", alignItems:"center", gap:"0.3rem" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </a>
      </div>

      <div className="post-body">
        {post.titulo && <p className="post-titulo">{post.titulo}</p>}
        {post.descricao && <p className="post-desc">{post.descricao}</p>}
      </div>

      {post.pecas && (
        <a href={`/catalogo/${post.peca_id}`} className="post-peca-link">
          {post.pecas.fotos?.[0] && <img src={post.pecas.fotos[0]} className="post-peca-img" alt="" />}
          <div className="post-peca-info">
            <p className="post-peca-nome">{post.pecas.nome}</p>
            {post.pecas.preco_aluguer_dia > 0 && <p className="post-peca-preco">{post.pecas.preco_aluguer_dia}€/dia</p>}
          </div>
          <button className="post-peca-btn">{t.alugar}</button>
        </a>
      )}
    </div>
  );
}
