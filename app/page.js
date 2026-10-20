"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const T = {
  pt: {
    nav: { catalogo: "Colecção", lojas: "Lojistas", comoFunciona: "Como funciona", entrar: "Entrar", pedidos: "Pedidos", perfil: "Perfil" },
    hero: { eyebrow: "Nova colecção — Outono/Inverno 2026", titulo: "Veste o extraordinário.", sub: "Aluga peças exclusivas da Nora Grei e renova o teu guarda-roupa sempre que quiseres.", desc: "Aluga peças exclusivas da Nora Grei e renova o teu guarda-roupa sempre que quiseres.", cta1: "Explorar colecção", cta2: "Como funciona", rotary: ["Aluga","o que tens","no armário","a mala","o casaco","o vestido","a camisola","a calça"] },
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
    lojista: { label:"O teu armário trabalha por ti", titulo:"O teu guarda-roupa tem valor.", sub:"As lojistas Nora Grei não vendem — curadoreiam. Cada peça que partilhas torna-se parte de uma coleção reconhecida.", btnMain:"Abrir a minha loja", btnCalc:"Calcular o meu potencial →", btnSec:"Ver a colecção",
      pilares: [
        { label:"Rendimento passivo", desc:"As tuas peças alugueres enquanto estão no teu armário." },
        { label:"Reputação acumulada", desc:"Nível, avaliações e confiança que crescem com cada aluguer." },
        { label:"Sem compromisso", desc:"Tu defines os preços, as datas e as condições. Sempre." },
      ]
    },
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
    pwa: { titulo: "Instala a app Nora Grei", sub: "Acesso rápido à colecção, pedidos e notificações.", btn: "Instalar agora", iosP1: "1 · Toca em", iosP2: "⬆️ Partilhar", iosP3: "na barra do Safari", iosP4: "2 · Escolhe", iosP5: "\"Adicionar ao ecrã inicial\"", iosP6: "3 · Toca em", iosP7: "\"Adicionar\"", dispensar: "Agora não", secTitulo: "Tens a app?", secSub: "Instala no teu telemóvel e acede à colecção com um toque.", secBtn: "Instalar app" },
    trust: { label: "Porque nos escolhem", items: [
      { num: "01", titulo: "Peças únicas", desc: "Cada peça é seleccionada a pensar na mulher que quer ser diferente em cada ocasião." },
      { num: "02", titulo: "Caução garantida", desc: "O depósito é devolvido na totalidade quando a peça chega em boas condições." },
      { num: "03", titulo: "Guarda-roupa infinito", desc: "Aluga quantas vezes quiseres. Sem limites, sem acumulação, sem culpa." },
      { num: "04", titulo: "Higienização profissional", desc: "Cada peça é limpa e inspeccionada antes de chegar até ti." },
    ]},
    instagram: { label: "Inspira-te", titulo: "Segue-nos no Instagram", sub: "Vê como as nossas clientes usam as peças.", btn: "Ver @noragrei" },
    lojasSec: { label: "Marketplace", titulo: "Lojas em destaque.", sub: "Lojistas curadoras que partilham as suas peças na plataforma Nora Grei.", verTodas: "Ver todas as lojas", verLoja: "Ver loja" },
  },
  fr: {
    nav: { catalogo: "Collection", lojas: "Boutiques", comoFunciona: "Comment ça marche", entrar: "Connexion", pedidos: "Commandes", perfil: "Profil" },
    hero: { eyebrow: "Nouvelle collection — Automne/Hiver 2026", titulo: "Habillez l'extraordinaire.", sub: "Louez des pièces exclusives Nora Grei et renouvelez votre garde-robe à volonté.", desc: "Louez des pièces exclusives Nora Grei et renouvelez votre garde-robe à volonté.", cta1: "Explorer la collection", cta2: "Comment ça marche", rotary: ["Louez","ce que vous avez","dans votre armoire","le sac","le manteau","la robe","le pull","le pantalon"] },
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
    lojista: { label:"Votre garde-robe travaille pour vous", titulo:"Votre garde-robe a de la valeur.", sub:"Les boutiques Nora Grei ne vendent pas — elles font de la curation. Chaque pièce partagée rejoint une collection reconnue.", btnMain:"Ouvrir ma boutique", btnCalc:"Calculer mon potentiel →", btnSec:"Voir la collection",
      pilares: [
        { label:"Revenu passif", desc:"Vos pièces louent pendant qu'elles sont dans votre armoire." },
        { label:"Réputation accumulée", desc:"Niveau, avis et confiance qui grandissent à chaque location." },
        { label:"Sans engagement", desc:"Vous fixez les prix, les dates et les conditions. Toujours." },
      ]
    },
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
      { num: "01", titulo: "Pièces uniques", desc: "Chaque pièce est sélectionnée pour la femme qui veut être différente à chaque occasion." },
      { num: "02", titulo: "Dépôt garanti", desc: "Le dépôt est intégralement remboursé lorsque la pièce arrive en bon état." },
      { num: "03", titulo: "Garde-robe infinie", desc: "Louez autant que vous voulez. Sans limites, sans accumulation, sans culpabilité." },
      { num: "04", titulo: "Nettoyage professionnel", desc: "Chaque pièce est nettoyée et inspectée avant de vous être livrée." },
    ]},
    instagram: { label: "Inspirez-vous", titulo: "Suivez-nous sur Instagram", sub: "Voyez comment nos clientes portent les pièces.", btn: "Voir @noragrei" },
    lojasSec: { label: "Marketplace", titulo: "Boutiques en vedette.", sub: "Des curatrices qui partagent leurs pièces sur la plateforme Nora Grei.", verTodas: "Voir toutes les boutiques", verLoja: "Voir la boutique" },
  },
  lt: {
    nav: { catalogo: "Kolekcija", lojas: "Parduotuvės", comoFunciona: "Kaip tai veikia", entrar: "Prisijungti", pedidos: "Užsakymai", perfil: "Profilis" },
    hero: { eyebrow: "Nauja kolekcija — 2026 ruduo/žiema", titulo: "Apsirenkite išskirtinai.", sub: "Nuomokitės išskirtinius Nora Grei drabužius ir atnaujinkite savo spintą kada panorėję.", desc: "Nuomokitės išskirtinius Nora Grei drabužius ir atnaujinkite savo spintą kada panorėję.", cta1: "Naršyti kolekciją", cta2: "Kaip tai veikia", rotary: ["Išnuomokite","ką turite","spintoje","rankinę","paltą","suknelę","megztinį","kelnes"] },
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
    lojista: { label:"Jūsų spinta dirba už jus", titulo:"Jūsų spinta turi vertę.", sub:"Nora Grei parduotuvės ne parduoda — jos kuria kolekciją. Kiekvienas drabužis tampa pripažintos kolekcijos dalimi.", btnMain:"Atidaryti parduotuvę", btnCalc:"Apskaičiuoti potencialą →", btnSec:"Žiūrėti kolekciją",
      pilares: [
        { label:"Pasyvios pajamos", desc:"Jūsų drabužiai nuomojami kol jie yra jūsų spintoje." },
        { label:"Sukaupta reputacija", desc:"Lygis, atsiliepimai ir pasitikėjimas auga su kiekviena nuoma." },
        { label:"Be įsipareigojimų", desc:"Jūs nustatote kainas, datas ir sąlygas. Visada." },
      ]
    },
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
      { num: "01", titulo: "Unikalūs drabužiai", desc: "Kiekvienas drabužis atrinktas moteriai, kuri nori būti skirtinga kiekvienai progai." },
      { num: "02", titulo: "Užstatas garantuotas", desc: "Užstatas grąžinamas visas, kai drabužis grąžinamas geros būklės." },
      { num: "03", titulo: "Begalinė spinta", desc: "Nuomokite kiek tik norite. Be apribojimų, be kaupimo, be kaltės." },
      { num: "04", titulo: "Profesionalus valymas", desc: "Kiekvienas drabužis išvalomas ir patikrinamas prieš pristatant." },
    ]},
    instagram: { label: "Įkvėpkitės", titulo: "Sekite mus Instagram", sub: "Žiūrėkite, kaip mūsų klientės dėvi drabužius.", btn: "Žiūrėti @noragrei" },
    lojasSec: { label: "Marketplace", titulo: "Išskirtinės parduotuvės.", sub: "Kuratorės, dalinančios savo drabužius Nora Grei platformoje.", verTodas: "Žiūrėti visas parduotuves", verLoja: "Žiūrėti parduotuvę" },
  },
};

