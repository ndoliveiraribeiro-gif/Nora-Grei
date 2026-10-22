/**
 * POST /api/notificacoes/whatsapp
 * Stub de envio WhatsApp — chamado por lib/notificacoes.js
 *
 * Autenticação: Bearer CRON_SECRET (mesmo token dos outros crons)
 * Body: { telefone: "+351912345678", mensagem: "texto" }
 *
 * Estado actual: LOG apenas (sem envio real)
 * Quando provider escolhido (Meta/Twilio/Brevo):
 *   1. Cria lib/whatsapp-provider.js com função enviarWhatsApp(telefone, mensagem)
 *   2. Substitui o bloco "TODO" abaixo pelo import + chamada
 *   3. Activa templates aprovados pela Meta (obrigatório para mensagens iniciadas pelo negócio)
 */

import { NextResponse } from "next/server";

export async function POST(request) {
  // Auth
  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { telefone, mensagem } = body;
  if (!telefone || !mensagem) {
    return NextResponse.json({ error: "telefone e mensagem obrigatórios" }, { status: 400 });
  }

  // ── TODO: substituir por chamada ao provider ──────────────────────────────
  // Exemplo Meta Cloud API:
  //   const { enviarWhatsApp } = await import("@/lib/whatsapp-provider");
  //   await enviarWhatsApp(telefone, mensagem);
  //
  // Por agora: log apenas
  console.log(`[WhatsApp STUB] Para: ${telefone}`);
  console.log(`[WhatsApp STUB] Mensagem: ${mensagem}`);
  // ─────────────────────────────────────────────────────────────────────────

  return NextResponse.json({ ok: true, stub: true, telefone });
}
