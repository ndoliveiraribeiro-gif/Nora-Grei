// app/api/marcas-rates/route.js
// Endpoint público (cached) — devolve taxas de apreciação por marca
// A calculadora faz fetch aqui no startup e usa as taxas em runtime

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const revalidate = 86400; // cache 24h no edge (Next.js ISR)

export async function GET() {
  const { data, error } = await supabase
    .from("marca_aprec_rates")
    .select("marca_key, taxa_anual, tier")
    .order("marca_key");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Transformar em objeto { marca_key: taxa_anual } para lookup O(1)
  const rates = {};
  for (const row of data) {
    rates[row.marca_key] = row.taxa_anual;
  }

  return Response.json(rates, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
  });
}
