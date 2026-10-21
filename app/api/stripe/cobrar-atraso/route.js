import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const Stripe = require("stripe");
  return Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request) {
  try {
    // Verificar autorização — só chamável internamente ou pelo cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({
        modo: "simulado",
        mensagem: "Stripe não configurado — débitos simulados apenas registados",
      });
    }

    // Buscar todos os alugueres activos com data_fim ultrapassada
    const hoje = new Date().toISOString().split("T")[0];
    const { data: atrasados, error } = await supabaseAdmin
      .from("alugueres")
      .select(`
        id, data_fim, lojista_id, cliente_id, peca_id, preco_dia,
        pecas(nome, fotos),
        clientes!alugueres_cliente_id_fkey(nome, email, stripe_customer_id, stripe_payment_method_id)
      `)
      .eq("estado", "ativo")
      .lt("data_fim", hoje);

    if (error) throw error;

    const resultados = [];

    for (const aluguer of atrasados || []) {
      // O débito é sobre o CLIENTE que não devolveu (não o lojista)
      const cliente = aluguer.clientes;
      if (!cliente?.stripe_customer_id || !cliente?.stripe_payment_method_id) {
        resultados.push({
          aluguer_id: aluguer.id,
          status: "sem_metodo_pagamento",
          cliente: cliente?.email,
        });
        continue;
      }

      // Calcular dias de atraso desde data_fim (cobrar 1 dia por chamada — cron diário)
      const diasAtraso = Math.floor(
        (new Date() - new Date(aluguer.data_fim)) / 86400000
      );

      if (diasAtraso < 1) continue;

      // Custo = preço/dia original do aluguer (o que o cliente pagou por dia)
      const precoDia = parseFloat(aluguer.preco_dia) || 0;
      if (precoDia <= 0) {
        resultados.push({ aluguer_id: aluguer.id, status: "sem_preco_dia" });
        continue;
      }
      const valorCents = Math.round(precoDia * 100); // converter para cêntimos
      const nomePeca = aluguer.pecas?.nome || `Peça #${aluguer.peca_id}`;

      try {
        // Criar PaymentIntent e confirmar imediatamente (off-session) — cobrado ao CLIENTE
        const paymentIntent = await stripe.paymentIntents.create({
          amount: valorCents,
          currency: "eur",
          customer: cliente.stripe_customer_id,
          payment_method: cliente.stripe_payment_method_id,
          confirm: true,
          off_session: true,
          description: `Nora Grei — atraso na devolução: ${nomePeca} (dia ${diasAtraso} em atraso — ${precoDia}€/dia)`,
          metadata: {
            aluguer_id: aluguer.id,
            cliente_id: aluguer.cliente_id,
            lojista_id: aluguer.lojista_id,
            tipo: "atraso_devolucao",
            dia_atraso: diasAtraso,
            preco_dia_original: precoDia,
          },
        });

        // Registar cobrança na tabela de débitos do cliente
        await supabaseAdmin.from("debitos_cliente").insert({
          cliente_id: aluguer.cliente_id,
          aluguer_id: aluguer.id,
          tipo: "atraso_devolucao",
          valor: precoDia,
          dia_atraso: diasAtraso,
          stripe_payment_intent_id: paymentIntent.id,
          estado: "cobrado",
          descricao: `Dia ${diasAtraso} de atraso — ${nomePeca} (${precoDia}€/dia)`,
          created_at: new Date().toISOString(),
        });

        resultados.push({
          aluguer_id: aluguer.id,
          status: "cobrado",
          valor: precoDia,
          dia_atraso: diasAtraso,
          payment_intent: paymentIntent.id,
        });
      } catch (stripeErr) {
        // Pagamento falhou (cartão recusado, etc.) — registar falha
        await supabaseAdmin.from("debitos_cliente").insert({
          cliente_id: aluguer.cliente_id,
          aluguer_id: aluguer.id,
          tipo: "atraso_devolucao",
          valor: precoDia,
          dia_atraso: diasAtraso,
          estado: "falhou",
          descricao: `Tentativa falhada dia ${diasAtraso} — ${stripeErr.message}`,
          created_at: new Date().toISOString(),
        });

        resultados.push({
          aluguer_id: aluguer.id,
          status: "falhou",
          erro: stripeErr.message,
        });
      }
    }

    return NextResponse.json({
      processados: resultados.length,
      resultados,
    });
  } catch (error) {
    console.error("cobrar-atraso error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
