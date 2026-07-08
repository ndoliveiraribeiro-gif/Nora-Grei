"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const T = {
  pt: {
    nav: { catalogo: "Colecção", comoFunciona: "Como funciona", entrar: "Entrar", pedidos: "Pedidos", perfil: "Perfil" },
    hero: { eyebrow: "Nova colecção — Primavera 2026", titulo: "Veste o extraordinário.", sub: "Sem comprar.", desc: "Aluga peças exclusivas da Nora Grei e renova o teu guarda-roupa sempre que quiseres.", cta1: "Explorar colecção", cta2: "Como funciona" },
    video: { label: "A experiência Nora Grei", titulo: "Vê como funciona." },
    como: { label: "O processo", titulo: "Moda sem compromisso.", passos: [
      { num: "01", titulo: "Escolhe", desc: "Explora a colecção e reserva a peça dos teus sonhos." },
      { num: "02", titulo: "Recebe", desc: "Entregamos em casa, limpa e pronta a usar." },
      { num: "03", titulo: "Usa", desc: "Vive cada momento com estilo único." },
      { num: "04", titulo: "Devolve ou troca", desc: "Renova o teu guarda-roupa sem acumular." },
    ]},
    categorias: { label: "Para cada momento", titulo: "O look certo,", tituloSub: "para cada ocasião.", lista: ["Festa", "Trabalho", "Férias", "Jantar"] },
    porque: { label: "A nossa missão", titulo: "Porque a moda deve acompanhar a tua vida,", tituloSub: "não ocupar o teu armário.", pontos: ["Menos desperdício.", "Mais exclusividade.", "Mais liberdade.", "Moda consciente."] },
    numeros: [{ val:"1.000+",label:"Alugueres realizados" },{ val:"200+",label:"Peças exclusivas" },{ val:"4.9★",label:"Avaliação média" },{ val:"48h",label:"Entrega rápida" }],
    sustentabilidade: { label:"Moda consciente", titulo:"Cada peça vive várias histórias.", stats:[{ val:"70%",label:"Água poupada vs comprar" },{ val:"5×",label:"Reutilizações por peça" },{ val:"60%",label:"Emissões reduzidas" }] },
    cta: { titulo:"O teu guarda-roupa infinito", sub:"começa aqui.", btn:"Explorar colecção", tag:"Moda exclusiva. Sem excessos." },
    strip: ["Envio gratuito", "Depósito 100% devolvido", "Peças inspecionadas", "Cancele quando quiser", "Moda consciente"],
    footer: { copy:"© 2026 Nora Grei. Todos os direitos reservados.", links:["Colecção","Como funciona","Contacto","Termos","Privacidade"] },
    bottomNav: { inicio:"Início", catalogo:"Colecção", pedidos:"Pedidos", perfil:"Perfil" },
    quickAccess: [
      { icon:"✦", label:"Ver colecção", desc:"Todas as peças" },
      { icon:"◉", label: "Perfil", labelGuest: "Entrar", desc: "Pedidos e níveis", descGuest: "Cria conta" },
      { icon:"◎", label:"Alugar agora", desc:"Desde 25€/dia" },
      { icon:"↗", label:"Comprar", desc:"Loja Nora Grei" },
    ],
    missaoLabel: "A nossa missão",
    videoEmBreve: "Vídeo em breve",
    logoTag: "Alugar ou Comprar",
    catNomes: { Festa: "Festa", Trabalho: "Trabalho", "Férias": "Férias", Jantar: "Jantar" },
    cupao: { texto: "Oferta de boas-vindas — 15% de desconto em noragrei.com", copiar: "Copiar código", copiado: "Copiado ✓" },
  },
  fr: {
    nav: { catalogo: "Collection", comoFunciona: "Comment ça marche", entrar: "Connexion", pedidos: "Commandes", perfil: "Profil" },
    hero: { eyebrow: "Nouvelle collection — Printemps 2026", titulo: "Habillez l'extraordinaire.", sub: "Sans acheter.", desc: "Louez des pièces exclusives Nora Grei et renouvelez votre garde-robe à volonté.", cta1: "Explorer la collection", cta2: "Comment ça marche" },
    video: { label: "L'expérience Nora Grei", titulo: "Découvrez comment ça marche." },
    como: { label: "Le processus", titulo: "La mode sans engagement.", passos: [
      { num: "01", titulo: "Choisissez", desc: "Explorez la collection et réservez la pièce de vos rêves." },
      { num: "02", titulo: "Recevez", desc: "Livré chez vous, propre et prêt à porter." },
      { num: "03", titulo: "Portez", desc: "Vivez chaque moment avec style." },
      { num: "04", titulo: "Retournez ou échangez", desc: "Renouvelez votre garde-robe sans accumuler." },
    ]},
    categorias: { label: "Pour chaque moment", titulo: "Le look parfait,", tituloSub: "pour chaque occasion.", lista: ["Festa", "Trabalho", "Férias", "Jantar"] },
    porque: { label: "Notre mission", titulo: "Parce que la mode doit suivre votre vie,", tituloSub: "pas occuper votre placard.", pontos: ["Moins de gaspillage.", "Plus d'exclusivité.", "Plus de liberté.", "Mode responsable."] },
    numeros: [{ val:"1.000+",label:"Locations réalisées" },{ val:"200+",label:"Pièces exclusives" },{ val:"4.9★",label:"Note moyenne" },{ val:"48h",label:"Livraison rapide" }],
    sustentabilidade: { label:"Mode responsable", titulo:"Chaque pièce vit plusieurs histoires.", stats:[{ val:"70%",label:"Eau économisée vs achat" },{ val:"5×",label:"Réutilisations par pièce" },{ val:"60%",label:"Émissions réduites" }] },
    cta: { titulo:"Votre garde-robe infinie", sub:"commence ici.", btn:"Explorer la collection", tag:"Mode exclusive. Sans excès." },
    strip: ["Livraison gratuite", "Dépôt 100% remboursé", "Pièces inspectées", "Annulez à tout moment", "Mode responsable"],
    footer: { copy:"© 2026 Nora Grei. Tous droits réservés.", links:["Collection","Comment ça marche","Contact","Conditions","Confidentialité"] },
    bottomNav: { inicio:"Accueil", catalogo:"Collection", pedidos:"Commandes", perfil:"Profil" },
    quickAccess: [
      { icon:"✦", label:"Voir la collection", desc:"Toutes les pièces" },
      { icon:"◉", label: "Profil", labelGuest: "Connexion", desc: "Commandes et niveaux", descGuest: "Créer un compte" },
      { icon:"◎", label:"Louer maintenant", desc:"Dès 25€/jour" },
      { icon:"↗", label:"Acheter", desc:"Boutique Nora Grei" },
    ],
    missaoLabel: "Notre mission",
    videoEmBreve: "Vidéo bientôt disponible",
    logoTag: "Louer ou Acheter",
    catNomes: { Festa: "Soirée", Trabalho: "Travail", "Férias": "Vacances", Jantar: "Dîner" },
    cupao: { texto: "Offre de bienvenue — 15% de réduction sur noragrei.com", copiar: "Copier le code", copiado: "Copié ✓" },
  },
  lt: {
    nav: { catalogo: "Kolekcija", comoFunciona: "Kaip tai veikia", entrar: "Prisijungti", pedidos: "Užsakymai", perfil: "Profilis" },
    hero: { eyebrow: "Nauja kolekcija — 2026 pavasaris", titulo: "Apsirenkite išskirtinai.", sub: "Nepirkdami.", desc: "Nuomokitės išskirtinius Nora Grei drabužius ir atnaujinkite savo spintą kada panorėję.", cta1: "Naršyti kolekciją", cta2: "Kaip tai veikia" },
    video: { label: "Nora Grei patirtis", titulo: "Pažiūrėkite, kaip tai veikia." },
    como: { label: "Procesas", titulo: "Mada be įsipareigojimų.", passos: [
      { num: "01", titulo: "Pasirinkite", desc: "Naršykite kolekciją ir rezervuokite svajonių drabužį." },
      { num: "02", titulo: "Gaukite", desc: "Pristatome į namus, švarų ir paruoštą dėvėti." },
      { num: "03", titulo: "Dėvėkite", desc: "Gyvenkite kiekvieną akimirką su savitu stiliumi." },
      { num: "04", titulo: "Grąžinkite arba keiskite", desc: "Atnaujinkite spintą nekraudami daiktų." },
    ]},
    categorias: { label: "Kiekvienai akimirkai", titulo: "Tinkamas stilius,", tituloSub: "kiekvienai progai.", lista: ["Festa", "Trabalho", "Férias", "Jantar"] },
    porque: { label: "Mūsų misija", titulo: "Nes mada turi atitikti jūsų gyvenimą,", tituloSub: "o ne užimti jūsų spintą.", pontos: ["Mažiau švaistymo.", "Daugiau išskirtinumo.", "Daugiau laisvės.", "Sąmoninga mada."] },
    numeros: [{ val:"1.000+",label:"Įvykdytų nuomų" },{ val:"200+",label:"Išskirtinių drabužių" },{ val:"4.9★",label:"Vidutinis įvertinimas" },{ val:"48h",label:"Greitas pristatymas" }],
    sustentabilidade: { label:"Sąmoninga mada", titulo:"Kiekvienas drabužis turi kelias istorijas.", stats:[{ val:"70%",label:"Sutaupyto vandens vs pirkimas" },{ val:"5×",label:"Pakartotiniai naudojimai" },{ val:"60%",label:"Sumažintos emisijos" }] },
    cta: { titulo:"Jūsų begalinė spinta", sub:"prasideda čia.", btn:"Naršyti kolekciją", tag:"Išskirtinė mada. Be perteklių." },
    strip: ["Nemokamas pristatymas", "100% grąžinamas užstatas", "Patikrinti drabužiai", "Atšaukite bet kada", "Sąmoninga mada"],
    footer: { copy:"© 2026 Nora Grei. Visos teisės saugomos.", links:["Kolekcija","Kaip tai veikia","Kontaktai","Sąlygos","Privatumas"] },
    bottomNav: { inicio:"Pradžia", catalogo:"Kolekcija", pedidos:"Užsakymai", perfil:"Profilis" },
    quickAccess: [
      { icon:"✦", label:"Žiūrėti kolekciją", desc:"Visi drabužiai" },
      { icon:"◉", label: "Profilis", labelGuest: "Prisijungti", desc: "Užsakymai ir lygiai", descGuest: "Sukurti paskyrą" },
      { icon:"◎", label:"Nuomoti dabar", desc:"Nuo 25€/dieną" },
      { icon:"↗", label:"Pirkti", desc:"Nora Grei parduotuvė" },
    ],
    missaoLabel: "Mūsų misija",
    videoEmBreve: "Vaizdo įrašas greitai",
    logoTag: "Nuomoti ar Pirkti",
    catNomes: { Festa: "Vakarėlis", Trabalho: "Darbas", "Férias": "Atostogos", Jantar: "Vakarienė" },
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
    if (saved && T[saved]) setLang(saved); else setLang("pt");
    supabase.auth.getSession().then(({ data }) => { if (data.session) setUserLogado(true); });
    const visto = localStorage.getItem("ng_banner_cupao");
    if (!visto) { setTimeout(() => { setBanner(true); setTimeout(() => { setBanner(false); localStorage.setItem("ng_banner_cupao","1"); }, 8000); }, 2000); }
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    carregarConteudo();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const aplicarHeroAutomatico = (todasPecas) => {
    const destaque = todasPecas.find(function (p) { return p.destaque && p.fotos && p.fotos[0]; });
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
      const escolhida = todasPecas.find(function (p) { return p.id === cfg.hero_peca_id; });
      if (escolhida && escolhida.fotos && escolhida.fotos[0]) {
        setHeroPeca(escolhida);
      } else {
        aplicarHeroAutomatico(todasPecas);
      }
    } else if (todasPecas) {
      aplicarHeroAutomatico(todasPecas);
    }

    if (todasPecas) {
      const mapa = {};
      const mapaCampos = {
        Festa: cfg ? cfg.categoria_festa_peca_id : null,
        Trabalho: cfg ? cfg.categoria_trabalho_peca_id : null,
        Férias: cfg ? cfg.categoria_ferias_peca_id : null,
        Jantar: cfg ? cfg.categoria_jantar_peca_id : null,
      };
      const ocasioesAlvo = ["Festa", "Trabalho", "Férias", "Jantar"];

      ocasioesAlvo.forEach(function (oc) {
        const idEscolhido = mapaCampos[oc];
        if (idEscolhido) {
          const escolhida = todasPecas.find(function (p) { return p.id === idEscolhido; });
          if (escolhida && escolhida.fotos && escolhida.fotos[0]) {
            mapa[oc] = escolhida.fotos[0];
            return;
          }
        }
        const encontrada = todasPecas.find(function (p) { return p.ocasioes && p.ocasioes.includes(oc) && p.fotos && p.fotos[0]; });
        if (encontrada) mapa[oc] = encontrada.fotos[0];
      });

      const restantes = todasPecas.filter(function (p) { return p.fotos && p.fotos[0]; });
      let idx = 0;
      ocasioesAlvo.forEach(function (oc) {
        if (!mapa[oc] && restantes[idx]) { mapa[oc] = restantes[idx].fotos[0]; idx++; }
      });
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g4:#5a5855;--rosa:#c4748a;--serif:'Cormorant Garamond',Georgia,serif;--sans:'Jost',Arial,sans-serif}
        html{scroll-behavior:smooth}
        body{background:var(--white);color:var(--black);font-family:var(--sans);font-size:17px;font-weight:400;line-height:1.7;-webkit-font-smoothing:antialiased}
        @media(max-width:768px){body{padding-bottom:72px}}
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

        .hero{min-height:90svh;position:relative;display:flex;flex-direction:column;overflow:hidden;padding-top:72px}
        .hero-bg{position:absolute;inset:0;z-index:0}
        .hero-bg img{width:100%;height:100%;object-fit:cover;object-position:center top;filter:brightness(0.55)}
        .hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,8,8,0.2) 0%,rgba(8,8,8,0.65) 60%,rgba(8,8,8,0.85) 100%);z-index:1}
        .hero-content{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;flex:1;padding:2.5rem 1.5rem 3rem;color:#fff}
        .hero-eyebrow{font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:1rem}
        .hero-titulo{font-family:var(--serif);font-size:clamp(2.8rem,9.5vw,5.5rem);font-weight:300;line-height:1.02;color:#fff}
        .hero-sub{font-family:var(--serif);font-size:clamp(2.8rem,9.5vw,5.5rem);font-weight:300;font-style:italic;color:rgba(255,255,255,0.65);line-height:1.02;margin-bottom:1.5rem}
        .hero-desc{font-size:0.95rem;color:rgba(255,255,255,0.75);max-width:45ch;line-height:1.8;margin-bottom:2rem}
        .hero-btns{display:flex;gap:0.75rem;flex-wrap:wrap}
        .hero-cta1{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;background:var(--rosa);color:#fff;padding:1rem 2rem;text-decoration:none;font-family:var(--sans);font-weight:500;transition:background 0.2s;flex:1;text-align:center;max-width:220px}
        .hero-cta1:hover{background:#a85c72}
        .hero-cta2{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.7);text-decoration:none;border:1px solid rgba(255,255,255,0.3);padding:1rem 1.5rem;transition:all 0.2s;flex:1;text-align:center;max-width:180px}
        .hero-cta2:hover{color:#fff;border-color:#fff}

        .video-sec{padding:4rem 1.5rem;background:var(--black)}
        .video-header{text-align:center;margin-bottom:2rem}
        .video-label{font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--rosa);margin-bottom:0.6rem;font-weight:500}
        .video-titulo{font-family:var(--serif);font-size:clamp(1.8rem,5vw,2.5rem);font-weight:300;color:#fff}
        .video-wrap{position:relative;width:fit-content;max-width:100%;margin:0 auto;background:#1a1a1a;cursor:pointer;overflow:hidden;border-radius:2px;display:flex;justify-content:center}
        .video-wrap video{width:100%;height:100%;object-fit:contain;background:#000}
        .video-play-btn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;transition:transform 0.2s;z-index:2}
        .video-wrap:hover .video-play-btn{transform:translate(-50%,-50%) scale(1.08)}
        .video-play-btn svg{width:26px;height:26px;fill:var(--black);margin-left:3px}
        .video-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;color:rgba(255,255,255,0.3)}

        .strip{background:var(--rosa);padding:0.75rem 0;overflow:hidden}
        .strip-track{display:flex;white-space:nowrap;animation:marquee 25s linear infinite}
        .strip-item{font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.9);padding:0 2.5rem;flex-shrink:0}
        .strip-item::after{content:'✦';margin-left:2.5rem;color:rgba(255,255,255,0.4)}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        .quick-access{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--g2)}
        .qa-item{background:var(--white);padding:1.5rem 1.25rem;display:flex;flex-direction:column;gap:0.35rem;text-decoration:none;color:var(--black);transition:background 0.2s;position:relative;overflow:hidden;border:none}
        .qa-item:hover{background:var(--g1)}
        .qa-arrow{position:absolute;right:1rem;top:50%;transform:translateY(-50%);font-size:0.9rem;color:var(--g2);transition:all 0.25s;font-family:var(--sans)}
        .qa-item:hover .qa-arrow{color:var(--rosa);right:0.75rem}
        .qa-label{font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;font-weight:500;padding-right:1.5rem}
        .qa-desc{font-size:0.75rem;color:var(--g4);font-weight:300}

        .sec{padding:4.5rem 1.5rem}
        .sec-label{font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--rosa);margin-bottom:0.75rem;font-weight:500}
        .sec-titulo{font-family:var(--serif);font-size:clamp(2rem,6vw,3.5rem);font-weight:300;line-height:1.1;margin-bottom:2rem}
        .sec-titulo em{font-style:italic;color:var(--g4)}

        .como-grid{display:flex;flex-direction:column;gap:1px;background:var(--g2)}
        .como-passo{background:var(--white);padding:1.75rem 1.5rem;display:flex;gap:1.5rem;align-items:flex-start;transition:background 0.2s}
        .como-passo:hover{background:var(--g1)}
        .como-num-wrap{flex-shrink:0;width:48px;height:48px;background:var(--rosa);display:flex;align-items:center;justify-content:center}
        .como-num{font-family:var(--serif);font-size:1.2rem;font-weight:300;color:#fff}
        .como-titulo{font-family:var(--serif);font-size:1.3rem;font-weight:400;margin-bottom:0.3rem}
        .como-desc{font-size:0.88rem;color:var(--g4);line-height:1.6}

        .porque{background:linear-gradient(135deg,#080808 0%,#1a0a10 100%);padding:4.5rem 1.5rem}
        .porque-titulo{font-family:var(--serif);font-size:clamp(1.8rem,5vw,2.8rem);font-weight:300;line-height:1.2;color:#fff;margin-bottom:2.5rem}
        .porque-titulo em{font-style:italic;color:rgba(255,255,255,0.4);display:block}
        .porque-ponto{display:flex;align-items:center;gap:1rem;padding:1rem 0;border-bottom:1px solid rgba(255,255,255,0.08)}
        .porque-ponto:last-child{border-bottom:none}
        .porque-dot{width:8px;height:8px;border-radius:50%;background:var(--rosa);flex-shrink:0}
        .porque-text{font-family:var(--serif);font-size:1.3rem;font-weight:300;color:rgba(255,255,255,0.85)}

        .cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:var(--white)}
        .cat-card{position:relative;overflow:hidden;aspect-ratio:1/1;text-decoration:none;display:block;background:var(--g1)}
        .cat-card img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease}
        .cat-card:hover img{transform:scale(1.05)}
        .cat-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,8,0.75) 0%,transparent 50%);display:flex;align-items:flex-end;padding:1.25rem}
        .cat-nome{font-family:var(--serif);font-size:1.4rem;font-weight:300;color:#fff;font-style:italic}

        .numeros{display:grid;grid-template-columns:repeat(2,1fr);background:var(--black)}
        .numero{padding:2.5rem 1.5rem;text-align:center;border-right:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08)}
        .numero:nth-child(even){border-right:none}
        .numero-val{font-family:var(--serif);font-size:3rem;font-weight:300;color:var(--rosa);line-height:1;margin-bottom:0.4rem}
        .numero-label{font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4)}

        .sustent{background:var(--g1);padding:4.5rem 1.5rem}
        .sustent-stat{background:var(--white);padding:1.5rem;margin-bottom:1px;display:flex;align-items:center;justify-content:space-between;border-left:3px solid var(--rosa)}
        .sustent-val{font-family:var(--serif);font-size:2.5rem;font-weight:300;color:var(--rosa)}
        .sustent-label{font-size:0.82rem;color:var(--g4);text-align:right;max-width:20ch}

        .cta-final{padding:5rem 1.5rem;text-align:center;background:var(--black);color:#fff}
        .cta-final-titulo{font-family:var(--serif);font-size:clamp(2.5rem,8vw,5rem);font-weight:300;line-height:1;color:#fff}
        .cta-final-sub{font-family:var(--serif);font-size:clamp(2.5rem,8vw,5rem);font-weight:300;font-style:italic;color:var(--rosa);line-height:1;margin-bottom:0.75rem}
        .cta-final-tag{font-size:0.65rem;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:2.5rem;display:block}
        .cta-final-btn{font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;background:var(--rosa);color:#fff;padding:1.1rem 3rem;text-decoration:none;font-family:var(--sans);transition:background 0.2s;display:inline-block}
        .cta-final-btn:hover{background:#a85c72}

        footer{padding:2rem 1.5rem;border-top:1px solid var(--g2);display:flex;flex-direction:column;gap:1rem}
        .footer-copy{font-size:0.65rem;color:var(--g4)}
        .footer-links{display:flex;gap:1.5rem;flex-wrap:wrap;list-style:none}
        .footer-links a{font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--g4);text-decoration:none}

        .bnav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-top:1px solid var(--g2);padding:0.6rem 0 calc(0.6rem + env(safe-area-inset-bottom))}
        .bnav-inner{display:flex;justify-content:space-around;align-items:center}
        .bnav-item{display:flex;flex-direction:column;align-items:center;gap:0.2rem;text-decoration:none;color:var(--g4);background:none;border:none;cursor:pointer;padding:0.2rem 1rem;font-family:var(--sans)}
        .bnav-item.on{color:var(--black)}
        .bnav-icon svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
        .bnav-label{font-size:0.55rem;letter-spacing:0.1em;text-transform:uppercase}
        .bnav-dot{width:3px;height:3px;border-radius:50%;background:var(--rosa)}

        .cupao-banner{position:fixed;bottom:72px;left:0;right:0;z-index:150;background:var(--rosa);padding:1rem 1.5rem;animation:slideUp 0.4s ease}
        @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        .cupao-inner{display:flex;flex-direction:column;gap:0.75rem}
        .cupao-texto{font-size:0.82rem;color:#fff;font-weight:500}
        .cupao-codigo{font-family:var(--serif);font-size:1.8rem;font-weight:300;color:#fff;letter-spacing:0.15em}
        .cupao-actions{display:flex;gap:0.75rem;align-items:center}
        .cupao-btn{font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;background:#fff;color:var(--rosa);border:none;padding:0.6rem 1.25rem;cursor:pointer;font-family:var(--sans);font-weight:600;flex:1}
        .cupao-fechar{background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;font-size:1.2rem;padding:0;flex-shrink:0}

        @media(min-width:769px){
          .hero{flex-direction:row;padding-top:80px;min-height:82vh}
          .hero-bg{display:none}
          .hero-overlay{display:none}
          .hero-content{color:var(--black);background:var(--white);flex:1;justify-content:center;padding:5rem 4rem 5rem 6rem}
          .hero-eyebrow{color:var(--g4)}
          .hero-titulo{color:var(--black);font-size:clamp(3rem,4.5vw,5rem)}
          .hero-sub{color:var(--g4);font-size:clamp(3rem,4.5vw,5rem)}
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
          .video-sec{padding:6rem 6rem}
          .quick-access{grid-template-columns:repeat(4,1fr)}
          .numeros{grid-template-columns:repeat(4,1fr)}
          .numero{padding:3rem 2rem}
          .numero:nth-child(even){border-right:1px solid rgba(255,255,255,0.08)}
          .sec{padding:7rem 6rem}
          .como-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px}
          .porque{display:grid;grid-template-columns:1fr 1fr;gap:6rem;padding:7rem 6rem;align-items:center}
          .cat-grid{grid-template-columns:repeat(4,1fr);gap:8px}
          .cat-card{aspect-ratio:3/4}
          .sustent{padding:7rem 6rem}
          .sustent-inner{display:grid;grid-template-columns:1fr 1fr;gap:6rem;align-items:center;margin-top:3rem}
          .cta-final{padding:10rem 6rem}
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

      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />

      {banner && (
        <div className="cupao-banner">
          <div className="cupao-inner">
            <div>
              <div className="cupao-texto">{t.cupao ? t.cupao.texto : "Oferta de boas-vindas — 15% de desconto em noragrei.com"}</div>
              <div className="cupao-codigo">NORA15</div>
            </div>
            <div className="cupao-actions">
              <button className="cupao-btn" onClick={copiarCupao}>{cupaoCopiado ? (t.cupao ? t.cupao.copiado : "Copiado ✓") : (t.cupao ? t.cupao.copiar : "Copiar código")}</button>
              <button className="cupao-fechar" onClick={() => { setBanner(false); localStorage.setItem("ng_banner_cupao","1"); }}>✕</button>
            </div>
          </div>
        </div>
      )}

      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <a href="/" className="logo">
          <span className="logo-name">Nora Grei</span>
          <span className="logo-tag">{t.logoTag}</span>
        </a>
        <ul className="nav-links">
          <li><a href="/catalogo">{t.nav.catalogo}</a></li>
          <li><a href="#como">{t.nav.comoFunciona}</a></li>
        </ul>
        <div className="nav-right">
          <div className="nav-lang">
            {["pt","fr","lt"].map((l,i) => (
              <span key={l} style={{display:"flex",alignItems:"center",gap:"0.3rem"}}>
                {i > 0 && <span className="lang-sep">/</span>}
                <button className={`lang-btn${lang === l ? " on" : ""}`} onClick={() => changeLang(l)}>{l.toUpperCase()}</button>
              </span>
            ))}
          </div>
          {userLogado && <a href="/pedidos" className="nb nb-o">{t.nav.pedidos}</a>}
          <a href={userLogado ? "/perfil" : "/entrar"} className="nb nb-o">{userLogado ? t.nav.perfil : t.nav.entrar}</a>
          <a href="/catalogo" className="nb nb-f">{t.hero.cta1}</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg"><img src={heroPeca && heroPeca.fotos ? heroPeca.fotos[0] : FOTO_FALLBACK} alt="" /></div>
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
        <div className="hero-right-desktop">
          <img src={heroPeca && heroPeca.fotos ? heroPeca.fotos[0] : FOTO_FALLBACK} alt={heroPeca ? heroPeca.nome : "Nora Grei"} />
          <div className="hero-caption">
            <span className="hero-caption-nome">{heroPeca ? heroPeca.nome : "Vestido Seda Noite"}</span>
            <span className="hero-caption-preco">{heroPeca && heroPeca.preco_aluguer_dia ? `${heroPeca.preco_aluguer_dia}€ / dia` : "35€ / dia"}</span>
          </div>
        </div>
      </section>

      <section className="video-sec">
        <div className="video-header">
          <p className="video-label">{t.video.label}</p>
          <h2 className="video-titulo">{t.video.titulo}</h2>
        </div>
        {videoUrl ? (
          <div className="video-wrap" onClick={(e) => { const v = e.currentTarget.querySelector("video"); if (v) { if (videoPlaying) v.pause(); else v.play(); setVideoPlaying(!videoPlaying); } }}>
            <video src={videoUrl} loop playsInline />
            {!videoPlaying && <div className="video-play-btn"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>}
          </div>
        ) : (
          <div className="video-wrap" style={{cursor:"default"}}>
            <div className="video-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg>
              <span style={{fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase"}}>{t.videoEmBreve}</span>
            </div>
          </div>
        )}
      </section>

      <div className="strip">
        <div className="strip-track">
          {[...Array(4)].map((_, i) => t.strip.map((item, j) => (
            <span key={`${i}-${j}`} className="strip-item">{item}</span>
          )))}
        </div>
      </div>

      <div className="quick-access">
        {t.quickAccess.map((item, idx) => {
          const hrefs = ["/catalogo", userLogado ? "/perfil" : "/entrar", "/catalogo", "https://www.noragrei.com"];
          const href = hrefs[idx];
          const label = idx === 1 ? (userLogado ? item.label : item.labelGuest) : item.label;
          const desc = idx === 1 ? (userLogado ? item.desc : item.descGuest) : item.desc;
          return (
            <a key={idx} href={href} className="qa-item" target={href.indexOf("http") === 0 ? "_blank" : undefined} rel={href.indexOf("http") === 0 ? "noopener noreferrer" : undefined}>
              <div className="qa-label">{label}</div>
              <div className="qa-desc">{desc}</div>
              <span className="qa-arrow">→</span>
            </a>
          );
        })}
      </div>

      <section className="sec" style={{paddingBottom:0}}>
        <p className="sec-label">{t.categorias.label}</p>
        <h2 className="sec-titulo">{t.categorias.titulo}<br /><em>{t.categorias.tituloSub}</em></h2>
      </section>
      <div className="cat-grid">
        {t.categorias.lista.map((nomeCat, i) => (
          <a key={i} href="/catalogo" className="cat-card">
            {categoriaFotos[nomeCat] ? <img src={categoriaFotos[nomeCat]} alt={nomeCat} /> : (
              <div style={{width:"100%",height:"100%",background:"linear-gradient(160deg,#e8e4e0,#d5d0c8)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontFamily:"var(--serif)",fontSize:"2rem",fontWeight:300,color:"rgba(0,0,0,0.08)",fontStyle:"italic"}}>NG</span>
              </div>
            )}
            <div className="cat-overlay"><span className="cat-nome">{t.catNomes ? t.catNomes[nomeCat] : nomeCat}</span></div>
          </a>
        ))}
      </div>

      <section className="sec" id="como" style={{background:"var(--white)"}}>
        <p className="sec-label">{t.como.label}</p>
        <h2 className="sec-titulo">{t.como.titulo}</h2>
        <div className="como-grid">
          {t.como.passos.map((p, i) => (
            <div key={i} className="como-passo">
              <div className="como-num-wrap"><div className="como-num">{p.num}</div></div>
              <div><h3 className="como-titulo">{p.titulo}</h3><p className="como-desc">{p.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="porque">
        <div>
          <p className="sec-label" style={{color:"var(--rosa)"}}>{t.missaoLabel}</p>
          <h2 className="porque-titulo">{t.porque.titulo}<em>{t.porque.tituloSub}</em></h2>
        </div>
        <div>
          {t.porque.pontos.map((p, i) => (
            <div key={i} className="porque-ponto"><div className="porque-dot" /><div className="porque-text">{p}</div></div>
          ))}
        </div>
      </section>

      <div className="numeros">
        {t.numeros.map((n, i) => (
          <div key={i} className="numero"><div className="numero-val">{n.val}</div><div className="numero-label">{n.label}</div></div>
        ))}
      </div>

      <section className="sustent">
        <p className="sec-label">{t.sustentabilidade.label}</p>
        <div className="sustent-inner">
          <h2 className="sec-titulo" style={{marginBottom:0}}>{t.sustentabilidade.titulo}</h2>
          <div>
            {t.sustentabilidade.stats.map((s, i) => (
              <div key={i} className="sustent-stat"><div className="sustent-val">{s.val}</div><div className="sustent-label">{s.label}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-final">
        <div className="cta-final-titulo">{t.cta.titulo}</div>
        <div className="cta-final-sub">{t.cta.sub}</div>
        <span className="cta-final-tag">{t.cta.tag}</span>
        <a href="/catalogo" className="cta-final-btn">{t.cta.btn}</a>
      </section>

      <footer>
        <span className="footer-copy">{t.footer.copy}</span>
        <ul className="footer-links">{t.footer.links.map((l, i) => <li key={i}><a href="#">{l}</a></li>)}</ul>
      </footer>

      <nav className="bnav">
        <div className="bnav-inner">
          {[
            { href:"/", label:t.bottomNav.inicio, on:true, icon:<svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
            { href:"/catalogo", label:t.bottomNav.catalogo, on:false, icon:<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
            { href:userLogado ? "/pedidos" : "/entrar", label:t.bottomNav.pedidos, on:false, icon:<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
            { href:userLogado ? "/perfil" : "/entrar", label:t.bottomNav.perfil, on:false, icon:<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          ].map((item, i) => (
            <a key={i} href={item.href} className={`bnav-item${item.on ? " on" : ""}`}>
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