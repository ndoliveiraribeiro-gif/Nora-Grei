import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await sb
    .from("clientes")
    .select("id, nome, codigo_cliente")
    .eq("codigo_cliente", "NR-0001")
    .maybeSingle();

  return NextResponse.json({ data, error, url: process.env.NEXT_PUBLIC_SUPABASE_URL });
}
