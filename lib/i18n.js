/**
 * lib/i18n.js — Traduções centrais Nora Grei (PT / FR / LT)
 * Importar em qualquer página/componente:
 *   import { t, traduzCat, traduzOcasiao, traduzCondicao } from "@/lib/i18n";
 *   const l = t(lang);
 */

// ─── Categorias ─────────────────────────────────────────────────────────────
export const CATEGORIAS = [
  { key: "Vestidos",   pt: "Vestidos",   fr: "Robes",        lt: "Suknelės" },
  { key: "Casacos",    pt: "Casacos",    fr: "Manteaux",     lt: "Paltai" },
  { key: "Conjuntos",  pt: "Conjuntos",  fr: "Ensembles",    lt: "Komplektai" },
  { key: "Acessórios", pt: "Acessórios", fr: "Accessoires",  lt: "Aksesuarai" },
  { key: "Corsets",    pt: "Corsets",    fr: "Corsets",      lt: "Korsetai" },
  { key: "Tops",       pt: "Tops",       fr: "Tops",         lt: "Topai" },
  { key: "Calças",     pt: "Calças",     fr: "Pantalons",    lt: "Kelnės" },
  { key: "Saias",      pt: "Saias",      fr: "Jupes",        lt: "Sijonai" },
  { key: "Relógios",   pt: "Relógios",   fr: "Montres",      lt: "Laikrodžiai" },
  { key: "Malas",      pt: "Malas",      fr: "Sacs",         lt: "Rankinės" },
  { key: "Bijutaria",  pt: "Bijutaria",  fr: "Bijoux",       lt: "Papuošalai" },
];

/** Traduz uma categoria pelo valor PT → lang */
export function traduzCat(cat, lang) {
  if (!cat || lang === "pt") return cat;
  return CATEGORIAS.find(c => c.pt === cat || c.key === cat)?.[lang] || cat;
}

// ─── Condição / Estado ───────────────────────────────────────────────────────
export const CONDICOES = [
  { key: "novo",      pt: "Novo",       fr: "Neuf",       lt: "Naujas" },
  { key: "como_novo", pt: "Como novo",  fr: "Comme neuf", lt: "Kaip naujas" },
  { key: "muito_bom", pt: "Muito bom",  fr: "Très bon",   lt: "Labai geras" },
  { key: "bom",       pt: "Bom",        fr: "Bon",        lt: "Geras" },
  { key: "usado",     pt: "Usado",      fr: "Usé",        lt: "Naudotas" },
];

export function traduzCondicao(key, lang) {
  if (!key || lang === "pt") return key;
  return CONDICOES.find(c => c.key === key)?.[lang] || key;
}

// ─── Ocasiões ────────────────────────────────────────────────────────────────
export const OCASIOES = [
  { key: "casamento",  pt: "Casamento",  fr: "Mariage",      lt: "Vestuvės" },
  { key: "gala",       pt: "Gala",       fr: "Gala",         lt: "Gala" },
  { key: "cocktail",   pt: "Cocktail",   fr: "Cocktail",     lt: "Kokteilių vakarėlis" },
  { key: "festa",      pt: "Festa",      fr: "Fête",         lt: "Šventė" },
  { key: "trabalho",   pt: "Trabalho",   fr: "Travail",      lt: "Darbas" },
  { key: "casual",     pt: "Casual",     fr: "Casual",       lt: "Kasdieninis" },
  { key: "viagem",     pt: "Viagem",     fr: "Voyage",       lt: "Kelionė" },
  { key: "desporto",   pt: "Desporto",   fr: "Sport",        lt: "Sportas" },
  { key: "praia",      pt: "Praia",      fr: "Plage",        lt: "Paplūdimys" },
];

export function traduzOcasiao(key, lang) {
  if (!key || lang === "pt") return key;
  return OCASIOES.find(o => o.key === key)?.[lang] || key;
}

// ─── Modalidades ─────────────────────────────────────────────────────────────
export const MODALIDADES = {
  alugar:  { pt: "Alugar",       fr: "Louer",   lt: "Nuomoti" },
  comprar: { pt: "Comprar",      fr: "Acheter", lt: "Pirkti" },
  ambos:   { pt: "Alugar/Venda", fr: "Louer/Vente", lt: "Nuoma/Pardavimas" },
  social:  { pt: "Venda Social", fr: "Vente Sociale", lt: "Socialinis pardavimas" },
};

