"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Chaves internas de categoria (não traduzidas — usadas como keys no Supabase)
const CAT_KEYS = ["Festa", "Trabalho", "Férias", "Jantar"];

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
    video: { label: "A experiência Nora Grei", titulo: "Vê como funciona." },
    como: {
      label: "O processo",
      titulo: "Moda sem compromisso.",
      passos: [
        { num: "01", titulo: "Escolhe", desc: "Explora a colecção e reserva a peça dos teus sonhos." },
        { num: "02", titulo: "Recebe", desc: "Entregamos em casa, limpa e pronta a usar." },
        { num: "03", titulo: "Usa", desc: "Vive cada momento com estilo único." },
        { num: "04", titulo: "Devolve", desc: "Renova o teu guarda-roupa sem acumular." },
      ],
    },
    categorias: {
      label: "Para cada momento",
      titulo: "O look certo,",
      tituloSub: "para cada ocasião.",
      nomes: { Festa: "Festa", Trabalho: "Trabalho", "Férias": "Férias", Jantar: "Jantar" },
    },
    porque: {
      label: "A nossa missão",
      titulo: "Porque a moda deve acompanhar a tua vida,",
      tituloSub: "não ocupar o teu armário.",
      pontos: ["Menos desperdício.", "Mais exclusividade.", "Mais liberdade.", "Moda consciente."],
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
    quickAccess: [
      { label: "Ver colecção", desc: "Todas as peças" },
      { label: "Perfil", labelGuest: "Entrar", desc: "Pedidos e níveis", descGuest: "Cria conta" },
      { label: "Alugar agora", desc: "Desde 25€/dia" },
      { label: "Comprar", desc: "Loja Nora Grei" },
    ],
    missaoLabel: "A nossa missão",
    videoEmBreve: "Vídeo em breve",
    cupao: { texto: "Oferta de boas-vindas — 15% de desconto em noragrei.com", copiar: "Copiar código", copiado: "Copiado ✓" },
  },
  fr: {
    nav: { catalogo: "Collection", comoFunciona: "Comment ça marche", entrar: "Connexion", pedidos: "Commandes", perfil: "Profil" },
    hero: {
      eyebrow: "Nouvelle collection — Printemps 2026",
      titulo: "Habillez l'extraordinaire.",
      sub: "Sans acheter.",
      desc: "Louez des pièces exclusives Nora Grei et renouvelez votre garde-robe à volonté.",
      cta1: "Explorer la collection",
      cta2: "Comment ça marche",
    },
    video: { label: "L'expérience Nora Grei", titulo: "Découvrez comment ça marche." },
    como: {
      label: "Le processus",
      titulo: "La mode sans engagement.",
      passos: [
        { num: "01", titulo: "Choisissez", desc: "Explorez la collection et réservez la pièce de vos rêves." },
        { num: "02", titulo: "Recevez", desc: "Livré chez vous, propre et prêt à porter." },
        { num: "03", titulo: "Portez", desc: "Vivez chaque moment avec style." },
        { num: "04", titulo: "Retournez", desc: "Renouvelez votre garde-robe sans accumuler." },
      ],
    },
    categorias: {
      label: "Pour chaque moment",
      titulo: "Le look parfait,",
      tituloSub: "pour chaque occasion.",
      nomes: { Festa: "Soirée", Trabalho: "Travail", "Férias": "Vacances", Jantar: "Dîner" },
    },
    porque: {
      label: "Notre mission",
      titulo: "Parce que la mode doit suivre votre vie,",
      tituloSub: "pas occuper votre placard.",
      pontos: ["Moins de gaspillage.", "Plus d'exclusivité.", "Plus de liberté.", "Mode responsable."],
    },
    numeros: [
      { val: "1.000+", label: "Locations réalisées" },
      { val: "200+", label: "Pièces exclusives" },
      { val: "4.9★", label: "Note moyenne" },
      { val: "48h", label: "Livraison rapide" },
    ],
    sustentabilidade: {
      label: "Mode responsable",
      titulo: "Chaque pièce vit plusieurs histoires.",
      stats: [
        { val: "70%", label: "Eau économisée vs achat" },
        { val: "5×", label: "Réutilisations par pièce" },
        { val: "60%", label: "Émissions réduites" },
      ],
    },
    cta: { titulo: "Votre garde-robe infinie", sub: "commence ici.", btn: "Explorer la collection", tag: "Mode exclusive. Sans excès." },
    strip: ["Livraison gratuite", "Dépôt 100% remboursé", "Pièces inspectées", "Annulez à tout moment", "Mode responsable"],
    footer: { copy: "© 2026 Nora Grei. Tous droits réservés.", links: ["Collection", "Comment ça marche", "Contact", "Conditions", "Confidentialité"] },
    bottomNav: { inicio: "Accueil", catalogo: "Collection", pedidos: "Commandes", perfil: "Profil" },
    quickAccess: [
      { label: "Voir la collection", desc: "Toutes les pièces" },
      { label: "Profil", labelGuest: "Connexion", desc: "Commandes et niveaux", descGuest: "Créer un compte" },
      { label: "Louer maintenant", desc: "Dès 25€/jour" },
      { label: "Acheter", desc: "Boutique Nora Grei" },
    ],
    missaoLabel: "Notre mission",
    videoEmBreve: "Vidéo bientôt disponible",
    cupao: { texto: "Offre de bienvenue — 15% de réduction sur noragrei.com", copiar: "Copier le code", copiado: "Copié ✓" },
  },
  lt: {
    nav: { catalogo: "Kolekcija", comoFunciona: "Kaip tai veikia", entrar: "Prisijungti", pedidos: "Užsakymai", perfil: "Profilis" },
    hero: {
      eyebrow: "Nauja kolekcija — 2026 pavasaris",
      titulo: "Apsirenkite išskirtinai.",
      sub: "Nepirkdami.",
      desc: "Nuomokitės išskirtinius Nora Grei drabužius ir atnaujinkite savo spintą kada panorėję.",
      cta1: "Naršyti kolekciją",
      cta2: "Kaip tai veikia",
    },
    video: { label: "Nora Grei patirtis", titulo: "Pažiūrėkite, kaip tai veikia." },
    como: {
      label: "Procesas",
      titulo: "Mada be įsipareigojimų.",
      passos: [
        { num: "01", titulo: "Pasirinkite", desc: "Naršykite kolekciją ir rezervuokite svajonių drabužį." },
        { num: "02", titulo: "Gaukite", desc: "Pristatome į namus, švarų ir paruoštą dėvėti." },
        { num: "03", titulo: "Dėvėkite", desc: "Gyvenkite kiekvieną akimirką su savitu stiliumi." },
        { num: "04", titulo: "Grąžinkite", desc: "Atnaujinkite spintą nekraudami daiktų." },
      ],
    },
    categorias: {
      label: "Kiekvienai akimirkai",
      titulo: "Tinkamas stilius,",
      tituloSub: "kiekvienai progai.",
      nomes: { Festa: "Vakarėlis", Trabalho: "Darbas", "Férias": "Atostogos", Jantar: "Vakarienė" },
    },
    porque: {
      label: "Mūsų misija",
      titulo: "Nes mada turi atitikti jūsų gyvenimą,",
      tituloSub: "o ne užimti jūsų spintą.",
      pontos: ["Mažiau švaistymo.", "Daugiau išskirtinumo.", "Daugiau laisvės.", "Sąmoninga mada."],
    },
    numeros: [
      { val: "1.000+", label: "Įvykdytų nuomų" },
      { val: "200+", label: "Išskirtinių drabužių" },
      { val: "4.9★", label: "Vidutinis įvertinimas" },
      { val: "48h", label: "Greitas pristatymas" },
    ],
    sustentabilidade: {
      label: "Sąmoninga mada",
      titulo: "Kiekvienas drabužis turi kelias istorijas.",
      stats: [
        { val: "70%", label: "Sutaupyto vandens vs pirkimas" },
        { val: "5×", label: "Pakartotiniai naudojimai" },
        { val: "60%", label: "Sumažintos emisijos" },
      ],
    },
    cta: { titulo: "Jūsų begalinė spinta", sub: "prasideda čia.", btn: "Naršyti kolekciją", tag: "Išskirtinė mada. Be perteklių." },
    strip: ["Nemokamas pristatymas", "100% grąžinamas užstatas", "Patikrinti drabužiai", "Atšaukite bet kada", "Sąmoninga mada"],
    footer: { copy: "© 2026 Nora Grei. Visos teisės saugomos.", links: ["Kolekcija", "Kaip tai veikia", "Kontaktai", "Sąlygos", "Privatumas"] },
    bottomNav: { inicio: "Pradžia", catalogo: "Kolekcija", pedidos: "Užsakymai", perfil: "Profilis" },
    quickAccess: [
      { label: "Žiūrėti kolekciją", desc: "Visi drabužiai" },
      { label: "Profilis", labelGuest: "Prisijungti", desc: "Užsakymai ir lygiai", descGuest: "Sukurti paskyrą" },
      { label: "Nuomoti dabar", desc: "Nuo 25€/dieną" },
      { label: "Pirkti", desc: "Nora Grei parduotuvė" },
    ],
    missaoLabel: "Mūsų misija",
    videoEmBreve: "Vaizdo įrašas greitai",
    cupao: { texto: "Sveikiname — 15% nuolaida noragrei.com", copiar: "Kopijuoti kodą", copiado: "Nukopijuota ✓" },
  },
};

