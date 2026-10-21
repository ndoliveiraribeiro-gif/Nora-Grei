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
    marcaLabel: "Marca",
    marcaPlaceholder: "ex: Chanel, Zara, Gucci...",
    tipoLabel: "Tipo de peça",
    estadoLabel: "Estado actual da peça",
    usoLabel: "Frequência de uso",
    idadeLabel: "Idade da peça",
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
    marcaLabel: "Marque",
    marcaPlaceholder: "ex : Chanel, Zara, Gucci...",
    tipoLabel: "Type de pièce",
    estadoLabel: "État actuel de la pièce",
    usoLabel: "Fréquence d'utilisation",
    idadeLabel: "Âge de la pièce",
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
    marcaLabel: "Prekės ženklas",
    marcaPlaceholder: "pvz.: Chanel, Zara, Gucci...",
    tipoLabel: "Drabužio tipas",
    estadoLabel: "Dabartinė drabužio būklė",
    usoLabel: "Nešiojimo dažnis",
    idadeLabel: "Drabužio amžius",
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

// ── Sistema de marcas com grupos ─────────────────────────────────────────────
// Listas de detecção de tier (lowercase, para fatorMarca)
const MARCAS_INVESTIMENTO = [
  "rolex","patek philippe","patek","audemars piguet","ap","richard mille",
  "vacheron constantin","jaeger-lecoultre","jaeger lecoultre","a. lange","lange",
  "cartier","hermès","hermes","chanel","louis vuitton","lv","birkin","kelly",
  "delvaux","goyard",
];
const MARCAS_PREMIUM = [
  "gucci","prada","bottega veneta","dior","christian dior","saint laurent","ysl",
  "celine","céline","givenchy","valentino","versace","balenciaga","jacquemus",
  "loewe","loro piana","brunello cucinelli","max mara","tod's","tods","ferragamo",
  "burberry","mulberry","ralph lauren","michael kors","coach","kate spade",
  "longchamp","furla","tory burch","liu jo","pinko","self-portrait",
  "omega","tag heuer","breitling","iwc","tudor","longines","tissot",
];
const MARCAS_ALTA = [
  "zara","mango","&other stories","other stories","cos","arket","massimo dutti",
  "pedro del hierro","hugo boss","boss","calvin klein","ck","tommy hilfiger","tommy",
  "lacoste","levis","levi's","gant","scotch soda","weekday","monki","stradivarius",
  "bershka","pull&bear","sfera","phase eight","whistles","reiss","allsaints",
  "ba&sh","bash","sandro","maje","claudie pierlot","rouje","apc","a.p.c.",
  "isabel marant etoile","ba&sh","iro","american vintage","sessun","soeur",
];

// Grupos para o combobox — separados por tipo de produto
const GRUPOS_MARCA = [
  {
    grupo: { pt: "Relógios de Luxo", fr: "Montres de Luxe", lt: "Prabangūs laikrodžiai" },
    marcas: ["Rolex","Patek Philippe","Audemars Piguet","Richard Mille","Vacheron Constantin","Jaeger-LeCoultre","A. Lange & Söhne","Cartier","Omega","TAG Heuer","Breitling","IWC","Tudor","Longines","Tissot"],
  },
  {
    grupo: { pt: "Haute Couture & Joalharia", fr: "Haute Couture & Joaillerie", lt: "Haute couture ir papuošalai" },
    marcas: ["Chanel","Hermès","Louis Vuitton","Delvaux","Goyard"],
  },
  {
    grupo: { pt: "Luxo — Roupa & Acessórios", fr: "Luxe — Vêtements & Accessoires", lt: "Prabanga — drabužiai ir aksesuarai" },
    marcas: ["Gucci","Prada","Bottega Veneta","Dior","Saint Laurent","Celine","Givenchy","Valentino","Versace","Balenciaga","Jacquemus","Loewe","Loro Piana","Brunello Cucinelli","Max Mara","Tod's","Ferragamo","Burberry","Mulberry","Ralph Lauren"],
  },
  {
    grupo: { pt: "Premium — Malas & Acessórios", fr: "Premium — Sacs & Accessoires", lt: "Premium — rankinės ir aksesuarai" },
    marcas: ["Michael Kors","Coach","Kate Spade","Longchamp","Furla","Tory Burch","Liu Jo","Pinko","Self-Portrait"],
  },
  {
    grupo: { pt: "Contemporary / High Street", fr: "Contemporary / High Street", lt: "Contemporary / High Street" },
    marcas: ["Sandro","Maje","Ba&sh","Claudie Pierlot","Isabel Marant Étoile","IRO","A.P.C.","American Vintage","Rouje","Sessun","Soeur"],
  },
  {
    grupo: { pt: "High Street", fr: "High Street", lt: "High Street" },
    marcas: ["Zara","Mango","COS","Arket","Massimo Dutti","Hugo Boss","Calvin Klein","Tommy Hilfiger","Lacoste","Levi's","Gant","& Other Stories","Phase Eight","Reiss","Whistles","AllSaints","Pull&Bear","Bershka","Stradivarius"],
  },
];

