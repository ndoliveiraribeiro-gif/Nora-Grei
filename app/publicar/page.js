"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIAS_VESTUARIO = ["Vestidos","Saias","Calças","Blusas","Casacos","Fatos","Macacões","Conjuntos","Camisas","Kaftans"];
const CATEGORIAS_ACESSORIOS = ["Malas","Anéis","Colares","Pulseiras","Cachecóis","Chapéus","Cintos","Óculos","Luvas","Acessórios"];
const CATEGORIAS_SEM_TAMANHO = ["Acessórios","Malas","Anéis","Colares","Pulseiras","Cachecóis","Relógios","Chapéus","Cintos","Óculos"];
const TAMANHOS = ["XS","S","M","L","XL","XXL","34","36","38","40","42","44","46","48","Único"];
const OCASIOES_PT = ["Casamento","Gala","Cocktail","Festa","Jantar","Trabalho","Dia a dia","Praia","Férias","Praia/Férias"];
const OCASIOES_FR = ["Mariage","Gala","Cocktail","Fête","Dîner","Travail","Quotidien","Plage","Vacances","Plage/Vacances"];
const OCASIOES_LT = ["Vestuvės","Gala","Kokteiliai","Vakarėlis","Vakarienė","Darbas","Kasdienybė","Paplūdimys","Atostogos","Paplūd./Atost."];
const CORES = ["Preto","Branco","Creme","Bege","Castanho","Azul","Azul marinho","Verde","Verde esmeralda","Vermelho","Rosa","Lilás","Roxo","Laranja","Amarelo","Dourado","Prateado","Multicolor","Estampado","Animal print"];