export default function Home() {
  const [lang, setLang] = useState("pt");
  const [userLogado, setUserLogado] = useState(false);
  const [banner, setBanner] = useState(false);
  const [cupaoCopiado, setCupaoCopiado] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroPeca, setHeroPeca] = useState(null);
  const [categoriaFotos, setCategoriaFotos] = useState({});
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    supabase.auth.getSession().then(({ data }) => { if (data.session) setUserLogado(true); });
    const visto = localStorage.getItem("ng_banner_cupao");
    if (!visto) {
      setTimeout(() => {
        setBanner(true);
        setTimeout(() => { setBanner(false); localStorage.setItem("ng_banner_cupao", "1"); }, 8000);
      }, 2500);
    }
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    carregarConteudo();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const aplicarHeroAutomatico = (todasPecas) => {
    const destaque = todasPecas.find((p) => p.destaque && p.fotos && p.fotos[0]);
    if (destaque) { setHeroPeca(destaque); return; }
    if (todasPecas[0] && todasPecas[0].fotos && todasPecas[0].fotos[0]) setHeroPeca(todasPecas[0]);
  };

  const carregarConteudo = async () => {
    const { data: cfg } = await supabase.from("configuracoes").select("*").maybeSingle();
    if (cfg && cfg.video_landing_url) setVideoUrl(cfg.video_landing_url);

    const { data: todasPecas } = await supabase
      .from("pecas")
      .select("id, nome, fotos, ocasioes, preco_aluguer_dia, destaque")
      .not("fotos", "is", null);

    if (cfg && cfg.hero_peca_id && todasPecas) {
      const escolhida = todasPecas.find((p) => p.id === cfg.hero_peca_id);
      if (escolhida && escolhida.fotos && escolhida.fotos[0]) { setHeroPeca(escolhida); }
      else { aplicarHeroAutomatico(todasPecas); }
    } else if (todasPecas) {
      aplicarHeroAutomatico(todasPecas);
    }

    if (todasPecas) {
      const mapa = {};
      const mapaCampos = {
        Festa: cfg ? cfg.categoria_festa_peca_id : null,
        Trabalho: cfg ? cfg.categoria_trabalho_peca_id : null,
        "Férias": cfg ? cfg.categoria_ferias_peca_id : null,
        Jantar: cfg ? cfg.categoria_jantar_peca_id : null,
      };
      CAT_KEYS.forEach((oc) => {
        const idEscolhido = mapaCampos[oc];
        if (idEscolhido) {
          const escolhida = todasPecas.find((p) => p.id === idEscolhido);
          if (escolhida && escolhida.fotos && escolhida.fotos[0]) { mapa[oc] = escolhida.fotos[0]; return; }
        }
        const encontrada = todasPecas.find((p) => p.ocasioes && p.ocasioes.includes(oc) && p.fotos && p.fotos[0]);
        if (encontrada) mapa[oc] = encontrada.fotos[0];
      });
      const restantes = todasPecas.filter((p) => p.fotos && p.fotos[0]);
      let idx = 0;
      CAT_KEYS.forEach((oc) => { if (!mapa[oc] && restantes[idx]) { mapa[oc] = restantes[idx].fotos[0]; idx++; } });
      setCategoriaFotos(mapa);
    }
  };

  const changeLang = (l) => { localStorage.setItem("ng_lang", l); setLang(l); };
  const copiarCupao = () => { navigator.clipboard.writeText("NORA15"); setCupaoCopiado(true); setTimeout(() => setCupaoCopiado(false), 3000); };
  const t = T[lang] || T.pt;
  const FOTO_FALLBACK = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=85";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --black:#0a0908;
          --white:#faf9f7;
          --cream:#f2efe9;
          --g1:#e8e4dd;
          --g2:#d4cfc7;
          --g4:#6b6560;
          --g6:#3a3530;
          --rosa:#b8697d;
          --rosa-deep:#9a4f63;
          --serif:'Cormorant Garamond',Georgia,serif;
          --sans:'Montserrat',Arial,sans-serif;
        }
        html{scroll-behavior:smooth}
        body{background:var(--white);color:var(--black);font-family:var(--sans);font-size:16px;font-weight:300;line-height:1.75;-webkit-font-smoothing:antialiased}
        @media(max-width:768px){body{padding-bottom:72px}}

        /* ── NAV ── */
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 3rem;transition:all 0.4s;background:transparent}
        .nav.scrolled{background:rgba(250,249,247,0.97);backdrop-filter:blur(24px);border-bottom:1px solid var(--g1);padding:0.9rem 3rem}
        .logo{display:flex;flex-direction:column;text-decoration:none;color:var(--white)}
        .logo.dark{color:var(--black)}
        .logo-name{font-family:var(--serif);font-size:1.5rem;font-weight:300;letter-spacing:0.3em;text-transform:uppercase;line-height:1}
        .logo-tag{font-size:0.48rem;letter-spacing:0.4em;text-transform:uppercase;opacity:0.5;margin-top:0.2rem}
        .nav-links{display:flex;align-items:center;gap:2.5rem;list-style:none}
        .nav-links a{font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.7);text-decoration:none;transition:color 0.2s}
        .nav.scrolled .nav-links a{color:var(--g4)}
        .nav-links a:hover{color:#fff}
        .nav.scrolled .nav-links a:hover{color:var(--black)}
        .nav-right{display:flex;align-items:center;gap:1rem}
        .nav-lang{display:flex;gap:0.2rem;align-items:center}
        .lang-btn{font-size:0.56rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.5);background:none;border:none;cursor:pointer;font-family:var(--sans);padding:0.15rem 0;transition:color 0.2s;font-weight:300}
        .lang-btn.on{color:#fff;font-weight:500}
        .nav.scrolled .lang-btn{color:var(--g4)}
        .nav.scrolled .lang-btn.on{color:var(--black);font-weight:500}
        .lang-sep{color:rgba(255,255,255,0.2);font-size:0.45rem;margin:0 0.15rem}
        .nav.scrolled .lang-sep{color:var(--g2)}
        .nb{font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;padding:0.55rem 1rem;text-decoration:none;font-family:var(--sans);font-weight:400;transition:all 0.25s;white-space:nowrap}
        .nb-o{color:rgba(255,255,255,0.8);border:1px solid rgba(255,255,255,0.3)}
        .nb-o:hover{color:#fff;border-color:#fff}
        .nav.scrolled .nb-o{color:var(--black);border-color:var(--g2)}
        .nav.scrolled .nb-o:hover{border-color:var(--black)}
        .nb-f{background:#fff;color:var(--black);border:1px solid #fff}
        .nb-f:hover{background:var(--cream);border-color:var(--cream)}
        .nav.scrolled .nb-f{background:var(--black);color:#fff;border-color:var(--black)}
        .nav.scrolled .nb-f:hover{background:var(--g6)}

        /* ── HERO ── */
        .hero{min-height:100svh;position:relative;display:flex;flex-direction:column;overflow:hidden}
        .hero-bg{position:absolute;inset:0;z-index:0}
        .hero-bg img{width:100%;height:100%;object-fit:cover;object-position:center top}
        .hero-overlay{position:absolute;inset:0;background:linear-gradient(160deg,rgba(10,9,8,0.45) 0%,rgba(10,9,8,0.15) 40%,rgba(10,9,8,0.75) 100%);z-index:1}
        .hero-content{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;flex:1;padding:3rem 2rem 4rem;color:#fff}
        .hero-eyebrow{font-size:0.56rem;letter-spacing:0.35em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:1.25rem}
        .hero-titulo{font-family:var(--serif);font-size:clamp(3.2rem,11vw,6.5rem);font-weight:300;line-height:0.97;color:#fff;letter-spacing:-0.01em}
        .hero-sub{font-family:var(--serif);font-size:clamp(3.2rem,11vw,6.5rem);font-weight:300;font-style:italic;color:rgba(255,255,255,0.55);line-height:0.97;letter-spacing:-0.01em;margin-bottom:2rem}
        .hero-desc{font-size:0.88rem;color:rgba(255,255,255,0.65);max-width:40ch;line-height:1.9;margin-bottom:2.5rem;font-weight:300}
        .hero-btns{display:flex;gap:1rem;flex-wrap:wrap}
        .hero-cta1{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;background:var(--rosa);color:#fff;padding:1rem 2.25rem;text-decoration:none;font-family:var(--sans);font-weight:400;transition:background 0.25s}
        .hero-cta1:hover{background:var(--rosa-deep)}
        .hero-cta2{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.6);text-decoration:none;padding:1rem 0;transition:color 0.2s;display:flex;align-items:center;gap:0.5rem}
        .hero-cta2:hover{color:#fff}
        .hero-cta2 span{display:inline-block;transition:transform 0.2s}
        .hero-cta2:hover span{transform:translateX(4px)}
        .hero-scroll{position:absolute;bottom:2rem;right:2rem;z-index:2;display:flex;flex-direction:column;align-items:center;gap:0.5rem}
        .hero-scroll-line{width:1px;height:48px;background:linear-gradient(to bottom,rgba(255,255,255,0),rgba(255,255,255,0.4));animation:scrollPulse 2s ease-in-out infinite}
        @keyframes scrollPulse{0%,100%{opacity:0.4;transform:scaleY(0.8)}50%{opacity:1;transform:scaleY(1)}}

        /* HERO DESKTOP — split layout */
        .hero-right-desktop{display:none}
        @media(min-width:769px){
          .hero{flex-direction:row;min-height:100svh}
          .hero-bg{display:none}
          .hero-overlay{display:none}
          .hero-content{color:var(--black);background:var(--white);flex:0 0 48%;justify-content:center;padding:9rem 5rem 5rem 7rem}
          .hero-eyebrow{color:var(--g4)}
          .hero-titulo{color:var(--black);font-size:clamp(3rem,4.2vw,5.5rem)}
          .hero-sub{color:var(--g4);font-size:clamp(3rem,4.2vw,5.5rem)}
          .hero-desc{color:var(--g6)}
          .hero-cta2{color:var(--g4)}
          .hero-cta2:hover{color:var(--black)}
          .hero-scroll{display:none}
          .hero-right-desktop{display:block;flex:0 0 52%;position:relative;overflow:hidden}
          .hero-right-desktop img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;transition:transform 7s ease}
          .hero-right-desktop:hover img{transform:scale(1.04)}
          .hero-caption{position:absolute;bottom:0;left:0;right:0;z-index:2;padding:2rem 2.5rem;background:linear-gradient(to top,rgba(10,9,8,0.7),transparent);color:#fff;display:flex;justify-content:space-between;align-items:flex-end}
          .hero-caption-nome{font-family:var(--serif);font-size:1.15rem;font-style:italic;font-weight:300;letter-spacing:0.02em}
          .hero-caption-preco{font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;opacity:0.7}
        }

        /* ── STRIP ── */
        .strip{background:var(--black);padding:0.85rem 0;overflow:hidden}
        .strip-track{display:flex;white-space:nowrap;animation:marquee 30s linear infinite}
        .strip-item{font-size:0.56rem;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.45);padding:0 3rem;flex-shrink:0}
        .strip-item::after{content:'—';margin-left:3rem;color:rgba(255,255,255,0.15)}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        /* ── QUICK ACCESS ── */
        .quick-access{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--g1)}
        .qa-item{padding:2rem 1.5rem 1.75rem;display:flex;flex-direction:column;gap:0.3rem;text-decoration:none;color:var(--black);transition:background 0.25s;position:relative;border-right:1px solid var(--g1);border-bottom:1px solid var(--g1)}
        .qa-item:nth-child(even){border-right:none}
        .qa-item:nth-last-child(-n+2){border-bottom:none}
        .qa-item:hover{background:var(--cream)}
        .qa-num{font-family:var(--serif);font-size:2rem;font-weight:300;color:var(--g1);line-height:1;margin-bottom:0.5rem;transition:color 0.25s}
        .qa-item:hover .qa-num{color:var(--rosa)}
        .qa-label{font-size:0.66rem;letter-spacing:0.18em;text-transform:uppercase;font-weight:500;color:var(--black)}
        .qa-desc{font-size:0.75rem;color:var(--g4);font-weight:300}
        .qa-arrow{position:absolute;right:1.25rem;bottom:1.25rem;font-size:0.8rem;color:var(--g2);transition:all 0.2s}
        .qa-item:hover .qa-arrow{color:var(--rosa);transform:translate(2px,-2px)}

        /* ── SECÇÕES GERAIS ── */
        .sec{padding:5rem 2rem}
        .sec-label{font-size:0.54rem;letter-spacing:0.35em;text-transform:uppercase;color:var(--rosa);margin-bottom:1rem;font-weight:400}
        .sec-titulo{font-family:var(--serif);font-size:clamp(2.2rem,6vw,3.8rem);font-weight:300;line-height:1.08;margin-bottom:2.5rem;letter-spacing:-0.01em}
        .sec-titulo em{font-style:italic;color:var(--g4)}

        /* ── COMO FUNCIONA ── */
        .como-grid{display:flex;flex-direction:column}
        .como-passo{padding:1.75rem 0;display:flex;gap:2rem;align-items:flex-start;border-bottom:1px solid var(--g1)}
        .como-passo:last-child{border-bottom:none}
        .como-num{font-family:var(--serif);font-size:3.5rem;font-weight:300;color:var(--g1);line-height:1;flex-shrink:0;width:60px;transition:color 0.25s}
        .como-passo:hover .como-num{color:var(--rosa)}
        .como-body{}
        .como-titulo{font-family:var(--serif);font-size:1.4rem;font-weight:300;margin-bottom:0.25rem;letter-spacing:0.01em}
        .como-desc{font-size:0.82rem;color:var(--g4);line-height:1.75;font-weight:300}

        /* ── PORQUE ── */
        .porque{background:var(--black);padding:5rem 2rem}
        .porque-label{font-size:0.54rem;letter-spacing:0.35em;text-transform:uppercase;color:var(--rosa);margin-bottom:1rem;font-weight:400}
        .porque-titulo{font-family:var(--serif);font-size:clamp(2rem,5.5vw,3.2rem);font-weight:300;line-height:1.12;color:#fff;margin-bottom:3rem;letter-spacing:-0.01em}
        .porque-titulo em{font-style:italic;color:rgba(255,255,255,0.35);display:block}
        .porque-ponto{display:flex;align-items:baseline;gap:1.25rem;padding:1.1rem 0;border-bottom:1px solid rgba(255,255,255,0.06)}
        .porque-ponto:last-child{border-bottom:none}
        .porque-idx{font-family:var(--serif);font-size:0.8rem;color:rgba(255,255,255,0.2);font-style:italic;flex-shrink:0;width:1.5rem}
        .porque-text{font-family:var(--serif);font-size:1.35rem;font-weight:300;color:rgba(255,255,255,0.8);letter-spacing:0.01em}

        /* ── CATEGORIAS ── */
        .cat-header{padding:4rem 2rem 2rem}
        .cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px}
        .cat-card{position:relative;overflow:hidden;aspect-ratio:4/5;text-decoration:none;display:block;background:var(--g1)}
        .cat-card img{width:100%;height:100%;object-fit:cover;transition:transform 0.7s ease}
        .cat-card:hover img{transform:scale(1.06)}
        .cat-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(10,9,8,0.8) 0%,rgba(10,9,8,0) 55%);display:flex;align-items:flex-end;padding:1.5rem}
        .cat-nome{font-family:var(--serif);font-size:1.5rem;font-weight:300;color:#fff;font-style:italic;letter-spacing:0.02em}

        /* ── NÚMEROS ── */
        .numeros{display:grid;grid-template-columns:repeat(2,1fr);background:var(--cream)}
        .numero{padding:3rem 1.5rem;text-align:center;border-right:1px solid var(--g1);border-bottom:1px solid var(--g1)}
        .numero:nth-child(even){border-right:none}
        .numero:nth-last-child(-n+2){border-bottom:none}
        .numero-val{font-family:var(--serif);font-size:3.2rem;font-weight:300;color:var(--rosa);line-height:1;margin-bottom:0.5rem;letter-spacing:-0.02em}
        .numero-label{font-size:0.56rem;letter-spacing:0.22em;text-transform:uppercase;color:var(--g4)}

        /* ── VÍDEO ── */
        .video-sec{padding:5rem 2rem;background:var(--black)}
        .video-header{margin-bottom:2.5rem}
        .video-label{font-size:0.54rem;letter-spacing:0.35em;text-transform:uppercase;color:var(--rosa);margin-bottom:0.75rem;font-weight:400}
        .video-titulo{font-family:var(--serif);font-size:clamp(1.8rem,5vw,2.8rem);font-weight:300;color:#fff;letter-spacing:-0.01em}
        .video-wrap{position:relative;width:100%;margin:0 auto;background:#111;cursor:pointer;overflow:hidden;display:flex;justify-content:center;align-items:center;min-height:200px}
        .video-wrap video{width:100%;display:block}
        .video-play-btn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;border:1px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;transition:all 0.25s;z-index:2;backdrop-filter:blur(4px)}
        .video-wrap:hover .video-play-btn{border-color:#fff;background:rgba(255,255,255,0.1)}
        .video-play-btn svg{width:20px;height:20px;fill:#fff;margin-left:3px}

        /* ── SUSTENTABILIDADE ── */
        .sustent{background:var(--white);padding:5rem 2rem}
        .sustent-stats{margin-top:2.5rem;display:flex;flex-direction:column;gap:1px}
        .sustent-stat{background:var(--cream);padding:1.75rem 2rem;display:flex;align-items:center;justify-content:space-between}
        .sustent-val{font-family:var(--serif);font-size:2.8rem;font-weight:300;color:var(--rosa);letter-spacing:-0.02em}
        .sustent-label{font-size:0.78rem;color:var(--g4);text-align:right;max-width:18ch;line-height:1.5;font-weight:300}

        /* ── CTA FINAL ── */
        .cta-final{padding:7rem 2rem;text-align:center;background:var(--black);color:#fff;position:relative;overflow:hidden}
        .cta-final::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(184,105,125,0.12) 0%,transparent 70%);pointer-events:none}
        .cta-final-titulo{font-family:var(--serif);font-size:clamp(2.8rem,9vw,5.5rem);font-weight:300;line-height:0.95;color:#fff;letter-spacing:-0.02em}
        .cta-final-sub{font-family:var(--serif);font-size:clamp(2.8rem,9vw,5.5rem);font-weight:300;font-style:italic;color:var(--rosa);line-height:0.95;letter-spacing:-0.02em;margin-bottom:0.75rem}
        .cta-final-tag{font-size:0.54rem;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:3rem;display:block}
        .cta-final-btn{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;background:var(--rosa);color:#fff;padding:1.1rem 3rem;text-decoration:none;font-family:var(--sans);font-weight:400;transition:background 0.25s;display:inline-block}
        .cta-final-btn:hover{background:var(--rosa-deep)}

        /* ── FOOTER ── */
        footer{padding:2.5rem 2rem;border-top:1px solid var(--g1);display:flex;flex-direction:column;gap:1.25rem}
        .footer-copy{font-size:0.6rem;color:var(--g4);letter-spacing:0.05em}
        .footer-links{display:flex;gap:1.75rem;flex-wrap:wrap;list-style:none}
        .footer-links a{font-size:0.58rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);text-decoration:none;transition:color 0.2s}
        .footer-links a:hover{color:var(--black)}

        /* ── BOTTOM NAV ── */
        .bnav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(250,249,247,0.97);backdrop-filter:blur(24px);border-top:1px solid var(--g1);padding:0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))}
        .bnav-inner{display:flex;justify-content:space-around;align-items:center}
        .bnav-item{display:flex;flex-direction:column;align-items:center;gap:0.2rem;text-decoration:none;color:var(--g4);background:none;border:none;cursor:pointer;padding:0.3rem 1rem;font-family:var(--sans)}
        .bnav-item.on{color:var(--black)}
        .bnav-icon svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
        .bnav-label{font-size:0.5rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:400}
        .bnav-dot{width:3px;height:3px;border-radius:50%;background:var(--rosa);margin-top:1px}

        /* ── CUPÃO ── */
        .cupao-banner{position:fixed;bottom:72px;left:0;right:0;z-index:150;background:var(--black);border-top:1px solid rgba(184,105,125,0.3);padding:1.25rem 2rem;animation:slideUp 0.5s cubic-bezier(0.16,1,0.3,1)}
        @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        .cupao-inner{display:flex;flex-direction:column;gap:0.75rem}
        .cupao-texto{font-size:0.72rem;color:rgba(255,255,255,0.6);letter-spacing:0.05em}
        .cupao-codigo{font-family:var(--serif);font-size:2rem;font-weight:300;color:#fff;letter-spacing:0.2em}
        .cupao-actions{display:flex;gap:0.75rem;align-items:center}
        .cupao-btn{font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;background:var(--rosa);color:#fff;border:none;padding:0.65rem 1.5rem;cursor:pointer;font-family:var(--sans);font-weight:400;flex:1;transition:background 0.2s}
        .cupao-btn:hover{background:var(--rosa-deep)}
        .cupao-fechar{background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:1rem;padding:0;flex-shrink:0;transition:color 0.2s}
        .cupao-fechar:hover{color:rgba(255,255,255,0.8)}

        /* ── DESKTOP OVERRIDES ── */
        @media(min-width:769px){
          .sec{padding:8rem 7rem}
          .cat-header{padding:7rem 7rem 3rem}
          .quick-access{grid-template-columns:repeat(4,1fr)}
          .qa-item:nth-child(even){border-right:1px solid var(--g1)}
          .qa-item:nth-child(4){border-right:none}
          .numeros{grid-template-columns:repeat(4,1fr)}
          .numero:nth-child(even){border-right:1px solid var(--g1)}
          .numero:nth-child(4){border-right:none}
          .numero:nth-last-child(-n+2){border-bottom:1px solid var(--g1)}
          .numero:last-child{border-bottom:none}
          .porque{padding:8rem 7rem;display:grid;grid-template-columns:1fr 1fr;gap:8rem;align-items:center}
          .cat-grid{grid-template-columns:repeat(4,1fr);gap:4px}
          .cat-card{aspect-ratio:2/3}
          .como-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid var(--g1)}
          .como-passo{flex-direction:column;padding:2.5rem 2rem;border-bottom:none;border-right:1px solid var(--g1)}
          .como-passo:last-child{border-right:none}
          .como-num{width:auto;font-size:4rem}
          .sustent{padding:8rem 7rem}
          .sustent-inner{display:grid;grid-template-columns:1fr 1fr;gap:7rem;align-items:start}
          .sustent-stats{margin-top:0}
          .video-sec{padding:8rem 7rem}
          .cta-final{padding:12rem 7rem}
          footer{flex-direction:row;justify-content:space-between;align-items:center;padding:2.5rem 7rem}
          .cupao-banner{bottom:0;padding:1.25rem 7rem}
          .cupao-inner{flex-direction:row;align-items:center;justify-content:space-between}
          .cupao-actions{flex:0}
          .nav{padding:1.5rem 3.5rem}
          .nav.scrolled{padding:1rem 3.5rem}
        }
        @media(max-width:768px){
          .bnav{display:block}
          .nav-links,.nav-right .nb-o,.nav-right .nb-f{display:none}
          .nav{padding:1rem 1.5rem}
          .nav.scrolled{padding:0.85rem 1.5rem}
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* CUPÃO */}
      {banner && (
        <div className="cupao-banner">
          <div className="cupao-inner">
            <div>
              <div className="cupao-texto">{t.cupao.texto}</div>
              <div className="cupao-codigo">NORA15</div>
            </div>
            <div className="cupao-actions">
              <button className="cupao-btn" onClick={copiarCupao}>{cupaoCopiado ? t.cupao.copiado : t.cupao.copiar}</button>
              <button className="cupao-fechar" onClick={() => { setBanner(false); localStorage.setItem("ng_banner_cupao","1"); }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <a href="/" className={`logo${scrolled ? " dark" : ""}`}>
          <span className="logo-name">Nora Grei</span>
          <span className="logo-tag">Alugar · Comprar</span>
        </a>
        <ul className="nav-links">
          <li><a href="/catalogo">{t.nav.catalogo}</a></li>
          <li><a href="#como">{t.nav.comoFunciona}</a></li>
        </ul>
        <div className="nav-right">
          <div className="nav-lang">
            {["pt","fr","lt"].map((l, i) => (
              <span key={l} style={{display:"flex",alignItems:"center"}}>
                {i > 0 && <span className="lang-sep">/</span>}
                <button className={"lang-btn" + (lang === l ? " on" : "")} onClick={() => changeLang(l)}>{l.toUpperCase()}</button>
              </span>
            ))}
          </div>
          {userLogado && <a href="/pedidos" className="nb nb-o">{t.nav.pedidos}</a>}
          <a href={userLogado ? "/perfil" : "/entrar"} className="nb nb-o">{userLogado ? t.nav.perfil : t.nav.entrar}</a>
          <a href="/catalogo" className="nb nb-f">{t.hero.cta1}</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <img src={heroPeca && heroPeca.fotos ? heroPeca.fotos[0] : FOTO_FALLBACK} alt="" />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">{t.hero.eyebrow}</p>
          <h1 className="hero-titulo">{t.hero.titulo}</h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <p className="hero-desc">{t.hero.desc}</p>
          <div className="hero-btns">
            <a href="/catalogo" className="hero-cta1">{t.hero.cta1}</a>
            <a href="#como" className="hero-cta2">{t.hero.cta2} <span>→</span></a>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="hero-scroll-line" />
        </div>
        <div className="hero-right-desktop">
          <img src={heroPeca && heroPeca.fotos ? heroPeca.fotos[0] : FOTO_FALLBACK} alt={heroPeca ? heroPeca.nome : "Nora Grei"} />
          <div className="hero-caption">
            <span className="hero-caption-nome">{heroPeca ? heroPeca.nome : "Vestido Seda Noite"}</span>
            <span className="hero-caption-preco">{heroPeca && heroPeca.preco_aluguer_dia ? heroPeca.preco_aluguer_dia + "€ / dia" : "35€ / dia"}</span>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="strip">
        <div className="strip-track">
          {[...Array(4)].map((_, i) => t.strip.map((item, j) => (
            <span key={i + "-" + j} className="strip-item">{item}</span>
          )))}
        </div>
      </div>

      {/* QUICK ACCESS */}
      <div className="quick-access">
        {t.quickAccess.map((item, idx) => {
          const hrefs = ["/catalogo", userLogado ? "/perfil" : "/entrar", "/catalogo", "https://www.noragrei.com"];
          const href = hrefs[idx];
          const label = idx === 1 ? (userLogado ? item.label : item.labelGuest) : item.label;
          const desc = idx === 1 ? (userLogado ? item.desc : item.descGuest) : item.desc;
          const nums = ["I","II","III","IV"];
          return (
            <a key={idx} href={href} className="qa-item"
              target={href && href.indexOf("http") === 0 ? "_blank" : undefined}
              rel={href && href.indexOf("http") === 0 ? "noopener noreferrer" : undefined}>
              <div className="qa-num">{nums[idx]}</div>
              <div className="qa-label">{label}</div>
              <div className="qa-desc">{desc}</div>
              <span className="qa-arrow">↗</span>
            </a>
          );
        })}
      </div>

      {/* CATEGORIAS */}
      <div className="cat-header">
        <p className="sec-label">{t.categorias.label}</p>
        <h2 className="sec-titulo">{t.categorias.titulo}<br /><em>{t.categorias.tituloSub}</em></h2>
      </div>
      <div className="cat-grid">
        {CAT_KEYS.map((key, i) => (
          <a key={i} href="/catalogo" className="cat-card">
            {categoriaFotos[key] ? (
              <img src={categoriaFotos[key]} alt={t.categorias.nomes[key]} />
            ) : (
              <div style={{width:"100%",height:"100%",background:"linear-gradient(160deg,var(--g1),var(--g2))",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontFamily:"var(--serif)",fontSize:"3rem",fontWeight:300,color:"rgba(0,0,0,0.06)",fontStyle:"italic"}}>NG</span>
              </div>
            )}
            <div className="cat-overlay"><span className="cat-nome">{t.categorias.nomes[key]}</span></div>
          </a>
        ))}
      </div>

      {/* COMO FUNCIONA */}
      <section className="sec" id="como" style={{background:"var(--white)"}}>
        <p className="sec-label">{t.como.label}</p>
        <h2 className="sec-titulo">{t.como.titulo}</h2>
        <div className="como-grid">
          {t.como.passos.map((p, i) => (
            <div key={i} className="como-passo">
              <div className="como-num">{p.num}</div>
              <div className="como-body">
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
          <p className="porque-label">{t.missaoLabel}</p>
          <h2 className="porque-titulo">{t.porque.titulo}<em>{t.porque.tituloSub}</em></h2>
        </div>
        <div>
          {t.porque.pontos.map((p, i) => (
            <div key={i} className="porque-ponto">
              <span className="porque-idx">{String(i + 1).padStart(2,"0")}</span>
              <span className="porque-text">{p}</span>
            </div>
          ))}
        </div>
      </section>

      {/* NÚMEROS */}
      <div className="numeros">
        {t.numeros.map((n, i) => (
          <div key={i} className="numero">
            <div className="numero-val">{n.val}</div>
            <div className="numero-label">{n.label}</div>
          </div>
        ))}
      </div>

      {/* VÍDEO — só aparece se houver URL */}
      {videoUrl && (
        <section className="video-sec">
          <div className="video-header">
            <p className="video-label">{t.video.label}</p>
            <h2 className="video-titulo">{t.video.titulo}</h2>
          </div>
          <div className="video-wrap" onClick={(e) => {
            const v = e.currentTarget.querySelector("video");
            if (v) { if (videoPlaying) v.pause(); else v.play(); setVideoPlaying(!videoPlaying); }
          }}>
            <video src={videoUrl} loop playsInline />
            {!videoPlaying && (
              <div className="video-play-btn">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SUSTENTABILIDADE */}
      <section className="sustent">
        <p className="sec-label">{t.sustentabilidade.label}</p>
        <div className="sustent-inner">
          <h2 className="sec-titulo" style={{marginBottom:0}}>{t.sustentabilidade.titulo}</h2>
          <div className="sustent-stats">
            {t.sustentabilidade.stats.map((s, i) => (
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
          {t.footer.links.map((l, i) => <li key={i}><a href="#">{l}</a></li>)}
        </ul>
      </footer>

      {/* BOTTOM NAV */}
      <nav className="bnav">
        <div className="bnav-inner">
          {[
            { href:"/", label:t.bottomNav.inicio, on:true, icon:<svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
            { href:"/catalogo", label:t.bottomNav.catalogo, on:false, icon:<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
            { href:userLogado ? "/pedidos" : "/entrar", label:t.bottomNav.pedidos, on:false, icon:<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
            { href:userLogado ? "/perfil" : "/entrar", label:t.bottomNav.perfil, on:false, icon:<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          ].map((item, i) => (
            <a key={i} href={item.href} className={"bnav-item" + (item.on ? " on" : "")}>
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