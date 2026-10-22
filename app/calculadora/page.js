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
    fotoLabel: "Analisa a peça com IA",
    fotoSub: "Tira uma foto ou faz upload — preenchemos os campos automaticamente",
    fotoBtn: "Tirar foto / Upload",
    fotoAnalisando: "A analisar...",
    fotoDetectado: "Detectado pela IA — confirma ou ajusta",
    fotoErro: "Não foi possível analisar a foto. Preenche os campos manualmente.",
    fotoDescartar: "Remover foto",
    corLabel: "Cor",
    corPlaceholder: "ex: preto, branco, multicor...",
    materialLabel: "Material",
    materialPlaceholder: "ex: algodão, seda, couro...",
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
    fotoLabel: "Analyse la pièce avec l'IA",
    fotoSub: "Prends une photo ou uploade — on remplit les champs automatiquement",
    fotoBtn: "Photo / Upload",
    fotoAnalisando: "Analyse en cours...",
    fotoDetectado: "Détecté par l'IA — confirme ou ajuste",
    fotoErro: "Impossible d'analyser la photo. Remplis les champs manuellement.",
    fotoDescartar: "Supprimer la photo",
    corLabel: "Couleur",
    corPlaceholder: "ex : noir, blanc, multicolore...",
    materialLabel: "Matière",
    materialPlaceholder: "ex : coton, soie, cuir...",
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
    fotoLabel: "Analizuok drabužį su DI",
    fotoSub: "Nufotografuok arba įkelk — automatiškai užpildysime laukus",
    fotoBtn: "Nuotrauka / Įkelti",
    fotoAnalisando: "Analizuojama...",
    fotoDetectado: "Aptikta DI — patvirtink arba pataisyk",
    fotoErro: "Nepavyko išanalizuoti nuotraukos. Užpildyk laukus rankiniu būdu.",
    fotoDescartar: "Pašalinti nuotrauką",
    corLabel: "Spalva",
    corPlaceholder: "pvz.: juoda, balta, spalvota...",
    materialLabel: "Medžiaga",
    materialPlaceholder: "pvz.: medvilnė, šilkas, oda...",
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

// Categorias de tipo que pertencem a cada grupo de produto
const TIPOS_MALAS    = ["MalaLuxo","MalaOmbro","Clutch","Mochila"];
const TIPOS_RELOGIOS = ["Relogio"];
const TIPOS_CALCADO  = ["Sapatos","Sapatilhas","Botas","Sandalias"];
const TIPOS_JOIAS    = ["Joia"];
const TIPOS_ROUPA    = ["VestidoNoite","Vestido","Fato","Jumpsuit","Saia",
                        "Calças","Jeans","Blusa","Camisa","Camisola","Bodysuit",
                        "Casaco","Blazer","Pele"];
const TIPOS_ACESS    = ["Cinto","Lenco","OculosSol","Chapeu"];

// Factores de retenção por tier × categoria
// Fonte: Vestiaire Collective SS25, ThredUp 2025, plottdata.com/blogs/luxury-resale-market-analysis
// Roupa deprecia muito mais rápido que malas/relógios da mesma marca
const FATORES_MARCA = {
  // tier         roupa  malas  relógio calçado joias  acess
  investimento: { roupa: 0.72, malas: 1.10, relogio: 1.20, calcado: 0.65, joias: 0.90, acess: 0.75 },
  premium:      { roupa: 0.48, malas: 0.72, relogio: 0.65, calcado: 0.52, joias: 0.60, acess: 0.55 },
  alta:         { roupa: 0.28, malas: 0.45, relogio: 0.40, calcado: 0.35, joias: 0.38, acess: 0.32 },
  massmarket:   { roupa: 0.12, malas: 0.22, relogio: 0.18, calcado: 0.15, joias: 0.15, acess: 0.14 },
};

function categoriaTipo(tipo) {
  if (TIPOS_MALAS.includes(tipo))    return "malas";
  if (TIPOS_RELOGIOS.includes(tipo)) return "relogio";
  if (TIPOS_CALCADO.includes(tipo))  return "calcado";
  if (TIPOS_JOIAS.includes(tipo))    return "joias";
  if (TIPOS_ACESS.includes(tipo))    return "acess";
  return "roupa"; // default (inclui _default)
}

