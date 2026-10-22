"use client";
/**
 * /sobre — Landing pública explicativa
 * Para quem ainda não tem conta: o que é a Nora Grei, como criar conta,
 * como abrir uma loja e como se ganha dinheiro na plataforma.
 */
import Link from "next/link";
import { useState } from "react";

const TXT = {
  pt: {
    hero_eyebrow: "O que é a Nora Grei?",
    hero_title: "Moda de luxo que circula,\nem vez de ficar parada.",
    hero_desc: "A Nora Grei é moda para todos — do luxo ao acessível, de qualquer marca que uses e queiras fazer circular. Aluga, vende ou dá. A plataforma adapta-se ao teu estilo e ao que te dispões a investir.",
    hero_atitude: "Compra, aluga, vende. Sê cliente ou sê lojista e cliente. O que vais fazer? Isso é contigo.",
    cta_conta: "Criar conta gratuita",
    cta_loja: "Quero abrir uma loja",
    cta_catalogo: "Ver catálogo",

    // Como funciona — clientes
    sec_cliente_tag: "Para clientes",
    sec_cliente_title: "Usa peças de luxo\nsem as comprar.",
    steps_cliente: [
      { n: "1", t: "Cria conta", d: "Registo gratuito em 2 minutos — só precisas de email e telemóvel." },
      { n: "2", t: "Escolhe a peça", d: "Filtra por marca, tamanho, ocasião e datas. Compara preços e histórico de cada peça." },
      { n: "3", t: "Reserva e paga", d: "Pagamento seguro por cartão. Recebes confirmação imediata por WhatsApp." },
      { n: "4", t: "Usa e devolve", d: "Desfruta da peça. No fim do período, devolves pela transportadora acordada." },
    ],

    // Como funciona — lojistas
    sec_lojista_tag: "Para quem quer publicar peças",
    sec_lojista_title: "As tuas peças podem\ncircular também.",
    steps_lojista: [
      { n: "1", t: "Pedido de lojista", d: "Um formulário simples com os teus dados. Analisamos em 24–48h e avisamos quando estiver activo." },
      { n: "2", t: "Publica as peças", d: "Fotos pelo telemóvel directamente pela plataforma. A calculadora sugere o preço certo." },
      { n: "3", t: "Chegam os pedidos", d: "Quando alguém reserva ou compra, recebes notificação. Confirmas com um clique." },
      { n: "4", t: "A plataforma trata do resto", d: "Tratas do envio. Os pagamentos e a liquidação são processados automaticamente." },
    ],

    // Rentabilizar
    sec_ganhar_tag: "Para lojistas",
    sec_ganhar_title: "Rentabiliza o teu\nguarda-roupa.",
    ganhar_items: [
      { ico: "🛍", t: "Aluga as tuas peças", d: "As peças que tens no armário podem gerar retorno. Publica, define disponibilidade e recebe pedidos." },
      { ico: "🏷", t: "Vende o que já não usas", d: "Dá uma segunda vida às peças que já não usas — e encontra quem as valoriza." },
      { ico: "🔗", t: "Referidos e afiliados", d: "Cada pessoa que se regista pelo teu link dá-te €5 de crédito. Quando faz o primeiro aluguer, ganhas crédito extra." },
      { ico: "📸", t: "Venda social", d: "Publica uma peça só para a tua rede, sem aparecer no catálogo geral. Ideal para peças com audiência específica." },
    ],

    // Calculadora
    sec_calc_tag: "Calculadora de preços",
    sec_calc_title: "Não sabes quanto cobrar?",
    sec_calc_desc: "A nossa calculadora analisa a marca, o estado, a idade e a frequência de uso da peça e sugere o preço de aluguer por dia e o preço de venda — com base em dados reais de mercado.",
    sec_calc_cta: "Experimentar a calculadora",

    // FAQ rápido
    faq_tag: "Dúvidas frequentes",
    faq_title: "Perguntas rápidas",
    faqs: [
      { q: "É gratuito criar conta?", a: "Sim, completamente. Não há mensalidades nem subscrições." },
      { q: "Quanto tempo demora a aprovação de lojista?", a: "Normalmente 24 a 48 horas. Recebes uma notificação quando a tua loja for activada." },
      { q: "E se a peça se danificar durante um aluguer?", a: "A plataforma tem um processo de verificação na devolução. O cliente é responsável por danos que não existiam antes. Podes registar o estado inicial com fotos na publicação." },
      { q: "Posso ter uma loja mesmo sendo particular?", a: "Sim. Não precisas de ser empresa. Qualquer pessoa pode candidatar-se a lojista." },
    ],

    ajuda: "Ver centro de ajuda completo →",
    footer_marca: "NORA GREI",
    footer_desc: "Plataforma de moda de luxo — Aluguer & Venda",
    footer_links: ["Catálogo", "Calculadora", "Lojas", "Ajuda", "Entrar"],
  },
  fr: {
    hero_eyebrow: "Qu'est-ce que Nora Grei ?",
    hero_title: "La mode de luxe qui circule,\nau lieu de rester au placard.",
    hero_desc: "Nora Grei, c'est la mode pour tous — du luxe à l'accessible, quelle que soit la marque que vous portez et souhaitez faire circuler. Louez, vendez ou donnez. La plateforme s'adapte à votre style et à ce que vous êtes prêt à investir.",
    hero_atitude: "Achetez, louez, vendez. Soyez client ou client-boutique. Que voulez-vous faire ? C'est vous qui décidez.",
    cta_conta: "Créer un compte gratuit",
    cta_loja: "Je veux ouvrir une boutique",
    cta_catalogo: "Voir le catalogue",
    sec_cliente_tag: "Pour les clientes",
    sec_cliente_title: "Portez du luxe\nsans l'acheter.",
    steps_cliente: [
      { n: "1", t: "Créez votre compte", d: "Inscription gratuite en 2 minutes — il vous faut seulement un email et un téléphone." },
      { n: "2", t: "Choisissez la pièce", d: "Filtrez par marque, taille, occasion et dates. Comparez les prix et l'historique." },
      { n: "3", t: "Réservez et payez", d: "Paiement sécurisé par carte. Confirmation immédiate par WhatsApp." },
      { n: "4", t: "Portez et retournez", d: "Profitez de la pièce. À la fin de la période, retournez-la par le transporteur convenu." },
    ],
    sec_lojista_tag: "Pour ceux qui veulent publier des pièces",
    sec_lojista_title: "Vos pièces peuvent\ncirculer aussi.",
    steps_lojista: [
      { n: "1", t: "Demande lojista", d: "Un formulaire simple avec vos données. Nous analysons sous 24–48h et vous avertissons." },
      { n: "2", t: "Publiez vos pièces", d: "Photos depuis votre téléphone, directement sur la plateforme. La calculatrice suggère le bon prix." },
      { n: "3", t: "Les commandes arrivent", d: "Notification à chaque réservation ou achat. Vous confirmez en un clic." },
      { n: "4", t: "La plateforme s'occupe du reste", d: "Vous gérez l'envoi. Les paiements et les règlements sont traités automatiquement." },
    ],
    sec_ganhar_tag: "Pour les lojistas",
    sec_ganhar_title: "Rentabilisez\nvotre garde-robe.",
    ganhar_items: [
      { ico: "🛍", t: "Louez vos pièces", d: "Les pièces dans votre armoire peuvent générer un retour. Publiez, définissez vos disponibilités et recevez des demandes." },
      { ico: "🏷", t: "Vendez ce que vous n'utilisez plus", d: "Donnez une seconde vie à vos pièces — et trouvez qui les valorise." },
      { ico: "🔗", t: "Parrainages", d: "Chaque personne inscrite via votre lien vous rapporte 5 € de crédit." },
      { ico: "📸", t: "Vente sociale", d: "Publiez une pièce uniquement pour votre réseau, sans qu'elle apparaisse dans le catalogue général." },
    ],
    sec_calc_tag: "Calculatrice de prix",
    sec_calc_title: "Vous ne savez pas combien demander ?",
    sec_calc_desc: "Notre calculatrice analyse la marque, l'état, l'âge et l'usage et suggère un prix de location et de vente basé sur des données réelles.",
    sec_calc_cta: "Essayer la calculatrice",
    faq_tag: "Questions fréquentes",
    faq_title: "Questions rapides",
    faqs: [
      { q: "La création de compte est-elle gratuite ?", a: "Oui, complètement. Aucun abonnement." },
      { q: "Combien de temps prend l'approbation ?", a: "Généralement 24 à 48 heures. Vous recevrez une notification dès que votre boutique sera activée." },
      { q: "Et si la pièce est endommagée ?", a: "La plateforme vérifie à la réception. Le client est responsable des dommages. Vous pouvez enregistrer l'état initial avec des photos." },
      { q: "Faut-il être une entreprise ?", a: "Non. Tout particulier peut ouvrir une boutique." },
    ],
    ajuda: "Voir le centre d'aide complet →",
    footer_marca: "NORA GREI",
    footer_desc: "Plateforme de mode de luxe — Location & Vente",
    footer_links: ["Catalogue", "Calculatrice", "Boutiques", "Aide", "Connexion"],
  },
  lt: {
    hero_eyebrow: "Kas yra Nora Grei?",
    hero_title: "Prabangos mada, kuri cirkuliuoja,\no ne stovi spintoje.",
    hero_desc: "Nora Grei — mada visiems: nuo prabangos iki prieinamos, nesvarbu kokio prekės ženklo drabužius nešiojate ir norite leisti jiems cirkuliuoti. Nuomokite, parduokite ar dovanokite. Platforma prisitaiko prie jūsų stiliaus ir to, kiek esate pasiryžę investuoti.",
    hero_atitude: "Pirkite, nuomokite, parduokite. Būkite klientas arba klientas-pardavėjas. Ką darysite? Tai jūsų pasirinkimas.",
    cta_conta: "Sukurti nemokamą paskyrą",
    cta_loja: "Noriu atidaryti parduotuvę",
    cta_catalogo: "Žiūrėti katalogą",
    sec_cliente_tag: "Klientams",
    sec_cliente_title: "Dėvėkite prabangą\nnepirkdami.",
    steps_cliente: [
      { n: "1", t: "Sukurkite paskyrą", d: "Nemokama registracija per 2 minutes — tik el. paštas ir telefonas." },
      { n: "2", t: "Pasirinkite daiktą", d: "Filtruokite pagal prekės ženklą, dydį, progą ir datas." },
      { n: "3", t: "Rezervuokite ir mokėkite", d: "Saugus mokėjimas kortele. Patvirtinimas WhatsApp." },
      { n: "4", t: "Naudokite ir grąžinkite", d: "Mėgaukitės daiktu. Pasibaigus laikotarpiui, grąžinkite kurjeriu." },
    ],
    sec_lojista_tag: "Tiems, kurie nori skelbti drabužius",
    sec_lojista_title: "Jūsų drabužiai\ngali cirkuliuoti irgi.",
    steps_lojista: [
      { n: "1", t: "Lojisto užklausa", d: "Paprastas formulas su duomenimis. Peržiūrime per 24–48h ir pranešame, kai aktyvu." },
      { n: "2", t: "Skelbkite drabužius", d: "Nuotraukos tiesiogiai iš telefono per platformą. Skaičiuoklė siūlo tinkamą kainą." },
      { n: "3", t: "Užsakymai ateina", d: "Pranešimas kiekvieną rezervaciją ar pirkimą. Patvirtinate vienu paspaudimu." },
      { n: "4", t: "Platforma pasirūpina likusiu", d: "Jūs tvarkote siuntimą. Mokėjimai ir atsiskaitymai apdorojami automatiškai." },
    ],
    sec_ganhar_tag: "Lojistams",
    sec_ganhar_title: "Rentabilizuokite\nsavo spintą.",
    ganhar_items: [
      { ico: "🛍", t: "Nuomokite savo drabužius", d: "Daiktai spintoje gali duoti naudos. Skelbkite, nustatykite prieinamumą ir gaukite užsakymus." },
      { ico: "🏷", t: "Parduokite tai, ko nebevartojate", d: "Suteikite antrą gyvenimą savo drabužiams — ir raskite, kas juos įvertins." },
      { ico: "🔗", t: "Rekomendacijos", d: "Kiekvienas per jūsų nuorodą užsiregistravęs asmuo duoda jums 5 € kreditą." },
      { ico: "📸", t: "Socialinis pardavimas", d: "Skelbkite daiktą tik savo tinklui, nepasirodo bendrame kataloge." },
    ],
    sec_calc_tag: "Kainų skaičiuoklė",
    sec_calc_title: "Nežinote, kiek prašyti?",
    sec_calc_desc: "Mūsų skaičiuoklė analizuoja prekės ženklą, būklę, amžių ir naudojimą ir siūlo nuomos bei pardavimo kainą.",
    sec_calc_cta: "Išbandyti skaičiuoklę",
    faq_tag: "D.U.K.",
    faq_title: "Greiti klausimai",
    faqs: [
      { q: "Ar paskyros kūrimas nemokamas?", a: "Taip, visiškai. Jokio abonamento." },
      { q: "Kiek laiko užtrunka patvirtinimas?", a: "Paprastai 24–48 valandos. Gausite pranešimą, kai parduotuvė bus aktyvuota." },
      { q: "O jei daiktas sugadinamas?", a: "Platforma tikrina grąžinant. Klientas atsakingas už žalą. Galite įrašyti pradinę būklę su nuotraukomis." },
      { q: "Ar reikia būti įmone?", a: "Ne. Bet kuris asmuo gali atidaryti parduotuvę." },
    ],
    ajuda: "Žiūrėti pilną pagalbos centrą →",
    footer_marca: "NORA GREI",
    footer_desc: "Prabangos mados platforma — Nuoma & Pardavimas",
    footer_links: ["Katalogas", "Skaičiuoklė", "Parduotuvės", "Pagalba", "Prisijungti"],
  },
};

