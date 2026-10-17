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
    destaque: { label: "Selecção da semana", verTodas: "Ver toda a colecção", alugar: "Alugar", reservar: "Indisponível — Reservar", dispEm: "Disponível em" },
    pwa: { titulo: "Instala a app Nora Grei", sub: "Acesso rápido à colecção, pedidos e notificações — sem ocupar espaço.", btn: "Instalar agora", ios: "No Safari, toca em  e depois em \"Adicionar ao ecrã inicial\".", dispensar: "Agora não", secTitulo: "Tens a app?", secSub: "Instala no teu telemóvel e acede à colecção com um toque.", secBtn: "Instalar app" },
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
    destaque: { label: "Sélection de la semaine", verTodas: "Voir toute la collection", alugar: "Louer", reservar: "Indisponible — Réserver", dispEm: "Disponible dans" },
    pwa: { titulo: "Installer l'app Nora Grei", sub: "Accès rapide à la collection, commandes et notifications — sans encombrer.", btn: "Installer", ios: "Dans Safari, appuyez sur  puis \"Sur l'écran d'accueil\".", dispensar: "Plus tard", secTitulo: "Vous avez l'app?", secSub: "Installez sur votre téléphone pour accéder à la collection en un clic.", secBtn: "Installer l'app" },
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
    destaque: { label: "Savaitės atranka", verTodas: "Žiūrėti visą kolekciją", alugar: "Nuomoti", reservar: "Neprieinama — Rezervuoti", dispEm: "Prieinama po" },
    pwa: { titulo: "Įdiekite Nora Grei programėlę", sub: "Greita prieiga prie kolekcijos, užsakymų ir pranešimų — neužimant vietos.", btn: "Įdiegti", ios: "Safari, bakstelėkite  ir tada \"Pridėti prie pradžios ekrano\".", dispensar: "Vėliau", secTitulo: "Turite programėlę?", secSub: "Įdiekite telefone ir pasiekite kolekciją vienu prisilietimu.", secBtn: "Įdiegti programėlę" },
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
  const [videoComSom, setVideoComSom] = useState(false);
  const [pecasDestaque, setPecasDestaque] = useState([]);
  const [campanha, setCampanha] = useState(null);
  const [pwaBanner, setPwaBanner] = useState(false); // "android" | "ios" | false
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [pwaInstalado, setPwaInstalado] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved); else setLang("pt");
    supabase.auth.getSession().then(({ data }) => { if (data.session) setUserLogado(true); });
    carregarCampanha();

    // PWA install prompt
    const jaInstalado = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (jaInstalado) { setPwaInstalado(true); return; }
    const jaDispensou = localStorage.getItem("ng_pwa_dismiss");
    if (jaDispensou) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) {
      setTimeout(() => setPwaBanner("ios"), 5000);
    } else {
      const handler = (e) => { e.preventDefault(); setPwaPrompt(e); setTimeout(() => setPwaBanner("android"), 4000); };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    carregarConteudo();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const instalarPwa = async () => {
    if (pwaPrompt) { pwaPrompt.prompt(); const { outcome } = await pwaPrompt.userChoice; if (outcome === "accepted") { setPwaBanner(false); setPwaInstalado(true); localStorage.setItem("ng_pwa_dismiss","1"); } }
  };
  const dispensarPwa = () => { setPwaBanner(false); localStorage.setItem("ng_pwa_dismiss","1"); };

  const carregarCampanha = async () => {
    const agora = new Date().toISOString();
    const { data: cs } = await supabase
      .from("campanhas")
      .select("id, titulo, titulo_fr, titulo_lt, mensagem, mensagem_fr, mensagem_lt, codigo, desconto, tipo, url_destino, validade")
      .eq("ativa", true)
      .or(`validade.is.null,validade.gt.${agora}`)
      .order("created_at", { ascending: false });
    if (!cs || cs.length === 0) return;
    // Escolher por probabilidade
    const total = cs.reduce((s, c) => s + (c.probabilidade || 20), 0);
    let r = Math.random() * total;
    let escolhida = cs[0];
    for (const c of cs) { r -= (c.probabilidade || 20); if (r <= 0) { escolhida = c; break; } }
    const visto = localStorage.getItem(`ng_banner_${escolhida.id}`);
    if (visto) return;
    setCampanha(escolhida);
    setTimeout(() => { setBanner(true); setTimeout(() => { setBanner(false); localStorage.setItem(`ng_banner_${escolhida.id}`, "1"); }, 9000); }, 2000);
  };

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
      .select("id, nome, fotos, ocasioes, preco_aluguer_dia, destaque, hero_position, categorias(nome), stock_tamanhos(id, quantidade_disponivel)")
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

      // Peças em destaque: primeiro as marcadas como destaque, depois as mais recentes
      const comFoto = todasPecas.filter(function (p) { return p.fotos && p.fotos[0]; });
      const destaque = comFoto.filter(function (p) { return p.destaque; });
      const resto = comFoto.filter(function (p) { return !p.destaque; });
      const seleccionadas = [...destaque, ...resto].slice(0, 6);

      // Verificar disponibilidade com alugueres activos
      if (seleccionadas.length > 0) {
        const stockIds = seleccionadas.flatMap(function (p) { return (p.stock_tamanhos || []).map(function (s) { return s.id; }); });
        const { data: alAtivos } = stockIds.length > 0 ? await supabase
          .from("alugueres")
          .select("stock_tamanho_id, data_fim, data_disponivel_novamente")
          .in("stock_tamanho_id", stockIds)
          .in("estado", ["pendente","confirmado","enviado","ativo","em_verificacao"]) : { data: [] };

        const agora = new Date();
        const pecasFormatadas = seleccionadas.map(function (p) {
          const ids = (p.stock_tamanhos || []).map(function (s) { return s.id; });
          const aluguerAtivo = (alAtivos || [])
            .filter(function (a) { return ids.includes(a.stock_tamanho_id); })
            .sort(function (a, b) { return new Date(b.data_fim) - new Date(a.data_fim); })[0];

          let dataFim = null;
          let disponivel = (p.stock_tamanhos || []).some(function (s) { return s.quantidade_disponivel > 0; });

          if (aluguerAtivo) {
            const dataDisp = aluguerAtivo.data_disponivel_novamente
              ? new Date(aluguerAtivo.data_disponivel_novamente)
              : new Date(new Date(aluguerAtivo.data_fim).getTime() + 3 * 86400000);
            if (dataDisp > agora) { dataFim = dataDisp.toISOString(); disponivel = false; }
          }

          return { ...p, disponivel, dataFim, categoria: p.categorias?.nome || "" };
        });
        setPecasDestaque(pecasFormatadas);
      }
    }
  };

  const changeLang = (l) => { localStorage.setItem("ng_lang", l); setLang(l); };
  const copiarCupao = () => { if (campanha?.codigo) navigator.clipboard.writeText(campanha.codigo); setCupaoCopiado(true); setTimeout(() => setCupaoCopiado(false), 3000); };
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

        .hero{min-height:100svh;position:relative;display:flex;flex-direction:column;overflow:hidden;padding-top:72px}
        .hero-bg{position:absolute;inset:0;z-index:0}
        .hero-bg img{width:100%;height:100%;object-fit:cover;object-position:var(--hero-pos,center 15%);filter:brightness(0.55)}
        .hero-bg video{width:100%;height:100%;object-fit:cover;object-position:center center}
        .hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,8,8,0.15) 0%,rgba(8,8,8,0.45) 50%,rgba(8,8,8,0.82) 100%);z-index:1}
        .hero-sound{position:absolute;bottom:2rem;right:1.5rem;z-index:3;background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;padding:0.5rem 0.9rem;cursor:pointer;font-family:var(--sans);transition:background 0.2s}
        .hero-sound:hover{background:rgba(255,255,255,0.22)}
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
          .hero{flex-direction:row;padding-top:80px;min-height:100vh}
          .hero-bg{display:none}
          .hero-overlay{display:none}
          .hero-content{color:var(--black);background:var(--white);flex:1;justify-content:center;padding:5rem 3rem 5rem 4rem}
          .hero-eyebrow{color:var(--g4)}
          .hero-titulo{color:var(--black);font-size:clamp(3rem,4.5vw,5rem)}
          .hero-sub{color:var(--g4);font-size:clamp(3rem,4.5vw,5rem)}
          .hero-desc{color:#1a1a18}
          .hero-cta1{max-width:none;flex:0}
          .hero-cta2{color:var(--g4);border-color:var(--g2);max-width:none;flex:0}
          .hero-cta2:hover{color:var(--black);border-color:var(--black)}
          .hero-right-desktop{flex:1;position:relative;overflow:hidden;min-height:100%}
          .hero-right-desktop img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:var(--hero-pos,center top);transition:transform 6s ease}
          .hero-right-desktop:hover img{transform:scale(1.03)}
          .hero-caption{position:absolute;bottom:0;left:0;right:0;z-index:2;padding:1.5rem 2rem;background:linear-gradient(to top,rgba(8,8,8,0.6),transparent);color:#fff;display:flex;justify-content:space-between;align-items:flex-end}
          .hero-caption-nome{font-family:var(--serif);font-size:1.1rem;font-style:italic;font-weight:300}
          .hero-caption-preco{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;opacity:0.8}
          .quick-access{grid-template-columns:repeat(4,1fr)}
          .numeros{grid-template-columns:repeat(4,1fr)}
          .numero{padding:3rem 2rem}
          .numero:nth-child(even){border-right:1px solid rgba(255,255,255,0.08)}
          .sec{padding:5rem 4rem}
          .como-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px}
          .porque{display:grid;grid-template-columns:1fr 1fr;gap:4rem;padding:5rem 4rem;align-items:center}
          .cat-grid{grid-template-columns:repeat(2,1fr);gap:8px}
          .cat-card{aspect-ratio:3/4}
          .sustent{padding:5rem 4rem}
          .sustent-inner{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;margin-top:3rem}
          .cta-final{padding:7rem 4rem}
          footer{flex-direction:row;justify-content:space-between;align-items:center;padding:2rem 4rem}
          .bnav{display:none}
          .nav{padding:1.1rem 3rem}
          .cupao-banner{bottom:0;padding:1rem 3rem}
          .cupao-inner{flex-direction:row;align-items:center;justify-content:space-between}
          .cupao-actions{flex:0}
        }
        @media(min-width:1200px){
          .cat-grid{grid-template-columns:repeat(4,1fr)}
          .sec{padding:6rem 5rem}
          .nav{padding:1.25rem 4rem}
        }

        .pwa-banner{position:fixed;bottom:72px;left:1rem;right:1rem;z-index:160;background:var(--black);color:var(--white);border-radius:0;padding:1.25rem 1.25rem 1rem;box-shadow:0 -4px 24px rgba(0,0,0,0.18);animation:slideUp 0.35s ease;display:flex;flex-direction:column;gap:0.75rem}
        @media(min-width:768px){.pwa-banner{display:none}}
        .pwa-banner-top{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}
        .pwa-banner-icon{width:44px;height:44px;border-radius:10px;background:var(--rosa);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--serif);font-size:1.1rem;font-weight:300;letter-spacing:0.1em;color:#fff}
        .pwa-banner-txt{flex:1}
        .pwa-banner-titulo{font-size:0.8rem;font-weight:500;letter-spacing:0.05em;margin-bottom:0.2rem}
        .pwa-banner-sub{font-size:0.7rem;color:rgba(255,255,255,0.65);line-height:1.45}
        .pwa-banner-fechar{background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:1.1rem;padding:0;flex-shrink:0;line-height:1}
        .pwa-banner-btns{display:flex;gap:0.5rem}
        .pwa-banner-btn{flex:1;padding:0.7rem;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;font-family:var(--sans);font-weight:500;cursor:pointer;border:none;transition:opacity 0.2s}
        .pwa-banner-btn.main{background:var(--white);color:var(--black)}
        .pwa-banner-btn.sec{background:transparent;color:rgba(255,255,255,0.55);border:1px solid rgba(255,255,255,0.2)}
        .pwa-banner-ios{font-size:0.72rem;color:rgba(255,255,255,0.7);line-height:1.5;padding:0.75rem;background:rgba(255,255,255,0.07);border-radius:4px}
        .pwa-sec{padding:3rem 1.5rem;background:var(--g1);border-top:1px solid var(--g2);display:flex;flex-direction:column;align-items:center;text-align:center;gap:1rem}
        @media(min-width:768px){.pwa-sec{flex-direction:row;justify-content:space-between;text-align:left;padding:2.5rem 4rem}}
        .pwa-sec-txt{}
        .pwa-sec-titulo{font-family:var(--serif);font-size:1.4rem;font-weight:300;margin-bottom:0.35rem}
        .pwa-sec-sub{font-size:0.8rem;color:var(--g4);line-height:1.5}
        .pwa-sec-btn{font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);font-weight:500;padding:0.9rem 2rem;background:var(--black);color:var(--white);border:none;cursor:pointer;white-space:nowrap;transition:background 0.2s;flex-shrink:0;text-decoration:none;display:inline-block}
        .pwa-sec-btn:hover{background:#2a2926}

        .destaque-sec{padding:3rem 1.5rem 4rem;background:var(--white)}
        .destaque-header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:1.75rem}
        .destaque-label{font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--rosa);font-weight:500}
        .destaque-ver{font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);text-decoration:none;border-bottom:1px solid var(--g2);padding-bottom:2px;transition:color 0.2s,border-color 0.2s}
        .destaque-ver:hover{color:var(--black);border-color:var(--black)}
        .destaque-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem}
        @media(min-width:600px){.destaque-grid{grid-template-columns:repeat(2,1fr);gap:1rem}}
        @media(min-width:769px){
          .destaque-sec{padding:4rem 4rem 5rem}
          .destaque-grid{grid-template-columns:repeat(3,1fr);gap:1.25rem}
        }
        @media(min-width:1200px){.destaque-grid{grid-template-columns:repeat(4,1fr);gap:1.5rem}}
        @media(max-width:768px){
          .bnav{display:block}
          .hero-right-desktop{display:none}
          .nav{padding:0.9rem 1.25rem}
          .nav-links,.nav-right .nb-o,.nav-right .nb-f{display:none}
          .nav-right{gap:0.5rem}
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />

      {pwaBanner && (
        <div className="pwa-banner">
          <div className="pwa-banner-top">
            <div className="pwa-banner-icon">NG</div>
            <div className="pwa-banner-txt">
              <div className="pwa-banner-titulo">{t.pwa.titulo}</div>
              <div className="pwa-banner-sub">{t.pwa.sub}</div>
            </div>
            <button className="pwa-banner-fechar" onClick={dispensarPwa}>✕</button>
          </div>
          {pwaBanner === "ios" ? (
            <div className="pwa-banner-ios">{t.pwa.ios}</div>
          ) : (
            <div className="pwa-banner-btns">
              <button className="pwa-banner-btn main" onClick={instalarPwa}>{t.pwa.btn}</button>
              <button className="pwa-banner-btn sec" onClick={dispensarPwa}>{t.pwa.dispensar}</button>
            </div>
          )}
        </div>
      )}

      {banner && campanha && (
        <div className="cupao-banner">
          <div className="cupao-inner">
            <div>
              <div className="cupao-texto">
                {(lang === "fr" && campanha.mensagem_fr) || (lang === "lt" && campanha.mensagem_lt) || campanha.mensagem || ""}
              </div>
              {campanha.codigo && <div className="cupao-codigo">{campanha.codigo}</div>}
              {campanha.desconto && !campanha.codigo && <div className="cupao-codigo" style={{fontSize:"1.1rem"}}>{campanha.desconto}</div>}
            </div>
            <div className="cupao-actions">
              {campanha.codigo && (
                <button className="cupao-btn" onClick={copiarCupao}>
                  {cupaoCopiado ? (t.cupao?.copiado || "Copiado ✓") : (t.cupao?.copiar || "Copiar código")}
                </button>
              )}
              {campanha.url_destino && !campanha.codigo && (
                <a href={campanha.url_destino} className="cupao-btn" style={{textDecoration:"none",textAlign:"center"}}>
                  Ver oferta →
                </a>
              )}
              <button className="cupao-fechar" onClick={() => { setBanner(false); if (campanha?.id) localStorage.setItem(`ng_banner_${campanha.id}`, "1"); }}>✕</button>
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

      <section className="hero" style={{"--hero-pos": heroPeca?.hero_position || "center top"}}>
        <div className="hero-bg">
          {videoUrl
            ? <video src={videoUrl} autoPlay muted loop playsInline ref={el => { if (el) el.play().catch(()=>{}); }} />
            : <img src={heroPeca && heroPeca.fotos ? heroPeca.fotos[0] : FOTO_FALLBACK} alt="" />
          }
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
        {videoUrl && (
          <button className="hero-sound" onClick={() => { const v = document.querySelector(".hero-bg video"); if (v) { v.muted = videoComSom; setVideoComSom(!videoComSom); } }}>
            {videoComSom ? "🔊 Som" : "🔇 Sem som"}
          </button>
        )}
        {!videoUrl && (
          <div className="hero-right-desktop">
            <img src={heroPeca && heroPeca.fotos ? heroPeca.fotos[0] : FOTO_FALLBACK} alt={heroPeca ? heroPeca.nome : "Nora Grei"} />
            <div className="hero-caption">
              <span className="hero-caption-nome">{heroPeca ? heroPeca.nome : "Vestido Seda Noite"}</span>
              <span className="hero-caption-preco">{heroPeca && heroPeca.preco_aluguer_dia ? `${heroPeca.preco_aluguer_dia}€ / dia` : "35€ / dia"}</span>
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

      {pecasDestaque.length > 0 && (
        <section className="destaque-sec">
          <div className="destaque-header">
            <p className="destaque-label">{t.destaque.label}</p>
            <a href="/catalogo" className="destaque-ver">{t.destaque.verTodas} →</a>
          </div>
          <div className="destaque-grid">
            {pecasDestaque.map((peca) => {
              const dispEstado = peca.disponivel !== false;
              return (
                <div key={peca.id} style={{display:"flex",flexDirection:"column",background:"#f8f7f5",position:"relative",borderRadius:"2px",overflow:"hidden"}}>
                  <a href={`/catalogo/${peca.id}`} style={{textDecoration:"none",color:"inherit",display:"block",position:"relative"}}>
                    <div style={{aspectRatio:"3/4",background:"#e8e5e0",overflow:"hidden",position:"relative"}}>
                      {peca.fotos && peca.fotos[0] ? (
                        <img src={peca.fotos[0]} alt={peca.nome} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",display:"block"}} />
                      ) : (
                        <div style={{width:"100%",height:"100%",background:"linear-gradient(160deg,#e8e4e0,#d5d0c8)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontFamily:"var(--serif)",fontSize:"2.5rem",fontWeight:300,color:"rgba(0,0,0,0.06)",fontStyle:"italic"}}>NG</span>
                        </div>
                      )}
                      {!dispEstado && (
                        <div style={{position:"absolute",top:"0.6rem",right:"0.6rem",fontSize:"0.48rem",letterSpacing:"0.18em",textTransform:"uppercase",background:"rgba(248,247,245,0.92)",color:"#5a5855",padding:"0.25rem 0.55rem",fontFamily:"var(--sans)",fontWeight:400,zIndex:2}}>
                          {t.destaque.reservar.split("—")[0].trim()}
                        </div>
                      )}
                      {!dispEstado && peca.dataFim && (() => {
                        const diff = new Date(peca.dataFim) - new Date();
                        if (diff <= 0) return null;
                        const dias = Math.floor(diff / 86400000);
                        const horas = Math.floor((diff % 86400000) / 3600000);
                        const tempo = dias > 0 ? `${dias}d ${horas}h` : `${horas}h`;
                        return (
                          <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(8,8,8,0.72)",backdropFilter:"blur(4px)",padding:"0.45rem 0.75rem",display:"flex",alignItems:"center",gap:"0.4rem",zIndex:3}}>
                            <div style={{width:5,height:5,borderRadius:"50%",background:"#f39c12",flexShrink:0}} />
                            <span style={{fontFamily:"var(--sans)",fontSize:"0.55rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.9)"}}>{t.destaque.dispEm} <strong>{tempo}</strong></span>
                          </div>
                        );
                      })()}
                    </div>
                    <div style={{padding:"0.65rem 0.7rem 0.3rem"}}>
                      {peca.categoria && <p style={{fontSize:"0.48rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#b0ada6",fontFamily:"var(--sans)",marginBottom:"0.15rem"}}>{peca.categoria}</p>}
                      <h3 style={{fontFamily:"var(--serif)",fontSize:"1rem",fontWeight:300,lineHeight:1.15,marginBottom:"0.3rem",color:"#080808"}}>{peca.nome}</h3>
                      <div style={{display:"flex",alignItems:"baseline",gap:"0.3rem",paddingTop:"0.4rem",borderTop:"1px solid #ece9e4"}}>
                        <span style={{fontFamily:"var(--serif)",fontSize:"1.2rem",fontWeight:300,color:"#080808"}}>{peca.preco_aluguer_dia}€</span>
                        <span style={{fontFamily:"var(--sans)",fontSize:"0.55rem",color:"#b0ada6",fontWeight:300}}>/dia</span>
                      </div>
                    </div>
                  </a>
                  {dispEstado ? (
                    <a href={`/catalogo/${peca.id}`} style={{display:"flex",alignItems:"center",justifyContent:"center",margin:"0 0.7rem 0.7rem",padding:"0.72rem",fontSize:"0.58rem",letterSpacing:"0.14em",textTransform:"uppercase",background:"#080808",color:"#f8f7f5",textAlign:"center",textDecoration:"none",fontFamily:"var(--sans)",fontWeight:400,minHeight:"44px"}}>
                      {t.destaque.alugar}
                    </a>
                  ) : (
                    <a href={`/reserva?peca=${peca.id}`} style={{display:"flex",alignItems:"center",justifyContent:"center",margin:"0 0.7rem 0.7rem",padding:"0.72rem",fontSize:"0.55rem",letterSpacing:"0.12em",textTransform:"uppercase",background:"transparent",color:"#5a5855",border:"1px solid #dedad4",textAlign:"center",textDecoration:"none",fontFamily:"var(--sans)",fontWeight:400,minHeight:"44px"}}>
                      {t.destaque.reservar}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

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

      {!pwaInstalado && (
        <div className="pwa-sec">
          <div className="pwa-sec-txt">
            <div className="pwa-sec-titulo">{t.pwa.secTitulo}</div>
            <div className="pwa-sec-sub">{t.pwa.secSub}</div>
          </div>
          <button className="pwa-sec-btn" onClick={() => { if (pwaPrompt) { instalarPwa(); } else { setPwaBanner(pwaBanner ? false : (/iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "android")); } }}>
            {t.pwa.secBtn}
          </button>
        </div>
      )}

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