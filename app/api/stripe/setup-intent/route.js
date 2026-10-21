import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Stripe só é inicializado se a chave existir (estrutura pronta, Stripe ainda não activo)
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const Stripe = require("stripe");
  return Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request) {
  try {
    const { cliente_id, email, nome } = await request.json();

    if (!cliente_id || !email) {
      return NextResponse.json({ error: "Dados em falta" }, { status: 400 });
    }

    const stripe = getStripe();

    // Se Stripe ainda não configurado, retornar modo simulado
    if (!stripe) {
      return NextResponse.json({
        modo: "simulado",
        client_secret: null,
        mensagem: "Stripe ainda não configurado — cartão será pedido quando activado",
      });
    }

    // Verificar se já tem customer Stripe
    const { data: cliente } = await supabaseAdmin
      .from("clientes")
      .select("stripe_customer_id")
      .eq("id", cliente_id)
      .single();

    let customerId = cliente?.stripe_customer_id;

    // Criar customer Stripe se não existir
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: nome || email,
        metadata: { supabase_id: cliente_id },
      });
      customerId = customer.id;

      // Guardar customer ID no Supabase
      await supabaseAdmin
        .from("clientes")
        .update({ stripe_customer_id: customerId })
        .eq("id", cliente_id);
    }

    // Criar SetupIntent para guardar cartão (sem cobrar agora)
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session", // permite débitos futuros sem o cliente presente
      metadata: {
        supabase_id: cliente_id,
        tipo: "lojista_candidatura",
      },
    });

    return NextResponse.json({
      modo: "real",
      client_secret: setupIntent.client_secret,
      customer_id: customerId,
    });
  } catch (error) {
    console.error("stripe/setup-intent error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
