"use client";
/**
 * /ajuda — Centro de ajuda interactivo (autenticado)
 * Pesquisa + categorias + acordeão Q&A
 * PT / FR / LT
 */
import { useState, useMemo } from "react";
import Link from "next/link";

const DATA = {
  pt: [
    {
      id: "conta", icon: "👤", label: "A minha conta",
      eyebrow: "Conta & Perfil", title: "Gerir a tua conta",
      desc: "Dados pessoais, foto de perfil, nome público e definições de privacidade.",
      faqs: [
        { q: "Como altero o meu nome ou nome público?", a: "Vai a Perfil → Dados pessoais. Edita o campo Nome público / Pseudónimo e clica em Guardar." },
        { q: "Como altero a foto de perfil?", a: "No teu Perfil, clica no círculo com o teu avatar. Escolhes da galeria ou tiras uma nova foto." },
        { q: "Como adiciono ou altero o meu telemóvel (WhatsApp)?", a: "Em Perfil → Dados pessoais, edita o campo Telemóvel (WhatsApp). Este número é usado para notificações automáticas." },
        { q: "Como vejo os alugueres que fiz e os talões?", a: "Vai a Perfil → tab Alugueres. Clica em qualquer aluguer para ver o talão detalhado." },
        { q: "Como falo com um lojista sobre uma peça?", a: "Na página de detalhe de qualquer peça encontras o botão Mensagem. Podes também abrir Mensagens directamente." },
      ],
    },
    {
      id: "publicar", icon: "📸", label: "Publicar peças",
      eyebrow: "Publicações", title: "Publicar e gerir peças",
      desc: "Como submeter fotos, definir preços e gerir as tuas publicações.",
      faqs: [
        { q: "Como submeto uma nova peça?", a: "Vai a Publicar, carrega até 8 fotos, preenche os dados (nome, marca, categoria, tamanho, condição, preço) e submete. A peça fica visível no Catálogo imediatamente." },
        { q: "Como coloco uma peça só para venda social (sem aparecer no catálogo)?", a: "Ao publicar, activa a opção Apenas venda social. A peça não aparece no catálogo geral — só podes partilhá-la pelo teu link pessoal ou rede social." },
        { q: "Como edito ou removo uma peça?", a: "Em Perfil → A minha loja, clica nos três pontos (⋯) ao lado da peça. Podes editar dados, alterar preços, mudar fotos ou remover a publicação." },
        { q: "Como altero o nome da minha loja?", a: "Vai a Perfil → A minha loja → Configurações da loja. O campo Nome público da loja define o que aparece na tua página pública." },
        { q: "Como fico lojista?", a: "Vai ao teu Perfil → Candidatura a lojista. Preenche o formulário com nome da loja, NIF, IBAN e tipo de peças. A equipa Nora Grei aprova em 24–48h." },
      ],
    },
    {
      id: "alugueres", icon: "🛍", label: "Alugueres & Compras",
      eyebrow: "Alugueres", title: "Alugar e comprar peças",
      desc: "Como fazer uma reserva, pagar, devolver e o que acontece em caso de atraso.",
      faqs: [
        { q: "Como faço um aluguer?", a: "Abre a página da peça, escolhe tamanho e datas, clica em Reservar e paga com cartão. Recebes confirmação por WhatsApp." },
        { q: "Como funciona a devolução?", a: "No fim do período, envia a peça pelo método acordado no checkout. Quando o lojista a recebe e verifica, o aluguer é marcado como concluído." },
        { q: "O que acontece se devolver tarde?", a: "Por cada dia de atraso é debitado automaticamente no teu cartão o valor do aluguer diário. Recebes notificação WhatsApp por cada débito." },
        { q: "Como entro na lista de espera?", a: "Na página da peça, se o tamanho estiver indisponível, aparece o botão Entrar na lista de espera. Recebes notificação quando ficar disponível." },
      ],
    },
    {
      id: "calculadora", icon: "🧮", label: "Calculadora",
      eyebrow: "Calculadora de preços", title: "Calcular o preço de um artigo",
      desc: "Como usar a calculadora para estimar o valor de aluguer ou venda.",
      faqs: [
        { q: "Como calculo o preço sugerido para a minha peça?", a: "Vai à Calculadora, preenche preço original, marca, tipo de peça, estado, frequência de uso e idade. A calculadora sugere preço de aluguer por dia e preço de venda." },
        { q: "A que marcas se aplica?", a: "A calculadora cobre 4 tiers: Investimento (Hermès, Chanel, LV…), Premium (Gucci, Prada, Dior…), Alta rua (Zara, Mango, COS…) e Mercado geral. Escreve a marca e aparece o tier automaticamente." },
      ],
    },
    {
      id: "afiliados", icon: "🔗", label: "Afiliados",
      eyebrow: "Programa de Afiliados", title: "Partilhar e ganhar com referidos",
      desc: "Como gerar o teu link, partilhá-lo e acompanhar as comissões.",
      faqs: [
        { q: "Como obtenho o meu link de afiliado?", a: "O teu link é noragrei.com/registar?ref=[teu-código]. Encontra o código em Perfil → O meu código ou tab Afiliados." },
        { q: "Como partilho o link?", a: "Copia o link em Perfil → Afiliados e partilha onde quiseres. Quem se registar pelo teu link fica associado à tua conta." },
        { q: "Como atribuo um código a alguém manualmente?", a: "Não é possível retroactivamente de forma automática. Para casos especiais, contacta o suporte Nora Grei." },
        { q: "Quanto ganho por referido?", a: "€5 de crédito quando o referido se regista, e comissão adicional quando completa o primeiro aluguer." },
        { q: "Como vejo os meus referidos e comissões?", a: "Em Perfil → tab Afiliados vês a lista de referidos, estado e créditos ganhos e disponíveis." },
      ],
    },
    {
      id: "lojista", icon: "🏪", label: "Gestão da loja",
      eyebrow: "Lojistas", title: "Gerir a tua loja",
      desc: "Confirmar alugueres, tratar devoluções, liquidações e penalizações.",
      faqs: [
        { q: "Como confirmo um novo aluguer?", a: "Vai a Perfil → A minha loja → Alugueres e confirma ou recusa o pedido pendente. Pedidos não confirmados em 24h são cancelados." },
        { q: "Como marco uma devolução como recebida?", a: "Em Alugueres, encontra o aluguer Em devolução e clica em Confirmar recepção. Podes assinalar danos se existirem." },
        { q: "Como levanto uma liquidação?", a: "As liquidações são processadas automaticamente. Em Perfil → A minha loja → Liquidações vês os valores disponíveis para o teu IBAN." },
        { q: "Recebi uma penalização — o que significa?", a: "Penalizações por cancelamento tardio, peça em mau estado ou atraso no envio aparecem detalhadas em Perfil → A minha loja. Para contestar, usa o canal de suporte." },
        { q: "Como vejo peças minhas em atraso de devolução?", a: "No bell de notificações e em Perfil → Alugueres (filtro Em atraso) vês as peças com devolução em atraso e os dias decorridos." },
      ],
    },
    {
      id: "notificacoes", icon: "🔔", label: "Notificações",
      eyebrow: "Notificações", title: "Notificações e alertas",
      desc: "Bell interno, WhatsApp e como gerir o que recebes.",
      faqs: [
        { q: "Que notificações recebo por WhatsApp?", a: "Peça da lista de espera disponível, campanhas exclusivas, débito diário por atraso, novo aluguer/venda (lojistas), devolução a verificar (lojistas) e liquidação disponível (lojistas)." },
        { q: "O que é o bell de notificações?", a: "O ícone 🔔 no topo da plataforma agrupa todos os alertas em tempo real: mensagens, recibos, reservas, campanhas e alertas de loja." },
        { q: "Como actualizo o meu telemóvel para receber WhatsApp?", a: "Em Perfil → Dados pessoais, edita o campo Telemóvel (WhatsApp) com o número completo incluindo indicativo do país (+351, +33, +370…)." },
      ],
    },
  ],
  fr: [
    {
      id: "conta", icon: "👤", label: "Mon compte",
      eyebrow: "Compte & Profil", title: "Gérer votre compte",
      desc: "Données personnelles, photo de profil, nom public et paramètres de confidentialité.",
      faqs: [
        { q: "Comment changer mon nom public ?", a: "Allez dans Profil → Données personnelles. Modifiez le champ Nom public / Pseudonyme et cliquez sur Enregistrer." },
        { q: "Comment changer ma photo de profil ?", a: "Dans votre Profil, cliquez sur le cercle avec votre avatar. Choisissez depuis la galerie ou prenez une nouvelle photo." },
        { q: "Comment ajouter mon téléphone (WhatsApp) ?", a: "Dans Profil → Données personnelles, modifiez le champ Téléphone (WhatsApp). Ce numéro reçoit les notifications automatiques." },
        { q: "Comment voir mes locations et mes reçus ?", a: "Allez dans Profil → onglet Locations. Cliquez sur une location pour voir le reçu détaillé." },
        { q: "Comment contacter une vendeuse ?", a: "Sur la page de n'importe quelle pièce, utilisez le bouton Message ou accédez directement à Messages." },
      ],
    },
    {
      id: "publicar", icon: "📸", label: "Publier des pièces",
      eyebrow: "Publications", title: "Publier et gérer des pièces",
      desc: "Comment soumettre des photos, fixer des prix et gérer vos publications.",
      faqs: [
        { q: "Comment publier une nouvelle pièce ?", a: "Allez dans Publier, chargez jusqu'à 8 photos, remplissez les détails et soumettez. La pièce apparaît immédiatement dans le catalogue." },
        { q: "Comment mettre une pièce en vente sociale uniquement ?", a: "Lors de la publication, activez l'option Vente sociale uniquement. La pièce n'apparaît pas dans le catalogue général." },
        { q: "Comment modifier ou supprimer une pièce ?", a: "Dans Profil → Ma boutique, cliquez sur les trois points (⋯) à côté de la pièce." },
        { q: "Comment changer le nom de ma boutique ?", a: "Dans Profil → Ma boutique → Paramètres, modifiez le champ Nom public de la boutique." },
        { q: "Comment devenir vendeuse ?", a: "Dans votre Profil → Candidature vendeuse. Remplissez le formulaire. Approbation en 24–48h." },
      ],
    },
    {
      id: "alugueres", icon: "🛍", label: "Locations & Achats",
      eyebrow: "Locations", title: "Louer et acheter des pièces",
      desc: "Comment réserver, payer, retourner et que faire en cas de retard.",
      faqs: [
        { q: "Comment louer une pièce ?", a: "Ouvrez la page de la pièce, choisissez la taille et les dates, cliquez sur Réserver et payez. Confirmation WhatsApp immédiate." },
        { q: "Comment fonctionne le retour ?", a: "À la fin de la période, envoyez la pièce selon le transporteur convenu. Dès réception vérifiée, la location est clôturée." },
        { q: "Que se passe-t-il si je rends en retard ?", a: "Chaque jour de retard entraîne un débit automatique du montant journalier de la location. Vous recevez un WhatsApp pour chaque débit." },
        { q: "Comment rejoindre la liste d'attente ?", a: "Sur la page de la pièce, si la taille est indisponible, cliquez sur Rejoindre la liste d'attente. Notification dès disponibilité." },
      ],
    },
    {
      id: "calculadora", icon: "🧮", label: "Calculatrice",
      eyebrow: "Calculatrice de prix", title: "Calculer le prix d'un article",
      desc: "Comment utiliser la calculatrice pour estimer la valeur de location ou de vente.",
      faqs: [
        { q: "Comment calculer le prix suggéré ?", a: "Dans la Calculatrice, remplissez le prix d'achat, la marque, le type, l'état, la fréquence d'usage et l'âge. La calculatrice suggère un prix de location et de vente." },
        { q: "Quelles marques sont couvertes ?", a: "4 niveaux : Investissement (Hermès, Chanel, LV…), Premium (Gucci, Prada, Dior…), Haut de gamme accessible (Zara, Mango, COS…) et Marché général." },
      ],
    },
    {
      id: "afiliados", icon: "🔗", label: "Parrainages",
      eyebrow: "Programme Parrainage", title: "Partager et gagner avec vos filleuls",
      desc: "Comment générer votre lien, le partager et suivre vos commissions.",
      faqs: [
        { q: "Comment obtenir mon lien de parrainage ?", a: "Votre lien est noragrei.com/registar?ref=[votre-code]. Trouvez le code dans Profil → Mon code ou onglet Parrainages." },
        { q: "Comment partager mon lien ?", a: "Copiez le lien dans Profil → Parrainages et partagez-le où vous voulez. Toute inscription via ce lien vous est créditée." },
        { q: "Combien je gagne par filleul ?", a: "5 € de crédit à l'inscription du filleul, et une commission supplémentaire à sa première location." },
      ],
    },
    {
      id: "lojista", icon: "🏪", label: "Gestion boutique",
      eyebrow: "Vendeuses", title: "Gérer votre boutique",
      desc: "Confirmer les locations, traiter les retours, liquidations et pénalités.",
      faqs: [
        { q: "Comment confirmer une location ?", a: "Dans Profil → Ma boutique → Locations, confirmez ou refusez la demande. Les demandes non confirmées en 24h sont annulées." },
        { q: "Comment valider un retour ?", a: "Dans Locations, trouvez la location En retour et cliquez sur Confirmer la réception. Signalez les dommages le cas échéant." },
        { q: "Comment retirer une liquidation ?", a: "Les liquidations sont automatiques. Dans Profil → Ma boutique → Liquidations, voyez les montants disponibles." },
      ],
    },
    {
      id: "notificacoes", icon: "🔔", label: "Notifications",
      eyebrow: "Notifications", title: "Notifications et alertes",
      desc: "Cloche interne, WhatsApp et gestion des alertes.",
      faqs: [
        { q: "Quelles notifications reçois-je par WhatsApp ?", a: "Pièce disponible en liste d'attente, campagnes exclusives, débit de retard, nouvelle location/vente (vendeuses), retour à vérifier (vendeuses), liquidation disponible (vendeuses)." },
        { q: "Qu'est-ce que la cloche de notifications ?", a: "L'icône 🔔 regroupe toutes les alertes en temps réel : messages, reçus, réservations, campagnes et alertes boutique." },
      ],
    },
  ],
  lt: [
    {
      id: "conta", icon: "👤", label: "Mano paskyra",
      eyebrow: "Paskyra & Profilis", title: "Paskyros valdymas",
      desc: "Asmeniniai duomenys, profilio nuotrauka, viešas vardas ir privatumo nustatymai.",
      faqs: [
        { q: "Kaip pakeisti viešą vardą?", a: "Eikite į Profilį → Asmeniniai duomenys. Redaguokite lauką Viešas vardas / Slapyvardis ir spauskite Išsaugoti." },
        { q: "Kaip pakeisti profilio nuotrauką?", a: "Profilio puslapyje spauskite ant avataro rato. Pasirinkite iš galerijos arba nufotografuokite." },
        { q: "Kaip pridėti telefoną (WhatsApp)?", a: "Profilis → Asmeniniai duomenys, redaguokite lauką Telefonas (WhatsApp). Šis numeris naudojamas automatiniams pranešimams." },
        { q: "Kaip pamatyti savo nuomas ir kvitus?", a: "Profilis → skirtukas Nuomos. Spauskite ant bet kurios nuomos, kad pamatytumėte detalų kvitą." },
      ],
    },
    {
      id: "publicar", icon: "📸", label: "Skelbti daiktus",
      eyebrow: "Skelbimai", title: "Skelbti ir valdyti daiktus",
      desc: "Kaip įkelti nuotraukas, nustatyti kainas ir valdyti skelbimus.",
      faqs: [
        { q: "Kaip paskelbti naują daiktą?", a: "Eikite į Skelbti, įkelkite iki 8 nuotraukų, užpildykite duomenis ir paskelbkite. Daiktas iš karto rodomas kataloge." },
        { q: "Kaip paskelbti tik socialiniam pardavimui?", a: "Skelbiant aktyvuokite parinktį Tik socialinis pardavimas. Daiktas nerodomas bendrame kataloge." },
        { q: "Kaip redaguoti ar pašalinti skelbimą?", a: "Profilis → Mano parduotuvė, spauskite tris taškus (⋯) šalia daikto." },
        { q: "Kaip pakeisti parduotuvės pavadinimą?", a: "Profilis → Mano parduotuvė → Nustatymai, redaguokite lauką Viešas parduotuvės pavadinimas." },
      ],
    },
    {
      id: "alugueres", icon: "🛍", label: "Nuomos & Pirkimai",
      eyebrow: "Nuomos", title: "Nuomoti ir pirkti daiktus",
      desc: "Kaip rezervuoti, mokėti, grąžinti ir kas nutinka vėluojant.",
      faqs: [
        { q: "Kaip išsinuomoti daiktą?", a: "Atidarykite daikto puslapį, pasirinkite dydį ir datas, spauskite Rezervuoti ir mokėkite kortele. Patvirtinimas WhatsApp." },
        { q: "Kaip veikia grąžinimas?", a: "Pasibaigus laikotarpiui, siųskite daiktą sutartu būdu. Kai pardavėja gauna ir patikrina, nuoma užbaigiama." },
        { q: "Kas nutinka vėluojant grąžinti?", a: "Kiekvieną vėlavimo dieną automatiškai nurašoma dienos nuomos suma. Kiekvieną nurašymą pranešame WhatsApp." },
      ],
    },
    {
      id: "afiliados", icon: "🔗", label: "Rekomendacijos",
      eyebrow: "Rekomendacijų programa", title: "Dalintis ir uždirbti",
      desc: "Kaip gauti nuorodą, dalintis ir sekti komisines.",
      faqs: [
        { q: "Kaip gauti rekomendacijos nuorodą?", a: "Jūsų nuoroda: noragrei.com/registar?ref=[jūsų-kodas]. Kodą rasite Profilis → Mano kodas." },
        { q: "Kiek uždirbu nuo rekomendacijos?", a: "5 € kredito, kai rekomenduotasis užsiregistruoja, ir papildoma komisija po pirmosios nuomos." },
      ],
    },
    {
      id: "notificacoes", icon: "🔔", label: "Pranešimai",
      eyebrow: "Pranešimai", title: "Pranešimai ir įspėjimai",
      desc: "Vidiniai pranešimai, WhatsApp ir valdymas.",
      faqs: [
        { q: "Kokius pranešimus gaunu per WhatsApp?", a: "Daiktas prieinamas laukimo sąraše, išskirtinės kampanijos, vėlavimo nurašymas, nauja nuoma/pardavimas (pardavėjos), grąžinimas tikrinimui (pardavėjos), likvidacija prieinama (pardavėjos)." },
        { q: "Kas yra pranešimų varpelė?", a: "Piktograma 🔔 rodo visus pranešimus realiu laiku: žinutes, kvitus, rezervacijas, kampanijas ir parduotuvės įspėjimus." },
      ],
    },
  ],
};