// ── Dicionário i18n global da página ────────────────────────────────────────
const T = {
  pt: {
    // Auth / acesso
    carregando: "...",
    precisaAuth: "Precisas de estar autenticado para publicar uma peça.",
    entrar: "Entrar",
    perfilErro: "Não foi possível carregar o teu perfil. Tenta novamente.",
    lojistaNaoPodePublicar: "Esta área é exclusiva para lojistas aprovados. Candidata-te no teu perfil.",
    lojistaSuspensa: "A tua conta de lojista está inativa. Contacta a Nora Grei para reativar.",
    irPerfil: "Ir para o perfil",
    // Nav
    voltar: "← Voltar",
    // Passo 1 — Fotos
    p1titulo: "Adicionar peça",
    p1sub: "Começa pelas fotos — até 5 imagens da peça.",
    fotosCard: "Fotos da peça",
    tocaFotos: "Toca para adicionar fotos",
    fotosFormatos: "JPG, PNG, WEBP — até 5 fotos",
    adicionarFoto: "Adicionar",
    tirarFoto: "Tirar foto",
    usarCamera: "Câmara",
    escolherFoto: "Galeria / Ficheiro",
    daBiblioteca: "Biblioteca de fotos",
    removerFoto: "Remover",
    aAnalisar: "A analisar...",
    fotoRejeitada: "✕ Foto rejeitada",
    fotosSelecionadasSingular: "foto selecionada. A primeira será a imagem principal.",
    fotosSelecionadasPlural: "fotos selecionadas. A primeira será a imagem principal.",
    erroSemFotos: "Adiciona pelo menos uma foto.",
    erroAguardarAnalise: "Aguarda a análise das fotos.",
    erroFotosRejeitadas: "Remove as fotos rejeitadas antes de continuar.",
    aAnalisarFotos: "A analisar fotos...",
    continuar: "Continuar →",
    // Passo 2 — Detalhes
    p2titulo: "Detalhes da peça",
    p2sub: "Informação sobre a peça — quanto mais detalhes, melhor para a cliente.",
    categoriaCard: "Categoria",
    categoriaLabel: "Categoria *",
    categoriaPlaceholder: "Selecionar categoria...",
    grupoVestuario: "Vestuário",
    grupoAcessorios: "Acessórios",
    grupoRelogios: "Relógios",
    grupoCalcado: "Calçado",
    calcadoItens: ["Saltos","Sandálias","Botas","Sapatilhas","Calçado"],
    identificacaoCard: "Identificação",
    nomeLabel: "Nome da peça *",
    nomePlaceholder: "Ex: Vestido midi azul marinho",
    marcaLabel: "Marca / Designer",
    marcaPlaceholder: "Zara, Mango, Gucci...",
    valorNovaBotaoNaoSei: "Não sei o preço original",
    valorNovaBotaoCancelar: "✕ cancelar",
    valorNovaLabel: "Valor peça nova (€)",
    valorNovaObrigatorio: "*",
    valorNovaEstimativaPlaceholder: "Estimativa de valor (ex: 120)",
    valorNovaEstimativaHint: "⚠ Inserir uma estimativa do valor de mercado actual — os cálculos ficarão menos precisos.",
    valorNovaPlaceholder: "Ex: 200",
    valorNovaHint: "Preço original quando era nova — base do aluguer e da venda usada.",
    corLabel: "Cor principal",
    corPlaceholder: "Azul marinho",
    materialLabel: "Material",
    materialPlaceholder: "100% seda natural",
    condicaoLabel: "Condição",
    condicaoNovo: "Novo (com etiqueta)",
    condicaoComoNovo: "Como novo (nunca usado)",
    condicaoMuitoBom: "Muito bom estado",
    condicaoBom: "Bom estado",
    condicaoUsado: "Usado",
    descricaoLabel: "Descrição",
    descricaoPlaceholder: "Conta a história desta peça — ocasião ideal, como usar, porquê é especial...",
    defeitoCard: "Estado de conservação",
    defeitoLabel: "A peça tem defeito",
    defeitoPerfeito: "A peça está em perfeitas condições.",
    defeitoPlaceholder: "Descreve o defeito — ex: ligeira mancha na manga, fio solto na bainha...",
    higienizacaoCard: "Higienização",
    higienizacaoLabel: "Esta peça requer higienização profissional",
    higienizacaoSem: "Sem taxa de higienização — a limpeza é tratada internamente.",
    higienizacaoCustoLabel: "Custo de higienização (€)",
    higienizacaoCustoPlaceholder: "ex: 6.00",
    higienizacaoCustoHint: "Valor cobrado ao cliente no checkout. Define de acordo com a tua lavandaria parceira.",
    tamanhosCard: "Tamanhos disponíveis",
    adicionarTamanho: "+ Tamanho",
    ocasioesCard: "Ocasiões",
    estimativaLabel: "Estimativa automática",
    aluguerDia: "Aluguer / dia",
    vendaUsada: "Venda usada",
    valorMercado: "Valor mercado",
    caucao: "Caução",
    erroNome: "O nome da peça é obrigatório.",
    erroValorEstimativa: "Insere uma estimativa do valor de mercado — mesmo aproximada ajuda a calcular os preços.",
    erroValorOriginal: "Indica o valor original da peça nova — precisamos dele para calcular os preços. Se não sabes, clica em «Não sei o preço original».",
    erroCategoria: "Seleciona uma categoria.",
    // Passo 3 — Preços
    p3titulo: "Preços e disponibilidade",
    p3sub: "Define como a peça estará disponível — para alugar, vender, ou ambos.",
    estimativaNG: "Estimativa Nora Grei",
    tierPremium: "✦ Marca premium",
    tierAlta: "Marca alta",
    tierMassmarket: "Marca standard",
    rotacoesMes: "rotações/mês",
    diasAluguer: "dias/aluguer",
    potencial: "potencial",
    em12Meses: "em 12 meses",
    usarSugestao: "Usar sugestão",
    ajustarManualmente: "Ou ajusta manualmente abaixo",
    idadePecaCard: "Idade da peça",
    idadeMenos1: "Menos de 1 ano",
    idade1a2: "1 a 2 anos",
    idade2a4: "2 a 4 anos",
    idade4mais: "Mais de 4 anos",
    precosCard: "Preços",
    valorNovaObrigLabel: "Valor peça nova (€) *",
    valorNovaObrigHint: "Obrigatório — é a âncora para calcular o preço de aluguer, caução e valor de venda usada.",
    aluguerDiaLabel: "Aluguer / dia (€) *",
    aluguerSugestao: "sugerido:",
    clientePoupanca: "A cliente poupa",
    vsComprarNova: "% vs comprar nova",
    vendaUsadaLabel: "Preço de venda usada (€) *",
    vendaUsadaEstimativa: "Estimativa:",
    vendaUsadaComBase: "com base no estado e marca.",
    vendaUsadaHint: "Preço de venda da peça em segunda mão.",
    linkExternoCard: "Link para comprar nova",
    linkExternoOpcional: "(opcional)",
    linkExternoLabel: "Link para comprar nova ↗",
    linkExterno15: "15€/mês",
    linkExternoPlaceholder: "https://www.zara.com/produto/...",
    linkExternoHint: "Direciona as clientes para comprarem a peça nova noutro site. A Nora Grei ativa este link após pagamento de 15€/mês.",
    erroValorEstimativa2: "Insere uma estimativa do valor de mercado para continuar.",
    erroValorOriginal2: "O valor da peça é obrigatório — é a base para calcular o aluguer e o preço usado. Se não sabes, clica em «Não sei o preço original» no passo anterior.",
    erroAluguerDia: "Indica o preço de aluguer por dia.",
    erroPrecoVenda: "Indica o preço de venda.",
    aPublicar: "A publicar...",
    publicarPeca: "Publicar peça",
    erroPublicar: "Erro ao publicar: ",
    erroPorFavor: "tenta de novo.",
    // Passo 4 — Sucesso
    p4titulo: "Peça publicada!",
    p4sub: "A tua peça foi adicionada ao teu catálogo e ficará visível na tua loja após aprovação.",
    verLoja: "Ver a minha loja ↗",
    adicionarOutra: "Adicionar outra peça",
    irParaPerfil: "Ir para o perfil",
  },
  fr: {
    carregando: "...",
    precisaAuth: "Tu dois être authentifiée pour publier un article.",
    entrar: "Se connecter",
    perfilErro: "Impossible de charger ton profil. Réessaie.",
    lojistaNaoPodePublicar: "Cette section est réservée aux boutiques approuvées. Candidater depuis ton profil.",
    lojistaSuspensa: "Ton compte boutique est inactif. Contacte Nora Grei pour le réactiver.",
    irPerfil: "Aller au profil",
    voltar: "← Retour",
    p1titulo: "Ajouter un article",
    p1sub: "Commence par les photos — jusqu'à 5 images de l'article.",
    fotosCard: "Photos de l'article",
    tocaFotos: "Touche pour ajouter des photos",
    fotosFormatos: "JPG, PNG, WEBP — jusqu'à 5 photos",
    adicionarFoto: "Ajouter",
    tirarFoto: "Prendre une photo",
    usarCamera: "Appareil photo",
    escolherFoto: "Galerie / Fichier",
    daBiblioteca: "Bibliothèque de photos",
    removerFoto: "Supprimer",
    aAnalisar: "Analyse...",
    fotoRejeitada: "✕ Photo rejetée",
    fotosSelecionadasSingular: "photo sélectionnée. La première sera l'image principale.",
    fotosSelecionadasPlural: "photos sélectionnées. La première sera l'image principale.",
    erroSemFotos: "Ajoute au moins une photo.",
    erroAguardarAnalise: "Attends la fin de l'analyse des photos.",
    erroFotosRejeitadas: "Supprime les photos rejetées avant de continuer.",
    aAnalisarFotos: "Analyse des photos...",
    continuar: "Continuer →",
    p2titulo: "Détails de l'article",
    p2sub: "Informations sur l'article — plus il y a de détails, mieux c'est pour la cliente.",
    categoriaCard: "Catégorie",
    categoriaLabel: "Catégorie *",
    categoriaPlaceholder: "Choisir une catégorie...",
    grupoVestuario: "Vêtements",
    grupoAcessorios: "Accessoires",
    grupoRelogios: "Montres",
    grupoCalcado: "Chaussures",
    calcadoItens: ["Talons","Sandales","Bottes","Baskets","Chaussures"],
    identificacaoCard: "Identification",
    nomeLabel: "Nom de l'article *",
    nomePlaceholder: "Ex : Robe midi bleu marine",
    marcaLabel: "Marque / Créateur",
    marcaPlaceholder: "Zara, Mango, Gucci...",
    valorNovaBotaoNaoSei: "Je ne connais pas le prix d'origine",
    valorNovaBotaoCancelar: "✕ annuler",
    valorNovaLabel: "Valeur article neuf (€)",
    valorNovaObrigatorio: "*",
    valorNovaEstimativaPlaceholder: "Estimation de valeur (ex : 120)",
    valorNovaEstimativaHint: "⚠ Entre une estimation de la valeur de marché actuelle — les calculs seront moins précis.",
    valorNovaPlaceholder: "Ex : 200",
    valorNovaHint: "Prix d'origine neuf — base pour le tarif location et la vente d'occasion.",
    corLabel: "Couleur principale",
    corPlaceholder: "Bleu marine",
    materialLabel: "Matière",
    materialPlaceholder: "100% soie naturelle",
    condicaoLabel: "État",
    condicaoNovo: "Neuf (avec étiquette)",
    condicaoComoNovo: "Comme neuf (jamais porté)",
    condicaoMuitoBom: "Très bon état",
    condicaoBom: "Bon état",
    condicaoUsado: "Porté",
    descricaoLabel: "Description",
    descricaoPlaceholder: "Raconte l'histoire de cet article — occasion idéale, comment le porter, pourquoi il est spécial...",
    defeitoCard: "État de conservation",
    defeitoLabel: "L'article a un défaut",
    defeitoPerfeito: "L'article est en parfait état.",
    defeitoPlaceholder: "Décris le défaut — ex : légère tache sur la manche, fil lâche sur l'ourlet...",
    higienizacaoCard: "Nettoyage",
    higienizacaoLabel: "Cet article nécessite un nettoyage professionnel",
    higienizacaoSem: "Pas de frais de nettoyage — le nettoyage est géré en interne.",
    higienizacaoCustoLabel: "Coût de nettoyage (€)",
    higienizacaoCustoPlaceholder: "ex : 6.00",
    higienizacaoCustoHint: "Montant facturé à la cliente au checkout. Définis-le selon ton pressing partenaire.",
    tamanhosCard: "Tailles disponibles",
    adicionarTamanho: "+ Taille",
    ocasioesCard: "Occasions",
    estimativaLabel: "Estimation automatique",
    aluguerDia: "Location / jour",
    vendaUsada: "Vente occasion",
    valorMercado: "Valeur marché",
    caucao: "Dépôt",
    erroNome: "Le nom de l'article est obligatoire.",
    erroValorEstimativa: "Entre une estimation de la valeur de marché — même approximative, elle aide à calculer les prix.",
    erroValorOriginal: "Indique la valeur d'origine de l'article neuf — on en a besoin pour calculer les prix. Si tu ne sais pas, clique sur «Je ne connais pas le prix d'origine».",
    erroCategoria: "Sélectionne une catégorie.",
    p3titulo: "Prix et disponibilité",
    p3sub: "Définis comment l'article sera disponible — à louer, à vendre, ou les deux.",
    estimativaNG: "Estimation Nora Grei",
    tierPremium: "✦ Marque premium",
    tierAlta: "Marque haut de gamme",
    tierMassmarket: "Marque standard",
    rotacoesMes: "rotations/mois",
    diasAluguer: "jours/location",
    potencial: "potentiel",
    em12Meses: "en 12 mois",
    usarSugestao: "Utiliser la suggestion",
    ajustarManualmente: "Ou ajuste manuellement ci-dessous",
    idadePecaCard: "Âge de l'article",
    idadeMenos1: "Moins d'1 an",
    idade1a2: "1 à 2 ans",
    idade2a4: "2 à 4 ans",
    idade4mais: "Plus de 4 ans",
    precosCard: "Prix",
    valorNovaObrigLabel: "Valeur article neuf (€) *",
    valorNovaObrigHint: "Obligatoire — c'est la base pour calculer le tarif location, le dépôt et la valeur de revente.",
    aluguerDiaLabel: "Location / jour (€) *",
    aluguerSugestao: "suggéré :",
    clientePoupanca: "La cliente économise",
    vsComprarNova: "% vs acheter neuf",
    vendaUsadaLabel: "Prix de vente occasion (€) *",
    vendaUsadaEstimativa: "Estimation :",
    vendaUsadaComBase: "selon l'état et la marque.",
    vendaUsadaHint: "Prix de vente de l'article en seconde main.",
    linkExternoCard: "Lien pour acheter neuf",
    linkExternoOpcional: "(optionnel)",
    linkExternoLabel: "Lien pour acheter neuf ↗",
    linkExterno15: "15€/mois",
    linkExternoPlaceholder: "https://www.zara.com/produit/...",
    linkExternoHint: "Dirige les clientes vers l'achat neuf sur un autre site. Nora Grei active ce lien après paiement de 15€/mois.",
    erroValorEstimativa2: "Entre une estimation de la valeur de marché pour continuer.",
    erroValorOriginal2: "La valeur de l'article est obligatoire — c'est la base pour calculer la location et le prix d'occasion. Si tu ne sais pas, clique sur «Je ne connais pas le prix d'origine» à l'étape précédente.",
    erroAluguerDia: "Indique le tarif de location par jour.",
    erroPrecoVenda: "Indique le prix de vente.",
    aPublicar: "Publication...",
    publicarPeca: "Publier l'article",
    erroPublicar: "Erreur lors de la publication : ",
    erroPorFavor: "réessaie.",
    p4titulo: "Article publié !",
    p4sub: "Ton article a été ajouté à ton catalogue et sera visible dans ta boutique après validation.",
    verLoja: "Voir ma boutique ↗",
    adicionarOutra: "Ajouter un autre article",
    irParaPerfil: "Aller au profil",
  },
  lt: {
    carregando: "...",
    precisaAuth: "Norėdama paskelbti straipsnį, turi būti prisijungusi.",
    entrar: "Prisijungti",
    perfilErro: "Nepavyko įkelti tavo profilio. Bandyk dar kartą.",
    lojistaNaoPodePublicar: "Ši sritis skirta tik patvirtintoms parduotuvėms. Pateik paraišką savo profilyje.",
    lojistaSuspensa: "Tavo parduotuvės paskyra neaktyvi. Susisiek su Nora Grei, kad ją reaktyvuotum.",
    irPerfil: "Eiti į profilį",
    voltar: "← Grįžti",
    p1titulo: "Pridėti drabužį",
    p1sub: "Pradėk nuo nuotraukų — iki 5 drabužio vaizdų.",
    fotosCard: "Drabužio nuotraukos",
    tocaFotos: "Palieski, kad pridėtum nuotraukas",
    fotosFormatos: "JPG, PNG, WEBP — iki 5 nuotraukų",
    adicionarFoto: "Pridėti",
    tirarFoto: "Nufotografuoti",
    usarCamera: "Fotoaparatas",
    escolherFoto: "Galerija / Failas",
    daBiblioteca: "Nuotraukų biblioteka",
    removerFoto: "Pašalinti",
    aAnalisar: "Analizuojama...",
    fotoRejeitada: "✕ Nuotrauka atmesta",
    fotosSelecionadasSingular: "nuotrauka pasirinkta. Pirmoji bus pagrindinė.",
    fotosSelecionadasPlural: "nuotraukos pasirinktos. Pirmoji bus pagrindinė.",
    erroSemFotos: "Pridėk bent vieną nuotrauką.",
    erroAguardarAnalise: "Palaukite nuotraukų analizės pabaigos.",
    erroFotosRejeitadas: "Prieš tęsiant pašalink atmestas nuotraukas.",
    aAnalisarFotos: "Analizuojamos nuotraukos...",
    continuar: "Tęsti →",
    p2titulo: "Drabužio informacija",
    p2sub: "Informacija apie drabužį — kuo daugiau detalių, tuo geriau klientei.",
    categoriaCard: "Kategorija",
    categoriaLabel: "Kategorija *",
    categoriaPlaceholder: "Pasirinkti kategoriją...",
    grupoVestuario: "Drabužiai",
    grupoAcessorios: "Aksesuarai",
    grupoRelogios: "Laikrodžiai",
    grupoCalcado: "Avalynė",
    calcadoItens: ["Kulniukai","Sandalai","Batai","Sportiniai bateliai","Avalynė"],
    identificacaoCard: "Identifikavimas",
    nomeLabel: "Drabužio pavadinimas *",
    nomePlaceholder: "Pvz.: Vidutinio ilgio suknelė tamsiai mėlyna",
    marcaLabel: "Prekės ženklas / Dizaineris",
    marcaPlaceholder: "Zara, Mango, Gucci...",
    valorNovaBotaoNaoSei: "Nežinau pradinės kainos",
    valorNovaBotaoCancelar: "✕ atšaukti",
    valorNovaLabel: "Naudo drabužio vertė (€)",
    valorNovaObrigatorio: "*",
    valorNovaEstimativaPlaceholder: "Vertės įvertinimas (pvz.: 120)",
    valorNovaEstimativaHint: "⚠ Įvesk dabartinės rinkos vertės įvertinimą — skaičiavimai bus mažiau tikslūs.",
    valorNovaPlaceholder: "Pvz.: 200",
    valorNovaHint: "Pradinė kaina naujam — nuomos ir naudoto pardavimo pagrindas.",
    corLabel: "Pagrindinė spalva",
    corPlaceholder: "Tamsiai mėlyna",
    materialLabel: "Medžiaga",
    materialPlaceholder: "100% natūralus šilkas",
    condicaoLabel: "Būklė",
    condicaoNovo: "Naujas (su etikete)",
    condicaoComoNovo: "Kaip naujas (nenešiotas)",
    condicaoMuitoBom: "Labai gera būklė",
    condicaoBom: "Gera būklė",
    condicaoUsado: "Nešiotas",
    descricaoLabel: "Aprašymas",
    descricaoPlaceholder: "Papasakok šio drabužio istoriją — ideali proga, kaip dėvėti, kodėl jis ypatingas...",
    defeitoCard: "Išsaugojimo būklė",
    defeitoLabel: "Drabužis turi defektą",
    defeitoPerfeito: "Drabužis yra puikios būklės.",
    defeitoPlaceholder: "Aprašyk defektą — pvz.: nedidelė dėmė ant rankovės, laisvas siūlas apačioje...",
    higienizacaoCard: "Valymas",
    higienizacaoLabel: "Šiam drabužiui reikalingas profesionalus valymas",
    higienizacaoSem: "Nėra valymo mokesčio — valymas atliekamas viduje.",
    higienizacaoCustoLabel: "Valymo kaina (€)",
    higienizacaoCustoPlaceholder: "pvz.: 6.00",
    higienizacaoCustoHint: "Suma, skaičiuojama klientei checkout metu. Nustatyk pagal savo partnerio skalavyklą.",
    tamanhosCard: "Prieinami dydžiai",
    adicionarTamanho: "+ Dydis",
    ocasioesCard: "Proga",
    estimativaLabel: "Automatinis įvertinimas",
    aluguerDia: "Nuoma / diena",
    vendaUsada: "Pardavimas naudotas",
    valorMercado: "Rinkos vertė",
    caucao: "Užstatas",
    erroNome: "Drabužio pavadinimas yra privalomas.",
    erroValorEstimativa: "Įvesk rinkos vertės įvertinimą — net apytikslis padės apskaičiuoti kainas.",
    erroValorOriginal: "Nurodyk pradinę naujojo drabužio vertę — jos reikia kainoms apskaičiuoti. Jei nežinai, spausk «Nežinau pradinės kainos».",
    erroCategoria: "Pasirink kategoriją.",
    p3titulo: "Kainos ir prieinamumas",
    p3sub: "Nustatyk, kaip bus prieinamas drabužis — nuomai, pardavimui ar abiem.",
    estimativaNG: "Nora Grei įvertinimas",
    tierPremium: "✦ Premium prekės ženklas",
    tierAlta: "Aukštos klasės prekės ženklas",
    tierMassmarket: "Standartinis prekės ženklas",
    rotacoesMes: "rotacijos/mėn.",
    diasAluguer: "dienos/nuoma",
    potencial: "potencialas",
    em12Meses: "per 12 mėn.",
    usarSugestao: "Naudoti pasiūlymą",
    ajustarManualmente: "Arba nustatyk rankiniu būdu žemiau",
    idadePecaCard: "Drabužio amžius",
    idadeMenos1: "Mažiau nei 1 metai",
    idade1a2: "1–2 metai",
    idade2a4: "2–4 metai",
    idade4mais: "Daugiau nei 4 metai",
    precosCard: "Kainos",
    valorNovaObrigLabel: "Naujojo drabužio vertė (€) *",
    valorNovaObrigHint: "Privaloma — tai pagrindas nuomos kainai, užstatui ir naudoto pardavimo vertei apskaičiuoti.",
    aluguerDiaLabel: "Nuoma / diena (€) *",
    aluguerSugestao: "siūloma:",
    clientePoupanca: "Klientė sutaupo",
    vsComprarNova: "% lyginant su nauju",
    vendaUsadaLabel: "Naudoto pardavimo kaina (€) *",
    vendaUsadaEstimativa: "Įvertinimas:",
    vendaUsadaComBase: "pagal būklę ir prekės ženklą.",
    vendaUsadaHint: "Antros rankos drabužio pardavimo kaina.",
    linkExternoCard: "Nuoroda pirkti naują",
    linkExternoOpcional: "(neprivaloma)",
    linkExternoLabel: "Nuoroda pirkti naują ↗",
    linkExterno15: "15€/mėn.",
    linkExternoPlaceholder: "https://www.zara.com/produktas/...",
    linkExternoHint: "Nukreipia klienteles pirkti naują drabužį kitoje svetainėje. Nora Grei aktyvuoja šią nuorodą sumokėjus 15€/mėn.",
    erroValorEstimativa2: "Įvesk rinkos vertės įvertinimą, kad galėtum tęsti.",
    erroValorOriginal2: "Drabužio vertė yra privaloma — tai pagrindas nuomos ir naudoto kainos skaičiavimui. Jei nežinai, spausk «Nežinau pradinės kainos» ankstesniame žingsnyje.",
    erroAluguerDia: "Nurodyk nuomos kainą per dieną.",
    erroPrecoVenda: "Nurodyk pardavimo kainą.",
    aPublicar: "Skelbiama...",
    publicarPeca: "Paskelbti drabužį",
    erroPublicar: "Klaida skelbiant: ",
    erroPorFavor: "bandyk dar kartą.",
    p4titulo: "Drabužis paskelbtas!",
    p4sub: "Tavo drabužis pridėtas į katalogą ir bus matomas parduotuvėje po patvirtinimo.",
    verLoja: "Žiūrėti mano parduotuvę ↗",
    adicionarOutra: "Pridėti kitą drabužį",
    irParaPerfil: "Eiti į profilį",
  },
};

