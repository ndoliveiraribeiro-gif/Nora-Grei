"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const T = {
  pt: {
    eyebrow: "Nora Grei · Calculadora",
    titulo: <>Quanto vale<br/>o teu armário?</>,
    subtitulo: "Introduz os dados da peça e vê quanto podes ganhar — antes e depois de a vender.",
    precoLabel: "Preço original de compra",
    precoHint: "Quanto pagaste pela peça quando era nova",
    categoriaLabel: "Categoria",
    estadoLabel: "Estado actual da peça",
    idadeLabel: "Idade da peça",
    usoLabel: "Quantas vezes a usaste",
    mesesLabel: "Durante quantos meses queres alugar?",
    mesesPeriodo: "Período de aluguer",
    mesesUnidade: (n) => `${n} meses`,
    mesesHint: "Depois vendes a peça usada com valor de ocasião",
    heroLabel: "Total estimado — aluguer + venda final",
    heroNota: (aluguer, venda) => `€${aluguer} em alugueres · €${venda} na venda final`,
    ngDesc: "Alugueres + venda com valor de ocasião",
    ngMais: (x) => `${x}× mais →`,
    vintedMarca: "Vinted / Usada",
    vintedDesc: "Venda única ao preço de mercado de ocasião",
    ganhoText: (v) => <>Ganhas <strong>€{v} a mais</strong> do que se vendesses já na Vinted</>,
    rotacaoLabel: "Rotação estimada",
    rotacaoNum: (n, m) => `${n} alugueres em ${m} meses`,
    rotacaoSub: (rpm, cat, est) => `~${rpm} por mês para ${cat} em estado ${est}. A peça fica disponível entre alugueres e deprecia de forma controlada.`,
    breakdownLabel: "Como se chega ao valor",
    bk1: "Valor de mercado estimado agora",
    bk2: "Preço sugerido por aluguer",
    bk3: (n, p) => `Receita bruta (${n}× €${p})`,
    bk4: "Comissão Nora Grei (10%)",
    bk5: "Líquido de alugueres",
    bk6: (m) => `Valor residual da peça após ${m} meses`,
    bk7: "Venda usada líquida (comissão 20% + envio)",
    bkTotal: "Total recebido",
    cta: "Publicar a minha peça agora",
    ctaVer: "Ver como outras lojistas fazem →",
    disclaimer: <>ⓘ Os valores apresentados são <strong>estimativas indicativas</strong> baseadas em benchmarks do sector de moda em segunda mão e aluguer, ajustadas pela categoria e estado da peça. A rotação real depende da procura, sazonalidade, visibilidade da peça na plataforma e condições de mercado. <strong>Não constituem garantia de rendimento.</strong></>,
    semPreco: "Introduz o preço original para ver a estimativa",
    gateTitle: "Guarda a tua avaliação",
    gateSub: "Introduz o teu email para veres o resultado e receberes o resumo.",
    gateEmailPlaceholder: "O teu email",
    gateBtn: "Ver resultado →",
    gateOuLogin: "Já tens conta?",
    gateEntrar: "Entrar",
    gateSkip: "Ver só desta vez (sem guardar)",
    gateLegal: "Ao continuares aceitas receber comunicações da Nora Grei. Podes cancelar a qualquer momento.",
    gateEmailEnviado: "✓ Email registado! A ver resultado...",
  },
  fr: {
    eyebrow: "Nora Grei · Calculatrice",
    titulo: <>Combien vaut<br/>ta garde-robe ?</>,
    subtitulo: "Saisis les données de ta pièce et vois combien tu peux gagner — avant et après la vendre.",
    precoLabel: "Prix d'achat original",
    precoHint: "Combien tu as payé la pièce neuve",
    categoriaLabel: "Catégorie",
    estadoLabel: "État actuel de la pièce",
    idadeLabel: "Âge de la pièce",
    usoLabel: "Combien de fois tu l'as portée",
    mesesLabel: "Pendant combien de mois veux-tu louer ?",
    mesesPeriodo: "Période de location",
    mesesUnidade: (n) => `${n} mois`,
    mesesHint: "Ensuite tu vends la pièce d'occasion",
    heroLabel: "Total estimé — location + vente finale",
    heroNota: (aluguer, venda) => `€${aluguer} en locations · €${venda} à la vente finale`,
    ngDesc: "Locations + vente avec valeur d'occasion",
    ngMais: (x) => `${x}× plus →`,
    vintedMarca: "Vinted / Occasion",
    vintedDesc: "Vente unique au prix du marché d'occasion",
    ganhoText: (v) => <>Tu gagnes <strong>€{v} de plus</strong> qu'en vendant sur Vinted maintenant</>,
    rotacaoLabel: "Rotation estimée",
    rotacaoNum: (n, m) => `${n} locations en ${m} mois`,
    rotacaoSub: (rpm, cat, est) => `~${rpm} par mois pour ${cat} en état ${est}. La pièce reste disponible entre les locations.`,
    breakdownLabel: "Comment on arrive à ce chiffre",
    bk1: "Valeur marchande estimée maintenant",
    bk2: "Prix de location suggéré",
    bk3: (n, p) => `Revenus bruts (${n}× €${p})`,
    bk4: "Commission Nora Grei (10%)",
    bk5: "Net locations",
    bk6: (m) => `Valeur résiduelle après ${m} mois`,
    bk7: "Vente d'occasion nette (commission 20% + envoi)",
    bkTotal: "Total reçu",
    cta: "Publier ma pièce maintenant",
    ctaVer: "Voir comment d'autres boutiques font →",
    disclaimer: <>ⓘ Les valeurs présentées sont des <strong>estimations indicatives</strong> basées sur des benchmarks du secteur mode de seconde main et location. La rotation réelle dépend de la demande, de la saisonnalité et de la visibilité. <strong>Elles ne constituent pas une garantie de revenus.</strong></>,
    semPreco: "Saisis le prix original pour voir l'estimation",
    gateTitle: "Sauvegarde ton évaluation",
    gateSub: "Entre ton email pour voir le résultat et recevoir le résumé.",
    gateEmailPlaceholder: "Ton email",
    gateBtn: "Voir le résultat →",
    gateOuLogin: "Tu as déjà un compte ?",
    gateEntrar: "Se connecter",
    gateSkip: "Voir juste cette fois (sans sauvegarder)",
    gateLegal: "En continuant, tu acceptes de recevoir des communications de Nora Grei.",
    gateEmailEnviado: "✓ Email enregistré ! Affichage du résultat...",
  },
  lt: {
    eyebrow: "Nora Grei · Skaičiuoklė",
    titulo: <>Kiek verta<br/>tavo spinta?</>,
    subtitulo: "Įvesk drabužio duomenis ir sužinok, kiek gali uždirbti — prieš ir po pardavimo.",
    precoLabel: "Originali pirkimo kaina",
    precoHint: "Kiek mokėjai už naują drabužį",
    categoriaLabel: "Kategorija",
    estadoLabel: "Dabartinė drabužio būklė",
    idadeLabel: "Drabužio amžius",
    usoLabel: "Kiek kartų dėvėjai",
    mesesLabel: "Kiek mėnesių nori nuomoti?",
    mesesPeriodo: "Nuomos laikotarpis",
    mesesUnidade: (n) => `${n} mėn.`,
    mesesHint: "Po to parduosi drabužį naudotą",
    heroLabel: "Apskaičiuota suma — nuoma + galutinis pardavimas",
    heroNota: (aluguer, venda) => `€${aluguer} iš nuomų · €${venda} iš galutinio pardavimo`,
    ngDesc: "Nuomos + pardavimas su naudotos vertės kaina",
    ngMais: (x) => `${x}× daugiau →`,
    vintedMarca: "Vinted / Naudota",
    vintedDesc: "Vienkartinis pardavimas naudotų prekių rinkos kaina",
    ganhoText: (v) => <>Uždirbi <strong>€{v} daugiau</strong> nei parduodant dabar Vinted</>,
    rotacaoLabel: "Apskaičiuotas apyvartumas",
    rotacaoNum: (n, m) => `${n} nuomų per ${m} mėn.`,
    rotacaoSub: (rpm, cat, est) => `~${rpm} per mėnesį kategorijai ${cat} būklėje ${est}. Drabužis lieka prieinamas tarp nuomų.`,
    breakdownLabel: "Kaip gaunama suma",
    bk1: "Apskaičiuota dabartinė rinkos vertė",
    bk2: "Siūloma nuomos kaina",
    bk3: (n, p) => `Bendros pajamos (${n}× €${p})`,
    bk4: "Nora Grei komisinis (10%)",
    bk5: "Grynos nuomų pajamos",
    bk6: (m) => `Likutinė vertė po ${m} mėn.`,
    bk7: "Grynos naudoto pardavimo pajamos (20% + siuntimas)",
    bkTotal: "Iš viso gauta",
    cta: "Publikuoti savo drabužį dabar",
    ctaVer: "Peržiūrėti kitas parduotuves →",
    disclaimer: <>ⓘ Pateiktos vertės yra <strong>orientacinės</strong>, pagrįstos antros rankos mados ir nuomos sektoriaus duomenimis. Reali apyvarta priklauso nuo paklausos, sezoniškumo ir drabužio matomumo. <strong>Tai nėra pajamų garantija.</strong></>,
    semPreco: "Įvesk originalią kainą, kad pamatytum skaičiavimą",
    gateTitle: "Išsaugok savo įvertinimą",
    gateSub: "Įvesk el. paštą, kad pamatytum rezultatą ir gautum santrauką.",
    gateEmailPlaceholder: "Tavo el. paštas",
    gateBtn: "Žiūrėti rezultatą →",
    gateOuLogin: "Jau turi paskyrą?",
    gateEntrar: "Prisijungti",
    gateSkip: "Žiūrėti tik šį kartą (neišsaugoti)",
    gateLegal: "Tęsdamas sutinki gauti Nora Grei komunikacijas.",
    gateEmailEnviado: "✓ El. paštas užregistruotas! Rodomas rezultatas...",
  },
};

