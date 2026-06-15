"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const translations = {
  pt: {
    marca: "Nora Grei", slogan: "Alugar ou Comprar",
    nav: { catalogo: "Catálogo", comoFunciona: "Como funciona", planos: "Planos", entrar: "Entrar" },
    hero: {
      eyebrow: "Moda de Luxo · Nova Coleção",
      titulo1: "A peça certa,", titulo2: "para o momento", titulo3: "certo.",
      subtitulo: "Alugue peças únicas da Nora Grei para qualquer ocasião. Sem compromisso — só o look perfeito quando precisa.",
      ctaPrincipal: "Onde vais hoje?", ctaSecundario: "Ver catálogo",
      pecaExemplo: "Vestido Seda Noite", pecaPreco: "35€ / dia", novaColecao: "Disponível para alugar",
    },
    strip: ["Envio gratuito", "Depósito 100% devolvido", "Peças inspecionadas", "Cancele quando quiser", "Alugar ou Comprar"],
    ondeVas: {
      label: "Consulting de estilo", titulo1: "Onde vais", titulo2: "hoje?",
      subtitulo: "Diz-nos a ocasião e sugerimos o look perfeito.", sugestao: "Look ideal para", cta: "Ver sugestões",
      ocasioes: ["Férias", "Concerto", "Gala", "Festa", "Casamento", "Trabalho", "Jantar", "Teatro"],
    },
    processo: {
      label: "O processo", titulo: "De casa ao evento em quatro passos.",
      passos: [
        { num: "01", titulo: "Escolhe a ocasião", desc: "Filtramos o catálogo com sugestões personalizadas." },
        { num: "02", titulo: "Seleciona as datas", desc: "Disponibilidade em tempo real no calendário." },
        { num: "03", titulo: "Recebe em casa", desc: "A peça chega limpa e pronta a usar." },
        { num: "04", titulo: "Devolve", desc: "O depósito é devolvido após inspeção." },
      ],
    },
    catalogo: { label: "Catálogo", titulo: "Roupa e acessórios para cada momento.", verColecao: "Ver →", categorias: ["Vestidos", "Casacos", "Conjuntos", "Acessórios", "Calçado", "Novidades"] },
    planos: {
      label: "Subscrição", titulo: "Aluga com frequência? Poupa com um plano.",
      subtitulo: "Os planos são opcionais — podes sempre alugar peça a peça.",
      porMes: "/ mês", saberMais: "Saber mais", popular: "Popular",
      lista: [
        { nome: "Basic", preco: "29,90€", features: ["1 peça por mês", "Envio incluído", "Todo o catálogo"] },
        { nome: "Premium", preco: "69,90€", features: ["3 peças por mês", "Envio incluído", "Acesso prioritário", "Styling notes"] },
        { nome: "VIP", preco: "99,90€", features: ["5 peças por mês", "Envio expresso", "Acesso antecipado", "Consultation mensal"] },
      ],
    },
    deposito: {
      label: "Transparência total", titulo: "O depósito protege a peça — e devolve-se sozinho.",
      texto: "Ao alugar, reservamos um depósito equivalente ao valor da peça. É devolvido na íntegra quando a peça regressa em bom estado.",
      metodos: [
        { nome: "Cartão de crédito ou débito", desc: "Via Stripe. Devolvido automaticamente." },
        { nome: "Transferência bancária imediata", desc: "Comprovativo por email. 2 dias úteis." },
        { nome: "Cheque visado pelo banco", desc: "Entregue presencialmente na recolha." },
        { nome: "Dinheiro", desc: "Pago e devolvido em mãos — presencial." },
      ],
    },
    cta: { titulo1: "O look perfeito", titulo2: "começa aqui.", subtitulo: "Diz-nos onde vais e tratamos do resto.", botao: "Onde vais hoje?" },
    footer: { direitos: "© 2025 Nora Grei. Todos os direitos reservados.", links: ["Catálogo", "Planos", "Como funciona", "Contacto", "Termos", "Privacidade"] },
    bottomNav: { inicio: "Início", catalogo: "Catálogo", pedidos: "Pedidos", perfil: "Perfil" },
  },
  fr: {
    marca: "Nora Grei", slogan: "Louer ou Acheter",
    nav: { catalogo: "Catalogue", comoFunciona: "Comment ça marche", planos: "Abonnements", entrar: "Connexion" },
    hero: {
      eyebrow: "Mode de Luxe · Nouvelle Collection",
      titulo1: "La pièce parfaite,", titulo2: "pour le moment", titulo3: "parfait.",
      subtitulo: "Louez des pièces uniques Nora Grei pour chaque occasion. Sans engagement — juste le look idéal.",
      ctaPrincipal: "Où allez-vous ?", ctaSecundario: "Voir le catalogue",
      pecaExemplo: "Robe Soie Nuit", pecaPreco: "35€ / jour", novaColecao: "Disponible à la location",
    },
    strip: ["Livraison gratuite", "Dépôt 100% remboursé", "Pièces inspectées", "Annulez quand vous voulez", "Louer ou Acheter"],
    ondeVas: {
      label: "Conseil de style", titulo1: "Où allez-vous", titulo2: "aujourd'hui ?",
      subtitulo: "Dites-nous l'occasion et nous suggérons le look parfait.", sugestao: "Look idéal pour", cta: "Voir les suggestions",
      ocasioes: ["Vacances", "Concert", "Gala", "Fête", "Mariage", "Travail", "Dîner", "Théâtre"],
    },
    processo: {
      label: "Le processus", titulo: "De chez vous à l'événement en quatre étapes.",
      passos: [
        { num: "01", titulo: "Choisissez l'occasion", desc: "Suggestions personnalisées du catalogue." },
        { num: "02", titulo: "Sélectionnez les dates", desc: "Disponibilité en temps réel." },
        { num: "03", titulo: "Recevez chez vous", desc: "La pièce arrive propre et prête." },
        { num: "04", titulo: "Retournez", desc: "Le dépôt est remboursé après inspection." },
      ],
    },
    catalogo: { label: "Catalogue", titulo: "Vêtements et accessoires pour chaque moment.", verColecao: "Voir →", categorias: ["Robes", "Manteaux", "Ensembles", "Accessoires", "Chaussures", "Nouveautés"] },
    planos: {
      label: "Abonnement", titulo: "Vous louez souvent ? Économisez avec un abonnement.",
      subtitulo: "Les abonnements sont optionnels — vous pouvez toujours louer pièce par pièce.",
      porMes: "/ mois", saberMais: "En savoir plus", popular: "Populaire",
      lista: [
        { nome: "Basic", preco: "29,90€", features: ["1 pièce par mois", "Livraison incluse", "Tout le catalogue"] },
        { nome: "Premium", preco: "69,90€", features: ["3 pièces par mois", "Livraison incluse", "Accès prioritaire", "Conseils styling"] },
        { nome: "VIP", preco: "99,90€", features: ["5 pièces par mois", "Livraison express", "Accès anticipé", "Consultation mensuelle"] },
      ],
    },
    deposito: {
      label: "Transparence totale", titulo: "Le dépôt protège la pièce — et se rembourse automatiquement.",
      texto: "Lors de la location, nous réservons un dépôt équivalent à la valeur de la pièce.",
      metodos: [
        { nome: "Carte crédit/débit", desc: "Via Stripe. Remboursé automatiquement." },
        { nome: "Virement bancaire immédiat", desc: "Justificatif par email. 2 jours ouvrés." },
        { nome: "Chèque certifié par la banque", desc: "Remis en personne à la récupération." },
        { nome: "Espèces", desc: "Payé et remboursé en mains propres." },
      ],
    },
    cta: { titulo1: "Le look parfait", titulo2: "commence ici.", subtitulo: "Dites-nous où vous allez et nous nous occupons du reste.", botao: "Où allez-vous ?" },
    footer: { direitos: "© 2025 Nora Grei. Tous droits réservés.", links: ["Catalogue", "Abonnements", "Comment ça marche", "Contact", "CGU", "Confidentialité"] },
    bottomNav: { inicio: "Accueil", catalogo: "Catalogue", pedidos: "Commandes", perfil: "Profil" },
  },
  lt: {
    marca: "Nora Grei", slogan: "Nuomoti ar Pirkti",
    nav: { catalogo: "Katalogas", comoFunciona: "Kaip tai veikia", planos: "Planai", entrar: "Prisijungti" },
    hero: {
      eyebrow: "Prabangos mada · Nauja kolekcija",
      titulo1: "Tinkamas drabužis,", titulo2: "tinkamu", titulo3: "momentu.",
      subtitulo: "Išsinuomokite unikalius Nora Grei kūrinius kiekvienai progai. Be įsipareigojimų.",
      ctaPrincipal: "Kur šiandien einate?", ctaSecundario: "Žiūrėti katalogą",
      pecaExemplo: "Šilkinė vakarinė suknelė", pecaPreco: "35€ / dieną", novaColecao: "Prieinama nuomai",
    },
    strip: ["Nemokamas pristatymas", "Užstatas grąžinamas 100%", "Drabužiai patikrinti", "Atšaukite kada norite", "Nuomoti ar Pirkti"],
    ondeVas: {
      label: "Stiliaus konsultacija", titulo1: "Kur šiandien", titulo2: "einate?",
      subtitulo: "Pasakykite progą ir mes pasiūlysime tobulą įvaizdį.", sugestao: "Tobulas įvaizdis", cta: "Žiūrėti pasiūlymus",
      ocasioes: ["Atostogos", "Koncertas", "Gala", "Vakarėlis", "Vestuvės", "Darbas", "Vakarienė", "Teatras"],
    },
    processo: {
      label: "Procesas", titulo: "Nuo namų iki renginio keturiais žingsniais.",
      passos: [
        { num: "01", titulo: "Pasirinkite progą", desc: "Asmeniniai pasiūlymai iš katalogo." },
        { num: "02", titulo: "Pasirinkite datas", desc: "Prieinamumas rodomas realiuoju laiku." },
        { num: "03", titulo: "Gaukite namuose", desc: "Drabužis atvyksta švarus ir paruoštas." },
        { num: "04", titulo: "Grąžinkite", desc: "Užstatas grąžinamas po patikrinimo." },
      ],
    },
    catalogo: { label: "Katalogas", titulo: "Drabužiai ir aksesuarai kiekvienai progai.", verColecao: "Žiūrėti →", categorias: ["Suknelės", "Paltai", "Komplektai", "Aksesuarai", "Avalynė", "Naujienos"] },
    planos: {
      label: "Prenumerata", titulo: "Nuomojate dažnai? Taupykite su planu.",
      subtitulo: "Planai neprivalomi — visada galite nuomotis po vieną drabužį.",
      porMes: "/ mėn.", saberMais: "Sužinoti daugiau", popular: "Populiarus",
      lista: [
        { nome: "Basic", preco: "29,90€", features: ["1 drabužis per mėnesį", "Pristatymas įskaičiuotas", "Visas katalogas"] },
        { nome: "Premium", preco: "69,90€", features: ["3 drabužiai per mėnesį", "Pristatymas įskaičiuotas", "Prioritetinė prieiga", "Stiliaus patarimai"] },
        { nome: "VIP", preco: "99,90€", features: ["5 drabužiai per mėnesį", "Ekspresinis pristatymas", "Ankstyva prieiga", "Mėnesinė konsultacija"] },
      ],
    },
    deposito: {
      label: "Visiškas skaidrumas", titulo: "Užstatas apsaugo drabužį — ir grąžinamas automatiškai.",
      texto: "Nuomojant rezervuojame užstatą, lygų drabužio vertei.",
      metodos: [
        { nome: "Kredito/debeto kortelė", desc: "Per Stripe. Grąžinama automatiškai." },
        { nome: "Skubus banko pavedimas", desc: "Patvirtinimas el. paštu. 2 darbo dienos." },
        { nome: "Banko patvirtintas čekis", desc: "Pateikiamas asmeniškai atsiimant." },
        { nome: "Grynieji pinigai", desc: "Mokama ir grąžinama rankomis." },
      ],
    },
    cta: { titulo1: "Tobulas įvaizdis", titulo2: "prasideda čia.", subtitulo: "Pasakykite kur einate ir mes pasirūpinsime viskuo.", botao: "Kur šiandien einate?" },
    footer: { direitos: "© 2025 Nora Grei. Visos teisės saugomos.", links: ["Katalogas", "Planai", "Kaip tai veikia", "Kontaktai", "Sąlygos", "Privatumas"] },
    bottomNav: { inicio: "Pradžia", catalogo: "Katalogas", pedidos: "Užsakymai", perfil: "Profilis" },
  },
};

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [lang, setLang] = useState("pt");
  const [activeTab, setActiveTab] = useState("home");
  const [userLogado, setUserLogado] = useState(false);

  useEffect(() => {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    sb.auth.getSession().then(({ data }) => { if (data.session) setUserLogado(true); });
    const saved = localStorage.getItem("ng_lang");
    if (saved && translations[saved]) setLang(saved);
    else {
      const browser = navigator.language?.slice(0, 2);
      if (browser === "fr") setLang("fr");
      else if (browser === "lt") setLang("lt");
    }
  }, []);

  const changeLang = (l) => { localStorage.setItem("ng_lang", l); setLang(l); };
  const t = translations[lang];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --black: #080808; --white: #f8f7f5; --grey-100: #f0eeeb;
          --grey-200: #e2dfda; --grey-400: #5a5855; --grey-600: #1a1a18; --grey-800: #2a2926;
          --serif: 'Cormorant', Georgia, serif; --sans: 'Jost', Arial, sans-serif;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--white); color: var(--black); font-family: var(--sans); font-weight: 400; font-size: 17px; line-height: 1.7; -webkit-font-smoothing: antialiased; }

        /* NAV */
        .nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:1.25rem 4rem; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-bottom:1px solid var(--grey-200); flex-wrap:nowrap; }
        .logo { display:flex; flex-direction:column; text-decoration:none; color:var(--black); }
        .logo-name { font-family:var(--serif); font-size:1.35rem; font-weight:400; letter-spacing:0.25em; text-transform:uppercase; line-height:1; }
        .logo-tagline { font-size:0.55rem; letter-spacing:0.35em; text-transform:uppercase; color:var(--grey-400); margin-top:0.2rem; font-weight:400; }
        .nav-links { display:flex; align-items:center; gap:2.5rem; list-style:none; }
        .nav-links a { font-size:0.68rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-600); text-decoration:none; font-weight:400; transition:color 0.2s; }
        .nav-links a:hover { color:var(--black); }
        .nav-right { display:flex; align-items:center; gap:1.5rem; }
        .nav-lang { display:flex; align-items:center; gap:0.4rem; }
        .lang-btn { font-size:0.6rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-400); background:none; border:none; cursor:pointer; font-family:var(--sans); font-weight:400; padding:0; transition:color 0.2s; }
        .lang-btn:hover, .lang-btn.active { color:var(--black); font-weight:500; }
        .lang-sep { color:var(--grey-200); font-size:0.55rem; }
        .nav-btn { font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; padding:0.65rem 1.5rem; text-decoration:none; font-weight:400; font-family:var(--sans); transition:all 0.25s; }
        .nav-btn-outline { color:var(--black); border:1px solid var(--black); }
        .nav-btn-outline:hover { background:var(--black); color:var(--white); }
        .nav-btn-fill { background:var(--black); color:var(--white); }
        .nav-btn-fill:hover { background:var(--grey-800); }

        /* HERO */
        .hero { min-height:100vh; display:grid; grid-template-columns:55% 45%; padding-top:80px; }
        .hero-left { display:flex; flex-direction:column; justify-content:center; padding:6rem 4rem 6rem 6rem; }
        .hero-eyebrow { font-size:0.65rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--grey-400); margin-bottom:2.5rem; font-weight:400; }
        .hero-title { font-family:var(--serif); font-size:clamp(3.5rem,5.5vw,6rem); font-weight:300; line-height:1.02; margin-bottom:2.5rem; }
        .hero-title em { font-style:italic; color:var(--grey-600); display:block; }
        .hero-divider { width:40px; height:1px; background:var(--grey-400); margin-bottom:2rem; }
        .hero-sub { font-size:1.05rem; color:var(--grey-600); max-width:42ch; line-height:1.9; margin-bottom:3.5rem; font-weight:400; }
        .hero-actions { display:flex; align-items:center; gap:2rem; flex-wrap:wrap; }
        .btn-primary { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; background:var(--black); color:var(--white); padding:1.1rem 2.5rem; text-decoration:none; font-weight:400; transition:background 0.3s; font-family:var(--sans); display:inline-block; }
        .btn-primary:hover { background:var(--grey-800); }
        .btn-text { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-600); text-decoration:none; font-weight:400; border-bottom:1px solid var(--grey-200); padding-bottom:2px; }
        .btn-text:hover { color:var(--black); border-color:var(--black); }
        .hero-right { position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:flex-end; }
        .hero-right img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center top; }
        .hero-caption { position:relative; z-index:2; background:rgba(248,247,245,0.92); padding:1.25rem 2rem; display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--grey-200); }
        .hero-caption-name { font-family:var(--serif); font-size:1.05rem; font-style:italic; font-weight:300; }
        .hero-caption-price { font-size:0.72rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-600); }
        .hero-caption-tag { font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--grey-400); margin-top:0.2rem; text-align:right; }

        /* STRIP */
        .strip { background:var(--black); padding:0.9rem 0; overflow:hidden; }
        .strip-track { display:flex; white-space:nowrap; animation:marquee 25s linear infinite; }
        .strip-item { font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.6); padding:0 3rem; flex-shrink:0; font-weight:400; }
        .strip-item::after { content:'—'; margin-left:3rem; color:rgba(255,255,255,0.2); }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* SECÇÕES */
        .section-label { font-size:0.65rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--grey-400); margin-bottom:1rem; font-weight:400; }
        .section-title { font-family:var(--serif); font-size:clamp(2.5rem,4vw,4.5rem); font-weight:300; line-height:1.08; margin-bottom:3rem; }
        .section-title em { font-style:italic; color:var(--grey-600); }

        /* ONDE VAS */
        .onde-section { padding:8rem 6rem; }
        .onde-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:3rem; }
        .onde-sub { font-size:1rem; color:var(--grey-600); max-width:32ch; text-align:right; line-height:1.8; font-weight:400; }
        .occasions-grid { display:grid; grid-template-columns:repeat(8,1fr); border:1px solid var(--grey-200); }
        .occasion-btn { padding:2.5rem 1rem; text-align:center; cursor:pointer; border:none; border-right:1px solid var(--grey-200); background:var(--white); font-family:var(--serif); font-size:1.15rem; font-weight:300; color:var(--grey-600); transition:all 0.25s; }
        .occasion-btn:last-child { border-right:none; }
        .occasion-btn:hover { background:var(--grey-100); color:var(--black); }
        .occasion-btn.active { background:var(--black); color:var(--white); }
        .onde-result { margin-top:2rem; padding:2rem 2.5rem; border:1px solid var(--grey-200); display:flex; align-items:center; justify-content:space-between; gap:2rem; }
        .onde-result-text { font-family:var(--serif); font-size:1.4rem; font-style:italic; color:var(--grey-600); }
        .onde-result-text strong { color:var(--black); font-style:normal; font-weight:400; }

        /* PROCESSO */
        .process-section { background:var(--grey-100); padding:8rem 6rem; }
        .process-grid { display:grid; grid-template-columns:repeat(4,1fr); margin-top:4rem; }
        .process-step { padding:0 2.5rem 0 0; border-right:1px solid var(--grey-200); }
        .process-step:last-child { border-right:none; padding-right:0; }
        .process-step:not(:first-child) { padding-left:2.5rem; }
        .process-num { font-family:var(--serif); font-size:4rem; font-weight:300; color:var(--grey-200); line-height:1; margin-bottom:1.5rem; }
        .process-title { font-family:var(--serif); font-size:1.4rem; font-weight:400; margin-bottom:0.75rem; }
        .process-desc { font-size:1.05rem; color:var(--grey-600); line-height:1.9; font-weight:400; }

        /* CATÁLOGO */
        .catalog-section { padding:8rem 6rem; }
        .catalog-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:3rem; }
        .catalog-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--grey-200); }
        .catalog-card { background:var(--white); padding:3rem 2.5rem; display:flex; flex-direction:column; gap:0.75rem; text-decoration:none; color:var(--black); transition:background 0.25s; }
        .catalog-card:hover { background:var(--grey-100); }
        .catalog-card-num { font-size:0.6rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--grey-400); font-weight:400; }
        .catalog-card-name { font-family:var(--serif); font-size:1.8rem; font-weight:300; }
        .catalog-card-arrow { font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--grey-400); margin-top:auto; padding-top:1.5rem; border-top:1px solid var(--grey-200); font-weight:400; }

        /* PLANOS */
        .plans-section { background:var(--grey-100); padding:8rem 6rem; }
        .plans-intro { display:grid; grid-template-columns:1fr 1fr; gap:6rem; align-items:end; margin-bottom:4rem; }
        .plans-intro-sub { font-size:1rem; color:var(--grey-600); line-height:1.9; font-weight:400; }
        .plans-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--grey-200); }
        .plan-card { background:var(--white); padding:2.5rem; position:relative; }
        .plan-card.featured { background:var(--black); color:var(--white); }
        .plan-tag { position:absolute; top:0; right:2rem; font-size:0.55rem; letter-spacing:0.2em; text-transform:uppercase; background:var(--grey-600); color:var(--white); padding:0.25rem 0.75rem; font-weight:400; }
        .plan-name { font-size:0.65rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--grey-400); margin-bottom:1.5rem; font-weight:400; }
        .plan-card.featured .plan-name { color:var(--grey-400); }
        .plan-price { font-family:var(--serif); font-size:3rem; font-weight:300; line-height:1; }
        .plan-period { font-size:0.75rem; color:var(--grey-400); margin-top:0.25rem; margin-bottom:2rem; font-weight:400; }
        .plan-line { height:1px; background:var(--grey-200); margin-bottom:1.5rem; }
        .plan-card.featured .plan-line { background:#2a2926; }
        .plan-features { list-style:none; display:flex; flex-direction:column; gap:0.6rem; margin-bottom:2rem; }
        .plan-features li { font-size:1rem; color:var(--grey-600); display:flex; align-items:center; gap:1rem; font-weight:400; }
        .plan-card.featured .plan-features li { color:var(--grey-400); }
        .plan-features li::before { content:''; width:20px; height:1px; background:var(--grey-400); flex-shrink:0; }
        .plan-btn { display:block; text-align:center; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; padding:0.9rem; text-decoration:none; border:1px solid var(--grey-800); color:var(--grey-800); transition:all 0.25s; font-weight:400; font-family:var(--sans); }
        .plan-btn:hover { background:var(--black); color:var(--white); border-color:var(--black); }
        .plan-card.featured .plan-btn { border-color:var(--grey-600); color:var(--grey-400); }
        .plan-card.featured .plan-btn:hover { background:var(--white); color:var(--black); border-color:var(--white); }

        /* DEPÓSITO */
        .deposit-section { padding:8rem 6rem; display:grid; grid-template-columns:1fr 1fr; gap:8rem; align-items:start; border-top:1px solid var(--grey-200); }
        .deposit-title { font-family:var(--serif); font-size:clamp(1.8rem,2.5vw,3rem); font-weight:300; line-height:1.2; margin-bottom:1.5rem; }
        .deposit-text { font-size:1rem; color:var(--grey-600); line-height:1.9; font-weight:400; }
        .deposit-methods { display:flex; flex-direction:column; border:1px solid var(--grey-200); margin-top:2rem; }
        .deposit-method { padding:1.25rem 1.5rem; border-bottom:1px solid var(--grey-200); display:flex; align-items:center; justify-content:space-between; gap:1rem; }
        .deposit-method:last-child { border-bottom:none; }
        .deposit-method-name { font-size:0.92rem; font-weight:400; }
        .deposit-method-desc { font-size:0.78rem; color:var(--grey-400); text-align:right; font-weight:400; }

        /* CTA */
        .cta-section { background:var(--black); color:var(--white); padding:10rem 6rem; text-align:center; display:flex; flex-direction:column; align-items:center; }
        .cta-title { font-family:var(--serif); font-size:clamp(3rem,6vw,6rem); font-weight:300; line-height:1.05; max-width:16ch; margin-bottom:2.5rem; }
        .cta-title em { font-style:italic; color:var(--grey-600); }
        .cta-sub { font-size:1rem; color:var(--grey-400); margin-bottom:3.5rem; max-width:50ch; line-height:1.9; font-weight:400; }
        .btn-inv { font-size:0.72rem; letter-spacing:0.2em; text-transform:uppercase; border:1px solid rgba(255,255,255,0.3); color:var(--white); padding:1.1rem 3rem; text-decoration:none; font-weight:400; transition:all 0.3s; font-family:var(--sans); }
        .btn-inv:hover { background:var(--white); color:var(--black); border-color:var(--white); }

        /* FOOTER */
        footer { padding:3rem 6rem; border-top:1px solid var(--grey-200); display:grid; grid-template-columns:1fr auto; align-items:center; gap:2rem; }
        .footer-logo { font-family:var(--serif); font-size:1rem; letter-spacing:0.2em; text-transform:uppercase; font-weight:400; }
        .footer-sub { font-size:0.58rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--grey-400); margin-top:0.3rem; font-weight:400; }
        .footer-links { display:flex; gap:2rem; list-style:none; flex-wrap:wrap; }
        .footer-links a { font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--grey-400); text-decoration:none; font-weight:400; transition:color 0.2s; }
        .footer-links a:hover { color:var(--black); }
        .footer-copy { grid-column:1/-1; font-size:0.65rem; color:var(--grey-400); padding-top:1.5rem; border-top:1px solid var(--grey-100); font-weight:400; }

        /* BOTTOM NAV MOBILE */
        .bottom-nav { display:none; position:fixed; bottom:0; left:0; right:0; z-index:200; background:rgba(248,247,245,0.97); backdrop-filter:blur(20px); border-top:1px solid var(--grey-200); padding:0.75rem 0 calc(0.75rem + env(safe-area-inset-bottom)); }
        .bottom-nav-inner { display:flex; justify-content:space-around; align-items:center; }
        .bottom-nav-item { display:flex; flex-direction:column; align-items:center; gap:0.3rem; text-decoration:none; color:var(--grey-400); background:none; border:none; cursor:pointer; padding:0.25rem 1.5rem; transition:color 0.2s; font-family:var(--sans); }
        .bottom-nav-item.active { color:var(--black); }
        .bottom-nav-icon { width:24px; height:24px; display:flex; align-items:center; justify-content:center; }
        .bottom-nav-icon svg { width:22px; height:22px; stroke:currentColor; fill:none; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
        .bottom-nav-label { font-size:0.58rem; letter-spacing:0.12em; text-transform:uppercase; font-weight:400; }
        .bottom-nav-dot { width:4px; height:4px; border-radius:50%; background:var(--black); margin-top:2px; }
        .mobile-cta-bar { display:none; position:fixed; bottom:calc(68px + env(safe-area-inset-bottom)); left:1rem; right:1rem; z-index:199; }
        .mobile-cta-bar a { display:block; text-align:center; font-size:0.78rem; letter-spacing:0.15em; text-transform:uppercase; background:var(--black); color:var(--white); padding:1.1rem; text-decoration:none; font-weight:500; font-family:var(--sans); box-shadow:0 8px 32px rgba(0,0,0,0.2); }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          nav { display:flex !important; flex-direction:row !important; justify-content:space-between !important; align-items:center !important; width:100% !important; }
          body { font-size:17px; padding-bottom:140px; }

          /* NAV MOBILE */
          .nav { padding:0.9rem 1.25rem; display:flex !important; flex-direction:row !important; justify-content:space-between !important; align-items:center !important; width:100% !important; }
          .nav-links { display:none; }
          .nav-right .nav-btn-outline { display:none; }
          .nav-right .nav-btn-fill { display:none; }
          .nav-right { gap:1rem; }
          .lang-btn { font-size:0.65rem; }
          .logo-name { font-size:1.15rem; }

          /* HERO MOBILE */
          .hero { grid-template-columns:1fr; min-height:auto; padding-top:70px; }
          .hero-right { height:75vw; order:-1; }
          .hero-left { padding:2rem 1.25rem 2.5rem; order:1; }
          .hero-eyebrow { font-size:0.72rem; margin-bottom:1.5rem; }
          .hero-title { font-size:clamp(2.5rem,10vw,3.5rem); margin-bottom:1.5rem; line-height:1.05; }
          .hero-divider { margin-bottom:1.25rem; }
          .hero-sub { font-size:1.05rem; margin-bottom:2rem; max-width:100%; }
          .hero-actions { gap:1rem; }
          .btn-primary { font-size:1rem; padding:1.1rem 2rem; width:100%; text-align:center; }
          .btn-text { font-size:0.78rem; }

          /* STRIP MOBILE */
          .strip { padding:0.75rem 0; }
          .strip-item { font-size:0.72rem; padding:0 2rem; }

          /* ONDE VAS MOBILE */
          .onde-section { padding:3.5rem 1.25rem; }
          .onde-header { flex-direction:column; align-items:flex-start; gap:0.75rem; margin-bottom:2rem; }
          .onde-sub { text-align:left; max-width:100%; font-size:1rem; }
          .section-title { font-size:clamp(2rem,8vw,3rem); margin-bottom:2rem; }
          .occasions-grid { grid-template-columns:repeat(2,1fr); border:1px solid var(--grey-200); }
          .occasion-btn { padding:1.5rem 0.5rem; font-size:1.1rem; border-right:1px solid var(--grey-200); border-bottom:1px solid var(--grey-200); }
          .occasion-btn:nth-child(2n) { border-right:none; }
          .occasion-btn:nth-child(7), .occasion-btn:nth-child(8) { border-bottom:none; }
          .onde-result { flex-direction:column; align-items:flex-start; padding:1.5rem; gap:1rem; }
          .onde-result-text { font-size:1.25rem; }
          .onde-result .btn-primary { width:100%; text-align:center; }

          /* PROCESSO MOBILE */
          .process-section { padding:3.5rem 1.25rem; }
          .process-grid { grid-template-columns:1fr; gap:2rem; margin-top:2rem; }
          .process-step { border-right:none; padding:0; border-bottom:1px solid var(--grey-200); padding-bottom:2rem; }
          .process-step:last-child { border-bottom:none; padding-bottom:0; }
          .process-num { font-size:3rem; margin-bottom:1rem; }
          .process-title { font-size:1.4rem; }
          .process-desc { font-size:1rem; }

          /* CATÁLOGO MOBILE */
          .catalog-section { padding:3.5rem 1.25rem; }
          .catalog-header { flex-direction:column; align-items:flex-start; gap:1rem; margin-bottom:2rem; }
          .catalog-grid { grid-template-columns:1fr 1fr; }
          .catalog-card { padding:1.5rem 1.25rem; }
          .catalog-card-name { font-size:1.4rem; }
          .catalog-card-arrow { padding-top:1rem; font-size:0.72rem; }

          /* PLANOS MOBILE */
          .plans-section { padding:3.5rem 1.25rem; }
          .plans-intro { grid-template-columns:1fr; gap:1rem; margin-bottom:2rem; }
          .plans-intro-sub { font-size:1rem; }
          .plans-grid { grid-template-columns:1fr; }
          .plan-card { padding:2rem 1.5rem; }
          .plan-price { font-size:2.5rem; }
          .plan-features li { font-size:1rem; }
          .plan-btn { font-size:0.75rem; padding:1rem; }

          /* DEPÓSITO MOBILE */
          .deposit-section { grid-template-columns:1fr; gap:2rem; padding:3.5rem 1.25rem; }
          .deposit-title { font-size:1.8rem; }
          .deposit-text { font-size:1rem; }
          .deposit-method { flex-direction:column; align-items:flex-start; gap:0.3rem; padding:1rem 1.25rem; }
          .deposit-method-name { font-size:1rem; }
          .deposit-method-desc { text-align:left; font-size:1rem; }

          /* CTA MOBILE */
          .cta-section { padding:5rem 1.25rem; }
          .cta-title { font-size:clamp(2.5rem,9vw,3.5rem); }
          .cta-sub { font-size:1rem; }
          .btn-inv { font-size:1rem; padding:1.1rem 2.5rem; }

          /* FOOTER MOBILE */
          footer { grid-template-columns:1fr; padding:2rem 1.25rem; gap:1.5rem; }
          .footer-links { gap:1rem; }
          .footer-links a { font-size:0.72rem; }

          /* BOTTOM NAV */
          .bottom-nav { display:block; }
          .mobile-cta-bar { display:none; }
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav>
        <a href="/" className="logo">
          <span className="logo-name">{t.marca}</span>
          <span className="logo-tagline">{t.slogan}</span>
        </a>
        <ul className="nav-links">
          <li><a href="/catalogo">{t.nav.catalogo}</a></li>
          <li><a href="#onde-vas">{t.ondeVas.titulo1}</a></li>
          <li><a href="#planos">{t.nav.planos}</a></li>
          <li><a href="#como-funciona">{t.nav.comoFunciona}</a></li>
        </ul>
        <div className="nav-right">
          <div className="nav-lang">
            <button className={`lang-btn${lang==="pt"?" active":""}`} onClick={() => changeLang("pt")}>PT</button>
            <span className="lang-sep">/</span>
            <button className={`lang-btn${lang==="fr"?" active":""}`} onClick={() => changeLang("fr")}>FR</button>
            <span className="lang-sep">/</span>
            <button className={`lang-btn${lang==="lt"?" active":""}`} onClick={() => changeLang("lt")}>LT</button>
          </div>
          <a href={userLogado ? "/perfil" : "/entrar"} className="nav-btn nav-btn-outline">{userLogado ? "O meu perfil" : t.nav.entrar}</a>
          <a href="#onde-vas" className="nav-btn nav-btn-fill">{t.hero.ctaPrincipal}</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">{t.hero.eyebrow}</p>
          <h1 className="hero-title">
            {t.hero.titulo1}<br />{t.hero.titulo2}<br /><em>{t.hero.titulo3}</em>
          </h1>
          <div className="hero-divider"></div>
          <p className="hero-sub">{t.hero.subtitulo}</p>
          <div className="hero-actions">
            <a href="/catalogo" className="btn-primary">{t.hero.ctaPrincipal}</a>
            <a href="/catalogo" className="btn-text">{t.hero.ctaSecundario}</a>
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
          {[...Array(2)].map((_, i) => t.strip.map((item, j) => (
            <span key={`${i}-${j}`} className="strip-item">{item}</span>
          )))}
        </div>
      </div>

      {/* ONDE VAS */}
      <section className="onde-section" id="onde-vas">
        <div className="onde-header">
          <div>
            <p className="section-label">{t.ondeVas.label}</p>
            <h2 className="section-title" style={{marginBottom:0}}>{t.ondeVas.titulo1}<br /><em>{t.ondeVas.titulo2}</em></h2>
          </div>
          <p className="onde-sub">{t.ondeVas.subtitulo}</p>
        </div>
        <div className="occasions-grid">
          {t.ondeVas.ocasioes.map((o, i) => (
            <button key={i} className={`occasion-btn${selected===i?" active":""}`} onClick={() => setSelected(i)}>{o}</button>
          ))}
        </div>
        {selected !== null && (
          <div className="onde-result">
            <p className="onde-result-text">{t.ondeVas.sugestao} <strong>{t.ondeVas.ocasioes[selected]}</strong></p>
            <a href="/catalogo" className="btn-primary">{t.ondeVas.cta}</a>
          </div>
        )}
      </section>

      {/* PROCESSO */}
      <section className="process-section" id="como-funciona">
        <p className="section-label">{t.processo.label}</p>
        <h2 className="section-title">{t.processo.titulo}</h2>
        <div className="process-grid">
          {t.processo.passos.map(p => (
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
          <a href="/catalogo" className="btn-text">{t.catalogo.verColecao}</a>
        </div>
        <div className="catalog-grid">
          {t.catalogo.categorias.map((name, i) => (
            <a key={i} href="/catalogo" className="catalog-card">
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
            <div key={i} className={`plan-card${i===1?" featured":""}`}>
              {i===1 && <div className="plan-tag">{t.planos.popular}</div>}
              <p className="plan-name">{plan.nome}</p>
              <div className="plan-price">{plan.preco}</div>
              <p className="plan-period">{t.planos.porMes}</p>
              <div className="plan-line"></div>
              <ul className="plan-features">{plan.features.map((f,j) => <li key={j}>{f}</li>)}</ul>
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
          {t.deposito.metodos.map((m,i) => (
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
        <a href="/catalogo" className="btn-inv">{t.cta.botao}</a>
      </section>

      {/* FOOTER */}
      <footer>
        <div>
          <div className="footer-logo">{t.marca}</div>
          <div className="footer-sub">{t.slogan}</div>
        </div>
        <ul className="footer-links">
          {t.footer.links.map((l,i) => <li key={i}><a href="#">{l}</a></li>)}
        </ul>
        <p className="footer-copy">{t.footer.direitos}</p>
      </footer>

      {/* BOTTOM NAV MOBILE */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <a href="/" className={`bottom-nav-item${activeTab==="home"?" active":""}`} onClick={() => setActiveTab("home")}>
            <div className="bottom-nav-icon"><svg viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg></div>
            <span className="bottom-nav-label">{t.bottomNav.inicio}</span>
            {activeTab==="home" && <div className="bottom-nav-dot"></div>}
          </a>
          <a href="/catalogo" className={`bottom-nav-item${activeTab==="catalogo"?" active":""}`} onClick={() => setActiveTab("catalogo")}>
            <div className="bottom-nav-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></div>
            <span className="bottom-nav-label">{t.bottomNav.catalogo}</span>
            {activeTab==="catalogo" && <div className="bottom-nav-dot"></div>}
          </a>
          <a href="#" className={`bottom-nav-item${activeTab==="pedidos"?" active":""}`} onClick={() => setActiveTab("pedidos")}>
            <div className="bottom-nav-icon"><svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>
            <span className="bottom-nav-label">{t.bottomNav.pedidos}</span>
            {activeTab==="pedidos" && <div className="bottom-nav-dot"></div>}
          </a>
          <a href={userLogado ? "/perfil" : "/entrar"} className={`bottom-nav-item${activeTab==="perfil"?" active":""}`} onClick={() => setActiveTab("perfil")}>
            <div className="bottom-nav-icon"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <span className="bottom-nav-label">{t.bottomNav.perfil}</span>
            {activeTab==="perfil" && <div className="bottom-nav-dot"></div>}
          </a>
        </div>
      </nav>

      {/* CTA FLUTUANTE MOBILE */}
      <div className="mobile-cta-bar">
        <a href="/catalogo">{t.hero.ctaPrincipal}</a>
      </div>
    </>
  );
}