function fatorMarca(marca = "") {
  const m = marca.toLowerCase().trim();
  if (!m) return { fator: 0.32, tier: "massmarket" };
  if (MARCAS_INVESTIMENTO.some(b => m.includes(b))) return { fator: 1.15, tier: "investimento" };
  if (MARCAS_PREMIUM.some(b => m.includes(b))) return { fator: 0.82, tier: "premium" };
  if (MARCAS_ALTA.some(b => m.includes(b))) return { fator: 0.50, tier: "alta" };
  return { fator: 0.32, tier: "massmarket" };
}

// Comissões reais da plataforma
const COMISSAO_ALUGUER = 0.10;
const COMISSAO_VENDA = 0.20;
const CUSTO_ENVIO = 6;

const ESTADOS_DATA = [
  { id: "como_novo",  fator: 0.92, label: { pt: "Com etiqueta",   fr: "Avec étiquette",  lt: "Su etikete" } },
  { id: "bom",        fator: 0.68, label: { pt: "Bom estado",     fr: "Bon état",        lt: "Gera būklė" } },
  { id: "usado",      fator: 0.45, label: { pt: "Desgaste visível",fr: "Usure visible",   lt: "Matomas nusidėvėjimas" } },
  { id: "com_defeito",fator: 0.25, label: { pt: "Com defeito",    fr: "Avec défaut",     lt: "Su defektu" } },
];

const USOS_DATA = [
  { id: "nunca",    fator: 1.00, label: { pt: "1–2 vezes",      fr: "1–2 fois",         lt: "1–2 kartai" } },
  { id: "pouco",    fator: 0.88, label: { pt: "Menos de 10×",   fr: "Moins de 10 fois", lt: "Mažiau 10×" } },
  { id: "moderado", fator: 0.72, label: { pt: "10 a 30 vezes",  fr: "10 à 30 fois",     lt: "10–30 kartų" } },
  { id: "frequente",fator: 0.52, label: { pt: "Mais de 30×",    fr: "Plus de 30 fois",  lt: "Daugiau 30×" } },
];

const IDADES_DATA = [
  { id: "novo",  fator: 1.00, label: { pt: "Menos de 1 ano",  fr: "Moins d'un an",  lt: "Mažiau nei 1 metai" } },
  { id: "1a2",   fator: 0.85, label: { pt: "1 a 2 anos",      fr: "1 à 2 ans",       lt: "1–2 metai" } },
  { id: "2a4",   fator: 0.70, label: { pt: "2 a 4 anos",      fr: "2 à 4 ans",       lt: "2–4 metai" } },
  { id: "4mais", fator: 0.52, label: { pt: "Mais de 4 anos",  fr: "Plus de 4 ans",   lt: "Daugiau nei 4 metai" } },
];