// Comissões reais da plataforma
const COMISSAO_ALUGUER = 0.10;
const COMISSAO_VENDA = 0.20;
const CUSTO_HIGIENIZACAO = 8;
const CUSTO_ENVIO = 6;

// Fatores de depreciação por categoria
const CATEGORIAS_DATA = [
  { id: "luxo",      fator: 0.70, rotacao: 2.5, label: { pt: "Luxo / Designer",   fr: "Luxe / Créateur",    lt: "Prabanga / Dizaineris" } },
  { id: "mid",       fator: 0.42, rotacao: 1.8, label: { pt: "Mid-market",         fr: "Milieu de gamme",    lt: "Vidutinė klasė" } },
  { id: "festa",     fator: 0.55, rotacao: 1.2, label: { pt: "Festa / Ocasião",    fr: "Fête / Occasion",    lt: "Šventė / Proga" } },
  { id: "casual",    fator: 0.28, rotacao: 2.2, label: { pt: "Casual / Dia-a-dia", fr: "Casual / Quotidien", lt: "Kasdieniai" } },
  { id: "acessorio", fator: 0.65, rotacao: 2.0, label: { pt: "Acessório / Mala",   fr: "Accessoire / Sac",   lt: "Aksesuaras / Rankinė" } },
];

const ESTADOS_DATA = [
  { id: "novo",      fator: 1.00, label: { pt: "Nunca usado / com etiqueta", fr: "Jamais porté / avec étiquette", lt: "Nenaudotas / su etiket." } },
  { id: "excelente", fator: 0.85, label: { pt: "Excelente — como novo",      fr: "Excellent — comme neuf",        lt: "Puikus — kaip naujas" } },
  { id: "bom",       fator: 0.65, label: { pt: "Bom — uso cuidadoso",        fr: "Bon — usage soigné",            lt: "Geras — atsargiai naudotas" } },
  { id: "aceitavel", fator: 0.40, label: { pt: "Aceitável — uso visível",    fr: "Acceptable — usage visible",    lt: "Priimtinas — matomas naudojimas" } },
];

