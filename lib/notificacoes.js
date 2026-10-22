/**
 * lib/notificacoes.js
 * Utilitária central de notificações Nora Grei.
 *
 * Uso (server-side, dentro de API routes ou crons):
 *   import { enviarNotificacao } from "@/lib/notificacoes";
 *   await enviarNotificacao({ tipo: "reserva_disponivel", cliente_id: "...", dados: { nome_peca: "..." } });
 *
 * Canais actuais:
 *   - bell interna  → insere em `notificacoes_cliente`
 *   - WhatsApp      → chama /api/notificacoes/whatsapp (stub; liga à Meta/Twilio/Brevo quando provider escolhido)
 *
 * Adicionar provider: edita apenas lib/whatsapp-provider.js (ainda não existe até provider escolhido).
 */

import { createClient } from "@supabase/supabase-js";

const sbAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

// ─── Templates por tipo ───────────────────────────────────────────────────────
// Cada template devolve { titulo, mensagem } para o bell interno,
// e { corpo } para WhatsApp (texto simples, max ~1000 chars).

const TEMPLATES = {
  reserva_disponivel: ({ nome_peca, expira_em }) => ({
    titulo: { pt: "Peça disponível!", fr: "Pièce disponible !", lt: "Daiktas prieinamas!" },
    mensagem: {
      pt: `A tua peça "${nome_peca}" está pronta. Confirma até ${expira_em}.`,
      fr: `Votre pièce "${nome_peca}" est disponible. Confirmez avant ${expira_em}.`,
      lt: `Jūsų daiktas "${nome_peca}" yra prieinamas. Patvirtinkite iki ${expira_em}.`,
    },
    whatsapp: {
      pt: `🌸 *Nora Grei* — A tua peça *${nome_peca}* está disponível! Confirma o aluguer até ${expira_em} em noragrei.com`,
      fr: `🌸 *Nora Grei* — Votre pièce *${nome_peca}* est disponible ! Confirmez avant ${expira_em} sur noragrei.com`,
      lt: `🌸 *Nora Grei* — Jūsų daiktas *${nome_peca}* yra prieinamas! Patvirtinkite iki ${expira_em} noragrei.com`,
    },
  }),

  campanha_nova: ({ nome_campanha }) => ({
    titulo: { pt: "Campanha exclusiva", fr: "Campagne exclusive", lt: "Išskirtinė kampanija" },
    mensagem: {
      pt: `Nova campanha disponível: ${nome_campanha}.`,
      fr: `Nouvelle campagne disponible : ${nome_campanha}.`,
      lt: `Nauja kampanija: ${nome_campanha}.`,
    },
    whatsapp: {
      pt: `✨ *Nora Grei* — Nova campanha exclusiva: *${nome_campanha}*. Descobre em noragrei.com`,
      fr: `✨ *Nora Grei* — Nouvelle campagne exclusive : *${nome_campanha}*. Découvre sur noragrei.com`,
      lt: `✨ *Nora Grei* — Nauja išskirtinė kampanija: *${nome_campanha}*. Atrask noragrei.com`,
    },
  }),

  atraso_devolucao: ({ nome_peca, dia_atraso, valor }) => ({
    titulo: { pt: "Atraso na devolução", fr: "Retard de retour", lt: "Vėlavimas grąžinti" },
    mensagem: {
      pt: `Dia ${dia_atraso} de atraso de "${nome_peca}". Débito de €${valor} aplicado ao teu cartão.`,
      fr: `Jour ${dia_atraso} de retard pour "${nome_peca}". Débit de ${valor}€ appliqué à votre carte.`,
      lt: `${dia_atraso} diena vėluoja "${nome_peca}". ${valor}€ nurašyta nuo jūsų kortelės.`,
    },
    whatsapp: {
      pt: `⚠️ *Nora Grei* — A peça *${nome_peca}* está em atraso (dia ${dia_atraso}). Foram debitados €${valor} do teu cartão. Devolve o mais rápido possível para evitar mais encargos.`,
      fr: `⚠️ *Nora Grei* — La pièce *${nome_peca}* est en retard (jour ${dia_atraso}). ${valor}€ ont été débités de votre carte. Retournez-la dès que possible.`,
      lt: `⚠️ *Nora Grei* — Daiktas *${nome_peca}* vėluoja (${dia_atraso} diena). ${valor}€ nurašyta. Grąžinkite kuo greičiau.`,
    },
  }),

  novo_aluguer_lojista: ({ nome_peca, nome_cliente }) => ({
    titulo: { pt: "Novo aluguer!", fr: "Nouvelle location !", lt: "Nauja nuoma!" },
    mensagem: {
      pt: `${nome_cliente} alugou "${nome_peca}". Confirma na tua área de loja.`,
      fr: `${nome_cliente} a loué "${nome_peca}". Confirmez dans votre espace boutique.`,
      lt: `${nome_cliente} išsinuomojo "${nome_peca}". Patvirtinkite parduotuvės srityje.`,
    },
    whatsapp: {
      pt: `📦 *Nora Grei* — Novo aluguer! *${nome_cliente}* quer alugar *${nome_peca}*. Confirma em noragrei.com/perfil`,
      fr: `📦 *Nora Grei* — Nouvelle location ! *${nome_cliente}* souhaite louer *${nome_peca}*. Confirmez sur noragrei.com/perfil`,
      lt: `📦 *Nora Grei* — Nauja nuoma! *${nome_cliente}* nori išsinuomoti *${nome_peca}*. Patvirtinkite noragrei.com/perfil`,
    },
  }),

  nova_venda_lojista: ({ nome_peca, nome_cliente }) => ({
    titulo: { pt: "Nova venda!", fr: "Nouvelle vente !", lt: "Nauja pardavimas!" },
    mensagem: {
      pt: `${nome_cliente} quer comprar "${nome_peca}". Confirma na tua área de loja.`,
      fr: `${nome_cliente} souhaite acheter "${nome_peca}". Confirmez dans votre espace boutique.`,
      lt: `${nome_cliente} nori pirkti "${nome_peca}". Patvirtinkite parduotuvės srityje.`,
    },
    whatsapp: {
      pt: `🛍 *Nora Grei* — Nova venda! *${nome_cliente}* quer comprar *${nome_peca}*. Confirma em noragrei.com/perfil`,
      fr: `🛍 *Nora Grei* — Nouvelle vente ! *${nome_cliente}* souhaite acheter *${nome_peca}*. Confirmez sur noragrei.com/perfil`,
      lt: `🛍 *Nora Grei* — Nauja pardavimas! *${nome_cliente}* nori pirkti *${nome_peca}*. Patvirtinkite noragrei.com/perfil`,
    },
  }),

  devolucao_a_verificar_lojista: ({ nome_peca }) => ({
    titulo: { pt: "Devolução a verificar", fr: "Retour à vérifier", lt: "Grąžinimas patikrinti" },
    mensagem: {
      pt: `"${nome_peca}" está em devolução. Verifica o estado da peça quando receberes.`,
      fr: `"${nome_peca}" est en cours de retour. Vérifiez l'état à la réception.`,
      lt: `"${nome_peca}" grąžinama. Patikrinkite būklę gavę.`,
    },
    whatsapp: {
      pt: `🔄 *Nora Grei* — A peça *${nome_peca}* está a caminho de volta. Verifica o estado quando receberes e regista em noragrei.com/perfil`,
      fr: `🔄 *Nora Grei* — La pièce *${nome_peca}* est en cours de retour. Vérifiez son état à réception sur noragrei.com/perfil`,
      lt: `🔄 *Nora Grei* — Daiktas *${nome_peca}* grąžinamas. Patikrinkite būklę noragrei.com/perfil`,
    },
  }),

  liquidacao_disponivel: ({ valor }) => ({
    titulo: { pt: "Liquidação disponível", fr: "Liquidation disponible", lt: "Likvidacija prieinama" },
    mensagem: {
      pt: `Tens €${valor} disponíveis para levantar. Vai a perfil → loja → liquidações.`,
      fr: `${valor}€ disponibles à retirer. Allez dans profil → boutique → liquidations.`,
      lt: `${valor}€ galima išsiimti. Eikite į profilį → parduotuvė → likvidacijos.`,
    },
    whatsapp: {
      pt: `💶 *Nora Grei* — Tens *€${valor}* disponíveis para levantar! Acede em noragrei.com/perfil`,
      fr: `💶 *Nora Grei* — *${valor}€* disponibles à retirer ! Accédez sur noragrei.com/perfil`,
      lt: `💶 *Nora Grei* — *${valor}€* galima išsiimti! Eikite į noragrei.com/perfil`,
    },
  }),
};

