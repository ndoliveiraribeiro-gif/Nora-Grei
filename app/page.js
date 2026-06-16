"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const T = {
  pt: {
    nav: { catalogo: "Catálogo", planos: "Planos", comoFunciona: "Como funciona", entrar: "Entrar", pedidos: "Pedidos", perfil: "Perfil" },
    hero: { linha1: "A peça certa,", linha2: "para o momento", linha3: "certo.", pergunta: "Onde vais hoje?", cta: "Ver catálogo" },
    ocasioes: ["Férias","Concerto","Gala","Festa","Casamento","Trabalho","Jantar","Teatro"],
    strip: ["Envio gratuito","Depósito devolvido","Peças inspecionadas","Cancele quando quiser","Alugar ou Comprar"],
    como: { label: "O processo", titulo: "Simples assim.", passos: ["Escolhe","Recebe","Usa","Devolve"] },
    numeros: [{ val: "200+", label: "Peças disponíveis" },{ val: "48h", label: "Entrega rápida" },{ val: "100%", label: "Depósito devolvido" },{ val: "4.9★", label: "Avaliação média" }],
    cta: { titulo: "O teu próximo look.", sub: "Está aqui.", btn: "Explorar catálogo" },
    footer: { copy: "© 2025 Nora Grei", links: ["Catálogo","Planos","Contacto","Termos"] },
    bottomNav: { inicio: "Início", catalogo: "Catálogo", pedidos: "Pedidos", perfil: "Perfil" },
  },
  fr: {
    nav: { catalogo: "Catalogue", planos: "Abonnements", comoFunciona: "Comment ça marche", entrar: "Connexion", pedidos: "Commandes", perfil: "Profil" },
    hero: { linha1: "La pièce parfaite,", linha2: "pour le moment", linha3: "parfait.", pergunta: "Où allez-vous ?", cta: "Voir le catalogue" },
    ocasioes: ["Vacances","Concert","Gala","Fête","Mariage","Travail","Dîner","Théâtre"],
    strip: ["Livraison gratuite","Dépôt remboursé","Pièces inspectées","Annulez quand vous voulez","Louer ou Acheter"],
    como: { label: "Le processus", titulo: "Aussi simple que ça.", passos: ["Choisissez","Recevez","Portez","Retournez"] },
    numeros: [{ val: "200+", label: "Pièces disponibles" },{ val: "48h", label: "Livraison rapide" },{ val: "100%", label: "Dépôt remboursé" },{ val: "4.9★", label: "Note moyenne" }],
    cta: { titulo: "Votre prochain look.", sub: "Est ici.", btn: "Explorer le catalogue" },
    footer: { copy: "© 2025 Nora Grei", links: ["Catalogue","Abonnements","Contact","CGU"] },
    bottomNav: { inicio: "Accueil", catalogo: "Catalogue", pedidos: "Commandes", perfil: "Profil" },
  },
  lt: {
    nav: { catalogo: "Katalogas", planos: "Planai", comoFunciona: "Kaip tai veikia", entrar: "Prisijungti", pedidos: "Užsakymai", perfil: "Profilis" },
    hero: { linha1: "Tinkamas drabužis,", linha2: "tinkamu", linha3: "momentu.", pergunta: "Kur šiandien einate?", cta: "Žiūrėti katalogą" },
    ocasioes: ["Atostogos","Koncertas","Gala","Vakarėlis","Vestuvės","Darbas","Vakarienė","Teatras"],
    strip: ["Nemokamas pristatymas","Užstatas grąžinamas","Drabužiai patikrinti","Atšaukite kada norite","Nuomoti ar Pirkti"],
    como: { label: "Procesas", titulo: "Taip paprasta.", passos: ["Pasirinkite","Gaukite","Dėvėkite","Grąžinkite"] },
    numeros: [{ val: "200+", label: "Drabužių" },{ val: "48h", label: "Greitas pristatymas" },{ val: "100%", label: "Užstatas grąžinamas" },{ val: "4.9★", label: "Įvertinimas" }],
    cta: { titulo: "Jūsų kitas įvaizdis.", sub: "Čia.", btn: "Naršyti katalogą" },
    footer: { copy: "© 2025 Nora Grei", links: ["Katalogas","Planai","Kontaktai","Sąlygos"] },
    bottomNav: { inicio: "Pradžia", catalogo: "Katalogas", pedidos: "Užsakymai", perfil: "Profilis" },
  },
};

