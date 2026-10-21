import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return Response.json({ erro: "ENV VARS EM FALTA", url: !!url, key: !!key });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, codigo_cliente")
    .eq("codigo_cliente", "NR-0001")
    .maybeSingle();

  return Response.json({ data, error, url: url.slice(0, 30) + "..." });
}