// ─── Função principal ─────────────────────────────────────────────────────────

/**
 * @param {object} opts
 * @param {string} opts.tipo            - Chave de TEMPLATES acima
 * @param {string} opts.cliente_id      - UUID do destinatário
 * @param {object} opts.dados           - Parâmetros para o template
 * @param {boolean} [opts.bell=true]    - Inserir no bell interno
 * @param {boolean} [opts.whatsapp=true]- Enviar WhatsApp
 * @param {string}  [opts.href]         - Link para o bell interno
 */
export async function enviarNotificacao({
  tipo,
  cliente_id,
  dados = {},
  bell = true,
  whatsapp = true,
  href = null,
}) {
  const sb = sbAdmin();
  const template = TEMPLATES[tipo];
  if (!template) {
    console.warn(`[notificacoes] Tipo desconhecido: ${tipo}`);
    return;
  }

  const t = template(dados);

  // 1. Buscar lang e telefone do cliente
  const { data: cliente } = await sb
    .from("clientes")
    .select("telefone, lang")
    .eq("id", cliente_id)
    .maybeSingle();

  const lang = cliente?.lang || "pt";
  const telefone = cliente?.telefone || null;

  // 2. Bell interno
  if (bell) {
    await sb.from("notificacoes_cliente").insert({
      cliente_id,
      titulo: t.titulo[lang] || t.titulo.pt,
      mensagem: t.mensagem[lang] || t.mensagem.pt,
      href,
      lida: false,
    });
  }

  // 3. WhatsApp
  if (whatsapp && telefone) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://noragrei.com";
      await fetch(`${baseUrl}/api/notificacoes/whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
        body: JSON.stringify({
          telefone,
          mensagem: t.whatsapp[lang] || t.whatsapp.pt,
        }),
      });
    } catch (err) {
      console.error("[notificacoes] Erro WhatsApp:", err);
      // Não bloqueia — bell já foi enviado
    }
  }
}
