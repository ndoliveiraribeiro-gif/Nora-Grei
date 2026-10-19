"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const T = {
  pt: {
    nav: { catalogo: "Colecção", comoFunciona: "Como funciona", entrar: "Entrar", pedidos: "Pedidos", perfil: "Perfil" },
    hero: { eyebrow: "Nova colecção — Outono/Inverno 2026", titulo: "Veste o extraordinário.", sub: "Sem comprar.", desc: "Aluga peças exclusivas da Nora Grei e renova o teu guarda-roupa sempre que quiseres.", cta1: "Explorar colecção", cta2: "Como funciona" },
    video: { label: "A experiência Nora Grei", titulo: "Vê como funciona." },
    como: { label: "O processo", titulo: "Moda sem compromisso.", passos: [
      { num: "01", titulo: "Escolhe", desc: "Explora a colecção e reserva a peça dos teus sonhos. Selecciona as datas e o tamanho." },
      { num: "02", titulo: "Recebe", desc: "Entregamos em casa, limpa, inspeccionada e pronta a usar. Em 48h." },
      { num: "03", titulo: "Usa", desc: "Vive cada momento com estilo único. Fotografa, partilha, brilha." },
      { num: "04", titulo: "Devolve", desc: "Renova o teu guarda-roupa sem acumular. A caução é devolvida na totalidade." },
    ]},
    categorias: { label: "Para cada momento", titulo: "O look certo,", tituloSub: "para cada ocasião.", lista: ["Festa", "Trabalho", "Férias", "Jantar"] },
    porque: { label: "A nossa missão", titulo: "Porque a moda deve acompanhar a tua vida,", tituloSub: "não ocupar o teu armário.", pontos: ["Menos desperdício.", "Mais exclusividade.", "Mais liberdade.", "Moda consciente."] },
    numeros: [{ val:"500+",label:"Alugueres realizados" },{ val:"120+",label:"Peças exclusivas" },{ val:"4.9★",label:"Avaliação média" },{ val:"48h",label:"Entrega rápida" }],
    sustentabilidade: { label:"Moda consciente", titulo:"Cada peça vive várias histórias.", stats:[{ val:"70%",label:"Água poupada vs comprar" },{ val:"5×",label:"Reutilizações por peça" },{ val:"60%",label:"Emissões reduzidas" }] },
    cta: { titulo:"O teu guarda-roupa infinito", sub:"começa aqui.", btn:"Explorar colecção", tag:"Moda exclusiva. Sem excessos." },
    strip: ["Envio gratuito", "Depósito 100% devolvido", "Peças inspeccionadas", "Cancele quando quiser", "Moda consciente"],
    footer: {
      copy:"© 2026 Nora Grei. Todos os direitos reservados.",
      cols: [
        { titulo: "Explorar", links: [{ l:"Colecção", h:"/catalogo" },{ l:"Como funciona", h:"#como" },{ l:"Sustentabilidade", h:"#sustentabilidade" }] },
        { titulo: "Conta", links: [{ l:"Entrar", h:"/entrar" },{ l:"Registar", h:"/registar" },{ l:"Os meus pedidos", h:"/pedidos" },{ l:"Perfil", h:"/perfil" }] },
        { titulo: "Informação", links: [{ l:"Contacto", h:"mailto:hello@noragrei.com" },{ l:"Termos de uso", h:"/termos" },{ l:"Política de privacidade", h:"/privacidade" }] },
      ],
      social: "Segue-nos",
    },
    bottomNav: { inicio:"Início", catalogo:"Colecção", feed:"Feed", pedidos:"Pedidos", perfil:"Perfil" },
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
    trust: { label: "Porque nos escolhem", items: [
      { icon: "✦", titulo: "Peças únicas", desc: "Cada peça é seleccionada a pensar na mulher que quer ser diferente em cada ocasião." },
      { icon: "◎", titulo: "Caução garantida", desc: "O depósito é devolvido na totalidade quando a peça chega em boas condições." },
      { icon: "↺", titulo: "Guarda-roupa infinito", desc: "Aluga quantas vezes quiseres. Sem limites, sem acumulação, sem culpa." },
      { icon: "♡", titulo: "Higienização profissional", desc: "Cada peça é limpa e inspeccionada antes de chegar até ti." },
    ]},
    instagram: { label: "Inspira-te", titulo: "Segue-nos no Instagram", sub: "Vê como as nossas clientes usam as peças.", btn: "Ver @noragrei" },
  },
  fr: {
    nav: { catalogo: "Collection", comoFunciona: "Comment ça marche", entrar: "Connexion", pedidos: "Commandes", perfil: "Profil" },
    hero: { eyebrow: "Nouvelle collection — Automne/Hiver 2026", titulo: "Habillez l'extraordinaire.", sub: "Sans acheter.", desc: "Louez des pièces exclusives Nora Grei et renouvelez votre garde-robe à volonté.", cta1: "Explorer la collection", cta2: "Comment ça marche" },
    video: { label: "L'expérience Nora Grei", titulo: "Découvrez comment ça marche." },
    como: { label: "Le processus", titulo: "La mode sans engagement.", passos: [
      { num: "01", titulo: "Choisissez", desc: "Explorez la collection et réservez la pièce de vos rêves. Sélectionnez les dates et la taille." },
      { num: "02", titulo: "Recevez", desc: "Livré chez vous, propre, inspectée et prête à porter. En 48h." },
      { num: "03", titulo: "Portez", desc: "Vivez chaque moment avec style. Photographiez, partagez, brillez." },
      { num: "04", titulo: "Retournez", desc: "Renouvelez votre garde-robe sans accumuler. Le dépôt est intégralement remboursé." },
    ]},
    categorias: { label: "Pour chaque moment", titulo: "Le look parfait,", tituloSub: "pour chaque occasion.", lista: ["Festa", "Trabalho", "Férias", "Jantar"] },
    porque: { label: "Notre mission", titulo: "Parce que la mode doit suivre votre vie,", tituloSub: "pas occuper votre placard.", pontos: ["Moins de gaspillage.", "Plus d'exclusivité.", "Plus de liberté.", "Mode responsable."] },
    numeros: [{ val:"500+",label:"Locations réalisées" },{ val:"120+",label:"Pièces exclusives" },{ val:"4.9★",label:"Note moyenne" },{ val:"48h",label:"Livraison rapide" }],
    sustentabilidade: { label:"Mode responsable", titulo:"Chaque pièce vit plusieurs histoires.", stats:[{ val:"70%",label:"Eau économisée vs achat" },{ val:"5×",label:"Réutilisations par pièce" },{ val:"60%",label:"Émissions réduites" }] },
    cta: { titulo:"Votre garde-robe infinie", sub:"commence ici.", btn:"Explorer la collection", tag:"Mode exclusive. Sans excès." },
    strip: ["Livraison gratuite", "Dépôt 100% remboursé", "Pièces inspectées", "Annulez à tout moment", "Mode responsable"],
    footer: {
      copy:"© 2026 Nora Grei. Tous droits réservés.",
      cols: [
        { titulo: "Explorer", links: [{ l:"Collection", h:"/catalogo" },{ l:"Comment ça marche", h:"#como" },{ l:"Durabilité", h:"#sustentabilidade" }] },
        { titulo: "Compte", links: [{ l:"Connexion", h:"/entrar" },{ l:"S'inscrire", h:"/registar" },{ l:"Mes commandes", h:"/pedidos" },{ l:"Profil", h:"/perfil" }] },
        { titulo: "Informations", links: [{ l:"Contact", h:"mailto:hello@noragrei.com" },{ l:"Conditions d'utilisation", h:"/termos" },{ l:"Politique de confidentialité", h:"/privacidade" }] },
      ],
      social: "Suivez-nous",
    },
    bottomNav: { inicio:"Accueil", catalogo:"Collection", feed:"Feed", pedidos:"Commandes", perfil:"Profil" },
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
    trust: { label: "Pourquoi nous choisir", items: [
      { icon: "✦", titulo: "Pièces uniques", desc: "Chaque pièce est sélectionnée pour la femme qui veut être différente à chaque occasion." },
      { icon: "◎", titulo: "Dépôt garanti", desc: "Le dépôt est intégralement remboursé lorsque la pièce arrive en bon état." },
      { icon: "↺", titulo: "Garde-robe infinie", desc: "Louez autant que vous voulez. Sans limites, sans accumulation, sans culpabilité." },
      { icon: "♡", titulo: "Nettoyage professionnel", desc: "Chaque pièce est nettoyée et inspectée avant de vous être livrée." },
    ]},
    instagram: { label: "Inspirez-vous", titulo: "Suivez-nous sur Instagram", sub: "Voyez comment nos clientes portent les pièces.", btn: "Voir @noragrei" },
  },
  lt: {
    nav: { catalogo: "Kolekcija", comoFunciona: "Kaip tai veikia", entrar: "Prisijungti", pedidos: "Užsakymai", perfil: "Profilis" },
    hero: { eyebrow: "Nauja kolekcija — 2026 ruduo/žiema", titulo: "Apsirenkite išskirtinai.", sub: "Nepirkdami.", desc: "Nuomokitės išskirtinius Nora Grei drabužius ir atnaujinkite savo spintą kada panorėję.", cta1: "Naršyti kolekciją", cta2: "Kaip tai veikia" },
    video: { label: "Nora Grei patirtis", titulo: "Pažiūrėkite, kaip tai veikia." },
    como: { label: "Procesas", titulo: "Mada be įsipareigojimų.", passos: [
      { num: "01", titulo: "Pasirinkite", desc: "Naršykite kolekciją ir rezervuokite svajonių drabužį. Pasirinkite datas ir dydį." },
      { num: "02", titulo: "Gaukite", desc: "Pristatome į namus, švarų, patikrintą ir paruoštą dėvėti. Per 48 val." },
      { num: "03", titulo: "Dėvėkite", desc: "Gyvenkite kiekvieną akimirką su savitu stiliumi. Fotografuokite, dalinkitės, spindėkite." },
      { num: "04", titulo: "Grąžinkite", desc: "Atnaujinkite spintą nekraudami daiktų. Užstatas grąžinamas visas." },
    ]},
    categorias: { label: "Kiekvienai akimirkai", titulo: "Tinkamas stilius,", tituloSub: "kiekvienai progai.", lista: ["Festa", "Trabalho", "Férias", "Jantar"] },
    porque: { label: "Mūsų misija", titulo: "Nes mada turi atitikti jūsų gyvenimą,", tituloSub: "o ne užimti jūsų spintą.", pontos: ["Mažiau švaistymo.", "Daugiau išskirtinumo.", "Daugiau laisvės.", "Sąmoninga mada."] },
    numeros: [{ val:"500+",label:"Įvykdytų nuomų" },{ val:"120+",label:"Išskirtinių drabužių" },{ val:"4.9★",label:"Vidutinis įvertinimas" },{ val:"48h",label:"Greitas pristatymas" }],
    sustentabilidade: { label:"Sąmoninga mada", titulo:"Kiekvienas drabužis turi kelias istorijas.", stats:[{ val:"70%",label:"Sutaupyto vandens vs pirkimas" },{ val:"5×",label:"Pakartotiniai naudojimai" },{ val:"60%",label:"Sumažintos emisijos" }] },
    cta: { titulo:"Jūsų begalinė spinta", sub:"prasideda čia.", btn:"Naršyti kolekciją", tag:"Išskirtinė mada. Be perteklių." },
    strip: ["Nemokamas pristatymas", "100% grąžinamas užstatas", "Patikrinti drabužiai", "Atšaukite bet kada", "Sąmoninga mada"],
    footer: {
      copy:"© 2026 Nora Grei. Visos teisės saugomos.",
      cols: [
        { titulo: "Naršyti", links: [{ l:"Kolekcija", h:"/catalogo" },{ l:"Kaip tai veikia", h:"#como" },{ l:"Tvarumas", h:"#sustentabilidade" }] },
        { titulo: "Paskyra", links: [{ l:"Prisijungti", h:"/entrar" },{ l:"Registruotis", h:"/registar" },{ l:"Mano užsakymai", h:"/pedidos" },{ l:"Profilis", h:"/perfil" }] },
        { titulo: "Informacija", links: [{ l:"Kontaktai", h:"mailto:hello@noragrei.com" },{ l:"Naudojimo sąlygos", h:"/termos" },{ l:"Privatumo politika", h:"/privacidade" }] },
      ],
      social: "Sekite mus",
    },
    bottomNav: { inicio:"Pradžia", catalogo:"Kolekcija", feed:"Feed", pedidos:"Užsakymai", perfil:"Profilis" },
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
    trust: { label: "Kodėl mus renkasi", items: [
      { icon: "✦", titulo: "Unikalūs drabužiai", desc: "Kiekvienas drabužis atrinktas moteriai, kuri nori būti skirtinga kiekvienai progai." },
      { icon: "◎", titulo: "Užstatas garantuotas", desc: "Užstatas grąžinamas visas, kai drabužis grąžinamas geros būklės." },
      { icon: "↺", titulo: "Begalinė spinta", desc: "Nuomokite kiek tik norite. Be apribojimų, be kaupimo, be kaltės." },
      { icon: "♡", titulo: "Profesionalus valymas", desc: "Kiekvienas drabužis išvalomas ir patikrinamas prieš pristatant." },
    ]},
    instagram: { label: "Įkvėpkitės", titulo: "Sekite mus Instagram", sub: "Žiūrėkite, kaip mūsų klientės dėvi drabužius.", btn: "Žiūrėti @noragrei" },
  },
};

