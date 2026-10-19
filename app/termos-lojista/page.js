"use client";
import Link from "next/link";
import { useState } from "react";

export default function TermosLojista() {
  const [lingua, setLingua] = useState("pt");

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
          {["pt"].map(l => (
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
