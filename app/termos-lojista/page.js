"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function TermosLojista() {
  const [lingua, setLingua] = useState("pt");

  useEffect(() => {
    const saved = localStorage.getItem("ng_lang");
    if (saved && ["pt","fr","lt"].includes(saved)) setLingua(saved);
  }, []);

  const t = {
    pt: {
      titulo: "Termos e Condições para Lojistas",
      subtitulo: "Plataforma Nora Grei — Condições de Utilização para Parceiros",
      atualizado: "Última atualização: outubro de 2024",
      voltar: "← Voltar",
      seccoes: [
        {
          id: "intro",
          titulo: "1. O que é a Nora Grei",
          corpo: `A Nora Grei é uma plataforma digital de intermediação que facilita o aluguer e venda de peças de moda entre utilizadores particulares e lojistas independentes ("Lojistas") e clientes finais ("Clientes").

A Nora Grei não é proprietária das peças listadas na plataforma, não é parte do contrato de aluguer ou venda entre Lojista e Cliente, e não atua como revendedora, consignatária ou mandatária das peças. A nossa função é exclusivamente a de disponibilizar ferramentas tecnológicas que facilitam a descoberta, comunicação e pagamento entre as partes.`
        },
        {
          id: "lojista",
          titulo: "2. Quem pode ser Lojista",
          corpo: `Pode candidatar-se a Lojista qualquer pessoa singular ou coletiva que:

• Seja maior de 18 anos ou possua capacidade jurídica para celebrar contratos;
• Disponha de um NIF válido emitido pelas autoridades fiscais competentes;
• Seja titular de conta bancária em seu nome (IBAN/NIB);
• Aceite integralmente os presentes Termos e Condições e a Política de Privacidade da Nora Grei.

A aprovação da candidatura é discricionária e a Nora Grei reserva-se o direito de recusar ou revogar o estatuto de Lojista a qualquer momento, sem obrigação de justificação, nomeadamente em caso de violação destes Termos ou de comportamento prejudicial à comunidade.`
        },
        {
          id: "responsabilidade-lojista",
          titulo: "3. Responsabilidade do Lojista — cláusula fundamental",
          corpo: `O Lojista é o único e exclusivo responsável por:

3.1 ESTADO DAS PEÇAS
• A veracidade e exatidão das descrições, fotografias e condições das peças publicadas;
• O estado de conservação das peças no momento da entrega ao Cliente;
• A conformidade das peças com as normas de higiene, segurança e saúde aplicáveis;
• A existência de todos os direitos necessários para alugar ou vender as peças (propriedade, direitos de imagem, etc.).

3.2 OBRIGAÇÕES FISCAIS E LEGAIS
• O cumprimento de todas as obrigações fiscais decorrentes da sua atividade como Lojista, incluindo a declaração de rendimentos às autoridades competentes;
• O cumprimento das normas de proteção do consumidor aplicáveis à sua relação com os Clientes;
• A obtenção de qualquer licença, autorização ou registo exigido pela lei para o exercício da sua atividade.

3.3 RELAÇÃO COM O CLIENTE
• Eventuais litígios, reclamações ou disputas que surjam com Clientes relativos às peças, prazos, condições ou qualquer outro aspeto do aluguer ou venda;
• A resolução de conflitos com Clientes, sem prejuízo da mediação voluntária que a Nora Grei possa oferecer;
• Danos causados a Clientes decorrentes de informações falsas, peças com defeito ou incumprimento do acordado.

A NORA GREI NÃO É RESPONSÁVEL, EM NENHUMA CIRCUNSTÂNCIA, POR ATOS, OMISSÕES OU COMPORTAMENTOS DO LOJISTA, NEM POR QUAISQUER DANOS DIRETOS, INDIRETOS, INCIDENTAIS OU CONSEQUENCIAIS RESULTANTES DA RELAÇÃO ENTRE LOJISTAS E CLIENTES.`
        },
        {
          id: "plataforma",
          titulo: "4. O que a Nora Grei oferece",
          corpo: `A Nora Grei disponibiliza ao Lojista, a título oneroso e não exclusivo:

• Página de loja personalizada na plataforma;
• Sistema de publicação e gestão de peças;
• Ferramentas de comunicação com Clientes;
• Processamento de pagamentos e transferência de receitas;
• Serviço de higienização pós-aluguer (9€ por peça, deduzido automaticamente);
• Logística de recolha das peças após cada aluguer (sujeita a disponibilidade geográfica);
• Suporte por mensagem para questões técnicas da plataforma.

A Nora Grei não garante um volume mínimo de alugueres ou vendas, não assegura a disponibilidade ininterrupta da plataforma e não se responsabiliza por perdas de negócio decorrentes de interrupções técnicas.`
        },
        {
          id: "comissoes",
          titulo: "5. Comissões e pagamentos",
          corpo: `5.1 ESTRUTURA DE COMISSÕES
• A Nora Grei retém 10% do valor bruto de cada aluguer ou venda realizado através da plataforma, a título de comissão de serviço;
• É adicionalmente deduzido o custo de higienização de 9€ por peça em cada aluguer;
• O Lojista recebe os restantes 90% do valor (menos higienização), transferidos para o IBAN indicado no prazo de 7 dias úteis após confirmação de devolução da peça.

5.2 PERÍODO EXPERIMENTAL
• Os primeiros 180 dias a contar da aprovação da candidatura constituem um período experimental gratuito — a comissão de serviço de 10% não é aplicada durante este período;
• A dedução de higienização (9€/peça) mantém-se durante o período experimental;
• Findo o período experimental, a comissão de 10% é aplicada automaticamente sem necessidade de nova aceitação.

5.3 IMPOSTOS
• Os valores transferidos para o Lojista não incluem qualquer retenção fiscal — o Lojista é inteiramente responsável pela declaração e pagamento dos impostos devidos à Autoridade Tributária e Aduaneira ou equivalente no seu país de residência.`
        },
        {
          id: "pecas",
          titulo: "6. Publicação de peças",
          corpo: `O Lojista compromete-se a publicar apenas peças que:

• Sejam de sua propriedade ou sobre as quais tenha direito de dispor;
• Estejam em bom estado de conservação, limpas e higienizadas;
• Sejam descritas com rigor (marca, tamanho, condição, materiais);
• Não violem direitos de terceiros, marcas registadas ou propriedade intelectual;
• Não sejam proibidas por lei (falsificações, artigos de proteção animal, etc.).

A Nora Grei reserva-se o direito de remover, sem aviso prévio, qualquer peça que viole estas condições ou que seja reportada como problemática pela comunidade.`
        },
        {
          id: "proibicoes",
          titulo: "7. Condutas proibidas",
          corpo: `É expressamente proibido ao Lojista:

• Publicar informações falsas, enganosas ou incompletas sobre si mesmo ou sobre as peças;
• Contornar os sistemas de pagamento da Nora Grei para acordar pagamentos diretos com Clientes;
• Exercer qualquer pressão, intimidação ou assédio sobre Clientes ou outros Lojistas;
• Utilizar a plataforma para fins ilegais, incluindo lavagem de dinheiro, evasão fiscal ou venda de bens ilícitos;
• Criar múltiplas contas para contornar suspensões ou penalizações;
• Recolher dados pessoais de Clientes para fins externos à transação.

A violação de qualquer destas proibições pode resultar na suspensão imediata e permanente da conta, sem direito a reembolso de qualquer valor pendente, e pode implicar participação às autoridades competentes.`
        },
        {
          id: "danos",
          titulo: "8. Danos e litígios",
          corpo: `8.1 RESPONSABILIDADE PELOS DANOS
Em caso de dano causado por um Cliente a uma peça do Lojista:
• A Nora Grei pode mediar a comunicação entre as partes, sem caráter vinculativo;
• A Nora Grei não assume qualquer responsabilidade pelo pagamento de indemnizações ao Lojista;
• O Lojista deve acionar diretamente o Cliente e, se necessário, os mecanismos legais disponíveis.

8.2 LIMITAÇÃO DE RESPONSABILIDADE
A responsabilidade total da Nora Grei perante o Lojista, a qualquer título e por qualquer causa, nunca excederá o montante das comissões de serviço efetivamente pagas pelo Lojista nos 3 meses anteriores ao evento danoso.

8.3 RESOLUÇÃO DE LITÍGIOS
Os litígios entre Lojistas e Clientes são da exclusiva responsabilidade das partes envolvidas. Para litígios com a Nora Grei, as partes comprometem-se a tentar resolução amigável antes de recorrer a meios judiciais. Aplica-se a lei portuguesa e são competentes os tribunais da comarca de Lisboa.`
        },
        {
          id: "privacidade",
          titulo: "9. Proteção de dados",
          corpo: `Os dados pessoais do Lojista são tratados pela Nora Grei exclusivamente para fins de gestão da plataforma, processamento de pagamentos e cumprimento de obrigações legais, em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD).

O Lojista é responsável pelo tratamento dos dados pessoais dos Clientes com quem interage, devendo cumprir as obrigações do RGPD que lhe sejam aplicáveis na qualidade de responsável pelo tratamento ou subcontratante.

A Nora Grei não partilha os dados pessoais dos Lojistas com terceiros para fins comerciais, salvo obrigação legal.`
        },
        {
          id: "alteracoes",
          titulo: "10. Alterações aos Termos",
          corpo: `A Nora Grei reserva-se o direito de alterar os presentes Termos a qualquer momento. As alterações serão comunicadas ao Lojista por e-mail ou notificação na plataforma com um mínimo de 30 dias de antecedência. A continuação da utilização da plataforma após esse prazo implica a aceitação das alterações.

Em caso de desacordo com as novas condições, o Lojista pode rescindir a sua conta sem penalização, dentro do prazo de 30 dias após a notificação.`
        },
        {
          id: "rescisao",
          titulo: "11. Rescisão",
          corpo: `Qualquer das partes pode rescindir a relação de parceria a qualquer momento, com aviso prévio de 15 dias.

Em caso de violação grave destes Termos, a Nora Grei pode rescindir imediatamente e sem aviso prévio, com possibilidade de retenção de receitas pendentes se houver litígios em curso relacionados com a atividade do Lojista.

A rescisão não afeta obrigações fiscais ou legais do Lojista decorrentes de transações realizadas durante o período de parceria.`
        }
      ],
      aviso: "Ao submeter a candidatura a Lojista, confirma que leu, compreendeu e aceita integralmente estes Termos e Condições.",
      contacto: "Questões sobre estes termos: ",
      email: "parceiros@noragrei.com",
      voltar_form: "← Voltar ao formulário"
    },
    fr: {
      titulo: "Conditions Générales pour les Boutiques",
      subtitulo: "Plateforme Nora Grei — Conditions d'utilisation pour les partenaires",
      atualizado: "Dernière mise à jour : octobre 2024",
      voltar: "← Retour",
      seccoes: [
        { id: "intro", titulo: "1. Qu'est-ce que Nora Grei", corpo: `Nora Grei est une plateforme numérique d'intermédiation qui facilite la location et la vente de vêtements entre des utilisateurs particuliers et des boutiques indépendantes ("Boutiques") et des clients finaux ("Clients").\n\nNora Grei n'est pas propriétaire des articles listés sur la plateforme, n'est pas partie au contrat de location ou de vente entre la Boutique et le Client, et n'agit pas en qualité de revendeur, consignataire ou mandataire des articles. Notre rôle est exclusivement de fournir des outils technologiques facilitant la découverte, la communication et le paiement entre les parties.` },
        { id: "lojista", titulo: "2. Qui peut devenir Boutique", corpo: `Peut s'inscrire comme Boutique toute personne physique ou morale qui :\n\n• A 18 ans ou plus ou dispose de la capacité juridique pour conclure des contrats ;\n• Dispose d'un numéro fiscal valide émis par les autorités compétentes ;\n• Est titulaire d'un compte bancaire à son nom (IBAN) ;\n• Accepte intégralement les présentes Conditions et la Politique de confidentialité de Nora Grei.\n\nL'approbation de la candidature est discrétionnaire et Nora Grei se réserve le droit de refuser ou de révoquer le statut de Boutique à tout moment, sans obligation de justification.` },
        { id: "responsabilidade-lojista", titulo: "3. Responsabilité de la Boutique — clause fondamentale", corpo: `La Boutique est seule et exclusivement responsable de :\n\n3.1 ÉTAT DES ARTICLES\n• La véracité et l'exactitude des descriptions, photos et conditions des articles publiés ;\n• L'état de conservation des articles au moment de la remise au Client ;\n• La conformité des articles aux normes d'hygiène, de sécurité et de santé applicables.\n\n3.2 OBLIGATIONS FISCALES ET LÉGALES\n• Le respect de toutes les obligations fiscales découlant de son activité, y compris la déclaration de revenus aux autorités compétentes ;\n• Le respect des normes de protection des consommateurs applicables.\n\n3.3 RELATION AVEC LE CLIENT\n• Les éventuels litiges, réclamations ou différends avec les Clients relatifs aux articles, délais ou conditions de location ou de vente ;\n• Les dommages causés aux Clients résultant d'informations fausses, d'articles défectueux ou du non-respect des engagements.\n\nNORA GREI N'EST PAS RESPONSABLE, EN AUCUNE CIRCONSTANCE, DES ACTES, OMISSIONS OU COMPORTEMENTS DE LA BOUTIQUE, NI D'AUCUN DOMMAGE DIRECT, INDIRECT, ACCESSOIRE OU CONSÉCUTIF RÉSULTANT DE LA RELATION ENTRE LES BOUTIQUES ET LES CLIENTS.` },
        { id: "plataforma", titulo: "4. Ce que Nora Grei offre", corpo: `Nora Grei met à disposition de la Boutique, à titre onéreux et non exclusif :\n\n• Page de boutique personnalisée sur la plateforme ;\n• Système de publication et de gestion des articles ;\n• Outils de communication avec les Clients ;\n• Traitement des paiements et transfert des revenus ;\n• Service de nettoyage post-location (9€ par article, déduit automatiquement) ;\n• Logistique de collecte des articles après chaque location (selon disponibilité géographique) ;\n• Assistance par message pour les questions techniques de la plateforme.\n\nNora Grei ne garantit pas un volume minimum de locations ou de ventes, ne garantit pas la disponibilité ininterrompue de la plateforme et n'est pas responsable des pertes commerciales résultant d'interruptions techniques.` },
        { id: "comissoes", titulo: "5. Commissions et paiements", corpo: `5.1 STRUCTURE DES COMMISSIONS\n• Nora Grei retient 10% de la valeur brute de chaque location ou vente réalisée via la plateforme ;\n• Le coût de nettoyage de 9€ par article est également déduit à chaque location ;\n• La Boutique reçoit les 90% restants (moins nettoyage), virés sur l'IBAN indiqué dans un délai de 7 jours ouvrés après confirmation du retour.\n\n5.2 PÉRIODE D'ESSAI\n• Les 180 premiers jours suivant l'approbation constituent une période d'essai gratuite — la commission de service de 10% n'est pas appliquée pendant cette période ;\n• La déduction de nettoyage (9€/article) reste en vigueur pendant la période d'essai.\n\n5.3 IMPÔTS\n• Les montants virés à la Boutique n'incluent aucune retenue fiscale — la Boutique est entièrement responsable de la déclaration et du paiement des impôts dus.` },
        { id: "pecas", titulo: "6. Publication d'articles", corpo: `La Boutique s'engage à ne publier que des articles qui :\n\n• Lui appartiennent ou sur lesquels elle dispose du droit de les proposer ;\n• Sont en bon état, propres et hygiéniques ;\n• Sont décrits avec précision (marque, taille, état, matières) ;\n• Ne violent pas les droits de tiers, marques déposées ou propriété intellectuelle ;\n• Ne sont pas interdits par la loi (contrefaçons, articles de protection animale, etc.).\n\nNora Grei se réserve le droit de supprimer, sans préavis, tout article violant ces conditions ou signalé comme problématique.` },
        { id: "proibicoes", titulo: "7. Conduites interdites", corpo: `Il est expressément interdit à la Boutique de :\n\n• Publier des informations fausses, trompeuses ou incomplètes sur elle-même ou sur les articles ;\n• Contourner les systèmes de paiement de Nora Grei pour convenir de paiements directs avec les Clients ;\n• Exercer toute pression, intimidation ou harcèlement sur les Clients ou d'autres Boutiques ;\n• Utiliser la plateforme à des fins illégales ;\n• Créer plusieurs comptes pour contourner des suspensions ou pénalités ;\n• Collecter des données personnelles de Clients à des fins externes à la transaction.\n\nTout manquement peut entraîner la suspension immédiate et définitive du compte, sans droit au remboursement d'aucun montant en attente.` },
        { id: "danos", titulo: "8. Dommages et litiges", corpo: `8.1 RESPONSABILITÉ DES DOMMAGES\nEn cas de dommage causé par un Client à un article de la Boutique :\n• Nora Grei peut servir de médiateur entre les parties, sans caractère contraignant ;\n• Nora Grei n'assume aucune responsabilité quant au paiement d'indemnités à la Boutique.\n\n8.2 LIMITATION DE RESPONSABILITÉ\nLa responsabilité totale de Nora Grei envers la Boutique, à quelque titre que ce soit, ne dépassera jamais le montant des commissions de service effectivement payées par la Boutique au cours des 3 mois précédant l'événement dommageable.\n\n8.3 RÉSOLUTION DES LITIGES\nLes litiges entre Boutiques et Clients relèvent de la seule responsabilité des parties concernées. Pour les litiges avec Nora Grei, les parties s'engagent à tenter une résolution amiable. La loi portugaise est applicable et les tribunaux de Lisbonne sont compétents.` },
        { id: "privacidade", titulo: "9. Protection des données", corpo: `Les données personnelles de la Boutique sont traitées par Nora Grei exclusivement à des fins de gestion de la plateforme, de traitement des paiements et de respect des obligations légales, conformément au Règlement Général sur la Protection des Données (RGPD).\n\nLa Boutique est responsable du traitement des données personnelles des Clients avec lesquels elle interagit, et doit respecter les obligations du RGPD qui lui sont applicables.\n\nNora Grei ne partage pas les données personnelles des Boutiques avec des tiers à des fins commerciales, sauf obligation légale.` },
        { id: "alteracoes", titulo: "10. Modifications des Conditions", corpo: `Nora Grei se réserve le droit de modifier les présentes Conditions à tout moment. Les modifications seront communiquées à la Boutique par e-mail ou notification sur la plateforme avec un préavis minimum de 30 jours. La poursuite de l'utilisation de la plateforme après ce délai implique l'acceptation des modifications.\n\nEn cas de désaccord avec les nouvelles conditions, la Boutique peut résilier son compte sans pénalité dans les 30 jours suivant la notification.` },
        { id: "rescisao", titulo: "11. Résiliation", corpo: `L'une ou l'autre des parties peut résilier le partenariat à tout moment, avec un préavis de 15 jours.\n\nEn cas de violation grave des présentes Conditions, Nora Grei peut résilier immédiatement et sans préavis, avec possibilité de rétention des revenus en attente s'il y a des litiges en cours liés à l'activité de la Boutique.\n\nLa résiliation n'affecte pas les obligations fiscales ou légales de la Boutique découlant des transactions réalisées pendant la période de partenariat.` }
      ],
      aviso: "En soumettant votre candidature en tant que Boutique, vous confirmez avoir lu, compris et accepté intégralement ces Conditions Générales.",
      contacto: "Questions sur ces conditions : ",
      email: "parceiros@noragrei.com",
      voltar_form: "← Retour au formulaire"
    },
    lt: {
      titulo: "Parduotuvių Naudojimo Sąlygos",
      subtitulo: "Nora Grei platforma — Partnerių naudojimo sąlygos",
      atualizado: "Paskutinį kartą atnaujinta: 2024 m. spalis",
      voltar: "← Atgal",
      seccoes: [
        { id: "intro", titulo: "1. Kas yra Nora Grei", corpo: `Nora Grei yra skaitmeninė tarpininkavimo platforma, palengvinanti drabužių nuomą ir pardavimą tarp privačių naudotojų ir nepriklausomų parduotuvių („Parduotuvės") ir galutinių klientų („Klientai").\n\nNora Grei nėra platformoje išvardytų prekių savininkė, nėra šalis nuomos ar pardavimo sutartyje tarp Parduotuvės ir Kliento ir neveikia kaip perpardavėja, komisionieriė ar įgaliotinė. Mūsų vaidmuo yra išimtinai teikti technologinius įrankius, palengvinančius atradimą, komunikaciją ir mokėjimą tarp šalių.` },
        { id: "lojista", titulo: "2. Kas gali tapti Parduotuve", corpo: `Parduotuve gali tapti bet kuris fizinis ar juridinis asmuo, kuris:\n\n• Yra 18 metų ar vyresnis arba turi teisnumą sudaryti sutartis;\n• Turi galiojantį mokesčių mokėtojo identifikavimo numerį;\n• Turi banko sąskaitą savo vardu (IBAN);\n• Visapusiškai priima šias Sąlygas ir Nora Grei Privatumo politiką.\n\nKandidatūros patvirtinimas yra diskrecinis ir Nora Grei pasilieka teisę atsisakyti ar panaikinti Parduotuvės statusą bet kuriuo metu be pareigos pateikti paaiškinimą.` },
        { id: "responsabilidade-lojista", titulo: "3. Parduotuvės atsakomybė — pagrindinė sąlyga", corpo: `Parduotuvė yra vienintelė ir išimtinė atsakinga už:\n\n3.1 PREKIŲ BŪKLĘ\n• Paskelbtų prekių aprašymų, nuotraukų ir sąlygų tikslumą ir teisingumą;\n• Prekių išsaugojimo būklę jų perdavimo Klientui metu;\n• Prekių atitikimą taikomiems higienos, saugos ir sveikatos standartams.\n\n3.2 MOKESTINES IR TEISINES PRIEVOLES\n• Visų mokestinių prievolių, kylančių iš jos veiklos, vykdymą;\n• Taikytinų vartotojų apsaugos normų laikymąsi.\n\n3.3 SANTYKIAI SU KLIENTU\n• Galimus ginčus, pretenzijas ar nesutarimus su Klientais dėl prekių, terminų ar nuomos/pardavimo sąlygų;\n• Klientams padarytą žalą dėl klaidingos informacijos, defektinių prekių ar neįvykdytų įsipareigojimų.\n\nNORA GREI JOKIOMIS APLINKYBĖMIS NĖRA ATSAKINGA UŽ PARDUOTUVĖS VEIKSMUS, NEVEIKIMĄ AR ELGESĮ, NEI UŽ JOKIĄ TIESIOGINĘ, NETIESIOGINĘ AR KITOKIĄ ŽALĄ, KYLANČIĄ IŠ PARDUOTUVIŲ IR KLIENTŲ SANTYKIŲ.` },
        { id: "plataforma", titulo: "4. Ką siūlo Nora Grei", corpo: `Nora Grei Parduotuvei teikia, mokamu ir neišimtiniu pagrindu:\n\n• Asmeninį parduotuvės puslapį platformoje;\n• Prekių skelbimo ir valdymo sistemą;\n• Komunikacijos su Klientais įrankius;\n• Mokėjimų apdorojimą ir pajamų pervedimą;\n• Valymo paslaugą po nuomos (9€ už prekę, automatiškai išskaičiuojama);\n• Prekių paėmimo logistiką po kiekvienos nuomos (pagal geografinį prieinamumą);\n• Palaikymą žinutėmis techniniams platformos klausimams.\n\nNora Grei negarantuoja minimalaus nuomų ar pardavimų kiekio, negarantuoja pertraukiamo platformos prieinamumo ir nėra atsakinga už verslo nuostolius dėl techninių sutrikimų.` },
        { id: "comissoes", titulo: "5. Komisiniai ir mokėjimai", corpo: `5.1 KOMISINIŲ STRUKTŪRA\n• Nora Grei pasilieka 10% kiekvienos nuomos ar pardavimo bruto vertės kaip paslaugų komisinį;\n• Papildomai išskaičiuojamos 9€ valymo išlaidos už kiekvieną nuomojamą prekę;\n• Parduotuvė gauna likusius 90% (atėmus valymą), pervestus į nurodytą IBAN per 7 darbo dienas po prekės grąžinimo patvirtinimo.\n\n5.2 BANDOMASIS LAIKOTARPIS\n• Pirmosios 180 dienų nuo kandidatūros patvirtinimo sudaro nemokamą bandomąjį laikotarpį — 10% paslaugų komisinis šiuo laikotarpiu netaikomas;\n• Valymo atskaitymas (9€/prekė) išlieka bandomojo laikotarpio metu.\n\n5.3 MOKESČIAI\n• Parduotuvei pervesti sumai netaikomas joks mokesčių išskaičiavimas — Parduotuvė yra visapusiškai atsakinga už mokesčių deklaravimą ir mokėjimą.` },
        { id: "pecas", titulo: "6. Prekių skelbimas", corpo: `Parduotuvė įsipareigoja skelbti tik prekes, kurios:\n\n• Priklauso jai arba dėl kurių ji turi teisę disponuoti;\n• Yra geros būklės, švarios ir higieninės;\n• Tiksliai aprašytos (prekės ženklas, dydis, būklė, medžiagos);\n• Nepažeidžia trečiųjų šalių teisių, registruotų prekių ženklų ar intelektinės nuosavybės;\n• Nėra draudžiamos įstatymu (klastotės, gyvūnų apsaugos prekės ir kt.).\n\nNora Grei pasilieka teisę be išankstinio įspėjimo pašalinti bet kurią prekę, pažeidžiančią šias sąlygas.` },
        { id: "proibicoes", titulo: "7. Draudžiamas elgesys", corpo: `Parduotuvei yra griežtai draudžiama:\n\n• Skelbti klaidingą, klaidinančią ar neišsamią informaciją apie save ar prekes;\n• Apeiti Nora Grei mokėjimo sistemas, susitariant dėl tiesioginių mokėjimų su Klientais;\n• Daryti spaudimą, bauginti ar priekabiauti prie Klientų ar kitų Parduotuvių;\n• Naudoti platformą neteisėtiems tikslams;\n• Kurti kelias paskyras, siekiant apeiti sustabdymus ar sankcijas;\n• Rinkti Klientų asmens duomenis ne sandoriui skirtais tikslais.\n\nBet koks pažeidimas gali lemti neatidėliotiną ir nuolatinį paskyros sustabdymą be teisės į laukiančių sumų grąžinimą.` },
        { id: "danos", titulo: "8. Žala ir ginčai", corpo: `8.1 ATSAKOMYBĖ UŽ ŽALĄ\nJei Klientas padaro žalą Parduotuvės prekei:\n• Nora Grei gali tarpininkauti komunikacijoje tarp šalių, be privalomojo pobūdžio;\n• Nora Grei neprisiima jokios atsakomybės už žalos atlyginimo mokėjimą Parduotuvei.\n\n8.2 ATSAKOMYBĖS RIBOJIMAS\nBendra Nora Grei atsakomybė Parduotuvei, bet kokiu pagrindu ir bet kokia priežastimi, niekada neviršys paslaugų komisinių sumų, faktiškai sumokėtų per 3 mėnesius iki žalingo įvykio.\n\n8.3 GINČŲ SPRENDIMAS\nGinčai tarp Parduotuvių ir Klientų yra išimtinė susijusių šalių atsakomybė. Ginčams su Nora Grei šalys įsipareigoja bandyti draugišką sprendimą. Taikoma Portugalijos teisė, kompetentingi Lisabonos teismai.` },
        { id: "privacidade", titulo: "9. Duomenų apsauga", corpo: `Parduotuvės asmens duomenis Nora Grei tvarko išimtinai platformos valdymo, mokėjimų apdorojimo ir teisinių prievolių vykdymo tikslais, laikydamasi Bendrojo duomenų apsaugos reglamento (BDAR).\n\nParduotuvė yra atsakinga už savo sąveikaujančių Klientų asmens duomenų tvarkymą ir turi laikytis taikytinų BDAR prievolių.\n\nNora Grei neteikia Parduotuvių asmens duomenų trečiosioms šalims komerciniais tikslais, išskyrus teisines prievoles.` },
        { id: "alteracoes", titulo: "10. Sąlygų keitimai", corpo: `Nora Grei pasilieka teisę bet kuriuo metu keisti šias Sąlygas. Apie pakeitimus Parduotuvė bus informuota el. paštu arba platformos pranešimu likus ne mažiau kaip 30 dienų. Tolesniam platformos naudojimui pasibaigus šiam terminui reiškia pakeitimų priėmimą.\n\nJei nesutinkate su naujomis sąlygomis, Parduotuvė gali nutraukti savo paskyrą be baudos per 30 dienų nuo pranešimo.` },
        { id: "rescisao", titulo: "11. Nutraukimas", corpo: `Bet kuri šalis gali nutraukti partnerystę bet kuriuo metu, pateikdama 15 dienų išankstinį pranešimą.\n\nEsant šiurkščiam šių Sąlygų pažeidimui, Nora Grei gali nutraukti sutartį nedelsiant ir be išankstinio įspėjimo, su galimybe sulaikyti laukiančias pajamas, jei vyksta ginčai, susiję su Parduotuvės veikla.\n\nNutraukimas neįtakoja Parduotuvės mokestinių ar teisinių prievolių, kylančių iš sandorių, sudarytų partnerystės laikotarpiu.` }
      ],
      aviso: "Pateikdami kandidatūrą kaip Parduotuvė, patvirtinate, kad perskaitėte, supratote ir visapusiškai sutinkate su šiomis Sąlygomis.",
      contacto: "Klausimai dėl šių sąlygų: ",
      email: "parceiros@noragrei.com",
      voltar_form: "← Grįžti į formą"
    }
  };

  const conteudo = t[lingua] || t.pt;

  return (
    <div style={{minHeight:"100vh",background:"#f8f6f3",fontFamily:"'Jost',Georgia,serif"}}>
      {/* Header */}
      <div style={{background:"#0a0a0a",padding:"1.25rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Link href="/" style={{color:"#c4748a",fontSize:"0.72rem",letterSpacing:"0.18em",textTransform:"uppercase",textDecoration:"none",fontWeight:500}}>
          NORA GREI
        </Link>
        <div style={{display:"flex",gap:"0.5rem"}}>
          {["pt","fr","lt"].map(l => (
            <button key={l} onClick={() => setLingua(l)} style={{background:"none",border:"none",color: lingua===l ? "#c4748a" : "#888",fontSize:"0.68rem",letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",padding:"0.25rem 0.5rem",borderBottom: lingua===l ? "1px solid #c4748a" : "1px solid transparent"}}>
              {l === "pt" ? "PT" : l === "fr" ? "FR" : "LT"}
            </button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div style={{background:"#0a0a0a",padding:"3rem 1.5rem 2.5rem",borderBottom:"3px solid #c4748a"}}>
        <div style={{maxWidth:"720px",margin:"0 auto"}}>
          <div style={{fontSize:"0.65rem",letterSpacing:"0.25em",textTransform:"uppercase",color:"#c4748a",marginBottom:"0.75rem",fontWeight:600}}>Documento Legal</div>
          <h1 style={{color:"#fff",fontSize:"clamp(1.4rem,4vw,2rem)",fontWeight:300,letterSpacing:"0.04em",margin:"0 0 0.75rem",lineHeight:1.3}}>{conteudo.titulo}</h1>
          <p style={{color:"#888",fontSize:"0.82rem",margin:"0 0 0.5rem",lineHeight:1.6}}>{conteudo.subtitulo}</p>
          <p style={{color:"#555",fontSize:"0.72rem",margin:0,letterSpacing:"0.04em"}}>{conteudo.atualizado}</p>
        </div>
      </div>

      {/* Aviso de isenção de responsabilidade — destaque */}
      <div style={{background:"#fff8f0",borderLeft:"4px solid #c4a882",padding:"1.25rem 1.5rem",margin:"0"}}>
        <div style={{maxWidth:"720px",margin:"0 auto",display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
          <span style={{fontSize:"1.1rem",flexShrink:0}}>⚖️</span>
          <div>
            <div style={{fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#c4a882",fontWeight:700,marginBottom:"0.35rem"}}>Aviso importante</div>
            <p style={{fontSize:"0.82rem",color:"#5a4a3a",lineHeight:1.7,margin:0}}>
              A Nora Grei é uma <strong>plataforma de intermediação tecnológica</strong>. Não somos proprietários das peças, não somos parte dos contratos de aluguer ou venda, e não assumimos responsabilidade pelos atos, omissões ou comportamentos dos Lojistas ou Clientes. Cada Lojista gere o seu próprio negócio e é inteiramente responsável pelo cumprimento das obrigações legais, fiscais e contratuais aplicáveis.
            </p>
          </div>
        </div>
      </div>

      {/* Índice */}
      <div style={{background:"#fff",borderBottom:"1px solid #e8e3dc",padding:"1.5rem",overflowX:"auto"}}>
        <div style={{maxWidth:"720px",margin:"0 auto"}}>
          <div style={{fontSize:"0.65rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#999",marginBottom:"0.75rem",fontWeight:600}}>Índice</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
            {conteudo.seccoes.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{fontSize:"0.72rem",color:"#5a5855",textDecoration:"none",padding:"0.3rem 0.6rem",border:"1px solid #e2dfda",background:"#f8f6f3",whiteSpace:"nowrap"}}>
                {s.titulo.split(". ").slice(1).join(". ") || s.titulo}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{maxWidth:"720px",margin:"0 auto",padding:"2rem 1.5rem 4rem"}}>
        {conteudo.seccoes.map((s, i) => (
          <div key={s.id} id={s.id} style={{marginBottom:"2.5rem",paddingBottom:"2.5rem",borderBottom: i < conteudo.seccoes.length - 1 ? "1px solid #e2dfda" : "none"}}>
            <h2 style={{fontSize:"1rem",fontWeight:600,letterSpacing:"0.04em",color:"#0a0a0a",margin:"0 0 1rem",lineHeight:1.4}}>
              {s.titulo}
            </h2>
            <div style={{fontSize:"0.88rem",color:"#3a3633",lineHeight:1.85,whiteSpace:"pre-wrap"}}>
              {s.corpo}
            </div>
          </div>
        ))}

        {/* Aviso final */}
        <div style={{background:"#0a0a0a",padding:"1.5rem",marginBottom:"2rem"}}>
          <p style={{color:"#e2dfda",fontSize:"0.82rem",lineHeight:1.7,margin:0,fontStyle:"italic"}}>
            {conteudo.aviso}
          </p>
        </div>

        {/* Contacto */}
        <div style={{padding:"1.25rem",border:"1px solid #e2dfda",background:"#fff",display:"flex",flexDirection:"column",gap:"0.35rem"}}>
          <div style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#999",fontWeight:600}}>Contacto</div>
          <p style={{fontSize:"0.85rem",color:"#5a5855",margin:0}}>
            {conteudo.contacto}<a href="mailto:parceiros@noragrei.com" style={{color:"#0a0a0a",fontWeight:500,textDecoration:"underline"}}>{conteudo.email}</a>
          </p>
        </div>

        {/* Botão voltar */}
        <div style={{marginTop:"2rem",textAlign:"center"}}>
          <Link href="/perfil" style={{display:"inline-block",padding:"0.75rem 2rem",background:"#0a0a0a",color:"#fff",fontSize:"0.72rem",letterSpacing:"0.15em",textTransform:"uppercase",textDecoration:"none",fontWeight:500}}>
            ← Voltar ao perfil
          </Link>
        </div>
      </div>
    </div>
  );
}