export default function AjudaPage() {
  const [lang, setLang] = useState("pt");
  const [activeCat, setActiveCat] = useState("conta");
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const cats = DATA[lang];
  const cat = cats.find(c => c.id === activeCat) || cats[0];

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    const results = [];
    cats.forEach(c => {
      c.faqs.forEach(f => {
        if (f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)) {
          results.push({ ...f, catLabel: c.label, catIcon: c.icon });
        }
      });
    });
    return results;
  }, [search, cats]);

  const displayFaqs = searchResults || cat.faqs;

  const labelSearch = { pt: "Pesquisar ajuda…", fr: "Rechercher de l'aide…", lt: "Ieškoti pagalbos…" }[lang];
  const labelNoResult = { pt: "Sem resultados.", fr: "Aucun résultat.", lt: "Rezultatų nėra." }[lang];

  return (
    <div style={{ fontFamily: "'Jost', Arial, sans-serif", background: "#f8f7f5", color: "#1a1816", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ background: "#100c0a", color: "#f8f7f5", padding: "0.8rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#f8f7f5", textDecoration: "none" }}>
          Nora Grei
        </Link>
        <div style={{ flex: 1, maxWidth: 340, display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", padding: "0.4rem 0.7rem", borderRadius: "2px" }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>⌕</span>
          <input
            type="search"
            value={search}
            onChange={e => { setSearch(e.target.value); setOpenFaq(null); }}
            placeholder={labelSearch}
            style={{ background: "none", border: "none", outline: "none", color: "#f8f7f5", fontFamily: "inherit", fontSize: "0.82rem", width: "100%" }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.3rem" }}>
          {["pt","fr","lt"].map(l => (
            <button key={l} onClick={() => { setLang(l); setSearch(""); setOpenFaq(null); setActiveCat("conta"); }} style={{ background: lang === l ? "#c4748a" : "transparent", color: "#f8f7f5", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "2px", padding: "0.2rem 0.5rem", fontSize: "0.68rem", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.08em" }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "calc(100vh - 50px)" }}>
        {/* Sidebar */}
        <nav style={{ borderRight: "1px solid #e2dfda", padding: "1.25rem 0", position: "sticky", top: 50, height: "calc(100vh - 50px)", overflowY: "auto" }}>
          {cats.map(c => (
            <button
              key={c.id}
              onClick={() => { setActiveCat(c.id); setSearch(""); setOpenFaq(null); }}
              style={{ width: "100%", background: "none", border: "none", borderLeft: `2px solid ${activeCat === c.id && !search ? "#c4748a" : "transparent"}`, display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 1.1rem", cursor: "pointer", fontSize: "0.8rem", color: activeCat === c.id && !search ? "#c4748a" : "#5a5855", fontWeight: activeCat === c.id && !search ? 600 : 400, background: activeCat === c.id && !search ? "#fdf0f3" : "transparent", fontFamily: "inherit", textAlign: "left" }}
            >
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </nav>

        {/* Main */}
        <main style={{ padding: "2.5rem", maxWidth: 740 }}>
          {!search && (
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4748a", fontWeight: 600, marginBottom: "0.3rem" }}>{cat.eyebrow}</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.9rem", fontWeight: 300, lineHeight: 1.2, marginBottom: "0.4rem" }}>{cat.title}</h1>
              <p style={{ fontSize: "0.84rem", color: "#5a5855" }}>{cat.desc}</p>
            </div>
          )}
          {search && (
            <div style={{ marginBottom: "1.25rem", fontSize: "0.82rem", color: "#9a9895" }}>
              {searchResults?.length > 0
                ? `${searchResults.length} resultado${searchResults.length > 1 ? "s" : ""}`
                : labelNoResult}
            </div>
          )}

          {displayFaqs.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#9a9895" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
              <div style={{ fontSize: "0.85rem" }}>{labelNoResult}</div>
            </div>
          )}

          <div>
            {displayFaqs.map((f, idx) => (
              <div key={idx} style={{ borderBottom: "1px solid #e2dfda", ...(idx === 0 ? { borderTop: "1px solid #e2dfda" } : {}) }}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{ width: "100%", background: "none", border: "none", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", padding: "1.05rem 0", cursor: "pointer", textAlign: "left" }}
                >
                  <div>
                    {search && f.catLabel && (
                      <div style={{ fontSize: "0.68rem", color: "#9a9895", marginBottom: "0.2rem" }}>{f.catIcon} {f.catLabel}</div>
                    )}
                    <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "#1a1816", lineHeight: 1.45, fontFamily: "inherit" }}>{f.q}</span>
                  </div>
                  <span style={{ fontSize: "0.65rem", color: "#9a9895", flexShrink: 0, marginTop: "3px", display: "inline-block", transform: openFaq === idx ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </button>
                {openFaq === idx && (
                  <div style={{ paddingBottom: "1.1rem", fontSize: "0.84rem", color: "#5a5855", lineHeight: 1.75 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400&family=Jost:wght@400;500;600&display=swap');
        @media (max-width: 640px) {
          .ng-layout { grid-template-columns: 1fr !important; }
          .ng-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