function fatorMarca(marca = "", tipo = "_default") {
  const m = marca.toLowerCase().trim();
  const cat = categoriaTipo(tipo);
  if (!m) return { fator: FATORES_MARCA.massmarket[cat], tier: "massmarket" };
  if (MARCAS_INVESTIMENTO.some(b => m.includes(b))) return { fator: FATORES_MARCA.investimento[cat], tier: "investimento" };
  if (MARCAS_PREMIUM.some(b => m.includes(b)))      return { fator: FATORES_MARCA.premium[cat],      tier: "premium" };
  if (MARCAS_ALTA.some(b => m.includes(b)))         return { fator: FATORES_MARCA.alta[cat],         tier: "alta" };
  return { fator: FATORES_MARCA.massmarket[cat], tier: "massmarket" };
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
  { id: "nunca",    fator: 1.00, label: { pt: "Raramente usada",     fr: "Rarement portée",      lt: "Retai nešiota" } },
  { id: "pouco",    fator: 0.88, label: { pt: "Pouco frequente",     fr: "Peu fréquent",         lt: "Retai" } },
  { id: "moderado", fator: 0.72, label: { pt: "Frequência moderada", fr: "Fréquence modérée",    lt: "Vidutiniškai" } },
  { id: "frequente",fator: 0.52, label: { pt: "Muito frequente",     fr: "Très fréquent",        lt: "Labai dažnai" } },
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
  const [cor, setCor] = useState("");
  const [material, setMaterial] = useState("");
  const [tipo, setTipo] = useState("Vestido");
  const [estado, setEstado] = useState("bom");
  const [uso, setUso] = useState("pouco");
  const [idade, setIdade] = useState("1a2");
  const [meses, setMeses] = useState(12);

  // Gate de email
  const [gateAberto, setGateAberto] = useState(false);
  const [gateEmail, setGateEmail] = useState("");
  const [gateOk, setGateOk] = useState(false);
  const [gateSaving, setGateSaving] = useState(false);
  const [userLogado, setUserLogado] = useState(null);
  const [avalCount, setAvalCount] = useState(0);
  const gateDisparado = useRef(false);
  // Autocomplete marca
  const [marcaInput, setMarcaInput] = useState("");
  const [marcaSugestoes, setMarcaSugestoes] = useState([]);
  const [marcaFocused, setMarcaFocused] = useState(false);
  const marcaRef = useRef(null);
  const TODAS_MARCAS = GRUPOS_MARCA.flatMap(g => g.marcas.map(m => ({ nome: m, grupo: g.grupo })));

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

  // ── Análise de foto por IA ────────────────────────────────────────────────
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoAnalisando, setFotoAnalisando] = useState(false);
  const [fotoErro, setFotoErro] = useState(null);
  const [camposIA, setCamposIA] = useState({}); // campos detectados pela IA
  const fotoInputRef = useRef(null);

  const ESTADO_MAP_IA = { comEtiqueta: "comEtiqueta", bom: "bom", usado: "usado", defeito: "defeito" };
  const COR_LABEL = { pt: "cor", fr: "couleur", lt: "spalva" };

  const analisarFoto = async (file) => {
    if (!file) return;
    setFotoErro(null);
    setFotoAnalisando(true);

    // Preview local
    const url = URL.createObjectURL(file);
    setFotoPreview(url);

    try {
      const fd = new FormData();
      fd.append("foto", file);
      const res = await fetch("/api/analisar-peca", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Erro API");
      const dados = await res.json();

      const detectados = {};

      if (dados.tipo) {
        setTipo(dados.tipo);
        detectados.tipo = true;
      }
      if (dados.estado && ESTADO_MAP_IA[dados.estado]) {
        setEstado(dados.estado);
        detectados.estado = true;
      }
      if (dados.marca) {
        setMarca(dados.marca);
        setMarcaInput(dados.marca);
        detectados.marca = true;
      }
      if (dados.cor) {
        detectados.cor = dados.cor;
        setCor(dados.cor);
        setCamposIA(prev => ({ ...prev, cor: dados.cor, cor_confianca: dados.cor_confianca }));
      }
      if (dados.material) {
        detectados.material = dados.material;
        setMaterial(dados.material);
        setCamposIA(prev => ({ ...prev, material: dados.material, material_confianca: dados.material_confianca }));
      }

      setCamposIA(detectados);

    } catch {
      setFotoErro(true);
    } finally {
      setFotoAnalisando(false);
    }
  };

  const removerFoto = () => {
    setFotoPreview(null);
    setCamposIA({});
    setFotoErro(null);
    if (fotoInputRef.current) fotoInputRef.current.value = "";
  };

  const t = T[lang] || T.pt;
  const ESTADOS = ESTADOS_DATA.map(e => ({ ...e, label: e.label[lang] || e.label.pt }));
  const USOS    = USOS_DATA.map(u => ({ ...u, label: u.label[lang] || u.label.pt }));
  const IDADES  = IDADES_DATA.map(i => ({ ...i, label: i.label[lang] || i.label.pt }));
  const TIPOS   = TIPOS_DATA.map(tp => ({ ...tp, label: tp.label[lang] || tp.label.pt }));

  const p = parseFloat(preco) || 0;
  const { fator: fm, tier } = fatorMarca(marca, tipo);

  const calc = useMemo(() => {
    if (!p) return null;
    const { fator: fmemo, tier: tmemo } = fatorMarca(marca, tipo);
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

  // Filtrar sugestões de marca conforme o utilizador escreve
  const handleMarcaInput = (val) => {
    setMarcaInput(val);
    if (val.length < 1) { setMarcaSugestoes([]); return; }
    const q = val.toLowerCase();
    setMarcaSugestoes(TODAS_MARCAS.filter(m => m.nome.toLowerCase().includes(q)).slice(0, 8));
  };

  const escolherMarca = (nome) => {
    setMarca(nome);
    setMarcaInput(nome);
    setMarcaSugestoes([]);
    setMarcaFocused(false);
  };

  // Grupos de tipo de peça para a UI por categoria
  const TIPO_GRUPOS_UI = [
    { icon: "👗", label: { pt: "Vestuário", fr: "Vêtements", lt: "Drabužiai" },
      items: ["VestidoNoite","Vestido","Fato","Jumpsuit","Saia","Calças","Jeans","Blusa","Camisa","Camisola","Bodysuit","Casaco","Blazer","Pele"] },
    { icon: "👜", label: { pt: "Malas", fr: "Sacs", lt: "Krepšiai" },
      items: ["MalaLuxo","MalaOmbro","Clutch","Mochila"] },
    { icon: "👠", label: { pt: "Calçado", fr: "Chaussures", lt: "Avalynė" },
      items: ["Sapatos","Sapatilhas","Botas","Sandalias"] },
    { icon: "✨", label: { pt: "Acessórios", fr: "Accessoires", lt: "Aksesuarai" },
      items: ["Cinto","Lenco","OculosSol","Chapeu","Relogio","Joia"] },
  ];

  const catAtiva = TIPO_GRUPOS_UI.findIndex(g => g.items.includes(tipo));

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
          padding: 0 1rem calc(5rem + env(safe-area-inset-bottom, 0px));
        }

        /* ── Header ─────────────────────────── */
        .pg-back {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--sub); text-decoration: none; font-family: 'Jost', sans-serif;
          padding: 1.25rem 0 0; transition: color 0.2s;
        }
        .pg-back:hover { color: var(--fg); }
        .pg-header {
          padding: 1rem 0 1.25rem;
          text-align: center;
        }
        .pg-eyebrow {
          font-size: 0.62rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--accent);
          margin-bottom: 0.5rem;
        }
        .pg-titulo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.9rem; font-weight: 400; line-height: 1.15;
          color: var(--fg); margin-bottom: 0.4rem;
        }
        .pg-sub {
          font-size: 0.78rem; color: var(--sub);
          line-height: 1.5; max-width: 30ch; margin: 0 auto;
        }

        /* ── Resultado hero (sempre visível no topo) ── */
        .hero-res {
          background: var(--dark); border-radius: 18px;
          padding: 1.5rem 1.35rem; margin-bottom: 0.75rem;
          position: relative; overflow: hidden;
        }
        .hero-res::before {
          content: 'NG'; position: absolute; right: 0.75rem; top: 50%;
          transform: translateY(-50%);
          font-family: 'Cormorant Garamond', serif;
          font-size: 5rem; font-weight: 300;
          color: rgba(255,255,255,0.04); line-height: 1; pointer-events: none;
        }
        .hero-label {
          font-size: 0.58rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(255,255,255,0.38);
          margin-bottom: 0.35rem;
        }
        .hero-valor {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.2rem; font-weight: 400; color: #fff;
          line-height: 1; margin-bottom: 0.25rem;
          transition: all 0.2s ease;
        }
        .hero-valor.vazio {
          color: rgba(255,255,255,0.18);
        }
        .hero-nota {
          font-size: 0.72rem; color: rgba(255,255,255,0.38); line-height: 1.4;
        }

        /* ── Cards ─────────────────────────── */
        .card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 14px; padding: 1.1rem 1.15rem;
          margin-bottom: 0.65rem;
        }
        .card-label {
          font-size: 0.58rem; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--sub);
          margin-bottom: 0.85rem; font-weight: 500;
        }

        /* ── Input preço ─────────────────────── */
        .preco-row {
          display: flex; align-items: center; gap: 0.45rem;
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 8px; padding: 0 0.85rem;
          transition: border-color 0.15s;
        }
        .preco-row:focus-within { border-color: var(--accent); }
        .preco-prefix { font-size: 1.05rem; color: var(--sub); }
        .preco-input {
          flex: 1; border: none; background: transparent;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.75rem; font-weight: 400;
          color: var(--fg); padding: 0.45rem 0; outline: none;
        }
        .preco-hint { font-size: 0.7rem; color: var(--sub); margin-top: 0.35rem; }

        /* ── Categoria tabs (tipo) ───────────── */
        .cat-tabs {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0.35rem; margin-bottom: 0.85rem;
        }
        .cat-tab {
          display: flex; flex-direction: column; align-items: center;
          gap: 0.2rem; padding: 0.55rem 0.25rem;
          border: 1px solid var(--border); border-radius: 10px;
          background: var(--bg); cursor: pointer; transition: all 0.15s;
          font-family: 'Jost', sans-serif;
        }
        .cat-tab.sel {
          background: var(--fg); border-color: var(--fg);
        }
        .cat-tab-icon { font-size: 1.1rem; line-height: 1; }
        .cat-tab-label {
          font-size: 0.6rem; color: var(--sub); font-weight: 400;
          white-space: nowrap;
        }
        .cat-tab.sel .cat-tab-label { color: rgba(255,255,255,0.7); }

        /* Sub-tipo select */
        .tipo-select {
          width: 100%; padding: 0.6rem 2.2rem 0.6rem 0.85rem;
          border: 1px solid var(--border); border-radius: 8px;
          background: var(--bg) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b6560' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 0.85rem center;
          color: var(--fg); font-family: 'Jost', sans-serif;
          font-size: 0.85rem; outline: none; appearance: none; cursor: pointer;
        }

        /* ── Autocomplete marca ──────────────── */
        .marca-wrap { position: relative; }
        .marca-input {
          width: 100%; padding: 0.65rem 0.85rem;
          border: 1px solid var(--border); border-radius: 8px;
          background: var(--bg); color: var(--fg);
          font-family: 'Jost', sans-serif; font-size: 0.88rem;
          outline: none; transition: border-color 0.15s;
        }
        .marca-input:focus { border-color: var(--accent); }
        .marca-dropdown {
          position: absolute; top: calc(100% + 4px); left: 0; right: 0;
          background: var(--card); border: 1px solid var(--border);
          border-radius: 10px; z-index: 50; overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .marca-item {
          padding: 0.65rem 0.85rem; font-size: 0.84rem; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
          transition: background 0.1s; font-family: 'Jost', sans-serif;
        }
        .marca-item:hover { background: var(--bg); }
        .marca-item-grupo {
          font-size: 0.6rem; color: var(--sub);
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .marca-badge {
          display: inline-block; margin-top: 0.4rem;
          font-size: 0.58rem; letter-spacing: 0.12em;
          text-transform: uppercase; padding: 0.18rem 0.5rem;
          border-radius: 3px; font-weight: 500;
        }
        .tier-investimento { background: #1a3a2a; color: #a8d8a8; }
        .tier-premium      { background: #1a1a2e; color: #c4b0e8; }
        .tier-alta         { background: #2a2018; color: #e8c97a; }

        /* ── Pills em grid (4 colunas, nunca quebra) ── */
        .pills-grid {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 0.35rem;
        }
        .pill {
          padding: 0.5rem 0.2rem; border: 1px solid var(--border);
          border-radius: 8px; font-size: 0.68rem; text-align: center;
          background: var(--bg); color: var(--sub); cursor: pointer;
          transition: all 0.12s; font-family: 'Jost', sans-serif;
          line-height: 1.25; white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis;
        }
        .pill.sel {
          background: var(--fg); color: #fff; border-color: var(--fg);
        }
        /* Quando são só 4 opções, grid de 4 — quando são 3 itens, grid de 3 */
        .pills-3 { grid-template-columns: repeat(3,1fr); }

        /* ── Slider meses ────────────────────── */
        .slider-header { display: flex; justify-content: space-between; margin-bottom: 0.6rem; }
        .slider-val { font-size: 0.95rem; font-weight: 600; color: var(--fg); }
        input[type=range] {
          -webkit-appearance: none; width: 100%; height: 3px;
          border-radius: 2px; background: var(--border); outline: none;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px;
          border-radius: 50%; background: var(--accent); cursor: pointer;
          box-shadow: 0 1px 4px rgba(196,116,138,0.4);
        }

        /* ── Comparação Vinted ───────────────── */
        .comp-card {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0.55rem; margin-bottom: 0.65rem;
        }
        .comp-col {
          border-radius: 12px; padding: 0.9rem;
          border: 1px solid var(--border);
        }
        .comp-col.ng { background: var(--dark); border-color: transparent; }
        .comp-col.vinted { background: var(--card); }
        .comp-marca {
          font-size: 0.58rem; letter-spacing: 0.16em;
          text-transform: uppercase; margin-bottom: 0.45rem;
        }
        .comp-col.ng .comp-marca { color: rgba(255,255,255,0.35); }
        .comp-col.vinted .comp-marca { color: var(--sub); }
        .comp-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.75rem; font-weight: 400; line-height: 1;
          margin-bottom: 0.25rem;
        }
        .comp-col.ng .comp-num { color: #fff; }
        .comp-col.vinted .comp-num { color: var(--fg); }
        .comp-desc { font-size: 0.65rem; line-height: 1.3; }
        .comp-col.ng .comp-desc { color: rgba(255,255,255,0.35); }
        .comp-col.vinted .comp-desc { color: var(--sub); }
        .comp-badge {
          font-size: 0.6rem; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--accent);
          margin-top: 0.4rem; font-weight: 500;
        }

        /* ── Ganho banner ────────────────────── */
        .ganho-banner {
          background: linear-gradient(135deg, #c4748a 0%, #a85870 100%);
          border-radius: 12px; padding: 0.9rem 1.1rem;
          margin-bottom: 0.65rem;
          display: flex; justify-content: space-between;
          align-items: center; gap: 0.85rem;
        }
        .ganho-text { font-size: 0.76rem; color: rgba(255,255,255,0.85); line-height: 1.4; }
        .ganho-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.85rem; font-weight: 400; color: #fff;
          white-space: nowrap; flex-shrink: 0;
        }

        /* ── Rotação ─────────────────────────── */
        .rotacao-card {
          background: var(--green-bg); border: 1px solid #b8e0ca;
          border-radius: 12px; padding: 0.9rem 1.1rem;
          margin-bottom: 0.65rem;
        }
        .rotacao-label {
          font-size: 0.58rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--green);
          margin-bottom: 0.4rem; font-weight: 500;
        }
        .rotacao-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem; font-weight: 400; color: var(--green); line-height: 1;
        }
        .rotacao-sub { font-size: 0.72rem; color: #3a7a55; margin-top: 0.2rem; line-height: 1.4; }

        /* ── Breakdown ───────────────────────── */
        .breakdown { display: flex; flex-direction: column; gap: 0.5rem; }
        .bk-row { display: flex; justify-content: space-between; font-size: 0.78rem; }
        .bk-label { color: var(--sub); padding-right: 0.5rem; }
        .bk-val { font-weight: 500; white-space: nowrap; }
        .bk-val.pos { color: var(--green); }
        .bk-val.neg { color: #c0392b; }
        .bk-div { height: 1px; background: var(--border); }
        .bk-total { display: flex; justify-content: space-between; font-weight: 600; font-size: 0.85rem; }

        /* ── Botões ──────────────────────────── */
        .btn {
          display: block; width: 100%; padding: 0.95rem;
          background: var(--fg); color: #fff; border: none;
          border-radius: 10px; font-family: 'Jost', sans-serif;
          font-size: 0.72rem; letter-spacing: 0.14em;
          text-transform: uppercase; cursor: pointer;
          text-align: center; text-decoration: none;
          transition: background 0.2s;
        }
        .btn:hover { background: #2d2926; }
        .btn-outline {
          background: transparent; color: var(--sub);
          border: 1px solid var(--border); margin-top: 0.5rem;
        }
        .btn-outline:hover { background: var(--bg); }

        /* ── Gate de email ───────────────────── */
        .gate-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          display: flex; align-items: flex-end; justify-content: center;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .gate-sheet {
          background: var(--bg); border-radius: 20px 20px 0 0;
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
          font-size: 1.5rem; font-weight: 400;
          color: var(--fg); margin-bottom: 0.35rem;
        }
        .gate-sub { font-size: 0.78rem; color: var(--sub); line-height: 1.5; margin-bottom: 1.1rem; }
        .gate-input {
          width: 100%; padding: 0.8rem 1rem;
          border: 1.5px solid var(--border); border-radius: 10px;
          background: var(--card); color: var(--fg);
          font-family: 'Jost', sans-serif; font-size: 0.88rem;
          margin-bottom: 0.7rem; outline: none; transition: border-color 0.15s;
        }
        .gate-input:focus { border-color: var(--accent); }
        .gate-legal { font-size: 0.63rem; color: var(--sub); line-height: 1.45; margin-bottom: 0.9rem; }
        .gate-skip {
          display: block; width: 100%; text-align: center;
          font-size: 0.7rem; color: var(--sub);
          background: none; border: none; cursor: pointer;
          padding: 0.5rem; margin-top: 0.2rem;
          font-family: 'Jost', sans-serif; text-decoration: underline;
        }
        .gate-login-row { text-align: center; font-size: 0.73rem; color: var(--sub); margin-top: 0.7rem; }
        .gate-login-row a { color: var(--accent); text-decoration: none; }
        .results-blur { filter: blur(6px); pointer-events: none; user-select: none; }

        /* ── Card de foto ────────────────────── */
        .foto-card {
          border: 1.5px dashed var(--border); border-radius: 14px;
          padding: 1.1rem 1.15rem; margin-bottom: 0.65rem;
          background: var(--card); transition: border-color 0.15s;
        }
        .foto-card:hover { border-color: var(--accent); }
        .foto-upload-area {
          display: flex; flex-direction: column; align-items: center;
          gap: 0.5rem; padding: 0.75rem 0; cursor: pointer;
        }
        .foto-icon {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--bg); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
        }
        .foto-upload-label {
          font-size: 0.78rem; font-weight: 500; color: var(--fg);
        }
        .foto-upload-sub {
          font-size: 0.68rem; color: var(--sub); text-align: center; line-height: 1.4;
        }
        .foto-preview-wrap {
          position: relative; border-radius: 10px; overflow: hidden;
          margin-bottom: 0.6rem;
        }
        .foto-preview {
          width: 100%; max-height: 200px; object-fit: cover;
          border-radius: 10px; display: block;
        }
        .foto-loading {
          position: absolute; inset: 0; background: rgba(16,12,10,0.55);
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
        }
        .foto-spinner {
          width: 28px; height: 28px; border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .foto-descartada-btn {
          position: absolute; top: 0.4rem; right: 0.4rem;
          background: rgba(16,12,10,0.65); color: #fff;
          border: none; border-radius: 4px; font-size: 0.62rem;
          padding: 0.25rem 0.5rem; cursor: pointer;
          font-family: 'Jost', sans-serif; letter-spacing: 0.05em;
        }
        .foto-detectado-banner {
          font-size: 0.65rem; color: var(--accent);
          letter-spacing: 0.1em; text-transform: uppercase;
          font-weight: 500; margin-bottom: 0.5rem;
        }
        .foto-campos-list {
          display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 0.4rem;
        }
        .foto-campo-tag {
          font-size: 0.65rem; padding: 0.2rem 0.55rem;
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 20px; color: var(--fg);
        }
        .foto-campo-tag.ia { border-color: var(--accent); color: var(--accent); }
        .foto-erro {
          font-size: 0.72rem; color: #c0392b; padding: 0.5rem 0;
        }

        /* Campo IA destacado */
        .campo-ia-tag {
          font-size: 0.58rem; color: var(--accent);
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 0.3rem; font-weight: 500;
        }

        /* ── Lang switcher ───────────────────── */
        .lang-row {
          display: flex; justify-content: center; gap: 0.5rem;
          padding: 0.75rem 0 0.25rem;
        }
        .lang-btn {
          font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.25rem 0.6rem; border-radius: 4px; cursor: pointer;
          border: 1px solid transparent; background: none;
          color: var(--sub); font-family: 'Jost', sans-serif; transition: all 0.12s;
        }
        .lang-btn.sel { border-color: var(--border); color: var(--fg); background: var(--card); }
      `}</style>

      <div className="wrap">

        {/* ── Lang switcher ── */}
        <div className="lang-row">
          {["pt","fr","lt"].map(l => (
            <button key={l} className={`lang-btn${lang===l?" sel":""}`}
              onClick={() => { setLang(l); try { localStorage.setItem("ng_lang",l); } catch {} }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── Header ── */}
        <a href="/" className="pg-back">← Início</a>
        <div className="pg-header">
          <div className="pg-eyebrow">{t.eyebrow}</div>
          <h1 className="pg-titulo serif">{t.titulo}</h1>
          <p className="pg-sub">{t.subtitulo}</p>
        </div>

        {/* ── RESULTADO HERO — sempre visível, actualiza em tempo real ── */}
        <div className="hero-res">
          <div className="hero-label">{t.heroLabel}</div>
          <div className={`hero-valor${(!calc || !p) ? " vazio" : ""}`}>
            {calc && p > 0 ? `€${Math.round(calc.totalNG)}` : "€ —"}
          </div>
          <div className="hero-nota">
            {calc && p > 0
              ? t.heroNota(Math.round(calc.liquidoAluguer), Math.round(calc.vendaFinalLiquido))
              : (lang==="fr"?"Remplis les champs pour voir le résultat":lang==="lt"?"Užpildyk laukus, kad pamatytum rezultatą":"Preenche os campos para ver o resultado")}
          </div>
        </div>

        {/* ── 0. UPLOAD DE FOTO — opcional, pré-preenche campos ── */}
        <input
          ref={fotoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          style={{ display: "none" }}
          onChange={e => { if (e.target.files?.[0]) analisarFoto(e.target.files[0]); }}
        />

        <div className="foto-card" onClick={() => !fotoPreview && fotoInputRef.current?.click()}>
          <div className="card-label">{t.fotoLabel}</div>

          {!fotoPreview && (
            <div className="foto-upload-area">
              <div className="foto-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <span className="foto-upload-label">{t.fotoBtn}</span>
              <span className="foto-upload-sub">{t.fotoSub}</span>
            </div>
          )}

          {fotoPreview && (
            <>
              <div className="foto-preview-wrap">
                <img src={fotoPreview} alt="" className="foto-preview" />
                {fotoAnalisando && (
                  <div className="foto-loading">
                    <div className="foto-spinner" />
                  </div>
                )}
                {!fotoAnalisando && (
                  <button className="foto-descartada-btn" onClick={e => { e.stopPropagation(); removerFoto(); }}>
                    {t.fotoDescartar}
                  </button>
                )}
              </div>

              {!fotoAnalisando && !fotoErro && Object.keys(camposIA).length > 0 && (
                <>
                  <div className="foto-detectado-banner">{t.fotoDetectado}</div>
                  <div className="foto-campos-list">
                    {camposIA.tipo && <span className="foto-campo-tag ia">{TIPOS_DATA.find(tp => tp.id === tipo)?.label[lang] || tipo}</span>}
                    {camposIA.estado && <span className="foto-campo-tag ia">{ESTADOS_DATA.find(e => e.id === estado)?.label[lang]?.split("—")[0]?.trim() || estado}</span>}
                    {camposIA.marca && <span className="foto-campo-tag ia">{marca}</span>}
                    {camposIA.cor && <span className="foto-campo-tag">{camposIA.cor}</span>}
                    {camposIA.material && <span className="foto-campo-tag">{camposIA.material}</span>}
                  </div>
                </>
              )}

              {fotoErro && <div className="foto-erro">{t.fotoErro}</div>}

              {!fotoAnalisando && (
                <button className="btn btn-outline" style={{marginTop:"0.4rem",fontSize:"0.68rem",padding:"0.6rem"}}
                  onClick={e => { e.stopPropagation(); fotoInputRef.current?.click(); }}>
                  {t.fotoBtn}
                </button>
              )}
            </>
          )}
        </div>

        {/* ── 1. TIPO DE PEÇA — primeiro ── */}
        <div className="card">
          <div className="card-label">{t.tipoLabel}</div>
          {/* Tabs de categoria */}
          <div className="cat-tabs">
            {TIPO_GRUPOS_UI.map((g, idx) => (
              <button key={idx}
                className={`cat-tab${catAtiva === idx ? " sel" : ""}`}
                onClick={() => setTipo(g.items[0])}>
                <span className="cat-tab-icon">{g.icon}</span>
                <span className="cat-tab-label">{g.label[lang] || g.label.pt}</span>
              </button>
            ))}
          </div>
          {/* Sub-tipo */}
          <select className="tipo-select" value={tipo} onChange={e => setTipo(e.target.value)}>
            {(TIPO_GRUPOS_UI[catAtiva >= 0 ? catAtiva : 0]?.items || TIPO_GRUPOS_UI[0].items).map(id => {
              const td = TIPOS_DATA.find(t => t.id === id);
              return td ? <option key={id} value={id}>{td.label[lang] || td.label.pt}</option> : null;
            })}
          </select>
        </div>

        {/* ── 2. PREÇO ── */}
        <div className="card">
          <div className="card-label">{t.precoLabel}</div>
          <div className="preco-row">
            <span className="preco-prefix">€</span>
            <input className="preco-input" type="number" min="0" placeholder="0"
              value={preco} onChange={e => setPreco(e.target.value)} inputMode="numeric" />
          </div>
          <p className="preco-hint">{t.precoHint}</p>
        </div>

        {/* ── 3. MARCA — autocomplete ── */}
        <div className="card">
          <div className="card-label">{t.marcaLabel}</div>
          <div className="marca-wrap" ref={marcaRef}>
            <input
              className="marca-input"
              type="text"
              placeholder={t.marcaPlaceholder}
              value={marcaInput}
              onChange={e => handleMarcaInput(e.target.value)}
              onFocus={() => setMarcaFocused(true)}
              onBlur={() => setTimeout(() => setMarcaFocused(false), 150)}
              autoComplete="off"
            />
            {marcaFocused && marcaSugestoes.length > 0 && (
              <div className="marca-dropdown">
                {marcaSugestoes.map(s => (
                  <div key={s.nome} className="marca-item" onMouseDown={() => escolherMarca(s.nome)}>
                    <span>{s.nome}</span>
                    <span className="marca-item-grupo">{s.grupo[lang] || s.grupo.pt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {tier && tier !== "massmarket" && marca && (
            <span className={`marca-badge tier-${tier}`}>
              {tier==="investimento" ? (lang==="fr"?"Investissement ↑":lang==="lt"?"Investicinė ↑":"Investimento ↑")
              : tier==="premium" ? (lang==="fr"?"Marque premium":lang==="lt"?"Premium":"Premium")
              : (lang==="fr"?"Haute marque":lang==="lt"?"Aukšta klasė":"Alta gama")}
            </span>
          )}
        </div>

        {/* ── 3b. COR + MATERIAL ── */}
        <div className="card">
          {(camposIA.cor || camposIA.material) && <div className="campo-ia-tag">{t.fotoDetectado}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <div className="card-label">{t.corLabel}</div>
              <input
                className="marca-input"
                type="text"
                placeholder={t.corPlaceholder}
                value={cor}
                onChange={e => setCor(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div>
              <div className="card-label">{t.materialLabel}</div>
              <input
                className="marca-input"
                type="text"
                placeholder={t.materialPlaceholder}
                value={material}
                onChange={e => setMaterial(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* ── 4. ESTADO — pills grid 4 cols ── */}
        <div className="card">
          {camposIA.estado && <div className="campo-ia-tag">{t.fotoDetectado}</div>}
          <div className="card-label">{t.estadoLabel}</div>
          <div className="pills-grid">
            {ESTADOS.map(e => (
              <button key={e.id} className={`pill${estado === e.id ? " sel" : ""}`}
                onClick={() => setEstado(e.id)}>
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 5. USO — pills grid 4 cols ── */}
        <div className="card">
          <div className="card-label">{t.usoLabel}</div>
          <div className="pills-grid">
            {USOS.map(u => (
              <button key={u.id} className={`pill${uso === u.id ? " sel" : ""}`}
                onClick={() => setUso(u.id)}>
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 6. IDADE — pills grid 4 cols ── */}
        <div className="card">
          <div className="card-label">{t.idadeLabel}</div>
          <div className="pills-grid">
            {IDADES.map(i => (
              <button key={i.id} className={`pill${idade === i.id ? " sel" : ""}`}
                onClick={() => setIdade(i.id)}>
                {i.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 7. MESES slider ── */}
        <div className="card">
          <div className="slider-header">
            <span style={{fontSize:"0.76rem",color:"var(--sub)"}}>{t.mesesPeriodo}</span>
            <span className="slider-val">{t.mesesUnidade(meses)}</span>
          </div>
          <input type="range" min="1" max="36" value={meses}
            onChange={e => setMeses(parseInt(e.target.value))} />
          <p style={{fontSize:"0.68rem",color:"var(--sub)",marginTop:"0.45rem"}}>{t.mesesHint}</p>
        </div>

        {/* ── Gate de email ── */}
        {gateAberto && (
          <div className="gate-overlay" onClick={e => e.target === e.currentTarget && skipGate()}>
            <div className="gate-sheet">
              <div className="gate-titulo">{t.gateTitle}</div>
              <p className="gate-sub">{t.gateSub}</p>
              <input className="gate-input" type="email"
                placeholder={t.gateEmailPlaceholder}
                value={gateEmail}
                onChange={e => setGateEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitGateEmail()}
                autoFocus />
              <p className="gate-legal">{t.gateLegal}</p>
              <button className="btn" onClick={submitGateEmail}
                disabled={gateSaving} style={{opacity: gateSaving ? 0.6 : 1}}>
                {gateSaving ? "…" : t.gateBtn}
              </button>
              <button className="gate-skip" onClick={skipGate}>{t.gateSkip}</button>
              <div className="gate-login-row">
                {t.gateOuLogin} <a href="/entrar">{t.gateEntrar}</a>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTADOS DETALHADOS (após preço preenchido) ── */}
        {calc && p > 0 && (
          <div className={gateAberto ? "results-blur" : ""}>

            {/* Comparação */}
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

            {/* Rotação */}
            <div className="rotacao-card">
              <div className="rotacao-label">{t.rotacaoLabel}</div>
              <div className="rotacao-num">{t.rotacaoNum(calc.alugueresTotal, meses)}</div>
              <div className="rotacao-sub">
                {t.rotacaoSub(
                  calc.rotacaoMes.toFixed(1),
                  TIPOS_DATA.find(tp=>tp.id===tipo)?.label[lang] || TIPOS_DATA.find(tp=>tp.id==="_default")?.label[lang],
                  ESTADOS_DATA.find(e=>e.id===estado)?.label[lang]?.split("—")[0]?.trim().toLowerCase() || ""
                )}
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

            <p style={{fontSize:"0.68rem",color:"var(--sub)",lineHeight:1.5,textAlign:"center",padding:"1.25rem 0.5rem 0",borderTop:"1px solid var(--border)",marginTop:"0.5rem"}}>
              {t.disclaimer}
            </p>
          </div>
        )}

        {(!calc || !p) && (
          <p style={{textAlign:"center",color:"var(--sub)",fontSize:"0.8rem",padding:"1rem 0 0.5rem"}}>
            {t.semPreco}
          </p>
        )}

      </div>
    </>
  );
}