// ── i18n tipos de listagem ───────────────────────────────────────────────────
const TIPOS_I18N = {
  pt: {
    titulo: "Disponível para",
    alugar:  { titulo:"Alugar",          icone:"↻", desc:"Peça fica no teu armário a gerar rendimento recorrente",            detalhe:"Rendimento recorrente",  nota:"A peça volta sempre para ti após cada aluguer. Tu defines o preço por dia e a disponibilidade. Podes pausar ou cancelar a qualquer momento. Ideal para peças de qualidade que usas pouco mas não queres vender." },
    comprar: { titulo:"Vender",          icone:"→", desc:"Venda a preço fixo — novo, usado ou em segunda mão",                detalhe:"Liquidez imediata",      nota:"Define o preço de venda e a peça fica listada até ser vendida. Quando vendida, recebes o valor (menos comissão Nora Grei) e a peça é enviada para a compradora. Podes editar o preço ou retirar a peça a qualquer momento." },
    ambos:   { titulo:"Alugar e Vender", icone:"◈", desc:"Alugas enquanto encontras compradora — duas fontes de receita",    detalhe:"Máxima flexibilidade",   nota:"A peça está disponível para aluguer e para venda em simultâneo. Se for vendida, os alugueres em curso são respeitados até ao fim. Boa opção para quem quer monetizar ao máximo antes de vender definitivamente." },
    social:  { titulo:"Venda Social",    icone:"♡", desc:"A compradora decide o que paga — mínimo 5€",                       detalhe:"Preço livre",            nota:"Ideal para libertar stock de peças que já não usas. A Nora Grei define o mínimo em 5€ — a compradora pode pagar mais se quiser. Recebes o valor pago (menos comissão). Ótimo para dar nova vida a peças paradas no armário." },
  },
  fr: {
    titulo: "Disponible pour",
    alugar:  { titulo:"Louer",                 icone:"↻", desc:"La pièce reste dans ton armoire et génère des revenus récurrents",     detalhe:"Revenus récurrents",     nota:"La pièce te revient toujours après chaque location. Tu fixes le prix par jour et la disponibilité. Tu peux mettre en pause ou annuler à tout moment. Idéal pour des pièces de qualité que tu utilises peu mais ne veux pas vendre." },
    comprar: { titulo:"Vendre",                icone:"→", desc:"Vente à prix fixe — occasion ou seconde main",                        detalhe:"Liquidité immédiate",    nota:"Fixe le prix de vente et la pièce reste listée jusqu'à sa vente. Une fois vendue, tu reçois le montant (moins commission Nora Grei) et la pièce est envoyée à l'acheteuse. Tu peux modifier le prix ou retirer la pièce à tout moment." },
    ambos:   { titulo:"Louer et Vendre",       icone:"◈", desc:"Tu loues pendant que tu trouves une acheteuse — deux sources de revenus", detalhe:"Flexibilité maximale",  nota:"La pièce est disponible pour la location et la vente en même temps. Si elle est vendue, les locations en cours sont respectées jusqu'à leur terme. Bonne option pour maximiser les revenus avant de vendre définitivement." },
    social:  { titulo:"Vente Sociale",         icone:"♡", desc:"L'acheteuse décide du prix — minimum 5€",                              detalhe:"Prix libre",             nota:"Idéal pour libérer du stock de pièces que tu n'utilises plus. Nora Grei fixe le minimum à 5€ — l'acheteuse peut payer plus si elle le souhaite. Tu reçois le montant payé (moins commission). Parfait pour donner une nouvelle vie aux pièces dormantes." },
  },
  lt: {
    titulo: "Prieinama",
    alugar:  { titulo:"Nuomoti",              icone:"↻", desc:"Drabužis lieka tavo spintoje ir generuoja pasikartojančias pajamas",   detalhe:"Pasikartojančios pajamos", nota:"Drabužis visada grįžta pas tave po kiekvienos nuomos. Tu nustatai dienos kainą ir prieinamumą. Gali pristabdyti ar atšaukti bet kuriuo metu. Idealiai tinka kokybiškiems drabužiams, kuriuos retai dėvi, bet nenori parduoti." },
    comprar: { titulo:"Parduoti",             icone:"→", desc:"Pardavimas fiksuota kaina — naudotas ar iš antrų rankų",             detalhe:"Greita likvidacija",       nota:"Nustatyk pardavimo kainą ir drabužis bus sąraše tol, kol bus parduotas. Parduodant gausi sumą (minus Nora Grei komisiniai), o drabužis bus išsiųstas pirkėjai. Kainą ar įrašą gali redaguoti bet kuriuo metu." },
    ambos:   { titulo:"Nuomoti ir Parduoti", icone:"◈", desc:"Nuomoji kol randi pirkėją — dvi pajamų šaltiniai",                   detalhe:"Maksimalus lankstumas",    nota:"Drabužis vienu metu prieinamas nuomai ir pardavimui. Jei parduodamas, esamos nuomos gerbiamos iki pabaigos. Geras pasirinkimas tiems, kurie nori maksimaliai užsidirbti prieš galutinai parduodant." },
    social:  { titulo:"Socialinis pardavimas",icone:"♡", desc:"Pirkėja pati nusprendžia kainą — mažiausiai 5€",                    detalhe:"Laisva kaina",             nota:"Idealiai tinka atlaisvinti drabužių atsargą, kurios nebenaudoji. Nora Grei nustato minimumą 5€ — pirkėja gali mokėti daugiau. Gauni sumokėtą sumą (minus komisiniai). Puiku suteikti naują gyvenimą lentynoje dulkėjantiems drabužiams." },
  },
};