const IDADES_DATA = [
  { id: "novo",  fator: 1.00, label: { pt: "Menos de 1 ano",  fr: "Moins d'un an",   lt: "Mažiau nei 1 metai" } },
  { id: "1a2",   fator: 0.85, label: { pt: "1 a 2 anos",      fr: "1 à 2 ans",        lt: "1–2 metai" } },
  { id: "2a4",   fator: 0.70, label: { pt: "2 a 4 anos",      fr: "2 à 4 ans",        lt: "2–4 metai" } },
  { id: "4mais", fator: 0.50, label: { pt: "Mais de 4 anos",  fr: "Plus de 4 ans",    lt: "Daugiau nei 4 metai" } },
];

const USOS_DATA = [
  { id: "nunca", fator: 1.00, label: { pt: "Nunca / 1 vez",  fr: "Jamais / 1 fois",  lt: "Niekada / 1 kartą" } },
  { id: "pouco", fator: 0.88, label: { pt: "2 a 5 vezes",    fr: "2 à 5 fois",        lt: "2–5 kartus" } },
  { id: "medio", fator: 0.72, label: { pt: "6 a 15 vezes",   fr: "6 à 15 fois",       lt: "6–15 kartų" } },
  { id: "muito", fator: 0.52, label: { pt: "Mais de 15×",    fr: "Plus de 15×",       lt: "Daugiau nei 15×" } },
];