export default function Home() {
  const [lang, setLang] = useState("pt");
  const [ocasiaoSel, setOcasiaoSel] = useState(null);
  const [userLogado, setUserLogado] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    else {
      const b = navigator.language?.slice(0,2);
      if (b === "fr") setLang("fr");
      else if (b === "lt") setLang("lt");
    }
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    sb.auth.getSession().then(({ data }) => { if (data.session) setUserLogado(true); });
  }, []);

  const changeLang = (l) => { localStorage.setItem("ng_lang", l); setLang(l); };
  const t = T[lang];

  const escolherOcasiao = (o) => {
    setOcasiaoSel(o);
    localStorage.setItem("ng_consultant_v2", JSON.stringify({ evento: o, done: false }));
    setTimeout(() => { window.location.href = `/catalogo?evento=${encodeURIComponent(o)}`; }, 400);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --black:#080808; --white:#f8f7f5; --grey-100:#f0eeeb; --grey-200:#e2dfda; --grey-400:#5a5855; --rosa:#c4748a; --serif:'Cormorant',Georgia,serif; --sans:'Jost',Arial,sans-serif; }
        html { scroll-behavior:smooth; }
        body { background:var(--white); color:var(--black); font-family:var(--sans); font-size:17px; font-weight:400; -webkit-font-smoothing:antialiased; }

        /* NAV */
        .nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.25rem 4rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--grey-200); }
        .logo { display:flex; flex-direction:column; text-decoration:none; color:var(--black); }
        .logo-name { font-family:var(--serif); font-size:1.35rem; font-weight:400; letter-spacing:0.25em; text-transform:uppercase; line-height:1; }
        .logo-tag { font-size:0.55rem; letter-spacing:0.35em; text-transform:uppercase; color:var(--grey-400); margin-top:0.2rem; }
        .nav-links { display:flex; align-items:center; gap:2.5rem; list-style:none; }
        .nav-links a { font-size:0.68rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-400); text-decoration:none; font-weight:400; transition:color 0.2s; }
        .nav-links a:hover { color:var(--black); }
        .nav-right { display:flex; align-items:center; gap:1rem; }
        .nav-lang { display:flex; gap:0.4rem; align-items:center; }
        .lang-btn { font-size:0.6rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-400); background:none; border:none; cursor:pointer; font-family:var(--sans); font-weight:400; padding:0; transition:color 0.2s; }
        .lang-btn.active { color:var(--black); font-weight:500; }
        .lang-sep { color:var(--grey-200); font-size:0.55rem; }
        .nav-btn { font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; padding:0.65rem 1.25rem; text-decoration:none; font-weight:400; font-family:var(--sans); transition:all 0.25s; }
        .nav-btn-outline { color:var(--black); border:1px solid var(--black); }
        .nav-btn-outline:hover { background:var(--black); color:var(--white); }
        .nav-btn-fill { background:var(--black); color:var(--white); }
        .nav-btn-fill:hover { background:#2a2926; }

        /* HERO */
        .hero { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; padding-top:80px; }
        .hero-left { display:flex; flex-direction:column; justify-content:center; padding:6rem 4rem 6rem 6rem; }
        .hero-title { font-family:var(--serif); font-size:clamp(3.5rem,5.5vw,6.5rem); font-weight:300; line-height:1.02; margin-bottom:3rem; }
        .hero-title em { font-style:italic; color:var(--grey-400); }
        .hero-pergunta { font-size:0.72rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--grey-400); margin-bottom:1.25rem; font-weight:500; }
        .hero-ocasioes { display:grid; grid-template-columns:repeat(4,1fr); gap:0.5rem; margin-bottom:2rem; }
        .hero-ocasiao { padding:0.85rem 0.5rem; border:1px solid var(--grey-200); background:var(--white); font-family:var(--serif); font-size:1rem; font-weight:300; color:var(--grey-400); cursor:pointer; text-align:center; transition:all 0.2s; }
        .hero-ocasiao:hover { border-color:var(--black); color:var(--black); }
        .hero-ocasiao.selected { background:var(--black); color:var(--white); border-color:var(--black); }
        .hero-cta { font-size:0.68rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-400); text-decoration:none; border-bottom:1px solid var(--grey-200); padding-bottom:2px; transition:all 0.2s; font-weight:400; }
        .hero-cta:hover { color:var(--black); border-color:var(--black); }
        .hero-right { position:relative; overflow:hidden; }
        .hero-right img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center top; }
        .hero-caption { position:absolute; bottom:0; left:0; right:0; background:rgba(248,247,245,0.92); padding:1.25rem 2rem; display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--grey-200); z-index:2; }
        .hero-caption-nome { font-family:var(--serif); font-size:1rem; font-style:italic; font-weight:300; }
        .hero-caption-preco { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-400); }

        /* STRIP */
        .strip { background:var(--black); padding:0.9rem 0; overflow:hidden; }
        .strip-track { display:flex; white-space:nowrap; animation:marquee 25s linear infinite; }
        .strip-item { font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.5); padding:0 3rem; flex-shrink:0; }
        .strip-item::after { content:'—'; margin-left:3rem; color:rgba(255,255,255,0.15); }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* NÚMEROS */
        .numeros { display:grid; grid-template-columns:repeat(4,1fr); border-top:1px solid var(--grey-200); border-bottom:1px solid var(--grey-200); }
        .numero { padding:3rem 2rem; text-align:center; border-right:1px solid var(--grey-200); }
        .numero:last-child { border-right:none; }
        .numero-val { font-family:var(--serif); font-size:3rem; font-weight:300; color:var(--black); line-height:1; margin-bottom:0.5rem; }
        .numero-label { font-size:0.68rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--grey-400); font-weight:400; }

        /* COMO FUNCIONA */
        .como { padding:8rem 6rem; background:var(--grey-100); }
        .como-label { font-size:0.68rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--grey-400); margin-bottom:1rem; font-weight:400; }
        .como-titulo { font-family:var(--serif); font-size:clamp(3rem,5vw,5rem); font-weight:300; margin-bottom:5rem; }
        .como-passos { display:grid; grid-template-columns:repeat(4,1fr); gap:0; }
        .como-passo { padding:2.5rem; border-right:1px solid var(--grey-200); position:relative; }
        .como-passo:last-child { border-right:none; }
        .como-num { font-family:var(--serif); font-size:5rem; font-weight:300; color:var(--grey-200); line-height:1; margin-bottom:1.5rem; }
        .como-passo-nome { font-family:var(--serif); font-size:2rem; font-weight:300; color:var(--black); }

        /* CTA FINAL */
        .cta-final { background:var(--black); color:var(--white); padding:12rem 6rem; display:flex; flex-direction:column; align-items:center; text-align:center; }
        .cta-final-titulo { font-family:var(--serif); font-size:clamp(4rem,7vw,8rem); font-weight:300; line-height:1; margin-bottom:0.5rem; }
        .cta-final-sub { font-family:var(--serif); font-size:clamp(4rem,7vw,8rem); font-weight:300; font-style:italic; color:var(--grey-400); line-height:1; margin-bottom:4rem; }
        .cta-final-btn { font-size:0.72rem; letter-spacing:0.2em; text-transform:uppercase; border:1px solid rgba(255,255,255,0.3); color:var(--white); padding:1.1rem 3rem; text-decoration:none; font-weight:400; transition:all 0.3s; font-family:var(--sans); }
        .cta-final-btn:hover { background:var(--white); color:var(--black); border-color:var(--white); }

        /* FOOTER */
        footer { padding:2rem 6rem; border-top:1px solid var(--grey-200); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
        .footer-copy { font-size:0.65rem; color:var(--grey-400); font-weight:400; }
        .footer-links { display:flex; gap:2rem; list-style:none; }
        .footer-links a { font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-400); text-decoration:none; transition:color 0.2s; }
        .footer-links a:hover { color:var(--black); }

        /* BOTTOM NAV */
        .bottom-nav { display:none; position:fixed; bottom:0; left:0; right:0; z-index:200; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-top:1px solid var(--grey-200); padding:0.75rem 0 calc(0.75rem + env(safe-area-inset-bottom)); }
        .bottom-nav-inner { display:flex; justify-content:space-around; align-items:center; }
        .bottom-nav-item { display:flex; flex-direction:column; align-items:center; gap:0.3rem; text-decoration:none; color:var(--grey-400); background:none; border:none; cursor:pointer; padding:0.25rem 1.5rem; transition:color 0.2s; font-family:var(--sans); }
        .bottom-nav-item.active { color:var(--black); }
        .bottom-nav-icon svg { width:22px; height:22px; stroke:currentColor; fill:none; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
        .bottom-nav-label { font-size:0.58rem; letter-spacing:0.12em; text-transform:uppercase; font-weight:400; }
        .bottom-nav-dot { width:4px; height:4px; border-radius:50%; background:var(--black); margin-top:2px; }

        /* MOBILE */
        @media (max-width:768px) {
          body { font-size:17px; padding-bottom:80px; }
          .nav { padding:0.9rem 1.25rem; display:flex !important; flex-direction:row !important; justify-content:space-between !important; align-items:center !important; width:100% !important; }
          .nav-links { display:none; }
          .nav-right .nav-btn-outline { display:none; }
          .nav-right .nav-btn-fill { display:none; }
          .hero { grid-template-columns:1fr; min-height:auto; padding-top:70px; }
          .hero-right { height:75vw; order:-1; }
          .hero-left { padding:2rem 1.25rem 3rem; }
          .hero-title { font-size:clamp(2.5rem,10vw,3.5rem); margin-bottom:2rem; }
          .hero-ocasioes { grid-template-columns:repeat(2,1fr); }
          .hero-ocasiao { font-size:1.05rem; padding:0.9rem 0.5rem; }
          .numeros { grid-template-columns:repeat(2,1fr); }
          .numero { padding:2rem 1rem; border-bottom:1px solid var(--grey-200); }
          .como { padding:3.5rem 1.25rem; }
          .como-titulo { font-size:2.5rem; margin-bottom:2.5rem; }
          .como-passos { grid-template-columns:1fr 1fr; }
          .como-passo { padding:1.5rem; border-bottom:1px solid var(--grey-200); }
          .cta-final { padding:6rem 1.25rem; }
          .cta-final-titulo, .cta-final-sub { font-size:clamp(3rem,10vw,5rem); }
          footer { padding:1.5rem 1.25rem; flex-direction:column; align-items:flex-start; gap:1rem; }
          .bottom-nav { display:block; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="logo">
          <span className="logo-name">Nora Grei</span>
          <span className="logo-tag">Alugar ou Comprar</span>
        </a>
        <ul className="nav-links">
          <li><a href="/catalogo">{t.nav.catalogo}</a></li>
          <li><a href="#como">{t.nav.comoFunciona}</a></li>
        </ul>
        <div className="nav-right">
          <div className="nav-lang">
            {["pt","fr","lt"].map((l,i) => (
              <>
                {i > 0 && <span key={`sep-${l}`} className="lang-sep">/</span>}
                <button key={l} className={`lang-btn${lang===l?" active":""}`} onClick={() => changeLang(l)}>{l.toUpperCase()}</button>
              </>
            ))}
          </div>
          {userLogado && <a href="/pedidos" className="nav-btn nav-btn-outline">{t.nav.pedidos}</a>}
          <a href={userLogado ? "/perfil" : "/entrar"} className="nav-btn nav-btn-outline">{userLogado ? t.nav.perfil : t.nav.entrar}</a>
          <a href="/catalogo" className="nav-btn nav-btn-fill">{t.hero.cta}</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-title">
            {t.hero.linha1}<br />{t.hero.linha2}<br /><em>{t.hero.linha3}</em>
          </h1>
          <p className="hero-pergunta">{t.hero.pergunta}</p>
          <div className="hero-ocasioes">
            {t.ocasioes.map(o => (
              <button key={o} className={`hero-ocasiao${ocasiaoSel===o?" selected":""}`} onClick={() => escolherOcasiao(o)}>{o}</button>
            ))}
          </div>
          <a href="/catalogo" className="hero-cta">{t.hero.cta} →</a>
        </div>
        <div className="hero-right">
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" alt="Nora Grei" />
          <div className="hero-caption">
            <span className="hero-caption-nome">Vestido Seda Noite</span>
            <span className="hero-caption-preco">35€ / dia</span>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="strip">
        <div className="strip-track">
          {[...Array(3)].map((_,i) => t.strip.map((item,j) => (
            <span key={`${i}-${j}`} className="strip-item">{item}</span>
          )))}
        </div>
      </div>

      {/* NÚMEROS */}
      <div className="numeros">
        {t.numeros.map((n,i) => (
          <div key={i} className="numero">
            <div className="numero-val">{n.val}</div>
            <div className="numero-label">{n.label}</div>
          </div>
        ))}
      </div>

      {/* COMO FUNCIONA */}
      <section className="como" id="como">
        <p className="como-label">{t.como.label}</p>
        <h2 className="como-titulo">{t.como.titulo}</h2>
        <div className="como-passos">
          {t.como.passos.map((p,i) => (
            <div key={i} className="como-passo">
              <div className="como-num">0{i+1}</div>
              <div className="como-passo-nome">{p}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="cta-final-titulo">{t.cta.titulo}</div>
        <div className="cta-final-sub">{t.cta.sub}</div>
        <a href="/catalogo" className="cta-final-btn">{t.cta.btn}</a>
      </section>

      {/* FOOTER */}
      <footer>
        <span className="footer-copy">{t.footer.copy}</span>
        <ul className="footer-links">
          {t.footer.links.map((l,i) => <li key={i}><a href="#">{l}</a></li>)}
        </ul>
      </footer>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {[
            { href:"/", label:t.bottomNav.inicio, tab:"home", icon:<svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
            { href:"/catalogo", label:t.bottomNav.catalogo, tab:"catalogo", icon:<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
            { href: userLogado ? "/pedidos" : "/entrar", label:t.bottomNav.pedidos, tab:"pedidos", icon:<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
            { href: userLogado ? "/perfil" : "/entrar", label:t.bottomNav.perfil, tab:"perfil", icon:<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          ].map((item,i) => (
            <a key={i} href={item.href} className={`bottom-nav-item${activeTab===item.tab?" active":""}`} onClick={() => setActiveTab(item.tab)}>
              <div className="bottom-nav-icon">{item.icon}</div>
              <span className="bottom-nav-label">{item.label}</span>
              {activeTab===item.tab && <div className="bottom-nav-dot"></div>}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}