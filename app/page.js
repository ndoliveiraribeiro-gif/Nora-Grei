"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const T = {
  pt: {
    nav: { catalogo: "Colecção", comoFunciona: "Como funciona", entrar: "Entrar", pedidos: "Pedidos", perfil: "Perfil" },
    hero: {
      eyebrow: "Nova colecção — Primavera 2026",
      titulo: "Veste o extraordinário.",
      sub: "Sem comprar.",
      desc: "Descobre uma nova forma de viver a moda. Aluga peças exclusivas da Nora Grei e renova o teu guarda-roupa sempre que quiseres.",
      cta1: "Explorar colecção",
      cta2: "Como funciona",
      peca: "Vestido Seda Noite",
      preco: "35€ / dia",
    },
    como: {
      label: "O processo",
      titulo: "Moda sem compromisso.",
      passos: [
        { num: "01", titulo: "Escolhe", desc: "Explora a colecção e reserva a peça dos teus sonhos." },
        { num: "02", titulo: "Recebe", desc: "Entregamos em casa, limpa e pronta a usar." },
        { num: "03", titulo: "Usa", desc: "Vive cada momento com estilo único." },
        { num: "04", titulo: "Devolve ou troca", desc: "Renova o teu guarda-roupa sem acumular." },
      ],
    },
    porque: {
      label: "A nossa missão",
      titulo: "Porque a moda deve acompanhar a tua vida,",
      tituloSub: "não ocupar o teu armário.",
      pontos: ["Menos desperdício.", "Mais exclusividade.", "Mais liberdade.", "Moda consciente."],
    },
    categorias: {
      label: "Para cada momento",
      titulo: "O look certo,",
      tituloSub: "para cada ocasião.",
      lista: [
        { nome: "Eventos", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80" },
        { nome: "Trabalho", img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80" },
        { nome: "Férias", img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80" },
        { nome: "Jantares", img: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&q=80" },
      ],
    },
    numeros: [
      { val: "1.000+", label: "Alugueres realizados" },
      { val: "200+", label: "Peças exclusivas" },
      { val: "4.9★", label: "Avaliação média" },
      { val: "48h", label: "Entrega rápida" },
    ],
    sustentabilidade: {
      label: "Moda consciente",
      titulo: "Cada peça vive várias histórias.",
      stats: [
        { val: "70%", label: "Água poupada vs comprar" },
        { val: "5×", label: "Reutilizações por peça" },
        { val: "60%", label: "Emissões reduzidas" },
      ],
    },
    cta: {
      titulo: "O teu guarda-roupa infinito",
      sub: "começa aqui.",
      btn: "Explorar colecção",
      tag: "Moda exclusiva. Sem excessos.",
    },
    strip: ["Envio gratuito", "Depósito 100% devolvido", "Peças inspecionadas", "Cancele quando quiser", "Moda consciente"],
    footer: { copy: "© 2026 Nora Grei. Todos os direitos reservados.", links: ["Colecção", "Como funciona", "Contacto", "Termos", "Privacidade"] },
    bottomNav: { inicio: "Início", catalogo: "Colecção", pedidos: "Pedidos", perfil: "Perfil" },
  },
  fr: {
    nav: { catalogo: "Collection", comoFunciona: "Comment ça marche", entrar: "Connexion", pedidos: "Commandes", perfil: "Profil" },
    hero: {
      eyebrow: "Nouvelle collection — Printemps 2026",
      titulo: "Portez l'extraordinaire.",
      sub: "Sans acheter.",
      desc: "Découvrez une nouvelle façon de vivre la mode. Louez des pièces exclusives Nora Grei et renouvelez votre garde-robe quand vous voulez.",
      cta1: "Explorer la collection",
      cta2: "Comment ça marche",
      peca: "Robe Soie Nuit",
      preco: "35€ / jour",
    },
    como: {
      label: "Le processus",
      titulo: "La mode sans engagement.",
      passos: [
        { num: "01", titulo: "Choisissez", desc: "Explorez la collection et réservez la pièce de vos rêves." },
        { num: "02", titulo: "Recevez", desc: "Livraison à domicile, propre et prête à porter." },
        { num: "03", titulo: "Portez", desc: "Vivez chaque moment avec un style unique." },
        { num: "04", titulo: "Retournez ou échangez", desc: "Renouvelez votre garde-robe sans accumuler." },
      ],
    },
    porque: {
      label: "Notre mission",
      titulo: "Parce que la mode doit accompagner votre vie,",
      tituloSub: "pas occuper votre armoire.",
      pontos: ["Moins de gaspillage.", "Plus d'exclusivité.", "Plus de liberté.", "Mode consciente."],
    },
    categorias: {
      label: "Pour chaque moment",
      titulo: "Le look parfait,",
      tituloSub: "pour chaque occasion.",
      lista: [
        { nome: "Événements", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80" },
        { nome: "Travail", img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80" },
        { nome: "Vacances", img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80" },
        { nome: "Dîners", img: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&q=80" },
      ],
    },
    numeros: [
      { val: "1.000+", label: "Locations réalisées" },
      { val: "200+", label: "Pièces exclusives" },
      { val: "4.9★", label: "Note moyenne" },
      { val: "48h", label: "Livraison rapide" },
    ],
    sustentabilidade: {
      label: "Mode consciente",
      titulo: "Chaque pièce vit plusieurs histoires.",
      stats: [
        { val: "70%", label: "Eau économisée vs achat" },
        { val: "5×", label: "Réutilisations par pièce" },
        { val: "60%", label: "Émissions réduites" },
      ],
    },
    cta: {
      titulo: "Votre garde-robe infinie",
      sub: "commence ici.",
      btn: "Explorer la collection",
      tag: "Mode exclusive. Sans excès.",
    },
    strip: ["Livraison gratuite", "Dépôt 100% remboursé", "Pièces inspectées", "Annulez quand vous voulez", "Mode consciente"],
    footer: { copy: "© 2026 Nora Grei. Tous droits réservés.", links: ["Collection", "Comment ça marche", "Contact", "CGU", "Confidentialité"] },
    bottomNav: { inicio: "Accueil", catalogo: "Collection", pedidos: "Commandes", perfil: "Profil" },
  },
  lt: {
    nav: { catalogo: "Kolekcija", comoFunciona: "Kaip tai veikia", entrar: "Prisijungti", pedidos: "Užsakymai", perfil: "Profilis" },
    hero: {
      eyebrow: "Nauja kolekcija — Pavasaris 2026",
      titulo: "Dėvėkite nepaprastą.",
      sub: "Nepirkdami.",
      desc: "Atraskite naują būdą gyventi madą. Išsinuomokite išskirtines Nora Grei drabužius ir atnaujinkite savo garderobą kada norite.",
      cta1: "Naršyti kolekciją",
      cta2: "Kaip tai veikia",
      peca: "Šilkinė vakarinė suknelė",
      preco: "35€ / dieną",
    },
    como: {
      label: "Procesas",
      titulo: "Mada be įsipareigojimų.",
      passos: [
        { num: "01", titulo: "Pasirinkite", desc: "Naršykite kolekciją ir rezervuokite savo svajonių drabužį." },
        { num: "02", titulo: "Gaukite", desc: "Pristatome į namus, švarų ir paruoštą dėvėti." },
        { num: "03", titulo: "Dėvėkite", desc: "Gyvenkit kiekvieną akimirką su unikaliu stiliumi." },
        { num: "04", titulo: "Grąžinkite ar keiskite", desc: "Atnaujinkite garderobą nekaupdami." },
      ],
    },
    porque: {
      label: "Mūsų misija",
      titulo: "Nes mada turi lydėti jūsų gyvenimą,",
      tituloSub: "o ne užimti jūsų spintą.",
      pontos: ["Mažiau atliekų.", "Daugiau išskirtinumo.", "Daugiau laisvės.", "Sąmoninga mada."],
    },
    categorias: {
      label: "Kiekvienai progai",
      titulo: "Tinkamas įvaizdis,",
      tituloSub: "kiekvienai progai.",
      lista: [
        { nome: "Renginiai", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80" },
        { nome: "Darbas", img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80" },
        { nome: "Atostogos", img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80" },
        { nome: "Vakarienės", img: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&q=80" },
      ],
    },
    numeros: [
      { val: "1.000+", label: "Įvykdytų nuomų" },
      { val: "200+", label: "Išskirtinių drabužių" },
      { val: "4.9★", label: "Vidutinis įvertinimas" },
      { val: "48h", label: "Greitas pristatymas" },
    ],
    sustentabilidade: {
      label: "Sąmoninga mada",
      titulo: "Kiekvienas drabužis gyvena kelias istorijas.",
      stats: [
        { val: "70%", label: "Sutaupytas vanduo" },
        { val: "5×", label: "Pakartotinis naudojimas" },
        { val: "60%", label: "Sumažintos emisijos" },
      ],
    },
    cta: {
      titulo: "Jūsų begalinis garderobas",
      sub: "prasideda čia.",
      btn: "Naršyti kolekciją",
      tag: "Išskirtinė mada. Be pertekliaus.",
    },
    strip: ["Nemokamas pristatymas", "Užstatas grąžinamas 100%", "Drabužiai patikrinti", "Atšaukite kada norite", "Sąmoninga mada"],
    footer: { copy: "© 2026 Nora Grei. Visos teisės saugomos.", links: ["Kolekcija", "Kaip tai veikia", "Kontaktai", "Sąlygos", "Privatumas"] },
    bottomNav: { inicio: "Pradžia", catalogo: "Kolekcija", pedidos: "Užsakymai", perfil: "Profilis" },
  },
};

export default function Home() {
  const [lang, setLang] = useState("pt");
  const [userLogado, setUserLogado] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [catHover, setCatHover] = useState(null);
  const [banner, setBanner] = useState(false);
  const [cupaoCopiado, setCupaoCopiado] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    else {
      const b = navigator.language?.slice(0,2);
      if (b === "fr") setLang("fr");
      else if (b === "lt") setLang("lt");
    }
    supabase.auth.getSession().then(({ data }) => { if (data.session) setUserLogado(true); });
    const visto = localStorage.getItem("ng_banner_cupao");
    if (!visto) { 
      setTimeout(() => {
        setBanner(true);
        setTimeout(() => {
          setBanner(false);
          localStorage.setItem("ng_banner_cupao", "1");
        }, 7000);
      }, 1500); 
    }
  }, []);

  const changeLang = (l) => { localStorage.setItem("ng_lang", l); setLang(l); };
  const fecharBanner = () => { setBanner(false); localStorage.setItem("ng_banner_cupao", "1"); };
  const copiarCupao = () => {
    navigator.clipboard.writeText("NORA15");
    setCupaoCopiado(true);
    setTimeout(() => setCupaoCopiado(false), 3000);
  };
  const t = T[lang];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --black: #080808; --white: #f8f7f5; --grey-100: #f0eeeb;
          --grey-200: #e2dfda; --grey-400: #5a5855; --grey-600: #1a1a18;
          --rosa: #c4748a;
          --serif: 'Cormorant', Georgia, serif;
          --sans: 'Jost', Arial, sans-serif;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--white); color: var(--black); font-family: var(--sans); font-size: 17px; font-weight: 400; line-height: 1.7; -webkit-font-smoothing: antialiased; }

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
        .hero { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; padding-top:80px; position:relative; }
        .hero-left { display:flex; flex-direction:column; justify-content:center; padding:6rem 4rem 6rem 6rem; }
        .hero-eyebrow { font-size:0.65rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--grey-400); margin-bottom:2rem; font-weight:400; }
        .hero-titulo { font-family:var(--serif); font-size:clamp(3.5rem,5.5vw,6rem); font-weight:300; line-height:1.02; color:var(--black); }
        .hero-sub { font-family:var(--serif); font-size:clamp(3.5rem,5.5vw,6rem); font-weight:300; font-style:italic; color:var(--grey-400); line-height:1.02; margin-bottom:2.5rem; }
        .hero-desc { font-size:1rem; color:var(--grey-600); max-width:42ch; line-height:1.9; margin-bottom:3rem; font-weight:400; }
        .hero-btns { display:flex; gap:1rem; flex-wrap:wrap; }
        .btn-primary { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; background:var(--black); color:var(--white); padding:1.1rem 2.5rem; text-decoration:none; font-weight:400; transition:background 0.3s; font-family:var(--sans); display:inline-block; }
        .btn-primary:hover { background:#2a2926; }
        .btn-ghost { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-600); text-decoration:none; font-weight:400; border-bottom:1px solid var(--grey-200); padding-bottom:2px; display:inline-flex; align-items:center; transition:all 0.2s; }
        .btn-ghost:hover { color:var(--black); border-color:var(--black); }
        .hero-right { position:relative; overflow:hidden; }
        .hero-right img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center top; transition:transform 6s ease; }
        .hero-right:hover img { transform:scale(1.03); }
        .hero-caption { position:absolute; bottom:0; left:0; right:0; z-index:2; padding:1.5rem 2rem; background:linear-gradient(to top, rgba(8,8,8,0.6), transparent); color:white; display:flex; justify-content:space-between; align-items:flex-end; }
        .hero-caption-nome { font-family:var(--serif); font-size:1.1rem; font-style:italic; font-weight:300; }
        .hero-caption-preco { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; opacity:0.8; }

        /* STRIP */
        .strip { background:var(--black); padding:0.9rem 0; overflow:hidden; }
        .strip-track { display:flex; white-space:nowrap; animation:marquee 30s linear infinite; }
        .strip-item { font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.5); padding:0 3rem; flex-shrink:0; }
        .strip-item::after { content:'✦'; margin-left:3rem; color:rgba(255,255,255,0.2); }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* NÚMEROS */
        .numeros { display:grid; grid-template-columns:repeat(4,1fr); }
        .numero { padding:4rem 2rem; text-align:center; border-right:1px solid var(--grey-200); border-bottom:1px solid var(--grey-200); }
        .numero:last-child { border-right:none; }
        .numero-val { font-family:var(--serif); font-size:3.5rem; font-weight:300; color:var(--black); line-height:1; margin-bottom:0.5rem; }
        .numero-label { font-size:0.68rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--grey-400); font-weight:400; }

        /* COMO FUNCIONA */
        .como { padding:10rem 6rem; }
        .section-label { font-size:0.65rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--grey-400); margin-bottom:1rem; font-weight:400; }
        .section-titulo { font-family:var(--serif); font-size:clamp(2.5rem,4vw,4.5rem); font-weight:300; line-height:1.08; margin-bottom:5rem; }
        .section-titulo em { font-style:italic; color:var(--grey-400); }
        .como-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--grey-200); }
        .como-passo { background:var(--white); padding:3rem 2.5rem; }
        .como-num { font-family:var(--serif); font-size:4rem; font-weight:300; color:var(--grey-200); line-height:1; margin-bottom:2rem; }
        .como-titulo { font-family:var(--serif); font-size:1.6rem; font-weight:400; color:var(--black); margin-bottom:0.75rem; }
        .como-desc { font-size:0.95rem; color:var(--grey-600); line-height:1.8; font-weight:400; }

        /* PORQUE */
        .porque { background:var(--black); color:var(--white); padding:10rem 6rem; display:grid; grid-template-columns:1fr 1fr; gap:8rem; align-items:center; }
        .porque-titulo { font-family:var(--serif); font-size:clamp(2rem,3.5vw,3.5rem); font-weight:300; line-height:1.2; color:var(--white); }
        .porque-titulo em { font-style:italic; color:rgba(255,255,255,0.4); display:block; margin-top:0.25rem; }
        .porque-pontos { display:flex; flex-direction:column; gap:1.5rem; }
        .porque-ponto { display:flex; align-items:center; gap:1.5rem; font-family:var(--serif); font-size:1.4rem; font-weight:300; color:rgba(255,255,255,0.8); }
        .porque-ponto::before { content:''; width:32px; height:1px; background:rgba(255,255,255,0.3); flex-shrink:0; }

        /* CATEGORIAS */
        .categorias { padding:10rem 6rem; }
        .cat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--grey-200); margin-top:4rem; }
        .cat-card { background:var(--white); position:relative; overflow:hidden; aspect-ratio:3/4; cursor:pointer; }
        .cat-card img { width:100%; height:100%; object-fit:cover; transition:transform 0.6s ease; }
        .cat-card:hover img { transform:scale(1.05); }
        .cat-card-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(8,8,8,0.7) 0%, transparent 50%); display:flex; align-items:flex-end; padding:2rem; }
        .cat-card-nome { font-family:var(--serif); font-size:1.6rem; font-weight:300; color:var(--white); font-style:italic; }

        /* SUSTENTABILIDADE */
        .sustent { background:var(--grey-100); padding:8rem 6rem; }
        .sustent-grid { display:grid; grid-template-columns:1fr 1fr; gap:8rem; align-items:center; margin-top:4rem; }
        .sustent-titulo { font-family:var(--serif); font-size:clamp(2rem,3vw,3rem); font-weight:300; line-height:1.3; color:var(--black); }
        .sustent-stats { display:flex; flex-direction:column; gap:1px; background:var(--grey-200); }
        .sustent-stat { background:var(--grey-100); padding:1.5rem 2rem; display:flex; align-items:center; justify-content:space-between; }
        .sustent-stat-val { font-family:var(--serif); font-size:2.5rem; font-weight:300; color:var(--black); }
        .sustent-stat-label { font-size:0.82rem; color:var(--grey-600); text-align:right; max-width:20ch; font-weight:400; }

        /* CTA FINAL */
        .cta-final { padding:14rem 6rem; text-align:center; display:flex; flex-direction:column; align-items:center; border-top:1px solid var(--grey-200); }
        .cta-final-titulo { font-family:var(--serif); font-size:clamp(3.5rem,7vw,8rem); font-weight:300; line-height:1; color:var(--black); }
        .cta-final-sub { font-family:var(--serif); font-size:clamp(3.5rem,7vw,8rem); font-weight:300; font-style:italic; color:var(--grey-400); line-height:1; margin-bottom:1rem; }
        .cta-final-tag { font-size:0.68rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--grey-400); margin-bottom:4rem; font-weight:400; }
        .cta-final-btn { font-size:0.72rem; letter-spacing:0.2em; text-transform:uppercase; background:var(--black); color:var(--white); padding:1.25rem 4rem; text-decoration:none; font-weight:400; font-family:var(--sans); transition:background 0.3s; }
        .cta-final-btn:hover { background:#2a2926; }

        /* FOOTER */
        footer { padding:2.5rem 6rem; border-top:1px solid var(--grey-200); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
        .footer-copy { font-size:0.65rem; color:var(--grey-400); }
        .footer-links { display:flex; gap:2rem; list-style:none; flex-wrap:wrap; }
        .footer-links a { font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--grey-400); text-decoration:none; transition:color 0.2s; font-weight:400; }
        .footer-links a:hover { color:var(--black); }

        /* BOTTOM NAV */
        .bottom-nav { display:none; position:fixed; bottom:0; left:0; right:0; z-index:200; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-top:1px solid var(--grey-200); padding:0.75rem 0 calc(0.75rem + env(safe-area-inset-bottom)); }
        .bottom-nav-inner { display:flex; justify-content:space-around; align-items:center; }
        .bottom-nav-item { display:flex; flex-direction:column; align-items:center; gap:0.3rem; text-decoration:none; color:var(--grey-400); background:none; border:none; cursor:pointer; padding:0.25rem 1.5rem; transition:color 0.2s; font-family:var(--sans); }
        .bottom-nav-item.active { color:var(--black); }
        .bottom-nav-icon svg { width:22px; height:22px; stroke:currentColor; fill:none; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
        .bottom-nav-label { font-size:0.58rem; letter-spacing:0.12em; text-transform:uppercase; font-weight:400; }
        .bottom-nav-dot { width:4px; height:4px; border-radius:50%; background:var(--black); margin-top:2px; }

        /* BANNER CUPÃO */
        .cupao-banner { position:fixed; top:80px; left:0; right:0; z-index:99; background:var(--black); color:var(--white); padding:0.9rem 4rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; border-bottom:1px solid rgba(255,255,255,0.1); animation:slideDown 0.4s ease; }
        @keyframes slideDown { from{transform:translateY(-100%);opacity:0} to{transform:translateY(0);opacity:1} }
        .cupao-texto { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.8); font-weight:400; }
        .cupao-codigo { font-family:var(--serif); font-size:1.1rem; font-weight:400; color:var(--white); letter-spacing:0.2em; margin:0 1rem; }
        .cupao-btn { font-size:0.62rem; letter-spacing:0.15em; text-transform:uppercase; background:var(--rosa); color:var(--white); border:none; padding:0.5rem 1rem; cursor:pointer; font-family:var(--sans); font-weight:500; transition:background 0.2s; white-space:nowrap; }
        .cupao-btn:hover { background:#a85c72; }
        .cupao-btn.copied { background:#27ae60; }
        .cupao-link { font-size:0.62rem; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.5); text-decoration:none; transition:color 0.2s; white-space:nowrap; }
        .cupao-link:hover { color:var(--white); }
        .cupao-fechar { background:rgba(255,255,255,0.15); border:none; color:#fff; cursor:pointer; font-size:1.1rem; padding:0.4rem 0.7rem; transition:all 0.2s; flex-shrink:0; font-weight:500; border-radius:2px; }
        .cupao-fechar:hover { color:var(--white); }

        /* MOBILE */
        @media (max-width: 768px) {
          body { padding-bottom: 80px; }
          .nav { padding:0.9rem 1.25rem; display:flex !important; flex-direction:row !important; align-items:center !important; justify-content:space-between !important; width:100% !important; }
          .nav-links { display:none; }
          .nav-right .nav-btn-outline { display:none; }
          .nav-right .nav-btn-fill { display:none; }
          .cupao-banner { padding:0.75rem 1rem; top:70px; flex-wrap:nowrap; gap:0.5rem; }
          .cupao-texto { font-size:0.6rem; }
          .cupao-codigo { font-size:0.9rem; margin:0 0.25rem; }
          .cupao-btn { font-size:0.58rem; padding:0.4rem 0.6rem; }
          .cupao-link { display:none; }
          .hero { grid-template-columns:1fr; min-height:auto; padding-top:70px; }
          .hero-right { height:80vw; order:-1; }
          .hero-left { padding:2rem 1.25rem 3rem; }
          .hero-titulo, .hero-sub { font-size:clamp(2.5rem,9vw,3.5rem); }
          .hero-desc { font-size:1rem; max-width:100%; }
          .hero-btns { flex-direction:column; }
          .btn-primary { text-align:center; }
          .numeros { grid-template-columns:repeat(2,1fr); }
          .numero { padding:2.5rem 1rem; }
          .numero-val { font-size:2.5rem; }
          .como { padding:4rem 1.25rem; }
          .section-titulo { font-size:2rem; margin-bottom:2.5rem; }
          .como-grid { grid-template-columns:1fr; }
          .como-passo { padding:2rem 1.25rem; }
          .porque { grid-template-columns:1fr; gap:3rem; padding:5rem 1.25rem; }
          .porque-titulo { font-size:1.8rem; }
          .porque-ponto { font-size:1.2rem; }
          .categorias { padding:4rem 1.25rem; }
          .cat-grid { grid-template-columns:1fr 1fr; }
          .sustent { padding:4rem 1.25rem; }
          .sustent-grid { grid-template-columns:1fr; gap:2rem; }
          .sustent-titulo { font-size:1.6rem; }
          .cta-final { padding:6rem 1.25rem; }
          .cta-final-titulo, .cta-final-sub { font-size:clamp(2.5rem,9vw,4rem); }
          footer { padding:1.5rem 1.25rem; flex-direction:column; align-items:flex-start; }
          .bottom-nav { display:block; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* BANNER CUPÃO */}
      {banner && (
        <div className="cupao-banner">
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'}}>
            <span className="cupao-texto">✦ Oferta de boas-vindas —</span>
            <span className="cupao-codigo">NORA15</span>
            <span className="cupao-texto">— 15% de desconto em</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'1rem',flexShrink:0}}>
            <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" className="cupao-link">www.noragrei.com ↗</a>
            <button className={`cupao-btn${cupaoCopiado?" copied":""}`} onClick={copiarCupao}>
              {cupaoCopiado ? "Copiado ✓" : "Copiar código"}
            </button>
            <button className="cupao-fechar" onClick={fecharBanner}>✕</button>
          </div>
        </div>
      )}

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
            {["pt","fr","lt"].map((l, i) => (
              <span key={l} style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                {i > 0 && <span className="lang-sep">/</span>}
                <button className={`lang-btn${lang===l?" active":""}`} onClick={() => changeLang(l)}>{l.toUpperCase()}</button>
              </span>
            ))}
          </div>
          {userLogado && <a href="/pedidos" className="nav-btn nav-btn-outline">{t.nav.pedidos}</a>}
          <a href={userLogado ? "/perfil" : "/entrar"} className="nav-btn nav-btn-outline">{userLogado ? t.nav.perfil : t.nav.entrar}</a>
          <a href="/catalogo" className="nav-btn nav-btn-fill">{t.hero.cta1}</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">{t.hero.eyebrow}</p>
          <h1 className="hero-titulo">{t.hero.titulo}</h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <p className="hero-desc">{t.hero.desc}</p>
          <div className="hero-btns">
            <a href="/catalogo" className="btn-primary">{t.hero.cta1}</a>
            <a href="#como" className="btn-ghost">{t.hero.cta2} →</a>
          </div>
        </div>
        <div className="hero-right">
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=85" alt="Nora Grei" />
          <div className="hero-caption">
            <span className="hero-caption-nome">{t.hero.peca}</span>
            <span className="hero-caption-preco">{t.hero.preco}</span>
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
        <p className="section-label">{t.como.label}</p>
        <h2 className="section-titulo">{t.como.titulo}</h2>
        <div className="como-grid">
          {t.como.passos.map((p,i) => (
            <div key={i} className="como-passo">
              <div className="como-num">{p.num}</div>
              <h3 className="como-titulo">{p.titulo}</h3>
              <p className="como-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PORQUE */}
      <section className="porque">
        <div>
          <p className="section-label" style={{color:'rgba(255,255,255,0.4)'}}>{t.porque.label}</p>
          <h2 className="porque-titulo">
            {t.porque.titulo}
            <em>{t.porque.tituloSub}</em>
          </h2>
        </div>
        <div className="porque-pontos">
          {t.porque.pontos.map((p,i) => (
            <div key={i} className="porque-ponto">{p}</div>
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="categorias">
        <p className="section-label">{t.categorias.label}</p>
        <h2 className="section-titulo">{t.categorias.titulo}<br /><em>{t.categorias.tituloSub}</em></h2>
        <div className="cat-grid">
          {t.categorias.lista.map((c,i) => (
            <a key={i} href="/catalogo" className="cat-card">
              <img src={c.img} alt={c.nome} />
              <div className="cat-card-overlay">
                <span className="cat-card-nome">{c.nome}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SUSTENTABILIDADE */}
      <section className="sustent">
        <p className="section-label">{t.sustentabilidade.label}</p>
        <div className="sustent-grid">
          <h2 className="sustent-titulo">{t.sustentabilidade.titulo}</h2>
          <div className="sustent-stats">
            {t.sustentabilidade.stats.map((s,i) => (
              <div key={i} className="sustent-stat">
                <div className="sustent-stat-val">{s.val}</div>
                <div className="sustent-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="cta-final-titulo">{t.cta.titulo}</div>
        <div className="cta-final-sub">{t.cta.sub}</div>
        <p className="cta-final-tag">{t.cta.tag}</p>
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