const FOOTER_HREFS = ["/catalogo", "/calculadora", "/lojas", "/ajuda", "/entrar"];

export default function SobrePage() {
  const [lang, setLang] = useState("pt");
  const [faqOpen, setFaqOpen] = useState(null);
  const i = TXT[lang];

  return (
    <div style={{ fontFamily: "'Jost', Arial, sans-serif", background: "#f8f7f5", color: "#1a1816", minHeight: "100vh" }}>
      {/* Lang switcher + nav */}
      <nav style={{ background: "#100c0a", color: "#f8f7f5", padding: "0.7rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.2rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#f8f7f5", textDecoration: "none" }}>
          Nora Grei
        </Link>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          {["pt","fr","lt"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? "#c4748a" : "transparent", color: "#f8f7f5", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "2px", padding: "0.2rem 0.55rem", fontSize: "0.7rem", cursor: "pointer", letterSpacing: "0.08em", fontFamily: "inherit" }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: "#100c0a", color: "#f8f7f5", padding: "5rem 2rem 4rem", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#c4748a", marginBottom: "1rem", fontWeight: 600 }}>
            {i.hero_eyebrow}
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 300, lineHeight: 1.15, marginBottom: "1.5rem", whiteSpace: "pre-line" }}>
            {i.hero_title}
          </h1>
          <p style={{ fontSize: "0.95rem", color: "rgba(248,247,245,0.75)", lineHeight: 1.75, maxWidth: 560, margin: "0 auto 1.25rem" }}>
            {i.hero_desc}
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem", fontStyle: "italic", color: "rgba(248,247,245,0.55)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 2.5rem" }}>
            {i.hero_atitude}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/registar" style={{ background: "#c4748a", color: "#fff", padding: "0.8rem 1.6rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.82rem", letterSpacing: "0.08em", fontWeight: 500 }}>
              {i.cta_conta}
            </Link>
            <Link href="/registar?lojista=1" style={{ background: "transparent", color: "#f8f7f5", border: "1px solid rgba(255,255,255,0.3)", padding: "0.8rem 1.6rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.82rem", letterSpacing: "0.08em" }}>
              {i.cta_loja}
            </Link>
            <Link href="/catalogo" style={{ background: "transparent", color: "rgba(248,247,245,0.6)", padding: "0.8rem 1rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.82rem", letterSpacing: "0.05em" }}>
              {i.cta_catalogo}
            </Link>
          </div>
        </div>
      </section>

      {/* Como funciona — clientes */}
      <section style={{ padding: "4rem 2rem" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4748a", fontWeight: 600, marginBottom: "0.5rem" }}>{i.sec_cliente_tag}</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 300, marginBottom: "2.5rem", whiteSpace: "pre-line", lineHeight: 1.2 }}>{i.sec_cliente_title}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
            {i.steps_cliente.map(s => (
              <div key={s.n} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#c4748a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.t}</div>
                <div style={{ fontSize: "0.82rem", color: "#5a5855", lineHeight: 1.6 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divisor */}
      <div style={{ height: "1px", background: "#e2dfda", margin: "0 2rem" }} />

      {/* Como funciona — lojistas */}
      <section style={{ padding: "4rem 2rem", background: "#f0eeeb" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4748a", fontWeight: 600, marginBottom: "0.5rem" }}>{i.sec_lojista_tag}</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 300, marginBottom: "2.5rem", whiteSpace: "pre-line", lineHeight: 1.2 }}>{i.sec_lojista_title}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
            {i.steps_lojista.map(s => (
              <div key={s.n} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#100c0a", color: "#f8f7f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.t}</div>
                <div style={{ fontSize: "0.82rem", color: "#5a5855", lineHeight: 1.6 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ganhar dinheiro */}
      <section style={{ padding: "4rem 2rem", background: "#100c0a", color: "#f8f7f5" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4748a", fontWeight: 600, marginBottom: "0.5rem" }}>{i.sec_ganhar_tag}</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 300, marginBottom: "2.5rem", whiteSpace: "pre-line", lineHeight: 1.2 }}>{i.sec_ganhar_title}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            {i.ganhar_items.map((g, idx) => (
              <div key={idx} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", padding: "1.25rem" }}>
                <div style={{ fontSize: "1.4rem", marginBottom: "0.6rem" }}>{g.ico}</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.4rem" }}>{g.t}</div>
                <div style={{ fontSize: "0.82rem", color: "rgba(248,247,245,0.65)", lineHeight: 1.65 }}>{g.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculadora */}
      <section style={{ padding: "4rem 2rem" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4748a", fontWeight: 600, marginBottom: "0.5rem" }}>{i.sec_calc_tag}</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 300, marginBottom: "1rem", lineHeight: 1.25 }}>{i.sec_calc_title}</h2>
            <p style={{ fontSize: "0.85rem", color: "#5a5855", lineHeight: 1.75, marginBottom: "1.5rem" }}>{i.sec_calc_desc}</p>
            <Link href="/calculadora" style={{ display: "inline-block", background: "#1a1816", color: "#f8f7f5", padding: "0.75rem 1.4rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "0.08em" }}>
              {i.sec_calc_cta}
            </Link>
          </div>
          <div style={{ background: "#f0eeeb", borderRadius: "3px", padding: "1.5rem", fontSize: "0.82rem", color: "#3a3835", lineHeight: 1.7 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.2rem", marginBottom: "0.75rem", fontWeight: 400 }}>
              {lang === "pt" ? "Exemplo: Chanel Bolsa" : lang === "fr" ? "Exemple : Sac Chanel" : "Pavyzdys: Chanel rankinė"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {[
                [lang === "pt" ? "Preço original" : lang === "fr" ? "Prix original" : "Originali kaina", "€ 3 200"],
                [lang === "pt" ? "Marca" : "Marque", "Chanel — Investimento"],
                [lang === "pt" ? "Estado" : lang === "fr" ? "État" : "Būklė", lang === "pt" ? "Bom" : lang === "fr" ? "Bon" : "Gera"],
                [lang === "pt" ? "Idade" : "Âge", "2–4 anos"],
              ].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #dedad4", paddingBottom: "0.3rem" }}>
                  <span style={{ color: "#7a7875" }}>{l}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: "0.5rem", padding: "0.75rem", background: "#fff", borderRadius: "2px", border: "1px solid #e2dfda" }}>
                <div style={{ fontSize: "0.7rem", color: "#aaa89f", marginBottom: "0.2rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{lang === "pt" ? "Sugestão" : "Suggestion"}</div>
                <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{lang === "pt" ? "€ 78 / dia aluguer · € 1 920 venda" : lang === "fr" ? "78 € / jour location · 1 920 € vente" : "€ 78 / diena nuoma · € 1 920 pardavimas"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "4rem 2rem", background: "#f0eeeb" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4748a", fontWeight: 600, marginBottom: "0.5rem" }}>{i.faq_tag}</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 300, marginBottom: "2rem" }}>{i.faq_title}</h2>
          <div>
            {i.faqs.map((f, idx) => (
              <div key={idx} style={{ borderBottom: "1px solid #dedad4", ...(idx === 0 ? { borderTop: "1px solid #dedad4" } : {}) }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  style={{ width: "100%", background: "none", border: "none", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", padding: "1rem 0", cursor: "pointer", textAlign: "left" }}
                >
                  <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#1a1816", lineHeight: 1.45 }}>{f.q}</span>
                  <span style={{ fontSize: "0.7rem", color: "#9a9895", flexShrink: 0, marginTop: "2px", transition: "transform 0.2s", display: "inline-block", transform: faqOpen === idx ? "rotate(180deg)" : "none" }}>▾</span>
                </button>
                {faqOpen === idx && (
                  <div style={{ paddingBottom: "1rem", fontSize: "0.85rem", color: "#5a5855", lineHeight: 1.75 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link href="/ajuda" style={{ fontSize: "0.82rem", color: "#c4748a", textDecoration: "none", borderBottom: "1px solid #c4748a" }}>
              {i.ajuda}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ padding: "4rem 2rem", textAlign: "center", background: "#100c0a", color: "#f8f7f5" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300, marginBottom: "1.5rem", lineHeight: 1.2 }}>
          {lang === "pt" ? "Começa hoje." : lang === "fr" ? "Commencez aujourd'hui." : "Pradėkite šiandien."}
        </h2>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/registar" style={{ background: "#c4748a", color: "#fff", padding: "0.85rem 1.8rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.85rem", letterSpacing: "0.08em", fontWeight: 500 }}>
            {i.cta_conta}
          </Link>
          <Link href="/catalogo" style={{ background: "transparent", color: "#f8f7f5", border: "1px solid rgba(255,255,255,0.25)", padding: "0.85rem 1.8rem", borderRadius: "2px", textDecoration: "none", fontSize: "0.85rem", letterSpacing: "0.08em" }}>
            {i.cta_catalogo}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0a0806", color: "rgba(248,247,245,0.5)", padding: "2rem", textAlign: "center", fontSize: "0.78rem" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1rem", letterSpacing: "0.2em", color: "#f8f7f5", marginBottom: "0.5rem" }}>{i.footer_marca}</div>
        <div style={{ marginBottom: "1rem" }}>{i.footer_desc}</div>
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          {i.footer_links.map((l, idx) => (
            <Link key={l} href={FOOTER_HREFS[idx]} style={{ color: "rgba(248,247,245,0.45)", textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
