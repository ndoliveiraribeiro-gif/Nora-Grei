"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const T = {
  pt: {
    nav: { catalogo: "Colecção", comoFunciona: "Como funciona", entrar: "Entrar", pedidos: "Pedidos", perfil: "Perfil" },
    hero: {
      eyebrow: "Nova colecção — Primavera 2026",
      titulo: "Veste o extraordinário.",
      sub: "Sem comprar.",
      desc: "Aluga peças exclusivas da Nora Grei e renova o teu guarda-roupa sempre que quiseres.",
      cta1: "Explorar colecção",
      cta2: "Como funciona",
    },
    como: {
      label: "O processo",
      titulo: "Moda sem compromisso.",
      passos: [
        { num: "01", titulo: "Escolhe", desc: "Explora a colecção e reserva a peça dos teus sonhos.", icon: "✦" },
        { num: "02", titulo: "Recebe", desc: "Entregamos em casa, limpa e pronta a usar.", icon: "◎" },
        { num: "03", titulo: "Usa", desc: "Vive cada momento com estilo único.", icon: "◈" },
        { num: "04", titulo: "Devolve ou troca", desc: "Renova o teu guarda-roupa sem acumular.", icon: "↻" },
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
    cta: { titulo: "O teu guarda-roupa infinito", sub: "começa aqui.", btn: "Explorar colecção", tag: "Moda exclusiva. Sem excessos." },
    strip: ["Envio gratuito", "Depósito 100% devolvido", "Peças inspecionadas", "Cancele quando quiser", "Moda consciente"],
    footer: { copy: "© 2026 Nora Grei. Todos os direitos reservados.", links: ["Colecção", "Como funciona", "Contacto", "Termos", "Privacidade"] },
    bottomNav: { inicio: "Início", catalogo: "Colecção", pedidos: "Pedidos", perfil: "Perfil" },
  },
  fr: {
    nav: { catalogo: "Collection", comoFunciona: "Comment ça marche", entrar: "Connexion", pedidos: "Commandes", perfil: "Profil" },
    hero: { eyebrow: "Nouvelle collection — Printemps 2026", titulo: "Portez l'extraordinaire.", sub: "Sans acheter.", desc: "Louez des pièces exclusives Nora Grei et renouvelez votre garde-robe quand vous voulez.", cta1: "Explorer la collection", cta2: "Comment ça marche" },
    como: { label: "Le processus", titulo: "La mode sans engagement.", passos: [{ num:"01",titulo:"Choisissez",desc:"Explorez la collection et réservez la pièce de vos rêves.",icon:"✦" },{ num:"02",titulo:"Recevez",desc:"Livraison à domicile, propre et prête à porter.",icon:"◎" },{ num:"03",titulo:"Portez",desc:"Vivez chaque moment avec un style unique.",icon:"◈" },{ num:"04",titulo:"Retournez",desc:"Renouvelez votre garde-robe sans accumuler.",icon:"↻" }] },
    porque: { label: "Notre mission", titulo: "Parce que la mode doit accompagner votre vie,", tituloSub: "pas occuper votre armoire.", pontos: ["Moins de gaspillage.", "Plus d'exclusivité.", "Plus de liberté.", "Mode consciente."] },
    categorias: { label: "Pour chaque moment", titulo: "Le look parfait,", tituloSub: "pour chaque occasion.", lista: [{ nome:"Événements",img:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80" },{ nome:"Travail",img:"https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80" },{ nome:"Vacances",img:"https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80" },{ nome:"Dîners",img:"https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&q=80" }] },
    numeros: [{ val:"1.000+",label:"Locations réalisées" },{ val:"200+",label:"Pièces exclusives" },{ val:"4.9★",label:"Note moyenne" },{ val:"48h",label:"Livraison rapide" }],
    sustentabilidade: { label:"Mode consciente", titulo:"Chaque pièce vit plusieurs histoires.", stats:[{ val:"70%",label:"Eau économisée" },{ val:"5×",label:"Réutilisations" },{ val:"60%",label:"Émissions réduites" }] },
    cta: { titulo:"Votre garde-robe infinie", sub:"commence ici.", btn:"Explorer la collection", tag:"Mode exclusive. Sans excès." },
    strip: ["Livraison gratuite", "Dépôt 100% remboursé", "Pièces inspectées", "Annulez quand vous voulez", "Mode consciente"],
    footer: { copy:"© 2026 Nora Grei. Tous droits réservés.", links:["Collection","Comment ça marche","Contact","CGU","Confidentialité"] },
    bottomNav: { inicio:"Accueil", catalogo:"Collection", pedidos:"Commandes", perfil:"Profil" },
  },
  lt: {
    nav: { catalogo: "Kolekcija", comoFunciona: "Kaip tai veikia", entrar: "Prisijungti", pedidos: "Užsakymai", perfil: "Profilis" },
    hero: { eyebrow: "Nauja kolekcija — Pavasaris 2026", titulo: "Dėvėkite nepaprastą.", sub: "Nepirkdami.", desc: "Išsinuomokite išskirtines Nora Grei drabužius ir atnaujinkite savo garderobą kada norite.", cta1: "Naršyti kolekciją", cta2: "Kaip tai veikia" },
    como: { label: "Procesas", titulo: "Mada be įsipareigojimų.", passos: [{ num:"01",titulo:"Pasirinkite",desc:"Naršykite kolekciją ir rezervuokite.",icon:"✦" },{ num:"02",titulo:"Gaukite",desc:"Pristatome į namus, švarų ir paruoštą.",icon:"◎" },{ num:"03",titulo:"Dėvėkite",desc:"Gyvenkit kiekvieną akimirką su stiliumi.",icon:"◈" },{ num:"04",titulo:"Grąžinkite",desc:"Atnaujinkite garderobą nekaupdami.",icon:"↻" }] },
    porque: { label: "Mūsų misija", titulo: "Nes mada turi lydėti jūsų gyvenimą,", tituloSub: "o ne užimti jūsų spintą.", pontos: ["Mažiau atliekų.", "Daugiau išskirtinumo.", "Daugiau laisvės.", "Sąmoninga mada."] },
    categorias: { label: "Kiekvienai progai", titulo: "Tinkamas įvaizdis,", tituloSub: "kiekvienai progai.", lista: [{ nome:"Renginiai",img:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80" },{ nome:"Darbas",img:"https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80" },{ nome:"Atostogos",img:"https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80" },{ nome:"Vakarienės",img:"https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&q=80" }] },
    numeros: [{ val:"1.000+",label:"Įvykdytų nuomų" },{ val:"200+",label:"Išskirtinių drabužių" },{ val:"4.9★",label:"Vidutinis įvertinimas" },{ val:"48h",label:"Greitas pristatymas" }],
    sustentabilidade: { label:"Sąmoninga mada", titulo:"Kiekvienas drabužis gyvena kelias istorijas.", stats:[{ val:"70%",label:"Sutaupytas vanduo" },{ val:"5×",label:"Pakartotinis naudojimas" },{ val:"60%",label:"Sumažintos emisijos" }] },
    cta: { titulo:"Jūsų begalinis garderobas", sub:"prasideda čia.", btn:"Naršyti kolekciją", tag:"Išskirtinė mada. Be pertekliaus." },
    strip: ["Nemokamas pristatymas", "Užstatas grąžinamas 100%", "Drabužiai patikrinti", "Atšaukite kada norite", "Sąmoninga mada"],
    footer: { copy:"© 2026 Nora Grei. Visos teisės saugomos.", links:["Kolekcija","Kaip tai veikia","Kontaktai","Sąlygos","Privatumas"] },
    bottomNav: { inicio:"Pradžia", catalogo:"Kolekcija", pedidos:"Užsakymai", perfil:"Profilis" },
  },
};

export default function Home() {
  const [lang, setLang] = useState("pt");
  const [userLogado, setUserLogado] = useState(false);
  const [banner, setBanner] = useState(false);
  const [cupaoCopiado, setCupaoCopiado] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    else { const b = navigator.language?.slice(0,2); if (b==="fr") setLang("fr"); else if (b==="lt") setLang("lt"); }
    supabase.auth.getSession().then(({ data }) => { if (data.session) setUserLogado(true); });
    const visto = localStorage.getItem("ng_banner_cupao");
    if (!visto) { setTimeout(() => { setBanner(true); setTimeout(() => { setBanner(false); localStorage.setItem("ng_banner_cupao","1"); }, 8000); }, 2000); }
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const changeLang = (l) => { localStorage.setItem("ng_lang", l); setLang(l); };
  const copiarCupao = () => { navigator.clipboard.writeText("NORA15"); setCupaoCopiado(true); setTimeout(() => setCupaoCopiado(false), 3000); };
  const t = T[lang];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g4:#5a5855;--rosa:#c4748a;--rosa-light:#f5e6ea;--gold:#c9a96e;--serif:'Cormorant',Georgia,serif;--sans:'Jost',Arial,sans-serif}
        html{scroll-behavior:smooth}
        body{background:var(--white);color:var(--black);font-family:var(--sans);font-size:17px;font-weight:400;line-height:1.7;-webkit-font-smoothing:antialiased;padding-bottom:0}
        @media(max-width:768px){body{padding-bottom:72px}}

        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1rem 4rem;transition:all 0.3s;background:rgba(248,247,245,0.98);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2)}
        .nav.scrolled{padding:0.75rem 4rem;box-shadow:0 2px 20px rgba(0,0,0,0.06)}
        .logo{display:flex;flex-direction:column;text-decoration:none;color:var(--black)}
        .logo-name{font-family:var(--serif);font-size:1.35rem;font-weight:400;letter-spacing:0.25em;text-transform:uppercase;line-height:1}
        .logo-tag{font-size:0.5rem;letter-spacing:0.35em;text-transform:uppercase;color:var(--g4);margin-top:0.15rem}
        .nav-links{display:flex;align-items:center;gap:2.5rem;list-style:none}
        .nav-links a{font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);text-decoration:none;transition:color 0.2s}
        .nav-links a:hover{color:var(--black)}
        .nav-right{display:flex;align-items:center;gap:0.75rem}
        .nav-lang{display:flex;gap:0.3rem;align-items:center}
        .lang-btn{font-size:0.58rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--g4);background:none;border:none;cursor:pointer;font-family:var(--sans);padding:0;transition:color 0.2s}
        .lang-btn.on{color:var(--black);font-weight:500}
        .lang-sep{color:var(--g2);font-size:0.5rem}
        .nb{font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;padding:0.6rem 1.1rem;text-decoration:none;font-family:var(--sans);transition:all 0.2s;white-space:nowrap}
        .nb-o{color:var(--black);border:1px solid var(--g2)}
        .nb-o:hover{border-color:var(--black)}
        .nb-f{background:var(--black);color:var(--white);border:1px solid var(--black)}
        .nb-f:hover{background:#2a2926}

        /* HERO — mobile first */
        .hero{min-height:100svh;position:relative;display:flex;flex-direction:column;overflow:hidden;padding-top:72px}
        .hero-bg{position:absolute;inset:0;z-index:0}
        .hero-bg img{width:100%;height:100%;object-fit:cover;object-position:center top;filter:brightness(0.55)}
        .hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,8,8,0.2) 0%,rgba(8,8,8,0.65) 60%,rgba(8,8,8,0.85) 100%);z-index:1}
        .hero-content{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;flex:1;padding:2.5rem 1.5rem 3rem;color:#fff}
        .hero-eyebrow{font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:1rem}
        .hero-titulo{font-family:var(--serif);font-size:clamp(3rem,10vw,5.5rem);font-weight:300;line-height:1.02;color:#fff}
        .hero-sub{font-family:var(--serif);font-size:clamp(3rem,10vw,5.5rem);font-weight:300;font-style:italic;color:rgba(255,255,255,0.65);line-height:1.02;margin-bottom:1.5rem}
        .hero-desc{font-size:0.95rem;color:rgba(255,255,255,0.75);max-width:45ch;line-height:1.8;margin-bottom:2rem}
        .hero-btns{display:flex;gap:0.75rem;flex-wrap:wrap}
        .hero-cta1{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;background:var(--rosa);color:#fff;padding:1rem 2rem;text-decoration:none;font-family:var(--sans);font-weight:500;transition:background 0.2s;flex:1;text-align:center;max-width:220px}
        .hero-cta1:hover{background:#a85c72}
        .hero-cta2{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.7);text-decoration:none;border:1px solid rgba(255,255,255,0.3);padding:1rem 1.5rem;transition:all 0.2s;flex:1;text-align:center;max-width:180px}
        .hero-cta2:hover{color:#fff;border-color:#fff}
        .hero-scroll{position:absolute;bottom:1.5rem;right:1.5rem;z-index:2;display:flex;flex-direction:column;align-items:center;gap:0.4rem;color:rgba(255,255,255,0.4);font-size:0.55rem;letter-spacing:0.2em;text-transform:uppercase}
        .hero-scroll-line{width:1px;height:40px;background:rgba(255,255,255,0.3);animation:scrollPulse 2s ease-in-out infinite}
        @keyframes scrollPulse{0%,100%{opacity:0.3;transform:scaleY(1)}50%{opacity:1;transform:scaleY(1.2)}}

        /* STRIP */
        .strip{background:var(--rosa);padding:0.75rem 0;overflow:hidden}
        .strip-track{display:flex;white-space:nowrap;animation:marquee 25s linear infinite}
        .strip-item{font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.9);padding:0 2.5rem;flex-shrink:0}
        .strip-item::after{content:'✦';margin-left:2.5rem;color:rgba(255,255,255,0.4)}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        /* ACESSO RÁPIDO MOBILE */
        .quick-access{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--g2);margin:0}
        .qa-item{background:var(--white);padding:1.5rem;display:flex;flex-direction:column;gap:0.4rem;text-decoration:none;color:var(--black);transition:background 0.2s;position:relative;overflow:hidden}
        .qa-item:hover{background:var(--g1)}
        .qa-item::after{content:'→';position:absolute;right:1rem;top:50%;transform:translateY(-50%);font-size:1.2rem;color:var(--g2);transition:all 0.2s}
        .qa-item:hover::after{color:var(--rosa);right:0.75rem}
        .qa-icon{font-size:1.5rem;margin-bottom:0.2rem}
        .qa-label{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;font-weight:500}
        .qa-desc{font-size:0.78rem;color:var(--g4)}

        /* NÚMEROS */
        .numeros{display:grid;grid-template-columns:repeat(2,1fr);background:var(--black)}
        .numero{padding:2.5rem 1.5rem;text-align:center;border-right:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08)}
        .numero:nth-child(even){border-right:none}
        .numero-val{font-family:var(--serif);font-size:3rem;font-weight:300;color:var(--rosa);line-height:1;margin-bottom:0.4rem}
        .numero-label{font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4)}

        /* SECÇÃO GENÉRICA */
        .sec{padding:4rem 1.5rem}
        .sec-label{font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--rosa);margin-bottom:0.75rem;font-weight:500}
        .sec-titulo{font-family:var(--serif);font-size:clamp(2rem,6vw,3.5rem);font-weight:300;line-height:1.1;margin-bottom:2rem}
        .sec-titulo em{font-style:italic;color:var(--g4)}

        /* COMO FUNCIONA */
        .como-grid{display:flex;flex-direction:column;gap:1px;background:var(--g2)}
        .como-passo{background:var(--white);padding:1.75rem 1.5rem;display:flex;gap:1.5rem;align-items:flex-start;transition:background 0.2s}
        .como-passo:hover{background:var(--g1)}
        .como-num-wrap{flex-shrink:0;width:48px;height:48px;background:var(--rosa);display:flex;align-items:center;justify-content:center}
        .como-num{font-family:var(--serif);font-size:1.2rem;font-weight:300;color:#fff}
        .como-titulo{font-family:var(--serif);font-size:1.3rem;font-weight:400;margin-bottom:0.3rem}
        .como-desc{font-size:0.88rem;color:var(--g4);line-height:1.6}

        /* PORQUE */
        .porque{background:linear-gradient(135deg,#080808 0%,#1a0a10 100%);padding:4rem 1.5rem}
        .porque-titulo{font-family:var(--serif);font-size:clamp(1.8rem,5vw,2.8rem);font-weight:300;line-height:1.2;color:#fff;margin-bottom:2.5rem}
        .porque-titulo em{font-style:italic;color:rgba(255,255,255,0.4);display:block}
        .porque-ponto{display:flex;align-items:center;gap:1rem;padding:1rem 0;border-bottom:1px solid rgba(255,255,255,0.08)}
        .porque-ponto:last-child{border-bottom:none}
        .porque-dot{width:8px;height:8px;border-radius:50%;background:var(--rosa);flex-shrink:0}
        .porque-text{font-family:var(--serif);font-size:1.3rem;font-weight:300;color:rgba(255,255,255,0.85)}

        /* CATEGORIAS */
        .cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--g2)}
        .cat-card{position:relative;overflow:hidden;aspect-ratio:3/4;text-decoration:none;display:block}
        .cat-card img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease}
        .cat-card:hover img{transform:scale(1.05)}
        .cat-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,8,0.75) 0%,transparent 50%);display:flex;align-items:flex-end;padding:1.25rem}
        .cat-nome{font-family:var(--serif);font-size:1.4rem;font-weight:300;color:#fff;font-style:italic}

        /* SUSTENTABILIDADE */
        .sustent{background:var(--g1);padding:4rem 1.5rem}
        .sustent-stat{background:var(--white);padding:1.5rem;margin-bottom:1px;display:flex;align-items:center;justify-content:space-between;border-left:3px solid var(--rosa)}
        .sustent-val{font-family:var(--serif);font-size:2.5rem;font-weight:300;color:var(--rosa)}
        .sustent-label{font-size:0.82rem;color:var(--g4);text-align:right;max-width:20ch}

        /* CTA FINAL */
        .cta-final{padding:5rem 1.5rem;text-align:center;background:var(--black);color:#fff}
        .cta-final-titulo{font-family:var(--serif);font-size:clamp(2.5rem,8vw,5rem);font-weight:300;line-height:1;color:#fff}
        .cta-final-sub{font-family:var(--serif);font-size:clamp(2.5rem,8vw,5rem);font-weight:300;font-style:italic;color:var(--rosa);line-height:1;margin-bottom:0.75rem}
        .cta-final-tag{font-size:0.65rem;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:2.5rem;display:block}
        .cta-final-btn{font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;background:var(--rosa);color:#fff;padding:1.1rem 3rem;text-decoration:none;font-family:var(--sans);transition:background 0.2s;display:inline-block}
        .cta-final-btn:hover{background:#a85c72}

        /* FOOTER */
        footer{padding:2rem 1.5rem;border-top:1px solid var(--g2);display:flex;flex-direction:column;gap:1rem}
        .footer-copy{font-size:0.65rem;color:var(--g4)}
        .footer-links{display:flex;gap:1.5rem;flex-wrap:wrap;list-style:none}
        .footer-links a{font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--g4);text-decoration:none}

        /* BOTTOM NAV */
        .bnav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-top:1px solid var(--g2);padding:0.6rem 0 calc(0.6rem + env(safe-area-inset-bottom))}
        .bnav-inner{display:flex;justify-content:space-around;align-items:center}
        .bnav-item{display:flex;flex-direction:column;align-items:center;gap:0.2rem;text-decoration:none;color:var(--g4);background:none;border:none;cursor:pointer;padding:0.2rem 1rem;font-family:var(--sans)}
        .bnav-item.on{color:var(--black)}
        .bnav-icon svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
        .bnav-label{font-size:0.55rem;letter-spacing:0.1em;text-transform:uppercase}
        .bnav-dot{width:3px;height:3px;border-radius:50%;background:var(--rosa)}

        /* BANNER */
        .cupao-banner{position:fixed;bottom:72px;left:0;right:0;z-index:150;background:var(--rosa);padding:1rem 1.5rem;animation:slideUp 0.4s ease}
        @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        .cupao-inner{display:flex;flex-direction:column;gap:0.75rem}
        .cupao-texto{font-size:0.82rem;color:#fff;font-weight:500}
        .cupao-codigo{font-family:var(--serif);font-size:1.8rem;font-weight:300;color:#fff;letter-spacing:0.15em}
        .cupao-actions{display:flex;gap:0.75rem;align-items:center}
        .cupao-btn{font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;background:#fff;color:var(--rosa);border:none;padding:0.6rem 1.25rem;cursor:pointer;font-family:var(--sans);font-weight:600;flex:1}
        .cupao-fechar{background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;font-size:1.2rem;padding:0;flex-shrink:0}

        /* DESKTOP */
        @media(min-width:769px){
          .hero{flex-direction:row;padding-top:80px}
          .hero-bg{display:none}
          .hero-overlay{display:none}
          .hero-content{color:var(--black);background:var(--white);flex:1;justify-content:center;padding:6rem 4rem 6rem 6rem}
          .hero-eyebrow{color:var(--g4)}
          .hero-titulo{color:var(--black);font-size:clamp(3.5rem,5vw,5.5rem)}
          .hero-sub{color:var(--g4);font-size:clamp(3.5rem,5vw,5.5rem)}
          .hero-desc{color:#1a1a18}
          .hero-cta1{max-width:none;flex:0}
          .hero-cta2{color:var(--g4);border-color:var(--g2);max-width:none;flex:0}
          .hero-cta2:hover{color:var(--black);border-color:var(--black)}
          .hero-right-desktop{flex:1;position:relative;overflow:hidden;min-height:100%}
          .hero-right-desktop img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;transition:transform 6s ease}
          .hero-right-desktop:hover img{transform:scale(1.03)}
          .hero-caption{position:absolute;bottom:0;left:0;right:0;z-index:2;padding:1.5rem 2rem;background:linear-gradient(to top,rgba(8,8,8,0.6),transparent);color:#fff;display:flex;justify-content:space-between;align-items:flex-end}
          .hero-caption-nome{font-family:var(--serif);font-size:1.1rem;font-style:italic;font-weight:300}
          .hero-caption-preco{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;opacity:0.8}
          .quick-access{grid-template-columns:repeat(4,1fr)}
          .numeros{grid-template-columns:repeat(4,1fr)}
          .numero{padding:4rem 2rem}
          .numero:nth-child(even){border-right:1px solid rgba(255,255,255,0.08)}
          .sec{padding:8rem 6rem}
          .como-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px}
          .porque{display:grid;grid-template-columns:1fr 1fr;gap:6rem;padding:8rem 6rem}
          .cat-grid{grid-template-columns:repeat(4,1fr)}
          .sustent{padding:8rem 6rem}
          .sustent-inner{display:grid;grid-template-columns:1fr 1fr;gap:6rem;align-items:center;margin-top:3rem}
          .cta-final{padding:12rem 6rem}
          footer{flex-direction:row;justify-content:space-between;align-items:center;padding:2rem 6rem}
          .bnav{display:none}
          .nav{padding:1.25rem 4rem}
          .cupao-banner{bottom:0;padding:1rem 4rem}
          .cupao-inner{flex-direction:row;align-items:center;justify-content:space-between}
          .cupao-actions{flex:0}
        }
        @media(max-width:768px){
          .bnav{display:block}
          .hero-right-desktop{display:none}
          .nav{padding:0.9rem 1.25rem}
          .nav-links,.nav-right .nb-o,.nav-right .nb-f{display:none}
          .nav-right{gap:0.5rem}
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* BANNER CUPÃO */}
      {banner && (
        <div className="cupao-banner">
          <div className="cupao-inner">
            <div>
              <div className="cupao-texto">✦ Oferta de boas-vindas — 15% de desconto em noragrei.com</div>
              <div className="cupao-codigo">NORA15</div>
            </div>
            <div className="cupao-actions">
              <button className="cupao-btn" onClick={copiarCupao}>{cupaoCopiado ? "Copiado ✓" : "Copiar código"}</button>
              <button className="cupao-fechar" onClick={() => { setBanner(false); localStorage.setItem("ng_banner_cupao","1"); }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className={`nav${scrolled?" scrolled":""}`}>
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
              <span key={l} style={{display:"flex",alignItems:"center",gap:"0.3rem"}}>
                {i>0 && <span className="lang-sep">/</span>}
                <button className={`lang-btn${lang===l?" on":""}`} onClick={() => changeLang(l)}>{l.toUpperCase()}</button>
              </span>
            ))}
          </div>
          {userLogado && <a href="/pedidos" className="nb nb-o">{t.nav.pedidos}</a>}
          <a href={userLogado?"/perfil":"/entrar"} className="nb nb-o">{userLogado?t.nav.perfil:t.nav.entrar}</a>
          <a href="/catalogo" className="nb nb-f">{t.hero.cta1}</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        {/* Mobile background */}
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=85" alt="" />
        </div>
        <div className="hero-overlay" />

        <div className="hero-content">
          <p className="hero-eyebrow">{t.hero.eyebrow}</p>
          <h1 className="hero-titulo">{t.hero.titulo}</h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <p className="hero-desc">{t.hero.desc}</p>
          <div className="hero-btns">
            <a href="/catalogo" className="hero-cta1">{t.hero.cta1}</a>
            <a href="#como" className="hero-cta2">{t.hero.cta2} →</a>
          </div>
        </div>

        {/* Desktop right side */}
        <div className="hero-right-desktop">
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=85" alt="Nora Grei" />
          <div className="hero-caption">
            <span className="hero-caption-nome">Vestido Seda Noite</span>
            <span className="hero-caption-preco">35€ / dia</span>
          </div>
        </div>

        <div className="hero-scroll">
          <div className="hero-scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      {/* STRIP */}
      <div className="strip">
        <div className="strip-track">
          {[...Array(4)].map((_,i) => t.strip.map((item,j) => (
            <span key={`${i}-${j}`} className="strip-item">{item}</span>
          )))}
        </div>
      </div>

      {/* ACESSO RÁPIDO — mobile priority */}
      <div className="quick-access">
        {[
          { href:"/catalogo", icon:"✦", label:"Ver colecção", desc:"Todas as peças disponíveis" },
          { href: userLogado?"/perfil":"/entrar", icon:"◉", label: userLogado?"O meu perfil":"Entrar", desc: userLogado?"Pedidos e níveis":"Cria a tua conta" },
          { href:"/catalogo", icon:"◎", label:"Alugar agora", desc:"A partir de 25€/dia" },
          { href:"https://www.noragrei.com", icon:"↗", label:"Comprar peça", desc:"Visita a nossa loja" },
        ].map((item,i) => (
          <a key={i} href={item.href} className="qa-item" target={item.href.startsWith("http")?"_blank":undefined} rel={item.href.startsWith("http")?"noopener noreferrer":undefined}>
            <div className="qa-icon">{item.icon}</div>
            <div className="qa-label">{item.label}</div>
            <div className="qa-desc">{item.desc}</div>
          </a>
        ))}
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
      <section className="sec" id="como" style={{background:"var(--white)"}}>
        <p className="sec-label">{t.como.label}</p>
        <h2 className="sec-titulo">{t.como.titulo}</h2>
        <div className="como-grid">
          {t.como.passos.map((p,i) => (
            <div key={i} className="como-passo">
              <div className="como-num-wrap"><div className="como-num">{p.num}</div></div>
              <div>
                <h3 className="como-titulo">{p.titulo}</h3>
                <p className="como-desc">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PORQUE */}
      <section className="porque">
        <div>
          <p className="sec-label" style={{color:"var(--rosa)"}}>A nossa missão</p>
          <h2 className="porque-titulo">
            {t.porque.titulo}
            <em>{t.porque.tituloSub}</em>
          </h2>
        </div>
        <div>
          {t.porque.pontos.map((p,i) => (
            <div key={i} className="porque-ponto">
              <div className="porque-dot" />
              <div className="porque-text">{p}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="sec" style={{padding:"0"}}>
        <div style={{padding:"3rem 1.5rem 2rem"}}>
          <p className="sec-label">{t.categorias.label}</p>
          <h2 className="sec-titulo">{t.categorias.titulo}<br /><em>{t.categorias.tituloSub}</em></h2>
        </div>
        <div className="cat-grid">
          {t.categorias.lista.map((c,i) => (
            <a key={i} href="/catalogo" className="cat-card">
              <img src={c.img} alt={c.nome} />
              <div className="cat-overlay">
                <span className="cat-nome">{c.nome}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SUSTENTABILIDADE */}
      <section className="sustent">
        <p className="sec-label">{t.sustentabilidade.label}</p>
        <div className="sustent-inner">
          <h2 className="sec-titulo" style={{marginBottom:0}}>{t.sustentabilidade.titulo}</h2>
          <div>
            {t.sustentabilidade.stats.map((s,i) => (
              <div key={i} className="sustent-stat">
                <div className="sustent-val">{s.val}</div>
                <div className="sustent-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="cta-final-titulo">{t.cta.titulo}</div>
        <div className="cta-final-sub">{t.cta.sub}</div>
        <span className="cta-final-tag">{t.cta.tag}</span>
        <a href="/catalogo" className="cta-final-btn">{t.cta.btn}</a>
      </section>

      {/* FOOTER */}
      <footer>
        <span className="footer-copy">{t.footer.copy}</span>
        <ul className="footer-links">
          {t.footer.links.map((l,i) => <li key={i}><a href="#">{l}</a></li>)}
        </ul>
      </footer>

      {/* BOTTOM NAV MOBILE */}
      <nav className="bnav">
        <div className="bnav-inner">
          {[
            { href:"/", label:t.bottomNav.inicio, on:true, icon:<svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
            { href:"/catalogo", label:t.bottomNav.catalogo, on:false, icon:<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
            { href:userLogado?"/pedidos":"/entrar", label:t.bottomNav.pedidos, on:false, icon:<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
            { href:userLogado?"/perfil":"/entrar", label:t.bottomNav.perfil, on:false, icon:<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          ].map((item,i) => (
            <a key={i} href={item.href} className={`bnav-item${item.on?" on":""}`}>
              <div className="bnav-icon">{item.icon}</div>
              <span className="bnav-label">{item.label}</span>
              {item.on && <div className="bnav-dot" />}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}