// ── Tipos de peça por categoria ──────────────────────────────────────────────
const TIPOS_DATA = [
  // Vestuário — ocasião
  { id: "VestidoNoite",  rot: 2.2, dias: 2.0, fp: 0.13, label: { pt: "Vestido de gala / noite", fr: "Robe de soirée",     lt: "Vakarinė suknelė" } },
  { id: "Vestido",       rot: 1.8, dias: 3.5, fp: 0.10, label: { pt: "Vestido",                  fr: "Robe",               lt: "Suknelė" } },
  { id: "Fato",          rot: 1.5, dias: 4.0, fp: 0.09, label: { pt: "Fato / conjunto",          fr: "Costume / ensemble", lt: "Kostiumas / komplektas" } },
  { id: "Jumpsuit",      rot: 1.4, dias: 3.0, fp: 0.09, label: { pt: "Jumpsuit / macacão",       fr: "Combinaison",        lt: "Kombinezonas" } },
  { id: "Saia",          rot: 1.2, dias: 3.0, fp: 0.08, label: { pt: "Saia",                     fr: "Jupe",               lt: "Sijonas" } },
  // Vestuário — dia a dia
  { id: "Calças",        rot: 1.1, dias: 3.0, fp: 0.07, label: { pt: "Calças",                   fr: "Pantalon",           lt: "Kelnės" } },
  { id: "Jeans",         rot: 1.0, dias: 3.0, fp: 0.06, label: { pt: "Jeans",                    fr: "Jean",               lt: "Džinsai" } },
  { id: "Blusa",         rot: 1.1, dias: 3.0, fp: 0.07, label: { pt: "Blusa / top",              fr: "Blouse / top",       lt: "Palaidinė / topas" } },
  { id: "Camisa",        rot: 1.0, dias: 3.0, fp: 0.06, label: { pt: "Camisa",                   fr: "Chemise",            lt: "Marškiniai" } },
  { id: "Camisola",      rot: 1.0, dias: 3.0, fp: 0.06, label: { pt: "Camisola / cardigan",      fr: "Pull / cardigan",    lt: "Megztinis / kardiganas" } },
  { id: "Bodysuit",      rot: 1.1, dias: 2.5, fp: 0.07, label: { pt: "Bodysuit",                 fr: "Body",               lt: "Bodysuit" } },
  // Vestuário — exteriores
  { id: "Casaco",        rot: 1.0, dias: 5.0, fp: 0.07, label: { pt: "Casaco / sobretudo",       fr: "Manteau",            lt: "Paltas" } },
  { id: "Blazer",        rot: 1.2, dias: 3.5, fp: 0.08, label: { pt: "Blazer",                   fr: "Blazer",             lt: "Bleizeris" } },
  { id: "Pele",          rot: 0.9, dias: 5.0, fp: 0.10, label: { pt: "Pele / couro",             fr: "Cuir / fourrure",    lt: "Oda / kailis" } },
  // Acessórios — malas
  { id: "MalaLuxo",      rot: 2.5, dias: 4.0, fp: 0.15, label: { pt: "Mala de luxo",             fr: "Sac de luxe",        lt: "Prabangus krepšys" } },
  { id: "MalaOmbro",     rot: 2.0, dias: 4.0, fp: 0.12, label: { pt: "Mala de ombro",            fr: "Sac à main",         lt: "Rankinė" } },
  { id: "Clutch",        rot: 1.8, dias: 2.0, fp: 0.11, label: { pt: "Clutch / carteira",        fr: "Pochette",           lt: "Vokelė" } },
  { id: "Mochila",       rot: 1.3, dias: 3.5, fp: 0.09, label: { pt: "Mochila",                  fr: "Sac à dos",          lt: "Kuprinė" } },
  // Acessórios — outros
  { id: "Cinto",         rot: 1.5, dias: 3.0, fp: 0.09, label: { pt: "Cinto",                    fr: "Ceinture",           lt: "Diržas" } },
  { id: "Lenco",         rot: 1.6, dias: 2.5, fp: 0.10, label: { pt: "Lenço / foulard",          fr: "Foulard",            lt: "Skara / šalikas" } },
  { id: "OculosSol",     rot: 1.4, dias: 3.0, fp: 0.09, label: { pt: "Óculos de sol",            fr: "Lunettes de soleil", lt: "Saulės akiniai" } },
  { id: "Chapeu",        rot: 1.2, dias: 3.0, fp: 0.08, label: { pt: "Chapéu",                   fr: "Chapeau",            lt: "Skrybėlė" } },
  // Calçado
  { id: "Sapatos",       rot: 1.3, dias: 3.0, fp: 0.08, label: { pt: "Sapatos",                  fr: "Chaussures",         lt: "Batai" } },
  { id: "Sapatilhas",    rot: 1.1, dias: 3.0, fp: 0.07, label: { pt: "Sapatilhas / sneakers",    fr: "Baskets",            lt: "Sportiniai batai" } },
  { id: "Botas",         rot: 1.2, dias: 4.0, fp: 0.08, label: { pt: "Botas",                    fr: "Bottes",             lt: "Auliniai batai" } },
  { id: "Sandalias",     rot: 1.3, dias: 2.5, fp: 0.08, label: { pt: "Sandálias",                fr: "Sandales",           lt: "Sandalai" } },
  // Relógios & joalharia
  { id: "Relogio",       rot: 1.8, dias: 5.0, fp: 0.12, label: { pt: "Relógio",                  fr: "Montre",             lt: "Laikrodis" } },
  { id: "Joia",          rot: 1.5, dias: 3.0, fp: 0.10, label: { pt: "Joia / bijutaria",         fr: "Bijou",              lt: "Papuošalas" } },
  // Fallback
  { id: "_default",      rot: 1.2, dias: 3.5, fp: 0.08, label: { pt: "Outra peça",               fr: "Autre",              lt: "Kita" } },
];