// ── Tour animado "Como funciona" ─────────────────────────────────────────────
const TOUR_SLIDES = [
  {
    id: "escolhe",
    cor: "#c4748a",
    iconePhone: (
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        <div style={{background:"#1a0a10",borderRadius:"6px",overflow:"hidden",height:"90px",position:"relative"}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.7),transparent)",display:"flex",alignItems:"flex-end",padding:"0.5rem"}}>
            <span style={{color:"#fff",fontFamily:"Georgia,serif",fontSize:"0.65rem",fontStyle:"italic"}}>Vestido Seda Noite</span>
          </div>
          <div style={{position:"absolute",top:"0.4rem",right:"0.4rem",background:"#c4748a",color:"#fff",fontSize:"0.45rem",padding:"0.1rem 0.3rem",letterSpacing:"0.1em",textTransform:"uppercase"}}>35€/dia</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.35rem"}}>
          {["08 Jun","09 Jun","10 Jun","11 Jun"].map((d,i) => (
            <div key={i} style={{background:i===1?"#c4748a":"#f0eeeb",borderRadius:"3px",padding:"0.25rem",textAlign:"center",fontSize:"0.5rem",color:i===1?"#fff":"#5a5855",fontFamily:"'Jost',sans-serif"}}>
              {d}
            </div>
          ))}
        </div>
        <div style={{background:"#080808",borderRadius:"3px",padding:"0.45rem",textAlign:"center",fontSize:"0.55rem",color:"#fff",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>
          Reservar →
        </div>
      </div>
    ),
  },
  {
    id: "recebe",
    cor: "#89c4e1",
    iconePhone: (
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",alignItems:"center"}}>
        <div style={{width:"52px",height:"52px",borderRadius:"50%",background:"linear-gradient(135deg,#e8f4f9,#c5e8f5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem"}}>📦</div>
        <div style={{width:"100%",background:"#f0eeeb",borderRadius:"4px",padding:"0.5rem 0.6rem"}}>
          <div style={{fontSize:"0.48rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#5a5855",fontFamily:"'Jost',sans-serif",marginBottom:"0.3rem"}}>Estado do envio</div>
          {["Encomenda confirmada","A caminho de ti","Entregue ✓"].map((s,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.2rem 0"}}>
              <div style={{width:"5px",height:"5px",borderRadius:"50%",background:i===2?"#27ae60":i===1?"#89c4e1":"#d5d2ca",flexShrink:0}} />
              <span style={{fontSize:"0.48rem",color:i===2?"#27ae60":i===1?"#080808":"#aaa",fontFamily:"'Jost',sans-serif",fontWeight:i===2?600:400}}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{fontSize:"0.5rem",color:"#5a5855",fontFamily:"'Jost',sans-serif",textAlign:"center"}}>Entrega em 48h • Higienizada ✓</div>
      </div>
    ),
  },
  {
    id: "usa",
    cor: "#c4a882",
    iconePhone: (
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        <div style={{background:"linear-gradient(135deg,#f5ede0,#e8d4b8)",borderRadius:"6px",height:"80px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem"}}>✨</div>
        <div style={{display:"flex",gap:"0.4rem"}}>
          {[1,2,3].map(i => (
            <div key={i} style={{flex:1,background:i===2?"#c4a882":"#f0eeeb",borderRadius:"3px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:i===2?"0.8rem":"0.6rem"}}>
              {i===2?"❤️":"📸"}
            </div>
          ))}
        </div>
        <div style={{fontSize:"0.48rem",color:"#5a5855",fontFamily:"'Jost',sans-serif",textAlign:"center",lineHeight:1.4}}>Usa, fotografa, partilha.<br/>O guarda-roupa que se renova.</div>
      </div>
    ),
  },
  {
    id: "devolve",
    cor: "#27ae60",
    iconePhone: (
      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",alignItems:"center"}}>
        <div style={{width:"100%",background:"#f0f9f4",border:"1.5px solid #27ae60",borderRadius:"4px",padding:"0.55rem 0.6rem"}}>
          <div style={{fontSize:"0.48rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#27ae60",fontFamily:"'Jost',sans-serif",fontWeight:600,marginBottom:"0.3rem"}}>Caução devolvida</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:"1.2rem",fontWeight:300,color:"#27ae60"}}>+ 85,00 €</div>
          <div style={{fontSize:"0.45rem",color:"#5a9a6e",fontFamily:"'Jost',sans-serif",marginTop:"0.15rem"}}>Crédito no cartão em 3–5 dias úteis</div>
        </div>
        <div style={{display:"flex",gap:"0.4rem",width:"100%"}}>
          <div style={{flex:1,background:"#f0eeeb",borderRadius:"3px",padding:"0.3rem",textAlign:"center"}}>
            <div style={{fontSize:"0.7rem"}}>↺</div>
            <div style={{fontSize:"0.42rem",color:"#5a5855",fontFamily:"'Jost',sans-serif",marginTop:"0.1rem"}}>Nova peça?</div>
          </div>
          <div style={{flex:1,background:"#080808",borderRadius:"3px",padding:"0.3rem",textAlign:"center",cursor:"pointer"}}>
            <div style={{fontSize:"0.7rem",color:"#fff"}}>✦</div>
            <div style={{fontSize:"0.42rem",color:"rgba(255,255,255,0.7)",fontFamily:"'Jost',sans-serif",marginTop:"0.1rem"}}>Ver colecção</div>
          </div>
        </div>
      </div>
    ),
  },
];

function TourAnimado({ lang, passos, dark=false }) {
  const [slide, setSlide] = useState(0);
  const [animDir, setAnimDir] = useState(1); // 1=forward, -1=back
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);
  const total = TOUR_SLIDES.length;

  const ir = (idx, dir) => {
    if (animating || idx === slide) return;
    setAnimDir(dir);
    setAnimating(true);
    setTimeout(() => { setSlide(idx); setAnimating(false); }, 280);
  };
  const seguinte = () => ir((slide + 1) % total, 1);
  const anterior = () => ir((slide - 1 + total) % total, -1);

  useEffect(() => {
    timerRef.current = setTimeout(seguinte, 3200);
    return () => clearTimeout(timerRef.current);
  }, [slide]);

  const s = TOUR_SLIDES[slide];
  const p = passos[slide];

  return (
    <div style={{marginTop:"1.5rem"}}>
      {/* Phone mockup + conteúdo */}
      <div style={{display:"flex",flexDirection:"column",gap:"1.5rem",alignItems:"center"}}>

        {/* Phone */}
        <div style={{
          width:"160px",height:"280px",
          background:"#080808",borderRadius:"24px",
          padding:"10px",position:"relative",
          boxShadow:"0 20px 60px rgba(0,0,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.06)",
          flexShrink:0,
        }}>
          {/* notch */}
          <div style={{position:"absolute",top:"10px",left:"50%",transform:"translateX(-50%)",width:"40px",height:"5px",background:"#1a1816",borderRadius:"3px",zIndex:2}} />
          {/* ecrã */}
          <div style={{
            width:"100%",height:"100%",borderRadius:"16px",
            background:"#f8f7f5",overflow:"hidden",
            display:"flex",flexDirection:"column",
            opacity: animating ? 0 : 1,
            transform: animating ? `translateX(${animDir * 12}px)` : "translateX(0)",
            transition:"opacity 0.25s ease, transform 0.25s ease",
          }}>
            {/* barra topo */}
            <div style={{background:s.cor,padding:"0.55rem 0.7rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:"0.6rem",fontWeight:300,letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(255,255,255,0.9)"}}>Nora Grei</span>
              <span style={{background:"rgba(255,255,255,0.2)",color:"#fff",fontSize:"0.45rem",padding:"0.1rem 0.3rem",borderRadius:"2px",letterSpacing:"0.08em"}}>0{slide+1}/04</span>
            </div>
            {/* conteúdo */}
            <div style={{flex:1,padding:"0.7rem 0.65rem",display:"flex",flexDirection:"column",justifyContent:"center"}}>
              {s.iconePhone}
            </div>
          </div>
          {/* botão home */}
          <div style={{position:"absolute",bottom:"4px",left:"50%",transform:"translateX(-50%)",width:"30px",height:"3px",background:"rgba(255,255,255,0.15)",borderRadius:"2px"}} />
        </div>

        {/* Texto do passo */}
        <div style={{
          width:"100%",maxWidth:"360px",
          opacity: animating ? 0 : 1,
          transform: animating ? `translateY(6px)` : "translateY(0)",
          transition:"opacity 0.25s ease, transform 0.25s ease",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.6rem"}}>
            <div style={{width:"32px",height:"32px",background:s.cor,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:"0.85rem",fontWeight:300,color:"#fff"}}>{p.num}</span>
            </div>
            <h3 style={{fontFamily:"Georgia,serif",fontSize:"1.25rem",fontWeight:400,color:dark?"rgba(255,255,255,0.95)":"#080808",margin:0}}>{p.titulo}</h3>
          </div>
          <p style={{fontSize:"0.85rem",color:dark?"rgba(255,255,255,0.6)":"#5a5855",lineHeight:1.65,margin:0}}>{p.desc}</p>
        </div>
      </div>

      {/* Navegação */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"1.25rem",marginTop:"1.75rem"}}>
        <button onClick={anterior} style={{background:"none",border:`1px solid ${dark?"rgba(255,255,255,0.2)":"#d5d2ca"}`,color:dark?"rgba(255,255,255,0.7)":"#5a5855",width:"36px",height:"36px",cursor:"pointer",fontSize:"0.9rem",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}} aria-label="Anterior">←</button>
        <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
          {TOUR_SLIDES.map((_,i) => (
            <button key={i} onClick={() => ir(i, i > slide ? 1 : -1)} style={{width: i===slide ? "20px" : "6px",height:"6px",borderRadius:"3px",background:i===slide ? TOUR_SLIDES[i].cor : (dark?"rgba(255,255,255,0.2)":"#d5d2ca"),border:"none",cursor:"pointer",padding:0,transition:"all 0.35s ease"}} aria-label={`Passo ${i+1}`} />
          ))}
        </div>
        <button onClick={seguinte} style={{background:"none",border:`1px solid ${dark?"rgba(255,255,255,0.2)":"#d5d2ca"}`,color:dark?"rgba(255,255,255,0.7)":"#5a5855",width:"36px",height:"36px",cursor:"pointer",fontSize:"0.9rem",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}} aria-label="Seguinte">→</button>
      </div>

      {/* CTA abaixo do tour */}
      <div style={{textAlign:"center",marginTop:"1.75rem",padding:"0 1.5rem"}}>
        <a href="/catalogo" style={{fontSize:"0.72rem",letterSpacing:"0.18em",textTransform:"uppercase",background:dark?"#fff":"#c4748a",color:dark?"#c4748a":"#fff",padding:"0.85rem 2rem",textDecoration:"none",fontFamily:"'Jost',sans-serif",fontWeight:500,display:"inline-block",transition:"all 0.2s"}}>
          Explorar colecção →
        </a>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

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
  const [numerosReais, setNumerosReais] = useState(null);
  const [lojas, setLojas] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && T[saved]) setLang(saved); else setLang("pt");
    supabase.auth.getSession().then(({ data }) => { if (data.session) setUserLogado(true); });
    carregarCampanha();
    carregarConteudo();
    carregarNumeros();

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
      else { setPwaBanner(false); }
    } else {
      // prompt não disponível — mostrar instruções manuais
      setPwaBanner("ios");
    }
  };
  const dispensarPwa = () => { setPwaBanner(false); localStorage.setItem("ng_pwa_dismiss","1"); };

  const carregarNumeros = async () => {
    const [
      { count: totalAlugueres },
      { count: totalPecas },
      { data: avaliacoes },
      { count: totalLojistas },
    ] = await Promise.all([
      supabase.from("alugueres").select("*", { count: "exact", head: true }).in("estado", ["concluido","devolvido"]),
      supabase.from("pecas").select("*", { count: "exact", head: true }),
      supabase.from("avaliacoes").select("classificacao"),
      supabase.from("clientes").select("*", { count: "exact", head: true }).eq("modo_lojista", true),
    ]);
    const media = avaliacoes && avaliacoes.length > 0
      ? (avaliacoes.reduce((s, a) => s + (a.classificacao || 5), 0) / avaliacoes.length).toFixed(1)
      : "5.0";
    setNumerosReais({
      alugueres: totalAlugueres || 0,
      pecas: totalPecas || 0,
      avaliacao: media,
      lojistas: totalLojistas || 0,
    });
  };

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

    const { data: lojasData } = await supabase.from("clientes").select("id, nome, codigo_cliente, cidade, pais, foto_perfil, descricao").eq("modo_lojista", true).limit(6);
    if (lojasData) setLojas(lojasData);

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
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem max(1.5rem,env(safe-area-inset-left,0px));padding-top:max(1.25rem,env(safe-area-inset-top));transition:background 0.4s,border-color 0.4s,box-shadow 0.4s,padding 0.3s;background:linear-gradient(to bottom,rgba(8,8,8,0.6) 0%,transparent 100%);border-bottom:1px solid transparent}
        .nav.scrolled{background:rgba(248,247,245,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--g2);box-shadow:0 2px 20px rgba(0,0,0,0.06);padding:0.85rem max(1.5rem,env(safe-area-inset-left,0px))}
        .logo{display:flex;flex-direction:column;text-decoration:none;color:#fff;transition:color 0.4s}
        .nav.scrolled .logo{color:var(--black)}
        .logo-name{font-family:var(--serif);font-size:1.35rem;font-weight:400;letter-spacing:0.25em;text-transform:uppercase;line-height:1}
        .logo-tag{font-size:0.65rem;letter-spacing:0.35em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-top:0.15rem;transition:color 0.4s}
        .nav.scrolled .logo-tag{color:var(--g4)}
        .nav-links{display:flex;align-items:center;gap:2.5rem;list-style:none}
        .nav-links a{font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.65);text-decoration:none;transition:color 0.2s}
        .nav-links a:hover{color:#fff}
        .nav.scrolled .nav-links a{color:var(--g4)}
        .nav.scrolled .nav-links a:hover{color:var(--black)}
        .nav-right{display:flex;align-items:center;gap:0.75rem}
        .nav-lang{display:flex;gap:0.3rem;align-items:center}
        .lang-btn{font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.55);background:none;border:none;cursor:pointer;font-family:var(--sans);padding:0;transition:color 0.2s}
        .lang-btn.on{color:#fff;font-weight:500}
        .lang-sep{color:rgba(255,255,255,0.2);font-size:0.65rem}
        .nav.scrolled .lang-btn{color:var(--g4)}
        .nav.scrolled .lang-btn.on{color:var(--black)}
        .nav.scrolled .lang-sep{color:var(--g2)}
        .nb{font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;padding:0.6rem 1.1rem;text-decoration:none;font-family:var(--sans);transition:all 0.2s;white-space:nowrap}
        .nb-o{color:rgba(255,255,255,0.75);border:1px solid rgba(255,255,255,0.3)}
        .nb-o:hover{color:#fff;border-color:#fff}
        .nav.scrolled .nb-o{color:var(--black);border-color:var(--g2)}
        .nav.scrolled .nb-o:hover{border-color:var(--black)}
        .nb-f{background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.35);backdrop-filter:blur(4px)}
        .nb-f:hover{background:rgba(255,255,255,0.25)}
        .nav.scrolled .nb-f{background:var(--black);color:var(--white);border-color:var(--black)}
        .nav.scrolled .nb-f:hover{background:#2a2926}
        /* ícones nav (lupa/cesto) */
        .nav-right svg{color:rgba(255,255,255,0.75);transition:color 0.4s}
        .nav-right a:hover svg{color:#fff}
        .nav.scrolled .nav-right svg{color:var(--black)}

        /* HERO */
        .hero{min-height:100svh;position:relative;display:flex;flex-direction:column;overflow:hidden;background:var(--black)}
        .hero-bg{position:absolute;inset:0;z-index:0}
        .hero-bg img{width:100%;height:100%;object-fit:cover;object-position:var(--hero-pos,center 20%);filter:brightness(0.52);transition:opacity 1s ease;opacity:0}
        .hero-bg img.visivel{opacity:1}
        .hero-bg video{width:100%;height:100%;object-fit:cover;object-position:center 30%}
        .hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,8,0.96) 0%,rgba(8,8,8,0.82) 30%,rgba(8,8,8,0.3) 55%,rgba(8,8,8,0.35) 100%);z-index:1}
        @media(min-width:601px){.hero-overlay{background:linear-gradient(to top,rgba(8,8,8,0.88) 0%,rgba(8,8,8,0.2) 55%,rgba(8,8,8,0.45) 100%)}}
        .hero-sound{position:absolute;bottom:1.5rem;right:max(1.5rem,env(safe-area-inset-right,0px));z-index:3;background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);color:#fff;font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;padding:0.35rem 0.7rem;cursor:pointer;font-family:var(--sans);transition:background 0.2s;border-radius:2px}
        .hero-sound:hover{background:rgba(255,255,255,0.22)}
        .hero-content{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;flex:1;padding:0 max(1.5rem,env(safe-area-inset-left,0px)) clamp(5rem,10vh,7rem);color:#fff}
        .hero-eyebrow{font-size:0.65rem;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:1rem}
        /* texto rotativo */
        .hero-rotary{font-family:var(--serif);font-weight:300;font-style:italic;font-size:clamp(2.8rem,9vw,8rem);line-height:0.95;color:var(--white);overflow:hidden;height:1.05em;margin-bottom:0.6rem}
        .hero-rotary-inner{display:flex;flex-direction:column;animation:rotaryScroll 12s cubic-bezier(0.77,0,0.18,1) infinite}
        .hero-rotary-inner span{display:block;height:1.05em;line-height:1.05}
        @keyframes rotaryScroll{0%,10%{transform:translateY(0)}12.5%,22.5%{transform:translateY(-1.05em)}25%,35%{transform:translateY(-2.1em)}37.5%,47.5%{transform:translateY(-3.15em)}50%,60%{transform:translateY(-4.2em)}62.5%,72.5%{transform:translateY(-5.25em)}75%,85%{transform:translateY(-6.3em)}87.5%,97.5%{transform:translateY(-7.35em)}100%{transform:translateY(-8.4em)}}
        .hero-titulo{font-family:var(--serif);font-size:clamp(2.4rem,8vw,5.5rem);font-weight:300;line-height:1.02;color:#fff}
        .hero-sub{font-family:var(--serif);font-size:clamp(0.95rem,1.8vw,1.3rem);font-weight:300;color:rgba(255,255,255,0.62);line-height:1.55;margin-bottom:clamp(1.75rem,4vh,3rem);max-width:50ch}
        @media(max-width:600px){
          .hero-eyebrow{margin-bottom:0.75rem}
          .hero-sub{font-size:0.9rem;max-width:36ch;margin-bottom:1.75rem}
          .hero-content{padding-bottom:max(5rem,calc(env(safe-area-inset-bottom,0px) + 4.5rem))}
        }
        /* scroll cue */
        .hero-scroll-cue{position:absolute;bottom:clamp(1.5rem,4vh,2.5rem);right:max(2rem,env(safe-area-inset-right,0px));z-index:2;display:flex;flex-direction:column;align-items:center;gap:6px}
        @media(max-width:600px){.hero-scroll-cue{display:none}}
        .hero-scroll-cue span{font-size:0.55rem;letter-spacing:0.3em;text-transform:uppercase;color:rgba(248,247,245,0.3);writing-mode:vertical-rl}
        .hero-scroll-line{width:1px;height:44px;background:rgba(248,247,245,0.1);position:relative;overflow:hidden}
        .hero-scroll-line::after{content:'';position:absolute;top:-100%;left:0;width:1px;height:100%;background:var(--gold);animation:scrollDrop 2.4s ease-in-out infinite}
        @keyframes scrollDrop{0%{top:-100%}100%{top:200%}}
        .hero-desc{font-size:0.95rem;color:rgba(255,255,255,0.75);max-width:45ch;line-height:1.8;margin-bottom:2rem}
        .hero-btns{display:flex;gap:0.75rem;flex-wrap:wrap}
        .hero-cta1{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;background:var(--white);color:var(--black);padding:0.85rem 1.75rem;text-decoration:none;font-family:var(--sans);font-weight:500;transition:background 0.2s;white-space:nowrap}
        .hero-cta1:hover{background:var(--gold);color:var(--black)}
        .hero-cta2{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.75);text-decoration:none;border:1px solid rgba(255,255,255,0.3);padding:0.85rem 1.75rem;transition:all 0.2s;white-space:nowrap}
        .hero-cta2:hover{color:#fff;border-color:#fff}

        /* STRIP */
        .strip{background:var(--rosa);padding:0.75rem 0;overflow:hidden}
        .strip-track{display:flex;white-space:nowrap;animation:marquee 25s linear infinite}
        .strip-item{font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.9);padding:0 2.5rem;flex-shrink:0}
        .strip-item::after{content:'✦';margin-left:2.5rem;color:rgba(255,255,255,0.4)}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        /* VALOR SPLIT */
        .valor-split{display:grid;grid-template-columns:1fr;background:var(--g1)}
        .valor-bloco{padding:2.5rem 1.5rem;display:flex;flex-direction:column;gap:1.25rem;border-bottom:1px solid var(--g2)}
        .valor-bloco:last-child{border-bottom:none}
        .valor-bloco-tag{font-size:0.62rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--rosa);font-family:var(--sans);font-weight:500}
        .valor-bloco-titulo{font-family:var(--serif);font-size:clamp(1.5rem,4vw,2.2rem);font-weight:300;line-height:1.15;color:var(--black)}
        .valor-bloco-titulo strong{font-weight:400}
        .valor-bloco-titulo em{font-style:italic;color:var(--g4)}
        .valor-bloco-cta{font-size:0.68rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--black);text-decoration:none;border-bottom:1px solid var(--black);padding-bottom:2px;font-family:var(--sans);align-self:flex-start;transition:opacity 0.2s}
        .valor-bloco-cta:hover{opacity:0.55}
        .valor-linha{width:100%;height:1px;background:var(--g2)}
        /* LOJISTA EDITORIAL */
        .lojista-editorial{display:grid;grid-template-columns:1fr;background:var(--black)}
        .lojista-ed-visual{background:linear-gradient(160deg,#2a1520 0%,#1a0d14 100%);padding:2.5rem 1.5rem;display:flex;flex-direction:column;justify-content:space-between;gap:1.5rem;min-height:220px}
        .lojista-ed-monogram{font-family:var(--serif);font-size:4rem;font-weight:300;color:rgba(196,168,130,0.15);letter-spacing:0.1em;line-height:1}
        .lojista-ed-nums{display:flex;gap:2rem;margin-top:auto}
        .lojista-ed-num strong{font-family:var(--serif);font-size:1.6rem;font-weight:300;color:var(--rosa);display:block;line-height:1}
        .lojista-ed-num span{font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.35);font-family:var(--sans)}
        .lojista-ed-texto{padding:2.5rem 1.5rem;display:flex;flex-direction:column;gap:1.25rem}
        .lojista-ed-label{font-size:0.62rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--rosa);font-family:var(--sans);font-weight:500}
        .lojista-ed-titulo{font-family:var(--serif);font-size:clamp(1.5rem,4vw,2.2rem);font-weight:300;color:#fff;line-height:1.2}
        .lojista-ed-sub{font-size:0.82rem;color:rgba(255,255,255,0.55);line-height:1.65;max-width:40ch}
        .lojista-ed-pilares{display:flex;flex-direction:column;gap:0.6rem;margin:0.5rem 0}
        .lojista-ed-pilar{font-size:0.72rem;letter-spacing:0.1em;color:rgba(255,255,255,0.4);display:flex;align-items:center;gap:0.6rem;font-family:var(--sans)}
        .lojista-ed-pilar::before{content:"";width:16px;height:1px;background:var(--rosa);flex-shrink:0}
        .lojista-ed-btn{font-size:0.68rem;letter-spacing:0.2em;text-transform:uppercase;background:var(--white);color:var(--black);padding:0.9rem 2rem;text-decoration:none;font-family:var(--sans);font-weight:500;align-self:flex-start;transition:background 0.2s}
        .lojista-ed-btn:hover{background:var(--gold)}
        .lojista-ed-calc{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.7rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--rosa);text-decoration:none;font-family:var(--sans);font-weight:500;align-self:flex-start;margin-top:0.75rem;padding:0.65rem 1.25rem;border:1px solid var(--rosa);transition:all 0.22s}
        .lojista-ed-calc:hover{background:var(--rosa);color:#fff}

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
        .porque{background:var(--cream);border-top:1px solid var(--g2);padding:2rem 1.5rem}
        .porque-titulo{font-family:var(--serif);font-size:clamp(1.5rem,4vw,2.4rem);font-weight:300;line-height:1.2;color:var(--ink);margin-bottom:1.5rem}
        .porque-titulo em{font-style:italic;color:var(--rosa);display:block}
        .porque-ponto{display:flex;align-items:center;gap:1rem;padding:0.65rem 0;border-bottom:1px solid var(--g2)}
        .porque-ponto:last-child{border-bottom:none}
        .porque-dot{width:6px;height:6px;border-radius:50%;background:var(--rosa);flex-shrink:0}
        .porque-text{font-family:var(--serif);font-size:1.15rem;font-weight:300;color:var(--ink)}

        /* CATEGORIAS */
        .cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px;background:var(--g2)}
        .cat-card{position:relative;overflow:hidden;aspect-ratio:3/4;text-decoration:none;display:block;background:var(--g1)}
        .cat-card img{width:100%;height:100%;object-fit:cover;object-position:center top;transition:transform 0.6s ease}
        .cat-card:hover img{transform:scale(1.06)}
        .cat-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,8,0.82) 0%,rgba(8,8,8,0.1) 55%,transparent 100%);display:flex;align-items:flex-end;padding:1.25rem}
        .cat-nome{font-family:var(--serif);font-size:1.6rem;font-weight:300;color:#fff;font-style:italic}

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
        .trust-num{font-family:var(--serif);font-size:0.7rem;letter-spacing:0.18em;color:var(--rosa);margin-bottom:0.6rem;display:block;font-weight:400}
        .trust-titulo{font-family:var(--serif);font-size:1rem;font-weight:400;margin-bottom:0.25rem}
        .trust-desc{font-size:0.78rem;color:var(--g4);line-height:1.55}

        /* PRODUTOS DESTAQUE */
        .produtos-destaque{padding:2rem 1rem;background:var(--black)}
        .produtos-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
        .produto-card{position:relative;overflow:hidden;aspect-ratio:3/4;display:block;background:var(--g1);text-decoration:none}
        .produto-card img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease}
        .produto-card:hover img{transform:scale(1.04)}
        .produto-card-nome{position:absolute;bottom:0;left:0;right:0;padding:0.5rem 0.75rem;background:linear-gradient(transparent,rgba(8,8,8,0.7));font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;color:#fff;font-family:var(--sans)}
        @media(min-width:600px){.produtos-grid{grid-template-columns:repeat(4,1fr)}}
        @media(min-width:769px){.produtos-destaque{padding:2.5rem 2rem}.produtos-grid{gap:8px}}

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

        /* LOJAS DESTAQUE */
        .lojas-sec{padding:2.5rem 1.5rem;background:var(--cream);border-top:1px solid var(--g2)}
        .lojas-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:1.75rem;gap:1rem}
        .lojas-header-left{}
        .lojas-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .loja-card{display:block;text-decoration:none;background:var(--white);border:1px solid var(--g2);padding:1.25rem 1rem;display:flex;flex-direction:column;gap:0.5rem;transition:border-color 0.2s}
        .loja-card:hover{border-color:var(--rosa)}
        .loja-avatar{width:40px;height:40px;border-radius:50%;background:var(--g1);overflow:hidden;flex-shrink:0;border:1.5px solid var(--g2)}
        .loja-avatar img{width:100%;height:100%;object-fit:cover}
        .loja-avatar-initials{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:1.1rem;font-weight:300;color:var(--rosa)}
        .loja-nome{font-family:var(--serif);font-size:1rem;font-weight:400;color:var(--ink);line-height:1.2}
        .loja-cidade{font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--g4);font-family:var(--sans)}
        .loja-cta{font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--rosa);font-family:var(--sans);margin-top:0.25rem}
        .lojas-ver-todas{font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--rosa);text-decoration:none;font-family:var(--sans);white-space:nowrap;align-self:flex-end}
        .lojas-ver-todas:hover{opacity:0.7}
        @media(min-width:600px){.lojas-grid{grid-template-columns:repeat(3,1fr)}}
        @media(min-width:769px){.lojas-sec{padding:3rem 4rem}.lojas-grid{grid-template-columns:repeat(3,1fr)}}

        /* CTA FINAL */
        /* SECÇÃO LOJISTA */
        .lojista-sec{padding:2.5rem 1.5rem;background:var(--rosa);display:flex;flex-direction:column;align-items:center;text-align:center;gap:1.25rem}
        .lojista-sec-label{font-size:0.65rem;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.65);font-weight:500}
        .lojista-sec-titulo{font-family:var(--serif);font-size:clamp(1.6rem,5vw,2.6rem);font-weight:300;color:#fff;line-height:1.2;margin:0}
        .lojista-sec-sub{font-size:0.82rem;color:rgba(255,255,255,0.75);line-height:1.6;max-width:360px;margin:0}
        .lojista-sec-btns{display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:center}
        .lojista-sec-btn-main{font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;background:#fff;color:var(--rosa);padding:0.9rem 2rem;text-decoration:none;font-family:var(--sans);font-weight:700;transition:opacity 0.2s;border:none;cursor:pointer}
        .lojista-sec-btn-main:hover{opacity:0.88}
        .lojista-sec-btn-sec{font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;background:transparent;color:rgba(255,255,255,0.8);padding:0.9rem 2rem;text-decoration:none;font-family:var(--sans);font-weight:500;border:1.5px solid rgba(255,255,255,0.4);transition:border-color 0.2s,color 0.2s}
        .lojista-sec-btn-sec:hover{border-color:#fff;color:#fff}
        @media(min-width:769px){.lojista-sec{padding:3.5rem 4rem}}

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
        .destaque-sec{padding:0;background:var(--white)}
        .destaque-header{display:flex;align-items:baseline;justify-content:space-between;padding:1.75rem 1.5rem 1.25rem}
        .destaque-label{font-size:0.6rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--rosa);font-weight:500}
        .destaque-ver{font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--g4);text-decoration:none;border-bottom:1px solid var(--g2);padding-bottom:2px;transition:color 0.2s,border-color 0.2s}
        .destaque-ver:hover{color:var(--black);border-color:var(--black)}
        .destaque-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:3px;background:var(--g2)}
        .destaque-grid .destaque-card-wrap:first-child{grid-column:1/-1}

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
        .pwa-banner-ios{font-size:0.72rem;color:rgba(255,255,255,0.7);line-height:1.5;padding:0.75rem;background:rgba(255,255,255,0.07);border-radius:4px;display:flex;flex-direction:column;gap:0.35rem}
        .pwa-ios-step{display:flex;align-items:center;gap:0.3rem;flex-wrap:wrap}
        .pwa-ios-step strong{color:#fff;font-weight:500}
        .pwa-sec{padding:3.5rem 1.5rem;background:var(--black);display:flex;flex-direction:column;align-items:center;text-align:center;gap:1.5rem}
        .pwa-sec-icon{width:56px;height:56px;border-radius:14px;background:var(--rosa);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:1.3rem;font-weight:300;letter-spacing:0.08em;color:#fff;flex-shrink:0}
        .pwa-sec-txt{}
        .pwa-sec-label{font-size:0.62rem;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.4);font-family:var(--sans);margin-bottom:0.6rem}
        .pwa-sec-titulo{font-family:var(--serif);font-size:clamp(1.6rem,4vw,2.2rem);font-weight:300;color:var(--white);margin-bottom:0.4rem}
        .pwa-sec-sub{font-size:0.85rem;color:rgba(255,255,255,0.5);line-height:1.6;max-width:38ch;margin:0 auto}
        .pwa-sec-btn{font-size:0.65rem;letter-spacing:0.22em;text-transform:uppercase;font-family:var(--sans);font-weight:500;padding:0.9rem 2.4rem;background:var(--white);color:var(--black);border:none;cursor:pointer;white-space:nowrap;transition:background 0.2s;flex-shrink:0;text-decoration:none;display:inline-block}
        .pwa-sec-btn:hover{background:var(--gold)}

        /* RESPONSIVE DESKTOP */
        @media(min-width:769px){
          .hero{min-height:100svh}
          .hero-content{padding:0 4rem clamp(4rem,9vh,7rem) !important}
          .valor-split{grid-template-columns:1fr 1fr}
          .valor-bloco{border-bottom:none;border-right:1px solid var(--g2);padding:3.5rem 4rem}
          .valor-bloco:last-child{border-right:none}
          .lojista-editorial{grid-template-columns:1fr 1fr}
          .lojista-ed-visual{min-height:320px;padding:3rem}
          .lojista-ed-texto{padding:3rem}
          .destaque-grid{grid-template-columns:repeat(4,1fr)}
          .destaque-grid .destaque-card-wrap:first-child{grid-column:1/3}
          .numeros{grid-template-columns:repeat(4,1fr)}
          .numero{padding:2rem 1.5rem}
          .numero:nth-child(even){border-right:1px solid rgba(255,255,255,0.08)}
          .sec{padding:2.5rem 4rem}
          .como-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px}
          .porque{display:grid;grid-template-columns:1fr 1fr;gap:3rem;padding:2rem 4rem;align-items:center}
          .cat-grid{grid-template-columns:repeat(2,1fr);gap:8px}
          .cat-card{aspect-ratio:3/4}
          .sustent{padding:2.5rem 4rem}
          .sustent-inner{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;margin-top:1.25rem}
          .cta-final{padding:3.5rem 4rem}
          footer{padding:3rem 4rem 2rem}
          .footer-cols{grid-template-columns:repeat(3,1fr);gap:3rem;margin-bottom:2rem}
          .footer-bottom{flex-direction:row;justify-content:space-between;align-items:center}
          .nav{padding:1.25rem 3rem}
          .cupao-banner{bottom:0;padding:1rem 3rem}
          .cupao-inner{flex-direction:row;align-items:center;justify-content:space-between}
          .cupao-actions{flex:0}
          .trust-sec{padding:2.5rem 4rem}
          .trust-grid{grid-template-columns:repeat(4,1fr)}
          .depo-sec{padding:3.5rem 4rem}
          .destaque-sec{padding:2rem 4rem 2.5rem}
          .destaque-grid{grid-template-columns:repeat(3,1fr);gap:1.25rem}
          .pwa-sec{flex-direction:row;justify-content:center;align-items:center;gap:3rem;text-align:left;padding:3rem 4rem}
          .pwa-sec-txt{text-align:left}
          .pwa-sec-sub{margin:0}
        }
        @media(min-width:1200px){
          .cat-grid{grid-template-columns:repeat(4,1fr)}
          .sec{padding:4rem 5rem}
          .nav{padding:1.25rem 4rem}
          .destaque-grid{grid-template-columns:repeat(4,1fr);gap:1.5rem}
        }
        @media(max-width:768px){
          .nav{padding:0.9rem 1.25rem}
          .nav-links,.nav-right .nb-o,.nav-right .nb-f{display:none}
          .nav-right{gap:0.5rem}
          .hero-sound{bottom:4rem}
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
            <div className="pwa-banner-ios">
              <div className="pwa-ios-step"><span>{t.pwa.iosP1}</span> <strong>{t.pwa.iosP2}</strong> <span>{t.pwa.iosP3}</span></div>
              <div className="pwa-ios-step"><span>{t.pwa.iosP4}</span> <strong>{t.pwa.iosP5}</strong></div>
              <div className="pwa-ios-step"><span>{t.pwa.iosP6}</span> <strong>{t.pwa.iosP7}</strong></div>
            </div>
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
          <li><a href="/lojas">{t.nav.lojas}</a></li>
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
          <a href="/pesquisa" style={{display:"flex",alignItems:"center",padding:"0.45rem",color:"#080808",lineHeight:1}} title="Pesquisar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </a>
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
          {t.hero.rotary && (
            <div className="hero-rotary">
              <div className="hero-rotary-inner">
                {[...t.hero.rotary, t.hero.rotary[0]].map((word, i) => (
                  <span key={i}>{word}</span>
                ))}
              </div>
            </div>
          )}
          <p className="hero-sub">{t.hero.sub}</p>
          <div className="hero-btns">
            <a href="/catalogo" className="hero-cta1">{t.hero.cta1}</a>
            <a href="#como" className="hero-cta2">{t.hero.cta2} →</a>
          </div>
        </div>
        {videoUrl && (
          <button className="hero-sound" onClick={() => {
            const videos = document.querySelectorAll(".hero-bg video");
            videos.forEach(v => { v.muted = videoComSom; });
            setVideoComSom(!videoComSom);
          }}>
            {videoComSom ? "🔊" : "🔇"}
          </button>
        )}
        <div className="hero-scroll-cue">
          <span>scroll</span>
          <div className="hero-scroll-line" />
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

      {/* VALOR SPLIT */}
      <div className="valor-split">
        <div className="valor-bloco">
          <span className="valor-bloco-tag">{lang === "fr" ? "Pour qui loue" : lang === "lt" ? "Nuomojančioms" : "Para quem aluga"}</span>
          <h2 className="valor-bloco-titulo">{lang === "fr" ? <>La pièce que vous vouliez porter<br />une fois. <em>Sans l'acheter.</em></> : lang === "lt" ? <>Drabužis, kurį norėjai nešioti<br />vieną kartą. <em>Neperkant.</em></> : <>A peça que querias usar<br />uma vez. <em>Sem a comprar.</em></>}</h2>
          <a href="/catalogo" className="valor-bloco-cta">{lang === "fr" ? "Explorer la collection →" : lang === "lt" ? "Naršyti kolekciją →" : "Explorar colecção →"}</a>
        </div>
        <div className="valor-bloco">
          <span className="valor-bloco-tag">{lang === "fr" ? "Pour qui a des pièces" : lang === "lt" ? "Turinčioms drabužių" : "Para quem tem peças"}</span>
          <h2 className="valor-bloco-titulo">{lang === "fr" ? <>Votre garde-robe a de la valeur.<br /><strong>Laissez-la travailler pour vous.</strong></> : lang === "lt" ? <>Jūsų spinta turi vertę.<br /><strong>Leiskite jai dirbti už jus.</strong></> : <>O teu armário tem valor.<br /><strong>Deixa-o trabalhar por ti.</strong></>}</h2>
          <a href="/perfil" className="valor-bloco-cta">{lang === "fr" ? "Ouvrir ma boutique →" : lang === "lt" ? "Atidaryti parduotuvę →" : "Abrir a minha loja →"}</a>
        </div>
      </div>

      {/* CATEGORIAS */}
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
                <div key={peca.id} className="destaque-card-wrap" style={{display:"flex",flexDirection:"column",background:"#f8f7f5",position:"relative",overflow:"hidden"}}>
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

      {/* COMO FUNCIONA — TOUR ANIMADO */}
      <section id="como" style={{background:"var(--rosa)",padding:"3rem 0 3.5rem"}}>
        <div style={{padding:"0 1.5rem"}}>
          <p className="sec-label" style={{color:"rgba(255,255,255,0.7)",letterSpacing:"0.22em"}}>{t.como.label}</p>
          <h2 style={{fontFamily:"var(--serif)",fontSize:"clamp(1.8rem,5vw,2.8rem)",fontWeight:300,color:"#fff",marginBottom:"2rem",lineHeight:1.2}}>{t.como.titulo}</h2>
        </div>
        <TourAnimado lang={lang} passos={t.como.passos} dark={true} />
      </section>

      {/* TRUST */}
      <section className="trust-sec">
        <p className="sec-label">{t.trust.label}</p>
        <div className="trust-grid">
          {t.trust.items.map((item, i) => (
            <div key={i} className="trust-item">
              <span className="trust-num">{item.num}</span>
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

      {/* INSTAGRAM */}
      {/* LOJAS EM DESTAQUE */}
      {lojas.length > 0 && (
        <section className="lojas-sec">
          <div className="lojas-header">
            <div className="lojas-header-left">
              <p className="sec-label">{t.lojasSec.label}</p>
              <h2 style={{fontFamily:"var(--serif)",fontSize:"clamp(1.6rem,4vw,2.4rem)",fontWeight:300,color:"var(--ink)",lineHeight:1.2,margin:0}}>{t.lojasSec.titulo}</h2>
              <p style={{fontSize:"0.78rem",color:"var(--g4)",marginTop:"0.5rem",lineHeight:1.5,maxWidth:"360px"}}>{t.lojasSec.sub}</p>
            </div>
            <a href="/lojas" className="lojas-ver-todas">{t.lojasSec.verTodas} →</a>
          </div>
          <div className="lojas-grid">
            {lojas.map(loja => {
              const initials = loja.nome ? loja.nome.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() : "NG";
              return (
                <a key={loja.id} href={`/loja/${loja.codigo_cliente}`} className="loja-card">
                  <div className="loja-avatar">
                    {loja.foto_perfil
                      ? <img src={loja.foto_perfil} alt={loja.nome} />
                      : <div className="loja-avatar-initials">{initials}</div>
                    }
                  </div>
                  <div className="loja-nome">{loja.nome}</div>
                  {loja.cidade && <div className="loja-cidade">{loja.cidade}{loja.pais ? `, ${loja.pais}` : ""}</div>}
                  <div className="loja-cta">{t.lojasSec.verLoja} →</div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="insta-sec">
        <p className="insta-label">{t.instagram.label}</p>
        <div className="insta-titulo">{t.instagram.titulo}</div>
        <p className="insta-sub">{t.instagram.sub}</p>
        <a href="https://www.instagram.com/nora_grei" target="_blank" rel="noopener noreferrer" className="insta-btn">{t.instagram.btn} ↗</a>
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

      {/* SECÇÃO LOJISTA EDITORIAL */}
      <section className="lojista-editorial">
        <div className="lojista-ed-visual">
          <div className="lojista-ed-monogram">NG</div>
          <div className="lojista-ed-nums">
            {t.lojista.pilares?.slice(0,2).map((p, i) => (
              <div key={i} className="lojista-ed-num">
                <strong>{i === 0 ? "3×" : "0€"}</strong>
                <span>{i === 0 ? (lang === "fr" ? "plus de portée" : lang === "lt" ? "daugiau pasiekiamumo" : "mais alcance") : (lang === "fr" ? "pour commencer" : lang === "lt" ? "pradžiai" : "para começar")}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lojista-ed-texto">
          <p className="lojista-ed-label">{t.lojista.label}</p>
          <h2 className="lojista-ed-titulo">{t.lojista.titulo}</h2>
          <p className="lojista-ed-sub">{t.lojista.sub}</p>
          <div className="lojista-ed-pilares">
            {t.lojista.pilares?.map((p, i) => (
              <span key={i} className="lojista-ed-pilar">{p.label}</span>
            ))}
          </div>
          <a href="/perfil" className="lojista-ed-btn">{t.lojista.btnMain}</a>
          <a href="/calculadora" className="lojista-ed-calc">{t.lojista.btnCalc}</a>
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
          <div className="pwa-sec-icon">NG</div>
          <div className="pwa-sec-txt">
            <div className="pwa-sec-label">App Nora Grei</div>
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
            <a href="https://www.instagram.com/nora_grei" target="_blank" rel="noopener noreferrer" className="footer-social-link">Instagram</a>
            <a href="https://www.noragrei.com" target="_blank" rel="noopener noreferrer" className="footer-social-link">noragrei.com</a>
          </div>
        </div>
      </footer>


    </>
  );
}