// Estimativa de preço Vinted por categoria (desconto agressivo)
const VINTED_FATOR = { luxo: 0.35, mid: 0.20, festa: 0.25, casual: 0.15, acessorio: 0.30 };

export default function Calculadora() {
  const [lang, setLang] = useState("pt");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("mid");
  const [estado, setEstado] = useState("bom");
  const [idade, setIdade] = useState("1a2");
  const [uso, setUso] = useState("pouco");
  const [meses, setMeses] = useState(12);

  // Gate de email
  const [gateAberto, setGateAberto] = useState(false);
  const [gateEmail, setGateEmail] = useState("");
  const [gateOk, setGateOk] = useState(false); // passou o gate nesta sessão
  const [gateSaving, setGateSaving] = useState(false);
  const [userLogado, setUserLogado] = useState(null);
  const [avalCount, setAvalCount] = useState(0);
  const gateDisparado = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved);
    // Verificar sessão activa
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserLogado(data.user);
    });
    // Se já passou o gate antes nesta sessão
    try {
      if (sessionStorage.getItem("ng_calc_gate_ok") === "1") setGateOk(true);
      const cnt = parseInt(localStorage.getItem("ng_calc_count") || "0");
      setAvalCount(cnt);
    } catch {}
  }, []);

  const submitGateEmail = async () => {
    if (!gateEmail || !gateEmail.includes("@")) return;
    setGateSaving(true);
    try {
      // Guardar lead na tabela leads_calculadora (criar se não existir) ou clientes
      await supabase.from("leads_calculadora").upsert({ email: gateEmail.toLowerCase().trim(), origem: "calculadora", criado_em: new Date().toISOString() }, { onConflict: "email" });
    } catch {}
    setGateOk(true);
    setGateAberto(false);
    setGateSaving(false);
    try {
      sessionStorage.setItem("ng_calc_gate_ok", "1");
      localStorage.setItem("ng_calc_count", "2");
    } catch {}
  };

  const skipGate = () => {
    setGateOk(true);
    setGateAberto(false);
    try { sessionStorage.setItem("ng_calc_gate_ok", "1"); } catch {}
  };

  const t = T[lang] || T.pt;
  const CATEGORIAS = CATEGORIAS_DATA.map(c => ({ ...c, label: c.label[lang] || c.label.pt }));
  const ESTADOS    = ESTADOS_DATA.map(e => ({ ...e, label: e.label[lang] || e.label.pt }));
  const IDADES     = IDADES_DATA.map(i => ({ ...i, label: i.label[lang] || i.label.pt }));
  const USOS       = USOS_DATA.map(u => ({ ...u, label: u.label[lang] || u.label.pt }));

  const p = parseFloat(preco) || 0;

  const calc = useMemo(() => {
    if (!p) return null;
    const cat = CATEGORIAS_DATA.find(c => c.id === categoria);
    const est = ESTADOS_DATA.find(e => e.id === estado);
    const id  = IDADES_DATA.find(i => i.id === idade);
    const us  = USOS_DATA.find(u => u.id === uso);

    // Valor de mercado estimado agora
    const valorMercado = p * cat.fator * est.fator * id.fator * us.fator;

    // Preço de aluguer sugerido (12-18% do valor de mercado)
    const precoAluguer = Math.round(valorMercado * 0.15 / 5) * 5 || 5;

    // Rotação estimada por mês (média da categoria, ajustada pelo estado)
    const rotacaoMes = cat.rotacao * est.fator;
    const alugueresTotal = Math.round(rotacaoMes * meses);

    // Receita bruta aluguer
    // A higienização e logística são custos pagos pelo cliente — não saem do ganho do lojista
    const receitaBruta = precoAluguer * alugueresTotal;
    const comissaoTotal = receitaBruta * COMISSAO_ALUGUER;
    const liquidoAluguer = receitaBruta - comissaoTotal;

    // Valor residual da peça após os alugueres (deprecia mais lentamente com cuidado NG)
    // Assumimos que o aluguer controlado deprecia menos que uso privado (fator 0.85 vs 1.0)
    const depreciacaoAluguerMes = 0.008; // 0.8% por mês de aluguer ativo
    const valorFinalPeca = valorMercado * Math.pow(1 - depreciacaoAluguerMes, alugueresTotal);
    const vendaFinalLiquido = Math.max(0, valorFinalPeca - valorFinalPeca * COMISSAO_VENDA - CUSTO_ENVIO);

    // Total Nora Grei
    const totalNG = liquidoAluguer + vendaFinalLiquido;

    // Vinted — vende já agora ao preço de ocasião
    const vendaVinted = p * VINTED_FATOR[categoria];

    // Diferença
    const ganhoExtra = totalNG - vendaVinted;
    const multiplicador = vendaVinted > 0 ? (totalNG / vendaVinted) : 0;

    return {
      valorMercado, precoAluguer, rotacaoMes, alugueresTotal,
      receitaBruta, liquidoAluguer, valorFinalPeca,
      vendaFinalLiquido, totalNG, vendaVinted, ganhoExtra, multiplicador,
    };
  }, [p, categoria, estado, idade, uso, meses]);

  // Lógica do gate: quando o resultado aparece, verificar se precisa gate
  useEffect(() => {
    if (!calc || !p) return;
    if (userLogado || gateOk) return; // autenticado ou já passou
    if (gateDisparado.current) return; // só uma vez por sessão
    try {
      const cnt = parseInt(localStorage.getItem("ng_calc_count") || "0");
      if (cnt === 0) {
        // 1ª avaliação — grátis, apenas incrementar o contador
        localStorage.setItem("ng_calc_count", "1");
        setAvalCount(1);
      } else {
        // 2ª+ avaliação — mostrar gate
        gateDisparado.current = true;
        setGateAberto(true);
      }
    } catch {}
  }, [calc, p]); // eslint-disable-line react-hooks/exhaustive-deps

  const catObj = CATEGORIAS_DATA.find(c => c.id === categoria);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        :root {
          --bg: #f8f7f5;
          --card: #ffffff;
          --fg: #1a1816;
          --sub: #6b6560;
          --accent: #c4748a;
          --border: #e2dfda;
          --dark: #100c0a;
          --green: #2a6b45;
          --green-bg: #edf7f1;
          --gold: #c4a882;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--fg); font-family: 'Jost', sans-serif; }
        .serif { font-family: 'Cormorant Garamond', serif; }

        .wrap {
          min-height: 100svh;
          max-width: 480px;
          margin: 0 auto;
          padding: 0 1rem 5rem;
        }

        /* Header */
        .pg-header {
          padding: 2rem 0 1.75rem;
          text-align: center;
        }
        .pg-eyebrow {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.6rem;
        }
        .pg-titulo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.1rem;
          font-weight: 400;
          line-height: 1.15;
          color: var(--fg);
          margin-bottom: 0.5rem;
        }
        .pg-sub {
          font-size: 0.82rem;
          color: var(--sub);
          line-height: 1.55;
          max-width: 32ch;
          margin: 0 auto;
        }

        /* Cards */
        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .card-label {
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--sub);
          margin-bottom: 1rem;
          font-weight: 500;
        }

        /* Input preço */
        .preco-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0 0.9rem;
        }
        .preco-prefix { font-size: 1.1rem; color: var(--sub); }
        .preco-input {
          flex: 1; border: none; background: transparent;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem; font-weight: 400;
          color: var(--fg); padding: 0.5rem 0;
          outline: none;
        }
        .preco-hint { font-size: 0.72rem; color: var(--sub); margin-top: 0.4rem; }

        /* Opções pill */
        .pills {
          display: flex; flex-wrap: wrap; gap: 0.4rem;
        }
        .pill {
          padding: 0.45rem 0.85rem;
          border: 1px solid var(--border);
          border-radius: 20px;
          font-size: 0.74rem;
          background: var(--bg);
          color: var(--sub);
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Jost', sans-serif;
        }
        .pill.sel {
          background: var(--fg);
          color: #fff;
          border-color: var(--fg);
        }

        /* Slider meses */
        .slider-header { display: flex; justify-content: space-between; margin-bottom: 0.6rem; }
        .slider-val { font-size: 1rem; font-weight: 600; color: var(--fg); }
        input[type=range] {
          -webkit-appearance: none; width: 100%; height: 4px;
          border-radius: 2px; background: var(--border); outline: none;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px;
          border-radius: 50%; background: var(--accent); cursor: pointer;
          box-shadow: 0 1px 4px rgba(196,116,138,0.35);
        }

        /* Botão */
        .btn {
          display: block; width: 100%; padding: 1rem;
          background: var(--fg); color: #fff; border: none;
          border-radius: 10px; font-family: 'Jost', sans-serif;
          font-size: 0.74rem; letter-spacing: 0.14em;
          text-transform: uppercase; cursor: pointer;
          text-align: center; text-decoration: none;
          transition: background 0.2s;
        }
        .btn:hover { background: #2d2926; }
        .btn-outline {
          background: transparent; color: var(--sub);
          border: 1px solid var(--border);
          margin-top: 0.5rem;
        }
        .btn-outline:hover { background: var(--bg); }

        /* Resultado hero */
        .hero-res {
          background: var(--dark);
          border-radius: 16px;
          padding: 1.75rem 1.5rem;
          margin-bottom: 0.75rem;
          position: relative;
          overflow: hidden;
        }
        .hero-res::before {
          content: 'NG';
          position: absolute; right: 1rem; top: 50%;
          transform: translateY(-50%);
          font-family: 'Cormorant Garamond', serif;
          font-size: 6rem; font-weight: 300;
          color: rgba(255,255,255,0.04);
          line-height: 1;
        }
        .hero-label {
          font-size: 0.62rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(255,255,255,0.4);
          margin-bottom: 0.4rem;
        }
        .hero-valor {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.5rem; font-weight: 400;
          color: #fff; line-height: 1;
          margin-bottom: 0.3rem;
        }
        .hero-nota {
          font-size: 0.75rem; color: rgba(255,255,255,0.45);
          line-height: 1.4;
        }

        /* Comparação Vinted */
        .comp-card {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0.6rem; margin-bottom: 0.75rem;
        }
        .comp-col {
          border-radius: 12px; padding: 1rem;
          border: 1px solid var(--border);
        }
        .comp-col.ng { background: var(--dark); border-color: transparent; }
        .comp-col.vinted { background: var(--card); }
        .comp-marca {
          font-size: 0.6rem; letter-spacing: 0.18em;
          text-transform: uppercase; margin-bottom: 0.5rem;
        }
        .comp-col.ng .comp-marca { color: rgba(255,255,255,0.4); }
        .comp-col.vinted .comp-marca { color: var(--sub); }
        .comp-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.9rem; font-weight: 400; line-height: 1;
          margin-bottom: 0.3rem;
        }
        .comp-col.ng .comp-num { color: #fff; }
        .comp-col.vinted .comp-num { color: var(--fg); }
        .comp-desc { font-size: 0.68rem; line-height: 1.35; }
        .comp-col.ng .comp-desc { color: rgba(255,255,255,0.4); }
        .comp-col.vinted .comp-desc { color: var(--sub); }
        .comp-badge {
          font-size: 0.62rem; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--accent);
          margin-top: 0.5rem; font-weight: 500;
        }

        /* Ganho extra */
        .ganho-banner {
          background: linear-gradient(135deg, #c4748a 0%, #a85870 100%);
          border-radius: 12px; padding: 1rem 1.25rem;
          margin-bottom: 0.75rem;
          display: flex; justify-content: space-between;
          align-items: center; gap: 1rem;
        }
        .ganho-text { font-size: 0.78rem; color: rgba(255,255,255,0.85); line-height: 1.4; }
        .ganho-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 400; color: #fff;
          white-space: nowrap;
        }

        /* Breakdown */
        .breakdown { display: flex; flex-direction: column; gap: 0.55rem; }
        .bk-row { display: flex; justify-content: space-between; font-size: 0.8rem; }
        .bk-label { color: var(--sub); }
        .bk-val { font-weight: 500; }
        .bk-val.pos { color: var(--green); }
        .bk-val.neg { color: #c0392b; }
        .bk-div { height: 1px; background: var(--border); }
        .bk-total { display: flex; justify-content: space-between; font-weight: 600; font-size: 0.88rem; }

        /* Rotação */
        .rotacao-card {
          background: var(--green-bg);
          border: 1px solid #b8e0ca;
          border-radius: 12px; padding: 1rem 1.25rem;
          margin-bottom: 0.75rem;
        }
        .rotacao-label {
          font-size: 0.62rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--green);
          margin-bottom: 0.5rem; font-weight: 500;
        }
        .rotacao-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; font-weight: 400;
          color: var(--green); line-height: 1;
        }
        .rotacao-sub { font-size: 0.75rem; color: #3a7a55; margin-top: 0.25rem; line-height: 1.4; }

        @media (max-width: 768px) {
          .wrap { padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }
        }

        /* Gate de email */
        .gate-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          display: flex; align-items: flex-end; justify-content: center;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .gate-sheet {
          background: var(--bg);
          border-radius: 20px 20px 0 0;
          padding: 2rem 1.5rem 2.5rem;
          width: 100%; max-width: 480px;
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(60px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .gate-titulo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem; font-weight: 400;
          color: var(--fg); margin-bottom: 0.4rem;
        }
        .gate-sub {
          font-size: 0.8rem; color: var(--sub); line-height: 1.5;
          margin-bottom: 1.25rem;
        }
        .gate-input {
          width: 100%; padding: 0.85rem 1rem;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          background: var(--card);
          color: var(--fg);
          font-family: 'Jost', sans-serif;
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s;
        }
        .gate-input:focus { border-color: var(--accent); }
        .gate-legal {
          font-size: 0.65rem; color: var(--sub);
          line-height: 1.45; margin-bottom: 1rem;
        }
        .gate-skip {
          display: block; width: 100%; text-align: center;
          font-size: 0.72rem; color: var(--sub);
          background: none; border: none; cursor: pointer;
          padding: 0.5rem; margin-top: 0.25rem;
          font-family: 'Jost', sans-serif;
          text-decoration: underline;
        }
        .gate-login-row {
          text-align: center; font-size: 0.75rem;
          color: var(--sub); margin-top: 0.75rem;
        }
        .gate-login-row a { color: var(--accent); text-decoration: none; }
        /* Blur nos resultados quando gate activo */
        .results-blur { filter: blur(6px); pointer-events: none; user-select: none; }
      `}</style>

      <div className="wrap">

        <div className="pg-header">
          <div className="pg-eyebrow">{t.eyebrow}</div>
          <h1 className="pg-titulo serif">{t.titulo}</h1>
          <p className="pg-sub">{t.subtitulo}</p>
        </div>

        {/* INPUTS */}
        <div className="card">
          <div className="card-label">{t.precoLabel}</div>
          <div className="preco-row">
            <span className="preco-prefix">€</span>
            <input
              className="preco-input"
              type="number" min="0" placeholder="0"
              value={preco} onChange={e => setPreco(e.target.value)}
            />
          </div>
          <p className="preco-hint">{t.precoHint}</p>
        </div>

        <div className="card">
          <div className="card-label">{t.categoriaLabel}</div>
          <div className="pills">
            {CATEGORIAS.map(c => (
              <button key={c.id} className={`pill${categoria === c.id ? " sel" : ""}`} onClick={() => setCategoria(c.id)}>{c.label}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-label">{t.estadoLabel}</div>
          <div className="pills">
            {ESTADOS.map(e => (
              <button key={e.id} className={`pill${estado === e.id ? " sel" : ""}`} onClick={() => setEstado(e.id)}>{e.label}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-label">{t.idadeLabel}</div>
          <div className="pills">
            {IDADES.map(i => (
              <button key={i.id} className={`pill${idade === i.id ? " sel" : ""}`} onClick={() => setIdade(i.id)}>{i.label}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-label">{t.usoLabel}</div>
          <div className="pills">
            {USOS.map(u => (
              <button key={u.id} className={`pill${uso === u.id ? " sel" : ""}`} onClick={() => setUso(u.id)}>{u.label}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-label">{t.mesesLabel}</div>
          <div className="slider-header">
            <span style={{fontSize:"0.78rem",color:"var(--sub)"}}>{t.mesesPeriodo}</span>
            <span className="slider-val">{t.mesesUnidade(meses)}</span>
          </div>
          <input type="range" min="1" max="36" value={meses} onChange={e => setMeses(parseInt(e.target.value))} />
          <p style={{fontSize:"0.7rem",color:"var(--sub)",marginTop:"0.5rem"}}>{t.mesesHint}</p>
        </div>

        {/* GATE DE EMAIL — mostrado quando já avaliou 1x e não está logado */}
        {gateAberto && (
          <div className="gate-overlay" onClick={e => e.target === e.currentTarget && skipGate()}>
            <div className="gate-sheet">
              <div className="gate-titulo">{t.gateTitle}</div>
              <p className="gate-sub">{t.gateSub}</p>
              <input
                className="gate-input"
                type="email"
                placeholder={t.gateEmailPlaceholder}
                value={gateEmail}
                onChange={e => setGateEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitGateEmail()}
                autoFocus
              />
              <p className="gate-legal">{t.gateLegal}</p>
              <button
                className="btn"
                onClick={submitGateEmail}
                disabled={gateSaving}
                style={{opacity: gateSaving ? 0.6 : 1}}
              >
                {gateSaving ? "…" : t.gateBtn}
              </button>
              <button className="gate-skip" onClick={skipGate}>{t.gateSkip}</button>
              <div className="gate-login-row">
                {t.gateOuLogin} <a href="/entrar">{t.gateEntrar}</a>
              </div>
            </div>
          </div>
        )}

        {/* RESULTADOS */}
        {calc && p > 0 && (
          <div className={gateAberto ? "results-blur" : ""}>
            {/* Hero total */}
            <div className="hero-res">
              <div className="hero-label">{t.heroLabel}</div>
              <div className="hero-valor">€{Math.round(calc.totalNG)}</div>
              <div className="hero-nota">{t.heroNota(Math.round(calc.liquidoAluguer), Math.round(calc.vendaFinalLiquido))}</div>
            </div>

            {/* Comparação Vinted */}
            <div className="comp-card">
              <div className="comp-col ng">
                <div className="comp-marca">Nora Grei</div>
                <div className="comp-num">€{Math.round(calc.totalNG)}</div>
                <div className="comp-desc">{t.ngDesc}</div>
                <div className="comp-badge">{t.ngMais(calc.multiplicador.toFixed(1))}</div>
              </div>
              <div className="comp-col vinted">
                <div className="comp-marca">{t.vintedMarca}</div>
                <div className="comp-num">€{Math.round(calc.vendaVinted)}</div>
                <div className="comp-desc">{t.vintedDesc}</div>
              </div>
            </div>

            {/* Ganho extra */}
            <div className="ganho-banner">
              <div className="ganho-text">{t.ganhoText(Math.round(calc.ganhoExtra))}</div>
              <div className="ganho-num">+€{Math.round(calc.ganhoExtra)}</div>
            </div>

            {/* Rotação estimada */}
            <div className="rotacao-card">
              <div className="rotacao-label">{t.rotacaoLabel}</div>
              <div className="rotacao-num">{t.rotacaoNum(calc.alugueresTotal, meses)}</div>
              <div className="rotacao-sub">
                {t.rotacaoSub(calc.rotacaoMes.toFixed(1), catObj?.label[lang] || catObj?.label.pt, ESTADOS_DATA.find(e=>e.id===estado)?.label[lang]?.split("—")[0]?.trim().toLowerCase() || "")}
              </div>
            </div>

            {/* Breakdown */}
            <div className="card">
              <div className="card-label">{t.breakdownLabel}</div>
              <div className="breakdown">
                <div className="bk-row">
                  <span className="bk-label">{t.bk1}</span>
                  <span className="bk-val">€{Math.round(calc.valorMercado)}</span>
                </div>
                <div className="bk-row">
                  <span className="bk-label">{t.bk2}</span>
                  <span className="bk-val">€{calc.precoAluguer}</span>
                </div>
                <div className="bk-row">
                  <span className="bk-label">{t.bk3(calc.alugueresTotal, calc.precoAluguer)}</span>
                  <span className="bk-val pos">+€{Math.round(calc.receitaBruta)}</span>
                </div>
                <div className="bk-row">
                  <span className="bk-label">{t.bk4}</span>
                  <span className="bk-val neg">−€{Math.round(calc.receitaBruta * COMISSAO_ALUGUER)}</span>
                </div>
                <div className="bk-div"/>
                <div className="bk-row">
                  <span className="bk-label">{t.bk5}</span>
                  <span className="bk-val pos">€{Math.round(calc.liquidoAluguer)}</span>
                </div>
                <div className="bk-div"/>
                <div className="bk-row">
                  <span className="bk-label">{t.bk6(meses)}</span>
                  <span className="bk-val">€{Math.round(calc.valorFinalPeca)}</span>
                </div>
                <div className="bk-row">
                  <span className="bk-label">{t.bk7}</span>
                  <span className="bk-val pos">+€{Math.round(calc.vendaFinalLiquido)}</span>
                </div>
                <div className="bk-div"/>
                <div className="bk-total">
                  <span>{t.bkTotal}</span>
                  <span>€{Math.round(calc.totalNG)}</span>
                </div>
              </div>
            </div>

            <a href="/registar?lojista=1" className="btn">{t.cta}</a>
            <a href="/lojas" className="btn btn-outline">{t.ctaVer}</a>

            {/* Disclaimer */}
            <p style={{
              fontSize:"0.7rem",
              color:"var(--sub)",
              lineHeight:1.55,
              textAlign:"center",
              padding:"1.25rem 0.5rem 0",
              borderTop:"1px solid var(--border)",
              marginTop:"0.5rem"
            }}>
              {t.disclaimer}
            </p>
          </div>
        )}

        {(!calc || !p) && (
          <p style={{textAlign:"center",color:"var(--sub)",fontSize:"0.82rem",padding:"1.5rem 0"}}>
            {t.semPreco}
          </p>
        )}

      </div>
    </>
  );
}