export default function Calculadora() {
  const [lang, setLang] = useState("pt");
  const [preco, setPreco] = useState("");
  const [marca, setMarca] = useState("");
  const [tipo, setTipo] = useState("Vestido");
  const [estado, setEstado] = useState("bom");
  const [uso, setUso] = useState("pouco");
  const [idade, setIdade] = useState("1a2");
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
  const ESTADOS = ESTADOS_DATA.map(e => ({ ...e, label: e.label[lang] || e.label.pt }));
  const USOS    = USOS_DATA.map(u => ({ ...u, label: u.label[lang] || u.label.pt }));
  const IDADES  = IDADES_DATA.map(i => ({ ...i, label: i.label[lang] || i.label.pt }));
  const TIPOS   = TIPOS_DATA.map(tp => ({ ...tp, label: tp.label[lang] || tp.label.pt }));

  const p = parseFloat(preco) || 0;
  const { fator: fm, tier } = fatorMarca(marca);

  const calc = useMemo(() => {
    if (!p) return null;
    const { fator: fmemo, tier: tmemo } = fatorMarca(marca);
    const est = ESTADOS_DATA.find(e => e.id === estado);
    const usoObj = USOS_DATA.find(u => u.id === uso);
    const idObj  = IDADES_DATA.find(i => i.id === idade);
    const cat = TIPOS_DATA.find(tp => tp.id === tipo) ?? TIPOS_DATA.find(tp => tp.id === "_default");

    // Fator estado × uso × idade combinado
    const fei = est.fator * usoObj.fator * idObj.fator;
    const feiClamp = fei < 0.30 ? fei * 0.85 : fei > 0.85 ? fei * 1.05 : fei;

    // Valor de mercado (marcas investimento podem superar preço original)
    const valorMercado = tmemo === "investimento"
      ? Math.round(p * fmemo)
      : Math.round(p * fmemo * feiClamp);

    // Tier bonus para preço de aluguer
    const tierBonus = tmemo === "investimento" ? 1.35 : tmemo === "premium" ? 1.20 : tmemo === "alta" ? 1.05 : 1.0;
    const precoAluguer = Math.max(5, Math.round(valorMercado * cat.fp * tierBonus / 5) * 5);

    // Rotação e alugueres totais
    const rotacaoMes = cat.rot * est.fator;
    const alugueresTotal = Math.max(1, Math.round(rotacaoMes * meses));

    // Receita aluguer
    const receitaBruta = precoAluguer * alugueresTotal;
    const liquidoAluguer = receitaBruta * (1 - COMISSAO_ALUGUER);

    // Valor residual após alugueres (deprecia suavemente)
    const depreciacaoMes = 0.008;
    const valorFinalPeca = valorMercado * Math.pow(1 - depreciacaoMes, alugueresTotal);
    const vendaFinalLiquido = Math.max(0, valorFinalPeca * (1 - COMISSAO_VENDA) - CUSTO_ENVIO);

    // Total NG
    const totalNG = liquidoAluguer + vendaFinalLiquido;

    // Vinted — preço de ocasião imediato
    const VINTED_FATOR_TIER = { investimento: 0.50, premium: 0.35, alta: 0.20, massmarket: 0.12 };
    const vendaVinted = Math.round(p * (VINTED_FATOR_TIER[tmemo] ?? 0.18));

    const ganhoExtra = totalNG - vendaVinted;
    const multiplicador = vendaVinted > 0 ? (totalNG / vendaVinted) : 0;

    return {
      valorMercado, precoAluguer, rotacaoMes, alugueresTotal,
      receitaBruta, liquidoAluguer, valorFinalPeca,
      vendaFinalLiquido, totalNG, vendaVinted, ganhoExtra, multiplicador, tier: tmemo,
    };
  }, [p, marca, tipo, estado, uso, idade, meses]);

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

        {/* MARCA — combobox por categoria + texto livre */}
        <div className="card">
          <div className="card-label">{t.marcaLabel}</div>
          <select
            style={{
              width:"100%",padding:"0.6rem 0.85rem",
              border:"1px solid var(--border)",borderRadius:"8px",
              background:"var(--bg)",color:"var(--fg)",
              fontFamily:"'Jost',sans-serif",fontSize:"0.88rem",
              outline:"none",appearance:"none",
              backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b6560' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
              backgroundRepeat:"no-repeat",backgroundPosition:"right 0.85rem center",
              paddingRight:"2.5rem",cursor:"pointer",marginBottom:"0.5rem",
            }}
            value={marca === "_outro" ? "_outro" : (GRUPOS_MARCA.flatMap(g=>g.marcas).find(m=>m.toLowerCase()===marca.toLowerCase()) ? marca : (marca ? "_outro" : ""))}
            onChange={e => {
              if (e.target.value === "_outro") { setMarca("_outro"); }
              else if (e.target.value === "") { setMarca(""); }
              else { setMarca(e.target.value); }
            }}
          >
            <option value="">{lang==="fr"?"— Choisir une marque —":lang==="lt"?"— Pasirinkti prekės ženklą —":"— Escolher uma marca —"}</option>
            {GRUPOS_MARCA.map(g => (
              <optgroup key={g.grupo.pt} label={g.grupo[lang] || g.grupo.pt}>
                {g.marcas.map(m => <option key={m} value={m}>{m}</option>)}
              </optgroup>
            ))}
            <option value="_outro">{lang==="fr"?"Outra marca (escrever)":lang==="lt"?"Kitas prekės ženklas (įvesti)":"Outra marca (escrever)"}</option>
          </select>
          {/* Input de texto livre quando selecciona "Outra marca" ou digitou manualmente */}
          {(marca === "_outro" || (marca && !GRUPOS_MARCA.flatMap(g=>g.marcas).some(m=>m.toLowerCase()===marca.toLowerCase()) && marca !== "")) && (
            <input
              style={{
                width:"100%",padding:"0.6rem 0.85rem",
                border:"1px solid var(--border)",borderRadius:"8px",
                background:"var(--bg)",color:"var(--fg)",
                fontFamily:"'Jost',sans-serif",fontSize:"0.88rem",
                outline:"none",marginBottom:"0.5rem",
              }}
              type="text"
              placeholder={t.marcaPlaceholder}
              value={marca === "_outro" ? "" : marca}
              onChange={e => setMarca(e.target.value)}
              autoFocus
            />
          )}
          {tier && tier !== "massmarket" && (
            <div style={{marginTop:"0.4rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>
              <span style={{
                fontSize:"0.62rem",letterSpacing:"0.14em",textTransform:"uppercase",
                padding:"0.2rem 0.55rem",borderRadius:"3px",fontWeight:500,
                background: tier==="investimento"?"#1a3a2a": tier==="premium"?"#1a1a2e":"#2a2018",
                color: tier==="investimento"?"#a8d8a8": tier==="premium"?"#c4b0e8":"#e8c97a",
              }}>
                {tier==="investimento" ? (lang==="fr"?"Pièce d'investissement ↑":lang==="lt"?"Investicinė ↑":"Peça de investimento ↑")
                : tier==="premium" ? (lang==="fr"?"Marque premium":lang==="lt"?"Premium prekės ženklas":"Marca premium")
                : (lang==="fr"?"Marque haute":lang==="lt"?"Aukšta klasė":"Marca alta")}
              </span>
            </div>
          )}
        </div>

        {/* TIPO DE PEÇA — select por categoria */}
        <div className="card">
          <div className="card-label">{t.tipoLabel}</div>
          <select
            style={{
              width:"100%",padding:"0.6rem 0.85rem",
              border:"1px solid var(--border)",borderRadius:"8px",
              background:"var(--bg)",color:"var(--fg)",
              fontFamily:"'Jost',sans-serif",fontSize:"0.88rem",
              outline:"none",appearance:"none",
              backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b6560' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
              backgroundRepeat:"no-repeat",backgroundPosition:"right 0.85rem center",
              paddingRight:"2.5rem",cursor:"pointer",
            }}
            value={tipo}
            onChange={e => setTipo(e.target.value)}
          >
            <optgroup label={lang==="fr"?"Vêtements — Occasion":lang==="lt"?"Drabužiai — Proga":"Vestuário — Ocasião"}>
              <option value="VestidoNoite">{TIPOS_DATA.find(t=>t.id==="VestidoNoite")?.label[lang]}</option>
              <option value="Vestido">{TIPOS_DATA.find(t=>t.id==="Vestido")?.label[lang]}</option>
              <option value="Fato">{TIPOS_DATA.find(t=>t.id==="Fato")?.label[lang]}</option>
              <option value="Jumpsuit">{TIPOS_DATA.find(t=>t.id==="Jumpsuit")?.label[lang]}</option>
              <option value="Saia">{TIPOS_DATA.find(t=>t.id==="Saia")?.label[lang]}</option>
            </optgroup>
            <optgroup label={lang==="fr"?"Vêtements — Quotidien":lang==="lt"?"Drabužiai — Kasdien":"Vestuário — Dia a dia"}>
              <option value="Calças">{TIPOS_DATA.find(t=>t.id==="Calças")?.label[lang]}</option>
              <option value="Jeans">{TIPOS_DATA.find(t=>t.id==="Jeans")?.label[lang]}</option>
              <option value="Blusa">{TIPOS_DATA.find(t=>t.id==="Blusa")?.label[lang]}</option>
              <option value="Camisa">{TIPOS_DATA.find(t=>t.id==="Camisa")?.label[lang]}</option>
              <option value="Camisola">{TIPOS_DATA.find(t=>t.id==="Camisola")?.label[lang]}</option>
              <option value="Bodysuit">{TIPOS_DATA.find(t=>t.id==="Bodysuit")?.label[lang]}</option>
            </optgroup>
            <optgroup label={lang==="fr"?"Vêtements — Extérieur":lang==="lt"?"Drabužiai — Viršutiniai":"Vestuário — Exteriores"}>
              <option value="Casaco">{TIPOS_DATA.find(t=>t.id==="Casaco")?.label[lang]}</option>
              <option value="Blazer">{TIPOS_DATA.find(t=>t.id==="Blazer")?.label[lang]}</option>
              <option value="Pele">{TIPOS_DATA.find(t=>t.id==="Pele")?.label[lang]}</option>
            </optgroup>
            <optgroup label={lang==="fr"?"Sacs":lang==="lt"?"Krepšiai":"Malas"}>
              <option value="MalaLuxo">{TIPOS_DATA.find(t=>t.id==="MalaLuxo")?.label[lang]}</option>
              <option value="MalaOmbro">{TIPOS_DATA.find(t=>t.id==="MalaOmbro")?.label[lang]}</option>
              <option value="Clutch">{TIPOS_DATA.find(t=>t.id==="Clutch")?.label[lang]}</option>
              <option value="Mochila">{TIPOS_DATA.find(t=>t.id==="Mochila")?.label[lang]}</option>
            </optgroup>
            <optgroup label={lang==="fr"?"Accessoires":lang==="lt"?"Aksesuarai":"Acessórios"}>
              <option value="Cinto">{TIPOS_DATA.find(t=>t.id==="Cinto")?.label[lang]}</option>
              <option value="Lenco">{TIPOS_DATA.find(t=>t.id==="Lenco")?.label[lang]}</option>
              <option value="OculosSol">{TIPOS_DATA.find(t=>t.id==="OculosSol")?.label[lang]}</option>
              <option value="Chapeu">{TIPOS_DATA.find(t=>t.id==="Chapeu")?.label[lang]}</option>
            </optgroup>
            <optgroup label={lang==="fr"?"Chaussures":lang==="lt"?"Avalynė":"Calçado"}>
              <option value="Sapatos">{TIPOS_DATA.find(t=>t.id==="Sapatos")?.label[lang]}</option>
              <option value="Sapatilhas">{TIPOS_DATA.find(t=>t.id==="Sapatilhas")?.label[lang]}</option>
              <option value="Botas">{TIPOS_DATA.find(t=>t.id==="Botas")?.label[lang]}</option>
              <option value="Sandalias">{TIPOS_DATA.find(t=>t.id==="Sandalias")?.label[lang]}</option>
            </optgroup>
            <optgroup label={lang==="fr"?"Montres & Bijoux":lang==="lt"?"Laikrodžiai ir papuošalai":"Relógios & Joalharia"}>
              <option value="Relogio">{TIPOS_DATA.find(t=>t.id==="Relogio")?.label[lang]}</option>
              <option value="Joia">{TIPOS_DATA.find(t=>t.id==="Joia")?.label[lang]}</option>
            </optgroup>
            <option value="_default">{TIPOS_DATA.find(t=>t.id==="_default")?.label[lang]}</option>
          </select>
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
          <div className="card-label">{t.usoLabel}</div>
          <div className="pills">
            {USOS.map(u => (
              <button key={u.id} className={`pill${uso === u.id ? " sel" : ""}`} onClick={() => setUso(u.id)}>{u.label}</button>
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
                {t.rotacaoSub(calc.rotacaoMes.toFixed(1), TIPOS_DATA.find(tp=>tp.id===tipo)?.label[lang] || TIPOS_DATA.find(tp=>tp.id==="_default")?.label[lang], ESTADOS_DATA.find(e=>e.id===estado)?.label[lang]?.split("—")[0]?.trim().toLowerCase() || "")}
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
