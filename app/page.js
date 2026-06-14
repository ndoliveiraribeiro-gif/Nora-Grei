"use client";
import { useState, useEffect } from "react";

const translations = {
  pt: {
    marca: "Nora Grei",
    slogan: "Alugar ou Comprar",
    nav: { catalogo: "Catálogo", comoFunciona: "Como funciona", planos: "Planos", entrar: "Entrar" },
    hero: {
      eyebrow: "Moda de Luxo · Nova Coleção",
      titulo1: "A peça certa,",
      titulo2: "para o momento",
      titulo3: "certo.",
      subtitulo: "Alugue peças únicas da Nora Grei para qualquer ocasião. Sem compromisso, sem armário cheio — só o look perfeito quando precisa.",
      ctaPrincipal: "Onde vais hoje?",
      ctaSecundario: "Ver catálogo",
      pecaExemplo: "Vestido Seda Noite",
      pecaPreco: "35€ / dia",
      novaColecao: "Disponível para alugar",
    },
    strip: ["Envio gratuito", "Depósito 100% devolvido", "Peças inspecionadas e limpas", "Cancele quando quiser", "Alugar ou Comprar"],
    ondeVas: {
      label: "Consulting de estilo",
      titulo1: "Onde vais",
      titulo2: "hoje?",
      subtitulo: "Diz-nos a ocasião e sugerimos o look perfeito — roupa e acessórios incluídos.",
      sugestao: "Look ideal para",
      cta: "Ver sugestões",
      ocasioes: ["Férias", "Concerto", "Gala", "Festa", "Casamento", "Trabalho", "Jantar", "Teatro"],
    },
    processo: {
      label: "O processo",
      titulo: "De casa até ao evento em quatro passos.",
      passos: [
        { num: "01", titulo: "Escolhe a ocasião", desc: "Diz-nos onde vais. Filtramos o catálogo com sugestões personalizadas." },
        { num: "02", titulo: "Seleciona as datas", desc: "Escolhe os dias no calendário. Disponibilidade em tempo real." },
        { num: "03", titulo: "Recebe em casa", desc: "A peça chega limpa e pronta a usar. Ou levanta presencialmente." },
        { num: "04", titulo: "Devolve", desc: "Envie de volta pelo correio. O depósito é devolvido após inspeção." },
      ],
    },
    catalogo: {
      label: "Catálogo",
      titulo: "Roupa e acessórios para cada momento.",
      verColecao: "Ver coleção →",
      categorias: ["Vestidos", "Casacos", "Conjuntos", "Acessórios", "Calçado", "Novidades"],
    },
    planos: {
      label: "Subscrição",
      titulo: "Aluga com frequência? Poupa com um plano.",
      subtitulo: "Os planos são opcionais — pode sempre alugar peça a peça sem compromisso.",
      porMes: "por mês",
      saberMais: "Saber mais",
      popular: "Popular",
      lista: [
        { nome: "Basic", preco: "29,90€", features: ["1 peça por mês", "Envio incluído", "Todo o catálogo"] },
        { nome: "Premium", preco: "69,90€", features: ["3 peças por mês", "Envio incluído", "Acesso prioritário", "Styling notes"] },
        { nome: "VIP", preco: "99,90€", features: ["5 peças por mês", "Envio expresso", "Acesso antecipado", "Consultation mensal"] },
      ],
    },
    deposito: {
      label: "Transparência total",
      titulo: "O depósito protege a peça — e devolve-se sozinho.",
      texto: "Ao alugar, reservamos um depósito equivalente ao valor da peça. É devolvido na íntegra quando a peça regressa em bom estado.",
      metodos: [
        { nome: "Cartão de crédito ou débito", desc: "Via Stripe. Devolvido automaticamente." },
        { nome: "Transferência bancária imediata", desc: "Comprovativo por email. 2 dias úteis." },
        { nome: "Cheque visado pelo banco", desc: "Entregue presencialmente na recolha." },
        { nome: "Dinheiro", desc: "Pago e devolvido em mãos — presencial." },
      ],
    },
    cta: { titulo1: "O look perfeito", titulo2: "começa aqui.", subtitulo: "Diz-nos onde vais e tratamos do resto. Sem subscrição obrigatória.", botao: "Onde vais hoje?" },
    footer: { direitos: "© 2025 Nora Grei. Todos os direitos reservados.", links: ["Catálogo", "Planos", "Como funciona", "Contacto", "Termos", "Privacidade"] },
  },
  fr: {
    marca: "Nora Grei",
    slogan: "Louer ou Acheter",
    nav: { catalogo: "Catalogue", comoFunciona: "Comment ça marche", planos: "Abonnements", entrar: "Connexion" },
    hero: {
      eyebrow: "Mode de Luxe · Nouvelle Collection",
      titulo1: "La pièce parfaite,",
      titulo2: "pour le moment",
      titulo3: "parfait.",
      subtitulo: "Louez des pièces uniques Nora Grei pour chaque occasion. Sans engagement, sans armoire pleine.",
      ctaPrincipal: "Où allez-vous aujourd'hui ?",
      ctaSecundario: "Voir le catalogue",
      pecaExemplo: "Robe Soie Nuit",
      pecaPreco: "35€ / jour",
      novaColecao: "Disponible à la location",
    },
    strip: ["Livraison gratuite", "Dépôt 100% remboursé", "Pièces inspectées et nettoyées", "Annulez quand vous voulez", "Louer ou Acheter"],
    ondeVas: {
      label: "Conseil de style",
      titulo1: "Où allez-vous",
      titulo2: "aujourd'hui ?",
      subtitulo: "Dites-nous l'occasion et nous suggérons le look parfait — vêtements et accessoires inclus.",
      sugestao: "Look idéal pour",
      cta: "Voir les suggestions",
      ocasioes: ["Vacances", "Concert", "Gala", "Fête", "Mariage", "Travail", "Dîner", "Théâtre"],
    },
    processo: {
      label: "Le processus",
      titulo: "De chez vous à l'événement en quatre étapes.",
      passos: [
        { num: "01", titulo: "Choisissez l'occasion", desc: "Dites-nous où vous allez. Nous filtrons le catalogue avec des suggestions personnalisées." },
        { num: "02", titulo: "Sélectionnez les dates", desc: "Choisissez les jours dans le calendrier. Disponibilité en temps réel." },
        { num: "03", titulo: "Recevez chez vous", desc: "La pièce arrive propre et prête à porter. Ou récupérez-la en boutique." },
        { num: "04", titulo: "Retournez", desc: "Renvoyez par courrier. Le dépôt est remboursé après inspection." },
      ],
    },
    catalogo: {
      label: "Catalogue",
      titulo: "Vêtements et accessoires pour chaque moment.",
      verColecao: "Voir la collection →",
      categorias: ["Robes", "Manteaux", "Ensembles", "Accessoires", "Chaussures", "Nouveautés"],
    },
    planos: {
      label: "Abonnement",
      titulo: "Vous louez souvent ? Économisez avec un abonnement.",
      subtitulo: "Les abonnements sont optionnels — vous pouvez toujours louer pièce par pièce.",
      porMes: "par mois",
      saberMais: "En savoir plus",
      popular: "Populaire",
      lista: [
        { nome: "Basic", preco: "29,90€", features: ["1 pièce par mois", "Livraison incluse", "Tout le catalogue"] },
        { nome: "Premium", preco: "69,90€", features: ["3 pièces par mois", "Livraison incluse", "Accès prioritaire", "Conseils styling"] },
        { nome: "VIP", preco: "99,90€", features: ["5 pièces par mois", "Livraison express", "Accès anticipé", "Consultation mensuelle"] },
      ],
    },
    deposito: {
      label: "Transparence totale",
      titulo: "Le dépôt protège la pièce — et se rembourse automatiquement.",
      texto: "Lors de la location, nous réservons un dépôt équivalent à la valeur de la pièce. Il est remboursé intégralement lorsque la pièce revient en bon état.",
      metodos: [
        { nome: "Carte crédit/débit", desc: "Via Stripe. Remboursé automatiquement." },
        { nome: "Virement bancaire immédiat", desc: "Justificatif par email. 2 jours ouvrés." },
        { nome: "Chèque certifié par la banque", desc: "Remis en personne à la récupération." },
        { nome: "Espèces", desc: "Payé et remboursé en mains propres." },
      ],
    },
    cta: { titulo1: "Le look parfait", titulo2: "commence ici.", subtitulo: "Dites-nous où vous allez et nous nous occupons du reste.", botao: "Où allez-vous aujourd'hui ?" },
    footer: { direitos: "© 2025 Nora Grei. Tous droits réservés.", links: ["Catalogue", "Abonnements", "Comment ça marche", "Contact", "CGU", "Confidentialité"] },
  },
  lt: {
    marca: "Nora Grei",
    slogan: "Nuomoti ar Pirkti",
    nav: { catalogo: "Katalogas", comoFunciona: "Kaip tai veikia", planos: "Planai", entrar: "Prisijungti" },
    hero: {
      eyebrow: "Prabangos mada · Nauja kolekcija",
      titulo1: "Tinkamas drabužis,",
      titulo2: "tinkamu",
      titulo3: "momentu.",
      subtitulo: "Išsinuomokite unikalius Nora Grei kūrinius kiekvienai progai. Be įsipareigojimų, be perpildytos spintos.",
      ctaPrincipal: "Kur šiandien einate?",
      ctaSecundario: "Žiūrėti katalogą",
      pecaExemplo: "Šilkinė vakarinė suknelė",
      pecaPreco: "35€ / dieną",
      novaColecao: "Prieinama nuomai",
    },
    strip: ["Nemokamas pristatymas", "Užstatas grąžinamas 100%", "Drabužiai patikrinti ir išvalyti", "Atšaukite kada norite", "Nuomoti ar Pirkti"],
    ondeVas: {
      label: "Stiliaus konsultacija",
      titulo1: "Kur šiandien",
      titulo2: "einate?",
      subtitulo: "Pasakykite mums progą ir mes pasiūlysime tobulą įvaizdį — drabužiai ir aksesuarai įskaičiuoti.",
      sugestao: "Tobulas įvaizdis",
      cta: "Žiūrėti pasiūlymus",
      ocasioes: ["Atostogos", "Koncertas", "Gala", "Vakarėlis", "Vestuvės", "Darbas", "Vakarienė", "Teatras"],
    },
    processo: {
      label: "Procesas",
      titulo: "Nuo namų iki renginio keturiais žingsniais.",
      passos: [
        { num: "01", titulo: "Pasirinkite progą", desc: "Pasakykite mums kur einate. Filtruojame katalogą su asmeniniais pasiūlymais." },
        { num: "02", titulo: "Pasirinkite datas", desc: "Pasirinkite dienas kalendoriuje. Prieinamumas rodomas realiuoju laiku." },
        { num: "03", titulo: "Gaukite namuose", desc: "Drabužis atvyksta švarus ir paruoštas dėvėti. Arba atsiimkite asmeniškai." },
        { num: "04", titulo: "Grąžinkite", desc: "Išsiųskite atgal paštu. Užstatas grąžinamas po patikrinimo." },
      ],
    },
    catalogo: {
      label: "Katalogas",
      titulo: "Drabužiai ir aksesuarai kiekvienai progai.",
      verColecao: "Žiūrėti kolekciją →",
      categorias: ["Suknelės", "Paltai", "Komplektai", "Aksesuarai", "Avalynė", "Naujienos"],
    },
    planos: {
      label: "Prenumerata",
      titulo: "Nuomojate dažnai? Taupykite su planu.",
      subtitulo: "Prenumeratos planai yra neprivalomi — visada galite nuomotis po vieną drabužį.",
      porMes: "per mėnesį",
      saberMais: "Sužinoti daugiau",
      popular: "Populiarus",
      lista: [
        { nome: "Basic", preco: "29,90€", features: ["1 drabužis per mėnesį", "Pristatymas įskaičiuotas", "Visas katalogas"] },
        { nome: "Premium", preco: "69,90€", features: ["3 drabužiai per mėnesį", "Pristatymas įskaičiuotas", "Prioritetinė prieiga", "Stiliaus patarimai"] },
        { nome: "VIP", preco: "99,90€", features: ["5 drabužiai per mėnesį", "Ekspresinis pristatymas", "Ankstyva prieiga", "Mėnesinė konsultacija"] },
      ],
    },
    deposito: {
      label: "Visiškas skaidrumas",
      titulo: "Užstatas apsaugo drabužį — ir grąžinamas automatiškai.",
      texto: "Nuomojant rezervuojame užstatą, lygų drabužio vertei. Jis grąžinamas pilnai, kai drabužis grįžta geros būklės.",
      metodos: [
        { nome: "Kredito/debeto kortelė", desc: "Per Stripe. Grąžinama automatiškai." },
        { nome: "Skubus banko pavedimas", desc: "Patvirtinimas el. paštu. 2 darbo dienos." },
        { nome: "Banko patvirtintas čekis", desc: "Pateikiamas asmeniškai atsiimant." },
        { nome: "Grynieji pinigai", desc: "Mokama ir grąžinama rankomis." },
      ],
    },
    cta: { titulo1: "Tobulas įvaizdis", titulo2: "prasideda čia.", subtitulo: "Pasakykite mums kur einate ir mes pasirūpinsime viskuo.", botao: "Kur šiandien einate?" },
    footer: { direitos: "© 2025 Nora Grei. Visos teisės saugomos.", links: ["Katalogas", "Planai", "Kaip tai veikia", "Kontaktai", "Sąlygos", "Privatumas"] },
  },
};

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [lang, setLang] = useState("pt");

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && translations[saved]) { setLang(saved); return; }
    const browser = navigator.language?.slice(0, 2);
    if (browser === "fr") setLang("fr");
    else if (browser === "lt") setLang("lt");
  }, []);

  const changeLang = (l) => { localStorage.setItem("ng_lang", l); setLang(l); };
  const t = translations[lang];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --black: #080808; --white: #f8f7f5; --grey-100: #f0eeeb;
          --grey-200: #e2dfda; --grey-400: #aaa89f; --grey-600: #6b6960; --grey-800: #2a2926;
          --serif: 'Cormorant', Georgia, serif; --sans: 'Jost', Arial, sans-serif;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--white); color: var(--black); font-family: var(--sans); font-weight: 300; -webkit-font-smoothing: antialiased; }

        nav { position: fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.5rem 4rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--grey-200); }
        .logo { display:flex; flex-direction:column; text-decoration:none; color:var(--black); }
        .logo-name { font-family:var(--serif); font-size:1.35rem; font-weight:300; letter-spacing:0.25em; text-transform:uppercase; line-height:1; }
        .logo-tagline { font-size:0.5rem; letter-spacing:0.35em; text-transform:uppercase; color:var(--grey-400); margin-top:0.2rem; font-weight:300; }
        .nav-links { display:flex; align-items:center; gap:2.5rem; list-style:none; }
        .nav-links a { font-size:0.62rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--grey-600); text-decoration:none; font-weight:300; transition:color 0.2s; }
        .nav-links a:hover { color:var(--black); }
        .nav-right { display:flex; align-items:center; gap:1.5rem; }
        .nav-lang { display:flex; align-items:center; gap:0.4rem; }
        .lang-btn { font-size:0.55rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-400); background:none; border:none; cursor:pointer; font-family:var(--sans); font-weight:300; padding:0; transition:color 0.2s; }
        .lang-btn:hover, .lang-btn.active { color:var(--black); font-weight:400; }
        .lang-sep { color:var(--grey-200); font-size:0.55rem; }
        .nav-btn { font-size:0.6rem; letter-spacing:0.18em; text-transform:uppercase; padding:0.55rem 1.25rem; text-decoration:none; font-weight:300; font-family:var(--sans); transition:all 0.25s; white-space:nowrap; }
        .nav-btn-outline { color:var(--black); border:1px solid var(--black); }
        .nav-btn-outline:hover { background:var(--black); color:var(--white); }
        .nav-btn-fill { background:var(--black); color:var(--white); }
        .nav-btn-fill:hover { background:var(--grey-800); }

        .hero { min-height:100vh; display:grid; grid-template-columns:55% 45%; padding-top:80px; }
        .hero-left { display:flex; flex-direction:column; justify-content:center; padding:6rem 4rem 6rem 6rem; }
        .hero-eyebrow { font-size:0.6rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--grey-400); margin-bottom:2.5rem; font-weight:300; }
        .hero-title { font-family:var(--serif); font-size:clamp(3.5rem,5.5vw,6rem); font-weight:300; line-height:1.02; margin-bottom:2.5rem; }
        .hero-title em { font-style:italic; color:var(--grey-600); display:block; }
        .hero-divider { width:40px; height:1px; background:var(--grey-400); margin-bottom:2rem; }
        .hero-sub { font-size:0.88rem; color:var(--grey-600); max-width:42ch; line-height:2; margin-bottom:3.5rem; font-weight:300; }
        .hero-actions { display:flex; align-items:center; gap:2.5rem; }
        .btn-primary { font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; background:var(--black); color:var(--white); padding:1rem 2.5rem; text-decoration:none; font-weight:300; transition:background 0.3s; font-family:var(--sans); display:inline-block; }
        .btn-primary:hover { background:var(--grey-800); }
        .btn-text { font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--grey-600); text-decoration:none; font-weight:300; border-bottom:1px solid var(--grey-200); padding-bottom:2px; transition:color 0.2s,border-color 0.2s; }
        .btn-text:hover { color:var(--black); border-color:var(--black); }
        .hero-right { position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:flex-end; }
        .hero-right img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center top; }
        .hero-caption { position:relative; z-index:2; background:rgba(248,247,245,0.92); padding:1.25rem 2rem; display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--grey-200); }
        .hero-caption-name { font-family:var(--serif); font-size:1rem; font-style:italic; font-weight:300; }
        .hero-caption-price { font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-600); }
        .hero-caption-tag { font-size:0.55rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--grey-400); margin-top:0.2rem; text-align:right; }

        .strip { background:var(--black); padding:0.9rem 0; overflow:hidden; }
        .strip-track { display:flex; white-space:nowrap; animation:marquee 25s linear infinite; }
        .strip-item { font-size:0.58rem; letter-spacing:0.25em; text-transform:uppercase; color:rgba(255,255,255,0.5); padding:0 3rem; flex-shrink:0; font-weight:300; }
        .strip-item::after { content:'—'; margin-left:3rem; color:rgba(255,255,255,0.15); }
        @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }

        .section-label { font-size:0.58rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--grey-400); margin-bottom:1rem; font-weight:300; }
        .section-title { font-family:var(--serif); font-size:clamp(2.5rem,4vw,4.5rem); font-weight:300; line-height:1.08; margin-bottom:4rem; }
        .section-title em { font-style:italic; color:var(--grey-600); }

        .onde-section { padding:8rem 6rem; }
        .onde-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:3rem; }
        .onde-sub { font-size:0.85rem; color:var(--grey-600); max-width:32ch; text-align:right; line-height:2; font-weight:300; }
        .occasions-grid { display:grid; grid-template-columns:repeat(8,1fr); border:1px solid var(--grey-200); }
        .occasion-btn { padding:2.5rem 1rem; text-align:center; cursor:pointer; border:none; border-right:1px solid var(--grey-200); background:var(--white); font-family:var(--serif); font-size:1.15rem; font-weight:300; color:var(--grey-600); transition:all 0.25s; }
        .occasion-btn:last-child { border-right:none; }
        .occasion-btn:hover { background:var(--grey-100); color:var(--black); }
        .occasion-btn.active { background:var(--black); color:var(--white); }
        .onde-result { margin-top:2rem; padding:2rem 2.5rem; border:1px solid var(--grey-200); display:flex; align-items:center; justify-content:space-between; gap:2rem; }
        .onde-result-text { font-family:var(--serif); font-size:1.3rem; font-style:italic; color:var(--grey-600); }
        .onde-result-text strong { color:var(--black); font-style:normal; font-weight:400; }

        .process-section { background:var(--grey-100); padding:8rem 6rem; }
        .process-grid { display:grid; grid-template-columns:repeat(4,1fr); margin-top:4rem; }
        .process-step { padding:0 2.5rem 0 0; border-right:1px solid var(--grey-200); }
        .process-step:last-child { border-right:none; padding-right:0; }
        .process-step:not(:first-child) { padding-left:2.5rem; }
        .process-num { font-family:var(--serif); font-size:4rem; font-weight:300; color:var(--grey-200); line-height:1; margin-bottom:1.5rem; }
        .process-title { font-family:var(--serif); font-size:1.3rem; font-weight:400; margin-bottom:1rem; }
        .process-desc { font-size:0.82rem; color:var(--grey-600); line-height:2; font-weight:300; }

        .catalog-section { padding:8rem 6rem; }
        .catalog-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:4rem; }
        .catalog-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--grey-200); }
        .catalog-card { background:var(--white); padding:3rem 2.5rem; display:flex; flex-direction:column; gap:0.75rem; cursor:pointer; transition:background 0.25s; text-decoration:none; color:var(--black); }
        .catalog-card:hover { background:var(--grey-100); }
        .catalog-card-num { font-size:0.55rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--grey-400); font-weight:300; }
        .catalog-card-name { font-family:var(--serif); font-size:1.8rem; font-weight:300; }
        .catalog-card-arrow { font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--grey-400); margin-top:auto; padding-top:1.5rem; border-top:1px solid var(--grey-200); font-weight:300; }

        .plans-section { background:var(--grey-100); padding:8rem 6rem; }
        .plans-intro { display:grid; grid-template-columns:1fr 1fr; gap:6rem; align-items:end; margin-bottom:4rem; }
        .plans-intro-sub { font-size:0.85rem; color:var(--grey-600); line-height:2; font-weight:300; }
        .plans-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--grey-200); }
        .plan-card { background:var(--white); padding:2.5rem; position:relative; }
        .plan-card.featured { background:var(--black); color:var(--white); }
        .plan-tag { position:absolute; top:0; right:2rem; font-size:0.5rem; letter-spacing:0.2em; text-transform:uppercase; background:var(--grey-600); color:var(--white); padding:0.25rem 0.75rem; font-weight:300; }
        .plan-name { font-size:0.58rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--grey-400); margin-bottom:1.5rem; font-weight:300; }
        .plan-card.featured .plan-name { color:var(--grey-600); }
        .plan-price { font-family:var(--serif); font-size:3rem; font-weight:300; line-height:1; }
        .plan-period { font-size:0.65rem; color:var(--grey-400); margin-top:0.25rem; margin-bottom:2rem; font-weight:300; }
        .plan-card.featured .plan-period { color:var(--grey-600); }
        .plan-line { height:1px; background:var(--grey-200); margin-bottom:1.5rem; }
        .plan-card.featured .plan-line { background:#2a2926; }
        .plan-features { list-style:none; display:flex; flex-direction:column; gap:0.6rem; margin-bottom:2rem; }
        .plan-features li { font-size:0.78rem; color:var(--grey-600); display:flex; align-items:center; gap:1rem; font-weight:300; }
        .plan-card.featured .plan-features li { color:var(--grey-400); }
        .plan-features li::before { content:''; width:20px; height:1px; background:var(--grey-400); flex-shrink:0; }
        .plan-btn { display:block; text-align:center; font-size:0.58rem; letter-spacing:0.2em; text-transform:uppercase; padding:0.85rem; text-decoration:none; border:1px solid var(--grey-800); color:var(--grey-800); transition:all 0.25s; font-weight:300; font-family:var(--sans); }
        .plan-btn:hover { background:var(--black); color:var(--white); border-color:var(--black); }
        .plan-card.featured .plan-btn { border-color:var(--grey-600); color:var(--grey-400); }
        .plan-card.featured .plan-btn:hover { background:var(--white); color:var(--black); border-color:var(--white); }

        .deposit-section { padding:8rem 6rem; display:grid; grid-template-columns:1fr 1fr; gap:8rem; align-items:start; border-top:1px solid var(--grey-200); }
        .deposit-title { font-family:var(--serif); font-size:clamp(1.8rem,2.5vw,3rem); font-weight:300; line-height:1.2; margin-bottom:1.5rem; }
        .deposit-text { font-size:0.85rem; color:var(--grey-600); line-height:2; font-weight:300; }
        .deposit-methods { display:flex; flex-direction:column; border:1px solid var(--grey-200); }
        .deposit-method { padding:1.25rem 1.5rem; border-bottom:1px solid var(--grey-200); display:flex; align-items:center; justify-content:space-between; gap:1rem; }
        .deposit-method:last-child { border-bottom:none; }
        .deposit-method-name { font-size:0.82rem; font-weight:300; }
        .deposit-method-desc { font-size:0.68rem; color:var(--grey-400); text-align:right; font-weight:300; }

        .cta-section { background:var(--black); color:var(--white); padding:10rem 6rem; text-align:center; display:flex; flex-direction:column; align-items:center; }
        .cta-title { font-family:var(--serif); font-size:clamp(3rem,6vw,6rem); font-weight:300; line-height:1.05; max-width:16ch; margin-bottom:2.5rem; }
        .cta-title em { font-style:italic; color:var(--grey-600); }
        .cta-sub { font-size:0.82rem; color:var(--grey-600); margin-bottom:3.5rem; max-width:50ch; line-height:2; font-weight:300; }
        .btn-inv { font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; border:1px solid rgba(255,255,255,0.3); color:var(--white); padding:1rem 3rem; text-decoration:none; font-weight:300; transition:all 0.3s; font-family:var(--sans); }
        .btn-inv:hover { background:var(--white); color:var(--black); border-color:var(--white); }

        footer { padding:3rem 6rem; border-top:1px solid var(--grey-200); display:grid; grid-template-columns:1fr auto; align-items:center; gap:2rem; }
        .footer-logo { font-family:var(--serif); font-size:1rem; letter-spacing:0.2em; text-transform:uppercase; font-weight:300; }
        .footer-sub { font-size:0.52rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--grey-400); margin-top:0.3rem; font-weight:300; }
        .footer-links { display:flex; gap:2.5rem; list-style:none; }
        .footer-links a { font-size:0.6rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--grey-400); text-decoration:none; font-weight:300; transition:color 0.2s; }
        .footer-links a:hover { color:var(--black); }
        .footer-copy { grid-column:1/-1; font-size:0.6rem; color:var(--grey-400); padding-top:1.5rem; border-top:1px solid var(--grey-100); font-weight:300; }

        @media (max-width:900px) {
          nav { padding:1rem 1.5rem; }
          .nav-links { display:none; }
          .hero { grid-template-columns:1fr; min-height:auto; }
          .hero-left { padding:3rem 1.5rem; }
          .hero-right { height:70vw; }
          .onde-section,.catalog-section,.cta-section,.process-section,.plans-section { padding:5rem 1.5rem; }
          .deposit-section { padding:5rem 1.5rem; grid-template-columns:1fr; gap:3rem; }
          .occasions-grid { grid-template-columns:repeat(4,1fr); }
          .occasion-btn { padding:1.5rem 0.5rem; font-size:0.95rem; }
          .onde-header { flex-direction:column; align-items:flex-start; gap:1rem; }
          .onde-sub { text-align:left; }
          .process-grid { grid-template-columns:1fr 1fr; gap:3rem; }
          .process-step { border-right:none; padding:0; }
          .catalog-grid,.plans-grid { grid-template-columns:1fr; }
          .plans-intro { grid-template-columns:1fr; gap:2rem; }
          .catalog-header { flex-direction:column; align-items:flex-start; gap:1.5rem; }
          footer { grid-template-columns:1fr; padding:2rem 1.5rem; }
          .footer-links { flex-wrap:wrap; gap:1.5rem; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav>
        <a href="/" className="logo">
          <span className="logo-name">{t.marca}</span>
          <span className="logo-tagline">{t.slogan}</span>
        </a>
        <ul className="nav-links">
          <li><a href="#catalogo">{t.nav.catalogo}</a></li>
          <li><a href="#onde-vas">{t.ondeVas.titulo1}</a></li>
          <li><a href="#planos">{t.nav.planos}</a></li>
          <li><a href="#como-funciona">{t.nav.comoFunciona}</a></li>
        </ul>
        <div className="nav-right">
          <div className="nav-lang">
            <button className={"lang-btn" + (lang === "pt" ? " active" : "")} onClick={() => changeLang("pt")}>PT</button>
            <span className="lang-sep">/</span>
            <button className={"lang-btn" + (lang === "fr" ? " active" : "")} onClick={() => changeLang("fr")}>FR</button>
            <span className="lang-sep">/</span>
            <button className={"lang-btn" + (lang === "lt" ? " active" : "")} onClick={() => changeLang("lt")}>LT</button>
          </div>
          <a href="/entrar" className="nav-btn nav-btn-outline">{t.nav.entrar}</a>
          <a href="#onde-vas" className="nav-btn nav-btn-fill">{t.hero.ctaPrincipal}</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">{t.hero.eyebrow}</p>
          <h1 className="hero-title">
            {t.hero.titulo1}<br />
            {t.hero.titulo2}<br />
            <em>{t.hero.titulo3}</em>
          </h1>
          <div className="hero-divider"></div>
          <p className="hero-sub">{t.hero.subtitulo}</p>
          <div className="hero-actions">
            <a href="#onde-vas" className="btn-primary">{t.hero.ctaPrincipal}</a>
            <a href="#catalogo" className="btn-text">{t.hero.ctaSecundario}</a>
          </div>
        </div>
        <div className="hero-right">
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" alt="Nora Grei" />
          <div className="hero-caption">
            <span className="hero-caption-name">{t.hero.pecaExemplo}</span>
            <div>
              <div className="hero-caption-price">{t.hero.pecaPreco}</div>
              <div className="hero-caption-tag">{t.hero.novaColecao}</div>
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="strip">
        <div className="strip-track">
          {[...Array(2)].map((_, i) =>
            t.strip.map((item, j) => (
              <span key={`${i}-${j}`} className="strip-item">{item}</span>
            ))
          )}
        </div>
      </div>

      {/* ONDE VAS */}
      <section className="onde-section" id="onde-vas">
        <div className="onde-header">
          <div>
            <p className="section-label">{t.ondeVas.label}</p>
            <h2 className="section-title" style={{marginBottom:0}}>
              {t.ondeVas.titulo1}<br /><em>{t.ondeVas.titulo2}</em>
            </h2>
          </div>
          <p className="onde-sub">{t.ondeVas.subtitulo}</p>
        </div>
        <div style={{marginTop:'3rem'}}>
          <div className="occasions-grid">
            {t.ondeVas.ocasioes.map((o, i) => (
              <button key={i} className={"occasion-btn" + (selected === i ? " active" : "")} onClick={() => setSelected(i)}>
                {o}
              </button>
            ))}
          </div>
          {selected !== null && (
            <div className="onde-result">
              <p className="onde-result-text">
                {t.ondeVas.sugestao} <strong>{t.ondeVas.ocasioes[selected]}</strong>
              </p>
              <a href="#catalogo" className="btn-primary">{t.ondeVas.cta}</a>
            </div>
          )}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="process-section" id="como-funciona">
        <p className="section-label">{t.processo.label}</p>
        <h2 className="section-title">{t.processo.titulo}</h2>
        <div className="process-grid">
          {t.processo.passos.map((p) => (
            <div key={p.num} className="process-step">
              <div className="process-num">{p.num}</div>
              <h3 className="process-title">{p.titulo}</h3>
              <p className="process-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATÁLOGO */}
      <section className="catalog-section" id="catalogo">
        <div className="catalog-header">
          <div>
            <p className="section-label">{t.catalogo.label}</p>
            <h2 className="section-title" style={{marginBottom:0}}>{t.catalogo.titulo}</h2>
          </div>
          <a href="#" className="btn-text">{t.catalogo.verColecao}</a>
        </div>
        <div className="catalog-grid">
          {t.catalogo.categorias.map((name, i) => (
            <a key={i} href="#" className="catalog-card">
              <span className="catalog-card-num">0{i+1}</span>
              <span className="catalog-card-name">{name}</span>
              <span className="catalog-card-arrow">{t.catalogo.verColecao}</span>
            </a>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section className="plans-section" id="planos">
        <div className="plans-intro">
          <div>
            <p className="section-label">{t.planos.label}</p>
            <h2 className="section-title" style={{marginBottom:0}}>{t.planos.titulo}</h2>
          </div>
          <p className="plans-intro-sub">{t.planos.subtitulo}</p>
        </div>
        <div className="plans-grid">
          {t.planos.lista.map((plan, i) => (
            <div key={i} className={"plan-card" + (i === 1 ? " featured" : "")}>
              {i === 1 && <div className="plan-tag">{t.planos.popular}</div>}
              <p className="plan-name">{plan.nome}</p>
              <div className="plan-price">{plan.preco}</div>
              <p className="plan-period">{t.planos.porMes}</p>
              <div className="plan-line"></div>
              <ul className="plan-features">
                {plan.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              <a href="#" className="plan-btn">{t.planos.saberMais}</a>
            </div>
          ))}
        </div>
      </section>

      {/* DEPÓSITO */}
      <section className="deposit-section">
        <div>
          <p className="section-label">{t.deposito.label}</p>
          <h2 className="deposit-title">{t.deposito.titulo}</h2>
          <p className="deposit-text">{t.deposito.texto}</p>
        </div>
        <div className="deposit-methods">
          {t.deposito.metodos.map((m, i) => (
            <div key={i} className="deposit-method">
              <span className="deposit-method-name">{m.nome}</span>
              <span className="deposit-method-desc">{m.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">{t.cta.titulo1}<br /><em>{t.cta.titulo2}</em></h2>
        <p className="cta-sub">{t.cta.subtitulo}</p>
        <a href="#onde-vas" className="btn-inv">{t.cta.botao}</a>
      </section>

      {/* FOOTER */}
      <footer>
        <div>
          <div className="footer-logo">{t.marca}</div>
          <div className="footer-sub">{t.slogan}</div>
        </div>
        <ul className="footer-links">
          {t.footer.links.map((l, i) => <li key={i}><a href="#">{l}</a></li>)}
        </ul>
        <p className="footer-copy">{t.footer.direitos}</p>
      </footer>
    </>
  );
}