const PECA_VAZIA = {
  nome: "", categoria: "", marca: "", cor: "", condicao: "como_novo",
  tipo: "alugar", descricao: "", material: "",
  preco_aluguer_dia: "", preco_venda: "", valor_peca: "",
  tem_defeito: false, descricao_defeito: "",
  higienizacao_ativa: false, higienizacao_valor: "",
  ocasioes: [], tamanhos: [{ tamanho: "M", quantidade: 1 }],
  link_compra_externa: "", idade_peca: "1a2", valor_peca_desconhecido: false,
};

// ── Estimativa de valor de mercado ──────────────────────────────────────────
const MARCAS_PREMIUM = [
  "hermès","hermes","chanel","louis vuitton","lv","gucci","prada","bottega veneta",
  "dior","christian dior","saint laurent","ysl","celine","céline","givenchy",
  "valentino","versace","balenciaga","jacquemus","loewe","loro piana","brunello cucinelli",
  "max mara","tod's","tods","ferragamo","burberry","mulberry","ralph lauren",
];
const MARCAS_ALTA = [
  "zara","mango","&other stories","other stories","cos","arket","massimo dutti",
  "pedro del hierro","escorpion","escorpión","hugo boss","boss","calvin klein","ck",
  "tommy hilfiger","tommy","lacoste","levis","levi's","gant","scotch soda",
  "weekday","monki","stradivarius","bershka","pull&bear","sfera","phase eight",
  "whistles","reiss","allsaints","all saints","ba&sh","bash","sandro","maje","ba&sh",
];

function fatorMarca(marca = "") {
  const m = marca.toLowerCase().trim();
  if (MARCAS_PREMIUM.some(b => m.includes(b))) return { fator: 0.82, tier: "premium" };
  if (MARCAS_ALTA.some(b => m.includes(b))) return { fator: 0.50, tier: "alta" };
  return { fator: 0.32, tier: "massmarket" };
}

const FATOR_ESTADO = { como_novo: 0.92, bom: 0.68, usado: 0.45, com_defeito: 0.25 };
const FATOR_IDADE  = { novo: 1.0, "1a2": 0.85, "2a4": 0.70, "4mais": 0.52 };

const ROTACAO_CAT = {
  Vestidos:   { rot: 1.8, dias: 3.5, fp: 0.10 },
  Fatos:      { rot: 1.5, dias: 4.0, fp: 0.09 },
  Macacões:   { rot: 1.4, dias: 3.5, fp: 0.09 },
  Conjuntos:  { rot: 1.3, dias: 3.5, fp: 0.09 },
  Casacos:    { rot: 1.0, dias: 5.0, fp: 0.07 },
  Saias:      { rot: 1.2, dias: 3.0, fp: 0.08 },
  Calças:     { rot: 1.1, dias: 3.0, fp: 0.07 },
  Blusas:     { rot: 1.1, dias: 3.0, fp: 0.07 },
  Camisas:    { rot: 1.0, dias: 3.0, fp: 0.07 },
  Kaftans:    { rot: 0.9, dias: 5.0, fp: 0.08 },
  Malas:      { rot: 2.0, dias: 4.0, fp: 0.12 },
  Acessórios: { rot: 1.6, dias: 3.0, fp: 0.10 },
  _default:   { rot: 1.2, dias: 3.5, fp: 0.08 },
};

function fatorEstadoIdade(condicao, idade_peca) {
  const fe = FATOR_ESTADO[condicao] ?? 0.68;
  const fi = FATOR_IDADE[idade_peca] ?? 0.85;
  const combinado = fe * fi;
  if (combinado < 0.30) return combinado * 0.85;
  if (combinado > 0.85) return combinado * 1.05;
  return combinado;
}

function calcEstimativa({ valor_peca, marca, condicao, idade_peca, categoria }) {
  const p = parseFloat(valor_peca) || 0;
  if (!p) return null;
  const { fator: fm, tier } = fatorMarca(marca);
  const fei = fatorEstadoIdade(condicao, idade_peca);
  const valorMercado = Math.round(p * fm * fei);
  const cat = ROTACAO_CAT[categoria] ?? ROTACAO_CAT._default;
  const tierBonus = tier === "premium" ? 1.20 : tier === "alta" ? 1.05 : 1.0;
  const precoAluguerDia = Math.max(5, Math.round(valorMercado * cat.fp * tierBonus / 5) * 5);
  const precoVendaUsada = Math.max(5, Math.round(valorMercado * 0.75));
  const caucao = Math.round(valorMercado * 0.30 / 10) * 10;
  const ganho12m = Math.round(precoAluguerDia * cat.dias * cat.rot * 12 * 0.90 * 0.90);
  return { valorMercado, precoAluguerDia, precoVendaUsada, caucao, rotMes: cat.rot.toFixed(1), diasAlug: cat.dias, ganho12m, tier };
}