// ─── Labels de UI ────────────────────────────────────────────────────────────
const LABELS = {
  pt: {
    // Navegação / acções
    alugar:          "Alugar",
    comprar:         "Comprar",
    reservar:        "Indisponível — Reservar",
    disponivel:      "Disponível",
    indisponivel:    "Indisponível",
    guardar:         "Guardar",
    removerGuardado: "Remover dos guardados",
    verLoja:         "Ver loja",
    verMais:         "Ver mais",
    fechar:          "Fechar",
    // Catálogo / filtros
    filtros:         "Filtros",
    categoria:       "Categoria",
    ocasiao:         "Ocasião",
    tamanho:         "Tamanho",
    cor:             "Cor",
    condicao:        "Condição",
    todasCategorias: "Todas as categorias",
    // Preços
    dia:             "/dia",
    venda:           "venda",
    precoLivre:      "preço livre",
    // Modal preço
    detalhesPreco:   "Detalhes do preço",
    precoPeca:       "Preço da peça",
    taxaServico:     "Taxa de serviço e proteção",
    envio:           "Envio",
    envioSub:        "A calcular no pagamento",
    total:           "Total",
    okFechar:        "OK, fechar",
    protecao:        "Proteção Nora Grei — transações seguras e política de reembolso.",
    // Publicar
    publicar:        "Publicar peça",
    // Perfil
    minhaConta:      "Minha conta",
    minhaspecas:     "As minhas peças",
    // Estados
    pendente:        "Pendente",
    aprovado:        "Aprovado",
    rejeitado:       "Rejeitado",
    // Calculadora
    calculadora:     "Calculadora",
    inicio:          "Início",
  },
  fr: {
    alugar:          "Louer",
    comprar:         "Acheter",
    reservar:        "Indisponible — Réserver",
    disponivel:      "Disponible",
    indisponivel:    "Indisponible",
    guardar:         "Sauvegarder",
    removerGuardado: "Retirer des favoris",
    verLoja:         "Voir la boutique",
    verMais:         "Voir plus",
    fechar:          "Fermer",
    filtros:         "Filtres",
    categoria:       "Catégorie",
    ocasiao:         "Occasion",
    tamanho:         "Taille",
    cor:             "Couleur",
    condicao:        "État",
    todasCategorias: "Toutes les catégories",
    dia:             "/jour",
    venda:           "vente",
    precoLivre:      "prix libre",
    detalhesPreco:   "Détails du prix",
    precoPeca:       "Prix de l'article",
    taxaServico:     "Frais de service et protection",
    envio:           "Livraison",
    envioSub:        "Calculés au paiement",
    total:           "Total",
    okFechar:        "OK, fermer",
    protecao:        "Protection Nora Grei — transactions sécurisées et politique de remboursement.",
    publicar:        "Publier un article",
    minhaConta:      "Mon compte",
    minhaspecas:     "Mes articles",
    pendente:        "En attente",
    aprovado:        "Approuvé",
    rejeitado:       "Rejeté",
    calculadora:     "Calculatrice",
    inicio:          "Accueil",
  },
  lt: {
    alugar:          "Nuomoti",
    comprar:         "Pirkti",
    reservar:        "Neprieinama — Rezervuoti",
    disponivel:      "Prieinama",
    indisponivel:    "Neprieinama",
    guardar:         "Išsaugoti",
    removerGuardado: "Pašalinti iš išsaugotų",
    verLoja:         "Žiūrėti parduotuvę",
    verMais:         "Žiūrėti daugiau",
    fechar:          "Uždaryti",
    filtros:         "Filtrai",
    categoria:       "Kategorija",
    ocasiao:         "Proga",
    tamanho:         "Dydis",
    cor:             "Spalva",
    condicao:        "Būklė",
    todasCategorias: "Visos kategorijos",
    dia:             "/d.",
    venda:           "pardavimas",
    precoLivre:      "laisva kaina",
    detalhesPreco:   "Kainos detalės",
    precoPeca:       "Prekės kaina",
    taxaServico:     "Paslaugų ir apsaugos mokestis",
    envio:           "Pristatymas",
    envioSub:        "Skaičiuojama mokėjimo metu",
    total:           "Iš viso",
    okFechar:        "Gerai, uždaryti",
    protecao:        "Nora Grei apsauga — saugios operacijos ir grąžinimo politika.",
    publicar:        "Paskelbti prekę",
    minhaConta:      "Mano paskyra",
    minhaspecas:     "Mano prekės",
    pendente:        "Laukiama",
    aprovado:        "Patvirtinta",
    rejeitado:       "Atmesta",
    calculadora:     "Skaičiuoklė",
    inicio:          "Pradžia",
  },
};

/** Devolve o objecto de labels para o lang pedido (fallback PT) */
export function t(lang) {
  return LABELS[lang] || LABELS.pt;
}

// ─── Locales de data por língua ──────────────────────────────────────────────
const LANG_LOCALE = { pt: "pt-PT", fr: "fr-FR", lt: "lt-LT" };

/**
 * Formata uma data respeitando a língua activa.
 * @param {string|Date} date
 * @param {string} lang — "pt" | "fr" | "lt"
 * @param {Intl.DateTimeFormatOptions} opts — opções passadas ao toLocaleDateString
 */
export function fmtData(date, lang, opts = { day: "numeric", month: "short", year: "numeric" }) {
  if (!date) return "";
  const locale = LANG_LOCALE[lang] || "pt-PT";
  try {
    return new Date(date).toLocaleDateString(locale, opts);
  } catch {
    return new Date(date).toLocaleDateString("pt-PT", opts);
  }
}

/**
 * Formata data + hora respeitando a língua activa.
 */
export function fmtDataHora(date, lang) {
  if (!date) return "";
  const locale = LANG_LOCALE[lang] || "pt-PT";
  try {
    return new Date(date).toLocaleString(locale);
  } catch {
    return new Date(date).toLocaleString("pt-PT");
  }
}

export default { t, traduzCat, traduzCondicao, traduzOcasiao, fmtData, fmtDataHora, CATEGORIAS, CONDICOES, OCASIOES, MODALIDADES };