export default function Home() {
  const [lang, setLang] = useState("pt");
  const [userLogado, setUserLogado] = useState(false);
  const [banner, setBanner] = useState(false);
  const [cupaoCopiado, setCupaoCopiado] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroPeca, setHeroPeca] = useState(null);
  const [heroCarregado, setHeroCarregado] = useState(false);
  const [categoriaFotos, setCategoriaFotos] = useState({});
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoComSom, setVideoComSom] = useState(false);
  const [pecasDestaque, setPecasDestaque] = useState([]);
  const [campanha, setCampanha] = useState(null);
  const [pwaBanner, setPwaBanner] = useState(false);
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [pwaInstalado, setPwaInstalado] = useState(false);
  const [cestoCont, setCestoCont] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved); else setLang("pt");
    supabase.auth.getSession().then(({ data }) => { if (data.session) setUserLogado(true); });
    carregarCampanha();
    carregarConteudo();

    const lerCesto = () => {
      try { setCestoCont(JSON.parse(localStorage.getItem("ng_cesto") || "[]").length); } catch (_) { setCestoCont(0); }
    };
    lerCesto();
    window.addEventListener("cesto-atualizado", lerCesto);

    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);

    const jaInstalado = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (!jaInstalado) {
      const jaDispensou = localStorage.getItem("ng_pwa_dismiss");
      if (!jaDispensou) {
        const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
        if (isIos) {
          setTimeout(() => setPwaBanner("ios"), 5000);
        } else {
          const handler = (e) => { e.preventDefault(); setPwaPrompt(e); setTimeout(() => setPwaBanner("android"), 4000); };
          window.addEventListener("beforeinstallprompt", handler);
        }
      }
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("cesto-atualizado", lerCesto);
    };
  }, []);

  const instalarPwa = async () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      const { outcome } = await pwaPrompt.userChoice;
      if (outcome === "accepted") { setPwaBanner(false); setPwaInstalado(true); localStorage.setItem("ng_pwa_dismiss","1"); }
    } else {
      if (navigator.share) { try { await navigator.share({ title: "Nora Grei", url: window.location.origin }); } catch(_) {} }
    }
  };
  const dispensarPwa = () => { setPwaBanner(false); localStorage.setItem("ng_pwa_dismiss","1"); };

  const carregarCampanha = async () => {
    const agora = new Date().toISOString();
    const { data: cs } = await supabase.from("campanhas").select("id, titulo, titulo_fr, titulo_lt, mensagem, mensagem_fr, mensagem_lt, codigo, desconto, tipo, url_destino, validade").eq("ativa", true).or(`validade.is.null,validade.gt.${agora}`).order("created_at", { ascending: false });
    if (!cs || cs.length === 0) return;
    const total = cs.reduce((s, c) => s + (c.probabilidade || 20), 0);
    let r = Math.random() * total; let escolhida = cs[0];
    for (const c of cs) { r -= (c.probabilidade || 20); if (r <= 0) { escolhida = c; break; } }
    const visto = localStorage.getItem(`ng_banner_${escolhida.id}`);
    if (visto) return;
    setCampanha(escolhida);
    setTimeout(() => { setBanner(true); setTimeout(() => { setBanner(false); localStorage.setItem(`ng_banner_${escolhida.id}`, "1"); }, 9000); }, 2000);
  };

  const aplicarHeroAutomatico = (todasPecas) => {
    const comFotoReal = todasPecas.filter(p => p.fotos && p.fotos.filter(Boolean).length > 0);
    const destaque = comFotoReal.find(p => p.destaque);
    if (destaque) { setHeroPeca(destaque); return; }
    if (comFotoReal[0]) setHeroPeca(comFotoReal[0]);
  };

  const carregarConteudo = async () => {
    const { data: cfg } = await supabase.from("configuracoes").select("*").maybeSingle();
    if (cfg && cfg.video_landing_url) setVideoUrl(cfg.video_landing_url);

    const { data: todasPecas } = await supabase.from("pecas").select("id, nome, fotos, ocasioes, preco_aluguer_dia, destaque, hero_position, categorias(nome), stock_tamanhos(id, quantidade_disponivel)").not("fotos", "is", null).neq("fotos", "{}");

    if (cfg && cfg.hero_peca_id && todasPecas) {
      const escolhida = todasPecas.find(p => p.id === cfg.hero_peca_id);
      if (escolhida && escolhida.fotos && escolhida.fotos.filter(Boolean).length > 0) { setHeroPeca(escolhida); } else { aplicarHeroAutomatico(todasPecas); }
    } else if (todasPecas) { aplicarHeroAutomatico(todasPecas); }
    setHeroCarregado(true);

    if (todasPecas) {
      const mapa = {};
      const mapaCampos = { Festa: cfg?.categoria_festa_peca_id, Trabalho: cfg?.categoria_trabalho_peca_id, "Férias": cfg?.categoria_ferias_peca_id, Jantar: cfg?.categoria_jantar_peca_id };
      ["Festa", "Trabalho", "Férias", "Jantar"].forEach(oc => {
        const idEscolhido = mapaCampos[oc];
        if (idEscolhido) { const e = todasPecas.find(p => p.id === idEscolhido); if (e && e.fotos?.[0]) { mapa[oc] = e.fotos[0]; return; } }
        const encontrada = todasPecas.find(p => p.ocasioes?.includes(oc) && p.fotos?.[0]);
        if (encontrada) mapa[oc] = encontrada.fotos[0];
      });
      const restantes = todasPecas.filter(p => p.fotos?.[0]); let idx = 0;
      ["Festa", "Trabalho", "Férias", "Jantar"].forEach(oc => { if (!mapa[oc] && restantes[idx]) { mapa[oc] = restantes[idx].fotos[0]; idx++; } });
      setCategoriaFotos(mapa);

      const comFoto = todasPecas.filter(p => p.fotos?.[0]);
      const destaqueL = comFoto.filter(p => p.destaque);
      const resto = comFoto.filter(p => !p.destaque);
      const seleccionadas = [...destaqueL, ...resto].slice(0, 6);

      if (seleccionadas.length > 0) {
        const stockIds = seleccionadas.flatMap(p => (p.stock_tamanhos || []).map(s => s.id));
        const { data: alAtivos } = stockIds.length > 0 ? await supabase.from("alugueres").select("stock_tamanho_id, data_fim, data_disponivel_novamente").in("stock_tamanho_id", stockIds).in("estado", ["pendente","confirmado","enviado","ativo","em_verificacao"]) : { data: [] };
        const agora = new Date();
        const pecasFormatadas = seleccionadas.map(p => {
          const ids = (p.stock_tamanhos || []).map(s => s.id);
          const aluguerAtivo = (alAtivos || []).filter(a => ids.includes(a.stock_tamanho_id)).sort((a, b) => new Date(b.data_fim) - new Date(a.data_fim))[0];
          let dataFim = null;
          let disponivel = (p.stock_tamanhos || []).some(s => s.quantidade_disponivel > 0);
          if (aluguerAtivo) {
            const dataDisp = aluguerAtivo.data_disponivel_novamente ? new Date(aluguerAtivo.data_disponivel_novamente) : new Date(new Date(aluguerAtivo.data_fim).getTime() + 3 * 86400000);
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#080808;--white:#f8f7f5;--g1:#f0eeeb;--g2:#e2dfda;--g4:#5a5855;--rosa:#c4748a;--serif:'Cormorant Garamond',Georgia,serif;--sans:'Jost',Arial,sans-serif}
        html{scroll-behavior:smooth}
        body{background:var(--white);color:var(--black);font-family:var(--sans);font-size:17px;font-weight:400;line-height:1.7;-webkit-font-smoothing:antialiased}
        @media(max-width:768px){body{padding-bottom:72px}}

        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1rem 4rem;transition:all 0.3s;background:rgba(248,247,245,0.98);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2)}
        .nav.scrolled{padding:0.75rem 4rem;box-shadow:0 2px 20px rgba(0,0,0,0.06)}
        .logo{display:flex;flex-direction:column;text-decoration:none;color:var(--black)}
        .logo-name{font-family:var(--serif);font-size:1.35rem;font-weight:400;letter-spacing:0.25em;text-transform:uppercase;line-height:1}
        .logo-tag{font-size:0.65rem;letter-spacing:0.35em;text-transform:uppercase;color:var(--g4);margin-top:0.15rem}
        .nav-links{display:flex;align-items:center;gap:2.5rem;list-style:none}
        .nav-links a{font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);text-decoration:none;transition:color 0.2s}
        .nav-links a:hover{color:var(--black)}
        .nav-right{display:flex;align-items:center;gap:0.75rem}
        .nav-lang{display:flex;gap:0.3rem;align-items:center}
        .lang-btn{font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--g4);background:none;border:none;cursor:pointer;font-family:var(--sans);padding:0;transition:color 0.2s}
        .lang-btn.on{color:var(--black);font-weight:500}
        .lang-sep{color:var(--g2);font-size:0.65rem}
        .nb{font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;padding:0.6rem 1.1rem;text-decoration:none;font-family:var(--sans);transition:all 0.2s;white-space:nowrap}
        .nb-o{color:var(--black);border:1px solid var(--g2)}
        .nb-o:hover{border-color:var(--black)}
        .nb-f{background:var(--black);color:var(--white);border:1px solid var(--black)}
        .nb-f:hover{background:#2a2926}

        /* HERO */
        .hero{min-height:100svh;position:relative;display:flex;flex-direction:column;overflow:hidden;padding-top:72px}
        .hero-bg{position:absolute;inset:0;z-index:0}
        .hero-bg img{width:100%;height:100%;object-fit:cover;object-position:var(--hero-pos,center 15%);filter:brightness(0.55);transition:opacity 1s ease;opacity:0}
        .hero-bg img.visivel{opacity:1}
        .hero-bg video{width:100%;height:100%;object-fit:cover;object-position:center center}
        .hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,8,8,0.15) 0%,rgba(8,8,8,0.45) 50%,rgba(8,8,8,0.82) 100%);z-index:1}
        .hero-sound{position:absolute;bottom:2rem;right:1.5rem;z-index:3;background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;padding:0.5rem 0.9rem;cursor:pointer;font-family:var(--sans);transition:background 0.2s}
        .hero-sound:hover{background:rgba(255,255,255,0.22)}
        @media(min-width:769px){.hero>.hero-sound{display:none!important}}
        .hero-content{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;flex:1;padding:2.5rem 1.5rem 3rem;color:#fff}
        .hero-eyebrow{font-size:0.72rem;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:1rem}
        .hero-titulo{font-family:var(--serif);font-size:clamp(2.8rem,9.5vw,5.5rem);font-weight:300;line-height:1.02;color:#fff}
        .hero-sub{font-family:var(--serif);font-size:clamp(2.8rem,9.5vw,5.5rem);font-weight:300;font-style:italic;color:rgba(255,255,255,0.65);line-height:1.02;margin-bottom:1.5rem}
        .hero-desc{font-size:0.95rem;color:rgba(255,255,255,0.75);max-width:45ch;line-height:1.8;margin-bottom:2rem}
        .hero-btns{display:flex;gap:0.75rem;flex-wrap:wrap}
        .hero-cta1{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;background:var(--rosa);color:#fff;padding:1rem 2rem;text-decoration:none;font-family:var(--sans);font-weight:500;transition:background 0.2s;flex:1;text-align:center;max-width:220px}
        .hero-cta1:hover{background:#a85c72}
        .hero-cta2{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.7);text-decoration:none;border:1px solid rgba(255,255,255,0.3);padding:1rem 1.5rem;transition:all 0.2s;flex:1;text-align:center;max-width:180px}
        .hero-cta2:hover{color:#fff;border-color:#fff}

        /* STRIP */
        .strip{background:var(--rosa);padding:0.75rem 0;overflow:hidden}
        .strip-track{display:flex;white-space:nowrap;animation:marquee 25s linear infinite}
        .strip-item{font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.9);padding:0 2.5rem;flex-shrink:0}
        .strip-item::after{content:'✦';margin-left:2.5rem;color:rgba(255,255,255,0.4)}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        /* QUICK ACCESS */
        .quick-access{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--g2)}
        .qa-item{background:var(--white);padding:1.5rem 1.25rem;display:flex;flex-direction:column;gap:0.35rem;text-decoration:none;color:var(--black);transition:background 0.2s;position:relative;overflow:hidden;border:none}
        .qa-item:hover{background:var(--g1)}
        .qa-arrow{position:absolute;right:1rem;top:50%;transform:translateY(-50%);font-size:0.9rem;color:var(--g2);transition:all 0.25s;font-family:var(--sans)}
        .qa-item:hover .qa-arrow{color:var(--rosa);right:0.75rem}
        .qa-label{font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;font-weight:500;padding-right:1.5rem}
        .qa-desc{font-size:0.75rem;color:var(--g4);font-weight:300}

        /* SECTIONS */
        .sec{padding:2rem 1.5rem}
        .sec-label{font-size:0.72rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--rosa);margin-bottom:0.4rem;font-weight:500}
        .sec-titulo{font-family:var(--serif);font-size:clamp(1.6rem,5vw,2.6rem);font-weight:300;line-height:1.1;margin-bottom:1.25rem}
        .sec-titulo em{font-style:italic;color:var(--g4)}

        /* COMO */
        .como-grid{display:flex;flex-direction:column;gap:1px;background:var(--g2)}
        .como-passo{background:var(--white);padding:1.25rem 1.5rem;display:flex;gap:1.25rem;align-items:flex-start;transition:background 0.2s}
        .como-passo:hover{background:var(--g1)}
        .como-num-wrap{flex-shrink:0;width:40px;height:40px;background:var(--rosa);display:flex;align-items:center;justify-content:center}
        .como-num{font-family:var(--serif);font-size:1.1rem;font-weight:300;color:#fff}
        .como-titulo{font-family:var(--serif);font-size:1.15rem;font-weight:400;margin-bottom:0.2rem}
        .como-desc{font-size:0.82rem;color:var(--g4);line-height:1.55}

        /* PORQUE */
        .porque{background:linear-gradient(135deg,#080808 0%,#1a0a10 100%);padding:2rem 1.5rem}
        .porque-titulo{font-family:var(--serif);font-size:clamp(1.5rem,4vw,2.4rem);font-weight:300;line-height:1.2;color:#fff;margin-bottom:1.5rem}
        .porque-titulo em{font-style:italic;color:rgba(255,255,255,0.4);display:block}
        .porque-ponto{display:flex;align-items:center;gap:1rem;padding:0.65rem 0;border-bottom:1px solid rgba(255,255,255,0.08)}
        .porque-ponto:last-child{border-bottom:none}
        .porque-dot{width:6px;height:6px;border-radius:50%;background:var(--rosa);flex-shrink:0}
        .porque-text{font-family:var(--serif);font-size:1.15rem;font-weight:300;color:rgba(255,255,255,0.85)}

        /* CATEGORIAS */
        .cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:var(--white)}
        .cat-card{position:relative;overflow:hidden;aspect-ratio:1/1;text-decoration:none;display:block;background:var(--g1)}
        .cat-card img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease}
        .cat-card:hover img{transform:scale(1.05)}
        .cat-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,8,0.75) 0%,transparent 50%);display:flex;align-items:flex-end;padding:1.25rem}
        .cat-nome{font-family:var(--serif);font-size:1.4rem;font-weight:300;color:#fff;font-style:italic}

        /* NÚMEROS */
        .numeros{display:grid;grid-template-columns:repeat(2,1fr);background:var(--black)}
        .numero{padding:1.5rem 1rem;text-align:center;border-right:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08)}
        .numero:nth-child(even){border-right:none}
        .numero-val{font-family:var(--serif);font-size:2.2rem;font-weight:300;color:var(--rosa);line-height:1;margin-bottom:0.3rem}
        .numero-label{font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.4)}

        /* TRUST */
        .trust-sec{padding:1.75rem 1.5rem;background:var(--g1)}
        .trust-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--g2);margin-top:1.25rem}
        .trust-item{background:var(--white);padding:1.25rem 1.25rem}
        .trust-icon{font-size:1.1rem;color:var(--rosa);margin-bottom:0.5rem;display:block}
        .trust-titulo{font-family:var(--serif);font-size:1rem;font-weight:400;margin-bottom:0.25rem}
        .trust-desc{font-size:0.78rem;color:var(--g4);line-height:1.55}

        /* INSTAGRAM */
        .insta-sec{padding:2rem 1.5rem;background:var(--black);text-align:center}
        .insta-label{font-size:0.72rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--rosa);font-weight:500;margin-bottom:0.6rem}
        .insta-titulo{font-family:var(--serif);font-size:clamp(1.6rem,4vw,2.4rem);font-weight:300;color:#fff;margin-bottom:0.35rem}
        .insta-sub{font-size:0.82rem;color:rgba(255,255,255,0.45);margin-bottom:1.5rem}
        .insta-btn{font-size:0.78rem;letter-spacing:0.18em;text-transform:uppercase;background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.25);padding:0.75rem 1.75rem;text-decoration:none;font-family:var(--sans);transition:all 0.2s;display:inline-block}
        .insta-btn:hover{border-color:#fff;background:rgba(255,255,255,0.05)}
        @media(min-width:769px){.insta-sec{padding:2.5rem 4rem}}

        /* SUSTENTABILIDADE */
        .sustent{background:var(--g1);padding:2rem 1.5rem}
        .sustent-stat{background:var(--white);padding:1rem 1.25rem;margin-bottom:1px;display:flex;align-items:center;justify-content:space-between;border-left:3px solid var(--rosa)}
        .sustent-val{font-family:var(--serif);font-size:2rem;font-weight:300;color:var(--rosa)}
        .sustent-label{font-size:0.78rem;color:var(--g4);text-align:right;max-width:20ch}

        /* CTA FINAL */
        .cta-final{padding:2.5rem 1.5rem;text-align:center;background:var(--black);color:#fff}
        .cta-final-titulo{font-family:var(--serif);font-size:clamp(2rem,6vw,4rem);font-weight:300;line-height:1;color:#fff}
        .cta-final-sub{font-family:var(--serif);font-size:clamp(2rem,6vw,4rem);font-weight:300;font-style:italic;color:var(--rosa);line-height:1;margin-bottom:0.6rem}
        .cta-final-tag{font-size:0.72rem;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:2rem;display:block}
        .cta-final-btn{font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;background:var(--rosa);color:#fff;padding:1rem 2.5rem;text-decoration:none;font-family:var(--sans);transition:background 0.2s;display:inline-block}
        .cta-final-btn:hover{background:#a85c72}

        /* FOOTER */
        footer{padding:3rem 1.5rem 2rem;border-top:1px solid var(--g2);background:var(--white)}
        .footer-cols{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:2.5rem}
        .footer-col-titulo{font-size:0.72rem;letter-spacing:0.25em;text-transform:uppercase;color:var(--black);font-weight:500;margin-bottom:0.85rem}
        .footer-col-links{list-style:none;display:flex;flex-direction:column;gap:0.5rem}
        .footer-col-links a{font-size:0.78rem;color:var(--g4);text-decoration:none;transition:color 0.2s}
        .footer-col-links a:hover{color:var(--black)}
        .footer-bottom{display:flex;flex-direction:column;gap:0.75rem;padding-top:1.5rem;border-top:1px solid var(--g2)}
        .footer-copy{font-size:0.65rem;color:var(--g4)}
        .footer-social{display:flex;align-items:center;gap:0.75rem}
        .footer-social-label{font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--g4)}
        .footer-social-link{font-size:0.72rem;color:var(--g4);text-decoration:none;transition:color 0.2s}
        .footer-social-link:hover{color:var(--rosa)}

        /* CUPÃO BANNER */
        .cupao-banner{position:fixed;bottom:72px;left:0;right:0;z-index:150;background:var(--rosa);padding:1rem 1.5rem;animation:slideUp 0.4s ease}
        @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        .cupao-inner{display:flex;flex-direction:column;gap:0.75rem}
        .cupao-texto{font-size:0.82rem;color:#fff;font-weight:500}
        .cupao-codigo{font-family:var(--serif);font-size:1.8rem;font-weight:300;color:#fff;letter-spacing:0.15em}
        .cupao-actions{display:flex;gap:0.75rem;align-items:center}
        .cupao-btn{font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;background:#fff;color:var(--rosa);border:none;padding:0.6rem 1.25rem;cursor:pointer;font-family:var(--sans);font-weight:600;flex:1}
        .cupao-fechar{background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;font-size:1.2rem;padding:0;flex-shrink:0}

        /* DESTAQUE */
        .destaque-sec{padding:1.75rem 1.5rem 2rem;background:var(--white)}
        .destaque-header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:1.75rem}
        .destaque-label{font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--rosa);font-weight:500}
        .destaque-ver{font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);text-decoration:none;border-bottom:1px solid var(--g2);padding-bottom:2px;transition:color 0.2s,border-color 0.2s}
        .destaque-ver:hover{color:var(--black);border-color:var(--black)}
        .destaque-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem}

        /* PWA */
        .pwa-banner{position:fixed;bottom:calc(72px + env(safe-area-inset-bottom));left:0;right:0;z-index:210;background:var(--black);color:var(--white);padding:1.25rem 1.25rem 1rem;box-shadow:0 -4px 24px rgba(0,0,0,0.28);animation:slideUp 0.35s ease;display:flex;flex-direction:column;gap:0.75rem}
        @media(min-width:769px){.pwa-banner{display:none}}
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
        .pwa-sec-txt{}
        .pwa-sec-titulo{font-family:var(--serif);font-size:1.4rem;font-weight:300;margin-bottom:0.35rem}
        .pwa-sec-sub{font-size:0.8rem;color:var(--g4);line-height:1.5}
        .pwa-sec-btn{font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;font-family:var(--sans);font-weight:500;padding:0.9rem 2rem;background:var(--black);color:var(--white);border:none;cursor:pointer;white-space:nowrap;transition:background 0.2s;flex-shrink:0;text-decoration:none;display:inline-block}
        .pwa-sec-btn:hover{background:#2a2926}

        /* RESPONSIVE DESKTOP */
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
          .hero-right-desktop{flex:1;position:relative;overflow:hidden;min-height:100%;background:linear-gradient(135deg,#1a0a10 0%,#2d1520 40%,#0d0d0d 100%)}
          .hero-right-desktop video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center}
          .hero-right-desktop img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:var(--hero-pos,center top);transition:transform 6s ease,opacity 1s ease;opacity:0}
          .hero-right-desktop img.visivel{opacity:1}
          .hero-right-desktop:hover img{transform:scale(1.03)}
          .hero-right-placeholder{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem}
          .hero-right-placeholder-logo{font-family:var(--serif);font-size:clamp(3rem,6vw,5rem);font-weight:300;letter-spacing:0.35em;text-transform:uppercase;color:rgba(255,255,255,0.12)}
          .hero-right-placeholder-tag{font-size:0.55rem;letter-spacing:0.4em;text-transform:uppercase;color:rgba(255,255,255,0.08)}
          .hero-caption{position:absolute;bottom:0;left:0;right:0;z-index:2;padding:1.5rem 2rem;background:linear-gradient(to top,rgba(8,8,8,0.6),transparent);color:#fff;display:flex;justify-content:space-between;align-items:flex-end}
          .hero-caption-nome{font-family:var(--serif);font-size:1.1rem;font-style:italic;font-weight:300}
          .hero-caption-preco{font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;opacity:0.8}
          .quick-access{grid-template-columns:repeat(4,1fr)}
          .numeros{grid-template-columns:repeat(4,1fr)}
          .numero{padding:2rem 1.5rem}
          .numero:nth-child(even){border-right:1px solid rgba(255,255,255,0.08)}
          .sec{padding:2.5rem 4rem}
          .como-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px}
          .porque{display:grid;grid-template-columns:1fr 1fr;gap:4rem;padding:2.5rem 4rem;align-items:center}
          .cat-grid{grid-template-columns:repeat(2,1fr);gap:8px}
          .cat-card{aspect-ratio:3/4}
          .sustent{padding:2.5rem 4rem}
          .sustent-inner{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;margin-top:1.25rem}
          .cta-final{padding:3.5rem 4rem}
          footer{padding:3rem 4rem 2rem}
          .footer-cols{grid-template-columns:repeat(3,1fr);gap:3rem;margin-bottom:2rem}
          .footer-bottom{flex-direction:row;justify-content:space-between;align-items:center}
          .nav{padding:1.1rem 3rem}
          .cupao-banner{bottom:0;padding:1rem 3rem}
          .cupao-inner{flex-direction:row;align-items:center;justify-content:space-between}
          .cupao-actions{flex:0}
          .trust-sec{padding:2.5rem 4rem}
          .trust-grid{grid-template-columns:repeat(4,1fr)}
          .depo-sec{padding:3.5rem 4rem}
          .destaque-sec{padding:2rem 4rem 2.5rem}
          .destaque-grid{grid-template-columns:repeat(3,1fr);gap:1.25rem}
          .pwa-sec{flex-direction:row;justify-content:space-between;text-align:left;padding:2.5rem 4rem}
        }
        @media(min-width:1200px){
          .cat-grid{grid-template-columns:repeat(4,1fr)}
          .sec{padding:4rem 5rem}
          .nav{padding:1.25rem 4rem}
          .destaque-grid{grid-template-columns:repeat(4,1fr);gap:1.5rem}
        }
        @media(max-width:768px){
          .hero-right-desktop{display:none}
          .nav{padding:0.9rem 1.25rem}
          .nav-links,.nav-right .nb-o,.nav-right .nb-f{display:none}
          .nav-right{gap:0.5rem}
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* PWA BANNER */}
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

      {/* BANNER CAMPANHA */}
      {banner && campanha && (
        <div className="cupao-banner">
          <div className="cupao-inner">
            <div>
              <div className="cupao-texto">{(lang === "fr" && campanha.mensagem_fr) || (lang === "lt" && campanha.mensagem_lt) || campanha.mensagem || ""}</div>
              {campanha.codigo && <div className="cupao-codigo">{campanha.codigo}</div>}
              {campanha.desconto && !campanha.codigo && <div className="cupao-codigo" style={{fontSize:"1.1rem"}}>{campanha.desconto}</div>}
            </div>
            <div className="cupao-actions">
              {campanha.codigo && <button className="cupao-btn" onClick={copiarCupao}>{cupaoCopiado ? (t.cupao?.copiado || "Copiado ✓") : (t.cupao?.copiar || "Copiar código")}</button>}
              {campanha.url_destino && !campanha.codigo && <a href={campanha.url_destino} className="cupao-btn" style={{textDecoration:"none",textAlign:"center"}}>Ver oferta →</a>}
              <button className="cupao-fechar" onClick={() => { setBanner(false); if (campanha?.id) localStorage.setItem(`ng_banner_${campanha.id}`, "1"); }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <a href="/" className="logo">
          <span className="logo-name">Nora Grei</span>
          <span className="logo-tag">{t.logoTag}</span>
        </a>
        <ul className="nav-links">
          <li><a href="/catalogo">{t.nav.catalogo}</a></li>
          <li><a href="/feed">Feed</a></li>
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
          <a href="/cesto" style={{position:"relative",display:"flex",alignItems:"center",padding:"0.45rem",color:"#080808",lineHeight:1}} title="Cesto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {cestoCont > 0 && <span style={{position:"absolute",top:"-2px",right:"-2px",background:"#c4748a",color:"#fff",fontSize:"0.68rem",fontFamily:"'Jost',sans-serif",fontWeight:600,width:"16px",height:"16px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>{cestoCont > 9 ? "9+" : cestoCont}</span>}
          </a>
          <a href="/catalogo" className="nb nb-f">{t.hero.cta1}</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" style={{"--hero-pos": heroPeca?.hero_position || "center top"}}>
        <div className="hero-bg">
          {videoUrl
            ? <video src={videoUrl} autoPlay muted loop playsInline preload="auto" ref={el => {
                if (!el) return;
                el.muted = true;
                const tryPlay = () => el.play().catch(() => setTimeout(tryPlay, 500));
                if (el.readyState >= 3) tryPlay();
                else el.addEventListener("canplay", tryPlay, { once: true });
              }} />
            : (heroPeca?.fotos?.filter(Boolean)[0])
              ? <img src={heroPeca.fotos.filter(Boolean)[0]} alt="" className={heroCarregado ? "visivel" : ""} />
              : null
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
          <button className="hero-sound" style={{display:"block"}} onClick={() => { const v = document.querySelector(".hero-bg video"); if (v) { v.muted = videoComSom; setVideoComSom(!videoComSom); } }}>
            {videoComSom ? "🔊 Som" : "🔇 Sem som"}
          </button>
        )}
        <div className="hero-right-desktop">
          {videoUrl
            ? <video src={videoUrl} autoPlay muted loop playsInline preload="auto" ref={el => {
                if (!el) return;
                el.muted = true;
                const tryPlay = () => el.play().catch(() => setTimeout(tryPlay, 500));
                if (el.readyState >= 3) tryPlay();
                else el.addEventListener("canplay", tryPlay, { once: true });
              }} />
            : heroPeca?.fotos?.filter(Boolean)[0]
              ? <img src={heroPeca.fotos.filter(Boolean)[0]} alt={heroPeca.nome || "Nora Grei"} className={heroCarregado ? "visivel" : ""} />
              : <div className="hero-right-placeholder"><span className="hero-right-placeholder-logo">Nora Grei</span><span className="hero-right-placeholder-tag">Alugar ou Comprar</span></div>
          }
          {!videoUrl && (
            <div className="hero-caption">
              <span className="hero-caption-nome">{heroPeca ? heroPeca.nome : "Vestido Seda Noite"}</span>
              <span className="hero-caption-preco">{heroPeca?.preco_aluguer_dia ? `${heroPeca.preco_aluguer_dia}€ / dia` : "35€ / dia"}</span>
            </div>
          )}
          {videoUrl && (
            <button className="hero-sound" style={{position:"absolute",bottom:"1.5rem",right:"1.5rem"}} onClick={() => { const v = document.querySelector(".hero-right-desktop video"); if (v) { v.muted = videoComSom; setVideoComSom(!videoComSom); } }}>
              {videoComSom ? "🔊 Som" : "🔇 Sem som"}
            </button>
          )}
        </div>
      </section>

      {/* STRIP */}
      <div className="strip">
        <div className="strip-track">
          {[...Array(4)].map((_, i) => t.strip.map((item, j) => (
            <span key={`${i}-${j}`} className="strip-item">{item}</span>
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
          return (
            <a key={idx} href={href} className="qa-item" target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
              <div className="qa-label">{label}</div>
              <div className="qa-desc">{desc}</div>
              <span className="qa-arrow">→</span>
            </a>
          );
        })}
      </div>

      {/* CATEGORIAS */}
      <section className="sec" style={{paddingBottom:0}}>
        <p className="sec-label">{t.categorias.label}</p>
        <h2 className="sec-titulo">{t.categorias.titulo}<br /><em>{t.categorias.tituloSub}</em></h2>
      </section>
      <div className="cat-grid">
        {t.categorias.lista.map((nomeCat, i) => (
          <a key={i} href="/catalogo" className="cat-card">
            {categoriaFotos[nomeCat]
              ? <img src={categoriaFotos[nomeCat]} alt={nomeCat} />
              : <div style={{width:"100%",height:"100%",background:"linear-gradient(160deg,#e8e4e0,#d5d0c8)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"var(--serif)",fontSize:"2rem",fontWeight:300,color:"rgba(0,0,0,0.08)",fontStyle:"italic"}}>NG</span></div>
            }
            <div className="cat-overlay"><span className="cat-nome">{t.catNomes?.[nomeCat] || nomeCat}</span></div>
          </a>
        ))}
      </div>

      {/* PEÇAS EM DESTAQUE */}
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
                      {peca.fotos?.[0]
                        ? <img src={peca.fotos[0]} alt={peca.nome} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",display:"block"}} />
                        : <div style={{width:"100%",height:"100%",background:"linear-gradient(160deg,#e8e4e0,#d5d0c8)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"var(--serif)",fontSize:"2.5rem",fontWeight:300,color:"rgba(0,0,0,0.06)",fontStyle:"italic"}}>NG</span></div>
                      }
                      {!dispEstado && (
                        <div style={{position:"absolute",top:"0.6rem",right:"0.6rem",fontSize:"0.75rem",letterSpacing:"0.18em",textTransform:"uppercase",background:"rgba(248,247,245,0.92)",color:"#5a5855",padding:"0.25rem 0.55rem",fontFamily:"var(--sans)",fontWeight:400,zIndex:2}}>
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
                            <span style={{fontFamily:"var(--sans)",fontSize:"0.68rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.9)"}}>{t.destaque.dispEm} <strong>{tempo}</strong></span>
                          </div>
                        );
                      })()}
                    </div>
                    <div style={{padding:"0.65rem 0.7rem 0.3rem"}}>
                      {peca.categoria && <p style={{fontSize:"0.75rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#b0ada6",fontFamily:"var(--sans)",marginBottom:"0.15rem"}}>{peca.categoria}</p>}
                      <h3 style={{fontFamily:"var(--sans)",fontSize:"1rem",fontWeight:500,lineHeight:1.2,marginBottom:"0.3rem",color:"#111"}}>{peca.nome}</h3>
                      <div style={{display:"flex",alignItems:"baseline",gap:"0.3rem",paddingTop:"0.4rem",borderTop:"1px solid #ece9e4"}}>
                        <span style={{fontFamily:"var(--sans)",fontSize:"1.1rem",fontWeight:600,color:"#111"}}>{peca.preco_aluguer_dia}€</span>
                        <span style={{fontFamily:"var(--sans)",fontSize:"0.68rem",color:"#b0ada6",fontWeight:300}}>/dia</span>
                      </div>
                    </div>
                  </a>
                  {dispEstado
                    ? <a href={`/catalogo/${peca.id}`} style={{display:"flex",alignItems:"center",justifyContent:"center",margin:"0 0.7rem 0.7rem",padding:"0.72rem",fontSize:"0.78rem",letterSpacing:"0.14em",textTransform:"uppercase",background:"transparent",color:"#5a5855",border:"1px solid #d5d2cd",textAlign:"center",textDecoration:"none",fontFamily:"var(--sans)",fontWeight:400,minHeight:"44px"}}>{t.destaque.alugar}</a>
                    : <a href={`/reserva?peca=${peca.id}`} style={{display:"flex",alignItems:"center",justifyContent:"center",margin:"0 0.7rem 0.7rem",padding:"0.72rem",fontSize:"0.75rem",letterSpacing:"0.12em",textTransform:"uppercase",background:"transparent",color:"#5a5855",border:"1px solid #dedad4",textAlign:"center",textDecoration:"none",fontFamily:"var(--sans)",fontWeight:400,minHeight:"44px"}}>{t.destaque.reservar}</a>
                  }
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* COMO FUNCIONA */}
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

      {/* TRUST */}
      <section className="trust-sec">
        <p className="sec-label">{t.trust.label}</p>
        <div className="trust-grid">
          {t.trust.items.map((item, i) => (
            <div key={i} className="trust-item">
              <span className="trust-icon">{item.icon}</span>
              <div className="trust-titulo">{item.titulo}</div>
              <div className="trust-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PORQUE */}
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

      {/* NÚMEROS */}
      <div className="numeros">
        {t.numeros.map((n, i) => (
          <div key={i} className="numero"><div className="numero-val">{n.val}</div><div className="numero-label">{n.label}</div></div>
        ))}
      </div>

      {/* INSTAGRAM */}
      <section className="insta-sec">
        <p className="insta-label">{t.instagram.label}</p>
        <div className="insta-titulo">{t.instagram.titulo}</div>
        <p className="insta-sub">{t.instagram.sub}</p>
        <a href="https://instagram.com/noragrei" target="_blank" rel="noopener noreferrer" className="insta-btn">{t.instagram.btn} ↗</a>
      </section>

      {/* SUSTENTABILIDADE */}
      <section className="sustent" id="sustentabilidade">
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

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="cta-final-titulo">{t.cta.titulo}</div>
        <div className="cta-final-sub">{t.cta.sub}</div>
        <span className="cta-final-tag">{t.cta.tag}</span>
        <a href="/catalogo" className="cta-final-btn">{t.cta.btn}</a>
      </section>

      {/* PWA SECTION */}
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

      {/* FOOTER */}
      <footer>
        <div className="footer-cols">
          {t.footer.cols.map((col, i) => (
            <div key={i}>
              <div className="footer-col-titulo">{col.titulo}</div>
              <ul className="footer-col-links">
                {col.links.map((link, j) => (
                  <li key={j}><a href={link.h}>{link.l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">{t.footer.copy}</span>
          <div className="footer-social">
            <span className="footer-social-label">{t.footer.social}</span>
            <a href="https://instagram.com/noragrei" target="_blank" rel="noopener noreferrer" className="footer-social-link">Instagram</a>
            <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" className="footer-social-link">noragrei.com</a>
          </div>
        </div>
      </footer>

    </>
  );
}