export default function PublicarPage() {
  const [lang, setLang] = useState("pt");
  const [user, setUser] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passo, setPasso] = useState(1); // 1=fotos, 2=detalhes, 3=preços, 4=sucesso
  const [fotos, setFotos] = useState([]);
  const [peca, setPeca] = useState(PECA_VAZIA);
  const [enviando, setEnviando] = useState(false);
  const [marcaSugestoes, setMarcaSugestoes] = useState([]);
  const [progresso, setProgresso] = useState("");
  const [erro, setErro] = useState("");
  const [pecaCriada, setPecaCriada] = useState(null);
  const inputFotoRef = useRef();
  const inputCameraRef = useRef();

  useEffect(() => {
    try { const l = localStorage.getItem("ng_lang"); if (l) setLang(l); } catch (_) {}
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      setUser(session.user);
      let { data: cli } = await supabase.from("clientes").select("*").eq("id", session.user.id).maybeSingle();
      if (!cli) {
        const { data: cli2 } = await supabase.from("clientes").select("*").eq("user_id", session.user.id).maybeSingle();
        cli = cli2;
      }
      setCliente(cli);
      setLoading(false);
    });
  }, []);

  // Share Target: receber fotos partilhadas de outras apps
  useEffect(() => {
    if (typeof window === "undefined") return;
    const processarFotosPartilhadas = (arquivos) => {
      try {
        const novasFotos = arquivos.map(a => {
          const bytes = atob(a.base64);
          const arr = new Uint8Array(bytes.length);
          for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
          const file = new File([arr], a.name || "foto.jpg", { type: a.type || "image/jpeg" });
          const url = URL.createObjectURL(file);
          return { file, url, valida: null, validando: false, motivo: "" };
        });
        setFotos(novasFotos);
      } catch (e) { /* ignorar */ }
    };
    const onMessage = (e) => {
      if (e.data?.type === "NG_SHARE_FOTOS" && e.data.fotos?.length) {
        processarFotosPartilhadas(e.data.fotos);
      }
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);
    const checkShareCache = async () => {
      try {
        const cache = await caches.open("ng-share-target");
        const resp = await cache.match("/_share_fotos");
        if (resp) {
          const fotos = await resp.json();
          await cache.delete("/_share_fotos");
          if (fotos?.length) processarFotosPartilhadas(fotos);
        }
      } catch (e) { /* ignorar */ }
    };
    checkShareCache();
    return () => navigator.serviceWorker?.removeEventListener("message", onMessage);
  }, []);

  const validarFotoComIA = async (foto, index) => {
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(foto.file);
      });
      const res = await fetch("/api/validar-foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagem: base64, tipo: foto.file.type }),
      });
      const resultado = await res.json();
      setFotos(prev => prev.map((f, i) =>
        i === index
          ? { ...f, validando: false, valida: resultado.valida, motivo: resultado.motivo, categoria_ia: resultado.categoria }
          : f
      ));
      // Preencher cor e material automaticamente se a IA os identificou
      if (resultado.cor) setP("cor", resultado.cor);
      if (resultado.material) setP("material", resultado.material);
    } catch {
      setFotos(prev => prev.map((f, i) =>
        i === index ? { ...f, validando: false, valida: true, motivo: "Validação indisponível" } : f
      ));
    }
  };

  const adicionarFotos = (files) => {
    const arr = Array.from(files).slice(0, 5 - fotos.length);
    setFotos(prev => {
      const base = prev.length;
      const novas = arr.map(f => ({ file: f, url: URL.createObjectURL(f), validando: true, valida: null, motivo: "" }));
      const todas = [...prev, ...novas].slice(0, 5);
      novas.forEach((f, i) => { validarFotoComIA(f, base + i); });
      return todas;
    });
  };

  const removerFoto = (i) => setFotos(prev => prev.filter((_, j) => j !== i));

  // Comprime e redimensiona a foto para max 1200px, WEBP 75% — reduz egress ~80%
  const comprimirFoto = (file) => new Promise((resolve) => {
    const MAX = 1200;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width: w, height: h } = img;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => resolve(blob || file), "image/webp", 0.75);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
  const setP = (k, v) => setPeca(prev => ({ ...prev, [k]: v }));

  const TODAS_MARCAS_PUB = [...new Set([...MARCAS_PREMIUM, ...MARCAS_ALTA])];
  const handleMarcaChange = (val) => {
    setP("marca", val);
    if (val.length < 1) { setMarcaSugestoes([]); return; }
    const q = val.toLowerCase();
    setMarcaSugestoes(TODAS_MARCAS_PUB.filter(m => m.toLowerCase().includes(q)).slice(0, 6));
  };

  // Obter dicionário da língua activa
  const tl = T[lang] || T.pt;
  const tLoc = TIPOS_I18N[lang] || TIPOS_I18N.pt;
  const OCASIOES = lang === "fr" ? OCASIOES_FR : lang === "lt" ? OCASIOES_LT : OCASIOES_PT;

  const validarPasso2 = () => {
    if (!peca.nome.trim()) { setErro(tl.erroNome); return false; }
    if (!peca.valor_peca || parseFloat(peca.valor_peca) <= 0) {
      setErro(peca.valor_peca_desconhecido ? tl.erroValorEstimativa : tl.erroValorOriginal);
      return false;
    }
    if (!peca.categoria) { setErro(tl.erroCategoria); return false; }
    setErro(""); return true;
  };

  const validarPasso3 = () => {
    if (peca.tipo === "social") { setErro(""); return true; }
    const precisaAluguer = peca.tipo === "alugar" || peca.tipo === "ambos";
    const precisaVenda = peca.tipo === "comprar" || peca.tipo === "ambos";
    if (!peca.valor_peca || parseFloat(peca.valor_peca) <= 0) {
      setErro(peca.valor_peca_desconhecido ? tl.erroValorEstimativa2 : tl.erroValorOriginal2);
      return false;
    }
    if (precisaAluguer && !peca.preco_aluguer_dia) { setErro(tl.erroAluguerDia); return false; }
    if (precisaVenda && !peca.preco_venda) { setErro(tl.erroPrecoVenda); return false; }
    setErro(""); return true;
  };

  const publicar = async () => {
    if (!validarPasso3()) return;
    setEnviando(true);
    setProgresso(tl.aPublicar);
    try {
      const pecasExistentes = await supabase.from("pecas_lojista").select("id", { count: "exact" }).eq("cliente_id", user.id);
      const count = pecasExistentes.count || 0;
      const { data: novaPeca, error: pecaErr } = await supabase.from("pecas_lojista").insert({
        cliente_id: user.id,
        nome: peca.nome.trim(),
        descricao: peca.descricao.trim() || null,
        tipo: peca.tipo,
        preco_social_minimo: peca.tipo === "social" ? 5 : null,
        preco_aluguer_dia: peca.preco_aluguer_dia ? parseFloat(peca.preco_aluguer_dia) : null,
        preco_venda: peca.preco_venda ? parseFloat(peca.preco_venda) : null,
        valor_peca: peca.valor_peca ? parseFloat(peca.valor_peca) : null,
        idade_peca: peca.idade_peca || "1a2",
        caucao: (() => { const e = calcEstimativa(peca); return e ? e.caucao : null; })(),
        material: peca.material.trim() || null,
        marca: peca.marca.trim() || null,
        cor: peca.cor.trim() || null,
        categoria: peca.categoria || null,
        condicao: peca.condicao || "como_novo",
        tem_defeito: peca.tem_defeito || false,
        descricao_defeito: peca.tem_defeito ? (peca.descricao_defeito || null) : null,
        higienizacao_ativa: peca.higienizacao_ativa || false,
        higienizacao_valor: peca.higienizacao_ativa ? (parseFloat(peca.higienizacao_valor) || null) : null,
        ocasioes: peca.ocasioes,
        link_compra_externa: peca.link_compra_externa.trim() || null,
        link_externo_ativo: false,
        estado: "pendente",
        codigo_referencia: `${cliente?.codigo_cliente || "NG"}-${String(count + 1).padStart(3, "0")}`,
      }).select().single();

      if (pecaErr) throw pecaErr;

      for (const t of peca.tamanhos) {
        await supabase.from("stock_lojista").insert({
          peca_id: novaPeca.id,
          tamanho: t.tamanho,
          quantidade_total: t.quantidade,
          quantidade_disponivel: t.quantidade,
        });
      }

      if (fotos.length > 0) {
        const urls = [];
        for (const foto of fotos) {
          const ext = foto.file.name.split(".").pop();
          const path = `${novaPeca.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.webp`;
          setProgresso(`${tl.aPublicar} ${foto.file.name}...`);
          const blob = await comprimirFoto(foto.file);
          const { error: upErr } = await supabase.storage
            .from("pecas_lojista")
            .upload(path, blob, { upsert: true, contentType: "image/webp" });
          if (!upErr) {
            const { data } = supabase.storage.from("pecas_lojista").getPublicUrl(path);
            urls.push(data.publicUrl);
          }
        }
        if (urls.length > 0) {
          await supabase.from("pecas_lojista").update({ fotos: urls }).eq("id", novaPeca.id);
        }
      }

      setPecaCriada(novaPeca);
      setPasso(4);
    } catch (e) {
      setErro(tl.erroPublicar + (e.message || tl.erroPorFavor));
    }
    setEnviando(false);
    setProgresso("");
  };

  const reiniciar = () => {
    setFotos([]);
    setPeca(PECA_VAZIA);
    setPasso(1);
    setErro("");
    setPecaCriada(null);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost',sans-serif", fontSize: "0.8rem", letterSpacing: "0.2em", color: "#888" }}>
      {tl.carregando}
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", fontFamily: "'Jost',sans-serif", background: "#f7f5f2" }}>
      <div style={{ fontFamily: "'Cormorant',serif", fontSize: "1.2rem", letterSpacing: "0.2em", color: "#1a1a1a" }}>NORA GREI</div>
      <p style={{ fontSize: "0.82rem", color: "#5a5855" }}>{tl.precisaAuth}</p>
      <a href="/entrar" style={{ background: "#1a1a1a", color: "#fff", padding: "0.75rem 2rem", textDecoration: "none", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Jost',sans-serif" }}>{tl.entrar}</a>
    </div>
  );

  const isModoLojista = cliente?.modo_lojista === true && cliente?.lojista_estado !== "inativo";
  if (!isModoLojista) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", fontFamily: "'Jost',sans-serif", background: "#f7f5f2", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontFamily: "'Cormorant',serif", fontSize: "1.2rem", letterSpacing: "0.2em", color: "#1a1a1a" }}>NORA GREI</div>
      {!cliente ? (
        <p style={{ fontSize: "0.9rem", color: "#5a5855", maxWidth: "360px", lineHeight: 1.6 }}>{tl.perfilErro}</p>
      ) : cliente.lojista_estado === "inativo" ? (
        <p style={{ fontSize: "0.9rem", color: "#5a5855", maxWidth: "360px", lineHeight: 1.6 }}>{tl.lojistaSuspensa}</p>
      ) : (
        <p style={{ fontSize: "0.9rem", color: "#5a5855", maxWidth: "360px", lineHeight: 1.6 }}>{tl.lojistaNaoPodePublicar}</p>
      )}
      <a href="/perfil" style={{ background: "#1a1a1a", color: "#fff", padding: "0.75rem 2rem", textDecoration: "none", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Jost',sans-serif" }}>{tl.irPerfil}</a>
    </div>
  );

  const precisaAluguer = peca.tipo === "alugar" || peca.tipo === "ambos";
  const precisaVenda = peca.tipo === "comprar" || peca.tipo === "ambos";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --black: #080808; --white: #f8f7f5; --g1: #f0eeeb; --g2: #e2dfda; --g3: #c8c4bc; --g4: #7a776f; --rosa: #c4748a; --ouro: #c4a882; --sans: 'Jost', Arial, sans-serif; --serif: 'Cormorant', Georgia, serif; }
        body { background: var(--g1); font-family: var(--sans); -webkit-font-smoothing: antialiased; }

        .pub-nav { background: #fff; border-bottom: 1px solid var(--g2); padding: 0.9rem 1.5rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
        .pub-logo { font-family: var(--serif); font-size: 1.1rem; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none; color: var(--black); }
        .pub-voltar { font-size: 0.78rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--g4); text-decoration: none; }
        .pub-steps { display: flex; align-items: center; gap: 0.3rem; }
        .pub-step { width: 28px; height: 3px; border-radius: 2px; background: var(--g2); transition: background 0.3s; }
        .pub-step.done { background: var(--black); }
        .pub-step.active { background: var(--rosa); }

        .pub-body { max-width: 680px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
        .pub-titulo { font-family: var(--sans); font-size: 1.5rem; font-weight: 600; color: var(--black); margin-bottom: 0.3rem; }
        .pub-subtitulo { font-size: 0.8rem; color: var(--g4); margin-bottom: 2rem; }

        .pub-card { background: #fff; padding: 1.5rem; margin-bottom: 1rem; }
        .pub-card-t { font-size: 0.72rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--g4); font-weight: 600; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--g1); }

        .pub-label { display: block; font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase; color: #3a3936; font-weight: 600; margin-bottom: 0.4rem; }
        .pub-input { width: 100%; padding: 0.8rem 1rem; border: 1.5px solid var(--g2); background: #fff; font-size: 0.92rem; font-family: var(--sans); color: var(--black); outline: none; transition: border-color 0.2s; }
        .pub-input:focus { border-color: var(--black); }
        .pub-select { width: 100%; padding: 0.8rem 1rem; border: 1.5px solid var(--g2); background: #fff; font-size: 0.92rem; font-family: var(--sans); color: var(--black); outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%237a776f' d='M6 8L0 0h12z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; }
        .pub-textarea { width: 100%; padding: 0.8rem 1rem; border: 1.5px solid var(--g2); background: #fff; font-size: 0.92rem; font-family: var(--sans); color: var(--black); outline: none; resize: vertical; min-height: 80px; }
        .pub-textarea:focus { border-color: var(--black); }
        .pub-fg { display: flex; flex-direction: column; gap: 0.4rem; }
        .pub-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .pub-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
        .pub-full { grid-column: 1 / -1; }

        .fotos-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; margin-bottom: 0.75rem; }
        .foto-thumb { aspect-ratio: 3/4; border-radius: 4px; overflow: hidden; position: relative; background: var(--g1); }
        .foto-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .foto-remove { position: absolute; top: 4px; right: 4px; background: rgba(8,8,8,0.7); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 0.72rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .foto-add { aspect-ratio: 3/4; border-radius: 4px; border: 2px dashed var(--g3); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; gap: 0.4rem; color: var(--g4); font-size: 0.75rem; text-align: center; padding: 0.5rem; transition: border-color 0.15s; }
        .foto-add:hover { border-color: var(--black); color: var(--black); }
        .foto-add svg { opacity: 0.5; }

        .tipo-btn { padding: 0.6rem; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; font-family: var(--sans); border: 1.5px solid var(--g2); background: #fff; color: var(--g4); cursor: pointer; transition: all 0.15s; text-align: center; }
        .tipo-btn.active { background: #c4748a; color: #fff; border-color: #c4748a; }

        .tamanho-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
        .tamanho-sel { flex: 1; padding: 0.6rem 0.75rem; border: 1.5px solid var(--g2); font-family: var(--sans); font-size: 0.88rem; background: #fff; outline: none; }
        .tamanho-qty { width: 70px; padding: 0.6rem 0.75rem; border: 1.5px solid var(--g2); font-family: var(--sans); font-size: 0.88rem; text-align: center; }
        .tamanho-rm { background: none; border: none; color: var(--rosa); cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 0.2rem; }

        .ocasiao-btn { padding: 0.35rem 0.6rem; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; font-family: var(--sans); border: 1.5px solid var(--g2); background: #fff; color: var(--g4); cursor: pointer; transition: all 0.15s; }
        .ocasiao-btn.active { background: #c4748a; color: #fff; border-color: #c4748a; }

        .upload-area { border: 2px dashed var(--g2); padding: 2rem; text-align: center; cursor: pointer; transition: border-color 0.2s; background: var(--g1); }
        .upload-area:hover { border-color: var(--rosa); }

        .pub-btn { width: 100%; padding: 0.9rem; border: none; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; font-family: var(--sans); font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .pub-btn-black { background: #c4748a; color: #fff; }
        .pub-btn-black:hover { background: #b5637a; }
        .pub-btn-black:disabled { opacity: 0.5; cursor: not-allowed; }
        .pub-btn-outline { background: #fff; color: var(--black); border: 1.5px solid var(--g2); }
        .pub-btn-outline:hover { border-color: var(--black); }
        .pub-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
        .pub-actions .pub-btn { flex: 1; }
        .pub-actions .pub-btn-outline { flex: 0 0 auto; padding: 0.9rem 1.25rem; width: auto; }

        .pub-erro { background: #fff5f5; border-left: 3px solid #e74c3c; padding: 0.75rem 1rem; font-size: 0.8rem; color: #c0392b; margin-top: 0.5rem; }
        .pub-sugestao { font-size: 0.75rem; color: #27ae60; margin-top: 0.25rem; }
        .pub-hint { font-size: 0.75rem; color: var(--g4); margin-top: 0.25rem; }

        .defeito-box { padding: 0.85rem 1rem; border: 1.5px solid var(--g2); background: #fafafa; margin-bottom: 1rem; }
        .defeito-box.ativo { border-color: #e74c3c; background: #fff5f5; }
        .defeito-label { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; color: var(--g4); }
        .defeito-box.ativo .defeito-label { color: #c0392b; }

        .link-externo-box { padding: 1rem; background: #faf8f5; border: 1.5px solid #e8d5a3; margin-bottom: 1rem; }
        .link-externo-badge { font-size: 0.72rem; background: var(--ouro); color: #fff; padding: 0.1rem 0.4rem; font-weight: 600; letter-spacing: 0.08em; margin-left: 0.4rem; }

        .sucesso-wrap { text-align: center; padding: 3rem 2rem; }
        .sucesso-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .sucesso-titulo { font-family: var(--sans); font-size: 1.5rem; font-weight: 600; color: var(--black); margin-bottom: 0.5rem; }
        .sucesso-sub { font-size: 0.85rem; color: var(--g4); line-height: 1.6; margin-bottom: 1.5rem; }
        .sucesso-acoes { display: flex; flex-direction: column; gap: 0.75rem; }
        .sucesso-btn { padding: 0.9rem; text-align: center; font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; font-family: var(--sans); font-weight: 600; text-decoration: none; border: none; cursor: pointer; }

        @media (max-width: 600px) {
          .pub-body { padding: 1.25rem 1rem 6rem; }
          .pub-grid2 { grid-template-columns: 1fr; }
          .pub-grid3 { grid-template-columns: 1fr 1fr; }
          .fotos-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* NAV */}
      <nav className="pub-nav">
        <a href="/perfil" className="pub-logo">Nora Grei</a>
        <div className="pub-steps">
          {[1,2,3].map(s => (
            <div key={s} className={`pub-step${passo > s ? " done" : passo === s ? " active" : ""}`} />
          ))}
        </div>
        <a href="/perfil" className="pub-voltar">{tl.voltar}</a>
      </nav>

      <div className="pub-body">

        {/* ── PASSO 1 — FOTOS ── */}
        {passo === 1 && (
          <>
            <h1 className="pub-titulo">{tl.p1titulo}</h1>
            <p className="pub-subtitulo">{tl.p1sub}</p>

            <div className="pub-card">
              <p className="pub-card-t">{tl.fotosCard}</p>

              {fotos.length === 0 && (
                <div style={{display:"flex",gap:"0.75rem"}}>
                  <div className="upload-area" style={{flex:1}} onClick={() => inputCameraRef.current?.click()}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="1.2" style={{marginBottom:"0.5rem"}}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <p style={{fontSize:"0.82rem",color:"#5a5855",fontWeight:500,marginBottom:"0.1rem"}}>{tl.tirarFoto}</p>
                    <p style={{fontSize:"0.68rem",color:"#9c9894"}}>{tl.usarCamera}</p>
                  </div>
                  <div className="upload-area" style={{flex:1}} onClick={() => inputFotoRef.current?.click()}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8c4bc" strokeWidth="1.2" style={{marginBottom:"0.5rem"}}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <p style={{fontSize:"0.82rem",color:"#5a5855",fontWeight:500,marginBottom:"0.1rem"}}>{tl.escolherFoto}</p>
                    <p style={{fontSize:"0.68rem",color:"#9c9894"}}>{tl.daBiblioteca}</p>
                  </div>
                </div>
              )}

              {fotos.length > 0 && (
                <div className="fotos-grid">
                  {fotos.map((f, i) => (
                    <div key={i} className="foto-thumb">
                      <img src={f.url} alt="" />
                      <button className="foto-remove" onClick={() => removerFoto(i)} title={tl.removerFoto}>✕</button>
                      {f.validando && (
                        <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(8,8,8,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:"0.3rem",gap:"0.3rem"}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:"#f39c12",animation:"pcpulse 1s infinite"}}/>
                          <span style={{fontSize:"0.68rem",color:"#fff",fontFamily:"'Jost',sans-serif",letterSpacing:"0.08em"}}>{tl.aAnalisar}</span>
                        </div>
                      )}
                      {!f.validando && f.valida === true && (
                        <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(39,174,96,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:"0.3rem",gap:"0.25rem"}}>
                          <span style={{fontSize:"0.68rem",color:"#fff",fontFamily:"'Jost',sans-serif",letterSpacing:"0.06em"}}>✓ {f.motivo}</span>
                        </div>
                      )}
                      {!f.validando && f.valida === false && (
                        <div style={{position:"absolute",inset:0,background:"rgba(200,50,50,0.82)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0.4rem",gap:"0.3rem"}}>
                          <span style={{fontSize:"0.72rem",color:"#fff",fontFamily:"'Jost',sans-serif",fontWeight:600,letterSpacing:"0.06em",textAlign:"center"}}>{tl.fotoRejeitada}</span>
                          <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.85)",fontFamily:"'Jost',sans-serif",textAlign:"center",lineHeight:1.3}}>{f.motivo}</span>
                          <button onClick={() => removerFoto(i)} style={{marginTop:"0.25rem",fontSize:"0.68rem",background:"rgba(255,255,255,0.2)",color:"#fff",border:"1px solid rgba(255,255,255,0.4)",padding:"0.2rem 0.5rem",cursor:"pointer",fontFamily:"'Jost',sans-serif",letterSpacing:"0.06em"}}>{tl.removerFoto}</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {fotos.length < 5 && (
                    <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                      <div className="foto-add" onClick={() => inputCameraRef.current?.click()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        <span style={{fontSize:"0.72rem"}}>{tl.tirarFoto}</span>
                      </div>
                      <div className="foto-add" onClick={() => inputFotoRef.current?.click()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span style={{fontSize:"0.72rem"}}>{tl.escolherFoto}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Galeria / ficheiros */}
              <input
                ref={inputFotoRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
                multiple
                style={{ display: "none" }}
                onChange={e => adicionarFotos(e.target.files)}
              />
              {/* Câmara directa */}
              <input
                ref={inputCameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={e => adicionarFotos(e.target.files)}
              />

              {fotos.length > 0 && (
                <p style={{fontSize:"0.72rem",color:"#9c9894",marginTop:"0.5rem"}}>
                  {fotos.length} {fotos.length > 1 ? tl.fotosSelecionadasPlural : tl.fotosSelecionadasSingular}
                </p>
              )}
            </div>

            {erro && <div className="pub-erro">{erro}</div>}

            <div className="pub-actions">
              <button
                className="pub-btn pub-btn-black"
                onClick={() => {
                  if (!fotos.length) { setErro(tl.erroSemFotos); return; }
                  if (fotos.some(f => f.validando)) { setErro(tl.erroAguardarAnalise); return; }
                  const invalidas = fotos.filter(f => f.valida === false);
                  if (invalidas.length > 0) { setErro(tl.erroFotosRejeitadas); return; }
                  setErro(""); setPasso(2);
                }}
                disabled={fotos.length === 0 || fotos.some(f => f.validando)}
              >
                {fotos.some(f => f.validando) ? tl.aAnalisarFotos : tl.continuar}
              </button>
            </div>
          </>
        )}

        {/* ── PASSO 2 — DETALHES ── */}
        {passo === 2 && (
          <>
            <h1 className="pub-titulo">{tl.p2titulo}</h1>
            <p className="pub-subtitulo">{tl.p2sub}</p>

            {/* Categoria */}
            <div className="pub-card">
              <p className="pub-card-t">{tl.categoriaCard}</p>
              <div className="pub-fg">
                <label className="pub-label">{tl.categoriaLabel}</label>
                <select
                  className="pub-select"
                  value={peca.categoria}
                  onChange={e => {
                    const cat = e.target.value;
                    const semTam = CATEGORIAS_SEM_TAMANHO.includes(cat);
                    setPeca(prev => ({ ...prev, categoria: cat, tamanhos: semTam ? [{ tamanho: "Único", quantidade: 1 }] : prev.tamanhos }));
                  }}
                >
                  <option value="">{tl.categoriaPlaceholder}</option>
                  <optgroup label={tl.grupoVestuario}>
                    {CATEGORIAS_VESTUARIO.map(c => <option key={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label={tl.grupoAcessorios}>
                    {CATEGORIAS_ACESSORIOS.map(c => <option key={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label={tl.grupoRelogios}>
                    <option>Relógios</option>
                  </optgroup>
                  <optgroup label={tl.grupoCalcado}>
                    {tl.calcadoItens.map(c => <option key={c}>{c}</option>)}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Nome + Marca */}
            <div className="pub-card">
              <p className="pub-card-t">{tl.identificacaoCard}</p>
              <div className="pub-grid2">
                <div className="pub-fg">
                  <label className="pub-label">{tl.nomeLabel}</label>
                  <input className="pub-input" value={peca.nome} onChange={e => setP("nome", e.target.value)} placeholder={tl.nomePlaceholder} />
                </div>
                <div className="pub-fg" style={{position:"relative"}}>
                  <label className="pub-label">{tl.marcaLabel}</label>
                  <input
                    className="pub-input"
                    value={peca.marca}
                    onChange={e => handleMarcaChange(e.target.value)}
                    onBlur={() => setTimeout(() => setMarcaSugestoes([]), 150)}
                    placeholder={tl.marcaPlaceholder}
                    autoComplete="off"
                  />
                  {marcaSugestoes.length > 0 && (
                    <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #e2dfda",zIndex:50,boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
                      {marcaSugestoes.map(m => (
                        <div
                          key={m}
                          onMouseDown={() => { setP("marca", m); setMarcaSugestoes([]); }}
                          style={{padding:"0.65rem 1rem",fontSize:"0.88rem",cursor:"pointer",fontFamily:"'Jost',sans-serif",borderBottom:"1px solid #f0eeeb",textTransform:"capitalize"}}
                          onMouseEnter={e => e.currentTarget.style.background="#f8f7f5"}
                          onMouseLeave={e => e.currentTarget.style.background="#fff"}
                        >{m}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="pub-fg">
                  <label className="pub-label" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span>{tl.valorNovaLabel} {!peca.valor_peca_desconhecido && <span style={{color:"#c4748a"}}>{tl.valorNovaObrigatorio}</span>}</span>
                    <button type="button"
                      onClick={()=>setP("valor_peca_desconhecido", !peca.valor_peca_desconhecido)}
                      style={{fontSize:"0.6rem",color:peca.valor_peca_desconhecido?"#c4748a":"#888580",background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:"inherit",padding:0}}>
                      {peca.valor_peca_desconhecido ? tl.valorNovaBotaoCancelar : tl.valorNovaBotaoNaoSei}
                    </button>
                  </label>
                  {peca.valor_peca_desconhecido ? (
                    <>
                      <input
                        className="pub-input"
                        type="number" min="0"
                        value={peca.valor_peca}
                        onChange={e => setP("valor_peca", e.target.value)}
                        placeholder={tl.valorNovaEstimativaPlaceholder}
                      />
                      <span className="pub-hint" style={{color:"#b35900"}}>{tl.valorNovaEstimativaHint}</span>
                    </>
                  ) : (
                    <>
                      <input
                        className="pub-input"
                        type="number" min="0"
                        value={peca.valor_peca}
                        onChange={e => setP("valor_peca", e.target.value)}
                        placeholder={tl.valorNovaPlaceholder}
                        style={!peca.valor_peca ? { borderColor: "rgba(196,116,138,0.4)" } : {}}
                      />
                      <span className="pub-hint">{tl.valorNovaHint}</span>
                    </>
                  )}
                </div>
                <div className="pub-fg">
                  <label className="pub-label">{tl.corLabel}</label>
                  <input className="pub-input" value={peca.cor} onChange={e => setP("cor", e.target.value)} placeholder={tl.corPlaceholder} list="cores-lista" />
                  <datalist id="cores-lista">
                    {CORES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="pub-fg">
                  <label className="pub-label">{tl.materialLabel}</label>
                  <input className="pub-input" value={peca.material} onChange={e => setP("material", e.target.value)} placeholder={tl.materialPlaceholder} />
                </div>
                <div className="pub-fg pub-full">
                  <label className="pub-label">{tl.condicaoLabel}</label>
                  <select className="pub-select" value={peca.condicao} onChange={e => setP("condicao", e.target.value)}>
                    <option value="novo">{tl.condicaoNovo}</option>
                    <option value="como_novo">{tl.condicaoComoNovo}</option>
                    <option value="muito_bom">{tl.condicaoMuitoBom}</option>
                    <option value="bom">{tl.condicaoBom}</option>
                    <option value="usado">{tl.condicaoUsado}</option>
                  </select>
                </div>
                <div className="pub-fg pub-full">
                  <label className="pub-label">{tl.descricaoLabel}</label>
                  <textarea className="pub-textarea" value={peca.descricao} onChange={e => setP("descricao", e.target.value)} placeholder={tl.descricaoPlaceholder} />
                </div>
              </div>
            </div>

            {/* Defeito */}
            <div className="pub-card">
              <p className="pub-card-t">{tl.defeitoCard}</p>
              <div className={`defeito-box${peca.tem_defeito ? " ativo" : ""}`}>
                <label className="defeito-label">
                  <input
                    type="checkbox"
                    checked={peca.tem_defeito}
                    onChange={e => setP("tem_defeito", e.target.checked)}
                    style={{ width: "1rem", height: "1rem", cursor: "pointer", accentColor: "#e74c3c" }}
                  />
                  {tl.defeitoLabel}
                </label>
                {peca.tem_defeito ? (
                  <textarea
                    className="pub-textarea"
                    value={peca.descricao_defeito}
                    onChange={e => setP("descricao_defeito", e.target.value)}
                    style={{ marginTop: "0.75rem", border: "1.5px solid #e74c3c" }}
                    placeholder={tl.defeitoPlaceholder}
                  />
                ) : (
                  <p style={{ fontSize: "0.68rem", color: "#9c9894", marginTop: "0.5rem" }}>
                    {tl.defeitoPerfeito}
                  </p>
                )}
              </div>
            </div>

            {/* Higienização */}
            <div className="pub-card">
              <p className="pub-card-t">{tl.higienizacaoCard}</p>
              <div className={`defeito-box${peca.higienizacao_ativa ? " ativo" : ""}`}>
                <label className="defeito-label">
                  <input
                    type="checkbox"
                    checked={peca.higienizacao_ativa}
                    onChange={e => setP("higienizacao_ativa", e.target.checked)}
                    style={{ width: "1rem", height: "1rem", cursor: "pointer", accentColor: "#c4748a" }}
                  />
                  {tl.higienizacaoLabel}
                </label>
                {peca.higienizacao_ativa ? (
                  <div style={{ marginTop: "0.75rem" }}>
                    <label className="pub-label" style={{ fontSize: "0.72rem" }}>{tl.higienizacaoCustoLabel}</label>
                    <input
                      className="pub-input"
                      type="number" min="0" step="0.5"
                      value={peca.higienizacao_valor}
                      onChange={e => setP("higienizacao_valor", e.target.value)}
                      placeholder={tl.higienizacaoCustoPlaceholder}
                      style={{ marginTop: "0.4rem", maxWidth: 140 }}
                    />
                    <p style={{ fontSize: "0.65rem", color: "#9c9894", marginTop: "0.4rem", lineHeight: 1.5 }}>
                      {tl.higienizacaoCustoHint}
                    </p>
                  </div>
                ) : (
                  <p style={{ fontSize: "0.68rem", color: "#9c9894", marginTop: "0.5rem" }}>
                    {tl.higienizacaoSem}
                  </p>
                )}
              </div>
            </div>

            {/* Tamanhos */}
            <div className="pub-card">
              <p className="pub-card-t">{tl.tamanhosCard}</p>
              {peca.tamanhos.map((t, idx) => (
                <div key={idx} className="tamanho-row">
                  <select
                    className="tamanho-sel"
                    value={t.tamanho}
                    onChange={e => setPeca(prev => ({ ...prev, tamanhos: prev.tamanhos.map((x, i) => i === idx ? { ...x, tamanho: e.target.value } : x) }))}
                  >
                    {TAMANHOS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <input
                    type="number"
                    className="tamanho-qty"
                    value={t.quantidade}
                    min={1}
                    onChange={e => setPeca(prev => ({ ...prev, tamanhos: prev.tamanhos.map((x, i) => i === idx ? { ...x, quantidade: parseInt(e.target.value) || 1 } : x) }))}
                  />
                  {peca.tamanhos.length > 1 && (
                    <button
                      className="tamanho-rm"
                      onClick={() => setPeca(prev => ({ ...prev, tamanhos: prev.tamanhos.filter((_, i) => i !== idx) }))}
                    >✕</button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setPeca(prev => ({ ...prev, tamanhos: [...prev.tamanhos, { tamanho: "M", quantidade: 1 }] }))}
                style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", background: "none", border: "1.5px solid var(--g2)", padding: "0.4rem 0.75rem", cursor: "pointer", fontFamily: "var(--sans)", color: "var(--g4)" }}
              >
                {tl.adicionarTamanho}
              </button>
            </div>

            {/* Ocasiões */}
            <div className="pub-card">
              <p className="pub-card-t">{tl.ocasioesCard}</p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {OCASIOES.map(oc => (
                  <button
                    key={oc}
                    type="button"
                    className={`ocasiao-btn${peca.ocasioes.includes(oc) ? " active" : ""}`}
                    onClick={() => {
                      const next = peca.ocasioes.includes(oc)
                        ? peca.ocasioes.filter(o => o !== oc)
                        : [...peca.ocasioes, oc];
                      setP("ocasioes", next);
                    }}
                  >
                    {oc}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview de preços */}
            {(() => {
              const est = calcEstimativa(peca);
              if (!est) return null;
              return (
                <div style={{
                  background: "#f0eeeb", border: "1px solid #e2dfda",
                  borderRadius: 12, padding: "0.9rem 1rem",
                  marginBottom: "0.75rem",
                }}>
                  <div style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#888580", marginBottom: "0.6rem" }}>
                    {tl.estimativaLabel}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.5rem" }}>
                    {[
                      [tl.aluguerDia, `€${est.precoAluguerDia}`, "#c4748a"],
                      [tl.vendaUsada, `€${est.precoVendaUsada}`, "#1a1816"],
                      [tl.valorMercado, `€${est.valorMercado}`, "#1a1816"],
                      [tl.caucao, `€${est.caucao}`, "#27ae60"],
                    ].map(([l, v, cor]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1rem", fontFamily: "serif", fontWeight: 400, color: cor }}>{v}</div>
                        <div style={{ fontSize: "0.6rem", color: "#888580", marginTop: "0.15rem" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#888580", marginTop: "0.6rem", borderTop: "1px solid #e2dfda", paddingTop: "0.5rem" }}>
                    ~{est.rotMes}× {tl.rotacoesMes} · ~{est.diasAlug} {tl.diasAluguer} · {tl.potencial} €{est.ganho12m} {tl.em12Meses}
                  </div>
                </div>
              );
            })()}

            {erro && <div className="pub-erro">{erro}</div>}

            <div className="pub-actions">
              <button className="pub-btn pub-btn-outline" onClick={() => { setErro(""); setPasso(1); }}>←</button>
              <button
                className="pub-btn pub-btn-black"
                onClick={() => { if (validarPasso2()) setPasso(3); }}
              >
                {tl.continuar}
              </button>
            </div>
          </>
        )}

        {/* ── PASSO 3 — PREÇOS ── */}
        {passo === 3 && (
          <>
            <h1 className="pub-titulo">{tl.p3titulo}</h1>
            <p className="pub-subtitulo">{tl.p3sub}</p>

            {/* Estimativa inteligente */}
            {(() => {
              const est = calcEstimativa(peca);
              if (!est) return null;
              const tierLabel = { premium: tl.tierPremium, alta: tl.tierAlta, massmarket: tl.tierMassmarket }[est.tier];
              return (
                <div style={{
                  background: "linear-gradient(135deg,#1a1816 0%,#2d2926 100%)",
                  borderRadius: 14, padding: "1.1rem 1.25rem",
                  marginBottom: "0.75rem", color: "#fff",
                }}>
                  <div style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.6rem" }}>
                    {tl.estimativaNG} · {tierLabel}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.6rem", marginBottom: "0.85rem" }}>
                    <div>
                      <div style={{ fontSize: "1.25rem", fontFamily: "serif", fontWeight: 400, lineHeight: 1 }}>€{est.valorMercado}</div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.45)", marginTop: "0.2rem" }}>{tl.valorMercado}</div>
                    </div>
                    <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "0.5rem" }}>
                      <div style={{ fontSize: "1.25rem", fontFamily: "serif", fontWeight: 400, lineHeight: 1, color: "#e8a0b0" }}>€{est.precoAluguerDia}</div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.45)", marginTop: "0.2rem" }}>{tl.aluguerDia}</div>
                    </div>
                    <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "0.5rem" }}>
                      <div style={{ fontSize: "1.25rem", fontFamily: "serif", fontWeight: 400, lineHeight: 1 }}>€{est.precoVendaUsada}</div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.45)", marginTop: "0.2rem" }}>{tl.vendaUsada}</div>
                    </div>
                    <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "0.5rem" }}>
                      <div style={{ fontSize: "1.25rem", fontFamily: "serif", fontWeight: 400, lineHeight: 1, color: "#a8d8a8" }}>€{est.caucao}</div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.45)", marginTop: "0.2rem" }}>{tl.caucao}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                    ~{est.rotMes}× {tl.rotacoesMes} · ~{est.diasAlug} {tl.diasAluguer} · {tl.potencial} <strong style={{ color: "#fff" }}>€{est.ganho12m}</strong> {tl.em12Meses}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      style={{ flex: 1, padding: "0.55rem", background: "#c4748a", border: "none", borderRadius: 8, color: "#fff", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}
                      onClick={() => setPeca(prev => ({
                        ...prev,
                        preco_aluguer_dia: est.precoAluguerDia.toString(),
                        preco_venda: est.precoVendaUsada.toString(),
                      }))}
                    >
                      {tl.usarSugestao}
                    </button>
                    <div style={{ flex: 1, padding: "0.55rem", background: "rgba(255,255,255,0.07)", borderRadius: 8, fontSize: "0.64rem", color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", lineHeight: 1.3 }}>
                      {tl.ajustarManualmente}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Idade da peça */}
            <div className="pub-card" style={{ marginBottom: "0.75rem" }}>
              <p className="pub-card-t">{tl.idadePecaCard}</p>
              <div className="pub-grid2">
                {[["novo", tl.idadeMenos1],["1a2", tl.idade1a2],["2a4", tl.idade2a4],["4mais", tl.idade4mais]].map(([v, l]) => (
                  <button
                    key={v}
                    className={`tipo-btn${peca.idade_peca === v ? " active" : ""}`}
                    onClick={() => setP("idade_peca", v)}
                    style={{ fontSize: "0.72rem" }}
                  >{l}</button>
                ))}
              </div>
            </div>

            {/* Tipo — cards com contexto financeiro */}
            {(() => {
              const est = calcEstimativa(peca);
              const ganhoAluguer = est ? `€${est.ganho12m}/${lang === "fr" ? "an" : lang === "lt" ? "metus" : "ano"}` : null;
              const ganhoVenda = est ? `€${est.precoVendaUsada} ${lang === "fr" ? "immédiat" : lang === "lt" ? "iš karto" : "imediato"}` : null;
              const ganhoAmbos = est ? `€${est.precoVendaUsada} + ${lang === "fr" ? "rentes" : lang === "lt" ? "nuoma" : "rendas"}` : null;
              const CORES_TIPO = { alugar:"#c4748a", comprar:"#5b8a6b", ambos:"#7a6a9e", social:"#c4a882" };
              const DETALHES_CALC = {
                alugar:  ganhoAluguer ? `${lang === "fr" ? "Potentiel" : lang === "lt" ? "Potencialas" : "Potencial"} ${ganhoAluguer}` : tLoc.alugar.detalhe,
                comprar: ganhoVenda   ? `${lang === "fr" ? "Recevoir" : lang === "lt" ? "Gauti" : "Receber"} ${ganhoVenda}` : tLoc.comprar.detalhe,
                ambos:   ganhoAmbos   ? ganhoAmbos                  : tLoc.ambos.detalhe,
                social:  tLoc.social.detalhe,
              };
              const opcoes = ["alugar","comprar","ambos","social"].map(val => ({
                val,
                ...tLoc[val],
                detalhe: DETALHES_CALC[val],
                cor: CORES_TIPO[val],
              }));
              return (
                <div className="pub-card">
                  <p className="pub-card-t">{tLoc.titulo}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {opcoes.map(({ val, titulo, icone, desc, detalhe, cor, nota }) => {
                      const ativo = peca.tipo === val;
                      return (
                        <div key={val} style={{ display: "flex", flexDirection: "column" }}>
                          <button
                            onClick={() => setP("tipo", val)}
                            style={{
                              display: "flex", alignItems: "center", gap: "0.85rem",
                              padding: "0.75rem 1rem",
                              border: ativo ? `2px solid ${cor}` : "1.5px solid #e2dfda",
                              borderRadius: ativo ? "10px 10px 0 0" : 10,
                              background: ativo ? `${cor}12` : "#fff",
                              cursor: "pointer", textAlign: "left",
                              transition: "all 0.15s", fontFamily: "inherit",
                              width: "100%",
                            }}
                          >
                            <span style={{ fontSize: "1.3rem", lineHeight: 1, color: ativo ? cor : "#aaa", minWidth: 28, textAlign: "center" }}>{icone}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: ativo ? cor : "#1a1816", marginBottom: "0.2rem", fontFamily: "inherit" }}>{titulo}</div>
                              <div style={{ fontSize: "0.7rem", color: "#888", lineHeight: 1.4 }}>{desc}</div>
                            </div>
                            <div style={{ fontSize: "0.68rem", fontWeight: 600, color: ativo ? cor : "#bbb", textAlign: "right", whiteSpace: "nowrap", lineHeight: 1.3 }}>{detalhe}</div>
                          </button>
                          {ativo && (
                            <div style={{
                              padding: "0.65rem 1rem 0.75rem",
                              background: `${cor}0a`,
                              border: `2px solid ${cor}`,
                              borderTop: "none",
                              borderRadius: "0 0 10px 10px",
                              fontSize: "0.72rem",
                              color: "#5a5855",
                              lineHeight: 1.55,
                              fontFamily: "inherit",
                            }}>
                              ℹ️ {nota}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Preços */}
            <div className="pub-card">
              <p className="pub-card-t">{tl.precosCard}</p>
              <div className="pub-grid2">

                <div className="pub-fg">
                  <label className="pub-label">{tl.valorNovaObrigLabel}</label>
                  <input
                    className="pub-input"
                    type="number" min="0"
                    value={peca.valor_peca}
                    onChange={e => setP("valor_peca", e.target.value)}
                    placeholder="200"
                    style={!peca.valor_peca ? { borderColor: "rgba(196,116,138,0.4)" } : {}}
                  />
                  <span className="pub-hint">{tl.valorNovaObrigHint}</span>
                </div>

                {precisaAluguer && (
                  <div className="pub-fg">
                    <label className="pub-label" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      {tl.aluguerDiaLabel}
                      {(() => { const est = calcEstimativa(peca); return est ? (
                        <span style={{ fontSize: "0.55rem", background: "#e8f5e9", color: "#27ae60", padding: "0.1rem 0.35rem", fontWeight: 600 }}>
                          {tl.aluguerSugestao} €{est.precoAluguerDia}
                        </span>
                      ) : null; })()}
                    </label>
                    <input
                      className="pub-input"
                      type="number" min="0"
                      value={peca.preco_aluguer_dia}
                      onChange={e => setP("preco_aluguer_dia", e.target.value)}
                      placeholder="16"
                    />
                    {peca.valor_peca && peca.preco_aluguer_dia && parseFloat(peca.valor_peca) > 0 && parseFloat(peca.preco_aluguer_dia) > 0 && (
                      <span className="pub-sugestao">
                        {tl.clientePoupanca} {Math.round((1 - parseFloat(peca.preco_aluguer_dia) / parseFloat(peca.valor_peca)) * 100)}{tl.vsComprarNova}
                      </span>
                    )}
                  </div>
                )}

                {precisaVenda && (
                  <div className="pub-fg">
                    <label className="pub-label">{tl.vendaUsadaLabel}</label>
                    <input
                      className="pub-input"
                      type="number" min="0"
                      value={peca.preco_venda}
                      onChange={e => setP("preco_venda", e.target.value)}
                      placeholder="150"
                    />
                    {(() => { const est = calcEstimativa(peca); return est ? (
                      <span className="pub-hint">{tl.vendaUsadaEstimativa} €{est.precoVendaUsada} {tl.vendaUsadaComBase}</span>
                    ) : <span className="pub-hint">{tl.vendaUsadaHint}</span>; })()}
                  </div>
                )}

              </div>
            </div>

            {/* Link externo */}
            <div className="pub-card">
              <p className="pub-card-t">{tl.linkExternoCard} <span style={{opacity:0.5}}>{tl.linkExternoOpcional}</span></p>
              <div className="link-externo-box">
                <label className="pub-label" style={{ color: "#8a6a2a" }}>
                  {tl.linkExternoLabel}
                  <span className="link-externo-badge">{tl.linkExterno15}</span>
                </label>
                <input
                  className="pub-input"
                  type="url"
                  value={peca.link_compra_externa}
                  onChange={e => setP("link_compra_externa", e.target.value)}
                  placeholder={tl.linkExternoPlaceholder}
                  style={{ marginTop: "0.5rem" }}
                />
                <p style={{ fontSize: "0.65rem", color: "#8a6a2a", marginTop: "0.5rem", lineHeight: 1.5 }}>
                  {tl.linkExternoHint}
                </p>
              </div>
            </div>

            {progresso && (
              <p style={{ fontSize: "0.8rem", color: "#c4748a", fontStyle: "italic", marginBottom: "0.75rem" }}>{progresso}</p>
            )}
            {erro && <div className="pub-erro">{erro}</div>}

            <div className="pub-actions">
              <button className="pub-btn pub-btn-outline" onClick={() => { setErro(""); setPasso(2); }}>←</button>
              <button
                className="pub-btn pub-btn-black"
                onClick={publicar}
                disabled={enviando}
              >
                {enviando ? tl.aPublicar : tl.publicarPeca}
              </button>
            </div>
          </>
        )}

        {/* ── PASSO 4 — SUCESSO ── */}
        {passo === 4 && (
          <div className="pub-card sucesso-wrap">
            <div className="sucesso-icon">🎉</div>
            <h2 className="sucesso-titulo">{tl.p4titulo}</h2>
            <p className="sucesso-sub">{tl.p4sub}</p>
            <div className="sucesso-acoes">
              {cliente?.codigo_cliente && (
                <a
                  href={`/loja/${cliente.codigo_cliente}`}
                  className="sucesso-btn"
                  style={{ background: "#080808", color: "#fff" }}
                >
                  {tl.verLoja}
                </a>
              )}
              <button
                className="sucesso-btn"
                onClick={reiniciar}
                style={{ background: "#fff", border: "1.5px solid #e2dfda", color: "#080808" }}
              >
                {tl.adicionarOutra}
              </button>
              <a href="/perfil" className="sucesso-btn" style={{ color: "#7a776f", textDecoration: "none", fontSize: "0.7rem" }}>
                {tl.irParaPerfil}
              </a>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
